"""Deterministic German action-plan output catalog."""

from types import MappingProxyType

from backend.app.action_plan_catalogs import ActionPlanCatalog


GERMAN_ACTION_PLAN_CATALOG = ActionPlanCatalog(
    policy_notice=(
        "HeatRelay wendet transparente Heuristiken der Barcelona-Richtlinie "
        "auf klar eingegrenzte Situationsfakten und bei nicht dringenden "
        "Fällen auf einen aus Modellen abgeleiteten Wetterkontext an. Dies "
        "belegt weder die Aktivierung einer offiziellen Warnung noch das "
        "Vorliegen eines Notfalls."
    ),
    policy_rules=(
        (
            "Verwenden Sie die veröffentlichten Tagesschwellenwerte von "
            "34.0°C und 36.0°C ausschließlich als versionierte Heuristiken "
            "der HeatRelay-Richtlinie für die aus Modellen abgeleitete "
            "Tageshöchsttemperatur, niemals als Nachweis einer kommunalen "
            "Aktivierung."
        ),
        (
            "Behalten Sie den Hinweis zur Überprüfung der Öffnungszeiten bei "
            "und stellen Sie einen Hitzeschutzraum niemals als Ersatz für "
            "medizinische Versorgung dar."
        ),
        (
            "Ein ausdrücklich angegebenes klar eingegrenztes Warnsymptom "
            "führt zum dringenden Zweig und umgeht die normale Wetter-, "
            "Orts- und Planerstellung."
        ),
        (
            "Ordnen Sie jeden Wert im aktuellen geschlossenen Katalog klar "
            "eingegrenzter Warnsymptome den festen, vom Backend verwalteten "
            "112-Kontaktinformationen zu."
        ),
        (
            "Halten Sie das Ergebnis informativ und deterministisch; stellen "
            "Sie keine Diagnose und erstellen Sie keinen medizinischen "
            "Risikowert. Empfehlen Sie die Kühlung ausschließlich mit dem "
            "angegebenen Ventilator nur dann, wenn sowohl die aktuelle als "
            "auch die Tageshöchsttemperatur strikt unter 40.0°C liegen."
        ),
    ),
    situation_notice=(
        "Dieses Ergebnis ist eine strukturierte Zusammenfassung der "
        "ausdrücklich angegebenen Informationen. Es handelt sich weder um "
        "eine medizinische Beratung noch um eine Notfallbeurteilung noch um "
        "einen Aktionsplan."
    ),
    weather_notice=(
        "Dies ist ein aus Open-Meteo-Modellen abgeleiteter Wetterkontext, "
        "keine offizielle Hitzewarnung."
    ),
    urgent_contact_instruction=(
        "Rufen Sie jetzt die 112 an, um Notfallhilfe zu erhalten."
    ),
    urgent_actions=MappingProxyType(
        {
            "contact_emergency_service_now": "Rufen Sie jetzt die 112 an.",
            "do_not_use_shelter_as_medical_substitute": (
                "Hitzeschutzräume sind kein Ersatz für medizinische "
                "Versorgung."
            ),
        }
    ),
    urgent_notices=(
        "Hitzeschutzräume sind kein Ersatz für medizinische Versorgung.",
        (
            "Da ausdrücklich ein klar eingegrenztes Warnsymptom angegeben "
            "wurde, hat HeatRelay weder Wetterdaten noch Informationen zu "
            "Orten abgerufen und GPT-5.6 nicht um die Erstellung eines Plans "
            "gebeten."
        ),
    ),
    now_actions=MappingProxyType(
        {
            "move_to_cooler_space": (
                (
                    "Begeben Sie sich an den kühlsten verfügbaren Ort dort, "
                    "wo Sie sich bereits befinden."
                ),
                (
                    "Eine geringere Hitzeexposition ist hilfreich, ohne "
                    "vorauszusetzen, dass ein Ortswechsel möglich ist."
                ),
            ),
            "reduce_physical_effort": (
                "Verringern Sie vorerst Ihre körperliche Anstrengung.",
                (
                    "Weniger Anstrengung kann die zusätzliche Hitzebelastung "
                    "verringern."
                ),
            ),
            "drink_water": (
                (
                    "Trinken Sie regelmäßig Wasser, wenn dies für Sie sicher "
                    "ist."
                ),
                "Flüssigkeitszufuhr ist eine übliche Hitzeschutzmaßnahme.",
            ),
            "use_available_home_cooling": (
                (
                    "Nutzen Sie die Kühlgeräte, die Sie ausdrücklich als "
                    "vorhanden angegeben haben."
                ),
                (
                    "Diese Maßnahme stützt sich ausschließlich auf den "
                    "angegebenen Zugang zu Kühlung."
                ),
            ),
            "contact_support_person": (
                (
                    "Kontaktieren Sie eine Vertrauensperson, bevor Sie einen "
                    "Ortswechsel erwägen."
                ),
                (
                    "Die angegebenen Einschränkungen zeigen, dass ein "
                    "Ortswechsel ohne Begleitung nicht geeignet ist."
                ),
            ),
            "remain_at_current_location": (
                (
                    "Bleiben Sie an Ihrem aktuellen Ort und nutzen Sie "
                    "Kühlungsmaßnahmen, die keinen Ortswechsel erfordern."
                ),
                (
                    "Eine angegebene Einschränkung verbietet derzeit das "
                    "Verlassen des Ortes."
                ),
            ),
            "travel_to_selected_place": (
                (
                    "Ziehen Sie den ausgewählten, als geöffnet bestätigten "
                    "Kandidaten erst in Betracht, nachdem Sie seine aktuellen "
                    "Öffnungszeiten geprüft haben."
                ),
                (
                    "Der Ort gehörte für diese Anfrage zur vom Backend "
                    "genehmigten Kandidatenmenge."
                ),
            ),
        }
    ),
    next_few_hours_actions=MappingProxyType(
        {
            "keep_drinking_water": (
                (
                    "Halten Sie Wasser bereit und trinken Sie regelmäßig, "
                    "wenn dies für Sie sicher ist."
                ),
                (
                    "Fortlaufende Flüssigkeitszufuhr ist eine übliche "
                    "Hitzeschutzmaßnahme."
                ),
            ),
            "stay_in_cool_space": (
                (
                    "Verbringen Sie die nächsten Stunden im kühlsten "
                    "geeigneten verfügbaren Raum."
                ),
                "Dies verringert die anhaltende Hitzeexposition.",
            ),
            "check_updated_weather": (
                (
                    "Prüfen Sie aktualisierte Wetterinformationen aus einer "
                    "zuverlässigen Quelle."
                ),
                (
                    "Aus Modellen abgeleitete Bedingungen können sich nach "
                    "dieser Antwort ändern."
                ),
            ),
            "check_on_household_members": (
                (
                    "Sehen Sie nach Haushaltsmitgliedern, die möglicherweise "
                    "Hilfe benötigen, um kühl zu bleiben."
                ),
                (
                    "Diese Maßnahme gilt nur als allgemeine Überprüfung des "
                    "Haushalts."
                ),
            ),
            "prepare_for_tonight": (
                (
                    "Bereiten Sie vor dem Abend den kühlsten verfügbaren "
                    "Schlafplatz vor."
                ),
                (
                    "Eine frühzeitige Vorbereitung kann die nächtliche "
                    "Umgebung sicherer machen."
                ),
            ),
        }
    ),
    tonight_actions=MappingProxyType(
        {
            "ventilate_when_outside_is_cooler": (
                (
                    "Lüften Sie nur, wenn die Außenluft kühler als die "
                    "Innenluft ist."
                ),
                (
                    "So wird nicht vorausgesetzt, dass das Öffnen von "
                    "Fenstern immer kühlt."
                ),
            ),
            "sleep_in_coolest_available_room": (
                (
                    "Nutzen Sie zum Schlafen den kühlsten geeigneten "
                    "verfügbaren Raum."
                ),
                "Dies verringert die nächtliche Hitzeexposition.",
            ),
            "keep_water_nearby": (
                (
                    "Halten Sie nachts Wasser in der Nähe, wenn dies für Sie "
                    "sicher ist."
                ),
                "So lässt sich die Flüssigkeitszufuhr leichter aufrechterhalten.",
            ),
            "check_updated_weather_tonight": (
                (
                    "Prüfen Sie aktualisierte nächtliche Wetterinformationen "
                    "aus einer zuverlässigen Quelle."
                ),
                (
                    "Dieser Plan sagt weder spätere Bedingungen noch "
                    "offizielle Warnungen voraus."
                ),
            ),
        }
    ),
    bring_items=MappingProxyType(
        {
            "water": "Wasser",
            "phone": "Ein aufgeladenes Telefon",
            "keys": "Schlüssel",
            "light_clothing": "Leichte Kleidung",
        }
    ),
    explanations=MappingProxyType(
        {
            "forecast_at_or_above_36c": (
                "Die aus Modellen abgeleitete Tageshöchsttemperatur erreicht "
                "den Richtliniengrenzwert von HeatRelay bei 36.0°C."
            ),
            "forecast_at_or_above_34c": (
                "Die aus Modellen abgeleitete Tageshöchsttemperatur erreicht "
                "den Richtliniengrenzwert von HeatRelay bei 34.0°C."
            ),
            "reported_vulnerability": (
                "Das extrahierte Profil enthält einen ausdrücklich "
                "angegebenen Vulnerabilitätsfaktor."
            ),
            "no_home_cooling": (
                "Das extrahierte Profil gibt ausdrücklich an, dass zu Hause "
                "keine Kühlung vorhanden ist."
            ),
            "temporary_or_unsheltered_housing": (
                "Das extrahierte Profil gibt ausdrücklich eine vorübergehende "
                "Unterkunft oder Obdachlosigkeit an."
            ),
            "reported_mobility_constraint": (
                "Das extrahierte Profil enthält eine ausdrücklich angegebene "
                "Mobilitätseinschränkung."
            ),
            "verified_open_candidate": (
                "Der ausgewählte Ort wurde zum serverseitig festgelegten "
                "Bewertungszeitpunkt als geöffnet bestätigt."
            ),
            "travel_support_required": (
                "Das extrahierte Profil gibt ausdrücklich an, dass ein "
                "Ortswechsel ohne Begleitung nicht möglich ist."
            ),
            "movement_prohibited": (
                "Das extrahierte Profil gibt ausdrücklich an, dass ein "
                "Verlassen des Ortes derzeit nicht möglich ist."
            ),
            "unresolved_travel_constraint": (
                "Die Vereinbarkeit eines sofortigen Ortswechsels mit den "
                "gespeicherten Zeit- oder Mobilitätsfakten konnte nicht "
                "bestätigt werden."
            ),
            "baseline_monitoring": (
                "Keine höherrangige HeatRelay-Richtlinienregel traf auf die "
                "klar eingegrenzten Eingaben zu."
            ),
        }
    ),
    normal_notice=(
        "Dies ist eine informative Hitzeschutzplanung, keine medizinische "
        "Beratung, keine Route und keine Garantie dafür, dass ein Ort "
        "verfügbar bleibt."
    ),
    candidate_explanations=MappingProxyType(
        {
            "matched_candidate": (
                "Die Kandidaten erfüllten die angeforderten Filter für "
                "Luftlinienentfernung, bestätigte Öffnungszeiten und "
                "erforderliche Merkmale."
            ),
            "no_candidate": (
                "Kein offizieller Ort in diesem Datenstand erfüllte die "
                "angeforderten Filter für Luftlinienentfernung, bestätigte "
                "Öffnungszeiten und erforderliche Merkmale. Es wurde kein "
                "Ersatzort erfunden."
            ),
            "movement_prohibited": (
                "Es wird kein Kandidat für einen Ortswechsel zurückgegeben, "
                "weil die normalisierte Situation ausdrücklich angibt, dass "
                "ein Verlassen des Ortes derzeit nicht möglich ist."
            ),
            "unresolved_travel_compatibility": (
                "Es wird kein Kandidat für einen sofortigen Ortswechsel "
                "zurückgegeben, weil sich die Vereinbarkeit mit der "
                "ausdrücklich angegebenen Zeit- oder Mobilitätseinschränkung "
                "anhand der gespeicherten serverseitigen Fakten nicht "
                "belegen lässt."
            ),
        }
    ),
    candidate_warnings=MappingProxyType(
        {
            "hours": (
                "Kommunale Öffnungszeiten können sich ändern; prüfen Sie vor "
                "einem Ortswechsel die offizielle Quelle."
            ),
            "candidate_notice": (
                "Dies sind faktengestützte, vom Backend genehmigte mögliche "
                "Orte, keine medizinischen Empfehlungen."
            ),
            "distance": (
                "Entfernungen sind ausschließlich Schätzungen in Luftlinie; "
                "HeatRelay stellt weder Routen noch Schätzungen der "
                "Reisezeit bereit."
            ),
            "reachability": (
                "Dass ein Ort zum Bewertungszeitpunkt geöffnet ist, belegt "
                "nicht, dass er vor der Schließung erreichbar ist."
            ),
        }
    ),
    unresolved_travel_notice=(
        "Ein sofortiger Ortswechsel wurde nicht angeboten, weil die "
        "Vereinbarkeit mit einer ausdrücklich angegebenen Zeit- oder "
        "Mobilitätseinschränkung nicht bestätigt werden konnte."
    ),
)


__all__ = ("GERMAN_ACTION_PLAN_CATALOG",)
