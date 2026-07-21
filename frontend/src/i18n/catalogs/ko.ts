import type { MessageCatalog } from "./en";

export const KOREAN_CATALOG = {
  "app.name": "HeatRelay",

  "navigation.skipToMain": "주요 콘텐츠로 건너뛰기",
  "navigation.homeAccessibleName": "HeatRelay 홈",
  "navigation.primaryAccessibleName": "주요 탐색",
  "navigation.createPlan": "계획 만들기",
  "navigation.safetyAndPrivacy": "안전 및 개인정보 보호",

  "header.settings": "설정",

"visualMode.label": "시각 모드",
  "visualMode.standard": "표준",
  "visualMode.enhanced": "향상된 가시성",
  "visualMode.highContrast": "고대비",
  "visualMode.description":
    "향상된 가시성은 저시력인 분이나 더 크고 선명한 콘텐츠를 선호하는 누구나 사용할 수 있습니다.",

  "interfaceLanguage.label": "언어",
  "interfaceLanguage.description":
    "인터페이스와 다음 행동 계획의 언어를 변경합니다. 설명을 번역하거나 표시된 계획을 다시 작성하지 않습니다.",
  "interfaceLanguage.optionWithEnglishName":
    "{{nativeName}} — {{englishName}}",

  "outputLanguage.label": "행동 계획 언어",
  "outputLanguage.description":
    "다음 행동 계획의 언어를 선택합니다. 이 설정은 이 브라우저에 저장되고 행동 계획 요청과 함께 전송됩니다. 인터페이스 언어를 변경하거나 설명을 번역하지 않습니다.",

  "languageContext.title": "언어 정보",
  "languageContext.descriptionLanguage": "설명 언어",
  "languageContext.displayedLanguage": "표시된 행동 계획 언어",
  "languageContext.nextLanguage": "다음 행동 계획 언어",
  "languageContext.supportedMismatch":
    "설명과 표시된 계획이 서로 다른 지원 언어를 사용합니다. 계획을 주의 깊게 검토하고 필요한 경우 다른 행동 계획 언어를 선택하세요.",
  "languageContext.catalanUnavailable":
    "카탈루냐어 행동 계획 출력은 제공되지 않습니다. 표시된 계획을 주의 깊게 검토하고 필요한 경우 제공되는 행동 계획 언어를 선택하세요.",
  "languageContext.other":
    "HeatRelay가 설명 언어를 지원하는 출시 언어 중 하나와 일치시키지 못했습니다. 표시된 계획을 주의 깊게 검토하고 가장 잘 이해하는 행동 계획 언어를 선택하세요.",
  "languageContext.unknown":
    "HeatRelay가 설명 언어를 신뢰할 수 있게 판별하지 못했습니다. 표시된 계획을 주의 깊게 검토하고 가장 잘 이해하는 행동 계획 언어를 선택하세요.",
  "languageContext.nextSelection":
    "표시된 계획은 다시 작성되지 않습니다. 저장한 선택은 다음 계획에 적용됩니다.",
  "languageContext.otherValue": "다른 언어",
  "languageContext.unknownValue": "판별할 수 없음",
  "languageContext.changeAction": "언어 변경",

  "hero.eyebrow": "Barcelona 파일럿 · 마일스톤 5",
  "hero.title": "폭염 경보에서 안전한 다음 단계로.",
  "hero.introduction":
    "폭염 상황을 설명하면 HeatRelay가 고정된 데모 좌표를 사용해 기존 백엔드에 근거에 기반한 Barcelona 행동 계획 하나를 요청합니다.",
  "hero.action": "Barcelona 계획 만들기",

  "release.kicker": "현재 릴리스",
  "release.badge": "Barcelona 데모",
  "release.title": "서버가 관리하는 단일 워크플로",
  "release.description":
    "브라우저는 사용자의 설명과 고정된 Barcelona 데모 설정만 전송합니다. 날씨, 우선순위, 장소 및 사실 검증은 백엔드에서 처리됩니다.",
  "release.actionPlanApiLabel": "행동 계획 API",
  "release.actionPlanApiValue": "동일 출처 엔드포인트",
  "release.demoLocationLabel": "데모 위치",
  "release.demoLocationValue": "고정된 Barcelona 지점",
  "release.browserLocationLabel": "브라우저 위치",
  "release.browserLocationValue": "사용할 수 없음",

  "form.eyebrow": "Barcelona 데모",
  "form.title": "폭염 행동 계획 만들기",
  "form.introduction":
    "범위가 한정되고 백엔드에서 검증되는 계획을 맞춤화하는 데 필요한 상황 정보만 공유해 주세요. 한 번 제출하면 한 번만 요청합니다.",
  "form.privacyTitle": "개인정보 보호 및 데모 세부정보",
  "form.privacyDescription":
    "사용자의 설명은 GPT-5.6 처리를 위해 서버를 통해 OpenAI로 전송됩니다. HeatRelay는 원문을 의도적으로 저장하거나 기록하지 않지만, 제공업체의 데이터 처리 정책이 적용될 수 있습니다.",
  "form.identityWarning":
    "텍스트는 OpenAI로 전송됩니다. HeatRelay는 원문을 의도적으로 저장하거나 기록하지 않습니다. 이름, 연락처 또는 주소를 포함하지 마세요. Barcelona의 고정 데모 좌표를 사용합니다. 의료 조언이나 응급 지원이 아닙니다.",
  "form.situationLabel": "폭염 상황 설명",
  "form.characterCount": "{{currentCount}} / {{limit}}자",
  "form.characterCountOverLimit":
    "{{currentCount}} / {{limit}}자 — {{overLimitCount}}자 줄이세요",
  "form.situationHint":
    "나이, 냉방 이용 가능 여부, 이동 능력, 시간 및 관련 증상을 간단히 설명하세요.",
  "form.demoButton": "Barcelona 데모 불러오기",
  "form.submitButton": "내 폭염 행동 계획 만들기",
  "form.submittingButton": "계획을 만드는 중…",
  "form.boundaryNote":
    "이 MVP는 고정된 Barcelona 데모 좌표를 사용합니다. 아직 브라우저 위치는 사용할 수 없습니다. 거리는 직선거리 추정치이며, HeatRelay는 의료 또는 응급 상황에 대한 조언을 제공하지 않습니다.",
  "form.demoText":
    "저는 69세이고 혼자 살며 에어컨이 없습니다. 천천히 걷고 스페인어를 하지 못합니다.",

  "scenario.heading": "어떻게 도와드릴까요?",
  "scenario.selfTitle": "너무 덥습니다",
  "scenario.selfDescription": "개인 행동 계획 만들기",
  "scenario.someoneTitle": "가까운 사람 돕기",
  "scenario.someoneDescription": "다른 사람을 위한 계획 만들기",
  "scenario.placeTitle": "가까운 시원한 장소 찾기",
  "scenario.placeDescription": "가장 가까운 확인된 도움 보기",
  "scenario.nearestHelp": "가장 가까운 도움",
  "scenario.importantNow": "지금 중요한 일",

  "validation.empty": "계획을 만들기 전에 상황을 설명해 주세요.",
  "validation.overLimit": "설명이 너무 깁니다. 텍스트를 줄이세요.",
  "validation.serverInput": "설명을 검토한 후 다시 시도해 주세요.",

  "status.creating": "행동 계획을 만드는 중입니다.",
  "status.ready": "행동 계획이 준비되었습니다.",
  "status.loadingDetail":
    "상황, 날씨 및 검증된 후보를 확인하는 중…",

  "error.malformedTitle": "응답을 사용할 수 없음",
  "error.malformedMessage": "응답을 안전하게 표시할 수 없습니다.",
  "error.unavailableTitle": "행동 계획을 일시적으로 사용할 수 없음",
  "error.unavailableMessage":
    "행동 계획을 일시적으로 사용할 수 없습니다. 나중에 다시 시도해 주세요.",
  "error.connectionTitle": "백엔드에 연결할 수 없음",
  "error.connectionMessage":
    "백엔드에 연결할 수 없습니다. 로컬 서비스가 실행 중인지 확인해 주세요.",

  "priority.actNow": "지금 행동하세요",
  "priority.prepareNow": "지금 준비하세요",
  "priority.monitorAndPrepare": "상황을 살피고 준비하세요",

  "result.eyebrow": "나의 Barcelona 폭염 행동 계획",
  "result.priorityBadge": "우선순위: {{priority}}",
  "result.evaluatedAt": "평가 시각: {{dateTime}}",
  "result.weatherSummaryAccessibleName": "날씨 요약",
  "result.currentTemperature": "현재 기온",
  "result.feelsLike": "체감 온도",
  "result.todayMaximum": "오늘 최고 기온",
  "result.phaseNow": "지금",
  "result.phaseNextFewHours": "앞으로 몇 시간",
  "result.phaseTonight": "오늘 밤",
  "result.bringItemsTitle": "가져갈 물품",
  "result.explanationTitle": "이 계획의 이유",
  "result.localPhraseTitle": "현지 표현",
  "result.localPhraseCatalan": "카탈루냐어",
  "result.localPhraseSpanish": "스페인어",
  "result.noPlaceTitle": "선택된 검증 장소 없음",
  "result.noticesTitle": "안전 및 정보 안내",

  "place.backendApprovedLabel": "백엔드 승인 후보",
  "place.distanceLabel": "거리",
  "place.closesLabel": "운영 종료",
  "place.accessibilityLabel": "접근성",
  "place.lastCheckedLabel": "마지막 확인",
  "place.featuresTitle": "검증된 특징",
  "place.noFeatures": "추가로 검증된 특징은 목록에 없습니다.",
  "place.linksAccessibleName": "공식 장소 링크",
  "place.informationLink": "공식 정보",
  "place.sourceLink": "공식 출처",
  "place.mapLink": "Google 지도에서 경로 열기",
  "place.cautionsAccessibleName": "장소 주의사항",
  "place.addressUnavailable": "주소를 사용할 수 없음",
  "place.accessibilityConfirmed": "출처에서 접근 가능한 장소임을 확인함",
  "place.accessibilityUnavailable":
    "출처에 따르면 이 장소는 접근 가능한 시설이 아님",
  "place.accessibilityUnknown": "접근성 상태를 알 수 없음",

  "feature.indoorSpace": "실내 공간",
  "feature.potableWater": "식수",
  "feature.toilets": "화장실",
  "feature.microShelter": "소형 쉼터",
  "feature.petsAllowed": "반려동물 동반 가능",

  "feature.confirmed": "확인됨",
  "feature.unavailable": "이용 가능으로 표시되지 않음",
  "feature.unknown": "확인되지 않음",

  "distance.straightLine": "직선거리 {{distance}}",

  "urgent.badge": "긴급 · 즉시 행동하세요",
  "urgent.eyebrow": "즉각적인 안전 결과",
  "urgent.title": "긴급 지원",
  "urgent.sourceLink": "공식 112 안내",

  "trust.eyebrow": "신뢰의 한계",
  "trust.title": "확실성을 과장하지 않는 유용한 정보.",
  "trust.safetyLabel": "안전",
  "trust.safetyTitle": "의료 조언이 아닌 정보",
  "trust.safetyDescription":
    "날씨는 모델에서 산출된 정보이며 공식 폭염 경보가 아닙니다. 이동하기 전에 장소, 운영 시간, 직선거리 및 도달 가능 여부를 확인해야 합니다. 긴급 결과에는 백엔드가 관리하는 고정 콘텐츠가 사용됩니다.",
  "trust.privacyLabel": "개인정보 보호",
  "trust.privacyTitle": "개인 식별 정보는 입력하지 마세요",
  "trust.privacyDescription":
    "상황 설명은 브라우저 저장소에 저장되지 않습니다. 명시적으로 선택한 시각 모드와 언어 설정은 로컬에 저장됩니다. 선택한 언어 코드만 행동 계획 요청에 포함되며 시각 모드는 포함되지 않습니다. 이 데모에서 HeatRelay는 분석 도구, 쿠키, URL 매개변수 또는 지오로케이션을 사용하지 않습니다.",

  "footer.description": "Barcelona 데모 · 고정 좌표",

  "metadata.title": "HeatRelay · Barcelona 파일럿 기반",
  "metadata.description":
    "HeatRelay는 폭염 경보를 안전한 다음 단계로 전환하기 위해 개발 중인 Barcelona 우선 프로젝트입니다.",
} as const satisfies MessageCatalog;
