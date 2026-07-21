export const ENGLISH_CATALOG = {
  "app.name": "HeatRelay",

  "navigation.skipToMain": "Skip to main content",
  "navigation.homeAccessibleName": "HeatRelay home",
  "navigation.primaryAccessibleName": "Primary",
  "navigation.createPlan": "Create a plan",
  "navigation.safetyAndPrivacy": "Safety and privacy",

  "header.settings": "Settings",

"visualMode.label": "Visual mode",
  "visualMode.standard": "Standard",
  "visualMode.enhanced": "Enhanced Visibility",
  "visualMode.highContrast": "High contrast",
  "visualMode.description":
    "Enhanced Visibility is intended for people with low vision or anyone who prefers larger and clearer content.",

  "interfaceLanguage.label": "Language",
  "interfaceLanguage.description":
    "Changes the interface and the language of the next action plan. It does not translate your description or rewrite the displayed plan.",
  "interfaceLanguage.optionWithEnglishName":
    "{{nativeName}} — {{englishName}}",

  "outputLanguage.label": "Action-plan language",
  "outputLanguage.description":
    "Chooses the language for the next action plan. This preference is saved in this browser and sent with the action-plan request. It does not change the interface language or translate your description.",

  "languageContext.title": "Language information",
  "languageContext.descriptionLanguage": "Description language",
  "languageContext.displayedLanguage": "Displayed plan language",
  "languageContext.nextLanguage": "Next action-plan language",
  "languageContext.supportedMismatch":
    "The description and displayed plan use different supported languages. Review the plan carefully and choose another action-plan language if needed.",
  "languageContext.catalanUnavailable":
    "Catalan action-plan output is not available. Review the displayed plan carefully and choose an available action-plan language if needed.",
  "languageContext.other":
    "HeatRelay could not match the description language to one of its supported launch languages. Review the displayed plan carefully and choose the action-plan language you understand best.",
  "languageContext.unknown":
    "HeatRelay could not reliably determine the description language. Review the displayed plan carefully and choose the action-plan language you understand best.",
  "languageContext.nextSelection":
    "The displayed plan is not rewritten. Your saved choice applies to the next plan.",
  "languageContext.otherValue": "Another language",
  "languageContext.unknownValue": "Could not be determined",
  "languageContext.changeAction": "Change language",

  "hero.eyebrow": "Barcelona pilot · Milestone 5",
  "hero.title": "From heat warning to a safe next step.",
  "hero.introduction":
    "Describe a heat situation and HeatRelay will ask the existing backend for one grounded Barcelona action plan using fixed demo coordinates.",
  "hero.action": "Create a Barcelona plan",

  "release.kicker": "Current release",
  "release.badge": "Barcelona demo",
  "release.title": "One server-owned workflow",
  "release.description":
    "The browser sends only your description and fixed Barcelona demo settings. Weather, priority, places, and factual validation stay on the backend.",
  "release.actionPlanApiLabel": "Action-plan API",
  "release.actionPlanApiValue": "Same-origin endpoint",
  "release.demoLocationLabel": "Demo location",
  "release.demoLocationValue": "Fixed Barcelona point",
  "release.browserLocationLabel": "Browser location",
  "release.browserLocationValue": "Not available",

  "form.eyebrow": "Barcelona demo",
  "form.title": "Create your heat action plan",
  "form.introduction":
    "Share only the situation details needed to personalize a bounded, backend-validated plan. One submission makes one request.",
  "form.privacyTitle": "Privacy and demo details",
  "form.privacyDescription":
    "Your description is sent server-side to OpenAI for GPT-5.6 processing. HeatRelay does not intentionally store or log the raw text; provider data-handling policies may still apply.",
  "form.identityWarning":
    "OpenAI processes this text. Do not enter names, contacts or addresses. Fixed Barcelona demo point; not emergency help.",
  "form.situationLabel": "Describe the heat situation",
  "form.characterCount": "{{currentCount}} / {{limit}} characters",
  "form.characterCountOverLimit":
    "{{currentCount}} / {{limit}} characters — shorten by {{overLimitCount}}",
  "form.situationHint":
    "Age · cooling access · mobility · symptoms",
  "form.demoButton": "Load Barcelona demo",
  "form.submitButton": "Create my heat action plan",
  "form.submittingButton": "Creating your plan…",
  "form.boundaryNote":
    "This MVP uses fixed Barcelona demo coordinates. Browser location is not available yet. Distances are straight-line estimates; HeatRelay is not medical or emergency advice.",
  "form.demoText":
    "I am 69, I live alone, I have no air conditioning, I walk slowly, and I do not speak Spanish.",

  "scenario.heading": "How can we help?",
  "scenario.selfTitle": "I am too hot",
  "scenario.selfDescription": "Create a personal action plan",
  "scenario.someoneTitle": "Help someone I care about",
  "scenario.someoneDescription": "Create a plan for another person",
  "scenario.placeTitle": "Find a cool place in the Barcelona demo area",
  "scenario.placeDescription": "Search factual place information",
  "scenario.nearestHelp": "Barcelona place information",
  "scenario.importantNow": "Important now",
  "scenario.initialTipCoolestSpot":
    "Move to the coolest available spot where you already are.",
  "scenario.initialTipReduceEffort": "Reduce physical effort for now.",
  "scenario.initialTipDrinkWater":
    "Drink water regularly if you can do so safely.",

  "placeLookup.searchAction": "Search Barcelona demo places",
  "placeLookup.loading": "Searching verified place data…",
  "placeLookup.resultsTitle": "Barcelona place results",
  "placeLookup.emptyTitle": "No matching place found",
  "placeLookup.emptyMessage":
    "No place matched the fixed demo point, current device time, and search limits.",
  "placeLookup.errorTitle": "Place information unavailable",
  "placeLookup.errorMessage":
    "Place information could not be safely displayed. Try again only if you choose.",
  "placeLookup.compactBoundary":
    "Fixed Barcelona demo point · Straight-line distance · Verify hours and accessibility",
  "placeLookup.boundary":
    "Uses the fixed Barcelona demo point, not your location. Distances are straight-line, not routes or ETAs. Opening hours are evaluated using your device time. Verify hours and accessibility before travelling. Not medical or emergency help.",

  "validation.empty": "Describe the situation before creating a plan.",
  "validation.overLimit": "The description is too long. Shorten the text.",
  "validation.serverInput": "Review the description and try again.",

  "status.creating": "Creating your action plan.",
  "status.ready": "Your action plan is ready.",
  "status.loadingDetail":
    "Checking the situation, weather, and verified candidates…",

  "error.malformedTitle": "Response unavailable",
  "error.malformedMessage": "The response could not be safely displayed.",
  "error.unavailableTitle": "Action plan temporarily unavailable",
  "error.unavailableMessage":
    "The action plan is temporarily unavailable. Please try again later.",
  "error.connectionTitle": "Backend could not be reached",
  "error.connectionMessage":
    "The backend could not be reached. Check that the local services are running.",

  "priority.actNow": "Act now",
  "priority.prepareNow": "Prepare now",
  "priority.monitorAndPrepare": "Monitor and prepare",

  "result.eyebrow": "Your Barcelona heat action plan",
  "result.priorityBadge": "Priority: {{priority}}",
  "result.evaluatedAt": "Evaluated at {{dateTime}}",
  "result.weatherSummaryAccessibleName": "Weather summary",
  "result.currentTemperature": "Current temperature",
  "result.feelsLike": "Feels like",
  "result.todayMaximum": "Today’s maximum",
  "result.phaseNow": "Now",
  "result.phaseNextFewHours": "Next few hours",
  "result.phaseTonight": "Tonight",
  "result.bringItemsTitle": "Bring with you",
  "result.explanationTitle": "Why this plan",
  "result.localPhraseTitle": "A local phrase",
  "result.localPhraseCatalan": "Catalan",
  "result.localPhraseSpanish": "Spanish",
  "result.noPlaceTitle": "No verified place selected",
  "result.noticesTitle": "Safety and information notices",

  "place.backendApprovedLabel": "Backend-approved candidate",
  "place.distanceLabel": "Distance",
  "place.closesLabel": "Closes",
  "place.accessibilityLabel": "Accessibility",
  "place.lastCheckedLabel": "Last checked",
  "place.featuresTitle": "Verified features",
  "place.noFeatures": "No additional verified features are listed.",
  "place.linksAccessibleName": "Official place links",
  "place.informationLink": "Official information",
  "place.sourceLink": "Official source",
  "place.mapLink": "Open in Google Maps",
  "place.cautionsAccessibleName": "Place cautions",
  "place.addressUnavailable": "Address unavailable",
  "place.accessibilityConfirmed": "Accessibility confirmed by the source",
  "place.accessibilityUnavailable":
    "Source reports this place is not accessible",
  "place.accessibilityUnknown": "Accessibility status unknown",

  "feature.indoorSpace": "Indoor space",
  "feature.potableWater": "Drinking water",
  "feature.toilets": "Toilets",
  "feature.microShelter": "Micro-shelter",
  "feature.petsAllowed": "Pets allowed",

  "feature.confirmed": "Confirmed",
  "feature.unavailable": "Not listed as available",
  "feature.unknown": "Not confirmed",

  "distance.straightLine": "{{distance}} straight-line",

  "urgent.badge": "Urgent · act immediately",
  "urgent.eyebrow": "Immediate safety result",
  "urgent.title": "Urgent help",
  "urgent.sourceLink": "Official 112 guidance",

  "trust.eyebrow": "Trust boundaries",
  "trust.title": "Useful without overstating certainty.",
  "trust.safetyLabel": "Safety",
  "trust.safetyTitle": "Information, not medical advice",
  "trust.safetyDescription":
    "Weather is model-derived, not an official heat warning. Places, hours, straight-line distance, and reachability should be checked before travel. Urgent output uses fixed backend-owned content.",
  "trust.privacyLabel": "Privacy",
  "trust.privacyTitle": "Keep identifying details out",
  "trust.privacyDescription":
    "Situation text is not stored in browser storage. Explicit visual-mode and language preferences are stored locally. Only the selected language code enters the action-plan request; visual mode does not. HeatRelay does not use analytics, cookies, URL parameters, or geolocation in this demo.",

  "footer.description": "Barcelona demo · Fixed coordinates",

  "metadata.title": "HeatRelay · Barcelona pilot foundation",
  "metadata.description":
    "HeatRelay is a Barcelona-first project being built to turn heat warnings into safe next steps.",
} as const satisfies Record<string, string>;

export type MessageKey = keyof typeof ENGLISH_CATALOG;

export type MessageCatalog = {
  readonly [Key in MessageKey]: string;
};
