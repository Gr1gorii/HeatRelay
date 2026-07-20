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

  "interfaceLanguage.label": "Lingua dell’interfaccia",
  "interfaceLanguage.description":
    "Cambia la navigazione, i moduli e le etichette della pagina. Non cambia la lingua del piano d’azione.",
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
  "languageContext.changeAction": "Cambia la lingua del piano d’azione",

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
  "form.privacyTitle": "Prima dell’invio",
  "form.privacyDescription":
    "La tua descrizione viene inviata lato server a OpenAI per l’elaborazione con GPT-5.6. HeatRelay non memorizza né registra intenzionalmente il testo originale; potrebbero comunque applicarsi le politiche del fornitore sul trattamento dei dati.",
  "form.identityWarning":
    "Non includere nomi, recapiti, indirizzi o altre informazioni identificative.",
  "form.situationLabel": "Descrivi la situazione di caldo",
  "form.characterCount": "{{currentCount}} / {{limit}} punti di codice",
  "form.characterCountOverLimit":
    "{{currentCount}} / {{limit}} punti di codice — {{overLimitCount}} oltre il limite",
  "form.situationHint":
    "Usa fino a {{limit}} punti di codice Unicode. Puoi descrivere età, accesso a sistemi di raffrescamento, mobilità, tempistiche o sintomi di allarme circoscritti.",
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
  "scenario.placeTitle": "Trova un luogo fresco nelle vicinanze",
  "scenario.placeDescription": "Mostra l’aiuto verificato più vicino",
  "scenario.nearestHelp": "Aiuto più vicino",
  "scenario.importantNow": "Importante adesso",

  "validation.empty": "Descrivi la situazione prima di creare un piano.",
  "validation.overLimit":
    "Mantieni la descrizione entro {{limit}} caratteri Unicode.",
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
  "place.mapLink": "Apri il percorso in Google Maps",
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
    "Il testo della situazione non viene memorizzato nello spazio di archiviazione del browser. Le preferenze esplicite per modalità visiva, lingua dell’interfaccia e lingua del piano d’azione vengono salvate localmente. Solo il codice della lingua scelta per il piano d’azione entra nella richiesta; la modalità visiva e la lingua dell’interfaccia non vi entrano. HeatRelay non usa strumenti di analisi, cookie, parametri URL né geolocalizzazione in questa demo.",

  "footer.description": "Demo di Barcelona · Coordinate fisse",

  "metadata.title": "HeatRelay · Base del progetto pilota di Barcelona",
  "metadata.description":
    "HeatRelay è un progetto incentrato inizialmente su Barcelona, sviluppato per trasformare le allerte per il caldo in passi successivi sicuri.",
} as const satisfies MessageCatalog;
