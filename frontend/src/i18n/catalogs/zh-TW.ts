import type { MessageCatalog } from "./en";

export const TRADITIONAL_CHINESE_CATALOG = {
  "app.name": "HeatRelay",

  "navigation.skipToMain": "跳至主要內容",
  "navigation.homeAccessibleName": "HeatRelay 首頁",
  "navigation.primaryAccessibleName": "主要導覽",
  "navigation.createPlan": "建立計畫",
  "navigation.safetyAndPrivacy": "安全與隱私",

  "header.settings": "設定",

"visualMode.label": "視覺模式",
  "visualMode.standard": "標準",
  "visualMode.enhanced": "增強可見性",
  "visualMode.highContrast": "高對比度",
  "visualMode.description":
    "增強可見性適合低視能者，以及任何偏好較大、更清晰內容的人。",

  "interfaceLanguage.label": "語言",
  "interfaceLanguage.description":
    "變更介面和下一份行動計畫的語言。不會翻譯您的描述，也不會改寫目前顯示的計畫。",
  "interfaceLanguage.optionWithEnglishName":
    "{{nativeName}} — {{englishName}}",

  "outputLanguage.label": "行動計畫語言",
  "outputLanguage.description":
    "選擇下一份行動計畫的語言。此偏好會儲存在本瀏覽器中，並隨行動計畫請求傳送。它不會變更介面語言，也不會翻譯你的描述。",

  "languageContext.title": "語言資訊",
  "languageContext.descriptionLanguage": "描述語言",
  "languageContext.displayedLanguage": "目前顯示的行動計畫語言",
  "languageContext.nextLanguage": "下一份行動計畫的語言",
  "languageContext.supportedMismatch":
    "描述和目前顯示的計畫使用不同的支援語言。請仔細檢視計畫，並在需要時選擇另一種行動計畫語言。",
  "languageContext.catalanUnavailable":
    "目前無法提供加泰隆尼亞語行動計畫輸出。請仔細檢視目前顯示的計畫，並在需要時選擇可用的行動計畫語言。",
  "languageContext.other":
    "HeatRelay 無法將描述語言與其支援的上線語言之一配對。請仔細檢視目前顯示的計畫，並選擇您最熟悉的行動計畫語言。",
  "languageContext.unknown":
    "HeatRelay 無法可靠判斷描述語言。請仔細檢視目前顯示的計畫，並選擇您最熟悉的行動計畫語言。",
  "languageContext.nextSelection":
    "目前顯示的計畫不會被改寫。您儲存的選擇將套用至下一份計畫。",
  "languageContext.otherValue": "其他語言",
  "languageContext.unknownValue": "無法判斷",
  "languageContext.changeAction": "變更語言",

  "hero.eyebrow": "Barcelona 試行 · 里程碑 5",
  "hero.title": "從高溫警告到安全的下一步。",
  "hero.introduction":
    "描述高溫情況後，HeatRelay 會使用固定的示範座標，向現有後端請求一份以可靠資料為依據的 Barcelona 行動計畫。",
  "hero.action": "建立 Barcelona 計畫",

  "release.kicker": "目前版本",
  "release.badge": "Barcelona 示範",
  "release.title": "由伺服器掌控的單一流程",
  "release.description":
    "瀏覽器只會傳送您的描述和固定的 Barcelona 示範設定。天氣、優先順序、地點和事實驗證均由後端處理。",
  "release.actionPlanApiLabel": "行動計畫 API",
  "release.actionPlanApiValue": "同源端點",
  "release.demoLocationLabel": "示範地點",
  "release.demoLocationValue": "固定的 Barcelona 座標點",
  "release.browserLocationLabel": "瀏覽器位置",
  "release.browserLocationValue": "無法使用",

  "form.eyebrow": "Barcelona 示範",
  "form.title": "建立您的高溫行動計畫",
  "form.introduction":
    "只分享為了讓一份範圍明確且經後端驗證的計畫符合個人需求所需的情況細節。每次提交只會發出一個請求。",
  "form.privacyTitle": "隱私與示範詳情",
  "form.privacyDescription":
    "您的描述會傳送至伺服器端，由 OpenAI 使用 GPT-5.6 處理。HeatRelay 不會刻意儲存或記錄原始文字；但服務提供者的資料處理政策仍可能適用。",
  "form.identityWarning":
    "OpenAI 會處理此文字。請勿輸入姓名、聯絡資料或地址。使用固定的 Barcelona 示範點；這不是緊急協助。",
  "form.situationLabel": "描述高溫情況",
  "form.characterCount": "{{currentCount}} / {{limit}} 個字元",
  "form.characterCountOverLimit":
    "{{currentCount}} / {{limit}} 個字元 — 請縮短 {{overLimitCount}} 個字元",
  "form.situationHint":
    "年齡 · 降溫資源 · 行動能力 · 症狀",
  "form.demoButton": "載入 Barcelona 示範",
  "form.submitButton": "建立我的高溫行動計畫",
  "form.submittingButton": "正在建立您的計畫……",
  "form.boundaryNote":
    "此 MVP 使用固定的 Barcelona 示範座標。瀏覽器位置目前尚無法使用。距離為直線估算值；HeatRelay 的內容並非醫療或緊急情況建議。",
  "form.demoText":
    "我 69 歲，獨居，沒有冷氣，走路較慢，而且不會說西班牙語。",

  "scenario.heading": "我們可以如何幫助您？",
  "scenario.selfTitle": "我覺得太熱了",
  "scenario.selfDescription": "建立個人行動計畫",
  "scenario.someoneTitle": "幫助我關心的人",
  "scenario.someoneDescription": "為他人建立計畫",
  "scenario.placeTitle": "在 Barcelona 示範區域尋找涼爽場所",
  "scenario.placeDescription": "查找地點的事實資訊",
  "scenario.nearestHelp": "Barcelona 地點資訊",
  "scenario.importantNow": "現在很重要",
  "scenario.initialTipCoolestSpot":
    "移到您目前所在位置中最涼爽的可用地點。",
  "scenario.initialTipReduceEffort": "暫時減少體力活動。",
  "scenario.initialTipDrinkWater":
    "若能安全飲水，請定時喝水。",

  "placeLookup.searchAction": "搜尋 Barcelona 示範地點",
  "placeLookup.loading": "正在查找已核實的地點資料……",
  "placeLookup.resultsTitle": "Barcelona 地點結果",
  "placeLookup.emptyTitle": "找不到相符地點",
  "placeLookup.emptyMessage":
    "沒有地點符合固定示範點、裝置目前時間及搜尋限制。",
  "placeLookup.errorTitle": "地點搜尋無法使用",
  "placeLookup.errorMessage": "無法安全顯示地點資訊。請稍後再次搜尋。",
  "placeLookup.compactBoundary":
    "固定的 Barcelona 示範點 · 直線距離 · 核實營業時間及無障礙情況",
  "placeLookup.boundary":
    "搜尋使用 Barcelona 的固定示範點，而非您的位置。距離為直線距離，不是路線或預計抵達時間。營業時間依裝置目前時間評估。出發前請核實營業時間及無障礙情況。這不是醫療或緊急協助。路線、行程及個人無障礙適用性均未核實。",

  "validation.empty": "請先描述情況，再建立計畫。",
  "validation.overLimit": "描述太長。請縮短文字。",
  "validation.serverInput": "請檢查描述後再試一次。",

  "status.creating": "正在建立您的行動計畫。",
  "status.ready": "您的行動計畫已準備完成。",
  "status.loadingDetail": "正在檢查情況、天氣和已驗證的候選地點……",

  "error.malformedTitle": "無法提供回應",
  "error.malformedMessage": "無法安全地顯示此回應。",
  "error.unavailableTitle": "行動計畫暫時無法使用",
  "error.unavailableMessage": "行動計畫暫時無法使用。請稍後再試。",
  "error.connectionTitle": "無法連線至後端",
  "error.connectionMessage":
    "無法連線至後端。請檢查本機服務是否正在執行。",

  "priority.actNow": "立即行動",
  "priority.prepareNow": "立即準備",
  "priority.monitorAndPrepare": "持續觀察並準備",

  "result.eyebrow": "您的 Barcelona 高溫行動計畫",
  "result.priorityBadge": "優先順序：{{priority}}",
  "result.evaluatedAt": "評估時間：{{dateTime}}",
  "result.weatherSummaryAccessibleName": "天氣摘要",
  "result.currentTemperature": "目前溫度",
  "result.feelsLike": "體感溫度",
  "result.todayMaximum": "今日最高溫",
  "result.phaseNow": "現在",
  "result.phaseNextFewHours": "接下來幾小時",
  "result.phaseTonight": "今晚",
  "result.bringItemsTitle": "隨身攜帶",
  "result.explanationTitle": "為何採用這份計畫",
  "result.localPhraseTitle": "當地用語",
  "result.localPhraseCatalan": "加泰隆尼亞語",
  "result.localPhraseSpanish": "西班牙語",
  "result.noPlaceTitle": "未選取已驗證的地點",
  "result.noticesTitle": "安全與資訊注意事項",

  "place.backendApprovedLabel": "後端核准的候選地點",
  "place.distanceLabel": "距離",
  "place.closesLabel": "關閉時間",
  "place.accessibilityLabel": "無障礙狀況",
  "place.lastCheckedLabel": "上次查核",
  "place.featuresTitle": "已驗證的設施與條件",
  "place.noFeatures": "未列出其他已驗證的設施與條件。",
  "place.linksAccessibleName": "地點官方連結",
  "place.informationLink": "官方資訊",
  "place.sourceLink": "官方來源",
  "place.mapLink": "在 Google 地圖中開啟",
  "place.cautionsAccessibleName": "地點注意事項",
  "place.addressUnavailable": "無可用地址",
  "place.accessibilityConfirmed": "資料來源確認此地點具備無障礙條件",
  "place.accessibilityUnavailable": "資料來源指出此地點不具無障礙條件",
  "place.accessibilityUnknown": "無障礙狀況未知",

  "feature.indoorSpace": "室內空間",
  "feature.potableWater": "飲用水",
  "feature.toilets": "廁所",
  "feature.microShelter": "微型庇護空間",
  "feature.petsAllowed": "可攜帶寵物",

  "feature.confirmed": "已確認",
  "feature.unavailable": "未列為可用",
  "feature.unknown": "未確認",

  "distance.straightLine": "直線距離 {{distance}}",

  "urgent.badge": "緊急 · 立即行動",
  "urgent.eyebrow": "立即安全結果",
  "urgent.title": "緊急協助",
  "urgent.sourceLink": "112 官方指引",

  "trust.eyebrow": "可信度界線",
  "trust.title": "提供實用資訊，不誇大確定性。",
  "trust.safetyLabel": "安全",
  "trust.safetyTitle": "資訊，不是醫療建議",
  "trust.safetyDescription":
    "天氣資料來自模型，並非官方高溫警告。出發前應確認地點、開放時間、直線距離和是否可到達。緊急輸出使用由後端掌控的固定內容。",
  "trust.privacyLabel": "隱私",
  "trust.privacyTitle": "請勿提供可識別身分的詳細資料",
  "trust.privacyDescription":
    "情況文字不會儲存在瀏覽器儲存空間。明確選擇的視覺模式和語言偏好會儲存在本機。只有所選語言代碼會進入行動計畫請求；視覺模式不會進入請求。此示範中的 HeatRelay 不使用分析工具、Cookie、URL 參數或地理位置。",

  "footer.description": "Barcelona 示範 · 固定座標",

  "metadata.title": "HeatRelay · Barcelona 試行基礎",
  "metadata.description":
    "HeatRelay 是以 Barcelona 為優先的專案，正在開發中，旨在將高溫警告轉化為安全的下一步行動。",
} as const satisfies MessageCatalog;
