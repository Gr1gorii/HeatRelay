import type { MessageCatalog } from "./en";

export const HINDI_CATALOG = {
  "app.name": "HeatRelay",

  "navigation.skipToMain": "मुख्य सामग्री पर जाएँ",
  "navigation.homeAccessibleName": "HeatRelay मुखपृष्ठ",
  "navigation.primaryAccessibleName": "प्राथमिक",
  "navigation.createPlan": "योजना बनाएँ",
  "navigation.safetyAndPrivacy": "सुरक्षा और गोपनीयता",

  "header.settings": "सेटिंग्स",

"visualMode.label": "दृश्य मोड",
  "visualMode.standard": "मानक",
  "visualMode.enhanced": "बेहतर दृश्यता",
  "visualMode.highContrast": "उच्च कंट्रास्ट",
  "visualMode.description":
    "बेहतर दृश्यता कम दृष्टि वाले लोगों या अधिक बड़ी और स्पष्ट सामग्री पसंद करने वाले किसी भी व्यक्ति के लिए है।",

  "interfaceLanguage.label": "भाषा",
  "interfaceLanguage.description":
    "इंटरफ़ेस और अगली कार्य-योजना की भाषा बदलती है। यह आपके विवरण का अनुवाद या दिखाई गई योजना को दोबारा नहीं लिखती।",
  "interfaceLanguage.optionWithEnglishName":
    "{{nativeName}} — {{englishName}}",

  "outputLanguage.label": "कार्य-योजना की भाषा",
  "outputLanguage.description":
    "अगली कार्य-योजना की भाषा चुनती है। यह प्राथमिकता इस ब्राउज़र में सहेजी जाती है और कार्य-योजना अनुरोध के साथ भेजी जाती है। यह इंटरफ़ेस की भाषा नहीं बदलती और आपके विवरण का अनुवाद नहीं करती।",

  "languageContext.title": "भाषा संबंधी जानकारी",
  "languageContext.descriptionLanguage": "विवरण की भाषा",
  "languageContext.displayedLanguage": "दिखाई गई कार्य-योजना की भाषा",
  "languageContext.nextLanguage": "अगली कार्य-योजना की भाषा",
  "languageContext.supportedMismatch":
    "विवरण और दिखाई गई योजना अलग-अलग समर्थित भाषाओं में हैं। योजना को ध्यान से पढ़ें और ज़रूरत हो तो कार्य-योजना के लिए दूसरी भाषा चुनें।",
  "languageContext.catalanUnavailable":
    "कातालान में कार्य-योजना उपलब्ध नहीं है। दिखाई गई योजना को ध्यान से पढ़ें और ज़रूरत हो तो कार्य-योजना के लिए उपलब्ध भाषा चुनें।",
  "languageContext.other":
    "HeatRelay विवरण की भाषा को अपनी समर्थित लॉन्च भाषाओं में से किसी से नहीं मिला सका। दिखाई गई योजना को ध्यान से पढ़ें और कार्य-योजना के लिए वह भाषा चुनें जिसे आप सबसे अच्छी तरह समझते हैं।",
  "languageContext.unknown":
    "HeatRelay विवरण की भाषा को विश्वसनीय रूप से निर्धारित नहीं कर सका। दिखाई गई योजना को ध्यान से पढ़ें और कार्य-योजना के लिए वह भाषा चुनें जिसे आप सबसे अच्छी तरह समझते हैं।",
  "languageContext.nextSelection":
    "दिखाई गई योजना दोबारा नहीं लिखी जाती। आपकी सहेजी गई पसंद अगली योजना पर लागू होगी।",
  "languageContext.otherValue": "कोई दूसरी भाषा",
  "languageContext.unknownValue": "निर्धारित नहीं किया जा सका",
  "languageContext.changeAction": "भाषा बदलें",

  "hero.eyebrow": "Barcelona पायलट · माइलस्टोन 5",
  "hero.title": "गर्मी की चेतावनी से एक सुरक्षित अगले कदम तक।",
  "hero.introduction":
    "गर्मी से जुड़ी स्थिति का वर्णन करें और HeatRelay निर्धारित डेमो निर्देशांकों का उपयोग करके Barcelona की एक तथ्य-आधारित कार्य-योजना के लिए मौजूदा बैकएंड से अनुरोध करेगा।",
  "hero.action": "Barcelona की योजना बनाएँ",

  "release.kicker": "मौजूदा रिलीज़",
  "release.badge": "Barcelona डेमो",
  "release.title": "सर्वर के नियंत्रण वाला एक वर्कफ़्लो",
  "release.description":
    "ब्राउज़र केवल आपका विवरण और Barcelona डेमो की निर्धारित सेटिंग भेजता है। मौसम, प्राथमिकता, स्थान और तथ्यों की पुष्टि बैकएंड पर ही होती है।",
  "release.actionPlanApiLabel": "कार्य-योजना API",
  "release.actionPlanApiValue": "समान-ओरिजिन एंडपॉइंट",
  "release.demoLocationLabel": "डेमो स्थान",
  "release.demoLocationValue": "Barcelona का निर्धारित बिंदु",
  "release.browserLocationLabel": "ब्राउज़र स्थान",
  "release.browserLocationValue": "उपलब्ध नहीं",

  "form.eyebrow": "Barcelona डेमो",
  "form.title": "गर्मी से निपटने की अपनी कार्य-योजना बनाएँ",
  "form.introduction":
    "सीमित दायरे वाली, बैकएंड से सत्यापित योजना को आपकी स्थिति के अनुसार बनाने के लिए केवल आवश्यक विवरण साझा करें। एक बार जमा करने पर एक अनुरोध जाता है।",
  "form.privacyTitle": "गोपनीयता और डेमो का विवरण",
  "form.privacyDescription":
    "आपका विवरण GPT-5.6 द्वारा प्रसंस्करण के लिए सर्वर से OpenAI को भेजा जाता है। HeatRelay जानबूझकर मूल पाठ को संग्रहीत या लॉग नहीं करता; फिर भी प्रदाता की डेटा-प्रबंधन नीतियाँ लागू हो सकती हैं।",
  "form.identityWarning":
    "OpenAI इस पाठ को संसाधित करता है। नाम, संपर्क विवरण या पते दर्ज न करें। Barcelona का निश्चित डेमो बिंदु; यह आपातकालीन सहायता नहीं है।",
  "form.situationLabel": "गर्मी की स्थिति का वर्णन करें",
  "form.characterCount": "{{currentCount}} / {{limit}} अक्षर",
  "form.characterCountOverLimit":
    "{{currentCount}} / {{limit}} अक्षर — {{overLimitCount}} कम करें",
  "form.situationHint":
    "उम्र · ठंडक की उपलब्धता · चलने-फिरने की क्षमता · लक्षण",
  "form.demoButton": "Barcelona डेमो लोड करें",
  "form.submitButton": "गर्मी से निपटने की मेरी कार्य-योजना बनाएँ",
  "form.submittingButton": "आपकी योजना बनाई जा रही है…",
  "form.boundaryNote":
    "यह MVP Barcelona डेमो के निर्धारित निर्देशांकों का उपयोग करता है। ब्राउज़र स्थान अभी उपलब्ध नहीं है। दूरियाँ सीधी रेखा के अनुमान हैं; HeatRelay चिकित्सीय या आपातकालीन सलाह नहीं है।",
  "form.demoText":
    "मेरी उम्र 69 वर्ष है, मेरे घर में कोई और नहीं रहता, एयर कंडीशनिंग उपलब्ध नहीं है, चलने की गति धीमी है और मुझे स्पेनिश नहीं आती।",

  "scenario.heading": "हम कैसे मदद कर सकते हैं?",
  "scenario.selfTitle": "मुझे बहुत गर्मी लग रही है",
  "scenario.selfDescription": "व्यक्तिगत कार्य योजना बनाएँ",
  "scenario.someoneTitle": "किसी करीबी की मदद करें",
  "scenario.someoneDescription": "किसी अन्य व्यक्ति के लिए योजना बनाएँ",
  "scenario.placeTitle": "Barcelona डेमो क्षेत्र में ठंडी जगह खोजें",
  "scenario.placeDescription": "स्थानों की तथ्यात्मक जानकारी खोजें",
  "scenario.nearestHelp": "Barcelona स्थान जानकारी",
  "scenario.importantNow": "अभी महत्वपूर्ण",
  "scenario.initialTipCoolestSpot":
    "जहाँ आप अभी हैं, वहीं उपलब्ध सबसे ठंडी जगह पर जाएँ।",
  "scenario.initialTipReduceEffort": "अभी शारीरिक मेहनत कम करें।",
  "scenario.initialTipDrinkWater":
    "यदि सुरक्षित हो तो नियमित रूप से पानी पिएँ।",

  "placeLookup.searchAction": "Barcelona डेमो स्थान खोजें",
  "placeLookup.loading": "सत्यापित स्थान डेटा खोजा जा रहा है…",
  "placeLookup.resultsTitle": "Barcelona स्थान परिणाम",
  "placeLookup.emptyTitle": "कोई मेल खाने वाला स्थान नहीं मिला",
  "placeLookup.emptyMessage":
    "कोई स्थान तय डेमो बिंदु, डिवाइस के वर्तमान समय और खोज सीमाओं से मेल नहीं खाया।",
  "placeLookup.errorTitle": "स्थान की जानकारी उपलब्ध नहीं है",
  "placeLookup.errorMessage":
    "स्थान की जानकारी सुरक्षित रूप से नहीं दिखाई जा सकी। केवल अपने चुनाव पर फिर कोशिश करें।",
  "placeLookup.compactBoundary":
    "Barcelona का निश्चित डेमो बिंदु · सीधी रेखा की दूरी · समय और पहुँच-योग्यता जाँचें",
  "placeLookup.boundary":
    "यह आपके स्थान के बजाय तय Barcelona डेमो बिंदु का उपयोग करता है। दूरियाँ सीधी रेखा में हैं, मार्ग या अनुमानित पहुँच समय नहीं। खुलने के समय का मूल्यांकन आपके डिवाइस के समय से होता है। जाने से पहले समय और पहुँच-योग्यता जाँचें। यह चिकित्सीय या आपातकालीन सहायता नहीं है।",

  "validation.empty": "योजना बनाने से पहले स्थिति का वर्णन करें।",
  "validation.overLimit": "विवरण बहुत लंबा है। पाठ छोटा करें।",
  "validation.serverInput": "विवरण की समीक्षा करें और फिर कोशिश करें।",

  "status.creating": "आपकी कार्य-योजना बनाई जा रही है।",
  "status.ready": "आपकी कार्य-योजना तैयार है।",
  "status.loadingDetail":
    "स्थिति, मौसम और सत्यापित विकल्पों की जाँच की जा रही है…",

  "error.malformedTitle": "जवाब उपलब्ध नहीं है",
  "error.malformedMessage": "जवाब को सुरक्षित रूप से दिखाया नहीं जा सका।",
  "error.unavailableTitle": "कार्य-योजना अस्थायी रूप से उपलब्ध नहीं है",
  "error.unavailableMessage":
    "कार्य-योजना अस्थायी रूप से उपलब्ध नहीं है। कृपया बाद में फिर कोशिश करें।",
  "error.connectionTitle": "बैकएंड से संपर्क नहीं हो सका",
  "error.connectionMessage":
    "बैकएंड से संपर्क नहीं हो सका। जाँचें कि स्थानीय सेवाएँ चल रही हैं।",

  "priority.actNow": "अभी कार्रवाई करें",
  "priority.prepareNow": "अभी तैयारी करें",
  "priority.monitorAndPrepare": "निगरानी रखें और तैयारी करें",

  "result.eyebrow": "Barcelona के लिए आपकी गर्मी संबंधी कार्य-योजना",
  "result.priorityBadge": "प्राथमिकता: {{priority}}",
  "result.evaluatedAt": "{{dateTime}} पर मूल्यांकन किया गया",
  "result.weatherSummaryAccessibleName": "मौसम का सारांश",
  "result.currentTemperature": "वर्तमान तापमान",
  "result.feelsLike": "महसूस होने वाला तापमान",
  "result.todayMaximum": "आज का अधिकतम तापमान",
  "result.phaseNow": "अभी",
  "result.phaseNextFewHours": "अगले कुछ घंटे",
  "result.phaseTonight": "आज रात",
  "result.bringItemsTitle": "अपने साथ ले जाएँ",
  "result.explanationTitle": "यह योजना क्यों",
  "result.localPhraseTitle": "एक स्थानीय वाक्यांश",
  "result.localPhraseCatalan": "कातालान",
  "result.localPhraseSpanish": "स्पेनिश",
  "result.noPlaceTitle": "कोई सत्यापित स्थान नहीं चुना गया",
  "result.noticesTitle": "सुरक्षा और जानकारी संबंधी सूचनाएँ",

  "place.backendApprovedLabel": "बैकएंड द्वारा स्वीकृत विकल्प",
  "place.distanceLabel": "दूरी",
  "place.closesLabel": "बंद होने का समय",
  "place.accessibilityLabel": "सुगम्यता",
  "place.lastCheckedLabel": "अंतिम बार जाँच",
  "place.featuresTitle": "सत्यापित सुविधाएँ",
  "place.noFeatures": "कोई अतिरिक्त सत्यापित सुविधा सूचीबद्ध नहीं है।",
  "place.linksAccessibleName": "स्थान के आधिकारिक लिंक",
  "place.informationLink": "आधिकारिक जानकारी",
  "place.sourceLink": "आधिकारिक स्रोत",
  "place.mapLink": "Google Maps में खोलें",
  "place.cautionsAccessibleName": "स्थान संबंधी सावधानियाँ",
  "place.addressUnavailable": "पता उपलब्ध नहीं है",
  "place.accessibilityConfirmed": "स्रोत ने सुगम्यता की पुष्टि की है",
  "place.accessibilityUnavailable":
    "स्रोत के अनुसार यह स्थान सुगम नहीं है",
  "place.accessibilityUnknown": "सुगम्यता की स्थिति अज्ञात है",

  "feature.indoorSpace": "भीतर की जगह",
  "feature.potableWater": "पीने का पानी",
  "feature.toilets": "शौचालय",
  "feature.microShelter": "लघु आश्रय",
  "feature.petsAllowed": "पालतू पशुओं की अनुमति",

  "feature.confirmed": "पुष्टि की गई",
  "feature.unavailable": "उपलब्ध के रूप में सूचीबद्ध नहीं",
  "feature.unknown": "पुष्टि नहीं की गई",

  "distance.straightLine": "सीधी रेखा में {{distance}}",

  "urgent.badge": "अत्यावश्यक · तुरंत कार्रवाई करें",
  "urgent.eyebrow": "तत्काल सुरक्षा परिणाम",
  "urgent.title": "तत्काल सहायता",
  "urgent.sourceLink": "112 का आधिकारिक मार्गदर्शन",

  "trust.eyebrow": "विश्वास की सीमाएँ",
  "trust.title": "निश्चितता को बढ़ा-चढ़ाकर बताए बिना उपयोगी।",
  "trust.safetyLabel": "सुरक्षा",
  "trust.safetyTitle": "जानकारी, चिकित्सीय सलाह नहीं",
  "trust.safetyDescription":
    "मौसम मॉडल से प्राप्त है, यह आधिकारिक गर्मी की चेतावनी नहीं है। यात्रा से पहले स्थान, खुलने के घंटे, सीधी रेखा की दूरी और वहाँ तक पहुँचने की व्यवहार्यता की जाँच करनी चाहिए। अत्यावश्यक परिणाम बैकएंड के नियंत्रण वाली निर्धारित सामग्री का उपयोग करता है।",
  "trust.privacyLabel": "गोपनीयता",
  "trust.privacyTitle": "पहचान बताने वाले विवरण शामिल न करें",
  "trust.privacyDescription":
    "स्थिति का पाठ ब्राउज़र स्टोरेज में संग्रहीत नहीं होता। स्पष्ट रूप से चुनी गई दृश्य-मोड और भाषा प्राथमिकताएँ स्थानीय रूप से सहेजी जाती हैं। केवल चुनी गई भाषा का कोड कार्य-योजना अनुरोध में जाता है; दृश्य मोड नहीं जाता। HeatRelay इस डेमो में एनालिटिक्स, कुकी, URL पैरामीटर या जियोलोकेशन का उपयोग नहीं करता।",

  "footer.description": "Barcelona डेमो · निर्धारित निर्देशांक",

  "metadata.title": "HeatRelay · Barcelona पायलट आधार",
  "metadata.description":
    "HeatRelay, Barcelona से शुरुआत करने वाली एक परियोजना है, जिसे गर्मी की चेतावनियों को सुरक्षित अगले कदमों में बदलने के लिए विकसित किया जा रहा है।",
} as const satisfies MessageCatalog;
