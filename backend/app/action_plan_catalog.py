"""Compatibility and registry boundary for deterministic action-plan prose."""

from __future__ import annotations

from collections.abc import Mapping
from types import MappingProxyType

from backend.app.action_plan_catalogs import (
    CANDIDATE_EXPLANATION_ORDER,
    CANDIDATE_WARNING_ORDER,
    URGENT_ACTION_ORDER,
    ActionPlanCatalog,
    ActionText,
    BringItemCode,
    CandidateExplanationVariant,
    CandidateWarningVariant,
    FixedLocalPhrase,
    ExplanationReasonCode,
    LocalPhraseCode,
    LocalPhraseLanguage,
    NextFewHoursActionCode,
    NowActionCode,
    TonightActionCode,
    UrgentActionCode,
)
from backend.app.action_plan_catalogs.ar import ARABIC_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.en import ENGLISH_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.es import SPANISH_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.bn import BENGALI_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.de import GERMAN_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.hi import HINDI_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.fr import FRENCH_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.it import ITALIAN_ACTION_PLAN_CATALOG
from backend.app.action_plan_catalogs.id import INDONESIAN_ACTION_PLAN_CATALOG
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
from backend.app.localization import (
    OutputLocale,
    SUPPORTED_OUTPUT_LOCALES,
    require_supported_output_locale,
)


ACTION_PLAN_CATALOGS: Mapping[OutputLocale, ActionPlanCatalog] = MappingProxyType(
    {
        "en": ENGLISH_ACTION_PLAN_CATALOG,
        "es": SPANISH_ACTION_PLAN_CATALOG,
        "zh-CN": SIMPLIFIED_CHINESE_ACTION_PLAN_CATALOG,
        "zh-TW": TRADITIONAL_CHINESE_ACTION_PLAN_CATALOG,
        "hi": HINDI_ACTION_PLAN_CATALOG,
        "bn": BENGALI_ACTION_PLAN_CATALOG,
        "ar": ARABIC_ACTION_PLAN_CATALOG,
        "pt-BR": BRAZILIAN_PORTUGUESE_ACTION_PLAN_CATALOG,
        "fr": FRENCH_ACTION_PLAN_CATALOG,
        "it": ITALIAN_ACTION_PLAN_CATALOG,
        "de": GERMAN_ACTION_PLAN_CATALOG,
        "nl": DUTCH_ACTION_PLAN_CATALOG,
        "ru": RUSSIAN_ACTION_PLAN_CATALOG,
        "uk": UKRAINIAN_ACTION_PLAN_CATALOG,
        "pl": POLISH_ACTION_PLAN_CATALOG,
        "ja": JAPANESE_ACTION_PLAN_CATALOG,
        "ko": KOREAN_ACTION_PLAN_CATALOG,
        "id": INDONESIAN_ACTION_PLAN_CATALOG,
        "vi": VIETNAMESE_ACTION_PLAN_CATALOG,
        "th": THAI_ACTION_PLAN_CATALOG,
        "tr": TURKISH_ACTION_PLAN_CATALOG,
        "sw": SWAHILI_ACTION_PLAN_CATALOG,
        "ur": URDU_ACTION_PLAN_CATALOG,
        "fa": PERSIAN_ACTION_PLAN_CATALOG,
        "he": HEBREW_ACTION_PLAN_CATALOG,
    }
)
if tuple(ACTION_PLAN_CATALOGS) != SUPPORTED_OUTPUT_LOCALES:
    raise RuntimeError("action-plan catalogs must equal supported output locales")


def get_action_plan_catalog(output_locale: object) -> ActionPlanCatalog:
    """Return one exact locale catalog without normalization or fallback."""

    locale = require_supported_output_locale(output_locale)
    return ACTION_PLAN_CATALOGS[locale]


FIXED_LOCAL_PHRASES: Mapping[LocalPhraseCode, FixedLocalPhrase] = (
    MappingProxyType(
        {
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
    )
)


__all__ = (
    "ACTION_PLAN_CATALOGS",
    "ActionPlanCatalog",
    "ActionText",
    "BringItemCode",
    "CandidateExplanationVariant",
    "CandidateWarningVariant",
    "CANDIDATE_EXPLANATION_ORDER",
    "CANDIDATE_WARNING_ORDER",
    "FIXED_LOCAL_PHRASES",
    "FixedLocalPhrase",
    "ExplanationReasonCode",
    "LocalPhraseCode",
    "LocalPhraseLanguage",
    "NextFewHoursActionCode",
    "NowActionCode",
    "TonightActionCode",
    "UrgentActionCode",
    "URGENT_ACTION_ORDER",
    "get_action_plan_catalog",
)
