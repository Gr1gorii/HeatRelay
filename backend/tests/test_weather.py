import asyncio
from copy import deepcopy
from datetime import date, datetime, timedelta, timezone
from typing import Any
from urllib.parse import parse_qs

import httpx
import pytest
from pydantic import ValidationError

from backend.app.weather import (
    CURRENT_FIELDS,
    DAILY_FIELDS,
    MODEL_DERIVED_NOTICE,
    OPEN_METEO_FORECAST_URL,
    WEATHER_UNAVAILABLE_CODE,
    WEATHER_UNAVAILABLE_MESSAGE,
    CurrentWeatherContext,
    DailyWeatherContext,
    WeatherContextRequest,
    WeatherContextResponse,
    WeatherService,
    WeatherSource,
    WeatherUnavailable,
    WeatherUnits,
)

FIXED_NOW = datetime(2026, 7, 16, 12, 30, tzinfo=timezone.utc)


def valid_upstream_payload() -> dict[str, Any]:
    return {
        "latitude": 41.39,
        "longitude": 2.17,
        "generationtime_ms": 0.07,
        "utc_offset_seconds": 7200,
        "timezone": "Europe/Madrid",
        "timezone_abbreviation": "GMT+2",
        "elevation": 18.0,
        "current_units": {
            "time": "iso8601",
            "interval": "seconds",
            "temperature_2m": "°C",
            "apparent_temperature": "°C",
            "relative_humidity_2m": "%",
            "weather_code": "wmo code",
        },
        "current": {
            "time": "2026-07-16T14:15",
            "interval": 900,
            "temperature_2m": 31.2,
            "apparent_temperature": 33.4,
            "relative_humidity_2m": 58.0,
            "weather_code": 1,
        },
        "daily_units": {
            "time": "iso8601",
            "temperature_2m_max": "°C",
            "apparent_temperature_max": "°C",
            "uv_index_max": "",
        },
        "daily": {
            "time": ["2026-07-16"],
            "temperature_2m_max": [34.1],
            "apparent_temperature_max": [36.2],
            "uv_index_max": [8.3],
        },
    }


def new_york_upstream_payload() -> dict[str, Any]:
    payload = valid_upstream_payload()
    payload.update(
        {
            "latitude": 40.7128,
            "longitude": -74.006,
            "utc_offset_seconds": -14400,
            "timezone": "America/New_York",
            "timezone_abbreviation": "GMT-4",
        }
    )
    payload["current"]["time"] = "2026-07-16T08:15"
    return payload


def run_context(
    handler: httpx.AsyncBaseTransport,
    *,
    payload: WeatherContextRequest | None = None,
) -> Any:
    service = WeatherService(transport=handler, utc_now=lambda: FIXED_NOW)
    request = payload or WeatherContextRequest(latitude=41.3874, longitude=2.1686)
    return asyncio.run(service.get_context(request))


def test_exact_open_meteo_request_and_valid_normalization() -> None:
    requests: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        return httpx.Response(200, json=valid_upstream_payload())

    result = run_context(httpx.MockTransport(handler))

    assert len(requests) == 1
    upstream_request = requests[0]
    assert upstream_request.method == "GET"
    assert str(upstream_request.url.copy_with(query=None)) == OPEN_METEO_FORECAST_URL
    assert parse_qs(upstream_request.url.query.decode()) == {
        "latitude": ["41.3874"],
        "longitude": ["2.1686"],
        "current": [CURRENT_FIELDS],
        "daily": [DAILY_FIELDS],
        "timezone": ["auto"],
        "forecast_days": ["1"],
        "temperature_unit": ["celsius"],
        "timeformat": ["iso8601"],
    }
    assert upstream_request.extensions["timeout"] == {
        "connect": 5.0,
        "read": 5.0,
        "write": 5.0,
        "pool": 5.0,
    }

    assert result.model_dump(mode="json") == {
        "retrieved_at": "2026-07-16T12:30:00Z",
        "timezone": "Europe/Madrid",
        "units": {
            "temperature": "celsius",
            "relative_humidity": "percent",
            "uv_index": "index",
        },
        "current": {
            "observed_at": "2026-07-16T14:15:00+02:00",
            "temperature_c": 31.2,
            "apparent_temperature_c": 33.4,
            "relative_humidity_pct": 58.0,
            "weather_code": 1,
        },
        "today": {
            "date": "2026-07-16",
            "temperature_max_c": 34.1,
            "apparent_temperature_max_c": 36.2,
            "uv_index_max": 8.3,
        },
        "source": {
            "name": "Open-Meteo",
            "url": "https://open-meteo.com/en/docs",
            "license": "CC BY 4.0",
            "license_url": "https://open-meteo.com/en/license",
            "attribution": "Weather data by Open-Meteo.com.",
        },
        "notice": MODEL_DERIVED_NOTICE,
    }
    assert "latitude" not in result.model_dump_json()
    assert "longitude" not in result.model_dump_json()


def test_global_coordinates_use_coordinate_local_timezone_and_daily_date() -> None:
    payload = new_york_upstream_payload()
    request = WeatherContextRequest(latitude=40.7128, longitude=-74.006)

    result = run_context(
        httpx.MockTransport(
            lambda upstream_request: httpx.Response(200, json=payload)
        ),
        payload=request,
    )

    assert result.timezone == "America/New_York"
    assert result.current.observed_at.isoformat() == "2026-07-16T08:15:00-04:00"
    assert result.today.date == result.current.observed_at.date()
    assert result.today.date.isoformat() == "2026-07-16"
    assert "40.7128" not in result.model_dump_json()
    assert "-74.006" not in result.model_dump_json()


@pytest.mark.parametrize(
    ("offset_seconds", "expected_offset", "expected_fold"),
    [(-14400, "-04:00", 0), (-18000, "-05:00", 1)],
)
def test_dynamic_timezone_timestamp_supports_both_dst_folds(
    offset_seconds: int,
    expected_offset: str,
    expected_fold: int,
) -> None:
    payload = new_york_upstream_payload()
    payload["utc_offset_seconds"] = offset_seconds
    payload["current"]["time"] = "2026-11-01T01:30"
    payload["daily"]["time"] = ["2026-11-01"]

    result = run_context(
        httpx.MockTransport(lambda request: httpx.Response(200, json=payload)),
        payload=WeatherContextRequest(latitude=40.7128, longitude=-74.006),
    )

    assert result.timezone == "America/New_York"
    assert result.current.observed_at.isoformat().endswith(expected_offset)
    assert result.current.observed_at.fold == expected_fold


def test_timeout_becomes_stable_weather_unavailable() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ReadTimeout("request timed out at secret URL", request=request)

    with pytest.raises(WeatherUnavailable) as caught:
        run_context(httpx.MockTransport(handler))

    assert_weather_unavailable_is_sanitized(caught.value)


def test_upstream_non_2xx_does_not_expose_body() -> None:
    body = "upstream failure for latitude=41.3874&token=secret"
    transport = httpx.MockTransport(lambda request: httpx.Response(503, text=body))

    with pytest.raises(WeatherUnavailable) as caught:
        run_context(transport)

    assert_weather_unavailable_is_sanitized(caught.value)
    assert body not in str(caught.value)


def test_invalid_json_becomes_stable_weather_unavailable() -> None:
    transport = httpx.MockTransport(
        lambda request: httpx.Response(
            200,
            content=b"not-json latitude=41.3874",
            headers={"content-type": "application/json"},
        )
    )

    with pytest.raises(WeatherUnavailable) as caught:
        run_context(transport)

    assert_weather_unavailable_is_sanitized(caught.value)


@pytest.mark.parametrize(
    ("path", "invalid_value"),
    [
        (("current", "temperature_2m"), 71.0),
        (("current", "relative_humidity_2m"), 101.0),
        (("current", "weather_code"), 4),
        (("current", "interval"), 0),
        (("daily", "uv_index_max"), [-0.1]),
        (("daily", "temperature_2m_max"), [None]),
        (("current_units", "temperature_2m"), "fahrenheit"),
        (("timezone",), "Invalid/HeatRelay"),
        (("utc_offset_seconds",), 0),
    ],
)
def test_invalid_upstream_ranges_units_and_timezone_are_unavailable(
    path: tuple[str, ...],
    invalid_value: Any,
) -> None:
    payload = valid_upstream_payload()
    target: dict[str, Any] = payload
    for component in path[:-1]:
        target = target[component]
    target[path[-1]] = invalid_value

    transport = httpx.MockTransport(lambda request: httpx.Response(200, json=payload))

    with pytest.raises(WeatherUnavailable) as caught:
        run_context(transport)

    assert_weather_unavailable_is_sanitized(caught.value)


@pytest.mark.parametrize(
    "mutate",
    [
        lambda payload: payload.update({"timezone": "Invalid/HeatRelay"}),
        lambda payload: payload.update({"utc_offset_seconds": -18000}),
        lambda payload: (
            payload.update({"utc_offset_seconds": -18000}),
            payload["current"].update({"time": "2026-03-08T02:30"}),
            payload["daily"].update({"time": ["2026-03-08"]}),
        ),
        lambda payload: payload["daily"].update({"time": ["2026-07-17"]}),
    ],
    ids=[
        "invalid-timezone",
        "inconsistent-offset",
        "nonexistent-local-time",
        "mismatched-daily-date",
    ],
)
def test_invalid_coordinate_local_time_metadata_is_unavailable(mutate: Any) -> None:
    payload = new_york_upstream_payload()
    mutate(payload)

    with pytest.raises(WeatherUnavailable) as caught:
        run_context(
            httpx.MockTransport(lambda request: httpx.Response(200, json=payload)),
            payload=WeatherContextRequest(latitude=40.7128, longitude=-74.006),
        )

    assert_weather_unavailable_is_sanitized(caught.value)
    assert "40.7128" not in str(caught.value)
    assert "-74.006" not in str(caught.value)


@pytest.mark.parametrize(
    "mutate",
    [
        lambda payload: payload["current"].pop("temperature_2m"),
        lambda payload: payload["daily"].update(
            {"time": ["2026-07-16", "2026-07-17"]}
        ),
        lambda payload: payload["daily"].update(
            {"temperature_2m_max": [34.1, 35.0]}
        ),
        lambda payload: payload["daily"].update({"time": ["2026-07-17"]}),
    ],
)
def test_missing_or_misaligned_upstream_fields_are_unavailable(mutate: Any) -> None:
    payload = deepcopy(valid_upstream_payload())
    mutate(payload)

    with pytest.raises(WeatherUnavailable) as caught:
        run_context(
            httpx.MockTransport(lambda request: httpx.Response(200, json=payload))
        )

    assert_weather_unavailable_is_sanitized(caught.value)


@pytest.mark.parametrize(
    "values",
    [
        {"latitude": 90.1, "longitude": 2.0},
        {"latitude": -90.1, "longitude": 2.0},
        {"latitude": 41.0, "longitude": 180.1},
        {"latitude": 41.0, "longitude": -180.1},
        {"latitude": "41.0", "longitude": 2.0},
        {"latitude": 41.0, "longitude": 2.0, "extra": True},
    ],
)
def test_request_model_rejects_invalid_coordinates_and_extra_fields(
    values: dict[str, Any],
) -> None:
    with pytest.raises(ValidationError):
        WeatherContextRequest.model_validate(values)


def test_naive_retrieval_clock_is_unavailable() -> None:
    service = WeatherService(
        transport=httpx.MockTransport(
            lambda request: httpx.Response(200, json=valid_upstream_payload())
        ),
        utc_now=lambda: datetime(2026, 7, 16, 12, 30),
    )

    with pytest.raises(WeatherUnavailable) as caught:
        asyncio.run(
            service.get_context(
                WeatherContextRequest(latitude=41.3874, longitude=2.1686)
            )
        )

    assert_weather_unavailable_is_sanitized(caught.value)


def normalized_weather_payload() -> dict[str, Any]:
    return {
        "retrieved_at": FIXED_NOW,
        "timezone": "Europe/Madrid",
        "units": WeatherUnits().model_dump(),
        "current": CurrentWeatherContext(
            observed_at=datetime(
                2026,
                7,
                16,
                14,
                15,
                tzinfo=timezone(timedelta(hours=2)),
            ),
            temperature_c=31.2,
            apparent_temperature_c=33.4,
            relative_humidity_pct=58.0,
            weather_code=1,
        ).model_dump(),
        "today": DailyWeatherContext(
            date=date(2026, 7, 16),
            temperature_max_c=34.1,
            apparent_temperature_max_c=36.2,
            uv_index_max=8.3,
        ).model_dump(),
        "source": WeatherSource().model_dump(),
        "notice": MODEL_DERIVED_NOTICE,
    }


@pytest.mark.parametrize(
    "retrieved_at",
    [
        datetime(2026, 7, 16, 12, 30),
        datetime(
            2026,
            7,
            16,
            14,
            30,
            tzinfo=timezone(timedelta(hours=2)),
        ),
    ],
    ids=["naive", "non-utc"],
)
def test_public_weather_requires_aware_utc_retrieval_time(
    retrieved_at: datetime,
) -> None:
    payload = normalized_weather_payload()
    payload["retrieved_at"] = retrieved_at

    with pytest.raises(ValidationError):
        WeatherContextResponse.model_validate(payload)


def test_public_weather_requires_aware_observation_time() -> None:
    payload = normalized_weather_payload()
    payload["current"]["observed_at"] = datetime(2026, 7, 16, 14, 15)

    with pytest.raises(ValidationError):
        WeatherContextResponse.model_validate(payload)


@pytest.mark.parametrize(
    ("section", "field", "invalid_value"),
    [
        ("current", "temperature_c", float("nan")),
        ("current", "temperature_c", float("inf")),
        ("current", "temperature_c", 70.1),
        ("current", "apparent_temperature_c", float("-inf")),
        ("current", "apparent_temperature_c", 80.1),
        ("current", "relative_humidity_pct", -0.1),
        ("current", "relative_humidity_pct", 100.1),
        ("current", "weather_code", 4),
        ("today", "temperature_max_c", float("nan")),
        ("today", "apparent_temperature_max_c", float("inf")),
        ("today", "uv_index_max", -0.1),
        ("today", "uv_index_max", 100.1),
    ],
)
def test_public_weather_rejects_nonfinite_or_out_of_contract_values(
    section: str,
    field: str,
    invalid_value: Any,
) -> None:
    payload = normalized_weather_payload()
    payload[section][field] = invalid_value

    with pytest.raises(ValidationError):
        WeatherContextResponse.model_validate(payload)


def assert_weather_unavailable_is_sanitized(error: WeatherUnavailable) -> None:
    assert error.code == WEATHER_UNAVAILABLE_CODE
    assert error.message == WEATHER_UNAVAILABLE_MESSAGE
    assert str(error) == WEATHER_UNAVAILABLE_MESSAGE
    assert "41.3874" not in str(error)
    assert "api.open-meteo.com" not in str(error)
    assert "secret" not in str(error)
