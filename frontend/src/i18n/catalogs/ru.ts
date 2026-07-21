import type { MessageCatalog } from "./en";

export const RUSSIAN_CATALOG = {
  "app.name": "HeatRelay",

  "navigation.skipToMain": "Перейти к основному содержимому",
  "navigation.homeAccessibleName": "Главная страница HeatRelay",
  "navigation.primaryAccessibleName": "Основная навигация",
  "navigation.createPlan": "Создать план",
  "navigation.safetyAndPrivacy": "Безопасность и конфиденциальность",

  "header.settings": "Настройки",

"visualMode.label": "Режим отображения",
  "visualMode.standard": "Стандартный",
  "visualMode.enhanced": "Повышенная видимость",
  "visualMode.highContrast": "Высокая контрастность",
  "visualMode.description":
    "Повышенная видимость предназначена для людей со слабым зрением и для всех, кому удобнее более крупный и чёткий контент.",

  "interfaceLanguage.label": "Язык",
  "interfaceLanguage.description":
    "Изменяет язык интерфейса и следующего плана действий. Не переводит описание и не переписывает уже отображаемый план.",
  "interfaceLanguage.optionWithEnglishName":
    "{{nativeName}} — {{englishName}}",

  "outputLanguage.label": "Язык плана действий",
  "outputLanguage.description":
    "Выбирает язык следующего плана действий. Эта настройка сохраняется в браузере и отправляется с запросом плана действий. Она не изменяет язык интерфейса и не переводит ваше описание.",

  "languageContext.title": "Информация о языках",
  "languageContext.descriptionLanguage": "Язык описания",
  "languageContext.displayedLanguage": "Язык отображаемого плана",
  "languageContext.nextLanguage": "Язык следующего плана действий",
  "languageContext.supportedMismatch":
    "Описание и отображаемый план используют разные поддерживаемые языки. Внимательно проверьте план и при необходимости выберите другой язык плана действий.",
  "languageContext.catalanUnavailable":
    "План действий на каталонском языке недоступен. Внимательно проверьте отображаемый план и при необходимости выберите доступный язык плана действий.",
  "languageContext.other":
    "HeatRelay не смог сопоставить язык описания ни с одним из поддерживаемых языков запуска. Внимательно проверьте отображаемый план и выберите язык плана действий, который вы понимаете лучше всего.",
  "languageContext.unknown":
    "HeatRelay не смог надежно определить язык описания. Внимательно проверьте отображаемый план и выберите язык плана действий, который вы понимаете лучше всего.",
  "languageContext.nextSelection":
    "Отображаемый план не переписывается. Сохраненный выбор будет применен к следующему плану.",
  "languageContext.otherValue": "Другой язык",
  "languageContext.unknownValue": "Не удалось определить",
  "languageContext.changeAction": "Изменить язык",

  "hero.eyebrow": "Пилотный проект Barcelona · Этап 5",
  "hero.title": "От предупреждения о жаре к безопасному следующему шагу.",
  "hero.introduction":
    "Опишите ситуацию, связанную с жарой, и HeatRelay запросит у существующего бэкенда один обоснованный данными план действий для Barcelona с фиксированными демонстрационными координатами.",
  "hero.action": "Создать план для Barcelona",

  "release.kicker": "Текущая версия",
  "release.badge": "Демоверсия Barcelona",
  "release.title": "Единый рабочий процесс на сервере",
  "release.description":
    "Браузер отправляет только ваше описание и фиксированные демонстрационные настройки Barcelona. Погода, приоритет, места и проверка фактов остаются на бэкенде.",
  "release.actionPlanApiLabel": "API плана действий",
  "release.actionPlanApiValue": "Конечная точка того же источника",
  "release.demoLocationLabel": "Демонстрационное местоположение",
  "release.demoLocationValue": "Фиксированная точка Barcelona",
  "release.browserLocationLabel": "Местоположение браузера",
  "release.browserLocationValue": "Недоступно",

  "form.eyebrow": "Демоверсия Barcelona",
  "form.title": "Создайте план действий при жаре",
  "form.introduction":
    "Укажите только сведения о ситуации, необходимые для персонализации ограниченного плана, проверенного бэкендом. Одна отправка создаёт один запрос.",
  "form.privacyTitle": "Конфиденциальность и условия демоверсии",
  "form.privacyDescription":
    "Ваше описание отправляется на сервер и передаётся OpenAI для обработки GPT-5.6. HeatRelay намеренно не сохраняет и не журналирует исходный текст; при этом могут применяться правила поставщика по обработке данных.",
  "form.identityWarning":
    "OpenAI обрабатывает этот текст. Не указывайте имена, контакты или адреса. Фиксированная демоточка Barcelona; это не экстренная помощь.",
  "form.situationLabel": "Опишите ситуацию, связанную с жарой",
  "form.characterCount": "{{currentCount}} / {{limit}} символов",
  "form.characterCountOverLimit":
    "{{currentCount}} / {{limit}} символов — сократите на {{overLimitCount}}",
  "form.situationHint":
    "Возраст · доступ к охлаждению · подвижность · симптомы",
  "form.demoButton": "Загрузить пример Barcelona",
  "form.submitButton": "Создать мой план действий при жаре",
  "form.submittingButton": "Создаём ваш план…",
  "form.boundaryNote":
    "В этом MVP используются фиксированные демонстрационные координаты Barcelona. Местоположение браузера пока недоступно. Расстояния указаны по прямой; HeatRelay не предоставляет медицинских рекомендаций или рекомендаций для экстренных ситуаций.",
  "form.demoText":
    "Мне 69 лет, я живу в одиночку, у меня нет кондиционера, я медленно хожу и не говорю по-испански.",

  "scenario.heading": "Как мы можем помочь?",
  "scenario.selfTitle": "Мне слишком жарко",
  "scenario.selfDescription": "Получить личный план действий",
  "scenario.someoneTitle": "Помочь близкому человеку",
  "scenario.someoneDescription": "Составить план для другого человека",
  "scenario.placeTitle": "Найти прохладное место в демозоне Barcelona",
  "scenario.placeDescription": "Найти фактическую информацию о местах",
  "scenario.nearestHelp": "Информация о местах Barcelona",
  "scenario.importantNow": "Сейчас важно",
  "scenario.initialTipCoolestSpot":
    "Перейдите в самое прохладное доступное место там, где вы уже находитесь.",
  "scenario.initialTipReduceEffort": "Пока снизьте физическую нагрузку.",
  "scenario.initialTipDrinkWater":
    "Регулярно пейте воду, если это безопасно.",

  "placeLookup.searchAction": "Найти места в демозоне Barcelona",
  "placeLookup.loading": "Поиск в проверенных данных о местах…",
  "placeLookup.resultsTitle": "Результаты поиска мест в Barcelona",
  "placeLookup.emptyTitle": "Подходящее место не найдено",
  "placeLookup.emptyMessage":
    "Ни одно место не соответствовало фиксированной демоточке, текущему времени устройства и ограничениям поиска.",
  "placeLookup.errorTitle": "Информация о местах недоступна",
  "placeLookup.errorMessage":
    "Информацию о местах не удалось безопасно отобразить. Повторите попытку, только если сами решите это сделать.",
  "placeLookup.compactBoundary":
    "Фиксированная демоточка Barcelona · Расстояние по прямой · Проверьте часы работы и доступность",
  "placeLookup.boundary":
    "Используется фиксированная демоточка Barcelona, а не ваше местоположение. Расстояния указаны по прямой, это не маршруты и не расчётное время прибытия. Часы работы оцениваются по времени устройства. Перед поездкой проверьте часы работы и доступность. Это не медицинская и не экстренная помощь.",

  "validation.empty": "Опишите ситуацию перед созданием плана.",
  "validation.overLimit": "Описание слишком длинное. Сократите текст.",
  "validation.serverInput": "Проверьте описание и повторите попытку.",

  "status.creating": "Создаём ваш план действий.",
  "status.ready": "Ваш план действий готов.",
  "status.loadingDetail":
    "Проверяем ситуацию, погоду и подтверждённые варианты…",

  "error.malformedTitle": "Ответ недоступен",
  "error.malformedMessage": "Ответ невозможно безопасно отобразить.",
  "error.unavailableTitle": "План действий временно недоступен",
  "error.unavailableMessage":
    "План действий временно недоступен. Повторите попытку позже.",
  "error.connectionTitle": "Не удалось подключиться к бэкенду",
  "error.connectionMessage":
    "Не удалось подключиться к бэкенду. Убедитесь, что локальные службы запущены.",

  "priority.actNow": "Действуйте сейчас",
  "priority.prepareNow": "Подготовьтесь сейчас",
  "priority.monitorAndPrepare": "Наблюдайте и готовьтесь",

  "result.eyebrow": "Ваш план действий при жаре для Barcelona",
  "result.priorityBadge": "Приоритет: {{priority}}",
  "result.evaluatedAt": "Оценка выполнена {{dateTime}}",
  "result.weatherSummaryAccessibleName": "Сводка погоды",
  "result.currentTemperature": "Текущая температура",
  "result.feelsLike": "Ощущается как",
  "result.todayMaximum": "Сегодняшний максимум",
  "result.phaseNow": "Сейчас",
  "result.phaseNextFewHours": "В ближайшие часы",
  "result.phaseTonight": "Сегодня вечером",
  "result.bringItemsTitle": "Возьмите с собой",
  "result.explanationTitle": "Почему выбран этот план",
  "result.localPhraseTitle": "Фраза на местном языке",
  "result.localPhraseCatalan": "Каталанский",
  "result.localPhraseSpanish": "Испанский",
  "result.noPlaceTitle": "Подтверждённое место не выбрано",
  "result.noticesTitle": "Уведомления о безопасности и информация",

  "place.backendApprovedLabel": "Вариант, одобренный бэкендом",
  "place.distanceLabel": "Расстояние",
  "place.closesLabel": "Закрывается",
  "place.accessibilityLabel": "Доступность",
  "place.lastCheckedLabel": "Последняя проверка",
  "place.featuresTitle": "Подтверждённые возможности",
  "place.noFeatures": "Другие подтверждённые возможности не указаны.",
  "place.linksAccessibleName": "Официальные ссылки о месте",
  "place.informationLink": "Официальная информация",
  "place.sourceLink": "Официальный источник",
  "place.mapLink": "Открыть в Google Maps",
  "place.cautionsAccessibleName": "Предупреждения о месте",
  "place.addressUnavailable": "Адрес недоступен",
  "place.accessibilityConfirmed": "Источник подтверждает доступность",
  "place.accessibilityUnavailable":
    "Источник сообщает, что это место недоступно",
  "place.accessibilityUnknown": "Статус доступности неизвестен",

  "feature.indoorSpace": "Помещение",
  "feature.potableWater": "Питьевая вода",
  "feature.toilets": "Туалеты",
  "feature.microShelter": "Небольшое укрытие",
  "feature.petsAllowed": "Разрешено с домашними животными",

  "feature.confirmed": "Подтверждено",
  "feature.unavailable": "Не указано как доступное",
  "feature.unknown": "Не подтверждено",

  "distance.straightLine": "{{distance}} по прямой",

  "urgent.badge": "Срочно · действуйте немедленно",
  "urgent.eyebrow": "Результат немедленной проверки безопасности",
  "urgent.title": "Срочная помощь",
  "urgent.sourceLink": "Официальные рекомендации 112",

  "trust.eyebrow": "Границы достоверности",
  "trust.title": "Полезная информация без преувеличения определённости.",
  "trust.safetyLabel": "Безопасность",
  "trust.safetyTitle": "Информация, а не медицинская рекомендация",
  "trust.safetyDescription":
    "Погодные данные получены от модели и не являются официальным предупреждением о жаре. Перед поездкой следует проверить места, часы работы, расстояние по прямой и возможность добраться. В срочном ответе используется фиксированный контент, принадлежащий бэкенду.",
  "trust.privacyLabel": "Конфиденциальность",
  "trust.privacyTitle": "Не указывайте идентифицирующие сведения",
  "trust.privacyDescription":
    "Текст ситуации не сохраняется в хранилище браузера. Явно выбранные настройки режима отображения и языка сохраняются локально. В запрос плана действий включается только код выбранного языка; режим отображения не включается. В этой демонстрационной версии HeatRelay не использует аналитику, файлы cookie, параметры URL или геолокацию.",

  "footer.description": "Демоверсия Barcelona · Фиксированные координаты",

  "metadata.title": "HeatRelay · Основа пилотного проекта Barcelona",
  "metadata.description":
    "HeatRelay — проект с первоначальным фокусом на Barcelona, который разрабатывается, чтобы превращать предупреждения о жаре в безопасные следующие шаги.",
} as const satisfies MessageCatalog;
