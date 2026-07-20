"""Offline contract tests for the single-process production package."""

from __future__ import annotations

import asyncio
from decimal import Decimal
from pathlib import Path
from typing import Any

import pytest
from httpx import ASGITransport, AsyncClient

from backend.app.openai_runtime import (
    OpenAIDailyBudget,
    configure_process_openai_budget,
    get_process_openai_budget,
)
from backend.app.production import (
    ProductionConfigurationError,
    ProductionSettings,
    create_production_app,
)


@pytest.fixture(autouse=True)
def _restore_process_budget() -> Any:
    original = get_process_openai_budget()
    try:
        yield
    finally:
        configure_process_openai_budget(original)


def _settings(*, https_expected: bool = True) -> ProductionSettings:
    return ProductionSettings(
        host="127.0.0.1",
        port=8000,
        allowed_hosts=("testserver",),
        trusted_proxy_cidrs=(),
        max_request_body_bytes=16 * 1024,
        rate_limit_requests=10,
        rate_limit_window_seconds=60,
        rate_limit_max_clients=100,
        https_expected=https_expected,
        provider_budget=OpenAIDailyBudget(
            daily_budget_usd=Decimal("1"),
            per_call_reservation_usd=Decimal("0.10"),
        ),
    )


def _dist(tmp_path: Path) -> Path:
    dist = tmp_path / "dist"
    assets = dist / "assets"
    assets.mkdir(parents=True)
    (dist / "index.html").write_text(
        "<!doctype html><main>HeatRelay production</main>",
        encoding="utf-8",
    )
    (assets / "app-a1b2c3.js").write_text("export {};", encoding="utf-8")
    return dist


async def _get(app: Any, path: str) -> Any:
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://testserver",
    ) as client:
        return await client.get(path)


def test_production_routes_api_assets_and_spa_with_cache_policy(
    tmp_path: Path,
) -> None:
    app = create_production_app(_settings(), frontend_dist=_dist(tmp_path))

    root = asyncio.run(_get(app, "/"))
    fallback = asyncio.run(_get(app, "/some/application/route"))
    asset = asyncio.run(_get(app, "/assets/app-a1b2c3.js"))
    missing_asset = asyncio.run(_get(app, "/assets/missing.js"))
    health = asyncio.run(_get(app, "/api/health"))
    ready = asyncio.run(_get(app, "/api/ready"))
    unknown_api = asyncio.run(_get(app, "/api/unknown"))

    assert root.status_code == fallback.status_code == 200
    assert root.headers["cache-control"] == "no-cache"
    assert fallback.text == root.text
    assert asset.status_code == 200
    assert asset.headers["cache-control"] == "public, max-age=31536000, immutable"
    assert missing_asset.status_code == 404
    assert "HeatRelay production" not in missing_asset.text
    assert health.status_code == 200
    assert health.json() == {"status": "ok", "service": "heatrelay-api"}
    assert ready.status_code == 200
    assert ready.json() == {"status": "ready", "service": "heatrelay-api"}
    assert unknown_api.status_code == 404
    assert "HeatRelay production" not in unknown_api.text


@pytest.mark.parametrize("path", ["/docs", "/redoc", "/openapi.json"])
def test_production_disables_api_documentation(tmp_path: Path, path: str) -> None:
    app = create_production_app(_settings(), frontend_dist=_dist(tmp_path))
    response = asyncio.run(_get(app, path))
    assert response.status_code == 404
    assert response.json() == {"detail": "Not Found"}


def test_production_rejects_traversal_without_spa_fallback(tmp_path: Path) -> None:
    app = create_production_app(_settings(), frontend_dist=_dist(tmp_path))

    async def request_raw_path() -> tuple[int, bytes]:
        sent: list[dict[str, Any]] = []

        async def receive() -> dict[str, Any]:
            return {"type": "http.request", "body": b"", "more_body": False}

        async def send(message: dict[str, Any]) -> None:
            sent.append(message)

        await app(
            {
                "type": "http",
                "asgi": {"version": "3.0"},
                "http_version": "1.1",
                "method": "GET",
                "scheme": "http",
                "path": "/assets/../index.html",
                "raw_path": b"/assets/%2e%2e/index.html",
                "query_string": b"",
                "headers": [(b"host", b"testserver")],
                "client": ("127.0.0.1", 10000),
                "server": ("testserver", 80),
            },
            receive,
            send,
        )
        status = next(item["status"] for item in sent if item["type"] == "http.response.start")
        body = b"".join(item.get("body", b"") for item in sent if item["type"] == "http.response.body")
        return status, body

    status, body = asyncio.run(request_raw_path())
    assert status == 404
    assert b"HeatRelay production" not in body


def test_production_security_headers_are_consistent(tmp_path: Path) -> None:
    app = create_production_app(_settings(), frontend_dist=_dist(tmp_path))
    response = asyncio.run(_get(app, "/"))

    assert response.headers["strict-transport-security"] == (
        "max-age=31536000; includeSubDomains"
    )
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["referrer-policy"] == "no-referrer"
    assert response.headers["permissions-policy"] == (
        "geolocation=(), microphone=(), camera=()"
    )
    assert response.headers["x-frame-options"] == "DENY"
    assert "frame-ancestors 'none'" in response.headers["content-security-policy"]

    non_https_app = create_production_app(
        _settings(https_expected=False),
        frontend_dist=_dist(tmp_path / "http"),
    )
    non_https_response = asyncio.run(_get(non_https_app, "/"))
    assert "strict-transport-security" not in non_https_response.headers


def test_production_rejects_unapproved_host(tmp_path: Path) -> None:
    app = create_production_app(_settings(), frontend_dist=_dist(tmp_path))

    async def request() -> Any:
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://unapproved.test",
        ) as client:
            return await client.get("/")

    response = asyncio.run(request())
    assert response.status_code == 400
    assert "HeatRelay production" not in response.text


def test_production_delegates_lifespan_to_existing_backend(tmp_path: Path) -> None:
    app = create_production_app(_settings(), frontend_dist=_dist(tmp_path))

    async def exercise() -> list[str]:
        incoming = iter(
            [
                {"type": "lifespan.startup"},
                {"type": "lifespan.shutdown"},
            ]
        )
        sent: list[str] = []

        async def receive() -> dict[str, str]:
            return next(incoming)

        async def send(message: dict[str, str]) -> None:
            sent.append(message["type"])

        await app(
            {"type": "lifespan", "asgi": {"version": "3.0"}},
            receive,
            send,
        )
        return sent

    assert asyncio.run(exercise()) == [
        "lifespan.startup.complete",
        "lifespan.shutdown.complete",
    ]


def test_production_startup_rejects_missing_dist_safely(tmp_path: Path) -> None:
    with pytest.raises(
        ProductionConfigurationError,
        match="Production frontend assets are unavailable",
    ):
        create_production_app(_settings(), frontend_dist=tmp_path / "missing")


def test_production_environment_is_strict_and_requires_budget() -> None:
    valid = {
        "OPENAI_API_KEY": "synthetic-test-key",
        "HEATRELAY_ALLOWED_HOSTS": "example.test",
        "HEATRELAY_OPENAI_DAILY_BUDGET_USD": "1.000000",
        "HEATRELAY_OPENAI_PER_CALL_RESERVATION_USD": "0.100000",
        "HEATRELAY_HTTPS_EXPECTED": "true",
    }
    settings = ProductionSettings.from_environ(valid)
    assert settings.max_request_body_bytes == 16 * 1024
    assert settings.rate_limit_requests == 10
    assert settings.rate_limit_window_seconds == 60

    for missing in (
        "OPENAI_API_KEY",
        "HEATRELAY_ALLOWED_HOSTS",
        "HEATRELAY_OPENAI_DAILY_BUDGET_USD",
        "HEATRELAY_OPENAI_PER_CALL_RESERVATION_USD",
        "HEATRELAY_HTTPS_EXPECTED",
    ):
        invalid = dict(valid)
        invalid.pop(missing)
        with pytest.raises(ProductionConfigurationError):
            ProductionSettings.from_environ(invalid)

    for invalid_hosts in ("example..test", " example.test", "-bad.test"):
        invalid = dict(valid)
        invalid["HEATRELAY_ALLOWED_HOSTS"] = invalid_hosts
        with pytest.raises(ProductionConfigurationError):
            ProductionSettings.from_environ(invalid)

    invalid_values = [
        ("0", "0.1"),
        ("NaN", "0.1"),
        ("1e0", "0.1"),
        ("1", "0"),
        ("1", "0.0000001"),
        ("1", "2"),
    ]
    for daily, reservation in invalid_values:
        invalid = dict(valid)
        invalid["HEATRELAY_OPENAI_DAILY_BUDGET_USD"] = daily
        invalid["HEATRELAY_OPENAI_PER_CALL_RESERVATION_USD"] = reservation
        with pytest.raises(ProductionConfigurationError):
            ProductionSettings.from_environ(invalid)


def test_readiness_fails_closed_for_invalid_committed_data(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    class InvalidRepository:
        def load(self) -> None:
            from backend.app.places import PlaceDataError

            raise PlaceDataError("private path that must not escape")

    monkeypatch.setattr("backend.app.production.PlaceRepository", InvalidRepository)
    app = create_production_app(_settings(), frontend_dist=_dist(tmp_path))
    response = asyncio.run(_get(app, "/api/ready"))

    assert response.status_code == 503
    assert response.json() == {"status": "not_ready", "service": "heatrelay-api"}
    assert "private path" not in response.text
