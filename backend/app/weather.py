"""Normalized, coordinate-local Open-Meteo weather context."""

from __future__ import annotations

import math
from collections.abc import Callable
from datetime import date, datetime, timezone
from typing import Annotated, Any, Literal
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import httpx
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator

OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
OPEN_METEO_DOCUMENTATION_URL = "https://open-meteo.com/en/docs"
OPEN_METEO_LICENSE_URL = "https://open-meteo.com/en/license"
WEATHER_TIMEOUT_SECONDS = 5.0

CURRENT_FIELDS = (
    "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code"
)
DAILY_FIELDS = "temperature_2m_max,apparent_temperature_max,uv_index_max"

WEATHER_UNAVAILABLE_CODE = "weather_unavailable"
WEATHER_UNAVAILABLE_MESSAGE = "Weather context is temporarily unavailable."

MODEL_DERIVED_NOTICE = (
    "This is model-derived weather context from Open-Meteo, not an official heat "
    "warning."
)
OPEN_METEO_ATTRIBUTION = "Weather data by Open-Meteo.com."

DOCUMENTED_WMO_CODES = frozenset(
    {
        0,
        1,
        2,
        3,
        45,
        48,
        51,
        53,
        55,
        56,
        57,
        61,
        63,
        65,
        66,
        67,
        71,
        73,
        75,
        77,
        80,
        81,
        82,
        85,
        86,
        95,
        96,
        99,
    }
)


def _validate_timezone_identifier(value: str) -> str:
    """Require a timezone identifier available through the system IANA data."""

    if not value:
        raise ValueError("timezone identifier must not be empty")
    try:
        ZoneInfo(value)
    except (ZoneInfoNotFoundError, ValueError) as error:
        raise ValueError("timezone identifier is unavailable or invalid") from error
    return value


class StrictModel(BaseModel):
    """Base model that rejects coercion and unexpected fields."""

    model_config = ConfigDict(extra="forbid", strict=True)


class WeatherContextRequest(StrictModel):
    """Private-coordinate request body for normalized weather context."""

    latitude: Annotated[
        float,
        Field(ge=-90.0, le=90.0, allow_inf_nan=False),
    ]
    longitude: Annotated[
        float,
        Field(ge=-180.0, le=180.0, allow_inf_nan=False),
    ]


class WeatherUnits(StrictModel):
    """Stable units used by the normalized response."""

    temperature: Literal["celsius"] = "celsius"
    relative_humidity: Literal["percent"] = "percent"
    uv_index: Literal["index"] = "index"


class CurrentWeatherContext(StrictModel):
    """Current model-derived conditions."""

    observed_at: datetime
    temperature_c: float
    apparent_temperature_c: float
    relative_humidity_pct: float
    weather_code: int


class DailyWeatherContext(StrictModel):
    """Same-day model-derived maxima."""

    date: date
    temperature_max_c: float
    apparent_temperature_max_c: float
    uv_index_max: float


class WeatherSource(StrictModel):
    """Open-Meteo provenance and attribution."""

    name: Literal["Open-Meteo"] = "Open-Meteo"
    url: Literal["https://open-meteo.com/en/docs"] = OPEN_METEO_DOCUMENTATION_URL
    license: Literal["CC BY 4.0"] = "CC BY 4.0"
    license_url: Literal["https://open-meteo.com/en/license"] = (
        OPEN_METEO_LICENSE_URL
    )
    attribution: Literal["Weather data by Open-Meteo.com."] = OPEN_METEO_ATTRIBUTION


class WeatherContextResponse(StrictModel):
    """Normalized weather context without echoing request coordinates."""

    retrieved_at: datetime
    timezone: str
    units: WeatherUnits
    current: CurrentWeatherContext
    today: DailyWeatherContext
    source: WeatherSource
    notice: Literal[
        "This is model-derived weather context from Open-Meteo, not an official heat warning."
    ] = MODEL_DERIVED_NOTICE

    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, value: str) -> str:
        return _validate_timezone_identifier(value)


class WeatherUnavailable(Exception):
    """Stable, non-sensitive failure exposed by the API layer."""

    code = WEATHER_UNAVAILABLE_CODE
    message = WEATHER_UNAVAILABLE_MESSAGE

    def __init__(self) -> None:
        super().__init__(self.message)


FiniteTemperature = Annotated[
    float,
    Field(ge=-100.0, le=70.0, allow_inf_nan=False),
]
FiniteApparentTemperature = Annotated[
    float,
    Field(ge=-120.0, le=80.0, allow_inf_nan=False),
]


class _UpstreamCurrentUnits(BaseModel):
    model_config = ConfigDict(extra="ignore", strict=True)

    time: Literal["iso8601"]
    interval: Literal["seconds"]
    temperature_2m: Literal["°C"]
    apparent_temperature: Literal["°C"]
    relative_humidity_2m: Literal["%"]
    weather_code: Literal["wmo code"]


class _UpstreamDailyUnits(BaseModel):
    model_config = ConfigDict(extra="ignore", strict=True)

    time: Literal["iso8601"]
    temperature_2m_max: Literal["°C"]
    apparent_temperature_max: Literal["°C"]
    uv_index_max: Literal[""]


class _UpstreamCurrent(BaseModel):
    model_config = ConfigDict(extra="ignore", strict=True)

    time: str
    interval: Annotated[int, Field(gt=0)]
    temperature_2m: FiniteTemperature
    apparent_temperature: FiniteApparentTemperature
    relative_humidity_2m: Annotated[
        float,
        Field(ge=0.0, le=100.0, allow_inf_nan=False),
    ]
    weather_code: int

    @field_validator("weather_code")
    @classmethod
    def validate_weather_code(cls, value: int) -> int:
        if value not in DOCUMENTED_WMO_CODES:
            raise ValueError("weather code is not documented by Open-Meteo")
        return value


class _UpstreamDaily(BaseModel):
    model_config = ConfigDict(extra="ignore", strict=True)

    time: list[str]
    temperature_2m_max: list[FiniteTemperature]
    apparent_temperature_max: list[FiniteApparentTemperature]
    uv_index_max: list[
        Annotated[float, Field(ge=0.0, le=100.0, allow_inf_nan=False)]
    ]


class _UpstreamWeatherResponse(BaseModel):
    model_config = ConfigDict(extra="ignore", strict=True)

    utc_offset_seconds: int
    timezone: str
    current_units: _UpstreamCurrentUnits
    current: _UpstreamCurrent
    daily_units: _UpstreamDailyUnits
    daily: _UpstreamDaily

    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, value: str) -> str:
        return _validate_timezone_identifier(value)


class WeatherService:
    """Fetch and validate one Open-Meteo forecast response without retries."""

    def __init__(
        self,
        *,
        transport: httpx.AsyncBaseTransport | None = None,
        utc_now: Callable[[], datetime] | None = None,
        timeout_seconds: float = WEATHER_TIMEOUT_SECONDS,
    ) -> None:
        if not math.isfinite(timeout_seconds) or timeout_seconds <= 0:
            raise ValueError("timeout_seconds must be a positive finite number")
        self._transport = transport
        self._utc_now = utc_now or (lambda: datetime.now(timezone.utc))
        self._timeout = httpx.Timeout(timeout_seconds)

    async def get_context(
        self,
        request: WeatherContextRequest,
    ) -> WeatherContextResponse:
        """Return normalized weather or one stable unavailable error."""

        params: dict[str, str | float | int] = {
            "latitude": request.latitude,
            "longitude": request.longitude,
            "current": CURRENT_FIELDS,
            "daily": DAILY_FIELDS,
            "timezone": "auto",
            "forecast_days": 1,
            "temperature_unit": "celsius",
            "timeformat": "iso8601",
        }

        try:
            async with httpx.AsyncClient(
                transport=self._transport,
                timeout=self._timeout,
                follow_redirects=False,
            ) as client:
                response = await client.get(OPEN_METEO_FORECAST_URL, params=params)

            if not 200 <= response.status_code < 300:
                raise WeatherUnavailable()

            upstream = _UpstreamWeatherResponse.model_validate(response.json())
            return self._normalize(upstream)
        except WeatherUnavailable:
            raise
        except (
            httpx.RequestError,
            ValidationError,
            ValueError,
            TypeError,
            KeyError,
            ZoneInfoNotFoundError,
        ):
            raise WeatherUnavailable() from None

    def _normalize(
        self,
        upstream: _UpstreamWeatherResponse,
    ) -> WeatherContextResponse:
        zone = ZoneInfo(upstream.timezone)
        observed_at = _resolve_local_timestamp(
            upstream.current.time,
            zone=zone,
            utc_offset_seconds=upstream.utc_offset_seconds,
        )
        daily_date = _validate_single_daily_value(upstream.daily.time, "time")
        parsed_daily_date = date.fromisoformat(daily_date)
        if parsed_daily_date != observed_at.date():
            raise ValueError("daily forecast date does not match current timestamp")

        temperature_max = _validate_single_daily_value(
            upstream.daily.temperature_2m_max,
            "temperature_2m_max",
        )
        apparent_temperature_max = _validate_single_daily_value(
            upstream.daily.apparent_temperature_max,
            "apparent_temperature_max",
        )
        uv_index_max = _validate_single_daily_value(
            upstream.daily.uv_index_max,
            "uv_index_max",
        )

        retrieved_at = self._utc_now()
        if retrieved_at.tzinfo is None or retrieved_at.utcoffset() is None:
            raise ValueError("retrieval clock must return a timezone-aware datetime")
        retrieved_at = retrieved_at.astimezone(timezone.utc)

        return WeatherContextResponse(
            retrieved_at=retrieved_at,
            timezone=upstream.timezone,
            units=WeatherUnits(),
            current=CurrentWeatherContext(
                observed_at=observed_at,
                temperature_c=upstream.current.temperature_2m,
                apparent_temperature_c=upstream.current.apparent_temperature,
                relative_humidity_pct=upstream.current.relative_humidity_2m,
                weather_code=upstream.current.weather_code,
            ),
            today=DailyWeatherContext(
                date=parsed_daily_date,
                temperature_max_c=temperature_max,
                apparent_temperature_max_c=apparent_temperature_max,
                uv_index_max=uv_index_max,
            ),
            source=WeatherSource(),
        )


def _validate_single_daily_value(values: list[Any], field_name: str) -> Any:
    if len(values) != 1:
        raise ValueError(f"daily {field_name} must contain exactly one value")
    return values[0]


def _resolve_local_timestamp(
    value: str,
    *,
    zone: ZoneInfo,
    utc_offset_seconds: int,
) -> datetime:
    """Resolve an Open-Meteo local timestamp, including DST folds, safely."""

    local = datetime.fromisoformat(value)
    if local.tzinfo is not None:
        raise ValueError("Open-Meteo local timestamp unexpectedly contains an offset")

    matches: list[datetime] = []
    for fold in (0, 1):
        candidate = local.replace(tzinfo=zone, fold=fold)
        offset = candidate.utcoffset()
        if offset is None or int(offset.total_seconds()) != utc_offset_seconds:
            continue

        round_trip = candidate.astimezone(timezone.utc).astimezone(zone)
        if round_trip.replace(tzinfo=None) != local:
            continue
        if int(round_trip.utcoffset().total_seconds()) != utc_offset_seconds:
            continue
        matches.append(candidate)

    if not matches:
        raise ValueError("timestamp offset is inconsistent with upstream timezone")
    return matches[0]
