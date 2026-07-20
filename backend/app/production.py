"""Single-worker production ASGI package for HeatRelay."""

from __future__ import annotations

import ipaddress
import os
import re
from collections.abc import Mapping
from dataclasses import dataclass
from decimal import Decimal
from pathlib import Path, PurePosixPath
from typing import Any

import uvicorn
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.trustedhost import TrustedHostMiddleware
from starlette.responses import FileResponse, JSONResponse, Response
from starlette.staticfiles import StaticFiles
from starlette.types import ASGIApp, Receive, Scope, Send

from backend.app.main import app as backend_app
from backend.app.openai_runtime import (
    OpenAIDailyBudget,
    configure_process_openai_budget,
)
from backend.app.places import PlaceDataError, PlaceRepository
from backend.app.security import (
    DEFAULT_MAX_REQUEST_BODY_BYTES,
    DEFAULT_RATE_LIMIT_MAX_CLIENTS,
    DEFAULT_RATE_LIMIT_REQUESTS,
    DEFAULT_RATE_LIMIT_WINDOW_SECONDS,
    ApiPostAbuseMiddleware,
    InMemoryRateLimiter,
    parse_trusted_proxy_cidrs,
)

ROOT_DIRECTORY = Path(__file__).resolve().parents[2]
DEFAULT_FRONTEND_DIST = ROOT_DIRECTORY / "frontend/dist"
_HOST_LABEL_PATTERN = re.compile(
    r"^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$"
)
_DOC_PATHS = frozenset({"/docs", "/redoc", "/openapi.json"})


class ProductionConfigurationError(RuntimeError):
    """Stable startup error that never includes environment values."""


def _bounded_int(
    environ: Mapping[str, str],
    name: str,
    default: int,
    *,
    maximum: int,
) -> int:
    raw = environ.get(name, str(default))
    if not raw.isdecimal():
        raise ProductionConfigurationError("Production configuration is invalid.")
    value = int(raw)
    if not 1 <= value <= maximum:
        raise ProductionConfigurationError("Production configuration is invalid.")
    return value


def _required_bool(environ: Mapping[str, str], name: str) -> bool:
    raw = environ.get(name)
    if raw == "true":
        return True
    if raw == "false":
        return False
    raise ProductionConfigurationError("Production configuration is invalid.")


def _allowed_hosts(environ: Mapping[str, str]) -> tuple[str, ...]:
    raw = environ.get("HEATRELAY_ALLOWED_HOSTS")
    if raw is None or not raw:
        raise ProductionConfigurationError("Production configuration is incomplete.")
    values = raw.split(",")
    def valid_host(value: str) -> bool:
        host = value[2:] if value.startswith("*.") else value
        return (
            bool(value)
            and value == value.strip()
            and len(host) <= 253
            and all(
                _HOST_LABEL_PATTERN.fullmatch(label) is not None
                for label in host.split(".")
            )
        )

    if any(not valid_host(value) for value in values):
        raise ProductionConfigurationError("Production configuration is invalid.")
    if len(values) != len(set(values)):
        raise ProductionConfigurationError("Production configuration is invalid.")
    return tuple(values)


@dataclass(frozen=True)
class ProductionSettings:
    host: str
    port: int
    allowed_hosts: tuple[str, ...]
    trusted_proxy_cidrs: tuple[str, ...]
    max_request_body_bytes: int
    rate_limit_requests: int
    rate_limit_window_seconds: int
    rate_limit_max_clients: int
    https_expected: bool
    provider_budget: OpenAIDailyBudget

    @classmethod
    def from_environ(
        cls,
        environ: Mapping[str, str],
    ) -> ProductionSettings:
        api_key = environ.get("OPENAI_API_KEY")
        if api_key is None or not api_key.strip():
            raise ProductionConfigurationError("Production configuration is incomplete.")
        try:
            host = ipaddress.ip_address(
                environ.get("HEATRELAY_HOST", "0.0.0.0")
            ).compressed
            port = _bounded_int(
                environ,
                "HEATRELAY_PORT",
                8000,
                maximum=65_535,
            )
            trusted = parse_trusted_proxy_cidrs(
                environ.get("HEATRELAY_TRUSTED_PROXY_CIDRS", "")
            )
            daily = OpenAIDailyBudget.parse_usd(
                environ["HEATRELAY_OPENAI_DAILY_BUDGET_USD"],
                "HEATRELAY_OPENAI_DAILY_BUDGET_USD",
            )
            reservation = OpenAIDailyBudget.parse_usd(
                environ["HEATRELAY_OPENAI_PER_CALL_RESERVATION_USD"],
                "HEATRELAY_OPENAI_PER_CALL_RESERVATION_USD",
            )
            budget = OpenAIDailyBudget(
                daily_budget_usd=daily,
                per_call_reservation_usd=reservation,
            )
        except (KeyError, ValueError) as error:
            raise ProductionConfigurationError(
                "Production configuration is invalid."
            ) from error
        return cls(
            host=host,
            port=port,
            allowed_hosts=_allowed_hosts(environ),
            trusted_proxy_cidrs=trusted,
            max_request_body_bytes=_bounded_int(
                environ,
                "HEATRELAY_MAX_REQUEST_BODY_BYTES",
                DEFAULT_MAX_REQUEST_BODY_BYTES,
                maximum=1024 * 1024,
            ),
            rate_limit_requests=_bounded_int(
                environ,
                "HEATRELAY_RATE_LIMIT_REQUESTS",
                DEFAULT_RATE_LIMIT_REQUESTS,
                maximum=1_000,
            ),
            rate_limit_window_seconds=_bounded_int(
                environ,
                "HEATRELAY_RATE_LIMIT_WINDOW_SECONDS",
                DEFAULT_RATE_LIMIT_WINDOW_SECONDS,
                maximum=86_400,
            ),
            rate_limit_max_clients=_bounded_int(
                environ,
                "HEATRELAY_RATE_LIMIT_MAX_CLIENTS",
                DEFAULT_RATE_LIMIT_MAX_CLIENTS,
                maximum=1_000_000,
            ),
            https_expected=_required_bool(environ, "HEATRELAY_HTTPS_EXPECTED"),
            provider_budget=budget,
        )


class _SecurityHeadersMiddleware:
    def __init__(self, app: ASGIApp, *, https_expected: bool) -> None:
        self._app = app
        self._https_expected = https_expected

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        async def secured_send(message: dict[str, Any]) -> None:
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                headers.extend(
                    [
                        (b"content-security-policy", b"default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"),
                        (b"x-content-type-options", b"nosniff"),
                        (b"referrer-policy", b"no-referrer"),
                        (b"permissions-policy", b"geolocation=(), microphone=(), camera=()"),
                        (b"x-frame-options", b"DENY"),
                    ]
                )
                if self._https_expected:
                    headers.append(
                        (b"strict-transport-security", b"max-age=31536000; includeSubDomains")
                    )
                message["headers"] = headers
            await send(message)

        await self._app(scope, receive, secured_send)


class _ProductionRouter:
    def __init__(self, frontend_dist: Path, *, ready: bool) -> None:
        self._dist = frontend_dist
        self._index = frontend_dist / "index.html"
        self._static = StaticFiles(directory=frontend_dist, check_dir=True)
        self._ready = ready

    @staticmethod
    def _unsafe_path(scope: Scope) -> bool:
        path = str(scope.get("path", ""))
        raw_path = bytes(scope.get("raw_path", b"")).lower()
        return ".." in PurePosixPath(path).parts or b"%2e" in raw_path

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await backend_app(scope, receive, send)
            return
        path = str(scope.get("path", ""))
        if self._unsafe_path(scope):
            await JSONResponse({"detail": "Not Found"}, status_code=404)(
                scope, receive, send
            )
            return
        if path in _DOC_PATHS:
            await JSONResponse({"detail": "Not Found"}, status_code=404)(
                scope, receive, send
            )
            return
        if path == "/api/ready":
            status = 200 if self._ready else 503
            state = "ready" if self._ready else "not_ready"
            await JSONResponse(
                {"status": state, "service": "heatrelay-api"},
                status_code=status,
            )(scope, receive, send)
            return
        if path == "/api" or path.startswith("/api/"):
            await backend_app(scope, receive, send)
            return
        if path.startswith("/assets/"):
            try:
                await self._static(scope, receive, send)
            except StarletteHTTPException:
                await JSONResponse({"detail": "Not Found"}, status_code=404)(
                    scope,
                    receive,
                    send,
                )
            return
        if scope.get("method") not in {"GET", "HEAD"}:
            await Response(status_code=405)(scope, receive, send)
            return
        await FileResponse(
            self._index,
            media_type="text/html",
            headers={"Cache-Control": "no-cache"},
        )(scope, receive, send)


def _cache_headers(app: ASGIApp) -> ASGIApp:
    async def wrapped(scope: Scope, receive: Receive, send: Send) -> None:
        async def cache_send(message: dict[str, Any]) -> None:
            if (
                message["type"] == "http.response.start"
                and str(scope.get("path", "")).startswith("/assets/")
                and int(message["status"]) == 200
            ):
                headers = [
                    (name, value)
                    for name, value in message.get("headers", [])
                    if name.lower() != b"cache-control"
                ]
                headers.append(
                    (b"cache-control", b"public, max-age=31536000, immutable")
                )
                message["headers"] = headers
            await send(message)

        await app(scope, receive, cache_send)

    return wrapped


def create_production_app(
    settings: ProductionSettings,
    *,
    frontend_dist: Path = DEFAULT_FRONTEND_DIST,
) -> ASGIApp:
    """Build the validated single-process production application."""

    dist = frontend_dist.resolve()
    index = dist / "index.html"
    assets = dist / "assets"
    if not index.is_file() or not assets.is_dir():
        raise ProductionConfigurationError("Production frontend assets are unavailable.")

    try:
        PlaceRepository().load()
    except PlaceDataError:
        data_ready = False
    else:
        data_ready = True

    configure_process_openai_budget(settings.provider_budget)
    routed: ASGIApp = _ProductionRouter(dist, ready=data_ready)
    routed = _cache_headers(routed)
    routed = TrustedHostMiddleware(
        routed,
        allowed_hosts=list(settings.allowed_hosts),
    )
    routed = ApiPostAbuseMiddleware(
        routed,
        max_body_bytes=settings.max_request_body_bytes,
        rate_limiter=InMemoryRateLimiter(
            requests=settings.rate_limit_requests,
            window_seconds=settings.rate_limit_window_seconds,
            max_clients=settings.rate_limit_max_clients,
        ),
        trusted_proxy_cidrs=settings.trusted_proxy_cidrs,
    )
    return _SecurityHeadersMiddleware(
        routed,
        https_expected=settings.https_expected,
    )


def create_app() -> ASGIApp:
    """Uvicorn factory that fails closed on invalid production state."""

    settings = ProductionSettings.from_environ(os.environ)
    return create_production_app(settings)


def main() -> None:
    settings = ProductionSettings.from_environ(os.environ)
    application = create_production_app(settings)
    uvicorn.run(
        application,
        host=settings.host,
        port=settings.port,
        workers=1,
        proxy_headers=bool(settings.trusted_proxy_cidrs),
        forwarded_allow_ips=",".join(settings.trusted_proxy_cidrs),
    )


if __name__ == "__main__":
    main()
