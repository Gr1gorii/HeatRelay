"""Deterministic Polish action-plan output catalog."""

from types import MappingProxyType

from backend.app.action_plan_catalogs import ActionPlanCatalog


POLISH_ACTION_PLAN_CATALOG = ActionPlanCatalog(
    policy_notice=(
        "HeatRelay stosuje przejrzyste heurystyki polityki Barcelona do "
        "ograniczonych faktów o sytuacji, a w przypadkach innych niż nagłe — "
        "do informacji pogodowych pochodzących z modeli. Nie dowodzi to "
        "uruchomienia oficjalnego ostrzeżenia ani trybu nagłego."
    ),
    policy_rules=(
        (
            "Używaj opublikowanych dziennych wartości granicznych 34.0°C i "
            "36.0°C wyłącznie jako wersjonowanych heurystyk polityki HeatRelay "
            "dla pochodzącej z modeli maksymalnej temperatury tego samego dnia, "
            "nigdy jako dowodu uruchomienia działań przez władze miejskie."
        ),
        (
            "Zachowaj ostrzeżenie o konieczności sprawdzenia godzin otwarcia i "
            "nigdy nie przedstawiaj schronienia klimatycznego jako zamiennika "
            "pomocy medycznej."
        ),
        (
            "Wyraźnie zgłoszony objaw ostrzegawczy objęty ograniczonym zakresem "
            "uruchamia gałąź pilną i pomija zwykłe pozyskiwanie danych "
            "pogodowych, miejsc oraz tworzenie planu."
        ),
        (
            "Każdą wartość z bieżącego zamkniętego katalogu objawów "
            "ostrzegawczych o ograniczonym zakresie kieruj do stałych, "
            "zarządzanych przez backend informacji kontaktowych 112."
        ),
        (
            "Zachowaj informacyjny i deterministyczny charakter wyniku; nie "
            "stawiaj diagnozy ani nie twórz oceny ryzyka medycznego. Zalecaj "
            "chłodzenie wyłącznie za pomocą zgłoszonego wentylatora tylko "
            "wtedy, gdy zarówno bieżąca, jak i maksymalna temperatura tego "
            "samego dnia są ściśle niższe niż 40.0°C."
        ),
    ),
    situation_notice=(
        "Ten wynik jest ustrukturyzowanym podsumowaniem wyraźnie zgłoszonych "
        "informacji. Nie stanowi porady medycznej, oceny sytuacji nagłej ani "
        "planu działania."
    ),
    weather_notice=(
        "Są to informacje pogodowe pochodzące z modeli Open-Meteo, a nie "
        "oficjalne ostrzeżenie przed upałem."
    ),
    urgent_contact_instruction=(
        "Zadzwoń teraz pod numer 112, aby uzyskać pomoc w nagłej sytuacji."
    ),
    urgent_actions=MappingProxyType(
        {
            "contact_emergency_service_now": "Zadzwoń teraz pod numer 112.",
            "do_not_use_shelter_as_medical_substitute": (
                "Schronienia klimatyczne nie zastępują pomocy medycznej."
            ),
        }
    ),
    urgent_notices=(
        "Schronienia klimatyczne nie zastępują pomocy medycznej.",
        (
            "Ponieważ wyraźnie zgłoszono objaw ostrzegawczy objęty ograniczonym "
            "zakresem, HeatRelay nie pobrał danych pogodowych ani informacji o "
            "miejscach i nie poprosił GPT-5.6 o utworzenie planu."
        ),
    ),
    now_actions=MappingProxyType(
        {
            "move_to_cooler_space": (
                (
                    "Przejdź do najchłodniejszego dostępnego miejsca tam, "
                    "gdzie już jesteś."
                ),
                (
                    "Ograniczenie narażenia na upał jest pomocne bez założenia, "
                    "że przemieszczenie się jest możliwe."
                ),
            ),
            "reduce_physical_effort": (
                "Na razie ogranicz wysiłek fizyczny.",
                "Mniejszy wysiłek może ograniczyć dodatkowe obciążenie cieplne.",
            ),
            "drink_water": (
                "Regularnie pij wodę, jeśli jest to dla Ciebie bezpieczne.",
                "Nawodnienie jest standardowym środkiem ochrony przed upałem.",
            ),
            "use_available_home_cooling": (
                (
                    "Użyj sprzętu chłodzącego, którego posiadanie wyraźnie "
                    "zgłoszono."
                ),
                (
                    "To działanie opiera się wyłącznie na zgłoszonym dostępie "
                    "do chłodzenia."
                ),
            ),
            "contact_support_person": (
                (
                    "Skontaktuj się z zaufaną osobą, zanim rozważysz "
                    "przemieszczenie się."
                ),
                (
                    "Zgłoszone ograniczenia wskazują, że samodzielne "
                    "przemieszczanie się nie jest odpowiednie."
                ),
            ),
            "remain_at_current_location": (
                (
                    "Pozostań w obecnym miejscu i korzystaj ze sposobów "
                    "chłodzenia, które nie wymagają przemieszczania się."
                ),
                "Zgłoszone ograniczenie obecnie zabrania opuszczenia miejsca.",
            ),
            "travel_to_selected_place": (
                (
                    "Rozważ wybranego kandydata zweryfikowanego jako otwarty "
                    "dopiero po sprawdzeniu aktualnych godzin otwarcia."
                ),
                (
                    "W tym żądaniu miejsce należało do zatwierdzonego przez "
                    "backend zestawu kandydatów."
                ),
            ),
        }
    ),
    next_few_hours_actions=MappingProxyType(
        {
            "keep_drinking_water": (
                (
                    "Miej wodę pod ręką i pij regularnie, jeśli jest to dla "
                    "Ciebie bezpieczne."
                ),
                (
                    "Stałe nawodnienie jest standardowym środkiem ochrony "
                    "przed upałem."
                ),
            ),
            "stay_in_cool_space": (
                (
                    "Spędź najbliższe kilka godzin w najchłodniejszym "
                    "odpowiednim dostępnym pomieszczeniu."
                ),
                "Zmniejsza to dalsze narażenie na upał.",
            ),
            "check_updated_weather": (
                "Sprawdź aktualne informacje pogodowe z wiarygodnego źródła.",
                (
                    "Warunki pochodzące z modeli mogą się zmienić po tej "
                    "odpowiedzi."
                ),
            ),
            "check_on_household_members": (
                (
                    "Sprawdź, czy domownicy potrzebują pomocy w utrzymaniu "
                    "chłodu."
                ),
                "To działanie ma charakter wyłącznie ogólnej kontroli domowników.",
            ),
            "prepare_for_tonight": (
                (
                    "Przed wieczorem przygotuj najchłodniejsze dostępne miejsce "
                    "do spania."
                ),
                (
                    "Wcześniejsze przygotowanie może zwiększyć bezpieczeństwo "
                    "warunków nocnych."
                ),
            ),
        }
    ),
    tonight_actions=MappingProxyType(
        {
            "ventilate_when_outside_is_cooler": (
                (
                    "Wietrz tylko wtedy, gdy powietrze na zewnątrz jest "
                    "chłodniejsze niż wewnątrz."
                ),
                (
                    "Pozwala to uniknąć założenia, że otwieranie okien zawsze "
                    "zapewnia chłodzenie."
                ),
            ),
            "sleep_in_coolest_available_room": (
                "Śpij w najchłodniejszym odpowiednim dostępnym pomieszczeniu.",
                "Zmniejsza to nocne narażenie na upał.",
            ),
            "keep_water_nearby": (
                "Miej wodę w pobliżu przez noc, jeśli jest to dla Ciebie bezpieczne.",
                "Ułatwia to utrzymanie nawodnienia.",
            ),
            "check_updated_weather_tonight": (
                (
                    "Sprawdź aktualne nocne informacje pogodowe z wiarygodnego "
                    "źródła."
                ),
                (
                    "Ten plan nie przewiduje późniejszych warunków ani "
                    "oficjalnych ostrzeżeń."
                ),
            ),
        }
    ),
    bring_items=MappingProxyType(
        {
            "water": "Woda",
            "phone": "Naładowany telefon",
            "keys": "Klucze",
            "light_clothing": "Lekka odzież",
        }
    ),
    explanations=MappingProxyType(
        {
            "forecast_at_or_above_36c": (
                "Pochodząca z modeli maksymalna temperatura tego samego dnia "
                "osiąga wartość graniczną polityki HeatRelay 36.0°C."
            ),
            "forecast_at_or_above_34c": (
                "Pochodząca z modeli maksymalna temperatura tego samego dnia "
                "osiąga wartość graniczną polityki HeatRelay 34.0°C."
            ),
            "reported_vulnerability": (
                "Wyodrębniony profil zawiera wyraźnie zgłoszony czynnik podatności."
            ),
            "no_home_cooling": (
                "Wyodrębniony profil wyraźnie wskazuje brak chłodzenia w domu."
            ),
            "temporary_or_unsheltered_housing": (
                "Wyodrębniony profil wyraźnie wskazuje tymczasowe schronienie "
                "lub brak schronienia."
            ),
            "reported_mobility_constraint": (
                "Wyodrębniony profil zawiera wyraźnie zgłoszone ograniczenie mobilności."
            ),
            "verified_open_candidate": (
                "W chwili oceny należącej do serwera potwierdzono, że wybrane "
                "miejsce jest otwarte."
            ),
            "travel_support_required": (
                "Wyodrębniony profil wyraźnie wskazuje, że samodzielne "
                "przemieszczanie się nie jest możliwe."
            ),
            "movement_prohibited": (
                "Wyodrębniony profil wyraźnie wskazuje, że obecnie nie można "
                "opuścić miejsca."
            ),
            "unresolved_travel_constraint": (
                "Nie udało się potwierdzić zgodności natychmiastowego "
                "przemieszczenia z zachowanymi faktami dotyczącymi czasu lub "
                "mobilności."
            ),
            "baseline_monitoring": (
                "Żadna wyższa reguła polityki HeatRelay nie odpowiadała "
                "ograniczonym danym wejściowym."
            ),
        }
    ),
    normal_notice=(
        "Jest to informacyjny plan bezpieczeństwa podczas upału, a nie porada "
        "medyczna, trasa ani gwarancja, że miejsce pozostanie dostępne."
    ),
    candidate_explanations=MappingProxyType(
        {
            "matched_candidate": (
                "Wybrano najbliższego odpowiedniego kandydata, którego otwarcie "
                "potwierdzono w chwili oceny należącej do serwera."
            ),
            "no_candidate": (
                "Dla żadnego odpowiedniego kandydata w podanej odległości nie "
                "potwierdzono otwarcia w chwili oceny należącej do serwera."
            ),
            "movement_prohibited": (
                "Nie zwrócono kandydata do przemieszczenia, ponieważ "
                "znormalizowana sytuacja wyraźnie wskazuje, że obecnie nie można "
                "opuścić miejsca."
            ),
            "unresolved_travel_compatibility": (
                "Nie zwrócono kandydata do natychmiastowego przemieszczenia, "
                "ponieważ na podstawie zachowanych faktów należących do serwera "
                "nie można dowieść zgodności z wyraźnie zgłoszonym ograniczeniem "
                "czasu lub mobilności."
            ),
        }
    ),
    candidate_warnings=MappingProxyType(
        {
            "hours": (
                "Przed podróżą sprawdź aktualne godziny otwarcia w oficjalnych "
                "źródłach; obecność wpisu nie gwarantuje dostępności."
            ),
            "candidate_notice": (
                "To oparte na faktach propozycje miejsc zatwierdzone przez backend, "
                "a nie zalecenia medyczne."
            ),
            "distance": (
                "Odległości są jedynie szacunkami w linii prostej; HeatRelay "
                "nie udostępnia tras ani szacowanego czasu podróży."
            ),
            "reachability": (
                "Otwarcie miejsca w chwili oceny nie dowodzi, że można do niego "
                "dotrzeć przed zamknięciem."
            ),
        }
    ),
    unresolved_travel_notice=(
        "Nie zaproponowano natychmiastowego przemieszczenia, ponieważ nie udało "
        "się potwierdzić zgodności z wyraźnie zgłoszonym ograniczeniem czasu "
        "lub mobilności."
    ),
)


__all__ = ("POLISH_ACTION_PLAN_CATALOG",)
