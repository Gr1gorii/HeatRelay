"""Offline HTTP contract tests for the server-owned action-plan workflow."""

from __future__ import annotations

import asyncio
import json
from datetime import date, datetime, timedelta, timezone
from typing import Any

import pytest
from httpx import ASGITransport, AsyncClient
from pydantic import ValidationError

from backend.app.action_plan import (
    ACTION_PLAN_ENDPOINT_PATH,
    EXPLANATION_TEXT,
    INVALID_ACTION_PLAN_REQUEST_CODE,
    INVALID_ACTION_PLAN_REQUEST_MESSAGE,
    LOCAL_PHRASES,
    MOVEMENT_PROHIBITED_EXPLANATION,
    NEXT_ACTION_TEXT,
    NOW_ACTION_TEXT,
    TONIGHT_ACTION_TEXT,
    TRAVEL_COMPATIBILITY_UNPROVEN_EXPLANATION,
    TRAVEL_COMPATIBILITY_UNPROVEN_NOTICE,
    ActionPlanSituationProjection,
    ActionPlanWeatherProjection,
    ActionPlanRequest,
    ActionPlanResponse,
    ActionPlanWorkflowUnavailable,
    CandidateContext,
    HydratedGroundedPlan,
    NormalActionPlanResponse,
    PriorityDecision,
    SelectedCandidatePlace,
    build_grounded_plan_context,
    build_urgent_response,
    derive_normal_plan_contract,
    determine_action_priority,
    hydrate_grounded_plan,
    project_action_plan_situation,
    project_action_plan_weather,
    project_selected_candidate,
)
from backend.app.grounded_plan import (
    EXPLANATION_REASON_ORDER,
    GroundedPlanFailure,
    GroundedPlanBudgetExhausted,
    GroundedPlanInvalidResponse,
    GroundedPlanNotConfigured,
    GroundedPlanRefused,
    GroundedPlanTimeout,
    GroundedPlanUnavailable,
    ModelGroundedPlan,
    NEXT_FEW_HOURS_ACTION_ORDER,
    NOW_ACTION_ORDER,
    TONIGHT_ACTION_ORDER,
)
from backend.app.action_plan_catalog import get_action_plan_catalog
from backend.app.localization import (
    DEFAULT_OUTPUT_LOCALE,
    OutputLocale,
    SUPPORTED_OUTPUT_LOCALES,
)
from backend.app.main import (
    app,
    get_action_plan_clock,
    get_action_plan_validation_repository,
    get_action_plan_workflow,
)
from backend.app.places import (
    CandidatePlace,
    PlaceDataError,
    Origin,
    PlacesCandidatesRequest,
    PlacesCandidatesResponse,
    RequiredFeatures,
    get_place_repository,
)
from backend.app.situation import (
    ModelSituationExtraction,
    SituationExtractionBudgetExhausted,
    SituationExtractionFailure,
    SituationExtractionInvalidResponse,
    SituationExtractionResponse,
    build_public_response,
)
from backend.app.weather import (
    CurrentWeatherContext,
    DailyWeatherContext,
    WeatherContextResponse,
    WeatherSource,
    WeatherUnavailable,
    WeatherUnits,
)


def _situation(*, symptom: str | None = None) -> SituationExtractionResponse:
    return build_public_response(
        ModelSituationExtraction.model_validate(
            {
                "detected_input_language": "en",
                "preferred_language": {"status": "not_stated", "value": None},
                "vulnerability_factors": {
                    "status": "reported",
                    "values": ["living_alone"],
                },
                "mobility_constraints": {"status": "not_stated", "values": []},
                "cooling_access": {
                    "status": "reported",
                    "value": "no_home_cooling",
                },
                "housing_situation": {"status": "not_stated", "value": None},
                "time_constraints": {"status": "not_stated", "values": []},
                "reported_symptoms": (
                    {"status": "reported", "values": [symptom]}
                    if symptom is not None
                    else {"status": "explicit_none", "values": []}
                ),
            }
        )
    )


def _weather() -> WeatherContextResponse:
    return WeatherContextResponse(
        retrieved_at=datetime(2026, 7, 17, 8, 0, tzinfo=timezone.utc),
        timezone="Europe/Madrid",
        units=WeatherUnits(),
        current=CurrentWeatherContext(
            observed_at=datetime.fromisoformat("2026-07-17T10:00:00+02:00"),
            temperature_c=33.0,
            apparent_temperature_c=34.0,
            relative_humidity_pct=48.0,
            weather_code=1,
        ),
        today=DailyWeatherContext(
            date=date(2026, 7, 17),
            temperature_max_c=35.0,
            apparent_temperature_max_c=36.0,
            uv_index_max=8.0,
        ),
        source=WeatherSource(),
    )


def _committed_candidates() -> PlacesCandidatesResponse:
    return get_place_repository().find_action_candidates(
        PlacesCandidatesRequest(
            origin=Origin(latitude=41.3874, longitude=2.1686),
            evaluation_datetime=datetime(
                2026,
                7,
                17,
                8,
                0,
                tzinfo=timezone.utc,
            ),
            required_features=RequiredFeatures(),
            maximum_distance_m=3000.0,
            limit=3,
        ),
        accessibility_required=False,
    )


def _candidate() -> CandidatePlace:
    return _committed_candidates().candidates[0]


def _normal_response(
    output_locale: OutputLocale = DEFAULT_OUTPUT_LOCALE,
) -> NormalActionPlanResponse:
    situation = _situation()
    weather = _weather()
    candidate = _candidate()
    committed_candidates = _committed_candidates()
    catalog = get_action_plan_catalog(output_locale)
    priority = determine_action_priority(
        situation,
        weather.today.temperature_max_c,
        output_locale=output_locale,
    )
    plan = ModelGroundedPlan.model_validate(
        {
            "now": {
                "action_codes": [
                    "move_to_cooler_space",
                    "reduce_physical_effort",
                    "drink_water",
                    "travel_to_selected_place",
                ]
            },
            "next_few_hours": {
                "action_codes": [
                    "keep_drinking_water",
                    "check_updated_weather",
                    "prepare_for_tonight",
                ]
            },
            "tonight": {
                "action_codes": [
                    "sleep_in_coolest_available_room",
                    "keep_water_nearby",
                    "check_updated_weather_tonight",
                ]
            },
            "bring_items": ["water", "phone"],
            "explanation_reasons": [
                "forecast_at_or_above_34c",
                "reported_vulnerability",
                "no_home_cooling",
                "verified_open_candidate",
            ],
            "local_phrase_code": "spanish_request_cool_space",
            "selected_place_id": candidate.place_id,
        }
    )
    return NormalActionPlanResponse(
        branch="normal",
        schema_version="1.16.0",
        output_locale=output_locale,
        evaluation_time=datetime(2026, 7, 17, 8, 0, tzinfo=timezone.utc),
        situation=project_action_plan_situation(
            situation,
            output_locale=output_locale,
        ),
        priority=priority,
        weather=project_action_plan_weather(
            weather,
            output_locale=output_locale,
        ),
        plan=hydrate_grounded_plan(plan, output_locale),
        selected_place=project_selected_candidate(candidate),
        candidate_context=CandidateContext(
            eligible_candidate_count=len(committed_candidates.candidates),
            snapshot=committed_candidates.snapshot,
            explanation=catalog.candidate_explanations["matched_candidate"],
            hours_warning=catalog.candidate_warnings["hours"],
            candidate_notice=catalog.candidate_warnings["candidate_notice"],
            distance_warning=catalog.candidate_warnings["distance"],
            reachability_warning=catalog.candidate_warnings["reachability"],
        ),
        notices=[
            catalog.policy_notice,
            catalog.candidate_warnings["hours"],
            catalog.candidate_warnings["distance"],
            catalog.candidate_warnings["reachability"],
            catalog.normal_notice,
        ],
    )


def _normal_response_at(evaluation_time: datetime) -> NormalActionPlanResponse:
    payload = _normal_response().model_dump(mode="python")
    payload["evaluation_time"] = evaluation_time
    payload["weather"]["retrieved_at"] = evaluation_time
    return NormalActionPlanResponse.model_validate(payload)


def _urgent_response(
    output_locale: OutputLocale = DEFAULT_OUTPUT_LOCALE,
) -> ActionPlanResponse:
    situation = _situation(symptom="confusion")
    return build_urgent_response(
        situation,
        datetime(2026, 7, 17, 8, 0, tzinfo=timezone.utc),
        determine_action_priority(
            situation,
            None,
            output_locale=output_locale,
        ),
        output_locale,
    )


def _situation_with(
    base: SituationExtractionResponse,
    **updates: object,
) -> SituationExtractionResponse:
    field_names = (
        "detected_input_language",
        "preferred_language",
        "vulnerability_factors",
        "mobility_constraints",
        "cooling_access",
        "housing_situation",
        "time_constraints",
        "reported_symptoms",
    )
    payload = {
        field_name: (
            getattr(base, field_name).model_dump(mode="python")
            if hasattr(getattr(base, field_name), "model_dump")
            else getattr(base, field_name)
        )
        for field_name in field_names
    }
    payload.update(updates)
    return build_public_response(ModelSituationExtraction.model_validate(payload))


def _hydrated_action(code: str, catalog: dict[str, tuple[str, str]]) -> dict[str, str]:
    text, explanation = catalog[code]
    return {"code": code, "text": text, "explanation": explanation}


def _set_phase_codes(
    payload: dict[str, Any],
    phase: str,
    codes: list[str],
) -> None:
    catalog, order = {
        "now": (NOW_ACTION_TEXT, NOW_ACTION_ORDER),
        "next_few_hours": (NEXT_ACTION_TEXT, NEXT_FEW_HOURS_ACTION_ORDER),
        "tonight": (TONIGHT_ACTION_TEXT, TONIGHT_ACTION_ORDER),
    }[phase]
    selected = set(codes)
    payload["plan"][phase]["actions"] = [
        _hydrated_action(code, catalog)
        for code in order
        if code in selected
    ]


def _add_phase_code(payload: dict[str, Any], phase: str, code: str) -> None:
    selected = [
        action["code"] for action in payload["plan"][phase]["actions"]
    ]
    selected.append(code)
    _set_phase_codes(payload, phase, selected)


def _set_explanation_codes(payload: dict[str, Any], codes: list[str]) -> None:
    selected = set(codes)
    payload["plan"]["explanations"] = [
        {"code": code, "text": EXPLANATION_TEXT[code]}
        for code in EXPLANATION_REASON_ORDER
        if code in selected
    ]


def _set_local_phrase(payload: dict[str, Any], code: str) -> None:
    language, text = LOCAL_PHRASES[code]
    payload["plan"]["local_phrase"] = {
        "code": code,
        "language": language,
        "text": text,
    }


def _set_normal_situation(
    payload: dict[str, Any],
    situation: SituationExtractionResponse,
) -> None:
    payload["situation"] = situation.model_dump(mode="python")
    priority = determine_action_priority(
        situation,
        payload["weather"]["today"]["temperature_max_c"],
        output_locale=DEFAULT_OUTPUT_LOCALE,
    )
    payload["priority"] = priority.model_dump(mode="python")
    has_selected = payload["selected_place"] is not None
    _set_explanation_codes(
        payload,
        [
            *priority.reason_codes,
            *(["verified_open_candidate"] if has_selected else []),
        ],
    )


class FakeWorkflow:
    def __init__(
        self,
        *,
        response: ActionPlanResponse | None = None,
        failure: Exception | None = None,
    ) -> None:
        self.response = response
        self.failure = failure
        self.calls: list[ActionPlanRequest] = []

    async def create(self, request: ActionPlanRequest) -> ActionPlanResponse:
        self.calls.append(request)
        if self.failure is not None:
            raise self.failure
        assert self.response is not None
        return self.response


class SequenceClock:
    def __init__(self, *values: datetime) -> None:
        self.values = list(values)
        self.calls: list[datetime] = []

    def __call__(self) -> datetime:
        if not self.values:
            raise AssertionError("endpoint clock was read more than twice")
        value = self.values.pop(0)
        self.calls.append(value)
        return value


class QueryRecordingRepository:
    def __init__(self) -> None:
        self.calls = 0

    def find_action_candidates(self, *_args: object, **_kwargs: object) -> object:
        self.calls += 1
        raise AssertionError("trusted repository must not be queried")


async def _post_json(payload: object) -> tuple[int, dict[str, Any], str]:
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://testserver",
    ) as client:
        response = await client.post(ACTION_PLAN_ENDPOINT_PATH, json=payload)
    return response.status_code, response.json(), response.text


async def _post_raw(content: bytes) -> tuple[int, dict[str, Any], str]:
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://testserver",
    ) as client:
        response = await client.post(
            ACTION_PLAN_ENDPOINT_PATH,
            content=content,
            headers={"content-type": "application/json"},
        )
    return response.status_code, response.json(), response.text


def _run(
    workflow: FakeWorkflow,
    payload: object,
    *,
    clock: SequenceClock | None = None,
    trusted_repository: object | None = None,
) -> tuple[int, dict[str, Any], str]:
    endpoint_clock = clock or SequenceClock(
        datetime(2026, 7, 17, 7, 59, 59, tzinfo=timezone.utc),
        datetime(2026, 7, 17, 8, 0, 1, tzinfo=timezone.utc),
    )
    previous = app.dependency_overrides.copy()
    app.dependency_overrides[get_action_plan_workflow] = lambda: workflow
    app.dependency_overrides[get_action_plan_clock] = lambda: endpoint_clock
    if trusted_repository is not None:
        app.dependency_overrides[get_action_plan_validation_repository] = (
            lambda: trusted_repository
        )
    try:
        return asyncio.run(_post_json(payload))
    finally:
        app.dependency_overrides.clear()
        app.dependency_overrides.update(previous)


VALID_REQUEST = {
    "situation_text": "Synthetic Barcelona planning case.",
    "origin": {"latitude": 41.3874, "longitude": 2.1686},
    "maximum_distance_m": 3000,
}
EXPLICIT_EN_REQUEST = {**VALID_REQUEST, "output_locale": "en"}
EXPLICIT_ES_REQUEST = {**VALID_REQUEST, "output_locale": "es"}
EXPLICIT_ZH_CN_REQUEST = {**VALID_REQUEST, "output_locale": "zh-CN"}
EXPLICIT_ZH_TW_REQUEST = {**VALID_REQUEST, "output_locale": "zh-TW"}
EXPLICIT_HI_REQUEST = {**VALID_REQUEST, "output_locale": "hi"}
EXPLICIT_BN_REQUEST = {**VALID_REQUEST, "output_locale": "bn"}
EXPLICIT_AR_REQUEST = {**VALID_REQUEST, "output_locale": "ar"}
EXPLICIT_PT_BR_REQUEST = {**VALID_REQUEST, "output_locale": "pt-BR"}
EXPLICIT_FR_REQUEST = {**VALID_REQUEST, "output_locale": "fr"}
EXPLICIT_IT_REQUEST = {**VALID_REQUEST, "output_locale": "it"}
EXPLICIT_DE_REQUEST = {**VALID_REQUEST, "output_locale": "de"}
EXPLICIT_NL_REQUEST = {**VALID_REQUEST, "output_locale": "nl"}
EXPLICIT_RU_REQUEST = {**VALID_REQUEST, "output_locale": "ru"}
EXPLICIT_UK_REQUEST = {**VALID_REQUEST, "output_locale": "uk"}
EXPLICIT_PL_REQUEST = {**VALID_REQUEST, "output_locale": "pl"}
EXPLICIT_JA_REQUEST = {**VALID_REQUEST, "output_locale": "ja"}
EXPLICIT_KO_REQUEST = {**VALID_REQUEST, "output_locale": "ko"}
EXPLICIT_ID_REQUEST = {**VALID_REQUEST, "output_locale": "id"}
EXPLICIT_VI_REQUEST = {**VALID_REQUEST, "output_locale": "vi"}
EXPLICIT_TH_REQUEST = {**VALID_REQUEST, "output_locale": "th"}
EXPLICIT_TR_REQUEST = {**VALID_REQUEST, "output_locale": "tr"}
EXPLICIT_SW_REQUEST = {**VALID_REQUEST, "output_locale": "sw"}
EXPLICIT_UR_REQUEST = {**VALID_REQUEST, "output_locale": "ur"}
EXPLICIT_FA_REQUEST = {**VALID_REQUEST, "output_locale": "fa"}
EXPLICIT_HE_REQUEST = {**VALID_REQUEST, "output_locale": "he"}


@pytest.mark.parametrize(
    "response",
    [
        pytest.param(_normal_response(), id="normal"),
        pytest.param(
            build_urgent_response(
                _situation(symptom="confusion"),
                datetime(2026, 7, 17, 8, 0, tzinfo=timezone.utc),
                determine_action_priority(
                    _situation(symptom="confusion"),
                    None,
                ),
                DEFAULT_OUTPUT_LOCALE,
            ),
            id="urgent",
        ),
    ],
)
@pytest.mark.parametrize(
    "request_payload",
    [
        pytest.param(VALID_REQUEST, id="legacy-default-en"),
        pytest.param(EXPLICIT_EN_REQUEST, id="explicit-en"),
    ],
)
def test_action_plan_endpoint_returns_exact_discriminated_contract(
    response: ActionPlanResponse,
    request_payload: dict[str, Any],
) -> None:
    workflow = FakeWorkflow(response=response)
    status, payload, response_text = _run(workflow, request_payload)

    assert status == 200
    assert payload == response.model_dump(mode="json")
    expected_field_order = {
        "normal": [
            "branch",
            "schema_version",
            "output_locale",
            "evaluation_time",
            "situation",
            "priority",
            "weather",
            "plan",
            "selected_place",
            "candidate_context",
            "notices",
        ],
        "urgent": [
            "branch",
            "schema_version",
            "output_locale",
            "evaluation_time",
            "situation",
            "priority",
            "urgent_contact",
            "actions",
            "notices",
        ],
    }
    assert list(payload) == expected_field_order[response.branch]
    assert payload["schema_version"] == "1.16.0"
    assert payload["output_locale"] == "en"
    assert isinstance(response.situation, ActionPlanSituationProjection)
    if response.branch == "normal":
        assert isinstance(response.weather, ActionPlanWeatherProjection)
    assert payload["situation"]["schema_version"] == "1.1.0"
    assert payload["situation"]["detected_input_language"] == "en"
    assert (
        payload["situation"]["input_language_source"]
        == "automatically_detected"
    )
    assert workflow.calls == [ActionPlanRequest.model_validate(request_payload)]
    assert workflow.calls[0].output_locale == "en"
    assert VALID_REQUEST["situation_text"] not in response_text
    assert "41.3874" not in response_text
    assert "2.1686" not in response_text
    assert "origin" not in payload


@pytest.mark.parametrize("branch", ["normal", "urgent"])
@pytest.mark.parametrize("output_locale", SUPPORTED_OUTPUT_LOCALES[1:])
def test_action_plan_endpoint_returns_matching_nondefault_locale_contract(
    branch: str,
    output_locale: OutputLocale,
) -> None:
    response = (
        _normal_response(output_locale)
        if branch == "normal"
        else _urgent_response(output_locale)
    )
    request_payload = {**VALID_REQUEST, "output_locale": output_locale}
    workflow = FakeWorkflow(response=response)

    status, payload, response_text = _run(workflow, request_payload)

    assert status == 200
    assert payload == response.model_dump(mode="json")
    assert payload["schema_version"] == "1.16.0"
    assert payload["output_locale"] == output_locale
    assert workflow.calls == [ActionPlanRequest.model_validate(request_payload)]
    assert workflow.calls[0].output_locale == output_locale
    assert VALID_REQUEST["situation_text"] not in response_text


@pytest.mark.parametrize("branch", ["normal", "urgent"])
@pytest.mark.parametrize(
    ("response_locale", "request_payload"),
    [
        pytest.param("es", EXPLICIT_EN_REQUEST, id="spanish-response-to-english"),
        pytest.param("en", EXPLICIT_ES_REQUEST, id="english-response-to-spanish"),
        pytest.param(
            "zh-TW",
            EXPLICIT_ZH_CN_REQUEST,
            id="traditional-response-to-simplified",
        ),
        pytest.param(
            "zh-CN",
            EXPLICIT_ZH_TW_REQUEST,
            id="simplified-response-to-traditional",
        ),
        pytest.param(
            "zh-CN",
            EXPLICIT_EN_REQUEST,
            id="simplified-response-to-english",
        ),
        pytest.param(
            "es",
            EXPLICIT_ZH_TW_REQUEST,
            id="spanish-response-to-traditional",
        ),
        pytest.param("bn", EXPLICIT_HI_REQUEST, id="bengali-response-to-hindi"),
        pytest.param("hi", EXPLICIT_BN_REQUEST, id="hindi-response-to-bengali"),
        pytest.param(
            "hi",
            EXPLICIT_ZH_CN_REQUEST,
            id="hindi-response-to-simplified",
        ),
        pytest.param(
            "zh-TW",
            EXPLICIT_BN_REQUEST,
            id="traditional-response-to-bengali",
        ),
        pytest.param("es", EXPLICIT_HI_REQUEST, id="spanish-response-to-hindi"),
        pytest.param("bn", EXPLICIT_EN_REQUEST, id="bengali-response-to-english"),
        pytest.param("en", EXPLICIT_BN_REQUEST, id="english-response-to-bengali"),
        pytest.param("ar", EXPLICIT_EN_REQUEST, id="arabic-response-to-english"),
        pytest.param("en", EXPLICIT_AR_REQUEST, id="english-response-to-arabic"),
        pytest.param("ar", EXPLICIT_HI_REQUEST, id="arabic-response-to-hindi"),
        pytest.param(
            "pt-BR",
            EXPLICIT_EN_REQUEST,
            id="brazilian-portuguese-response-to-english",
        ),
        pytest.param(
            "en",
            EXPLICIT_PT_BR_REQUEST,
            id="english-response-to-brazilian-portuguese",
        ),
        pytest.param(
            "pt-BR",
            EXPLICIT_ES_REQUEST,
            id="brazilian-portuguese-response-to-spanish",
        ),
        pytest.param("fr", EXPLICIT_IT_REQUEST, id="french-response-to-italian"),
        pytest.param("it", EXPLICIT_FR_REQUEST, id="italian-response-to-french"),
        pytest.param("fr", EXPLICIT_EN_REQUEST, id="french-response-to-english"),
        pytest.param("en", EXPLICIT_IT_REQUEST, id="english-response-to-italian"),
        pytest.param("de", EXPLICIT_NL_REQUEST, id="german-response-to-dutch"),
        pytest.param("nl", EXPLICIT_DE_REQUEST, id="dutch-response-to-german"),
        pytest.param("de", EXPLICIT_EN_REQUEST, id="german-response-to-english"),
        pytest.param("en", EXPLICIT_NL_REQUEST, id="english-response-to-dutch"),
        pytest.param("ru", EXPLICIT_UK_REQUEST, id="russian-response-to-ukrainian"),
        pytest.param("uk", EXPLICIT_RU_REQUEST, id="ukrainian-response-to-russian"),
        pytest.param("pl", EXPLICIT_RU_REQUEST, id="polish-response-to-russian"),
        pytest.param("en", EXPLICIT_PL_REQUEST, id="english-response-to-polish"),
        pytest.param("ja", EXPLICIT_KO_REQUEST, id="japanese-response-to-korean"),
        pytest.param("ko", EXPLICIT_JA_REQUEST, id="korean-response-to-japanese"),
        pytest.param("ja", EXPLICIT_EN_REQUEST, id="japanese-response-to-english"),
        pytest.param("en", EXPLICIT_KO_REQUEST, id="english-response-to-korean"),
        pytest.param("id", EXPLICIT_VI_REQUEST, id="indonesian-response-to-vietnamese"),
        pytest.param("vi", EXPLICIT_TH_REQUEST, id="vietnamese-response-to-thai"),
        pytest.param("th", EXPLICIT_ID_REQUEST, id="thai-response-to-indonesian"),
        pytest.param("id", EXPLICIT_EN_REQUEST, id="indonesian-response-to-english"),
        pytest.param("tr", EXPLICIT_SW_REQUEST, id="turkish-response-to-swahili"),
        pytest.param("sw", EXPLICIT_TR_REQUEST, id="swahili-response-to-turkish"),
        pytest.param("tr", EXPLICIT_EN_REQUEST, id="turkish-response-to-english"),
        pytest.param("sw", EXPLICIT_VI_REQUEST, id="swahili-response-to-vietnamese"),
        pytest.param("ur", EXPLICIT_FA_REQUEST, id="urdu-response-to-persian"),
        pytest.param("fa", EXPLICIT_UR_REQUEST, id="persian-response-to-urdu"),
        pytest.param("ur", EXPLICIT_EN_REQUEST, id="urdu-response-to-english"),
        pytest.param("fa", EXPLICIT_AR_REQUEST, id="persian-response-to-arabic"),
        pytest.param("he", EXPLICIT_EN_REQUEST, id="hebrew-response-to-english"),
        pytest.param("he", EXPLICIT_FA_REQUEST, id="hebrew-response-to-persian"),
    ],
)
def test_action_plan_endpoint_rejects_supported_response_locale_mismatch(
    branch: str,
    response_locale: OutputLocale,
    request_payload: dict[str, Any],
) -> None:
    response = (
        _normal_response(response_locale)
        if branch == "normal"
        else _urgent_response(response_locale)
    )
    trusted_repository = QueryRecordingRepository()

    status, payload, response_text = _run(
        FakeWorkflow(response=response),
        request_payload,
        trusted_repository=trusted_repository,
    )

    assert status == 503
    assert payload == {
        "detail": {
            "code": "action_plan_unavailable",
            "message": "Action-plan workflow is temporarily unavailable.",
        }
    }
    assert trusted_repository.calls == 0
    assert VALID_REQUEST["situation_text"] not in response_text


@pytest.mark.parametrize(
    ("branch", "detected_language", "expected_source"),
    [
        pytest.param(
            "normal",
            "fa",
            "automatically_detected",
            id="normal-supported",
        ),
        pytest.param(
            "normal",
            "other",
            "automatically_detected",
            id="normal-other",
        ),
        pytest.param("urgent", "unknown", "fallback", id="urgent-unknown"),
    ],
)
def test_endpoint_preserves_nested_detected_language_and_backend_source(
    branch: str,
    detected_language: str,
    expected_source: str,
) -> None:
    if branch == "normal":
        base = _normal_response()
        situation = _situation_with(
            base.situation,
            detected_input_language=detected_language,
        )
        response_payload = base.model_dump(mode="python")
        _set_normal_situation(response_payload, situation)
        response: ActionPlanResponse = NormalActionPlanResponse.model_validate(
            response_payload
        )
    else:
        situation = _situation_with(
            _situation(symptom="confusion"),
            detected_input_language=detected_language,
        )
        response = build_urgent_response(
            situation,
            datetime(2026, 7, 17, 8, 0, tzinfo=timezone.utc),
            determine_action_priority(situation, None),
            DEFAULT_OUTPUT_LOCALE,
        )

    status, payload, _ = _run(FakeWorkflow(response=response), EXPLICIT_EN_REQUEST)

    assert status == 200
    assert payload["schema_version"] == "1.16.0"
    assert payload["output_locale"] == "en"
    assert payload["situation"]["schema_version"] == "1.1.0"
    assert payload["situation"]["detected_input_language"] == detected_language
    assert payload["situation"]["input_language_source"] == expected_source


@pytest.mark.parametrize(
    "offset_seconds",
    [pytest.param(-2, id="past"), pytest.param(2, id="future")],
)
def test_normal_evaluation_time_must_be_inside_endpoint_interval_before_repository(
    offset_seconds: int,
) -> None:
    trusted_repository = QueryRecordingRepository()
    response = _normal_response_at(
        datetime(2026, 7, 17, 8, 0, tzinfo=timezone.utc)
        + timedelta(seconds=offset_seconds)
    )
    clock = SequenceClock(
        datetime(2026, 7, 17, 7, 59, 59, tzinfo=timezone.utc),
        datetime(2026, 7, 17, 8, 0, 1, tzinfo=timezone.utc),
    )

    status, payload, response_text = _run(
        FakeWorkflow(response=response),
        VALID_REQUEST,
        clock=clock,
        trusted_repository=trusted_repository,
    )

    assert status == 503
    assert payload == {
        "detail": {
            "code": "action_plan_unavailable",
            "message": "Action-plan workflow is temporarily unavailable.",
        }
    }
    assert trusted_repository.calls == 0
    assert VALID_REQUEST["situation_text"] not in response_text


def test_urgent_evaluation_time_must_be_inside_endpoint_interval() -> None:
    situation = _situation(symptom="confusion")
    response = build_urgent_response(
        situation,
        datetime(2026, 7, 17, 8, 0, 2, tzinfo=timezone.utc),
        determine_action_priority(situation, None),
        DEFAULT_OUTPUT_LOCALE,
    )
    trusted_repository = QueryRecordingRepository()

    status, payload, _ = _run(
        FakeWorkflow(response=response),
        VALID_REQUEST,
        clock=SequenceClock(
            datetime(2026, 7, 17, 7, 59, 59, tzinfo=timezone.utc),
            datetime(2026, 7, 17, 8, 0, 1, tzinfo=timezone.utc),
        ),
        trusted_repository=trusted_repository,
    )

    assert status == 503
    assert payload["detail"]["code"] == "action_plan_unavailable"
    assert trusted_repository.calls == 0


@pytest.mark.parametrize("branch", ["normal", "urgent"])
def test_response_evaluation_time_inside_endpoint_interval_is_accepted(
    branch: str,
) -> None:
    if branch == "normal":
        response: ActionPlanResponse = _normal_response()
    else:
        situation = _situation(symptom="confusion")
        response = build_urgent_response(
            situation,
            datetime(2026, 7, 17, 8, 0, tzinfo=timezone.utc),
            determine_action_priority(situation, None),
            DEFAULT_OUTPUT_LOCALE,
        )

    status, payload, _ = _run(FakeWorkflow(response=response), VALID_REQUEST)

    assert status == 200
    assert payload["branch"] == branch


@pytest.mark.parametrize(
    ("clock_values", "expected_workflow_calls"),
    [
        pytest.param(
            (
                datetime(2026, 7, 17, 7, 59, 59),
                datetime(2026, 7, 17, 8, 0, 1, tzinfo=timezone.utc),
            ),
            0,
            id="naive-start",
        ),
        pytest.param(
            (
                datetime(2026, 7, 17, 7, 59, 59, tzinfo=timezone.utc),
                datetime(2026, 7, 17, 8, 0, 1),
            ),
            1,
            id="naive-finish",
        ),
        pytest.param(
            (
                datetime(2026, 7, 17, 8, 0, 1, tzinfo=timezone.utc),
                datetime(2026, 7, 17, 7, 59, 59, tzinfo=timezone.utc),
            ),
            1,
            id="reversed",
        ),
    ],
)
def test_invalid_endpoint_clock_intervals_fail_closed_before_repository(
    clock_values: tuple[datetime, datetime],
    expected_workflow_calls: int,
) -> None:
    workflow = FakeWorkflow(response=_normal_response())
    trusted_repository = QueryRecordingRepository()

    status, payload, _ = _run(
        workflow,
        VALID_REQUEST,
        clock=SequenceClock(*clock_values),
        trusted_repository=trusted_repository,
    )

    assert status == 503
    assert payload["detail"]["code"] == "action_plan_unavailable"
    assert len(workflow.calls) == expected_workflow_calls
    assert trusted_repository.calls == 0


@pytest.mark.parametrize(
    "mutation",
    [
        pytest.param("missing-required-action", id="required-matrix"),
        pytest.param("forged-action-text", id="hydrated-action-catalog"),
        pytest.param("travel-without-place", id="travel-place-pairing"),
        pytest.param("travel-without-items", id="travel-preparation"),
        pytest.param("forged-explanation", id="explanation-catalog"),
    ],
)
def test_normal_public_model_rejects_cross_field_inconsistency(
    mutation: str,
) -> None:
    payload = _normal_response().model_dump(mode="python")
    if mutation == "missing-required-action":
        payload["plan"]["now"]["actions"] = [
            action
            for action in payload["plan"]["now"]["actions"]
            if action["code"] != "reduce_physical_effort"
        ]
    elif mutation == "forged-action-text":
        payload["plan"]["now"]["actions"][0]["text"] = "Forged model prose"
    elif mutation == "travel-without-place":
        payload["selected_place"] = None
    elif mutation == "travel-without-items":
        payload["plan"]["bring_items"] = []
    else:
        payload["plan"]["explanations"][0]["text"] = "Forged rationale"

    with pytest.raises(ValidationError):
        NormalActionPlanResponse.model_validate(payload)


@pytest.mark.parametrize(
    "mutation",
    [
        pytest.param("situation-notice", id="situation-notice"),
        pytest.param("weather-notice", id="weather-notice"),
        pytest.param("policy-notice", id="policy-notice"),
        pytest.param("policy-rule", id="policy-rule"),
        pytest.param("action-explanation", id="action-explanation"),
        pytest.param("bring-item", id="bring-item"),
        pytest.param("normal-plan-notice", id="normal-plan-notice"),
        pytest.param("candidate-explanation", id="candidate-explanation"),
        pytest.param("hours-warning", id="hours-warning"),
        pytest.param("candidate-notice", id="candidate-notice"),
        pytest.param("distance-warning", id="distance-warning"),
        pytest.param("reachability-warning", id="reachability-warning"),
        pytest.param("normal-response-notice", id="normal-response-notice"),
    ],
)
def test_normal_public_model_rejects_catalog_owned_prose_tampering(
    mutation: str,
) -> None:
    payload = _normal_response().model_dump(mode="python")
    if mutation == "situation-notice":
        payload["situation"]["notice"] = "Forged situation notice"
    elif mutation == "weather-notice":
        payload["weather"]["notice"] = "Forged weather notice"
    elif mutation == "policy-notice":
        payload["priority"]["notice"] = "Forged policy notice"
    elif mutation == "policy-rule":
        payload["priority"]["sources"][0]["heatrelay_rule"] = (
            "Forged policy rule"
        )
    elif mutation == "action-explanation":
        payload["plan"]["now"]["actions"][0]["explanation"] = (
            "Forged action explanation"
        )
    elif mutation == "bring-item":
        payload["plan"]["bring_items"][0]["text"] = "Forged bring item"
    elif mutation == "normal-plan-notice":
        payload["plan"]["notice"] = "Forged normal plan notice"
    elif mutation == "candidate-explanation":
        payload["candidate_context"]["explanation"] = (
            "Forged candidate explanation"
        )
    elif mutation == "hours-warning":
        payload["candidate_context"]["hours_warning"] = (
            "Forged hours warning"
        )
    elif mutation == "candidate-notice":
        payload["candidate_context"]["candidate_notice"] = (
            "Forged candidate notice"
        )
    elif mutation == "distance-warning":
        payload["candidate_context"]["distance_warning"] = (
            "Forged distance warning"
        )
    elif mutation == "reachability-warning":
        payload["candidate_context"]["reachability_warning"] = (
            "Forged reachability warning"
        )
    else:
        payload["notices"][-1] = "Forged normal response notice"

    with pytest.raises(ValidationError):
        NormalActionPlanResponse.model_validate(payload)


@pytest.mark.parametrize(
    "mutation",
    [
        "projection-notice",
        "priority-bundle",
        "hydrated-action",
        "candidate-warning",
        "response-notice",
    ],
)
@pytest.mark.parametrize(
    ("response_locale", "foreign_locale"),
    [
        pytest.param("es", "en", id="spanish-english"),
        pytest.param("zh-CN", "en", id="simplified-english"),
        pytest.param("zh-TW", "en", id="traditional-english"),
        pytest.param("zh-CN", "zh-TW", id="simplified-traditional"),
        pytest.param("zh-TW", "zh-CN", id="traditional-simplified"),
        pytest.param("hi", "en", id="hindi-english"),
        pytest.param("bn", "en", id="bengali-english"),
        pytest.param("hi", "bn", id="hindi-bengali"),
        pytest.param("bn", "hi", id="bengali-hindi"),
        pytest.param("hi", "zh-CN", id="hindi-simplified"),
        pytest.param("bn", "es", id="bengali-spanish"),
        pytest.param("ar", "en", id="arabic-english"),
        pytest.param("en", "ar", id="english-arabic"),
        pytest.param("pt-BR", "en", id="brazilian-portuguese-english"),
        pytest.param("en", "pt-BR", id="english-brazilian-portuguese"),
        pytest.param("fr", "it", id="french-italian"),
        pytest.param("it", "fr", id="italian-french"),
        pytest.param("fr", "en", id="french-english"),
        pytest.param("it", "es", id="italian-spanish"),
        pytest.param("de", "nl", id="german-dutch"),
        pytest.param("nl", "de", id="dutch-german"),
        pytest.param("de", "en", id="german-english"),
        pytest.param("nl", "fr", id="dutch-french"),
        pytest.param("ru", "uk", id="russian-ukrainian"),
        pytest.param("uk", "ru", id="ukrainian-russian"),
        pytest.param("pl", "ru", id="polish-russian"),
        pytest.param("ru", "pl", id="russian-polish"),
        pytest.param("ja", "ko", id="japanese-korean"),
        pytest.param("ko", "ja", id="korean-japanese"),
        pytest.param("ja", "en", id="japanese-english"),
        pytest.param("ko", "zh-CN", id="korean-simplified"),
        pytest.param("id", "vi", id="indonesian-vietnamese"),
        pytest.param("vi", "th", id="vietnamese-thai"),
        pytest.param("th", "id", id="thai-indonesian"),
        pytest.param("id", "en", id="indonesian-english"),
        pytest.param("tr", "sw", id="turkish-swahili"),
        pytest.param("sw", "tr", id="swahili-turkish"),
        pytest.param("tr", "en", id="turkish-english"),
        pytest.param("sw", "vi", id="swahili-vietnamese"),
        pytest.param("ur", "fa", id="urdu-persian"),
        pytest.param("fa", "ur", id="persian-urdu"),
        pytest.param("ur", "en", id="urdu-english"),
        pytest.param("fa", "ar", id="persian-arabic"),
        pytest.param("he", "en", id="hebrew-english"),
        pytest.param("he", "fa", id="hebrew-persian"),
    ],
)
def test_normal_model_rejects_mixed_catalog_prose(
    mutation: str,
    response_locale: OutputLocale,
    foreign_locale: OutputLocale,
) -> None:
    payload = _normal_response(response_locale).model_dump(mode="python")
    foreign = get_action_plan_catalog(foreign_locale)
    if mutation == "projection-notice":
        payload["weather"]["notice"] = foreign.weather_notice
    elif mutation == "priority-bundle":
        payload["priority"]["notice"] = foreign.policy_notice
        for source, rule in zip(
            payload["priority"]["sources"],
            foreign.policy_rules,
        ):
            source["heatrelay_rule"] = rule
    elif mutation == "hydrated-action":
        code = payload["plan"]["now"]["actions"][0]["code"]
        (
            payload["plan"]["now"]["actions"][0]["text"],
            payload["plan"]["now"]["actions"][0]["explanation"],
        ) = foreign.now_actions[code]
    elif mutation == "candidate-warning":
        payload["candidate_context"]["hours_warning"] = (
            foreign.candidate_warnings["hours"]
        )
    else:
        payload["notices"][-1] = foreign.normal_notice

    with pytest.raises(ValidationError):
        NormalActionPlanResponse.model_validate(payload)


def test_normal_public_model_rejects_optional_travel_notice_tampering() -> None:
    response = _normal_response()
    payload = response.model_dump(mode="python")
    situation = _situation_with(
        response.situation,
        mobility_constraints={"status": "unknown", "values": []},
    )
    payload["selected_place"] = None
    payload["candidate_context"]["eligible_candidate_count"] = 0
    payload["plan"]["bring_items"] = []
    payload["plan"]["local_phrase"] = None
    _set_phase_codes(
        payload,
        "now",
        ["move_to_cooler_space", "reduce_physical_effort", "drink_water"],
    )
    _set_normal_situation(payload, situation)
    _set_explanation_codes(
        payload,
        [*payload["priority"]["reason_codes"], "unresolved_travel_constraint"],
    )
    payload["candidate_context"]["explanation"] = (
        TRAVEL_COMPATIBILITY_UNPROVEN_EXPLANATION
    )
    payload["notices"].append(TRAVEL_COMPATIBILITY_UNPROVEN_NOTICE)
    unresolved = NormalActionPlanResponse.model_validate(payload)

    forged = unresolved.model_dump(mode="python")
    forged["notices"][-1] = "Forged unresolved-travel notice"

    with pytest.raises(ValidationError):
        NormalActionPlanResponse.model_validate(forged)


@pytest.mark.parametrize(
    ("phase", "code"),
    [
        pytest.param("now", "use_available_home_cooling", id="no-home-cooling"),
        pytest.param("now", "contact_support_person", id="no-support-fact"),
        pytest.param("now", "remain_at_current_location", id="no-remain-fact"),
        pytest.param(
            "next_few_hours",
            "check_on_household_members",
            id="no-young-child",
        ),
    ],
)
def test_normal_public_model_rejects_context_false_supplemental_action(
    phase: str,
    code: str,
) -> None:
    payload = _normal_response().model_dump(mode="python")
    _add_phase_code(payload, phase, code)

    with pytest.raises(ValidationError):
        NormalActionPlanResponse.model_validate(payload)


def test_normal_public_model_rejects_fan_cooling_at_exact_40c() -> None:
    response = _normal_response()
    payload = response.model_dump(mode="python")
    situation = _situation_with(
        response.situation,
        cooling_access={"status": "reported", "value": "fan_only"},
    )
    payload["weather"]["current"]["temperature_c"] = 40.0
    payload["weather"]["today"]["temperature_max_c"] = 40.0
    _set_normal_situation(payload, situation)
    _add_phase_code(payload, "now", "use_available_home_cooling")
    _add_phase_code(payload, "next_few_hours", "stay_in_cool_space")

    with pytest.raises(ValidationError):
        NormalActionPlanResponse.model_validate(payload)


@pytest.mark.parametrize(
    "forbidden_code",
    ["sleep_in_coolest_available_room", "ventilate_when_outside_is_cooler"],
)
def test_normal_public_model_rejects_unsheltered_room_assumptions(
    forbidden_code: str,
) -> None:
    response = _normal_response()
    payload = response.model_dump(mode="python")
    situation = _situation_with(
        response.situation,
        housing_situation={"status": "reported", "value": "unsheltered"},
    )
    _set_normal_situation(payload, situation)
    _add_phase_code(payload, "tonight", forbidden_code)

    with pytest.raises(ValidationError):
        NormalActionPlanResponse.model_validate(payload)


def test_normal_public_model_rejects_wrong_language_phrase() -> None:
    payload = _normal_response().model_dump(mode="python")
    _set_local_phrase(payload, "catalan_request_cool_space")

    with pytest.raises(ValidationError):
        NormalActionPlanResponse.model_validate(payload)


@pytest.mark.parametrize(
    "false_reason",
    ["movement_prohibited", "forecast_at_or_above_36c"],
)
def test_normal_public_model_rejects_context_false_explanation(
    false_reason: str,
) -> None:
    payload = _normal_response().model_dump(mode="python")
    selected = [
        explanation["code"]
        for explanation in payload["plan"]["explanations"]
    ]
    selected.append(false_reason)
    _set_explanation_codes(payload, selected)

    with pytest.raises(ValidationError):
        NormalActionPlanResponse.model_validate(payload)


@pytest.mark.parametrize("constraint_field", ["mobility_constraints", "time_constraints"])
def test_normal_public_model_rejects_unresolved_travel_with_candidate_count(
    constraint_field: str,
) -> None:
    response = _normal_response()
    payload = response.model_dump(mode="python")
    situation = _situation_with(
        response.situation,
        **{constraint_field: {"status": "unknown", "values": []}},
    )
    payload["selected_place"] = None
    payload["plan"]["bring_items"] = []
    payload["plan"]["local_phrase"] = None
    _set_phase_codes(
        payload,
        "now",
        ["move_to_cooler_space", "reduce_physical_effort", "drink_water"],
    )
    _set_normal_situation(payload, situation)
    priority_reasons = list(payload["priority"]["reason_codes"])
    _set_explanation_codes(
        payload,
        [*priority_reasons, "unresolved_travel_constraint"],
    )
    payload["candidate_context"]["explanation"] = (
        TRAVEL_COMPATIBILITY_UNPROVEN_EXPLANATION
    )
    payload["notices"].append(TRAVEL_COMPATIBILITY_UNPROVEN_NOTICE)

    with pytest.raises(ValidationError):
        NormalActionPlanResponse.model_validate(payload)


@pytest.mark.parametrize(
    "closes_at",
    [
        pytest.param(
            datetime(2026, 7, 17, 8, 0, tzinfo=timezone.utc),
            id="equal",
        ),
        pytest.param(
            datetime(2026, 7, 17, 7, 59, tzinfo=timezone.utc),
            id="earlier",
        ),
    ],
)
def test_normal_public_model_rejects_selected_place_not_open_after_evaluation(
    closes_at: datetime,
) -> None:
    payload = _normal_response().model_dump(mode="python")
    payload["selected_place"]["closes_at"] = closes_at

    with pytest.raises(ValidationError):
        NormalActionPlanResponse.model_validate(payload)


def test_shared_normal_contract_drives_model_and_public_allowed_codes() -> None:
    response = _normal_response()
    contract = derive_normal_plan_contract(
        response.situation,
        response.weather,
        response.priority,
        eligible_candidate_count=1,
    )
    context = build_grounded_plan_context(
        response.situation,
        response.weather,
        response.priority,
        (_candidate(),),
    )

    assert context.allowed_codes == contract.allowed_codes
    assert context.required_codes == contract.required_codes


def test_normal_public_model_accepts_contextual_controls() -> None:
    response = _normal_response()

    air_conditioning = response.model_dump(mode="python")
    air_conditioning_situation = _situation_with(
        response.situation,
        cooling_access={"status": "reported", "value": "air_conditioning"},
    )
    _set_normal_situation(air_conditioning, air_conditioning_situation)
    _add_phase_code(
        air_conditioning,
        "now",
        "use_available_home_cooling",
    )
    NormalActionPlanResponse.model_validate(air_conditioning)

    fan_below_boundary = response.model_dump(mode="python")
    fan_situation = _situation_with(
        response.situation,
        cooling_access={"status": "reported", "value": "fan_only"},
    )
    fan_below_boundary["weather"]["current"]["temperature_c"] = 39.9
    fan_below_boundary["weather"]["today"]["temperature_max_c"] = 39.9
    _set_normal_situation(fan_below_boundary, fan_situation)
    _add_phase_code(
        fan_below_boundary,
        "now",
        "use_available_home_cooling",
    )
    _add_phase_code(
        fan_below_boundary,
        "next_few_hours",
        "stay_in_cool_space",
    )
    NormalActionPlanResponse.model_validate(fan_below_boundary)

    selected_from_multiple = response.model_dump(mode="python")
    selected_from_multiple["candidate_context"]["eligible_candidate_count"] = 3
    NormalActionPlanResponse.model_validate(selected_from_multiple)

    no_selection_from_multiple = response.model_dump(mode="python")
    no_selection_from_multiple["candidate_context"]["eligible_candidate_count"] = 2
    no_selection_from_multiple["selected_place"] = None
    no_selection_from_multiple["plan"]["bring_items"] = []
    no_selection_from_multiple["plan"]["local_phrase"] = None
    _set_phase_codes(
        no_selection_from_multiple,
        "now",
        ["move_to_cooler_space", "reduce_physical_effort", "drink_water"],
    )
    _set_explanation_codes(
        no_selection_from_multiple,
        no_selection_from_multiple["priority"]["reason_codes"],
    )
    NormalActionPlanResponse.model_validate(no_selection_from_multiple)

    unsheltered = response.model_dump(mode="python")
    unsheltered_situation = _situation_with(
        response.situation,
        housing_situation={"status": "reported", "value": "unsheltered"},
    )
    _set_normal_situation(unsheltered, unsheltered_situation)
    _set_phase_codes(
        unsheltered,
        "tonight",
        ["keep_water_nearby", "check_updated_weather_tonight"],
    )
    NormalActionPlanResponse.model_validate(unsheltered)

    catalan = response.model_dump(mode="python")
    catalan_situation = _situation_with(
        response.situation,
        detected_input_language="ca",
    )
    _set_normal_situation(catalan, catalan_situation)
    _set_local_phrase(catalan, "catalan_request_cool_space")
    NormalActionPlanResponse.model_validate(catalan)


@pytest.mark.parametrize(
    ("field_name", "invalid_value"),
    [
        ("snapshot_id", "arbitrary-well-formed-snapshot"),
        ("attribution", "Arbitrary well-formed attribution"),
        ("normalized_sha256", "b" * 64),
        ("retrieved_at", datetime(2026, 7, 18, tzinfo=timezone.utc)),
        (
            "upstream_max_modified",
            datetime(2026, 7, 14, tzinfo=timezone.utc),
        ),
    ],
)
def test_normal_public_model_rejects_noncommitted_snapshot_identity(
    field_name: str,
    invalid_value: object,
) -> None:
    payload = _normal_response().model_dump(mode="python")
    payload["candidate_context"]["snapshot"][field_name] = invalid_value

    with pytest.raises(ValidationError):
        NormalActionPlanResponse.model_validate(payload)


@pytest.mark.parametrize(
    ("field_name", "invalid_value"),
    [
        (
            "source_modified_at",
            datetime(2026, 7, 10, tzinfo=timezone.utc),
        ),
        ("last_checked", date(2026, 7, 15)),
    ],
)
def test_normal_public_model_rejects_selected_place_chronology(
    field_name: str,
    invalid_value: object,
) -> None:
    payload = _normal_response().model_dump(mode="python")
    payload["selected_place"][field_name] = invalid_value

    with pytest.raises(ValidationError):
        NormalActionPlanResponse.model_validate(payload)


def _bypass_normal_response(payload: dict[str, Any]) -> NormalActionPlanResponse:
    selected_payload = payload["selected_place"]
    return NormalActionPlanResponse.model_construct(
        branch=payload["branch"],
        schema_version=payload["schema_version"],
        output_locale=payload["output_locale"],
        evaluation_time=payload["evaluation_time"],
        situation=ActionPlanSituationProjection.model_validate(
            payload["situation"]
        ),
        priority=PriorityDecision.model_validate(payload["priority"]),
        weather=ActionPlanWeatherProjection.model_validate(payload["weather"]),
        plan=HydratedGroundedPlan.model_validate(payload["plan"]),
        selected_place=(
            SelectedCandidatePlace.model_validate(selected_payload)
            if selected_payload is not None
            else None
        ),
        candidate_context=CandidateContext.model_validate(
            payload["candidate_context"]
        ),
        notices=payload["notices"],
    )


def _assert_sanitized_action_plan_unavailable(
    response: NormalActionPlanResponse,
) -> None:
    status, payload, response_text = _run(FakeWorkflow(response=response), VALID_REQUEST)

    assert status == 503
    assert payload == {
        "detail": {
            "code": "action_plan_unavailable",
            "message": "Action-plan workflow is temporarily unavailable.",
        }
    }
    for private in (
        VALID_REQUEST["situation_text"],
        "41.3874",
        "2.1686",
        "arbitrary-well-formed-snapshot",
    ):
        assert private not in response_text


@pytest.mark.parametrize(
    "case",
    [
        "no-home-cooling",
        "fan-at-40",
        "unsheltered-room",
        "household-without-child",
        "support-without-fact",
        "remain-without-fact",
        "wrong-language-phrase",
        "false-movement-reason",
        "wrong-threshold-reason",
        "unknown-mobility-count",
        "unknown-time-count",
        "closing-equality",
        "over-request-distance",
        "snapshot-identity",
        "snapshot-attribution",
        "snapshot-sha",
        "snapshot-retrieved",
        "snapshot-upstream",
        "selected-source-newer-than-upstream",
        "selected-last-checked-mismatch",
        "selected-immutable-field-mismatch",
        "unknown-selected-id",
    ],
)
def test_asgi_rejects_contextual_and_committed_membership_bypasses(
    case: str,
) -> None:
    response = _normal_response()
    payload = response.model_dump(mode="python")
    if case == "no-home-cooling":
        _add_phase_code(payload, "now", "use_available_home_cooling")
    elif case == "fan-at-40":
        situation = _situation_with(
            response.situation,
            cooling_access={"status": "reported", "value": "fan_only"},
        )
        payload["weather"]["current"]["temperature_c"] = 40.0
        payload["weather"]["today"]["temperature_max_c"] = 40.0
        _set_normal_situation(payload, situation)
        _add_phase_code(payload, "now", "use_available_home_cooling")
        _add_phase_code(payload, "next_few_hours", "stay_in_cool_space")
    elif case == "unsheltered-room":
        situation = _situation_with(
            response.situation,
            housing_situation={"status": "reported", "value": "unsheltered"},
        )
        _set_normal_situation(payload, situation)
        _add_phase_code(payload, "tonight", "sleep_in_coolest_available_room")
    elif case == "household-without-child":
        _add_phase_code(payload, "next_few_hours", "check_on_household_members")
    elif case == "support-without-fact":
        _add_phase_code(payload, "now", "contact_support_person")
    elif case == "remain-without-fact":
        _add_phase_code(payload, "now", "remain_at_current_location")
    elif case == "wrong-language-phrase":
        _set_local_phrase(payload, "catalan_request_cool_space")
    elif case in {"false-movement-reason", "wrong-threshold-reason"}:
        reason = (
            "movement_prohibited"
            if case == "false-movement-reason"
            else "forecast_at_or_above_36c"
        )
        codes = [item["code"] for item in payload["plan"]["explanations"]]
        _set_explanation_codes(payload, [*codes, reason])
    elif case in {"unknown-mobility-count", "unknown-time-count"}:
        field_name = (
            "mobility_constraints"
            if case == "unknown-mobility-count"
            else "time_constraints"
        )
        situation = _situation_with(
            response.situation,
            **{field_name: {"status": "unknown", "values": []}},
        )
        payload["selected_place"] = None
        payload["plan"]["bring_items"] = []
        payload["plan"]["local_phrase"] = None
        _set_phase_codes(
            payload,
            "now",
            ["move_to_cooler_space", "reduce_physical_effort", "drink_water"],
        )
        _set_normal_situation(payload, situation)
        _set_explanation_codes(
            payload,
            [*payload["priority"]["reason_codes"], "unresolved_travel_constraint"],
        )
        payload["candidate_context"]["explanation"] = (
            TRAVEL_COMPATIBILITY_UNPROVEN_EXPLANATION
        )
        payload["notices"].append(TRAVEL_COMPATIBILITY_UNPROVEN_NOTICE)
    elif case == "closing-equality":
        payload["selected_place"]["closes_at"] = payload["evaluation_time"]
    elif case == "over-request-distance":
        payload["selected_place"]["distance_m"] = 3001
    elif case == "snapshot-identity":
        payload["candidate_context"]["snapshot"]["snapshot_id"] = (
            "arbitrary-well-formed-snapshot"
        )
    elif case == "snapshot-attribution":
        payload["candidate_context"]["snapshot"]["attribution"] = (
            "Arbitrary well-formed attribution"
        )
    elif case == "snapshot-sha":
        payload["candidate_context"]["snapshot"]["normalized_sha256"] = (
            "b" * 64
        )
    elif case == "snapshot-retrieved":
        payload["candidate_context"]["snapshot"]["retrieved_at"] = datetime(
            2026,
            7,
            18,
            tzinfo=timezone.utc,
        )
    elif case == "snapshot-upstream":
        payload["candidate_context"]["snapshot"][
            "upstream_max_modified"
        ] = datetime(2026, 7, 8, tzinfo=timezone.utc)
    elif case == "selected-source-newer-than-upstream":
        payload["selected_place"]["source_modified_at"] = datetime(
            2026,
            7,
            10,
            tzinfo=timezone.utc,
        )
    elif case == "selected-last-checked-mismatch":
        payload["selected_place"]["last_checked"] = date(2026, 7, 15)
    elif case == "selected-immutable-field-mismatch":
        payload["selected_place"]["name"] = "Forged but well-formed name"
    else:
        payload["selected_place"]["place_id"] = "bcn-999999"
        payload["selected_place"]["source_record_id"] = "999999"

    _assert_sanitized_action_plan_unavailable(
        _bypass_normal_response(payload)
    )


def test_asgi_accepts_real_committed_candidate_and_multiple_candidate_controls() -> None:
    selected = _normal_response()
    status, payload, _ = _run(FakeWorkflow(response=selected), VALID_REQUEST)
    assert status == 200
    assert payload["candidate_context"]["eligible_candidate_count"] == 3
    assert payload["selected_place"]["place_id"] == selected.selected_place.place_id
    assert selected.candidate_context.snapshot == get_place_repository().provenance

    no_selection_payload = selected.model_dump(mode="python")
    no_selection_payload["selected_place"] = None
    no_selection_payload["plan"]["bring_items"] = []
    no_selection_payload["plan"]["local_phrase"] = None
    _set_phase_codes(
        no_selection_payload,
        "now",
        ["move_to_cooler_space", "reduce_physical_effort", "drink_water"],
    )
    _set_explanation_codes(
        no_selection_payload,
        no_selection_payload["priority"]["reason_codes"],
    )
    no_selection = NormalActionPlanResponse.model_validate(no_selection_payload)

    status, payload, _ = _run(FakeWorkflow(response=no_selection), VALID_REQUEST)
    assert status == 200
    assert payload["candidate_context"]["eligible_candidate_count"] == 3
    assert payload["selected_place"] is None


@pytest.mark.parametrize(
    "case",
    ["air-conditioning", "fan-39.9", "young-child", "unsheltered", "catalan"],
)
def test_asgi_accepts_contextually_applicable_supplemental_controls(
    case: str,
) -> None:
    response = _normal_response()
    payload = response.model_dump(mode="python")
    if case == "air-conditioning":
        situation = _situation_with(
            response.situation,
            cooling_access={"status": "reported", "value": "air_conditioning"},
        )
        _set_normal_situation(payload, situation)
        _add_phase_code(payload, "now", "use_available_home_cooling")
    elif case == "fan-39.9":
        situation = _situation_with(
            response.situation,
            cooling_access={"status": "reported", "value": "fan_only"},
        )
        payload["weather"]["current"]["temperature_c"] = 39.9
        payload["weather"]["today"]["temperature_max_c"] = 39.9
        _set_normal_situation(payload, situation)
        _add_phase_code(payload, "now", "use_available_home_cooling")
        _add_phase_code(payload, "next_few_hours", "stay_in_cool_space")
    elif case == "young-child":
        situation = _situation_with(
            response.situation,
            vulnerability_factors={
                "status": "reported",
                "values": ["young_child_in_household", "living_alone"],
            },
        )
        _set_normal_situation(payload, situation)
        _add_phase_code(payload, "next_few_hours", "check_on_household_members")
    elif case == "unsheltered":
        situation = _situation_with(
            response.situation,
            housing_situation={"status": "reported", "value": "unsheltered"},
        )
        _set_normal_situation(payload, situation)
        _set_phase_codes(
            payload,
            "tonight",
            ["keep_water_nearby", "check_updated_weather_tonight"],
        )
    else:
        situation = _situation_with(
            response.situation,
            detected_input_language="ca",
        )
        _set_normal_situation(payload, situation)
        _set_local_phrase(payload, "catalan_request_cool_space")

    contextual = NormalActionPlanResponse.model_validate(payload)
    status, _, _ = _run(FakeWorkflow(response=contextual), VALID_REQUEST)
    assert status == 200


def test_urgent_public_model_rejects_non_112_contact_and_empty_symptoms() -> None:
    response = build_urgent_response(
        _situation(symptom="confusion"),
        datetime(2026, 7, 17, 8, 0, tzinfo=timezone.utc),
        determine_action_priority(_situation(symptom="confusion"), None),
        DEFAULT_OUTPUT_LOCALE,
    )
    payload = response.model_dump(mode="python")
    payload["urgent_contact"]["number"] = "061"
    with pytest.raises(ValidationError):
        type(response).model_validate(payload)

    payload = response.model_dump(mode="python")
    payload["situation"]["reported_symptoms"] = {
        "status": "reported",
        "values": [],
    }
    with pytest.raises(ValidationError):
        type(response).model_validate(payload)


@pytest.mark.parametrize(
    "mutation",
    [
        pytest.param("situation-notice", id="situation-notice"),
        pytest.param("instruction", id="contact-instruction"),
        pytest.param("contact-action", id="contact-action"),
        pytest.param("medical-action", id="medical-action"),
        pytest.param("medical-notice", id="medical-notice"),
        pytest.param("bypass-notice", id="bypass-notice"),
    ],
)
def test_urgent_public_model_rejects_catalog_owned_prose_tampering(
    mutation: str,
) -> None:
    situation = _situation(symptom="confusion")
    response = build_urgent_response(
        situation,
        datetime(2026, 7, 17, 8, 0, tzinfo=timezone.utc),
        determine_action_priority(situation, None),
        DEFAULT_OUTPUT_LOCALE,
    )
    payload = response.model_dump(mode="python")
    if mutation == "situation-notice":
        payload["situation"]["notice"] = "Forged situation notice"
    elif mutation == "instruction":
        payload["urgent_contact"]["instruction"] = "Forged instruction"
    elif mutation == "contact-action":
        payload["actions"][0]["text"] = "Forged contact action"
    elif mutation == "medical-action":
        payload["actions"][1]["text"] = "Forged medical action"
    elif mutation == "medical-notice":
        payload["notices"][0] = "Forged medical notice"
    else:
        payload["notices"][1] = "Forged urgent bypass notice"

    with pytest.raises(ValidationError):
        type(response).model_validate(payload)


@pytest.mark.parametrize(
    "mutation",
    ["situation", "priority", "instruction", "action", "notice"],
)
@pytest.mark.parametrize(
    ("response_locale", "foreign_locale"),
    [
        pytest.param("es", "en", id="spanish-english"),
        pytest.param("zh-CN", "en", id="simplified-english"),
        pytest.param("zh-TW", "en", id="traditional-english"),
        pytest.param("zh-CN", "zh-TW", id="simplified-traditional"),
        pytest.param("zh-TW", "zh-CN", id="traditional-simplified"),
        pytest.param("hi", "en", id="hindi-english"),
        pytest.param("bn", "en", id="bengali-english"),
        pytest.param("hi", "bn", id="hindi-bengali"),
        pytest.param("bn", "hi", id="bengali-hindi"),
        pytest.param("hi", "zh-CN", id="hindi-simplified"),
        pytest.param("bn", "es", id="bengali-spanish"),
        pytest.param("ar", "en", id="arabic-english"),
        pytest.param("en", "ar", id="english-arabic"),
        pytest.param("pt-BR", "en", id="brazilian-portuguese-english"),
        pytest.param("en", "pt-BR", id="english-brazilian-portuguese"),
        pytest.param("fr", "it", id="french-italian"),
        pytest.param("it", "fr", id="italian-french"),
        pytest.param("fr", "en", id="french-english"),
        pytest.param("it", "es", id="italian-spanish"),
        pytest.param("de", "nl", id="german-dutch"),
        pytest.param("nl", "de", id="dutch-german"),
        pytest.param("de", "en", id="german-english"),
        pytest.param("nl", "fr", id="dutch-french"),
        pytest.param("ru", "uk", id="russian-ukrainian"),
        pytest.param("uk", "ru", id="ukrainian-russian"),
        pytest.param("pl", "ru", id="polish-russian"),
        pytest.param("ru", "pl", id="russian-polish"),
        pytest.param("ja", "ko", id="japanese-korean"),
        pytest.param("ko", "ja", id="korean-japanese"),
        pytest.param("ja", "en", id="japanese-english"),
        pytest.param("ko", "zh-CN", id="korean-simplified"),
        pytest.param("id", "vi", id="indonesian-vietnamese"),
        pytest.param("vi", "th", id="vietnamese-thai"),
        pytest.param("th", "id", id="thai-indonesian"),
        pytest.param("id", "en", id="indonesian-english"),
        pytest.param("tr", "sw", id="turkish-swahili"),
        pytest.param("sw", "tr", id="swahili-turkish"),
        pytest.param("tr", "en", id="turkish-english"),
        pytest.param("sw", "vi", id="swahili-vietnamese"),
        pytest.param("ur", "fa", id="urdu-persian"),
        pytest.param("fa", "ur", id="persian-urdu"),
        pytest.param("ur", "en", id="urdu-english"),
        pytest.param("fa", "ar", id="persian-arabic"),
        pytest.param("he", "en", id="hebrew-english"),
        pytest.param("he", "fa", id="hebrew-persian"),
    ],
)
def test_urgent_model_rejects_mixed_catalog_prose(
    mutation: str,
    response_locale: OutputLocale,
    foreign_locale: OutputLocale,
) -> None:
    response = _urgent_response(response_locale)
    payload = response.model_dump(mode="python")
    foreign = get_action_plan_catalog(foreign_locale)
    if mutation == "situation":
        payload["situation"]["notice"] = foreign.situation_notice
    elif mutation == "priority":
        payload["priority"]["notice"] = foreign.policy_notice
        for source, rule in zip(
            payload["priority"]["sources"],
            foreign.policy_rules,
        ):
            source["heatrelay_rule"] = rule
    elif mutation == "instruction":
        payload["urgent_contact"]["instruction"] = (
            foreign.urgent_contact_instruction
        )
    elif mutation == "action":
        payload["actions"][0]["text"] = foreign.urgent_actions[
            "contact_emergency_service_now"
        ]
    else:
        payload["notices"] = list(foreign.urgent_notices)

    with pytest.raises(ValidationError):
        type(response).model_validate(payload)


def _response_for_branch(branch: str) -> ActionPlanResponse:
    if branch == "normal":
        return _normal_response()
    situation = _situation(symptom="confusion")
    return build_urgent_response(
        situation,
        datetime(2026, 7, 17, 8, 0, tzinfo=timezone.utc),
        determine_action_priority(situation, None),
        DEFAULT_OUTPUT_LOCALE,
    )


def _mutate_response_metadata(
    response: ActionPlanResponse,
    mutation: str,
) -> ActionPlanResponse:
    if mutation == "missing-output-locale":
        payload = {
            field_name: getattr(response, field_name)
            for field_name in type(response).model_fields
            if field_name != "output_locale"
        }
        return type(response).model_construct(**payload)
    if mutation == "missing-schema":
        payload = {
            field_name: getattr(response, field_name)
            for field_name in type(response).model_fields
            if field_name != "schema_version"
        }
        return type(response).model_construct(**payload)
    if mutation == "previous-schema":
        return response.model_copy(update={"schema_version": "1.15.0"})
    if mutation == "old-schema":
        return response.model_copy(update={"schema_version": "1.4.0"})
    if mutation == "older-schema":
        return response.model_copy(update={"schema_version": "1.2.0"})
    if mutation == "forged-schema":
        return response.model_copy(update={"schema_version": "1.17.0"})
    if mutation == "unsupported-output-locale":
        return response.model_copy(update={"output_locale": "ca"})
    if mutation == "malformed-output-locale":
        return response.model_copy(update={"output_locale": None})

    situation = response.situation
    if mutation == "missing-situation-schema":
        situation_payload = {
            field_name: getattr(situation, field_name)
            for field_name in type(situation).model_fields
            if field_name != "schema_version"
        }
        forged_situation = type(situation).model_construct(**situation_payload)
    elif mutation == "old-situation-schema":
        forged_situation = situation.model_copy(
            update={"schema_version": "1.0.0"}
        )
    elif mutation == "missing-detected-language":
        situation_payload = {
            field_name: getattr(situation, field_name)
            for field_name in type(situation).model_fields
            if field_name != "detected_input_language"
        }
        forged_situation = type(situation).model_construct(**situation_payload)
    elif mutation == "unsupported-detected-language":
        forged_situation = situation.model_copy(
            update={"detected_input_language": "eo"}
        )
    elif mutation == "case-altered-detected-language":
        forged_situation = situation.model_copy(
            update={"detected_input_language": "EN"}
        )
    elif mutation == "missing-input-language-source":
        situation_payload = {
            field_name: getattr(situation, field_name)
            for field_name in type(situation).model_fields
            if field_name != "input_language_source"
        }
        forged_situation = type(situation).model_construct(**situation_payload)
    elif mutation == "unsupported-input-language-source":
        forged_situation = situation.model_copy(
            update={"input_language_source": "user_selected"}
        )
    elif mutation == "supported-language-with-fallback":
        forged_situation = situation.model_copy(
            update={"input_language_source": "fallback"}
        )
    elif mutation == "unknown-with-automatic-source":
        valid_unknown = _situation_with(
            situation,
            detected_input_language="unknown",
        )
        forged_situation = valid_unknown.model_copy(
            update={"input_language_source": "automatically_detected"}
        )
    else:
        raise AssertionError(f"unknown response metadata mutation: {mutation}")
    return response.model_copy(update={"situation": forged_situation})


@pytest.mark.parametrize("branch", ["normal", "urgent"])
@pytest.mark.parametrize(
    "mutation",
    [
        "missing-output-locale",
        "unsupported-output-locale",
        "malformed-output-locale",
        "missing-schema",
        "previous-schema",
        "old-schema",
        "older-schema",
        "forged-schema",
        "missing-situation-schema",
        "old-situation-schema",
        "missing-detected-language",
        "unsupported-detected-language",
        "case-altered-detected-language",
        "missing-input-language-source",
        "unsupported-input-language-source",
        "supported-language-with-fallback",
        "unknown-with-automatic-source",
    ],
)
@pytest.mark.filterwarnings("ignore:Pydantic serializer warnings")
def test_public_response_models_require_current_language_and_locale_metadata(
    branch: str,
    mutation: str,
) -> None:
    forged = _mutate_response_metadata(_response_for_branch(branch), mutation)

    with pytest.raises(ValidationError):
        type(forged).model_validate(forged.model_dump(mode="python"))


@pytest.mark.parametrize("branch", ["normal", "urgent"])
@pytest.mark.parametrize(
    "mutation",
    [
        "missing-output-locale",
        "unsupported-output-locale",
        "malformed-output-locale",
        "missing-schema",
        "previous-schema",
        "old-schema",
        "older-schema",
        "forged-schema",
        "missing-situation-schema",
        "old-situation-schema",
        "missing-detected-language",
        "unsupported-detected-language",
        "case-altered-detected-language",
        "missing-input-language-source",
        "unsupported-input-language-source",
        "supported-language-with-fallback",
        "unknown-with-automatic-source",
    ],
)
@pytest.mark.filterwarnings("ignore:Pydantic serializer warnings")
def test_asgi_rejects_forged_response_language_and_locale_without_private_detail(
    branch: str,
    mutation: str,
) -> None:
    trusted_repository = QueryRecordingRepository()
    forged = _mutate_response_metadata(_response_for_branch(branch), mutation)

    status, payload, response_text = _run(
        FakeWorkflow(response=forged),
        EXPLICIT_EN_REQUEST,
        trusted_repository=trusted_repository,
    )

    assert status == 503
    assert payload == {
        "detail": {
            "code": "action_plan_unavailable",
            "message": "Action-plan workflow is temporarily unavailable.",
        }
    }
    assert trusted_repository.calls == 0
    for private in (
        VALID_REQUEST["situation_text"],
        "output_locale",
        "schema_version",
        "detected_input_language",
        "input_language_source",
        '"fr"',
    ):
        assert private not in response_text


def test_asgi_revalidates_bypass_constructed_workflow_response() -> None:
    valid = _normal_response()
    forged_action = valid.plan.now.actions[0].model_copy(
        update={"text": "Forged internal catalog prose"}
    )
    bypassed_now = valid.plan.now.model_copy(
        update={"actions": [forged_action, *valid.plan.now.actions[1:]]}
    )
    bypassed_plan = valid.plan.model_copy(update={"now": bypassed_now})
    bypassed = valid.model_copy(update={"plan": bypassed_plan})
    workflow = FakeWorkflow(response=bypassed)

    status, payload, response_text = _run(workflow, VALID_REQUEST)

    assert status == 503
    assert payload == {
        "detail": {
            "code": "action_plan_unavailable",
            "message": "Action-plan workflow is temporarily unavailable.",
        }
    }
    assert "Synthetic Barcelona planning case" not in response_text


@pytest.mark.parametrize(
    ("branch", "notice_field"),
    [
        pytest.param("normal", "situation", id="normal-situation"),
        pytest.param("normal", "weather", id="normal-weather"),
        pytest.param("urgent", "situation", id="urgent-situation"),
    ],
)
def test_asgi_revalidates_bypass_constructed_projection_notice(
    branch: str,
    notice_field: str,
) -> None:
    valid = _response_for_branch(branch)
    if notice_field == "situation":
        forged_situation = valid.situation.model_copy(
            update={"notice": "Forged projected situation notice"}
        )
        bypassed = valid.model_copy(update={"situation": forged_situation})
    else:
        assert isinstance(valid, NormalActionPlanResponse)
        forged_weather = valid.weather.model_copy(
            update={"notice": "Forged projected weather notice"}
        )
        bypassed = valid.model_copy(update={"weather": forged_weather})

    status, payload, response_text = _run(
        FakeWorkflow(response=bypassed),
        VALID_REQUEST,
    )

    assert status == 503
    assert payload == {
        "detail": {
            "code": "action_plan_unavailable",
            "message": "Action-plan workflow is temporarily unavailable.",
        }
    }
    assert "Forged projected" not in response_text
    assert VALID_REQUEST["situation_text"] not in response_text


@pytest.mark.parametrize("branch", ["normal", "urgent"])
def test_asgi_rejects_invalid_nested_missing_information(
    branch: str,
) -> None:
    if branch == "normal":
        valid: ActionPlanResponse = _normal_response()
    else:
        situation = _situation(symptom="confusion")
        valid = build_urgent_response(
            situation,
            datetime(2026, 7, 17, 8, 0, tzinfo=timezone.utc),
            determine_action_priority(situation, None),
            DEFAULT_OUTPUT_LOCALE,
        )
    invalid_situation = valid.situation.model_copy(
        update={"missing_information": []}
    )
    bypassed = valid.model_copy(update={"situation": invalid_situation})

    status, payload, response_text = _run(
        FakeWorkflow(response=bypassed),
        VALID_REQUEST,
    )

    assert status == 503
    assert payload == {
        "detail": {
            "code": "action_plan_unavailable",
            "message": "Action-plan workflow is temporarily unavailable.",
        }
    }
    assert VALID_REQUEST["situation_text"] not in response_text


@pytest.mark.parametrize(
    "payload",
    [
        pytest.param({**VALID_REQUEST, "situation_text": 3}, id="wrong-text-type"),
        pytest.param({**VALID_REQUEST, "situation_text": " \n\t "}, id="blank"),
        pytest.param({**VALID_REQUEST, "situation_text": "x" * 2001}, id="long"),
        pytest.param(
            {**VALID_REQUEST, "situation_text": "Synthetic\u0000private"},
            id="control",
        ),
        pytest.param({**VALID_REQUEST, "profile": {}}, id="profile"),
        pytest.param({**VALID_REQUEST, "weather": {}}, id="weather"),
        pytest.param({**VALID_REQUEST, "priority": "act_now"}, id="priority"),
        pytest.param({**VALID_REQUEST, "candidates": []}, id="candidates"),
        pytest.param({**VALID_REQUEST, "place_id": "bcn-1"}, id="place-id"),
        pytest.param(
            {**VALID_REQUEST, "evaluation_time": "2026-07-17T08:00:00Z"},
            id="client-clock",
        ),
        pytest.param({**VALID_REQUEST, "source": {}}, id="source"),
        pytest.param(
            {
                **VALID_REQUEST,
                "origin": {"latitude": 40.7128, "longitude": -74.0060},
            },
            id="outside-barcelona",
        ),
        pytest.param({**VALID_REQUEST, "maximum_distance_m": 99}, id="distance-low"),
        pytest.param(
            {**VALID_REQUEST, "maximum_distance_m": 10001},
            id="distance-high",
        ),
        pytest.param(
            {**VALID_REQUEST, "maximum_distance_m": 3000.0},
            id="distance-coercion",
        ),
        *[
            pytest.param(
                {**VALID_REQUEST, "output_locale": value},
                id=f"output-locale-{case_id}",
            )
            for value, case_id in (
                ("EN", "uppercase"),
                ("en-US", "regional-us"),
                ("en-GB", "regional-gb"),
                ("ES", "uppercase-spanish"),
                ("es-ES", "regional-spanish"),
                ("zh", "bare-chinese"),
                ("zh-cn", "lowercase-simplified"),
                ("ZH-CN", "uppercase-simplified"),
                ("zh-tw", "lowercase-traditional"),
                ("ZH-TW", "uppercase-traditional"),
                ("zh-Hans", "simplified-script"),
                ("zh-Hans-CN", "simplified-script-mainland"),
                ("zh-Hans-SG", "simplified-script-singapore"),
                ("zh-Hant", "traditional-script"),
                ("zh-Hant-TW", "traditional-script-taiwan"),
                ("zh-Hant-HK", "traditional-script-hong-kong"),
                ("zh-SG", "singapore-chinese"),
                ("zh-HK", "hong-kong-chinese"),
                ("zh-MO", "macao-chinese"),
                ("HI", "uppercase-hindi"),
                ("hi-IN", "regional-hindi"),
                ("hi-in", "lowercase-regional-hindi"),
                ("BN", "uppercase-bengali"),
                ("bn-BD", "regional-bengali-bangladesh"),
                ("bn-IN", "regional-bengali-india"),
                ("bn-bd", "lowercase-regional-bengali"),
                ("AR", "uppercase-arabic"),
                ("Ar", "mixed-case-arabic"),
                ("ar-SA", "regional-arabic-saudi"),
                ("ar-EG", "regional-arabic-egypt"),
                ("ar-001", "regional-arabic-world"),
                ("ara", "three-letter-arabic"),
                ("pt", "bare-portuguese"),
                ("pt-br", "lowercase-brazilian-portuguese"),
                ("PT-BR", "uppercase-brazilian-portuguese"),
                ("Pt-BR", "mixed-case-brazilian-portuguese"),
                ("pt-PT", "portugal-portuguese"),
                ("pt-AO", "angola-portuguese"),
                ("pt-MZ", "mozambique-portuguese"),
                ("pt-Latn-BR", "script-brazilian-portuguese"),
                ("pt-BR-x-private", "private-brazilian-portuguese"),
                (" pt-BR", "leading-space-brazilian-portuguese"),
                ("pt-BR ", "trailing-space-brazilian-portuguese"),
                ("FR", "uppercase-french"),
                ("Fr", "mixed-case-french"),
                ("fr-FR", "regional-french-france"),
                ("fr-CA", "regional-french-canada"),
                ("fr-BE", "regional-french-belgium"),
                ("fr-CH", "regional-french-switzerland"),
                ("fra", "three-letter-french"),
                ("IT", "uppercase-italian"),
                ("It", "mixed-case-italian"),
                ("it-IT", "regional-italian-italy"),
                ("it-CH", "regional-italian-switzerland"),
                ("ita", "three-letter-italian"),
                (" fr", "leading-space-french"),
                ("fr ", "trailing-space-french"),
                (" it", "leading-space-italian"),
                ("it ", "trailing-space-italian"),
                ("DE", "uppercase-german"),
                ("De", "mixed-case-german"),
                ("de-DE", "regional-german-germany"),
                ("de-AT", "regional-german-austria"),
                ("de-CH", "regional-german-switzerland"),
                ("deu", "three-letter-german-modern"),
                ("ger", "three-letter-german-legacy"),
                (" de", "leading-space-german"),
                ("de ", "trailing-space-german"),
                ("NL", "uppercase-dutch"),
                ("Nl", "mixed-case-dutch"),
                ("nl-NL", "regional-dutch-netherlands"),
                ("nl-BE", "regional-dutch-belgium"),
                ("nld", "three-letter-dutch-modern"),
                ("dut", "three-letter-dutch-legacy"),
                (" nl", "leading-space-dutch"),
                ("nl ", "trailing-space-dutch"),
                ("UK", "uppercase-ukrainian"),
                ("Uk", "mixed-case-ukrainian"),
                ("uk-UA", "regional-ukrainian-ukraine"),
                ("uk-UK", "regional-ukrainian-unsupported"),
                ("ukr", "three-letter-ukrainian"),
                (" uk", "leading-space-ukrainian"),
                ("uk ", "trailing-space-ukrainian"),
                ("PL", "uppercase-polish"),
                ("Pl", "mixed-case-polish"),
                ("pl-PL", "regional-polish-poland"),
                ("pol", "three-letter-polish"),
                (" pl", "leading-space-polish"),
                ("pl ", "trailing-space-polish"),
                ("JA", "uppercase-japanese"),
                ("Ja", "mixed-case-japanese"),
                ("ja-JP", "regional-japanese-japan"),
                ("jpn", "three-letter-japanese"),
                (" ja", "leading-space-japanese"),
                ("ja ", "trailing-space-japanese"),
                ("KO", "uppercase-korean"),
                ("Ko", "mixed-case-korean"),
                ("ko-KR", "regional-korean-korea"),
                ("kor", "three-letter-korean"),
                (" ko", "leading-space-korean"),
                ("ko ", "trailing-space-korean"),
                ("ID", "uppercase-indonesian"),
                ("Id", "mixed-case-indonesian"),
                ("id-ID", "regional-indonesian-indonesia"),
                ("ind", "three-letter-indonesian"),
                (" id", "leading-space-indonesian"),
                ("id ", "trailing-space-indonesian"),
                ("VI", "uppercase-vietnamese"),
                ("Vi", "mixed-case-vietnamese"),
                ("vi-VN", "regional-vietnamese-vietnam"),
                ("vie", "three-letter-vietnamese"),
                (" vi", "leading-space-vietnamese"),
                ("vi ", "trailing-space-vietnamese"),
                ("TH", "uppercase-thai"),
                ("Th", "mixed-case-thai"),
                ("th-TH", "regional-thai-thailand"),
                ("tha", "three-letter-thai"),
                (" th", "leading-space-thai"),
                ("th ", "trailing-space-thai"),
                ("TR", "uppercase-turkish"),
                ("Tr", "mixed-case-turkish"),
                ("tr-TR", "regional-turkish-turkey"),
                ("tur", "three-letter-turkish"),
                (" tr", "leading-space-turkish"),
                ("tr ", "trailing-space-turkish"),
                ("SW", "uppercase-swahili"),
                ("Sw", "mixed-case-swahili"),
                ("sw-KE", "regional-swahili-kenya"),
                ("sw-TZ", "regional-swahili-tanzania"),
                ("swa", "three-letter-swahili"),
                (" sw", "leading-space-swahili"),
                ("sw ", "trailing-space-swahili"),
                ("UR", "uppercase-urdu"),
                ("Ur", "mixed-case-urdu"),
                ("ur-PK", "regional-urdu-pakistan"),
                ("ur-IN", "regional-urdu-india"),
                ("urd", "three-letter-urdu"),
                (" ur", "leading-space-urdu"),
                ("ur ", "trailing-space-urdu"),
                ("FA", "uppercase-persian"),
                ("Fa", "mixed-case-persian"),
                ("fa-IR", "regional-persian-iran"),
                ("fa-AF", "regional-persian-afghanistan"),
                ("fas", "modern-three-letter-persian"),
                ("per", "legacy-three-letter-persian"),
                (" fa", "leading-space-persian"),
                ("fa ", "trailing-space-persian"),
                ("ca", "catalan"),
                ("RU", "uppercase-russian"),
                ("Ru", "mixed-case-russian"),
                ("ru-RU", "regional-russian-russia"),
                ("ru-BY", "regional-russian-belarus"),
                ("rus", "three-letter-russian"),
                (" ru", "leading-space-russian"),
                ("ru ", "trailing-space-russian"),
                ("HE", "uppercase-hebrew"),
                ("He", "mixed-case-hebrew"),
                ("he-IL", "regional-hebrew-israel"),
                ("heb", "three-letter-hebrew"),
                (" he", "leading-space-hebrew"),
                ("he ", "trailing-space-hebrew"),
                (" en", "leading-space"),
                ("en ", "trailing-space"),
                (" es", "leading-space-spanish"),
                ("es ", "trailing-space-spanish"),
                (" zh-CN", "leading-space-simplified"),
                ("zh-CN ", "trailing-space-simplified"),
                (" zh-TW", "leading-space-traditional"),
                ("zh-TW ", "trailing-space-traditional"),
                (" hi", "leading-space-hindi"),
                ("hi ", "trailing-space-hindi"),
                (" bn", "leading-space-bengali"),
                ("bn ", "trailing-space-bengali"),
                (" ar", "leading-space-arabic"),
                ("ar ", "trailing-space-arabic"),
                ("", "empty"),
                (None, "null"),
                (True, "true"),
                (False, "false"),
                (1, "number"),
                ([], "array"),
                ({}, "object"),
            )
        ],
    ],
)
def test_invalid_action_plan_requests_are_sanitized_and_skip_workflow(
    payload: object,
) -> None:
    workflow = FakeWorkflow(response=_normal_response())
    status, response_payload, response_text = _run(workflow, payload)

    assert status == 422
    assert response_payload == {
        "detail": {
            "code": INVALID_ACTION_PLAN_REQUEST_CODE,
            "message": INVALID_ACTION_PLAN_REQUEST_MESSAGE,
        }
    }
    assert workflow.calls == []
    for private in ("Synthetic", "41.3874", "2.1686", "40.7128", "-74.006"):
        assert private not in response_text


def test_malformed_action_plan_json_is_sanitized_and_skips_workflow() -> None:
    workflow = FakeWorkflow(response=_normal_response())
    previous = app.dependency_overrides.copy()
    app.dependency_overrides[get_action_plan_workflow] = lambda: workflow
    try:
        status, payload, response_text = asyncio.run(
            _post_raw(
                b'{"situation_text":"synthetic private",'
                b'"origin":{"latitude":41.3'
            )
        )
    finally:
        app.dependency_overrides.clear()
        app.dependency_overrides.update(previous)

    assert status == 422
    assert payload["detail"]["code"] == INVALID_ACTION_PLAN_REQUEST_CODE
    assert workflow.calls == []
    assert "synthetic private" not in response_text
    assert "41.3" not in response_text


@pytest.mark.parametrize(
    ("failure", "status", "code"),
    [
        pytest.param(
            SituationExtractionInvalidResponse(),
            502,
            "situation_extraction_invalid_response",
            id="extraction",
        ),
        pytest.param(
            SituationExtractionBudgetExhausted(),
            503,
            "provider_budget_exhausted",
            id="extraction-budget",
        ),
        pytest.param(WeatherUnavailable(), 503, "weather_unavailable", id="weather"),
        pytest.param(PlaceDataError("private place detail"), 503, "places_unavailable", id="places"),
        pytest.param(
            ActionPlanWorkflowUnavailable(),
            503,
            "action_plan_unavailable",
            id="workflow-configuration",
        ),
        pytest.param(GroundedPlanRefused(), 502, "action_plan_generation_refused", id="refusal"),
        pytest.param(
            GroundedPlanInvalidResponse(),
            502,
            "action_plan_generation_invalid_response",
            id="invalid-plan",
        ),
        pytest.param(
            GroundedPlanNotConfigured(),
            503,
            "action_plan_generation_not_configured",
            id="not-configured",
        ),
        pytest.param(
            GroundedPlanUnavailable(),
            503,
            "action_plan_generation_unavailable",
            id="provider-unavailable",
        ),
        pytest.param(
            GroundedPlanTimeout(),
            504,
            "action_plan_generation_timeout",
            id="timeout",
        ),
        pytest.param(
            GroundedPlanBudgetExhausted(),
            503,
            "provider_budget_exhausted",
            id="provider-budget",
        ),
    ],
)
def test_action_plan_failures_are_stable_and_private(
    failure: SituationExtractionFailure | GroundedPlanFailure | Exception,
    status: int,
    code: str,
) -> None:
    private_values = (
        "Synthetic Barcelona planning case.",
        "41.3874",
        "2.1686",
        "private place detail",
        "synthetic-provider-response-id",
        "synthetic-key-material",
    )
    failure.__cause__ = RuntimeError(";".join(private_values[3:]))
    workflow = FakeWorkflow(failure=failure)

    actual_status, payload, response_text = _run(workflow, VALID_REQUEST)

    assert actual_status == status
    assert payload["detail"]["code"] == code
    assert set(payload["detail"]) == {"code", "message"}
    for private in private_values:
        assert private not in response_text


def test_openapi_and_existing_routes_remain_available_without_client_creation(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    app.openapi_schema = None
    schema = app.openapi()

    assert set(
        {
            "/api/health",
            "/api/v1/weather/context",
            "/api/v1/places/candidates",
            "/api/v1/situation/extract",
            "/api/v1/action-plan",
        }
    ).issubset(schema["paths"])
    action_operation = schema["paths"][ACTION_PLAN_ENDPOINT_PATH]["post"]
    assert "requestBody" in action_operation
    assert "responses" in action_operation


def test_public_contract_contains_no_raw_request_or_origin_fields() -> None:
    response = _normal_response()
    serialized = json.dumps(response.model_dump(mode="json"), sort_keys=True)

    assert "situation_text" not in serialized
    assert "origin" not in serialized
    assert "Synthetic Barcelona planning case" not in serialized
