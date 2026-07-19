"""Deterministic Vietnamese action-plan output catalog."""

from types import MappingProxyType

from backend.app.action_plan_catalogs import ActionPlanCatalog


VIETNAMESE_ACTION_PLAN_CATALOG = ActionPlanCatalog(
    policy_notice=(
        "HeatRelay áp dụng các quy tắc kinh nghiệm minh bạch của chính sách "
        "Barcelona cho các dữ kiện tình huống có phạm vi giới hạn và, với các "
        "trường hợp không khẩn cấp, cho thông tin bối cảnh thời tiết được suy ra "
        "từ mô hình. Điều này không chứng minh rằng cảnh báo chính thức hoặc tình "
        "trạng khẩn cấp đã được kích hoạt."
    ),
    policy_rules=(
        (
            "Chỉ sử dụng các ngưỡng ban ngày 34.0°C và 36.0°C đã công bố làm "
            "quy tắc kinh nghiệm có phiên bản của chính sách HeatRelay đối với "
            "nhiệt độ tối đa cùng ngày được suy ra từ mô hình, tuyệt đối không "
            "dùng làm bằng chứng về việc chính quyền thành phố đã kích hoạt cảnh "
            "báo."
        ),
        (
            "Giữ lại cảnh báo kiểm tra giờ mở cửa và tuyệt đối không đưa nơi trú "
            "ẩn khí hậu ra làm phương án thay thế cho việc chăm sóc y tế."
        ),
        (
            "Một triệu chứng cảnh báo trong phạm vi giới hạn được báo cáo rõ "
            "ràng sẽ chuyển sang nhánh khẩn cấp và bỏ qua quy trình thông thường "
            "về thời tiết, địa điểm và tạo kế hoạch."
        ),
        (
            "Chuyển mọi giá trị trong danh mục đóng hiện tại về các triệu chứng "
            "cảnh báo có phạm vi giới hạn đến nội dung liên hệ 112 cố định do "
            "backend quản lý."
        ),
        (
            "Giữ cho kết quả mang tính thông tin và có tính xác định; không chẩn "
            "đoán hoặc tạo điểm rủi ro y tế. Chỉ đề xuất làm mát bằng quạt đã "
            "được báo cáo khi cả nhiệt độ hiện tại và nhiệt độ tối đa cùng ngày "
            "đều thấp hơn nghiêm ngặt so với 40.0°C."
        ),
    ),
    situation_notice=(
        "Đầu ra này là bản tóm tắt có cấu trúc về thông tin được báo cáo một "
        "cách rõ ràng. Đây không phải là lời khuyên y tế, đánh giá tình trạng "
        "khẩn cấp hay kế hoạch hành động."
    ),
    weather_notice=(
        "Đây là thông tin bối cảnh thời tiết được suy ra từ mô hình của "
        "Open-Meteo, không phải cảnh báo nắng nóng chính thức."
    ),
    urgent_contact_instruction=(
        "Hãy gọi 112 ngay để được trợ giúp khẩn cấp."
    ),
    urgent_actions=MappingProxyType(
        {
            "contact_emergency_service_now": "Hãy gọi 112 ngay.",
            "do_not_use_shelter_as_medical_substitute": (
                "Các nơi trú ẩn khí hậu không thể thay thế việc chăm sóc y tế."
            ),
        }
    ),
    urgent_notices=(
        "Các nơi trú ẩn khí hậu không thể thay thế việc chăm sóc y tế.",
        (
            "Vì một triệu chứng cảnh báo trong phạm vi giới hạn đã được báo cáo "
            "rõ ràng, HeatRelay đã không truy xuất thông tin thời tiết hoặc địa "
            "điểm và không yêu cầu GPT-5.6 tạo kế hoạch."
        ),
    ),
    now_actions=MappingProxyType(
        {
            "move_to_cooler_space": (
                "Hãy di chuyển đến nơi mát nhất hiện có tại chính vị trí của bạn.",
                (
                    "Giảm tiếp xúc với nhiệt là hữu ích mà không giả định rằng "
                    "bạn có thể di chuyển đến nơi khác."
                ),
            ),
            "reduce_physical_effort": (
                "Tạm thời hãy giảm hoạt động thể chất.",
                "Giảm gắng sức có thể giảm tải nhiệt bổ sung.",
            ),
            "drink_water": (
                "Hãy uống nước đều đặn nếu bạn có thể làm vậy một cách an toàn.",
                "Bổ sung nước là biện pháp an toàn tiêu chuẩn khi trời nóng.",
            ),
            "use_available_home_cooling": (
                "Hãy sử dụng thiết bị làm mát mà bạn đã báo cáo rõ ràng là mình có.",
                "Hành động này chỉ dựa vào khả năng làm mát đã được báo cáo.",
            ),
            "contact_support_person": (
                "Hãy liên hệ với một người đáng tin cậy trước khi cân nhắc di chuyển.",
                (
                    "Các hạn chế đã báo cáo cho thấy việc di chuyển một mình "
                    "không phù hợp."
                ),
            ),
            "remain_at_current_location": (
                (
                    "Hãy ở lại vị trí hiện tại và thực hiện các bước làm mát "
                    "không cần di chuyển."
                ),
                "Một hạn chế đã báo cáo hiện không cho phép rời đi.",
            ),
            "travel_to_selected_place": (
                (
                    "Chỉ cân nhắc địa điểm ứng viên đã chọn và được xác minh là "
                    "đang mở cửa sau khi kiểm tra giờ mở cửa hiện tại."
                ),
                (
                    "Địa điểm đó nằm trong tập hợp ứng viên được backend phê "
                    "duyệt cho yêu cầu này."
                ),
            ),
        }
    ),
    next_few_hours_actions=MappingProxyType(
        {
            "keep_drinking_water": (
                "Hãy chuẩn bị sẵn nước và uống đều đặn nếu điều đó an toàn với bạn.",
                "Duy trì bổ sung nước là biện pháp an toàn tiêu chuẩn khi trời nóng.",
            ),
            "stay_in_cool_space": (
                (
                    "Trong vài giờ tới, hãy ở trong không gian phù hợp và mát "
                    "nhất hiện có."
                ),
                "Điều này làm giảm việc tiếp tục tiếp xúc với nhiệt.",
            ),
            "check_updated_weather": (
                "Hãy kiểm tra thông tin thời tiết mới nhất từ nguồn đáng tin cậy.",
                "Điều kiện được suy ra từ mô hình có thể thay đổi sau phản hồi này.",
            ),
            "check_on_household_members": (
                (
                    "Hãy kiểm tra những người trong gia đình có thể cần trợ giúp "
                    "để giữ mát."
                ),
                "Hành động này chỉ áp dụng như một lần kiểm tra gia đình nói chung.",
            ),
            "prepare_for_tonight": (
                "Hãy chuẩn bị chỗ ngủ mát nhất hiện có trước buổi tối.",
                "Chuẩn bị trước có thể giúp môi trường ban đêm an toàn hơn.",
            ),
        }
    ),
    tonight_actions=MappingProxyType(
        {
            "ventilate_when_outside_is_cooler": (
                "Chỉ thông gió khi không khí bên ngoài mát hơn bên trong.",
                (
                    "Điều này tránh giả định rằng mở cửa sổ lúc nào cũng giúp "
                    "làm mát."
                ),
            ),
            "sleep_in_coolest_available_room": (
                "Hãy ngủ trong căn phòng phù hợp và mát nhất hiện có.",
                "Điều này làm giảm tiếp xúc với nhiệt vào ban đêm.",
            ),
            "keep_water_nearby": (
                "Hãy để nước gần bạn qua đêm nếu điều đó an toàn với bạn.",
                "Điều này giúp việc duy trì bổ sung nước dễ dàng hơn.",
            ),
            "check_updated_weather_tonight": (
                "Hãy kiểm tra thông tin thời tiết ban đêm mới nhất từ nguồn đáng tin cậy.",
                (
                    "Kế hoạch này không dự đoán các điều kiện về sau hoặc cảnh "
                    "báo chính thức."
                ),
            ),
        }
    ),
    bring_items=MappingProxyType(
        {
            "water": "Nước uống",
            "phone": "Điện thoại đã sạc",
            "keys": "Chìa khóa",
            "light_clothing": "Quần áo nhẹ",
        }
    ),
    explanations=MappingProxyType(
        {
            "forecast_at_or_above_36c": (
                "Nhiệt độ tối đa cùng ngày được suy ra từ mô hình đạt ngưỡng "
                "chính sách HeatRelay là 36.0°C."
            ),
            "forecast_at_or_above_34c": (
                "Nhiệt độ tối đa cùng ngày được suy ra từ mô hình đạt ngưỡng "
                "chính sách HeatRelay là 34.0°C."
            ),
            "reported_vulnerability": (
                "Hồ sơ được trích xuất có một yếu tố dễ bị tổn thương đã được "
                "báo cáo rõ ràng."
            ),
            "no_home_cooling": (
                "Hồ sơ được trích xuất báo cáo rõ ràng rằng nhà không có hệ "
                "thống làm mát."
            ),
            "temporary_or_unsheltered_housing": (
                "Hồ sơ được trích xuất báo cáo rõ ràng về chỗ ở tạm thời hoặc "
                "không có nơi trú ẩn."
            ),
            "reported_mobility_constraint": (
                "Hồ sơ được trích xuất có một hạn chế về khả năng di chuyển đã "
                "được báo cáo rõ ràng."
            ),
            "verified_open_candidate": (
                "Địa điểm đã chọn được xác minh là đang mở cửa tại thời điểm "
                "đánh giá do máy chủ xác định."
            ),
            "travel_support_required": (
                "Hồ sơ được trích xuất báo cáo rõ ràng rằng không thể di chuyển "
                "một mình."
            ),
            "movement_prohibited": (
                "Hồ sơ được trích xuất báo cáo rõ ràng rằng hiện không thể rời đi."
            ),
            "unresolved_travel_constraint": (
                "Không thể xác minh khả năng di chuyển ngay từ các dữ kiện về "
                "thời gian hoặc khả năng di chuyển được lưu giữ."
            ),
            "baseline_monitoring": (
                "Không có quy tắc chính sách HeatRelay nào có mức ưu tiên cao "
                "hơn phù hợp với các đầu vào có phạm vi giới hạn."
            ),
        }
    ),
    normal_notice=(
        "Đây là kế hoạch mang tính thông tin về an toàn khi trời nóng, không "
        "phải lời khuyên y tế, tuyến đường hay sự bảo đảm rằng một địa điểm sẽ "
        "tiếp tục khả dụng."
    ),
    candidate_explanations=MappingProxyType(
        {
            "matched_candidate": (
                "Đã chọn ứng viên đủ điều kiện gần nhất được xác minh là đang "
                "mở cửa tại thời điểm đánh giá do máy chủ xác định."
            ),
            "no_candidate": (
                "Không có ứng viên đủ điều kiện nào trong khoảng cách được yêu "
                "cầu được xác minh là đang mở cửa tại thời điểm đánh giá do máy "
                "chủ xác định."
            ),
            "movement_prohibited": (
                "Không trả về ứng viên di chuyển vì tình huống đã chuẩn hóa báo "
                "cáo rõ ràng rằng hiện không thể rời đi."
            ),
            "unresolved_travel_compatibility": (
                "Không trả về ứng viên để di chuyển ngay vì không thể chứng minh "
                "khả năng tương thích với hạn chế về thời gian hoặc khả năng di "
                "chuyển đã được báo cáo rõ ràng từ các dữ kiện do máy chủ quản "
                "lý được lưu giữ."
            ),
        }
    ),
    candidate_warnings=MappingProxyType(
        {
            "hours": (
                "Hãy kiểm tra giờ mở cửa hiện tại từ nguồn chính thức trước khi "
                "đi. Việc có tên trong danh sách không bảo đảm khả dụng."
            ),
            "candidate_notice": (
                "Đây là các địa điểm ứng viên dựa trên dữ kiện, được backend phê "
                "duyệt, không phải là khuyến nghị y tế."
            ),
            "distance": (
                "Khoảng cách chỉ là ước tính theo đường thẳng; HeatRelay không "
                "cung cấp tuyến đường hoặc ước tính thời gian di chuyển."
            ),
            "reachability": (
                "Việc một địa điểm mở cửa tại thời điểm đánh giá không chứng "
                "minh rằng có thể đến đó trước giờ đóng cửa."
            ),
        }
    ),
    unresolved_travel_notice=(
        "Không đề xuất di chuyển ngay vì không thể xác minh khả năng tương thích "
        "với hạn chế về thời gian hoặc khả năng di chuyển đã được báo cáo rõ ràng."
    ),
)


__all__ = ("VIETNAMESE_ACTION_PLAN_CATALOG",)
