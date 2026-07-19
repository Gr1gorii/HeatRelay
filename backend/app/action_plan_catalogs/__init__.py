"""Shared types and canonical orders for deterministic action-plan catalogs."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from typing import Literal

from backend.app.grounded_plan import (
    BringItemCode,
    ExplanationReasonCode,
    LocalPhraseCode,
    NextFewHoursActionCode,
    NowActionCode,
    TonightActionCode,
)


UrgentActionCode = Literal[
    "contact_emergency_service_now",
    "do_not_use_shelter_as_medical_substitute",
]
CandidateExplanationVariant = Literal[
    "matched_candidate",
    "no_candidate",
    "movement_prohibited",
    "unresolved_travel_compatibility",
]
CandidateWarningVariant = Literal[
    "hours",
    "candidate_notice",
    "distance",
    "reachability",
]
LocalPhraseLanguage = Literal["es", "ca"]
ActionText = tuple[str, str]
FixedLocalPhrase = tuple[LocalPhraseLanguage, str]

URGENT_ACTION_ORDER: tuple[UrgentActionCode, ...] = (
    "contact_emergency_service_now",
    "do_not_use_shelter_as_medical_substitute",
)
CANDIDATE_EXPLANATION_ORDER: tuple[CandidateExplanationVariant, ...] = (
    "matched_candidate",
    "no_candidate",
    "movement_prohibited",
    "unresolved_travel_compatibility",
)
CANDIDATE_WARNING_ORDER: tuple[CandidateWarningVariant, ...] = (
    "hours",
    "candidate_notice",
    "distance",
    "reachability",
)


@dataclass(frozen=True, slots=True)
class ActionPlanCatalog:
    """One locale's complete set of backend-authored action-plan prose."""

    policy_notice: str
    policy_rules: tuple[str, ...]
    situation_notice: str
    weather_notice: str
    urgent_contact_instruction: str
    urgent_actions: Mapping[UrgentActionCode, str]
    urgent_notices: tuple[str, ...]
    now_actions: Mapping[NowActionCode, ActionText]
    next_few_hours_actions: Mapping[NextFewHoursActionCode, ActionText]
    tonight_actions: Mapping[TonightActionCode, ActionText]
    bring_items: Mapping[BringItemCode, str]
    explanations: Mapping[ExplanationReasonCode, str]
    normal_notice: str
    candidate_explanations: Mapping[CandidateExplanationVariant, str]
    candidate_warnings: Mapping[CandidateWarningVariant, str]
    unresolved_travel_notice: str


__all__ = (
    "ActionPlanCatalog",
    "ActionText",
    "BringItemCode",
    "CandidateExplanationVariant",
    "CandidateWarningVariant",
    "CANDIDATE_EXPLANATION_ORDER",
    "CANDIDATE_WARNING_ORDER",
    "FixedLocalPhrase",
    "ExplanationReasonCode",
    "LocalPhraseCode",
    "LocalPhraseLanguage",
    "NextFewHoursActionCode",
    "NowActionCode",
    "TonightActionCode",
    "UrgentActionCode",
    "URGENT_ACTION_ORDER",
)
