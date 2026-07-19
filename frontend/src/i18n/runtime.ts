import { createInstance, type i18n, type Resource } from "i18next";
import { initReactI18next } from "react-i18next";

import {
  DEFAULT_INTERFACE_LOCALE,
  LOCALE_REGISTRY,
  SUPPORTED_INTERFACE_LOCALES,
  isInterfaceLocale,
  type InterfaceLocale,
} from "./locale-registry";

type DocumentLocalizationTarget = Pick<Document, "querySelector" | "title"> & {
  readonly documentElement: Pick<HTMLElement, "dir" | "lang">;
};

function bundledResources(): Resource {
  return Object.fromEntries(
    SUPPORTED_INTERFACE_LOCALES.map((locale) => [
      locale,
      { translation: LOCALE_REGISTRY[locale].catalog },
    ]),
  );
}

export async function createI18nRuntime(
  locale: InterfaceLocale = DEFAULT_INTERFACE_LOCALE,
): Promise<i18n> {
  const instance = createInstance();
  instance.use(initReactI18next);
  await instance.init({
    resources: bundledResources(),
    lng: locale,
    fallbackLng: DEFAULT_INTERFACE_LOCALE,
    supportedLngs: [...SUPPORTED_INTERFACE_LOCALES],
    defaultNS: "translation",
    ns: ["translation"],
    keySeparator: false,
    nsSeparator: false,
    load: "currentOnly",
    nonExplicitSupportedLngs: false,
    returnNull: false,
    returnEmptyString: false,
    returnObjects: false,
    saveMissing: false,
    updateMissing: false,
    initAsync: false,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
  return instance;
}

export function synchronizeDocumentLocalization(
  instance: i18n,
  targetDocument: DocumentLocalizationTarget = document,
): void {
  const locale = isInterfaceLocale(instance.resolvedLanguage)
    ? instance.resolvedLanguage
    : DEFAULT_INTERFACE_LOCALE;
  const definition = LOCALE_REGISTRY[locale];
  const translate = instance.getFixedT(locale);

  targetDocument.documentElement.lang = definition.code;
  targetDocument.documentElement.dir = definition.direction;
  targetDocument.title = translate("metadata.title");
  targetDocument
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", translate("metadata.description"));
}
