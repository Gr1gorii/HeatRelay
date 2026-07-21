import { createElement } from "react";
import {
  cleanup,
  render as renderWithTestingLibrary,
  screen,
  waitFor,
} from "@testing-library/react";
import { I18nextProvider, useTranslation } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";

import staticIndexHtml from "../index.html?raw";
import { ARABIC_CATALOG } from "./i18n/catalogs/ar";
import { BENGALI_CATALOG } from "./i18n/catalogs/bn";
import { DUTCH_CATALOG } from "./i18n/catalogs/nl";
import { GERMAN_CATALOG } from "./i18n/catalogs/de";
import {
  ENGLISH_CATALOG,
  type MessageCatalog,
  type MessageKey,
} from "./i18n/catalogs/en";
import { SPANISH_CATALOG } from "./i18n/catalogs/es";
import { PERSIAN_CATALOG } from "./i18n/catalogs/fa";
import { FRENCH_CATALOG } from "./i18n/catalogs/fr";
import { HEBREW_CATALOG } from "./i18n/catalogs/he";
import { HINDI_CATALOG } from "./i18n/catalogs/hi";
import { INDONESIAN_CATALOG } from "./i18n/catalogs/id";
import { ITALIAN_CATALOG } from "./i18n/catalogs/it";
import { JAPANESE_CATALOG } from "./i18n/catalogs/ja";
import { KOREAN_CATALOG } from "./i18n/catalogs/ko";
import { POLISH_CATALOG } from "./i18n/catalogs/pl";
import { BRAZILIAN_PORTUGUESE_CATALOG } from "./i18n/catalogs/pt-BR";
import { RUSSIAN_CATALOG } from "./i18n/catalogs/ru";
import { SWAHILI_CATALOG } from "./i18n/catalogs/sw";
import { THAI_CATALOG } from "./i18n/catalogs/th";
import { TURKISH_CATALOG } from "./i18n/catalogs/tr";
import { URDU_CATALOG } from "./i18n/catalogs/ur";
import { UKRAINIAN_CATALOG } from "./i18n/catalogs/uk";
import { VIETNAMESE_CATALOG } from "./i18n/catalogs/vi";
import { SIMPLIFIED_CHINESE_CATALOG } from "./i18n/catalogs/zh-CN";
import { TRADITIONAL_CHINESE_CATALOG } from "./i18n/catalogs/zh-TW";
import {
  formatCelsiusTemperature,
  formatDateOnly,
  formatDateTime,
  formatDistance,
  formatNumber,
} from "./i18n/formatters";
import {
  DEFAULT_INTERFACE_LOCALE,
  DEFAULT_OUTPUT_LOCALE,
  INTERFACE_LOCALE_STORAGE_KEY,
  LOCALE_REGISTRY,
  OUTPUT_LOCALE_STORAGE_KEY,
  SUPPORTED_INTERFACE_LOCALES,
  SUPPORTED_OUTPUT_LOCALES,
  getLocaleDefinition,
  isInterfaceLocale,
  isOutputLocale,
  persistInterfaceLocale,
  persistOutputLocale,
  persistUnifiedLocale,
  resolveInitialInterfaceLocale,
  resolveInitialOutputLocale,
  type InterfaceLocale,
  type LocaleResolutionEnvironment,
  type OutputLocale,
} from "./i18n/locale-registry";
import {
  createI18nRuntime,
  synchronizeDocumentLocalization,
} from "./i18n/runtime";
import { VISUAL_MODE_STORAGE_KEY } from "./visual-mode";

type StorageDouble = Pick<Storage, "getItem" | "setItem"> & {
  values: Map<string, string>;
};

function createStorage(initial: Record<string, string> = {}): StorageDouble {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value);
    }),
  };
}

function environment(
  storage: Pick<Storage, "getItem" | "setItem"> | null,
  browserLanguages: readonly string[] | null,
): LocaleResolutionEnvironment {
  return { storage, browserLanguages };
}

function catalogEntries(
  catalog: MessageCatalog = ENGLISH_CATALOG,
): Array<[MessageKey, string]> {
  return Object.entries(catalog) as Array<[MessageKey, string]>;
}

function interpolationNames(message: string): string[] {
  return Array.from(
    message.matchAll(/{{\s*([A-Za-z][A-Za-z0-9_]*)\s*}}/g),
    (match) => match[1],
  ).sort();
}

function interpolationValues(message: string): Record<string, string> {
  return Object.fromEntries(
    Array.from(message.matchAll(/{{\s*([A-Za-z][A-Za-z0-9_]*)\s*}}/g), (match) => [
      match[1],
      `value-${match[1]}`,
    ]),
  );
}

function interpolate(message: string, values: Record<string, string>): string {
  return message.replace(
    /{{\s*([A-Za-z][A-Za-z0-9_]*)\s*}}/g,
    (_placeholder, name: string) => values[name],
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("typed locale registry and persistence", () => {
  it("registers exactly the ordered M6.12 interface-locale set", () => {
    expect(Object.keys(LOCALE_REGISTRY)).toEqual([
      "en",
      "es",
      "zh-CN",
      "zh-TW",
      "hi",
      "ar",
      "pt-BR",
      "bn",
      "ru",
      "ja",
      "fr",
      "de",
      "ur",
      "id",
      "tr",
      "ko",
      "it",
      "uk",
      "pl",
      "vi",
      "th",
      "fa",
      "sw",
      "he",
      "nl",
    ]);
    expect(SUPPORTED_INTERFACE_LOCALES).toEqual([
      "en",
      "es",
      "zh-CN",
      "zh-TW",
      "hi",
      "ar",
      "pt-BR",
      "bn",
      "ru",
      "ja",
      "fr",
      "de",
      "ur",
      "id",
      "tr",
      "ko",
      "it",
      "uk",
      "pl",
      "vi",
      "th",
      "fa",
      "sw",
      "he",
      "nl",
    ]);
    expect(DEFAULT_INTERFACE_LOCALE).toBe("en");
  });

  it("provides the complete English metadata and bundled catalog", () => {
    expect(getLocaleDefinition("en")).toEqual({
      code: "en",
      nativeName: "English",
      englishName: "English",
      direction: "ltr",
      intlLocale: "en-GB",
      catalog: ENGLISH_CATALOG,
    });
  });

  it("provides the exact Spanish pilot metadata and bundled catalog", () => {
    expect(getLocaleDefinition("es")).toEqual({
      code: "es",
      nativeName: "Español",
      englishName: "Spanish",
      direction: "ltr",
      intlLocale: "es-ES",
      catalog: SPANISH_CATALOG,
    });
  });

  it.each([
    [
      "zh-CN",
      "中文（简体）",
      "Chinese (Simplified)",
      "zh-CN",
      SIMPLIFIED_CHINESE_CATALOG,
    ],
    [
      "zh-TW",
      "中文（繁體）",
      "Chinese (Traditional)",
      "zh-TW",
      TRADITIONAL_CHINESE_CATALOG,
    ],
    ["hi", "हिन्दी", "Hindi", "hi-IN", HINDI_CATALOG],
    [
      "pt-BR",
      "Português (Brasil)",
      "Portuguese (Brazil)",
      "pt-BR",
      BRAZILIAN_PORTUGUESE_CATALOG,
    ],
    ["bn", "বাংলা", "Bengali", "bn-BD", BENGALI_CATALOG],
    ["ru", "Русский", "Russian", "ru-RU", RUSSIAN_CATALOG],
    ["ja", "日本語", "Japanese", "ja-JP", JAPANESE_CATALOG],
    ["fr", "Français", "French", "fr-FR", FRENCH_CATALOG],
    ["de", "Deutsch", "German", "de-DE", GERMAN_CATALOG],
    [
      "id",
      "Bahasa Indonesia",
      "Indonesian",
      "id-ID",
      INDONESIAN_CATALOG,
    ],
    ["tr", "Türkçe", "Turkish", "tr-TR", TURKISH_CATALOG],
    ["ko", "한국어", "Korean", "ko-KR", KOREAN_CATALOG],
    ["it", "Italiano", "Italian", "it-IT", ITALIAN_CATALOG],
    ["uk", "Українська", "Ukrainian", "uk-UA", UKRAINIAN_CATALOG],
    ["pl", "Polski", "Polish", "pl-PL", POLISH_CATALOG],
    ["vi", "Tiếng Việt", "Vietnamese", "vi-VN", VIETNAMESE_CATALOG],
    ["th", "ไทย", "Thai", "th-TH", THAI_CATALOG],
    ["sw", "Kiswahili", "Swahili", "sw-KE", SWAHILI_CATALOG],
    ["nl", "Nederlands", "Dutch", "nl-NL", DUTCH_CATALOG],
  ] as const)(
    "provides the exact %s registry metadata and bundled catalog",
    (code, nativeName, englishName, intlLocale, catalog) => {
      expect(getLocaleDefinition(code)).toEqual({
        code,
        nativeName,
        englishName,
        direction: "ltr",
        intlLocale,
        catalog,
      });
    },
  );

  it.each([
    ["ar", "العربية", "Arabic", "ar-EG", ARABIC_CATALOG],
    ["ur", "اردو", "Urdu", "ur-PK", URDU_CATALOG],
    ["fa", "فارسی", "Persian", "fa-IR", PERSIAN_CATALOG],
    ["he", "עברית", "Hebrew", "he-IL", HEBREW_CATALOG],
  ] as const)(
    "provides the exact %s RTL registry metadata and bundled catalog",
    (code, nativeName, englishName, intlLocale, catalog) => {
      expect(getLocaleDefinition(code)).toEqual({
        code,
        nativeName,
        englishName,
        direction: "rtl",
        intlLocale,
        catalog,
      });
    },
  );

  it("keeps every registry key equal to its definition code", () => {
    for (const [registryKey, definition] of Object.entries(LOCALE_REGISTRY)) {
      expect(definition.code).toBe(registryKey);
    }
  });

  it("registers exactly four RTL and twenty-one LTR interface locales", () => {
    expect(
      SUPPORTED_INTERFACE_LOCALES.filter(
        (locale) => LOCALE_REGISTRY[locale].direction === "rtl",
      ),
    ).toEqual(["ar", "ur", "fa", "he"]);
    expect(
      SUPPORTED_INTERFACE_LOCALES.filter(
        (locale) => LOCALE_REGISTRY[locale].direction === "ltr",
      ),
    ).toHaveLength(21);
  });

  it("keeps interface and output locale support as explicit separate sets", () => {
    expect(SUPPORTED_INTERFACE_LOCALES).toEqual([
      "en",
      "es",
      "zh-CN",
      "zh-TW",
      "hi",
      "ar",
      "pt-BR",
      "bn",
      "ru",
      "ja",
      "fr",
      "de",
      "ur",
      "id",
      "tr",
      "ko",
      "it",
      "uk",
      "pl",
      "vi",
      "th",
      "fa",
      "sw",
      "he",
      "nl",
    ]);
    expect(SUPPORTED_OUTPUT_LOCALES).toEqual([
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
    ]);
    expect(SUPPORTED_OUTPUT_LOCALES).not.toBe(SUPPORTED_INTERFACE_LOCALES);
    expect(DEFAULT_OUTPUT_LOCALE).toBe("en");
  });

  it("does not mutate output-locale support when interface language changes", async () => {
    const outputLocales = [...SUPPORTED_OUTPUT_LOCALES];
    const runtime = await createI18nRuntime("en");

    await runtime.changeLanguage("es");

    expect(runtime.resolvedLanguage).toBe("es");
    expect(SUPPORTED_OUTPUT_LOCALES).toEqual(outputLocales);
    expect(SUPPORTED_OUTPUT_LOCALES).toEqual([
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
    ]);
  });

  it.each([
    ["en", true],
    ["EN", false],
    ["en-US", false],
    ["es", true],
    ["ES", false],
    ["es-ES", false],
    [" en", false],
    ["es ", false],
    ["zh-CN", true],
    ["zh-TW", true],
    ["zh", false],
    ["zh-cn", false],
    ["ZH-CN", false],
    ["zh-tw", false],
    ["ZH-TW", false],
    ["zh-Hans", false],
    ["zh-Hans-CN", false],
    ["zh-Hans-SG", false],
    ["zh-Hant", false],
    ["zh-Hant-TW", false],
    ["zh-Hant-HK", false],
    ["zh-SG", false],
    ["zh-HK", false],
    ["zh-MO", false],
    [" zh-CN", false],
    ["zh-CN ", false],
    [" zh-TW", false],
    ["zh-TW ", false],
    ["hi", true],
    ["HI", false],
    ["hi-IN", false],
    ["hi-in", false],
    [" hi", false],
    ["hi ", false],
    ["ar", true],
    ["AR", false],
    ["Ar", false],
    ["ar-SA", false],
    ["ar-EG", false],
    ["ar-001", false],
    ["ara", false],
    [" ar", false],
    ["ar ", false],
    ["pt-BR", true],
    ["pt", false],
    ["pt-br", false],
    ["PT-BR", false],
    ["Pt-BR", false],
    ["pt-PT", false],
    ["pt-AO", false],
    ["pt-MZ", false],
    ["pt-Latn-BR", false],
    ["pt-BR-x-private", false],
    [" pt-BR", false],
    ["pt-BR ", false],
    ["bn", true],
    ["BN", false],
    ["bn-BD", false],
    ["bn-IN", false],
    ["bn-bd", false],
    [" bn", false],
    ["bn ", false],
    ["ru", true],
    ["RU", false],
    ["Ru", false],
    ["ru-RU", false],
    ["ru-BY", false],
    ["rus", false],
    [" ru", false],
    ["ru ", false],
    ["ja", true],
    ["JA", false],
    ["Ja", false],
    ["ja-JP", false],
    ["jpn", false],
    [" ja", false],
    ["ja ", false],
    ["fr", true],
    ["FR", false],
    ["Fr", false],
    ["fr-FR", false],
    ["fr-CA", false],
    ["fr-BE", false],
    ["fr-CH", false],
    ["fra", false],
    [" fr", false],
    ["fr ", false],
    ["de", true],
    ["DE", false],
    ["De", false],
    ["de-DE", false],
    ["de-AT", false],
    ["de-CH", false],
    ["deu", false],
    ["ger", false],
    [" de", false],
    ["de ", false],
    ["ur", true],
    ["UR", false],
    ["Ur", false],
    ["ur-PK", false],
    ["ur-IN", false],
    ["urd", false],
    [" ur", false],
    ["ur ", false],
    ["id", true],
    ["ID", false],
    ["Id", false],
    ["id-ID", false],
    ["ind", false],
    [" id", false],
    ["id ", false],
    ["tr", true],
    ["TR", false],
    ["Tr", false],
    ["tr-TR", false],
    ["tur", false],
    [" tr", false],
    ["tr ", false],
    ["ko", true],
    ["KO", false],
    ["Ko", false],
    ["ko-KR", false],
    ["kor", false],
    [" ko", false],
    ["ko ", false],
    ["it", true],
    ["IT", false],
    ["It", false],
    ["it-IT", false],
    ["it-CH", false],
    ["ita", false],
    [" it", false],
    ["it ", false],
    ["uk", true],
    ["UK", false],
    ["Uk", false],
    ["uk-UA", false],
    ["uk-UK", false],
    ["ukr", false],
    [" uk", false],
    ["uk ", false],
    ["pl", true],
    ["PL", false],
    ["Pl", false],
    ["pl-PL", false],
    ["pol", false],
    [" pl", false],
    ["pl ", false],
    ["vi", true],
    ["VI", false],
    ["Vi", false],
    ["vi-VN", false],
    ["vie", false],
    [" vi", false],
    ["vi ", false],
    ["th", true],
    ["TH", false],
    ["Th", false],
    ["th-TH", false],
    ["tha", false],
    [" th", false],
    ["th ", false],
    ["fa", true],
    ["FA", false],
    ["Fa", false],
    ["fa-IR", false],
    ["fa-AF", false],
    ["fas", false],
    ["per", false],
    [" fa", false],
    ["fa ", false],
    ["sw", true],
    ["SW", false],
    ["Sw", false],
    ["sw-KE", false],
    ["sw-TZ", false],
    ["swa", false],
    [" sw", false],
    ["sw ", false],
    ["he", true],
    ["HE", false],
    ["He", false],
    ["he-IL", false],
    ["heb", false],
    [" he", false],
    ["he ", false],
    ["nl", true],
    ["NL", false],
    ["Nl", false],
    ["nl-NL", false],
    ["nl-BE", false],
    ["nld", false],
    ["dut", false],
    [" nl", false],
    ["nl ", false],
    ["", false],
    [null, false],
    [true, false],
    [1, false],
    [["en"], false],
    [{ code: "en" }, false],
  ] as const)("checks exact output locale value %j", (candidate, expected) => {
    expect(isOutputLocale(candidate)).toBe(expected);
  });

  it("uses the exact versioned output-locale storage key", () => {
    expect(OUTPUT_LOCALE_STORAGE_KEY).toBe("heatrelay.output-locale.v1");
    expect(OUTPUT_LOCALE_STORAGE_KEY).not.toBe(INTERFACE_LOCALE_STORAGE_KEY);
    expect(OUTPUT_LOCALE_STORAGE_KEY).not.toBe(VISUAL_MODE_STORAGE_KEY);
  });

  it.each(SUPPORTED_OUTPUT_LOCALES)(
    "restores exact stored output locale %s without rewriting storage",
    (locale) => {
      const storage = createStorage({
        [OUTPUT_LOCALE_STORAGE_KEY]: locale,
      });

      expect(resolveInitialOutputLocale(storage)).toBe(locale);
      expect(storage.getItem).toHaveBeenCalledOnce();
      expect(storage.getItem).toHaveBeenCalledWith(OUTPUT_LOCALE_STORAGE_KEY);
      expect(storage.setItem).not.toHaveBeenCalled();
    },
  );

  it.each([
    undefined,
    "",
    "EN",
    "en-US",
    " es",
    "es ",
    "pt",
    "pt-br",
    "zh",
    "zh-Hant",
    "ar-EG",
    "he-IL",
    null,
    true,
    25,
    ["en"],
    { code: "en" },
  ] as const)(
    "falls back to English for invalid stored output value %j without repair",
    (storedValue) => {
      const storage = createStorage();
      vi.mocked(storage.getItem).mockReturnValue(storedValue as string | null);

      expect(resolveInitialOutputLocale(storage)).toBe("en");
      expect(storage.setItem).not.toHaveBeenCalled();
      expect(storage.values.size).toBe(0);
    },
  );

  it("falls back to English when output storage is missing or throws", () => {
    expect(resolveInitialOutputLocale(null)).toBe("en");

    const storage = createStorage();
    vi.mocked(storage.getItem).mockImplementation(() => {
      throw new Error("Synthetic blocked output-locale storage read");
    });
    expect(() => resolveInitialOutputLocale(storage)).not.toThrow();
    expect(resolveInitialOutputLocale(storage)).toBe("en");
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("does not inspect interface or browser language for output resolution", () => {
    vi.stubGlobal("navigator", { languages: ["es-ES", "ar-EG"] });
    const storage = createStorage({
      [INTERFACE_LOCALE_STORAGE_KEY]: "es",
    });

    expect(resolveInitialOutputLocale(storage)).toBe("en");
    expect(storage.getItem).toHaveBeenCalledWith(OUTPUT_LOCALE_STORAGE_KEY);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it.each(SUPPORTED_OUTPUT_LOCALES)(
    "persists explicit output locale %s exactly under only the approved key",
    (locale) => {
      const storage = createStorage();

      persistOutputLocale(locale, storage);

      expect(storage.setItem).toHaveBeenCalledOnce();
      expect(storage.setItem).toHaveBeenCalledWith(
        OUTPUT_LOCALE_STORAGE_KEY,
        locale,
      );
      expect(storage.values).toEqual(
        new Map([[OUTPUT_LOCALE_STORAGE_KEY, locale]]),
      );
    },
  );

  it.each(["EN", "en-US", " es", "es ", "ca", null, true, 1, ["en"]])(
    "does not persist invalid programmatic output locale %j",
    (locale) => {
      const storage = createStorage();

      persistOutputLocale(locale as unknown as OutputLocale, storage);

      expect(storage.setItem).not.toHaveBeenCalled();
      expect(storage.values.size).toBe(0);
    },
  );

  it("keeps the selected session usable when output-locale writes throw", () => {
    const storage = createStorage();
    vi.mocked(storage.setItem).mockImplementation(() => {
      throw new Error("Synthetic blocked output-locale storage write");
    });

    expect(() => persistOutputLocale("he", storage)).not.toThrow();
  });

  it("requires every output locale to have an interface catalog", () => {
    const outputCatalogs = {
      en: ENGLISH_CATALOG,
      es: SPANISH_CATALOG,
      "zh-CN": SIMPLIFIED_CHINESE_CATALOG,
      "zh-TW": TRADITIONAL_CHINESE_CATALOG,
      hi: HINDI_CATALOG,
      bn: BENGALI_CATALOG,
      ar: ARABIC_CATALOG,
      "pt-BR": BRAZILIAN_PORTUGUESE_CATALOG,
      fr: FRENCH_CATALOG,
      it: ITALIAN_CATALOG,
      de: GERMAN_CATALOG,
      nl: DUTCH_CATALOG,
      ru: RUSSIAN_CATALOG,
      uk: UKRAINIAN_CATALOG,
      pl: POLISH_CATALOG,
      ja: JAPANESE_CATALOG,
      ko: KOREAN_CATALOG,
      id: INDONESIAN_CATALOG,
      vi: VIETNAMESE_CATALOG,
      th: THAI_CATALOG,
      tr: TURKISH_CATALOG,
      sw: SWAHILI_CATALOG,
      ur: URDU_CATALOG,
      fa: PERSIAN_CATALOG,
      he: HEBREW_CATALOG,
    } as const satisfies Record<OutputLocale, MessageCatalog>;

    for (const locale of SUPPORTED_OUTPUT_LOCALES) {
      expect(Object.hasOwn(LOCALE_REGISTRY, locale)).toBe(true);
      expect(getLocaleDefinition(locale).catalog).toBe(outputCatalogs[locale]);
    }
  });

  it.each([
    ["en", true],
    ["en-US", false],
    ["es", true],
    ["es-ES", false],
    ["zh-CN", true],
    ["zh-cn", false],
    ["zh-TW", true],
    ["zh-tw", false],
    ["zh-Hans", false],
    ["zh-Hant", false],
    ["zh-Hant-TW", false],
    ["hi", true],
    ["hi-IN", false],
    ["ar", true],
    ["AR", false],
    ["ar-EG", false],
    ["pt-BR", true],
    ["pt-br", false],
    ["pt", false],
    ["pt-PT", false],
    ["bn", true],
    ["bn-BD", false],
    ["ru", true],
    ["ru-RU", false],
    ["ja", true],
    ["ja-JP", false],
    ["fr", true],
    ["fr-FR", false],
    ["de", true],
    ["de-DE", false],
    ["ur", true],
    ["UR", false],
    ["ur-PK", false],
    ["id", true],
    ["id-ID", false],
    ["tr", true],
    ["tr-TR", false],
    ["ko", true],
    ["ko-KR", false],
    ["it", true],
    ["it-IT", false],
    ["uk", true],
    ["uk-UA", false],
    ["pl", true],
    ["pl-PL", false],
    ["vi", true],
    ["vi-VN", false],
    ["th", true],
    ["th-TH", false],
    ["TH", false],
    ["fa", true],
    ["FA", false],
    ["fa-IR", false],
    ["sw", true],
    ["sw-KE", false],
    ["he", true],
    ["HE", false],
    ["he-IL", false],
    ["iw", false],
    ["nl", true],
    ["nl-NL", false],
    ["ca", false],
    ["ua", false],
    ["eo", false],
    ["not a locale", false],
    ["", false],
    [null, false],
    [{ locale: "en" }, false],
  ] as const)("checks supported stored value %j", (candidate, expected) => {
    expect(isInterfaceLocale(candidate)).toBe(expected);
  });

  it.each(["en-US", "en-GB", "EN-us"])(
    "resolves the regional English browser tag %s to en",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("en");
    },
  );

  it.each(["es", "es-ES", "es-MX", "ES-mx"])(
    "resolves the Spanish browser tag %s to es",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("es");
    },
  );

  it.each(["zh-CN", "zh-cn", "ZH-cn"])(
    "resolves the direct Simplified Chinese browser tag %s to zh-CN",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("zh-CN");
    },
  );

  it.each(["zh-TW", "zh-tw", "ZH-tw"])(
    "resolves the direct Traditional Chinese browser tag %s to zh-TW",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("zh-TW");
    },
  );

  it.each(["hi", "hi-IN", "hi-FJ", "HI-in"])(
    "resolves the Hindi browser tag %s to hi",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("hi");
    },
  );

  it.each(["ar", "ar-EG", "ar-SA", "AR-eg"])(
    "resolves the Arabic browser tag %s to ar",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("ar");
    },
  );

  it.each(["pt-BR", "pt-br", "PT-br"])(
    "resolves the direct Brazilian Portuguese browser tag %s to pt-BR",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("pt-BR");
    },
  );

  it.each(["pt", "pt-PT", "pt-AO", "pt-MZ"])(
    "does not broaden the Portuguese browser tag %s to pt-BR",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("en");
    },
  );

  it("lets unsupported Portuguese preferences fall through to a later supported locale", () => {
    expect(
      resolveInitialInterfaceLocale(environment(null, ["pt-PT", "fr-CA"])),
    ).toBe("fr");
  });

  it.each(["bn", "bn-BD", "bn-IN", "BN-bd"])(
    "resolves the Bengali browser tag %s to bn",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("bn");
    },
  );

  it.each([
    "zh",
    "zh-Hans",
    "zh-Hans-CN",
    "zh-Hans-SG",
    "zh-Hant",
    "zh-Hant-TW",
    "zh-Hant-HK",
    "zh-SG",
    "zh-HK",
    "zh-MO",
  ])("does not infer a Chinese registry locale from %s", (browserLocale) => {
    expect(
      resolveInitialInterfaceLocale(environment(null, [browserLocale])),
    ).toBe("en");
  });

  it.each([
    [["zh-Hant", "de-AT"], "de"],
    [["zh-Hans", "ru-RU"], "ru"],
    [["zh-HK"], "en"],
    [["zh"], "en"],
  ] as const)(
    "lets unsupported Chinese preferences %j fall through to %s",
    (browserLanguages, expected) => {
      expect(
        resolveInitialInterfaceLocale(
          environment(null, [...browserLanguages]),
        ),
      ).toBe(expected);
    },
  );

  it.each(["ru", "ru-RU", "ru-KZ", "RU-kz"])(
    "resolves the Russian browser tag %s to ru",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("ru");
    },
  );

  it.each(["ja", "ja-JP", "JA-jp"])(
    "resolves the Japanese browser tag %s to ja",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("ja");
    },
  );

  it.each(["fr", "fr-FR", "fr-CA", "fr-BE", "fr-CH", "FR-ca"])(
    "resolves the French browser tag %s to fr",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("fr");
    },
  );

  it.each(["de", "de-DE", "de-AT", "de-CH", "DE-ch"])(
    "resolves the German browser tag %s to de",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("de");
    },
  );

  it.each(["id", "id-ID", "id-MY", "ID-my"])(
    "resolves the Indonesian browser tag %s to id",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("id");
    },
  );

  it.each(["ur", "ur-PK", "ur-IN", "UR-pk"])(
    "resolves the Urdu browser tag %s to ur",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("ur");
    },
  );

  it.each(["tr", "tr-TR", "tr-CY", "TR-cy"])(
    "resolves the Turkish browser tag %s to tr",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("tr");
    },
  );

  it.each(["ko", "ko-KR", "ko-KP", "KO-kr"])(
    "resolves the Korean browser tag %s to ko",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("ko");
    },
  );

  it.each(["it", "it-IT", "it-CH", "IT-ch"])(
    "resolves the Italian browser tag %s to it",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("it");
    },
  );

  it.each(["uk", "uk-UA", "UK-ua"])(
    "resolves the Ukrainian browser tag %s to uk",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("uk");
    },
  );

  it("does not treat the country code ua as a language code", () => {
    expect(resolveInitialInterfaceLocale(environment(null, ["ua"]))).toBe(
      "en",
    );
  });

  it.each(["pl", "pl-PL", "PL-pl"])(
    "resolves the Polish browser tag %s to pl",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("pl");
    },
  );

  it.each(["vi", "vi-VN", "VI-vn"])(
    "resolves the Vietnamese browser tag %s to vi",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("vi");
    },
  );

  it.each(["th", "th-TH", "TH-th"])(
    "resolves the Thai browser tag %s to th",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("th");
    },
  );

  it.each(["fa", "fa-IR", "fa-AF", "FA-ir"])(
    "resolves the Persian browser tag %s to fa",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("fa");
    },
  );

  it.each(["sw", "sw-KE", "sw-TZ", "SW-tz"])(
    "resolves the Swahili browser tag %s to sw",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("sw");
    },
  );

  it.each(["he", "he-IL", "HE-il", "iw", "iw-IL"])(
    "resolves the canonical or legacy Hebrew browser tag %s to he",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("he");
    },
  );

  it.each([
    [["ps", "ur-PK"], "ur"],
    [["yi", "he-IL"], "he"],
    [["ps"], "en"],
    [["yi"], "en"],
  ] as const)(
    "keeps unsupported RTL preference list %j on the existing fallback path",
    (browserLanguages, expected) => {
      expect(
        resolveInitialInterfaceLocale(
          environment(null, [...browserLanguages]),
        ),
      ).toBe(expected);
    },
  );

  it.each(["nl", "nl-NL", "nl-BE", "NL-be"])(
    "resolves the Dutch browser tag %s to nl",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("nl");
    },
  );

  it.each(["lo", "lo-LA"])(
    "does not alias the Lao browser tag %s to Thai",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("en");
    },
  );

  it.each(["ca", "ca-ES"])(
    "does not alias the Catalan browser tag %s to Spanish",
    (browserLocale) => {
      expect(
        resolveInitialInterfaceLocale(environment(null, [browserLocale])),
      ).toBe("en");
    },
  );

  it("uses English when every browser language is unsupported or malformed", () => {
    expect(
      resolveInitialInterfaceLocale(
        environment(null, ["eo", "not a locale", "zh-Hant"]),
      ),
    ).toBe("en");
  });

  it.each([
    ["en", ["es-ES"], "en"],
    ["es", ["en-GB"], "es"],
    ["zh-CN", ["de-AT"], "zh-CN"],
    ["zh-TW", ["zh-CN"], "zh-TW"],
    ["hi", ["bn-BD"], "hi"],
    ["ar", ["he-IL"], "ar"],
    ["pt-BR", ["fr-CA"], "pt-BR"],
    ["bn", ["hi-IN"], "bn"],
    ["ru", ["ja-JP"], "ru"],
    ["ja", ["ru-KZ"], "ja"],
    ["fr", ["de-AT"], "fr"],
    ["de", ["zh-CN"], "de"],
    ["ur", ["ar-SA"], "ur"],
    ["id", ["tr-TR"], "id"],
    ["tr", ["id-MY"], "tr"],
    ["ko", ["de-DE"], "ko"],
    ["it", ["fr-CA"], "it"],
    ["uk", ["pl-PL"], "uk"],
    ["pl", ["uk-UA"], "pl"],
    ["vi", ["th-TH"], "vi"],
    ["th", ["ko-KR"], "th"],
    ["fa", ["ur-PK"], "fa"],
    ["sw", ["nl-BE"], "sw"],
    ["he", ["fa-IR"], "he"],
    ["nl", ["it-IT"], "nl"],
  ] as const)(
    "lets stored %s take precedence over browser detection",
    (storedLocale, detectedLocales, expectedLocale) => {
      const storage = createStorage({
        [INTERFACE_LOCALE_STORAGE_KEY]: storedLocale,
      });

      expect(
        resolveInitialInterfaceLocale(
          environment(storage, detectedLocales),
        ),
      ).toBe(expectedLocale);
      expect(storage.getItem).toHaveBeenCalledOnce();
    },
  );

  it("ignores invalid stored data and continues to browser matching", () => {
    const storage = createStorage({
      [INTERFACE_LOCALE_STORAGE_KEY]: "en-US",
    });

    expect(
      resolveInitialInterfaceLocale(environment(storage, ["es-MX"])),
    ).toBe("es");
  });

  it("uses the legacy output locale when the interface locale is unavailable", () => {
    const storage = createStorage({
      [OUTPUT_LOCALE_STORAGE_KEY]: "ru",
    });

    expect(
      resolveInitialInterfaceLocale(environment(storage, ["ar-EG"])),
    ).toBe("ru");
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("continues to the legacy output locale when the interface-key read throws", () => {
    const storage = createStorage({
      [OUTPUT_LOCALE_STORAGE_KEY]: "he",
    });
    vi.mocked(storage.getItem).mockImplementation((key) => {
      if (key === INTERFACE_LOCALE_STORAGE_KEY) {
        throw new Error("Synthetic blocked interface-key read");
      }
      return storage.values.get(key) ?? null;
    });

    expect(
      resolveInitialInterfaceLocale(environment(storage, ["es-MX"])),
    ).toBe("he");
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("lets a valid stored interface locale win a legacy-key conflict", () => {
    const storage = createStorage({
      [INTERFACE_LOCALE_STORAGE_KEY]: "es",
      [OUTPUT_LOCALE_STORAGE_KEY]: "he",
    });

    expect(
      resolveInitialInterfaceLocale(environment(storage, ["ar-EG"])),
    ).toBe("es");
    expect(storage.getItem).toHaveBeenCalledOnce();
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it.each(SUPPORTED_INTERFACE_LOCALES)(
    "persists explicit unified locale %s to both legacy keys",
    (locale) => {
      const storage = createStorage();

      persistUnifiedLocale(locale, storage);

      expect(storage.setItem).toHaveBeenNthCalledWith(
        1,
        INTERFACE_LOCALE_STORAGE_KEY,
        locale,
      );
      expect(storage.setItem).toHaveBeenNthCalledWith(
        2,
        OUTPUT_LOCALE_STORAGE_KEY,
        locale,
      );
      expect(storage.values).toEqual(
        new Map([
          [INTERFACE_LOCALE_STORAGE_KEY, locale],
          [OUTPUT_LOCALE_STORAGE_KEY, locale],
        ]),
      );
    },
  );

  it("ignores invalid unified values and tolerates storage write failures", () => {
    const invalidStorage = createStorage();
    persistUnifiedLocale("en-US" as InterfaceLocale, invalidStorage);
    expect(invalidStorage.setItem).not.toHaveBeenCalled();

    const blockedStorage = createStorage();
    vi.mocked(blockedStorage.setItem).mockImplementation(() => {
      throw new Error("Synthetic blocked unified-locale write");
    });
    expect(() => persistUnifiedLocale("ar", blockedStorage)).not.toThrow();
  });

  it.each([
    "hi-IN",
    "AR",
    "ar-EG",
    "pt-br",
    "pt",
    "pt-PT",
    "bn-BD",
    "fr-FR",
    "ur-PK",
    "UR",
    "id-ID",
    "tr-TR",
    "ko-KR",
    "it-IT",
    "uk-UA",
    "pl-PL",
    "vi-VN",
    "th-TH",
    "TH",
    "fa-IR",
    "FA",
    "sw-KE",
    "he-IL",
    "HE",
    "iw",
    "nl-NL",
  ])(
    "rejects regional stored value %s before browser matching",
    (storedLocale) => {
      const storage = createStorage({
        [INTERFACE_LOCALE_STORAGE_KEY]: storedLocale,
      });

      expect(
        resolveInitialInterfaceLocale(environment(storage, ["es-MX"])),
      ).toBe("es");
    },
  );

  it.each(["zh-cn", "zh-tw", "zh-Hans", "zh-Hant", "zh-Hant-TW"])(
    "rejects non-registry stored Chinese value %s before browser matching",
    (storedLocale) => {
      const storage = createStorage({
        [INTERFACE_LOCALE_STORAGE_KEY]: storedLocale,
      });

      expect(
        resolveInitialInterfaceLocale(environment(storage, ["de-AT"])),
      ).toBe("de");
    },
  );

  it("falls back safely when storage reads throw", () => {
    const storage = createStorage();
    vi.mocked(storage.getItem).mockImplementation(() => {
      throw new Error("Synthetic blocked locale storage read");
    });

    expect(() =>
      resolveInitialInterfaceLocale(environment(storage, ["es-MX"])),
    ).not.toThrow();
    expect(
      resolveInitialInterfaceLocale(environment(storage, ["es-MX"])),
    ).toBe("es");
  });

  it.each(["missing", "throwing"] as const)(
    "falls back safely when browser-language access is %s",
    (failureMode) => {
      const localeEnvironment =
        failureMode === "missing"
          ? environment(null, null)
          : (Object.defineProperty(
              { storage: null },
              "browserLanguages",
              {
                get() {
                  throw new Error("Synthetic browser-language failure");
                },
              },
            ) as LocaleResolutionEnvironment);

      expect(() => resolveInitialInterfaceLocale(localeEnvironment)).not.toThrow();
      expect(resolveInitialInterfaceLocale(localeEnvironment)).toBe("en");
    },
  );

  it("never persists an automatically detected or fallback locale", () => {
    const storage = createStorage();

    expect(
      resolveInitialInterfaceLocale(environment(storage, ["es-MX"])),
    ).toBe("es");
    expect(storage.setItem).not.toHaveBeenCalled();

    expect(
      resolveInitialInterfaceLocale(environment(storage, ["zh-tw"])),
    ).toBe("zh-TW");
    expect(storage.setItem).not.toHaveBeenCalled();

    expect(
      resolveInitialInterfaceLocale(environment(storage, ["bn-BD"])),
    ).toBe("bn");
    expect(storage.setItem).not.toHaveBeenCalled();

    expect(
      resolveInitialInterfaceLocale(environment(storage, ["ar-SA"])),
    ).toBe("ar");
    expect(storage.setItem).not.toHaveBeenCalled();

    expect(
      resolveInitialInterfaceLocale(environment(storage, ["ur-IN"])),
    ).toBe("ur");
    expect(storage.setItem).not.toHaveBeenCalled();

    expect(
      resolveInitialInterfaceLocale(environment(storage, ["fa-AF"])),
    ).toBe("fa");
    expect(storage.setItem).not.toHaveBeenCalled();

    expect(
      resolveInitialInterfaceLocale(environment(storage, ["iw-IL"])),
    ).toBe("he");
    expect(storage.setItem).not.toHaveBeenCalled();

    expect(
      resolveInitialInterfaceLocale(environment(storage, ["th-TH"])),
    ).toBe("th");
    expect(storage.setItem).not.toHaveBeenCalled();

    expect(
      resolveInitialInterfaceLocale(environment(storage, ["pt-br"])),
    ).toBe("pt-BR");
    expect(storage.setItem).not.toHaveBeenCalled();

    expect(
      resolveInitialInterfaceLocale(environment(storage, ["nl-BE"])),
    ).toBe("nl");
    expect(storage.setItem).not.toHaveBeenCalled();

    expect(
      resolveInitialInterfaceLocale(environment(storage, ["id-MY"])),
    ).toBe("id");
    expect(storage.setItem).not.toHaveBeenCalled();

    expect(
      resolveInitialInterfaceLocale(environment(storage, ["sw-TZ"])),
    ).toBe("sw");
    expect(storage.setItem).not.toHaveBeenCalled();

    expect(
      resolveInitialInterfaceLocale(environment(storage, ["eo"])),
    ).toBe("en");
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("persists only an explicit supported locale under the approved key", () => {
    const storage = createStorage();

    persistInterfaceLocale("es", storage);

    expect(storage.setItem).toHaveBeenCalledOnce();
    expect(storage.setItem).toHaveBeenCalledWith(
      INTERFACE_LOCALE_STORAGE_KEY,
      "es",
    );
    expect(storage.values).toEqual(
      new Map([[INTERFACE_LOCALE_STORAGE_KEY, "es"]]),
    );
  });

  it.each([
    "zh-CN",
    "zh-TW",
    "hi",
    "ar",
    "pt-BR",
    "bn",
    "ru",
    "ja",
    "fr",
    "de",
    "ur",
    "id",
    "tr",
    "ko",
    "it",
    "uk",
    "pl",
    "vi",
    "th",
    "fa",
    "sw",
    "he",
    "nl",
  ] as const)(
    "persists an explicit %s selection under only the approved key",
    (locale) => {
      const storage = createStorage();

      persistInterfaceLocale(locale, storage);

      expect(storage.setItem).toHaveBeenCalledOnce();
      expect(storage.setItem).toHaveBeenCalledWith(
        INTERFACE_LOCALE_STORAGE_KEY,
        locale,
      );
      expect(storage.values).toEqual(
        new Map([[INTERFACE_LOCALE_STORAGE_KEY, locale]]),
      );
    },
  );

  it("keeps the current session usable when storage writes throw", () => {
    const storage = createStorage();
    vi.mocked(storage.setItem).mockImplementation(() => {
      throw new Error("Synthetic blocked locale storage write");
    });

    expect(() => persistInterfaceLocale("es", storage)).not.toThrow();
  });

  it("keeps interface-locale and visual-mode persistence independent", () => {
    const storage = createStorage({
      [VISUAL_MODE_STORAGE_KEY]: "enhanced",
    });
    const interfaceLocale: InterfaceLocale = "es";
    const outputLocale: OutputLocale = "en";

    persistInterfaceLocale(interfaceLocale, storage);

    expect(outputLocale).toBe("en");
    expect(INTERFACE_LOCALE_STORAGE_KEY).toBe(
      "heatrelay.interface-locale.v1",
    );
    expect(INTERFACE_LOCALE_STORAGE_KEY).not.toBe(VISUAL_MODE_STORAGE_KEY);
    expect(storage.values.get(VISUAL_MODE_STORAGE_KEY)).toBe("enhanced");
    expect(storage.values).toEqual(
      new Map([
        [VISUAL_MODE_STORAGE_KEY, "enhanced"],
        [INTERFACE_LOCALE_STORAGE_KEY, "es"],
      ]),
    );
    expect(storage.values.has("heatrelay.output-locale.v1")).toBe(false);
  });

  it("rejects an unsupported runtime value without storing another object or text", () => {
    const storage = createStorage();

    persistInterfaceLocale("eo" as InterfaceLocale, storage);

    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.values.size).toBe(0);
  });
});

describe("canonical catalogs and bundled runtime", () => {
  const rtlCatalogs = [
    ARABIC_CATALOG,
    URDU_CATALOG,
    PERSIAN_CATALOG,
    HEBREW_CATALOG,
  ] as const;

  it("keeps localized unit ownership at the formatter boundary", () => {
    expect(ENGLISH_CATALOG["distance.straightLine"]).toBe(
      "{{distance}} straight-line",
    );
    expect(SPANISH_CATALOG["distance.straightLine"]).toBe(
      "{{distance}} en línea recta",
    );
    expect(Object.hasOwn(ENGLISH_CATALOG, "temperature.celsius")).toBe(false);
    expect(
      Object.hasOwn(ENGLISH_CATALOG, "distance.metresStraightLine"),
    ).toBe(false);
    expect(
      Object.hasOwn(ENGLISH_CATALOG, "distance.kilometresStraightLine"),
    ).toBe(false);
  });

  it("keeps every catalog at the exact canonical 124-key boundary", () => {
    const canonicalKeys = Object.keys(ENGLISH_CATALOG).sort();

    expect(canonicalKeys).toHaveLength(139);
    for (const locale of SUPPORTED_INTERFACE_LOCALES) {
      const localeKeys = Object.keys(LOCALE_REGISTRY[locale].catalog).sort();
      expect(localeKeys).toHaveLength(139);
      expect(localeKeys).toEqual(canonicalKeys);
    }
  });

  it("uses compact disclosure and ordinary character copy without changing catalog parity", () => {
    expect(
      Object.fromEntries(
        [
          "form.privacyTitle",
          "form.identityWarning",
          "form.characterCount",
          "form.characterCountOverLimit",
          "form.situationHint",
          "validation.overLimit",
        ].map((key) => [key, ENGLISH_CATALOG[key as MessageKey]]),
      ),
    ).toEqual({
      "form.privacyTitle": "Privacy and demo details",
      "form.identityWarning":
        "Sent to OpenAI; HeatRelay does not intentionally save or log the original text. Do not include names, contacts, or addresses. Fixed Barcelona demo coordinates. Not medical or emergency advice.",
      "form.characterCount": "{{currentCount}} / {{limit}} characters",
      "form.characterCountOverLimit":
        "{{currentCount}} / {{limit}} characters — shorten by {{overLimitCount}}",
      "form.situationHint":
        "Briefly describe age, access to cooling, mobility, timing, and symptoms if relevant.",
      "validation.overLimit": "The description is too long. Shorten the text.",
    });
    expect(RUSSIAN_CATALOG["form.privacyTitle"]).toBe(
      "Конфиденциальность и условия демоверсии",
    );
    expect(RUSSIAN_CATALOG["form.identityWarning"]).toBe(
      "Текст передаётся в OpenAI; HeatRelay намеренно не сохраняет и не журналирует исходный текст. Не указывайте имена, контакты или адреса. Фиксированные координаты Barcelona. Это не медицинская или экстренная помощь.",
    );
    expect(RUSSIAN_CATALOG["form.characterCount"]).toBe(
      "{{currentCount}} / {{limit}} символов",
    );
    expect(RUSSIAN_CATALOG["form.characterCountOverLimit"]).toBe(
      "{{currentCount}} / {{limit}} символов — сократите на {{overLimitCount}}",
    );
    expect(RUSSIAN_CATALOG["form.situationHint"]).toBe(
      "Кратко укажите возраст, возможность охладиться, подвижность, время и симптомы, если они есть.",
    );
    expect(RUSSIAN_CATALOG["validation.overLimit"]).toBe(
      "Описание слишком длинное. Сократите текст.",
    );

    const revisedKeys = [
      "form.privacyTitle",
      "form.identityWarning",
      "form.characterCount",
      "form.characterCountOverLimit",
      "form.situationHint",
      "validation.overLimit",
    ] as const;
    for (const locale of SUPPORTED_INTERFACE_LOCALES) {
      for (const key of revisedKeys) {
        const value = LOCALE_REGISTRY[locale].catalog[key];
        expect(value.trim()).not.toBe("");
        expect(value).not.toBe(key);
        expect(interpolationNames(value)).toEqual(
          interpolationNames(ENGLISH_CATALOG[key]),
        );
      }
      expect(LOCALE_REGISTRY[locale].catalog["form.identityWarning"]).toContain(
        "OpenAI",
      );
      expect(LOCALE_REGISTRY[locale].catalog["form.identityWarning"]).toContain(
        "HeatRelay",
      );
      expect(LOCALE_REGISTRY[locale].catalog["form.identityWarning"]).toContain(
        "Barcelona",
      );
    }
  });

  it("allows only the reviewed exact English equalities in non-English catalogs", () => {
    const sharedEqualities = [
      "app.name",
      "interfaceLanguage.optionWithEnglishName",
    ] as const satisfies readonly MessageKey[];
    const allowedEqualities = {
      es: sharedEqualities,
      "zh-CN": sharedEqualities,
      "zh-TW": sharedEqualities,
      hi: sharedEqualities,
      ar: sharedEqualities,
      "pt-BR": sharedEqualities,
      bn: sharedEqualities,
      ru: sharedEqualities,
      ja: sharedEqualities,
      fr: [
        ...sharedEqualities,
        "visualMode.standard",
        "result.localPhraseCatalan",
        "place.distanceLabel",
      ],
      de: [...sharedEqualities, "visualMode.standard"],
      ur: sharedEqualities,
      id: sharedEqualities,
      tr: sharedEqualities,
      ko: sharedEqualities,
      it: [
        ...sharedEqualities,
        "visualMode.standard",
        "trust.privacyLabel",
      ],
      uk: sharedEqualities,
      pl: sharedEqualities,
      vi: sharedEqualities,
      th: sharedEqualities,
      fa: sharedEqualities,
      sw: sharedEqualities,
      he: sharedEqualities,
      nl: [...sharedEqualities, "trust.privacyLabel"],
    } satisfies Record<Exclude<InterfaceLocale, "en">, readonly MessageKey[]>;
    const nonEnglishLocales = SUPPORTED_INTERFACE_LOCALES.filter(
      (locale): locale is Exclude<InterfaceLocale, "en"> => locale !== "en",
    );

    expect(Object.keys(allowedEqualities).sort()).toEqual(
      [...nonEnglishLocales].sort(),
    );
    for (const locale of nonEnglishLocales) {
      const equalKeys = catalogEntries(LOCALE_REGISTRY[locale].catalog)
        .filter(([key, value]) => value === ENGLISH_CATALOG[key])
        .map(([key]) => key)
        .sort();

      expect(equalKeys).toEqual([...allowedEqualities[locale]].sort());
    }
  });

  it("keeps the exact twelve non-interpolated language-context keys complete and safe", () => {
    const keys = [
      "languageContext.title",
      "languageContext.descriptionLanguage",
      "languageContext.displayedLanguage",
      "languageContext.nextLanguage",
      "languageContext.supportedMismatch",
      "languageContext.catalanUnavailable",
      "languageContext.other",
      "languageContext.unknown",
      "languageContext.nextSelection",
      "languageContext.otherValue",
      "languageContext.unknownValue",
      "languageContext.changeAction",
    ] as const;
    expect(
      Object.keys(ENGLISH_CATALOG).filter((key) =>
        key.startsWith("languageContext."),
      ),
    ).toEqual(keys);
    expect(Object.fromEntries(keys.map((key) => [key, ENGLISH_CATALOG[key]]))).toEqual({
      "languageContext.title": "Language information",
      "languageContext.descriptionLanguage": "Description language",
      "languageContext.displayedLanguage": "Displayed plan language",
      "languageContext.nextLanguage": "Next action-plan language",
      "languageContext.supportedMismatch":
        "The description and displayed plan use different supported languages. Review the plan carefully and choose another action-plan language if needed.",
      "languageContext.catalanUnavailable":
        "Catalan action-plan output is not available. Review the displayed plan carefully and choose an available action-plan language if needed.",
      "languageContext.other":
        "HeatRelay could not match the description language to one of its supported launch languages. Review the displayed plan carefully and choose the action-plan language you understand best.",
      "languageContext.unknown":
        "HeatRelay could not reliably determine the description language. Review the displayed plan carefully and choose the action-plan language you understand best.",
      "languageContext.nextSelection":
        "The displayed plan is not rewritten. Your saved choice applies to the next plan.",
      "languageContext.otherValue": "Another language",
      "languageContext.unknownValue": "Could not be determined",
      "languageContext.changeAction": "Change language",
    });

    for (const locale of SUPPORTED_INTERFACE_LOCALES) {
      const catalog = LOCALE_REGISTRY[locale].catalog;
      for (const key of keys) {
        const value = catalog[key];
        expect(value.trim()).not.toBe("");
        expect(value).not.toBe(key);
        expect(interpolationNames(value)).toEqual([]);
        expect(value).not.toMatch(/<\/?[A-Za-z][^>]*>/);
        expect(value).not.toMatch(/{{[^}]+}}/);
        expect(value).not.toMatch(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u);
        expect(value).not.toMatch(/[\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/u);
        expect(value).not.toMatch(/[\u{1F1E6}-\u{1F1FF}]/u);
        expect(value).not.toMatch(
          /\b(?:TODO|TBD|FIXME|DRAFT|PLACEHOLDER|REVIEW[- ]NOTE)\b/i,
        );
        if (locale !== "en") {
          expect(value).not.toBe(ENGLISH_CATALOG[key]);
        }
      }
    }
  });

  it("keeps the output-language keys canonical and revised preference copy safe", () => {
    expect(ENGLISH_CATALOG["outputLanguage.label"]).toBe(
      "Action-plan language",
    );
    expect(ENGLISH_CATALOG["outputLanguage.description"]).toBe(
      "Chooses the language for the next action plan. This preference is saved in this browser and sent with the action-plan request. It does not change the interface language or translate your description.",
    );
    expect(ENGLISH_CATALOG["footer.description"]).toBe(
      "Barcelona demo · Fixed coordinates",
    );

    for (const locale of SUPPORTED_INTERFACE_LOCALES) {
      const catalog = LOCALE_REGISTRY[locale].catalog;
      for (const key of [
        "outputLanguage.label",
        "outputLanguage.description",
        "interfaceLanguage.description",
        "trust.privacyDescription",
        "footer.description",
      ] as const) {
        const value = catalog[key];
        expect(value.trim()).not.toBe("");
        expect(value).not.toBe(key);
        expect(value).not.toMatch(/<\/?[A-Za-z][^>]*>/);
        expect(value).not.toMatch(/{{[^}]+}}/);
        expect(value).not.toMatch(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u);
        expect(value).not.toMatch(/[\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/u);
        expect(value).not.toMatch(/[\u{1F1E6}-\u{1F1FF}]/u);
        expect(value).not.toMatch(
          /\b(?:TODO|TBD|FIXME|DRAFT|PLACEHOLDER|REVIEW[- ]NOTE)\b/i,
        );
      }
    }
  });

  it("preserves each canonical interpolation-variable set in every catalog", () => {
    for (const locale of SUPPORTED_INTERFACE_LOCALES) {
      for (const [key, englishMessage] of catalogEntries()) {
        expect(
          interpolationNames(LOCALE_REGISTRY[locale].catalog[key]),
        ).toEqual(interpolationNames(englishMessage));
      }
    }
  });

  it("preserves required brand, provider, place, model, and emergency tokens", () => {
    const preservedTokens = [
      "HeatRelay",
      "Barcelona",
      "OpenAI",
      "GPT-5.6",
      "Open-Meteo",
      "112",
    ];

    for (const locale of SUPPORTED_INTERFACE_LOCALES) {
      for (const [key, englishMessage] of catalogEntries()) {
        for (const token of preservedTokens) {
          if (englishMessage.includes(token)) {
            expect(LOCALE_REGISTRY[locale].catalog[key]).toContain(token);
          }
        }
      }
    }
  });

  it("contains only nonempty non-placeholder string values", () => {
    for (const locale of SUPPORTED_INTERFACE_LOCALES) {
      for (const [key, value] of catalogEntries(
        LOCALE_REGISTRY[locale].catalog,
      )) {
        expect(typeof value).toBe("string");
        expect(value.length).toBeGreaterThan(0);
        expect(value).not.toMatch(/\b(?:TODO|TBD)\b/i);
        expect(value).not.toMatch(
          /\b(?:DRAFT|PLACEHOLDER|NEEDS[- ]REVIEW|PENDING[- ]TRANSLATION|HUMAN[- ]REVIEWED|NATIVE[- ]REVIEWED)\b/i,
        );
        expect(value).not.toBe(key);
      }
    }
  });

  it("contains no whitespace-only message", () => {
    for (const locale of SUPPORTED_INTERFACE_LOCALES) {
      for (const [, value] of catalogEntries(
        LOCALE_REGISTRY[locale].catalog,
      )) {
        expect(value.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("contains no raw HTML", () => {
    for (const locale of SUPPORTED_INTERFACE_LOCALES) {
      for (const [, value] of catalogEntries(
        LOCALE_REGISTRY[locale].catalog,
      )) {
        expect(value).not.toMatch(/<\/?[A-Za-z][^>]*>/);
      }
    }
  });

  it("keeps the four RTL catalogs distinct and free of authored bidi controls or review notes", () => {
    for (const [catalogIndex, catalog] of rtlCatalogs.entries()) {
      for (const otherCatalog of rtlCatalogs.slice(catalogIndex + 1)) {
        expect(catalog).not.toEqual(otherCatalog);
        const sharedValueCount = catalogEntries(catalog).filter(
          ([key, value]) => otherCatalog[key] === value,
        ).length;
        expect(sharedValueCount).toBeLessThan(25);
      }
      for (const [, value] of catalogEntries(catalog)) {
        expect(value).not.toMatch(/[\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/iu);
        expect(value).not.toMatch(
          /\b(?:TODO|TBD|FIXME|TRANSLATOR|REVIEW[- ]NOTE)\b/i,
        );
      }
    }
  });

  it("gives every registered catalog the exact canonical key set", () => {
    const canonicalKeys = Object.keys(ENGLISH_CATALOG).sort();

    for (const locale of SUPPORTED_INTERFACE_LOCALES) {
      expect(Object.keys(LOCALE_REGISTRY[locale].catalog).sort()).toEqual(
        canonicalKeys,
      );
    }
  });

  it("resolves every canonical key in every locale with named interpolation", async () => {
    for (const locale of SUPPORTED_INTERFACE_LOCALES) {
      const runtime = await createI18nRuntime(locale);
      const translate = runtime.t as unknown as (
        key: MessageKey,
        values?: Record<string, string>,
      ) => string;

      for (const [key, message] of catalogEntries(
        LOCALE_REGISTRY[locale].catalog,
      )) {
        const values = interpolationValues(message);
        const resolved = translate(key, values);
        const expected = interpolate(message, values);

        expect(resolved).toBe(expected);
        expect(resolved).not.toBe(key);
        expect(resolved).not.toBe("");
        expect(resolved).not.toContain("undefined");
        expect(resolved).not.toMatch(/{{[^}]+}}/);
      }
    }
  });

  it("falls back to bundled English for an unsupported runtime language", async () => {
    const runtime = await createI18nRuntime("en");

    await runtime.changeLanguage("eo");

    expect(runtime.t("app.name")).toBe(ENGLISH_CATALOG["app.name"]);
    expect(runtime.resolvedLanguage).toBe("en");
  });

  it("formats the Spanish locale option with native and English names", async () => {
    const runtime = await createI18nRuntime("en");

    expect(
      runtime.t("interfaceLanguage.optionWithEnglishName", {
        nativeName: "Español",
        englishName: "Spanish",
      }),
    ).toBe("Español — Spanish");
  });

  it("derives the exact 25 native-name-only selector labels from the registry", () => {
    const optionLabels = SUPPORTED_INTERFACE_LOCALES.map(
      (locale) => LOCALE_REGISTRY[locale].nativeName,
    );

    expect(optionLabels).toEqual([
      "English",
      "Español",
      "中文（简体）",
      "中文（繁體）",
      "हिन्दी",
      "العربية",
      "Português (Brasil)",
      "বাংলা",
      "Русский",
      "日本語",
      "Français",
      "Deutsch",
      "اردو",
      "Bahasa Indonesia",
      "Türkçe",
      "한국어",
      "Italiano",
      "Українська",
      "Polski",
      "Tiếng Việt",
      "ไทย",
      "فارسی",
      "Kiswahili",
      "עברית",
      "Nederlands",
    ]);
    expect(optionLabels).toHaveLength(25);
    expect(optionLabels.every((label) => !label.includes(" — "))).toBe(true);
  });

  it("creates isolated runtimes without fetch or another network request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const first = await createI18nRuntime("en");
    const second = await createI18nRuntime("ru");
    await first.changeLanguage("zh-TW");
    await second.changeLanguage("unsupported");

    expect(first).not.toBe(second);
    expect(first.t("app.name")).toBe("HeatRelay");
    expect(first.resolvedLanguage).toBe("zh-TW");
    expect(second.t("app.name")).toBe("HeatRelay");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("changes among the new bundled locales without a network request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const runtime = await createI18nRuntime("hi");

    expect(runtime.resolvedLanguage).toBe("hi");
    await runtime.changeLanguage("bn");
    expect(runtime.resolvedLanguage).toBe("bn");
    await runtime.changeLanguage("ko");
    expect(runtime.resolvedLanguage).toBe("ko");
    await runtime.changeLanguage("th");
    expect(runtime.resolvedLanguage).toBe("th");
    await runtime.changeLanguage("pt-BR");
    expect(runtime.resolvedLanguage).toBe("pt-BR");
    await runtime.changeLanguage("fr");
    expect(runtime.resolvedLanguage).toBe("fr");
    await runtime.changeLanguage("it");
    expect(runtime.resolvedLanguage).toBe("it");
    await runtime.changeLanguage("nl");
    expect(runtime.resolvedLanguage).toBe("nl");
    await runtime.changeLanguage("id");
    expect(runtime.resolvedLanguage).toBe("id");
    await runtime.changeLanguage("tr");
    expect(runtime.resolvedLanguage).toBe("tr");
    await runtime.changeLanguage("uk");
    expect(runtime.resolvedLanguage).toBe("uk");
    await runtime.changeLanguage("pl");
    expect(runtime.resolvedLanguage).toBe("pl");
    await runtime.changeLanguage("vi");
    expect(runtime.resolvedLanguage).toBe("vi");
    await runtime.changeLanguage("sw");
    expect(runtime.resolvedLanguage).toBe("sw");
    await runtime.changeLanguage("ar");
    expect(runtime.resolvedLanguage).toBe("ar");
    await runtime.changeLanguage("ur");
    expect(runtime.resolvedLanguage).toBe("ur");
    await runtime.changeLanguage("fa");
    expect(runtime.resolvedLanguage).toBe("fa");
    await runtime.changeLanguage("he");
    expect(runtime.resolvedLanguage).toBe("he");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("updates React translations through the same mounted runtime without fetch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const runtime = await createI18nRuntime("en");
    function TranslationProbe() {
      const { t } = useTranslation();
      return createElement("p", null, t("form.title"));
    }

    renderWithTestingLibrary(
      createElement(
        I18nextProvider,
        { i18n: runtime },
        createElement(TranslationProbe),
      ),
    );
    expect(screen.getByText(ENGLISH_CATALOG["form.title"])).toBeTruthy();

    await runtime.changeLanguage("de");

    await waitFor(() =>
      expect(screen.getByText(GERMAN_CATALOG["form.title"])).toBeTruthy(),
    );
    expect(runtime.resolvedLanguage).toBe("de");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("deterministic locale-bound formatters", () => {
  it("formats a date and time deterministically in an explicit time zone", () => {
    expect(
      formatDateTime("2026-07-17T08:00:00Z", "en", "Europe/Madrid"),
    ).toBe("17 Jul 2026, 10:00");
  });

  it("formats a date-only civil value without shifting its calendar day", () => {
    expect(formatDateOnly("2026-07-15", "en")).toBe("15 Jul 2026");
  });

  it("formats numbers, Celsius, metres, and kilometres deterministically", () => {
    expect(formatNumber(1234567.89, "en")).toBe("1,234,567.89");
    expect(formatCelsiusTemperature(33, "en")).toBe("33.0°C");
    expect(formatDistance(725, "en")).toBe("725 m");
    expect(formatDistance(1200, "en")).toBe("1.2 km");
  });

  it("formats Spanish dates, numbers, Celsius, metres, and kilometres deterministically", () => {
    expect(
      formatDateTime("2026-07-17T08:00:00Z", "es", "Europe/Madrid"),
    ).toBe("17 jul 2026, 10:00");
    expect(formatDateOnly("2026-07-15", "es")).toBe("15 jul 2026");
    expect(formatNumber(1234567.89, "es")).toBe("1.234.567,89");
    expect(formatCelsiusTemperature(33, "es")).toBe("33,0 °C");
    expect(formatDistance(725, "es")).toBe("725 m");
    expect(formatDistance(1200, "es")).toBe("1,2 km");
    expect(formatNumber(2000, "es")).toBe("2000");
  });

  it.each([
    [
      "zh-CN",
      "2026年7月17日 10:00",
      "2026年7月15日",
      "1,234,567.89",
      "33.0°C",
      "725米",
      "1.2公里",
      "2,000",
    ],
    [
      "zh-TW",
      "2026年7月17日 上午10:00",
      "2026年7月15日",
      "1,234,567.89",
      "33.0°C",
      "725 公尺",
      "1.2 公里",
      "2,000",
    ],
    [
      "hi",
      "17 जुल॰ 2026, 10:00 am",
      "15 जुल॰ 2026",
      "12,34,567.89",
      "33.0°से॰",
      "725 मी",
      "1.2 कि॰मी॰",
      "2,000",
    ],
    [
      "ar",
      "١٧\u200F/٠٧\u200F/٢٠٢٦، ١٠:٠٠ ص",
      "١٥\u200F/٠٧\u200F/٢٠٢٦",
      "١٬٢٣٤٬٥٦٧٫٨٩",
      "٣٣٫٠°م",
      "٧٢٥ مترًا",
      "١٫٢ كم",
      "٢٬٠٠٠",
    ],
    [
      "pt-BR",
      "17 de jul. de 2026, 10:00",
      "15 de jul. de 2026",
      "1.234.567,89",
      "33,0 °C",
      "725 m",
      "1,2 km",
      "2.000",
    ],
    [
      "bn",
      "১৭ জুল, ২০২৬, ১০:০০ AM",
      "১৫ জুল, ২০২৬",
      "১২,৩৪,৫৬৭.৮৯",
      "৩৩.০°C",
      "৭২৫ মি",
      "১.২ কিমি",
      "২,০০০",
    ],
    [
      "ru",
      "17 июл. 2026 г., 10:00",
      "15 июл. 2026 г.",
      "1\u00a0234\u00a0567,89",
      "33,0 °C",
      "725 м",
      "1,2 км",
      "2\u00a0000",
    ],
    [
      "ja",
      "2026/07/17 10:00",
      "2026/07/15",
      "1,234,567.89",
      "33.0°C",
      "725 m",
      "1.2 km",
      "2,000",
    ],
    [
      "fr",
      "17 juil. 2026, 10:00",
      "15 juil. 2026",
      "1\u202F234\u202F567,89",
      "33,0\u202F°C",
      "725\u202Fm",
      "1,2\u202Fkm",
      "2\u202F000",
    ],
    [
      "de",
      "17.07.2026, 10:00",
      "15.07.2026",
      "1.234.567,89",
      "33,0 °C",
      "725 m",
      "1,2 km",
      "2.000",
    ],
    [
      "ur",
      "17 جولائی، 2026، 10:00 AM",
      "15 جولائی، 2026",
      "1,234,567.89",
      "33.0\u200E°C",
      "725 میٹر",
      "1.2 کلو میٹر",
      "2,000",
    ],
    [
      "id",
      "17 Jul 2026, 10.00",
      "15 Jul 2026",
      "1.234.567,89",
      "33,0°C",
      "725 m",
      "1,2 km",
      "2.000",
    ],
    [
      "tr",
      "17 Tem 2026 10:00",
      "15 Tem 2026",
      "1.234.567,89",
      "33,0°C",
      "725 m",
      "1,2 km",
      "2.000",
    ],
    [
      "ko",
      "2026. 7. 17. 오전 10:00",
      "2026. 7. 15.",
      "1,234,567.89",
      "33.0°C",
      "725m",
      "1.2km",
      "2,000",
    ],
    [
      "it",
      "17 lug 2026, 10:00",
      "15 lug 2026",
      "1.234.567,89",
      "33,0 °C",
      "725 m",
      "1,2 km",
      "2000",
    ],
    [
      "uk",
      "17 лип. 2026 р., 10:00",
      "15 лип. 2026 р.",
      "1\u00A0234\u00A0567,89",
      "33,0\u00A0°C",
      "725 м",
      "1,2 км",
      "2\u00A0000",
    ],
    [
      "pl",
      "17 lip 2026, 10:00",
      "15 lip 2026",
      "1\u00A0234\u00A0567,89",
      "33,0 st. C",
      "725 m",
      "1,2 km",
      "2000",
    ],
    [
      "vi",
      "10:00 17 thg 7, 2026",
      "15 thg 7, 2026",
      "1.234.567,89",
      "33,0°C",
      "725 m",
      "1,2 km",
      "2.000",
    ],
    [
      "th",
      "17 ก.ค. 2569 10:00",
      "15 ก.ค. 2569",
      "1,234,567.89",
      "33.0°C",
      "725 ม.",
      "1.2 กม.",
      "2,000",
    ],
    [
      "fa",
      "۲۶ تیر ۱۴۰۵، ۱۰:۰۰",
      "۲۴ تیر ۱۴۰۵",
      "۱٬۲۳۴٬۵۶۷٫۸۹",
      "۳۳٫۰°C",
      "۷۲۵متر",
      "۱٫۲ کیلومتر",
      "۲٬۰۰۰",
    ],
    [
      "sw",
      "17 Jul 2026, 10:00",
      "15 Jul 2026",
      "1,234,567.89",
      "33.0°C",
      "mita 725",
      "km 1.2",
      "2,000",
    ],
    [
      "he",
      "17 ביולי 2026, 10:00",
      "15 ביולי 2026",
      "1,234,567.89",
      "33.0°C",
      "725 מ׳",
      "1.2 ק״מ",
      "2,000",
    ],
    [
      "nl",
      "17 jul 2026, 10:00",
      "15 jul 2026",
      "1.234.567,89",
      "33,0°C",
      "725 m",
      "1,2 km",
      "2.000",
    ],
  ] as const)(
    "formats the %s catalog locale deterministically",
    (
      locale,
      dateTime,
      dateOnly,
      number,
      temperature,
      metres,
      kilometres,
      fourDigitNumber,
    ) => {
      expect(
        formatDateTime(
          "2026-07-17T08:00:00Z",
          locale,
          "Europe/Madrid",
        ),
      ).toBe(dateTime);
      expect(formatDateOnly("2026-07-15", locale)).toBe(dateOnly);
      expect(formatNumber(1234567.89, locale)).toBe(number);
      expect(formatCelsiusTemperature(33, locale)).toBe(temperature);
      expect(formatDistance(725, locale)).toBe(metres);
      expect(formatDistance(1200, locale)).toBe(kilometres);
      expect(formatNumber(2000, locale)).toBe(fourDigitNumber);
    },
  );

  it("fails closed for invalid dates, time zones, and nonfinite numbers", () => {
    expect(() =>
      formatDateTime("2026-02-30T08:00:00Z", "en", "Europe/Madrid"),
    ).toThrow(RangeError);
    expect(() =>
      formatDateTime("2026-07-17T08:00:00", "en", "Europe/Madrid"),
    ).toThrow(RangeError);
    expect(() =>
      formatDateTime("2026-07-17T08:00:00Z", "en", "Not/A_Zone"),
    ).toThrow(RangeError);
    expect(() => formatDateOnly("2026-02-30", "en")).toThrow(
      RangeError,
    );
    expect(() => formatNumber(Number.NaN, "en")).toThrow(RangeError);
    expect(() => formatCelsiusTemperature(Number.POSITIVE_INFINITY, "en")).toThrow(
      RangeError,
    );
    expect(() => formatDistance(Number.NEGATIVE_INFINITY, "en")).toThrow(
      RangeError,
    );
    expect(() => formatDistance(-1, "en")).toThrow(RangeError);
  });
});

describe("localized document contract", () => {
  it("synchronizes the exact English language, direction, title, and description", async () => {
    const runtime = await createI18nRuntime("en");
    const originalTitle = document.title;
    const originalLanguage = document.documentElement.lang;
    const originalDirection = document.documentElement.dir;
    const existingDescription = document.head.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    const originalDescription = existingDescription?.content;
    const description = existingDescription ?? document.createElement("meta");
    if (!existingDescription) {
      description.name = "description";
      document.head.append(description);
    }
    document.title = "Synthetic bootstrap title";
    description.content = "Synthetic bootstrap description";

    try {
      synchronizeDocumentLocalization(runtime);

      expect(document.documentElement.lang).toBe("en");
      expect(document.documentElement.dir).toBe("ltr");
      expect(document.title).toBe(ENGLISH_CATALOG["metadata.title"]);
      expect(description.content).toBe(
        ENGLISH_CATALOG["metadata.description"],
      );
      expect(document.title).toBe("HeatRelay · Barcelona pilot foundation");
      expect(description.content).toBe(
        "HeatRelay is a Barcelona-first project being built to turn heat warnings into safe next steps.",
      );
    } finally {
      document.title = originalTitle;
      document.documentElement.lang = originalLanguage;
      document.documentElement.dir = originalDirection;
      if (existingDescription) {
        existingDescription.content = originalDescription ?? "";
      } else {
        description.remove();
      }
    }
  });

  it.each([
    ["es", SPANISH_CATALOG],
    ["zh-CN", SIMPLIFIED_CHINESE_CATALOG],
    ["zh-TW", TRADITIONAL_CHINESE_CATALOG],
    ["hi", HINDI_CATALOG],
    ["pt-BR", BRAZILIAN_PORTUGUESE_CATALOG],
    ["bn", BENGALI_CATALOG],
    ["ru", RUSSIAN_CATALOG],
    ["ja", JAPANESE_CATALOG],
    ["fr", FRENCH_CATALOG],
    ["de", GERMAN_CATALOG],
    ["id", INDONESIAN_CATALOG],
    ["tr", TURKISH_CATALOG],
    ["ko", KOREAN_CATALOG],
    ["it", ITALIAN_CATALOG],
    ["uk", UKRAINIAN_CATALOG],
    ["pl", POLISH_CATALOG],
    ["vi", VIETNAMESE_CATALOG],
    ["th", THAI_CATALOG],
    ["sw", SWAHILI_CATALOG],
    ["nl", DUTCH_CATALOG],
  ] as const)(
    "synchronizes %s metadata and restores English metadata",
    async (locale, catalog) => {
      const runtime = await createI18nRuntime("en");
      const target = document.implementation.createHTMLDocument(
        "Synthetic title",
      );
      const description = target.createElement("meta");
      description.name = "description";
      target.head.append(description);

      await runtime.changeLanguage(locale);
      synchronizeDocumentLocalization(runtime, target);

      expect(target.documentElement.lang).toBe(locale);
      expect(target.documentElement.dir).toBe("ltr");
      expect(target.title).toBe(catalog["metadata.title"]);
      expect(description.content).toBe(catalog["metadata.description"]);

      await runtime.changeLanguage("en");
      synchronizeDocumentLocalization(runtime, target);

      expect(target.documentElement.lang).toBe("en");
      expect(target.documentElement.dir).toBe("ltr");
      expect(target.title).toBe(ENGLISH_CATALOG["metadata.title"]);
      expect(description.content).toBe(
        ENGLISH_CATALOG["metadata.description"],
      );
    },
  );

  it.each([
    ["ar", ARABIC_CATALOG],
    ["ur", URDU_CATALOG],
    ["fa", PERSIAN_CATALOG],
    ["he", HEBREW_CATALOG],
  ] as const)(
    "synchronizes the %s document RTL contract and restores English LTR",
    async (locale, catalog) => {
      const runtime = await createI18nRuntime("en");
      const target = document.implementation.createHTMLDocument(
        "Synthetic title",
      );
      const description = target.createElement("meta");
      description.name = "description";
      target.head.append(description);

      await runtime.changeLanguage(locale);
      synchronizeDocumentLocalization(runtime, target);

      expect(target.documentElement.lang).toBe(locale);
      expect(target.documentElement.dir).toBe("rtl");
      expect(target.title).toBe(catalog["metadata.title"]);
      expect(description.content).toBe(catalog["metadata.description"]);

      await runtime.changeLanguage("en");
      synchronizeDocumentLocalization(runtime, target);

      expect(target.documentElement.lang).toBe("en");
      expect(target.documentElement.dir).toBe("ltr");
      expect(target.title).toBe(ENGLISH_CATALOG["metadata.title"]);
      expect(description.content).toBe(
        ENGLISH_CATALOG["metadata.description"],
      );
    },
  );

  it("falls back to the registered English document contract", async () => {
    const runtime = await createI18nRuntime("en");
    await runtime.changeLanguage("unsupported");
    const target = document.implementation.createHTMLDocument("Synthetic title");
    const description = target.createElement("meta");
    description.name = "description";
    target.head.append(description);
    target.documentElement.lang = "synthetic";
    target.documentElement.dir = "rtl";

    synchronizeDocumentLocalization(runtime, target);

    expect(target.documentElement.lang).toBe("en");
    expect(target.documentElement.dir).toBe("ltr");
    expect(target.title).toBe(ENGLISH_CATALOG["metadata.title"]);
    expect(description.content).toBe(ENGLISH_CATALOG["metadata.description"]);
  });

  it("keeps the static English metadata fallback equal to the catalog", () => {
    const language = staticIndexHtml.match(/<html\s+lang="([^"]+)"/)?.[1];
    const title = staticIndexHtml.match(/<title>([^<]+)<\/title>/)?.[1];
    const description = staticIndexHtml.match(
      /<meta\s+name="description"\s+content="([^"]+)"\s*\/>/,
    )?.[1];

    expect(language).toBe("en");
    expect(title).toBe(ENGLISH_CATALOG["metadata.title"]);
    expect(description).toBe(ENGLISH_CATALOG["metadata.description"]);
  });
});
