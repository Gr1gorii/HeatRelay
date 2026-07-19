import "i18next";

import type { ENGLISH_CATALOG } from "./catalogs/en";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    returnNull: false;
    returnEmptyString: false;
    returnObjects: false;
    keySeparator: false;
    nsSeparator: false;
    strictKeyChecks: true;
    resources: {
      translation: typeof ENGLISH_CATALOG;
    };
  }
}
