"""Process-local request abuse controls for the production ASGI boundary."""

from __future__ import annotations

import ipaddress
import math
import time
from dataclasses import dataclass
from threading import Lock
from typing import Any, Callable

from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Message, Receive, Scope, Send

DEFAULT_MAX_REQUEST_BODY_BYTES = 16 * 1024
DEFAULT_RATE_LIMIT_REQUESTS = 10
DEFAULT_RATE_LIMIT_WINDOW_SECONDS = 60
DEFAULT_RATE_LIMIT_MAX_CLIENTS = 4_096

REQUEST_TOO_LARGE_RESPONSE = {
    "detail": {
        "code": "request_too_large",
        "message": "Request body is too large.",
    }
}
RATE_LIMITED_RESPONSE = {
    "detail": {
        "code": "rate_limit_exceeded",
        "message": "Too many requests. Try again later.",
    }
}


@dataclass
class _RateWindow:
    started_at: float
    count: int


class InMemoryRateLimiter:
    """Bounded fixed-window limiter with deterministic expiry."""

    def __init__(
        self,
        *,
        requests: int = DEFAULT_RATE_LIMIT_REQUESTS,
        window_seconds: int = DEFAULT_RATE_LIMIT_WINDOW_SECONDS,
        max_clients: int = DEFAULT_RATE_LIMIT_MAX_CLIENTS,
        monotonic: Callable[[], float] = time.monotonic,
    ) -> None:
        for name, value in (
            ("requests", requests),
            ("window_seconds", window_seconds),
            ("max_clients", max_clients),
        ):
            if type(value) is not int or value < 1:
                raise ValueError(f"{name} must be a positive integer")
        self._requests = requests
        self._window_seconds = window_seconds
        self._max_clients = max_clients
        self._monotonic = monotonic
        self._entries: dict[str, _RateWindow] = {}
        self._lock = Lock()

    @property
    def entry_count(self) -> int:
        with self._lock:
            return len(self._entries)

    def check(self, client_address: str) -> tuple[bool, int]:
        now = self._monotonic()
        with self._lock:
            expired = [
                address
                for address, window in self._entries.items()
                if now - window.started_at >= self._window_seconds
            ]
            for address in expired:
                self._entries.pop(address, None)

            window = self._entries.get(client_address)
            if window is None:
                if len(self._entries) >= self._max_clients:
                    return False, self._window_seconds
                self._entries[client_address] = _RateWindow(now, 1)
                return True, 0

            elapsed = now - window.started_at
            if elapsed >= self._window_seconds:
                self._entries[client_address] = _RateWindow(now, 1)
                return True, 0
            if window.count >= self._requests:
                retry_after = max(1, math.ceil(self._window_seconds - elapsed))
                return False, retry_after
            window.count += 1
            return True, 0


class ApiPostAbuseMiddleware:
    """Pre-read bounded API POST bodies and apply one per-source limiter."""

    def __init__(
        self,
        app: ASGIApp,
        *,
        max_body_bytes: int = DEFAULT_MAX_REQUEST_BODY_BYTES,
        rate_limiter: InMemoryRateLimiter | None = None,
        trusted_proxy_cidrs: tuple[str, ...] = (),
    ) -> None:
        if type(max_body_bytes) is not int or max_body_bytes < 1:
            raise ValueError("max_body_bytes must be a positive integer")
        self._app = app
        self._max_body_bytes = max_body_bytes
        self._rate_limiter = rate_limiter or InMemoryRateLimiter()
        try:
            self._trusted_proxies = tuple(
                ipaddress.ip_network(value, strict=True)
                for value in trusted_proxy_cidrs
            )
        except ValueError as error:
            raise ValueError("trusted proxy CIDRs must be canonical") from error

    @staticmethod
    def _headers(scope: Scope) -> dict[bytes, list[bytes]]:
        headers: dict[bytes, list[bytes]] = {}
        for name, value in scope.get("headers", []):
            headers.setdefault(name.lower(), []).append(value)
        return headers

    def _effective_client(self, scope: Scope) -> str:
        client = scope.get("client")
        peer_text = client[0] if client else "unavailable"
        try:
            peer = ipaddress.ip_address(peer_text)
        except ValueError:
            return "unavailable"

        if not any(peer in network for network in self._trusted_proxies):
            return peer.compressed

        forwarded_values = self._headers(scope).get(b"x-forwarded-for", [])
        if len(forwarded_values) != 1:
            return peer.compressed
        try:
            forwarded = forwarded_values[0].decode("ascii")
            first = forwarded.split(",", 1)[0].strip()
            return ipaddress.ip_address(first).compressed
        except (UnicodeDecodeError, ValueError):
            return peer.compressed

    def _declared_length_is_acceptable(self, scope: Scope) -> bool:
        values = self._headers(scope).get(b"content-length", [])
        if not values:
            return True
        if len(values) != 1:
            return False
        try:
            text = values[0].decode("ascii")
        except UnicodeDecodeError:
            return False
        if not text or not text.isdecimal():
            return False
        return int(text) <= self._max_body_bytes

    async def _limited_body(self, receive: Receive) -> bytes | None:
        body = bytearray()
        while True:
            message = await receive()
            if message["type"] == "http.disconnect":
                return bytes(body)
            if message["type"] != "http.request":
                continue
            chunk = message.get("body", b"")
            if not isinstance(chunk, bytes):
                return None
            body.extend(chunk)
            if len(body) > self._max_body_bytes:
                return None
            if not message.get("more_body", False):
                return bytes(body)

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if not (
            scope["type"] == "http"
            and scope.get("method") == "POST"
            and str(scope.get("path", "")).startswith("/api/v1/")
        ):
            await self._app(scope, receive, send)
            return

        if not self._declared_length_is_acceptable(scope):
            await JSONResponse(
                REQUEST_TOO_LARGE_RESPONSE,
                status_code=413,
            )(scope, receive, send)
            return

        allowed, retry_after = self._rate_limiter.check(
            self._effective_client(scope)
        )
        if not allowed:
            await JSONResponse(
                RATE_LIMITED_RESPONSE,
                status_code=429,
                headers={"Retry-After": str(retry_after)},
            )(scope, receive, send)
            return

        body = await self._limited_body(receive)
        if body is None:
            await JSONResponse(
                REQUEST_TOO_LARGE_RESPONSE,
                status_code=413,
            )(scope, receive, send)
            return

        delivered = False

        async def replay() -> Message:
            nonlocal delivered
            if delivered:
                return {"type": "http.disconnect"}
            delivered = True
            return {
                "type": "http.request",
                "body": body,
                "more_body": False,
            }

        await self._app(scope, replay, send)


def parse_trusted_proxy_cidrs(value: str) -> tuple[str, ...]:
    """Parse one comma-separated canonical proxy-network allowlist."""

    if not value.strip():
        return ()
    parsed: list[str] = []
    for raw in value.split(","):
        candidate = raw.strip()
        if not candidate or candidate != raw:
            raise ValueError("trusted proxy CIDRs must not contain padding")
        network = ipaddress.ip_network(candidate, strict=True)
        if str(network) != candidate:
            raise ValueError("trusted proxy CIDRs must be canonical")
        parsed.append(candidate)
    if len(parsed) != len(set(parsed)):
        raise ValueError("trusted proxy CIDRs must be unique")
    return tuple(parsed)
