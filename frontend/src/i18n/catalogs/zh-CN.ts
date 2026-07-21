import type { MessageCatalog } from "./en";

export const SIMPLIFIED_CHINESE_CATALOG = {
  "app.name": "HeatRelay",

  "navigation.skipToMain": "跳到主要内容",
  "navigation.homeAccessibleName": "HeatRelay 主页",
  "navigation.primaryAccessibleName": "主要导航",
  "navigation.createPlan": "创建计划",
  "navigation.safetyAndPrivacy": "安全与隐私",

  "header.settings": "设置",

"visualMode.label": "视觉模式",
  "visualMode.standard": "标准",
  "visualMode.enhanced": "增强可见性",
  "visualMode.highContrast": "高对比度",
  "visualMode.description":
    "增强可见性适用于低视力人士，也适用于任何偏好更大、更清晰内容的人。",

  "interfaceLanguage.label": "语言",
  "interfaceLanguage.description":
    "更改界面和下一份行动计划的语言。不会翻译您的描述，也不会改写当前显示的计划。",
  "interfaceLanguage.optionWithEnglishName":
    "{{nativeName}} — {{englishName}}",

  "outputLanguage.label": "行动计划语言",
  "outputLanguage.description":
    "选择下一份行动计划的语言。此偏好会保存在本浏览器中，并随行动计划请求发送。它不会更改界面语言，也不会翻译你的描述。",

  "languageContext.title": "语言信息",
  "languageContext.descriptionLanguage": "描述语言",
  "languageContext.displayedLanguage": "当前显示的行动计划语言",
  "languageContext.nextLanguage": "下一份行动计划的语言",
  "languageContext.supportedMismatch":
    "描述和当前显示的计划使用不同的受支持语言。请仔细查看计划，并在需要时选择另一种行动计划语言。",
  "languageContext.catalanUnavailable":
    "目前无法提供加泰罗尼亚语行动计划输出。请仔细查看当前显示的计划，并在需要时选择一种可用的行动计划语言。",
  "languageContext.other":
    "HeatRelay 无法将描述语言与其支持的启动语言之一相匹配。请仔细查看当前显示的计划，并选择您最熟悉的行动计划语言。",
  "languageContext.unknown":
    "HeatRelay 无法可靠地确定描述语言。请仔细查看当前显示的计划，并选择您最熟悉的行动计划语言。",
  "languageContext.nextSelection":
    "当前显示的计划不会被改写。您保存的选择将应用于下一份计划。",
  "languageContext.otherValue": "其他语言",
  "languageContext.unknownValue": "无法确定",
  "languageContext.changeAction": "更改语言",

  "hero.eyebrow": "Barcelona 试点 · 里程碑 5",
  "hero.title": "从高温警告到安全的下一步。",
  "hero.introduction":
    "描述高温情况后，HeatRelay 将使用固定的演示坐标，请求现有后端生成一份基于可靠信息的 Barcelona 行动计划。",
  "hero.action": "创建 Barcelona 计划",

  "release.kicker": "当前版本",
  "release.badge": "Barcelona 演示",
  "release.title": "由服务器管理的单一工作流程",
  "release.description":
    "浏览器仅发送您的描述和固定的 Barcelona 演示设置。天气、优先级、地点和事实验证均在后端处理。",
  "release.actionPlanApiLabel": "行动计划 API",
  "release.actionPlanApiValue": "同源端点",
  "release.demoLocationLabel": "演示地点",
  "release.demoLocationValue": "固定的 Barcelona 点位",
  "release.browserLocationLabel": "浏览器位置",
  "release.browserLocationValue": "不可用",

  "form.eyebrow": "Barcelona 演示",
  "form.title": "创建您的高温行动计划",
  "form.introduction":
    "仅分享个性化生成范围明确且经后端验证的计划所需的情况详情。每次提交仅发出一个请求。",
  "form.privacyTitle": "隐私和演示详情",
  "form.privacyDescription":
    "您的描述将发送到服务器端，由 OpenAI 进行 GPT-5.6 处理。HeatRelay 不会有意存储或记录原始文本；但提供商的数据处理政策仍可能适用。",
  "form.identityWarning":
    "OpenAI 会处理此文本。请勿输入姓名、联系方式或地址。使用固定的 Barcelona 演示点；这不是紧急援助。",
  "form.situationLabel": "描述高温情况",
  "form.characterCount": "{{currentCount}} / {{limit}} 个字符",
  "form.characterCountOverLimit":
    "{{currentCount}} / {{limit}} 个字符 — 请缩短 {{overLimitCount}} 个字符",
  "form.situationHint":
    "年龄 · 降温条件 · 行动能力 · 症状",
  "form.demoButton": "加载 Barcelona 演示",
  "form.submitButton": "创建我的高温行动计划",
  "form.submittingButton": "正在创建您的计划……",
  "form.boundaryNote":
    "此 MVP 使用固定的 Barcelona 演示坐标。浏览器位置尚不可用。距离为直线估算值；HeatRelay 不提供医疗或紧急情况建议。",
  "form.demoText":
    "我 69 岁，独居，没有空调，走路较慢，也不会说西班牙语。",

  "scenario.heading": "我们能怎样帮助您？",
  "scenario.selfTitle": "我感觉太热了",
  "scenario.selfDescription": "创建个人行动计划",
  "scenario.someoneTitle": "帮助我关心的人",
  "scenario.someoneDescription": "为他人创建计划",
  "scenario.placeTitle": "在 Barcelona 演示区域查找凉爽场所",
  "scenario.placeDescription": "查找地点的事实信息",
  "scenario.nearestHelp": "Barcelona 地点信息",
  "scenario.importantNow": "现在很重要",
  "scenario.initialTipCoolestSpot":
    "移到您当前所在位置中最凉爽的可用地点。",
  "scenario.initialTipReduceEffort": "暂时减少体力活动。",
  "scenario.initialTipDrinkWater":
    "如果可以安全饮水，请定时喝水。",

  "placeLookup.searchAction": "搜索 Barcelona 演示地点",
  "placeLookup.loading": "正在查找已核实的地点数据……",
  "placeLookup.resultsTitle": "Barcelona 地点结果",
  "placeLookup.emptyTitle": "未找到匹配地点",
  "placeLookup.emptyMessage":
    "没有地点符合固定演示点、设备当前时间和搜索限制。",
  "placeLookup.errorTitle": "地点搜索不可用",
  "placeLookup.errorMessage": "无法安全显示地点信息。请稍后再次搜索。",
  "placeLookup.compactBoundary":
    "固定的 Barcelona 演示点 · 直线距离 · 核实营业时间和无障碍情况",
  "placeLookup.boundary":
    "搜索使用 Barcelona 的固定演示点，而不是您的位置。距离为直线距离，不是路线或预计到达时间。营业时间按设备当前时间评估。出发前请核实营业时间和无障碍情况。这不是医疗或紧急援助。路线、出行及个人无障碍适配情况均未核实。",

  "validation.empty": "请先描述情况，再创建计划。",
  "validation.overLimit": "描述过长。请缩短文本。",
  "validation.serverInput": "请检查描述后重试。",

  "status.creating": "正在创建您的行动计划。",
  "status.ready": "您的行动计划已准备好。",
  "status.loadingDetail": "正在检查情况、天气和已验证的候选地点……",

  "error.malformedTitle": "无法提供响应",
  "error.malformedMessage": "无法安全显示该响应。",
  "error.unavailableTitle": "行动计划暂时不可用",
  "error.unavailableMessage": "行动计划暂时不可用。请稍后重试。",
  "error.connectionTitle": "无法连接后端",
  "error.connectionMessage":
    "无法连接后端。请检查本地服务是否正在运行。",

  "priority.actNow": "立即行动",
  "priority.prepareNow": "立即做好准备",
  "priority.monitorAndPrepare": "关注情况并做好准备",

  "result.eyebrow": "您的 Barcelona 高温行动计划",
  "result.priorityBadge": "优先级：{{priority}}",
  "result.evaluatedAt": "评估时间：{{dateTime}}",
  "result.weatherSummaryAccessibleName": "天气摘要",
  "result.currentTemperature": "当前温度",
  "result.feelsLike": "体感温度",
  "result.todayMaximum": "今日最高温度",
  "result.phaseNow": "现在",
  "result.phaseNextFewHours": "接下来几小时",
  "result.phaseTonight": "今晚",
  "result.bringItemsTitle": "随身携带",
  "result.explanationTitle": "此计划的依据",
  "result.localPhraseTitle": "当地用语",
  "result.localPhraseCatalan": "加泰罗尼亚语",
  "result.localPhraseSpanish": "西班牙语",
  "result.noPlaceTitle": "未选择已验证的地点",
  "result.noticesTitle": "安全与信息提示",

  "place.backendApprovedLabel": "经后端批准的候选地点",
  "place.distanceLabel": "距离",
  "place.closesLabel": "关闭时间",
  "place.accessibilityLabel": "无障碍情况",
  "place.lastCheckedLabel": "最后核查",
  "place.featuresTitle": "已核实的特点",
  "place.noFeatures": "未列出其他已核实的特点。",
  "place.linksAccessibleName": "官方地点链接",
  "place.informationLink": "官方信息",
  "place.sourceLink": "官方来源",
  "place.mapLink": "在 Google 地图中打开",
  "place.cautionsAccessibleName": "地点注意事项",
  "place.addressUnavailable": "无可用地址",
  "place.accessibilityConfirmed": "来源确认无障碍",
  "place.accessibilityUnavailable": "来源报告此地点不具备无障碍条件",
  "place.accessibilityUnknown": "无障碍状态未知",

  "feature.indoorSpace": "室内空间",
  "feature.potableWater": "饮用水",
  "feature.toilets": "卫生间",
  "feature.microShelter": "小型避暑点",
  "feature.petsAllowed": "允许携带宠物",

  "feature.confirmed": "已确认",
  "feature.unavailable": "未列为可用",
  "feature.unknown": "未确认",

  "distance.straightLine": "{{distance}} 直线距离",

  "urgent.badge": "紧急 · 立即行动",
  "urgent.eyebrow": "即时安全结果",
  "urgent.title": "紧急求助",
  "urgent.sourceLink": "112 官方指南",

  "trust.eyebrow": "信任边界",
  "trust.title": "提供帮助，但不夸大确定性。",
  "trust.safetyLabel": "安全",
  "trust.safetyTitle": "提供信息，而非医疗建议",
  "trust.safetyDescription":
    "天气数据来自模型，并非官方高温警告。出发前应核实地点、开放时间、直线距离和可达性。紧急输出使用后端预设的固定内容。",
  "trust.privacyLabel": "隐私",
  "trust.privacyTitle": "请勿提供身份识别信息",
  "trust.privacyDescription":
    "情况文本不会存入浏览器存储。明确选择的视觉模式和语言偏好会保存在本地。只有所选语言代码会进入行动计划请求；视觉模式不会进入请求。HeatRelay 在此演示中不使用分析工具、Cookie、URL 参数或地理位置。",

  "footer.description": "Barcelona 演示 · 固定坐标",

  "metadata.title": "HeatRelay · Barcelona 试点基础",
  "metadata.description":
    "HeatRelay 是一个以 Barcelona 为首要试点的项目，旨在把高温警告转化为安全的下一步行动。",
} as const satisfies MessageCatalog;
