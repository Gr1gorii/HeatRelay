"""Offline tests for the bounded, request-scoped grounded-plan adapter."""

from __future__ import annotations

import asyncio
import json
from datetime import datetime
from types import SimpleNamespace
from typing import Any

import httpx
import pytest
from openai import (
    APIConnectionError,
    APITimeoutError,
    AuthenticationError,
    BadRequestError,
    InternalServerError,
    PermissionDeniedError,
    RateLimitError,
)
from openai import AsyncOpenAI
from pydantic import ValidationError

from backend.app.grounded_plan import (
    GROUNDED_PLAN_INSTRUCTION,
    GROUNDED_PLAN_COST_CEILING_USD,
    GROUNDED_PLAN_MAX_OUTPUT_TOKENS,
    GROUNDED_PLAN_MAX_PAYLOAD_BYTES,
    GROUNDED_PLAN_MODEL,
    EXPLANATION_REASON_ORDER,
    AllowedPlanCodes,
    GroundedCandidateFacts,
    GroundedPlanContext,
    GroundedPlanInvalidResponse,
    GroundedPlanNotConfigured,
    GroundedPlanRefused,
    GroundedPlanService,
    GroundedPlanTimeout,
    GroundedPlanUnavailable,
    GroundedPriorityFacts,
    GroundedWeatherFacts,
    ModelGroundedPlan,
    ModelNextFewHoursPhase,
    ModelNowPhase,
    ModelTonightPhase,
    canonical_required_plan_codes,
    configured_cost_bound_usd,
    grounded_model_input,
    grounded_model_visible_request,
    grounded_payload_size_bytes,
    grounded_strict_response_format,
    serialize_grounded_context,
    validate_grounded_plan,
)
from backend.app.places import PlaceRepository
from backend.app.openai_runtime import (
    BoundedTaskCapacity,
    SHARED_OPENAI_CLIENT_CLEANUP_CAPACITY,
    SHARED_OPENAI_PROVIDER_CAPACITY,
)
from backend.app.situation import (
    ModelSituationExtraction,
    SituationExtractionRequest,
    SituationExtractionService,
    SituationExtractionTimeout,
)


def _profile() -> ModelSituationExtraction:
    return ModelSituationExtraction.model_validate(
        {
            "detected_input_language": "en",
            "preferred_language": {"status": "not_stated", "value": None},
            "vulnerability_factors": {
                "status": "reported",
                "values": ["older_adult"],
            },
            "mobility_constraints": {"status": "not_stated", "values": []},
            "cooling_access": {
                "status": "reported",
                "value": "no_home_cooling",
            },
            "housing_situation": {"status": "not_stated", "value": None},
            "time_constraints": {"status": "not_stated", "values": []},
            "reported_symptoms": {"status": "explicit_none", "values": []},
        }
    )


def _candidate(place_id: str = "bcn-101") -> GroundedCandidateFacts:
    return GroundedCandidateFacts(
        place_id=place_id,
        distance_m=425,
        closes_at=datetime.fromisoformat("2026-07-17T20:00:00+02:00"),
        accessibility=True,
        indoor_space=True,
        potable_water=True,
        toilets=None,
        micro_shelter=None,
        pets_allowed=None,
    )


def _context(
    *,
    candidates: list[GroundedCandidateFacts] | None = None,
    movement_prohibited: bool = False,
    travel_support_required: bool = False,
    travel_compatibility_unproven: bool = False,
    priority: str = "prepare_now",
) -> GroundedPlanContext:
    if candidates is None:
        candidates = [_candidate()]
    if movement_prohibited or travel_compatibility_unproven:
        candidates = []
    now = [
        "move_to_cooler_space",
        "reduce_physical_effort",
        "drink_water",
    ]
    if travel_support_required:
        now.append("contact_support_person")
    if movement_prohibited:
        now.append("remain_at_current_location")
    elif candidates:
        now.append("travel_to_selected_place")
    priority_reason = {
        "act_now": "forecast_at_or_above_36c",
        "prepare_now": "forecast_at_or_above_34c",
        "monitor_and_prepare": "baseline_monitoring",
    }[priority]
    reason_positions = {
        code: index for index, code in enumerate(EXPLANATION_REASON_ORDER)
    }
    allowed_reasons = [
        priority_reason,
        *(["verified_open_candidate"] if candidates else []),
        *(["travel_support_required"] if travel_support_required else []),
        *(["movement_prohibited"] if movement_prohibited else []),
        *(
            ["unresolved_travel_constraint"]
            if travel_compatibility_unproven
            else []
        ),
    ]
    allowed_reasons.sort(key=reason_positions.__getitem__)
    return GroundedPlanContext(
        situation=_profile(),
        weather=GroundedWeatherFacts(
            current_temperature_c=33.0,
            current_apparent_temperature_c=35.0,
            relative_humidity_pct=52.0,
            same_day_max_temperature_c=34.0,
            same_day_max_apparent_temperature_c=36.0,
            same_day_max_uv_index=8.0,
        ),
        priority=GroundedPriorityFacts(
            priority=priority,
            reason_codes=[priority_reason],
        ),
        candidates=candidates,
        movement_prohibited=movement_prohibited,
        travel_support_required=travel_support_required,
        travel_compatibility_unproven=travel_compatibility_unproven,
        allowed_codes=AllowedPlanCodes(
            now=now,
            next_few_hours=[
                "keep_drinking_water",
                "stay_in_cool_space",
                "check_updated_weather",
                "prepare_for_tonight",
            ],
            tonight=[
                "sleep_in_coolest_available_room",
                "keep_water_nearby",
                "check_updated_weather_tonight",
            ],
            bring_items=["water", "phone", "keys", "light_clothing"]
            if candidates
            else [],
            explanation_reasons=allowed_reasons,
            local_phrases=["spanish_request_cool_space"] if candidates else [],
        ),
        required_codes=canonical_required_plan_codes(
            priority=priority,  # type: ignore[arg-type]
            priority_reason_codes=[priority_reason],  # type: ignore[list-item]
            movement_prohibited=movement_prohibited,
            travel_support_required=travel_support_required,
            travel_compatibility_unproven=travel_compatibility_unproven,
            unsheltered=False,
        ),
    )


def _plan(
    *,
    selected_place_id: str | None = "bcn-101",
    now: list[str] | None = None,
    next_few_hours: list[str] | None = None,
    tonight: list[str] | None = None,
    bring_items: list[str] | None = None,
    explanation_reasons: list[str] | None = None,
    local_phrase_code: str | None = "spanish_request_cool_space",
) -> ModelGroundedPlan:
    if now is None:
        now = [
            "move_to_cooler_space",
            "reduce_physical_effort",
            "drink_water",
            "travel_to_selected_place",
        ]
    return ModelGroundedPlan.model_validate(
        {
            "now": {"action_codes": now},
            "next_few_hours": {
                "action_codes": next_few_hours
                or [
                    "keep_drinking_water",
                    "check_updated_weather",
                    "prepare_for_tonight",
                ]
            },
            "tonight": {
                "action_codes": tonight
                or [
                    "sleep_in_coolest_available_room",
                    "keep_water_nearby",
                    "check_updated_weather_tonight",
                ]
            },
            "bring_items": bring_items
            if bring_items is not None
            else ["water", "phone"],
            "explanation_reasons": explanation_reasons
            or ["forecast_at_or_above_34c", "verified_open_candidate"],
            "local_phrase_code": local_phrase_code,
            "selected_place_id": selected_place_id,
        }
    )


def _no_travel_plan() -> ModelGroundedPlan:
    return _plan(
        selected_place_id=None,
        now=[
            "move_to_cooler_space",
            "reduce_physical_effort",
            "drink_water",
        ],
        bring_items=[],
        explanation_reasons=["forecast_at_or_above_34c"],
        local_phrase_code=None,
    )


def _required_plan_for_context(
    context: GroundedPlanContext,
    *,
    travel: bool = False,
) -> ModelGroundedPlan:
    """Build a synthetic plan containing exactly the backend-required core."""

    now = list(context.required_codes.now)
    explanations = list(context.required_codes.explanation_reasons)
    bring_items: list[str] = []
    local_phrase_code: str | None = None
    selected_place_id: str | None = None
    if travel:
        now.append("travel_to_selected_place")
        bring_items = ["water", "phone"]
        local_phrase_code = context.allowed_codes.local_phrases[0]
        selected_place_id = context.candidates[0].place_id
        explanations.append("verified_open_candidate")
        explanation_positions = {
            code: index for index, code in enumerate(EXPLANATION_REASON_ORDER)
        }
        explanations.sort(key=explanation_positions.__getitem__)
    return ModelGroundedPlan.model_validate(
        {
            "now": {"action_codes": now},
            "next_few_hours": {
                "action_codes": list(context.required_codes.next_few_hours)
            },
            "tonight": {
                "action_codes": list(context.required_codes.tonight)
            },
            "bring_items": bring_items,
            "explanation_reasons": explanations,
            "local_phrase_code": local_phrase_code,
            "selected_place_id": selected_place_id,
        }
    )


@pytest.mark.parametrize(
    "reason_codes",
    [
        pytest.param(["synthetic_free_form_reason"], id="free-form"),
        pytest.param(
            ["forecast_at_or_above_34c", "forecast_at_or_above_36c"],
            id="out-of-order",
        ),
        pytest.param(
            ["forecast_at_or_above_34c", "forecast_at_or_above_34c"],
            id="duplicate",
        ),
    ],
)
def test_grounded_priority_reason_codes_are_closed_and_canonical(
    reason_codes: list[str],
) -> None:
    with pytest.raises(ValidationError):
        GroundedPriorityFacts.model_validate(
            {"priority": "prepare_now", "reason_codes": reason_codes}
        )


@pytest.mark.parametrize(
    "payload_change",
    [
        pytest.param({"extra": "forbidden"}, id="extra-top-level-field"),
        pytest.param(
            {"now": {"action_codes": ["drink_water"], "extra": "forbidden"}},
            id="extra-phase-field",
        ),
        pytest.param(
            {"now": {"action_codes": ["invented_free_form_action"]}},
            id="unknown-action-code",
        ),
        pytest.param(
            {"next_few_hours": {"action_codes": ["travel_to_selected_place"]}},
            id="place-action-outside-now",
        ),
    ],
)
def test_model_schema_rejects_extra_factual_and_noncanonical_fields(
    payload_change: dict[str, Any],
) -> None:
    payload = _plan().model_dump(mode="json")
    payload.update(payload_change)

    with pytest.raises(ValidationError):
        ModelGroundedPlan.model_validate(payload)


@pytest.mark.parametrize(
    ("field", "values"),
    [
        pytest.param(
            "now",
            ["drink_water", "move_to_cooler_space", "travel_to_selected_place"],
            id="now-out-of-order",
        ),
        pytest.param(
            "now",
            ["move_to_cooler_space", "drink_water", "drink_water"],
            id="now-duplicate",
        ),
        pytest.param(
            "now",
            [
                "move_to_cooler_space",
                "reduce_physical_effort",
                "drink_water",
                "use_available_home_cooling",
                "contact_support_person",
                "remain_at_current_location",
                "travel_to_selected_place",
                "travel_to_selected_place",
            ],
            id="now-overlong",
        ),
        pytest.param("bring_items", ["phone", "water"], id="items-out-of-order"),
        pytest.param("bring_items", ["water", "water"], id="items-duplicate"),
        pytest.param(
            "explanation_reasons",
            ["verified_open_candidate", "forecast_at_or_above_34c"],
            id="reasons-out-of-order",
        ),
        pytest.param(
            "explanation_reasons",
            ["forecast_at_or_above_34c", "forecast_at_or_above_34c"],
            id="reasons-duplicate",
        ),
    ],
)
def test_model_schema_rejects_duplicate_and_out_of_order_codes(
    field: str,
    values: list[str],
) -> None:
    payload = _plan().model_dump(mode="json")
    if field == "now":
        payload["now"] = {"action_codes": values}
    else:
        payload[field] = values

    with pytest.raises(ValidationError):
        ModelGroundedPlan.model_validate(payload)


@pytest.mark.parametrize(
    "payload_change",
    [
        pytest.param(
            {
                "now": {"action_codes": ["move_to_cooler_space", "drink_water"]},
                "selected_place_id": "bcn-101",
            },
            id="selected-id-without-travel",
        ),
        pytest.param(
            {"selected_place_id": None},
            id="travel-without-selected-id",
        ),
        pytest.param(
            {
                "now": {
                    "action_codes": [
                        "move_to_cooler_space",
                        "drink_water",
                        "remain_at_current_location",
                        "travel_to_selected_place",
                    ]
                }
            },
            id="remain-and-travel",
        ),
    ],
)
def test_static_place_pairing_fails_closed(payload_change: dict[str, Any]) -> None:
    payload = _plan().model_dump(mode="json")
    payload.update(payload_change)
    with pytest.raises(ValidationError):
        ModelGroundedPlan.model_validate(payload)


def test_model_construct_bypass_is_revalidated_without_repair() -> None:
    bypassed = ModelGroundedPlan.model_construct(
        now=ModelNowPhase.model_construct(
            action_codes=["travel_to_selected_place"]
        ),
        next_few_hours=ModelNextFewHoursPhase.model_construct(
            action_codes=["keep_drinking_water"]
        ),
        tonight=ModelTonightPhase.model_construct(
            action_codes=["keep_water_nearby"]
        ),
        bring_items=[],
        explanation_reasons=["verified_open_candidate"],
        local_phrase_code="spanish_request_cool_space",
        selected_place_id=None,
    )

    with pytest.raises(GroundedPlanInvalidResponse):
        validate_grounded_plan(bypassed, _context())


def test_unserializable_model_construct_bypass_is_sanitized() -> None:
    bypassed = ModelGroundedPlan.model_construct(
        now=object(),
        next_few_hours=object(),
        tonight=object(),
        bring_items=[],
        explanation_reasons=[],
        local_phrase_code="spanish_request_cool_space",
        selected_place_id=None,
    )

    with pytest.raises(GroundedPlanInvalidResponse) as caught:
        validate_grounded_plan(bypassed, _context())

    assert str(caught.value) == (
        "Action-plan generation returned an unusable response."
    )


INVALID_REQUEST_SCOPED_IDS = (
    "bcn-999",
    "bcn-202",
    "bcn-0101",
    "BCN-101",
    " bcn-101",
    "bcn-101 ",
    "bcn-101\n",
    "bcn‑101",
    "bсn-101",
    "ｂcn-101",
    "bcn-１０１",
    "bcn-%31%30%31",
    "bcn-101\u200b",
    "bcn-101/",
    "101",
)


@pytest.mark.parametrize("selected_place_id", INVALID_REQUEST_SCOPED_IDS)
def test_request_scoped_candidate_id_adversarial_matrix_accepts_zero_invalid_ids(
    selected_place_id: str,
) -> None:
    plan = _plan(selected_place_id=selected_place_id)

    with pytest.raises(GroundedPlanInvalidResponse):
        validate_grounded_plan(plan, _context())


def test_exact_request_scoped_candidate_id_is_accepted_unchanged() -> None:
    plan = _plan(selected_place_id="bcn-101")

    accepted = validate_grounded_plan(plan, _context())

    assert accepted.selected_place_id == "bcn-101"
    assert len(INVALID_REQUEST_SCOPED_IDS) >= 12


@pytest.mark.parametrize(
    "priority",
    ["act_now", "prepare_now", "monitor_and_prepare"],
)
def test_every_priority_rejects_maliciously_minimal_plan(priority: str) -> None:
    context = _context(candidates=[], priority=priority)
    minimal = ModelGroundedPlan.model_validate(
        {
            "now": {"action_codes": ["move_to_cooler_space"]},
            "next_few_hours": {"action_codes": ["check_updated_weather"]},
            "tonight": {"action_codes": ["keep_water_nearby"]},
            "bring_items": [],
            "explanation_reasons": list(context.priority.reason_codes),
            "local_phrase_code": None,
            "selected_place_id": None,
        }
    )

    with pytest.raises(GroundedPlanInvalidResponse):
        validate_grounded_plan(minimal, context)


@pytest.mark.parametrize(
    "priority",
    ["act_now", "prepare_now", "monitor_and_prepare"],
)
@pytest.mark.parametrize("phase", ["now", "next_few_hours", "tonight"])
def test_every_priority_rejects_each_missing_required_action(
    priority: str,
    phase: str,
) -> None:
    context = _context(candidates=[], priority=priority)
    valid = _required_plan_for_context(context)
    payload = valid.model_dump(mode="json")
    codes = payload[phase]["action_codes"]
    assert len(codes) >= 2
    codes.pop(0)
    missing_required = ModelGroundedPlan.model_validate(payload)

    with pytest.raises(GroundedPlanInvalidResponse):
        validate_grounded_plan(missing_required, context)


@pytest.mark.parametrize(
    "priority",
    ["act_now", "prepare_now", "monitor_and_prepare"],
)
def test_every_priority_requires_its_deterministic_explanation(priority: str) -> None:
    context = _context(
        candidates=[],
        priority=priority,
        travel_support_required=True,
    )
    valid = _required_plan_for_context(context)
    payload = valid.model_dump(mode="json")
    priority_reason = context.priority.reason_codes[0]
    payload["explanation_reasons"].remove(priority_reason)
    missing_reason = ModelGroundedPlan.model_validate(payload)

    with pytest.raises(GroundedPlanInvalidResponse):
        validate_grounded_plan(missing_reason, context)


@pytest.mark.parametrize(
    ("bring_items", "phrase"),
    [
        pytest.param(["water"], None, id="no-travel-item"),
        pytest.param([], "spanish_request_cool_space", id="no-travel-phrase"),
    ],
)
def test_no_travel_rejects_items_and_local_phrase(
    bring_items: list[str],
    phrase: str | None,
) -> None:
    context = _context(candidates=[])
    payload = _required_plan_for_context(context).model_dump(mode="json")
    payload["bring_items"] = bring_items
    payload["local_phrase_code"] = phrase

    with pytest.raises(ValidationError):
        ModelGroundedPlan.model_validate(payload)


@pytest.mark.parametrize(
    "bring_items",
    [
        pytest.param([], id="none"),
        pytest.param(["water"], id="missing-phone"),
        pytest.param(["phone"], id="missing-water"),
        pytest.param(["keys"], id="keys-only"),
    ],
)
def test_travel_requires_water_and_phone_but_not_keys(
    bring_items: list[str],
) -> None:
    context = _context()
    payload = _required_plan_for_context(context, travel=True).model_dump(mode="json")
    payload["bring_items"] = bring_items
    with pytest.raises(ValidationError):
        ModelGroundedPlan.model_validate(payload)

    accepted = _required_plan_for_context(context, travel=True)
    assert accepted.bring_items == ["water", "phone"]


def test_movement_prohibited_requires_remain_action_and_exact_reason() -> None:
    context = _context(candidates=[], movement_prohibited=True)
    valid = _required_plan_for_context(context)
    assert "remain_at_current_location" in valid.now.action_codes
    assert "movement_prohibited" in valid.explanation_reasons

    for field, code in (
        ("now", "remain_at_current_location"),
        ("explanation_reasons", "movement_prohibited"),
    ):
        payload = valid.model_dump(mode="json")
        if field == "now":
            payload["now"]["action_codes"].remove(code)
        else:
            payload[field].remove(code)
        missing = ModelGroundedPlan.model_validate(payload)
        with pytest.raises(GroundedPlanInvalidResponse):
            validate_grounded_plan(missing, context)


def test_unresolved_travel_constraint_is_exact_and_rejects_travel() -> None:
    context = _context(
        candidates=[],
        travel_compatibility_unproven=True,
    )
    valid = _required_plan_for_context(context)
    assert "unresolved_travel_constraint" in valid.explanation_reasons
    assert validate_grounded_plan(valid, context) == valid

    malicious_context = _context()
    malicious = _required_plan_for_context(malicious_context, travel=True)
    bypassed = context.model_copy(
        update={"candidates": malicious_context.candidates}
    )
    with pytest.raises(GroundedPlanInvalidResponse):
        validate_grounded_plan(malicious, bypassed)


def test_snapshot_known_but_request_filtered_id_is_rejected() -> None:
    context = _context(candidates=[_candidate("bcn-101")])
    snapshot_known_id = PlaceRepository().load().snapshot.places[0].place_id
    assert snapshot_known_id not in {
        candidate.place_id for candidate in context.candidates
    }
    snapshot_known_but_filtered = _plan(selected_place_id=snapshot_known_id)

    with pytest.raises(GroundedPlanInvalidResponse):
        validate_grounded_plan(snapshot_known_but_filtered, context)


def test_empty_candidates_and_movement_prohibition_reject_place_outputs() -> None:
    plan = _plan(selected_place_id="bcn-101")

    with pytest.raises(GroundedPlanInvalidResponse):
        validate_grounded_plan(plan, _context(candidates=[]))
    with pytest.raises(GroundedPlanInvalidResponse):
        validate_grounded_plan(plan, _context(movement_prohibited=True))

    assert validate_grounded_plan(
        _no_travel_plan(),
        _context(candidates=[]),
    ).selected_place_id is None


def test_travel_support_action_must_precede_travel() -> None:
    context = _context(travel_support_required=True)
    valid = _plan(
        now=[
            "move_to_cooler_space",
            "reduce_physical_effort",
            "drink_water",
            "contact_support_person",
            "travel_to_selected_place",
        ],
        explanation_reasons=[
            "forecast_at_or_above_34c",
            "verified_open_candidate",
            "travel_support_required",
        ],
    )
    missing_support = _plan()

    assert validate_grounded_plan(valid, context) == valid
    with pytest.raises(GroundedPlanInvalidResponse):
        validate_grounded_plan(missing_support, context)


def test_codes_not_allowed_for_this_request_fail_closed() -> None:
    plan = _plan(
        now=[
            "move_to_cooler_space",
            "drink_water",
            "use_available_home_cooling",
            "travel_to_selected_place",
        ]
    )
    with pytest.raises(GroundedPlanInvalidResponse):
        validate_grounded_plan(plan, _context())


def test_verified_candidate_reason_requires_exact_selected_place() -> None:
    reason_without_place = _plan(
        selected_place_id=None,
        now=[
            "move_to_cooler_space",
            "reduce_physical_effort",
            "drink_water",
        ],
        bring_items=[],
        explanation_reasons=[
            "forecast_at_or_above_34c",
            "verified_open_candidate",
        ],
        local_phrase_code=None,
    )
    place_without_reason = _plan(
        explanation_reasons=["forecast_at_or_above_34c"],
    )

    with pytest.raises(GroundedPlanInvalidResponse):
        validate_grounded_plan(reason_without_place, _context())
    with pytest.raises(GroundedPlanInvalidResponse):
        validate_grounded_plan(place_without_reason, _context())


class FakeResponses:
    def __init__(self, result: object = None, error: Exception | None = None) -> None:
        self.result = result
        self.error = error
        self.calls: list[dict[str, Any]] = []

    async def parse(self, **kwargs: Any) -> object:
        self.calls.append(kwargs)
        if self.error is not None:
            raise self.error
        return self.result


class FakeClient:
    def __init__(self, responses: FakeResponses) -> None:
        self.responses = responses
        self.closed = False

    async def close(self) -> None:
        self.closed = True


class RecordingClientFactory:
    def __init__(self, client: FakeClient) -> None:
        self.client = client
        self.calls: list[dict[str, Any]] = []

    def __call__(self, **kwargs: Any) -> FakeClient:
        self.calls.append(kwargs)
        return self.client


def _response(
    *,
    parsed: object | None = None,
    status: str = "completed",
    error: object | None = None,
    incomplete_details: object | None = None,
    output: list[object] | None = None,
    model: str = "gpt-5.6-sol",
) -> SimpleNamespace:
    if output is None:
        output = [
            SimpleNamespace(
                type="message",
                content=[SimpleNamespace(type="output_text", parsed=parsed)],
            )
        ]
    return SimpleNamespace(
        status=status,
        error=error,
        incomplete_details=incomplete_details,
        output=output,
        model=model,
        usage=SimpleNamespace(input_tokens=900, output_tokens=120, total_tokens=1020),
    )


def _service_for_response(
    response: object,
) -> tuple[GroundedPlanService, RecordingClientFactory, FakeClient]:
    responses = FakeResponses(result=response)
    client = FakeClient(responses)
    factory = RecordingClientFactory(client)
    return (
        GroundedPlanService(
            api_key="synthetic-test-key",
            client_factory=factory,
        ),
        factory,
        client,
    )


def test_adapter_uses_exact_bounded_private_arguments_and_payload() -> None:
    context = _context()
    plan = _plan()
    service, factory, client = _service_for_response(_response(parsed=plan))

    generated = asyncio.run(service.generate(context))

    assert factory.calls == [
        {
            "api_key": "synthetic-test-key",
            "base_url": "https://api.openai.com/v1",
            "timeout": 30.0,
            "max_retries": 0,
        }
    ]
    call = client.responses.calls[0]
    assert set(call) == {
        "model",
        "input",
        "text_format",
        "reasoning",
        "max_output_tokens",
        "store",
        "prompt_cache_options",
        "service_tier",
    }
    assert call["model"] == GROUNDED_PLAN_MODEL == "gpt-5.6"
    assert call["text_format"] is ModelGroundedPlan
    assert call["reasoning"] == {"effort": "none"}
    assert call["max_output_tokens"] == GROUNDED_PLAN_MAX_OUTPUT_TOKENS == 1024
    assert call["store"] is False
    assert call["prompt_cache_options"] == {"mode": "explicit"}
    assert call["service_tier"] == "default"
    assert call["input"][0] == {
        "role": "developer",
        "content": [{"type": "input_text", "text": GROUNDED_PLAN_INSTRUCTION}],
    }
    serialized = serialize_grounded_context(context)
    assert call["input"][1] == {
        "role": "user",
        "content": [{"type": "input_text", "text": serialized}],
    }
    assert json.loads(serialized) == context.model_dump(mode="json")
    assert call["input"] == grounded_model_input(context)
    response_format = grounded_strict_response_format()
    assert response_format == {
        "type": "json_schema",
        "name": "ModelGroundedPlan",
        "strict": True,
        "schema": ModelGroundedPlan.model_json_schema(),
    }
    assert grounded_model_visible_request(context) == {
        "input": call["input"],
        "text": {"format": response_format},
    }
    for forbidden in (
        "situation_text",
        "latitude",
        "longitude",
        "address",
        "https://",
        "Barcelona Library",
        "synthetic-secret",
        "source_url",
    ):
        assert forbidden not in serialized
    assert generated.plan == plan
    assert generated.usage.model == "gpt-5.6-sol"
    assert generated.usage.total_tokens == 1020
    assert generated.payload_bytes == grounded_payload_size_bytes(context)
    assert generated.payload_bytes <= GROUNDED_PLAN_MAX_PAYLOAD_BYTES
    assert client.closed is True


def test_adapter_closes_client_before_semantic_whitelist_rejection() -> None:
    noncandidate_plan = _plan(selected_place_id="bcn-filtered-out")
    service, _, client = _service_for_response(
        _response(parsed=noncandidate_plan)
    )

    with pytest.raises(GroundedPlanInvalidResponse):
        asyncio.run(service.generate(_context()))

    assert client.closed is True


def test_payload_bound_fails_before_client_construction() -> None:
    factory_calls: list[dict[str, Any]] = []

    def forbidden_factory(**kwargs: Any) -> object:
        factory_calls.append(kwargs)
        raise AssertionError("client construction must not occur")

    service = GroundedPlanService(
        api_key="synthetic-test-key",
        client_factory=forbidden_factory,
        max_payload_bytes=1,
    )

    with pytest.raises(GroundedPlanInvalidResponse):
        asyncio.run(service.generate(_context()))
    assert factory_calls == []


def test_weakened_required_matrix_fails_before_client_construction() -> None:
    factory_calls: list[dict[str, Any]] = []
    context = _context(candidates=[])
    weakened_required = context.required_codes.model_copy(update={"now": []})
    bypassed_context = context.model_copy(
        update={"required_codes": weakened_required}
    )

    def forbidden_factory(**kwargs: Any) -> object:
        factory_calls.append(kwargs)
        raise AssertionError("invalid context must fail before client construction")

    service = GroundedPlanService(
        api_key="synthetic-test-key",
        client_factory=forbidden_factory,
        provider_capacity=BoundedTaskCapacity(1),
        cleanup_capacity=BoundedTaskCapacity(1),
    )

    with pytest.raises(GroundedPlanInvalidResponse):
        validate_grounded_plan(
            _required_plan_for_context(context),
            bypassed_context,
        )
    with pytest.raises(GroundedPlanInvalidResponse):
        asyncio.run(service.generate(bypassed_context))
    assert factory_calls == []


def test_complete_payload_bound_is_exact_for_multibyte_context() -> None:
    candidate = _candidate("bcn-測試")
    context = _context(candidates=[candidate])
    plan = _plan(selected_place_id=candidate.place_id)
    measured = grounded_payload_size_bytes(context)
    expected = len(
        json.dumps(
            grounded_model_visible_request(context),
            ensure_ascii=False,
            separators=(",", ":"),
            sort_keys=True,
        ).encode("utf-8")
    )
    assert measured == expected
    assert measured < GROUNDED_PLAN_MAX_PAYLOAD_BYTES

    for configured_bound, should_pass in (
        (measured + 1, True),
        (measured, True),
        (measured - 1, False),
    ):
        constructed: list[dict[str, Any]] = []
        responses = FakeResponses(result=_response(parsed=plan))
        client = FakeClient(responses)

        def factory(**kwargs: Any) -> FakeClient:
            constructed.append(kwargs)
            return client

        service = GroundedPlanService(
            api_key="synthetic-test-key",
            client_factory=factory,
            max_payload_bytes=configured_bound,
        )
        if should_pass:
            assert asyncio.run(service.generate(context)).payload_bytes == measured
            assert len(constructed) == 1
        else:
            with pytest.raises(GroundedPlanInvalidResponse):
                asyncio.run(service.generate(context))
            assert constructed == []


def test_real_sdk_serialized_payload_exactly_matches_application_bound() -> None:
    """Capture the pinned SDK request through MockTransport, never a socket."""

    candidate = _candidate("bcn-測試")
    context = _context(candidates=[candidate])
    captured_bodies: list[dict[str, Any]] = []
    constructed_clients = 0

    def offline_handler(request: httpx.Request) -> httpx.Response:
        captured_bodies.append(json.loads(request.content))
        return httpx.Response(
            400,
            request=request,
            json={
                "error": {
                    "message": "synthetic offline rejection",
                    "type": "invalid_request_error",
                    "param": None,
                    "code": "synthetic_offline",
                }
            },
        )

    async def exercise() -> None:
        nonlocal constructed_clients
        mock_http_client = httpx.AsyncClient(
            transport=httpx.MockTransport(offline_handler)
        )

        def factory(**kwargs: Any) -> AsyncOpenAI:
            nonlocal constructed_clients
            constructed_clients += 1
            return AsyncOpenAI(**kwargs, http_client=mock_http_client)

        service = GroundedPlanService(
            api_key="sk-synthetic-offline-only",
            client_factory=factory,
            provider_capacity=BoundedTaskCapacity(1),
            cleanup_capacity=BoundedTaskCapacity(1),
        )
        with pytest.raises(GroundedPlanUnavailable):
            await service.generate(context)
        assert mock_http_client.is_closed

    asyncio.run(exercise())

    assert constructed_clients == 1
    assert len(captured_bodies) == 1
    actual_body = captured_bodies[0]
    actual_model_visible = {
        "input": actual_body["input"],
        "text": {"format": actual_body["text"]["format"]},
    }
    assert actual_model_visible == grounded_model_visible_request(context)
    actual_bytes = len(
        json.dumps(
            actual_model_visible,
            ensure_ascii=False,
            separators=(",", ":"),
            sort_keys=True,
        ).encode("utf-8")
    )
    assert actual_bytes == grounded_payload_size_bytes(context)
    assert "測試" in json.dumps(actual_body, ensure_ascii=False)


def test_candidate_closing_time_is_bounded_to_an_aware_datetime() -> None:
    payload = _candidate().model_dump(mode="json")
    payload["closes_at"] = "2026-07-17T20:00:00"
    with pytest.raises(ValidationError):
        GroundedCandidateFacts.model_validate(payload)

    payload["closes_at"] = "2" * 50_000
    with pytest.raises(ValidationError):
        GroundedCandidateFacts.model_validate(payload)


def test_configured_payload_and_output_bound_stays_under_cost_ceiling() -> None:
    assert configured_cost_bound_usd(GROUNDED_PLAN_MAX_PAYLOAD_BYTES) == pytest.approx(
        0.13072
    )
    assert (
        configured_cost_bound_usd(GROUNDED_PLAN_MAX_PAYLOAD_BYTES)
        < GROUNDED_PLAN_COST_CEILING_USD
        == 0.15
    )


@pytest.mark.parametrize("invalid_bound", [0, -1, 20_001, True])
def test_invalid_payload_bounds_are_rejected(invalid_bound: object) -> None:
    with pytest.raises(ValueError):
        GroundedPlanService(
            api_key="synthetic-test-key",
            max_payload_bytes=invalid_bound,  # type: ignore[arg-type]
        )


def test_missing_key_fails_without_constructing_a_client() -> None:
    def forbidden_factory(**_kwargs: Any) -> object:
        raise AssertionError("real transport must not be constructed")

    service = GroundedPlanService(api_key=None, client_factory=forbidden_factory)
    with pytest.raises(GroundedPlanNotConfigured):
        asyncio.run(service.generate(_context()))


@pytest.mark.parametrize(
    "response",
    [
        pytest.param(
            _response(
                parsed=None,
                status="incomplete",
                incomplete_details=SimpleNamespace(reason="max_output_tokens"),
            ),
            id="incomplete-max-tokens",
        ),
        pytest.param(_response(parsed=None), id="missing-parsed-output"),
        pytest.param(
            _response(
                output=[
                    SimpleNamespace(
                        type="message",
                        content=[
                            SimpleNamespace(type="output_text", parsed=_plan()),
                            SimpleNamespace(type="output_text", parsed=_plan()),
                        ],
                    )
                ]
            ),
            id="multiple-parsed-outputs",
        ),
        pytest.param(
            _response(output=[SimpleNamespace(type="tool_call")]),
            id="unexpected-output-item",
        ),
        pytest.param(_response(status="queued"), id="nonterminal-status"),
    ],
)
def test_incomplete_missing_multiple_and_unexpected_outputs_fail_closed(
    response: object,
) -> None:
    service, _, client = _service_for_response(response)
    with pytest.raises(GroundedPlanInvalidResponse):
        asyncio.run(service.generate(_context()))
    assert client.closed is True


def test_refusal_wins_and_does_not_expose_provider_text() -> None:
    response = _response(
        output=[
            SimpleNamespace(
                type="message",
                content=[
                    SimpleNamespace(type="output_text", parsed=_plan()),
                    SimpleNamespace(
                        type="refusal",
                        refusal="synthetic private provider refusal",
                    ),
                ],
            )
        ]
    )
    service, _, _ = _service_for_response(response)

    with pytest.raises(GroundedPlanRefused) as caught:
        asyncio.run(service.generate(_context()))
    assert str(caught.value) == "Action-plan generation was refused."
    assert "provider" not in str(caught.value)


def _status_error(error_type: type[Exception], status_code: int) -> Exception:
    request = httpx.Request("POST", "https://api.openai.com/v1/responses")
    response = httpx.Response(status_code, request=request)
    return error_type(
        "synthetic private provider details",
        response=response,
        body={"error": "synthetic private body"},
    )


@pytest.mark.parametrize(
    "provider_error",
    [
        pytest.param(_status_error(AuthenticationError, 401), id="authentication"),
        pytest.param(_status_error(PermissionDeniedError, 403), id="permission"),
        pytest.param(_status_error(RateLimitError, 429), id="rate-limit"),
        pytest.param(_status_error(BadRequestError, 400), id="bad-request"),
        pytest.param(_status_error(InternalServerError, 500), id="server-error"),
        pytest.param(
            APIConnectionError(
                message="synthetic private connection detail",
                request=httpx.Request(
                    "POST",
                    "https://api.openai.com/v1/responses",
                ),
            ),
            id="connection",
        ),
    ],
)
def test_provider_failures_are_sanitized_and_client_is_closed(
    provider_error: Exception,
) -> None:
    responses = FakeResponses(error=provider_error)
    client = FakeClient(responses)
    service = GroundedPlanService(
        api_key="synthetic-test-key",
        client_factory=lambda **_kwargs: client,
    )

    with pytest.raises(GroundedPlanUnavailable) as caught:
        asyncio.run(service.generate(_context()))
    assert str(caught.value) == "Action-plan generation is temporarily unavailable."
    assert "private" not in str(caught.value)
    assert client.closed is True


def test_failed_response_status_is_provider_unavailability() -> None:
    response = _response(
        status="failed",
        error=SimpleNamespace(message="synthetic private provider body"),
        output=[],
    )
    service, _, _ = _service_for_response(response)
    with pytest.raises(GroundedPlanUnavailable):
        asyncio.run(service.generate(_context()))


def test_sdk_and_overall_timeouts_are_sanitized() -> None:
    timeout_responses = FakeResponses(
        error=APITimeoutError(
            request=httpx.Request(
                "POST",
                "https://api.openai.com/v1/responses",
            )
        )
    )
    timeout_client = FakeClient(timeout_responses)
    timeout_service = GroundedPlanService(
        api_key="synthetic-test-key",
        client_factory=lambda **_kwargs: timeout_client,
    )
    with pytest.raises(GroundedPlanTimeout):
        asyncio.run(timeout_service.generate(_context()))
    assert timeout_client.closed is True

    class SlowResponses:
        async def parse(self, **_kwargs: Any) -> object:
            await asyncio.sleep(10)
            raise AssertionError("overall deadline failed")

    slow_client = FakeClient(SlowResponses())  # type: ignore[arg-type]
    slow_service = GroundedPlanService(
        api_key="synthetic-test-key",
        client_factory=lambda **_kwargs: slow_client,
        overall_timeout_seconds=0.01,
    )
    with pytest.raises(GroundedPlanTimeout):
        asyncio.run(slow_service.generate(_context()))
    assert slow_client.closed is True


def test_cancellation_resistant_provider_call_cannot_overrun_deadline(
    caplog: pytest.LogCaptureFixture,
) -> None:
    private_detail = "synthetic private late provider detail"

    async def exercise() -> None:
        class CancellationResistantResponses:
            def __init__(self) -> None:
                self.cancelled = asyncio.Event()
                self.finished = asyncio.Event()

            async def parse(self, **_kwargs: Any) -> object:
                try:
                    await asyncio.sleep(60)
                except asyncio.CancelledError:
                    self.cancelled.set()
                    await asyncio.sleep(0.30)
                self.finished.set()
                raise RuntimeError(private_detail)

        responses = CancellationResistantResponses()
        client = FakeClient(responses)  # type: ignore[arg-type]
        service = GroundedPlanService(
            api_key="synthetic-test-key",
            client_factory=lambda **_kwargs: client,
            overall_timeout_seconds=0.01,
        )
        loop = asyncio.get_running_loop()
        loop_errors: list[dict[str, Any]] = []
        previous_handler = loop.get_exception_handler()
        loop.set_exception_handler(lambda _loop, context: loop_errors.append(context))
        try:
            started = loop.time()
            with pytest.raises(GroundedPlanTimeout):
                await service.generate(_context())
            elapsed = loop.time() - started

            assert elapsed < 0.12
            assert not responses.finished.is_set()
            await asyncio.wait_for(responses.cancelled.wait(), timeout=0.1)
            await asyncio.wait_for(responses.finished.wait(), timeout=1.0)
            await asyncio.sleep(0)
            await asyncio.sleep(0)
            assert loop_errors == []
        finally:
            loop.set_exception_handler(previous_handler)

    with caplog.at_level("WARNING", logger="backend.app.grounded_plan"):
        asyncio.run(exercise())

    assert caplog.messages.count("Grounded plan request timed out") == 1
    assert caplog.messages.count(
        "Grounded plan provider task failed after timeout"
    ) == 1
    assert private_detail not in caplog.text


def test_provider_capacity_stays_bounded_until_detached_call_finishes() -> None:
    async def exercise() -> None:
        release = asyncio.Event()
        cancelled = asyncio.Event()
        finished = asyncio.Event()
        capacity = BoundedTaskCapacity(1)
        client_constructions = 0

        class NeverFinishingResponses:
            async def parse(self, **_kwargs: Any) -> object:
                try:
                    await asyncio.Future()
                except asyncio.CancelledError:
                    cancelled.set()
                    await release.wait()
                finished.set()
                return _response(parsed=_plan())

        client = FakeClient(NeverFinishingResponses())  # type: ignore[arg-type]

        def factory(**_kwargs: Any) -> FakeClient:
            nonlocal client_constructions
            client_constructions += 1
            return client

        service = GroundedPlanService(
            api_key="synthetic-test-key",
            client_factory=factory,
            overall_timeout_seconds=0.01,
            provider_capacity=capacity,
            cleanup_capacity=BoundedTaskCapacity(2),
        )
        with pytest.raises(GroundedPlanTimeout):
            await service.generate(_context())
        await asyncio.wait_for(cancelled.wait(), timeout=0.1)
        assert capacity.in_use == capacity.active_task_count == capacity.limit == 1

        started = asyncio.get_running_loop().time()
        with pytest.raises(GroundedPlanUnavailable):
            await service.generate(_context())
        elapsed = asyncio.get_running_loop().time() - started
        assert elapsed < 0.05
        assert client_constructions == 1
        assert capacity.in_use == 1

        release.set()
        await asyncio.wait_for(finished.wait(), timeout=0.5)
        await asyncio.sleep(0)
        assert capacity.in_use == capacity.active_task_count == 0

    asyncio.run(exercise())


@pytest.mark.parametrize("late_failure", [False, True])
def test_grounded_provider_caller_cancellation_propagates_and_retains_capacity(
    caplog: pytest.LogCaptureFixture,
    late_failure: bool,
) -> None:
    private_detail = "synthetic private late caller-cancel detail"

    async def exercise() -> None:
        started = asyncio.Event()
        cancelled = asyncio.Event()
        release = asyncio.Event()
        finished = asyncio.Event()
        provider_capacity = BoundedTaskCapacity(1)

        class ResistantResponses:
            async def parse(self, **_kwargs: Any) -> object:
                started.set()
                try:
                    await asyncio.Future()
                except asyncio.CancelledError:
                    cancelled.set()
                    await release.wait()
                finished.set()
                if late_failure:
                    raise RuntimeError(private_detail)
                return _response(parsed=_plan())

        service = GroundedPlanService(
            api_key="synthetic-test-key",
            client_factory=lambda **_kwargs: FakeClient(ResistantResponses()),
            provider_capacity=provider_capacity,
            cleanup_capacity=BoundedTaskCapacity(1),
        )
        loop = asyncio.get_running_loop()
        loop_errors: list[dict[str, Any]] = []
        previous_handler = loop.get_exception_handler()
        loop.set_exception_handler(lambda _loop, context: loop_errors.append(context))
        try:
            request_task = asyncio.create_task(service.generate(_context()))
            await asyncio.wait_for(started.wait(), timeout=0.2)
            request_task.cancel()
            with pytest.raises(asyncio.CancelledError):
                await request_task

            await asyncio.wait_for(cancelled.wait(), timeout=0.2)
            assert provider_capacity.in_use == 1
            assert provider_capacity.active_task_count == 1
            release.set()
            await asyncio.wait_for(finished.wait(), timeout=0.5)
            await asyncio.sleep(0)
            await asyncio.sleep(0)
            assert provider_capacity.in_use == 0
            assert loop_errors == []
        finally:
            loop.set_exception_handler(previous_handler)

    with caplog.at_level("WARNING", logger="backend.app.grounded_plan"):
        asyncio.run(exercise())

    assert "Grounded plan request timed out" not in caplog.messages
    assert private_detail not in caplog.text


def test_both_openai_adapters_share_default_provider_and_cleanup_capacity() -> None:
    situation = SituationExtractionService(api_key="synthetic-test-key")
    grounded = GroundedPlanService(api_key="synthetic-test-key")

    assert situation._provider_capacity is SHARED_OPENAI_PROVIDER_CAPACITY
    assert grounded._provider_capacity is SHARED_OPENAI_PROVIDER_CAPACITY
    assert situation._cleanup_capacity is SHARED_OPENAI_CLIENT_CLEANUP_CAPACITY
    assert grounded._cleanup_capacity is SHARED_OPENAI_CLIENT_CLEANUP_CAPACITY


def test_detached_situation_call_saturates_shared_grounded_capacity() -> None:
    async def exercise() -> None:
        capacity = BoundedTaskCapacity(1)
        release = asyncio.Event()
        situation_finished = asyncio.Event()
        grounded_client_calls = 0

        class ResistantSituationResponses:
            async def parse(self, **_kwargs: Any) -> object:
                try:
                    await asyncio.Future()
                except asyncio.CancelledError:
                    await release.wait()
                situation_finished.set()
                return None

        situation_client = FakeClient(  # type: ignore[arg-type]
            ResistantSituationResponses()
        )
        situation_service = SituationExtractionService(
            api_key="synthetic-test-key",
            client_factory=lambda **_kwargs: situation_client,
            overall_timeout_seconds=0.01,
            provider_capacity=capacity,
            cleanup_capacity=BoundedTaskCapacity(1),
        )
        with pytest.raises(SituationExtractionTimeout):
            await situation_service.extract(
                SituationExtractionRequest(situation_text="Synthetic text")
            )
        assert capacity.in_use == capacity.active_task_count == 1

        def forbidden_grounded_factory(**_kwargs: Any) -> object:
            nonlocal grounded_client_calls
            grounded_client_calls += 1
            raise AssertionError("saturated grounded call must not create a client")

        grounded_service = GroundedPlanService(
            api_key="synthetic-test-key",
            client_factory=forbidden_grounded_factory,
            provider_capacity=capacity,
            cleanup_capacity=BoundedTaskCapacity(1),
        )
        started = asyncio.get_running_loop().time()
        with pytest.raises(GroundedPlanUnavailable):
            await grounded_service.generate(_context())
        elapsed = asyncio.get_running_loop().time() - started
        assert elapsed < 0.05
        assert grounded_client_calls == 0
        assert capacity.in_use == 1

        release.set()
        await asyncio.wait_for(situation_finished.wait(), timeout=0.5)
        await asyncio.sleep(0)
        assert capacity.in_use == capacity.active_task_count == 0

    asyncio.run(exercise())


def test_detached_situation_cleanup_saturates_grounded_client_capacity() -> None:
    async def exercise() -> None:
        release = asyncio.Event()
        close_started = asyncio.Event()
        cleanup_capacity = BoundedTaskCapacity(1)
        grounded_factory_calls = 0

        class SlowCloseClient(FakeClient):
            async def close(self) -> None:
                close_started.set()
                await release.wait()

        situation_client = SlowCloseClient(
            FakeResponses(result=_response(parsed=_profile()))  # type: ignore[arg-type]
        )
        situation_service = SituationExtractionService(
            api_key="synthetic-test-key",
            client_factory=lambda **_kwargs: situation_client,
            cleanup_timeout_seconds=0.01,
            provider_capacity=BoundedTaskCapacity(1),
            cleanup_capacity=cleanup_capacity,
        )
        response = await situation_service.extract(
            SituationExtractionRequest(situation_text="Synthetic offline text")
        )
        assert response.schema_version == "1.0.0"
        await asyncio.wait_for(close_started.wait(), timeout=0.1)
        assert cleanup_capacity.in_use == 1

        def forbidden_grounded_factory(**_kwargs: Any) -> object:
            nonlocal grounded_factory_calls
            grounded_factory_calls += 1
            raise AssertionError("cleanup saturation must reject before construction")

        grounded_service = GroundedPlanService(
            api_key="synthetic-test-key",
            client_factory=forbidden_grounded_factory,
            provider_capacity=BoundedTaskCapacity(1),
            cleanup_capacity=cleanup_capacity,
        )
        with pytest.raises(GroundedPlanUnavailable):
            await grounded_service.generate(_context())
        assert grounded_factory_calls == 0

        release.set()
        for _ in range(100):
            if cleanup_capacity.in_use == 0:
                break
            await asyncio.sleep(0.01)
        assert cleanup_capacity.in_use == 0

    asyncio.run(exercise())


def test_cleanup_capacity_prevents_unbounded_detached_close_tasks(
    caplog: pytest.LogCaptureFixture,
) -> None:
    async def exercise() -> None:
        release = asyncio.Event()
        first_finished = asyncio.Event()
        cleanup_capacity = BoundedTaskCapacity(1)
        close_calls = 0
        client_constructions = 0

        class ResistantClient(FakeClient):
            async def close(self) -> None:
                nonlocal close_calls
                close_calls += 1
                await release.wait()
                first_finished.set()

        first = ResistantClient(FakeResponses(result=_response(parsed=_plan())))

        def factory(**_kwargs: Any) -> ResistantClient:
            nonlocal client_constructions
            client_constructions += 1
            return first

        service = GroundedPlanService(
            api_key="synthetic-test-key",
            client_factory=factory,
            cleanup_timeout_seconds=0.01,
            provider_capacity=BoundedTaskCapacity(1),
            cleanup_capacity=cleanup_capacity,
        )

        assert (await service.generate(_context())).plan == _plan()
        assert cleanup_capacity.in_use == cleanup_capacity.active_task_count == 1
        assert client_constructions == close_calls == 1

        with pytest.raises(GroundedPlanUnavailable):
            await service.generate(_context())
        assert client_constructions == 1
        assert close_calls == 1
        assert cleanup_capacity.in_use == 1

        release.set()
        await asyncio.wait_for(first_finished.wait(), timeout=0.5)
        await asyncio.sleep(0)
        assert cleanup_capacity.in_use == cleanup_capacity.active_task_count == 0

    with caplog.at_level("WARNING", logger="backend.app.grounded_plan"):
        asyncio.run(exercise())
    assert caplog.messages.count("Grounded plan client cleanup timed out") == 1
    assert caplog.messages.count("Grounded plan client cleanup failed") == 0


@pytest.mark.parametrize(
    ("provider_failure", "late_cleanup_failure"),
    [
        pytest.param(False, True, id="success-late-cleanup-failure"),
        pytest.param(True, False, id="provider-failure-late-cleanup-success"),
    ],
)
def test_cancellation_resistant_cleanup_does_not_delay_request_path(
    caplog: pytest.LogCaptureFixture,
    provider_failure: bool,
    late_cleanup_failure: bool,
) -> None:
    private_detail = "synthetic private grounded cleanup detail"

    async def exercise() -> None:
        release = asyncio.Event()
        cleanup_capacity = BoundedTaskCapacity(1)

        class CancellationResistantClient(FakeClient):
            def __init__(self, responses: FakeResponses) -> None:
                super().__init__(responses)
                self.cancelled = asyncio.Event()
                self.finished = asyncio.Event()

            async def close(self) -> None:
                try:
                    await release.wait()
                except asyncio.CancelledError:
                    self.cancelled.set()
                    await release.wait()
                self.finished.set()
                if late_cleanup_failure:
                    raise RuntimeError(private_detail)

        responses = (
            FakeResponses(
                error=APIConnectionError(
                    message=private_detail,
                    request=httpx.Request(
                        "POST",
                        "https://api.openai.com/v1/responses",
                    ),
                )
            )
            if provider_failure
            else FakeResponses(result=_response(parsed=_plan()))
        )
        client = CancellationResistantClient(responses)
        service = GroundedPlanService(
            api_key="synthetic-test-key",
            client_factory=lambda **_kwargs: client,
            cleanup_timeout_seconds=0.01,
            provider_capacity=BoundedTaskCapacity(1),
            cleanup_capacity=cleanup_capacity,
        )
        loop = asyncio.get_running_loop()
        loop_errors: list[dict[str, Any]] = []
        previous_handler = loop.get_exception_handler()
        loop.set_exception_handler(lambda _loop, context: loop_errors.append(context))
        try:
            started = loop.time()
            if provider_failure:
                with pytest.raises(GroundedPlanUnavailable):
                    await service.generate(_context())
            else:
                assert (await service.generate(_context())).plan == _plan()
            elapsed = loop.time() - started

            assert elapsed < 0.12
            assert not client.finished.is_set()
            assert not client.cancelled.is_set()
            assert cleanup_capacity.in_use == 1
            release.set()
            await asyncio.wait_for(client.finished.wait(), timeout=1.0)
            await asyncio.sleep(0)
            await asyncio.sleep(0)
            assert loop_errors == []
            if late_cleanup_failure:
                assert cleanup_capacity.in_use == 1
                assert cleanup_capacity.quarantined_count == 1
            else:
                assert cleanup_capacity.in_use == 0
        finally:
            loop.set_exception_handler(previous_handler)

    with caplog.at_level("WARNING", logger="backend.app.grounded_plan"):
        asyncio.run(exercise())

    assert caplog.messages.count("Grounded plan client cleanup timed out") == 1
    assert caplog.messages.count("Grounded plan client cleanup failed") == int(
        late_cleanup_failure
    )
    assert private_detail not in caplog.text


def test_safe_usage_log_contains_aggregates_but_no_context(
    caplog: pytest.LogCaptureFixture,
) -> None:
    service, _, _ = _service_for_response(_response(parsed=_plan()))
    with caplog.at_level("INFO", logger="backend.app.grounded_plan"):
        asyncio.run(service.generate(_context()))

    assert "model=gpt-5.6-sol" in caplog.text
    assert "input_tokens=900" in caplog.text
    assert "output_tokens=120" in caplog.text
    assert "total_tokens=1020" in caplog.text
    assert "bcn-101" not in caplog.text
    assert "older_adult" not in caplog.text


def test_provider_model_metadata_is_allowlisted_before_logging(
    caplog: pytest.LogCaptureFixture,
) -> None:
    private_model = "sk-proj-synthetic-secret"
    service, _, _ = _service_for_response(
        _response(parsed=_plan(), model=private_model)
    )

    with caplog.at_level("INFO", logger="backend.app.grounded_plan"):
        generated = asyncio.run(service.generate(_context()))

    assert generated.usage.model == "unavailable"
    assert private_model not in caplog.text
