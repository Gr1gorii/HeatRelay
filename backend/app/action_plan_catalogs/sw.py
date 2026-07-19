"""Deterministic Swahili action-plan output catalog."""

from types import MappingProxyType

from backend.app.action_plan_catalogs import ActionPlanCatalog


SWAHILI_ACTION_PLAN_CATALOG = ActionPlanCatalog(
    policy_notice=(
        "HeatRelay hutumia kanuni za kukadiria za sera ya Barcelona zilizo wazi "
        "kwa ukweli wa hali uliowekewa mipaka na, kwa hali zisizo za dharura, "
        "maelezo ya muktadha wa hali ya hewa yanayotokana na modeli. Hii "
        "haithibitishi kwamba onyo rasmi au hali ya dharura imeanzishwa."
    ),
    policy_rules=(
        (
            "Tumia viwango vya mchana vilivyochapishwa vya 34.0°C na 36.0°C "
            "pekee kama kanuni za kukadiria za sera ya HeatRelay zenye toleo "
            "maalumu kwa kiwango cha juu cha joto cha siku hiyo kinachotokana "
            "na modeli, kamwe si kama uthibitisho wa kuanzishwa kwa tahadhari "
            "na manispaa."
        ),
        (
            "Dumisha onyo la kukagua saa za kufunguliwa na kamwe usipendekeze "
            "makazi ya kujikinga na hali ya hewa kama mbadala wa huduma ya matibabu."
        ),
        (
            "Dalili ya tahadhari iliyo katika mipaka iliyowekwa na iliyoripotiwa "
            "wazi hutumia tawi la dharura na kuruka hatua za kawaida za hali ya "
            "hewa, maeneo na utengenezaji wa mpango."
        ),
        (
            "Elekeza kila thamani katika katalogi funge ya sasa ya dalili za "
            "tahadhari zilizo katika mipaka iliyowekwa kwenye maudhui ya mawasiliano "
            "ya 112 yasiyobadilika yanayomilikiwa na backend."
        ),
        (
            "Dumisha matokeo yawe ya kutoa taarifa na yenye kuamuliwa kwa kanuni; "
            "usifanye uchunguzi wa ugonjwa wala kuunda alama ya hatari ya kitabibu. "
            "Pendekeza kupoa kwa feni pekee kulikoripotiwa ikiwa tu joto la sasa "
            "na kiwango cha juu cha joto cha siku hiyo vyote viko chini ya "
            "40.0°C bila kufikia kiwango hicho."
        ),
    ),
    situation_notice=(
        "Matokeo haya ni muhtasari wenye muundo wa taarifa zilizoripotiwa wazi. "
        "Si ushauri wa kitabibu, tathmini ya dharura wala mpango wa hatua."
    ),
    weather_notice=(
        "Haya ni maelezo ya muktadha wa hali ya hewa yanayotokana na modeli ya "
        "Open-Meteo, si onyo rasmi la joto."
    ),
    urgent_contact_instruction=(
        "Piga simu 112 sasa ili upate msaada wa dharura."
    ),
    urgent_actions=MappingProxyType(
        {
            "contact_emergency_service_now": "Piga simu 112 sasa.",
            "do_not_use_shelter_as_medical_substitute": (
                "Makazi ya kujikinga na hali ya hewa si mbadala wa huduma ya matibabu."
            ),
        }
    ),
    urgent_notices=(
        "Makazi ya kujikinga na hali ya hewa si mbadala wa huduma ya matibabu.",
        (
            "Kwa sababu dalili ya tahadhari iliyo katika mipaka iliyowekwa "
            "iliripotiwa wazi, HeatRelay haikupata taarifa za hali ya hewa au "
            "maeneo na haikuiomba GPT-5.6 itengeneze mpango."
        ),
    ),
    now_actions=MappingProxyType(
        {
            "move_to_cooler_space": (
                "Nenda kwenye sehemu yenye ubaridi zaidi inayopatikana ulipo sasa.",
                (
                    "Kupunguza kukabiliwa na joto kunafaa bila kudhani kuwa "
                    "kusafiri kunawezekana."
                ),
            ),
            "reduce_physical_effort": (
                "Punguza nguvu za mwili kwa sasa.",
                "Kupunguza shughuli kunaweza kupunguza mzigo wa ziada wa joto.",
            ),
            "drink_water": (
                "Kunywa maji mara kwa mara ikiwa unaweza kufanya hivyo kwa usalama.",
                "Kunywa maji ni hatua ya kawaida ya usalama wakati wa joto.",
            ),
            "use_available_home_cooling": (
                "Tumia vifaa vya kupoza ulivyoripoti wazi kuwa unavyo.",
                "Hatua hii inategemea tu ufikiaji wa kupoza ulioripotiwa.",
            ),
            "contact_support_person": (
                "Wasiliana na mtu unayemwamini kabla ya kufikiria kusafiri.",
                "Vikwazo vilivyoripotiwa vinaonyesha kuwa kusafiri peke yako hakufai.",
            ),
            "remain_at_current_location": (
                "Baki katika eneo lako la sasa na utumie hatua za kupoza zisizohitaji kusafiri.",
                "Kizuizi kilichoripotiwa kinakuzuia kuondoka kwa sasa.",
            ),
            "travel_to_selected_place": (
                (
                    "Fikiria chaguo lililochaguliwa na kuthibitishwa kuwa wazi "
                    "baada tu ya kukagua saa zake za sasa za kufunguliwa."
                ),
                (
                    "Eneo hilo lilikuwa katika kundi la chaguo zilizoidhinishwa "
                    "na backend kwa ombi hili."
                ),
            ),
        }
    ),
    next_few_hours_actions=MappingProxyType(
        {
            "keep_drinking_water": (
                "Weka maji karibu na unywe mara kwa mara ikiwa ni salama kwako.",
                "Kuendelea kunywa maji ni hatua ya kawaida ya usalama wakati wa joto.",
            ),
            "stay_in_cool_space": (
                "Tumia saa chache zijazo katika sehemu inayofaa na yenye ubaridi zaidi inayopatikana.",
                "Hii inapunguza kuendelea kukabiliwa na joto.",
            ),
            "check_updated_weather": (
                "Kagua taarifa mpya za hali ya hewa kutoka chanzo kinachoaminika.",
                "Hali zinazotokana na modeli zinaweza kubadilika baada ya jibu hili.",
            ),
            "check_on_household_members": (
                "Waangalie wanafamilia ambao huenda wakahitaji msaada ili wabaki katika ubaridi.",
                "Hatua hii inatumika tu kama ukaguzi wa jumla wa wanafamilia.",
            ),
            "prepare_for_tonight": (
                "Andaa sehemu yenye ubaridi zaidi ya kulala kabla ya jioni.",
                "Maandalizi ya mapema yanaweza kufanya mazingira ya usiku yawe salama zaidi.",
            ),
        }
    ),
    tonight_actions=MappingProxyType(
        {
            "ventilate_when_outside_is_cooler": (
                "Pitisha hewa ikiwa tu hewa ya nje ni baridi kuliko ya ndani.",
                "Hii huepuka kudhani kuwa kufungua madirisha kunapunguza joto kila wakati.",
            ),
            "sleep_in_coolest_available_room": (
                "Lala katika chumba kinachofaa na chenye ubaridi zaidi kinachopatikana.",
                "Hii inapunguza kukabiliwa na joto wakati wa usiku.",
            ),
            "keep_water_nearby": (
                "Weka maji karibu nawe usiku kucha ikiwa ni salama kwako.",
                "Hii hurahisisha kuendelea kunywa maji.",
            ),
            "check_updated_weather_tonight": (
                "Kagua taarifa mpya za hali ya hewa ya usiku kutoka chanzo kinachoaminika.",
                "Mpango huu hautabiri hali za baadaye au maonyo rasmi."
            ),
        }
    ),
    bring_items=MappingProxyType(
        {
            "water": "Maji ya kunywa",
            "phone": "Simu iliyochajiwa",
            "keys": "Funguo",
            "light_clothing": "Mavazi mepesi",
        }
    ),
    explanations=MappingProxyType(
        {
            "forecast_at_or_above_36c": (
                "Kiwango cha juu cha joto cha siku hiyo kinachotokana na modeli "
                "kimefikia mpaka wa sera ya HeatRelay wa 36.0°C."
            ),
            "forecast_at_or_above_34c": (
                "Kiwango cha juu cha joto cha siku hiyo kinachotokana na modeli "
                "kimefikia mpaka wa sera ya HeatRelay wa 34.0°C."
            ),
            "reported_vulnerability": (
                "Wasifu uliotolewa una sababu ya udhaifu iliyoripotiwa wazi."
            ),
            "no_home_cooling": (
                "Wasifu uliotolewa unaripoti wazi kuwa hakuna njia ya kupoza nyumbani."
            ),
            "temporary_or_unsheltered_housing": (
                "Wasifu uliotolewa unaripoti wazi makazi ya muda au kutokuwa na makazi."
            ),
            "reported_mobility_constraint": (
                "Wasifu uliotolewa una kizuizi cha utembeaji kilichoripotiwa wazi."
            ),
            "verified_open_candidate": (
                "Eneo lililochaguliwa lilithibitishwa kuwa wazi katika wakati wa tathmini unaomilikiwa na seva."
            ),
            "travel_support_required": (
                "Wasifu uliotolewa unaripoti wazi kuwa kusafiri peke yako hakuwezekani."
            ),
            "movement_prohibited": (
                "Wasifu uliotolewa unaripoti wazi kuwa kuondoka hakuwezekani kwa sasa."
            ),
            "unresolved_travel_constraint": (
                "Uwezekano wa kusafiri mara moja haukuweza kuthibitishwa kutokana "
                "na ukweli wa muda au utembeaji uliohifadhiwa."
            ),
            "baseline_monitoring": (
                "Hakuna kanuni ya juu zaidi ya sera ya HeatRelay iliyolingana na "
                "maingizo yaliyowekewa mipaka."
            ),
        }
    ),
    normal_notice=(
        "Huu ni mpango wa taarifa kwa usalama wakati wa joto, si ushauri wa "
        "kitabibu, njia ya kusafiri, wala hakikisho kwamba eneo litaendelea "
        "kupatikana."
    ),
    candidate_explanations=MappingProxyType(
        {
            "matched_candidate": (
                "Chaguo linalofaa lililo karibu zaidi na lililothibitishwa kuwa "
                "wazi katika wakati wa tathmini unaomilikiwa na seva lilichaguliwa."
            ),
            "no_candidate": (
                "Hakukuwa na chaguo linalofaa ndani ya umbali ulioombwa ambalo "
                "lilithibitishwa kuwa wazi katika wakati wa tathmini unaomilikiwa na seva."
            ),
            "movement_prohibited": (
                "Hakuna chaguo la kusafiri lililorudishwa kwa sababu hali "
                "iliyosawazishwa inaripoti wazi kuwa kuondoka hakuwezekani kwa sasa."
            ),
            "unresolved_travel_compatibility": (
                "Hakuna chaguo la kusafiri mara moja lililorudishwa kwa sababu "
                "ulinganifu na kizuizi cha muda au utembeaji kilichoripotiwa wazi "
                "hauwezi kuthibitishwa kutokana na ukweli uliohifadhiwa unaomilikiwa na seva."
            ),
        }
    ),
    candidate_warnings=MappingProxyType(
        {
            "hours": (
                "Kagua saa za sasa za kufunguliwa katika chanzo rasmi kabla ya "
                "kusafiri. Kuorodheshwa hakuhakikishi upatikanaji."
            ),
            "candidate_notice": (
                "Haya ni maeneo ya chaguo yanayotegemea ukweli na yaliyoidhinishwa "
                "na backend; si mapendekezo ya matibabu."
            ),
            "distance": (
                "Umbali ni makadirio ya mstari ulionyooka pekee; HeatRelay haitoi "
                "njia au makadirio ya muda wa kusafiri."
            ),
            "reachability": (
                "Eneo kuwa wazi wakati wa tathmini hakuthibitishi kwamba linaweza "
                "kufikiwa kabla ya kufungwa."
            ),
        }
    ),
    unresolved_travel_notice=(
        "Usafiri wa mara moja haukupendekezwa kwa sababu ulinganifu na kizuizi "
        "cha muda au utembeaji kilichoripotiwa wazi haukuweza kuthibitishwa."
    ),
)


__all__ = ("SWAHILI_ACTION_PLAN_CATALOG",)
