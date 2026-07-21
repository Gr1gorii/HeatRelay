import type { MessageCatalog } from "./en";

export const POLISH_CATALOG = {
  "app.name": "HeatRelay",

  "navigation.skipToMain": "Przejdź do głównej treści",
  "navigation.homeAccessibleName": "Strona główna HeatRelay",
  "navigation.primaryAccessibleName": "Główna nawigacja",
  "navigation.createPlan": "Utwórz plan",
  "navigation.safetyAndPrivacy": "Bezpieczeństwo i prywatność",

  "header.settings": "Ustawienia",

"visualMode.label": "Tryb wizualny",
  "visualMode.standard": "Standardowy",
  "visualMode.enhanced": "Zwiększona widoczność",
  "visualMode.highContrast": "Wysoki kontrast",
  "visualMode.description":
    "Zwiększona widoczność jest przeznaczona dla osób słabowidzących oraz wszystkich, którzy wolą większe i wyraźniejsze treści.",

  "interfaceLanguage.label": "Język",
  "interfaceLanguage.description":
    "Zmienia język interfejsu i następnego planu działania. Nie tłumaczy opisu ani nie przepisuje wyświetlanego planu.",
  "interfaceLanguage.optionWithEnglishName":
    "{{nativeName}} — {{englishName}}",

  "outputLanguage.label": "Język planu działania",
  "outputLanguage.description":
    "Wybiera język następnego planu działania. To ustawienie jest zapisywane w tej przeglądarce i wysyłane z żądaniem planu działania. Nie zmienia języka interfejsu ani nie tłumaczy Twojego opisu.",

  "languageContext.title": "Informacje o językach",
  "languageContext.descriptionLanguage": "Język opisu",
  "languageContext.displayedLanguage": "Język wyświetlanego planu",
  "languageContext.nextLanguage": "Język następnego planu działania",
  "languageContext.supportedMismatch":
    "Opis i wyświetlany plan używają różnych obsługiwanych języków. Dokładnie przejrzyj plan i w razie potrzeby wybierz inny język planu działania.",
  "languageContext.catalanUnavailable":
    "Plan działania w języku katalońskim nie jest dostępny. Dokładnie przejrzyj wyświetlany plan i w razie potrzeby wybierz dostępny język planu działania.",
  "languageContext.other":
    "HeatRelay nie mógł dopasować języka opisu do żadnego z obsługiwanych języków startowych. Dokładnie przejrzyj wyświetlany plan i wybierz język planu działania, który rozumiesz najlepiej.",
  "languageContext.unknown":
    "HeatRelay nie mógł wiarygodnie określić języka opisu. Dokładnie przejrzyj wyświetlany plan i wybierz język planu działania, który rozumiesz najlepiej.",
  "languageContext.nextSelection":
    "Wyświetlany plan nie jest przepisywany. Zapisany wybór zostanie zastosowany do następnego planu.",
  "languageContext.otherValue": "Inny język",
  "languageContext.unknownValue": "Nie udało się określić",
  "languageContext.changeAction": "Zmień język",

  "hero.eyebrow": "Pilotaż Barcelona · Etap 5",
  "hero.title": "Od ostrzeżenia przed upałem do bezpiecznego następnego kroku.",
  "hero.introduction":
    "Opisz sytuację związaną z upałem, a HeatRelay poprosi istniejący backend o jeden oparty na faktach plan działania dla miasta Barcelona, korzystając ze stałych współrzędnych demonstracyjnych.",
  "hero.action": "Utwórz plan dla miasta Barcelona",

  "release.kicker": "Bieżąca wersja",
  "release.badge": "Demonstracja Barcelona",
  "release.title": "Jeden przepływ pracy zarządzany przez serwer",
  "release.description":
    "Przeglądarka wysyła tylko opis i stałe ustawienia demonstracji Barcelona. Pogoda, priorytet, miejsca i weryfikacja faktów pozostają po stronie backendu.",
  "release.actionPlanApiLabel": "API planu działania",
  "release.actionPlanApiValue": "Punkt końcowy tego samego pochodzenia",
  "release.demoLocationLabel": "Lokalizacja demonstracyjna",
  "release.demoLocationValue": "Stały punkt w mieście Barcelona",
  "release.browserLocationLabel": "Lokalizacja przeglądarki",
  "release.browserLocationValue": "Niedostępna",

  "form.eyebrow": "Demonstracja Barcelona",
  "form.title": "Utwórz swój plan działania podczas upału",
  "form.introduction":
    "Podaj tylko szczegóły sytuacji potrzebne do spersonalizowania ograniczonego planu zweryfikowanego przez backend. Jedno wysłanie formularza powoduje jedno żądanie.",
  "form.privacyTitle": "Prywatność i szczegóły wersji demonstracyjnej",
  "form.privacyDescription":
    "Twój opis jest wysyłany po stronie serwera do OpenAI w celu przetworzenia przez GPT-5.6. HeatRelay nie przechowuje ani nie zapisuje surowego tekstu w dziennikach w sposób zamierzony; mogą jednak mieć zastosowanie zasady dostawcy dotyczące przetwarzania danych.",
  "form.identityWarning":
    "OpenAI przetwarza ten tekst. Nie wpisuj imion i nazwisk, danych kontaktowych ani adresów. Stały punkt demonstracyjny Barcelona; to nie jest pomoc w nagłej sytuacji.",
  "form.situationLabel": "Opisz sytuację związaną z upałem",
  "form.characterCount": "{{currentCount}} / {{limit}} znaków",
  "form.characterCountOverLimit":
    "{{currentCount}} / {{limit}} znaków — skróć o {{overLimitCount}}",
  "form.situationHint":
    "Wiek · dostęp do chłodzenia · mobilność · objawy",
  "form.demoButton": "Wczytaj demonstrację Barcelona",
  "form.submitButton": "Utwórz mój plan działania podczas upału",
  "form.submittingButton": "Tworzenie planu…",
  "form.boundaryNote":
    "Ten MVP używa stałych współrzędnych demonstracyjnych Barcelona. Lokalizacja przeglądarki nie jest jeszcze dostępna. Odległości są szacowane w linii prostej; HeatRelay nie udziela porad medycznych ani porad dotyczących sytuacji nagłych.",
  "form.demoText":
    "Mam 69 lat, mieszkam bez innych osób, nie mam klimatyzacji, chodzę powoli i nie mówię po hiszpańsku.",

  "scenario.heading": "Jak możemy pomóc?",
  "scenario.selfTitle": "Jest mi za gorąco",
  "scenario.selfDescription": "Utwórz osobisty plan działania",
  "scenario.someoneTitle": "Pomóż bliskiej osobie",
  "scenario.someoneDescription": "Utwórz plan dla innej osoby",
  "scenario.placeTitle": "Znajdź chłodne miejsce w obszarze demonstracyjnym Barcelona",
  "scenario.placeDescription": "Wyszukaj rzeczowe informacje o miejscach",
  "scenario.nearestHelp": "Informacje o miejscach w Barcelona",
  "scenario.importantNow": "Ważne teraz",
  "scenario.initialTipCoolestSpot":
    "Przejdź do najchłodniejszego dostępnego miejsca tam, gdzie już jesteś.",
  "scenario.initialTipReduceEffort": "Na razie ogranicz wysiłek fizyczny.",
  "scenario.initialTipDrinkWater":
    "Pij regularnie wodę, jeśli możesz to robić bezpiecznie.",

  "placeLookup.searchAction": "Wyszukaj miejsca demonstracyjne w Barcelona",
  "placeLookup.loading": "Wyszukiwanie zweryfikowanych danych o miejscach…",
  "placeLookup.resultsTitle": "Wyniki miejsc w Barcelona",
  "placeLookup.emptyTitle": "Nie znaleziono pasującego miejsca",
  "placeLookup.emptyMessage":
    "Żadne miejsce nie pasowało do stałego punktu demonstracyjnego, bieżącego czasu urządzenia i limitów wyszukiwania.",
  "placeLookup.errorTitle": "Informacje o miejscach są niedostępne",
  "placeLookup.errorMessage":
    "Nie udało się bezpiecznie wyświetlić informacji o miejscach. Spróbuj ponownie tylko, jeśli tak zdecydujesz.",
  "placeLookup.compactBoundary":
    "Stały punkt demonstracyjny Barcelona · Odległość w linii prostej · Sprawdź godziny i dostępność",
  "placeLookup.boundary":
    "Używa stałego punktu demonstracyjnego Barcelona, a nie Twojej lokalizacji. Odległości są w linii prostej, a nie trasami ani przewidywanymi czasami przyjazdu. Godziny otwarcia są oceniane według czasu urządzenia. Przed podróżą sprawdź godziny i dostępność. To nie jest pomoc medyczna ani ratunkowa.",

  "validation.empty": "Opisz sytuację przed utworzeniem planu.",
  "validation.overLimit": "Opis jest za długi. Skróć tekst.",
  "validation.serverInput": "Sprawdź opis i spróbuj ponownie.",

  "status.creating": "Tworzenie planu działania.",
  "status.ready": "Twój plan działania jest gotowy.",
  "status.loadingDetail":
    "Sprawdzanie sytuacji, pogody i zweryfikowanych miejsc…",

  "error.malformedTitle": "Odpowiedź niedostępna",
  "error.malformedMessage": "Nie można było bezpiecznie wyświetlić odpowiedzi.",
  "error.unavailableTitle": "Plan działania tymczasowo niedostępny",
  "error.unavailableMessage":
    "Plan działania jest tymczasowo niedostępny. Spróbuj ponownie później.",
  "error.connectionTitle": "Nie można połączyć się z backendem",
  "error.connectionMessage":
    "Nie można połączyć się z backendem. Sprawdź, czy lokalne usługi są uruchomione.",

  "priority.actNow": "Działaj teraz",
  "priority.prepareNow": "Przygotuj się teraz",
  "priority.monitorAndPrepare": "Monitoruj sytuację i przygotuj się",

  "result.eyebrow": "Twój plan działania podczas upału w mieście Barcelona",
  "result.priorityBadge": "Priorytet: {{priority}}",
  "result.evaluatedAt": "Oceniono: {{dateTime}}",
  "result.weatherSummaryAccessibleName": "Podsumowanie pogody",
  "result.currentTemperature": "Aktualna temperatura",
  "result.feelsLike": "Temperatura odczuwalna",
  "result.todayMaximum": "Dzisiejsza temperatura maksymalna",
  "result.phaseNow": "Teraz",
  "result.phaseNextFewHours": "Najbliższe kilka godzin",
  "result.phaseTonight": "Dziś wieczorem",
  "result.bringItemsTitle": "Zabierz ze sobą",
  "result.explanationTitle": "Dlaczego taki plan",
  "result.localPhraseTitle": "Zwrot w lokalnym języku",
  "result.localPhraseCatalan": "Kataloński",
  "result.localPhraseSpanish": "Hiszpański",
  "result.noPlaceTitle": "Nie wybrano zweryfikowanego miejsca",
  "result.noticesTitle": "Informacje i uwagi dotyczące bezpieczeństwa",

  "place.backendApprovedLabel": "Miejsce zatwierdzone przez backend",
  "place.distanceLabel": "Odległość",
  "place.closesLabel": "Zamknięcie",
  "place.accessibilityLabel": "Dostępność",
  "place.lastCheckedLabel": "Ostatnio sprawdzono",
  "place.featuresTitle": "Zweryfikowane udogodnienia",
  "place.noFeatures": "Nie wymieniono dodatkowych zweryfikowanych udogodnień.",
  "place.linksAccessibleName": "Oficjalne linki do miejsca",
  "place.informationLink": "Oficjalne informacje",
  "place.sourceLink": "Oficjalne źródło",
  "place.mapLink": "Otwórz w Google Maps",
  "place.cautionsAccessibleName": "Uwagi dotyczące miejsca",
  "place.addressUnavailable": "Adres niedostępny",
  "place.accessibilityConfirmed": "Dostępność potwierdzona przez źródło",
  "place.accessibilityUnavailable":
    "Źródło podaje, że to miejsce nie jest dostępne",
  "place.accessibilityUnknown": "Stan dostępności nieznany",

  "feature.indoorSpace": "Przestrzeń wewnątrz budynku",
  "feature.potableWater": "Woda pitna",
  "feature.toilets": "Toalety",
  "feature.microShelter": "Mikroschronienie",
  "feature.petsAllowed": "Zwierzęta dozwolone",

  "feature.confirmed": "Potwierdzone",
  "feature.unavailable": "Brak informacji o dostępności",
  "feature.unknown": "Niepotwierdzone",

  "distance.straightLine": "{{distance}} w linii prostej",

  "urgent.badge": "Pilne · działaj natychmiast",
  "urgent.eyebrow": "Natychmiastowy wynik dotyczący bezpieczeństwa",
  "urgent.title": "Pilna pomoc",
  "urgent.sourceLink": "Oficjalne zalecenia numeru 112",

  "trust.eyebrow": "Granice zaufania",
  "trust.title": "Przydatne informacje bez zawyżania pewności.",
  "trust.safetyLabel": "Bezpieczeństwo",
  "trust.safetyTitle": "Informacje, nie porady medyczne",
  "trust.safetyDescription":
    "Dane pogodowe pochodzą z modelu i nie są oficjalnym ostrzeżeniem przed upałem. Przed podróżą należy sprawdzić miejsca, godziny otwarcia, odległość w linii prostej i możliwość dotarcia. Pilny wynik wykorzystuje stałe treści zarządzane przez backend.",
  "trust.privacyLabel": "Prywatność",
  "trust.privacyTitle": "Nie podawaj danych umożliwiających identyfikację",
  "trust.privacyDescription":
    "Tekst sytuacji nie jest przechowywany w magazynie przeglądarki. Jawnie wybrane preferencje trybu wizualnego i języka są zapisywane lokalnie. Do żądania planu trafia tylko kod wybranego języka; tryb wizualny nie trafia. W tej demonstracji HeatRelay nie używa analityki, plików cookie, parametrów URL ani geolokalizacji.",

  "footer.description": "Demonstracja Barcelona · Stałe współrzędne",

  "metadata.title": "HeatRelay · Podstawa pilotażu Barcelona",
  "metadata.description":
    "HeatRelay to projekt rozwijany najpierw z myślą o mieście Barcelona, aby przekształcać ostrzeżenia przed upałem w bezpieczne następne kroki.",
} as const satisfies MessageCatalog;
