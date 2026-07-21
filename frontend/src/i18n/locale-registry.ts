import { ARABIC_CATALOG } from "./catalogs/ar";
import { BENGALI_CATALOG } from "./catalogs/bn";
import { GERMAN_CATALOG } from "./catalogs/de";
import { DUTCH_CATALOG } from "./catalogs/nl";
import { ENGLISH_CATALOG, type MessageKey } from "./catalogs/en";
import { SPANISH_CATALOG } from "./catalogs/es";
import { PERSIAN_CATALOG } from "./catalogs/fa";
import { FRENCH_CATALOG } from "./catalogs/fr";
import { HEBREW_CATALOG } from "./catalogs/he";
import { HINDI_CATALOG } from "./catalogs/hi";
import { INDONESIAN_CATALOG } from "./catalogs/id";
import { ITALIAN_CATALOG } from "./catalogs/it";
import { JAPANESE_CATALOG } from "./catalogs/ja";
import { KOREAN_CATALOG } from "./catalogs/ko";
import { BRAZILIAN_PORTUGUESE_CATALOG } from "./catalogs/pt-BR";
import { POLISH_CATALOG } from "./catalogs/pl";
import { RUSSIAN_CATALOG } from "./catalogs/ru";
import { SWAHILI_CATALOG } from "./catalogs/sw";
import { THAI_CATALOG } from "./catalogs/th";
import { TURKISH_CATALOG } from "./catalogs/tr";
import { URDU_CATALOG } from "./catalogs/ur";
import { UKRAINIAN_CATALOG } from "./catalogs/uk";
import { VIETNAMESE_CATALOG } from "./catalogs/vi";
import { SIMPLIFIED_CHINESE_CATALOG } from "./catalogs/zh-CN";
import { TRADITIONAL_CHINESE_CATALOG } from "./catalogs/zh-TW";

export const INTERFACE_LOCALE_STORAGE_KEY =
  "heatrelay.interface-locale.v1";
export const OUTPUT_LOCALE_STORAGE_KEY = "heatrelay.output-locale.v1";

export type TextDirection = "ltr" | "rtl";

type LocaleCatalog = Readonly<Record<MessageKey, string>>;

export type LocaleDefinition = Readonly<{
  code: string;
  nativeName: string;
  englishName: string;
  direction: TextDirection;
  intlLocale: string;
  catalog: LocaleCatalog;
}>;

export const LOCALE_REGISTRY = {
  en: {
    code: "en",
    nativeName: "English",
    englishName: "English",
    direction: "ltr",
    intlLocale: "en-GB",
    catalog: ENGLISH_CATALOG,
  },
  es: {
    code: "es",
    nativeName: "Español",
    englishName: "Spanish",
    direction: "ltr",
    intlLocale: "es-ES",
    catalog: SPANISH_CATALOG,
  },
  "zh-CN": {
    code: "zh-CN",
    nativeName: "中文（简体）",
    englishName: "Chinese (Simplified)",
    direction: "ltr",
    intlLocale: "zh-CN",
    catalog: SIMPLIFIED_CHINESE_CATALOG,
  },
  "zh-TW": {
    code: "zh-TW",
    nativeName: "中文（繁體）",
    englishName: "Chinese (Traditional)",
    direction: "ltr",
    intlLocale: "zh-TW",
    catalog: TRADITIONAL_CHINESE_CATALOG,
  },
  hi: {
    code: "hi",
    nativeName: "हिन्दी",
    englishName: "Hindi",
    direction: "ltr",
    intlLocale: "hi-IN",
    catalog: HINDI_CATALOG,
  },
  ar: {
    code: "ar",
    nativeName: "العربية",
    englishName: "Arabic",
    direction: "rtl",
    intlLocale: "ar-EG",
    catalog: ARABIC_CATALOG,
  },
  "pt-BR": {
    code: "pt-BR",
    nativeName: "Português (Brasil)",
    englishName: "Portuguese (Brazil)",
    direction: "ltr",
    intlLocale: "pt-BR",
    catalog: BRAZILIAN_PORTUGUESE_CATALOG,
  },
  bn: {
    code: "bn",
    nativeName: "বাংলা",
    englishName: "Bengali",
    direction: "ltr",
    intlLocale: "bn-BD",
    catalog: BENGALI_CATALOG,
  },
  ru: {
    code: "ru",
    nativeName: "Русский",
    englishName: "Russian",
    direction: "ltr",
    intlLocale: "ru-RU",
    catalog: RUSSIAN_CATALOG,
  },
  ja: {
    code: "ja",
    nativeName: "日本語",
    englishName: "Japanese",
    direction: "ltr",
    intlLocale: "ja-JP",
    catalog: JAPANESE_CATALOG,
  },
  fr: {
    code: "fr",
    nativeName: "Français",
    englishName: "French",
    direction: "ltr",
    intlLocale: "fr-FR",
    catalog: FRENCH_CATALOG,
  },
  de: {
    code: "de",
    nativeName: "Deutsch",
    englishName: "German",
    direction: "ltr",
    intlLocale: "de-DE",
    catalog: GERMAN_CATALOG,
  },
  ur: {
    code: "ur",
    nativeName: "اردو",
    englishName: "Urdu",
    direction: "rtl",
    intlLocale: "ur-PK",
    catalog: URDU_CATALOG,
  },
  id: {
    code: "id",
    nativeName: "Bahasa Indonesia",
    englishName: "Indonesian",
    direction: "ltr",
    intlLocale: "id-ID",
    catalog: INDONESIAN_CATALOG,
  },
  tr: {
    code: "tr",
    nativeName: "Türkçe",
    englishName: "Turkish",
    direction: "ltr",
    intlLocale: "tr-TR",
    catalog: TURKISH_CATALOG,
  },
  ko: {
    code: "ko",
    nativeName: "한국어",
    englishName: "Korean",
    direction: "ltr",
    intlLocale: "ko-KR",
    catalog: KOREAN_CATALOG,
  },
  it: {
    code: "it",
    nativeName: "Italiano",
    englishName: "Italian",
    direction: "ltr",
    intlLocale: "it-IT",
    catalog: ITALIAN_CATALOG,
  },
  uk: {
    code: "uk",
    nativeName: "Українська",
    englishName: "Ukrainian",
    direction: "ltr",
    intlLocale: "uk-UA",
    catalog: UKRAINIAN_CATALOG,
  },
  pl: {
    code: "pl",
    nativeName: "Polski",
    englishName: "Polish",
    direction: "ltr",
    intlLocale: "pl-PL",
    catalog: POLISH_CATALOG,
  },
  vi: {
    code: "vi",
    nativeName: "Tiếng Việt",
    englishName: "Vietnamese",
    direction: "ltr",
    intlLocale: "vi-VN",
    catalog: VIETNAMESE_CATALOG,
  },
  th: {
    code: "th",
    nativeName: "ไทย",
    englishName: "Thai",
    direction: "ltr",
    intlLocale: "th-TH",
    catalog: THAI_CATALOG,
  },
  fa: {
    code: "fa",
    nativeName: "فارسی",
    englishName: "Persian",
    direction: "rtl",
    intlLocale: "fa-IR",
    catalog: PERSIAN_CATALOG,
  },
  sw: {
    code: "sw",
    nativeName: "Kiswahili",
    englishName: "Swahili",
    direction: "ltr",
    intlLocale: "sw-KE",
    catalog: SWAHILI_CATALOG,
  },
  he: {
    code: "he",
    nativeName: "עברית",
    englishName: "Hebrew",
    direction: "rtl",
    intlLocale: "he-IL",
    catalog: HEBREW_CATALOG,
  },
  nl: {
    code: "nl",
    nativeName: "Nederlands",
    englishName: "Dutch",
    direction: "ltr",
    intlLocale: "nl-NL",
    catalog: DUTCH_CATALOG,
  },
} as const satisfies Record<string, LocaleDefinition>;

export type SupportedLocale = keyof typeof LOCALE_REGISTRY;
export type InterfaceLocale = SupportedLocale;

export const SUPPORTED_INTERFACE_LOCALES = Object.freeze(
  Object.keys(LOCALE_REGISTRY) as SupportedLocale[],
);

export const DEFAULT_INTERFACE_LOCALE: InterfaceLocale = "en";

export const SUPPORTED_OUTPUT_LOCALES = [
  "en",
  "es",
  "zh-CN",
  "zh-TW",
  "hi",
  "bn",
  "ar",
  "pt-BR",
  "fr",
  "it",
  "de",
  "nl",
  "ru",
  "uk",
  "pl",
  "ja",
  "ko",
  "id",
  "vi",
  "th",
  "tr",
  "sw",
  "ur",
  "fa",
  "he",
] as const;
export type OutputLocale = (typeof SUPPORTED_OUTPUT_LOCALES)[number];
export const DEFAULT_OUTPUT_LOCALE: OutputLocale = "en";

type LocaleStorage = Pick<Storage, "getItem" | "setItem">;

export type LocaleResolutionEnvironment = Readonly<{
  storage: LocaleStorage | null;
  browserLanguages: readonly string[] | null;
}>;

function browserStorage(): LocaleStorage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function browserLanguages(): readonly string[] {
  try {
    if (typeof navigator === "undefined") {
      return [];
    }
    const languages = navigator.languages;
    return Array.isArray(languages) ? languages : [];
  } catch {
    return [];
  }
}

export function isInterfaceLocale(value: unknown): value is InterfaceLocale {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(LOCALE_REGISTRY, value)
  );
}

export function isOutputLocale(value: unknown): value is OutputLocale {
  return (
    typeof value === "string" &&
    (SUPPORTED_OUTPUT_LOCALES as readonly string[]).includes(value)
  );
}

function matchBrowserLocale(candidate: unknown): InterfaceLocale | null {
  if (typeof candidate !== "string") {
    return null;
  }

  try {
    const [canonicalCandidate] = Intl.getCanonicalLocales(candidate);
    if (!canonicalCandidate) {
      return null;
    }
    if (isInterfaceLocale(canonicalCandidate)) {
      return canonicalCandidate;
    }

    const baseLanguage = new Intl.Locale(canonicalCandidate).language;
    return isInterfaceLocale(baseLanguage) ? baseLanguage : null;
  } catch {
    return null;
  }
}

export function resolveInitialInterfaceLocale(
  environment?: LocaleResolutionEnvironment,
): InterfaceLocale {
  let storage: LocaleStorage | null = null;
  try {
    storage = environment === undefined ? browserStorage() : environment.storage;
  } catch {
    // Continue through the remaining deterministic resolution sources.
  }

  try {
    const storedLocale = storage?.getItem(INTERFACE_LOCALE_STORAGE_KEY) ?? null;
    if (isInterfaceLocale(storedLocale)) {
      return storedLocale;
    }
  } catch {
    // A blocked legacy key does not prevent checking the other legacy key.
  }

  try {
    const storedOutputLocale =
      storage?.getItem(OUTPUT_LOCALE_STORAGE_KEY) ?? null;
    if (isOutputLocale(storedOutputLocale)) {
      return storedOutputLocale;
    }
  } catch {
    // Local persistence is optional; browser-language matching remains available.
  }

  let languages: readonly string[] = [];
  try {
    const configuredLanguages =
      environment === undefined
        ? browserLanguages()
        : environment.browserLanguages;
    if (Array.isArray(configuredLanguages)) {
      languages = configuredLanguages;
    }
  } catch {
    // English is the safe fallback when browser-language access is unavailable.
  }

  for (const candidate of languages) {
    const matchedLocale = matchBrowserLocale(candidate);
    if (matchedLocale !== null) {
      return matchedLocale;
    }
  }

  return DEFAULT_INTERFACE_LOCALE;
}

export function resolveInitialOutputLocale(
  storage: LocaleStorage | null = browserStorage(),
): OutputLocale {
  try {
    const storedLocale = storage?.getItem(OUTPUT_LOCALE_STORAGE_KEY) ?? null;
    return isOutputLocale(storedLocale)
      ? storedLocale
      : DEFAULT_OUTPUT_LOCALE;
  } catch {
    return DEFAULT_OUTPUT_LOCALE;
  }
}

export function persistInterfaceLocale(
  locale: InterfaceLocale,
  storage: LocaleStorage | null = browserStorage(),
): void {
  if (!isInterfaceLocale(locale)) {
    return;
  }

  try {
    storage?.setItem(INTERFACE_LOCALE_STORAGE_KEY, locale);
  } catch {
    // The explicit in-memory selection remains usable if persistence is blocked.
  }
}

export function persistOutputLocale(
  locale: OutputLocale,
  storage: LocaleStorage | null = browserStorage(),
): void {
  if (!isOutputLocale(locale)) {
    return;
  }

  try {
    storage?.setItem(OUTPUT_LOCALE_STORAGE_KEY, locale);
  } catch {
    // The explicit in-memory selection remains usable if persistence is blocked.
  }
}

export function persistUnifiedLocale(
  locale: InterfaceLocale,
  storage: LocaleStorage | null = browserStorage(),
): void {
  if (!isInterfaceLocale(locale) || !isOutputLocale(locale)) {
    return;
  }

  persistInterfaceLocale(locale, storage);
  persistOutputLocale(locale, storage);
}

export function getLocaleDefinition(
  locale: InterfaceLocale | OutputLocale,
): LocaleDefinition {
  return LOCALE_REGISTRY[locale];
}
