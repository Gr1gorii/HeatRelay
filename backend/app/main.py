"""HeatRelay API entry point."""

import os
from collections.abc import Callable
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.exception_handlers import request_validation_exception_handler
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from backend.app.action_plan import (
    ACTION_PLAN_ENDPOINT_PATH,
    INVALID_ACTION_PLAN_REQUEST_CODE,
    INVALID_ACTION_PLAN_REQUEST_MESSAGE,
    ActionPlanRequest,
    ActionPlanResponse,
    ActionPlanWorkflow,
    ActionPlanWorkflowUnavailable,
    validate_action_plan_response,
)
from backend.app.grounded_plan import GroundedPlanFailure, GroundedPlanService
from backend.app.places import (
    PlaceDataError,
    PlaceRepository,
    get_place_repository,
    router as places_router,
)
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
    validate_situation_extraction_response,
)

app = FastAPI(
    title="HeatRelay API",
    description="Bounded context services for the HeatRelay Barcelona pilot.",
    version="0.1.0",
)

_weather_service = WeatherService()
_action_plan_validation_repository = PlaceRepository()
app.include_router(places_router)


def get_weather_service() -> WeatherService:
    """Return the application weather service for dependency overrides."""

    return _weather_service


def get_situation_service() -> SituationExtractionService:
    """Build the extraction adapter lazily for dependency overrides and requests."""

    return SituationExtractionService(api_key=os.environ.get("OPENAI_API_KEY"))


def get_grounded_plan_service() -> GroundedPlanService:
    """Build the second GPT adapter lazily for one action-plan request."""

    return GroundedPlanService(api_key=os.environ.get("OPENAI_API_KEY"))


def get_action_plan_validation_repository() -> PlaceRepository:
    """Return the repository view reserved for final public reconciliation."""

    return _action_plan_validation_repository


def _system_utc_now() -> datetime:
    return datetime.now(timezone.utc)


def get_action_plan_clock() -> Callable[[], datetime]:
    """Return the endpoint-owned UTC clock for request-scoped verification."""

    return _system_utc_now


def _read_action_plan_clock(clock: Callable[[], datetime]) -> datetime:
    """Read one strict UTC instant without accepting a naive or local clock."""

    try:
        value = clock()
        if (
            not isinstance(value, datetime)
            or value.tzinfo is None
            or value.utcoffset() != timedelta(0)
        ):
            raise ValueError("action-plan clock must return UTC")
        return value
    except Exception as error:
        raise ActionPlanWorkflowUnavailable() from error


def get_action_plan_workflow(
    situation_service: Annotated[
        SituationExtractionService,
        Depends(get_situation_service),
    ],
    weather_service: Annotated[WeatherService, Depends(get_weather_service)],
    repository: Annotated[PlaceRepository, Depends(get_place_repository)],
    plan_service: Annotated[
        GroundedPlanService,
        Depends(get_grounded_plan_service),
    ],
) -> ActionPlanWorkflow:
    """Compose request-scoped injected stages without creating clients early."""

    return ActionPlanWorkflow(
        situation_service=situation_service,
        weather_service=weather_service,
        repository=repository,
        plan_service=plan_service,
    )


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
    if request.url.path == ACTION_PLAN_ENDPOINT_PATH:
        return JSONResponse(
            status_code=422,
            content={
                "detail": {
                    "code": INVALID_ACTION_PLAN_REQUEST_CODE,
                    "message": INVALID_ACTION_PLAN_REQUEST_MESSAGE,
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
        return validate_situation_extraction_response(
            await service.extract(request)
        )
    except SituationExtractionFailure as error:
        raise HTTPException(
            status_code=error.status_code,
            detail={"code": error.code, "message": error.message},
        ) from None


@app.post(
    ACTION_PLAN_ENDPOINT_PATH,
    response_model=ActionPlanResponse,
)
async def create_action_plan(
    request: ActionPlanRequest,
    workflow: Annotated[
        ActionPlanWorkflow,
        Depends(get_action_plan_workflow),
    ],
    trusted_repository: Annotated[
        PlaceRepository,
        Depends(get_action_plan_validation_repository),
    ],
    utc_now: Annotated[
        Callable[[], datetime],
        Depends(get_action_plan_clock),
    ],
) -> ActionPlanResponse:
    """Run the Barcelona pilot bounding-box server-owned action workflow."""

    try:
        evaluation_started_at = _read_action_plan_clock(utc_now)
        response = await workflow.create(request)
        evaluation_finished_at = _read_action_plan_clock(utc_now)
        return validate_action_plan_response(
            response,
            request=request,
            trusted_repository=trusted_repository,
            evaluation_started_at=evaluation_started_at,
            evaluation_finished_at=evaluation_finished_at,
        )
    except SituationExtractionFailure as error:
        raise HTTPException(
            status_code=error.status_code,
            detail={"code": error.code, "message": error.message},
        ) from None
    except WeatherUnavailable as error:
        raise HTTPException(
            status_code=503,
            detail={"code": error.code, "message": error.message},
        ) from None
    except ActionPlanWorkflowUnavailable as error:
        raise HTTPException(
            status_code=error.status_code,
            detail={"code": error.code, "message": error.message},
        ) from None
    except PlaceDataError:
        raise HTTPException(
            status_code=503,
            detail={
                "code": "places_unavailable",
                "message": "Verified place data is temporarily unavailable.",
            },
        ) from None
    except GroundedPlanFailure as error:
        raise HTTPException(
            status_code=error.status_code,
            detail={"code": error.code, "message": error.message},
        ) from None
