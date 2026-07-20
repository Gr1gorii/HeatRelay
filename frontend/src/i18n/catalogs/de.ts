import type { MessageCatalog } from "./en";

export const GERMAN_CATALOG = {
  "app.name": "HeatRelay",

  "navigation.skipToMain": "Zum Hauptinhalt springen",
  "navigation.homeAccessibleName": "HeatRelay-Startseite",
  "navigation.primaryAccessibleName": "Hauptnavigation",
  "navigation.createPlan": "Plan erstellen",
  "navigation.safetyAndPrivacy": "Sicherheit und Datenschutz",

  "header.settings": "Einstellungen",

"visualMode.label": "Darstellungsmodus",
  "visualMode.standard": "Standard",
  "visualMode.enhanced": "Verbesserte Sichtbarkeit",
  "visualMode.highContrast": "Hoher Kontrast",
  "visualMode.description":
    "Die verbesserte Sichtbarkeit ist für Menschen mit eingeschränktem Sehvermögen oder für alle gedacht, die größere und klarere Inhalte bevorzugen.",

  "interfaceLanguage.label": "Sprache der Benutzeroberfläche",
  "interfaceLanguage.description":
    "Ändert Navigation, Formulare und Seitenbeschriftungen. Die Sprache des Aktionsplans wird dadurch nicht geändert.",
  "interfaceLanguage.optionWithEnglishName":
    "{{nativeName}} — {{englishName}}",

  "outputLanguage.label": "Sprache des Aktionsplans",
  "outputLanguage.description":
    "Wählt die Sprache für den nächsten Aktionsplan. Diese Einstellung wird in diesem Browser gespeichert und mit der Aktionsplan-Anfrage gesendet. Sie ändert weder die Sprache der Benutzeroberfläche noch übersetzt sie Ihre Beschreibung.",

  "languageContext.title": "Sprachinformationen",
  "languageContext.descriptionLanguage": "Sprache der Beschreibung",
  "languageContext.displayedLanguage": "Sprache des angezeigten Aktionsplans",
  "languageContext.nextLanguage": "Sprache des nächsten Aktionsplans",
  "languageContext.supportedMismatch":
    "Die Beschreibung und der angezeigte Plan verwenden unterschiedliche unterstützte Sprachen. Prüfen Sie den Plan sorgfältig und wählen Sie bei Bedarf eine andere Aktionsplansprache.",
  "languageContext.catalanUnavailable":
    "Eine Aktionsplanausgabe auf Katalanisch ist nicht verfügbar. Prüfen Sie den angezeigten Plan sorgfältig und wählen Sie bei Bedarf eine verfügbare Aktionsplansprache.",
  "languageContext.other":
    "HeatRelay konnte die Sprache der Beschreibung keiner unterstützten Einführungssprache zuordnen. Prüfen Sie den angezeigten Plan sorgfältig und wählen Sie die Aktionsplansprache, die Sie am besten verstehen.",
  "languageContext.unknown":
    "HeatRelay konnte die Sprache der Beschreibung nicht zuverlässig bestimmen. Prüfen Sie den angezeigten Plan sorgfältig und wählen Sie die Aktionsplansprache, die Sie am besten verstehen.",
  "languageContext.nextSelection":
    "Der angezeigte Plan wird nicht neu geschrieben. Ihre gespeicherte Auswahl gilt für den nächsten Plan.",
  "languageContext.otherValue": "Eine andere Sprache",
  "languageContext.unknownValue": "Konnte nicht bestimmt werden",
  "languageContext.changeAction": "Aktionsplansprache ändern",

  "hero.eyebrow": "Barcelona-Pilotprojekt · Meilenstein 5",
  "hero.title": "Von der Hitzewarnung zum sicheren nächsten Schritt.",
  "hero.introduction":
    "Beschreibe eine Hitzesituation, und HeatRelay fordert beim bestehenden Backend einen fundierten Aktionsplan für Barcelona mit festen Demo-Koordinaten an.",
  "hero.action": "Einen Plan für Barcelona erstellen",

  "release.kicker": "Aktuelle Version",
  "release.badge": "Barcelona-Demo",
  "release.title": "Ein einziger, serverseitig gesteuerter Ablauf",
  "release.description":
    "Der Browser sendet nur deine Beschreibung und die festen Einstellungen der Barcelona-Demo. Wetter, Priorität, Orte und Faktenprüfung verbleiben im Backend.",
  "release.actionPlanApiLabel": "Aktionsplan-API",
  "release.actionPlanApiValue": "Same-Origin-Endpunkt",
  "release.demoLocationLabel": "Demo-Standort",
  "release.demoLocationValue": "Fester Punkt in Barcelona",
  "release.browserLocationLabel": "Browserstandort",
  "release.browserLocationValue": "Nicht verfügbar",

  "form.eyebrow": "Barcelona-Demo",
  "form.title": "Erstelle deinen Hitze-Aktionsplan",
  "form.introduction":
    "Teile nur die Situationsangaben mit, die nötig sind, um einen begrenzten, vom Backend validierten Plan anzupassen. Eine Übermittlung führt zu genau einer Anfrage.",
  "form.privacyTitle": "Vor dem Absenden",
  "form.privacyDescription":
    "Deine Beschreibung wird serverseitig an OpenAI zur Verarbeitung mit GPT-5.6 gesendet. HeatRelay speichert oder protokolliert den Rohtext nicht absichtlich; die Richtlinien des Anbieters zur Datenverarbeitung können dennoch gelten.",
  "form.identityWarning":
    "Gib keine Namen, Kontaktdaten, Adressen oder andere identifizierende Angaben an.",
  "form.situationLabel": "Beschreibe die Hitzesituation",
  "form.characterCount": "{{currentCount}} / {{limit}} Codepunkte",
  "form.characterCountOverLimit":
    "{{currentCount}} / {{limit}} Codepunkte — {{overLimitCount}} über dem Limit",
  "form.situationHint":
    "Verwende bis zu {{limit}} Unicode-Codepunkte. Du kannst Alter, Zugang zu Kühlung, Mobilität, Zeitpunkt oder einen begrenzten Umfang an Warnsymptomen beschreiben.",
  "form.demoButton": "Barcelona-Demo laden",
  "form.submitButton": "Meinen Hitze-Aktionsplan erstellen",
  "form.submittingButton": "Dein Plan wird erstellt…",
  "form.boundaryNote":
    "Dieses MVP verwendet feste Demo-Koordinaten für Barcelona. Der Browserstandort ist noch nicht verfügbar. Entfernungen sind Luftlinienschätzungen; HeatRelay ist weder medizinische Beratung noch Notfallberatung.",
  "form.demoText":
    "Ich bin 69 Jahre alt, lebe allein, habe keine Klimaanlage, gehe langsam und spreche kein Spanisch.",

  "scenario.heading": "Wie können wir helfen?",
  "scenario.selfTitle": "Mir ist zu heiß",
  "scenario.selfDescription": "Persönlichen Aktionsplan erstellen",
  "scenario.someoneTitle": "Einer nahestehenden Person helfen",
  "scenario.someoneDescription": "Plan für eine andere Person erstellen",
  "scenario.placeTitle": "Einen kühlen Ort in der Nähe finden",
  "scenario.placeDescription": "Die nächste bestätigte Hilfe anzeigen",
  "scenario.nearestHelp": "Nächste Hilfe",
  "scenario.importantNow": "Jetzt wichtig",

  "validation.empty": "Beschreibe die Situation, bevor du einen Plan erstellst.",
  "validation.overLimit":
    "Halte die Beschreibung innerhalb von {{limit}} Unicode-Zeichen.",
  "validation.serverInput": "Überprüfe die Beschreibung und versuche es erneut.",

  "status.creating": "Dein Aktionsplan wird erstellt.",
  "status.ready": "Dein Aktionsplan ist bereit.",
  "status.loadingDetail":
    "Situation, Wetter und verifizierte Kandidaten werden geprüft…",

  "error.malformedTitle": "Antwort nicht verfügbar",
  "error.malformedMessage": "Die Antwort konnte nicht sicher angezeigt werden.",
  "error.unavailableTitle": "Aktionsplan vorübergehend nicht verfügbar",
  "error.unavailableMessage":
    "Der Aktionsplan ist vorübergehend nicht verfügbar. Versuche es später erneut.",
  "error.connectionTitle": "Backend nicht erreichbar",
  "error.connectionMessage":
    "Das Backend konnte nicht erreicht werden. Prüfe, ob die lokalen Dienste ausgeführt werden.",

  "priority.actNow": "Jetzt handeln",
  "priority.prepareNow": "Jetzt vorbereiten",
  "priority.monitorAndPrepare": "Beobachten und vorbereiten",

  "result.eyebrow": "Dein Hitze-Aktionsplan für Barcelona",
  "result.priorityBadge": "Priorität: {{priority}}",
  "result.evaluatedAt": "Auswertung: {{dateTime}}",
  "result.weatherSummaryAccessibleName": "Wetterübersicht",
  "result.currentTemperature": "Aktuelle Temperatur",
  "result.feelsLike": "Gefühlte Temperatur",
  "result.todayMaximum": "Heutiger Höchstwert",
  "result.phaseNow": "Jetzt",
  "result.phaseNextFewHours": "In den nächsten Stunden",
  "result.phaseTonight": "Heute Abend",
  "result.bringItemsTitle": "Mitzunehmen",
  "result.explanationTitle": "Warum dieser Plan",
  "result.localPhraseTitle": "Ein Satz in der lokalen Sprache",
  "result.localPhraseCatalan": "Katalanisch",
  "result.localPhraseSpanish": "Spanisch",
  "result.noPlaceTitle": "Kein verifizierter Ort ausgewählt",
  "result.noticesTitle": "Sicherheits- und Informationshinweise",

  "place.backendApprovedLabel": "Vom Backend genehmigter Kandidat",
  "place.distanceLabel": "Entfernung",
  "place.closesLabel": "Schließt",
  "place.accessibilityLabel": "Barrierefreiheit",
  "place.lastCheckedLabel": "Zuletzt geprüft",
  "place.featuresTitle": "Verifizierte Merkmale",
  "place.noFeatures": "Keine weiteren verifizierten Merkmale aufgeführt.",
  "place.linksAccessibleName": "Offizielle Links zum Ort",
  "place.informationLink": "Offizielle Informationen",
  "place.sourceLink": "Offizielle Quelle",
  "place.mapLink": "Route in Google Maps öffnen",
  "place.cautionsAccessibleName": "Hinweise zum Ort",
  "place.addressUnavailable": "Adresse nicht verfügbar",
  "place.accessibilityConfirmed": "Barrierefreiheit von der Quelle bestätigt",
  "place.accessibilityUnavailable":
    "Die Quelle meldet, dass dieser Ort nicht barrierefrei ist",
  "place.accessibilityUnknown": "Status der Barrierefreiheit unbekannt",

  "feature.indoorSpace": "Innenraum",
  "feature.potableWater": "Trinkwasser",
  "feature.toilets": "Toiletten",
  "feature.microShelter": "Mikro-Schutzraum",
  "feature.petsAllowed": "Haustiere erlaubt",

  "feature.confirmed": "Bestätigt",
  "feature.unavailable": "Nicht als verfügbar aufgeführt",
  "feature.unknown": "Nicht bestätigt",

  "distance.straightLine": "{{distance}} Luftlinie",

  "urgent.badge": "Dringend · sofort handeln",
  "urgent.eyebrow": "Unmittelbares Sicherheitsergebnis",
  "urgent.title": "Dringende Hilfe",
  "urgent.sourceLink": "Offizielle Hinweise der 112",

  "trust.eyebrow": "Vertrauensgrenzen",
  "trust.title": "Hilfreich, ohne Gewissheit vorzutäuschen.",
  "trust.safetyLabel": "Sicherheit",
  "trust.safetyTitle": "Informationen, keine medizinische Beratung",
  "trust.safetyDescription":
    "Das Wetter ist modellbasiert und keine offizielle Hitzewarnung. Orte, Öffnungszeiten, Luftlinienentfernung und Erreichbarkeit sollten vor dem Aufbruch geprüft werden. Dringende Ausgaben verwenden feste, vom Backend vorgegebene Inhalte.",
  "trust.privacyLabel": "Datenschutz",
  "trust.privacyTitle": "Keine identifizierenden Angaben machen",
  "trust.privacyDescription":
    "Der Situationstext wird nicht im Browserspeicher gespeichert. Ausdrücklich ausgewählte Einstellungen für Darstellungsmodus, Sprache der Benutzeroberfläche und Sprache des Aktionsplans werden lokal gespeichert. Nur der gewählte Sprachcode des Aktionsplans wird in die Anfrage aufgenommen; Darstellungsmodus und Sprache der Benutzeroberfläche nicht. HeatRelay verwendet in dieser Demo keine Analysefunktionen, Cookies, URL-Parameter oder Geolokalisierung.",

  "footer.description": "Barcelona-Demo · Feste Koordinaten",

  "metadata.title": "HeatRelay · Grundlage des Barcelona-Pilotprojekts",
  "metadata.description":
    "HeatRelay ist ein zunächst auf Barcelona ausgerichtetes Projekt, das Hitzewarnungen in sichere nächste Schritte umwandeln soll.",
} as const satisfies MessageCatalog;
