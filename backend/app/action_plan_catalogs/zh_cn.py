"""Deterministic Simplified Chinese action-plan output catalog."""

from types import MappingProxyType

from backend.app.action_plan_catalogs import ActionPlanCatalog


SIMPLIFIED_CHINESE_ACTION_PLAN_CATALOG = ActionPlanCatalog(
    policy_notice=(
        "HeatRelay 将透明的 Barcelona 政策启发式规则应用于限定范围的情况事实，"
        "并在非紧急情况下应用于模型推导的天气背景信息。这并不能证明官方预警"
        "或紧急状态已启动。"
    ),
    policy_rules=(
        (
            "仅将已发布的 34.0°C 和 36.0°C 白天温度界限作为有版本控制的 "
            "HeatRelay 政策启发式规则，用于同日模型推导的最高温度；绝不能将其"
            "作为市政部门启动措施的证明。"
        ),
        (
            "保留核对开放时间的警告，绝不要将气候庇护场所作为医疗救治的"
            "替代方案。"
        ),
        (
            "明确报告的范围限定警示症状会进入紧急分支，并跳过常规的天气、地点和"
            "计划生成流程。"
        ),
        (
            "将当前封闭的范围限定警示症状目录中的每个值都映射到由后端固定提供的 "
            "112 联系内容。"
        ),
        (
            "保持结果的信息性和确定性；不要进行诊断或生成医疗风险评分。仅当"
            "当前温度和同日最高温度都严格低于 40.0°C 时，才提供已报告的仅使用"
            "风扇降温方式。"
        ),
    ),
    situation_notice=(
        "此输出是对已明确陈述信息的结构化摘要，不是医疗建议、紧急情况评估或行动计划。"
    ),
    weather_notice=(
        "这是根据 Open-Meteo 模型推导的天气背景信息，并非官方高温预警。"
    ),
    urgent_contact_instruction="立即拨打 112 寻求紧急援助。",
    urgent_actions=MappingProxyType(
        {
            "contact_emergency_service_now": "立即拨打 112。",
            "do_not_use_shelter_as_medical_substitute": (
                "气候庇护场所不能替代医疗救治。"
            ),
        }
    ),
    urgent_notices=(
        "气候庇护场所不能替代医疗救治。",
        (
            "由于明确报告了封闭清单中的一项警示症状，HeatRelay 未获取天气或"
            "地点信息，也未要求 GPT-5.6 生成计划。"
        ),
    ),
    now_actions=MappingProxyType(
        {
            "move_to_cooler_space": (
                "移到你当前所在位置中最凉爽的可用地点。",
                "在不假定能够出行的情况下，减少热暴露仍然有帮助。",
            ),
            "reduce_physical_effort": (
                "暂时减少体力活动。",
                "降低用力程度可以减少额外的热负荷。",
            ),
            "drink_water": (
                "如果你能安全饮水，请定期喝水。",
                "补充水分是一项标准的防暑安全措施。",
            ),
            "use_available_home_cooling": (
                "使用你明确报告拥有的降温设备。",
                "此行动仅依据所报告的降温设备可用情况。",
            ),
            "contact_support_person": (
                "在考虑出行前联系一位你信任的人。",
                "报告的限制表明不适合独自出行。",
            ),
            "remain_at_current_location": (
                "留在当前位置，并采取无需出行的降温措施。",
                "一项已报告的限制目前禁止离开。",
            ),
            "travel_to_selected_place": (
                "只有在核对当前开放时间后，才考虑前往所选且经核实为开放的候选地点。",
                "该地点属于本次请求经后端批准的候选地点集合。",
            ),
        }
    ),
    next_few_hours_actions=MappingProxyType(
        {
            "keep_drinking_water": (
                "备好饮用水，并在对你安全的情况下定期饮水。",
                "持续补充水分是一项标准的防暑安全措施。",
            ),
            "stay_in_cool_space": (
                "接下来几小时待在可用且适宜的最凉爽空间。",
                "这可减少持续的热暴露。",
            ),
            "check_updated_weather": (
                "从可靠来源查看最新天气信息。",
                "模型推导的状况可能在此响应之后发生变化。",
            ),
            "check_on_household_members": (
                "查看可能需要帮助保持凉爽的家庭成员的情况。",
                "此行动仅作为一般性的家庭情况查看。",
            ),
            "prepare_for_tonight": (
                "在傍晚前准备好可用的最凉爽睡眠空间。",
                "提前准备可以使夜间环境更安全。",
            ),
        }
    ),
    tonight_actions=MappingProxyType(
        {
            "ventilate_when_outside_is_cooler": (
                "仅在室外空气比室内凉爽时通风。",
                "这可避免假定打开窗户总能降温。",
            ),
            "sleep_in_coolest_available_room": (
                "使用可用且适宜的最凉爽房间睡觉。",
                "这可减少夜间热暴露。",
            ),
            "keep_water_nearby": (
                "如果对你安全，请在夜间把水放在身边。",
                "这样更容易持续补充水分。",
            ),
            "check_updated_weather_tonight": (
                "从可靠来源查看最新的夜间天气信息。",
                "此计划不会预测之后的天气状况或官方预警。",
            ),
        }
    ),
    bring_items=MappingProxyType(
        {
            "water": "水",
            "phone": "一部充好电的手机",
            "keys": "钥匙",
            "light_clothing": "轻便衣物",
        }
    ),
    explanations=MappingProxyType(
        {
            "forecast_at_or_above_36c": (
                "模型推导的同日最高温度达到 HeatRelay 政策的 36.0°C 界限。"
            ),
            "forecast_at_or_above_34c": (
                "模型推导的同日最高温度达到 HeatRelay 政策的 34.0°C 界限。"
            ),
            "reported_vulnerability": (
                "提取的情况档案包含一个明确报告的脆弱性因素。"
            ),
            "no_home_cooling": (
                "提取的情况档案明确报告家中没有降温条件。"
            ),
            "temporary_or_unsheltered_housing": (
                "提取的情况档案明确报告临时住所或无住所情况。"
            ),
            "reported_mobility_constraint": (
                "提取的情况档案包含一项明确报告的行动能力限制。"
            ),
            "verified_open_candidate": (
                "所选地点经核实在由服务器确定的评估时刻处于开放状态。"
            ),
            "travel_support_required": (
                "提取的情况档案明确报告无法独自出行。"
            ),
            "movement_prohibited": (
                "提取的情况档案明确报告目前无法离开。"
            ),
            "unresolved_travel_constraint": (
                "根据所保留的时间或行动能力事实，无法核实是否适宜立即出行。"
            ),
            "baseline_monitoring": (
                "没有更高级别的 HeatRelay 政策规则与限定范围的输入相匹配。"
            ),
        }
    ),
    normal_notice=(
        "这是提供信息的防暑安全规划，不是医疗建议或路线，也不保证任何地点会一直可用。"
    ),
    candidate_explanations=MappingProxyType(
        {
            "matched_candidate": (
                "候选地点符合所要求的直线距离、经核实的开放时间和所需特征筛选条件。"
            ),
            "no_candidate": (
                "此快照中没有任何官方地点符合所要求的直线距离、经核实的开放时间和"
                "所需特征筛选条件。没有编造任何备用地点。"
            ),
            "movement_prohibited": (
                "未返回出行候选地点，因为标准化情况明确报告目前无法离开。"
            ),
            "unresolved_travel_compatibility": (
                "未返回立即出行候选地点，因为根据所保留的服务器端事实，无法证明"
                "其与明确报告的时间或行动能力限制相兼容。"
            ),
        }
    ),
    candidate_warnings=MappingProxyType(
        {
            "hours": "市政开放时间可能会变化；出行前请查看官方来源。",
            "candidate_notice": (
                "这些是经后端批准、基于事实的候选地点，并非医疗建议。"
            ),
            "distance": (
                "距离仅为直线估算；HeatRelay 不提供路线或出行时间估算。"
            ),
            "reachability": (
                "某地点在评估时处于开放状态，并不能证明可以在关闭前到达。"
            ),
        }
    ),
    unresolved_travel_notice=(
        "未建议立即出行，因为无法核实其与明确报告的时间或行动能力限制是否兼容。"
    ),
)


__all__ = ("SIMPLIFIED_CHINESE_ACTION_PLAN_CATALOG",)
