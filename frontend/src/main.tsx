import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";

import App from "./App";
import { resolveInitialInterfaceLocale } from "./i18n/locale-registry";
import {
  createI18nRuntime,
  synchronizeDocumentLocalization,
} from "./i18n/runtime";
import "./styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("HeatRelay root element was not found.");
}
const applicationRoot = rootElement;

async function renderApplication(): Promise<void> {
  const i18n = await createI18nRuntime(resolveInitialInterfaceLocale());
  synchronizeDocumentLocalization(i18n);
  createRoot(applicationRoot).render(
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </StrictMode>,
  );
}

void renderApplication();
