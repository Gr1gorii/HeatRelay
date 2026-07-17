"""HeatRelay API entry point."""

import os
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.exception_handlers import request_validation_exception_handler
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from backend.app.places import router as places_router
from backend.app.weather import (
    WeatherContextRequest,
    WeatherContextResponse,
    WeatherService,
    WeatherUnavailable,
)
from backend.app.situation import (
    INVALID_REQUEST_CODE,
    INVALID_REQUEST_MESSAGE,
    SITUATION_ENDPOINT_PATH,
    SituationExtractionFailure,
    SituationExtractionRequest,
    SituationExtractionResponse,
    SituationExtractionService,
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


def get_situation_service() -> SituationExtractionService:
    """Build the extraction adapter lazily for dependency overrides and requests."""

    return SituationExtractionService(api_key=os.environ.get("OPENAI_API_KEY"))


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    error: RequestValidationError,
) -> JSONResponse:
    """Sanitize situation validation without changing existing API errors."""

    if request.url.path == SITUATION_ENDPOINT_PATH:
        return JSONResponse(
            status_code=422,
            content={
                "detail": {
                    "code": INVALID_REQUEST_CODE,
                    "message": INVALID_REQUEST_MESSAGE,
                }
            },
        )
    return await request_validation_exception_handler(request, error)


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


@app.post(
    SITUATION_ENDPOINT_PATH,
    response_model=SituationExtractionResponse,
)
async def extract_situation(
    request: SituationExtractionRequest,
    service: Annotated[
        SituationExtractionService,
        Depends(get_situation_service),
    ],
) -> SituationExtractionResponse:
    """Extract a bounded profile without echoing the private situation text."""

    try:
        return await service.extract(request)
    except SituationExtractionFailure as error:
        raise HTTPException(
            status_code=error.status_code,
            detail={"code": error.code, "message": error.message},
        ) from None
