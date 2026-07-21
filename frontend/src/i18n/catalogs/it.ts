import type { MessageCatalog } from "./en";

export const ITALIAN_CATALOG = {
  "app.name": "HeatRelay",

  "navigation.skipToMain": "Vai al contenuto principale",
  "navigation.homeAccessibleName": "Pagina iniziale di HeatRelay",
  "navigation.primaryAccessibleName": "Principale",
  "navigation.createPlan": "Crea un piano",
  "navigation.safetyAndPrivacy": "Sicurezza e privacy",

  "header.settings": "Impostazioni",

"visualMode.label": "Modalità visiva",
  "visualMode.standard": "Standard",
  "visualMode.enhanced": "Visibilità migliorata",
  "visualMode.highContrast": "Contrasto elevato",
  "visualMode.description":
    "La Visibilità migliorata è pensata per le persone ipovedenti o per chiunque preferisca contenuti più grandi e chiari.",

  "interfaceLanguage.label": "Lingua",
  "interfaceLanguage.description":
    "Cambia l’interfaccia e la lingua del prossimo piano d’azione. Non traduce la descrizione né riscrive il piano visualizzato.",
  "interfaceLanguage.optionWithEnglishName":
    "{{nativeName}} — {{englishName}}",

  "outputLanguage.label": "Lingua del piano d’azione",
  "outputLanguage.description":
    "Sceglie la lingua del prossimo piano d’azione. Questa preferenza viene salvata nel browser e inviata con la richiesta del piano d’azione. Non cambia la lingua dell’interfaccia e non traduce la tua descrizione.",

  "languageContext.title": "Informazioni sulla lingua",
  "languageContext.descriptionLanguage": "Lingua della descrizione",
  "languageContext.displayedLanguage": "Lingua del piano visualizzato",
  "languageContext.nextLanguage": "Lingua del prossimo piano d’azione",
  "languageContext.supportedMismatch":
    "La descrizione e il piano visualizzato usano lingue supportate diverse. Esamina attentamente il piano e, se necessario, scegli un’altra lingua per il piano d’azione.",
  "languageContext.catalanUnavailable":
    "L’output del piano d’azione in catalano non è disponibile. Esamina attentamente il piano visualizzato e, se necessario, scegli una lingua disponibile per il piano d’azione.",
  "languageContext.other":
    "HeatRelay non è riuscito ad associare la lingua della descrizione a una delle lingue di lancio supportate. Esamina attentamente il piano visualizzato e scegli la lingua del piano d’azione che comprendi meglio.",
  "languageContext.unknown":
    "HeatRelay non è riuscito a determinare in modo affidabile la lingua della descrizione. Esamina attentamente il piano visualizzato e scegli la lingua del piano d’azione che comprendi meglio.",
  "languageContext.nextSelection":
    "Il piano visualizzato non viene riscritto. La scelta salvata si applicherà al prossimo piano.",
  "languageContext.otherValue": "Un’altra lingua",
  "languageContext.unknownValue": "Impossibile determinarla",
  "languageContext.changeAction": "Cambia lingua",

  "hero.eyebrow": "Progetto pilota di Barcelona · Traguardo 5",
  "hero.title": "Dall’allerta per il caldo a un passo successivo sicuro.",
  "hero.introduction":
    "Descrivi una situazione di caldo e HeatRelay chiederà al backend esistente un unico piano d’azione per Barcelona basato su dati verificati, usando coordinate demo fisse.",
  "hero.action": "Crea un piano per Barcelona",

  "release.kicker": "Versione attuale",
  "release.badge": "Demo di Barcelona",
  "release.title": "Un unico flusso di lavoro gestito dal server",
  "release.description":
    "Il browser invia solo la tua descrizione e le impostazioni fisse della demo di Barcelona. Meteo, priorità, luoghi e convalida dei dati restano nel backend.",
  "release.actionPlanApiLabel": "API del piano d’azione",
  "release.actionPlanApiValue": "Endpoint con la stessa origine",
  "release.demoLocationLabel": "Posizione della demo",
  "release.demoLocationValue": "Punto fisso a Barcelona",
  "release.browserLocationLabel": "Posizione del browser",
  "release.browserLocationValue": "Non disponibile",

  "form.eyebrow": "Demo di Barcelona",
  "form.title": "Crea il tuo piano d’azione per il caldo",
  "form.introduction":
    "Condividi solo i dettagli della situazione necessari per personalizzare un piano circoscritto e convalidato dal backend. Ogni invio effettua una sola richiesta.",
  "form.privacyTitle": "Privacy e dettagli della demo",
  "form.privacyDescription":
    "La tua descrizione viene inviata lato server a OpenAI per l’elaborazione con GPT-5.6. HeatRelay non memorizza né registra intenzionalmente il testo originale; potrebbero comunque applicarsi le politiche del fornitore sul trattamento dei dati.",
  "form.identityWarning":
    "OpenAI elabora questo testo. Non inserire nomi, recapiti o indirizzi. Punto demo fisso di Barcelona; non è assistenza d’emergenza.",
  "form.situationLabel": "Descrivi la situazione di caldo",
  "form.characterCount": "{{currentCount}} / {{limit}} caratteri",
  "form.characterCountOverLimit":
    "{{currentCount}} / {{limit}} caratteri — riduci di {{overLimitCount}}",
  "form.situationHint":
    "Età · accesso a un luogo fresco · mobilità · sintomi",
  "form.demoButton": "Carica la demo di Barcelona",
  "form.submitButton": "Crea il mio piano d’azione per il caldo",
  "form.submittingButton": "Creazione del piano in corso…",
  "form.boundaryNote":
    "Questo MVP usa coordinate demo fisse di Barcelona. La posizione del browser non è ancora disponibile. Le distanze sono stime in linea d’aria; HeatRelay non costituisce consulenza medica né indicazione per le emergenze.",
  "form.demoText":
    "Ho 69 anni, vivo in casa senza altre persone, non ho l’aria condizionata, cammino lentamente e non parlo spagnolo.",

  "scenario.heading": "Come possiamo aiutarti?",
  "scenario.selfTitle": "Ho troppo caldo",
  "scenario.selfDescription": "Crea un piano d’azione personale",
  "scenario.someoneTitle": "Aiuta una persona vicina",
  "scenario.someoneDescription": "Crea un piano per un’altra persona",
  "scenario.placeTitle": "Trova un luogo fresco nell’area demo di Barcelona",
  "scenario.placeDescription": "Cerca informazioni fattuali sui luoghi",
  "scenario.nearestHelp": "Informazioni sui luoghi di Barcelona",
  "scenario.importantNow": "Importante adesso",
  "scenario.initialTipCoolestSpot":
    "Spostati nel punto disponibile più fresco dove ti trovi già.",
  "scenario.initialTipReduceEffort": "Riduci per ora lo sforzo fisico.",
  "scenario.initialTipDrinkWater":
    "Bevi acqua regolarmente se puoi farlo in sicurezza.",

  "placeLookup.searchAction": "Cerca luoghi nella demo di Barcelona",
  "placeLookup.loading": "Ricerca di dati verificati sui luoghi…",
  "placeLookup.resultsTitle": "Risultati dei luoghi di Barcelona",
  "placeLookup.emptyTitle": "Nessun luogo corrispondente trovato",
  "placeLookup.emptyMessage":
    "Nessun luogo corrispondeva al punto demo fisso, all’ora attuale del dispositivo e ai limiti di ricerca.",
  "placeLookup.errorTitle": "Informazioni sui luoghi non disponibili",
  "placeLookup.errorMessage":
    "Non è stato possibile mostrare in modo sicuro le informazioni sui luoghi. Riprova solo se lo scegli.",
  "placeLookup.compactBoundary":
    "Punto demo fisso di Barcelona · Distanza in linea d’aria · Verifica orari e accessibilità",
  "placeLookup.boundary":
    "Usa il punto demo fisso di Barcelona, non la tua posizione. Le distanze sono in linea d’aria, non percorsi o tempi di arrivo stimati. Gli orari vengono valutati con l’ora del dispositivo. Verifica orari e accessibilità prima di spostarti. Non è assistenza medica o d’emergenza.",

  "validation.empty": "Descrivi la situazione prima di creare un piano.",
  "validation.overLimit": "La descrizione è troppo lunga. Accorcia il testo.",
  "validation.serverInput": "Controlla la descrizione e riprova.",

  "status.creating": "Creazione del piano d’azione in corso.",
  "status.ready": "Il tuo piano d’azione è pronto.",
  "status.loadingDetail":
    "Verifica della situazione, del meteo e dei candidati convalidati in corso…",

  "error.malformedTitle": "Risposta non disponibile",
  "error.malformedMessage": "Non è stato possibile visualizzare la risposta in sicurezza.",
  "error.unavailableTitle": "Piano d’azione temporaneamente non disponibile",
  "error.unavailableMessage":
    "Il piano d’azione è temporaneamente non disponibile. Riprova più tardi.",
  "error.connectionTitle": "Impossibile raggiungere il backend",
  "error.connectionMessage":
    "Impossibile raggiungere il backend. Verifica che i servizi locali siano in esecuzione.",

  "priority.actNow": "Agisci ora",
  "priority.prepareNow": "Preparati ora",
  "priority.monitorAndPrepare": "Monitora e preparati",

  "result.eyebrow": "Il tuo piano d’azione per il caldo a Barcelona",
  "result.priorityBadge": "Priorità: {{priority}}",
  "result.evaluatedAt": "Valutato il {{dateTime}}",
  "result.weatherSummaryAccessibleName": "Riepilogo meteo",
  "result.currentTemperature": "Temperatura attuale",
  "result.feelsLike": "Temperatura percepita",
  "result.todayMaximum": "Massima di oggi",
  "result.phaseNow": "Ora",
  "result.phaseNextFewHours": "Nelle prossime ore",
  "result.phaseTonight": "Stasera",
  "result.bringItemsTitle": "Cosa portare con sé",
  "result.explanationTitle": "Perché questo piano",
  "result.localPhraseTitle": "Una frase nella lingua locale",
  "result.localPhraseCatalan": "Catalano",
  "result.localPhraseSpanish": "Spagnolo",
  "result.noPlaceTitle": "Nessun luogo verificato selezionato",
  "result.noticesTitle": "Avvisi di sicurezza e informativi",

  "place.backendApprovedLabel": "Candidato approvato dal backend",
  "place.distanceLabel": "Distanza",
  "place.closesLabel": "Chiude",
  "place.accessibilityLabel": "Accessibilità",
  "place.lastCheckedLabel": "Ultima verifica",
  "place.featuresTitle": "Caratteristiche verificate",
  "place.noFeatures": "Non sono elencate altre caratteristiche verificate.",
  "place.linksAccessibleName": "Link ufficiali del luogo",
  "place.informationLink": "Informazioni ufficiali",
  "place.sourceLink": "Fonte ufficiale",
  "place.mapLink": "Apri in Google Maps",
  "place.cautionsAccessibleName": "Avvertenze sul luogo",
  "place.addressUnavailable": "Indirizzo non disponibile",
  "place.accessibilityConfirmed": "Accessibilità confermata dalla fonte",
  "place.accessibilityUnavailable":
    "La fonte segnala che questo luogo non è accessibile",
  "place.accessibilityUnknown": "Stato di accessibilità sconosciuto",

  "feature.indoorSpace": "Spazio al coperto",
  "feature.potableWater": "Acqua potabile",
  "feature.toilets": "Servizi igienici",
  "feature.microShelter": "Micro-rifugio",
  "feature.petsAllowed": "Animali ammessi",

  "feature.confirmed": "Confermato",
  "feature.unavailable": "Non indicato come disponibile",
  "feature.unknown": "Non confermato",

  "distance.straightLine": "{{distance}} in linea d’aria",

  "urgent.badge": "Urgente · agisci immediatamente",
  "urgent.eyebrow": "Risultato immediato per la sicurezza",
  "urgent.title": "Aiuto urgente",
  "urgent.sourceLink": "Indicazioni ufficiali per il 112",

  "trust.eyebrow": "Limiti di affidabilità",
  "trust.title": "Utile, senza sopravvalutare la certezza.",
  "trust.safetyLabel": "Sicurezza",
  "trust.safetyTitle": "Informazioni, non consulenza medica",
  "trust.safetyDescription":
    "I dati meteo derivano da un modello e non costituiscono un’allerta ufficiale per il caldo. Luoghi, orari, distanza in linea d’aria e raggiungibilità devono essere verificati prima di partire. L’output urgente usa contenuti fissi gestiti dal backend.",
  "trust.privacyLabel": "Privacy",
  "trust.privacyTitle": "Non inserire dettagli identificativi",
  "trust.privacyDescription":
    "Il testo della situazione non viene memorizzato nello spazio di archiviazione del browser. Le preferenze esplicite per modalità visiva e lingua vengono salvate localmente. Solo il codice della lingua scelta entra nella richiesta del piano d’azione; la modalità visiva non vi entra. HeatRelay non usa strumenti di analisi, cookie, parametri URL né geolocalizzazione in questa demo.",

  "footer.description": "Demo di Barcelona · Coordinate fisse",

  "metadata.title": "HeatRelay · Base del progetto pilota di Barcelona",
  "metadata.description":
    "HeatRelay è un progetto incentrato inizialmente su Barcelona, sviluppato per trasformare le allerte per il caldo in passi successivi sicuri.",
} as const satisfies MessageCatalog;
