import type { MessageCatalog } from "./en";

export const HEBREW_CATALOG = {
  "app.name": "HeatRelay",

  "navigation.skipToMain": "דילוג לתוכן הראשי",
  "navigation.homeAccessibleName": "דף הבית של HeatRelay",
  "navigation.primaryAccessibleName": "ראשי",
  "navigation.createPlan": "יצירת תוכנית",
  "navigation.safetyAndPrivacy": "בטיחות ופרטיות",

  "header.settings": "הגדרות",

"visualMode.label": "מצב תצוגה",
  "visualMode.standard": "רגיל",
  "visualMode.enhanced": "נראות משופרת",
  "visualMode.highContrast": "ניגודיות גבוהה",
  "visualMode.description":
    "נראות משופרת מיועדת לאנשים עם ראייה ירודה או לכל מי שמעדיפים תוכן גדול וברור יותר.",

  "interfaceLanguage.label": "שפה",
  "interfaceLanguage.description":
    "משנה את שפת הממשק ואת שפת תוכנית הפעולה הבאה. אינה מתרגמת את התיאור או משכתבת את התוכנית המוצגת.",
  "interfaceLanguage.optionWithEnglishName":
    "{{nativeName}} — {{englishName}}",

  "outputLanguage.label": "שפת תוכנית הפעולה",
  "outputLanguage.description":
    "בוחרת את השפה של תוכנית הפעולה הבאה. העדפה זו נשמרת בדפדפן ונשלחת עם הבקשה לתוכנית הפעולה. היא אינה משנה את שפת הממשק ואינה מתרגמת את התיאור שלכם.",

  "languageContext.title": "מידע על שפות",
  "languageContext.descriptionLanguage": "שפת התיאור",
  "languageContext.displayedLanguage": "שפת תוכנית הפעולה המוצגת",
  "languageContext.nextLanguage": "שפת תוכנית הפעולה הבאה",
  "languageContext.supportedMismatch":
    "התיאור והתוכנית המוצגת משתמשים בשפות נתמכות שונות. בדקו את התוכנית בקפידה ובחרו שפה אחרת לתוכנית הפעולה במידת הצורך.",
  "languageContext.catalanUnavailable":
    "פלט של תוכנית פעולה בקטלאנית אינו זמין. בדקו את התוכנית המוצגת בקפידה ובחרו שפה זמינה לתוכנית הפעולה במידת הצורך.",
  "languageContext.other":
    "HeatRelay לא הצליח להתאים את שפת התיאור לאחת משפות ההשקה הנתמכות. בדקו את התוכנית המוצגת בקפידה ובחרו את שפת תוכנית הפעולה שאתם מבינים בצורה הטובה ביותר.",
  "languageContext.unknown":
    "HeatRelay לא הצליח לקבוע באופן מהימן את שפת התיאור. בדקו את התוכנית המוצגת בקפידה ובחרו את שפת תוכנית הפעולה שאתם מבינים בצורה הטובה ביותר.",
  "languageContext.nextSelection":
    "התוכנית המוצגת אינה נכתבת מחדש. הבחירה השמורה שלכם תחול על התוכנית הבאה.",
  "languageContext.otherValue": "שפה אחרת",
  "languageContext.unknownValue": "לא ניתן היה לקבוע",
  "languageContext.changeAction": "שינוי שפה",

  "hero.eyebrow": "פיילוט Barcelona · אבן דרך 5",
  "hero.title": "מאזהרת חום לצעד הבא הבטוח.",
  "hero.introduction":
    "תארו מצב הקשור לחום, ו-HeatRelay יבקש מהמערכת האחורית הקיימת תוכנית פעולה אחת ל-Barcelona המעוגנת בעובדות, באמצעות קואורדינטות הדגמה קבועות.",
  "hero.action": "יצירת תוכנית ל-Barcelona",

  "release.kicker": "הגרסה הנוכחית",
  "release.badge": "הדגמת Barcelona",
  "release.title": "תהליך עבודה אחד בשליטת השרת",
  "release.description":
    "הדפדפן שולח רק את התיאור שלכם ואת הגדרות ההדגמה הקבועות של Barcelona. מזג האוויר, העדיפות, המקומות ואימות העובדות נשארים במערכת האחורית.",
  "release.actionPlanApiLabel": "API של תוכנית הפעולה",
  "release.actionPlanApiValue": "נקודת קצה מאותו מקור",
  "release.demoLocationLabel": "מיקום ההדגמה",
  "release.demoLocationValue": "נקודה קבועה ב-Barcelona",
  "release.browserLocationLabel": "מיקום הדפדפן",
  "release.browserLocationValue": "לא זמין",

  "form.eyebrow": "הדגמת Barcelona",
  "form.title": "יצירת תוכנית הפעולה שלכם להתמודדות עם חום",
  "form.introduction":
    "שתפו רק את פרטי המצב הדרושים להתאמה אישית של תוכנית מוגבלת שאומתה במערכת האחורית. כל שליחה יוצרת בקשה אחת.",
  "form.privacyTitle": "פרטיות ופרטי ההדגמה",
  "form.privacyDescription":
    "התיאור שלכם נשלח בצד השרת אל OpenAI לעיבוד באמצעות GPT-5.6. HeatRelay אינו שומר או מתעד במכוון את הטקסט הגולמי; ייתכן שמדיניות הטיפול בנתונים של הספק עדיין תחול.",
  "form.identityWarning":
    "OpenAI מעבד את הטקסט הזה. אין להזין שמות, פרטי קשר או כתובות. נקודת הדגמה קבועה של Barcelona; אין זה סיוע בחירום.",
  "form.situationLabel": "תיאור המצב הקשור לחום",
  "form.characterCount": "{{currentCount}} / {{limit}} תווים",
  "form.characterCountOverLimit":
    "{{currentCount}} / {{limit}} תווים — יש לקצר ב־{{overLimitCount}}",
  "form.situationHint":
    "גיל · גישה לקירור · ניידות · תסמינים",
  "form.demoButton": "טעינת הדגמת Barcelona",
  "form.submitButton": "יצירת תוכנית הפעולה שלי להתמודדות עם חום",
  "form.submittingButton": "התוכנית שלכם נוצרת…",
  "form.boundaryNote":
    "מוצר ראשוני זה משתמש בקואורדינטות הדגמה קבועות של Barcelona. מיקום הדפדפן עדיין אינו זמין. המרחקים הם הערכות בקו ישר; HeatRelay אינו מספק ייעוץ רפואי או ייעוץ לשעת חירום.",
  "form.demoText":
    "אני בן או בת 69, גר או גרה לבד, אין לי מיזוג אוויר, אני הולך או הולכת לאט ואינני מדבר או מדברת ספרדית.",

  "scenario.heading": "איך נוכל לעזור?",
  "scenario.selfTitle": "חם לי מדי",
  "scenario.selfDescription": "יצירת תוכנית פעולה אישית",
  "scenario.someoneTitle": "עזרה לאדם קרוב",
  "scenario.someoneDescription": "יצירת תוכנית עבור אדם אחר",
  "scenario.placeTitle": "מציאת מקום קריר באזור ההדגמה של Barcelona",
  "scenario.placeDescription": "חיפוש מידע עובדתי על מקומות",
  "scenario.nearestHelp": "מידע על מקומות ב-Barcelona",
  "scenario.importantNow": "חשוב עכשיו",
  "scenario.initialTipCoolestSpot":
    "עברו למקום הקריר ביותר שזמין במקום שבו אתם כבר נמצאים.",
  "scenario.initialTipReduceEffort": "הפחיתו כרגע מאמץ גופני.",
  "scenario.initialTipDrinkWater":
    "שתו מים באופן סדיר אם תוכלו לעשות זאת בבטחה.",

  "placeLookup.searchAction": "חיפוש מקומות בהדגמת Barcelona",
  "placeLookup.loading": "מתבצע חיפוש בנתוני מקומות מאומתים…",
  "placeLookup.resultsTitle": "תוצאות מקומות ב-Barcelona",
  "placeLookup.emptyTitle": "לא נמצא מקום תואם",
  "placeLookup.emptyMessage":
    "אף מקום לא התאים לנקודת ההדגמה הקבועה, לשעת המכשיר הנוכחית ולמגבלות החיפוש.",
  "placeLookup.errorTitle": "מידע על מקומות אינו זמין",
  "placeLookup.errorMessage":
    "לא ניתן היה להציג את המידע על המקומות בבטחה. נסו שוב רק אם תבחרו בכך.",
  "placeLookup.compactBoundary":
    "נקודת הדגמה קבועה של Barcelona · מרחק בקו ישר · בדקו שעות ונגישות",
  "placeLookup.boundary":
    "נעשה שימוש בנקודת ההדגמה הקבועה של Barcelona, לא במיקום שלכם. המרחקים הם בקו ישר, לא מסלולים או זמני הגעה משוערים. שעות הפתיחה נבדקות לפי שעת המכשיר. בדקו שעות ונגישות לפני הנסיעה. זו אינה עזרה רפואית או עזרת חירום.",

  "validation.empty": "תארו את המצב לפני יצירת תוכנית.",
  "validation.overLimit": "התיאור ארוך מדי. קצרו את הטקסט.",
  "validation.serverInput": "בדקו את התיאור ונסו שוב.",

  "status.creating": "תוכנית הפעולה שלכם נוצרת.",
  "status.ready": "תוכנית הפעולה שלכם מוכנה.",
  "status.loadingDetail":
    "המצב, מזג האוויר והמועמדים המאומתים נבדקים…",

  "error.malformedTitle": "התגובה אינה זמינה",
  "error.malformedMessage": "לא ניתן היה להציג את התגובה בבטחה.",
  "error.unavailableTitle": "תוכנית הפעולה אינה זמינה באופן זמני",
  "error.unavailableMessage":
    "תוכנית הפעולה אינה זמינה באופן זמני. נסו שוב מאוחר יותר.",
  "error.connectionTitle": "לא ניתן להגיע למערכת האחורית",
  "error.connectionMessage":
    "לא ניתן להגיע למערכת האחורית. בדקו שהשירותים המקומיים פועלים.",

  "priority.actNow": "לפעול עכשיו",
  "priority.prepareNow": "להתכונן עכשיו",
  "priority.monitorAndPrepare": "לעקוב ולהתכונן",

  "result.eyebrow": "תוכנית הפעולה שלכם לחום ב-Barcelona",
  "result.priorityBadge": "עדיפות: {{priority}}",
  "result.evaluatedAt": "הוערך בתאריך ובשעה {{dateTime}}",
  "result.weatherSummaryAccessibleName": "סיכום מזג האוויר",
  "result.currentTemperature": "הטמפרטורה הנוכחית",
  "result.feelsLike": "מרגיש כמו",
  "result.todayMaximum": "הטמפרטורה המרבית היום",
  "result.phaseNow": "עכשיו",
  "result.phaseNextFewHours": "בשעות הקרובות",
  "result.phaseTonight": "הלילה",
  "result.bringItemsTitle": "מה לקחת איתכם",
  "result.explanationTitle": "למה התוכנית הזאת",
  "result.localPhraseTitle": "משפט מקומי",
  "result.localPhraseCatalan": "קטלאנית",
  "result.localPhraseSpanish": "ספרדית",
  "result.noPlaceTitle": "לא נבחר מקום מאומת",
  "result.noticesTitle": "הודעות בטיחות ומידע",

  "place.backendApprovedLabel": "מועמד שאושר במערכת האחורית",
  "place.distanceLabel": "מרחק",
  "place.closesLabel": "שעת סגירה",
  "place.accessibilityLabel": "נגישות",
  "place.lastCheckedLabel": "נבדק לאחרונה",
  "place.featuresTitle": "מאפיינים מאומתים",
  "place.noFeatures": "לא רשומים מאפיינים מאומתים נוספים.",
  "place.linksAccessibleName": "קישורים רשמיים של המקום",
  "place.informationLink": "מידע רשמי",
  "place.sourceLink": "מקור רשמי",
  "place.mapLink": "פתיחה ב-Google Maps",
  "place.cautionsAccessibleName": "אזהרות לגבי המקום",
  "place.addressUnavailable": "הכתובת אינה זמינה",
  "place.accessibilityConfirmed": "הנגישות אושרה על ידי המקור",
  "place.accessibilityUnavailable":
    "לפי המקור, המקום הזה אינו נגיש",
  "place.accessibilityUnknown": "מצב הנגישות אינו ידוע",

  "feature.indoorSpace": "חלל מקורה",
  "feature.potableWater": "מי שתייה",
  "feature.toilets": "שירותים",
  "feature.microShelter": "מחסה קטן",
  "feature.petsAllowed": "מותר להכניס חיות מחמד",

  "feature.confirmed": "מאומת",
  "feature.unavailable": "לא צוין כזמין",
  "feature.unknown": "לא מאומת",

  "distance.straightLine": "{{distance}} בקו ישר",

  "urgent.badge": "דחוף · לפעול מיד",
  "urgent.eyebrow": "תוצאת בטיחות מיידית",
  "urgent.title": "עזרה דחופה",
  "urgent.sourceLink": "הנחיות 112 הרשמיות",

  "trust.eyebrow": "גבולות האמון",
  "trust.title": "שימושי בלי להפריז בוודאות.",
  "trust.safetyLabel": "בטיחות",
  "trust.safetyTitle": "מידע, לא ייעוץ רפואי",
  "trust.safetyDescription":
    "נתוני מזג האוויר נגזרים ממודל ואינם אזהרת חום רשמית. יש לבדוק מקומות, שעות פתיחה, מרחק בקו ישר ואפשרות הגעה לפני היציאה. פלט דחוף משתמש בתוכן קבוע שבשליטת המערכת האחורית.",
  "trust.privacyLabel": "פרטיות",
  "trust.privacyTitle": "אין לכלול פרטים מזהים",
  "trust.privacyDescription":
    "טקסט המצב אינו נשמר באחסון הדפדפן. העדפות מפורשות של מצב התצוגה והשפה נשמרות מקומית. רק קוד השפה שנבחר נכלל בבקשת תוכנית הפעולה; מצב התצוגה אינו נכלל. HeatRelay אינו משתמש באנליטיקה, בקובצי Cookie, בפרמטרים של URL או במיקום גאוגרפי בהדגמה זו.",

  "footer.description": "הדגמת Barcelona · קואורדינטות קבועות",

  "metadata.title": "HeatRelay · תשתית פיילוט Barcelona",
  "metadata.description":
    "HeatRelay הוא מיזם שמתחיל ב-Barcelona ונבנה כדי להפוך אזהרות חום לצעדים הבאים הבטוחים.",
} as const satisfies MessageCatalog;
