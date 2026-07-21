import type { MessageCatalog } from "./en";

export const DUTCH_CATALOG = {
  "app.name": "HeatRelay",

  "navigation.skipToMain": "Ga naar de hoofdinhoud",
  "navigation.homeAccessibleName": "Startpagina van HeatRelay",
  "navigation.primaryAccessibleName": "Primair",
  "navigation.createPlan": "Maak een plan",
  "navigation.safetyAndPrivacy": "Veiligheid en privacy",

  "header.settings": "Instellingen",

"visualMode.label": "Visuele modus",
  "visualMode.standard": "Standaard",
  "visualMode.enhanced": "Verbeterde zichtbaarheid",
  "visualMode.highContrast": "Hoog contrast",
  "visualMode.description":
    "Verbeterde zichtbaarheid is bedoeld voor mensen met een verminderd gezichtsvermogen of voor iedereen die de voorkeur geeft aan grotere en duidelijkere inhoud.",

  "interfaceLanguage.label": "Taal",
  "interfaceLanguage.description":
    "Wijzigt de interface en de taal van het volgende actieplan. Vertaalt je beschrijving niet en herschrijft het getoonde plan niet.",
  "interfaceLanguage.optionWithEnglishName":
    "{{nativeName}} — {{englishName}}",

  "outputLanguage.label": "Taal van het actieplan",
  "outputLanguage.description":
    "Kiest de taal voor het volgende actieplan. Deze voorkeur wordt in deze browser opgeslagen en met de actieplanaanvraag meegestuurd. De voorkeur wijzigt de interfacetaal niet en vertaalt je beschrijving niet.",

  "languageContext.title": "Taalinformatie",
  "languageContext.descriptionLanguage": "Taal van de beschrijving",
  "languageContext.displayedLanguage": "Taal van het weergegeven actieplan",
  "languageContext.nextLanguage": "Taal van het volgende actieplan",
  "languageContext.supportedMismatch":
    "De beschrijving en het weergegeven plan gebruiken verschillende ondersteunde talen. Controleer het plan zorgvuldig en kies zo nodig een andere taal voor het actieplan.",
  "languageContext.catalanUnavailable":
    "Een actieplan in het Catalaans is niet beschikbaar. Controleer het weergegeven plan zorgvuldig en kies zo nodig een beschikbare taal voor het actieplan.",
  "languageContext.other":
    "HeatRelay kon de taal van de beschrijving niet koppelen aan een van de ondersteunde introductietalen. Controleer het weergegeven plan zorgvuldig en kies de taal voor het actieplan die u het best begrijpt.",
  "languageContext.unknown":
    "HeatRelay kon de taal van de beschrijving niet betrouwbaar vaststellen. Controleer het weergegeven plan zorgvuldig en kies de taal voor het actieplan die u het best begrijpt.",
  "languageContext.nextSelection":
    "Het weergegeven plan wordt niet herschreven. Uw opgeslagen keuze geldt voor het volgende plan.",
  "languageContext.otherValue": "Een andere taal",
  "languageContext.unknownValue": "Kon niet worden vastgesteld",
  "languageContext.changeAction": "Taal wijzigen",

  "hero.eyebrow": "Barcelona-pilot · Mijlpaal 5",
  "hero.title": "Van hittewaarschuwing naar een veilige volgende stap.",
  "hero.introduction":
    "Beschrijf een hittesituatie en HeatRelay vraagt de bestaande backend om één onderbouwd actieplan voor Barcelona met vaste democoördinaten.",
  "hero.action": "Maak een plan voor Barcelona",

  "release.kicker": "Huidige versie",
  "release.badge": "Barcelona-demo",
  "release.title": "Eén workflow onder beheer van de server",
  "release.description":
    "De browser verstuurt alleen uw beschrijving en de vaste demo-instellingen voor Barcelona. Weer, prioriteit, locaties en feitelijke validatie blijven op de backend.",
  "release.actionPlanApiLabel": "Actieplan-API",
  "release.actionPlanApiValue": "Endpoint van dezelfde oorsprong",
  "release.demoLocationLabel": "Demolocatie",
  "release.demoLocationValue": "Vast punt in Barcelona",
  "release.browserLocationLabel": "Browserlocatie",
  "release.browserLocationValue": "Niet beschikbaar",

  "form.eyebrow": "Barcelona-demo",
  "form.title": "Maak uw hitteactieplan",
  "form.introduction":
    "Deel alleen de gegevens over de situatie die nodig zijn om een begrensd, door de backend gevalideerd plan te personaliseren. Eén inzending doet één aanvraag.",
  "form.privacyTitle": "Privacy- en demodetails",
  "form.privacyDescription":
    "Uw beschrijving wordt aan de serverzijde naar OpenAI gestuurd voor verwerking door GPT-5.6. HeatRelay slaat de ruwe tekst niet opzettelijk op en registreert die ook niet opzettelijk; het beleid van de aanbieder voor gegevensverwerking kan nog steeds van toepassing zijn.",
  "form.identityWarning":
    "OpenAI verwerkt deze tekst. Voer geen namen, contactgegevens of adressen in. Vast demopunt voor Barcelona; geen noodhulp.",
  "form.situationLabel": "Beschrijf de hittesituatie",
  "form.characterCount": "{{currentCount}} / {{limit}} tekens",
  "form.characterCountOverLimit":
    "{{currentCount}} / {{limit}} tekens — kort in met {{overLimitCount}}",
  "form.situationHint":
    "Leeftijd · toegang tot verkoeling · mobiliteit · symptomen",
  "form.demoButton": "Laad Barcelona-demo",
  "form.submitButton": "Maak mijn hitteactieplan",
  "form.submittingButton": "Uw plan wordt gemaakt…",
  "form.boundaryNote":
    "Deze MVP gebruikt vaste democoördinaten in Barcelona. Browserlocatie is nog niet beschikbaar. Afstanden zijn hemelsbrede schattingen; HeatRelay is geen medisch advies of noodadvies.",
  "form.demoText":
    "Ik ben 69, ik woon alleen, ik heb geen airconditioning, ik loop langzaam en ik spreek geen Spaans.",

  "scenario.heading": "Hoe kunnen we helpen?",
  "scenario.selfTitle": "Ik heb het te warm",
  "scenario.selfDescription": "Maak een persoonlijk actieplan",
  "scenario.someoneTitle": "Help iemand die dichtbij staat",
  "scenario.someoneDescription": "Maak een plan voor iemand anders",
  "scenario.placeTitle": "Vind een koele plek in het demogebied van Barcelona",
  "scenario.placeDescription": "Zoek feitelijke plaatsinformatie",
  "scenario.nearestHelp": "Plaatsinformatie voor Barcelona",
  "scenario.importantNow": "Nu belangrijk",
  "scenario.initialTipCoolestSpot":
    "Ga naar de koelste beschikbare plek waar je al bent.",
  "scenario.initialTipReduceEffort": "Beperk lichamelijke inspanning voorlopig.",
  "scenario.initialTipDrinkWater":
    "Drink regelmatig water als je dat veilig kunt doen.",

  "placeLookup.searchAction": "Zoek plaatsen in de Barcelona-demo",
  "placeLookup.loading": "Geverifieerde plaatsgegevens worden doorzocht…",
  "placeLookup.resultsTitle": "Resultaten voor plaatsen in Barcelona",
  "placeLookup.emptyTitle": "Geen overeenkomende plaats gevonden",
  "placeLookup.emptyMessage":
    "Geen plaats voldeed aan het vaste demopunt, de huidige apparaattijd en de zoeklimieten.",
  "placeLookup.errorTitle": "Plaatsinformatie niet beschikbaar",
  "placeLookup.errorMessage":
    "De plaatsinformatie kon niet veilig worden weergegeven. Probeer alleen opnieuw als je daarvoor kiest.",
  "placeLookup.compactBoundary":
    "Vast demopunt voor Barcelona · Afstand hemelsbreed · Controleer openingstijden en toegankelijkheid",
  "placeLookup.boundary":
    "Gebruikt het vaste demopunt van Barcelona, niet jouw locatie. Afstanden zijn hemelsbreed, geen routes of geschatte aankomsttijden. Openingstijden worden beoordeeld met de tijd van je apparaat. Controleer openingstijden en toegankelijkheid voordat je reist. Dit is geen medische hulp of noodhulp.",

  "validation.empty": "Beschrijf de situatie voordat u een plan maakt.",
  "validation.overLimit": "De beschrijving is te lang. Kort de tekst in.",
  "validation.serverInput": "Controleer de beschrijving en probeer het opnieuw.",

  "status.creating": "Uw actieplan wordt gemaakt.",
  "status.ready": "Uw actieplan is klaar.",
  "status.loadingDetail":
    "De situatie, het weer en geverifieerde kandidaten worden gecontroleerd…",

  "error.malformedTitle": "Antwoord niet beschikbaar",
  "error.malformedMessage": "Het antwoord kon niet veilig worden weergegeven.",
  "error.unavailableTitle": "Actieplan tijdelijk niet beschikbaar",
  "error.unavailableMessage":
    "Het actieplan is tijdelijk niet beschikbaar. Probeer het later opnieuw.",
  "error.connectionTitle": "Backend niet bereikbaar",
  "error.connectionMessage":
    "De backend kon niet worden bereikt. Controleer of de lokale services actief zijn.",

  "priority.actNow": "Onderneem nu actie",
  "priority.prepareNow": "Bereid u nu voor",
  "priority.monitorAndPrepare": "Volg de situatie en bereid u voor",

  "result.eyebrow": "Uw hitteactieplan voor Barcelona",
  "result.priorityBadge": "Prioriteit: {{priority}}",
  "result.evaluatedAt": "Beoordeeld op {{dateTime}}",
  "result.weatherSummaryAccessibleName": "Weeroverzicht",
  "result.currentTemperature": "Huidige temperatuur",
  "result.feelsLike": "Gevoelstemperatuur",
  "result.todayMaximum": "Maximum van vandaag",
  "result.phaseNow": "Nu",
  "result.phaseNextFewHours": "De komende uren",
  "result.phaseTonight": "Vannacht",
  "result.bringItemsTitle": "Neem mee",
  "result.explanationTitle": "Waarom dit plan",
  "result.localPhraseTitle": "Een plaatselijke zin",
  "result.localPhraseCatalan": "Catalaans",
  "result.localPhraseSpanish": "Spaans",
  "result.noPlaceTitle": "Geen geverifieerde locatie geselecteerd",
  "result.noticesTitle": "Veiligheids- en informatiemeldingen",

  "place.backendApprovedLabel": "Door de backend goedgekeurde kandidaat",
  "place.distanceLabel": "Afstand",
  "place.closesLabel": "Sluit",
  "place.accessibilityLabel": "Toegankelijkheid",
  "place.lastCheckedLabel": "Laatst gecontroleerd",
  "place.featuresTitle": "Geverifieerde voorzieningen",
  "place.noFeatures": "Er zijn geen aanvullende geverifieerde voorzieningen vermeld.",
  "place.linksAccessibleName": "Officiële links van de locatie",
  "place.informationLink": "Officiële informatie",
  "place.sourceLink": "Officiële bron",
  "place.mapLink": "Openen in Google Maps",
  "place.cautionsAccessibleName": "Waarschuwingen voor de locatie",
  "place.addressUnavailable": "Adres niet beschikbaar",
  "place.accessibilityConfirmed": "Toegankelijkheid bevestigd door de bron",
  "place.accessibilityUnavailable":
    "Volgens de bron is deze locatie niet toegankelijk",
  "place.accessibilityUnknown": "Toegankelijkheidsstatus onbekend",

  "feature.indoorSpace": "Binnenruimte",
  "feature.potableWater": "Drinkwater",
  "feature.toilets": "Toiletten",
  "feature.microShelter": "Micro-opvanglocatie",
  "feature.petsAllowed": "Huisdieren toegestaan",

  "feature.confirmed": "Bevestigd",
  "feature.unavailable": "Niet als beschikbaar vermeld",
  "feature.unknown": "Niet bevestigd",

  "distance.straightLine": "{{distance}} hemelsbreed",

  "urgent.badge": "Urgent · handel onmiddellijk",
  "urgent.eyebrow": "Onmiddellijk veiligheidsresultaat",
  "urgent.title": "Dringende hulp",
  "urgent.sourceLink": "Officiële 112-richtlijnen",

  "trust.eyebrow": "Betrouwbaarheidsgrenzen",
  "trust.title": "Nuttig zonder de zekerheid te overdrijven.",
  "trust.safetyLabel": "Veiligheid",
  "trust.safetyTitle": "Informatie, geen medisch advies",
  "trust.safetyDescription":
    "Het weer is afgeleid van een model en is geen officiële hittewaarschuwing. Controleer locaties, openingstijden, hemelsbrede afstand en bereikbaarheid voordat u op pad gaat. Urgente uitvoer gebruikt vaste inhoud die door de backend wordt beheerd.",
  "trust.privacyLabel": "Privacy",
  "trust.privacyTitle": "Laat identificerende gegevens weg",
  "trust.privacyDescription":
    "Situatietekst wordt niet in de browseropslag bewaard. Expliciete voorkeuren voor de visuele modus en taal worden lokaal opgeslagen. Alleen de code van de gekozen taal komt in de actieplanaanvraag; de visuele modus niet. HeatRelay gebruikt in deze demo geen analytics, cookies, URL-parameters of geolocatie.",

  "footer.description": "Barcelona-demo · Vaste coördinaten",

  "metadata.title": "HeatRelay · Fundament van de Barcelona-pilot",
  "metadata.description":
    "HeatRelay is een project dat in Barcelona begint en wordt ontwikkeld om hittewaarschuwingen om te zetten in veilige vervolgstappen.",
} as const satisfies MessageCatalog;
