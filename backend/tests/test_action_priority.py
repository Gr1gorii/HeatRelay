"""Pure deterministic action-priority policy tests.

Every profile in this module is synthetic. These tests verify HeatRelay's
closed backend policy contract; they are not evidence of medical risk or model
accuracy.
"""

from datetime import datetime, timezone
from typing import Any, get_args

import pytest

from backend.app.action_plan import (
    ACTION_POLICY_VERSION,
    BARCELONA_PILOT_ORIGIN_MAX_LATITUDE,
    BARCELONA_PILOT_ORIGIN_MAX_LONGITUDE,
    BARCELONA_PILOT_ORIGIN_MIN_LATITUDE,
    BARCELONA_PILOT_ORIGIN_MIN_LONGITUDE,
    MODEL_DERIVED_POLICY_NOTICE,
    POLICY_SOURCES,
    UNIVERSAL_URGENT_112_SYMPTOMS,
    ActionPlanRequest,
    PriorityDecision,
    build_urgent_response,
    determine_action_priority,
)
from backend.app.action_plan_catalog import get_action_plan_catalog
from backend.app.localization import (
    DEFAULT_OUTPUT_LOCALE,
    OutputLocale,
    SUPPORTED_OUTPUT_LOCALES,
)
from backend.app.situation import (
    MOBILITY_ORDER,
    VULNERABILITY_ORDER,
    ModelSituationExtraction,
    ReportedSymptom,
    SYMPTOM_ORDER,
    SituationExtractionResponse,
    build_public_response,
)


def _situation(**changes: Any) -> SituationExtractionResponse:
    payload: dict[str, Any] = {
        "detected_input_language": "en",
        "preferred_language": {"status": "not_stated", "value": None},
        "vulnerability_factors": {"status": "not_stated", "values": []},
        "mobility_constraints": {"status": "not_stated", "values": []},
        "cooling_access": {"status": "not_stated", "value": None},
        "housing_situation": {"status": "not_stated", "value": None},
        "time_constraints": {"status": "not_stated", "values": []},
        "reported_symptoms": {"status": "not_stated", "values": []},
    }
    payload.update(changes)
    return build_public_response(ModelSituationExtraction.model_validate(payload))


@pytest.mark.parametrize(
    ("temperature_max_c", "expected_priority", "expected_reason"),
    [
        pytest.param(
            33.999,
            "monitor_and_prepare",
            "baseline_monitoring",
            id="below-34",
        ),
        pytest.param(
            34.0,
            "prepare_now",
            "forecast_at_or_above_34c",
            id="equal-34",
        ),
        pytest.param(
            34.001,
            "prepare_now",
            "forecast_at_or_above_34c",
            id="above-34",
        ),
        pytest.param(
            35.999,
            "prepare_now",
            "forecast_at_or_above_34c",
            id="below-36",
        ),
        pytest.param(
            36.0,
            "act_now",
            "forecast_at_or_above_36c",
            id="equal-36",
        ),
        pytest.param(
            36.001,
            "act_now",
            "forecast_at_or_above_36c",
            id="above-36",
        ),
    ],
)
def test_temperature_boundaries_have_exact_closed_precedence(
    temperature_max_c: float,
    expected_priority: str,
    expected_reason: str,
) -> None:
    decision = determine_action_priority(_situation(), temperature_max_c)

    assert decision.priority == expected_priority
    assert decision.reason_codes == [expected_reason]


@pytest.mark.parametrize("factor", VULNERABILITY_ORDER)
def test_each_explicit_vulnerability_factor_triggers_preparation(
    factor: str,
) -> None:
    situation = _situation(
        vulnerability_factors={"status": "reported", "values": [factor]}
    )

    decision = determine_action_priority(situation, 33.0)

    assert decision.priority == "prepare_now"
    assert decision.reason_codes == ["reported_vulnerability"]


@pytest.mark.parametrize("constraint", MOBILITY_ORDER)
def test_each_explicit_mobility_constraint_triggers_preparation(
    constraint: str,
) -> None:
    situation = _situation(
        mobility_constraints={"status": "reported", "values": [constraint]}
    )

    decision = determine_action_priority(situation, 33.0)

    assert decision.priority == "prepare_now"
    assert decision.reason_codes == ["reported_mobility_constraint"]


@pytest.mark.parametrize(
    ("field", "reported_value", "expected_reason"),
    [
        pytest.param(
            "cooling_access",
            {"status": "reported", "value": "no_home_cooling"},
            "no_home_cooling",
            id="no-home-cooling",
        ),
        pytest.param(
            "housing_situation",
            {"status": "reported", "value": "temporary_housing"},
            "temporary_or_unsheltered_housing",
            id="temporary-housing",
        ),
        pytest.param(
            "housing_situation",
            {"status": "reported", "value": "unsheltered"},
            "temporary_or_unsheltered_housing",
            id="unsheltered",
        ),
    ],
)
def test_other_explicit_policy_factors_trigger_preparation(
    field: str,
    reported_value: dict[str, object],
    expected_reason: str,
) -> None:
    decision = determine_action_priority(
        _situation(**{field: reported_value}),
        33.0,
    )

    assert decision.priority == "prepare_now"
    assert decision.reason_codes == [expected_reason]


@pytest.mark.parametrize(
    ("field", "control"),
    [
        pytest.param(
            "vulnerability_factors",
            {"status": "not_stated", "values": []},
            id="vulnerability-not-stated",
        ),
        pytest.param(
            "vulnerability_factors",
            {"status": "unknown", "values": []},
            id="vulnerability-unknown",
        ),
        pytest.param(
            "vulnerability_factors",
            {"status": "explicit_none", "values": []},
            id="vulnerability-explicit-none",
        ),
        pytest.param(
            "mobility_constraints",
            {"status": "not_stated", "values": []},
            id="mobility-not-stated",
        ),
        pytest.param(
            "mobility_constraints",
            {"status": "unknown", "values": []},
            id="mobility-unknown",
        ),
        pytest.param(
            "mobility_constraints",
            {"status": "explicit_none", "values": []},
            id="mobility-explicit-none",
        ),
        pytest.param(
            "cooling_access",
            {"status": "not_stated", "value": None},
            id="cooling-not-stated",
        ),
        pytest.param(
            "cooling_access",
            {"status": "unknown", "value": None},
            id="cooling-unknown",
        ),
        pytest.param(
            "cooling_access",
            {"status": "reported", "value": "air_conditioning"},
            id="air-conditioning-reported",
        ),
        pytest.param(
            "cooling_access",
            {"status": "reported", "value": "fan_only"},
            id="fan-only-reported",
        ),
        pytest.param(
            "housing_situation",
            {"status": "not_stated", "value": None},
            id="housing-not-stated",
        ),
        pytest.param(
            "housing_situation",
            {"status": "unknown", "value": None},
            id="housing-unknown",
        ),
        pytest.param(
            "housing_situation",
            {"status": "reported", "value": "stable_housing"},
            id="stable-housing-reported",
        ),
    ],
)
def test_non_triggering_factor_states_remain_baseline(
    field: str,
    control: dict[str, object],
) -> None:
    decision = determine_action_priority(
        _situation(**{field: control}),
        33.0,
    )

    assert decision.priority == "monitor_and_prepare"
    assert decision.reason_codes == ["baseline_monitoring"]


def test_all_reported_factors_are_canonical_and_never_lower_act_now() -> None:
    situation = _situation(
        vulnerability_factors={
            "status": "reported",
            "values": ["living_alone"],
        },
        mobility_constraints={
            "status": "reported",
            "values": ["walks_slowly"],
        },
        cooling_access={"status": "reported", "value": "no_home_cooling"},
        housing_situation={"status": "reported", "value": "unsheltered"},
    )

    decision = determine_action_priority(situation, 36.0)

    assert decision.priority == "act_now"
    assert decision.reason_codes == [
        "forecast_at_or_above_36c",
        "reported_vulnerability",
        "no_home_cooling",
        "temporary_or_unsheltered_housing",
        "reported_mobility_constraint",
    ]


@pytest.mark.parametrize("symptom", SYMPTOM_ORDER)
def test_every_reported_bounded_symptom_uses_fixed_urgent_mapping(
    symptom: ReportedSymptom,
) -> None:
    situation = _situation(
        reported_symptoms={"status": "reported", "values": [symptom]}
    )

    decision = determine_action_priority(situation, None)
    response = build_urgent_response(
        situation,
        datetime(2026, 7, 20, 8, 0, tzinfo=timezone.utc),
        decision,
        DEFAULT_OUTPUT_LOCALE,
    )

    assert decision.priority == "urgent_help"
    assert decision.reason_codes == ["reported_warning_symptom"]
    assert response.schema_version == "1.16.0"
    assert response.output_locale == "en"
    assert response.urgent_contact.code == "112"
    assert response.urgent_contact.service == "112 emergències"
    assert response.urgent_contact.number == "112"
    assert response.actions[0].code == "contact_emergency_service_now"
    assert response.actions[1].code == "do_not_use_shelter_as_medical_substitute"
    assert not hasattr(response, "weather")


def test_mixed_urgent_symptoms_use_universal_112_contact() -> None:
    situation = _situation(
        reported_symptoms={
            "status": "reported",
            "values": ["confusion", "chest_pain", "repeated_vomiting"],
        }
    )
    decision = determine_action_priority(situation, None)

    response = build_urgent_response(
        situation,
        datetime(2026, 7, 20, 8, 0, tzinfo=timezone.utc),
        decision,
        DEFAULT_OUTPUT_LOCALE,
    )

    assert response.urgent_contact.code == "112"
    assert response.urgent_contact.number == "112"
    assert response.schema_version == "1.16.0"
    assert response.output_locale == "en"
    assert response.actions[0].code == "contact_emergency_service_now"
    catalog = get_action_plan_catalog("en")
    assert response.urgent_contact.instruction == (
        catalog.urgent_contact_instruction
    )
    assert [(action.code, action.text) for action in response.actions] == list(
        catalog.urgent_actions.items()
    )
    assert response.notices == list(catalog.urgent_notices)


def test_universal_112_set_exactly_matches_closed_reported_symptom_catalog() -> None:
    assert UNIVERSAL_URGENT_112_SYMPTOMS == frozenset(
        {
            "confusion",
            "fainting_or_loss_of_consciousness",
            "seizure",
            "difficulty_breathing",
            "chest_pain",
            "repeated_vomiting",
        }
    )
    assert UNIVERSAL_URGENT_112_SYMPTOMS == frozenset(SYMPTOM_ORDER)
    assert UNIVERSAL_URGENT_112_SYMPTOMS == frozenset(
        get_args(ReportedSymptom)
    )


def test_action_plan_request_defaults_and_accepts_exact_supported_output_locale() -> None:
    base = {
        "situation_text": "Synthetic output-locale contract.",
        "origin": {"latitude": 41.3874, "longitude": 2.1686},
    }

    assert ActionPlanRequest.model_validate(base).output_locale == "en"
    assert ActionPlanRequest.model_validate(
        {**base, "output_locale": "en"}
    ).output_locale == "en"
    for output_locale in SUPPORTED_OUTPUT_LOCALES:
        assert ActionPlanRequest.model_validate(
            {**base, "output_locale": output_locale}
        ).output_locale == output_locale


@pytest.mark.parametrize(
    "invalid_locale",
    [
        "EN",
        "en-US",
        "en-GB",
        "ES",
        "es-ES",
        "zh",
        "zh-cn",
        "ZH-CN",
        "zh-tw",
        "ZH-TW",
        "zh-Hans",
        "zh-Hans-CN",
        "zh-Hans-SG",
        "zh-Hant",
        "zh-Hant-TW",
        "zh-Hant-HK",
        "zh-SG",
        "zh-HK",
        "zh-MO",
        "HI",
        "hi-IN",
        "hi-in",
        "BN",
        "bn-BD",
        "bn-IN",
        "bn-bd",
        "AR",
        "Ar",
        "ar-SA",
        "ar-EG",
        "ar-001",
        "ara",
        "ca",
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
        " en",
        "en ",
        " es",
        "es ",
        " zh-CN",
        "zh-CN ",
        " zh-TW",
        "zh-TW ",
        " hi",
        "hi ",
        " bn",
        "bn ",
        " ar",
        "ar ",
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
        "",
        None,
        True,
        False,
        1,
        [],
        {},
    ],
)
def test_action_plan_request_rejects_nonexact_output_locale(
    invalid_locale: object,
) -> None:
    with pytest.raises(ValueError):
        ActionPlanRequest.model_validate(
            {
                "situation_text": "Synthetic invalid locale.",
                "origin": {"latitude": 41.3874, "longitude": 2.1686},
                "output_locale": invalid_locale,
            }
        )


@pytest.mark.parametrize(
    ("latitude", "longitude"),
    [
        (41.3874, 2.1686),
        (BARCELONA_PILOT_ORIGIN_MIN_LATITUDE, 2.1686),
        (BARCELONA_PILOT_ORIGIN_MAX_LATITUDE, 2.1686),
        (41.3874, BARCELONA_PILOT_ORIGIN_MIN_LONGITUDE),
        (41.3874, BARCELONA_PILOT_ORIGIN_MAX_LONGITUDE),
        (
            BARCELONA_PILOT_ORIGIN_MIN_LATITUDE,
            BARCELONA_PILOT_ORIGIN_MIN_LONGITUDE,
        ),
        (
            BARCELONA_PILOT_ORIGIN_MAX_LATITUDE,
            BARCELONA_PILOT_ORIGIN_MAX_LONGITUDE,
        ),
    ],
)
def test_barcelona_pilot_origin_rectangle_is_inclusive(
    latitude: float,
    longitude: float,
) -> None:
    request = ActionPlanRequest.model_validate(
        {
            "situation_text": "Synthetic bounded origin.",
            "origin": {"latitude": latitude, "longitude": longitude},
        }
    )

    assert request.origin.latitude == latitude
    assert request.origin.longitude == longitude


@pytest.mark.parametrize(
    ("latitude", "longitude"),
    [
        (BARCELONA_PILOT_ORIGIN_MIN_LATITUDE - 0.000001, 2.1686),
        (BARCELONA_PILOT_ORIGIN_MAX_LATITUDE + 0.000001, 2.1686),
        (41.3874, BARCELONA_PILOT_ORIGIN_MIN_LONGITUDE - 0.000001),
        (41.3874, BARCELONA_PILOT_ORIGIN_MAX_LONGITUDE + 0.000001),
    ],
)
def test_barcelona_pilot_origin_rectangle_rejects_outside_values(
    latitude: float,
    longitude: float,
) -> None:
    with pytest.raises(ValueError):
        ActionPlanRequest.model_validate(
            {
                "situation_text": "Synthetic outside origin.",
                "origin": {"latitude": latitude, "longitude": longitude},
            }
        )


@pytest.mark.parametrize(
    ("latitude", "longitude"),
    [
        (float("nan"), 2.1686),
        (float("inf"), 2.1686),
        (float("-inf"), 2.1686),
        (41.3874, float("nan")),
        (41.3874, float("inf")),
        (41.3874, float("-inf")),
    ],
)
def test_barcelona_pilot_origin_rejects_nonfinite_coordinates(
    latitude: float,
    longitude: float,
) -> None:
    with pytest.raises(ValueError):
        ActionPlanRequest.model_validate(
            {
                "situation_text": "Synthetic nonfinite origin.",
                "origin": {"latitude": latitude, "longitude": longitude},
            }
        )


@pytest.mark.parametrize("status", ["not_stated", "unknown", "explicit_none"])
def test_nonreported_symptom_states_remain_distinct_and_require_weather(
    status: str,
) -> None:
    situation = _situation(
        reported_symptoms={"status": status, "values": []}
    )

    decision = determine_action_priority(situation, 33.0)

    assert situation.reported_symptoms.status == status
    assert decision.priority == "monitor_and_prepare"
    assert decision.reason_codes == ["baseline_monitoring"]
    with pytest.raises(
        ValueError,
        match="normal priority requires same-day maximum temperature",
    ):
        determine_action_priority(situation, None)


def test_priority_metadata_is_fixed_versioned_and_source_backed() -> None:
    default_decision = determine_action_priority(_situation(), 33.0)
    decision = determine_action_priority(
        _situation(),
        33.0,
        output_locale="en",
    )
    catalog = get_action_plan_catalog("en")

    assert decision == default_decision
    assert decision.policy_version == ACTION_POLICY_VERSION
    assert decision.policy_version == "heatrelay-barcelona-action-policy-1.0.0"
    assert (
        decision.notice
        == catalog.policy_notice
        == MODEL_DERIVED_POLICY_NOTICE
    )
    assert decision.sources == list(POLICY_SOURCES)
    assert [source.heatrelay_rule for source in decision.sources] == list(
        catalog.policy_rules
    )
    assert [source.accessed_on.isoformat() for source in decision.sources] == [
        "2026-07-17",
    ] * 5
    assert [source.publisher for source in decision.sources] == [
        "Ajuntament de Barcelona — Serveis Socials",
        "Ajuntament de Barcelona — Barcelona pel Clima",
        "Generalitat de Catalunya — Canal Salut",
        "Generalitat de Catalunya — 112 emergències",
        "World Health Organization",
    ]
    assert all(source.url.startswith("https://") for source in decision.sources)
    assert all(source.heatrelay_rule for source in decision.sources)


def test_priority_hydration_selects_each_exact_registered_catalog() -> None:
    decisions = {
        output_locale: determine_action_priority(
            _situation(),
            33.0,
            output_locale=output_locale,
        )
        for output_locale in SUPPORTED_OUTPUT_LOCALES
    }

    for output_locale, decision in decisions.items():
        catalog = get_action_plan_catalog(output_locale)
        assert decision.notice == catalog.policy_notice
        assert [source.heatrelay_rule for source in decision.sources] == list(
            catalog.policy_rules
        )

    fixed_source_facts = {
        tuple(
            (source.publisher, source.url, source.accessed_on)
            for source in decision.sources
        )
        for decision in decisions.values()
    }
    assert len(fixed_source_facts) == 1


def test_priority_hydration_rejects_unsupported_output_locale() -> None:
    with pytest.raises(ValueError):
        determine_action_priority(
            _situation(),
            33.0,
            output_locale="fr-FR",  # type: ignore[arg-type]
        )


@pytest.mark.parametrize(
    ("output_locale", "foreign_locale"),
    [
        pytest.param("es", "en", id="spanish-english"),
        pytest.param("zh-CN", "zh-TW", id="simplified-traditional"),
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
def test_priority_model_rejects_mixed_registered_catalog_bundle(
    output_locale: OutputLocale,
    foreign_locale: OutputLocale,
) -> None:
    payload = determine_action_priority(
        _situation(),
        33.0,
        output_locale=output_locale,
    ).model_dump(mode="python")
    payload["notice"] = get_action_plan_catalog(foreign_locale).policy_notice

    with pytest.raises(ValueError):
        PriorityDecision.model_validate(payload)


@pytest.mark.parametrize(
    "mutation",
    ["mixed-notice", "partial-rule", "all-prose"],
)
def test_priority_model_rejects_non_catalog_or_partial_policy_bundle(
    mutation: str,
) -> None:
    payload = determine_action_priority(
        _situation(),
        33.0,
        output_locale="en",
    ).model_dump(mode="python")
    if mutation in {"mixed-notice", "all-prose"}:
        payload["notice"] = "Forged policy notice"
    if mutation == "partial-rule":
        payload["sources"][0]["heatrelay_rule"] = "Forged policy rule"
    elif mutation == "all-prose":
        for source in payload["sources"]:
            source["heatrelay_rule"] = "Forged policy rule"

    with pytest.raises(ValueError):
        PriorityDecision.model_validate(payload)
