"""Server-owned Barcelona action policy and grounded-plan workflow."""

from __future__ import annotations

from collections.abc import Callable, Mapping
from datetime import date, datetime, timedelta, timezone
from typing import Annotated, Literal, get_args

from pydantic import (
    AwareDatetime,
    BaseModel,
    ConfigDict,
    Field,
    TypeAdapter,
    ValidationError,
    field_validator,
    model_validator,
)

from backend.app.action_plan_catalog import (
    ACTION_PLAN_CATALOGS,
    FIXED_LOCAL_PHRASES,
    ActionPlanCatalog,
    get_action_plan_catalog,
)
from backend.app.localization import (
    DEFAULT_OUTPUT_LOCALE,
    OutputLocale,
    require_supported_output_locale,
)
from backend.app.grounded_plan import (
    BRING_ITEM_ORDER,
    EXPLANATION_REASON_ORDER,
    NEXT_FEW_HOURS_ACTION_ORDER,
    NOW_ACTION_ORDER,
    TONIGHT_ACTION_ORDER,
    AllowedPlanCodes,
    BringItemCode,
    ExplanationReasonCode,
    GroundedCandidateFacts,
    GroundedPlanContext,
    GroundedPlanGeneration,
    GroundedPlanService,
    GroundedPriorityFacts,
    GroundedWeatherFacts,
    LocalPhraseCode,
    ModelGroundedPlan,
    NextFewHoursActionCode,
    NowActionCode,
    RequiredPlanCodes,
    TonightActionCode,
    canonical_required_plan_codes,
    validate_grounded_plan,
)
from backend.app.places import (
    MADRID_TIMEZONE,
    OFFICIAL_DATASET_URL,
    Address,
    CandidatePlace,
    HttpUrlString,
    NonBlankString,
    NonNegativeInteger,
    Origin,
    PlaceDataError,
    PlaceFeatures,
    PlaceRepository,
    PlacesCandidatesRequest,
    PlacesCandidatesResponse,
    RequiredFeatures,
    SnapshotProvenance,
    get_committed_snapshot_provenance,
    haversine_distance_m,
    validate_place_identifier_pair,
)
from backend.app.situation import (
    ModelSituationExtraction,
    ReportedSymptom,
    SYMPTOM_ORDER,
    SituationExtractionRequest,
    SituationExtractionResponse,
    SituationExtractionService,
    reconcile_source_reported_symptoms,
)
from backend.app.weather import (
    WEATHER_TIMEOUT_SECONDS,
    WeatherContextRequest,
    WeatherContextResponse,
    WeatherService,
)

ACTION_PLAN_ENDPOINT_PATH = "/api/v1/action-plan"
ACTION_PLAN_SCHEMA_VERSION = "1.16.0"
ACTION_POLICY_VERSION = "heatrelay-barcelona-action-policy-1.0.0"
DEFAULT_MAXIMUM_DISTANCE_M = 3_000
MINIMUM_DISTANCE_PREFERENCE_M = 100
MAXIMUM_DISTANCE_PREFERENCE_M = 10_000
MAX_MODEL_CANDIDATES = 3
WEATHER_MAX_OBSERVATION_AGE = timedelta(minutes=90)
WEATHER_MAX_FUTURE_OBSERVATION_SKEW = timedelta(minutes=5)
WEATHER_RETRIEVAL_WINDOW = timedelta(seconds=WEATHER_TIMEOUT_SECONDS + 1)


def _has_approved_snapshot_provenance(snapshot: SnapshotProvenance) -> bool:
    try:
        return snapshot == get_committed_snapshot_provenance()
    except PlaceDataError:
        return False

# This inclusive rectangle is a deliberately broad public-origin gate for the
# Barcelona pilot. It is not a municipal-boundary polygon. Keep these names
# separate from the source-record validation bounds in places.py even while
# their reviewed numeric values intentionally match.
BARCELONA_PILOT_ORIGIN_MIN_LATITUDE = 41.2
BARCELONA_PILOT_ORIGIN_MAX_LATITUDE = 41.6
BARCELONA_PILOT_ORIGIN_MIN_LONGITUDE = 1.9
BARCELONA_PILOT_ORIGIN_MAX_LONGITUDE = 2.4

FAN_COOLING_MAX_EXCLUSIVE_C = 40.0

INVALID_ACTION_PLAN_REQUEST_CODE = "invalid_action_plan_request"
INVALID_ACTION_PLAN_REQUEST_MESSAGE = "Action-plan request is invalid."
ACTION_PLAN_UNAVAILABLE_CODE = "action_plan_unavailable"
ACTION_PLAN_UNAVAILABLE_MESSAGE = "Action-plan workflow is temporarily unavailable."

_ENGLISH_ACTION_PLAN_CATALOG = get_action_plan_catalog("en")

# Compatibility aliases for existing backend consumers and tests. Each alias
# points into the one authoritative immutable English catalog.
MODEL_DERIVED_POLICY_NOTICE = _ENGLISH_ACTION_PLAN_CATALOG.policy_notice
NORMAL_PLAN_NOTICE = _ENGLISH_ACTION_PLAN_CATALOG.normal_notice
HOURS_REACHABILITY_NOTICE = (
    _ENGLISH_ACTION_PLAN_CATALOG.candidate_warnings["reachability"]
)
DISTANCE_NOTICE = _ENGLISH_ACTION_PLAN_CATALOG.candidate_warnings["distance"]
URGENT_MEDICAL_NOTICE = _ENGLISH_ACTION_PLAN_CATALOG.urgent_actions[
    "do_not_use_shelter_as_medical_substitute"
]
URGENT_NO_PLAN_NOTICE = _ENGLISH_ACTION_PLAN_CATALOG.urgent_notices[1]
MOVEMENT_PROHIBITED_EXPLANATION = (
    _ENGLISH_ACTION_PLAN_CATALOG.candidate_explanations[
        "movement_prohibited"
    ]
)
TRAVEL_COMPATIBILITY_UNPROVEN_EXPLANATION = (
    _ENGLISH_ACTION_PLAN_CATALOG.candidate_explanations[
        "unresolved_travel_compatibility"
    ]
)
TRAVEL_COMPATIBILITY_UNPROVEN_NOTICE = (
    _ENGLISH_ACTION_PLAN_CATALOG.unresolved_travel_notice
)
HOURS_WARNING = _ENGLISH_ACTION_PLAN_CATALOG.candidate_warnings["hours"]
CANDIDATE_NOTICE = _ENGLISH_ACTION_PLAN_CATALOG.candidate_warnings[
    "candidate_notice"
]
MATCH_EXPLANATION = _ENGLISH_ACTION_PLAN_CATALOG.candidate_explanations[
    "matched_candidate"
]
EMPTY_EXPLANATION = _ENGLISH_ACTION_PLAN_CATALOG.candidate_explanations[
    "no_candidate"
]


def _require_registered_catalog_value(
    value: str,
    selector: Callable[[ActionPlanCatalog], str],
    field_name: str,
) -> str:
    if any(
        value == selector(catalog)
        for catalog in ACTION_PLAN_CATALOGS.values()
    ):
        return value
    raise ValueError(f"{field_name} must equal a registered catalog value")


ActionPriority = Literal[
    "urgent_help",
    "act_now",
    "prepare_now",
    "monitor_and_prepare",
]
PriorityReasonCode = Literal[
    "reported_warning_symptom",
    "forecast_at_or_above_36c",
    "forecast_at_or_above_34c",
    "reported_vulnerability",
    "no_home_cooling",
    "temporary_or_unsheltered_housing",
    "reported_mobility_constraint",
    "baseline_monitoring",
]

PRIORITY_REASON_ORDER: tuple[PriorityReasonCode, ...] = (
    "reported_warning_symptom",
    "forecast_at_or_above_36c",
    "forecast_at_or_above_34c",
    "reported_vulnerability",
    "no_home_cooling",
    "temporary_or_unsheltered_housing",
    "reported_mobility_constraint",
    "baseline_monitoring",
)

UNIVERSAL_URGENT_112_SYMPTOMS: frozenset[ReportedSymptom] = frozenset(
    {
        "confusion",
        "fainting_or_loss_of_consciousness",
        "seizure",
        "difficulty_breathing",
        "chest_pain",
        "repeated_vomiting",
    }
)
_REPORTED_SYMPTOM_LITERAL_VALUES = frozenset(get_args(ReportedSymptom))
if (
    UNIVERSAL_URGENT_112_SYMPTOMS != _REPORTED_SYMPTOM_LITERAL_VALUES
    or UNIVERSAL_URGENT_112_SYMPTOMS != frozenset(SYMPTOM_ORDER)
):
    raise RuntimeError("urgent contact catalog must equal ReportedSymptom")


class StrictModel(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        strict=True,
        frozen=True,
        validate_default=True,
    )


class ActionPlanWorkflowUnavailable(Exception):
    """Stable server-owned failure for invalid workflow configuration."""

    status_code = 503
    code = ACTION_PLAN_UNAVAILABLE_CODE
    message = ACTION_PLAN_UNAVAILABLE_MESSAGE

    def __init__(self) -> None:
        super().__init__(self.message)


class ActionPlanRequest(StrictModel):
    """Only user-supplied fields accepted by the Barcelona workflow."""

    situation_text: str
    origin: Origin
    maximum_distance_m: Annotated[
        int,
        Field(
            ge=MINIMUM_DISTANCE_PREFERENCE_M,
            le=MAXIMUM_DISTANCE_PREFERENCE_M,
        ),
    ] = DEFAULT_MAXIMUM_DISTANCE_M
    output_locale: OutputLocale = DEFAULT_OUTPUT_LOCALE

    @field_validator("situation_text", mode="before")
    @classmethod
    def validate_situation_text(cls, value: object) -> str:
        return SituationExtractionRequest.validate_situation_text(value)

    @model_validator(mode="after")
    def enforce_barcelona_pilot(self) -> ActionPlanRequest:
        if not (
            BARCELONA_PILOT_ORIGIN_MIN_LATITUDE
            <= self.origin.latitude
            <= BARCELONA_PILOT_ORIGIN_MAX_LATITUDE
            and BARCELONA_PILOT_ORIGIN_MIN_LONGITUDE
            <= self.origin.longitude
            <= BARCELONA_PILOT_ORIGIN_MAX_LONGITUDE
        ):
            raise ValueError("action-plan origin must be within the Barcelona pilot")
        return self


class PolicySource(StrictModel):
    publisher: str
    url: str
    accessed_on: date
    heatrelay_rule: str


_POLICY_SOURCE_FACTS: tuple[tuple[str, str, date], ...] = (
    (
        "Ajuntament de Barcelona — Serveis Socials",
        (
            "https://ajuntament.barcelona.cat/serveissocials/es/noticia/"
            "crece-la-red-de-refugios-climaticos-para-protegerse-del-"
            "calor_1523924"
        ),
        date(2026, 7, 17),
    ),
    (
        "Ajuntament de Barcelona — Barcelona pel Clima",
        (
            "https://www.barcelona.cat/barcelona-pel-clima/ca/accions-"
            "concretes/xarxa-de-refugis-climatics"
        ),
        date(2026, 7, 17),
    ),
    (
        "Generalitat de Catalunya — Canal Salut",
        (
            "https://canalsalut.gencat.cat/ca/vida-saludable/consells-"
            "estacionals/estiu/calor/efectes-exces/"
        ),
        date(2026, 7, 17),
    ),
    (
        "Generalitat de Catalunya — 112 emergències",
        "https://112.gencat.cat/es/us-del-112/preguntes-frequeents/",
        date(2026, 7, 17),
    ),
    (
        "World Health Organization",
        (
            "https://www.who.int/news-room/fact-sheets/detail/climate-change-"
            "heat-and-health"
        ),
        date(2026, 7, 17),
    ),
)


def _policy_sources_for_locale(
    output_locale: OutputLocale,
) -> tuple[PolicySource, ...]:
    catalog = get_action_plan_catalog(output_locale)
    if len(catalog.policy_rules) != len(_POLICY_SOURCE_FACTS):
        raise ValueError("policy catalog must cover every fixed source")
    return tuple(
        PolicySource(
            publisher=publisher,
            url=url,
            accessed_on=accessed_on,
            heatrelay_rule=rule,
        )
        for (publisher, url, accessed_on), rule in zip(
            _POLICY_SOURCE_FACTS,
            catalog.policy_rules,
        )
    )


POLICY_SOURCES = _policy_sources_for_locale(DEFAULT_OUTPUT_LOCALE)


class PriorityDecision(StrictModel):
    policy_version: Literal["heatrelay-barcelona-action-policy-1.0.0"]
    priority: ActionPriority
    reason_codes: Annotated[
        list[PriorityReasonCode],
        Field(min_length=1, max_length=len(PRIORITY_REASON_ORDER)),
    ]
    sources: Annotated[list[PolicySource], Field(min_length=len(POLICY_SOURCES))]
    notice: str

    @field_validator("reason_codes")
    @classmethod
    def validate_reason_codes(
        cls,
        values: list[PriorityReasonCode],
    ) -> list[PriorityReasonCode]:
        if len(values) != len(set(values)):
            raise ValueError("priority reasons must be unique")
        if values != [code for code in PRIORITY_REASON_ORDER if code in values]:
            raise ValueError("priority reasons must use canonical order")
        return values

    @model_validator(mode="after")
    def validate_server_owned_policy(self) -> PriorityDecision:
        if not any(
            self.sources == list(_policy_sources_for_locale(locale))
            and self.notice == catalog.policy_notice
            for locale, catalog in ACTION_PLAN_CATALOGS.items()
        ):
            raise ValueError("priority sources must equal the policy catalog")
        return self


def determine_action_priority(
    situation: SituationExtractionResponse,
    same_day_max_temperature_c: float | None,
    *,
    output_locale: OutputLocale = DEFAULT_OUTPUT_LOCALE,
) -> PriorityDecision:
    """Apply closed precedence; GPT has no influence over this result."""

    catalog = get_action_plan_catalog(output_locale)

    symptoms = situation.reported_symptoms
    if symptoms.status == "reported" and symptoms.values:
        priority: ActionPriority = "urgent_help"
        reasons: list[PriorityReasonCode] = ["reported_warning_symptom"]
    else:
        reasons = []
        if same_day_max_temperature_c is None:
            raise ValueError("normal priority requires same-day maximum temperature")
        if same_day_max_temperature_c >= 36.0:
            priority = "act_now"
            reasons.append("forecast_at_or_above_36c")
        elif same_day_max_temperature_c >= 34.0:
            priority = "prepare_now"
            reasons.append("forecast_at_or_above_34c")
        else:
            priority = "monitor_and_prepare"

        preparation_triggered = False
        if (
            situation.vulnerability_factors.status == "reported"
            and situation.vulnerability_factors.values
        ):
            reasons.append("reported_vulnerability")
            preparation_triggered = True
        if (
            situation.cooling_access.status == "reported"
            and situation.cooling_access.value == "no_home_cooling"
        ):
            reasons.append("no_home_cooling")
            preparation_triggered = True
        if (
            situation.housing_situation.status == "reported"
            and situation.housing_situation.value
            in {"temporary_housing", "unsheltered"}
        ):
            reasons.append("temporary_or_unsheltered_housing")
            preparation_triggered = True
        if (
            situation.mobility_constraints.status == "reported"
            and situation.mobility_constraints.values
        ):
            reasons.append("reported_mobility_constraint")
            preparation_triggered = True
        if priority == "monitor_and_prepare" and preparation_triggered:
            priority = "prepare_now"
        if not reasons:
            reasons.append("baseline_monitoring")

    reasons = [code for code in PRIORITY_REASON_ORDER if code in reasons]
    return PriorityDecision(
        policy_version=ACTION_POLICY_VERSION,
        priority=priority,
        reason_codes=reasons,
        sources=list(_policy_sources_for_locale(output_locale)),
        notice=catalog.policy_notice,
    )


UrgentContactCode = Literal["112"]
UrgentActionCode = Literal[
    "contact_emergency_service_now",
    "do_not_use_shelter_as_medical_substitute",
]


class ActionPlanSituationProjection(SituationExtractionResponse):
    """Action-plan-owned situation projection with catalog-managed notice."""

    notice: str

    @field_validator("notice")
    @classmethod
    def validate_catalog_notice(cls, value: str) -> str:
        return _require_registered_catalog_value(
            value,
            lambda catalog: catalog.situation_notice,
            "situation notice",
        )


class ActionPlanWeatherProjection(WeatherContextResponse):
    """Action-plan-owned weather projection with catalog-managed notice."""

    notice: str

    @field_validator("notice")
    @classmethod
    def validate_catalog_notice(cls, value: str) -> str:
        return _require_registered_catalog_value(
            value,
            lambda catalog: catalog.weather_notice,
            "weather notice",
        )


def project_action_plan_situation(
    situation: SituationExtractionResponse,
    output_locale: OutputLocale,
) -> ActionPlanSituationProjection:
    """Strictly revalidate standalone facts before catalog notice projection."""

    validated = SituationExtractionResponse.model_validate_json(
        situation.model_dump_json()
    )
    payload = validated.model_dump(mode="python")
    payload["notice"] = get_action_plan_catalog(output_locale).situation_notice
    return ActionPlanSituationProjection.model_validate(payload)


def project_action_plan_weather(
    weather: WeatherContextResponse,
    output_locale: OutputLocale,
) -> ActionPlanWeatherProjection:
    """Strictly revalidate standalone facts before catalog notice projection."""

    validated = WeatherContextResponse.model_validate_json(
        weather.model_dump_json()
    )
    payload = validated.model_dump(mode="python")
    payload["notice"] = get_action_plan_catalog(output_locale).weather_notice
    return ActionPlanWeatherProjection.model_validate(payload)


class UrgentContact(StrictModel):
    code: Literal["112"]
    service: Literal["112 emergències"]
    number: Literal["112"]
    instruction: str
    source_url: Literal[
        "https://112.gencat.cat/es/us-del-112/preguntes-frequeents/"
    ]

    @field_validator("instruction")
    @classmethod
    def validate_catalog_instruction(cls, value: str) -> str:
        return _require_registered_catalog_value(
            value,
            lambda catalog: catalog.urgent_contact_instruction,
            "urgent contact instruction",
        )


class UrgentAction(StrictModel):
    code: UrgentActionCode
    text: str


class HydratedAction(StrictModel):
    code: str
    text: str
    explanation: str


class HydratedPlanPhase(StrictModel):
    actions: list[HydratedAction]


class HydratedBringItem(StrictModel):
    code: BringItemCode
    text: str


class HydratedExplanation(StrictModel):
    code: ExplanationReasonCode
    text: str


class HydratedLocalPhrase(StrictModel):
    code: LocalPhraseCode
    language: Literal["es", "ca"]
    text: str


class HydratedGroundedPlan(StrictModel):
    now: HydratedPlanPhase
    next_few_hours: HydratedPlanPhase
    tonight: HydratedPlanPhase
    bring_items: list[HydratedBringItem]
    explanations: list[HydratedExplanation]
    local_phrase: HydratedLocalPhrase | None
    notice: str

    @field_validator("notice")
    @classmethod
    def validate_catalog_notice(cls, value: str) -> str:
        return _require_registered_catalog_value(
            value,
            lambda catalog: catalog.normal_notice,
            "normal plan notice",
        )


class CandidateContext(StrictModel):
    eligible_candidate_count: Annotated[int, Field(ge=0, le=3)]
    snapshot: SnapshotProvenance
    explanation: str
    hours_warning: str
    candidate_notice: str
    distance_warning: str
    reachability_warning: str

    @model_validator(mode="after")
    def validate_catalog_warning_bundle(self) -> CandidateContext:
        if not any(
            (
                self.hours_warning,
                self.candidate_notice,
                self.distance_warning,
                self.reachability_warning,
            )
            == (
                catalog.candidate_warnings["hours"],
                catalog.candidate_warnings["candidate_notice"],
                catalog.candidate_warnings["distance"],
                catalog.candidate_warnings["reachability"],
            )
            for catalog in ACTION_PLAN_CATALOGS.values()
        ):
            raise ValueError(
                "candidate warnings must equal one registered catalog bundle"
            )
        return self


class SelectedCandidatePlace(StrictModel):
    """Trusted candidate projection that never returns place coordinates."""

    place_id: str
    source_record_id: str
    name: NonBlankString
    address: Address
    district: NonBlankString | None
    neighborhood: NonBlankString | None
    distance_m: NonNegativeInteger
    closes_at: AwareDatetime
    accessibility: bool | None
    features: PlaceFeatures
    information_url: HttpUrlString | None
    schedule_verification_status: Literal["verified"]
    source_modified_at: AwareDatetime
    source_url: HttpUrlString
    last_checked: date

    @model_validator(mode="after")
    def validate_identifiers(self) -> SelectedCandidatePlace:
        validate_place_identifier_pair(self.place_id, self.source_record_id)
        return self


class UrgentActionPlanResponse(StrictModel):
    branch: Literal["urgent"]
    schema_version: Literal["1.16.0"]
    output_locale: OutputLocale
    evaluation_time: AwareDatetime
    situation: ActionPlanSituationProjection
    priority: PriorityDecision
    urgent_contact: UrgentContact
    actions: list[UrgentAction]
    notices: list[str]

    @model_validator(mode="after")
    def validate_urgent_contract(self) -> UrgentActionPlanResponse:
        catalog = get_action_plan_catalog(self.output_locale)
        if self.situation.notice != catalog.situation_notice:
            raise ValueError("urgent situation notice must equal the catalog")
        symptoms = self.situation.reported_symptoms
        if (
            symptoms.status != "reported"
            or not symptoms.values
            or not set(symptoms.values).issubset(UNIVERSAL_URGENT_112_SYMPTOMS)
        ):
            raise ValueError("urgent response requires reported bounded symptoms")
        expected_priority = determine_action_priority(
            self.situation,
            None,
            output_locale=self.output_locale,
        )
        if self.priority != expected_priority:
            raise ValueError("urgent response priority is inconsistent")
        expected_actions = [
            UrgentAction(
                code="contact_emergency_service_now",
                text=catalog.urgent_actions[
                    "contact_emergency_service_now"
                ],
            ),
            UrgentAction(
                code="do_not_use_shelter_as_medical_substitute",
                text=catalog.urgent_actions[
                    "do_not_use_shelter_as_medical_substitute"
                ],
            ),
        ]
        if (
            self.urgent_contact.instruction
            != catalog.urgent_contact_instruction
            or self.actions != expected_actions
        ):
            raise ValueError("urgent response actions must equal the fixed catalog")
        if self.notices != list(catalog.urgent_notices):
            raise ValueError("urgent response notices must equal the fixed catalog")
        return self


class NormalActionPlanResponse(StrictModel):
    branch: Literal["normal"]
    schema_version: Literal["1.16.0"]
    output_locale: OutputLocale
    evaluation_time: AwareDatetime
    situation: ActionPlanSituationProjection
    priority: PriorityDecision
    weather: ActionPlanWeatherProjection
    plan: HydratedGroundedPlan
    selected_place: SelectedCandidatePlace | None
    candidate_context: CandidateContext
    notices: list[str]

    @model_validator(mode="after")
    def validate_normal_contract(self) -> NormalActionPlanResponse:
        catalog = get_action_plan_catalog(self.output_locale)
        if (
            self.situation.notice != catalog.situation_notice
            or self.weather.notice != catalog.weather_notice
        ):
            raise ValueError("normal projection notices must equal the catalog")
        if (
            self.priority.priority == "urgent_help"
            or self.situation.reported_symptoms.status == "reported"
        ):
            raise ValueError("normal response must not contain urgent facts")
        expected_priority = determine_action_priority(
            self.situation,
            self.weather.today.temperature_max_c,
            output_locale=self.output_locale,
        )
        if self.priority != expected_priority:
            raise ValueError("normal response priority is inconsistent")
        try:
            ActionPlanWorkflow._validate_weather_facts(
                self.weather,
                self.evaluation_time,
            )
        except ActionPlanWorkflowUnavailable as error:
            raise ValueError("normal response weather is incoherent") from error

        phase_catalogs = (
            (self.plan.now, catalog.now_actions, NOW_ACTION_ORDER),
            (
                self.plan.next_few_hours,
                catalog.next_few_hours_actions,
                NEXT_FEW_HOURS_ACTION_ORDER,
            ),
            (
                self.plan.tonight,
                catalog.tonight_actions,
                TONIGHT_ACTION_ORDER,
            ),
        )
        for phase, action_text, canonical_order in phase_catalogs:
            codes = [action.code for action in phase.actions]
            if (
                len(codes) != len(set(codes))
                or codes != [code for code in canonical_order if code in codes]
            ):
                raise ValueError("hydrated actions must be unique and canonical")
            for action in phase.actions:
                if action.code not in action_text or (
                    action.text,
                    action.explanation,
                ) != action_text[action.code]:
                    raise ValueError("hydrated action text must equal the catalog")

        item_codes = [item.code for item in self.plan.bring_items]
        if (
            len(item_codes) != len(set(item_codes))
            or item_codes != [code for code in BRING_ITEM_ORDER if code in item_codes]
            or any(
                item.text != catalog.bring_items[item.code]
                for item in self.plan.bring_items
            )
        ):
            raise ValueError("hydrated bring items must equal the catalog")
        explanation_codes = [item.code for item in self.plan.explanations]
        if (
            len(explanation_codes) != len(set(explanation_codes))
            or explanation_codes
            != [
                code
                for code in EXPLANATION_REASON_ORDER
                if code in explanation_codes
            ]
            or any(
                item.text != catalog.explanations[item.code]
                for item in self.plan.explanations
            )
        ):
            raise ValueError("hydrated explanations must equal the catalog")
        if self.plan.local_phrase is not None:
            phrase = self.plan.local_phrase
            if phrase.code not in FIXED_LOCAL_PHRASES or (
                phrase.language,
                phrase.text,
            ) != FIXED_LOCAL_PHRASES[phrase.code]:
                raise ValueError("hydrated local phrase must equal the catalog")
        if self.plan.notice != catalog.normal_notice:
            raise ValueError("normal plan notice must equal the catalog")

        contract = derive_normal_plan_contract(
            self.situation,
            self.weather,
            self.priority,
            eligible_candidate_count=(
                self.candidate_context.eligible_candidate_count
            ),
        )
        selected_by_phase = (
            [action.code for action in self.plan.now.actions],
            [action.code for action in self.plan.next_few_hours.actions],
            [action.code for action in self.plan.tonight.actions],
        )
        allowed_by_phase = (
            contract.allowed_codes.now,
            contract.allowed_codes.next_few_hours,
            contract.allowed_codes.tonight,
        )
        if any(
            any(code not in allowed_codes for code in selected_codes)
            for selected_codes, allowed_codes in zip(
                selected_by_phase,
                allowed_by_phase,
            )
        ):
            raise ValueError("public plan contains a context-incompatible action")
        if any(code not in contract.allowed_codes.bring_items for code in item_codes):
            raise ValueError("public plan contains a context-incompatible item")
        if (
            self.plan.local_phrase is not None
            and self.plan.local_phrase.code
            not in contract.allowed_codes.local_phrases
        ):
            raise ValueError("public plan contains a context-incompatible phrase")
        if any(
            code not in contract.allowed_codes.explanation_reasons
            for code in explanation_codes
        ):
            raise ValueError("public plan contains a context-incompatible reason")

        required = contract.required_codes
        for required_codes, selected_codes in zip(
            (required.now, required.next_few_hours, required.tonight),
            selected_by_phase,
        ):
            if any(code not in selected_codes for code in required_codes):
                raise ValueError("public plan omits a canonical safety action")
        if any(
            code not in explanation_codes
            for code in required.explanation_reasons
        ):
            raise ValueError("public plan omits a canonical explanation")

        now_codes = selected_by_phase[0]
        has_travel = "travel_to_selected_place" in now_codes
        has_selected = self.selected_place is not None
        if has_travel != has_selected:
            raise ValueError("public travel and selected place must be paired")
        has_verified_reason = "verified_open_candidate" in explanation_codes
        if has_verified_reason != has_travel:
            raise ValueError("verified candidate explanation must match travel")
        expected_explanation_codes = list(required.explanation_reasons)
        if has_travel:
            expected_explanation_codes.append("verified_open_candidate")
            expected_explanation_codes = [
                code
                for code in EXPLANATION_REASON_ORDER
                if code in expected_explanation_codes
            ]
        if explanation_codes != expected_explanation_codes:
            raise ValueError("public explanations must equal deterministic reasons")
        if has_travel:
            if (
                not {"water", "phone"}.issubset(item_codes)
                or self.plan.local_phrase is None
                or self.candidate_context.eligible_candidate_count < 1
            ):
                raise ValueError("public travel preparation is incomplete")
        elif item_codes or self.plan.local_phrase is not None:
            raise ValueError("non-travel public plan cannot contain travel preparation")
        if (
            self.candidate_context.eligible_candidate_count == 0
            or contract.movement_prohibited
            or contract.travel_compatibility_unproven
        ) and has_travel:
            raise ValueError("public branch facts prohibit travel")
        if (
            contract.movement_prohibited
            or contract.travel_compatibility_unproven
        ) and self.candidate_context.eligible_candidate_count != 0:
            raise ValueError("prohibited travel branches cannot expose candidates")
        if (
            self.selected_place is not None
            and self.selected_place.closes_at <= self.evaluation_time
        ):
            raise ValueError("selected place must close after evaluation time")
        if self.selected_place is not None and (
            self.selected_place.source_url
            != self.candidate_context.snapshot.dataset_url
        ):
            raise ValueError("selected place provenance is inconsistent")
        snapshot = self.candidate_context.snapshot
        if not _has_approved_snapshot_provenance(snapshot):
            raise ValueError("candidate snapshot provenance is not approved")
        if snapshot.retrieved_at > self.evaluation_time:
            raise ValueError("candidate snapshot was retrieved after evaluation")
        if self.selected_place is not None and (
            self.selected_place.source_modified_at
            > snapshot.upstream_max_modified
            or self.selected_place.last_checked != snapshot.retrieved_at.date()
        ):
            raise ValueError("selected place chronology is inconsistent")

        if contract.movement_prohibited:
            expected_explanation = catalog.candidate_explanations[
                "movement_prohibited"
            ]
        elif contract.travel_compatibility_unproven:
            expected_explanation = catalog.candidate_explanations[
                "unresolved_travel_compatibility"
            ]
        else:
            expected_explanation = (
                catalog.candidate_explanations["matched_candidate"]
                if self.candidate_context.eligible_candidate_count
                else catalog.candidate_explanations["no_candidate"]
            )
        if self.candidate_context.explanation != expected_explanation:
            raise ValueError("candidate explanation is inconsistent")

        expected_candidate_warnings = catalog.candidate_warnings
        if (
            self.candidate_context.hours_warning
            != expected_candidate_warnings["hours"]
            or self.candidate_context.candidate_notice
            != expected_candidate_warnings["candidate_notice"]
            or self.candidate_context.distance_warning
            != expected_candidate_warnings["distance"]
            or self.candidate_context.reachability_warning
            != expected_candidate_warnings["reachability"]
        ):
            raise ValueError("candidate warnings must equal the catalog")

        expected_notices = [
            catalog.policy_notice,
            catalog.candidate_warnings["hours"],
            catalog.candidate_warnings["distance"],
            catalog.candidate_warnings["reachability"],
            catalog.normal_notice,
        ]
        if contract.travel_compatibility_unproven:
            expected_notices.append(catalog.unresolved_travel_notice)
        if self.notices != expected_notices:
            raise ValueError("normal response notices are inconsistent")
        return self


ActionPlanResponse = Annotated[
    UrgentActionPlanResponse | NormalActionPlanResponse,
    Field(discriminator="branch"),
]


_ACTION_PLAN_RESPONSE_ADAPTER = TypeAdapter(ActionPlanResponse)


def validate_action_plan_response(
    response: UrgentActionPlanResponse | NormalActionPlanResponse,
    *,
    request: ActionPlanRequest,
    trusted_repository: PlaceRepository,
    evaluation_started_at: datetime,
    evaluation_finished_at: datetime,
) -> UrgentActionPlanResponse | NormalActionPlanResponse:
    """Revalidate endpoint time and trusted place facts before the ASGI boundary."""

    try:
        validated = _ACTION_PLAN_RESPONSE_ADAPTER.validate_json(
            response.model_dump_json()
        )
        requested_output_locale = require_supported_output_locale(
            request.output_locale
        )
        if validated.output_locale != requested_output_locale:
            raise ValueError("response output locale does not match request")
        _validate_trusted_evaluation_interval(
            validated.evaluation_time,
            evaluation_started_at=evaluation_started_at,
            evaluation_finished_at=evaluation_finished_at,
        )
        if isinstance(validated, NormalActionPlanResponse):
            _validate_normal_response_against_repository(
                validated,
                request,
                trusted_repository,
            )
        return validated
    except Exception as error:
        raise ActionPlanWorkflowUnavailable() from error


def _validate_trusted_evaluation_interval(
    response_evaluation_time: datetime,
    *,
    evaluation_started_at: datetime,
    evaluation_finished_at: datetime,
) -> None:
    """Require the workflow time to fall within the endpoint-owned UTC interval."""

    for value in (
        response_evaluation_time,
        evaluation_started_at,
        evaluation_finished_at,
    ):
        if (
            not isinstance(value, datetime)
            or value.tzinfo is None
            or value.utcoffset() != timedelta(0)
        ):
            raise ValueError("action-plan evaluation interval must use UTC")
    if evaluation_finished_at < evaluation_started_at:
        raise ValueError("action-plan evaluation interval is reversed")
    if not (
        evaluation_started_at
        <= response_evaluation_time
        <= evaluation_finished_at
    ):
        raise ValueError("action-plan evaluation time is outside the request interval")


def _validate_normal_response_against_repository(
    response: NormalActionPlanResponse,
    request: ActionPlanRequest,
    repository: PlaceRepository,
) -> None:
    """Reconcile the public projection with an independent committed query."""

    contract = derive_normal_plan_contract(
        response.situation,
        response.weather,
        response.priority,
        eligible_candidate_count=(
            response.candidate_context.eligible_candidate_count
        ),
    )
    candidate_request = PlacesCandidatesRequest(
        origin=request.origin,
        evaluation_datetime=response.evaluation_time,
        required_features=RequiredFeatures(),
        maximum_distance_m=float(request.maximum_distance_m),
        limit=MAX_MODEL_CANDIDATES,
    )
    trusted_response = repository.find_action_candidates(
        candidate_request,
        accessibility_required=contract.accessibility_required,
    )
    if trusted_response.snapshot != response.candidate_context.snapshot:
        raise ValueError("response snapshot does not match committed provenance")

    if contract.movement_prohibited or contract.travel_compatibility_unproven:
        trusted_candidates: tuple[CandidatePlace, ...] = ()
    else:
        trusted_candidates = tuple(trusted_response.candidates)
    if (
        response.candidate_context.eligible_candidate_count
        != len(trusted_candidates)
    ):
        raise ValueError("eligible candidate count does not match committed query")

    selected = response.selected_place
    if selected is None:
        return
    if selected.distance_m > request.maximum_distance_m:
        raise ValueError("selected place exceeds the request distance")
    trusted_by_id = {
        candidate.place_id: candidate for candidate in trusted_candidates
    }
    trusted_candidate = trusted_by_id.get(selected.place_id)
    if trusted_candidate is None:
        raise ValueError("selected place is not an eligible committed candidate")
    if selected != project_selected_candidate(trusted_candidate):
        raise ValueError("selected place differs from committed candidate facts")


NOW_ACTION_TEXT = _ENGLISH_ACTION_PLAN_CATALOG.now_actions
NEXT_ACTION_TEXT = _ENGLISH_ACTION_PLAN_CATALOG.next_few_hours_actions
TONIGHT_ACTION_TEXT = _ENGLISH_ACTION_PLAN_CATALOG.tonight_actions
BRING_ITEM_TEXT = _ENGLISH_ACTION_PLAN_CATALOG.bring_items
EXPLANATION_TEXT = _ENGLISH_ACTION_PLAN_CATALOG.explanations
LOCAL_PHRASES = FIXED_LOCAL_PHRASES


def _reported_values(situation: SituationExtractionResponse, field: str) -> set[str]:
    value = getattr(situation, field)
    if value.status != "reported":
        return set()
    return set(value.values)


def _movement_flags(
    situation: SituationExtractionResponse,
) -> tuple[bool, bool, bool, bool]:
    mobility = _reported_values(situation, "mobility_constraints")
    time_constraints = _reported_values(situation, "time_constraints")
    movement_prohibited = (
        "cannot_leave_current_location" in mobility
        or "cannot_leave_now" in time_constraints
    )
    travel_support_required = "cannot_travel_alone" in mobility
    accessibility_required = bool(
        mobility
        & {"wheelchair_access_required", "step_free_access_required"}
    )
    travel_compatibility_unproven = bool(
        mobility
        or time_constraints
        or situation.mobility_constraints.status == "unknown"
        or situation.time_constraints.status == "unknown"
    )
    return (
        movement_prohibited,
        travel_support_required,
        accessibility_required,
        travel_compatibility_unproven,
    )


def _normal_explanation_codes(
    priority: PriorityDecision,
    *,
    has_candidates: bool,
    movement_prohibited: bool,
    travel_support_required: bool,
    travel_compatibility_unproven: bool,
) -> list[ExplanationReasonCode]:
    selected: set[str] = set(priority.reason_codes)
    selected.discard("reported_warning_symptom")
    if has_candidates:
        selected.add("verified_open_candidate")
    if movement_prohibited:
        selected.add("movement_prohibited")
    if travel_support_required:
        selected.add("travel_support_required")
    if travel_compatibility_unproven:
        selected.add("unresolved_travel_constraint")
    return [code for code in EXPLANATION_REASON_ORDER if code in selected]


class NormalPlanContract(StrictModel):
    """Pure backend-owned allowed and required semantics for one normal plan."""

    movement_prohibited: bool
    travel_support_required: bool
    accessibility_required: bool
    travel_compatibility_unproven: bool
    allowed_codes: AllowedPlanCodes
    required_codes: RequiredPlanCodes


def derive_normal_plan_contract(
    situation: SituationExtractionResponse,
    weather: WeatherContextResponse,
    priority: PriorityDecision,
    *,
    eligible_candidate_count: int,
) -> NormalPlanContract:
    """Derive the one situation-, weather-, and candidate-scoped code contract."""

    if type(eligible_candidate_count) is not int or not (
        0 <= eligible_candidate_count <= MAX_MODEL_CANDIDATES
    ):
        raise ValueError("eligible candidate count is outside the plan contract")
    (
        movement_prohibited,
        travel_support_required,
        accessibility_required,
        travel_compatibility_unproven,
    ) = _movement_flags(situation)
    if (
        movement_prohibited or travel_compatibility_unproven
    ) and eligible_candidate_count != 0:
        raise ValueError(
            "prohibited or unresolved travel cannot expose candidates"
        )
    has_candidates = eligible_candidate_count > 0
    unsheltered = (
        situation.housing_situation.status == "reported"
        and situation.housing_situation.value == "unsheltered"
    )

    now_allowed: list[NowActionCode] = [
        "move_to_cooler_space",
        "reduce_physical_effort",
        "drink_water",
    ]
    if (
        not unsheltered
        and situation.cooling_access.status == "reported"
        and situation.cooling_access.value == "air_conditioning"
    ):
        now_allowed.append("use_available_home_cooling")
    elif (
        not unsheltered
        and situation.cooling_access.status == "reported"
        and situation.cooling_access.value == "fan_only"
        and weather.current.temperature_c < FAN_COOLING_MAX_EXCLUSIVE_C
        and weather.today.temperature_max_c < FAN_COOLING_MAX_EXCLUSIVE_C
    ):
        now_allowed.append("use_available_home_cooling")
    if travel_support_required:
        now_allowed.append("contact_support_person")
    if movement_prohibited:
        now_allowed.append("remain_at_current_location")
    if has_candidates and not travel_compatibility_unproven:
        now_allowed.append("travel_to_selected_place")
    now_allowed = [code for code in NOW_ACTION_ORDER if code in now_allowed]

    bring_allowed: list[BringItemCode] = []
    if has_candidates and not travel_compatibility_unproven:
        bring_allowed = ["water", "phone", "keys", "light_clothing"]
    bring_allowed = [code for code in BRING_ITEM_ORDER if code in bring_allowed]

    language = situation.preferred_language.value
    if situation.preferred_language.status != "reported":
        language = situation.detected_input_language
    phrase_prefix = "catalan" if language == "ca" else "spanish"
    phrase_codes: list[LocalPhraseCode] = []
    if has_candidates and not travel_compatibility_unproven:
        phrase_codes.append(  # type: ignore[arg-type]
            f"{phrase_prefix}_request_cool_space"
        )
    if accessibility_required and phrase_codes:
        phrase_codes.append(  # type: ignore[arg-type]
            f"{phrase_prefix}_request_accessible_entry"
        )

    vulnerability_values = _reported_values(situation, "vulnerability_factors")
    next_allowed: list[NextFewHoursActionCode] = [
        code
        for code in NEXT_FEW_HOURS_ACTION_ORDER
        if code != "check_on_household_members"
        or "young_child_in_household" in vulnerability_values
    ]
    tonight_allowed: list[TonightActionCode] = [
        code
        for code in TONIGHT_ACTION_ORDER
        if not unsheltered
        or code
        not in {
            "ventilate_when_outside_is_cooler",
            "sleep_in_coolest_available_room",
        }
    ]
    explanation_codes = _normal_explanation_codes(
        priority,
        has_candidates=has_candidates,
        movement_prohibited=movement_prohibited,
        travel_support_required=travel_support_required,
        travel_compatibility_unproven=travel_compatibility_unproven,
    )
    required_codes = canonical_required_plan_codes(
        priority=priority.priority,  # type: ignore[arg-type]
        priority_reason_codes=list(priority.reason_codes),  # type: ignore[arg-type]
        movement_prohibited=movement_prohibited,
        travel_support_required=travel_support_required,
        travel_compatibility_unproven=travel_compatibility_unproven,
        unsheltered=unsheltered,
    )
    return NormalPlanContract(
        movement_prohibited=movement_prohibited,
        travel_support_required=travel_support_required,
        accessibility_required=accessibility_required,
        travel_compatibility_unproven=travel_compatibility_unproven,
        allowed_codes=AllowedPlanCodes(
            now=now_allowed,
            next_few_hours=next_allowed,
            tonight=tonight_allowed,
            bring_items=bring_allowed,
            explanation_reasons=explanation_codes,
            local_phrases=phrase_codes,
        ),
        required_codes=required_codes,
    )


def build_grounded_plan_context(
    situation: SituationExtractionResponse,
    weather: WeatherContextResponse,
    priority: PriorityDecision,
    candidates: tuple[CandidatePlace, ...],
) -> GroundedPlanContext:
    contract = derive_normal_plan_contract(
        situation,
        weather,
        priority,
        eligible_candidate_count=len(candidates),
    )

    extraction = ModelSituationExtraction(
        detected_input_language=situation.detected_input_language,
        preferred_language=situation.preferred_language,
        vulnerability_factors=situation.vulnerability_factors,
        mobility_constraints=situation.mobility_constraints,
        cooling_access=situation.cooling_access,
        housing_situation=situation.housing_situation,
        time_constraints=situation.time_constraints,
        reported_symptoms=situation.reported_symptoms,
    )
    candidate_facts = [
        GroundedCandidateFacts(
            place_id=candidate.place_id,
            distance_m=candidate.distance_m,
            closes_at=candidate.closes_at,
            accessibility=candidate.accessibility,
            indoor_space=candidate.features.indoor_space,
            potable_water=candidate.features.potable_water,
            toilets=candidate.features.toilets,
            micro_shelter=candidate.features.micro_shelter,
            pets_allowed=candidate.features.pets_allowed,
        )
        for candidate in candidates
    ]
    return GroundedPlanContext(
        situation=extraction,
        weather=GroundedWeatherFacts(
            current_temperature_c=weather.current.temperature_c,
            current_apparent_temperature_c=weather.current.apparent_temperature_c,
            relative_humidity_pct=weather.current.relative_humidity_pct,
            same_day_max_temperature_c=weather.today.temperature_max_c,
            same_day_max_apparent_temperature_c=(
                weather.today.apparent_temperature_max_c
            ),
            same_day_max_uv_index=weather.today.uv_index_max,
        ),
        priority=GroundedPriorityFacts(
            priority=priority.priority,  # type: ignore[arg-type]
            reason_codes=list(priority.reason_codes),
        ),
        candidates=candidate_facts,
        movement_prohibited=contract.movement_prohibited,
        travel_support_required=contract.travel_support_required,
        travel_compatibility_unproven=(
            contract.travel_compatibility_unproven
        ),
        allowed_codes=contract.allowed_codes,
        required_codes=contract.required_codes,
    )


def hydrate_grounded_plan(
    plan: ModelGroundedPlan,
    output_locale: OutputLocale,
) -> HydratedGroundedPlan:
    catalog = get_action_plan_catalog(output_locale)

    def actions(
        codes: list[str],
        action_text: Mapping[str, tuple[str, str]],
    ) -> HydratedPlanPhase:
        return HydratedPlanPhase(
            actions=[
                HydratedAction(
                    code=code,
                    text=action_text[code][0],
                    explanation=action_text[code][1],
                )
                for code in codes
            ]
        )

    phrase = None
    if plan.local_phrase_code is not None:
        phrase_language, phrase_text = FIXED_LOCAL_PHRASES[
            plan.local_phrase_code
        ]
        phrase = HydratedLocalPhrase(
            code=plan.local_phrase_code,
            language=phrase_language,
            text=phrase_text,
        )
    return HydratedGroundedPlan(
        now=actions(  # type: ignore[arg-type]
            plan.now.action_codes,
            catalog.now_actions,
        ),
        next_few_hours=actions(  # type: ignore[arg-type]
            plan.next_few_hours.action_codes,
            catalog.next_few_hours_actions,
        ),
        tonight=actions(  # type: ignore[arg-type]
            plan.tonight.action_codes,
            catalog.tonight_actions,
        ),
        bring_items=[
            HydratedBringItem(code=code, text=catalog.bring_items[code])
            for code in plan.bring_items
        ],
        explanations=[
            HydratedExplanation(code=code, text=catalog.explanations[code])
            for code in plan.explanation_reasons
        ],
        local_phrase=phrase,
        notice=catalog.normal_notice,
    )


def project_selected_candidate(candidate: CandidatePlace) -> SelectedCandidatePlace:
    """Copy source-backed public facts while excluding exact coordinates."""

    if candidate.closes_at is None:
        raise PlaceDataError("selected action candidate must have a closing time")
    return SelectedCandidatePlace(
        place_id=candidate.place_id,
        source_record_id=candidate.source_record_id,
        name=candidate.name,
        address=candidate.address,
        district=candidate.district,
        neighborhood=candidate.neighborhood,
        distance_m=candidate.distance_m,
        closes_at=candidate.closes_at,
        accessibility=candidate.accessibility,
        features=candidate.features,
        information_url=candidate.information_url,
        schedule_verification_status=candidate.schedule_verification_status,
        source_modified_at=candidate.source_modified_at,
        source_url=candidate.source_url,
        last_checked=candidate.last_checked,
    )


def build_urgent_response(
    situation: SituationExtractionResponse,
    evaluation_time: datetime,
    priority: PriorityDecision,
    output_locale: OutputLocale,
) -> UrgentActionPlanResponse:
    try:
        output_locale = require_supported_output_locale(output_locale)
        catalog = get_action_plan_catalog(output_locale)
    except ValueError as error:
        raise ActionPlanWorkflowUnavailable() from error
    reported = frozenset(situation.reported_symptoms.values)
    if (
        situation.reported_symptoms.status != "reported"
        or not reported
        or not reported.issubset(UNIVERSAL_URGENT_112_SYMPTOMS)
    ):
        raise ActionPlanWorkflowUnavailable()
    contact = UrgentContact(
        code="112",
        service="112 emergències",
        number="112",
        instruction=catalog.urgent_contact_instruction,
        source_url=(
            "https://112.gencat.cat/es/us-del-112/preguntes-frequeents/"
        ),
    )
    contact_action = UrgentAction(
        code="contact_emergency_service_now",
        text=catalog.urgent_actions["contact_emergency_service_now"],
    )
    try:
        return UrgentActionPlanResponse(
            branch="urgent",
            schema_version=ACTION_PLAN_SCHEMA_VERSION,
            output_locale=output_locale,
            evaluation_time=evaluation_time,
            situation=project_action_plan_situation(
                situation,
                output_locale,
            ),
            priority=priority,
            urgent_contact=contact,
            actions=[
                contact_action,
                UrgentAction(
                    code="do_not_use_shelter_as_medical_substitute",
                    text=catalog.urgent_actions[
                        "do_not_use_shelter_as_medical_substitute"
                    ],
                ),
            ],
            notices=list(catalog.urgent_notices),
        )
    except (ValidationError, ValueError) as error:
        raise ActionPlanWorkflowUnavailable() from error


class ActionPlanWorkflow:
    """Orchestrate one request with injected external and deterministic stages."""

    def __init__(
        self,
        *,
        situation_service: SituationExtractionService,
        weather_service: WeatherService,
        repository: PlaceRepository,
        plan_service: GroundedPlanService,
        utc_now: Callable[[], datetime] | None = None,
    ) -> None:
        self._situation_service = situation_service
        self._weather_service = weather_service
        self._repository = repository
        self._plan_service = plan_service
        self._utc_now = utc_now or (lambda: datetime.now(timezone.utc))

    def _evaluation_time(self) -> datetime:
        value = self._utc_now()
        if value.tzinfo is None or value.utcoffset() is None:
            raise ActionPlanWorkflowUnavailable()
        return value.astimezone(timezone.utc)

    @staticmethod
    def _validate_weather_coherence(
        weather: WeatherContextResponse,
        evaluation_time: datetime,
    ) -> WeatherContextResponse:
        try:
            validated = WeatherContextResponse.model_validate_json(
                weather.model_dump_json()
            )
        except Exception as error:
            raise ActionPlanWorkflowUnavailable() from error

        ActionPlanWorkflow._validate_weather_facts(
            validated,
            evaluation_time,
        )
        return validated

    @staticmethod
    def _validate_weather_facts(
        weather: WeatherContextResponse | ActionPlanWeatherProjection,
        evaluation_time: datetime,
    ) -> None:
        if weather.timezone != MADRID_TIMEZONE.key:
            raise ActionPlanWorkflowUnavailable()
        local_evaluation_date = evaluation_time.astimezone(MADRID_TIMEZONE).date()
        observed_at = weather.current.observed_at
        observed_in_madrid = observed_at.astimezone(MADRID_TIMEZONE)
        retrieved_at = weather.retrieved_at.astimezone(timezone.utc)
        observed_utc = observed_at.astimezone(timezone.utc)
        if (
            weather.today.date != local_evaluation_date
            or observed_at.tzinfo is None
            or observed_at.utcoffset() is None
            or observed_at.utcoffset() != observed_in_madrid.utcoffset()
            or observed_in_madrid.date() != weather.today.date
            or retrieved_at < evaluation_time
            or retrieved_at > evaluation_time + WEATHER_RETRIEVAL_WINDOW
            or retrieved_at - observed_utc > WEATHER_MAX_OBSERVATION_AGE
            or observed_utc - retrieved_at > WEATHER_MAX_FUTURE_OBSERVATION_SKEW
            or (
                weather.today.temperature_max_c
                < weather.current.temperature_c
            )
            or (
                weather.today.apparent_temperature_max_c
                < weather.current.apparent_temperature_c
            )
        ):
            raise ActionPlanWorkflowUnavailable()

    @staticmethod
    def _validated_candidate_response(
        response: PlacesCandidatesResponse,
        request: PlacesCandidatesRequest,
    ) -> PlacesCandidatesResponse:
        raw_candidates = getattr(response, "candidates", None)
        if isinstance(raw_candidates, list):
            raw_ids = [
                getattr(candidate, "place_id", None)
                for candidate in raw_candidates
            ]
            try:
                ids_are_unique = len(raw_ids) == len(set(raw_ids))
            except TypeError as error:
                raise PlaceDataError(
                    "action-plan candidate IDs are invalid"
                ) from error
            if not ids_are_unique:
                raise PlaceDataError("action-plan candidate IDs are not unique")
        try:
            validated = PlacesCandidatesResponse.model_validate_json(
                response.model_dump_json()
            )
        except Exception as error:
            raise PlaceDataError(
                "action-plan candidate response validation failed"
            ) from error
        candidate_ids = [candidate.place_id for candidate in validated.candidates]
        if len(candidate_ids) != len(set(candidate_ids)):
            raise PlaceDataError("action-plan candidate IDs are not unique")
        snapshot = validated.snapshot
        if not _has_approved_snapshot_provenance(snapshot):
            raise PlaceDataError("action-plan snapshot provenance is not approved")
        if snapshot.retrieved_at > request.evaluation_datetime:
            raise PlaceDataError(
                "action-plan snapshot was retrieved after evaluation"
            )
        for candidate in validated.candidates:
            if (
                candidate.source_modified_at > snapshot.upstream_max_modified
                or candidate.last_checked != snapshot.retrieved_at.date()
            ):
                raise PlaceDataError(
                    "action-plan candidate chronology is inconsistent"
                )
            recomputed_distance_m = int(
                round(
                    haversine_distance_m(
                        request.origin.latitude,
                        request.origin.longitude,
                        candidate.latitude,
                        candidate.longitude,
                    )
                )
            )
            if candidate.distance_m != recomputed_distance_m:
                raise PlaceDataError("action-plan candidate distance is inconsistent")
        return validated

    async def create(self, request: ActionPlanRequest) -> ActionPlanResponse:
        try:
            output_locale = require_supported_output_locale(request.output_locale)
            catalog = get_action_plan_catalog(output_locale)
        except ValueError as error:
            raise ActionPlanWorkflowUnavailable() from error
        situation = await self._situation_service.extract(
            SituationExtractionRequest(situation_text=request.situation_text)
        )
        situation = reconcile_source_reported_symptoms(
            request.situation_text,
            situation,
        )
        evaluation_time = self._evaluation_time()
        urgent_priority = (
            determine_action_priority(
                situation,
                None,
                output_locale=output_locale,
            )
            if (
                situation.reported_symptoms.status == "reported"
                and situation.reported_symptoms.values
            )
            else None
        )
        if urgent_priority is not None:
            return build_urgent_response(
                situation,
                evaluation_time,
                urgent_priority,
                output_locale,
            )

        weather = await self._weather_service.get_context(
            WeatherContextRequest(
                latitude=request.origin.latitude,
                longitude=request.origin.longitude,
            )
        )
        weather = self._validate_weather_coherence(weather, evaluation_time)
        priority = determine_action_priority(
            situation,
            weather.today.temperature_max_c,
            output_locale=output_locale,
        )
        (
            movement_prohibited,
            _,
            accessibility_required,
            travel_compatibility_unproven,
        ) = _movement_flags(situation)
        place_request = PlacesCandidatesRequest(
            origin=request.origin,
            evaluation_datetime=evaluation_time,
            required_features=RequiredFeatures(),
            maximum_distance_m=float(request.maximum_distance_m),
            limit=MAX_MODEL_CANDIDATES,
        )
        place_response = self._validated_candidate_response(
            self._repository.find_action_candidates(
                place_request,
                accessibility_required=accessibility_required,
            ),
            place_request,
        )

        eligible = [
            candidate
            for candidate in place_response.candidates
            if (not accessibility_required or candidate.accessibility is True)
            and candidate.closes_at is not None
            and candidate.closes_at > evaluation_time
            and int(
                round(
                    haversine_distance_m(
                        request.origin.latitude,
                        request.origin.longitude,
                        candidate.latitude,
                        candidate.longitude,
                    )
                )
            )
            <= request.maximum_distance_m
        ]
        eligible.sort(key=lambda candidate: (candidate.distance_m, candidate.place_id))
        if travel_compatibility_unproven:
            eligible = []
        eligible_tuple = tuple(eligible[:MAX_MODEL_CANDIDATES])

        context = build_grounded_plan_context(
            situation,
            weather,
            priority,
            eligible_tuple,
        )
        generation: GroundedPlanGeneration = await self._plan_service.generate(context)
        plan = validate_grounded_plan(generation.plan, context)
        selected_lookup = {
            candidate.place_id: candidate for candidate in eligible_tuple
        }
        selected_place = (
            project_selected_candidate(selected_lookup[plan.selected_place_id])
            if plan.selected_place_id is not None
            else None
        )
        if movement_prohibited:
            explanation = catalog.candidate_explanations[
                "movement_prohibited"
            ]
        elif travel_compatibility_unproven:
            explanation = catalog.candidate_explanations[
                "unresolved_travel_compatibility"
            ]
        else:
            explanation = (
                catalog.candidate_explanations["matched_candidate"]
                if eligible_tuple
                else catalog.candidate_explanations["no_candidate"]
            )
        notices = [
            catalog.policy_notice,
            catalog.candidate_warnings["hours"],
            catalog.candidate_warnings["distance"],
            catalog.candidate_warnings["reachability"],
            catalog.normal_notice,
        ]
        if travel_compatibility_unproven:
            notices.append(catalog.unresolved_travel_notice)
        try:
            return NormalActionPlanResponse(
                branch="normal",
                schema_version=ACTION_PLAN_SCHEMA_VERSION,
                output_locale=output_locale,
                evaluation_time=evaluation_time,
                situation=project_action_plan_situation(
                    situation,
                    output_locale,
                ),
                priority=priority,
                weather=project_action_plan_weather(
                    weather,
                    output_locale,
                ),
                plan=hydrate_grounded_plan(plan, output_locale),
                selected_place=selected_place,
                candidate_context=CandidateContext(
                    eligible_candidate_count=len(eligible_tuple),
                    snapshot=place_response.snapshot,
                    explanation=explanation,
                    hours_warning=catalog.candidate_warnings["hours"],
                    candidate_notice=catalog.candidate_warnings[
                        "candidate_notice"
                    ],
                    distance_warning=catalog.candidate_warnings[
                        "distance"
                    ],
                    reachability_warning=catalog.candidate_warnings[
                        "reachability"
                    ],
                ),
                notices=notices,
            )
        except (ValidationError, ValueError) as error:
            raise ActionPlanWorkflowUnavailable() from error
