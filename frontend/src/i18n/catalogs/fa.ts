import type { MessageCatalog } from "./en";

export const PERSIAN_CATALOG = {
  "app.name": "HeatRelay",

  "navigation.skipToMain": "رفتن به محتوای اصلی",
  "navigation.homeAccessibleName": "صفحه اصلی HeatRelay",
  "navigation.primaryAccessibleName": "اصلی",
  "navigation.createPlan": "ایجاد برنامه",
  "navigation.safetyAndPrivacy": "ایمنی و حریم خصوصی",

  "header.settings": "تنظیمات",

"visualMode.label": "حالت نمایش",
  "visualMode.standard": "استاندارد",
  "visualMode.enhanced": "دید بهتر",
  "visualMode.highContrast": "کنتراست بالا",
  "visualMode.description":
    "حالت دید بهتر برای افراد کم‌بینا یا هر کسی است که محتوای بزرگ‌تر و واضح‌تر را ترجیح می‌دهد.",

  "interfaceLanguage.label": "زبان",
  "interfaceLanguage.description":
    "زبان رابط کاربری و برنامه اقدام بعدی را تغییر می‌دهد. توضیحات شما را ترجمه نمی‌کند و برنامه نمایش‌داده‌شده را بازنویسی نمی‌کند.",
  "interfaceLanguage.optionWithEnglishName":
    "{{nativeName}} — {{englishName}}",

  "outputLanguage.label": "زبان برنامه اقدام",
  "outputLanguage.description":
    "زبان برنامه اقدام بعدی را انتخاب می‌کند. این ترجیح در این مرورگر ذخیره می‌شود و همراه درخواست برنامه اقدام ارسال می‌شود. زبان رابط کاربری را تغییر نمی‌دهد و توضیح شما را ترجمه نمی‌کند.",

  "languageContext.title": "اطلاعات زبان",
  "languageContext.descriptionLanguage": "زبان توضیحات",
  "languageContext.displayedLanguage": "زبان برنامه اقدام نمایش‌داده‌شده",
  "languageContext.nextLanguage": "زبان برنامه اقدام بعدی",
  "languageContext.supportedMismatch":
    "توضیحات و برنامه نمایش‌داده‌شده از دو زبان پشتیبانی‌شده متفاوت استفاده می‌کنند. برنامه را با دقت بررسی کنید و در صورت نیاز زبان دیگری برای برنامه اقدام انتخاب کنید.",
  "languageContext.catalanUnavailable":
    "خروجی برنامه اقدام به زبان کاتالان در دسترس نیست. برنامه نمایش‌داده‌شده را با دقت بررسی کنید و در صورت نیاز یک زبان در دسترس برای برنامه اقدام انتخاب کنید.",
  "languageContext.other":
    "HeatRelay نتوانست زبان توضیحات را با یکی از زبان‌های پشتیبانی‌شده برای راه‌اندازی مطابقت دهد. برنامه نمایش‌داده‌شده را با دقت بررسی کنید و زبانی را برای برنامه اقدام انتخاب کنید که بهتر می‌فهمید.",
  "languageContext.unknown":
    "HeatRelay نتوانست زبان توضیحات را با اطمینان تعیین کند. برنامه نمایش‌داده‌شده را با دقت بررسی کنید و زبانی را برای برنامه اقدام انتخاب کنید که بهتر می‌فهمید.",
  "languageContext.nextSelection":
    "برنامه نمایش‌داده‌شده بازنویسی نمی‌شود. انتخاب ذخیره‌شده شما برای برنامه بعدی اعمال می‌شود.",
  "languageContext.otherValue": "زبانی دیگر",
  "languageContext.unknownValue": "قابل تعیین نبود",
  "languageContext.changeAction": "تغییر زبان",

  "hero.eyebrow": "نسخه آزمایشی Barcelona · مرحله ۵",
  "hero.title": "از هشدار گرما تا یک گام بعدی امن.",
  "hero.introduction":
    "یک وضعیت گرمایی را شرح دهید تا HeatRelay با استفاده از مختصات ثابت نسخه نمایشی، از سامانه پشتی موجود یک برنامه اقدام مبتنی بر اطلاعات واقعی برای Barcelona درخواست کند.",
  "hero.action": "ایجاد برنامه برای Barcelona",

  "release.kicker": "نسخه کنونی",
  "release.badge": "نسخه نمایشی Barcelona",
  "release.title": "یک گردش کار تحت کنترل سرور",
  "release.description":
    "مرورگر فقط شرح شما و تنظیمات ثابت نسخه نمایشی Barcelona را ارسال می‌کند. آب‌وهوا، اولویت، مکان‌ها و اعتبارسنجی اطلاعات واقعی در سامانه پشتی انجام می‌شوند.",
  "release.actionPlanApiLabel": "API برنامه اقدام",
  "release.actionPlanApiValue": "نقطه پایانی هم‌مبدأ",
  "release.demoLocationLabel": "مکان نمایشی",
  "release.demoLocationValue": "نقطه ثابت Barcelona",
  "release.browserLocationLabel": "مکان مرورگر",
  "release.browserLocationValue": "در دسترس نیست",

  "form.eyebrow": "نسخه نمایشی Barcelona",
  "form.title": "برنامه اقدام خود برای گرما را ایجاد کنید",
  "form.introduction":
    "فقط جزئیات لازم وضعیت را برای شخصی‌سازی یک برنامه محدود و اعتبارسنجی‌شده توسط سامانه پشتی به اشتراک بگذارید. هر ارسال یک درخواست ایجاد می‌کند.",
  "form.privacyTitle": "حریم خصوصی و جزئیات نسخه نمایشی",
  "form.privacyDescription":
    "شرح شما در سمت سرور برای پردازش با GPT-5.6 به OpenAI ارسال می‌شود. HeatRelay عمداً متن خام را ذخیره یا ثبت نمی‌کند؛ با این حال ممکن است سیاست‌های ارائه‌دهنده درباره مدیریت داده اعمال شوند.",
  "form.identityWarning":
    "OpenAI این متن را پردازش می‌کند. نام، اطلاعات تماس یا نشانی وارد نکنید. نقطه ثابت نمایشی Barcelona؛ این کمک اضطراری نیست.",
  "form.situationLabel": "وضعیت گرمایی را شرح دهید",
  "form.characterCount": "{{currentCount}} / {{limit}} نویسه",
  "form.characterCountOverLimit":
    "{{currentCount}} / {{limit}} نویسه — {{overLimitCount}} نویسه کوتاه کنید",
  "form.situationHint":
    "سن · دسترسی به خنکی · توانایی جابه‌جایی · علائم",
  "form.demoButton": "بارگذاری نمونه Barcelona",
  "form.submitButton": "ایجاد برنامه اقدام من برای گرما",
  "form.submittingButton": "در حال ایجاد برنامه شما…",
  "form.boundaryNote":
    "این محصول اولیه از مختصات ثابت نسخه نمایشی Barcelona استفاده می‌کند. مکان مرورگر هنوز در دسترس نیست. فاصله‌ها برآوردهای خط مستقیم هستند؛ HeatRelay توصیه پزشکی یا اورژانسی ارائه نمی‌دهد.",
  "form.demoText":
    "۶۹ ساله‌ام، تنها زندگی می‌کنم، دستگاه تهویه مطبوع ندارم، آهسته راه می‌روم و اسپانیایی صحبت نمی‌کنم.",

  "scenario.heading": "چگونه می‌توانیم کمک کنیم؟",
  "scenario.selfTitle": "خیلی گرمم است",
  "scenario.selfDescription": "یک برنامه اقدام شخصی بسازید",
  "scenario.someoneTitle": "به فردی نزدیک کمک کنید",
  "scenario.someoneDescription": "برای فرد دیگری برنامه بسازید",
  "scenario.placeTitle": "یک مکان خنک در محدوده آزمایشی Barcelona پیدا کنید",
  "scenario.placeDescription": "اطلاعات واقعی مکان‌ها را جست‌وجو کنید",
  "scenario.nearestHelp": "اطلاعات مکان‌های Barcelona",
  "scenario.importantNow": "اکنون مهم است",
  "scenario.initialTipCoolestSpot":
    "در همان جایی که هستید به خنک‌ترین نقطه در دسترس بروید.",
  "scenario.initialTipReduceEffort": "فعلاً فعالیت بدنی را کاهش دهید.",
  "scenario.initialTipDrinkWater":
    "اگر ایمن است، به‌طور منظم آب بنوشید.",

  "placeLookup.searchAction": "جست‌وجوی مکان‌های آزمایشی Barcelona",
  "placeLookup.loading": "در حال جست‌وجوی داده‌های تأییدشده مکان‌ها…",
  "placeLookup.resultsTitle": "نتایج مکان‌های Barcelona",
  "placeLookup.emptyTitle": "مکان منطبقی پیدا نشد",
  "placeLookup.emptyMessage":
    "هیچ مکانی با نقطه ثابت آزمایشی، زمان فعلی دستگاه و محدوده‌های جست‌وجو مطابقت نداشت.",
  "placeLookup.errorTitle": "اطلاعات مکان در دسترس نیست",
  "placeLookup.errorMessage":
    "اطلاعات مکان را نمی‌توان با ایمنی نمایش داد. فقط در صورت انتخاب خودتان دوباره تلاش کنید.",
  "placeLookup.compactBoundary":
    "نقطه ثابت نمایشی Barcelona · فاصله مستقیم · ساعت‌ها و دسترس‌پذیری را بررسی کنید",
  "placeLookup.boundary":
    "از نقطه ثابت آزمایشی Barcelona استفاده می‌کند، نه موقعیت شما. فاصله‌ها خط مستقیم هستند، نه مسیر یا زمان تخمینی رسیدن. ساعات کار با زمان دستگاه شما ارزیابی می‌شوند. پیش از رفتن، ساعات و دسترس‌پذیری را بررسی کنید. این کمک پزشکی یا اضطراری نیست.",

  "validation.empty": "پیش از ایجاد برنامه، وضعیت را شرح دهید.",
  "validation.overLimit": "شرح بیش از حد طولانی است. متن را کوتاه کنید.",
  "validation.serverInput": "شرح را بررسی و دوباره تلاش کنید.",

  "status.creating": "در حال ایجاد برنامه اقدام شما.",
  "status.ready": "برنامه اقدام شما آماده است.",
  "status.loadingDetail":
    "در حال بررسی وضعیت، آب‌وهوا و گزینه‌های تأییدشده…",

  "error.malformedTitle": "پاسخ در دسترس نیست",
  "error.malformedMessage": "نمایش ایمن پاسخ ممکن نبود.",
  "error.unavailableTitle": "برنامه اقدام موقتاً در دسترس نیست",
  "error.unavailableMessage":
    "برنامه اقدام موقتاً در دسترس نیست. لطفاً بعداً دوباره تلاش کنید.",
  "error.connectionTitle": "دسترسی به سامانه پشتی ممکن نبود",
  "error.connectionMessage":
    "دسترسی به سامانه پشتی ممکن نبود. بررسی کنید که سرویس‌های محلی در حال اجرا باشند.",

  "priority.actNow": "اکنون اقدام کنید",
  "priority.prepareNow": "اکنون آماده شوید",
  "priority.monitorAndPrepare": "پیگیری و آماده شوید",

  "result.eyebrow": "برنامه اقدام شما برای گرمای Barcelona",
  "result.priorityBadge": "اولویت: {{priority}}",
  "result.evaluatedAt": "ارزیابی‌شده در {{dateTime}}",
  "result.weatherSummaryAccessibleName": "خلاصه آب‌وهوا",
  "result.currentTemperature": "دمای کنونی",
  "result.feelsLike": "دمای احساسی",
  "result.todayMaximum": "بیشینه امروز",
  "result.phaseNow": "اکنون",
  "result.phaseNextFewHours": "چند ساعت آینده",
  "result.phaseTonight": "امشب",
  "result.bringItemsTitle": "همراه خود ببرید",
  "result.explanationTitle": "دلیل این برنامه",
  "result.localPhraseTitle": "یک عبارت محلی",
  "result.localPhraseCatalan": "کاتالان",
  "result.localPhraseSpanish": "اسپانیایی",
  "result.noPlaceTitle": "هیچ مکان تأییدشده‌ای انتخاب نشد",
  "result.noticesTitle": "اطلاعیه‌های ایمنی و اطلاعاتی",

  "place.backendApprovedLabel": "گزینه تأییدشده توسط سامانه پشتی",
  "place.distanceLabel": "فاصله",
  "place.closesLabel": "زمان بسته‌شدن",
  "place.accessibilityLabel": "دسترس‌پذیری",
  "place.lastCheckedLabel": "آخرین بررسی",
  "place.featuresTitle": "امکانات تأییدشده",
  "place.noFeatures": "هیچ امکان تأییدشده دیگری فهرست نشده است.",
  "place.linksAccessibleName": "پیوندهای رسمی مکان",
  "place.informationLink": "اطلاعات رسمی",
  "place.sourceLink": "منبع رسمی",
  "place.mapLink": "باز کردن در Google Maps",
  "place.cautionsAccessibleName": "هشدارهای مربوط به مکان",
  "place.addressUnavailable": "نشانی در دسترس نیست",
  "place.accessibilityConfirmed": "دسترس‌پذیری توسط منبع تأیید شده است",
  "place.accessibilityUnavailable":
    "منبع گزارش می‌دهد که این مکان دسترس‌پذیر نیست",
  "place.accessibilityUnknown": "وضعیت دسترس‌پذیری نامشخص است",

  "feature.indoorSpace": "فضای سرپوشیده",
  "feature.potableWater": "آب آشامیدنی",
  "feature.toilets": "سرویس بهداشتی",
  "feature.microShelter": "پناهگاه کوچک",
  "feature.petsAllowed": "ورود حیوانات خانگی مجاز است",

  "feature.confirmed": "تأیید شده",
  "feature.unavailable": "به‌عنوان موجود فهرست نشده",
  "feature.unknown": "تأیید نشده",

  "distance.straightLine": "{{distance}} در خط مستقیم",

  "urgent.badge": "فوری · بی‌درنگ اقدام کنید",
  "urgent.eyebrow": "نتیجه فوری ایمنی",
  "urgent.title": "کمک فوری",
  "urgent.sourceLink": "راهنمای رسمی 112",

  "trust.eyebrow": "مرزهای اعتماد",
  "trust.title": "مفید، بدون اغراق در میزان اطمینان.",
  "trust.safetyLabel": "ایمنی",
  "trust.safetyTitle": "اطلاعات، نه توصیه پزشکی",
  "trust.safetyDescription":
    "اطلاعات آب‌وهوا از مدل به دست می‌آید و هشدار رسمی گرما نیست. مکان‌ها، ساعت‌های فعالیت، فاصله خط مستقیم و امکان رسیدن به آن‌ها باید پیش از حرکت بررسی شوند. خروجی فوری از محتوای ثابت تحت کنترل سامانه پشتی استفاده می‌کند.",
  "trust.privacyLabel": "حریم خصوصی",
  "trust.privacyTitle": "اطلاعات شناسایی‌کننده را وارد نکنید",
  "trust.privacyDescription":
    "متن وضعیت در فضای ذخیره‌سازی مرورگر نگهداری نمی‌شود. ترجیحات صریح حالت نمایش و زبان به‌صورت محلی ذخیره می‌شوند. فقط کد زبان انتخاب‌شده وارد درخواست برنامه اقدام می‌شود؛ حالت نمایش وارد نمی‌شود. HeatRelay در این نسخه نمایشی از ابزارهای تحلیل، کوکی‌ها، پارامترهای URL یا موقعیت جغرافیایی استفاده نمی‌کند.",

  "footer.description": "نسخه نمایشی Barcelona · مختصات ثابت",

  "metadata.title": "HeatRelay · بنیان نسخه آزمایشی Barcelona",
  "metadata.description":
    "HeatRelay پروژه‌ای با تمرکز اولیه بر Barcelona است که برای تبدیل هشدارهای گرما به گام‌های بعدی امن ساخته می‌شود.",
} as const satisfies MessageCatalog;
