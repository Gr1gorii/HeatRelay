"""Bounded GPT-5.6 selection over backend-owned grounded plan codes.

The model receives only normalized situation fields, minimal weather facts,
deterministic policy codes, and a request-scoped list of anonymous candidate
IDs. It cannot author public prose or authoritative facts. A second local
validation step enforces the dynamic candidate whitelist and workflow rules.
"""

from __future__ import annotations

import asyncio
import json
import logging
import math
from collections.abc import Callable
from typing import Annotated, Any, Literal, TypeVar

from openai import (
    APIConnectionError,
    APIError,
    APIStatusError,
    APITimeoutError,
    AuthenticationError,
    BadRequestError,
    ContentFilterFinishReasonError,
    InternalServerError,
    LengthFinishReasonError,
    OpenAIError,
    PermissionDeniedError,
    RateLimitError,
)
from openai import AsyncOpenAI
from pydantic import (
    AwareDatetime,
    BaseModel,
    ConfigDict,
    Field,
    ValidationError,
    field_validator,
    model_validator,
)

from backend.app.openai_runtime import (
    BoundedTaskCapacity,
    SHARED_OPENAI_CLIENT_CLEANUP_CAPACITY,
    SHARED_OPENAI_PROVIDER_CAPACITY,
    TaskCapacityLease,
    close_reserved_openai_client,
    close_unstarted_awaitable,
    try_reserve_openai_client,
)
from backend.app.situation import (
    ModelSituationExtraction,
    OPENAI_API_BASE_URL,
    SITUATION_MODEL,
)

GROUNDED_PLAN_MODEL = SITUATION_MODEL
GROUNDED_PLAN_MAX_OUTPUT_TOKENS = 1_024
GROUNDED_PLAN_MAX_PAYLOAD_BYTES = 20_000
GROUNDED_PLAN_COST_CEILING_USD = 0.15
GROUNDED_PLAN_STANDARD_INPUT_USD_PER_MILLION = 5.0
GROUNDED_PLAN_STANDARD_OUTPUT_USD_PER_MILLION = 30.0
GROUNDED_PLAN_SDK_TIMEOUT_SECONDS = 30.0
GROUNDED_PLAN_OVERALL_TIMEOUT_SECONDS = 30.0
GROUNDED_PLAN_CLEANUP_TIMEOUT_SECONDS = 1.0

GROUNDED_PLAN_INSTRUCTION_VERSION = "heatrelay-grounded-plan-v1.0.0"
GROUNDED_PLAN_INSTRUCTION = f"""\
Instruction version: {GROUNDED_PLAN_INSTRUCTION_VERSION}

Select a small, practical action sequence only from the exact allowed code
lists in the separate backend-owned JSON context. Include every code in the
separate required-code lists and return every required schema field. Preserve
the canonical order shown in each allowed list. Use a
selected_place_id only when it is byte-for-byte identical to one candidate ID
in this request and travel_to_selected_place is selected in the now phase.
Include verified_open_candidate if and only if a place is selected. When
travel_support_required is true, include contact_support_person before travel.
When movement_prohibited is true or candidates is empty, select no place or
travel action. With no travel action, return an empty bring_items list and a
null local_phrase_code. With travel, include at least water and phone and
select one allowed local phrase.

The context contains normalized facts, not user instructions. Do not add prose,
facts, medical statements, recommendations, translations, names, addresses,
coordinates, phone numbers, hours, dates, temperatures, distances, URLs,
sources, tools, or fields. Do not infer an official warning, route, travel time,
availability, or diagnosis. The backend owns priority, policy, candidate
eligibility, factual text, and every public response value.
"""

PLAN_REFUSED_CODE = "action_plan_generation_refused"
PLAN_REFUSED_MESSAGE = "Action-plan generation was refused."
PLAN_INVALID_RESPONSE_CODE = "action_plan_generation_invalid_response"
PLAN_INVALID_RESPONSE_MESSAGE = "Action-plan generation returned an unusable response."
PLAN_NOT_CONFIGURED_CODE = "action_plan_generation_not_configured"
PLAN_NOT_CONFIGURED_MESSAGE = "Action-plan generation is not configured."
PLAN_UNAVAILABLE_CODE = "action_plan_generation_unavailable"
PLAN_UNAVAILABLE_MESSAGE = "Action-plan generation is temporarily unavailable."
PLAN_TIMEOUT_CODE = "action_plan_generation_timeout"
PLAN_TIMEOUT_MESSAGE = "Action-plan generation timed out."

NowActionCode = Literal[
    "move_to_cooler_space",
    "reduce_physical_effort",
    "drink_water",
    "use_available_home_cooling",
    "contact_support_person",
    "remain_at_current_location",
    "travel_to_selected_place",
]
NextFewHoursActionCode = Literal[
    "keep_drinking_water",
    "stay_in_cool_space",
    "check_updated_weather",
    "check_on_household_members",
    "prepare_for_tonight",
]
TonightActionCode = Literal[
    "ventilate_when_outside_is_cooler",
    "sleep_in_coolest_available_room",
    "keep_water_nearby",
    "check_updated_weather_tonight",
]
BringItemCode = Literal[
    "water",
    "phone",
    "keys",
    "light_clothing",
]
ExplanationReasonCode = Literal[
    "forecast_at_or_above_36c",
    "forecast_at_or_above_34c",
    "reported_vulnerability",
    "no_home_cooling",
    "temporary_or_unsheltered_housing",
    "reported_mobility_constraint",
    "verified_open_candidate",
    "travel_support_required",
    "movement_prohibited",
    "unresolved_travel_constraint",
    "baseline_monitoring",
]
LocalPhraseCode = Literal[
    "spanish_request_cool_space",
    "spanish_request_accessible_entry",
    "catalan_request_cool_space",
    "catalan_request_accessible_entry",
]

NOW_ACTION_ORDER: tuple[NowActionCode, ...] = (
    "move_to_cooler_space",
    "reduce_physical_effort",
    "drink_water",
    "use_available_home_cooling",
    "contact_support_person",
    "remain_at_current_location",
    "travel_to_selected_place",
)
NEXT_FEW_HOURS_ACTION_ORDER: tuple[NextFewHoursActionCode, ...] = (
    "keep_drinking_water",
    "stay_in_cool_space",
    "check_updated_weather",
    "check_on_household_members",
    "prepare_for_tonight",
)
TONIGHT_ACTION_ORDER: tuple[TonightActionCode, ...] = (
    "ventilate_when_outside_is_cooler",
    "sleep_in_coolest_available_room",
    "keep_water_nearby",
    "check_updated_weather_tonight",
)
BRING_ITEM_ORDER: tuple[BringItemCode, ...] = (
    "water",
    "phone",
    "keys",
    "light_clothing",
)
EXPLANATION_REASON_ORDER: tuple[ExplanationReasonCode, ...] = (
    "forecast_at_or_above_36c",
    "forecast_at_or_above_34c",
    "reported_vulnerability",
    "no_home_cooling",
    "temporary_or_unsheltered_housing",
    "reported_mobility_constraint",
    "verified_open_candidate",
    "travel_support_required",
    "movement_prohibited",
    "unresolved_travel_constraint",
    "baseline_monitoring",
)
LOCAL_PHRASE_ORDER: tuple[LocalPhraseCode, ...] = (
    "spanish_request_cool_space",
    "spanish_request_accessible_entry",
    "catalan_request_cool_space",
    "catalan_request_accessible_entry",
)


class StrictModel(BaseModel):
    """Strict immutable base for plan-facing and internal contracts."""

    model_config = ConfigDict(
        extra="forbid",
        strict=True,
        frozen=True,
        validate_default=True,
    )


StringValue = TypeVar("StringValue", bound=str)


def _require_canonical_unique_order(
    values: list[StringValue],
    canonical_order: tuple[StringValue, ...],
) -> list[StringValue]:
    if len(values) != len(set(values)):
        raise ValueError("codes must not contain duplicates")
    positions = {value: index for index, value in enumerate(canonical_order)}
    if values != sorted(values, key=positions.__getitem__):
        raise ValueError("codes must use backend-defined canonical order")
    return values


class ModelNowPhase(StrictModel):
    action_codes: Annotated[
        list[NowActionCode],
        Field(min_length=1, max_length=len(NOW_ACTION_ORDER)),
    ]

    @field_validator("action_codes")
    @classmethod
    def validate_codes(cls, values: list[NowActionCode]) -> list[NowActionCode]:
        return _require_canonical_unique_order(values, NOW_ACTION_ORDER)


class ModelNextFewHoursPhase(StrictModel):
    action_codes: Annotated[
        list[NextFewHoursActionCode],
        Field(min_length=1, max_length=len(NEXT_FEW_HOURS_ACTION_ORDER)),
    ]

    @field_validator("action_codes")
    @classmethod
    def validate_codes(
        cls,
        values: list[NextFewHoursActionCode],
    ) -> list[NextFewHoursActionCode]:
        return _require_canonical_unique_order(
            values,
            NEXT_FEW_HOURS_ACTION_ORDER,
        )


class ModelTonightPhase(StrictModel):
    action_codes: Annotated[
        list[TonightActionCode],
        Field(min_length=1, max_length=len(TONIGHT_ACTION_ORDER)),
    ]

    @field_validator("action_codes")
    @classmethod
    def validate_codes(
        cls,
        values: list[TonightActionCode],
    ) -> list[TonightActionCode]:
        return _require_canonical_unique_order(values, TONIGHT_ACTION_ORDER)


class ModelGroundedPlan(StrictModel):
    """Closed Structured Output containing codes and one scoped ID only."""

    now: ModelNowPhase
    next_few_hours: ModelNextFewHoursPhase
    tonight: ModelTonightPhase
    bring_items: Annotated[
        list[BringItemCode],
        Field(max_length=len(BRING_ITEM_ORDER)),
    ]
    explanation_reasons: Annotated[
        list[ExplanationReasonCode],
        Field(min_length=1, max_length=len(EXPLANATION_REASON_ORDER)),
    ]
    local_phrase_code: LocalPhraseCode | None
    selected_place_id: Annotated[
        str | None,
        Field(min_length=1, max_length=64),
    ]

    @field_validator("bring_items")
    @classmethod
    def validate_bring_items(
        cls,
        values: list[BringItemCode],
    ) -> list[BringItemCode]:
        return _require_canonical_unique_order(values, BRING_ITEM_ORDER)

    @field_validator("explanation_reasons")
    @classmethod
    def validate_explanation_reasons(
        cls,
        values: list[ExplanationReasonCode],
    ) -> list[ExplanationReasonCode]:
        return _require_canonical_unique_order(values, EXPLANATION_REASON_ORDER)

    @model_validator(mode="after")
    def validate_static_place_pairing(self) -> ModelGroundedPlan:
        has_travel = "travel_to_selected_place" in self.now.action_codes
        has_selected_place = self.selected_place_id is not None
        if has_travel != has_selected_place:
            raise ValueError(
                "travel action and selected_place_id must appear together"
            )
        if has_travel and "remain_at_current_location" in self.now.action_codes:
            raise ValueError("travel and remain actions are incompatible")
        if has_travel:
            if self.local_phrase_code is None:
                raise ValueError("travel requires a local phrase")
            if not {"water", "phone"}.issubset(self.bring_items):
                raise ValueError("travel requires water and phone preparation")
        elif self.bring_items or self.local_phrase_code is not None:
            raise ValueError(
                "non-travel output must not include bring items or a local phrase"
            )
        return self


class GroundedWeatherFacts(StrictModel):
    current_temperature_c: Annotated[
        float,
        Field(ge=-100.0, le=70.0, allow_inf_nan=False),
    ]
    current_apparent_temperature_c: Annotated[
        float,
        Field(ge=-120.0, le=80.0, allow_inf_nan=False),
    ]
    relative_humidity_pct: Annotated[
        float,
        Field(ge=0.0, le=100.0, allow_inf_nan=False),
    ]
    same_day_max_temperature_c: Annotated[
        float,
        Field(ge=-100.0, le=70.0, allow_inf_nan=False),
    ]
    same_day_max_apparent_temperature_c: Annotated[
        float,
        Field(ge=-120.0, le=80.0, allow_inf_nan=False),
    ]
    same_day_max_uv_index: Annotated[
        float,
        Field(ge=0.0, le=100.0, allow_inf_nan=False),
    ]

    @model_validator(mode="after")
    def validate_daily_maxima(self) -> GroundedWeatherFacts:
        if self.same_day_max_temperature_c < self.current_temperature_c:
            raise ValueError("same-day maximum cannot be below current temperature")
        if (
            self.same_day_max_apparent_temperature_c
            < self.current_apparent_temperature_c
        ):
            raise ValueError(
                "same-day apparent maximum cannot be below current apparent temperature"
            )
        return self


GroundedPriorityReasonCode = Literal[
    "forecast_at_or_above_36c",
    "forecast_at_or_above_34c",
    "reported_vulnerability",
    "no_home_cooling",
    "temporary_or_unsheltered_housing",
    "reported_mobility_constraint",
    "baseline_monitoring",
]
GROUNDED_PRIORITY_REASON_ORDER: tuple[GroundedPriorityReasonCode, ...] = (
    "forecast_at_or_above_36c",
    "forecast_at_or_above_34c",
    "reported_vulnerability",
    "no_home_cooling",
    "temporary_or_unsheltered_housing",
    "reported_mobility_constraint",
    "baseline_monitoring",
)


class GroundedPriorityFacts(StrictModel):
    priority: Literal["act_now", "prepare_now", "monitor_and_prepare"]
    reason_codes: Annotated[
        list[GroundedPriorityReasonCode],
        Field(min_length=1, max_length=len(GROUNDED_PRIORITY_REASON_ORDER)),
    ]

    @field_validator("reason_codes")
    @classmethod
    def validate_reason_codes(
        cls,
        values: list[GroundedPriorityReasonCode],
    ) -> list[GroundedPriorityReasonCode]:
        return _require_canonical_unique_order(
            values,
            GROUNDED_PRIORITY_REASON_ORDER,
        )


class GroundedCandidateFacts(StrictModel):
    place_id: Annotated[str, Field(min_length=1, max_length=64)]
    distance_m: Annotated[int, Field(ge=0)]
    closes_at: AwareDatetime
    accessibility: bool | None
    indoor_space: bool | None
    potable_water: bool | None
    toilets: bool | None
    micro_shelter: bool | None
    pets_allowed: bool | None


class AllowedPlanCodes(StrictModel):
    now: list[NowActionCode]
    next_few_hours: list[NextFewHoursActionCode]
    tonight: list[TonightActionCode]
    bring_items: list[BringItemCode]
    explanation_reasons: list[ExplanationReasonCode]
    local_phrases: list[LocalPhraseCode]

    @field_validator("now")
    @classmethod
    def validate_now(cls, values: list[NowActionCode]) -> list[NowActionCode]:
        return _require_canonical_unique_order(values, NOW_ACTION_ORDER)

    @field_validator("next_few_hours")
    @classmethod
    def validate_next(
        cls,
        values: list[NextFewHoursActionCode],
    ) -> list[NextFewHoursActionCode]:
        return _require_canonical_unique_order(values, NEXT_FEW_HOURS_ACTION_ORDER)

    @field_validator("tonight")
    @classmethod
    def validate_tonight(
        cls,
        values: list[TonightActionCode],
    ) -> list[TonightActionCode]:
        return _require_canonical_unique_order(values, TONIGHT_ACTION_ORDER)

    @field_validator("bring_items")
    @classmethod
    def validate_items(cls, values: list[BringItemCode]) -> list[BringItemCode]:
        return _require_canonical_unique_order(values, BRING_ITEM_ORDER)

    @field_validator("explanation_reasons")
    @classmethod
    def validate_reasons(
        cls,
        values: list[ExplanationReasonCode],
    ) -> list[ExplanationReasonCode]:
        return _require_canonical_unique_order(values, EXPLANATION_REASON_ORDER)

    @field_validator("local_phrases")
    @classmethod
    def validate_phrases(
        cls,
        values: list[LocalPhraseCode],
    ) -> list[LocalPhraseCode]:
        return _require_canonical_unique_order(values, LOCAL_PHRASE_ORDER)


class RequiredPlanCodes(StrictModel):
    """Backend-owned minimum safety semantics the model may not omit."""

    now: list[NowActionCode]
    next_few_hours: list[NextFewHoursActionCode]
    tonight: list[TonightActionCode]
    explanation_reasons: list[ExplanationReasonCode]

    @field_validator("now")
    @classmethod
    def validate_now(cls, values: list[NowActionCode]) -> list[NowActionCode]:
        return _require_canonical_unique_order(values, NOW_ACTION_ORDER)

    @field_validator("next_few_hours")
    @classmethod
    def validate_next(
        cls,
        values: list[NextFewHoursActionCode],
    ) -> list[NextFewHoursActionCode]:
        return _require_canonical_unique_order(values, NEXT_FEW_HOURS_ACTION_ORDER)

    @field_validator("tonight")
    @classmethod
    def validate_tonight(
        cls,
        values: list[TonightActionCode],
    ) -> list[TonightActionCode]:
        return _require_canonical_unique_order(values, TONIGHT_ACTION_ORDER)

    @field_validator("explanation_reasons")
    @classmethod
    def validate_reasons(
        cls,
        values: list[ExplanationReasonCode],
    ) -> list[ExplanationReasonCode]:
        return _require_canonical_unique_order(values, EXPLANATION_REASON_ORDER)


_CANONICAL_REQUIRED_NOW: tuple[NowActionCode, ...] = (
    "move_to_cooler_space",
    "reduce_physical_effort",
    "drink_water",
)
_CANONICAL_REQUIRED_NEXT: dict[
    Literal["act_now", "prepare_now", "monitor_and_prepare"],
    tuple[NextFewHoursActionCode, ...],
] = {
    "act_now": (
        "keep_drinking_water",
        "stay_in_cool_space",
        "check_updated_weather",
    ),
    "prepare_now": (
        "keep_drinking_water",
        "check_updated_weather",
        "prepare_for_tonight",
    ),
    "monitor_and_prepare": (
        "check_updated_weather",
        "prepare_for_tonight",
    ),
}
_CANONICAL_REQUIRED_TONIGHT: dict[
    Literal["act_now", "prepare_now", "monitor_and_prepare"],
    tuple[TonightActionCode, ...],
] = {
    "act_now": (
        "sleep_in_coolest_available_room",
        "keep_water_nearby",
        "check_updated_weather_tonight",
    ),
    "prepare_now": (
        "sleep_in_coolest_available_room",
        "keep_water_nearby",
        "check_updated_weather_tonight",
    ),
    "monitor_and_prepare": (
        "keep_water_nearby",
        "check_updated_weather_tonight",
    ),
}


def canonical_required_plan_codes(
    *,
    priority: Literal["act_now", "prepare_now", "monitor_and_prepare"],
    priority_reason_codes: list[GroundedPriorityReasonCode],
    movement_prohibited: bool,
    travel_support_required: bool,
    travel_compatibility_unproven: bool,
    unsheltered: bool,
) -> RequiredPlanCodes:
    """Return the one backend-owned normal-plan safety minimum."""

    now = set(_CANONICAL_REQUIRED_NOW)
    if movement_prohibited:
        now.add("remain_at_current_location")
    if travel_support_required:
        now.add("contact_support_person")

    tonight = set(_CANONICAL_REQUIRED_TONIGHT[priority])
    if unsheltered:
        tonight.discard("sleep_in_coolest_available_room")
        tonight.discard("ventilate_when_outside_is_cooler")

    reasons: set[ExplanationReasonCode] = set(priority_reason_codes)
    if movement_prohibited:
        reasons.add("movement_prohibited")
    if travel_support_required:
        reasons.add("travel_support_required")
    if travel_compatibility_unproven:
        reasons.add("unresolved_travel_constraint")

    return RequiredPlanCodes(
        now=[code for code in NOW_ACTION_ORDER if code in now],
        next_few_hours=list(_CANONICAL_REQUIRED_NEXT[priority]),
        tonight=[code for code in TONIGHT_ACTION_ORDER if code in tonight],
        explanation_reasons=[
            code for code in EXPLANATION_REASON_ORDER if code in reasons
        ],
    )


class GroundedPlanContext(StrictModel):
    """Minimized backend-owned facts visible to the second model call."""

    situation: ModelSituationExtraction
    weather: GroundedWeatherFacts
    priority: GroundedPriorityFacts
    candidates: Annotated[list[GroundedCandidateFacts], Field(max_length=3)]
    movement_prohibited: bool
    travel_support_required: bool
    travel_compatibility_unproven: bool
    allowed_codes: AllowedPlanCodes
    required_codes: RequiredPlanCodes

    @model_validator(mode="after")
    def validate_context(self) -> GroundedPlanContext:
        candidate_ids = [candidate.place_id for candidate in self.candidates]
        if len(candidate_ids) != len(set(candidate_ids)):
            raise ValueError("request-scoped candidate IDs must be unique")
        for field_name in (
            "now",
            "next_few_hours",
            "tonight",
            "bring_items",
            "explanation_reasons",
            "local_phrases",
        ):
            values = getattr(self.allowed_codes, field_name)
            if len(values) != len(set(values)):
                raise ValueError("allowed code lists must be unique")

        required_allowed_pairs = (
            (self.required_codes.now, self.allowed_codes.now),
            (
                self.required_codes.next_few_hours,
                self.allowed_codes.next_few_hours,
            ),
            (self.required_codes.tonight, self.allowed_codes.tonight),
            (
                self.required_codes.explanation_reasons,
                self.allowed_codes.explanation_reasons,
            ),
        )
        if any(
            any(code not in allowed for code in required)
            for required, allowed in required_allowed_pairs
        ):
            raise ValueError("required codes must be allowed")
        unsheltered = (
            self.situation.housing_situation.status == "reported"
            and self.situation.housing_situation.value == "unsheltered"
        )
        canonical_required = canonical_required_plan_codes(
            priority=self.priority.priority,
            priority_reason_codes=self.priority.reason_codes,
            movement_prohibited=self.movement_prohibited,
            travel_support_required=self.travel_support_required,
            travel_compatibility_unproven=self.travel_compatibility_unproven,
            unsheltered=unsheltered,
        )
        if self.required_codes != canonical_required:
            raise ValueError("required codes must equal the canonical safety matrix")
        if (
            self.movement_prohibited or self.travel_compatibility_unproven
        ) and self.candidates:
            raise ValueError("travel-ineligible context must not expose candidates")
        return self


class GroundedPlanUsage(StrictModel):
    model: str
    input_tokens: int | None
    output_tokens: int | None
    total_tokens: int | None


class GroundedPlanGeneration(StrictModel):
    plan: ModelGroundedPlan
    usage: GroundedPlanUsage
    payload_bytes: Annotated[int, Field(ge=0, le=GROUNDED_PLAN_MAX_PAYLOAD_BYTES)]


class GroundedPlanFailure(Exception):
    """Stable HeatRelay-owned plan-stage failure."""

    status_code: int
    code: str
    message: str

    def __init__(self) -> None:
        super().__init__(self.message)


class GroundedPlanRefused(GroundedPlanFailure):
    status_code = 502
    code = PLAN_REFUSED_CODE
    message = PLAN_REFUSED_MESSAGE


class GroundedPlanInvalidResponse(GroundedPlanFailure):
    status_code = 502
    code = PLAN_INVALID_RESPONSE_CODE
    message = PLAN_INVALID_RESPONSE_MESSAGE


class GroundedPlanNotConfigured(GroundedPlanFailure):
    status_code = 503
    code = PLAN_NOT_CONFIGURED_CODE
    message = PLAN_NOT_CONFIGURED_MESSAGE


class GroundedPlanUnavailable(GroundedPlanFailure):
    status_code = 503
    code = PLAN_UNAVAILABLE_CODE
    message = PLAN_UNAVAILABLE_MESSAGE


class GroundedPlanTimeout(GroundedPlanFailure):
    status_code = 504
    code = PLAN_TIMEOUT_CODE
    message = PLAN_TIMEOUT_MESSAGE


def serialize_grounded_context(context: GroundedPlanContext) -> str:
    """Return deterministic compact JSON for the backend-owned model input."""

    return json.dumps(
        context.model_dump(mode="json"),
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
    )


def grounded_model_input(
    context: GroundedPlanContext,
    *,
    instruction: str = GROUNDED_PLAN_INSTRUCTION,
) -> list[dict[str, object]]:
    """Build the exact application-owned input passed to Responses.parse."""

    return [
        {
            "role": "developer",
            "content": [{"type": "input_text", "text": instruction}],
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "input_text",
                    "text": serialize_grounded_context(context),
                }
            ],
        },
    ]


def grounded_strict_response_format() -> dict[str, object]:
    """Return the full strict JSON-schema wrapper represented by text_format."""

    return {
        "type": "json_schema",
        "name": ModelGroundedPlan.__name__,
        "strict": True,
        "schema": ModelGroundedPlan.model_json_schema(),
    }


def grounded_model_visible_request(
    context: GroundedPlanContext,
    *,
    instruction: str = GROUNDED_PLAN_INSTRUCTION,
) -> dict[str, object]:
    """Build every application-defined model-visible request component."""

    return {
        "input": grounded_model_input(context, instruction=instruction),
        "text": {"format": grounded_strict_response_format()},
    }


def grounded_payload_size_bytes(
    context: GroundedPlanContext,
    *,
    instruction: str = GROUNDED_PLAN_INSTRUCTION,
) -> int:
    """Bound all application-supplied model-visible text and schema bytes."""

    return len(
        json.dumps(
            grounded_model_visible_request(context, instruction=instruction),
            ensure_ascii=False,
            separators=(",", ":"),
            sort_keys=True,
        ).encode("utf-8")
    )


def configured_cost_bound_usd(max_payload_bytes: int) -> float:
    """Conservatively treat each UTF-8 byte as one billable input token."""

    input_cost = (
        max_payload_bytes
        * GROUNDED_PLAN_STANDARD_INPUT_USD_PER_MILLION
        / 1_000_000
    )
    output_cost = (
        GROUNDED_PLAN_MAX_OUTPUT_TOKENS
        * GROUNDED_PLAN_STANDARD_OUTPUT_USD_PER_MILLION
        / 1_000_000
    )
    return input_cost + output_cost


def validate_grounded_plan(
    plan: ModelGroundedPlan,
    context: GroundedPlanContext,
) -> ModelGroundedPlan:
    """Enforce request-time whitelist and branch invariants without repair."""

    try:
        context = GroundedPlanContext.model_validate_json(
            context.model_dump_json()
        )
        validated = ModelGroundedPlan.model_validate_json(plan.model_dump_json())
    except (ValidationError, ValueError, TypeError) as error:
        raise GroundedPlanInvalidResponse() from error

    allowed = context.allowed_codes
    allowed_pairs: tuple[tuple[list[str], list[str]], ...] = (
        (validated.now.action_codes, allowed.now),
        (validated.next_few_hours.action_codes, allowed.next_few_hours),
        (validated.tonight.action_codes, allowed.tonight),
        (validated.bring_items, allowed.bring_items),
        (validated.explanation_reasons, allowed.explanation_reasons),
    )
    if any(
        any(code not in allowed_codes for code in selected_codes)
        for selected_codes, allowed_codes in allowed_pairs
    ):
        raise GroundedPlanInvalidResponse()
    if (
        validated.local_phrase_code is not None
        and validated.local_phrase_code not in allowed.local_phrases
    ):
        raise GroundedPlanInvalidResponse()

    required = context.required_codes
    required_pairs: tuple[tuple[list[str], list[str]], ...] = (
        (required.now, validated.now.action_codes),
        (required.next_few_hours, validated.next_few_hours.action_codes),
        (required.tonight, validated.tonight.action_codes),
        (required.explanation_reasons, validated.explanation_reasons),
    )
    if any(
        any(code not in selected for code in required_codes)
        for required_codes, selected in required_pairs
    ):
        raise GroundedPlanInvalidResponse()

    selected_id = validated.selected_place_id
    candidate_ids = tuple(candidate.place_id for candidate in context.candidates)
    has_travel = "travel_to_selected_place" in validated.now.action_codes

    if selected_id is not None and selected_id not in candidate_ids:
        raise GroundedPlanInvalidResponse()
    if context.movement_prohibited or not candidate_ids:
        if selected_id is not None or has_travel:
            raise GroundedPlanInvalidResponse()
    if context.movement_prohibited and (
        "remain_at_current_location" not in validated.now.action_codes
    ):
        raise GroundedPlanInvalidResponse()
    if context.travel_compatibility_unproven and (
        selected_id is not None or has_travel
    ):
        raise GroundedPlanInvalidResponse()
    if context.travel_support_required and has_travel:
        try:
            support_index = validated.now.action_codes.index(
                "contact_support_person"
            )
            travel_index = validated.now.action_codes.index(
                "travel_to_selected_place"
            )
        except ValueError as error:
            raise GroundedPlanInvalidResponse() from error
        if support_index >= travel_index:
            raise GroundedPlanInvalidResponse()
    has_verified_candidate_reason = (
        "verified_open_candidate" in validated.explanation_reasons
    )
    if has_verified_candidate_reason != (selected_id is not None):
        raise GroundedPlanInvalidResponse()
    exact_branch_reasons = {
        "movement_prohibited": context.movement_prohibited,
        "travel_support_required": context.travel_support_required,
        "unresolved_travel_constraint": context.travel_compatibility_unproven,
    }
    if any(
        (code in validated.explanation_reasons) != applies
        for code, applies in exact_branch_reasons.items()
    ):
        raise GroundedPlanInvalidResponse()
    return validated


logger = logging.getLogger(__name__)
usage_logger = logging.getLogger("uvicorn.error.heatrelay.usage")


def _consume_provider_call_result(task: asyncio.Task[Any]) -> None:
    try:
        error = task.exception()
    except asyncio.CancelledError:
        return
    except BaseException:
        logger.warning("Grounded plan provider task failed after timeout")
        return
    if error is not None:
        logger.warning("Grounded plan provider task failed after timeout")


def _detach_provider_call(task: asyncio.Task[Any]) -> None:
    task.add_done_callback(_consume_provider_call_result)


async def _await_provider_response_with_bounded_wait(
    response_awaitable: Any,
    timeout_seconds: float,
    capacity_lease: TaskCapacityLease,
) -> object:
    """Bound request-path waiting even if provider cancellation is resisted."""

    if timeout_seconds <= 0:
        capacity_lease.release()
        close_unstarted_awaitable(response_awaitable)
        logger.warning("Grounded plan request timed out")
        raise GroundedPlanTimeout()

    try:
        response_task = asyncio.create_task(
            response_awaitable,
            name="heatrelay-grounded-plan-provider-call",
        )
        capacity_lease.bind(response_task)
    except BaseException:
        capacity_lease.release()
        close_unstarted_awaitable(response_awaitable)
        raise
    try:
        done, _ = await asyncio.wait({response_task}, timeout=timeout_seconds)
    except asyncio.CancelledError:
        _detach_provider_call(response_task)
        response_task.cancel()
        raise
    if response_task in done:
        try:
            return response_task.result()
        except asyncio.CancelledError as error:
            raise GroundedPlanTimeout() from error

    logger.warning("Grounded plan request timed out")
    _detach_provider_call(response_task)
    response_task.cancel()
    raise GroundedPlanTimeout()


async def _close_client_with_bounded_wait(
    client: Any,
    timeout_seconds: float,
    cleanup_lease: TaskCapacityLease,
) -> None:
    """Delegate one pre-reserved cleanup to the shared bounded runtime."""

    await close_reserved_openai_client(
        client,
        timeout_seconds,
        cleanup_lease,
        task_name="heatrelay-grounded-plan-client-cleanup",
        timeout_warning="Grounded plan client cleanup timed out",
        failure_warning="Grounded plan client cleanup failed",
        logger=logger,
    )


def _safe_text_metadata(value: object) -> str:
    if isinstance(value, str) and value in (
        GROUNDED_PLAN_MODEL,
        "gpt-5.6-sol",
    ):
        return value
    return "unavailable"


def _safe_token_count(value: object) -> int | None:
    if type(value) is int and 0 <= value <= 10_000_000:
        return value
    return None


def _safe_usage(response: object) -> GroundedPlanUsage:
    usage = getattr(response, "usage", None)
    return GroundedPlanUsage(
        model=_safe_text_metadata(getattr(response, "model", None)),
        input_tokens=_safe_token_count(getattr(usage, "input_tokens", None)),
        output_tokens=_safe_token_count(getattr(usage, "output_tokens", None)),
        total_tokens=_safe_token_count(getattr(usage, "total_tokens", None)),
    )


def _validated_parsed_output(response: object) -> ModelGroundedPlan:
    if getattr(response, "error", None) is not None or getattr(
        response,
        "status",
        None,
    ) == "failed":
        raise GroundedPlanUnavailable()
    if (
        getattr(response, "status", None) == "incomplete"
        or getattr(response, "incomplete_details", None) is not None
    ):
        raise GroundedPlanInvalidResponse()
    if getattr(response, "status", None) != "completed":
        raise GroundedPlanInvalidResponse()

    output = getattr(response, "output", None)
    if not isinstance(output, list):
        raise GroundedPlanInvalidResponse()
    parsed_outputs: list[object] = []
    saw_invalid_content = False
    saw_refusal = False
    for output_item in output:
        output_type = getattr(output_item, "type", None)
        if output_type == "reasoning":
            continue
        if output_type != "message":
            saw_invalid_content = True
            continue
        content_items = getattr(output_item, "content", None)
        if not isinstance(content_items, list) or not content_items:
            saw_invalid_content = True
            continue
        for content_item in content_items:
            content_type = getattr(content_item, "type", None)
            if content_type == "refusal":
                saw_refusal = True
                continue
            if content_type != "output_text":
                saw_invalid_content = True
                continue
            parsed = getattr(content_item, "parsed", None)
            if parsed is None:
                saw_invalid_content = True
                continue
            parsed_outputs.append(parsed)
    if saw_refusal:
        raise GroundedPlanRefused()
    if saw_invalid_content or len(parsed_outputs) != 1:
        raise GroundedPlanInvalidResponse()

    parsed = parsed_outputs[0]
    if not isinstance(parsed, ModelGroundedPlan):
        raise GroundedPlanInvalidResponse()
    try:
        return ModelGroundedPlan.model_validate_json(parsed.model_dump_json())
    except (ValidationError, ValueError, TypeError) as error:
        raise GroundedPlanInvalidResponse() from error


class GroundedPlanService:
    """Injected adapter for exactly one bounded grounded-plan model call."""

    def __init__(
        self,
        *,
        api_key: str | None,
        client_factory: Callable[..., Any] = AsyncOpenAI,
        sdk_timeout_seconds: float = GROUNDED_PLAN_SDK_TIMEOUT_SECONDS,
        overall_timeout_seconds: float = GROUNDED_PLAN_OVERALL_TIMEOUT_SECONDS,
        cleanup_timeout_seconds: float = GROUNDED_PLAN_CLEANUP_TIMEOUT_SECONDS,
        max_payload_bytes: int = GROUNDED_PLAN_MAX_PAYLOAD_BYTES,
        provider_capacity: BoundedTaskCapacity = SHARED_OPENAI_PROVIDER_CAPACITY,
        cleanup_capacity: BoundedTaskCapacity = (
            SHARED_OPENAI_CLIENT_CLEANUP_CAPACITY
        ),
    ) -> None:
        for name, value in (
            ("sdk_timeout_seconds", sdk_timeout_seconds),
            ("overall_timeout_seconds", overall_timeout_seconds),
            ("cleanup_timeout_seconds", cleanup_timeout_seconds),
        ):
            if not math.isfinite(value) or value <= 0:
                raise ValueError(f"{name} must be positive and finite")
        if type(max_payload_bytes) is not int or not 1 <= max_payload_bytes <= 20_000:
            raise ValueError("max_payload_bytes must be between 1 and 20000")
        if configured_cost_bound_usd(max_payload_bytes) > GROUNDED_PLAN_COST_CEILING_USD:
            raise ValueError("configured plan cost bound exceeds the ceiling")
        self._api_key = api_key
        self._client_factory = client_factory
        self._sdk_timeout_seconds = sdk_timeout_seconds
        self._overall_timeout_seconds = overall_timeout_seconds
        self._cleanup_timeout_seconds = cleanup_timeout_seconds
        self._max_payload_bytes = max_payload_bytes
        self._provider_capacity = provider_capacity
        self._cleanup_capacity = cleanup_capacity

    def _create_client(self) -> Any:
        return self._client_factory(
            api_key=self._api_key,
            base_url=OPENAI_API_BASE_URL,
            timeout=self._sdk_timeout_seconds,
            max_retries=0,
        )

    async def generate(
        self,
        context: GroundedPlanContext,
    ) -> GroundedPlanGeneration:
        if self._api_key is None or not self._api_key.strip():
            raise GroundedPlanNotConfigured()

        try:
            context = GroundedPlanContext.model_validate_json(
                context.model_dump_json()
            )
        except (ValidationError, ValueError, TypeError) as error:
            raise GroundedPlanInvalidResponse() from error

        payload_bytes = grounded_payload_size_bytes(context)
        if payload_bytes > self._max_payload_bytes:
            raise GroundedPlanInvalidResponse()
        model_input = grounded_model_input(context)

        reservations = try_reserve_openai_client(
            self._provider_capacity,
            self._cleanup_capacity,
        )
        if reservations is None:
            raise GroundedPlanUnavailable()

        loop = asyncio.get_running_loop()
        request_deadline = loop.time() + self._overall_timeout_seconds
        client: Any | None = None
        provider_lease_transferred = False
        try:
            client = self._create_client()
            response_awaitable = client.responses.parse(
                model=GROUNDED_PLAN_MODEL,
                input=model_input,
                text_format=ModelGroundedPlan,
                reasoning={"effort": "none"},
                max_output_tokens=GROUNDED_PLAN_MAX_OUTPUT_TOKENS,
                store=False,
                prompt_cache_options={"mode": "explicit"},
                service_tier="default",
            )
            provider_lease_transferred = True
            response = await _await_provider_response_with_bounded_wait(
                response_awaitable,
                max(0.0, request_deadline - loop.time()),
                reservations.provider,
            )
        except (asyncio.TimeoutError, TimeoutError, APITimeoutError) as error:
            raise GroundedPlanTimeout() from error
        except (
            LengthFinishReasonError,
            ContentFilterFinishReasonError,
            ValidationError,
        ) as error:
            raise GroundedPlanInvalidResponse() from error
        except (
            AuthenticationError,
            PermissionDeniedError,
            RateLimitError,
            BadRequestError,
            InternalServerError,
            APIStatusError,
            APIConnectionError,
            APIError,
            OpenAIError,
        ) as error:
            raise GroundedPlanUnavailable() from error
        except GroundedPlanFailure:
            raise
        except Exception as error:
            raise GroundedPlanUnavailable() from error
        finally:
            if not provider_lease_transferred:
                reservations.provider.release()
            if client is not None:
                await _close_client_with_bounded_wait(
                    client,
                    self._cleanup_timeout_seconds,
                    reservations.cleanup,
                )
            else:
                reservations.cleanup.release()

        plan = validate_grounded_plan(_validated_parsed_output(response), context)
        usage = _safe_usage(response)
        usage_logger.info(
            "Grounded plan completed model=%s input_tokens=%s "
            "output_tokens=%s total_tokens=%s payload_bytes=%s",
            usage.model,
            usage.input_tokens,
            usage.output_tokens,
            usage.total_tokens,
            payload_bytes,
        )
        return GroundedPlanGeneration(
            plan=plan,
            usage=usage,
            payload_bytes=payload_bytes,
        )
