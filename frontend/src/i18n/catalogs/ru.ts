import type { MessageCatalog } from "./en";

export const RUSSIAN_CATALOG = {
  "app.name": "HeatRelay",

  "navigation.skipToMain": "Перейти к основному содержимому",
  "navigation.homeAccessibleName": "Главная страница HeatRelay",
  "navigation.primaryAccessibleName": "Основная навигация",
  "navigation.createPlan": "Создать план",
  "navigation.safetyAndPrivacy": "Безопасность и конфиденциальность",

  "visualMode.label": "Режим отображения",
  "visualMode.standard": "Стандартный",
  "visualMode.enhanced": "Повышенная видимость",
  "visualMode.description":
    "Повышенная видимость предназначена для людей со слабым зрением и для всех, кому удобнее более крупный и чёткий контент.",

  "interfaceLanguage.label": "Язык интерфейса",
  "interfaceLanguage.description":
    "Изменяет навигацию, формы и подписи на странице. Не изменяет язык плана действий.",
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
  "languageContext.changeAction": "Изменить язык плана действий",

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
  "form.privacyTitle": "Перед отправкой",
  "form.privacyDescription":
    "Ваше описание отправляется на сервер и передаётся OpenAI для обработки GPT-5.6. HeatRelay намеренно не сохраняет и не журналирует исходный текст; при этом могут применяться правила поставщика по обработке данных.",
  "form.identityWarning":
    "Не указывайте имена, контактные данные, адреса и другую информацию, позволяющую установить личность.",
  "form.situationLabel": "Опишите ситуацию, связанную с жарой",
  "form.characterCount": "{{currentCount}} / {{limit}} кодовых точек",
  "form.characterCountOverLimit":
    "{{currentCount}} / {{limit}} кодовых точек — превышение на {{overLimitCount}}",
  "form.situationHint":
    "Используйте не более {{limit}} кодовых точек Unicode. Можно указать возраст, доступ к охлаждению, мобильность, время или ограниченный набор тревожных симптомов.",
  "form.demoButton": "Загрузить пример Barcelona",
  "form.submitButton": "Создать мой план действий при жаре",
  "form.submittingButton": "Создаём ваш план…",
  "form.boundaryNote":
    "В этом MVP используются фиксированные демонстрационные координаты Barcelona. Местоположение браузера пока недоступно. Расстояния указаны по прямой; HeatRelay не предоставляет медицинских рекомендаций или рекомендаций для экстренных ситуаций.",
  "form.demoText":
    "Мне 69 лет, я живу в одиночку, у меня нет кондиционера, я медленно хожу и не говорю по-испански.",

  "validation.empty": "Опишите ситуацию перед созданием плана.",
  "validation.overLimit":
    "Сократите описание до {{limit}} символов Unicode.",
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
    "Текст ситуации не сохраняется в хранилище браузера. Явно выбранные настройки режима отображения, языка интерфейса и языка плана действий сохраняются локально. В запрос плана действий включается только код выбранного языка плана; режим отображения и язык интерфейса не включаются. В этой демонстрационной версии HeatRelay не использует аналитику, файлы cookie, параметры URL или геолокацию.",

  "footer.description": "Демоверсия Barcelona · Фиксированные координаты",

  "metadata.title": "HeatRelay · Основа пилотного проекта Barcelona",
  "metadata.description":
    "HeatRelay — проект с первоначальным фокусом на Barcelona, который разрабатывается, чтобы превращать предупреждения о жаре в безопасные следующие шаги.",
} as const satisfies MessageCatalog;
