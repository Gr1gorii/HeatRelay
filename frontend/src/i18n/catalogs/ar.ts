import type { MessageCatalog } from "./en";

export const ARABIC_CATALOG = {
  "app.name": "HeatRelay",

  "navigation.skipToMain": "تخطَّ إلى المحتوى الرئيسي",
  "navigation.homeAccessibleName": "الصفحة الرئيسية لـ HeatRelay",
  "navigation.primaryAccessibleName": "التنقل الرئيسي",
  "navigation.createPlan": "إنشاء خطة",
  "navigation.safetyAndPrivacy": "السلامة والخصوصية",

  "header.settings": "الإعدادات",

"visualMode.label": "الوضع المرئي",
  "visualMode.standard": "قياسي",
  "visualMode.enhanced": "وضوح محسّن",
  "visualMode.highContrast": "تباين عالٍ",
  "visualMode.description":
    "وضع الوضوح المحسّن مخصص للأشخاص ذوي ضعف البصر أو لأي شخص يفضّل محتوى أكبر حجمًا وأكثر وضوحًا.",

  "interfaceLanguage.label": "لغة الواجهة",
  "interfaceLanguage.description":
    "تغيّر عناصر التنقل والنماذج وتسميات الصفحة. ولا تغيّر لغة خطة العمل.",
  "interfaceLanguage.optionWithEnglishName":
    "{{nativeName}} — {{englishName}}",

  "outputLanguage.label": "لغة خطة العمل",
  "outputLanguage.description":
    "تختار لغة خطة العمل التالية. يُحفظ هذا التفضيل في هذا المتصفح ويُرسل مع طلب خطة العمل. ولا يغيّر لغة الواجهة أو يترجم وصفك.",

  "languageContext.title": "معلومات اللغة",
  "languageContext.descriptionLanguage": "لغة الوصف",
  "languageContext.displayedLanguage": "لغة خطة العمل المعروضة",
  "languageContext.nextLanguage": "لغة خطة العمل التالية",
  "languageContext.supportedMismatch":
    "يستخدم الوصف وخطة العمل المعروضة لغتين مختلفتين من اللغات المدعومة. راجع الخطة بعناية واختر لغة أخرى لخطة العمل عند الحاجة.",
  "languageContext.catalanUnavailable":
    "إخراج خطة العمل باللغة الكتالانية غير متاح. راجع الخطة المعروضة بعناية واختر لغة متاحة لخطة العمل عند الحاجة.",
  "languageContext.other":
    "تعذر على HeatRelay مطابقة لغة الوصف مع إحدى لغات الإطلاق المدعومة. راجع الخطة المعروضة بعناية واختر لغة خطة العمل التي تفهمها على أفضل وجه.",
  "languageContext.unknown":
    "تعذر على HeatRelay تحديد لغة الوصف بشكل موثوق. راجع الخطة المعروضة بعناية واختر لغة خطة العمل التي تفهمها على أفضل وجه.",
  "languageContext.nextSelection":
    "لن تُعاد كتابة الخطة المعروضة. يسري اختيارك المحفوظ على الخطة التالية.",
  "languageContext.otherValue": "لغة أخرى",
  "languageContext.unknownValue": "تعذر تحديدها",
  "languageContext.changeAction": "تغيير لغة خطة العمل",

  "hero.eyebrow": "مشروع Barcelona التجريبي · المرحلة 5",
  "hero.title": "من التحذير من الحر إلى خطوة تالية آمنة.",
  "hero.introduction":
    "صِف موقفًا متعلقًا بالحر، وسيطلب HeatRelay من الواجهة الخلفية الحالية خطة عمل واحدة في Barcelona مرتكزة على الحقائق، باستخدام إحداثيات تجريبية ثابتة.",
  "hero.action": "إنشاء خطة لـ Barcelona",

  "release.kicker": "الإصدار الحالي",
  "release.badge": "عرض Barcelona التجريبي",
  "release.title": "سير عمل واحد مملوك للخادم",
  "release.description":
    "لا يرسل المتصفح سوى وصفك وإعدادات عرض Barcelona التجريبي الثابتة. وتظل بيانات الطقس والأولوية والأماكن والتحقق من الحقائق في الواجهة الخلفية.",
  "release.actionPlanApiLabel": "واجهة API لخطة العمل",
  "release.actionPlanApiValue": "نقطة نهاية من المصدر نفسه",
  "release.demoLocationLabel": "الموقع التجريبي",
  "release.demoLocationValue": "نقطة ثابتة في Barcelona",
  "release.browserLocationLabel": "موقع المتصفح",
  "release.browserLocationValue": "غير متاح",

  "form.eyebrow": "عرض Barcelona التجريبي",
  "form.title": "أنشئ خطة عملك لمواجهة الحر",
  "form.introduction":
    "شارك فقط تفاصيل الموقف اللازمة لتخصيص خطة محدودة النطاق وتتحقق منها الواجهة الخلفية. يؤدي كل إرسال إلى طلب واحد.",
  "form.privacyTitle": "قبل الإرسال",
  "form.privacyDescription":
    "يُرسل وصفك من جانب الخادم إلى OpenAI لمعالجته باستخدام GPT-5.6. لا يتعمد HeatRelay تخزين النص الخام أو تسجيله؛ ومع ذلك، قد تظل سياسات مزود الخدمة لمعالجة البيانات سارية.",
  "form.identityWarning":
    "لا تُدرج أسماء أو تفاصيل اتصال أو عناوين أو أي معلومات أخرى تكشف الهوية.",
  "form.situationLabel": "صِف الموقف المتعلق بالحر",
  "form.characterCount": "{{currentCount}} / {{limit}} نقطة ترميز",
  "form.characterCountOverLimit":
    "{{currentCount}} / {{limit}} نقطة ترميز — تجاوز الحد بمقدار {{overLimitCount}}",
  "form.situationHint":
    "استخدم ما يصل إلى {{limit}} نقطة ترميز Unicode. يمكنك وصف العمر أو إمكانية الوصول إلى مكان للتبريد أو القدرة على الحركة أو التوقيت أو أعراض التحذير المحدودة النطاق.",
  "form.demoButton": "تحميل عرض Barcelona التجريبي",
  "form.submitButton": "إنشاء خطة عملي لمواجهة الحر",
  "form.submittingButton": "جارٍ إنشاء خطتك…",
  "form.boundaryNote":
    "يستخدم هذا المنتج الأولي إحداثيات تجريبية ثابتة في Barcelona. موقع المتصفح غير متاح بعد. المسافات تقديرات بخط مستقيم؛ ولا يقدم HeatRelay نصائح طبية أو إرشادات لحالات الطوارئ.",
  "form.demoText":
    "عمري 69 عامًا، وأعيش وحدي، وليس لدي تكييف هواء، وأمشي ببطء، ولا أتحدث الإسبانية.",

  "scenario.heading": "كيف يمكننا المساعدة؟",
  "scenario.selfTitle": "أشعر بحر شديد",
  "scenario.selfDescription": "أنشئ خطة عمل شخصية",
  "scenario.someoneTitle": "ساعد شخصًا قريبًا منك",
  "scenario.someoneDescription": "أنشئ خطة لشخص آخر",
  "scenario.placeTitle": "اعثر على مكان بارد قريب",
  "scenario.placeDescription": "اعرض أقرب مساعدة موثقة",
  "scenario.nearestHelp": "أقرب مساعدة",
  "scenario.importantNow": "مهم الآن",

  "validation.empty": "صِف الموقف قبل إنشاء خطة.",
  "validation.overLimit":
    "أبقِ الوصف ضمن {{limit}} حرف Unicode.",
  "validation.serverInput": "راجع الوصف وحاول مرة أخرى.",

  "status.creating": "جارٍ إنشاء خطة عملك.",
  "status.ready": "خطة عملك جاهزة.",
  "status.loadingDetail":
    "جارٍ التحقق من الموقف والطقس والخيارات المرشحة التي تم التحقق منها…",

  "error.malformedTitle": "الاستجابة غير متاحة",
  "error.malformedMessage": "تعذر عرض الاستجابة بأمان.",
  "error.unavailableTitle": "خطة العمل غير متاحة مؤقتًا",
  "error.unavailableMessage":
    "خطة العمل غير متاحة مؤقتًا. يُرجى المحاولة مرة أخرى لاحقًا.",
  "error.connectionTitle": "تعذر الوصول إلى الواجهة الخلفية",
  "error.connectionMessage":
    "تعذر الوصول إلى الواجهة الخلفية. تحقق من تشغيل الخدمات المحلية.",

  "priority.actNow": "تصرّف الآن",
  "priority.prepareNow": "استعد الآن",
  "priority.monitorAndPrepare": "راقب الوضع واستعد",

  "result.eyebrow": "خطة عملك لمواجهة الحر في Barcelona",
  "result.priorityBadge": "الأولوية: {{priority}}",
  "result.evaluatedAt": "وقت التقييم: {{dateTime}}",
  "result.weatherSummaryAccessibleName": "ملخص الطقس",
  "result.currentTemperature": "درجة الحرارة الحالية",
  "result.feelsLike": "درجة الحرارة المحسوسة",
  "result.todayMaximum": "الدرجة القصوى اليوم",
  "result.phaseNow": "الآن",
  "result.phaseNextFewHours": "الساعات القليلة القادمة",
  "result.phaseTonight": "الليلة",
  "result.bringItemsTitle": "ما يجب أن تأخذه معك",
  "result.explanationTitle": "سبب هذه الخطة",
  "result.localPhraseTitle": "عبارة محلية",
  "result.localPhraseCatalan": "الكتالانية",
  "result.localPhraseSpanish": "الإسبانية",
  "result.noPlaceTitle": "لم يُحدَّد مكان متحقق منه",
  "result.noticesTitle": "إشعارات السلامة والمعلومات",

  "place.backendApprovedLabel": "خيار مرشح معتمد من الواجهة الخلفية",
  "place.distanceLabel": "المسافة",
  "place.closesLabel": "موعد الإغلاق",
  "place.accessibilityLabel": "إمكانية الوصول",
  "place.lastCheckedLabel": "آخر تحقق",
  "place.featuresTitle": "الميزات المتحقق منها",
  "place.noFeatures": "لا توجد ميزات إضافية متحقق منها مُدرجة.",
  "place.linksAccessibleName": "روابط المكان الرسمية",
  "place.informationLink": "المعلومات الرسمية",
  "place.sourceLink": "المصدر الرسمي",
  "place.mapLink": "فتح المسار في خرائط Google",
  "place.cautionsAccessibleName": "تنبيهات خاصة بالمكان",
  "place.addressUnavailable": "العنوان غير متاح",
  "place.accessibilityConfirmed": "أكد المصدر إمكانية الوصول",
  "place.accessibilityUnavailable":
    "يفيد المصدر بأن هذا المكان غير مهيأ للوصول",
  "place.accessibilityUnknown": "حالة إمكانية الوصول غير معروفة",

  "feature.indoorSpace": "مساحة داخلية",
  "feature.potableWater": "مياه صالحة للشرب",
  "feature.toilets": "دورات مياه",
  "feature.microShelter": "مأوى صغير",
  "feature.petsAllowed": "مسموح بالحيوانات الأليفة",

  "feature.confirmed": "مؤكّد",
  "feature.unavailable": "غير مدرج كمتاح",
  "feature.unknown": "غير مؤكّد",

  "distance.straightLine": "{{distance}} بخط مستقيم",

  "urgent.badge": "عاجل · تصرّف فورًا",
  "urgent.eyebrow": "نتيجة سلامة فورية",
  "urgent.title": "مساعدة عاجلة",
  "urgent.sourceLink": "إرشادات 112 الرسمية",

  "trust.eyebrow": "حدود الثقة",
  "trust.title": "معلومات مفيدة دون مبالغة في اليقين.",
  "trust.safetyLabel": "السلامة",
  "trust.safetyTitle": "معلومات وليست نصيحة طبية",
  "trust.safetyDescription":
    "بيانات الطقس مستمدة من نموذج وليست تحذيرًا رسميًا من الحر. يجب التحقق من الأماكن وساعات العمل والمسافة بخط مستقيم وإمكانية الوصول إليها قبل السفر. تستخدم النتائج العاجلة محتوى ثابتًا مملوكًا للواجهة الخلفية.",
  "trust.privacyLabel": "الخصوصية",
  "trust.privacyTitle": "لا تُدرج تفاصيل تكشف الهوية",
  "trust.privacyDescription":
    "لا يُخزن نص الموقف في مساحة تخزين المتصفح. تُحفظ محليًا تفضيلات الوضع المرئي ولغة الواجهة ولغة خطة العمل المحددة صراحةً. لا يدخل في طلب خطة العمل سوى رمز لغة خطة العمل المحددة؛ ولا يدخل الوضع المرئي أو لغة الواجهة. لا يستخدم HeatRelay التحليلات أو ملفات تعريف الارتباط أو معلمات URL أو تحديد الموقع الجغرافي في هذا العرض التجريبي.",

  "footer.description": "عرض Barcelona التجريبي · إحداثيات ثابتة",

  "metadata.title": "HeatRelay · الأساس التجريبي في Barcelona",
  "metadata.description":
    "HeatRelay مشروع يبدأ من Barcelona ويجري تطويره لتحويل تحذيرات الحر إلى خطوات تالية آمنة.",
} as const satisfies MessageCatalog;
