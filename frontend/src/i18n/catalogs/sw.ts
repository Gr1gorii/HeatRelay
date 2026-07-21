import type { MessageCatalog } from "./en";

export const SWAHILI_CATALOG = {
  "app.name": "HeatRelay",

  "navigation.skipToMain": "Nenda kwenye maudhui makuu",
  "navigation.homeAccessibleName": "Ukurasa wa nyumbani wa HeatRelay",
  "navigation.primaryAccessibleName": "Kuu",
  "navigation.createPlan": "Tengeneza mpango",
  "navigation.safetyAndPrivacy": "Usalama na faragha",

  "header.settings": "Mipangilio",

"visualMode.label": "Hali ya mwonekano",
  "visualMode.standard": "Kawaida",
  "visualMode.enhanced": "Mwonekano ulioboreshwa",
  "visualMode.highContrast": "Utofautishaji wa juu",
  "visualMode.description":
    "Mwonekano ulioboreshwa umekusudiwa watu wenye uoni hafifu au mtu yeyote anayependelea maudhui makubwa na yaliyo wazi zaidi.",

  "interfaceLanguage.label": "Lugha",
  "interfaceLanguage.description":
    "Hubadilisha lugha ya kiolesura na mpango wa hatua unaofuata. Haitafsiri maelezo yako wala kuandika upya mpango unaoonyeshwa.",
  "interfaceLanguage.optionWithEnglishName":
    "{{nativeName}} — {{englishName}}",

  "outputLanguage.label": "Lugha ya mpango wa hatua",
  "outputLanguage.description":
    "Huchagua lugha ya mpango wa hatua unaofuata. Pendekezo hili huhifadhiwa katika kivinjari hiki na hutumwa pamoja na ombi la mpango wa hatua. Halibadilishi lugha ya kiolesura wala kutafsiri maelezo yako.",

  "languageContext.title": "Taarifa za lugha",
  "languageContext.descriptionLanguage": "Lugha ya maelezo",
  "languageContext.displayedLanguage": "Lugha ya mpango unaoonyeshwa",
  "languageContext.nextLanguage": "Lugha ya mpango wa hatua unaofuata",
  "languageContext.supportedMismatch":
    "Maelezo na mpango unaoonyeshwa vinatumia lugha tofauti zinazotumika. Kagua mpango kwa makini na uchague lugha nyingine ya mpango wa hatua ikihitajika.",
  "languageContext.catalanUnavailable":
    "Mpango wa hatua kwa Kikatalani haupatikani. Kagua mpango unaoonyeshwa kwa makini na uchague lugha inayopatikana ya mpango wa hatua ikihitajika.",
  "languageContext.other":
    "HeatRelay haikuweza kulinganisha lugha ya maelezo na mojawapo ya lugha zake za uzinduzi zinazotumika. Kagua mpango unaoonyeshwa kwa makini na uchague lugha ya mpango wa hatua unayoielewa vizuri zaidi.",
  "languageContext.unknown":
    "HeatRelay haikuweza kubaini lugha ya maelezo kwa uhakika. Kagua mpango unaoonyeshwa kwa makini na uchague lugha ya mpango wa hatua unayoielewa vizuri zaidi.",
  "languageContext.nextSelection":
    "Mpango unaoonyeshwa hauandikwi upya. Chaguo lako lililohifadhiwa litatumika kwa mpango unaofuata.",
  "languageContext.otherValue": "Lugha nyingine",
  "languageContext.unknownValue": "Haikuweza kubainishwa",
  "languageContext.changeAction": "Badilisha lugha",

  "hero.eyebrow": "Majaribio ya Barcelona · Hatua kuu ya 5",
  "hero.title": "Kutoka onyo la joto hadi hatua inayofuata iliyo salama.",
  "hero.introduction":
    "Eleza hali ya joto na HeatRelay itaomba mfumo wa nyuma uliopo utoe mpango mmoja wa hatua wa Barcelona unaotegemea taarifa, kwa kutumia viwianishi vya onyesho visivyobadilika.",
  "hero.action": "Tengeneza mpango wa Barcelona",

  "release.kicker": "Toleo la sasa",
  "release.badge": "Onyesho la Barcelona",
  "release.title": "Mtiririko mmoja wa kazi unaosimamiwa na seva",
  "release.description":
    "Kivinjari hutuma maelezo yako na mipangilio isiyobadilika ya onyesho la Barcelona pekee. Hali ya hewa, kipaumbele, maeneo na uthibitishaji wa taarifa hubaki kwenye mfumo wa nyuma.",
  "release.actionPlanApiLabel": "API ya mpango wa hatua",
  "release.actionPlanApiValue": "Endpointi ya chanzo sawa",
  "release.demoLocationLabel": "Mahali pa onyesho",
  "release.demoLocationValue": "Eneo lisilobadilika huko Barcelona",
  "release.browserLocationLabel": "Mahali pa kivinjari",
  "release.browserLocationValue": "Hapapatikani",

  "form.eyebrow": "Onyesho la Barcelona",
  "form.title": "Tengeneza mpango wako wa hatua dhidi ya joto",
  "form.introduction":
    "Shiriki tu maelezo ya hali yanayohitajika ili kubinafsisha mpango wenye mipaka na uliothibitishwa na mfumo wa nyuma. Uwasilishaji mmoja hufanya ombi moja.",
  "form.privacyTitle": "Faragha na maelezo ya onyesho",
  "form.privacyDescription":
    "Maelezo yako yanatumwa kutoka upande wa seva kwenda OpenAI ili yachakatwe na GPT-5.6. HeatRelay haikusudii kuhifadhi au kurekodi maandishi ghafi; sera za mtoa huduma za kushughulikia data bado zinaweza kutumika.",
  "form.identityWarning":
    "OpenAI huchakata maandishi haya. Usiweke majina, mawasiliano au anwani. Sehemu ya kudumu ya onyesho la Barcelona; si msaada wa dharura.",
  "form.situationLabel": "Eleza hali ya joto",
  "form.characterCount": "{{currentCount}} / {{limit}} herufi",
  "form.characterCountOverLimit":
    "{{currentCount}} / {{limit}} herufi — punguza kwa {{overLimitCount}}",
  "form.situationHint":
    "Umri · upatikanaji wa sehemu ya kujituliza · uwezo wa kusogea · dalili",
  "form.demoButton": "Pakia onyesho la Barcelona",
  "form.submitButton": "Tengeneza mpango wangu wa hatua dhidi ya joto",
  "form.submittingButton": "Mpango wako unatengenezwa…",
  "form.boundaryNote":
    "MVP hii hutumia viwianishi vya onyesho la Barcelona visivyobadilika. Mahali pa kivinjari bado hakupatikani. Umbali ni makadirio ya mstari wa moja kwa moja; HeatRelay si ushauri wa kitabibu wala wa dharura.",
  "form.demoText":
    "Nina umri wa miaka 69, ninaishi peke yangu, sina kiyoyozi, ninatembea polepole na sizungumzi Kihispania.",

  "scenario.heading": "Tunawezaje kusaidia?",
  "scenario.selfTitle": "Ninahisi joto kupita kiasi",
  "scenario.selfDescription": "Unda mpango wangu wa hatua",
  "scenario.someoneTitle": "Msaidie mtu wa karibu",
  "scenario.someoneDescription": "Unda mpango kwa ajili ya mtu mwingine",
  "scenario.placeTitle": "Tafuta mahali penye baridi katika eneo la majaribio la Barcelona",
  "scenario.placeDescription": "Tafuta taarifa za kweli kuhusu maeneo",
  "scenario.nearestHelp": "Taarifa za maeneo ya Barcelona",
  "scenario.importantNow": "Muhimu sasa",
  "scenario.initialTipCoolestSpot":
    "Nenda sehemu baridi zaidi inayopatikana ulipo sasa.",
  "scenario.initialTipReduceEffort": "Punguza juhudi za mwili kwa sasa.",
  "scenario.initialTipDrinkWater":
    "Kunywa maji mara kwa mara ikiwa ni salama kufanya hivyo.",

  "placeLookup.searchAction": "Tafuta maeneo ya majaribio ya Barcelona",
  "placeLookup.loading": "Inatafuta data zilizothibitishwa za maeneo…",
  "placeLookup.resultsTitle": "Matokeo ya maeneo ya Barcelona",
  "placeLookup.emptyTitle": "Hakuna eneo linalolingana lililopatikana",
  "placeLookup.emptyMessage":
    "Hakuna eneo lililolingana na sehemu ya kudumu ya majaribio, saa ya sasa ya kifaa na mipaka ya utafutaji.",
  "placeLookup.errorTitle": "Taarifa za maeneo hazipatikani",
  "placeLookup.errorMessage":
    "Taarifa za maeneo hazikuweza kuonyeshwa kwa usalama. Jaribu tena ikiwa tu umechagua kufanya hivyo.",
  "placeLookup.compactBoundary":
    "Sehemu ya kudumu ya onyesho la Barcelona · Umbali wa mstari wa moja kwa moja · Thibitisha saa na ufikivu",
  "placeLookup.boundary":
    "Inatumia sehemu ya kudumu ya majaribio ya Barcelona, si mahali ulipo. Umbali ni wa mstari wa moja kwa moja, si njia au makadirio ya muda wa kufika. Saa za kufungua hutathminiwa kwa saa ya kifaa chako. Thibitisha saa na ufikivu kabla ya kusafiri. Huu si msaada wa matibabu au dharura.",

  "validation.empty": "Eleza hali kabla ya kutengeneza mpango.",
  "validation.overLimit": "Maelezo ni marefu sana. Fupisha maandishi.",
  "validation.serverInput": "Kagua maelezo kisha ujaribu tena.",

  "status.creating": "Mpango wako wa hatua unatengenezwa.",
  "status.ready": "Mpango wako wa hatua uko tayari.",
  "status.loadingDetail":
    "Hali, hali ya hewa na maeneo teule yaliyothibitishwa yanakaguliwa…",

  "error.malformedTitle": "Jibu halipatikani",
  "error.malformedMessage": "Jibu halikuweza kuonyeshwa kwa usalama.",
  "error.unavailableTitle": "Mpango wa hatua haupatikani kwa muda",
  "error.unavailableMessage":
    "Mpango wa hatua haupatikani kwa muda. Tafadhali jaribu tena baadaye.",
  "error.connectionTitle": "Mfumo wa nyuma haukuweza kufikiwa",
  "error.connectionMessage":
    "Mfumo wa nyuma haukuweza kufikiwa. Hakikisha huduma za ndani zinafanya kazi.",

  "priority.actNow": "Chukua hatua sasa",
  "priority.prepareNow": "Jiandae sasa",
  "priority.monitorAndPrepare": "Fuatilia na ujiandae",

  "result.eyebrow": "Mpango wako wa hatua dhidi ya joto huko Barcelona",
  "result.priorityBadge": "Kipaumbele: {{priority}}",
  "result.evaluatedAt": "Ilitathminiwa {{dateTime}}",
  "result.weatherSummaryAccessibleName": "Muhtasari wa hali ya hewa",
  "result.currentTemperature": "Halijoto ya sasa",
  "result.feelsLike": "Halijoto inayohisiwa",
  "result.todayMaximum": "Kiwango cha juu leo",
  "result.phaseNow": "Sasa",
  "result.phaseNextFewHours": "Saa chache zijazo",
  "result.phaseTonight": "Usiku wa leo",
  "result.bringItemsTitle": "Chukua pamoja nawe",
  "result.explanationTitle": "Kwa nini mpango huu",
  "result.localPhraseTitle": "Kauli katika lugha ya eneo",
  "result.localPhraseCatalan": "Kikatalani",
  "result.localPhraseSpanish": "Kihispania",
  "result.noPlaceTitle": "Hakuna eneo lililothibitishwa lililochaguliwa",
  "result.noticesTitle": "Taarifa za usalama na maelezo",

  "place.backendApprovedLabel": "Eneo teule lililoidhinishwa na mfumo wa nyuma",
  "place.distanceLabel": "Umbali",
  "place.closesLabel": "Hufungwa",
  "place.accessibilityLabel": "Ufikivu",
  "place.lastCheckedLabel": "Mara ya mwisho kukaguliwa",
  "place.featuresTitle": "Vipengele vilivyothibitishwa",
  "place.noFeatures": "Hakuna vipengele vingine vilivyothibitishwa vilivyoorodheshwa.",
  "place.linksAccessibleName": "Viungo rasmi vya eneo",
  "place.informationLink": "Taarifa rasmi",
  "place.sourceLink": "Chanzo rasmi",
  "place.mapLink": "Fungua katika Google Maps",
  "place.cautionsAccessibleName": "Tahadhari za eneo",
  "place.addressUnavailable": "Anwani haipatikani",
  "place.accessibilityConfirmed": "Ufikivu umethibitishwa na chanzo",
  "place.accessibilityUnavailable":
    "Chanzo kinaripoti kuwa eneo hili halifikiki",
  "place.accessibilityUnknown": "Hali ya ufikivu haijulikani",

  "feature.indoorSpace": "Sehemu ya ndani",
  "feature.potableWater": "Maji ya kunywa",
  "feature.toilets": "Vyoo",
  "feature.microShelter": "Sehemu ndogo ya kujisitiri",
  "feature.petsAllowed": "Wanyama vipenzi wanaruhusiwa",

  "feature.confirmed": "Imethibitishwa",
  "feature.unavailable": "Haijaorodheshwa kuwa inapatikana",
  "feature.unknown": "Haijathibitishwa",

  "distance.straightLine": "{{distance}} kwa mstari wa moja kwa moja",

  "urgent.badge": "Dharura · chukua hatua mara moja",
  "urgent.eyebrow": "Matokeo ya usalama ya mara moja",
  "urgent.title": "Msaada wa dharura",
  "urgent.sourceLink": "Mwongozo rasmi wa 112",

  "trust.eyebrow": "Mipaka ya uaminifu",
  "trust.title": "Ni wa manufaa bila kuzidisha uhakika.",
  "trust.safetyLabel": "Usalama",
  "trust.safetyTitle": "Taarifa, si ushauri wa kitabibu",
  "trust.safetyDescription":
    "Hali ya hewa inatokana na modeli, si onyo rasmi la joto. Maeneo, saa za kufunguliwa, umbali wa mstari wa moja kwa moja na uwezo wa kufika vinapaswa kuthibitishwa kabla ya kusafiri. Matokeo ya dharura hutumia maudhui yasiyobadilika yanayosimamiwa na mfumo wa nyuma.",
  "trust.privacyLabel": "Faragha",
  "trust.privacyTitle": "Usijumuishe maelezo yanayoweza kukutambulisha",
  "trust.privacyDescription":
    "Maandishi ya hali hayahifadhiwi katika hifadhi ya kivinjari. Mapendeleo ya wazi ya hali ya mwonekano na lugha huhifadhiwa kwenye kifaa. Ni msimbo wa lugha uliochaguliwa pekee unaoingia katika ombi la mpango wa hatua; hali ya mwonekano haiingii. HeatRelay haitumii uchanganuzi, vidakuzi, vigezo vya URL au eneo la kijiografia katika onyesho hili.",

  "footer.description": "Onyesho la Barcelona · Viwianishi visivyobadilika",

  "metadata.title": "HeatRelay · Msingi wa majaribio ya Barcelona",
  "metadata.description":
    "HeatRelay ni mradi unaoanza Barcelona unaotengenezwa ili kubadilisha maonyo ya joto kuwa hatua salama zinazofuata.",
} as const satisfies MessageCatalog;
