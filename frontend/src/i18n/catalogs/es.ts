import type { MessageCatalog } from "./en";

export const SPANISH_CATALOG = {
  "app.name": "HeatRelay",

  "navigation.skipToMain": "Saltar al contenido principal",
  "navigation.homeAccessibleName": "Inicio de HeatRelay",
  "navigation.primaryAccessibleName": "Principal",
  "navigation.createPlan": "Crear un plan",
  "navigation.safetyAndPrivacy": "Seguridad y privacidad",

  "visualMode.label": "Modo visual",
  "visualMode.standard": "Estándar",
  "visualMode.enhanced": "Visibilidad mejorada",
  "visualMode.description":
    "La Visibilidad mejorada está pensada para personas con baja visión o para cualquiera que prefiera contenido más grande y claro.",

  "interfaceLanguage.label": "Idioma de la interfaz",
  "interfaceLanguage.description":
    "Cambia la navegación, los formularios y las etiquetas de la página. No cambia el idioma del plan de acción.",
  "interfaceLanguage.optionWithEnglishName":
    "{{nativeName}} — {{englishName}}",

  "outputLanguage.label": "Idioma del plan de acción",
  "outputLanguage.description":
    "Elige el idioma del próximo plan de acción. Esta preferencia se guarda en este navegador y se envía con la solicitud del plan de acción. No cambia el idioma de la interfaz ni traduce tu descripción.",

  "languageContext.title": "Información sobre los idiomas",
  "languageContext.descriptionLanguage": "Idioma de la descripción",
  "languageContext.displayedLanguage": "Idioma del plan mostrado",
  "languageContext.nextLanguage": "Idioma del próximo plan de acción",
  "languageContext.supportedMismatch":
    "La descripción y el plan mostrado usan idiomas compatibles diferentes. Revisa el plan con atención y elige otro idioma para el plan de acción si es necesario.",
  "languageContext.catalanUnavailable":
    "La salida del plan de acción en catalán no está disponible. Revisa el plan mostrado con atención y elige un idioma disponible para el plan de acción si es necesario.",
  "languageContext.other":
    "HeatRelay no pudo asociar el idioma de la descripción con uno de los idiomas de lanzamiento compatibles. Revisa el plan mostrado con atención y elige el idioma del plan de acción que entiendas mejor.",
  "languageContext.unknown":
    "HeatRelay no pudo determinar de forma fiable el idioma de la descripción. Revisa el plan mostrado con atención y elige el idioma del plan de acción que entiendas mejor.",
  "languageContext.nextSelection":
    "El plan mostrado no se modifica. Tu elección guardada se aplicará al próximo plan.",
  "languageContext.otherValue": "Otro idioma",
  "languageContext.unknownValue": "No se pudo determinar",
  "languageContext.changeAction": "Cambiar el idioma del plan de acción",

  "hero.eyebrow": "Piloto de Barcelona · Hito 5",
  "hero.title": "Del aviso por calor a un próximo paso seguro.",
  "hero.introduction":
    "Describe una situación de calor y HeatRelay solicitará al backend existente un plan de acción fundamentado para Barcelona usando coordenadas fijas de demostración.",
  "hero.action": "Crear un plan para Barcelona",

  "release.kicker": "Versión actual",
  "release.badge": "Demostración de Barcelona",
  "release.title": "Un único flujo de trabajo gestionado por el servidor",
  "release.description":
    "El navegador envía únicamente tu descripción y la configuración fija de la demostración de Barcelona. El tiempo, la prioridad, los lugares y la validación de datos permanecen en el backend.",
  "release.actionPlanApiLabel": "API del plan de acción",
  "release.actionPlanApiValue": "Endpoint del mismo origen",
  "release.demoLocationLabel": "Ubicación de demostración",
  "release.demoLocationValue": "Punto fijo de Barcelona",
  "release.browserLocationLabel": "Ubicación del navegador",
  "release.browserLocationValue": "No disponible",

  "form.eyebrow": "Demostración de Barcelona",
  "form.title": "Crea tu plan de acción ante el calor",
  "form.introduction":
    "Comparte solo los datos de la situación necesarios para personalizar un plan acotado y validado por el backend. Cada envío realiza una sola solicitud.",
  "form.privacyTitle": "Antes de enviar",
  "form.privacyDescription":
    "Tu descripción se envía al servidor a OpenAI para su procesamiento con GPT-5.6. HeatRelay no almacena ni registra intencionadamente el texto sin procesar; aun así, pueden aplicarse las políticas de tratamiento de datos del proveedor.",
  "form.identityWarning":
    "No incluyas nombres, datos de contacto, direcciones ni otra información identificativa.",
  "form.situationLabel": "Describe la situación de calor",
  "form.characterCount": "{{currentCount}} / {{limit}} puntos de código",
  "form.characterCountOverLimit":
    "{{currentCount}} / {{limit}} puntos de código — {{overLimitCount}} por encima del límite",
  "form.situationHint":
    "Usa hasta {{limit}} puntos de código Unicode. Puedes describir la edad, el acceso a refrigeración, la movilidad, el momento o síntomas de alarma acotados.",
  "form.demoButton": "Cargar la demostración de Barcelona",
  "form.submitButton": "Crear mi plan de acción ante el calor",
  "form.submittingButton": "Creando tu plan…",
  "form.boundaryNote":
    "Este MVP usa coordenadas fijas de demostración en Barcelona. La ubicación del navegador aún no está disponible. Las distancias son estimaciones en línea recta; HeatRelay no ofrece asesoramiento médico ni para emergencias.",
  "form.demoText":
    "Tengo 69 años, vivo sin compañía, no tengo aire acondicionado, camino despacio y no hablo español.",

  "validation.empty": "Describe la situación antes de crear un plan.",
  "validation.overLimit":
    "Mantén la descripción dentro del límite de {{limit}} caracteres Unicode.",
  "validation.serverInput": "Revisa la descripción e inténtalo de nuevo.",

  "status.creating": "Creando tu plan de acción.",
  "status.ready": "Tu plan de acción está listo.",
  "status.loadingDetail":
    "Comprobando la situación, el tiempo y los candidatos verificados…",

  "error.malformedTitle": "Respuesta no disponible",
  "error.malformedMessage": "La respuesta no se pudo mostrar de forma segura.",
  "error.unavailableTitle": "Plan de acción temporalmente no disponible",
  "error.unavailableMessage":
    "El plan de acción no está disponible temporalmente. Inténtalo de nuevo más tarde.",
  "error.connectionTitle": "No se pudo contactar con el backend",
  "error.connectionMessage":
    "No se pudo contactar con el backend. Comprueba que los servicios locales estén en ejecución.",

  "priority.actNow": "Actúa ahora",
  "priority.prepareNow": "Prepárate ahora",
  "priority.monitorAndPrepare": "Vigila la situación y prepárate",

  "result.eyebrow": "Tu plan de acción ante el calor para Barcelona",
  "result.priorityBadge": "Prioridad: {{priority}}",
  "result.evaluatedAt": "Evaluado el {{dateTime}}",
  "result.weatherSummaryAccessibleName": "Resumen meteorológico",
  "result.currentTemperature": "Temperatura actual",
  "result.feelsLike": "Sensación térmica",
  "result.todayMaximum": "Máxima de hoy",
  "result.phaseNow": "Ahora",
  "result.phaseNextFewHours": "Próximas horas",
  "result.phaseTonight": "Esta noche",
  "result.bringItemsTitle": "Qué llevar contigo",
  "result.explanationTitle": "Por qué este plan",
  "result.localPhraseTitle": "Una frase local",
  "result.localPhraseCatalan": "Catalán",
  "result.localPhraseSpanish": "Español",
  "result.noPlaceTitle": "No se ha seleccionado ningún lugar verificado",
  "result.noticesTitle": "Avisos de seguridad e información",

  "place.backendApprovedLabel": "Candidato aprobado por el backend",
  "place.distanceLabel": "Distancia",
  "place.closesLabel": "Cierra",
  "place.accessibilityLabel": "Accesibilidad",
  "place.lastCheckedLabel": "Última comprobación",
  "place.featuresTitle": "Características verificadas",
  "place.noFeatures": "No se indican otras características verificadas.",
  "place.linksAccessibleName": "Enlaces oficiales del lugar",
  "place.informationLink": "Información oficial",
  "place.sourceLink": "Fuente oficial",
  "place.cautionsAccessibleName": "Precauciones sobre el lugar",
  "place.addressUnavailable": "Dirección no disponible",
  "place.accessibilityConfirmed": "Accesibilidad confirmada por la fuente",
  "place.accessibilityUnavailable":
    "La fuente indica que este lugar no es accesible",
  "place.accessibilityUnknown": "Estado de accesibilidad desconocido",

  "feature.indoorSpace": "Espacio interior",
  "feature.potableWater": "Agua potable",
  "feature.toilets": "Aseos",
  "feature.microShelter": "Microrrefugio",
  "feature.petsAllowed": "Se admiten mascotas",

  "distance.straightLine": "{{distance}} en línea recta",

  "urgent.badge": "Urgente · actúa de inmediato",
  "urgent.eyebrow": "Resultado de seguridad inmediata",
  "urgent.title": "Ayuda urgente",
  "urgent.sourceLink": "Indicaciones oficiales del 112",

  "trust.eyebrow": "Límites de confianza",
  "trust.title": "Útil sin exagerar la certeza.",
  "trust.safetyLabel": "Seguridad",
  "trust.safetyTitle": "Información, no asesoramiento médico",
  "trust.safetyDescription":
    "El tiempo procede de un modelo, no de un aviso oficial por calor. Antes de desplazarte, comprueba los lugares, los horarios, la distancia en línea recta y si es posible llegar. La respuesta urgente usa contenido fijo controlado por el backend.",
  "trust.privacyLabel": "Privacidad",
  "trust.privacyTitle": "Evita incluir datos identificativos",
  "trust.privacyDescription":
    "El texto de la situación no se almacena en el navegador. Las preferencias explícitas de modo visual, idioma de la interfaz e idioma del plan de acción se guardan localmente. Solo el código del idioma del plan de acción seleccionado se incluye en la solicitud; el modo visual y el idioma de la interfaz no se incluyen. HeatRelay no usa analítica, cookies, parámetros de URL ni geolocalización en esta demostración.",

  "footer.description": "Demostración de Barcelona · Coordenadas fijas",

  "metadata.title": "HeatRelay · Fundamentos del piloto de Barcelona",
  "metadata.description":
    "HeatRelay es un proyecto centrado inicialmente en Barcelona que se está desarrollando para convertir los avisos por calor en próximos pasos seguros.",
} as const satisfies MessageCatalog;
