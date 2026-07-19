"""Offline orchestration tests for the server-owned M3 action-plan workflow.

All profiles, weather values, places, and provider results in this module are
synthetic contract fixtures. No test loads local credentials or uses a network.
"""

from __future__ import annotations

import asyncio
import json
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path
from typing import Any, Callable
from zoneinfo import ZoneInfo

import pytest

from backend.app.action_plan import (
    ACTION_POLICY_VERSION,
    BRING_ITEM_TEXT,
    EXPLANATION_TEXT,
    LOCAL_PHRASES,
    MODEL_DERIVED_POLICY_NOTICE,
    MOVEMENT_PROHIBITED_EXPLANATION,
    POLICY_SOURCES,
    TRAVEL_COMPATIBILITY_UNPROVEN_EXPLANATION,
    TRAVEL_COMPATIBILITY_UNPROVEN_NOTICE,
    NEXT_ACTION_TEXT,
    NORMAL_PLAN_NOTICE,
    NOW_ACTION_TEXT,
    TONIGHT_ACTION_TEXT,
    ActionPlanRequest,
    ActionPlanSituationProjection,
    ActionPlanWeatherProjection,
    ActionPlanWorkflow,
    ActionPlanWorkflowUnavailable,
    PriorityDecision,
    build_grounded_plan_context,
    hydrate_grounded_plan,
    project_action_plan_situation,
    project_action_plan_weather,
    project_selected_candidate,
)
from backend.app.action_plan_catalog import ActionPlanCatalog, get_action_plan_catalog
from backend.app.grounded_plan import (
    EXPLANATION_REASON_ORDER,
    GroundedPlanContext,
    GroundedPlanGeneration,
    GroundedPlanInvalidResponse,
    GroundedPlanUnavailable,
    GroundedPlanUsage,
    ModelGroundedPlan,
    canonical_required_plan_codes,
    grounded_model_visible_request,
)
from backend.app.localization import (
    OutputLocale,
    SUPPORTED_INPUT_LANGUAGES,
    SUPPORTED_OUTPUT_LOCALES,
)
from backend.app.places import (
    OFFICIAL_DATASET_URL,
    CandidatePlace,
    PlaceDataError,
    PlaceRepository,
    PlacesCandidatesResponse,
    SnapshotProvenance,
    get_committed_snapshot_provenance,
    haversine_distance_m,
)
from backend.app.situation import (
    ModelSituationExtraction,
    MOBILITY_ORDER,
    SITUATION_NOTICE,
    SituationExtractionRequest,
    SituationExtractionResponse,
    SYMPTOM_ORDER,
    TIME_CONSTRAINT_ORDER,
    build_public_response,
)
from backend.app.weather import (
    MODEL_DERIVED_NOTICE,
    WEATHER_TIMEOUT_SECONDS,
    WeatherContextRequest,
    WeatherContextResponse,
    WeatherUnavailable,
)

FIXED_UTC = datetime(2026, 7, 20, 8, 0, tzinfo=timezone.utc)
BARCELONA_ORIGIN = {"latitude": 41.3874, "longitude": 2.1686}
SYNTHETIC_TEXT = "Synthetic profile: I need a cooler place."


def _base_extraction() -> dict[str, Any]:
    return {
        "detected_input_language": "en",
        "preferred_language": {"status": "not_stated", "value": None},
        "vulnerability_factors": {"status": "not_stated", "values": []},
        "mobility_constraints": {"status": "not_stated", "values": []},
        "cooling_access": {"status": "not_stated", "value": None},
        "housing_situation": {"status": "not_stated", "value": None},
        "time_constraints": {"status": "not_stated", "values": []},
        "reported_symptoms": {"status": "not_stated", "values": []},
    }


def _situation(**changes: Any) -> SituationExtractionResponse:
    payload = _base_extraction()
    payload.update(changes)
    return build_public_response(ModelSituationExtraction.model_validate(payload))


def _weather(
    *,
    maximum_c: float = 34.0,
    current_c: float = 31.5,
    day: date = date(2026, 7, 20),
    timezone_name: str = "Europe/Madrid",
    observed_at: datetime | None = None,
    retrieved_at: datetime | None = None,
    apparent_current_c: float = 33.0,
    apparent_maximum_c: float | None = None,
) -> WeatherContextResponse:
    return WeatherContextResponse.model_validate(
        {
            "retrieved_at": retrieved_at or FIXED_UTC,
            "timezone": timezone_name,
            "units": {
                "temperature": "celsius",
                "relative_humidity": "percent",
                "uv_index": "index",
            },
            "current": {
                "observed_at": observed_at
                or datetime.combine(
                    day,
                    time(10, 0),
                    tzinfo=ZoneInfo(timezone_name),
                ),
                "temperature_c": current_c,
                "apparent_temperature_c": apparent_current_c,
                "relative_humidity_pct": 55.0,
                "weather_code": 1,
            },
            "today": {
                "date": day,
                "temperature_max_c": maximum_c,
                "apparent_temperature_max_c": (
                    max(maximum_c + 1.5, apparent_current_c)
                    if apparent_maximum_c is None
                    else apparent_maximum_c
                ),
                "uv_index_max": 8.0,
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
    )


def _candidate(
    place_id: str = "bcn-101",
    *,
    accessibility: bool | None = True,
    distance_m: int = 125,
    closes_at: datetime | None = None,
    missing_closes_at: bool = False,
) -> CandidatePlace:
    low = BARCELONA_ORIGIN["latitude"]
    high = low + 0.1
    for _ in range(80):
        midpoint = (low + high) / 2
        midpoint_distance = haversine_distance_m(
            BARCELONA_ORIGIN["latitude"],
            BARCELONA_ORIGIN["longitude"],
            midpoint,
            BARCELONA_ORIGIN["longitude"],
        )
        if midpoint_distance < distance_m:
            low = midpoint
        else:
            high = midpoint
    latitude = (low + high) / 2
    candidate = CandidatePlace.model_validate(
        {
            "place_id": place_id,
            "source_record_id": place_id.removeprefix("bcn-"),
            "name": f"Synthetic shelter {place_id}",
            "address": {
                "street": "Carrer Synthetic",
                "number": "1",
                "postal_code": "08001",
                "city": "Barcelona",
            },
            "district": "Ciutat Vella",
            "neighborhood": "El Raval",
            "latitude": latitude,
            "longitude": BARCELONA_ORIGIN["longitude"],
            "distance_m": distance_m,
            "closes_at": closes_at
            or datetime(
                2026,
                7,
                20,
                18,
                0,
                tzinfo=ZoneInfo("Europe/Madrid"),
            ),
            "accessibility": accessibility,
            "features": {
                "indoor_space": True,
                "potable_water": True,
                "toilets": None,
                "micro_shelter": None,
                "pets_allowed": None,
            },
            "information_url": "https://example.test/synthetic-place",
            "schedule_verification_status": "verified",
            "source_modified_at": datetime(
                2026,
                7,
                9,
                10,
                0,
                tzinfo=timezone.utc,
            ),
            "source_url": OFFICIAL_DATASET_URL,
            "last_checked": date(2026, 7, 16),
        }
    )
    if missing_closes_at:
        return candidate.model_copy(update={"closes_at": None})
    return candidate


def _snapshot() -> SnapshotProvenance:
    return get_committed_snapshot_provenance()


def _place_response(
    candidates: list[CandidatePlace],
) -> PlacesCandidatesResponse:
    return PlacesCandidatesResponse(
        candidates=candidates,
        snapshot=_snapshot(),
        explanation="Synthetic eligible candidates.",
        hours_warning=(
            "Municipal opening hours may change; check the official source before travel."
        ),
        candidate_notice=(
            "These are factual, backend-approved candidate places, not medical recommendations."
        ),
    )


def _adversarial_place_response(
    candidates: list[CandidatePlace],
    *,
    snapshot: SnapshotProvenance | None = None,
) -> PlacesCandidatesResponse:
    """Bypass initial model construction to test the workflow trust boundary."""

    return PlacesCandidatesResponse.model_construct(
        candidates=candidates,
        snapshot=snapshot or _snapshot(),
        explanation="Synthetic adversarial candidate response.",
        hours_warning=(
            "Municipal opening hours may change; check the official source before travel."
        ),
        candidate_notice=(
            "These are factual, backend-approved candidate places, not medical recommendations."
        ),
    )


class FakeSituationService:
    def __init__(
        self,
        response: SituationExtractionResponse,
        *,
        error: Exception | None = None,
    ) -> None:
        self.response = response
        self.error = error
        self.requests: list[SituationExtractionRequest] = []

    async def extract(
        self,
        request: SituationExtractionRequest,
    ) -> SituationExtractionResponse:
        self.requests.append(request)
        if self.error is not None:
            raise self.error
        return self.response


class FakeWeatherService:
    def __init__(
        self,
        response: WeatherContextResponse,
        *,
        error: Exception | None = None,
    ) -> None:
        self.response = response
        self.error = error
        self.requests: list[WeatherContextRequest] = []

    async def get_context(
        self,
        request: WeatherContextRequest,
    ) -> WeatherContextResponse:
        self.requests.append(request)
        if self.error is not None:
            raise self.error
        return self.response


class FakeRepository:
    def __init__(
        self,
        candidates: list[CandidatePlace],
        *,
        error: Exception | None = None,
    ) -> None:
        self.response = _place_response(candidates)
        self.error = error
        self.calls: list[tuple[Any, bool]] = []

    def find_action_candidates(
        self,
        request: Any,
        *,
        accessibility_required: bool,
    ) -> PlacesCandidatesResponse:
        self.calls.append((request, accessibility_required))
        if self.error is not None:
            raise self.error
        return self.response


def _valid_plan(context: GroundedPlanContext) -> ModelGroundedPlan:
    now = list(context.allowed_codes.now)
    selected_place_id = (
        context.candidates[0].place_id
        if "travel_to_selected_place" in now
        else None
    )
    return ModelGroundedPlan.model_validate(
        {
            "now": {"action_codes": now},
            "next_few_hours": {
                "action_codes": list(context.allowed_codes.next_few_hours)
            },
            "tonight": {
                "action_codes": list(context.allowed_codes.tonight)
            },
            "bring_items": (
                list(context.allowed_codes.bring_items)
                if selected_place_id is not None
                else []
            ),
            "explanation_reasons": list(
                context.allowed_codes.explanation_reasons
            ),
            "local_phrase_code": (
                context.allowed_codes.local_phrases[0]
                if selected_place_id is not None
                else None
            ),
            "selected_place_id": selected_place_id,
        }
    )


def _malicious_travel_plan(context: GroundedPlanContext) -> ModelGroundedPlan:
    selected_now = set(context.required_codes.now)
    selected_now.discard("remain_at_current_location")
    selected_now.add("travel_to_selected_place")
    selected_reasons = set(context.required_codes.explanation_reasons)
    selected_reasons.add("verified_open_candidate")
    return ModelGroundedPlan.model_validate(
        {
            "now": {
                "action_codes": [
                    code
                    for code in NOW_ACTION_TEXT
                    if code in selected_now
                ]
            },
            "next_few_hours": {
                "action_codes": list(context.required_codes.next_few_hours)
            },
            "tonight": {
                "action_codes": list(context.required_codes.tonight)
            },
            "bring_items": ["water", "phone"],
            "explanation_reasons": [
                code
                for code in EXPLANATION_REASON_ORDER
                if code in selected_reasons
            ],
            "local_phrase_code": "spanish_request_cool_space",
            "selected_place_id": "bcn-101",
        }
    )


class FakePlanService:
    def __init__(
        self,
        *,
        plan_factory: Callable[[GroundedPlanContext], ModelGroundedPlan]
        = _valid_plan,
        error: Exception | None = None,
    ) -> None:
        self.plan_factory = plan_factory
        self.error = error
        self.contexts: list[GroundedPlanContext] = []

    async def generate(
        self,
        context: GroundedPlanContext,
    ) -> GroundedPlanGeneration:
        self.contexts.append(context)
        if self.error is not None:
            raise self.error
        return GroundedPlanGeneration(
            plan=self.plan_factory(context),
            usage=GroundedPlanUsage(
                model="synthetic-model",
                input_tokens=None,
                output_tokens=None,
                total_tokens=None,
            ),
            payload_bytes=1,
        )


def _request(**changes: Any) -> ActionPlanRequest:
    payload: dict[str, Any] = {
        "situation_text": SYNTHETIC_TEXT,
        "origin": BARCELONA_ORIGIN,
        "maximum_distance_m": 3_000,
    }
    payload.update(changes)
    return ActionPlanRequest.model_validate(payload)


def _workflow(
    *,
    situation: SituationExtractionResponse | None = None,
    situation_error: Exception | None = None,
    weather_service: FakeWeatherService | None = None,
    repository: Any | None = None,
    plan_service: FakePlanService | None = None,
    utc_now: Callable[[], datetime] | None = None,
) -> tuple[
    ActionPlanWorkflow,
    FakeSituationService,
    FakeWeatherService,
    Any,
    FakePlanService,
]:
    situation_service = FakeSituationService(
        situation or _situation(),
        error=situation_error,
    )
    selected_weather = weather_service or FakeWeatherService(_weather())
    selected_repository = repository or FakeRepository([_candidate()])
    selected_plan = plan_service or FakePlanService()
    return (
        ActionPlanWorkflow(
            situation_service=situation_service,  # type: ignore[arg-type]
            weather_service=selected_weather,  # type: ignore[arg-type]
            repository=selected_repository,
            plan_service=selected_plan,
            utc_now=utc_now or (lambda: FIXED_UTC),
        ),
        situation_service,
        selected_weather,
        selected_repository,
        selected_plan,
    )


def _priority_decision(priority: str) -> PriorityDecision:
    reason = {
        "act_now": "forecast_at_or_above_36c",
        "prepare_now": "forecast_at_or_above_34c",
        "monitor_and_prepare": "baseline_monitoring",
    }[priority]
    return PriorityDecision(
        policy_version=ACTION_POLICY_VERSION,
        priority=priority,  # type: ignore[arg-type]
        reason_codes=[reason],  # type: ignore[list-item]
        sources=list(POLICY_SOURCES),
        notice=MODEL_DERIVED_POLICY_NOTICE,
    )


def _catalog_prose(catalog: ActionPlanCatalog) -> set[str]:
    prose = {
        catalog.situation_notice,
        catalog.weather_notice,
        catalog.policy_notice,
        *catalog.policy_rules,
        catalog.urgent_contact_instruction,
        *catalog.urgent_actions.values(),
        *catalog.urgent_notices,
        *catalog.bring_items.values(),
        *catalog.explanations.values(),
        catalog.normal_notice,
        *catalog.candidate_explanations.values(),
        *catalog.candidate_warnings.values(),
        catalog.unresolved_travel_notice,
    }
    for action_catalog in (
        catalog.now_actions,
        catalog.next_few_hours_actions,
        catalog.tonight_actions,
    ):
        for text, explanation in action_catalog.values():
            prose.update((text, explanation))
    return prose


def _normalize_catalog_projection(
    value: Any,
    catalog: ActionPlanCatalog,
) -> Any:
    if isinstance(value, dict):
        return {
            key: (
                "<output-locale>"
                if key == "output_locale"
                else _normalize_catalog_projection(item, catalog)
            )
            for key, item in value.items()
        }
    if isinstance(value, list):
        return [_normalize_catalog_projection(item, catalog) for item in value]
    if isinstance(value, str) and value in _catalog_prose(catalog):
        return "<catalog-prose>"
    return value


@pytest.mark.parametrize(
    "priority",
    ["act_now", "prepare_now", "monitor_and_prepare"],
)
def test_production_context_uses_intrinsic_required_matrix(priority: str) -> None:
    situation = _situation()
    decision = _priority_decision(priority)
    maximum_c = {"act_now": 36.0, "prepare_now": 34.0}.get(priority, 30.0)
    context = build_grounded_plan_context(
        situation,
        _weather(maximum_c=maximum_c, current_c=min(29.0, maximum_c)),
        decision,
        (),
    )

    assert context.required_codes == canonical_required_plan_codes(
        priority=priority,  # type: ignore[arg-type]
        priority_reason_codes=list(decision.reason_codes),  # type: ignore[arg-type]
        movement_prohibited=False,
        travel_support_required=False,
        travel_compatibility_unproven=False,
        unsheltered=False,
    )


@pytest.mark.parametrize(
    ("situation", "expected_remain", "expected_support"),
    [
        pytest.param(
            _situation(
                mobility_constraints={
                    "status": "reported",
                    "values": ["cannot_leave_current_location"],
                }
            ),
            True,
            False,
            id="movement-prohibited",
        ),
        pytest.param(
            _situation(
                mobility_constraints={
                    "status": "reported",
                    "values": ["cannot_travel_alone"],
                }
            ),
            False,
            True,
            id="travel-support",
        ),
    ],
)
def test_production_context_intrinsic_movement_and_support_matrix(
    situation: SituationExtractionResponse,
    expected_remain: bool,
    expected_support: bool,
) -> None:
    context = build_grounded_plan_context(
        situation,
        _weather(),
        _priority_decision("prepare_now"),
        (),
    )

    assert ("remain_at_current_location" in context.required_codes.now) is expected_remain
    assert ("contact_support_person" in context.required_codes.now) is expected_support
    assert context.travel_compatibility_unproven is True


@pytest.mark.parametrize(
    "priority",
    ["act_now", "prepare_now", "monitor_and_prepare"],
)
def test_unsheltered_intrinsic_matrix_never_allows_room_or_window_actions(
    priority: str,
) -> None:
    situation = _situation(
        housing_situation={"status": "reported", "value": "unsheltered"}
    )
    maximum_c = {"act_now": 36.0, "prepare_now": 34.0}.get(priority, 30.0)
    context = build_grounded_plan_context(
        situation,
        _weather(maximum_c=maximum_c, current_c=min(29.0, maximum_c)),
        _priority_decision(priority),
        (),
    )

    forbidden = {
        "sleep_in_coolest_available_room",
        "ventilate_when_outside_is_cooler",
    }
    assert forbidden.isdisjoint(context.allowed_codes.tonight)
    assert forbidden.isdisjoint(context.required_codes.tonight)


@pytest.mark.parametrize(
    ("cooling_value", "current_c", "maximum_c"),
    [
        ("air_conditioning", 40.1, 40.1),
        ("fan_only", 39.9, 39.9),
    ],
)
def test_unsheltered_never_allows_home_cooling(
    cooling_value: str,
    current_c: float,
    maximum_c: float,
) -> None:
    situation = _situation(
        cooling_access={"status": "reported", "value": cooling_value},
        housing_situation={"status": "reported", "value": "unsheltered"},
    )
    workflow, _, _, _, plan_service = _workflow(
        situation=situation,
        weather_service=FakeWeatherService(
            _weather(current_c=current_c, maximum_c=maximum_c)
        ),
    )

    response = asyncio.run(workflow.create(_request()))

    assert "use_available_home_cooling" not in (
        plan_service.contexts[0].allowed_codes.now
    )
    assert "use_available_home_cooling" not in {
        action.code for action in response.plan.now.actions
    }


@pytest.mark.parametrize(
    ("cooling_value", "current_c", "maximum_c"),
    [
        ("air_conditioning", 40.1, 40.1),
        ("fan_only", 39.9, 39.9),
    ],
)
def test_unsheltered_rejects_malicious_home_cooling_output(
    cooling_value: str,
    current_c: float,
    maximum_c: float,
) -> None:
    situation = _situation(
        cooling_access={"status": "reported", "value": cooling_value},
        housing_situation={"status": "reported", "value": "unsheltered"},
    )

    def unsafe_home_cooling(context: GroundedPlanContext) -> ModelGroundedPlan:
        payload = _valid_plan(context).model_dump(mode="json")
        now = set(payload["now"]["action_codes"])
        now.add("use_available_home_cooling")
        payload["now"] = {
            "action_codes": [code for code in NOW_ACTION_TEXT if code in now]
        }
        return ModelGroundedPlan.model_validate(payload)

    workflow, _, _, _, _ = _workflow(
        situation=situation,
        weather_service=FakeWeatherService(
            _weather(current_c=current_c, maximum_c=maximum_c)
        ),
        plan_service=FakePlanService(plan_factory=unsafe_home_cooling),
    )

    with pytest.raises(GroundedPlanInvalidResponse):
        asyncio.run(workflow.create(_request()))


@pytest.mark.parametrize("housing_value", ["stable_housing", "temporary_housing"])
@pytest.mark.parametrize(
    ("cooling_value", "current_c", "maximum_c"),
    [
        ("air_conditioning", 40.1, 40.1),
        ("fan_only", 39.9, 39.9),
    ],
)
def test_housed_people_retain_applicable_home_cooling(
    housing_value: str,
    cooling_value: str,
    current_c: float,
    maximum_c: float,
) -> None:
    situation = _situation(
        cooling_access={"status": "reported", "value": cooling_value},
        housing_situation={"status": "reported", "value": housing_value},
    )
    workflow, _, _, _, plan_service = _workflow(
        situation=situation,
        weather_service=FakeWeatherService(
            _weather(current_c=current_c, maximum_c=maximum_c)
        ),
    )

    response = asyncio.run(workflow.create(_request()))

    assert "use_available_home_cooling" in (
        plan_service.contexts[0].allowed_codes.now
    )
    assert "use_available_home_cooling" in {
        action.code for action in response.plan.now.actions
    }


def test_unsheltered_public_plan_uses_no_room_home_or_window_text() -> None:
    situation = _situation(
        housing_situation={"status": "reported", "value": "unsheltered"}
    )
    workflow, _, _, _, plan_service = _workflow(situation=situation)

    response = asyncio.run(workflow.create(_request()))

    context = plan_service.contexts[0]
    tonight_text = " ".join(
        action.text.lower() for action in response.plan.tonight.actions
    )
    assert {"room", "home", "window"}.isdisjoint(tonight_text.split())
    assert "sleep_in_coolest_available_room" not in context.allowed_codes.tonight
    assert "ventilate_when_outside_is_cooler" not in context.allowed_codes.tonight


def test_unsheltered_malicious_room_action_is_rejected() -> None:
    situation = _situation(
        housing_situation={"status": "reported", "value": "unsheltered"}
    )

    def malicious(context: GroundedPlanContext) -> ModelGroundedPlan:
        payload = _valid_plan(context).model_dump(mode="json")
        payload["tonight"]["action_codes"].insert(
            0,
            "sleep_in_coolest_available_room",
        )
        return ModelGroundedPlan.model_validate(payload)

    workflow, _, _, _, _ = _workflow(
        situation=situation,
        plan_service=FakePlanService(plan_factory=malicious),
    )

    with pytest.raises(GroundedPlanInvalidResponse):
        asyncio.run(workflow.create(_request()))


def test_temporary_housing_keeps_conditional_room_actions_separate() -> None:
    situation = _situation(
        housing_situation={"status": "reported", "value": "temporary_housing"}
    )
    context = build_grounded_plan_context(
        situation,
        _weather(),
        _priority_decision("prepare_now"),
        (),
    )

    assert "sleep_in_coolest_available_room" in context.allowed_codes.tonight
    assert "ventilate_when_outside_is_cooler" in context.allowed_codes.tonight


def test_ordinary_workflow_uses_one_clock_and_hydrates_trusted_facts_exactly() -> None:
    clock_calls = 0

    def clock() -> datetime:
        nonlocal clock_calls
        clock_calls += 1
        return FIXED_UTC

    candidate = _candidate()
    repository = FakeRepository([candidate])
    workflow, situation_service, weather, _, plan = _workflow(
        repository=repository,
        utc_now=clock,
    )

    response = asyncio.run(workflow.create(_request()))
    catalog = get_action_plan_catalog("en")

    assert response.branch == "normal"
    assert response.schema_version == "1.16.0"
    assert response.output_locale == "en"
    assert response.situation.schema_version == "1.1.0"
    assert response.situation.detected_input_language == "en"
    assert response.situation.input_language_source == "automatically_detected"
    assert response.evaluation_time == FIXED_UTC
    assert clock_calls == 1
    assert situation_service.requests[0].situation_text == SYNTHETIC_TEXT
    assert weather.requests == [
        WeatherContextRequest(
            latitude=BARCELONA_ORIGIN["latitude"],
            longitude=BARCELONA_ORIGIN["longitude"],
        )
    ]
    place_request, accessibility_required = repository.calls[0]
    assert place_request.evaluation_datetime == FIXED_UTC
    assert place_request.limit == 3
    assert accessibility_required is False
    assert len(plan.contexts) == 1
    assert response.priority.policy_version == ACTION_POLICY_VERSION
    assert response.weather.model_dump(mode="json") == _weather().model_dump(
        mode="json"
    )
    assert response.selected_place is not None
    assert response.selected_place.model_dump(mode="json") == (
        project_selected_candidate(candidate).model_dump(mode="json")
    )
    assert "latitude" not in response.selected_place.model_dump()
    assert "longitude" not in response.selected_place.model_dump()
    assert response.candidate_context.explanation == (
        catalog.candidate_explanations["matched_candidate"]
    )
    assert [
        response.candidate_context.hours_warning,
        response.candidate_context.candidate_notice,
        response.candidate_context.distance_warning,
        response.candidate_context.reachability_warning,
    ] == [
        catalog.candidate_warnings["hours"],
        catalog.candidate_warnings["candidate_notice"],
        catalog.candidate_warnings["distance"],
        catalog.candidate_warnings["reachability"],
    ]
    assert response.notices == [
        catalog.policy_notice,
        catalog.candidate_warnings["hours"],
        catalog.candidate_warnings["distance"],
        catalog.candidate_warnings["reachability"],
        catalog.normal_notice,
    ]
    assert response.plan.notice == NORMAL_PLAN_NOTICE

    generated = _valid_plan(plan.contexts[0])
    assert [action.model_dump() for action in response.plan.now.actions] == [
        {
            "code": code,
            "text": NOW_ACTION_TEXT[code][0],
            "explanation": NOW_ACTION_TEXT[code][1],
        }
        for code in generated.now.action_codes
    ]
    assert [action.model_dump() for action in response.plan.next_few_hours.actions] == [
        {
            "code": code,
            "text": NEXT_ACTION_TEXT[code][0],
            "explanation": NEXT_ACTION_TEXT[code][1],
        }
        for code in generated.next_few_hours.action_codes
    ]
    assert [action.model_dump() for action in response.plan.tonight.actions] == [
        {
            "code": code,
            "text": TONIGHT_ACTION_TEXT[code][0],
            "explanation": TONIGHT_ACTION_TEXT[code][1],
        }
        for code in generated.tonight.action_codes
    ]
    assert [item.text for item in response.plan.bring_items] == [
        BRING_ITEM_TEXT[code] for code in generated.bring_items
    ]
    assert [item.text for item in response.plan.explanations] == [
        EXPLANATION_TEXT[code] for code in generated.explanation_reasons
    ]
    assert response.plan.local_phrase.text == LOCAL_PHRASES[
        generated.local_phrase_code
    ][1]


@pytest.mark.parametrize("output_locale", SUPPORTED_OUTPUT_LOCALES)
def test_normal_workflow_hydrates_requested_output_catalog_completely(
    output_locale: OutputLocale,
) -> None:
    workflow, situation_service, weather, repository, plan = _workflow()

    response = asyncio.run(
        workflow.create(_request(output_locale=output_locale))
    )
    catalog = get_action_plan_catalog(output_locale)

    assert response.branch == "normal"
    assert response.schema_version == "1.16.0"
    assert response.output_locale == output_locale
    assert response.situation.notice == catalog.situation_notice
    assert response.weather.notice == catalog.weather_notice
    assert response.priority.notice == catalog.policy_notice
    assert [source.heatrelay_rule for source in response.priority.sources] == list(
        catalog.policy_rules
    )
    for phase, action_catalog in (
        (response.plan.now, catalog.now_actions),
        (response.plan.next_few_hours, catalog.next_few_hours_actions),
        (response.plan.tonight, catalog.tonight_actions),
    ):
        assert [
            (action.code, action.text, action.explanation)
            for action in phase.actions
        ] == [
            (action.code, *action_catalog[action.code])
            for action in phase.actions
        ]
    assert [(item.code, item.text) for item in response.plan.bring_items] == [
        (item.code, catalog.bring_items[item.code])
        for item in response.plan.bring_items
    ]
    assert [
        (item.code, item.text) for item in response.plan.explanations
    ] == [
        (item.code, catalog.explanations[item.code])
        for item in response.plan.explanations
    ]
    assert response.plan.notice == catalog.normal_notice
    assert response.candidate_context.explanation == (
        catalog.candidate_explanations["matched_candidate"]
    )
    assert (
        response.candidate_context.hours_warning,
        response.candidate_context.candidate_notice,
        response.candidate_context.distance_warning,
        response.candidate_context.reachability_warning,
    ) == (
        catalog.candidate_warnings["hours"],
        catalog.candidate_warnings["candidate_notice"],
        catalog.candidate_warnings["distance"],
        catalog.candidate_warnings["reachability"],
    )
    assert response.notices == [
        catalog.policy_notice,
        catalog.candidate_warnings["hours"],
        catalog.candidate_warnings["distance"],
        catalog.candidate_warnings["reachability"],
        catalog.normal_notice,
    ]
    assert len(situation_service.requests) == 1
    assert len(weather.requests) == 1
    assert len(repository.calls) == 1
    assert len(plan.contexts) == 1


@pytest.mark.parametrize("output_locale", SUPPORTED_OUTPUT_LOCALES)
def test_urgent_workflow_hydrates_requested_catalog_and_preserves_bypass(
    output_locale: OutputLocale,
) -> None:
    situation = _situation(
        reported_symptoms={"status": "reported", "values": ["confusion"]}
    )
    workflow, situation_service, weather, repository, plan = _workflow(
        situation=situation
    )

    response = asyncio.run(
        workflow.create(_request(output_locale=output_locale))
    )
    catalog = get_action_plan_catalog(output_locale)

    assert response.branch == "urgent"
    assert response.schema_version == "1.16.0"
    assert response.output_locale == output_locale
    assert response.situation.notice == catalog.situation_notice
    assert response.priority.notice == catalog.policy_notice
    assert [source.heatrelay_rule for source in response.priority.sources] == list(
        catalog.policy_rules
    )
    assert response.urgent_contact.instruction == (
        catalog.urgent_contact_instruction
    )
    assert [(action.code, action.text) for action in response.actions] == list(
        catalog.urgent_actions.items()
    )
    assert response.notices == list(catalog.urgent_notices)
    assert len(situation_service.requests) == 1
    assert weather.requests == []
    assert repository.calls == []
    assert plan.contexts == []


@pytest.mark.parametrize("branch", ["normal", "urgent"])
def test_all_output_locales_preserve_identical_deterministic_facts(
    branch: str,
) -> None:
    situation = (
        _situation(
            reported_symptoms={
                "status": "reported",
                "values": ["confusion"],
            }
        )
        if branch == "urgent"
        else _situation()
    )
    runs = {}
    for output_locale in SUPPORTED_OUTPUT_LOCALES:
        workflow, situation_service, weather, repository, plan = _workflow(
            situation=situation
        )
        response = asyncio.run(
            workflow.create(_request(output_locale=output_locale))
        )
        runs[output_locale] = (
            response,
            situation_service,
            weather,
            repository,
            plan,
        )

    english, english_situation, english_weather, english_repository, english_plan = (
        runs["en"]
    )
    normalized_english = _normalize_catalog_projection(
        english.model_dump(mode="json"),
        get_action_plan_catalog("en"),
    )
    for output_locale, (
        response,
        situation_service,
        weather,
        repository,
        plan,
    ) in runs.items():
        assert response.output_locale == output_locale
        assert _normalize_catalog_projection(
            response.model_dump(mode="json"),
            get_action_plan_catalog(output_locale),
        ) == normalized_english
        assert situation_service.requests == english_situation.requests
        assert weather.requests == english_weather.requests
        assert repository.calls == english_repository.calls
        assert plan.contexts == english_plan.contexts
        if branch == "normal":
            assert response.plan.local_phrase == english.plan.local_phrase


def test_normal_workflow_projects_validated_facts_without_mutation() -> None:
    source_situation = _situation()
    source_weather = _weather()
    situation_before = source_situation.model_dump(mode="json")
    weather_before = source_weather.model_dump(mode="json")
    workflow, _, _, _, _ = _workflow(
        situation=source_situation,
        weather_service=FakeWeatherService(source_weather),
    )

    response = asyncio.run(workflow.create(_request(output_locale="en")))
    catalog = get_action_plan_catalog("en")

    assert isinstance(response.situation, ActionPlanSituationProjection)
    assert isinstance(response.weather, ActionPlanWeatherProjection)
    assert response.situation.model_dump(mode="json") == situation_before
    assert response.weather.model_dump(mode="json") == weather_before
    assert list(response.situation.model_dump()) == list(situation_before)
    assert list(response.weather.model_dump()) == list(weather_before)
    assert response.situation.notice == catalog.situation_notice == SITUATION_NOTICE
    assert response.weather.notice == catalog.weather_notice == MODEL_DERIVED_NOTICE
    assert source_situation.model_dump(mode="json") == situation_before
    assert source_weather.model_dump(mode="json") == weather_before
    assert response.situation is not source_situation
    assert response.weather is not source_weather


def test_projection_helpers_revalidate_standalone_responses_without_mutation() -> None:
    source_situation = _situation()
    source_weather = _weather()
    situation_before = source_situation.model_dump(mode="json")
    weather_before = source_weather.model_dump(mode="json")

    situation_projection = project_action_plan_situation(
        source_situation,
        output_locale="en",
    )
    weather_projection = project_action_plan_weather(
        source_weather,
        output_locale="en",
    )

    assert situation_projection.model_dump(mode="json") == situation_before
    assert weather_projection.model_dump(mode="json") == weather_before
    assert source_situation.model_dump(mode="json") == situation_before
    assert source_weather.model_dump(mode="json") == weather_before


def test_projection_helpers_reject_forged_standalone_notices() -> None:
    forged_situation = _situation().model_copy(
        update={"notice": "Forged situation notice"}
    )
    forged_weather = _weather().model_copy(
        update={"notice": "Forged weather notice"}
    )

    with pytest.raises(ValueError):
        project_action_plan_situation(forged_situation, output_locale="en")
    with pytest.raises(ValueError):
        project_action_plan_weather(forged_weather, output_locale="en")


def test_forged_raw_weather_notice_fails_before_projection() -> None:
    forged_weather = _weather().model_copy(
        update={"notice": "Forged weather notice"}
    )
    workflow, _, weather_service, repository, plan = _workflow(
        weather_service=FakeWeatherService(forged_weather),
    )

    with pytest.raises(ActionPlanWorkflowUnavailable):
        asyncio.run(workflow.create(_request()))

    assert len(weather_service.requests) == 1
    assert repository.calls == []
    assert plan.contexts == []


def test_hydration_uses_english_catalog_for_every_closed_prose_code() -> None:
    catalog = get_action_plan_catalog("en")
    nontravel_now = [
        code
        for code in catalog.now_actions
        if code != "travel_to_selected_place"
    ]
    nontravel = ModelGroundedPlan.model_validate(
        {
            "now": {"action_codes": nontravel_now},
            "next_few_hours": {
                "action_codes": list(catalog.next_few_hours_actions)
            },
            "tonight": {"action_codes": list(catalog.tonight_actions)},
            "bring_items": [],
            "explanation_reasons": list(catalog.explanations),
            "local_phrase_code": None,
            "selected_place_id": None,
        }
    )
    hydrated_nontravel = hydrate_grounded_plan(nontravel, "en")

    assert [
        (action.code, action.text, action.explanation)
        for action in hydrated_nontravel.now.actions
    ] == [
        (code, *catalog.now_actions[code]) for code in nontravel_now
    ]
    assert [
        (action.code, action.text, action.explanation)
        for action in hydrated_nontravel.next_few_hours.actions
    ] == [
        (code, *text) for code, text in catalog.next_few_hours_actions.items()
    ]
    assert [
        (action.code, action.text, action.explanation)
        for action in hydrated_nontravel.tonight.actions
    ] == [
        (code, *text) for code, text in catalog.tonight_actions.items()
    ]
    assert [
        (explanation.code, explanation.text)
        for explanation in hydrated_nontravel.explanations
    ] == list(catalog.explanations.items())
    assert hydrated_nontravel.notice == catalog.normal_notice

    travel = ModelGroundedPlan.model_validate(
        {
            "now": {"action_codes": ["travel_to_selected_place"]},
            "next_few_hours": {
                "action_codes": [next(iter(catalog.next_few_hours_actions))]
            },
            "tonight": {
                "action_codes": [next(iter(catalog.tonight_actions))]
            },
            "bring_items": list(catalog.bring_items),
            "explanation_reasons": [next(iter(catalog.explanations))],
            "local_phrase_code": "spanish_request_cool_space",
            "selected_place_id": "bcn-101",
        }
    )
    hydrated_travel = hydrate_grounded_plan(travel, "en")

    travel_text = catalog.now_actions["travel_to_selected_place"]
    assert [
        (action.code, action.text, action.explanation)
        for action in hydrated_travel.now.actions
    ] == [("travel_to_selected_place", *travel_text)]
    assert [
        (item.code, item.text) for item in hydrated_travel.bring_items
    ] == list(catalog.bring_items.items())


@pytest.mark.parametrize(
    "detected_language",
    [*SUPPORTED_INPUT_LANGUAGES, "other", "unknown"],
)
def test_every_detected_input_language_keeps_normal_output_english_only(
    detected_language: str,
) -> None:
    situation = _situation(detected_input_language=detected_language)
    workflow, situation_service, weather, repository, plan = _workflow(
        situation=situation
    )

    response = asyncio.run(workflow.create(_request(output_locale="en")))

    expected_source = (
        "fallback"
        if detected_language == "unknown"
        else "automatically_detected"
    )
    assert response.branch == "normal"
    assert response.schema_version == "1.16.0"
    assert response.output_locale == "en"
    assert response.situation.detected_input_language == detected_language
    assert response.situation.input_language_source == expected_source
    assert response.situation.preferred_language.status == "not_stated"
    assert response.situation.preferred_language.value is None
    assert len(situation_service.requests) == 1
    assert len(weather.requests) == 1
    assert len(repository.calls) == 1
    assert len(plan.contexts) == 1
    assert plan.contexts[0].situation.detected_input_language == detected_language
    assert not hasattr(plan.contexts[0].situation, "input_language_source")


@pytest.mark.parametrize(
    ("detected_language", "expected_source"),
    [
        pytest.param("ar", "automatically_detected", id="supported"),
        pytest.param("other", "automatically_detected", id="other"),
        pytest.param("unknown", "fallback", id="unknown"),
    ],
)
def test_urgent_response_preserves_detected_language_and_backend_source(
    detected_language: str,
    expected_source: str,
) -> None:
    situation = _situation(
        detected_input_language=detected_language,
        reported_symptoms={"status": "reported", "values": ["confusion"]},
    )
    workflow, situation_service, weather, repository, plan = _workflow(
        situation=situation
    )

    response = asyncio.run(workflow.create(_request(output_locale="en")))

    assert response.branch == "urgent"
    assert response.schema_version == "1.16.0"
    assert response.output_locale == "en"
    assert isinstance(response.situation, ActionPlanSituationProjection)
    assert response.situation.notice == get_action_plan_catalog(
        "en"
    ).situation_notice
    assert response.situation.detected_input_language == detected_language
    assert response.situation.input_language_source == expected_source
    assert len(situation_service.requests) == 1
    assert weather.requests == []
    assert repository.calls == []
    assert plan.contexts == []


@pytest.mark.parametrize("output_locale", SUPPORTED_OUTPUT_LOCALES)
@pytest.mark.parametrize("preferred_language", ["ar", "ru", "es", "ca"])
def test_reported_preferred_language_never_changes_requested_output_locale(
    preferred_language: str,
    output_locale: OutputLocale,
) -> None:
    situation = _situation(
        detected_input_language="en",
        preferred_language={
            "status": "reported",
            "value": preferred_language,
        },
    )
    workflow, _, _, _, plan = _workflow(situation=situation)

    response = asyncio.run(
        workflow.create(_request(output_locale=output_locale))
    )

    assert response.output_locale == output_locale
    assert response.situation.detected_input_language == "en"
    assert response.situation.input_language_source == "automatically_detected"
    assert response.situation.preferred_language.status == "reported"
    assert response.situation.preferred_language.value == preferred_language
    assert plan.contexts[0].situation.preferred_language.value == preferred_language


@pytest.mark.parametrize("symptom", SYMPTOM_ORDER)
def test_every_bounded_reported_symptom_takes_urgent_bypass(
    symptom: str,
) -> None:
    situation = _situation(
        reported_symptoms={"status": "reported", "values": [symptom]}
    )
    workflow, _, weather, repository, plan = _workflow(situation=situation)

    response = asyncio.run(workflow.create(_request()))

    assert response.branch == "urgent"
    assert response.schema_version == "1.16.0"
    assert response.output_locale == "en"
    assert response.situation.schema_version == "1.1.0"
    assert response.situation.detected_input_language == "en"
    assert response.situation.input_language_source == "automatically_detected"
    assert response.priority.priority == "urgent_help"
    assert response.priority.reason_codes == ["reported_warning_symptom"]
    assert response.urgent_contact.code == "112"
    assert response.urgent_contact.number == "112"
    assert weather.requests == []
    assert repository.calls == []
    assert plan.contexts == []
    assert all("travel" not in action.code for action in response.actions)
    assert response.actions[-1].code == (
        "do_not_use_shelter_as_medical_substitute"
    )


def test_mixed_urgent_symptoms_keep_universal_112_and_bypass_all_later_stages() -> None:
    situation = _situation(
        reported_symptoms={
            "status": "reported",
            "values": ["confusion", "chest_pain", "repeated_vomiting"],
        }
    )
    workflow, _, _, _, _ = _workflow(situation=situation)

    response = asyncio.run(workflow.create(_request()))

    assert response.branch == "urgent"
    assert response.urgent_contact.code == "112"
    assert response.actions[0].code == "contact_emergency_service_now"


@pytest.mark.parametrize("status", ["not_stated", "unknown", "explicit_none"])
def test_nonreported_symptom_statuses_do_not_take_urgent_branch(status: str) -> None:
    situation = _situation(reported_symptoms={"status": status, "values": []})
    workflow, _, weather, repository, plan = _workflow(situation=situation)

    response = asyncio.run(workflow.create(_request()))

    assert response.branch == "normal"
    assert len(weather.requests) == 1
    assert len(repository.calls) == 1
    assert len(plan.contexts) == 1


@pytest.mark.parametrize("output_locale", SUPPORTED_OUTPUT_LOCALES)
@pytest.mark.parametrize(
    ("situation", "expected_phrase_code"),
    [
        pytest.param(
            _situation(detected_input_language="ca"),
            "catalan_request_cool_space",
            id="detected-catalan",
        ),
        pytest.param(
            _situation(
                detected_input_language="en",
                preferred_language={"status": "reported", "value": "ca"},
            ),
            "catalan_request_cool_space",
            id="reported-catalan-preference",
        ),
        pytest.param(
            _situation(detected_input_language="ru"),
            "spanish_request_cool_space",
            id="deterministic-spanish-fallback",
        ),
        pytest.param(
            _situation(detected_input_language="ar"),
            "spanish_request_cool_space",
            id="arabic-input-english-output",
        ),
        pytest.param(
            _situation(detected_input_language="other"),
            "spanish_request_cool_space",
            id="unsupported-language-spanish-fallback",
        ),
        pytest.param(
            _situation(detected_input_language="unknown"),
            "spanish_request_cool_space",
            id="unknown-language-spanish-fallback",
        ),
        pytest.param(
            _situation(
                detected_input_language="ru",
                preferred_language={"status": "reported", "value": "es"},
            ),
            "spanish_request_cool_space",
            id="reported-spanish-preference",
        ),
    ],
)
def test_local_phrase_selection_uses_fixed_catalog_fallback(
    situation: SituationExtractionResponse,
    expected_phrase_code: str,
    output_locale: OutputLocale,
) -> None:
    workflow, _, _, _, plan = _workflow(situation=situation)

    response = asyncio.run(
        workflow.create(_request(output_locale=output_locale))
    )
    catalog = get_action_plan_catalog(output_locale)

    assert plan.contexts[0].allowed_codes.local_phrases == [
        expected_phrase_code
    ]
    assert response.output_locale == output_locale
    assert response.plan.local_phrase.code == expected_phrase_code
    assert response.plan.local_phrase.language == (
        "ca" if expected_phrase_code.startswith("catalan_") else "es"
    )
    assert response.plan.now.actions[0].text == catalog.now_actions[
        response.plan.now.actions[0].code
    ][0]
    assert response.plan.notice == catalog.normal_notice


@pytest.mark.parametrize(
    ("current_c", "maximum_c", "expected_result"),
    [
        (39.9, 39.9, True),
        (39.9, 40.0, False),
        (39.9, 40.1, False),
        (40.0, 39.9, "incoherent"),
        (40.0, 40.0, False),
        (40.0, 40.1, False),
        (40.1, 39.9, "incoherent"),
        (40.1, 40.0, "incoherent"),
        (40.1, 40.1, False),
    ],
)
def test_fan_only_cooling_requires_current_and_daily_max_strictly_below_40c(
    current_c: float,
    maximum_c: float,
    expected_result: bool | str,
) -> None:
    situation = _situation(
        cooling_access={"status": "reported", "value": "fan_only"}
    )
    workflow, _, _, _, plan = _workflow(
        situation=situation,
        weather_service=FakeWeatherService(
            _weather(current_c=current_c, maximum_c=maximum_c)
        ),
    )

    if expected_result == "incoherent":
        with pytest.raises(ActionPlanWorkflowUnavailable):
            asyncio.run(workflow.create(_request()))
        assert plan.contexts == []
        return

    asyncio.run(workflow.create(_request()))

    assert (
        "use_available_home_cooling" in plan.contexts[0].allowed_codes.now
    ) is expected_result


def test_air_conditioning_remains_allowed_at_or_above_fan_boundary() -> None:
    situation = _situation(
        cooling_access={"status": "reported", "value": "air_conditioning"}
    )
    workflow, _, _, _, plan = _workflow(
        situation=situation,
        weather_service=FakeWeatherService(
            _weather(current_c=40.1, maximum_c=40.1)
        ),
    )

    asyncio.run(workflow.create(_request()))

    assert "use_available_home_cooling" in plan.contexts[0].allowed_codes.now


@pytest.mark.parametrize(
    ("current_c", "maximum_c"),
    [(39.9, 40.0), (40.0, 40.0), (40.1, 40.1)],
)
def test_fan_boundary_rejects_malicious_home_cooling_output(
    current_c: float,
    maximum_c: float,
) -> None:
    situation = _situation(
        cooling_access={"status": "reported", "value": "fan_only"}
    )

    def unsafe_fan_plan(context: GroundedPlanContext) -> ModelGroundedPlan:
        payload = _valid_plan(context).model_dump(mode="json")
        now = set(payload["now"]["action_codes"])
        now.add("use_available_home_cooling")
        payload["now"] = {
            "action_codes": [code for code in NOW_ACTION_TEXT if code in now]
        }
        return ModelGroundedPlan.model_validate(payload)

    workflow, _, _, _, _ = _workflow(
        situation=situation,
        weather_service=FakeWeatherService(
            _weather(current_c=current_c, maximum_c=maximum_c)
        ),
        plan_service=FakePlanService(plan_factory=unsafe_fan_plan),
    )

    with pytest.raises(GroundedPlanInvalidResponse):
        asyncio.run(workflow.create(_request()))


def test_living_alone_cannot_invent_household_members_action() -> None:
    situation = _situation(
        vulnerability_factors={"status": "reported", "values": ["living_alone"]}
    )

    def invented_household_action(context: GroundedPlanContext) -> ModelGroundedPlan:
        payload = _valid_plan(context).model_dump(mode="json")
        payload["next_few_hours"] = {
            "action_codes": [
                "keep_drinking_water",
                "check_on_household_members",
            ]
        }
        return ModelGroundedPlan.model_validate(payload)

    plan = FakePlanService(plan_factory=invented_household_action)
    workflow, _, _, _, _ = _workflow(
        situation=situation,
        plan_service=plan,
    )

    with pytest.raises(GroundedPlanInvalidResponse):
        asyncio.run(workflow.create(_request()))

    assert "check_on_household_members" not in (
        plan.contexts[0].allowed_codes.next_few_hours
    )


def test_reported_young_child_allows_fixed_household_check_action() -> None:
    situation = _situation(
        vulnerability_factors={
            "status": "reported",
            "values": ["young_child_in_household"],
        }
    )
    workflow, _, _, _, plan = _workflow(situation=situation)

    asyncio.run(workflow.create(_request()))

    assert "check_on_household_members" in (
        plan.contexts[0].allowed_codes.next_few_hours
    )


@pytest.mark.parametrize("ineligible_accessibility", [False, None])
def test_accessibility_requirement_filters_false_and_null_fail_closed(
    ineligible_accessibility: bool | None,
) -> None:
    situation = _situation(
        mobility_constraints={
            "status": "reported",
            "values": ["wheelchair_access_required"],
        }
    )
    ineligible = _candidate(
        "bcn-102",
        accessibility=ineligible_accessibility,
        distance_m=20,
    )
    eligible = _candidate(
        "bcn-103",
        accessibility=True,
        distance_m=40,
    )
    repository = FakeRepository([ineligible, eligible])
    workflow, _, _, _, plan = _workflow(
        situation=situation,
        repository=repository,
    )

    response = asyncio.run(workflow.create(_request()))

    assert repository.calls[0][1] is True
    assert plan.contexts[0].candidates == []
    assert plan.contexts[0].travel_compatibility_unproven is True
    assert response.selected_place is None
    assert response.candidate_context.eligible_candidate_count == 0
    assert TRAVEL_COMPATIBILITY_UNPROVEN_NOTICE in response.notices


def test_only_false_and_null_accessibility_produces_empty_candidates() -> None:
    situation = _situation(
        mobility_constraints={
            "status": "reported",
            "values": ["step_free_access_required"],
        }
    )
    repository = FakeRepository(
        [
            _candidate("bcn-104", accessibility=False),
            _candidate("bcn-105", accessibility=None),
        ]
    )
    workflow, _, _, _, plan = _workflow(
        situation=situation,
        repository=repository,
    )

    response = asyncio.run(workflow.create(_request()))

    assert response.branch == "normal"
    assert response.selected_place is None
    assert response.candidate_context.eligible_candidate_count == 0
    assert plan.contexts[0].candidates == []


@pytest.mark.parametrize(
    "situation",
    [
        _situation(
            mobility_constraints={
                "status": "reported",
                "values": ["cannot_leave_current_location"],
            }
        ),
        _situation(
            time_constraints={
                "status": "reported",
                "values": ["cannot_leave_now"],
            }
        ),
    ],
    ids=["cannot-leave-location", "cannot-leave-now"],
)
def test_movement_prohibition_removes_all_place_and_travel_output(
    situation: SituationExtractionResponse,
) -> None:
    workflow, _, _, _, plan = _workflow(situation=situation)

    response = asyncio.run(workflow.create(_request()))
    catalog = get_action_plan_catalog("en")

    assert response.branch == "normal"
    assert response.selected_place is None
    assert response.candidate_context.eligible_candidate_count == 0
    assert (
        response.candidate_context.explanation
        == catalog.candidate_explanations["movement_prohibited"]
        == MOVEMENT_PROHIBITED_EXPLANATION
    )
    context = plan.contexts[0]
    assert context.movement_prohibited is True
    assert context.candidates == []
    assert "travel_to_selected_place" not in context.allowed_codes.now
    assert "remain_at_current_location" in [
        action.code for action in response.plan.now.actions
    ]
    assert "unresolved_travel_constraint" in [
        reason.code for reason in response.plan.explanations
    ]
    assert (
        response.notices[-1]
        == catalog.unresolved_travel_notice
        == TRAVEL_COMPATIBILITY_UNPROVEN_NOTICE
    )


@pytest.mark.parametrize("constraint", TIME_CONSTRAINT_ORDER)
def test_every_reported_time_constraint_suppresses_immediate_travel(
    constraint: str,
) -> None:
    situation = _situation(
        time_constraints={"status": "reported", "values": [constraint]}
    )
    workflow, _, _, repository, plan = _workflow(situation=situation)

    response = asyncio.run(workflow.create(_request()))

    assert repository.calls
    context = plan.contexts[0]
    assert context.travel_compatibility_unproven is True
    assert context.candidates == []
    assert "travel_to_selected_place" not in context.allowed_codes.now
    assert "unresolved_travel_constraint" in (
        context.required_codes.explanation_reasons
    )
    assert response.selected_place is None
    assert response.plan.bring_items == []
    assert response.plan.local_phrase is None
    assert TRAVEL_COMPATIBILITY_UNPROVEN_NOTICE in response.notices


@pytest.mark.parametrize("constraint", TIME_CONSTRAINT_ORDER)
def test_every_reported_time_constraint_rejects_malicious_travel(
    constraint: str,
) -> None:
    situation = _situation(
        time_constraints={"status": "reported", "values": [constraint]}
    )
    workflow, _, _, _, _ = _workflow(
        situation=situation,
        plan_service=FakePlanService(plan_factory=_malicious_travel_plan),
    )

    with pytest.raises(GroundedPlanInvalidResponse):
        asyncio.run(workflow.create(_request()))


def test_multiple_reported_time_constraints_remain_fail_closed() -> None:
    situation = _situation(
        time_constraints={
            "status": "reported",
            "values": ["daytime_only", "must_return_by_deadline", "work_schedule"],
        }
    )
    workflow, _, _, _, plan = _workflow(situation=situation)

    response = asyncio.run(workflow.create(_request()))

    assert plan.contexts[0].travel_compatibility_unproven is True
    assert plan.contexts[0].candidates == []
    assert response.selected_place is None


@pytest.mark.parametrize(
    ("mobility_status", "time_status"),
    [
        ("unknown", "not_stated"),
        ("not_stated", "unknown"),
        ("unknown", "unknown"),
    ],
    ids=["unknown-mobility", "unknown-time", "both-unknown"],
)
def test_explicitly_unknown_travel_facts_suppress_all_travel_output(
    mobility_status: str,
    time_status: str,
) -> None:
    situation = _situation(
        mobility_constraints={"status": mobility_status, "values": []},
        time_constraints={"status": time_status, "values": []},
    )
    workflow, _, _, _, plan_service = _workflow(situation=situation)

    response = asyncio.run(workflow.create(_request()))
    catalog = get_action_plan_catalog("en")

    context = plan_service.contexts[0]
    assert context.travel_compatibility_unproven is True
    assert context.movement_prohibited is False
    assert context.candidates == []
    assert response.selected_place is None
    assert response.candidate_context.explanation == (
        catalog.candidate_explanations["unresolved_travel_compatibility"]
    )
    assert response.plan.bring_items == []
    assert response.plan.local_phrase is None
    assert "unresolved_travel_constraint" in [
        reason.code for reason in response.plan.explanations
    ]
    assert (
        response.notices[-1]
        == catalog.unresolved_travel_notice
        == TRAVEL_COMPATIBILITY_UNPROVEN_NOTICE
    )


@pytest.mark.parametrize(
    ("mobility_status", "time_status"),
    [
        ("not_stated", "not_stated"),
        ("explicit_none", "not_stated"),
        ("not_stated", "explicit_none"),
        ("explicit_none", "explicit_none"),
    ],
)
def test_nonmissing_no_constraint_statuses_preserve_travel_eligibility(
    mobility_status: str,
    time_status: str,
) -> None:
    situation = _situation(
        mobility_constraints={"status": mobility_status, "values": []},
        time_constraints={"status": time_status, "values": []},
    )
    workflow, _, _, _, plan_service = _workflow(situation=situation)

    response = asyncio.run(workflow.create(_request()))

    assert plan_service.contexts[0].travel_compatibility_unproven is False
    assert response.selected_place is not None
    assert "travel_to_selected_place" in [
        action.code for action in response.plan.now.actions
    ]


@pytest.mark.parametrize(
    ("mobility_status", "time_status"),
    [("unknown", "not_stated"), ("not_stated", "unknown"), ("unknown", "unknown")],
)
def test_unknown_travel_facts_reject_malicious_model_travel(
    mobility_status: str,
    time_status: str,
) -> None:
    situation = _situation(
        mobility_constraints={"status": mobility_status, "values": []},
        time_constraints={"status": time_status, "values": []},
    )
    workflow, _, _, _, _ = _workflow(
        situation=situation,
        plan_service=FakePlanService(plan_factory=_malicious_travel_plan),
    )

    with pytest.raises(GroundedPlanInvalidResponse):
        asyncio.run(workflow.create(_request()))


@pytest.mark.parametrize("constraint", MOBILITY_ORDER)
def test_every_reported_mobility_constraint_suppresses_unproven_travel(
    constraint: str,
) -> None:
    situation = _situation(
        mobility_constraints={"status": "reported", "values": [constraint]}
    )
    workflow, _, _, repository, plan = _workflow(situation=situation)

    response = asyncio.run(workflow.create(_request()))

    context = plan.contexts[0]
    assert context.travel_compatibility_unproven is True
    assert context.candidates == []
    assert response.selected_place is None
    assert TRAVEL_COMPATIBILITY_UNPROVEN_NOTICE in response.notices
    assert repository.calls[0][1] is (
        constraint in {"wheelchair_access_required", "step_free_access_required"}
    )


def test_cannot_travel_alone_requires_support_action_but_suppresses_travel() -> None:
    situation = _situation(
        mobility_constraints={
            "status": "reported",
            "values": ["cannot_travel_alone"],
        }
    )
    workflow, _, _, _, plan = _workflow(situation=situation)

    response = asyncio.run(workflow.create(_request()))

    assert response.branch == "normal"
    context = plan.contexts[0]
    assert context.travel_support_required is True
    assert context.travel_compatibility_unproven is True
    assert context.candidates == []
    action_codes = [action.code for action in response.plan.now.actions]
    assert "contact_support_person" in action_codes
    assert "travel_to_selected_place" not in action_codes
    assert response.selected_place is None


def test_cannot_travel_alone_rejects_malicious_travel_output() -> None:
    situation = _situation(
        mobility_constraints={
            "status": "reported",
            "values": ["cannot_travel_alone"],
        }
    )

    def unsafe_plan(context: GroundedPlanContext) -> ModelGroundedPlan:
        reasons = set(context.required_codes.explanation_reasons)
        reasons.add("verified_open_candidate")
        return ModelGroundedPlan.model_validate(
            {
                "now": {
                    "action_codes": [
                        "move_to_cooler_space",
                        "reduce_physical_effort",
                        "drink_water",
                        "contact_support_person",
                        "travel_to_selected_place",
                    ]
                },
                "next_few_hours": {
                    "action_codes": list(context.required_codes.next_few_hours)
                },
                "tonight": {
                    "action_codes": list(context.required_codes.tonight)
                },
                "bring_items": ["water", "phone"],
                "explanation_reasons": [
                    code for code in EXPLANATION_REASON_ORDER if code in reasons
                ],
                "local_phrase_code": "spanish_request_cool_space",
                "selected_place_id": "bcn-101",
            }
        )

    workflow, _, _, _, _ = _workflow(
        situation=situation,
        plan_service=FakePlanService(plan_factory=unsafe_plan),
    )

    with pytest.raises(GroundedPlanInvalidResponse):
        asyncio.run(workflow.create(_request()))


def test_empty_candidate_result_is_valid_and_never_invents_a_place() -> None:
    workflow, _, _, _, plan = _workflow(repository=FakeRepository([]))

    response = asyncio.run(workflow.create(_request()))
    catalog = get_action_plan_catalog("en")

    assert response.branch == "normal"
    assert response.selected_place is None
    assert response.candidate_context.eligible_candidate_count == 0
    assert response.candidate_context.explanation == (
        catalog.candidate_explanations["no_candidate"]
    )
    assert plan.contexts[0].candidates == []
    assert "travel_to_selected_place" not in [
        action.code for action in response.plan.now.actions
    ]


@pytest.mark.parametrize("seconds_from_evaluation", [-1, 0])
def test_workflow_rejects_stale_or_closing_boundary_candidates(
    seconds_from_evaluation: int,
) -> None:
    candidate = _candidate(
        closes_at=FIXED_UTC + timedelta(seconds=seconds_from_evaluation)
    )
    workflow, _, _, _, plan = _workflow(
        repository=FakeRepository([candidate])
    )

    response = asyncio.run(workflow.create(_request()))

    assert response.branch == "normal"
    assert response.selected_place is None
    assert response.candidate_context.eligible_candidate_count == 0
    assert plan.contexts[0].candidates == []


def test_duplicate_candidate_ids_fail_before_truncation_or_plan_generation() -> None:
    duplicate = _candidate("bcn-106")
    duplicate_candidates = [
        _candidate("bcn-1", distance_m=10),
        _candidate("bcn-2", distance_m=20),
        _candidate("bcn-3", distance_m=30),
        duplicate,
        duplicate,
    ]
    repository = FakeRepository([])
    repository.response = PlacesCandidatesResponse.model_construct(
        candidates=duplicate_candidates,
        snapshot=_snapshot(),
        explanation="Synthetic adversarial duplicates.",
        hours_warning=(
            "Municipal opening hours may change; check the official source before travel."
        ),
        candidate_notice=(
            "These are factual, backend-approved candidate places, not medical recommendations."
        ),
    )
    workflow, _, _, _, plan = _workflow(repository=repository)

    with pytest.raises(PlaceDataError, match="candidate IDs are not unique"):
        asyncio.run(workflow.create(_request()))

    assert plan.contexts == []


def test_more_than_three_adversarial_candidates_are_sorted_and_bounded() -> None:
    repository = FakeRepository(
        [
            _candidate("bcn-4", distance_m=400),
            _candidate("bcn-2", distance_m=200),
            _candidate("bcn-3", distance_m=300),
            _candidate("bcn-1", distance_m=100),
        ]
    )
    workflow, _, _, _, plan = _workflow(repository=repository)

    response = asyncio.run(workflow.create(_request()))

    assert [candidate.place_id for candidate in plan.contexts[0].candidates] == [
        "bcn-1",
        "bcn-2",
        "bcn-3",
    ]
    assert response.candidate_context.eligible_candidate_count == 3


@pytest.mark.parametrize(
    "candidate",
    [
        pytest.param(_candidate(distance_m=3_001), id="beyond-request-distance"),
        pytest.param(
            _candidate(closes_at=FIXED_UTC - timedelta(seconds=1)),
            id="stale",
        ),
        pytest.param(_candidate(closes_at=FIXED_UTC), id="closing-boundary"),
    ],
)
def test_adversarial_repository_candidate_is_safely_filtered(
    candidate: CandidatePlace,
) -> None:
    workflow, _, _, _, plan = _workflow(
        repository=FakeRepository([candidate])
    )

    response = asyncio.run(workflow.create(_request()))

    assert plan.contexts[0].candidates == []
    assert response.selected_place is None
    assert response.candidate_context.eligible_candidate_count == 0


def test_missing_candidate_closing_time_fails_before_plan_generation() -> None:
    workflow, _, _, _, plan = _workflow(
        repository=FakeRepository([_candidate(missing_closes_at=True)])
    )

    with pytest.raises(PlaceDataError, match="candidate response validation failed"):
        asyncio.run(workflow.create(_request()))

    assert plan.contexts == []


def test_forged_near_zero_distance_for_far_candidate_fails_closed() -> None:
    far_candidate = _candidate().model_copy(
        update={
            "latitude": 41.6,
            "longitude": 1.9,
            "distance_m": 1,
        }
    )
    assert haversine_distance_m(
        BARCELONA_ORIGIN["latitude"],
        BARCELONA_ORIGIN["longitude"],
        far_candidate.latitude,
        far_candidate.longitude,
    ) > 25_000
    repository = FakeRepository([])
    repository.response = _adversarial_place_response([far_candidate])
    workflow, _, _, _, plan = _workflow(repository=repository)

    with pytest.raises(PlaceDataError, match="distance is inconsistent"):
        asyncio.run(workflow.create(_request()))

    assert plan.contexts == []


@pytest.mark.parametrize(
    ("candidate_updates", "snapshot_updates"),
    [
        ({"distance_m": -1}, {}),
        ({"latitude": float("nan")}, {}),
        ({"longitude": float("inf")}, {}),
        ({"place_id": "bcn-999", "source_record_id": "101"}, {}),
        ({"information_url": "javascript:alert(1)"}, {}),
        ({"information_url": "file:///tmp/private"}, {}),
        ({"source_url": "https://example.test/forged"}, {}),
        ({}, {"dataset_url": "javascript:alert(1)"}),
        ({}, {"distribution_url": "file:///tmp/private"}),
        ({}, {"license_url": "https://user:pass@example.test/license"}),
        ({}, {"normalized_sha256": "BAD"}),
        ({}, {"publisher": "Synthetic unapproved publisher"}),
        ({}, {"dataset_url": "https://example.test/unapproved"}),
        ({}, {"snapshot_id": "arbitrary-well-formed-snapshot"}),
        ({}, {"attribution": "Arbitrary well-formed attribution"}),
        ({}, {"normalized_sha256": "b" * 64}),
        (
            {},
            {"retrieved_at": datetime(2026, 7, 19, tzinfo=timezone.utc)},
        ),
        (
            {},
            {
                "upstream_max_modified": datetime(
                    2026,
                    7,
                    8,
                    tzinfo=timezone.utc,
                )
            },
        ),
        (
            {
                "source_modified_at": datetime(
                    2026,
                    7,
                    10,
                    tzinfo=timezone.utc,
                )
            },
            {},
        ),
        ({"last_checked": date(2026, 7, 15)}, {}),
    ],
    ids=[
        "negative-distance",
        "nan-latitude",
        "infinite-longitude",
        "identifier-pair",
        "javascript-information-url",
        "file-information-url",
        "candidate-source-mismatch",
        "javascript-dataset-url",
        "file-distribution-url",
        "credential-license-url",
        "malformed-hash",
        "unapproved-publisher",
        "unapproved-dataset",
        "well-formed-snapshot-id",
        "well-formed-attribution",
        "well-formed-sha",
        "arbitrary-retrieval-time",
        "arbitrary-upstream-time",
        "source-newer-than-upstream",
        "last-checked-mismatch",
    ],
)
def test_adversarial_candidate_and_provenance_fail_before_plan_generation(
    candidate_updates: dict[str, Any],
    snapshot_updates: dict[str, Any],
) -> None:
    candidate = _candidate().model_copy(update=candidate_updates)
    snapshot = _snapshot().model_copy(update=snapshot_updates)
    repository = FakeRepository([])
    repository.response = _adversarial_place_response(
        [candidate],
        snapshot=snapshot,
    )
    workflow, _, _, _, plan = _workflow(repository=repository)

    with pytest.raises(PlaceDataError):
        asyncio.run(workflow.create(_request()))

    assert plan.contexts == []


def test_extraction_failure_short_circuits_clock_weather_places_and_plan() -> None:
    clock_calls = 0

    def clock() -> datetime:
        nonlocal clock_calls
        clock_calls += 1
        return FIXED_UTC

    error = RuntimeError("synthetic extraction failure")
    workflow, situation, weather, repository, plan = _workflow(
        situation_error=error,
        utc_now=clock,
    )

    with pytest.raises(RuntimeError, match="synthetic extraction failure"):
        asyncio.run(workflow.create(_request()))

    assert len(situation.requests) == 1
    assert clock_calls == 0
    assert weather.requests == []
    assert repository.calls == []
    assert plan.contexts == []


def test_invalid_server_clock_has_dedicated_sanitized_failure() -> None:
    workflow, situation, weather, repository, plan = _workflow(
        utc_now=lambda: datetime(2026, 7, 20, 8, 0),
    )

    with pytest.raises(ActionPlanWorkflowUnavailable):
        asyncio.run(workflow.create(_request()))

    assert len(situation.requests) == 1
    assert weather.requests == []
    assert repository.calls == []
    assert plan.contexts == []


def test_evaluation_clock_is_captured_only_after_extraction_completes() -> None:
    events: list[str] = []

    def clock() -> datetime:
        events.append("clock")
        return FIXED_UTC

    workflow, situation, _, _, _ = _workflow(utc_now=clock)
    original_extract = situation.extract

    async def observed_extract(
        request: SituationExtractionRequest,
    ) -> SituationExtractionResponse:
        events.append("extraction-start")
        response = await original_extract(request)
        events.append("extraction-complete")
        return response

    situation.extract = observed_extract  # type: ignore[method-assign]

    asyncio.run(workflow.create(_request()))

    assert events == ["extraction-start", "extraction-complete", "clock"]


@pytest.mark.parametrize(
    "weather",
    [
        pytest.param(_weather(day=date(2026, 7, 19)), id="wrong-local-date"),
        pytest.param(
            _weather(timezone_name="America/New_York"),
            id="wrong-timezone",
        ),
        pytest.param(
            _weather(
                observed_at=datetime(
                    2026,
                    7,
                    19,
                    23,
                    59,
                    tzinfo=ZoneInfo("Europe/Madrid"),
                )
            ),
            id="current-date-mismatch",
        ),
        pytest.param(
            _weather(
                observed_at=datetime(
                    2026,
                    7,
                    20,
                    6,
                    0,
                    tzinfo=ZoneInfo("America/New_York"),
                )
            ),
            id="current-offset-incompatible-with-madrid",
        ),
    ],
)
def test_weather_calendar_or_timezone_incoherence_fails_before_places_and_plan(
    weather: WeatherContextResponse,
) -> None:
    weather_service = FakeWeatherService(weather)
    workflow, _, _, repository, plan = _workflow(
        weather_service=weather_service,
    )

    with pytest.raises(ActionPlanWorkflowUnavailable):
        asyncio.run(workflow.create(_request()))

    assert len(weather_service.requests) == 1
    assert repository.calls == []
    assert plan.contexts == []


@pytest.mark.parametrize(
    ("observed_delta", "expected_valid"),
    [
        (timedelta(minutes=-90), True),
        (timedelta(minutes=-90, seconds=-1), False),
        (timedelta(minutes=5), True),
        (timedelta(minutes=5, seconds=1), False),
    ],
    ids=[
        "age-90-minutes",
        "age-90-minutes-plus-one-second",
        "future-skew-five-minutes",
        "future-skew-five-minutes-plus-one-second",
    ],
)
def test_weather_observation_age_and_future_skew_boundaries(
    observed_delta: timedelta,
    expected_valid: bool,
) -> None:
    observed_at = (FIXED_UTC + observed_delta).astimezone(
        ZoneInfo("Europe/Madrid")
    )
    workflow, _, _, repository, plan = _workflow(
        weather_service=FakeWeatherService(
            _weather(observed_at=observed_at, retrieved_at=FIXED_UTC)
        )
    )

    if expected_valid:
        response = asyncio.run(workflow.create(_request()))
        assert response.branch == "normal"
        assert repository.calls
        assert plan.contexts
    else:
        with pytest.raises(ActionPlanWorkflowUnavailable):
            asyncio.run(workflow.create(_request()))
        assert repository.calls == []
        assert plan.contexts == []


@pytest.mark.parametrize(
    ("retrieval_delta", "expected_valid"),
    [
        (timedelta(seconds=-1), False),
        (timedelta(seconds=WEATHER_TIMEOUT_SECONDS + 1), True),
        (timedelta(seconds=WEATHER_TIMEOUT_SECONDS + 2), False),
    ],
    ids=["before-evaluation", "request-window-boundary", "beyond-request-window"],
)
def test_weather_retrieval_window_boundaries(
    retrieval_delta: timedelta,
    expected_valid: bool,
) -> None:
    retrieved_at = FIXED_UTC + retrieval_delta
    workflow, _, _, repository, plan = _workflow(
        weather_service=FakeWeatherService(
            _weather(
                retrieved_at=retrieved_at,
                observed_at=FIXED_UTC.astimezone(ZoneInfo("Europe/Madrid")),
            )
        )
    )

    if expected_valid:
        asyncio.run(workflow.create(_request()))
        assert repository.calls
        assert plan.contexts
    else:
        with pytest.raises(ActionPlanWorkflowUnavailable):
            asyncio.run(workflow.create(_request()))
        assert repository.calls == []
        assert plan.contexts == []


@pytest.mark.parametrize(
    "weather",
    [
        pytest.param(_weather(current_c=45.0, maximum_c=20.0), id="temperature"),
        pytest.param(
            _weather(apparent_current_c=45.0, apparent_maximum_c=20.0),
            id="apparent-temperature",
        ),
    ],
)
def test_current_above_same_day_maximum_fails_before_priority(
    weather: WeatherContextResponse,
) -> None:
    workflow, _, _, repository, plan = _workflow(
        weather_service=FakeWeatherService(weather)
    )

    with pytest.raises(ActionPlanWorkflowUnavailable):
        asyncio.run(workflow.create(_request()))

    assert repository.calls == []
    assert plan.contexts == []


@pytest.mark.parametrize("invalid_value", [float("nan"), float("inf")])
def test_bypassed_nonfinite_weather_fails_before_priority(
    invalid_value: float,
) -> None:
    weather = _weather()
    bypassed_current = weather.current.model_copy(
        update={"temperature_c": invalid_value}
    )
    bypassed_weather = weather.model_copy(update={"current": bypassed_current})
    workflow, _, _, repository, plan = _workflow(
        weather_service=FakeWeatherService(bypassed_weather)
    )

    with pytest.raises(ActionPlanWorkflowUnavailable):
        asyncio.run(workflow.create(_request()))

    assert repository.calls == []
    assert plan.contexts == []


@pytest.mark.parametrize(
    ("evaluation_time", "weather_day"),
    [
        (
            datetime(2026, 7, 20, 21, 59, tzinfo=timezone.utc),
            date(2026, 7, 20),
        ),
        (
            datetime(2026, 7, 20, 22, 1, tzinfo=timezone.utc),
            date(2026, 7, 21),
        ),
    ],
)
def test_barcelona_near_midnight_uses_one_coherent_local_calendar_date(
    evaluation_time: datetime,
    weather_day: date,
) -> None:
    workflow, _, _, repository, _ = _workflow(
        weather_service=FakeWeatherService(
            _weather(
                day=weather_day,
                observed_at=evaluation_time.astimezone(
                    ZoneInfo("Europe/Madrid")
                ),
                retrieved_at=evaluation_time,
            )
        ),
        utc_now=lambda: evaluation_time,
    )

    response = asyncio.run(workflow.create(_request()))

    assert response.evaluation_time == evaluation_time
    assert response.weather.today.date == weather_day
    assert repository.calls[0][0].evaluation_datetime == evaluation_time


def test_barcelona_dst_transition_uses_aware_coherent_timestamps() -> None:
    evaluation_time = datetime(2026, 10, 25, 1, 30, tzinfo=timezone.utc)
    madrid_observed_at = evaluation_time.astimezone(ZoneInfo("Europe/Madrid"))
    repository = FakeRepository([])
    workflow, _, _, _, _ = _workflow(
        weather_service=FakeWeatherService(
            _weather(
                day=date(2026, 10, 25),
                observed_at=madrid_observed_at,
                retrieved_at=evaluation_time,
            )
        ),
        repository=repository,
        utc_now=lambda: evaluation_time,
    )

    response = asyncio.run(workflow.create(_request()))

    assert madrid_observed_at.utcoffset() == timedelta(hours=1)
    assert response.evaluation_time == evaluation_time
    assert response.weather.current.observed_at.astimezone(
        timezone.utc
    ) == evaluation_time
    assert response.weather.current.observed_at.utcoffset() == timedelta(hours=1)
    assert response.weather.today.date == date(2026, 10, 25)
    assert repository.calls[0][0].evaluation_datetime == evaluation_time


def test_cross_midnight_previous_day_weather_is_rejected_without_partial_plan() -> None:
    evaluation_time = datetime(2026, 7, 20, 22, 1, tzinfo=timezone.utc)
    workflow, _, _, repository, plan = _workflow(
        weather_service=FakeWeatherService(
            _weather(day=date(2026, 7, 20))
        ),
        utc_now=lambda: evaluation_time,
    )

    with pytest.raises(ActionPlanWorkflowUnavailable):
        asyncio.run(workflow.create(_request()))

    assert repository.calls == []
    assert plan.contexts == []


@pytest.mark.parametrize(
    ("stage", "error_type"),
    [
        ("weather", WeatherUnavailable),
        ("places", PlaceDataError),
        ("plan", GroundedPlanUnavailable),
    ],
)
def test_required_stage_failures_propagate_without_partial_plan(
    stage: str,
    error_type: type[Exception],
) -> None:
    weather = FakeWeatherService(
        _weather(),
        error=WeatherUnavailable() if stage == "weather" else None,
    )
    repository = FakeRepository(
        [_candidate()],
        error=PlaceDataError("synthetic") if stage == "places" else None,
    )
    plan = FakePlanService(
        error=GroundedPlanUnavailable() if stage == "plan" else None
    )
    workflow, _, _, _, _ = _workflow(
        weather_service=weather,
        repository=repository,
        plan_service=plan,
    )

    with pytest.raises(error_type):
        asyncio.run(workflow.create(_request()))

    if stage == "weather":
        assert repository.calls == []
        assert plan.contexts == []
    elif stage == "places":
        assert plan.contexts == []


def test_second_call_context_excludes_raw_text_origin_and_candidate_identity() -> None:
    candidate = _candidate()
    plan = FakePlanService()
    workflow, _, _, _, _ = _workflow(
        repository=FakeRepository([candidate]),
        plan_service=plan,
    )

    asyncio.run(workflow.create(_request()))

    serialized = plan.contexts[0].model_dump_json()
    assert SYNTHETIC_TEXT not in serialized
    assert str(BARCELONA_ORIGIN["latitude"]) not in serialized
    assert str(BARCELONA_ORIGIN["longitude"]) not in serialized
    assert candidate.name not in serialized
    assert candidate.address.street not in serialized
    assert candidate.information_url not in serialized
    assert candidate.source_url not in serialized
    assert "latitude" not in serialized
    assert "longitude" not in serialized
    assert "address" not in serialized
    assert "source_url" not in serialized
    assert candidate.place_id in serialized


def test_output_locale_does_not_change_downstream_or_model_visible_context() -> None:
    default_workflow, default_situation, default_weather, default_repository, default_plan = (
        _workflow()
    )
    default_response = asyncio.run(default_workflow.create(_request()))
    runs = {}
    for output_locale in SUPPORTED_OUTPUT_LOCALES:
        workflow, situation_service, weather, repository, plan = _workflow()
        response = asyncio.run(
            workflow.create(_request(output_locale=output_locale))
        )
        runs[output_locale] = (
            response,
            situation_service,
            weather,
            repository,
            plan,
        )

    assert default_response.output_locale == "en"
    english_response, english_situation, english_weather, english_repository, english_plan = (
        runs["en"]
    )
    assert english_response.output_locale == "en"
    for output_locale, (
        response,
        situation_service,
        weather,
        repository,
        plan,
    ) in runs.items():
        assert response.output_locale == output_locale
        assert situation_service.requests == english_situation.requests
        assert weather.requests == english_weather.requests
        assert repository.calls == english_repository.calls
        assert plan.contexts == english_plan.contexts
    assert default_situation.requests == english_situation.requests
    assert default_weather.requests == english_weather.requests
    assert default_repository.calls == english_repository.calls
    assert default_plan.contexts == english_plan.contexts

    context = english_plan.contexts[0]
    visible_request = grounded_model_visible_request(context)
    catalog_prose = {
        prose
        for locale in SUPPORTED_OUTPUT_LOCALES
        for prose in _catalog_prose(get_action_plan_catalog(locale))
    }
    serialized_visible_request = json.dumps(
        visible_request,
        ensure_ascii=False,
        sort_keys=True,
    )
    assert visible_request == grounded_model_visible_request(default_plan.contexts[0])
    visible_request_bytes = json.dumps(
        visible_request,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    for _, _, _, _, plan in runs.values():
        locale_visible_request = grounded_model_visible_request(
            plan.contexts[0]
        )
        assert locale_visible_request == visible_request
        assert json.dumps(
            locale_visible_request,
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
        ).encode("utf-8") == visible_request_bytes
    assert "output_locale" not in serialized_visible_request
    assert all(prose not in serialized_visible_request for prose in catalog_prose)
    assert "output_locale" not in context.model_dump()
    assert "input_language_source" not in json.dumps(
        visible_request,
        sort_keys=True,
    )
    assert "input_language_source" not in context.model_dump()
    assert "interface_locale" not in json.dumps(visible_request, sort_keys=True)
    assert "text_direction" not in json.dumps(visible_request, sort_keys=True)
    assert context.situation.detected_input_language == "en"
    assert context.situation.preferred_language.status == "not_stated"
    assert not hasattr(english_situation.requests[0], "output_locale")
    assert not hasattr(english_weather.requests[0], "output_locale")
    assert not hasattr(english_repository.calls[0][0], "output_locale")
    english_downstream_payloads = [
        english_situation.requests[0].model_dump_json(),
        english_weather.requests[0].model_dump_json(),
        english_repository.calls[0][0].model_dump_json(),
    ]
    for _, situation_service, weather, repository, _ in runs.values():
        assert not hasattr(situation_service.requests[0], "output_locale")
        assert not hasattr(weather.requests[0], "output_locale")
        assert not hasattr(repository.calls[0][0], "output_locale")
        assert [
            situation_service.requests[0].model_dump_json(),
            weather.requests[0].model_dump_json(),
            repository.calls[0][0].model_dump_json(),
        ] == english_downstream_payloads
    assert all(
        "output_locale" not in payload
        and all(prose not in payload for prose in catalog_prose)
        for payload in english_downstream_payloads
    )


@pytest.mark.parametrize(
    "output_locale",
    [
        "AR",
        "Ar",
        "ar-SA",
        "ar-EG",
        "ar-001",
        "ara",
        "UR",
        "Ur",
        "ur-PK",
        "ur-IN",
        "urd",
        " ur",
        "ur ",
        "FA",
        "Fa",
        "fa-IR",
        "fa-AF",
        "fas",
        "per",
        " fa",
        "fa ",
        "HE",
        "He",
        "he-IL",
        "heb",
        " he",
        "he ",
        "pt",
        "pt-br",
        "PT-BR",
        "Pt-BR",
        "pt-PT",
        "pt-AO",
        "pt-MZ",
        "pt-Latn-BR",
        "pt-BR-x-private",
        " pt-BR",
        "pt-BR ",
        "FR",
        "Fr",
        "fr-FR",
        "fr-CA",
        "fr-BE",
        "fr-CH",
        "fra",
        "IT",
        "It",
        "it-IT",
        "it-CH",
        "ita",
        " fr",
        "fr ",
        " it",
        "it ",
        "DE",
        "De",
        "de-DE",
        "de-AT",
        "de-CH",
        "deu",
        "ger",
        " de",
        "de ",
        "NL",
        "Nl",
        "nl-NL",
        "nl-BE",
        "nld",
        "dut",
        " nl",
        "nl ",
        "RU",
        "Ru",
        "ru-RU",
        "ru-BY",
        "rus",
        " ru",
        "ru ",
        "UK",
        "Uk",
        "uk-UA",
        "uk-UK",
        "ukr",
        " uk",
        "uk ",
        "PL",
        "Pl",
        "pl-PL",
        "pol",
        " pl",
        "pl ",
        "JA",
        "Ja",
        "ja-JP",
        "jpn",
        " ja",
        "ja ",
        "KO",
        "Ko",
        "ko-KR",
        "kor",
        " ko",
        "ko ",
        "ID",
        "Id",
        "id-ID",
        "ind",
        " id",
        "id ",
        "VI",
        "Vi",
        "vi-VN",
        "vie",
        " vi",
        "vi ",
        "TH",
        "Th",
        "th-TH",
        "tha",
        " th",
        "th ",
        "TR",
        "Tr",
        "tr-TR",
        "tur",
        " tr",
        "tr ",
        "SW",
        "Sw",
        "sw-KE",
        "sw-TZ",
        "swa",
        " sw",
        "sw ",
    ],
)
def test_bypassed_unsupported_output_locale_fails_before_downstream_work(
    output_locale: str,
) -> None:
    workflow, situation, weather, repository, plan = _workflow()
    valid = _request()
    forged = ActionPlanRequest.model_construct(
        situation_text=valid.situation_text,
        origin=valid.origin,
        maximum_distance_m=valid.maximum_distance_m,
        output_locale=output_locale,
    )

    with pytest.raises(ActionPlanWorkflowUnavailable):
        asyncio.run(workflow.create(forged))

    assert situation.requests == []
    assert weather.requests == []
    assert repository.calls == []
    assert plan.contexts == []


def _first_matching_date(
    valid_from: date,
    valid_through: date,
    weekdays: list[str],
) -> date:
    candidate = valid_from
    while candidate <= valid_through:
        if candidate.strftime("%A").lower() in weekdays:
            return candidate
        candidate += timedelta(days=1)
    raise AssertionError("reviewed schedule has no matching weekday")


def test_workflow_preserves_exact_opening_and_closing_boundaries_from_snapshot() -> None:
    repository = PlaceRepository().load()
    retrieval_date = repository.provenance.retrieved_at.date()
    selected_schedule: tuple[Any, Any, Any, Any, date] | None = None
    for place in repository.snapshot.places:
        if place.opening_schedule is None:
            continue
        for season in place.opening_schedule.seasons:
            if season.valid_through < retrieval_date:
                continue
            for rule in season.weekly_rules:
                if not rule.intervals:
                    continue
                try:
                    matching_date = _first_matching_date(
                        max(
                            season.valid_from,
                            retrieval_date + timedelta(days=1),
                        ),
                        season.valid_through,
                        rule.weekdays,
                    )
                except AssertionError:
                    continue
                selected_schedule = (
                    place,
                    season,
                    rule,
                    rule.intervals[0],
                    matching_date,
                )
                break
            if selected_schedule is not None:
                break
        if selected_schedule is not None:
            break
    assert selected_schedule is not None
    target, season, rule, interval, matching_date = selected_schedule
    madrid = ZoneInfo("Europe/Madrid")
    opens_local = datetime.combine(
        matching_date,
        time.fromisoformat(interval.opens),
        tzinfo=madrid,
    )
    closes_date = matching_date
    if interval.closes <= interval.opens:
        closes_date += timedelta(days=1)
    closes_local = datetime.combine(
        closes_date,
        time.fromisoformat(interval.closes),
        tzinfo=madrid,
    )
    request = _request(
        origin={"latitude": target.latitude, "longitude": target.longitude},
        maximum_distance_m=100,
    )

    open_plan = FakePlanService()
    open_workflow, _, _, _, _ = _workflow(
        weather_service=FakeWeatherService(
            _weather(
                day=opens_local.date(),
                observed_at=opens_local,
                retrieved_at=opens_local.astimezone(timezone.utc),
            )
        ),
        repository=repository,
        plan_service=open_plan,
        utc_now=lambda: opens_local.astimezone(timezone.utc),
    )
    asyncio.run(open_workflow.create(request))

    close_plan = FakePlanService()
    close_workflow, _, _, _, _ = _workflow(
        weather_service=FakeWeatherService(
            _weather(
                day=closes_local.date(),
                observed_at=closes_local,
                retrieved_at=closes_local.astimezone(timezone.utc),
            )
        ),
        repository=repository,
        plan_service=close_plan,
        utc_now=lambda: closes_local.astimezone(timezone.utc),
    )
    asyncio.run(close_workflow.create(request))

    assert target.place_id in {
        candidate.place_id for candidate in open_plan.contexts[0].candidates
    }
    assert target.place_id not in {
        candidate.place_id for candidate in close_plan.contexts[0].candidates
    }


def test_workflow_test_module_never_reads_repository_env_file() -> None:
    """Keep an explicit guard against accidental credential coupling."""

    source = Path(__file__).read_text(encoding="utf-8")
    forbidden = ".env" + ".local"
    assert forbidden not in source
