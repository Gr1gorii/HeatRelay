"""Deterministic Korean action-plan output catalog."""

from types import MappingProxyType

from backend.app.action_plan_catalogs import ActionPlanCatalog


KOREAN_ACTION_PLAN_CATALOG = ActionPlanCatalog(
    policy_notice=(
        "HeatRelay는 범위가 한정된 상황 사실과, 비긴급 사례에서는 모델에서 산출된 "
        "날씨 맥락 정보에 투명한 Barcelona 정책 휴리스틱을 적용합니다. 이는 공식 "
        "경보나 응급 상황이 발령되었음을 입증하지 않습니다."
    ),
    policy_rules=(
        (
            "공개된 주간 기준값 34.0°C와 36.0°C는 같은 날의 모델 산출 최고 기온에 "
            "적용하는 버전이 지정된 HeatRelay 정책 휴리스틱으로만 사용하고, 지방 "
            "당국의 발령을 입증하는 근거로는 절대 사용하지 마세요."
        ),
        (
            "운영 시간을 확인하라는 경고를 유지하고 기후 쉼터를 의료 처치의 "
            "대체 수단으로 절대 제시하지 마세요."
        ),
        (
            "범위가 한정된 경고 증상이 명시적으로 보고되면 긴급 분기로 전환하고 "
            "일반적인 날씨, 장소 및 계획 생성 절차를 건너뜁니다."
        ),
        (
            "현재의 범위가 한정된 경고 증상 폐쇄형 목록에 있는 모든 값을 백엔드가 "
            "관리하는 고정 112 연락처 정보로 연결하세요."
        ),
        (
            "결과는 정보 제공 목적과 결정론적 특성을 유지하세요. 진단하거나 의료 "
            "위험 점수를 만들지 마세요. 보고된 선풍기만을 이용한 냉방은 현재 기온과 "
            "같은 날의 최고 기온이 모두 40.0°C보다 엄격히 낮을 때만 제안하세요."
        ),
    ),
    situation_notice=(
        "이 출력은 명시적으로 보고된 정보를 구조화한 요약입니다. 의료 조언, 응급 "
        "상황 평가 또는 행동 계획이 아닙니다."
    ),
    weather_notice=(
        "이는 Open-Meteo 모델에서 산출된 날씨 맥락 정보이며 공식 폭염 경보가 "
        "아닙니다."
    ),
    urgent_contact_instruction=(
        "긴급 지원을 받으려면 지금 112로 전화하세요."
    ),
    urgent_actions=MappingProxyType(
        {
            "contact_emergency_service_now": "지금 112로 전화하세요.",
            "do_not_use_shelter_as_medical_substitute": (
                "기후 쉼터는 의료 처치를 대신할 수 없습니다."
            ),
        }
    ),
    urgent_notices=(
        "기후 쉼터는 의료 처치를 대신할 수 없습니다.",
        (
            "범위가 한정된 경고 증상이 명시적으로 보고되었기 때문에 HeatRelay는 "
            "날씨나 장소 정보를 조회하지 않았고 GPT-5.6에 계획 생성을 요청하지 "
            "않았습니다."
        ),
    ),
    now_actions=MappingProxyType(
        {
            "move_to_cooler_space": (
                "이미 있는 곳에서 이용 가능한 가장 시원한 장소로 이동하세요.",
                (
                    "이동할 수 있다고 가정하지 않고도 열 노출을 줄이는 것이 도움이 "
                    "됩니다."
                ),
            ),
            "reduce_physical_effort": (
                "지금은 신체 활동을 줄이세요.",
                "활동량을 낮추면 추가적인 열 부담을 줄일 수 있습니다.",
            ),
            "drink_water": (
                "안전하게 할 수 있다면 물을 규칙적으로 마시세요.",
                "수분 섭취는 일반적인 폭염 안전 조치입니다.",
            ),
            "use_available_home_cooling": (
                "보유하고 있다고 명시적으로 보고한 냉방 장비를 사용하세요.",
                "이 조치는 보고된 냉방 이용 가능성에만 근거합니다.",
            ),
            "contact_support_person": (
                "이동을 고려하기 전에 신뢰하는 사람에게 연락하세요.",
                "보고된 제약은 혼자 이동하는 것이 적절하지 않음을 나타냅니다.",
            ),
            "remain_at_current_location": (
                "현재 위치에 머물며 이동이 필요 없는 냉방 조치를 사용하세요.",
                "보고된 제약으로 인해 현재는 그곳을 떠날 수 없습니다.",
            ),
            "travel_to_selected_place": (
                (
                    "선택된 운영 확인 후보는 현재 운영 시간을 확인한 후에만 "
                    "고려하세요."
                ),
                (
                    "해당 장소는 이 요청에서 백엔드가 승인한 후보 집합에 포함되어 "
                    "있었습니다."
                ),
            ),
        }
    ),
    next_few_hours_actions=MappingProxyType(
        {
            "keep_drinking_water": (
                "안전하다면 물을 준비해 두고 규칙적으로 마시세요.",
                "지속적인 수분 섭취는 일반적인 폭염 안전 조치입니다.",
            ),
            "stay_in_cool_space": (
                "앞으로 몇 시간은 이용 가능한 가장 시원하고 적절한 공간에서 지내세요.",
                "이렇게 하면 지속적인 열 노출을 줄일 수 있습니다.",
            ),
            "check_updated_weather": (
                "신뢰할 수 있는 출처에서 최신 날씨 정보를 확인하세요.",
                "모델에서 산출된 상태는 이 응답 이후 변경될 수 있습니다.",
            ),
            "check_on_household_members": (
                "시원하게 지내는 데 도움이 필요할 수 있는 동거인을 확인하세요.",
                "이 조치는 일반적인 가구 구성원 확인에만 적용됩니다.",
            ),
            "prepare_for_tonight": (
                "저녁 전에 이용 가능한 가장 시원한 수면 공간을 준비하세요.",
                "미리 준비하면 야간 환경을 더 안전하게 만들 수 있습니다.",
            ),
        }
    ),
    tonight_actions=MappingProxyType(
        {
            "ventilate_when_outside_is_cooler": (
                "실외 공기가 실내보다 시원할 때만 환기하세요.",
                "창문을 열면 항상 시원해진다고 가정하지 않기 위한 조치입니다.",
            ),
            "sleep_in_coolest_available_room": (
                "이용 가능한 가장 시원하고 적절한 방에서 주무세요.",
                "이렇게 하면 야간 열 노출을 줄일 수 있습니다.",
            ),
            "keep_water_nearby": (
                "안전하다면 밤새 물을 가까이 두세요.",
                "이렇게 하면 수분 섭취를 더 쉽게 유지할 수 있습니다.",
            ),
            "check_updated_weather_tonight": (
                "신뢰할 수 있는 출처에서 최신 야간 날씨 정보를 확인하세요.",
                "이 계획은 이후의 상태나 공식 경보를 예측하지 않습니다.",
            ),
        }
    ),
    bring_items=MappingProxyType(
        {
            "water": "마실 물",
            "phone": "충전된 휴대전화",
            "keys": "열쇠",
            "light_clothing": "가벼운 옷",
        }
    ),
    explanations=MappingProxyType(
        {
            "forecast_at_or_above_36c": (
                "모델에서 산출된 같은 날의 최고 기온이 HeatRelay 정책 기준값 "
                "36.0°C에 도달합니다."
            ),
            "forecast_at_or_above_34c": (
                "모델에서 산출된 같은 날의 최고 기온이 HeatRelay 정책 기준값 "
                "34.0°C에 도달합니다."
            ),
            "reported_vulnerability": (
                "추출된 프로필에 명시적으로 보고된 취약성 요인이 포함되어 있습니다."
            ),
            "no_home_cooling": (
                "추출된 프로필에 가정 내 냉방이 없다고 명시적으로 보고되어 있습니다."
            ),
            "temporary_or_unsheltered_housing": (
                "추출된 프로필에 임시 거주 또는 주거지 없음이 명시적으로 보고되어 "
                "있습니다."
            ),
            "reported_mobility_constraint": (
                "추출된 프로필에 명시적으로 보고된 이동 제약이 포함되어 있습니다."
            ),
            "verified_open_candidate": (
                "선택된 장소는 서버가 관리하는 평가 시점에 운영 중인 것으로 "
                "확인되었습니다."
            ),
            "travel_support_required": (
                "추출된 프로필에 혼자 이동할 수 없다고 명시적으로 보고되어 있습니다."
            ),
            "movement_prohibited": (
                "추출된 프로필에 현재 그곳을 떠날 수 없다고 명시적으로 보고되어 "
                "있습니다."
            ),
            "unresolved_travel_constraint": (
                "보존된 시간 또는 이동성 사실로는 즉시 이동할 수 있는지 확인하지 "
                "못했습니다."
            ),
            "baseline_monitoring": (
                "범위가 한정된 입력과 일치하는 더 높은 HeatRelay 정책 규칙이 "
                "없었습니다."
            ),
        }
    ),
    normal_notice=(
        "이는 폭염 안전을 위한 정보 제공 계획이며 의료 조언, 경로 또는 장소가 계속 "
        "이용 가능하다는 보장이 아닙니다."
    ),
    candidate_explanations=MappingProxyType(
        {
            "matched_candidate": (
                "서버가 관리하는 평가 시점에 운영 중인 것으로 확인된 가장 가까운 "
                "적격 후보를 선택했습니다."
            ),
            "no_candidate": (
                "지정된 거리 내에서 서버가 관리하는 평가 시점에 운영 중인 것으로 "
                "확인된 적격 후보가 없었습니다."
            ),
            "movement_prohibited": (
                "정규화된 상황에 현재 그곳을 떠날 수 없다고 명시적으로 보고되어 "
                "있으므로 이동 후보를 반환하지 않습니다."
            ),
            "unresolved_travel_compatibility": (
                "보존된 서버 관리 사실로는 명시적으로 보고된 시간 또는 이동성 제약과 "
                "양립할 수 있음을 입증할 수 없으므로 즉시 이동 후보를 반환하지 "
                "않습니다."
            ),
        }
    ),
    candidate_warnings=MappingProxyType(
        {
            "hours": (
                "이동 전에 공식 출처에서 현재 운영 시간을 확인하세요. 목록에 있다고 "
                "해서 이용 가능성이 보장되지는 않습니다."
            ),
            "candidate_notice": (
                "이는 사실에 기반하고 백엔드에서 승인한 후보 장소이며, 의료 권고가 "
                "아닙니다."
            ),
            "distance": (
                "거리는 직선거리 추정치일 뿐입니다. HeatRelay는 경로나 이동 시간 "
                "추정치를 제공하지 않습니다."
            ),
            "reachability": (
                "평가 시점에 장소가 운영 중이라고 해서 폐장 전에 도착할 수 있음이 "
                "입증되지는 않습니다."
            ),
        }
    ),
    unresolved_travel_notice=(
        "명시적으로 보고된 시간 또는 이동성 제약과 양립할 수 있는지 확인하지 못해 "
        "즉시 이동을 제안하지 않았습니다."
    ),
)


__all__ = ("KOREAN_ACTION_PLAN_CATALOG",)
