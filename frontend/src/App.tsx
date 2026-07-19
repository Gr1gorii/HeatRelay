import {
  ChangeEvent,
  FormEvent,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { I18nContext, useTranslation } from "react-i18next";

import {
  ActionPlanClientError,
  ActionPlanResponse,
  DetectedInputLanguage,
  NormalActionPlanResponse,
  PriorityCode,
  SelectedPlace,
  SITUATION_TEXT_LIMIT,
  UrgentActionPlanResponse,
  countCodePoints,
  createActionPlan,
} from "./action-plan";
import { type MessageKey } from "./i18n/catalogs/en";
import {
  formatCelsiusTemperature,
  formatDateOnly,
  formatDateTime,
  formatDistance,
  formatNumber,
} from "./i18n/formatters";
import {
  DEFAULT_INTERFACE_LOCALE,
  LOCALE_REGISTRY,
  SUPPORTED_INTERFACE_LOCALES,
  SUPPORTED_OUTPUT_LOCALES,
  getLocaleDefinition,
  isInterfaceLocale,
  isOutputLocale,
  persistInterfaceLocale,
  persistOutputLocale,
  resolveInitialOutputLocale,
  type InterfaceLocale,
  type OutputLocale,
} from "./i18n/locale-registry";
import { synchronizeDocumentLocalization } from "./i18n/runtime";
import {
  persistVisualMode,
  resolveInitialVisualMode,
  type VisualMode,
} from "./visual-mode";

const MADRID_TIME_ZONE = "Europe/Madrid";

const PRIORITY_LABEL_KEYS = {
  act_now: "priority.actNow",
  prepare_now: "priority.prepareNow",
  monitor_and_prepare: "priority.monitorAndPrepare",
} as const satisfies Record<PriorityCode, MessageKey>;

const FEATURE_LABEL_KEYS = {
  indoor_space: "feature.indoorSpace",
  potable_water: "feature.potableWater",
  toilets: "feature.toilets",
  micro_shelter: "feature.microShelter",
  pets_allowed: "feature.petsAllowed",
} as const satisfies Record<keyof SelectedPlace["features"], MessageKey>;

const FEATURE_CODE_ORDER = [
  "indoor_space",
  "potable_water",
  "toilets",
  "micro_shelter",
  "pets_allowed",
] as const satisfies ReadonlyArray<keyof SelectedPlace["features"]>;

type AccessibilityState = "confirmed" | "unavailable" | "unknown";

const ACCESSIBILITY_LABEL_KEYS = {
  confirmed: "place.accessibilityConfirmed",
  unavailable: "place.accessibilityUnavailable",
  unknown: "place.accessibilityUnknown",
} as const satisfies Record<AccessibilityState, MessageKey>;

type PhaseCode = keyof NormalActionPlanResponse["plan"] &
  ("now" | "next_few_hours" | "tonight");

const PHASE_LABEL_KEYS = {
  now: "result.phaseNow",
  next_few_hours: "result.phaseNextFewHours",
  tonight: "result.phaseTonight",
} as const satisfies Record<PhaseCode, MessageKey>;

const PHASE_IDS = {
  now: "phase-now",
  next_few_hours: "phase-next-few-hours",
  tonight: "phase-tonight",
} as const satisfies Record<PhaseCode, string>;

const LOCAL_PHRASE_LANGUAGE_KEYS = {
  ca: "result.localPhraseCatalan",
  es: "result.localPhraseSpanish",
} as const satisfies Record<
  NonNullable<NormalActionPlanResponse["plan"]["local_phrase"]>["language"],
  MessageKey
>;

type FieldErrorKind = "empty" | "over_limit" | "server_input";

const FIELD_ERROR_MESSAGE_KEYS = {
  empty: "validation.empty",
  over_limit: "validation.overLimit",
  server_input: "validation.serverInput",
} as const satisfies Record<FieldErrorKind, MessageKey>;

type UiErrorKind = "malformed_response" | "unavailable" | "connection";

type LanguageContextClassification =
  | "supported_mismatch"
  | "catalan_unavailable"
  | "other"
  | "unknown";

export function classifyLanguageContext(
  detectedInputLanguage: DetectedInputLanguage,
  displayedOutputLocale: OutputLocale,
): LanguageContextClassification | null {
  if (detectedInputLanguage === "unknown") {
    return "unknown";
  }
  if (detectedInputLanguage === "other") {
    return "other";
  }
  if (detectedInputLanguage === "ca") {
    return "catalan_unavailable";
  }
  if (detectedInputLanguage !== displayedOutputLocale) {
    return "supported_mismatch";
  }
  return null;
}

const LANGUAGE_CONTEXT_MESSAGE_KEYS = {
  supported_mismatch: "languageContext.supportedMismatch",
  catalan_unavailable: "languageContext.catalanUnavailable",
  other: "languageContext.other",
  unknown: "languageContext.unknown",
} as const satisfies Record<LanguageContextClassification, MessageKey>;

const UI_ERROR_MESSAGE_KEYS = {
  malformed_response: {
    title: "error.malformedTitle",
    message: "error.malformedMessage",
  },
  unavailable: {
    title: "error.unavailableTitle",
    message: "error.unavailableMessage",
  },
  connection: {
    title: "error.connectionTitle",
    message: "error.connectionMessage",
  },
} as const satisfies Record<
  UiErrorKind,
  Readonly<{ title: MessageKey; message: MessageKey }>
>;

function activeInterfaceLocale(language: string | undefined): InterfaceLocale {
  return isInterfaceLocale(language) ? language : DEFAULT_INTERFACE_LOCALE;
}

function formatAddress(place: SelectedPlace, unavailable: string): string {
  const street = [place.address.street, place.address.number]
    .filter(Boolean)
    .join(" ");
  const locality = [place.address.postal_code, place.address.city]
    .filter(Boolean)
    .join(" ");
  return [street, locality].filter(Boolean).join(", ") || unavailable;
}

function accessibilityState(value: boolean | null): AccessibilityState {
  if (value === true) {
    return "confirmed";
  }
  if (value === false) {
    return "unavailable";
  }
  return "unknown";
}

function RegisteredLanguageValue({ locale }: { locale: OutputLocale }) {
  const definition = LOCALE_REGISTRY[locale];
  return (
    <bdi lang={definition.code} dir={definition.direction}>
      {definition.nativeName}
    </bdi>
  );
}

function DescriptionLanguageValue({
  detectedInputLanguage,
}: {
  detectedInputLanguage: DetectedInputLanguage;
}) {
  const { t } = useTranslation();
  if (detectedInputLanguage === "ca") {
    return (
      <bdi lang="ca" dir="ltr">
        Català
      </bdi>
    );
  }
  if (detectedInputLanguage === "other") {
    return <span>{t("languageContext.otherValue")}</span>;
  }
  if (detectedInputLanguage === "unknown") {
    return <span>{t("languageContext.unknownValue")}</span>;
  }
  if (isOutputLocale(detectedInputLanguage)) {
    return <RegisteredLanguageValue locale={detectedInputLanguage} />;
  }
  return null;
}

function LanguageContextNotice({
  response,
  selectedOutputLocale,
  outputLanguageSelectRef,
  showChangeAction,
}: {
  response: ActionPlanResponse;
  selectedOutputLocale: OutputLocale;
  outputLanguageSelectRef: RefObject<HTMLSelectElement | null>;
  showChangeAction: boolean;
}) {
  const { t } = useTranslation();
  const classification = classifyLanguageContext(
    response.situation.detected_input_language,
    response.output_locale,
  );
  const nextPlanDiffers = selectedOutputLocale !== response.output_locale;
  if (classification === null && !nextPlanDiffers) {
    return null;
  }

  return (
    <section
      className="language-context-note"
      aria-labelledby="language-context-title"
    >
      <h3 id="language-context-title">{t("languageContext.title")}</h3>
      {classification ? (
        <p>{t(LANGUAGE_CONTEXT_MESSAGE_KEYS[classification])}</p>
      ) : null}
      {nextPlanDiffers ? <p>{t("languageContext.nextSelection")}</p> : null}
      <dl>
        {classification ? (
          <div>
            <dt>{t("languageContext.descriptionLanguage")}</dt>
            <dd>
              <DescriptionLanguageValue
                detectedInputLanguage={
                  response.situation.detected_input_language
                }
              />
            </dd>
          </div>
        ) : null}
        <div>
          <dt>{t("languageContext.displayedLanguage")}</dt>
          <dd>
            <RegisteredLanguageValue locale={response.output_locale} />
          </dd>
        </div>
        {nextPlanDiffers ? (
          <div>
            <dt>{t("languageContext.nextLanguage")}</dt>
            <dd>
              <RegisteredLanguageValue locale={selectedOutputLocale} />
            </dd>
          </div>
        ) : null}
      </dl>
      {showChangeAction ? (
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            outputLanguageSelectRef.current?.focus();
          }}
        >
          {t("languageContext.changeAction")}
        </button>
      ) : null}
    </section>
  );
}

function Phase({
  code,
  actions,
  outputLocale,
}: {
  code: PhaseCode;
  actions: NormalActionPlanResponse["plan"]["now"]["actions"];
  outputLocale: NormalActionPlanResponse["output_locale"];
}) {
  const { t } = useTranslation();
  const phaseId = PHASE_IDS[code];
  const outputDirection = getLocaleDefinition(outputLocale).direction;
  return (
    <section className="phase-card" aria-labelledby={phaseId}>
      <h3 id={phaseId}>{t(PHASE_LABEL_KEYS[code])}</h3>
      <ol className="action-list" lang={outputLocale} dir={outputDirection}>
        {actions.map((action) => (
          <li className="action-card" key={action.code}>
            <p className="action-text">{action.text}</p>
            <p>{action.explanation}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function PlaceCard({
  place,
  response,
}: {
  place: SelectedPlace;
  response: NormalActionPlanResponse;
}) {
  const { t, i18n } = useTranslation();
  const locale = activeInterfaceLocale(i18n.resolvedLanguage);
  const outputDirection = getLocaleDefinition(response.output_locale).direction;
  const verifiedFeatures = FEATURE_CODE_ORDER.filter(
    (feature) => place.features[feature] === true,
  );
  return (
    <section className="place-card" aria-labelledby="selected-place-title">
      <p className="card-label">{t("place.backendApprovedLabel")}</p>
      <h3 id="selected-place-title">
        <bdi dir="auto">{place.name}</bdi>
      </h3>
      <p className="place-address">
        <bdi dir="auto">
          {formatAddress(place, t("place.addressUnavailable"))}
        </bdi>
      </p>
      <dl className="place-details">
        <div>
          <dt>{t("place.distanceLabel")}</dt>
          <dd>
            <bdi dir="auto">
              {t("distance.straightLine", {
                distance: formatDistance(place.distance_m, locale),
              })}
            </bdi>
          </dd>
        </div>
        <div>
          <dt>{t("place.closesLabel")}</dt>
          <dd>
            <time dateTime={place.closes_at} dir="auto">
              {formatDateTime(place.closes_at, locale, MADRID_TIME_ZONE)}
            </time>
          </dd>
        </div>
        <div>
          <dt>{t("place.accessibilityLabel")}</dt>
          <dd>
            {t(ACCESSIBILITY_LABEL_KEYS[accessibilityState(place.accessibility)])}
          </dd>
        </div>
        <div>
          <dt>{t("place.lastCheckedLabel")}</dt>
          <dd>
            <time dateTime={place.last_checked} dir="auto">
              {formatDateOnly(place.last_checked, locale)}
            </time>
          </dd>
        </div>
      </dl>

      <div>
        <h4>{t("place.featuresTitle")}</h4>
        {verifiedFeatures.length > 0 ? (
          <ul className="feature-list">
            {verifiedFeatures.map((feature) => (
              <li key={feature}>{t(FEATURE_LABEL_KEYS[feature])}</li>
            ))}
          </ul>
        ) : (
          <p>{t("place.noFeatures")}</p>
        )}
      </div>

      <div
        className="result-actions"
        aria-label={t("place.linksAccessibleName")}
      >
        {place.information_url ? (
          <a
            className="text-link"
            href={place.information_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("place.informationLink")}
          </a>
        ) : null}
        <a
          className="text-link"
          href={place.source_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("place.sourceLink")}
        </a>
      </div>

      <p id="selected-place-cautions-label" className="card-label">
        {t("place.cautionsAccessibleName")}
      </p>
      <ul
        className="warning-list"
        aria-labelledby="selected-place-cautions-label"
        lang={response.output_locale}
        dir={outputDirection}
      >
        <li>{response.candidate_context.candidate_notice}</li>
        <li>{response.candidate_context.hours_warning}</li>
        <li>{response.candidate_context.distance_warning}</li>
        <li>{response.candidate_context.reachability_warning}</li>
      </ul>
    </section>
  );
}

function NormalResult({
  response,
  headingRef,
}: {
  response: NormalActionPlanResponse;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const { t, i18n } = useTranslation();
  const locale = activeInterfaceLocale(i18n.resolvedLanguage);
  const outputDirection = getLocaleDefinition(response.output_locale).direction;
  const priorityLabel = t(PRIORITY_LABEL_KEYS[response.priority.priority]);
  const notices = Array.from(
    new Set([response.weather.notice, response.plan.notice, ...response.notices]),
  );
  return (
    <section className="result-section" aria-labelledby="result-title">
      <header className="result-header">
        <div>
          <p className="eyebrow">{t("result.eyebrow")}</p>
          <h2 id="result-title" ref={headingRef} tabIndex={-1} className="result-focus">
            {priorityLabel}
          </h2>
        </div>
        <span className="priority-badge">
          {t("result.priorityBadge", { priority: priorityLabel })}
        </span>
      </header>

      <p className="evaluation-time">
        <time dateTime={response.evaluation_time} dir="auto">
          {t("result.evaluatedAt", {
            dateTime: formatDateTime(
              response.evaluation_time,
              locale,
              MADRID_TIME_ZONE,
            ),
          })}
        </time>
      </p>

      <dl
        className="summary-grid"
        aria-label={t("result.weatherSummaryAccessibleName")}
      >
        <div className="summary-card">
          <dt>{t("result.currentTemperature")}</dt>
          <dd>
            <strong dir="auto">
              {formatCelsiusTemperature(
                response.weather.current.temperature_c,
                locale,
              )}
            </strong>
          </dd>
        </div>
        <div className="summary-card">
          <dt>{t("result.feelsLike")}</dt>
          <dd>
            <strong dir="auto">
              {formatCelsiusTemperature(
                response.weather.current.apparent_temperature_c,
                locale,
              )}
            </strong>
          </dd>
        </div>
        <div className="summary-card">
          <dt>{t("result.todayMaximum")}</dt>
          <dd>
            <strong dir="auto">
              {formatCelsiusTemperature(
                response.weather.today.temperature_max_c,
                locale,
              )}
            </strong>
          </dd>
        </div>
      </dl>
      <p
        className="weather-boundary"
        lang={response.output_locale}
        dir={outputDirection}
      >
        {response.weather.notice}
      </p>

      <div className="phase-grid">
        <Phase
          code="now"
          actions={response.plan.now.actions}
          outputLocale={response.output_locale}
        />
        <Phase
          code="next_few_hours"
          actions={response.plan.next_few_hours.actions}
          outputLocale={response.output_locale}
        />
        <Phase
          code="tonight"
          actions={response.plan.tonight.actions}
          outputLocale={response.output_locale}
        />
      </div>

      {response.plan.bring_items.length > 0 ? (
        <section className="plan-detail" aria-labelledby="bring-title">
          <h3 id="bring-title">{t("result.bringItemsTitle")}</h3>
          <ul
            className="bring-list"
            lang={response.output_locale}
            dir={outputDirection}
          >
            {response.plan.bring_items.map((item) => (
              <li key={item.code}>{item.text}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="plan-detail" aria-labelledby="why-title">
        <h3 id="why-title">{t("result.explanationTitle")}</h3>
        <ul
          className="explanation-list"
          lang={response.output_locale}
          dir={outputDirection}
        >
          {response.plan.explanations.map((explanation) => (
            <li key={explanation.code}>{explanation.text}</li>
          ))}
        </ul>
      </section>

      {response.plan.local_phrase ? (
        <section className="local-phrase" aria-labelledby="phrase-title">
          <p className="card-label">
            {t(LOCAL_PHRASE_LANGUAGE_KEYS[response.plan.local_phrase.language])}
          </p>
          <h3 id="phrase-title">{t("result.localPhraseTitle")}</h3>
          <blockquote lang={response.plan.local_phrase.language} dir="ltr">
            {response.plan.local_phrase.text}
          </blockquote>
        </section>
      ) : null}

      {response.selected_place ? (
        <PlaceCard place={response.selected_place} response={response} />
      ) : (
        <section className="empty-place" aria-labelledby="empty-place-title">
          <h3 id="empty-place-title">{t("result.noPlaceTitle")}</h3>
          <p lang={response.output_locale} dir={outputDirection}>
            {response.candidate_context.explanation}
          </p>
          <p lang={response.output_locale} dir={outputDirection}>
            {response.candidate_context.candidate_notice}
          </p>
        </section>
      )}

      <section className="safety-notices" aria-labelledby="notices-title">
        <h3 id="notices-title">{t("result.noticesTitle")}</h3>
        <ul
          className="notice-list"
          lang={response.output_locale}
          dir={outputDirection}
        >
          {notices.map((notice, index) => (
            <li key={`notice-${index}`}>{notice}</li>
          ))}
        </ul>
      </section>
    </section>
  );
}

function UrgentResult({
  response,
  headingRef,
}: {
  response: UrgentActionPlanResponse;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const { t } = useTranslation();
  const outputDirection = getLocaleDefinition(response.output_locale).direction;
  return (
    <section
      className="result-section urgent-result"
      role="alert"
      aria-labelledby="urgent-result-title"
    >
      <p className="urgent-badge">{t("urgent.badge")}</p>
      <p className="eyebrow">{t("urgent.eyebrow")}</p>
      <h2
        id="urgent-result-title"
        ref={headingRef}
        tabIndex={-1}
        className="result-focus"
      >
        {t("urgent.title")}
      </h2>
      <p className="urgent-number">
        <span lang="ca" dir="ltr">
          {response.urgent_contact.service}
        </span>
        <bdi dir="ltr">
          <strong>{response.urgent_contact.number}</strong>
        </bdi>
      </p>
      <p
        className="urgent-instruction"
        lang={response.output_locale}
        dir={outputDirection}
      >
        {response.urgent_contact.instruction}
      </p>
      <ul
        className="urgent-actions"
        lang={response.output_locale}
        dir={outputDirection}
      >
        {response.actions.map((action) => (
          <li key={action.code}>{action.text}</li>
        ))}
      </ul>
      <ul
        className="notice-list"
        lang={response.output_locale}
        dir={outputDirection}
      >
        {response.notices.map((notice, index) => (
          <li key={`urgent-notice-${index}`}>{notice}</li>
        ))}
      </ul>
      <a
        className="text-link"
        href={response.urgent_contact.source_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t("urgent.sourceLink")}
      </a>
    </section>
  );
}

export default function App() {
  const { t, i18n: subscribedI18n } = useTranslation();
  const i18n = useContext(I18nContext).i18n ?? subscribedI18n;
  const locale = activeInterfaceLocale(i18n.resolvedLanguage);
  const interfaceDirection = LOCALE_REGISTRY[locale].direction;
  const [visualMode, setVisualMode] = useState<VisualMode>(
    resolveInitialVisualMode,
  );
  const [outputLocale, setOutputLocale] = useState<OutputLocale>(
    resolveInitialOutputLocale,
  );
  const [situationText, setSituationText] = useState("");
  const [fieldError, setFieldError] = useState<FieldErrorKind | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ActionPlanResponse | null>(null);
  const [error, setError] = useState<UiErrorKind | null>(null);
  const submissionInFlight = useRef(false);
  const situationTextareaRef = useRef<HTMLTextAreaElement>(null);
  const outputLanguageSelectRef = useRef<HTMLSelectElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (error) {
      errorHeadingRef.current?.focus();
    } else if (result) {
      resultHeadingRef.current?.focus();
    }
  }, [error, result]);

  useEffect(() => {
    if (fieldError) {
      situationTextareaRef.current?.focus();
    }
  }, [fieldError]);

  function showSituationError(kind: FieldErrorKind) {
    setFieldError(kind);
    situationTextareaRef.current?.focus();
  }

  function changeSituationText(value: string) {
    if (value === situationText) {
      return;
    }
    setSituationText(value);
    setFieldError(null);
    setError(null);
    setResult(null);
  }

  async function handleInterfaceLocaleChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    const selectedLocale = event.currentTarget.value;
    if (!isInterfaceLocale(selectedLocale)) {
      return;
    }

    const previousLocale = activeInterfaceLocale(i18n.resolvedLanguage);
    try {
      await i18n.changeLanguage(selectedLocale);
    } catch {
      if (i18n.resolvedLanguage !== previousLocale) {
        try {
          await i18n.changeLanguage(previousLocale);
        } catch {
          // The last confirmed locale remains the safe presentation fallback.
        }
      }
      synchronizeDocumentLocalization(i18n);
      return;
    }

    if (i18n.resolvedLanguage !== selectedLocale) {
      try {
        await i18n.changeLanguage(previousLocale);
      } catch {
        // The last confirmed locale remains the safe presentation fallback.
      }
      synchronizeDocumentLocalization(i18n);
      return;
    }

    synchronizeDocumentLocalization(i18n);
    persistInterfaceLocale(selectedLocale);
  }

  function handleOutputLocaleChange(event: ChangeEvent<HTMLSelectElement>) {
    const selectedLocale = event.currentTarget.value;
    if (
      isLoading ||
      !isOutputLocale(selectedLocale) ||
      selectedLocale === outputLocale
    ) {
      return;
    }

    setOutputLocale(selectedLocale);
    persistOutputLocale(selectedLocale);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionInFlight.current) {
      return;
    }
    const trimmedText = situationText.trim();
    const requestedOutputLocale = outputLocale;
    const length = countCodePoints(trimmedText);
    if (length === 0 || length > SITUATION_TEXT_LIMIT) {
      showSituationError(length === 0 ? "empty" : "over_limit");
      setResult(null);
      setError(null);
      return;
    }

    submissionInFlight.current = true;
    setFieldError(null);
    setResult(null);
    setError(null);
    setIsLoading(true);
    try {
      setResult(await createActionPlan(trimmedText, requestedOutputLocale));
    } catch (caught) {
      if (caught instanceof ActionPlanClientError) {
        if (caught.kind === "invalid_input") {
          showSituationError("server_input");
          setResult(null);
          setError(null);
        } else if (caught.kind === "malformed_response") {
          setError("malformed_response");
        } else {
          setError("unavailable");
        }
      } else {
        setError("connection");
      }
    } finally {
      submissionInFlight.current = false;
      setIsLoading(false);
    }
  }

  const characterCount = countCodePoints(situationText);
  const overLimitBy = Math.max(0, characterCount - SITUATION_TEXT_LIMIT);
  const isOverLimit = overLimitBy > 0;
  const formattedCharacterCount = formatNumber(characterCount, locale);
  const formattedCharacterLimit = formatNumber(SITUATION_TEXT_LIMIT, locale);
  const formattedOverLimitCount = formatNumber(overLimitBy, locale);

  return (
    <div id="top" className="app-shell" data-visual-mode={visualMode}>
      <a className="skip-link" href="#main-content">
        {t("navigation.skipToMain")}
      </a>

      <header className="site-header">
        <div className="page-width header-inner">
          <a
            className="brand"
            href="#top"
            aria-label={t("navigation.homeAccessibleName")}
          >
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
            </span>
            <span>{t("app.name")}</span>
          </a>
          <div className="header-actions">
            <nav aria-label={t("navigation.primaryAccessibleName")}>
              <a href="#plan">{t("navigation.createPlan")}</a>
              <a href="#trust">{t("navigation.safetyAndPrivacy")}</a>
            </nav>
            <div className="visual-mode-control">
              <label htmlFor="visual-mode-select">{t("visualMode.label")}</label>
              <select
                id="visual-mode-select"
                value={visualMode}
                aria-describedby="visual-mode-description"
                onChange={(event) => {
                  const selectedMode = event.currentTarget.value;
                  if (
                    selectedMode !== "standard" &&
                    selectedMode !== "enhanced"
                  ) {
                    return;
                  }
                  setVisualMode(selectedMode);
                  persistVisualMode(selectedMode);
                }}
              >
                <option value="standard">{t("visualMode.standard")}</option>
                <option value="enhanced">{t("visualMode.enhanced")}</option>
              </select>
              <p id="visual-mode-description">
                {t("visualMode.description")}
              </p>
            </div>
            <div className="interface-language-control">
              <label htmlFor="interface-language-select">
                {t("interfaceLanguage.label")}
              </label>
              <select
                id="interface-language-select"
                value={locale}
                aria-describedby="interface-language-description"
                onChange={(event) => {
                  void handleInterfaceLocaleChange(event);
                }}
              >
                {SUPPORTED_INTERFACE_LOCALES.map((localeCode) => {
                  const definition = LOCALE_REGISTRY[localeCode];
                  return (
                    <option
                      key={definition.code}
                      value={definition.code}
                      lang={definition.code}
                      dir={definition.direction}
                    >
                      {definition.nativeName}
                    </option>
                  );
                })}
              </select>
              <p id="interface-language-description">
                {t("interfaceLanguage.description")}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className="hero page-width" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">{t("hero.eyebrow")}</p>
            <h1 id="hero-title">{t("hero.title")}</h1>
            <p className="hero-intro">{t("hero.introduction")}</p>
            <a className="primary-link" href="#plan">
              {t("hero.action")}{" "}
              <span aria-hidden="true">
                {interfaceDirection === "rtl" ? "←" : "→"}
              </span>
            </a>
          </div>
          <aside className="status-card" aria-labelledby="status-title">
            <div className="status-card-top">
              <p className="status-kicker">{t("release.kicker")}</p>
              <span className="release-badge">{t("release.badge")}</span>
            </div>
            <h2 id="status-title">{t("release.title")}</h2>
            <p>{t("release.description")}</p>
            <dl className="status-list">
              <div>
                <dt>{t("release.actionPlanApiLabel")}</dt>
                <dd className="available">
                  {t("release.actionPlanApiValue")}
                </dd>
              </div>
              <div>
                <dt>{t("release.demoLocationLabel")}</dt>
                <dd>{t("release.demoLocationValue")}</dd>
              </div>
              <div>
                <dt>{t("release.browserLocationLabel")}</dt>
                <dd>{t("release.browserLocationValue")}</dd>
              </div>
            </dl>
          </aside>
        </section>

        <section id="plan" className="section page-width plan-section" aria-labelledby="plan-title">
          <div className="section-heading">
            <p className="eyebrow">{t("form.eyebrow")}</p>
            <h2 id="plan-title">{t("form.title")}</h2>
            <p>{t("form.introduction")}</p>
          </div>

          <div className="form-card">
            <div id="privacy-description" className="privacy-notice">
              <h3>{t("form.privacyTitle")}</h3>
              <p>{t("form.privacyDescription")}</p>
            </div>
            <p id="identity-warning" className="identity-warning">
              {t("form.identityWarning")}
            </p>

            <form
              className="plan-form"
              aria-labelledby="plan-title"
              aria-busy={isLoading}
              aria-describedby="privacy-description identity-warning boundary-note"
              onSubmit={handleSubmit}
            >
              <div className="output-language-control">
                <label htmlFor="output-language-select">
                  {t("outputLanguage.label")}
                </label>
                <select
                  ref={outputLanguageSelectRef}
                  id="output-language-select"
                  name="output_locale"
                  value={outputLocale}
                  dir={LOCALE_REGISTRY[outputLocale].direction}
                  disabled={isLoading}
                  aria-describedby="output-language-description"
                  onChange={handleOutputLocaleChange}
                >
                  {SUPPORTED_OUTPUT_LOCALES.map((localeCode) => {
                    const definition = LOCALE_REGISTRY[localeCode];
                    return (
                      <option
                        key={definition.code}
                        value={definition.code}
                        lang={definition.code}
                        dir={definition.direction}
                      >
                        {definition.nativeName}
                      </option>
                    );
                  })}
                </select>
                <p id="output-language-description">
                  {t("outputLanguage.description")}
                </p>
              </div>

              <div className="field-group">
                <div className="textarea-heading">
                  <label htmlFor="situation-text">
                    {t("form.situationLabel")}
                  </label>
                  <span
                    id="character-count"
                    className="character-count"
                    dir="auto"
                    data-over-limit={isOverLimit}
                  >
                    {isOverLimit
                      ? t("form.characterCountOverLimit", {
                          currentCount: formattedCharacterCount,
                          limit: formattedCharacterLimit,
                          overLimitCount: formattedOverLimitCount,
                        })
                      : t("form.characterCount", {
                          currentCount: formattedCharacterCount,
                          limit: formattedCharacterLimit,
                        })}
                  </span>
                </div>
                <textarea
                  ref={situationTextareaRef}
                  id="situation-text"
                  name="situation_text"
                  dir="auto"
                  rows={7}
                  value={situationText}
                  disabled={isLoading}
                  aria-describedby={`privacy-description identity-warning situation-hint character-count boundary-note${fieldError ? " situation-error" : ""}`}
                  aria-invalid={fieldError || isOverLimit ? "true" : undefined}
                  aria-errormessage={fieldError ? "situation-error" : undefined}
                  onChange={(event) => {
                    changeSituationText(event.target.value);
                  }}
                />
                <p id="situation-hint" className="field-hint">
                  {t("form.situationHint", { limit: formattedCharacterLimit })}
                </p>
                {fieldError ? (
                  <p id="situation-error" className="field-error">
                    {fieldError === "over_limit"
                      ? t(FIELD_ERROR_MESSAGE_KEYS[fieldError], {
                          limit: formattedCharacterLimit,
                        })
                      : t(FIELD_ERROR_MESSAGE_KEYS[fieldError])}
                  </p>
                ) : null}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  disabled={isLoading}
                  onClick={() => {
                    changeSituationText(t("form.demoText"));
                  }}
                >
                  {t("form.demoButton")}
                </button>
                <button type="submit" className="primary-button" disabled={isLoading}>
                  {isLoading
                    ? t("form.submittingButton")
                    : t("form.submitButton")}
                </button>
              </div>

              <p id="boundary-note" className="boundary-note">
                {t("form.boundaryNote")}
              </p>
            </form>
          </div>

          <p
            className="status-region"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {isLoading
              ? t("status.creating")
              : result
                ? t("status.ready")
                : ""}
          </p>
          {isLoading ? (
            <div className="loading-state" aria-hidden="true">
              <span />
              <p>{t("status.loadingDetail")}</p>
            </div>
          ) : null}

          {error ? (
            <section className="error-panel" role="alert" aria-labelledby="error-title">
              <h2 id="error-title" ref={errorHeadingRef} tabIndex={-1} className="result-focus">
                {t(UI_ERROR_MESSAGE_KEYS[error].title)}
              </h2>
              <p>{t(UI_ERROR_MESSAGE_KEYS[error].message)}</p>
            </section>
          ) : null}

          {result?.branch === "normal" ? (
            <>
              <NormalResult response={result} headingRef={resultHeadingRef} />
              <LanguageContextNotice
                response={result}
                selectedOutputLocale={outputLocale}
                outputLanguageSelectRef={outputLanguageSelectRef}
                showChangeAction
              />
            </>
          ) : null}
          {result?.branch === "urgent" ? (
            <>
              <UrgentResult response={result} headingRef={resultHeadingRef} />
              <LanguageContextNotice
                response={result}
                selectedOutputLocale={outputLocale}
                outputLanguageSelectRef={outputLanguageSelectRef}
                showChangeAction={false}
              />
            </>
          ) : null}
        </section>

        <section id="trust" className="section page-width trust-section" aria-labelledby="trust-title">
          <div className="section-heading">
            <p className="eyebrow">{t("trust.eyebrow")}</p>
            <h2 id="trust-title">{t("trust.title")}</h2>
          </div>
          <div className="trust-grid">
            <article className="trust-card safety-card">
              <p className="card-label">{t("trust.safetyLabel")}</p>
              <h3>{t("trust.safetyTitle")}</h3>
              <p>{t("trust.safetyDescription")}</p>
            </article>
            <article className="trust-card privacy-card">
              <p className="card-label">{t("trust.privacyLabel")}</p>
              <h3>{t("trust.privacyTitle")}</h3>
              <p>{t("trust.privacyDescription")}</p>
            </article>
          </div>
        </section>
      </main>

      <footer>
        <div className="page-width footer-inner">
          <a className="brand footer-brand" href="#top">
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
            </span>
            <span>{t("app.name")}</span>
          </a>
          <p>{t("footer.description")}</p>
        </div>
      </footer>
    </div>
  );
}
