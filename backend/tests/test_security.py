"""Offline tests for the process-local production request perimeter."""

from __future__ import annotations

import asyncio
import json
from collections.abc import Iterable
from typing import Any

import pytest

from backend.app.security import ApiPostAbuseMiddleware, InMemoryRateLimiter


async def _exchange(
    app: Any,
    *,
    body_messages: Iterable[dict[str, Any]] = (),
    headers: list[tuple[bytes, bytes]] | None = None,
    client: tuple[str, int] = ("198.51.100.20", 40000),
) -> tuple[int, dict[bytes, bytes], bytes]:
    messages = iter(body_messages)
    sent: list[dict[str, Any]] = []

    async def receive() -> dict[str, Any]:
        return next(messages, {"type": "http.disconnect"})

    async def send(message: dict[str, Any]) -> None:
        sent.append(message)

    scope = {
        "type": "http",
        "asgi": {"version": "3.0"},
        "http_version": "1.1",
        "method": "POST",
        "scheme": "http",
        "path": "/api/v1/example",
        "raw_path": b"/api/v1/example",
        "query_string": b"",
        "headers": headers or [],
        "client": client,
        "server": ("testserver", 80),
    }
    await app(scope, receive, send)
    start = next(message for message in sent if message["type"] == "http.response.start")
    body = b"".join(
        message.get("body", b"")
        for message in sent
        if message["type"] == "http.response.body"
    )
    return start["status"], dict(start.get("headers", [])), body


def _body(value: bytes, *, more: bool = False) -> dict[str, Any]:
    return {"type": "http.request", "body": value, "more_body": more}


@pytest.mark.parametrize("declared", [b"9", b"-1", b"eight", b"", b"1,2"])
def test_declared_oversize_or_malformed_length_is_rejected_before_body(
    declared: bytes,
) -> None:
    called = False

    async def inner(_scope: Any, _receive: Any, _send: Any) -> None:
        nonlocal called
        called = True

    app = ApiPostAbuseMiddleware(inner, max_body_bytes=8)
    status, _headers, body = asyncio.run(
        _exchange(app, headers=[(b"content-length", declared)])
    )

    assert status == 413
    assert json.loads(body)["detail"]["code"] == "request_too_large"
    assert called is False


def test_chunked_body_overflow_is_rejected_before_application_parsing() -> None:
    called = False

    async def inner(_scope: Any, _receive: Any, _send: Any) -> None:
        nonlocal called
        called = True

    app = ApiPostAbuseMiddleware(inner, max_body_bytes=8)
    status, _headers, body = asyncio.run(
        _exchange(
            app,
            body_messages=[_body(b"1234", more=True), _body(b"56789")],
        )
    )

    assert status == 413
    assert json.loads(body)["detail"]["code"] == "request_too_large"
    assert called is False


def test_exact_body_boundary_is_replayed_once() -> None:
    received: list[bytes] = []

    async def inner(_scope: Any, receive: Any, send: Any) -> None:
        message = await receive()
        received.append(message["body"])
        await send({"type": "http.response.start", "status": 204, "headers": []})
        await send({"type": "http.response.body", "body": b""})

    app = ApiPostAbuseMiddleware(inner, max_body_bytes=8)
    status, _headers, _body_bytes = asyncio.run(
        _exchange(
            app,
            headers=[(b"content-length", b"8")],
            body_messages=[_body(b"12345678")],
        )
    )

    assert status == 204
    assert received == [b"12345678"]


def test_rate_limit_isolated_reset_and_bounded_cleanup() -> None:
    now = [100.0]
    limiter = InMemoryRateLimiter(
        requests=1,
        window_seconds=60,
        max_clients=2,
        monotonic=lambda: now[0],
    )

    assert limiter.check("198.51.100.1") == (True, 0)
    assert limiter.check("198.51.100.2") == (True, 0)
    assert limiter.check("198.51.100.1") == (False, 60)
    assert limiter.check("198.51.100.3") == (False, 60)
    assert limiter.entry_count == 2

    now[0] = 161.0
    assert limiter.check("198.51.100.3") == (True, 0)
    assert limiter.entry_count == 1
    assert limiter.check("198.51.100.3") == (False, 60)


def test_rate_limit_returns_retry_after() -> None:
    now = [10.0]
    limiter = InMemoryRateLimiter(
        requests=1,
        window_seconds=60,
        monotonic=lambda: now[0],
    )

    async def inner(_scope: Any, _receive: Any, send: Any) -> None:
        await send({"type": "http.response.start", "status": 204, "headers": []})
        await send({"type": "http.response.body", "body": b""})

    app = ApiPostAbuseMiddleware(inner, rate_limiter=limiter)
    assert asyncio.run(_exchange(app, body_messages=[_body(b"")]))[0] == 204
    now[0] = 10.5
    status, headers, body = asyncio.run(
        _exchange(app, body_messages=[_body(b"")])
    )

    assert status == 429
    assert headers[b"retry-after"] == b"60"
    assert json.loads(body)["detail"]["code"] == "rate_limit_exceeded"


def test_forwarded_address_requires_trusted_immediate_proxy() -> None:
    async def inner(_scope: Any, _receive: Any, send: Any) -> None:
        await send({"type": "http.response.start", "status": 204, "headers": []})
        await send({"type": "http.response.body", "body": b""})

    untrusted = ApiPostAbuseMiddleware(
        inner,
        rate_limiter=InMemoryRateLimiter(requests=1),
    )
    first = asyncio.run(
        _exchange(
            untrusted,
            headers=[(b"x-forwarded-for", b"198.51.100.1")],
            body_messages=[_body(b"")],
            client=("192.0.2.10", 40000),
        )
    )
    second = asyncio.run(
        _exchange(
            untrusted,
            headers=[(b"x-forwarded-for", b"198.51.100.2")],
            body_messages=[_body(b"")],
            client=("192.0.2.10", 40000),
        )
    )
    assert (first[0], second[0]) == (204, 429)

    trusted = ApiPostAbuseMiddleware(
        inner,
        rate_limiter=InMemoryRateLimiter(requests=1),
        trusted_proxy_cidrs=("192.0.2.0/24",),
    )
    first = asyncio.run(
        _exchange(
            trusted,
            headers=[(b"x-forwarded-for", b"198.51.100.1")],
            body_messages=[_body(b"")],
            client=("192.0.2.10", 40000),
        )
    )
    second = asyncio.run(
        _exchange(
            trusted,
            headers=[(b"x-forwarded-for", b"198.51.100.2")],
            body_messages=[_body(b"")],
            client=("192.0.2.10", 40000),
        )
    )
    assert (first[0], second[0]) == (204, 204)
