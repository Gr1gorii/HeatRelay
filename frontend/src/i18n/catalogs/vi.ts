import type { MessageCatalog } from "./en";

export const VIETNAMESE_CATALOG = {
  "app.name": "HeatRelay",

  "navigation.skipToMain": "Chuyển đến nội dung chính",
  "navigation.homeAccessibleName": "Trang chủ HeatRelay",
  "navigation.primaryAccessibleName": "Chính",
  "navigation.createPlan": "Tạo kế hoạch",
  "navigation.safetyAndPrivacy": "An toàn và quyền riêng tư",

  "header.settings": "Cài đặt",

"visualMode.label": "Chế độ hiển thị",
  "visualMode.standard": "Tiêu chuẩn",
  "visualMode.enhanced": "Hiển thị tăng cường",
  "visualMode.highContrast": "Tương phản cao",
  "visualMode.description":
    "Chế độ Hiển thị tăng cường dành cho người có thị lực kém hoặc bất kỳ ai muốn nội dung lớn hơn và rõ ràng hơn.",

  "interfaceLanguage.label": "Ngôn ngữ",
  "interfaceLanguage.description":
    "Thay đổi ngôn ngữ giao diện và kế hoạch hành động tiếp theo. Không dịch phần mô tả hoặc viết lại kế hoạch đang hiển thị.",
  "interfaceLanguage.optionWithEnglishName":
    "{{nativeName}} — {{englishName}}",

  "outputLanguage.label": "Ngôn ngữ kế hoạch hành động",
  "outputLanguage.description":
    "Chọn ngôn ngữ cho kế hoạch hành động tiếp theo. Lựa chọn này được lưu trong trình duyệt và gửi cùng yêu cầu kế hoạch hành động. Lựa chọn này không thay đổi ngôn ngữ giao diện hoặc dịch phần mô tả của bạn.",

  "languageContext.title": "Thông tin ngôn ngữ",
  "languageContext.descriptionLanguage": "Ngôn ngữ của phần mô tả",
  "languageContext.displayedLanguage": "Ngôn ngữ của kế hoạch đang hiển thị",
  "languageContext.nextLanguage": "Ngôn ngữ của kế hoạch hành động tiếp theo",
  "languageContext.supportedMismatch":
    "Phần mô tả và kế hoạch đang hiển thị dùng hai ngôn ngữ được hỗ trợ khác nhau. Hãy xem kỹ kế hoạch và chọn ngôn ngữ khác cho kế hoạch hành động nếu cần.",
  "languageContext.catalanUnavailable":
    "Không có đầu ra kế hoạch hành động bằng tiếng Catalunya. Hãy xem kỹ kế hoạch đang hiển thị và chọn một ngôn ngữ kế hoạch hành động hiện có nếu cần.",
  "languageContext.other":
    "HeatRelay không thể đối chiếu ngôn ngữ của phần mô tả với một trong các ngôn ngữ ra mắt được hỗ trợ. Hãy xem kỹ kế hoạch đang hiển thị và chọn ngôn ngữ kế hoạch hành động mà bạn hiểu rõ nhất.",
  "languageContext.unknown":
    "HeatRelay không thể xác định đáng tin cậy ngôn ngữ của phần mô tả. Hãy xem kỹ kế hoạch đang hiển thị và chọn ngôn ngữ kế hoạch hành động mà bạn hiểu rõ nhất.",
  "languageContext.nextSelection":
    "Kế hoạch đang hiển thị không được viết lại. Lựa chọn đã lưu của bạn sẽ áp dụng cho kế hoạch tiếp theo.",
  "languageContext.otherValue": "Một ngôn ngữ khác",
  "languageContext.unknownValue": "Không thể xác định",
  "languageContext.changeAction": "Thay đổi ngôn ngữ",

  "hero.eyebrow": "Thí điểm tại Barcelona · Cột mốc 5",
  "hero.title": "Từ cảnh báo nắng nóng đến bước tiếp theo an toàn.",
  "hero.introduction":
    "Mô tả một tình huống nắng nóng và HeatRelay sẽ yêu cầu backend hiện có tạo một kế hoạch hành động duy nhất dựa trên dữ liệu cho Barcelona bằng tọa độ demo cố định.",
  "hero.action": "Tạo kế hoạch cho Barcelona",

  "release.kicker": "Bản phát hành hiện tại",
  "release.badge": "Bản demo Barcelona",
  "release.title": "Một quy trình do máy chủ quản lý",
  "release.description":
    "Trình duyệt chỉ gửi mô tả của bạn và các cài đặt demo cố định cho Barcelona. Thời tiết, mức ưu tiên, địa điểm và việc xác thực dữ kiện vẫn nằm ở backend.",
  "release.actionPlanApiLabel": "API kế hoạch hành động",
  "release.actionPlanApiValue": "Điểm cuối có cùng nguồn",
  "release.demoLocationLabel": "Vị trí demo",
  "release.demoLocationValue": "Điểm cố định tại Barcelona",
  "release.browserLocationLabel": "Vị trí trình duyệt",
  "release.browserLocationValue": "Chưa khả dụng",

  "form.eyebrow": "Bản demo Barcelona",
  "form.title": "Tạo kế hoạch hành động ứng phó nắng nóng",
  "form.introduction":
    "Chỉ chia sẻ các chi tiết tình huống cần thiết để cá nhân hóa một kế hoạch có phạm vi giới hạn và được backend xác thực. Mỗi lần gửi chỉ tạo một yêu cầu.",
  "form.privacyTitle": "Quyền riêng tư và chi tiết bản demo",
  "form.privacyDescription":
    "Mô tả của bạn được gửi từ phía máy chủ đến OpenAI để GPT-5.6 xử lý. HeatRelay không chủ ý lưu trữ hoặc ghi nhật ký văn bản thô; chính sách xử lý dữ liệu của nhà cung cấp vẫn có thể được áp dụng.",
  "form.identityWarning":
    "Văn bản được gửi đến OpenAI; HeatRelay không chủ ý lưu hoặc ghi nhật ký văn bản gốc. Không cung cấp tên, thông tin liên hệ hoặc địa chỉ. Tọa độ demo Barcelona cố định. Đây không phải lời khuyên y tế hay trợ giúp khẩn cấp.",
  "form.situationLabel": "Mô tả tình huống nắng nóng",
  "form.characterCount": "{{currentCount}} / {{limit}} ký tự",
  "form.characterCountOverLimit":
    "{{currentCount}} / {{limit}} ký tự — rút ngắn {{overLimitCount}} ký tự",
  "form.situationHint":
    "Mô tả ngắn gọn tuổi, khả năng tiếp cận nơi làm mát, khả năng di chuyển, thời điểm và triệu chứng nếu có liên quan.",
  "form.demoButton": "Tải bản demo Barcelona",
  "form.submitButton": "Tạo kế hoạch hành động ứng phó nắng nóng của tôi",
  "form.submittingButton": "Đang tạo kế hoạch của bạn…",
  "form.boundaryNote":
    "MVP này sử dụng tọa độ demo cố định tại Barcelona. Vị trí trình duyệt chưa khả dụng. Khoảng cách là ước tính theo đường thẳng; HeatRelay không phải là lời khuyên y tế hoặc hướng dẫn khẩn cấp.",
  "form.demoText":
    "Tôi 69 tuổi, sống một mình, không có điều hòa, đi lại chậm và không nói được tiếng Tây Ban Nha.",

  "scenario.heading": "Chúng tôi có thể giúp gì?",
  "scenario.selfTitle": "Tôi đang quá nóng",
  "scenario.selfDescription": "Tạo kế hoạch hành động cá nhân",
  "scenario.someoneTitle": "Giúp một người thân cận",
  "scenario.someoneDescription": "Tạo kế hoạch cho người khác",
  "scenario.placeTitle": "Tìm nơi mát mẻ gần đây",
  "scenario.placeDescription": "Hiển thị trợ giúp đã xác minh gần nhất",
  "scenario.nearestHelp": "Trợ giúp gần nhất",
  "scenario.importantNow": "Quan trọng lúc này",

  "validation.empty": "Hãy mô tả tình huống trước khi tạo kế hoạch.",
  "validation.overLimit": "Nội dung mô tả quá dài. Hãy rút ngắn văn bản.",
  "validation.serverInput": "Xem lại nội dung mô tả rồi thử lại.",

  "status.creating": "Đang tạo kế hoạch hành động của bạn.",
  "status.ready": "Kế hoạch hành động của bạn đã sẵn sàng.",
  "status.loadingDetail":
    "Đang kiểm tra tình huống, thời tiết và các địa điểm ứng viên đã được xác minh…",

  "error.malformedTitle": "Phản hồi không khả dụng",
  "error.malformedMessage": "Không thể hiển thị phản hồi một cách an toàn.",
  "error.unavailableTitle": "Kế hoạch hành động tạm thời không khả dụng",
  "error.unavailableMessage":
    "Kế hoạch hành động tạm thời không khả dụng. Vui lòng thử lại sau.",
  "error.connectionTitle": "Không thể kết nối với backend",
  "error.connectionMessage":
    "Không thể kết nối với backend. Hãy kiểm tra xem các dịch vụ cục bộ có đang chạy hay không.",

  "priority.actNow": "Hành động ngay",
  "priority.prepareNow": "Chuẩn bị ngay",
  "priority.monitorAndPrepare": "Theo dõi và chuẩn bị",

  "result.eyebrow": "Kế hoạch hành động ứng phó nắng nóng tại Barcelona của bạn",
  "result.priorityBadge": "Mức ưu tiên: {{priority}}",
  "result.evaluatedAt": "Được đánh giá lúc {{dateTime}}",
  "result.weatherSummaryAccessibleName": "Tóm tắt thời tiết",
  "result.currentTemperature": "Nhiệt độ hiện tại",
  "result.feelsLike": "Nhiệt độ cảm nhận",
  "result.todayMaximum": "Nhiệt độ cao nhất hôm nay",
  "result.phaseNow": "Ngay bây giờ",
  "result.phaseNextFewHours": "Trong vài giờ tới",
  "result.phaseTonight": "Tối nay",
  "result.bringItemsTitle": "Mang theo",
  "result.explanationTitle": "Lý do cho kế hoạch này",
  "result.localPhraseTitle": "Một câu nói bằng ngôn ngữ địa phương",
  "result.localPhraseCatalan": "Tiếng Catalan",
  "result.localPhraseSpanish": "Tiếng Tây Ban Nha",
  "result.noPlaceTitle": "Không có địa điểm đã xác minh nào được chọn",
  "result.noticesTitle": "Thông báo về an toàn và thông tin",

  "place.backendApprovedLabel": "Địa điểm ứng viên được backend phê duyệt",
  "place.distanceLabel": "Khoảng cách",
  "place.closesLabel": "Đóng cửa lúc",
  "place.accessibilityLabel": "Khả năng tiếp cận",
  "place.lastCheckedLabel": "Kiểm tra lần cuối",
  "place.featuresTitle": "Tiện ích đã xác minh",
  "place.noFeatures": "Không có tiện ích bổ sung nào đã được xác minh.",
  "place.linksAccessibleName": "Liên kết chính thức của địa điểm",
  "place.informationLink": "Thông tin chính thức",
  "place.sourceLink": "Nguồn chính thức",
  "place.mapLink": "Mở tuyến đường trong Google Maps",
  "place.cautionsAccessibleName": "Lưu ý về địa điểm",
  "place.addressUnavailable": "Thông tin địa chỉ không khả dụng",
  "place.accessibilityConfirmed": "Nguồn đã xác nhận khả năng tiếp cận",
  "place.accessibilityUnavailable":
    "Nguồn cho biết không thể tiếp cận địa điểm này",
  "place.accessibilityUnknown": "Chưa rõ tình trạng tiếp cận",

  "feature.indoorSpace": "Không gian trong nhà",
  "feature.potableWater": "Nước uống",
  "feature.toilets": "Nhà vệ sinh",
  "feature.microShelter": "Điểm trú ẩn nhỏ",
  "feature.petsAllowed": "Cho phép vật nuôi",

  "feature.confirmed": "Đã xác nhận",
  "feature.unavailable": "Không được ghi là có sẵn",
  "feature.unknown": "Chưa xác nhận",

  "distance.straightLine": "{{distance}} theo đường thẳng",

  "urgent.badge": "Khẩn cấp · hành động ngay lập tức",
  "urgent.eyebrow": "Kết quả an toàn tức thời",
  "urgent.title": "Trợ giúp khẩn cấp",
  "urgent.sourceLink": "Hướng dẫn chính thức về 112",

  "trust.eyebrow": "Giới hạn tin cậy",
  "trust.title": "Hữu ích nhưng không phóng đại mức độ chắc chắn.",
  "trust.safetyLabel": "An toàn",
  "trust.safetyTitle": "Thông tin, không phải lời khuyên y tế",
  "trust.safetyDescription":
    "Dữ liệu thời tiết được tạo từ mô hình, không phải cảnh báo nắng nóng chính thức. Cần kiểm tra địa điểm, giờ mở cửa, khoảng cách theo đường thẳng và khả năng đi đến đó trước khi đi. Đầu ra khẩn cấp sử dụng nội dung cố định do backend quản lý.",
  "trust.privacyLabel": "Quyền riêng tư",
  "trust.privacyTitle": "Không cung cấp thông tin nhận dạng",
  "trust.privacyDescription":
    "Văn bản tình huống không được lưu trong bộ nhớ trình duyệt. Các lựa chọn rõ ràng về chế độ hiển thị và ngôn ngữ được lưu cục bộ. Chỉ mã ngôn ngữ đã chọn được đưa vào yêu cầu kế hoạch hành động; chế độ hiển thị không được đưa vào. HeatRelay không sử dụng công cụ phân tích, cookie, tham số URL hoặc định vị địa lý trong bản demo này.",

  "footer.description": "Bản demo Barcelona · Tọa độ cố định",

  "metadata.title": "HeatRelay · Nền tảng thí điểm tại Barcelona",
  "metadata.description":
    "HeatRelay là dự án ưu tiên Barcelona, đang được xây dựng để biến cảnh báo nắng nóng thành các bước tiếp theo an toàn.",
} as const satisfies MessageCatalog;
