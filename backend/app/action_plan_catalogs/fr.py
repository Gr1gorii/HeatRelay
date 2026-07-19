"""Deterministic French action-plan output catalog."""

from types import MappingProxyType

from backend.app.action_plan_catalogs import ActionPlanCatalog


FRENCH_ACTION_PLAN_CATALOG = ActionPlanCatalog(
    policy_notice=(
        "HeatRelay applique des heuristiques transparentes de la politique de "
        "Barcelona à des faits circonscrits sur la situation et, pour les cas "
        "non urgents, à un contexte météorologique dérivé de modèles. Cela ne "
        "prouve pas qu’une alerte officielle ou une urgence a été déclenchée."
    ),
    policy_rules=(
        (
            "Utilisez les seuils diurnes publiés de 34.0°C et 36.0°C uniquement "
            "comme des heuristiques versionnées de la politique HeatRelay "
            "appliquées à la température maximale du jour dérivée de modèles, "
            "jamais comme preuve d’une activation municipale."
        ),
        (
            "Conservez l’avertissement de vérifier les horaires et ne présentez "
            "jamais un refuge climatique comme un substitut aux soins médicaux."
        ),
        (
            "Un symptôme d’alerte circonscrit explicitement signalé déclenche "
            "la branche urgente et contourne les processus normaux de météo, "
            "de recherche de lieux et de génération du plan."
        ),
        (
            "Acheminez chaque valeur du catalogue fermé actuel des symptômes "
            "d’alerte circonscrits vers le contenu de contact fixe pour le 112, "
            "contrôlé par le backend."
        ),
        (
            "Maintenez le résultat informatif et déterministe ; ne posez pas de "
            "diagnostic et ne créez pas de score de risque médical. Ne proposez "
            "le rafraîchissement au moyen du seul ventilateur signalé que "
            "lorsque les températures actuelle et maximale du jour sont toutes "
            "deux strictement inférieures à 40.0°C."
        ),
    ),
    situation_notice=(
        "Ce résultat est un résumé structuré des informations explicitement "
        "signalées. Il ne s’agit ni d’un conseil médical, ni d’une évaluation "
        "d’urgence, ni d’un plan d’action."
    ),
    weather_notice=(
        "Il s’agit d’informations météorologiques contextuelles dérivées des "
        "modèles d’Open-Meteo, et non d’une alerte officielle de chaleur."
    ),
    urgent_contact_instruction=(
        "Appelez immédiatement le 112 pour obtenir une assistance d’urgence."
    ),
    urgent_actions=MappingProxyType(
        {
            "contact_emergency_service_now": (
                "Appelez immédiatement le 112."
            ),
            "do_not_use_shelter_as_medical_substitute": (
                "Les refuges climatiques ne remplacent pas les soins médicaux."
            ),
        }
    ),
    urgent_notices=(
        "Les refuges climatiques ne remplacent pas les soins médicaux.",
        (
            "Puisqu’un symptôme d’alerte de portée limitée a été explicitement "
            "signalé, HeatRelay n’a consulté ni les données météorologiques ni "
            "les lieux et n’a pas demandé à GPT-5.6 de générer un plan."
        ),
    ),
    now_actions=MappingProxyType(
        {
            "move_to_cooler_space": (
                (
                    "Allez à l’endroit disponible le plus frais là où vous "
                    "vous trouvez déjà."
                ),
                (
                    "Réduire l’exposition à la chaleur est utile sans supposer "
                    "qu’un déplacement est possible."
                ),
            ),
            "reduce_physical_effort": (
                "Réduisez votre effort physique pour le moment.",
                (
                    "Une diminution de l’effort peut réduire la charge "
                    "thermique supplémentaire."
                ),
            ),
            "drink_water": (
                (
                    "Buvez régulièrement de l’eau si vous pouvez le faire en "
                    "toute sécurité."
                ),
                (
                    "L’hydratation est une mesure habituelle de sécurité face "
                    "à la chaleur."
                ),
            ),
            "use_available_home_cooling": (
                (
                    "Utilisez l’équipement de rafraîchissement que vous avez "
                    "explicitement signalé posséder."
                ),
                (
                    "Cette action repose uniquement sur l’accès au "
                    "rafraîchissement signalé."
                ),
            ),
            "contact_support_person": (
                (
                    "Contactez une personne de confiance avant d’envisager un "
                    "déplacement."
                ),
                (
                    "Les contraintes signalées indiquent qu’un déplacement "
                    "sans accompagnement n’est pas approprié."
                ),
            ),
            "remain_at_current_location": (
                (
                    "Restez là où vous êtes et utilisez des mesures de "
                    "rafraîchissement qui ne nécessitent aucun déplacement."
                ),
                "Une contrainte signalée interdit actuellement de partir.",
            ),
            "travel_to_selected_place": (
                (
                    "N’envisagez le candidat sélectionné, dont l’ouverture a "
                    "été vérifiée, qu’après avoir vérifié ses horaires actuels."
                ),
                (
                    "Le lieu figurait dans l’ensemble de candidats approuvé par "
                    "le backend pour cette demande."
                ),
            ),
        }
    ),
    next_few_hours_actions=MappingProxyType(
        {
            "keep_drinking_water": (
                (
                    "Gardez de l’eau à disposition et buvez régulièrement si "
                    "cela ne présente aucun danger pour vous."
                ),
                (
                    "Une hydratation continue est une mesure habituelle de "
                    "sécurité face à la chaleur."
                ),
            ),
            "stay_in_cool_space": (
                (
                    "Passez les prochaines heures dans l’espace approprié le "
                    "plus frais disponible."
                ),
                "Cela réduit l’exposition continue à la chaleur.",
            ),
            "check_updated_weather": (
                (
                    "Consultez des informations météorologiques actualisées "
                    "auprès d’une source fiable."
                ),
                (
                    "Les conditions dérivées de modèles peuvent changer après "
                    "cette réponse."
                ),
            ),
            "check_on_household_members": (
                (
                    "Prenez des nouvelles des membres de votre foyer qui "
                    "pourraient avoir besoin d’aide pour rester au frais."
                ),
                (
                    "Cette action s’applique uniquement comme vérification "
                    "générale du foyer."
                ),
            ),
            "prepare_for_tonight": (
                (
                    "Préparez avant le soir l’espace disponible le plus frais "
                    "pour dormir."
                ),
                (
                    "Une préparation anticipée peut rendre l’environnement "
                    "nocturne plus sûr."
                ),
            ),
        }
    ),
    tonight_actions=MappingProxyType(
        {
            "ventilate_when_outside_is_cooler": (
                (
                    "Aérez uniquement lorsque l’air extérieur est plus frais "
                    "que l’air intérieur."
                ),
                (
                    "Cela évite de supposer qu’ouvrir les fenêtres rafraîchit "
                    "toujours."
                ),
            ),
            "sleep_in_coolest_available_room": (
                (
                    "Pour dormir, utilisez la pièce appropriée la plus fraîche "
                    "disponible."
                ),
                "Cela réduit l’exposition nocturne à la chaleur.",
            ),
            "keep_water_nearby": (
                (
                    "Gardez de l’eau à proximité pendant la nuit si cela ne "
                    "présente aucun danger pour vous."
                ),
                "Cela facilite le maintien de l’hydratation.",
            ),
            "check_updated_weather_tonight": (
                (
                    "Consultez auprès d’une source fiable des informations "
                    "météorologiques nocturnes actualisées."
                ),
                (
                    "Ce plan ne prédit pas les conditions ultérieures ni les "
                    "alertes officielles."
                ),
            ),
        }
    ),
    bring_items=MappingProxyType(
        {
            "water": "Eau",
            "phone": "Un téléphone chargé",
            "keys": "Clés",
            "light_clothing": "Vêtements légers",
        }
    ),
    explanations=MappingProxyType(
        {
            "forecast_at_or_above_36c": (
                "La température maximale du jour dérivée de modèles atteint "
                "le seuil de 36.0°C de la politique HeatRelay."
            ),
            "forecast_at_or_above_34c": (
                "La température maximale du jour dérivée de modèles atteint "
                "le seuil de 34.0°C de la politique HeatRelay."
            ),
            "reported_vulnerability": (
                "Le profil extrait contient un facteur de vulnérabilité "
                "explicitement signalé."
            ),
            "no_home_cooling": (
                "Le profil extrait signale explicitement l’absence de moyen de "
                "rafraîchissement à domicile."
            ),
            "temporary_or_unsheltered_housing": (
                "Le profil extrait signale explicitement un hébergement "
                "temporaire ou une situation sans abri."
            ),
            "reported_mobility_constraint": (
                "Le profil extrait contient une contrainte de mobilité "
                "explicitement signalée."
            ),
            "verified_open_candidate": (
                "Il a été vérifié que le lieu sélectionné était ouvert à "
                "l’instant d’évaluation contrôlé par le serveur."
            ),
            "travel_support_required": (
                "Le profil extrait signale explicitement qu’un déplacement "
                "sans accompagnement n’est pas possible."
            ),
            "movement_prohibited": (
                "Le profil extrait signale explicitement qu’il n’est pas "
                "possible de partir actuellement."
            ),
            "unresolved_travel_constraint": (
                "La compatibilité d’un déplacement immédiat avec les faits "
                "conservés sur l’horaire ou la mobilité n’a pas pu être "
                "vérifiée."
            ),
            "baseline_monitoring": (
                "Aucune règle supérieure de la politique HeatRelay ne "
                "correspondait aux données circonscrites."
            ),
        }
    ),
    normal_notice=(
        "Il s’agit d’un plan informatif de sécurité face à la chaleur, et non "
        "de conseils médicaux, d’un itinéraire ou d’une garantie qu’un lieu "
        "restera disponible."
    ),
    candidate_explanations=MappingProxyType(
        {
            "matched_candidate": (
                "Les candidats répondaient aux filtres demandés de distance en "
                "ligne droite, d’horaires d’ouverture vérifiés et de "
                "caractéristiques requises."
            ),
            "no_candidate": (
                "Aucun lieu officiel de cet instantané ne répondait aux "
                "filtres demandés de distance en ligne droite, d’horaires "
                "d’ouverture vérifiés et de caractéristiques requises. Aucun "
                "lieu de remplacement n’a été inventé."
            ),
            "movement_prohibited": (
                "Aucun candidat de déplacement n’est renvoyé, car la situation "
                "normalisée signale explicitement qu’il n’est pas possible de "
                "partir actuellement."
            ),
            "unresolved_travel_compatibility": (
                "Aucun candidat de déplacement immédiat n’est renvoyé, car les "
                "faits conservés et contrôlés par le serveur ne permettent pas "
                "de prouver la compatibilité avec la contrainte d’horaire ou "
                "de mobilité explicitement signalée."
            ),
        }
    ),
    candidate_warnings=MappingProxyType(
        {
            "hours": (
                "Les horaires d’ouverture municipaux peuvent changer ; "
                "consultez la source officielle avant tout déplacement."
            ),
            "candidate_notice": (
                "Il s’agit de lieux candidats factuels approuvés par le "
                "backend, et non de recommandations médicales."
            ),
            "distance": (
                "Les distances sont uniquement des estimations en ligne "
                "droite ; HeatRelay ne fournit ni itinéraire ni estimation de "
                "durée de déplacement."
            ),
            "reachability": (
                "Le fait qu’un lieu soit ouvert au moment de l’évaluation ne "
                "prouve pas qu’il soit accessible avant sa fermeture."
            ),
        }
    ),
    unresolved_travel_notice=(
        "Aucun déplacement immédiat n’a été proposé, car la compatibilité avec "
        "une contrainte d’horaire ou de mobilité explicitement signalée n’a "
        "pas pu être vérifiée."
    ),
)


__all__ = ("FRENCH_ACTION_PLAN_CATALOG",)
