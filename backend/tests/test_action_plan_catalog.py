"""Focused characterization for immutable action-plan output catalogs."""

from __future__ import annotations

import ast
from dataclasses import FrozenInstanceError, fields, is_dataclass
import hashlib
import json
from collections.abc import Mapping
from pathlib import Path
import re
from typing import get_args
import unicodedata

import pytest

from backend.app.action_plan import (
    ActionPlanSituationProjection,
    ActionPlanWeatherProjection,
    BRING_ITEM_TEXT,
    CANDIDATE_NOTICE,
    CandidateContext,
    DISTANCE_NOTICE,
    EMPTY_EXPLANATION,
    EXPLANATION_TEXT,
    HOURS_REACHABILITY_NOTICE,
    HOURS_WARNING,
    HydratedGroundedPlan,
    LOCAL_PHRASES,
    MATCH_EXPLANATION,
    MODEL_DERIVED_POLICY_NOTICE,
    MOVEMENT_PROHIBITED_EXPLANATION,
    NEXT_ACTION_TEXT,
    NORMAL_PLAN_NOTICE,
    NOW_ACTION_TEXT,
    NormalActionPlanResponse,
    POLICY_SOURCES,
    PriorityDecision,
    TONIGHT_ACTION_TEXT,
    TRAVEL_COMPATIBILITY_UNPROVEN_EXPLANATION,
    TRAVEL_COMPATIBILITY_UNPROVEN_NOTICE,
    URGENT_MEDICAL_NOTICE,
    URGENT_NO_PLAN_NOTICE,
    ActionPlanRequest,
    UrgentContact,
    UrgentActionPlanResponse,
)
from backend.app.action_plan_catalog import (
    ACTION_PLAN_CATALOGS,
    CANDIDATE_EXPLANATION_ORDER,
    CANDIDATE_WARNING_ORDER,
    FIXED_LOCAL_PHRASES,
    URGENT_ACTION_ORDER,
    ActionPlanCatalog,
    CandidateExplanationVariant,
    CandidateWarningVariant,
    UrgentActionCode,
    get_action_plan_catalog,
)
from backend.app.action_plan_catalogs.ar import ARABIC_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.en import ENGLISH_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.es import SPANISH_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.bn import BENGALI_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.de import GERMAN_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.hi import HINDI_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.fr import FRENCH_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.id import INDONESIAN_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.it import ITALIAN_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.ja import JAPANESE_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.ko import KOREAN_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.nl import DUTCH_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.pl import POLISH_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.pt_br import (
    BRAZILIAN_PORTUGUESE_ACTION_PLAN_CATALOG,
)
from backend.app.action_plan_catalogs.ru import RUSSIAN_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.uk import UKRAINIAN_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.vi import VIETNAMESE_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.th import THAI_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.tr import TURKISH_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.sw import SWAHILI_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.ur import URDU_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.fa import PERSIAN_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.he import HEBREW_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.zh_cn import (
    SIMPLIFIED_CHINESE_ACTION_PLAN_CATALOG,
)
from backend.app.action_plan_catalogs.zh_tw import (
    TRADITIONAL_CHINESE_ACTION_PLAN_CATALOG,
)
from backend.app.grounded_plan import (
    BRING_ITEM_ORDER,
    EXPLANATION_REASON_ORDER,
    LOCAL_PHRASE_ORDER,
    NEXT_FEW_HOURS_ACTION_ORDER,
    NOW_ACTION_ORDER,
    TONIGHT_ACTION_ORDER,
)
from backend.app.localization import OutputLocale, SUPPORTED_OUTPUT_LOCALES
from backend.app.places import (
    CANDIDATE_NOTICE as PLACES_CANDIDATE_NOTICE,
    EMPTY_EXPLANATION as PLACES_EMPTY_EXPLANATION,
    HOURS_WARNING as PLACES_HOURS_WARNING,
    MATCH_EXPLANATION as PLACES_MATCH_EXPLANATION,
)
from backend.app.situation import SITUATION_NOTICE, SituationExtractionResponse
from backend.app.weather import (
    MODEL_DERIVED_NOTICE,
    WeatherContextResponse,
    WeatherSource,
)


ENGLISH_CATALOG_BYTE_LENGTH = 6_835
ENGLISH_CATALOG_SHA256 = (
    "4027e85c17b97a08859aa794552a6c26ba5ae1b32a1ef0987e7cc3fdc53729da"
)
SPANISH_CATALOG_BYTE_LENGTH = 8_303
SPANISH_CATALOG_SHA256 = (
    "6986691e63856dfd2ff29fee1be5e896765bd2c17c15bd60b219e71f1a1eac6c"
)
SIMPLIFIED_CHINESE_CATALOG_BYTE_LENGTH = 6_493
SIMPLIFIED_CHINESE_CATALOG_SHA256 = (
    "f12af827f7eccf666434f1ca8d2a5bf488717fabcd1de975422b8764ce6577aa"
)
TRADITIONAL_CHINESE_CATALOG_BYTE_LENGTH = 6_472
TRADITIONAL_CHINESE_CATALOG_SHA256 = (
    "e03ab191fc5a9a62e5f970926fc8796488977ea0f1181db1fd40f406d35c94d4"
)
HINDI_CATALOG_BYTE_LENGTH = 16_206
HINDI_CATALOG_SHA256 = (
    "6c6f195e0cd3b7b8f87167b553f157fc586f47ead301b3feddba9c43cf7d3a80"
)
BENGALI_CATALOG_BYTE_LENGTH = 16_955
BENGALI_CATALOG_SHA256 = (
    "4c66d3b75760aeebc5eea9ae09137b3fe401ecd2aa21917ecbc9f2176cefa1b5"
)
ARABIC_CATALOG_BYTE_LENGTH = 10_134
ARABIC_CATALOG_SHA256 = (
    "f7fc44f0fe4a92dc8cbb1f815312d268a946bfcc64996c3c0797c067b8614738"
)
BRAZILIAN_PORTUGUESE_CATALOG_BYTE_LENGTH = 8_231
BRAZILIAN_PORTUGUESE_CATALOG_SHA256 = (
    "2d088f5e27c85b97d6c3192b4e8f75f51596b9bec2789fbd49be8b9fbbaa2703"
)
FRENCH_CATALOG_BYTE_LENGTH = 8_951
FRENCH_CATALOG_SHA256 = (
    "b58ad091df16c087d4ee09d9b839def75cdb03f97d90bd78399ce71213499664"
)
ITALIAN_CATALOG_BYTE_LENGTH = 8_421
ITALIAN_CATALOG_SHA256 = (
    "30a2b576caf885510d252246d1a176c6f270a99d0e3fc401fda47a75733c2967"
)
GERMAN_CATALOG_BYTE_LENGTH = 8_693
GERMAN_CATALOG_SHA256 = (
    "5856680c2a915febac3e3567d166332d2186b8af3c88cb15c94e3317e817c3de"
)
DUTCH_CATALOG_BYTE_LENGTH = 8_120
DUTCH_CATALOG_SHA256 = (
    "41920d560b44bb7b26ad738cffbfda53cc06ff385e80c58737553e3be52acb2d"
)
RUSSIAN_CATALOG_BYTE_LENGTH = 13_243
RUSSIAN_CATALOG_SHA256 = (
    "bcbf9b35f83f583f085b97d0454647cdaf525c666a7aed97dd3c27b0e19ec60b"
)
UKRAINIAN_CATALOG_BYTE_LENGTH = 12_698
UKRAINIAN_CATALOG_SHA256 = (
    "845d5a08976335b8978577e5d78f194ccb352f02163479c5b1de54a65ddc1615"
)
POLISH_CATALOG_BYTE_LENGTH = 8_178
POLISH_CATALOG_SHA256 = (
    "daa7e5c1e09a078c223723df24cd6eeacca7081c22f10118bf7c49f83b185432"
)
JAPANESE_CATALOG_BYTE_LENGTH = 9_374
JAPANESE_CATALOG_SHA256 = (
    "14ae59c97edc2b8822eeb96be54f6f41d3f6227f92cb91d9bb769e773e550ebd"
)
KOREAN_CATALOG_BYTE_LENGTH = 8_488
KOREAN_CATALOG_SHA256 = (
    "ce5dc853a011fb46c5b1835df7540530e1673dc2ffa9d078a35a299082ebf73d"
)
INDONESIAN_CATALOG_BYTE_LENGTH = 7_962
INDONESIAN_CATALOG_SHA256 = (
    "1fe2f0cd2e494f2351471fc6e65a1e95eae61b3467449f986ae560d730ec3a1e"
)
VIETNAMESE_CATALOG_BYTE_LENGTH = 9_907
VIETNAMESE_CATALOG_SHA256 = (
    "187d175e3299506759556b130cb701a750b70ac458e161d32b0934ccdcd76fc5"
)
THAI_CATALOG_BYTE_LENGTH = 17_773
THAI_CATALOG_SHA256 = (
    "19e47ca5e321c51774c569c1f5aabe2049168a183c0cd771100009ce20500623"
)
TURKISH_CATALOG_BYTE_LENGTH = 7_837
TURKISH_CATALOG_SHA256 = (
    "7080c0af61a10122d5bd95e6289a4fd0e4555fe1a50af2ca1c2cd954aeef0ec3"
)
SWAHILI_CATALOG_BYTE_LENGTH = 7_791
SWAHILI_CATALOG_SHA256 = (
    "e22d1c60512e64b14f7d0fbf995baa9beeb2076718c0306b078549427c78df52"
)
URDU_CATALOG_BYTE_LENGTH = 11_286
URDU_CATALOG_SHA256 = (
    "f1cef1a9d39d5e4006b11f9b1ee8218b2d9048ccc78dbcf9c7553a7469a5a9a3"
)
PERSIAN_CATALOG_BYTE_LENGTH = 11_263
PERSIAN_CATALOG_SHA256 = (
    "17ed204a2fca28973d812cfc43a4f00cf03a00b21ec7b5b3e263cc772efe4cb2"
)
HEBREW_CATALOG_BYTE_LENGTH = 9_162
HEBREW_CATALOG_SHA256 = (
    "af1970403d4deca04b9be7a684dcf3c2e3d56eb75034bb3741115a759f4de022"
)


def _assert_nonblank_leaves(value: object) -> None:
    if isinstance(value, str):
        assert value.strip()
        return
    if isinstance(value, Mapping):
        for nested in value.values():
            _assert_nonblank_leaves(nested)
        return
    if isinstance(value, tuple):
        for nested in value:
            _assert_nonblank_leaves(nested)
        return
    raise AssertionError(f"unexpected catalog leaf type: {type(value)!r}")


def _string_leaves(value: object) -> tuple[str, ...]:
    if isinstance(value, str):
        return (value,)
    if isinstance(value, Mapping):
        return tuple(
            leaf
            for nested in value.values()
            for leaf in _string_leaves(nested)
        )
    if isinstance(value, tuple):
        return tuple(
            leaf for nested in value for leaf in _string_leaves(nested)
        )
    raise AssertionError(f"unexpected catalog leaf type: {type(value)!r}")


def _canonical_schema_bytes(model: type[object]) -> bytes:
    return json.dumps(
        model.model_json_schema(),  # type: ignore[attr-defined]
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")


def _canonical_catalog_bytes(catalog: ActionPlanCatalog) -> bytes:
    payload = {
        "priority_notice": catalog.policy_notice,
        "policy_rule_texts": catalog.policy_rules,
        "situation_notice": catalog.situation_notice,
        "weather_notice": catalog.weather_notice,
        "urgent_contact_instruction": catalog.urgent_contact_instruction,
        "urgent_actions": [
            [code, text] for code, text in catalog.urgent_actions.items()
        ],
        "urgent_notices": catalog.urgent_notices,
        "now_actions": dict(catalog.now_actions),
        "next_few_hours_actions": dict(catalog.next_few_hours_actions),
        "tonight_actions": dict(catalog.tonight_actions),
        "bring_items": dict(catalog.bring_items),
        "explanations": dict(catalog.explanations),
        "normal_plan_notice": catalog.normal_notice,
        "candidate_explanations": {
            "match": catalog.candidate_explanations["matched_candidate"],
            "empty": catalog.candidate_explanations["no_candidate"],
            "movement_prohibited": catalog.candidate_explanations[
                "movement_prohibited"
            ],
            "travel_compatibility_unproven": catalog.candidate_explanations[
                "unresolved_travel_compatibility"
            ],
        },
        "candidate_warnings": {
            "hours": catalog.candidate_warnings["hours"],
            "candidate": catalog.candidate_warnings["candidate_notice"],
            "distance": catalog.candidate_warnings["distance"],
            "reachability": catalog.candidate_warnings["reachability"],
        },
        "travel_compatibility_unproven_notice": (
            catalog.unresolved_travel_notice
        ),
    }
    return json.dumps(
        payload,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")


def test_catalog_registry_exactly_covers_supported_output_locales() -> None:
    assert SUPPORTED_OUTPUT_LOCALES == (
        "en",
        "es",
        "zh-CN",
        "zh-TW",
        "hi",
        "bn",
        "ar",
        "pt-BR",
        "fr",
        "it",
        "de",
        "nl",
        "ru",
        "uk",
        "pl",
        "ja",
        "ko",
        "id",
        "vi",
        "th",
        "tr",
        "sw",
        "ur",
        "fa",
        "he",
    )
    assert get_args(OutputLocale) == SUPPORTED_OUTPUT_LOCALES
    assert tuple(ACTION_PLAN_CATALOGS) == SUPPORTED_OUTPUT_LOCALES
    assert ACTION_PLAN_CATALOGS["en"] is ENGLISH_ACTION_PLAN_CATALOG
    assert ACTION_PLAN_CATALOGS["es"] is SPANISH_ACTION_PLAN_CATALOG
    assert (
        ACTION_PLAN_CATALOGS["zh-CN"]
        is SIMPLIFIED_CHINESE_ACTION_PLAN_CATALOG
    )
    assert (
        ACTION_PLAN_CATALOGS["zh-TW"]
        is TRADITIONAL_CHINESE_ACTION_PLAN_CATALOG
    )
    assert ACTION_PLAN_CATALOGS["hi"] is HINDI_ACTION_PLAN_CATALOG
    assert ACTION_PLAN_CATALOGS["bn"] is BENGALI_ACTION_PLAN_CATALOG
    assert ACTION_PLAN_CATALOGS["ar"] is ARABIC_ACTION_PLAN_CATALOG
    assert (
        ACTION_PLAN_CATALOGS["pt-BR"]
        is BRAZILIAN_PORTUGUESE_ACTION_PLAN_CATALOG
    )
    assert ACTION_PLAN_CATALOGS["fr"] is FRENCH_ACTION_PLAN_CATALOG
    assert ACTION_PLAN_CATALOGS["it"] is ITALIAN_ACTION_PLAN_CATALOG
    assert ACTION_PLAN_CATALOGS["de"] is GERMAN_ACTION_PLAN_CATALOG
    assert ACTION_PLAN_CATALOGS["nl"] is DUTCH_ACTION_PLAN_CATALOG
    assert ACTION_PLAN_CATALOGS["ru"] is RUSSIAN_ACTION_PLAN_CATALOG
    assert ACTION_PLAN_CATALOGS["uk"] is UKRAINIAN_ACTION_PLAN_CATALOG
    assert ACTION_PLAN_CATALOGS["pl"] is POLISH_ACTION_PLAN_CATALOG
    assert ACTION_PLAN_CATALOGS["ja"] is JAPANESE_ACTION_PLAN_CATALOG
    assert ACTION_PLAN_CATALOGS["ko"] is KOREAN_ACTION_PLAN_CATALOG
    assert ACTION_PLAN_CATALOGS["id"] is INDONESIAN_ACTION_PLAN_CATALOG
    assert ACTION_PLAN_CATALOGS["vi"] is VIETNAMESE_ACTION_PLAN_CATALOG
    assert ACTION_PLAN_CATALOGS["th"] is THAI_ACTION_PLAN_CATALOG
    assert ACTION_PLAN_CATALOGS["tr"] is TURKISH_ACTION_PLAN_CATALOG
    assert ACTION_PLAN_CATALOGS["sw"] is SWAHILI_ACTION_PLAN_CATALOG
    assert ACTION_PLAN_CATALOGS["ur"] is URDU_ACTION_PLAN_CATALOG
    assert ACTION_PLAN_CATALOGS["fa"] is PERSIAN_ACTION_PLAN_CATALOG
    assert ACTION_PLAN_CATALOGS["he"] is HEBREW_ACTION_PLAN_CATALOG
    assert all(
        isinstance(catalog, ActionPlanCatalog)
        for catalog in ACTION_PLAN_CATALOGS.values()
    )


def test_catalog_has_exact_complete_projection_field_set() -> None:
    assert tuple(field.name for field in fields(ActionPlanCatalog)) == (
        "policy_notice",
        "policy_rules",
        "situation_notice",
        "weather_notice",
        "urgent_contact_instruction",
        "urgent_actions",
        "urgent_notices",
        "now_actions",
        "next_few_hours_actions",
        "tonight_actions",
        "bring_items",
        "explanations",
        "normal_notice",
        "candidate_explanations",
        "candidate_warnings",
        "unresolved_travel_notice",
    )


def test_catalog_lookup_accepts_only_exact_supported_locales() -> None:
    for output_locale in SUPPORTED_OUTPUT_LOCALES:
        assert (
            get_action_plan_catalog(output_locale)
            is ACTION_PLAN_CATALOGS[output_locale]
        )

    rejected: tuple[object, ...] = (
        "EN",
        "ES",
        "en-US",
        "en-GB",
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
        "ca",
        "",
        " en",
        "en ",
        " es",
        "es ",
        "\ten\n",
        None,
        True,
        False,
        0,
        1,
        1.0,
        [],
        ["en"],
        ("en",),
        ("es",),
        {},
        {"output_locale": "en"},
    )
    for value in rejected:
        with pytest.raises(ValueError, match="unsupported action-plan output locale"):
            get_action_plan_catalog(value)


def test_catalog_and_fixed_phrase_structures_are_immutable() -> None:
    for catalog in ACTION_PLAN_CATALOGS.values():
        assert is_dataclass(catalog)
        assert catalog.__dataclass_params__.frozen is True

        with pytest.raises(FrozenInstanceError):
            catalog.policy_notice = "forged"  # type: ignore[misc]
        with pytest.raises(FrozenInstanceError):
            catalog.situation_notice = "forged"  # type: ignore[misc]
        with pytest.raises(FrozenInstanceError):
            catalog.weather_notice = "forged"  # type: ignore[misc]

        immutable_mappings = (
            catalog.urgent_actions,
            catalog.now_actions,
            catalog.next_few_hours_actions,
            catalog.tonight_actions,
            catalog.bring_items,
            catalog.explanations,
            catalog.candidate_explanations,
            catalog.candidate_warnings,
        )
        for mapping in immutable_mappings:
            first_key = next(iter(mapping))
            with pytest.raises(TypeError):
                mapping[first_key] = mapping[first_key]  # type: ignore[index]

        with pytest.raises(TypeError):
            catalog.policy_rules[0] = catalog.policy_rules[0]  # type: ignore[index]
        with pytest.raises(TypeError):
            catalog.now_actions["move_to_cooler_space"][0] = (  # type: ignore[index]
                "forged"
            )

    with pytest.raises(TypeError):
        ACTION_PLAN_CATALOGS["en"] = ENGLISH_ACTION_PLAN_CATALOG  # type: ignore[index]
    with pytest.raises(TypeError):
        FIXED_LOCAL_PHRASES["spanish_request_cool_space"] = (  # type: ignore[index]
            "es",
            "forged",
        )


def test_every_catalog_and_fixed_phrase_leaf_is_nonblank() -> None:
    for catalog in ACTION_PLAN_CATALOGS.values():
        for field in fields(catalog):
            _assert_nonblank_leaves(getattr(catalog, field.name))
    _assert_nonblank_leaves(FIXED_LOCAL_PHRASES)


@pytest.mark.parametrize("output_locale", SUPPORTED_OUTPUT_LOCALES)
def test_catalog_has_70_positions_and_one_intentional_duplicate(
    output_locale: str,
) -> None:
    catalog = get_action_plan_catalog(output_locale)
    catalog_leaves = tuple(
        leaf
        for field in fields(catalog)
        for leaf in _string_leaves(getattr(catalog, field.name))
    )

    assert len(catalog_leaves) == 70
    assert len(set(catalog_leaves)) == 69
    medical_notice = catalog.urgent_actions[
        "do_not_use_shelter_as_medical_substitute"
    ]
    assert catalog.urgent_notices[0] == medical_notice
    assert catalog_leaves.count(medical_notice) == 2
    assert all(
        catalog_leaves.count(value) == 1
        for value in set(catalog_leaves)
        if value != medical_notice
    )


def test_projection_notices_reuse_standalone_constants_exactly() -> None:
    catalog = get_action_plan_catalog("en")

    assert catalog.situation_notice is SITUATION_NOTICE
    assert catalog.weather_notice is MODEL_DERIVED_NOTICE
    assert catalog.situation_notice.encode("utf-8") == SITUATION_NOTICE.encode(
        "utf-8"
    )
    assert catalog.weather_notice.encode("utf-8") == MODEL_DERIVED_NOTICE.encode(
        "utf-8"
    )


def test_locked_spanish_safety_subset_is_exact() -> None:
    catalog = get_action_plan_catalog("es")

    assert catalog.situation_notice == (
        "Este resultado es un resumen estructurado de la información indicada "
        "explícitamente. No es asesoramiento médico, una evaluación de "
        "emergencia ni un plan de acción."
    )
    assert catalog.weather_notice == (
        "Este es un contexto meteorológico derivado de modelos de Open-Meteo, "
        "no un aviso oficial por calor."
    )
    assert catalog.urgent_contact_instruction == (
        "Llama al 112 ahora para solicitar asistencia de emergencia."
    )
    assert catalog.urgent_actions["contact_emergency_service_now"] == (
        "Llama al 112 ahora."
    )
    assert catalog.urgent_actions[
        "do_not_use_shelter_as_medical_substitute"
    ] == "Los refugios climáticos no sustituyen la atención médica."
    assert catalog.urgent_notices == (
        "Los refugios climáticos no sustituyen la atención médica.",
        (
            "Como se informó explícitamente de un síntoma de alarma incluido "
            "en el catálogo cerrado, HeatRelay no consultó datos "
            "meteorológicos ni lugares y no pidió a GPT-5.6 que generara un "
            "plan."
        ),
    )


@pytest.mark.parametrize(
    ("output_locale", "expected"),
    (
        (
            "zh-CN",
            {
                "situation_notice": (
                    "此输出是对已明确陈述信息的结构化摘要，不是医疗建议、"
                    "紧急情况评估或行动计划。"
                ),
                "weather_notice": (
                    "这是根据 Open-Meteo 模型推导的天气背景信息，并非官方"
                    "高温预警。"
                ),
                "urgent_contact_instruction": "立即拨打 112 寻求紧急援助。",
                "contact_action": "立即拨打 112。",
                "medical_notice": "气候庇护场所不能替代医疗救治。",
                "no_plan_notice": (
                    "由于明确报告了封闭清单中的一项警示症状，HeatRelay 未"
                    "获取天气或地点信息，也未要求 GPT-5.6 生成计划。"
                ),
            },
        ),
        (
            "zh-TW",
            {
                "situation_notice": (
                    "此輸出是對已明確陳述資訊的結構化摘要，不是醫療建議、"
                    "緊急情況評估或行動計畫。"
                ),
                "weather_notice": (
                    "這是根據 Open-Meteo 模型推導的天氣背景資訊，並非官方"
                    "高溫警告。"
                ),
                "urgent_contact_instruction": "立即撥打 112 尋求緊急協助。",
                "contact_action": "立即撥打 112。",
                "medical_notice": "氣候庇護場所不能取代醫療照護。",
                "no_plan_notice": (
                    "由於明確通報了封閉清單中的一項警示症狀，HeatRelay 未"
                    "取得天氣或地點資訊，也未要求 GPT-5.6 產生計畫。"
                ),
            },
        ),
    ),
)
def test_locked_chinese_safety_subsets_are_exact(
    output_locale: str,
    expected: dict[str, str],
) -> None:
    catalog = get_action_plan_catalog(output_locale)

    assert catalog.situation_notice == expected["situation_notice"]
    assert catalog.weather_notice == expected["weather_notice"]
    assert (
        catalog.urgent_contact_instruction
        == expected["urgent_contact_instruction"]
    )
    assert (
        catalog.urgent_actions["contact_emergency_service_now"]
        == expected["contact_action"]
    )
    assert catalog.urgent_actions[
        "do_not_use_shelter_as_medical_substitute"
    ] == expected["medical_notice"]
    assert catalog.urgent_notices == (
        expected["medical_notice"],
        expected["no_plan_notice"],
    )


@pytest.mark.parametrize(
    ("output_locale", "expected"),
    (
        (
            "hi",
            {
                "situation_notice": (
                    "यह आउटपुट स्पष्ट रूप से बताई गई जानकारी का संरचित सारांश "
                    "है। यह चिकित्सीय सलाह, आपातकालीन स्थिति का आकलन या "
                    "कार्य-योजना नहीं है।"
                ),
                "weather_notice": (
                    "यह Open-Meteo के मॉडल से प्राप्त मौसम संबंधी संदर्भ "
                    "जानकारी है, कोई आधिकारिक गर्मी की चेतावनी नहीं।"
                ),
                "urgent_contact_instruction": (
                    "आपातकालीन सहायता के लिए अभी 112 पर कॉल करें।"
                ),
                "contact_action": "अभी 112 पर कॉल करें।",
                "medical_notice": (
                    "जलवायु आश्रय स्थल चिकित्सीय देखभाल का विकल्प नहीं हैं।"
                ),
                "no_plan_notice": (
                    "क्योंकि सीमित दायरे वाला एक चेतावनी लक्षण स्पष्ट रूप से "
                    "बताया गया था, HeatRelay ने मौसम या स्थानों की जानकारी "
                    "प्राप्त नहीं की और GPT-5.6 से योजना बनाने के लिए नहीं कहा।"
                ),
            },
        ),
        (
            "bn",
            {
                "situation_notice": (
                    "এই আউটপুটটি স্পষ্টভাবে জানানো তথ্যের একটি কাঠামোবদ্ধ "
                    "সারাংশ। এটি চিকিৎসা পরামর্শ, জরুরি পরিস্থিতির মূল্যায়ন "
                    "বা কোনো অ্যাকশন প্ল্যান নয়।"
                ),
                "weather_notice": (
                    "এটি Open-Meteo-এর মডেল থেকে পাওয়া আবহাওয়া-সংক্রান্ত "
                    "প্রাসঙ্গিক তথ্য, কোনো অফিশিয়াল তাপ সতর্কতা নয়।"
                ),
                "urgent_contact_instruction": (
                    "জরুরি সহায়তার জন্য এখনই 112 নম্বরে কল করুন।"
                ),
                "contact_action": "এখনই 112 নম্বরে কল করুন।",
                "medical_notice": (
                    "জলবায়ু আশ্রয়স্থল চিকিৎসা সেবার বিকল্প নয়।"
                ),
                "no_plan_notice": (
                    "কারণ সীমিত পরিসরের একটি সতর্কতামূলক উপসর্গ স্পষ্টভাবে "
                    "জানানো হয়েছিল, HeatRelay আবহাওয়া বা স্থান-সংক্রান্ত "
                    "তথ্য সংগ্রহ করেনি এবং GPT-5.6-কে কোনো পরিকল্পনা তৈরি "
                    "করতে বলেনি।"
                ),
            },
        ),
    ),
)
def test_locked_indic_safety_subsets_are_exact(
    output_locale: str,
    expected: dict[str, str],
) -> None:
    catalog = get_action_plan_catalog(output_locale)

    assert catalog.situation_notice == expected["situation_notice"]
    assert catalog.weather_notice == expected["weather_notice"]
    assert (
        catalog.urgent_contact_instruction
        == expected["urgent_contact_instruction"]
    )
    assert (
        catalog.urgent_actions["contact_emergency_service_now"]
        == expected["contact_action"]
    )
    assert catalog.urgent_actions[
        "do_not_use_shelter_as_medical_substitute"
    ] == expected["medical_notice"]
    assert catalog.urgent_notices == (
        expected["medical_notice"],
        expected["no_plan_notice"],
    )


def test_locked_arabic_safety_subset_is_exact() -> None:
    catalog = get_action_plan_catalog("ar")

    assert catalog.situation_notice == (
        "هذه المخرجات ملخص منظم للمعلومات التي أُبلغ عنها صراحةً. وهي ليست "
        "نصيحة طبية ولا تقييمًا لحالة طارئة ولا خطة عمل."
    )
    assert catalog.weather_notice == (
        "هذه معلومات سياقية عن الطقس مستمدة من نموذج Open-Meteo، وليست "
        "تحذيرًا رسميًا من الحر."
    )
    assert catalog.urgent_contact_instruction == (
        "اتصل بالرقم 112 الآن للحصول على مساعدة طارئة."
    )
    assert catalog.urgent_actions["contact_emergency_service_now"] == (
        "اتصل بالرقم 112 الآن."
    )
    medical_notice = "الملاجئ المناخية ليست بديلًا عن الرعاية الطبية."
    assert catalog.urgent_actions[
        "do_not_use_shelter_as_medical_substitute"
    ] == medical_notice
    assert catalog.urgent_notices == (
        medical_notice,
        (
            "نظرًا للإبلاغ صراحةً عن عرض تحذيري محدود النطاق، لم يسترجع "
            "HeatRelay معلومات الطقس أو الأماكن، ولم يطلب من GPT-5.6 إنشاء خطة."
        ),
    )


def test_locked_brazilian_portuguese_safety_subset_is_exact() -> None:
    catalog = get_action_plan_catalog("pt-BR")

    assert catalog.situation_notice == (
        "Esta saída é um resumo estruturado das informações relatadas "
        "explicitamente. Não é aconselhamento médico, uma avaliação de "
        "emergência nem um plano de ação."
    )
    assert catalog.weather_notice == (
        "Este é um contexto meteorológico derivado dos modelos da Open-Meteo, "
        "não um alerta oficial de calor."
    )
    assert catalog.urgent_contact_instruction == (
        "Ligue para o 112 agora para solicitar assistência de emergência."
    )
    assert catalog.urgent_actions["contact_emergency_service_now"] == (
        "Ligue para o 112 agora."
    )
    medical_notice = (
        "Os abrigos climáticos não substituem o atendimento médico."
    )
    assert catalog.urgent_actions[
        "do_not_use_shelter_as_medical_substitute"
    ] == medical_notice
    assert catalog.urgent_notices == (
        medical_notice,
        (
            "Como um sintoma de alerta de escopo limitado foi relatado "
            "explicitamente, a HeatRelay não consultou informações "
            "meteorológicas nem locais e não pediu ao GPT-5.6 que gerasse um "
            "plano."
        ),
    )


@pytest.mark.parametrize(
    ("output_locale", "expected"),
    (
        (
            "fr",
            {
                "situation_notice": (
                    "Ce résultat est un résumé structuré des informations "
                    "explicitement signalées. Il ne s’agit ni d’un conseil "
                    "médical, ni d’une évaluation d’urgence, ni d’un plan "
                    "d’action."
                ),
                "weather_notice": (
                    "Il s’agit d’informations météorologiques contextuelles "
                    "dérivées des modèles d’Open-Meteo, et non d’une alerte "
                    "officielle de chaleur."
                ),
                "urgent_contact_instruction": (
                    "Appelez immédiatement le 112 pour obtenir une assistance "
                    "d’urgence."
                ),
                "contact_action": "Appelez immédiatement le 112.",
                "medical_notice": (
                    "Les refuges climatiques ne remplacent pas les soins "
                    "médicaux."
                ),
                "no_plan_notice": (
                    "Puisqu’un symptôme d’alerte de portée limitée a été "
                    "explicitement signalé, HeatRelay n’a consulté ni les "
                    "données météorologiques ni les lieux et n’a pas demandé "
                    "à GPT-5.6 de générer un plan."
                ),
            },
        ),
        (
            "it",
            {
                "situation_notice": (
                    "Questo output è un riepilogo strutturato delle "
                    "informazioni riportate esplicitamente. Non costituisce "
                    "una consulenza medica, una valutazione di emergenza né un "
                    "piano d’azione."
                ),
                "weather_notice": (
                    "Questo è un contesto meteorologico derivato dai modelli "
                    "di Open-Meteo, non un’allerta ufficiale per il caldo."
                ),
                "urgent_contact_instruction": (
                    "Chiama subito il 112 per ricevere assistenza d’emergenza."
                ),
                "contact_action": "Chiama subito il 112.",
                "medical_notice": (
                    "I rifugi climatici non sostituiscono l’assistenza medica."
                ),
                "no_plan_notice": (
                    "Poiché è stato segnalato esplicitamente un sintomo di "
                    "allarme circoscritto, HeatRelay non ha recuperato dati "
                    "meteorologici né informazioni sui luoghi e non ha chiesto "
                    "a GPT-5.6 di generare un piano."
                ),
            },
        ),
        (
            "de",
            {
                "situation_notice": (
                    "Dieses Ergebnis ist eine strukturierte Zusammenfassung "
                    "der ausdrücklich angegebenen Informationen. Es handelt "
                    "sich weder um eine medizinische Beratung noch um eine "
                    "Notfallbeurteilung noch um einen Aktionsplan."
                ),
                "weather_notice": (
                    "Dies ist ein aus Open-Meteo-Modellen abgeleiteter "
                    "Wetterkontext, keine offizielle Hitzewarnung."
                ),
                "urgent_contact_instruction": (
                    "Rufen Sie jetzt die 112 an, um Notfallhilfe zu erhalten."
                ),
                "contact_action": "Rufen Sie jetzt die 112 an.",
                "medical_notice": (
                    "Hitzeschutzräume sind kein Ersatz für medizinische "
                    "Versorgung."
                ),
                "no_plan_notice": (
                    "Da ausdrücklich ein klar eingegrenztes Warnsymptom "
                    "angegeben wurde, hat HeatRelay weder Wetterdaten noch "
                    "Informationen zu Orten abgerufen und GPT-5.6 nicht um "
                    "die Erstellung eines Plans gebeten."
                ),
            },
        ),
        (
            "nl",
            {
                "situation_notice": (
                    "Dit resultaat is een gestructureerde samenvatting van "
                    "expliciet gemelde informatie. Het is geen medisch "
                    "advies, geen beoordeling van een noodsituatie en geen "
                    "actieplan."
                ),
                "weather_notice": (
                    "Dit is weersinformatie die is afgeleid van modellen van "
                    "Open-Meteo; het is geen officiële hittewaarschuwing."
                ),
                "urgent_contact_instruction": (
                    "Bel nu 112 voor hulp in een noodsituatie."
                ),
                "contact_action": "Bel nu 112.",
                "medical_notice": (
                    "Klimaatschuilplaatsen zijn geen vervanging voor "
                    "medische zorg."
                ),
                "no_plan_notice": (
                    "Omdat expliciet een begrensd waarschuwingssymptoom is "
                    "gemeld, heeft HeatRelay geen weersgegevens of informatie "
                    "over locaties opgehaald en GPT-5.6 niet om een plan "
                    "gevraagd."
                ),
            },
        ),
        (
            "ru",
            {
                "situation_notice": (
                    "Этот результат — структурированное резюме явно "
                    "указанных сведений. Он не является медицинской "
                    "рекомендацией, оценкой экстренной ситуации или планом "
                    "действий."
                ),
                "weather_notice": (
                    "Это полученные на основе моделей Open-Meteo сведения о "
                    "погоде, а не официальное предупреждение о жаре."
                ),
                "urgent_contact_instruction": (
                    "Немедленно позвоните по номеру 112, чтобы получить "
                    "экстренную помощь."
                ),
                "contact_action": (
                    "Немедленно позвоните по номеру 112."
                ),
                "medical_notice": (
                    "Климатические убежища не заменяют медицинскую помощь."
                ),
                "no_plan_notice": (
                    "Поскольку был явно указан тревожный симптом из "
                    "ограниченного набора, HeatRelay не запрашивал ни данные "
                    "о погоде, ни сведения о местах и не просил GPT-5.6 "
                    "создать план."
                ),
            },
        ),
        (
            "uk",
            {
                "situation_notice": (
                    "Цей результат є структурованим зведенням явно "
                    "повідомленої інформації. Він не є медичною порадою, "
                    "оцінкою надзвичайної ситуації чи планом дій."
                ),
                "weather_notice": (
                    "Це контекст погоди, отриманий із моделей Open-Meteo, а "
                    "не офіційне попередження про спеку."
                ),
                "urgent_contact_instruction": (
                    "Негайно зателефонуйте за номером 112, щоб отримати "
                    "екстрену допомогу."
                ),
                "contact_action": (
                    "Негайно зателефонуйте за номером 112."
                ),
                "medical_notice": (
                    "Кліматичні укриття не замінюють медичної допомоги."
                ),
                "no_plan_notice": (
                    "Оскільки про тривожний симптом з обмеженого переліку "
                    "було явно повідомлено, HeatRelay не отримував даних про "
                    "погоду чи місця й не просив GPT-5.6 створити план."
                ),
            },
        ),
        (
            "pl",
            {
                "situation_notice": (
                    "Ten wynik jest ustrukturyzowanym podsumowaniem wyraźnie "
                    "zgłoszonych informacji. Nie stanowi porady medycznej, "
                    "oceny sytuacji nagłej ani planu działania."
                ),
                "weather_notice": (
                    "Są to informacje pogodowe pochodzące z modeli "
                    "Open-Meteo, a nie oficjalne ostrzeżenie przed upałem."
                ),
                "urgent_contact_instruction": (
                    "Zadzwoń teraz pod numer 112, aby uzyskać pomoc w nagłej "
                    "sytuacji."
                ),
                "contact_action": "Zadzwoń teraz pod numer 112.",
                "medical_notice": (
                    "Schronienia klimatyczne nie zastępują pomocy medycznej."
                ),
                "no_plan_notice": (
                    "Ponieważ wyraźnie zgłoszono objaw ostrzegawczy objęty "
                    "ograniczonym zakresem, HeatRelay nie pobrał danych "
                    "pogodowych ani informacji o miejscach i nie poprosił "
                    "GPT-5.6 o utworzenie planu."
                ),
            },
        ),
        (
            "ja",
            {
                "situation_notice": (
                    "この出力は、明示的に報告された情報を構造化した要約です。"
                    "医療上の助言、緊急事態の評価、またはアクションプランでは"
                    "ありません。"
                ),
                "weather_notice": (
                    "これは Open-Meteo のモデルに基づく天気情報であり、公式の"
                    "暑さ警報ではありません。"
                ),
                "urgent_contact_instruction": (
                    "緊急支援を要請するため、今すぐ 112 に電話してください。"
                ),
                "contact_action": "今すぐ 112 に電話してください。",
                "medical_notice": (
                    "気候シェルターは医療を受けることの代わりにはなりません。"
                ),
                "no_plan_notice": (
                    "限定的な注意症状が明示的に報告されたため、HeatRelay は"
                    "天気情報も場所情報も取得せず、GPT-5.6 にプランの作成を"
                    "依頼しませんでした。"
                ),
            },
        ),
        (
            "ko",
            {
                "situation_notice": (
                    "이 출력은 명시적으로 보고된 정보를 구조화한 요약입니다. "
                    "의료 조언, 응급 상황 평가 또는 행동 계획이 아닙니다."
                ),
                "weather_notice": (
                    "이는 Open-Meteo 모델에서 산출된 날씨 맥락 정보이며 공식 "
                    "폭염 경보가 아닙니다."
                ),
                "urgent_contact_instruction": (
                    "긴급 지원을 받으려면 지금 112로 전화하세요."
                ),
                "contact_action": "지금 112로 전화하세요.",
                "medical_notice": (
                    "기후 쉼터는 의료 처치를 대신할 수 없습니다."
                ),
                "no_plan_notice": (
                    "범위가 한정된 경고 증상이 명시적으로 보고되었기 때문에 "
                    "HeatRelay는 날씨나 장소 정보를 조회하지 않았고 GPT-5.6에 "
                    "계획 생성을 요청하지 않았습니다."
                ),
            },
        ),
        (
            "id",
            {
                "situation_notice": (
                    "Keluaran ini adalah ringkasan terstruktur dari informasi "
                    "yang dilaporkan secara eksplisit. Ini bukan nasihat medis, "
                    "penilaian keadaan darurat, atau rencana tindakan."
                ),
                "weather_notice": (
                    "Ini adalah konteks cuaca yang berasal dari model "
                    "Open-Meteo, bukan peringatan panas resmi."
                ),
                "urgent_contact_instruction": (
                    "Hubungi 112 sekarang untuk mendapatkan bantuan darurat."
                ),
                "contact_action": "Hubungi 112 sekarang.",
                "medical_notice": (
                    "Tempat perlindungan iklim bukan pengganti perawatan medis."
                ),
                "no_plan_notice": (
                    "Karena sebuah gejala peringatan dalam batas yang "
                    "ditentukan dilaporkan secara eksplisit, HeatRelay tidak "
                    "mengambil informasi cuaca maupun informasi tentang tempat "
                    "dan tidak meminta GPT-5.6 membuat rencana."
                ),
            },
        ),
        (
            "vi",
            {
                "situation_notice": (
                    "Đầu ra này là bản tóm tắt có cấu trúc về thông tin được "
                    "báo cáo một cách rõ ràng. Đây không phải là lời khuyên y "
                    "tế, đánh giá tình trạng khẩn cấp hay kế hoạch hành động."
                ),
                "weather_notice": (
                    "Đây là thông tin bối cảnh thời tiết được suy ra từ mô "
                    "hình của Open-Meteo, không phải cảnh báo nắng nóng chính "
                    "thức."
                ),
                "urgent_contact_instruction": (
                    "Hãy gọi 112 ngay để được trợ giúp khẩn cấp."
                ),
                "contact_action": "Hãy gọi 112 ngay.",
                "medical_notice": (
                    "Các nơi trú ẩn khí hậu không thể thay thế việc chăm sóc "
                    "y tế."
                ),
                "no_plan_notice": (
                    "Vì một triệu chứng cảnh báo trong phạm vi giới hạn đã "
                    "được báo cáo rõ ràng, HeatRelay đã không truy xuất thông "
                    "tin thời tiết hoặc địa điểm và không yêu cầu GPT-5.6 tạo "
                    "kế hoạch."
                ),
            },
        ),
        (
            "th",
            {
                "situation_notice": (
                    "ผลลัพธ์นี้เป็นบทสรุปแบบมีโครงสร้างของข้อมูลที่รายงานไว้"
                    "อย่างชัดเจน ผลลัพธ์นี้ไม่ใช่คำแนะนำทางการแพทย์ "
                    "การประเมินเหตุฉุกเฉิน หรือแผนปฏิบัติการ"
                ),
                "weather_notice": (
                    "นี่คือข้อมูลประกอบด้านสภาพอากาศที่ได้จากแบบจำลองของ "
                    "Open-Meteo ไม่ใช่คำเตือนเรื่องความร้อนอย่างเป็นทางการ"
                ),
                "urgent_contact_instruction": (
                    "โทร 112 ทันทีเพื่อขอความช่วยเหลือฉุกเฉิน"
                ),
                "contact_action": "โทร 112 ทันที",
                "medical_notice": (
                    "สถานที่หลบภัยจากความร้อนไม่สามารถใช้แทนการดูแลทางการแพทย์ได้"
                ),
                "no_plan_notice": (
                    "เนื่องจากมีการรายงานอย่างชัดเจนถึงอาการเตือนที่อยู่ภายในขอบเขต"
                    "ที่กำหนด HeatRelay จึงไม่ได้ดึงข้อมูลสภาพอากาศหรือสถานที่ "
                    "และไม่ได้ขอให้ GPT-5.6 สร้างแผน"
                ),
            },
        ),
        (
            "tr",
            {
                "situation_notice": (
                    "Bu çıktı, açıkça bildirilen bilgilerin yapılandırılmış bir "
                    "özetidir. Tıbbi tavsiye, acil durum değerlendirmesi veya "
                    "eylem planı değildir."
                ),
                "weather_notice": (
                    "Bu, Open-Meteo modellerinden türetilen hava durumu "
                    "bağlamıdır; resmî bir sıcak hava uyarısı değildir."
                ),
                "urgent_contact_instruction": (
                    "Acil yardım almak için hemen 112’yi arayın."
                ),
                "contact_action": "Hemen 112’yi arayın.",
                "medical_notice": (
                    "İklim sığınakları tıbbi bakımın yerini tutmaz."
                ),
                "no_plan_notice": (
                    "Kapsamı belirli bir uyarı belirtisi açıkça bildirildiği "
                    "için HeatRelay ne hava durumu bilgilerini ne de yer "
                    "bilgilerini aldı ve GPT-5.6’dan bir plan oluşturmasını "
                    "istemedi."
                ),
            },
        ),
        (
            "sw",
            {
                "situation_notice": (
                    "Matokeo haya ni muhtasari wenye muundo wa taarifa "
                    "zilizoripotiwa wazi. Si ushauri wa kitabibu, tathmini ya "
                    "dharura wala mpango wa hatua."
                ),
                "weather_notice": (
                    "Haya ni maelezo ya muktadha wa hali ya hewa yanayotokana "
                    "na modeli ya Open-Meteo, si onyo rasmi la joto."
                ),
                "urgent_contact_instruction": (
                    "Piga simu 112 sasa ili upate msaada wa dharura."
                ),
                "contact_action": "Piga simu 112 sasa.",
                "medical_notice": (
                    "Makazi ya kujikinga na hali ya hewa si mbadala wa huduma "
                    "ya matibabu."
                ),
                "no_plan_notice": (
                    "Kwa sababu dalili ya tahadhari iliyo katika mipaka "
                    "iliyowekwa iliripotiwa wazi, HeatRelay haikupata taarifa "
                    "za hali ya hewa au maeneo na haikuiomba GPT-5.6 "
                    "itengeneze mpango."
                ),
            },
        ),
        (
            "ur",
            {
                "situation_notice": (
                    "یہ نتیجہ واضح طور پر بتائی گئی معلومات کا ایک منظم "
                    "خلاصہ ہے۔ یہ طبی مشورہ، ہنگامی صورت حال کا جائزہ یا "
                    "عملی منصوبہ نہیں ہے۔"
                ),
                "weather_notice": (
                    "یہ Open-Meteo کے ماڈلز سے اخذ کردہ موسمی معلومات ہیں، "
                    "گرمی کی کوئی سرکاری تنبیہ نہیں۔"
                ),
                "urgent_contact_instruction": (
                    "ہنگامی مدد کے لیے فوراً 112 پر کال کریں۔"
                ),
                "contact_action": "فوراً 112 پر کال کریں۔",
                "medical_notice": (
                    "گرمی سے بچاؤ کی پناہ گاہیں طبی نگہداشت کا متبادل نہیں ہیں۔"
                ),
                "no_plan_notice": (
                    "چونکہ ایک محدود انتباہی علامت واضح طور پر بتائی گئی تھی، "
                    "HeatRelay نے نہ موسم کی معلومات حاصل کیں اور نہ مقامات کے "
                    "بارے میں معلومات، اور GPT-5.6 سے منصوبہ بنانے کو بھی نہیں کہا۔"
                ),
            },
        ),
        (
            "fa",
            {
                "situation_notice": (
                    "این خروجی خلاصه‌ای ساختاریافته از اطلاعاتی است که به‌صراحت "
                    "گزارش شده‌اند. این خروجی توصیه پزشکی، ارزیابی وضعیت اضطراری "
                    "یا برنامه اقدام نیست."
                ),
                "weather_notice": (
                    "این اطلاعات زمینه‌ای آب‌وهوا از مدل‌های Open-Meteo به دست "
                    "آمده است و هشدار رسمی گرما نیست."
                ),
                "urgent_contact_instruction": (
                    "برای دریافت کمک اضطراری، اکنون با 112 تماس بگیرید."
                ),
                "contact_action": "اکنون با 112 تماس بگیرید.",
                "medical_notice": (
                    "پناهگاه‌های اقلیمی جایگزین مراقبت پزشکی نیستند."
                ),
                "no_plan_notice": (
                    "از آنجا که یک علامت هشدار محدود به‌صراحت گزارش شد، "
                    "HeatRelay اطلاعات آب‌وهوا یا مکان‌ها را دریافت نکرد و از "
                    "GPT-5.6 نخواست برنامه‌ای ایجاد کند."
                ),
            },
        ),
        (
            "he",
            {
                "situation_notice": (
                    "פלט זה הוא סיכום מובנה של המידע שנמסר במפורש. הוא אינו "
                    "ייעוץ רפואי, הערכת מצב חירום או תוכנית פעולה."
                ),
                "weather_notice": (
                    "זהו מידע על מזג האוויר שנגזר ממודלים של Open-Meteo, "
                    "ולא אזהרת חום רשמית."
                ),
                "urgent_contact_instruction": (
                    "התקשרו עכשיו למספר 112 לקבלת עזרה בחירום."
                ),
                "contact_action": "התקשרו עכשיו למספר 112.",
                "medical_notice": (
                    "מחסי אקלים אינם תחליף לטיפול רפואי."
                ),
                "no_plan_notice": (
                    "מאחר שתסמין אזהרה מוגבל דווח במפורש, HeatRelay לא אחזר "
                    "נתוני מזג אוויר או מידע על מקומות ולא ביקש מ-GPT-5.6 "
                    "ליצור תוכנית."
                ),
            },
        ),
    ),
)
def test_locked_localized_safety_subsets_are_exact(
    output_locale: str,
    expected: dict[str, str],
) -> None:
    catalog = get_action_plan_catalog(output_locale)

    assert catalog.situation_notice == expected["situation_notice"]
    assert catalog.weather_notice == expected["weather_notice"]
    assert (
        catalog.urgent_contact_instruction
        == expected["urgent_contact_instruction"]
    )
    assert (
        catalog.urgent_actions["contact_emergency_service_now"]
        == expected["contact_action"]
    )
    assert catalog.urgent_actions[
        "do_not_use_shelter_as_medical_substitute"
    ] == expected["medical_notice"]
    assert catalog.urgent_notices == (
        expected["medical_notice"],
        expected["no_plan_notice"],
    )


@pytest.mark.parametrize("output_locale", SUPPORTED_OUTPUT_LOCALES[1:])
def test_localized_catalogs_have_exact_structural_parity_with_english(
    output_locale: str,
) -> None:
    english = get_action_plan_catalog("en")
    localized = get_action_plan_catalog(output_locale)

    assert tuple(field.name for field in fields(english)) == tuple(
        field.name for field in fields(localized)
    )
    for field in fields(english):
        english_value = getattr(english, field.name)
        localized_value = getattr(localized, field.name)
        if isinstance(english_value, Mapping):
            assert tuple(localized_value) == tuple(english_value)
        assert len(_string_leaves(localized_value)) == len(
            _string_leaves(english_value)
        )


def test_catalogs_have_no_markup_placeholders_markers_or_control_characters() -> None:
    forbidden_fragments = (
        "<",
        ">",
        "{{",
        "}}",
        "**",
        "__",
        "![",
        "](",
        "`",
    )

    for output_locale, catalog in ACTION_PLAN_CATALOGS.items():
        for field in fields(catalog):
            for value in _string_leaves(getattr(catalog, field.name)):
                assert not any(
                    fragment.casefold() in value.casefold()
                    for fragment in forbidden_fragments
                )
                assert re.search(
                    r"\b(?:TODO|TBD|FIXME|REVIEW|DRAFT)\b",
                    value,
                    flags=re.IGNORECASE,
                ) is None
                assert all(
                    not unicodedata.category(character).startswith("C")
                    or (output_locale == "fa" and character == "\u200c")
                    for character in value
                )


def test_localized_catalogs_preserve_required_factual_tokens() -> None:
    required_tokens = (
        "HeatRelay",
        "Barcelona",
        "Open-Meteo",
        "GPT-5.6",
        "112",
        "34.0°C",
        "36.0°C",
        "40.0°C",
    )
    english = get_action_plan_catalog("en")
    english_leaves = tuple(
        leaf
        for field in fields(english)
        for leaf in _string_leaves(getattr(english, field.name))
    )
    assert len(english_leaves) == 70
    for output_locale in SUPPORTED_OUTPUT_LOCALES[1:]:
        localized = get_action_plan_catalog(output_locale)
        localized_leaves = tuple(
            leaf
            for field in fields(localized)
            for leaf in _string_leaves(getattr(localized, field.name))
        )

        assert len(english_leaves) == len(localized_leaves)
        for english_value, localized_value in zip(
            english_leaves, localized_leaves, strict=True
        ):
            for token in required_tokens:
                assert localized_value.count(token) == english_value.count(token)


def test_chinese_catalogs_contain_no_english_or_spanish_fallback_leaf() -> None:
    english_or_spanish_leaves = {
        leaf
        for output_locale in ("en", "es")
        for field in fields(get_action_plan_catalog(output_locale))
        for leaf in _string_leaves(
            getattr(get_action_plan_catalog(output_locale), field.name)
        )
    }

    for output_locale in ("zh-CN", "zh-TW"):
        localized_leaves = {
            leaf
            for field in fields(get_action_plan_catalog(output_locale))
            for leaf in _string_leaves(
                getattr(get_action_plan_catalog(output_locale), field.name)
            )
        }
        assert localized_leaves.isdisjoint(english_or_spanish_leaves)


@pytest.mark.parametrize(
    ("output_locale", "script_pattern"),
    [
        pytest.param("hi", r"[\u0900-\u097f]", id="hindi-devanagari"),
        pytest.param("bn", r"[\u0980-\u09ff]", id="bengali-script"),
    ],
)
def test_indic_catalogs_have_no_cross_language_fallback_or_romanized_leaf(
    output_locale: str,
    script_pattern: str,
) -> None:
    localized = get_action_plan_catalog(output_locale)
    localized_leaves = {
        leaf
        for field in fields(localized)
        for leaf in _string_leaves(getattr(localized, field.name))
    }
    foreign_leaves = {
        leaf
        for foreign_locale in SUPPORTED_OUTPUT_LOCALES
        if foreign_locale != output_locale
        for field in fields(get_action_plan_catalog(foreign_locale))
        for leaf in _string_leaves(
            getattr(get_action_plan_catalog(foreign_locale), field.name)
        )
    }

    assert localized_leaves.isdisjoint(foreign_leaves)
    assert all(re.search(script_pattern, leaf) for leaf in localized_leaves)


@pytest.mark.parametrize(
    ("output_locale", "catalog", "script_pattern", "allowed_format_controls"),
    (
        pytest.param(
            "ar",
            ARABIC_ACTION_PLAN_CATALOG,
            r"[\u0600-\u06ff]",
            frozenset(),
            id="arabic",
        ),
        pytest.param(
            "ur",
            URDU_ACTION_PLAN_CATALOG,
            r"[\u0600-\u06ff]",
            frozenset(),
            id="urdu",
        ),
        pytest.param(
            "fa",
            PERSIAN_ACTION_PLAN_CATALOG,
            r"[\u0600-\u06ff]",
            frozenset({"\u200c"}),
            id="persian",
        ),
        pytest.param(
            "he",
            HEBREW_ACTION_PLAN_CATALOG,
            r"[\u0590-\u05ff]",
            frozenset(),
            id="hebrew",
        ),
    ),
)
def test_rtl_script_catalogs_have_no_fallback_or_bidi_controls(
    output_locale: str,
    catalog: ActionPlanCatalog,
    script_pattern: str,
    allowed_format_controls: frozenset[str],
) -> None:
    localized_leaves = {
        leaf
        for field in fields(catalog)
        for leaf in _string_leaves(
            getattr(catalog, field.name)
        )
    }
    foreign_leaves = {
        leaf
        for foreign_locale in SUPPORTED_OUTPUT_LOCALES
        if foreign_locale != output_locale
        for field in fields(get_action_plan_catalog(foreign_locale))
        for leaf in _string_leaves(
            getattr(get_action_plan_catalog(foreign_locale), field.name)
        )
    }
    bidi_controls = {
        "\u061c",
        "\u200e",
        "\u200f",
        "\u202a",
        "\u202b",
        "\u202c",
        "\u202d",
        "\u202e",
        "\u2066",
        "\u2067",
        "\u2068",
        "\u2069",
    }

    assert localized_leaves.isdisjoint(foreign_leaves)
    assert all(re.search(script_pattern, leaf) for leaf in localized_leaves)
    assert all(
        re.search(r"[\u0660-\u0669\u06f0-\u06f9]", leaf) is None
        for leaf in localized_leaves
    )
    assert all(
        character not in bidi_controls
        for leaf in localized_leaves
        for character in leaf
    )
    assert {
        character
        for leaf in localized_leaves
        for character in leaf
        if unicodedata.category(character) == "Cf"
    } <= allowed_format_controls


def test_brazilian_portuguese_catalog_has_no_fallback_or_european_terms() -> None:
    localized_leaves = {
        leaf
        for field in fields(BRAZILIAN_PORTUGUESE_ACTION_PLAN_CATALOG)
        for leaf in _string_leaves(
            getattr(BRAZILIAN_PORTUGUESE_ACTION_PLAN_CATALOG, field.name)
        )
    }
    foreign_leaves = {
        leaf
        for output_locale in SUPPORTED_OUTPUT_LOCALES
        if output_locale != "pt-BR"
        for field in fields(get_action_plan_catalog(output_locale))
        for leaf in _string_leaves(
            getattr(get_action_plan_catalog(output_locale), field.name)
        )
    }
    european_portuguese_terms = (
        "arrefecimento",
        "deslocação",
        "telemóvel",
        "utilizador",
    )

    assert localized_leaves.isdisjoint(foreign_leaves)
    assert all(
        term not in leaf.casefold()
        for leaf in localized_leaves
        for term in european_portuguese_terms
    )


@pytest.mark.parametrize(
    ("output_locale", "representative_imperative"),
    (
        pytest.param("fr", "Réduisez", id="formal-french"),
        pytest.param("it", "Riduci", id="informal-italian"),
        pytest.param("de", "Verringern Sie", id="formal-german"),
        pytest.param("nl", "Verminder", id="standard-dutch"),
        pytest.param("ru", "Пока снизьте", id="formal-russian"),
        pytest.param("uk", "Наразі зменште", id="formal-ukrainian"),
        pytest.param("pl", "Na razie ogranicz", id="informal-polish"),
        pytest.param("ja", "今は身体的", id="polite-japanese"),
        pytest.param("ko", "지금은 신체", id="polite-korean"),
        pytest.param("id", "Kurangi aktivitas", id="standard-indonesian"),
        pytest.param("vi", "Tạm thời hãy", id="standard-vietnamese"),
        pytest.param("th", "ลดการออกแรง", id="neutral-thai"),
        pytest.param("tr", "Şimdilik fiziksel", id="standard-turkish"),
        pytest.param("sw", "Punguza nguvu", id="standard-swahili"),
        pytest.param("ur", "فی الحال جسمانی", id="standard-urdu"),
        pytest.param("fa", "فعلاً فعالیت", id="standard-persian"),
        pytest.param("he", "הפחיתו בינתיים", id="standard-hebrew"),
    ),
)
def test_localized_catalogs_have_no_foreign_fallback(
    output_locale: str,
    representative_imperative: str,
) -> None:
    localized = get_action_plan_catalog(output_locale)
    localized_leaves = {
        leaf
        for field in fields(localized)
        for leaf in _string_leaves(getattr(localized, field.name))
    }
    foreign_leaves = {
        leaf
        for foreign_locale in SUPPORTED_OUTPUT_LOCALES
        if foreign_locale != output_locale
        for field in fields(get_action_plan_catalog(foreign_locale))
        for leaf in _string_leaves(
            getattr(get_action_plan_catalog(foreign_locale), field.name)
        )
    }

    assert localized_leaves.isdisjoint(foreign_leaves)
    assert localized.now_actions["reduce_physical_effort"][0].startswith(
        representative_imperative
    )
    if output_locale == "th":
        assert all(
            particle not in leaf
            for leaf in localized_leaves
            for particle in ("ครับ", "ค่ะ")
        )


def test_locale_catalog_modules_are_independent() -> None:
    expected_imports = {
        "types",
        "backend.app.action_plan_catalogs",
    }
    for module_path in (
        Path("backend/app/action_plan_catalogs/zh_cn.py"),
        Path("backend/app/action_plan_catalogs/zh_tw.py"),
        Path("backend/app/action_plan_catalogs/hi.py"),
        Path("backend/app/action_plan_catalogs/bn.py"),
        Path("backend/app/action_plan_catalogs/ar.py"),
        Path("backend/app/action_plan_catalogs/pt_br.py"),
        Path("backend/app/action_plan_catalogs/fr.py"),
        Path("backend/app/action_plan_catalogs/it.py"),
        Path("backend/app/action_plan_catalogs/de.py"),
        Path("backend/app/action_plan_catalogs/nl.py"),
        Path("backend/app/action_plan_catalogs/ru.py"),
        Path("backend/app/action_plan_catalogs/uk.py"),
        Path("backend/app/action_plan_catalogs/pl.py"),
        Path("backend/app/action_plan_catalogs/ja.py"),
        Path("backend/app/action_plan_catalogs/ko.py"),
        Path("backend/app/action_plan_catalogs/id.py"),
        Path("backend/app/action_plan_catalogs/vi.py"),
        Path("backend/app/action_plan_catalogs/th.py"),
        Path("backend/app/action_plan_catalogs/tr.py"),
        Path("backend/app/action_plan_catalogs/sw.py"),
        Path("backend/app/action_plan_catalogs/ur.py"),
        Path("backend/app/action_plan_catalogs/fa.py"),
        Path("backend/app/action_plan_catalogs/he.py"),
    ):
        tree = ast.parse(module_path.read_text(encoding="utf-8"))
        imported_modules = {
            alias.name
            for node in ast.walk(tree)
            if isinstance(node, ast.Import)
            for alias in node.names
        }
        imported_modules.update(
            node.module
            for node in ast.walk(tree)
            if isinstance(node, ast.ImportFrom) and node.module is not None
        )
        assert imported_modules == expected_imports

    assert (
        SIMPLIFIED_CHINESE_ACTION_PLAN_CATALOG
        != TRADITIONAL_CHINESE_ACTION_PLAN_CATALOG
    )
    assert HINDI_ACTION_PLAN_CATALOG != BENGALI_ACTION_PLAN_CATALOG
    assert HINDI_ACTION_PLAN_CATALOG != ENGLISH_ACTION_PLAN_CATALOG
    assert BENGALI_ACTION_PLAN_CATALOG != ENGLISH_ACTION_PLAN_CATALOG
    assert ARABIC_ACTION_PLAN_CATALOG != ENGLISH_ACTION_PLAN_CATALOG
    assert (
        BRAZILIAN_PORTUGUESE_ACTION_PLAN_CATALOG
        != SPANISH_ACTION_PLAN_CATALOG
    )
    assert FRENCH_ACTION_PLAN_CATALOG != SPANISH_ACTION_PLAN_CATALOG
    assert ITALIAN_ACTION_PLAN_CATALOG != SPANISH_ACTION_PLAN_CATALOG
    assert FRENCH_ACTION_PLAN_CATALOG != ITALIAN_ACTION_PLAN_CATALOG
    assert GERMAN_ACTION_PLAN_CATALOG != DUTCH_ACTION_PLAN_CATALOG
    assert GERMAN_ACTION_PLAN_CATALOG != ENGLISH_ACTION_PLAN_CATALOG
    assert DUTCH_ACTION_PLAN_CATALOG != ENGLISH_ACTION_PLAN_CATALOG
    assert RUSSIAN_ACTION_PLAN_CATALOG != UKRAINIAN_ACTION_PLAN_CATALOG
    assert RUSSIAN_ACTION_PLAN_CATALOG != ENGLISH_ACTION_PLAN_CATALOG
    assert UKRAINIAN_ACTION_PLAN_CATALOG != ENGLISH_ACTION_PLAN_CATALOG
    assert POLISH_ACTION_PLAN_CATALOG != ENGLISH_ACTION_PLAN_CATALOG
    assert JAPANESE_ACTION_PLAN_CATALOG != KOREAN_ACTION_PLAN_CATALOG
    assert JAPANESE_ACTION_PLAN_CATALOG != ENGLISH_ACTION_PLAN_CATALOG
    assert KOREAN_ACTION_PLAN_CATALOG != ENGLISH_ACTION_PLAN_CATALOG
    assert INDONESIAN_ACTION_PLAN_CATALOG != ENGLISH_ACTION_PLAN_CATALOG
    assert VIETNAMESE_ACTION_PLAN_CATALOG != ENGLISH_ACTION_PLAN_CATALOG
    assert THAI_ACTION_PLAN_CATALOG != ENGLISH_ACTION_PLAN_CATALOG
    assert INDONESIAN_ACTION_PLAN_CATALOG != VIETNAMESE_ACTION_PLAN_CATALOG
    assert INDONESIAN_ACTION_PLAN_CATALOG != THAI_ACTION_PLAN_CATALOG
    assert VIETNAMESE_ACTION_PLAN_CATALOG != THAI_ACTION_PLAN_CATALOG
    assert TURKISH_ACTION_PLAN_CATALOG != ENGLISH_ACTION_PLAN_CATALOG
    assert SWAHILI_ACTION_PLAN_CATALOG != ENGLISH_ACTION_PLAN_CATALOG
    assert TURKISH_ACTION_PLAN_CATALOG != SWAHILI_ACTION_PLAN_CATALOG
    assert URDU_ACTION_PLAN_CATALOG != ENGLISH_ACTION_PLAN_CATALOG
    assert PERSIAN_ACTION_PLAN_CATALOG != ENGLISH_ACTION_PLAN_CATALOG
    assert URDU_ACTION_PLAN_CATALOG != PERSIAN_ACTION_PLAN_CATALOG
    assert HEBREW_ACTION_PLAN_CATALOG != ENGLISH_ACTION_PLAN_CATALOG
    assert HEBREW_ACTION_PLAN_CATALOG != ARABIC_ACTION_PLAN_CATALOG
    assert HEBREW_ACTION_PLAN_CATALOG != PERSIAN_ACTION_PLAN_CATALOG


def test_closed_code_catalogs_have_exact_coverage_and_order() -> None:
    assert URGENT_ACTION_ORDER == get_args(UrgentActionCode)
    assert CANDIDATE_EXPLANATION_ORDER == get_args(CandidateExplanationVariant)
    assert CANDIDATE_WARNING_ORDER == get_args(CandidateWarningVariant)

    for catalog in ACTION_PLAN_CATALOGS.values():
        expected_orders = (
            (catalog.urgent_actions, URGENT_ACTION_ORDER),
            (catalog.now_actions, NOW_ACTION_ORDER),
            (catalog.next_few_hours_actions, NEXT_FEW_HOURS_ACTION_ORDER),
            (catalog.tonight_actions, TONIGHT_ACTION_ORDER),
            (catalog.bring_items, BRING_ITEM_ORDER),
            (catalog.explanations, EXPLANATION_REASON_ORDER),
            (catalog.candidate_explanations, CANDIDATE_EXPLANATION_ORDER),
            (catalog.candidate_warnings, CANDIDATE_WARNING_ORDER),
        )
        for mapping, expected_order in expected_orders:
            assert tuple(mapping) == expected_order
            assert set(mapping) == set(expected_order)
            assert len(mapping) == len(expected_order)

    assert tuple(FIXED_LOCAL_PHRASES) == LOCAL_PHRASE_ORDER


def test_english_place_projection_text_reuses_places_constants() -> None:
    catalog = get_action_plan_catalog("en")
    projections = (
        (catalog.candidate_warnings["hours"], PLACES_HOURS_WARNING),
        (
            catalog.candidate_warnings["candidate_notice"],
            PLACES_CANDIDATE_NOTICE,
        ),
        (
            catalog.candidate_explanations["matched_candidate"],
            PLACES_MATCH_EXPLANATION,
        ),
        (
            catalog.candidate_explanations["no_candidate"],
            PLACES_EMPTY_EXPLANATION,
        ),
    )
    for catalog_value, places_value in projections:
        assert catalog_value is places_value
        assert catalog_value.encode("utf-8") == places_value.encode("utf-8")


def test_fixed_local_phrases_are_exact_and_output_locale_independent() -> None:
    assert tuple(FIXED_LOCAL_PHRASES) == LOCAL_PHRASE_ORDER
    assert dict(FIXED_LOCAL_PHRASES) == {
        "spanish_request_cool_space": (
            "es",
            "Necesito un lugar fresco, por favor.",
        ),
        "spanish_request_accessible_entry": (
            "es",
            "Necesito una entrada accesible, por favor.",
        ),
        "catalan_request_cool_space": (
            "ca",
            "Necessito un lloc fresc, si us plau.",
        ),
        "catalan_request_accessible_entry": (
            "ca",
            "Necessito una entrada accessible, si us plau.",
        ),
    }

    phrases_before = tuple(FIXED_LOCAL_PHRASES.items())
    for output_locale in SUPPORTED_OUTPUT_LOCALES:
        assert (
            get_action_plan_catalog(output_locale)
            is ACTION_PLAN_CATALOGS[output_locale]
        )
    for unsupported in ("ca", "fr-FR", "en-US", "es-ES"):
        with pytest.raises(ValueError):
            get_action_plan_catalog(unsupported)
    assert tuple(FIXED_LOCAL_PHRASES.items()) == phrases_before


def test_compatibility_aliases_resolve_to_authoritative_catalog() -> None:
    catalog = get_action_plan_catalog("en")

    assert NOW_ACTION_TEXT is catalog.now_actions
    assert NEXT_ACTION_TEXT is catalog.next_few_hours_actions
    assert TONIGHT_ACTION_TEXT is catalog.tonight_actions
    assert BRING_ITEM_TEXT is catalog.bring_items
    assert EXPLANATION_TEXT is catalog.explanations
    assert LOCAL_PHRASES is FIXED_LOCAL_PHRASES
    assert MODEL_DERIVED_POLICY_NOTICE is catalog.policy_notice
    assert NORMAL_PLAN_NOTICE is catalog.normal_notice
    assert HOURS_WARNING is catalog.candidate_warnings["hours"]
    assert CANDIDATE_NOTICE is catalog.candidate_warnings["candidate_notice"]
    assert DISTANCE_NOTICE is catalog.candidate_warnings["distance"]
    assert HOURS_REACHABILITY_NOTICE is catalog.candidate_warnings["reachability"]
    assert MATCH_EXPLANATION is catalog.candidate_explanations["matched_candidate"]
    assert EMPTY_EXPLANATION is catalog.candidate_explanations["no_candidate"]
    assert (
        MOVEMENT_PROHIBITED_EXPLANATION
        is catalog.candidate_explanations["movement_prohibited"]
    )
    assert (
        TRAVEL_COMPATIBILITY_UNPROVEN_EXPLANATION
        is catalog.candidate_explanations["unresolved_travel_compatibility"]
    )
    assert TRAVEL_COMPATIBILITY_UNPROVEN_NOTICE is catalog.unresolved_travel_notice
    assert URGENT_MEDICAL_NOTICE is catalog.urgent_actions[
        "do_not_use_shelter_as_medical_substitute"
    ]
    assert URGENT_NO_PLAN_NOTICE is catalog.urgent_notices[1]
    assert tuple(source.heatrelay_rule for source in POLICY_SOURCES) == (
        catalog.policy_rules
    )


def test_characterized_english_catalog_digest_is_unchanged() -> None:
    canonical = _canonical_catalog_bytes(get_action_plan_catalog("en"))

    assert len(canonical) == ENGLISH_CATALOG_BYTE_LENGTH
    assert hashlib.sha256(canonical).hexdigest() == ENGLISH_CATALOG_SHA256


def test_characterized_spanish_catalog_digest_is_reviewed_and_pinned() -> None:
    canonical = _canonical_catalog_bytes(get_action_plan_catalog("es"))

    assert len(canonical) == SPANISH_CATALOG_BYTE_LENGTH
    assert hashlib.sha256(canonical).hexdigest() == SPANISH_CATALOG_SHA256


@pytest.mark.parametrize(
    ("output_locale", "expected_byte_length", "expected_sha256"),
    (
        (
            "zh-CN",
            SIMPLIFIED_CHINESE_CATALOG_BYTE_LENGTH,
            SIMPLIFIED_CHINESE_CATALOG_SHA256,
        ),
        (
            "zh-TW",
            TRADITIONAL_CHINESE_CATALOG_BYTE_LENGTH,
            TRADITIONAL_CHINESE_CATALOG_SHA256,
        ),
        (
            "hi",
            HINDI_CATALOG_BYTE_LENGTH,
            HINDI_CATALOG_SHA256,
        ),
        (
            "bn",
            BENGALI_CATALOG_BYTE_LENGTH,
            BENGALI_CATALOG_SHA256,
        ),
        (
            "ar",
            ARABIC_CATALOG_BYTE_LENGTH,
            ARABIC_CATALOG_SHA256,
        ),
        (
            "pt-BR",
            BRAZILIAN_PORTUGUESE_CATALOG_BYTE_LENGTH,
            BRAZILIAN_PORTUGUESE_CATALOG_SHA256,
        ),
        (
            "fr",
            FRENCH_CATALOG_BYTE_LENGTH,
            FRENCH_CATALOG_SHA256,
        ),
        (
            "it",
            ITALIAN_CATALOG_BYTE_LENGTH,
            ITALIAN_CATALOG_SHA256,
        ),
        (
            "de",
            GERMAN_CATALOG_BYTE_LENGTH,
            GERMAN_CATALOG_SHA256,
        ),
        (
            "nl",
            DUTCH_CATALOG_BYTE_LENGTH,
            DUTCH_CATALOG_SHA256,
        ),
        (
            "ru",
            RUSSIAN_CATALOG_BYTE_LENGTH,
            RUSSIAN_CATALOG_SHA256,
        ),
        (
            "uk",
            UKRAINIAN_CATALOG_BYTE_LENGTH,
            UKRAINIAN_CATALOG_SHA256,
        ),
        (
            "pl",
            POLISH_CATALOG_BYTE_LENGTH,
            POLISH_CATALOG_SHA256,
        ),
        (
            "ja",
            JAPANESE_CATALOG_BYTE_LENGTH,
            JAPANESE_CATALOG_SHA256,
        ),
        (
            "ko",
            KOREAN_CATALOG_BYTE_LENGTH,
            KOREAN_CATALOG_SHA256,
        ),
        (
            "id",
            INDONESIAN_CATALOG_BYTE_LENGTH,
            INDONESIAN_CATALOG_SHA256,
        ),
        (
            "vi",
            VIETNAMESE_CATALOG_BYTE_LENGTH,
            VIETNAMESE_CATALOG_SHA256,
        ),
        (
            "th",
            THAI_CATALOG_BYTE_LENGTH,
            THAI_CATALOG_SHA256,
        ),
        (
            "tr",
            TURKISH_CATALOG_BYTE_LENGTH,
            TURKISH_CATALOG_SHA256,
        ),
        (
            "sw",
            SWAHILI_CATALOG_BYTE_LENGTH,
            SWAHILI_CATALOG_SHA256,
        ),
        (
            "ur",
            URDU_CATALOG_BYTE_LENGTH,
            URDU_CATALOG_SHA256,
        ),
        (
            "fa",
            PERSIAN_CATALOG_BYTE_LENGTH,
            PERSIAN_CATALOG_SHA256,
        ),
        (
            "he",
            HEBREW_CATALOG_BYTE_LENGTH,
            HEBREW_CATALOG_SHA256,
        ),
    ),
)
def test_characterized_localized_catalog_digests_are_reviewed_and_pinned(
    output_locale: str,
    expected_byte_length: int,
    expected_sha256: str,
) -> None:
    canonical = _canonical_catalog_bytes(get_action_plan_catalog(output_locale))

    assert len(canonical) == expected_byte_length
    assert hashlib.sha256(canonical).hexdigest() == expected_sha256


@pytest.mark.parametrize(
    ("model", "expected_sha256"),
    (
        (
            SituationExtractionResponse,
            "bd1df68c4aace18f1eef629fa7ec867e9c4e81e2e16a5484b7850ba2986713d0",
        ),
        (
            WeatherContextResponse,
            "e9b78779e87b89801a69be6fb41cbef2b4498a9c2dafaefed7172a6714ef5c7d",
        ),
        (
            WeatherSource,
            "19377e86f746d9fcc43047f3bdfff37d8d3a22d41282d29d1219c0da13b1051f",
        ),
        (
            ActionPlanRequest,
            "08a70e5005a024a86e26041ebe7c61788f97023b180968df2261ae05d310c984",
        ),
    ),
)
def test_standalone_and_request_model_json_schemas_are_unchanged(
    model: type[object],
    expected_sha256: str,
) -> None:
    assert hashlib.sha256(_canonical_schema_bytes(model)).hexdigest() == (
        expected_sha256
    )


@pytest.mark.parametrize(
    ("model", "expected_sha256"),
    (
        (
            ActionPlanSituationProjection,
            "d1fe2717ddac2c9fee791e8eb8f1ddf2b29ff773a3e24aa1adad1030310b2085",
        ),
        (
            ActionPlanWeatherProjection,
            "028959941f2a9d01da459123f6cee66485f732b411826e93a44f2670e1f92dd9",
        ),
        (
            PriorityDecision,
            "bbcc8e822d4cc164840827820d30b628e72196e7cfe176659fa9e0e9522e9f06",
        ),
        (
            HydratedGroundedPlan,
            "34dbb1118f65dad38fc03b2d50a7e0b97fb3ad11703dcf0da0a65989e3f398c9",
        ),
        (
            CandidateContext,
            "0ddcb7983763f019d6916d0f297c5bf3f454cc08a892c80df8c5a05d21a4f46c",
        ),
        (
            UrgentContact,
            "6e045d1e8e0c52a9a137f139aca2487f5fd6aad7d9c16e3c1b3ba4b69061f94e",
        ),
        (
            NormalActionPlanResponse,
            "552cc296262bd528326ef0fc767a3d8775ef07211b0398425548ce0c87f8bd9a",
        ),
        (
            UrgentActionPlanResponse,
            "39f5f56fd4e1f8d5c7e0f677f6d91faa3f8996c49f9569bdf5065079eede4f25",
        ),
    ),
)
def test_action_plan_model_json_schemas_match_reviewed_projection_contract(
    model: type[object],
    expected_sha256: str,
) -> None:
    assert hashlib.sha256(_canonical_schema_bytes(model)).hexdigest() == (
        expected_sha256
    )
