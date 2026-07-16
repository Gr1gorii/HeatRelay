"""HTTP contract tests for the versioned HeatRelay API."""

import asyncio
from datetime import date, datetime, timezone
from typing import Any

from httpx import ASGITransport, AsyncClient

from backend.app.main import app, get_weather_service
from backend.app.weather import (
    CurrentWeatherContext,
    DailyWeatherContext,
    WeatherContextRequest,
    WeatherContextResponse,
    WeatherSource,
    WeatherUnavailable,
    WeatherUnits,
)


async def _post(path: str, json: dict[str, Any]) -> tuple[int, dict[str, Any]]:
    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport,
        base_url="http://testserver",
    ) as client:
        response = await client.post(path, json=json)
    return response.status_code, response.json()


def _weather_response() -> WeatherContextResponse:
    return WeatherContextResponse(
        retrieved_at=datetime(2026, 7, 16, 12, 30, tzinfo=timezone.utc),
        timezone="Europe/Madrid",
        units=WeatherUnits(),
        current=CurrentWeatherContext(
            observed_at=datetime.fromisoformat("2026-07-16T14:15:00+02:00"),
            temperature_c=31.2,
            apparent_temperature_c=33.4,
            relative_humidity_pct=58.0,
            weather_code=1,
        ),
        today=DailyWeatherContext(
            date=date(2026, 7, 16),
            temperature_max_c=34.1,
            apparent_temperature_max_c=36.2,
            uv_index_max=8.3,
        ),
        source=WeatherSource(),
    )


def test_weather_endpoint_returns_exact_contract_without_coordinates() -> None:
    expected_request = WeatherContextRequest(latitude=41.3874, longitude=2.1686)

    class StubWeatherService:
        async def get_context(
            self,
            request: WeatherContextRequest,
        ) -> WeatherContextResponse:
            assert request == expected_request
            return _weather_response()

    app.dependency_overrides[get_weather_service] = lambda: StubWeatherService()
    try:
        status_code, payload = asyncio.run(
            _post(
                "/api/v1/weather/context",
                {"latitude": 41.3874, "longitude": 2.1686},
            )
        )
    finally:
        app.dependency_overrides.clear()

    assert status_code == 200
    assert payload == _weather_response().model_dump(mode="json")
    assert "latitude" not in str(payload)
    assert "longitude" not in str(payload)


def test_weather_endpoint_returns_stable_sanitized_503() -> None:
    class UnavailableWeatherService:
        async def get_context(
            self,
            request: WeatherContextRequest,
        ) -> WeatherContextResponse:
            raise WeatherUnavailable()

    app.dependency_overrides[get_weather_service] = (
        lambda: UnavailableWeatherService()
    )
    try:
        status_code, payload = asyncio.run(
            _post(
                "/api/v1/weather/context",
                {"latitude": 41.3874, "longitude": 2.1686},
            )
        )
    finally:
        app.dependency_overrides.clear()

    assert status_code == 503
    assert payload == {
        "detail": {
            "code": "weather_unavailable",
            "message": "Weather context is temporarily unavailable.",
        }
    }


def test_weather_endpoint_rejects_extra_request_fields() -> None:
    status_code, payload = asyncio.run(
        _post(
            "/api/v1/weather/context",
            {
                "latitude": 41.3874,
                "longitude": 2.1686,
                "request_body_log_label": "must-not-be-accepted",
            },
        )
    )

    assert status_code == 422
    assert payload["detail"][0]["type"] == "extra_forbidden"


def test_main_app_returns_deterministic_committed_place_candidates() -> None:
    status_code, payload = asyncio.run(
        _post(
            "/api/v1/places/candidates",
            {
                "origin": {"latitude": 41.3874, "longitude": 2.1686},
                "evaluation_datetime": "2026-07-20T10:00:00+02:00",
                "required_features": {},
                "maximum_distance_m": 5_000,
                "limit": 3,
            },
        )
    )

    assert status_code == 200
    assert [candidate["place_id"] for candidate in payload["candidates"]] == [
        "bcn-99400270325",
        "bcn-2011131453",
        "bcn-99117135915",
    ]
    assert [candidate["distance_m"] for candidate in payload["candidates"]] == [
        1382,
        1398,
        1954,
    ]
    assert payload["snapshot"]["snapshot_id"] == (
        "barcelona-climate-shelters-v1-2026-07-16"
    )
    assert "check the official source before travel" in payload["hours_warning"]


def test_main_app_returns_honest_empty_candidate_response() -> None:
    status_code, payload = asyncio.run(
        _post(
            "/api/v1/places/candidates",
            {
                "origin": {"latitude": 41.3874, "longitude": 2.1686},
                "evaluation_datetime": "2026-07-20T03:00:00+02:00",
                "required_features": {},
                "maximum_distance_m": 100,
                "limit": 10,
            },
        )
    )

    assert status_code == 200
    assert payload["candidates"] == []
    assert payload["explanation"].endswith("No fallback place was invented.")
    assert "not medical recommendations" in payload["candidate_notice"]
