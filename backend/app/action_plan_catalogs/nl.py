"""Deterministic Dutch action-plan output catalog."""

from types import MappingProxyType

from backend.app.action_plan_catalogs import ActionPlanCatalog


DUTCH_ACTION_PLAN_CATALOG = ActionPlanCatalog(
    policy_notice=(
        "HeatRelay past transparante heuristieken van het Barcelona-beleid "
        "toe op begrensde feiten over de situatie en, voor niet-dringende "
        "gevallen, op weersinformatie die uit modellen is afgeleid. Dit "
        "bewijst niet dat een officiële waarschuwing of noodsituatie is "
        "geactiveerd."
    ),
    policy_rules=(
        (
            "Gebruik de gepubliceerde daggrenzen van 34.0°C en 36.0°C alleen "
            "als geversioneerde heuristieken van het HeatRelay-beleid voor de "
            "uit modellen afgeleide maximumtemperatuur van dezelfde dag, "
            "nooit als bewijs van gemeentelijke activering."
        ),
        (
            "Behoud de waarschuwing om openingstijden te controleren en "
            "presenteer een klimaatschuilplaats nooit als vervanging voor "
            "medische zorg."
        ),
        (
            "Een expliciet gemeld begrensd waarschuwingssymptoom activeert de "
            "urgente tak en slaat de normale verwerking van weer, locaties en "
            "plangeneratie over."
        ),
        (
            "Koppel elke waarde in de huidige gesloten catalogus van "
            "begrensde waarschuwingssymptomen aan de vaste, door de backend "
            "beheerde contactinformatie voor 112."
        ),
        (
            "Houd het resultaat informatief en deterministisch; stel geen "
            "diagnose en maak geen medische risicoscore. Adviseer koeling met "
            "alleen de gemelde ventilator uitsluitend wanneer zowel de "
            "huidige temperatuur als de maximumtemperatuur van dezelfde dag "
            "strikt lager is dan 40.0°C."
        ),
    ),
    situation_notice=(
        "Dit resultaat is een gestructureerde samenvatting van expliciet "
        "gemelde informatie. Het is geen medisch advies, geen beoordeling van "
        "een noodsituatie en geen actieplan."
    ),
    weather_notice=(
        "Dit is weersinformatie die is afgeleid van modellen van Open-Meteo; "
        "het is geen officiële hittewaarschuwing."
    ),
    urgent_contact_instruction="Bel nu 112 voor hulp in een noodsituatie.",
    urgent_actions=MappingProxyType(
        {
            "contact_emergency_service_now": "Bel nu 112.",
            "do_not_use_shelter_as_medical_substitute": (
                "Klimaatschuilplaatsen zijn geen vervanging voor medische "
                "zorg."
            ),
        }
    ),
    urgent_notices=(
        "Klimaatschuilplaatsen zijn geen vervanging voor medische zorg.",
        (
            "Omdat expliciet een begrensd waarschuwingssymptoom is gemeld, "
            "heeft HeatRelay geen weersgegevens of informatie over locaties "
            "opgehaald en GPT-5.6 niet om een plan gevraagd."
        ),
    ),
    now_actions=MappingProxyType(
        {
            "move_to_cooler_space": (
                (
                    "Ga naar de koelste beschikbare plek waar je je al "
                    "bevindt."
                ),
                (
                    "Minder blootstelling aan hitte is nuttig zonder aan te "
                    "nemen dat verplaatsing mogelijk is."
                ),
            ),
            "reduce_physical_effort": (
                "Verminder voorlopig je lichamelijke inspanning.",
                (
                    "Minder inspanning kan de extra warmtebelasting "
                    "verminderen."
                ),
            ),
            "drink_water": (
                "Drink regelmatig water als dat veilig voor je is.",
                "Hydratatie is een gebruikelijke maatregel tegen hitte.",
            ),
            "use_available_home_cooling": (
                (
                    "Gebruik de koelapparatuur waarvan je expliciet hebt "
                    "gemeld dat je die hebt."
                ),
                (
                    "Deze actie steunt uitsluitend op de gemelde toegang tot "
                    "koeling."
                ),
            ),
            "contact_support_person": (
                (
                    "Neem contact op met een vertrouwenspersoon voordat je "
                    "een verplaatsing overweegt."
                ),
                (
                    "De gemelde beperkingen geven aan dat alleen reizen niet "
                    "geschikt is."
                ),
            ),
            "remain_at_current_location": (
                (
                    "Blijf op je huidige locatie en gebruik koelmaatregelen "
                    "waarvoor je je niet hoeft te verplaatsen."
                ),
                (
                    "Een gemelde beperking verbiedt momenteel het verlaten "
                    "van de locatie."
                ),
            ),
            "travel_to_selected_place": (
                (
                    "Overweeg de geselecteerde kandidaat waarvan is "
                    "geverifieerd dat deze open is pas nadat je de actuele "
                    "openingstijden hebt gecontroleerd."
                ),
                (
                    "De locatie maakte voor dit verzoek deel uit van de door "
                    "de backend goedgekeurde kandidaten."
                ),
            ),
        }
    ),
    next_few_hours_actions=MappingProxyType(
        {
            "keep_drinking_water": (
                (
                    "Houd water bij de hand en drink regelmatig als dat veilig "
                    "voor je is."
                ),
                (
                    "Voortdurende hydratatie is een gebruikelijke maatregel "
                    "tegen hitte."
                ),
            ),
            "stay_in_cool_space": (
                (
                    "Breng de komende uren door in de koelste geschikte "
                    "beschikbare ruimte."
                ),
                "Dit vermindert voortdurende blootstelling aan hitte.",
            ),
            "check_updated_weather": (
                (
                    "Controleer bijgewerkte weersinformatie van een "
                    "betrouwbare bron."
                ),
                (
                    "Uit modellen afgeleide omstandigheden kunnen na dit "
                    "antwoord veranderen."
                ),
            ),
            "check_on_household_members": (
                (
                    "Kijk om naar huisgenoten die mogelijk hulp nodig hebben "
                    "om koel te blijven."
                ),
                (
                    "Deze actie geldt alleen als algemene controle van het "
                    "huishouden."
                ),
            ),
            "prepare_for_tonight": (
                (
                    "Maak vóór de avond de koelste beschikbare slaapruimte "
                    "klaar."
                ),
                (
                    "Vooraf voorbereiden kan de nachtelijke omgeving veiliger "
                    "maken."
                ),
            ),
        }
    ),
    tonight_actions=MappingProxyType(
        {
            "ventilate_when_outside_is_cooler": (
                (
                    "Ventileer alleen wanneer de buitenlucht koeler is dan de "
                    "lucht binnen."
                ),
                (
                    "Zo wordt niet aangenomen dat het openen van ramen altijd "
                    "verkoeling geeft."
                ),
            ),
            "sleep_in_coolest_available_room": (
                (
                    "Gebruik de koelste geschikte beschikbare kamer om te "
                    "slapen."
                ),
                "Dit vermindert de nachtelijke blootstelling aan hitte.",
            ),
            "keep_water_nearby": (
                (
                    "Houd 's nachts water in de buurt als dat veilig voor je "
                    "is."
                ),
                "Dit maakt het gemakkelijker om gehydrateerd te blijven.",
            ),
            "check_updated_weather_tonight": (
                (
                    "Controleer bijgewerkte weersinformatie voor de nacht van "
                    "een betrouwbare bron."
                ),
                (
                    "Dit plan voorspelt geen latere omstandigheden of "
                    "officiële waarschuwingen."
                ),
            ),
        }
    ),
    bring_items=MappingProxyType(
        {
            "water": "Drinkwater",
            "phone": "Een opgeladen telefoon",
            "keys": "Sleutels",
            "light_clothing": "Lichte kleding",
        }
    ),
    explanations=MappingProxyType(
        {
            "forecast_at_or_above_36c": (
                "De uit modellen afgeleide maximumtemperatuur van dezelfde "
                "dag bereikt de beleidsgrens van HeatRelay van 36.0°C."
            ),
            "forecast_at_or_above_34c": (
                "De uit modellen afgeleide maximumtemperatuur van dezelfde "
                "dag bereikt de beleidsgrens van HeatRelay van 34.0°C."
            ),
            "reported_vulnerability": (
                "Het geëxtraheerde profiel bevat een expliciet gemelde "
                "kwetsbaarheidsfactor."
            ),
            "no_home_cooling": (
                "Het geëxtraheerde profiel meldt expliciet dat thuis geen "
                "koeling beschikbaar is."
            ),
            "temporary_or_unsheltered_housing": (
                "Het geëxtraheerde profiel meldt expliciet tijdelijke "
                "huisvesting of een situatie zonder onderdak."
            ),
            "reported_mobility_constraint": (
                "Het geëxtraheerde profiel bevat een expliciet gemelde "
                "mobiliteitsbeperking."
            ),
            "verified_open_candidate": (
                "Er is geverifieerd dat de geselecteerde locatie open was op "
                "het door de server bepaalde evaluatiemoment."
            ),
            "travel_support_required": (
                "Het geëxtraheerde profiel meldt expliciet dat alleen reizen "
                "niet mogelijk is."
            ),
            "movement_prohibited": (
                "Het geëxtraheerde profiel meldt expliciet dat de locatie "
                "momenteel niet kan worden verlaten."
            ),
            "unresolved_travel_constraint": (
                "De verenigbaarheid van een onmiddellijke verplaatsing met de "
                "bewaarde tijds- of mobiliteitsfeiten kon niet worden "
                "geverifieerd."
            ),
            "baseline_monitoring": (
                "Geen hogere regel van het HeatRelay-beleid kwam overeen met "
                "de begrensde invoer."
            ),
        }
    ),
    normal_notice=(
        "Dit is een informatief hitteveiligheidsplan, geen medisch advies, "
        "geen route en geen garantie dat een locatie beschikbaar blijft."
    ),
    candidate_explanations=MappingProxyType(
        {
            "matched_candidate": (
                "De kandidaten voldeden aan de gevraagde filters voor afstand "
                "in een rechte lijn, geverifieerde openingstijden en vereiste "
                "voorzieningen."
            ),
            "no_candidate": (
                "Geen officiële locatie in deze momentopname voldeed aan de "
                "gevraagde filters voor afstand in een rechte lijn, "
                "geverifieerde openingstijden en vereiste voorzieningen. Er "
                "is geen vervangende locatie verzonnen."
            ),
            "movement_prohibited": (
                "Er wordt geen kandidaat voor verplaatsing teruggegeven, "
                "omdat de genormaliseerde situatie expliciet meldt dat de "
                "locatie momenteel niet kan worden verlaten."
            ),
            "unresolved_travel_compatibility": (
                "Er wordt geen kandidaat voor onmiddellijke verplaatsing "
                "teruggegeven, omdat de verenigbaarheid met de expliciet "
                "gemelde tijds- of mobiliteitsbeperking niet kan worden "
                "bewezen aan de hand van de bewaarde, door de server beheerde "
                "feiten."
            ),
        }
    ),
    candidate_warnings=MappingProxyType(
        {
            "hours": (
                "Gemeentelijke openingstijden kunnen veranderen; controleer "
                "vóór vertrek de officiële bron."
            ),
            "candidate_notice": (
                "Dit zijn feitelijke, door de backend goedgekeurde mogelijke "
                "locaties, geen medische aanbevelingen."
            ),
            "distance": (
                "Afstanden zijn uitsluitend schattingen in een rechte lijn; "
                "HeatRelay biedt geen routes of schattingen van de reistijd."
            ),
            "reachability": (
                "Dat een locatie op het evaluatiemoment open is, bewijst niet "
                "dat deze vóór sluiting kan worden bereikt."
            ),
        }
    ),
    unresolved_travel_notice=(
        "Onmiddellijke verplaatsing is niet aangeboden, omdat de "
        "verenigbaarheid met een expliciet gemelde tijds- of "
        "mobiliteitsbeperking niet kon worden geverifieerd."
    ),
)


__all__ = ("DUTCH_ACTION_PLAN_CATALOG",)
