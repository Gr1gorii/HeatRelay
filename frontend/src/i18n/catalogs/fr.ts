import type { MessageCatalog } from "./en";

export const FRENCH_CATALOG = {
  "app.name": "HeatRelay",

  "navigation.skipToMain": "Aller au contenu principal",
  "navigation.homeAccessibleName": "Accueil de HeatRelay",
  "navigation.primaryAccessibleName": "Navigation principale",
  "navigation.createPlan": "Créer un plan",
  "navigation.safetyAndPrivacy": "Sécurité et confidentialité",

  "visualMode.label": "Mode d’affichage",
  "visualMode.standard": "Standard",
  "visualMode.enhanced": "Visibilité renforcée",
  "visualMode.description":
    "La visibilité renforcée est destinée aux personnes malvoyantes ainsi qu’à toute personne qui préfère un contenu plus grand et plus clair.",

  "interfaceLanguage.label": "Langue de l’interface",
  "interfaceLanguage.description":
    "Modifie la navigation, les formulaires et les libellés de la page. Ne modifie pas la langue du plan d’action.",
  "interfaceLanguage.optionWithEnglishName":
    "{{nativeName}} — {{englishName}}",

  "outputLanguage.label": "Langue du plan d’action",
  "outputLanguage.description":
    "Choisit la langue du prochain plan d’action. Cette préférence est enregistrée dans ce navigateur et envoyée avec la requête du plan d’action. Elle ne modifie pas la langue de l’interface et ne traduit pas votre description.",

  "languageContext.title": "Informations linguistiques",
  "languageContext.descriptionLanguage": "Langue de la description",
  "languageContext.displayedLanguage": "Langue du plan affiché",
  "languageContext.nextLanguage": "Langue du prochain plan d’action",
  "languageContext.supportedMismatch":
    "La description et le plan affiché utilisent deux langues prises en charge différentes. Examinez attentivement le plan et choisissez une autre langue pour le plan d’action si nécessaire.",
  "languageContext.catalanUnavailable":
    "La sortie du plan d’action en catalan n’est pas disponible. Examinez attentivement le plan affiché et choisissez une langue disponible pour le plan d’action si nécessaire.",
  "languageContext.other":
    "HeatRelay n’a pas pu faire correspondre la langue de la description à l’une des langues de lancement prises en charge. Examinez attentivement le plan affiché et choisissez la langue du plan d’action que vous comprenez le mieux.",
  "languageContext.unknown":
    "HeatRelay n’a pas pu déterminer de manière fiable la langue de la description. Examinez attentivement le plan affiché et choisissez la langue du plan d’action que vous comprenez le mieux.",
  "languageContext.nextSelection":
    "Le plan affiché n’est pas réécrit. Votre choix enregistré s’appliquera au prochain plan.",
  "languageContext.otherValue": "Une autre langue",
  "languageContext.unknownValue": "Impossible à déterminer",
  "languageContext.changeAction": "Changer la langue du plan d’action",

  "hero.eyebrow": "Projet pilote à Barcelona · Étape 5",
  "hero.title": "D’une alerte de chaleur à une prochaine étape sûre.",
  "hero.introduction":
    "Décrivez une situation liée à la chaleur et HeatRelay demandera au backend existant un plan d’action étayé pour Barcelona à partir de coordonnées de démonstration fixes.",
  "hero.action": "Créer un plan pour Barcelona",

  "release.kicker": "Version actuelle",
  "release.badge": "Démonstration Barcelona",
  "release.title": "Un seul processus géré par le serveur",
  "release.description":
    "Le navigateur envoie uniquement votre description et les paramètres fixes de la démonstration Barcelona. La météo, la priorité, les lieux et la validation factuelle restent gérés par le backend.",
  "release.actionPlanApiLabel": "API du plan d’action",
  "release.actionPlanApiValue": "Point de terminaison de même origine",
  "release.demoLocationLabel": "Lieu de démonstration",
  "release.demoLocationValue": "Point fixe à Barcelona",
  "release.browserLocationLabel": "Localisation du navigateur",
  "release.browserLocationValue": "Non disponible",

  "form.eyebrow": "Démonstration Barcelona",
  "form.title": "Créez votre plan d’action contre la chaleur",
  "form.introduction":
    "Indiquez uniquement les éléments de la situation nécessaires pour personnaliser un plan délimité et validé par le backend. Chaque envoi produit une seule requête.",
  "form.privacyTitle": "Avant l’envoi",
  "form.privacyDescription":
    "Votre description est envoyée côté serveur à OpenAI pour être traitée par GPT-5.6. HeatRelay ne stocke ni ne journalise intentionnellement le texte brut ; les politiques de traitement des données du fournisseur peuvent néanmoins s’appliquer.",
  "form.identityWarning":
    "N’indiquez aucun nom, aucune coordonnée de contact, aucune adresse ni aucune autre information permettant de vous identifier.",
  "form.situationLabel": "Décrivez la situation liée à la chaleur",
  "form.characterCount": "{{currentCount}} / {{limit}} points de code",
  "form.characterCountOverLimit":
    "{{currentCount}} / {{limit}} points de code — dépassement de {{overLimitCount}}",
  "form.situationHint":
    "Utilisez jusqu’à {{limit}} points de code Unicode. Vous pouvez décrire l’âge, l’accès à un lieu frais, la mobilité, le moment concerné ou, de façon limitée, des symptômes d’alerte.",
  "form.demoButton": "Charger la démonstration Barcelona",
  "form.submitButton": "Créer mon plan d’action contre la chaleur",
  "form.submittingButton": "Création de votre plan…",
  "form.boundaryNote":
    "Ce MVP utilise des coordonnées fixes pour la démonstration Barcelona. La localisation du navigateur n’est pas encore disponible. Les distances sont des estimations à vol d’oiseau ; HeatRelay ne fournit ni conseil médical ni conseil pour les situations d’urgence.",
  "form.demoText":
    "J’ai 69 ans, je vis sans personne avec moi, je n’ai pas de climatisation, je marche lentement et je ne parle pas espagnol.",

  "validation.empty": "Décrivez la situation avant de créer un plan.",
  "validation.overLimit":
    "Limitez la description à {{limit}} caractères Unicode.",
  "validation.serverInput": "Vérifiez la description et réessayez.",

  "status.creating": "Création de votre plan d’action.",
  "status.ready": "Votre plan d’action est prêt.",
  "status.loadingDetail":
    "Vérification de la situation, de la météo et des lieux candidats validés…",

  "error.malformedTitle": "Réponse indisponible",
  "error.malformedMessage": "La réponse n’a pas pu être affichée de manière sûre.",
  "error.unavailableTitle": "Plan d’action temporairement indisponible",
  "error.unavailableMessage":
    "Le plan d’action est temporairement indisponible. Veuillez réessayer plus tard.",
  "error.connectionTitle": "Impossible de joindre le backend",
  "error.connectionMessage":
    "Impossible de joindre le backend. Vérifiez que les services locaux sont en cours d’exécution.",

  "priority.actNow": "Agissez maintenant",
  "priority.prepareNow": "Préparez-vous maintenant",
  "priority.monitorAndPrepare": "Surveillez la situation et préparez-vous",

  "result.eyebrow": "Votre plan d’action contre la chaleur à Barcelona",
  "result.priorityBadge": "Priorité : {{priority}}",
  "result.evaluatedAt": "Évalué le {{dateTime}}",
  "result.weatherSummaryAccessibleName": "Résumé météo",
  "result.currentTemperature": "Température actuelle",
  "result.feelsLike": "Température ressentie",
  "result.todayMaximum": "Maximum du jour",
  "result.phaseNow": "Maintenant",
  "result.phaseNextFewHours": "Dans les prochaines heures",
  "result.phaseTonight": "Ce soir",
  "result.bringItemsTitle": "À emporter",
  "result.explanationTitle": "Pourquoi ce plan",
  "result.localPhraseTitle": "Une phrase locale",
  "result.localPhraseCatalan": "Catalan",
  "result.localPhraseSpanish": "Espagnol",
  "result.noPlaceTitle": "Aucun lieu vérifié sélectionné",
  "result.noticesTitle": "Avis de sécurité et d’information",

  "place.backendApprovedLabel": "Lieu candidat approuvé par le backend",
  "place.distanceLabel": "Distance",
  "place.closesLabel": "Ferme à",
  "place.accessibilityLabel": "Accessibilité",
  "place.lastCheckedLabel": "Dernière vérification",
  "place.featuresTitle": "Caractéristiques vérifiées",
  "place.noFeatures": "Aucune autre caractéristique vérifiée n’est indiquée.",
  "place.linksAccessibleName": "Liens officiels du lieu",
  "place.informationLink": "Informations officielles",
  "place.sourceLink": "Source officielle",
  "place.cautionsAccessibleName": "Précautions concernant le lieu",
  "place.addressUnavailable": "Adresse indisponible",
  "place.accessibilityConfirmed": "Accessibilité confirmée par la source",
  "place.accessibilityUnavailable":
    "La source indique que ce lieu n’est pas accessible",
  "place.accessibilityUnknown": "État d’accessibilité inconnu",

  "feature.indoorSpace": "Espace intérieur",
  "feature.potableWater": "Eau potable",
  "feature.toilets": "Toilettes",
  "feature.microShelter": "Micro-abri",
  "feature.petsAllowed": "Animaux de compagnie autorisés",

  "distance.straightLine": "{{distance}} à vol d’oiseau",

  "urgent.badge": "Urgent · agissez immédiatement",
  "urgent.eyebrow": "Résultat de sécurité immédiat",
  "urgent.title": "Aide urgente",
  "urgent.sourceLink": "Consignes officielles du 112",

  "trust.eyebrow": "Limites de confiance",
  "trust.title": "Utile sans exagérer le degré de certitude.",
  "trust.safetyLabel": "Sécurité",
  "trust.safetyTitle": "Des informations, pas des conseils médicaux",
  "trust.safetyDescription":
    "La météo provient d’un modèle et ne constitue pas une alerte officielle de chaleur. Les lieux, les horaires, la distance à vol d’oiseau et la possibilité de s’y rendre doivent être vérifiés avant tout déplacement. Les résultats urgents utilisent un contenu fixe géré par le backend.",
  "trust.privacyLabel": "Confidentialité",
  "trust.privacyTitle": "N’indiquez aucun détail permettant de vous identifier",
  "trust.privacyDescription":
    "Le texte de la situation n’est pas stocké dans le navigateur. Les préférences explicites de mode d’affichage, de langue de l’interface et de langue du plan d’action sont enregistrées localement. Seul le code de langue du plan d’action sélectionné entre dans la requête ; le mode d’affichage et la langue de l’interface n’y entrent pas. HeatRelay n’utilise ni outils d’analyse, ni cookies, ni paramètres d’URL, ni géolocalisation dans cette démonstration.",

  "footer.description": "Démonstration Barcelona · Coordonnées fixes",

  "metadata.title": "HeatRelay · Fondations du projet pilote à Barcelona",
  "metadata.description":
    "HeatRelay est un projet centré sur Barcelona, en cours de développement pour transformer les alertes de chaleur en prochaines étapes sûres.",
} as const satisfies MessageCatalog;
