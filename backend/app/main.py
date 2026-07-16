"""HeatRelay API entry point."""

from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException

from backend.app.places import router as places_router
from backend.app.weather import (
    WeatherContextRequest,
    WeatherContextResponse,
    WeatherService,
    WeatherUnavailable,
)

app = FastAPI(
    title="HeatRelay API",
    description="Bounded context services for the HeatRelay Barcelona pilot.",
    version="0.1.0",
)

_weather_service = WeatherService()
app.include_router(places_router)


def get_weather_service() -> WeatherService:
    """Return the application weather service for dependency overrides."""

    return _weather_service


@app.get("/api/health")
def health() -> dict[str, str]:
    """Return the stable service health contract."""

    return {"status": "ok", "service": "heatrelay-api"}


@app.post(
    "/api/v1/weather/context",
    response_model=WeatherContextResponse,
)
async def weather_context(
    request: WeatherContextRequest,
    service: Annotated[WeatherService, Depends(get_weather_service)],
) -> WeatherContextResponse:
    """Return normalized model-derived weather context without echoing coordinates."""

    try:
        return await service.get_context(request)
    except WeatherUnavailable as error:
        raise HTTPException(
            status_code=503,
            detail={"code": error.code, "message": error.message},
        ) from None
