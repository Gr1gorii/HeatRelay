"""Deterministic Traditional Chinese action-plan output catalog."""

from types import MappingProxyType

from backend.app.action_plan_catalogs import ActionPlanCatalog


TRADITIONAL_CHINESE_ACTION_PLAN_CATALOG = ActionPlanCatalog(
    policy_notice=(
        "HeatRelay 將透明的 Barcelona 政策啟發式規則套用於範圍受限"
        "的情況事實，以及非緊急案例中根據模型推導的天氣背景資訊。這"
        "並不能證明官方警報或緊急狀態已經啟動。"
    ),
    policy_rules=(
        (
            "僅將已公布的 34.0°C 和 36.0°C 日間界線，作為 HeatRelay "
            "有版本管理的政策啟發式規則，套用於根據模型推導的當日最高"
            "溫度；絕不可將其視為市政措施已啟動的證明。"
        ),
        (
            "保留查核開放時間的警告，且絕不可將氣候庇護場所作為醫療"
            "照護的替代方案。"
        ),
        (
            "明確通報的範圍受限警示症狀會進入緊急分支，並略過一般"
            "天氣、地點與計畫產生流程。"
        ),
        (
            "將目前封閉且範圍受限的警示症狀目錄中的每個值，導向由"
            "後端固定提供的 112 聯絡內容。"
        ),
        (
            "維持結果的資訊性與確定性；不要進行診斷或建立醫療風險"
            "分數。只有在目前溫度和當日最高溫度都嚴格低於 40.0°C "
            "時，才提供已通報且僅使用風扇的降溫方式。"
        ),
    ),
    situation_notice=(
        "此輸出是對已明確陳述資訊的結構化摘要，不是醫療建議、緊急"
        "情況評估或行動計畫。"
    ),
    weather_notice=(
        "這是根據 Open-Meteo 模型推導的天氣背景資訊，並非官方高溫"
        "警告。"
    ),
    urgent_contact_instruction="立即撥打 112 尋求緊急協助。",
    urgent_actions=MappingProxyType(
        {
            "contact_emergency_service_now": "立即撥打 112。",
            "do_not_use_shelter_as_medical_substitute": (
                "氣候庇護場所不能取代醫療照護。"
            ),
        }
    ),
    urgent_notices=(
        "氣候庇護場所不能取代醫療照護。",
        (
            "由於明確通報了封閉清單中的一項警示症狀，HeatRelay 未"
            "取得天氣或地點資訊，也未要求 GPT-5.6 產生計畫。"
        ),
    ),
    now_actions=MappingProxyType(
        {
            "move_to_cooler_space": (
                "移到你目前所在位置中可用的最涼爽處。",
                "降低熱暴露很有幫助，且不預設能夠外出移動。",
            ),
            "reduce_physical_effort": (
                "目前先減少體力活動。",
                "降低活動強度可減少額外的熱負荷。",
            ),
            "drink_water": (
                "如果可以安全地喝水，請定期喝水。",
                "補充水分是標準的高溫安全措施。",
            ),
            "use_available_home_cooling": (
                "使用你明確通報可使用的降溫設備。",
                "此行動僅依據已通報的降溫資源使用情況。",
            ),
            "contact_support_person": (
                "在考慮外出移動前，先聯絡一位你信任的人。",
                "已通報的限制表示不適合獨自外出。",
            ),
            "remain_at_current_location": (
                "留在目前位置，並採取不需外出的降溫措施。",
                "一項已通報的限制目前禁止外出。",
            ),
            "travel_to_selected_place": (
                (
                    "只有在查核目前開放時間後，才考慮前往所選且已驗證"
                    "為開放的候選地點。"
                ),
                "該地點位於這次請求經後端核准的候選集合中。",
            ),
        }
    ),
    next_few_hours_actions=MappingProxyType(
        {
            "keep_drinking_water": (
                "備妥飲用水；若對你安全，請定期喝水。",
                "持續補充水分是標準的高溫安全措施。",
            ),
            "stay_in_cool_space": (
                "接下來幾小時待在可用且最涼爽的合適空間。",
                "這可減少持續的熱暴露。",
            ),
            "check_updated_weather": (
                "從可靠來源查看最新天氣資訊。",
                "根據模型推導的情況可能在此回應後改變。",
            ),
            "check_on_household_members": (
                "查看家中可能需要協助保持涼爽的人員狀況。",
                "此行動僅適用於一般的家中狀況確認。",
            ),
            "prepare_for_tonight": (
                "在傍晚前準備好可用且最涼爽的睡眠空間。",
                "預先準備可讓夜間環境更安全。",
            ),
        }
    ),
    tonight_actions=MappingProxyType(
        {
            "ventilate_when_outside_is_cooler": (
                "只有在室外空氣比室內涼爽時才通風。",
                "這可避免預設開窗一定能降溫。",
            ),
            "sleep_in_coolest_available_room": (
                "使用可用且最涼爽的合適房間睡覺。",
                "這可減少夜間的熱暴露。",
            ),
            "keep_water_nearby": (
                "若對你安全，夜間請將水放在附近。",
                "這可讓持續補充水分更容易。",
            ),
            "check_updated_weather_tonight": (
                "從可靠來源查看最新夜間天氣資訊。",
                "此計畫不會預測之後的情況或官方警告。",
            ),
        }
    ),
    bring_items=MappingProxyType(
        {
            "water": "水",
            "phone": "已充電的手機",
            "keys": "鑰匙",
            "light_clothing": "輕便衣物",
        }
    ),
    explanations=MappingProxyType(
        {
            "forecast_at_or_above_36c": (
                "根據模型推導的當日最高溫度達到 HeatRelay 政策的 "
                "36.0°C 界線。"
            ),
            "forecast_at_or_above_34c": (
                "根據模型推導的當日最高溫度達到 HeatRelay 政策的 "
                "34.0°C 界線。"
            ),
            "reported_vulnerability": (
                "擷取的個人概況包含一項明確通報的脆弱性因素。"
            ),
            "no_home_cooling": (
                "擷取的個人概況明確通報家中沒有降溫設備。"
            ),
            "temporary_or_unsheltered_housing": (
                "擷取的個人概況明確通報臨時住所或無遮蔽住所的居住"
                "狀況。"
            ),
            "reported_mobility_constraint": (
                "擷取的個人概況包含一項明確通報的行動能力限制。"
            ),
            "verified_open_candidate": (
                "所選地點已在伺服器掌控的評估時點驗證為開放。"
            ),
            "travel_support_required": (
                "擷取的個人概況明確通報無法獨自移動。"
            ),
            "movement_prohibited": (
                "擷取的個人概況明確通報目前無法離開。"
            ),
            "unresolved_travel_constraint": (
                "無法根據保留的時間或行動能力事實，驗證立即移動與"
                "限制是否相容。"
            ),
            "baseline_monitoring": (
                "範圍受限的輸入未符合任何更高層級的 HeatRelay 政策"
                "規則。"
            ),
        }
    ),
    normal_notice=(
        "這是資訊性的高溫安全規劃，不是醫療建議或路線，也不保證地點"
        "會持續可用。"
    ),
    candidate_explanations=MappingProxyType(
        {
            "matched_candidate": (
                "候選地點符合所要求的直線距離、經驗證的開放時間與必要"
                "設施條件篩選。"
            ),
            "no_candidate": (
                "此快照中的官方地點均未符合所要求的直線距離、經驗證的"
                "開放時間與必要設施條件篩選。並未虛構任何備用地點。"
            ),
            "movement_prohibited": (
                "不會傳回外出候選地點，因為正規化後的情況明確通報目前"
                "無法離開。"
            ),
            "unresolved_travel_compatibility": (
                "不會傳回立即外出的候選地點，因為無法根據伺服器保留的"
                "事實證明其與明確通報的時間或行動能力限制相容。"
            ),
        }
    ),
    candidate_warnings=MappingProxyType(
        {
            "hours": (
                "市政開放時間可能變更；出發前請查核官方來源。"
            ),
            "candidate_notice": (
                "這些是經後端核准且以事實為依據的候選地點，不是醫療"
                "建議。"
            ),
            "distance": (
                "距離僅為直線估算值；HeatRelay 不提供路線或行程時間"
                "估算。"
            ),
            "reachability": (
                "地點在評估時開放，並不能證明可在關閉前抵達。"
            ),
        }
    ),
    unresolved_travel_notice=(
        "未提供立即外出選項，因為無法驗證其與一項明確通報的時間或"
        "行動能力限制相容。"
    ),
)


__all__ = ("TRADITIONAL_CHINESE_ACTION_PLAN_CATALOG",)
