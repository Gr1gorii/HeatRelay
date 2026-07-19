"""Deterministic English action-plan output catalog."""

from types import MappingProxyType

from backend.app.action_plan_catalogs import ActionPlanCatalog
from backend.app.places import (
    CANDIDATE_NOTICE,
    EMPTY_EXPLANATION,
    HOURS_WARNING,
    MATCH_EXPLANATION,
)
from backend.app.situation import SITUATION_NOTICE
from backend.app.weather import MODEL_DERIVED_NOTICE


ENGLISH_ACTION_PLAN_CATALOG = ActionPlanCatalog(
    policy_notice=(
        "HeatRelay applies transparent Barcelona policy heuristics to bounded "
        "situation facts and, for non-urgent cases, model-derived weather "
        "context. This does not prove that an official alert or emergency has "
        "been activated."
    ),
    policy_rules=(
        (
            "Use the published 34.0°C and 36.0°C daytime boundaries only "
            "as versioned HeatRelay policy heuristics over same-day "
            "model-derived maximum temperature, never as proof of municipal "
            "activation."
        ),
        (
            "Retain the check-hours warning and never offer a climate shelter "
            "as a substitute for medical attention."
        ),
        (
            "An explicitly reported bounded warning symptom takes the urgent "
            "branch and bypasses normal weather, place, and plan generation."
        ),
        (
            "Route every value in the current closed bounded warning-symptom "
            "catalog to fixed backend-owned 112 contact content."
        ),
        (
            "Keep the result informational and deterministic; do not diagnose "
            "or create a medical risk score. Offer reported fan-only cooling "
            "only when both current and same-day maximum temperatures are "
            "strictly below 40.0°C."
        ),
    ),
    situation_notice=SITUATION_NOTICE,
    weather_notice=MODEL_DERIVED_NOTICE,
    urgent_contact_instruction="Call 112 now for emergency assistance.",
    urgent_actions=MappingProxyType(
        {
            "contact_emergency_service_now": "Call 112 now.",
            "do_not_use_shelter_as_medical_substitute": (
                "Climate shelters are not substitutes for medical attention."
            ),
        }
    ),
    urgent_notices=(
        "Climate shelters are not substitutes for medical attention.",
        (
            "Because a bounded warning symptom was explicitly reported, "
            "HeatRelay did not retrieve weather or places and did not ask "
            "GPT-5.6 for a plan."
        ),
    ),
    now_actions=MappingProxyType(
        {
            "move_to_cooler_space": (
                "Move to the coolest available spot where you already are.",
                (
                    "Reducing heat exposure is useful without assuming travel "
                    "is possible."
                ),
            ),
            "reduce_physical_effort": (
                "Reduce physical effort for now.",
                "Lower exertion can reduce additional heat load.",
            ),
            "drink_water": (
                "Drink water regularly if you can do so safely.",
                "Hydration is a standard heat-safety measure.",
            ),
            "use_available_home_cooling": (
                "Use the cooling equipment you explicitly reported having.",
                "This action relies only on reported cooling access.",
            ),
            "contact_support_person": (
                "Contact a trusted person before considering travel.",
                (
                    "The reported constraints indicate that travelling alone "
                    "is not suitable."
                ),
            ),
            "remain_at_current_location": (
                (
                    "Remain at your current location and use non-travel "
                    "cooling steps."
                ),
                "A reported constraint currently prohibits leaving.",
            ),
            "travel_to_selected_place": (
                (
                    "Consider the selected verified-open candidate only after "
                    "checking its current hours."
                ),
                (
                    "The place was in this request's backend-approved "
                    "candidate set."
                ),
            ),
        }
    ),
    next_few_hours_actions=MappingProxyType(
        {
            "keep_drinking_water": (
                "Keep water available and drink regularly if safe for you.",
                "Ongoing hydration is a standard heat-safety measure.",
            ),
            "stay_in_cool_space": (
                (
                    "Spend the next few hours in the coolest suitable space "
                    "available."
                ),
                "This reduces continued heat exposure.",
            ),
            "check_updated_weather": (
                "Check updated weather information from a reliable source.",
                "Model-derived conditions can change after this response.",
            ),
            "check_on_household_members": (
                (
                    "Check on household members who may need help staying "
                    "cool."
                ),
                "This action applies only as a general household check.",
            ),
            "prepare_for_tonight": (
                (
                    "Prepare the coolest available sleeping space before "
                    "evening."
                ),
                (
                    "Advance preparation can make the night-time environment "
                    "safer."
                ),
            ),
        }
    ),
    tonight_actions=MappingProxyType(
        {
            "ventilate_when_outside_is_cooler": (
                "Ventilate only when the outside air is cooler than indoors.",
                (
                    "This avoids assuming that opening windows is always "
                    "cooling."
                ),
            ),
            "sleep_in_coolest_available_room": (
                "Use the coolest suitable room available for sleep.",
                "This reduces night-time heat exposure.",
            ),
            "keep_water_nearby": (
                "Keep water nearby overnight if safe for you.",
                "This makes hydration easier to maintain.",
            ),
            "check_updated_weather_tonight": (
                (
                    "Check updated night-time weather information from a "
                    "reliable source."
                ),
                (
                    "This plan does not predict later conditions or official "
                    "warnings."
                ),
            ),
        }
    ),
    bring_items=MappingProxyType(
        {
            "water": "Water",
            "phone": "A charged phone",
            "keys": "Keys",
            "light_clothing": "Light clothing",
        }
    ),
    explanations=MappingProxyType(
        {
            "forecast_at_or_above_36c": (
                "The model-derived same-day maximum meets the 36.0°C "
                "HeatRelay policy boundary."
            ),
            "forecast_at_or_above_34c": (
                "The model-derived same-day maximum meets the 34.0°C "
                "HeatRelay policy boundary."
            ),
            "reported_vulnerability": (
                "The extracted profile contains an explicitly reported "
                "vulnerability factor."
            ),
            "no_home_cooling": (
                "The extracted profile explicitly reports no home cooling."
            ),
            "temporary_or_unsheltered_housing": (
                "The extracted profile explicitly reports temporary or "
                "unsheltered housing."
            ),
            "reported_mobility_constraint": (
                "The extracted profile contains an explicitly reported "
                "mobility constraint."
            ),
            "verified_open_candidate": (
                "The selected place was verified open at the server-owned "
                "evaluation instant."
            ),
            "travel_support_required": (
                "The extracted profile explicitly reports that travel alone "
                "is not possible."
            ),
            "movement_prohibited": (
                "The extracted profile explicitly reports that leaving is "
                "not currently possible."
            ),
            "unresolved_travel_constraint": (
                "Immediate travel compatibility could not be verified from "
                "the retained time or mobility facts."
            ),
            "baseline_monitoring": (
                "No higher HeatRelay policy rule matched the bounded inputs."
            ),
        }
    ),
    normal_notice=(
        "This is informational heat-safety planning, not medical advice, a "
        "route, or a guarantee that a place will remain available."
    ),
    candidate_explanations=MappingProxyType(
        {
            "matched_candidate": MATCH_EXPLANATION,
            "no_candidate": EMPTY_EXPLANATION,
            "movement_prohibited": (
                "No travel candidate is returned because the normalized "
                "situation explicitly reports that leaving is not currently "
                "possible."
            ),
            "unresolved_travel_compatibility": (
                "No immediate travel candidate is returned because "
                "compatibility with the explicitly reported time or mobility "
                "constraint cannot be proven from the retained server-owned "
                "facts."
            ),
        }
    ),
    candidate_warnings=MappingProxyType(
        {
            "hours": HOURS_WARNING,
            "candidate_notice": CANDIDATE_NOTICE,
            "distance": (
                "Distances are straight-line estimates only; HeatRelay does "
                "not provide routes or travel-time estimates."
            ),
            "reachability": (
                "A place being open at the evaluation time does not prove "
                "that it can be reached before closing."
            ),
        }
    ),
    unresolved_travel_notice=(
        "Immediate travel was not offered because compatibility with an "
        "explicitly reported time or mobility constraint could not be "
        "verified."
    ),
)


__all__ = ("ENGLISH_ACTION_PLAN_CATALOG",)
