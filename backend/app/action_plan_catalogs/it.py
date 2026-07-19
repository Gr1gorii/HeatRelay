"""Deterministic Italian action-plan output catalog."""

from types import MappingProxyType

from backend.app.action_plan_catalogs import ActionPlanCatalog


ITALIAN_ACTION_PLAN_CATALOG = ActionPlanCatalog(
    policy_notice=(
        "HeatRelay applica euristiche trasparenti della politica di Barcelona "
        "ai fatti circoscritti della situazione e, per i casi non urgenti, al "
        "contesto meteorologico derivato dai modelli. Questo non dimostra che "
        "sia stata attivata un’allerta ufficiale o un’emergenza."
    ),
    policy_rules=(
        (
            "Usa le soglie diurne pubblicate di 34.0°C e 36.0°C esclusivamente "
            "come euristiche versionate della politica HeatRelay applicate alla "
            "temperatura massima dello stesso giorno derivata dai modelli, mai "
            "come prova di un’attivazione comunale."
        ),
        (
            "Mantieni l’avviso di verificare gli orari e non presentare mai un "
            "rifugio climatico come sostituto dell’assistenza medica."
        ),
        (
            "Un sintomo di allarme circoscritto segnalato esplicitamente attiva "
            "il ramo urgente e salta le normali procedure relative a meteo, "
            "luoghi e generazione del piano."
        ),
        (
            "Indirizza ogni valore dell’attuale catalogo chiuso dei sintomi di "
            "allarme circoscritti ai contenuti fissi di contatto con il 112, "
            "gestiti dal backend."
        ),
        (
            "Mantieni il risultato informativo e deterministico; non formulare "
            "diagnosi né creare un punteggio di rischio medico. Proponi il "
            "raffrescamento con il solo ventilatore segnalato esclusivamente "
            "quando sia la temperatura attuale sia la massima dello stesso "
            "giorno sono strettamente inferiori a 40.0°C."
        ),
    ),
    situation_notice=(
        "Questo output è un riepilogo strutturato delle informazioni riportate "
        "esplicitamente. Non costituisce una consulenza medica, una valutazione "
        "di emergenza né un piano d’azione."
    ),
    weather_notice=(
        "Questo è un contesto meteorologico derivato dai modelli di Open-Meteo, "
        "non un’allerta ufficiale per il caldo."
    ),
    urgent_contact_instruction=(
        "Chiama subito il 112 per ricevere assistenza d’emergenza."
    ),
    urgent_actions=MappingProxyType(
        {
            "contact_emergency_service_now": "Chiama subito il 112.",
            "do_not_use_shelter_as_medical_substitute": (
                "I rifugi climatici non sostituiscono l’assistenza medica."
            ),
        }
    ),
    urgent_notices=(
        "I rifugi climatici non sostituiscono l’assistenza medica.",
        (
            "Poiché è stato segnalato esplicitamente un sintomo di allarme "
            "circoscritto, HeatRelay non ha recuperato dati meteorologici né "
            "informazioni sui luoghi e non ha chiesto a GPT-5.6 di generare un "
            "piano."
        ),
    ),
    now_actions=MappingProxyType(
        {
            "move_to_cooler_space": (
                (
                    "Spostati nel punto più fresco disponibile del luogo in "
                    "cui ti trovi già."
                ),
                (
                    "Ridurre l’esposizione al caldo è utile senza presumere "
                    "che sia possibile spostarsi."
                ),
            ),
            "reduce_physical_effort": (
                "Riduci per ora lo sforzo fisico.",
                (
                    "Un minore sforzo può ridurre il carico termico "
                    "aggiuntivo."
                ),
            ),
            "drink_water": (
                "Bevi acqua regolarmente, se puoi farlo in sicurezza.",
                (
                    "L’idratazione è una misura standard di sicurezza contro "
                    "il caldo."
                ),
            ),
            "use_available_home_cooling": (
                (
                    "Usa l’attrezzatura di raffrescamento che hai segnalato "
                    "esplicitamente di avere."
                ),
                (
                    "Questa azione si basa esclusivamente sull’accesso al "
                    "raffrescamento segnalato."
                ),
            ),
            "contact_support_person": (
                (
                    "Contatta una persona di fiducia prima di prendere in "
                    "considerazione uno spostamento."
                ),
                (
                    "Le limitazioni segnalate indicano che spostarsi senza "
                    "compagnia non è appropriato."
                ),
            ),
            "remain_at_current_location": (
                (
                    "Rimani dove ti trovi e adotta misure di raffrescamento "
                    "che non richiedano spostamenti."
                ),
                (
                    "Una limitazione segnalata impedisce attualmente di "
                    "uscire."
                ),
            ),
            "travel_to_selected_place": (
                (
                    "Considera il candidato selezionato, verificato come "
                    "aperto, solo dopo averne controllato gli orari attuali."
                ),
                (
                    "Il luogo faceva parte dell’insieme di candidati approvato "
                    "dal backend per questa richiesta."
                ),
            ),
        }
    ),
    next_few_hours_actions=MappingProxyType(
        {
            "keep_drinking_water": (
                (
                    "Tieni dell’acqua a disposizione e bevi regolarmente, se "
                    "per te è sicuro farlo."
                ),
                (
                    "L’idratazione continua è una misura standard di sicurezza "
                    "contro il caldo."
                ),
            ),
            "stay_in_cool_space": (
                (
                    "Trascorri le prossime ore nello spazio adatto più fresco "
                    "disponibile."
                ),
                "Questo riduce l’esposizione continua al caldo.",
            ),
            "check_updated_weather": (
                (
                    "Consulta informazioni meteorologiche aggiornate da una "
                    "fonte affidabile."
                ),
                (
                    "Le condizioni derivate dai modelli possono cambiare dopo "
                    "questa risposta."
                ),
            ),
            "check_on_household_members": (
                (
                    "Controlla le persone del tuo nucleo familiare che "
                    "potrebbero aver bisogno di aiuto per restare al fresco."
                ),
                (
                    "Questa azione si applica solo come controllo generale del "
                    "nucleo familiare."
                ),
            ),
            "prepare_for_tonight": (
                (
                    "Prepara prima della sera lo spazio più fresco disponibile "
                    "per dormire."
                ),
                (
                    "Prepararsi in anticipo può rendere più sicuro l’ambiente "
                    "notturno."
                ),
            ),
        }
    ),
    tonight_actions=MappingProxyType(
        {
            "ventilate_when_outside_is_cooler": (
                (
                    "Arieggia solo quando l’aria esterna è più fresca di quella "
                    "interna."
                ),
                (
                    "Questo evita di presumere che aprire le finestre rinfreschi "
                    "sempre l’ambiente."
                ),
            ),
            "sleep_in_coolest_available_room": (
                (
                    "Per dormire, usa la stanza adatta più fresca disponibile."
                ),
                "Questo riduce l’esposizione notturna al caldo.",
            ),
            "keep_water_nearby": (
                (
                    "Tieni dell’acqua vicino durante la notte, se per te è "
                    "sicuro farlo."
                ),
                "Questo rende più facile mantenere l’idratazione.",
            ),
            "check_updated_weather_tonight": (
                (
                    "Consulta informazioni meteorologiche notturne aggiornate "
                    "da una fonte affidabile."
                ),
                (
                    "Questo piano non prevede le condizioni successive né le "
                    "allerte ufficiali."
                ),
            ),
        }
    ),
    bring_items=MappingProxyType(
        {
            "water": "Acqua",
            "phone": "Un telefono carico",
            "keys": "Chiavi",
            "light_clothing": "Abiti leggeri",
        }
    ),
    explanations=MappingProxyType(
        {
            "forecast_at_or_above_36c": (
                "La temperatura massima dello stesso giorno derivata dai "
                "modelli raggiunge la soglia di 36.0°C della politica HeatRelay."
            ),
            "forecast_at_or_above_34c": (
                "La temperatura massima dello stesso giorno derivata dai "
                "modelli raggiunge la soglia di 34.0°C della politica HeatRelay."
            ),
            "reported_vulnerability": (
                "Il profilo estratto contiene un fattore di vulnerabilità "
                "segnalato esplicitamente."
            ),
            "no_home_cooling": (
                "Il profilo estratto segnala esplicitamente l’assenza di "
                "raffrescamento domestico."
            ),
            "temporary_or_unsheltered_housing": (
                "Il profilo estratto segnala esplicitamente una sistemazione "
                "temporanea o una condizione senza riparo."
            ),
            "reported_mobility_constraint": (
                "Il profilo estratto contiene una limitazione della mobilità "
                "segnalata esplicitamente."
            ),
            "verified_open_candidate": (
                "È stato verificato che il luogo selezionato fosse aperto "
                "nell’istante di valutazione controllato dal server."
            ),
            "travel_support_required": (
                "Il profilo estratto segnala esplicitamente che non è possibile "
                "spostarsi senza compagnia."
            ),
            "movement_prohibited": (
                "Il profilo estratto segnala esplicitamente che al momento non "
                "è possibile uscire."
            ),
            "unresolved_travel_constraint": (
                "Non è stato possibile verificare la compatibilità dello "
                "spostamento immediato con i fatti conservati relativi "
                "all’orario o alla mobilità."
            ),
            "baseline_monitoring": (
                "Nessuna regola superiore della politica HeatRelay corrisponde "
                "agli input circoscritti."
            ),
        }
    ),
    normal_notice=(
        "Questo è un piano informativo di sicurezza contro il caldo, non una "
        "consulenza medica, un itinerario né una garanzia che un luogo resti "
        "disponibile."
    ),
    candidate_explanations=MappingProxyType(
        {
            "matched_candidate": (
                "I candidati soddisfacevano i filtri richiesti per distanza in "
                "linea retta, orari di apertura verificati e caratteristiche "
                "obbligatorie."
            ),
            "no_candidate": (
                "Nessun luogo ufficiale in questa istantanea soddisfaceva i "
                "filtri richiesti per distanza in linea retta, orari di apertura "
                "verificati e caratteristiche obbligatorie. Non è stato "
                "inventato alcun luogo alternativo."
            ),
            "movement_prohibited": (
                "Non viene restituito alcun candidato per lo spostamento perché "
                "la situazione normalizzata segnala esplicitamente che al "
                "momento non è possibile uscire."
            ),
            "unresolved_travel_compatibility": (
                "Non viene restituito alcun candidato per uno spostamento "
                "immediato perché i fatti conservati e controllati dal server "
                "non consentono di dimostrare la compatibilità con la "
                "limitazione di orario o mobilità segnalata esplicitamente."
            ),
        }
    ),
    candidate_warnings=MappingProxyType(
        {
            "hours": (
                "Gli orari di apertura comunali possono cambiare; controlla la "
                "fonte ufficiale prima di spostarti."
            ),
            "candidate_notice": (
                "Questi sono luoghi candidati basati su fatti e approvati dal "
                "backend, non raccomandazioni mediche."
            ),
            "distance": (
                "Le distanze sono solo stime in linea retta; HeatRelay non "
                "fornisce itinerari né stime dei tempi di spostamento."
            ),
            "reachability": (
                "Il fatto che un luogo sia aperto al momento della valutazione "
                "non dimostra che sia possibile raggiungerlo prima della "
                "chiusura."
            ),
        }
    ),
    unresolved_travel_notice=(
        "Lo spostamento immediato non è stato proposto perché non è stato "
        "possibile verificarne la compatibilità con una limitazione di orario "
        "o mobilità segnalata esplicitamente."
    ),
)


__all__ = ("ITALIAN_ACTION_PLAN_CATALOG",)
