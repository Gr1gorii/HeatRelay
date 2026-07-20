import type { MessageCatalog } from "./en";

export const UKRAINIAN_CATALOG = {
  "app.name": "HeatRelay",

  "navigation.skipToMain": "Перейти до основного вмісту",
  "navigation.homeAccessibleName": "Головна сторінка HeatRelay",
  "navigation.primaryAccessibleName": "Основна навігація",
  "navigation.createPlan": "Створити план",
  "navigation.safetyAndPrivacy": "Безпека та конфіденційність",

  "header.settings": "Налаштування",

"visualMode.label": "Візуальний режим",
  "visualMode.standard": "Стандартний",
  "visualMode.enhanced": "Покращена видимість",
  "visualMode.highContrast": "Висока контрастність",
  "visualMode.description":
    "Покращена видимість призначена для людей зі слабким зором або для всіх, хто віддає перевагу більшому й чіткішому вмісту.",

  "interfaceLanguage.label": "Мова інтерфейсу",
  "interfaceLanguage.description":
    "Змінює навігацію, форми та підписи на сторінці. Не змінює мову плану дій.",
  "interfaceLanguage.optionWithEnglishName":
    "{{nativeName}} — {{englishName}}",

  "outputLanguage.label": "Мова плану дій",
  "outputLanguage.description":
    "Вибирає мову наступного плану дій. Цей параметр зберігається в браузері та надсилається із запитом плану дій. Він не змінює мову інтерфейсу й не перекладає ваш опис.",

  "languageContext.title": "Інформація про мови",
  "languageContext.descriptionLanguage": "Мова опису",
  "languageContext.displayedLanguage": "Мова відображеного плану",
  "languageContext.nextLanguage": "Мова наступного плану дій",
  "languageContext.supportedMismatch":
    "Опис і відображений план використовують різні підтримувані мови. Уважно перегляньте план і за потреби виберіть іншу мову плану дій.",
  "languageContext.catalanUnavailable":
    "План дій каталонською мовою недоступний. Уважно перегляньте відображений план і за потреби виберіть доступну мову плану дій.",
  "languageContext.other":
    "HeatRelay не зміг зіставити мову опису з жодною з підтримуваних мов запуску. Уважно перегляньте відображений план і виберіть мову плану дій, яку ви розумієте найкраще.",
  "languageContext.unknown":
    "HeatRelay не зміг надійно визначити мову опису. Уважно перегляньте відображений план і виберіть мову плану дій, яку ви розумієте найкраще.",
  "languageContext.nextSelection":
    "Відображений план не переписується. Збережений вибір буде застосовано до наступного плану.",
  "languageContext.otherValue": "Інша мова",
  "languageContext.unknownValue": "Не вдалося визначити",
  "languageContext.changeAction": "Змінити мову плану дій",

  "hero.eyebrow": "Пілотний проєкт у Barcelona · Етап 5",
  "hero.title": "Від попередження про спеку до безпечного наступного кроку.",
  "hero.introduction":
    "Опишіть ситуацію, пов’язану зі спекою, і HeatRelay звернеться до наявного бекенду по один обґрунтований план дій для міста Barcelona з використанням фіксованих демонстраційних координат.",
  "hero.action": "Створити план для міста Barcelona",

  "release.kicker": "Поточна версія",
  "release.badge": "Демонстрація Barcelona",
  "release.title": "Один робочий процес під керуванням сервера",
  "release.description":
    "Браузер надсилає лише ваш опис і фіксовані параметри демонстрації Barcelona. Погода, пріоритет, місця та перевірка фактів залишаються на бекенді.",
  "release.actionPlanApiLabel": "API плану дій",
  "release.actionPlanApiValue": "Кінцева точка того самого джерела",
  "release.demoLocationLabel": "Демонстраційне місце",
  "release.demoLocationValue": "Фіксована точка в місті Barcelona",
  "release.browserLocationLabel": "Місцеположення браузера",
  "release.browserLocationValue": "Недоступне",

  "form.eyebrow": "Демонстрація Barcelona",
  "form.title": "Створіть свій план дій під час спеки",
  "form.introduction":
    "Повідомте лише ті відомості про ситуацію, які потрібні для персоналізації обмеженого плану, перевіреного бекендом. Одне надсилання створює один запит.",
  "form.privacyTitle": "Перед надсиланням",
  "form.privacyDescription":
    "Ваш опис надсилається до OpenAI на серверному боці для обробки за допомогою GPT-5.6. HeatRelay не здійснює навмисного зберігання чи журналювання необробленого тексту; однак політики постачальника щодо обробки даних можуть застосовуватися.",
  "form.identityWarning":
    "Не вказуйте імена, контактні дані, адреси чи іншу інформацію, за якою можна встановити особу.",
  "form.situationLabel": "Опишіть ситуацію, пов’язану зі спекою",
  "form.characterCount": "{{currentCount}} / {{limit}} кодових точок",
  "form.characterCountOverLimit":
    "{{currentCount}} / {{limit}} кодових точок — перевищення на {{overLimitCount}}",
  "form.situationHint":
    "Використовуйте до {{limit}} кодових точок Unicode. Можна описати вік, доступ до охолодження, мобільність, час або в обмеженому обсязі тривожні симптоми.",
  "form.demoButton": "Завантажити демонстрацію Barcelona",
  "form.submitButton": "Створити мій план дій під час спеки",
  "form.submittingButton": "Створюємо ваш план…",
  "form.boundaryNote":
    "Цей MVP використовує фіксовані координати демонстрації Barcelona. Місцеположення браузера поки недоступне. Відстані є оцінками по прямій; HeatRelay не надає медичних рекомендацій або рекомендацій для надзвичайних ситуацій.",
  "form.demoText":
    "Мені 69 років, я живу без інших людей, у мене немає кондиціонера, я повільно ходжу й не розмовляю іспанською.",

  "scenario.heading": "Як ми можемо допомогти?",
  "scenario.selfTitle": "Мені надто спекотно",
  "scenario.selfDescription": "Отримати особистий план дій",
  "scenario.someoneTitle": "Допомогти близькій людині",
  "scenario.someoneDescription": "Створити план для іншої людини",
  "scenario.placeTitle": "Знайти прохолодне місце поруч",
  "scenario.placeDescription": "Показати найближчу перевірену допомогу",
  "scenario.nearestHelp": "Найближча допомога",
  "scenario.importantNow": "Зараз важливо",

  "validation.empty": "Опишіть ситуацію, перш ніж створювати план.",
  "validation.overLimit":
    "Обмежте опис до {{limit}} символів Unicode.",
  "validation.serverInput": "Перевірте опис і спробуйте ще раз.",

  "status.creating": "Створюємо ваш план дій.",
  "status.ready": "Ваш план дій готовий.",
  "status.loadingDetail":
    "Перевіряємо ситуацію, погоду та перевірені варіанти місць…",

  "error.malformedTitle": "Відповідь недоступна",
  "error.malformedMessage": "Не вдалося безпечно показати відповідь.",
  "error.unavailableTitle": "План дій тимчасово недоступний",
  "error.unavailableMessage":
    "План дій тимчасово недоступний. Спробуйте ще раз пізніше.",
  "error.connectionTitle": "Не вдалося підключитися до бекенду",
  "error.connectionMessage":
    "Не вдалося підключитися до бекенду. Перевірте, чи запущені локальні служби.",

  "priority.actNow": "Дійте зараз",
  "priority.prepareNow": "Підготуйтеся зараз",
  "priority.monitorAndPrepare": "Спостерігайте й готуйтеся",

  "result.eyebrow": "Ваш план дій під час спеки в місті Barcelona",
  "result.priorityBadge": "Пріоритет: {{priority}}",
  "result.evaluatedAt": "Оцінено {{dateTime}}",
  "result.weatherSummaryAccessibleName": "Зведення погоди",
  "result.currentTemperature": "Поточна температура",
  "result.feelsLike": "Відчувається як",
  "result.todayMaximum": "Сьогоднішня максимальна температура",
  "result.phaseNow": "Зараз",
  "result.phaseNextFewHours": "Наступні кілька годин",
  "result.phaseTonight": "Сьогодні ввечері",
  "result.bringItemsTitle": "Візьміть із собою",
  "result.explanationTitle": "Чому саме цей план",
  "result.localPhraseTitle": "Місцева фраза",
  "result.localPhraseCatalan": "Каталонська",
  "result.localPhraseSpanish": "Іспанська",
  "result.noPlaceTitle": "Перевірене місце не вибрано",
  "result.noticesTitle": "Повідомлення про безпеку та інформаційні повідомлення",

  "place.backendApprovedLabel": "Варіант місця, схвалений бекендом",
  "place.distanceLabel": "Відстань",
  "place.closesLabel": "Зачиняється",
  "place.accessibilityLabel": "Доступність",
  "place.lastCheckedLabel": "Остання перевірка",
  "place.featuresTitle": "Перевірені зручності",
  "place.noFeatures": "Додаткових перевірених зручностей не вказано.",
  "place.linksAccessibleName": "Офіційні посилання на місце",
  "place.informationLink": "Офіційна інформація",
  "place.sourceLink": "Офіційне джерело",
  "place.mapLink": "Відкрити маршрут у Google Maps",
  "place.cautionsAccessibleName": "Застереження щодо місця",
  "place.addressUnavailable": "Адреса недоступна",
  "place.accessibilityConfirmed": "Доступність підтверджено джерелом",
  "place.accessibilityUnavailable":
    "Джерело повідомляє, що це місце недоступне",
  "place.accessibilityUnknown": "Стан доступності невідомий",

  "feature.indoorSpace": "Приміщення",
  "feature.potableWater": "Питна вода",
  "feature.toilets": "Туалети",
  "feature.microShelter": "Мікроукриття",
  "feature.petsAllowed": "Дозволено з домашніми тваринами",

  "feature.confirmed": "Підтверджено",
  "feature.unavailable": "Не вказано як доступне",
  "feature.unknown": "Не підтверджено",

  "distance.straightLine": "{{distance}} по прямій",

  "urgent.badge": "Терміново · дійте негайно",
  "urgent.eyebrow": "Негайний результат щодо безпеки",
  "urgent.title": "Термінова допомога",
  "urgent.sourceLink": "Офіційні рекомендації служби 112",

  "trust.eyebrow": "Межі довіри",
  "trust.title": "Корисно без перебільшення впевненості.",
  "trust.safetyLabel": "Безпека",
  "trust.safetyTitle": "Інформація, а не медична порада",
  "trust.safetyDescription":
    "Дані про погоду отримані з моделі й не є офіційним попередженням про спеку. Перед поїздкою слід перевірити місця, години роботи, відстань по прямій і можливість дістатися. Терміновий результат використовує фіксований вміст, яким керує бекенд.",
  "trust.privacyLabel": "Конфіденційність",
  "trust.privacyTitle": "Не вказуйте дані, за якими можна встановити особу",
  "trust.privacyDescription":
    "Текст ситуації не зберігається у сховищі браузера. Явно вибрані параметри візуального режиму, мови інтерфейсу та мови плану дій зберігаються локально. До запиту входить лише код вибраної мови плану дій; візуальний режим і мова інтерфейсу не входять. У цій демонстрації HeatRelay не використовує аналітику, файли cookie, параметри URL або геолокацію.",

  "footer.description": "Демонстрація Barcelona · Фіксовані координати",

  "metadata.title": "HeatRelay · Основа пілотного проєкту Barcelona",
  "metadata.description":
    "HeatRelay — це проєкт, який спочатку розробляється для Barcelona, щоб перетворювати попередження про спеку на безпечні наступні кроки.",
} as const satisfies MessageCatalog;
