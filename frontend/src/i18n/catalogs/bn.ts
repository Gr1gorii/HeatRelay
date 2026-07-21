import type { MessageCatalog } from "./en";

export const BENGALI_CATALOG = {
  "app.name": "HeatRelay",

  "navigation.skipToMain": "মূল বিষয়বস্তুতে যান",
  "navigation.homeAccessibleName": "HeatRelay-এর মূল পাতা",
  "navigation.primaryAccessibleName": "প্রধান",
  "navigation.createPlan": "পরিকল্পনা তৈরি করুন",
  "navigation.safetyAndPrivacy": "নিরাপত্তা ও গোপনীয়তা",

  "header.settings": "সেটিংস",

"visualMode.label": "ভিজ্যুয়াল মোড",
  "visualMode.standard": "মানক",
  "visualMode.enhanced": "উন্নত দৃশ্যমানতা",
  "visualMode.highContrast": "উচ্চ কনট্রাস্ট",
  "visualMode.description":
    "উন্নত দৃশ্যমানতা কম দৃষ্টিশক্তিসম্পন্ন মানুষ অথবা যারা আরও বড় ও স্পষ্ট বিষয়বস্তু পছন্দ করেন, তাঁদের জন্য।",

  "interfaceLanguage.label": "ভাষা",
  "interfaceLanguage.description":
    "ইন্টারফেস ও পরবর্তী অ্যাকশন প্ল্যানের ভাষা পরিবর্তন করে। এটি আপনার বর্ণনা অনুবাদ করে না বা প্রদর্শিত প্ল্যান আবার লেখে না।",
  "interfaceLanguage.optionWithEnglishName":
    "{{nativeName}} — {{englishName}}",

  "outputLanguage.label": "অ্যাকশন প্ল্যানের ভাষা",
  "outputLanguage.description":
    "পরবর্তী অ্যাকশন প্ল্যানের ভাষা বেছে নেয়। এই পছন্দটি এই ব্রাউজারে সংরক্ষিত হয় এবং অ্যাকশন প্ল্যানের অনুরোধের সঙ্গে পাঠানো হয়। এটি ইন্টারফেসের ভাষা পরিবর্তন করে না বা আপনার বিবরণ অনুবাদ করে না।",

  "languageContext.title": "ভাষা-সংক্রান্ত তথ্য",
  "languageContext.descriptionLanguage": "বর্ণনার ভাষা",
  "languageContext.displayedLanguage": "প্রদর্শিত অ্যাকশন প্ল্যানের ভাষা",
  "languageContext.nextLanguage": "পরবর্তী অ্যাকশন প্ল্যানের ভাষা",
  "languageContext.supportedMismatch":
    "বর্ণনা এবং প্রদর্শিত প্ল্যানটি আলাদা সমর্থিত ভাষায় রয়েছে। প্ল্যানটি মনোযোগ দিয়ে পর্যালোচনা করুন এবং প্রয়োজন হলে অ্যাকশন প্ল্যানের জন্য অন্য ভাষা বেছে নিন।",
  "languageContext.catalanUnavailable":
    "কাতালান ভাষায় অ্যাকশন প্ল্যানের আউটপুট উপলভ্য নয়। প্রদর্শিত প্ল্যানটি মনোযোগ দিয়ে পর্যালোচনা করুন এবং প্রয়োজন হলে উপলভ্য একটি ভাষা বেছে নিন।",
  "languageContext.other":
    "HeatRelay বর্ণনার ভাষাকে তার সমর্থিত চালুর ভাষাগুলোর কোনো একটির সঙ্গে মেলাতে পারেনি। প্রদর্শিত প্ল্যানটি মনোযোগ দিয়ে পর্যালোচনা করুন এবং আপনি যে অ্যাকশন প্ল্যানের ভাষা সবচেয়ে ভালো বোঝেন সেটি বেছে নিন।",
  "languageContext.unknown":
    "HeatRelay বর্ণনার ভাষা নির্ভরযোগ্যভাবে নির্ধারণ করতে পারেনি। প্রদর্শিত প্ল্যানটি মনোযোগ দিয়ে পর্যালোচনা করুন এবং আপনি যে অ্যাকশন প্ল্যানের ভাষা সবচেয়ে ভালো বোঝেন সেটি বেছে নিন।",
  "languageContext.nextSelection":
    "প্রদর্শিত প্ল্যানটি আবার লেখা হয় না। আপনার সংরক্ষিত পছন্দ পরবর্তী প্ল্যানে প্রয়োগ হবে।",
  "languageContext.otherValue": "অন্য একটি ভাষা",
  "languageContext.unknownValue": "নির্ধারণ করা যায়নি",
  "languageContext.changeAction": "ভাষা পরিবর্তন করুন",

  "hero.eyebrow": "Barcelona পাইলট · মাইলস্টোন 5",
  "hero.title": "তাপ সতর্কতা থেকে নিরাপদ পরবর্তী পদক্ষেপ।",
  "hero.introduction":
    "তাপজনিত একটি পরিস্থিতি বর্ণনা করুন। HeatRelay স্থির ডেমো স্থানাঙ্ক ব্যবহার করে Barcelona-র জন্য একটি তথ্যভিত্তিক অ্যাকশন প্ল্যান পেতে বিদ্যমান ব্যাকএন্ডে অনুরোধ করবে।",
  "hero.action": "Barcelona পরিকল্পনা তৈরি করুন",

  "release.kicker": "বর্তমান রিলিজ",
  "release.badge": "Barcelona ডেমো",
  "release.title": "সার্ভার-নিয়ন্ত্রিত একটি কর্মপ্রবাহ",
  "release.description":
    "ব্রাউজার শুধু আপনার বর্ণনা এবং স্থির Barcelona ডেমো সেটিংস পাঠায়। আবহাওয়া, অগ্রাধিকার, স্থান এবং তথ্যভিত্তিক যাচাই ব্যাকএন্ডেই সম্পন্ন হয়।",
  "release.actionPlanApiLabel": "অ্যাকশন-প্ল্যান API",
  "release.actionPlanApiValue": "একই উৎসের এন্ডপয়েন্ট",
  "release.demoLocationLabel": "ডেমো অবস্থান",
  "release.demoLocationValue": "স্থির Barcelona বিন্দু",
  "release.browserLocationLabel": "ব্রাউজারের অবস্থান",
  "release.browserLocationValue": "উপলভ্য নয়",

  "form.eyebrow": "Barcelona ডেমো",
  "form.title": "তাপ মোকাবিলার অ্যাকশন প্ল্যান তৈরি করুন",
  "form.introduction":
    "সীমাবদ্ধ ও ব্যাকএন্ডে যাচাইকৃত পরিকল্পনাটি আপনার পরিস্থিতি অনুযায়ী করতে কেবল প্রয়োজনীয় তথ্য দিন। একবার জমা দিলে একটি অনুরোধই পাঠানো হয়।",
  "form.privacyTitle": "গোপনীয়তা ও ডেমোর বিবরণ",
  "form.privacyDescription":
    "GPT-5.6 দিয়ে প্রক্রিয়াকরণের জন্য আপনার বর্ণনাটি সার্ভারের মাধ্যমে OpenAI-তে পাঠানো হয়। HeatRelay ইচ্ছাকৃতভাবে মূল লেখাটি সংরক্ষণ বা লগ করে না; তবে প্রদানকারীর ডেটা পরিচালনা নীতি প্রযোজ্য হতে পারে।",
  "form.identityWarning":
    "লেখাটি OpenAI-তে পাঠানো হয়; HeatRelay ইচ্ছাকৃতভাবে মূল লেখা সংরক্ষণ বা লগ করে না। নাম, যোগাযোগের তথ্য বা ঠিকানা দেবেন না। Barcelona-এর নির্দিষ্ট ডেমো স্থানাঙ্ক। এটি চিকিৎসা বা জরুরি পরামর্শ নয়।",
  "form.situationLabel": "তাপজনিত পরিস্থিতি বর্ণনা করুন",
  "form.characterCount": "{{currentCount}} / {{limit}} অক্ষর",
  "form.characterCountOverLimit":
    "{{currentCount}} / {{limit}} অক্ষর — {{overLimitCount}} কমান",
  "form.situationHint":
    "বয়স, ঠান্ডা থাকার সুবিধা, চলাফেরা, সময় এবং প্রাসঙ্গিক উপসর্গ সংক্ষেপে লিখুন।",
  "form.demoButton": "Barcelona ডেমো লোড করুন",
  "form.submitButton": "আমার তাপ মোকাবিলার অ্যাকশন প্ল্যান তৈরি করুন",
  "form.submittingButton": "আপনার পরিকল্পনা তৈরি করা হচ্ছে…",
  "form.boundaryNote":
    "এই MVP স্থির Barcelona ডেমো স্থানাঙ্ক ব্যবহার করে। ব্রাউজারের অবস্থান এখনো উপলভ্য নয়। দূরত্ব সরলরেখার আনুমানিক হিসাব; HeatRelay চিকিৎসা বা জরুরি পরামর্শ নয়।",
  "form.demoText":
    "আমার বয়স ৬৯ বছর, আমি একা থাকি, আমার শীতাতপনিয়ন্ত্রণ নেই, আমি ধীরে হাঁটি এবং আমি স্প্যানিশ বলতে পারি না।",

  "scenario.heading": "আমরা কীভাবে সাহায্য করতে পারি?",
  "scenario.selfTitle": "আমার খুব গরম লাগছে",
  "scenario.selfDescription": "ব্যক্তিগত করণীয় পরিকল্পনা তৈরি করুন",
  "scenario.someoneTitle": "কাছের কাউকে সাহায্য করুন",
  "scenario.someoneDescription": "অন্য একজনের জন্য পরিকল্পনা তৈরি করুন",
  "scenario.placeTitle": "কাছাকাছি শীতল জায়গা খুঁজুন",
  "scenario.placeDescription": "নিকটতম যাচাইকৃত সহায়তা দেখান",
  "scenario.nearestHelp": "নিকটতম সহায়তা",
  "scenario.importantNow": "এখন গুরুত্বপূর্ণ",

  "validation.empty": "পরিকল্পনা তৈরির আগে পরিস্থিতি বর্ণনা করুন।",
  "validation.overLimit": "বর্ণনাটি খুব দীর্ঘ। লেখা ছোট করুন।",
  "validation.serverInput": "বর্ণনাটি পর্যালোচনা করে আবার চেষ্টা করুন।",

  "status.creating": "আপনার অ্যাকশন প্ল্যান তৈরি করা হচ্ছে।",
  "status.ready": "আপনার অ্যাকশন প্ল্যান প্রস্তুত।",
  "status.loadingDetail":
    "পরিস্থিতি, আবহাওয়া এবং যাচাইকৃত সম্ভাব্য স্থান পরীক্ষা করা হচ্ছে…",

  "error.malformedTitle": "প্রতিক্রিয়া উপলভ্য নয়",
  "error.malformedMessage": "প্রতিক্রিয়াটি নিরাপদভাবে দেখানো যায়নি।",
  "error.unavailableTitle": "অ্যাকশন প্ল্যান সাময়িকভাবে উপলভ্য নয়",
  "error.unavailableMessage":
    "অ্যাকশন প্ল্যানটি সাময়িকভাবে উপলভ্য নয়। পরে আবার চেষ্টা করুন।",
  "error.connectionTitle": "ব্যাকএন্ডে সংযোগ করা যায়নি",
  "error.connectionMessage":
    "ব্যাকএন্ডে সংযোগ করা যায়নি। স্থানীয় পরিষেবাগুলো চালু আছে কি না পরীক্ষা করুন।",

  "priority.actNow": "এখনই ব্যবস্থা নিন",
  "priority.prepareNow": "এখনই প্রস্তুতি নিন",
  "priority.monitorAndPrepare": "পর্যবেক্ষণ করুন ও প্রস্তুত থাকুন",

  "result.eyebrow": "আপনার Barcelona তাপ মোকাবিলার অ্যাকশন প্ল্যান",
  "result.priorityBadge": "অগ্রাধিকার: {{priority}}",
  "result.evaluatedAt": "মূল্যায়নের সময় {{dateTime}}",
  "result.weatherSummaryAccessibleName": "আবহাওয়ার সারসংক্ষেপ",
  "result.currentTemperature": "বর্তমান তাপমাত্রা",
  "result.feelsLike": "অনুভূত তাপমাত্রা",
  "result.todayMaximum": "আজকের সর্বোচ্চ",
  "result.phaseNow": "এখন",
  "result.phaseNextFewHours": "আগামী কয়েক ঘণ্টা",
  "result.phaseTonight": "আজ রাতে",
  "result.bringItemsTitle": "সঙ্গে নিন",
  "result.explanationTitle": "এই পরিকল্পনার কারণ",
  "result.localPhraseTitle": "একটি স্থানীয় বাক্য",
  "result.localPhraseCatalan": "কাতালান",
  "result.localPhraseSpanish": "স্প্যানিশ",
  "result.noPlaceTitle": "কোনো যাচাইকৃত স্থান নির্বাচন করা হয়নি",
  "result.noticesTitle": "নিরাপত্তা ও তথ্যসংক্রান্ত বিজ্ঞপ্তি",

  "place.backendApprovedLabel": "ব্যাকএন্ড-অনুমোদিত সম্ভাব্য স্থান",
  "place.distanceLabel": "দূরত্ব",
  "place.closesLabel": "বন্ধ হবে",
  "place.accessibilityLabel": "প্রবেশগম্যতা",
  "place.lastCheckedLabel": "সর্বশেষ যাচাই",
  "place.featuresTitle": "যাচাইকৃত সুবিধাসমূহ",
  "place.noFeatures": "অতিরিক্ত কোনো যাচাইকৃত সুবিধা তালিকাভুক্ত নেই।",
  "place.linksAccessibleName": "স্থানের অফিশিয়াল লিংক",
  "place.informationLink": "অফিশিয়াল তথ্য",
  "place.sourceLink": "অফিশিয়াল উৎস",
  "place.mapLink": "Google Maps-এ পথ খুলুন",
  "place.cautionsAccessibleName": "স্থানসংক্রান্ত সতর্কতা",
  "place.addressUnavailable": "ঠিকানা উপলভ্য নয়",
  "place.accessibilityConfirmed": "উৎসটি প্রবেশগম্যতা নিশ্চিত করেছে",
  "place.accessibilityUnavailable":
    "উৎসের তথ্য অনুযায়ী স্থানটি প্রবেশগম্য নয়",
  "place.accessibilityUnknown": "প্রবেশগম্যতার অবস্থা অজানা",

  "feature.indoorSpace": "ঘরের ভেতরের স্থান",
  "feature.potableWater": "পানীয় জল",
  "feature.toilets": "শৌচাগার",
  "feature.microShelter": "ক্ষুদ্র আশ্রয়স্থল",
  "feature.petsAllowed": "পোষা প্রাণী অনুমোদিত",

  "feature.confirmed": "নিশ্চিত",
  "feature.unavailable": "উপলভ্য হিসেবে তালিকাভুক্ত নয়",
  "feature.unknown": "নিশ্চিত নয়",

  "distance.straightLine": "সরলরেখায় {{distance}}",

  "urgent.badge": "জরুরি · এখনই ব্যবস্থা নিন",
  "urgent.eyebrow": "তাৎক্ষণিক নিরাপত্তা ফলাফল",
  "urgent.title": "জরুরি সহায়তা",
  "urgent.sourceLink": "অফিশিয়াল 112 নির্দেশনা",

  "trust.eyebrow": "আস্থার সীমা",
  "trust.title": "নিশ্চয়তা অতিরঞ্জিত না করেও উপকারী।",
  "trust.safetyLabel": "নিরাপত্তা",
  "trust.safetyTitle": "তথ্য, চিকিৎসা পরামর্শ নয়",
  "trust.safetyDescription":
    "আবহাওয়ার তথ্য মডেল থেকে পাওয়া, এটি কোনো অফিশিয়াল তাপ সতর্কতা নয়। যাত্রার আগে স্থান, খোলার সময়, সরলরেখার দূরত্ব এবং সেখানে পৌঁছানোর বাস্তবসম্ভাব্যতা যাচাই করা উচিত। জরুরি ফলাফলে ব্যাকএন্ড-নিয়ন্ত্রিত স্থির বিষয়বস্তু ব্যবহার করা হয়।",
  "trust.privacyLabel": "গোপনীয়তা",
  "trust.privacyTitle": "পরিচয় শনাক্তকারী তথ্য দেবেন না",
  "trust.privacyDescription":
    "পরিস্থিতির লেখা ব্রাউজার স্টোরেজে সংরক্ষিত হয় না। স্পষ্টভাবে বেছে নেওয়া ভিজ্যুয়াল মোড ও ভাষার পছন্দ স্থানীয়ভাবে সংরক্ষিত হয়। শুধু নির্বাচিত ভাষা কোড অ্যাকশন প্ল্যানের অনুরোধে যায়; ভিজ্যুয়াল মোড যায় না। এই ডেমোতে HeatRelay অ্যানালিটিক্স, কুকি, URL প্যারামিটার বা ভূ-অবস্থান ব্যবহার করে না।",

  "footer.description": "Barcelona ডেমো · স্থির স্থানাঙ্ক",

  "metadata.title": "HeatRelay · Barcelona পাইলটের ভিত্তি",
  "metadata.description":
    "HeatRelay হলো Barcelona-কেন্দ্রিক একটি প্রকল্প, যা তাপ সতর্কতাকে নিরাপদ পরবর্তী পদক্ষেপে রূপ দিতে তৈরি করা হচ্ছে।",
} as const satisfies MessageCatalog;
