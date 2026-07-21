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
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { DropIcon } from "@phosphor-icons/react/dist/csr/Drop";
import { FanIcon } from "@phosphor-icons/react/dist/csr/Fan";
import { GlobeIcon } from "@phosphor-icons/react/dist/csr/Globe";
import { HouseLineIcon } from "@phosphor-icons/react/dist/csr/HouseLine";
import { MapPinIcon } from "@phosphor-icons/react/dist/csr/MapPin";
import { PersonSimpleWalkIcon } from "@phosphor-icons/react/dist/csr/PersonSimpleWalk";
import { PintGlassIcon } from "@phosphor-icons/react/dist/csr/PintGlass";
import { PhoneCallIcon } from "@phosphor-icons/react/dist/csr/PhoneCall";
import { TextAaIcon } from "@phosphor-icons/react/dist/csr/TextAa";
import { ThermometerSimpleIcon } from "@phosphor-icons/react/dist/csr/ThermometerSimple";
import { ToiletIcon } from "@phosphor-icons/react/dist/csr/Toilet";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { WheelchairIcon } from "@phosphor-icons/react/dist/csr/Wheelchair";

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
import heatRelayMark from "./assets/heatrelay-mark.png";
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
  getLocaleDefinition,
  isInterfaceLocale,
  isOutputLocale,
  persistUnifiedLocale,
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
const MOBILE_SETTINGS_BREAKPOINT = 900;

type AssistanceScenario = "self" | "someone" | "place";

const SCENARIO_CONTENT = {
  self: {
    title: "scenario.selfTitle",
    description: "scenario.selfDescription",
    Icon: ThermometerSimpleIcon,
  },
  someone: {
    title: "scenario.someoneTitle",
    description: "scenario.someoneDescription",
    Icon: UsersIcon,
  },
  place: {
    title: "scenario.placeTitle",
    description: "scenario.placeDescription",
    Icon: MapPinIcon,
  },
} as const satisfies Record<
  AssistanceScenario,
  Readonly<{ title: MessageKey; description: MessageKey; Icon: typeof UserIcon }>
>;

const SCENARIO_ORDER = [
  "self",
  "someone",
  "place",
] as const satisfies ReadonlyArray<AssistanceScenario>;

const PRIORITY_LABEL_KEYS = {
  act_now: "priority.actNow",
  prepare_now: "priority.prepareNow",
  monitor_and_prepare: "priority.monitorAndPrepare",
} as const satisfies Record<PriorityCode, MessageKey>;

const PRIORITY_TEMPERATURE_STATES = {
  act_now: "dangerous",
  prepare_now: "caution",
  monitor_and_prepare: "verified",
} as const satisfies Record<PriorityCode, "verified" | "caution" | "dangerous">;

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

const FEATURE_ICONS = {
  indoor_space: HouseLineIcon,
  potable_water: DropIcon,
  toilets: ToiletIcon,
  micro_shelter: HouseLineIcon,
  pets_allowed: UserIcon,
} as const satisfies Record<
  keyof SelectedPlace["features"],
  typeof UserIcon
>;

type FactState = "confirmed" | "unavailable" | "unknown";

const FEATURE_STATE_LABEL_KEYS = {
  confirmed: "feature.confirmed",
  unavailable: "feature.unavailable",
  unknown: "feature.unknown",
} as const satisfies Record<FactState, MessageKey>;

const ACCESSIBILITY_LABEL_KEYS = {
  confirmed: "place.accessibilityConfirmed",
  unavailable: "place.accessibilityUnavailable",
  unknown: "place.accessibilityUnknown",
} as const satisfies Record<FactState, MessageKey>;

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

const INITIAL_SAFETY_STEPS = [
  {
    key: "water",
    label: "feature.potableWater",
    Icon: PintGlassIcon,
  },
  {
    key: "cool-space",
    label: "scenario.placeTitle",
    Icon: FanIcon,
  },
] as const satisfies ReadonlyArray<{
  key: string;
  label: MessageKey;
  Icon: typeof UserIcon;
}>;

function actionIconForCode(code: string): typeof UserIcon {
  if (code.includes("water") || code.includes("drink")) {
    return PintGlassIcon;
  }
  if (
    code.includes("cool") ||
    code.includes("heat") ||
    code.includes("shade")
  ) {
    return FanIcon;
  }
  if (code.includes("contact") || code.includes("call")) {
    return PhoneCallIcon;
  }
  if (code.includes("travel") || code.includes("place")) {
    return MapPinIcon;
  }
  if (code.includes("remain") || code.includes("home")) {
    return HouseLineIcon;
  }
  return PersonSimpleWalkIcon;
}

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

type LanguageContextClassification =
  | "supported_mismatch"
  | "catalan_unavailable"
  | "other"
  | "unknown";

const LANGUAGE_CONTEXT_MESSAGE_KEYS = {
  supported_mismatch: "languageContext.supportedMismatch",
  catalan_unavailable: "languageContext.catalanUnavailable",
  other: "languageContext.other",
  unknown: "languageContext.unknown",
} as const satisfies Record<LanguageContextClassification, MessageKey>;

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

function activeInterfaceLocale(language: string | undefined): InterfaceLocale {
  return isInterfaceLocale(language) ? language : DEFAULT_INTERFACE_LOCALE;
}

function factState(value: boolean | null): FactState {
  if (value === true) {
    return "confirmed";
  }
  if (value === false) {
    return "unavailable";
  }
  return "unknown";
}

function verifiedAddress(place: SelectedPlace): string | null {
  const street = [place.address.street, place.address.number]
    .filter(Boolean)
    .join(" ");
  const locality = [place.address.postal_code, place.address.city]
    .filter(Boolean)
    .join(" ");
  const address = [street, locality].filter(Boolean).join(", ");
  return address.length > 0 ? address : null;
}

function formatAddress(place: SelectedPlace, unavailable: string): string {
  return verifiedAddress(place) ?? unavailable;
}

function HeatRelayBrand({ footer = false }: { footer?: boolean }) {
  const { t } = useTranslation();
  return (
    <a
      className={footer ? "brand footer-brand" : "brand"}
      href="#top"
      aria-label={footer ? undefined : t("navigation.homeAccessibleName")}
    >
      <img src={heatRelayMark} alt="" width="56" height="56" />
      <span>{t("app.name")}</span>
    </a>
  );
}

function LanguageControl({
  value,
  disabled = false,
  selectRef,
  onChange,
}: {
  value: InterfaceLocale;
  disabled?: boolean;
  selectRef?: RefObject<HTMLSelectElement | null>;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="settings-control language-control">
      <label htmlFor="language-select">{t("interfaceLanguage.label")}</label>
      <div className="settings-select-wrap">
        <GlobeIcon aria-hidden="true" size={22} weight="bold" />
        <select
          ref={selectRef}
          id="language-select"
          value={value}
          dir={LOCALE_REGISTRY[value].direction}
          disabled={disabled}
          aria-describedby="language-description"
          onChange={onChange}
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
      </div>
      <p id="language-description">
        {t("interfaceLanguage.description")}
      </p>
    </div>
  );
}

function VisualModeControl({
  value,
  onChange,
}: {
  value: VisualMode;
  onChange: (mode: VisualMode) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="settings-control visual-mode-control">
      <label htmlFor="visual-mode-select">{t("visualMode.label")}</label>
      <div className="settings-select-wrap">
        <TextAaIcon aria-hidden="true" size={22} weight="bold" />
        <select
          id="visual-mode-select"
          value={value}
          aria-describedby="visual-mode-description"
          onChange={(event) => {
            const selectedMode = event.currentTarget.value;
            if (
              selectedMode === "standard" ||
              selectedMode === "enhanced" ||
              selectedMode === "high-contrast"
            ) {
              onChange(selectedMode);
            }
          }}
        >
          <option value="standard">{t("visualMode.standard")}</option>
          <option value="enhanced">{t("visualMode.enhanced")}</option>
          <option value="high-contrast">
            {t("visualMode.highContrast")}
          </option>
        </select>
      </div>
      <p id="visual-mode-description">{t("visualMode.description")}</p>
    </div>
  );
}

function HeaderSettings({
  isOpen,
  setIsOpen,
  locale,
  visualMode,
  isLoading,
  languageSelectRef,
  onLocaleChange,
  onVisualModeChange,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  locale: InterfaceLocale;
  visualMode: VisualMode;
  isLoading: boolean;
  languageSelectRef: RefObject<HTMLSelectElement | null>;
  onLocaleChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onVisualModeChange: (mode: VisualMode) => void;
}) {
  const { t } = useTranslation();
  return (
    <details
      className="header-settings"
      open={isOpen}
      onToggle={(event) => {
        setIsOpen(event.currentTarget.open);
      }}
    >
      <summary>{t("header.settings")}</summary>
      <div className="header-settings-grid">
        <LanguageControl
          value={locale}
          disabled={isLoading}
          selectRef={languageSelectRef}
          onChange={onLocaleChange}
        />
        <VisualModeControl
          value={visualMode}
          onChange={onVisualModeChange}
        />
      </div>
    </details>
  );
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
  selectedLocale,
  onRequestLanguageFocus,
  showChangeAction,
}: {
  response: ActionPlanResponse;
  selectedLocale: OutputLocale;
  onRequestLanguageFocus: () => void;
  showChangeAction: boolean;
}) {
  const { t } = useTranslation();
  const classification = classifyLanguageContext(
    response.situation.detected_input_language,
    response.output_locale,
  );
  const nextPlanDiffers = selectedLocale !== response.output_locale;
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
              <RegisteredLanguageValue locale={selectedLocale} />
            </dd>
          </div>
        ) : null}
      </dl>
      {showChangeAction ? (
        <button
          type="button"
          className="secondary-button"
          onClick={onRequestLanguageFocus}
        >
          {t("languageContext.changeAction")}
        </button>
      ) : null}
    </section>
  );
}

function TemperatureStatus({
  response,
  locale,
  headingRef,
}: {
  response: NormalActionPlanResponse;
  locale: InterfaceLocale;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const { t } = useTranslation();
  const status = PRIORITY_TEMPERATURE_STATES[response.priority.priority];
  const statusLabel = t(PRIORITY_LABEL_KEYS[response.priority.priority]);
  const outputDirection = getLocaleDefinition(response.output_locale).direction;
  return (
    <section
      className="temperature-status"
      data-temperature-status={status}
      aria-labelledby="result-title"
    >
      <dl
        className="summary-grid"
        aria-label={t("result.weatherSummaryAccessibleName")}
      >
        <div className="summary-card temperature-current">
          <dt>
            <ThermometerSimpleIcon
              aria-hidden="true"
              size={56}
              weight="regular"
            />
            <span>{t("result.currentTemperature")}</span>
          </dt>
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
      <div className="temperature-status-heading">
        <h2
          className="temperature-status-label result-focus"
          id="result-title"
          ref={headingRef}
          tabIndex={-1}
        >
          {statusLabel}
        </h2>
        <span className="temperature-priority-copy">
          {t("result.priorityBadge", { priority: statusLabel })}
        </span>
      </div>
      <details className="weather-details">
        <summary>{t("result.weatherSummaryAccessibleName")}</summary>
        <p
          className="weather-boundary"
          lang={response.output_locale}
          dir={outputDirection}
        >
          {response.weather.notice}
        </p>
      </details>
    </section>
  );
}

function PhaseCard({
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
        {actions.map((action) => {
          const ActionIcon = actionIconForCode(action.code);
          return (
            <li className="action-card" key={action.code}>
              <span className="action-icon" aria-hidden="true">
                <ActionIcon size={32} weight="regular" />
              </span>
              <div className="action-copy">
                <p className="action-text">{action.text}</p>
                <p>{action.explanation}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function InitialSafetyPreview() {
  const { t } = useTranslation();
  return (
    <section className="important-now important-now-preview">
      <h2 className="dashboard-subheading">{t("scenario.importantNow")}</h2>
      <ol className="action-list">
        {INITIAL_SAFETY_STEPS.map(({ key, label, Icon }) => (
          <li className="action-card" key={key}>
            <span className="action-icon" aria-hidden="true">
              <Icon size={32} weight="regular" />
            </span>
            <p className="action-text">{t(label)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function FeatureList({ features }: { features: SelectedPlace["features"] }) {
  const { t } = useTranslation();
  return (
    <ul className="feature-list">
      {FEATURE_CODE_ORDER.map((feature) => {
        const state = factState(features[feature]);
        const FeatureIcon = FEATURE_ICONS[feature];
        return (
          <li key={feature} data-fact-state={state}>
            <span>
              <FeatureIcon aria-hidden="true" size={24} weight="regular" />
              {t(FEATURE_LABEL_KEYS[feature])}
            </span>
            <strong>{t(FEATURE_STATE_LABEL_KEYS[state])}</strong>
          </li>
        );
      })}
    </ul>
  );
}

function ExternalMapLink({ address }: { address: string | null }) {
  const { t } = useTranslation();
  if (!address) {
    return null;
  }
  const href =
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent(address);
  return (
    <a
      className="map-link"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <ArrowSquareOutIcon aria-hidden="true" size={24} weight="bold" />
      {t("place.mapLink")}
    </a>
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
  const address = verifiedAddress(place);
  return (
    <section className="place-card" aria-labelledby="selected-place-title">
      <p className="card-label">{t("place.backendApprovedLabel")}</p>
      <h3 id="selected-place-title">
        <bdi dir="auto">{place.name}</bdi>
      </h3>
      <p className="place-address">
        <MapPinIcon aria-hidden="true" size={22} weight="fill" />
        <bdi dir="auto">
          {formatAddress(place, t("place.addressUnavailable"))}
        </bdi>
      </p>
      <dl className="place-details">
        <div>
          <dt>
            <PersonSimpleWalkIcon aria-hidden="true" size={22} />
            {t("place.distanceLabel")}
          </dt>
          <dd>
            <bdi dir="auto">
              {t("distance.straightLine", {
                distance: formatDistance(place.distance_m, locale),
              })}
            </bdi>
          </dd>
        </div>
        <div>
          <dt>
            <ClockIcon aria-hidden="true" size={22} />
            {t("place.closesLabel")}
          </dt>
          <dd>
            <time dateTime={place.closes_at} dir="auto">
              {formatDateTime(place.closes_at, locale, MADRID_TIME_ZONE)}
            </time>
          </dd>
        </div>
        <div>
          <dt>
            <WheelchairIcon aria-hidden="true" size={22} />
            {t("place.accessibilityLabel")}
          </dt>
          <dd>{t(ACCESSIBILITY_LABEL_KEYS[factState(place.accessibility)])}</dd>
        </div>
      </dl>

      <div className="feature-group">
        <h4>{t("place.featuresTitle")}</h4>
        <FeatureList features={place.features} />
      </div>

      <ExternalMapLink address={address} />

      <details className="place-verification-details">
        <summary>
          <span id="selected-place-cautions-label">
            {t("place.cautionsAccessibleName")}
          </span>
        </summary>
        <p className="place-last-checked">
          <ClockIcon aria-hidden="true" size={20} />
          <span>{t("place.lastCheckedLabel")}</span>{" "}
          <time dateTime={place.last_checked} dir="auto">
            {formatDateOnly(place.last_checked, locale)}
          </time>
        </p>
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
      </details>
    </section>
  );
}

function StatusBanner({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="status-banner" aria-labelledby="status-banner-title">
      <h3 id="status-banner-title">{title}</h3>
      {children}
    </section>
  );
}

function NormalResult({
  response,
  headingRef,
  children,
}: {
  response: NormalActionPlanResponse;
  headingRef: RefObject<HTMLHeadingElement | null>;
  children: React.ReactNode;
}) {
  const { t, i18n } = useTranslation();
  const locale = activeInterfaceLocale(i18n.resolvedLanguage);
  const outputDirection = getLocaleDefinition(response.output_locale).direction;
  const notices = Array.from(
    new Set([response.weather.notice, response.plan.notice, ...response.notices]),
  );
  return (
    <section className="result-section" aria-labelledby="result-title">
      <TemperatureStatus
        response={response}
        locale={locale}
        headingRef={headingRef}
      />

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

      {children}

      <div className="result-details">
        <div className="plan-column">
          <div className="phase-grid phase-grid-later">
            <PhaseCard
              code="next_few_hours"
              actions={response.plan.next_few_hours.actions}
              outputLocale={response.output_locale}
            />
            <PhaseCard
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
                {t(
                  LOCAL_PHRASE_LANGUAGE_KEYS[
                    response.plan.local_phrase.language
                  ],
                )}
              </p>
              <h3 id="phrase-title">{t("result.localPhraseTitle")}</h3>
              <blockquote
                lang={response.plan.local_phrase.language}
                dir="ltr"
              >
                {response.plan.local_phrase.text}
              </blockquote>
            </section>
          ) : null}
        </div>
      </div>

      <StatusBanner title={t("result.noticesTitle")}>
        <ul
          className="notice-list"
          lang={response.output_locale}
          dir={outputDirection}
        >
          {notices.map((notice, index) => (
            <li key={`notice-${index}`}>{notice}</li>
          ))}
        </ul>
      </StatusBanner>
    </section>
  );
}

function EmergencyResult({
  response,
  headingRef,
}: {
  response: UrgentActionPlanResponse;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const { t } = useTranslation();
  const outputDirection = getLocaleDefinition(response.output_locale).direction;
  const telephoneNumber = response.urgent_contact.number.replace(/[^+\d]/g, "");
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
        <PhoneCallIcon aria-hidden="true" size={34} weight="fill" />
        <span lang="ca" dir="ltr">
          {response.urgent_contact.service}
        </span>
        <a href={`tel:${telephoneNumber}`}>
          <bdi dir="ltr">
            <strong>{response.urgent_contact.number}</strong>
          </bdi>
        </a>
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

function LoadingState() {
  const { t } = useTranslation();
  return (
    <div className="loading-state" aria-hidden="true">
      <span />
      <p>{t("status.loadingDetail")}</p>
    </div>
  );
}

function ErrorPanel({
  error,
  headingRef,
}: {
  error: UiErrorKind;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const { t } = useTranslation();
  return (
    <section className="error-panel" role="alert" aria-labelledby="error-title">
      <h2
        id="error-title"
        ref={headingRef}
        tabIndex={-1}
        className="result-focus"
      >
        {t(UI_ERROR_MESSAGE_KEYS[error].title)}
      </h2>
      <p>{t(UI_ERROR_MESSAGE_KEYS[error].message)}</p>
    </section>
  );
}

function SituationForm({
  situationText,
  fieldError,
  isLoading,
  textareaRef,
  locale,
  onTextChange,
  onSubmit,
}: {
  situationText: string;
  fieldError: FieldErrorKind | null;
  isLoading: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  locale: InterfaceLocale;
  onTextChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const { t } = useTranslation();
  const characterCount = countCodePoints(situationText.trim());
  const overLimitBy = Math.max(0, characterCount - SITUATION_TEXT_LIMIT);
  const isOverLimit = overLimitBy > 0;
  const formattedCharacterCount = formatNumber(characterCount, locale);
  const formattedCharacterLimit = formatNumber(SITUATION_TEXT_LIMIT, locale);
  const formattedOverLimitCount = formatNumber(overLimitBy, locale);

  return (
    <div id="scenario-form" className="form-card">
      <form
        className="plan-form"
        aria-labelledby="plan-title"
        aria-busy={isLoading}
        onSubmit={onSubmit}
      >
        <div className="field-group">
          <div className="textarea-heading">
            <label htmlFor="situation-text">{t("form.situationLabel")}</label>
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
            ref={textareaRef}
            id="situation-text"
            name="situation_text"
            dir="auto"
            rows={1}
            value={situationText}
            disabled={isLoading}
            placeholder={t("form.demoText")}
            aria-describedby={`situation-hint character-count identity-warning${fieldError ? " situation-error" : ""}`}
            aria-invalid={fieldError || isOverLimit ? "true" : undefined}
            aria-errormessage={fieldError ? "situation-error" : undefined}
            onChange={(event) => {
              onTextChange(event.target.value);
            }}
          />
          {fieldError ? (
            <p id="situation-error" className="field-error">
              {fieldError === "over_limit"
                ? t(FIELD_ERROR_MESSAGE_KEYS[fieldError], {
                    limit: formattedCharacterLimit,
                  })
                : t(FIELD_ERROR_MESSAGE_KEYS[fieldError])}
            </p>
          ) : null}
          <p id="situation-hint" className="field-hint">
            {t("form.situationHint", { limit: formattedCharacterLimit })}
          </p>
        </div>

        <div className="permanent-form-guidance">
          <p id="identity-warning" className="identity-warning">
            {t("form.identityWarning")}
          </p>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="primary-button"
            disabled={isLoading}
          >
            <span>
              {isLoading ? t("form.submittingButton") : t("form.submitButton")}
            </span>
            <ArrowRightIcon aria-hidden="true" size={24} weight="bold" />
          </button>
        </div>

        <details className="form-disclosure">
          <summary>{t("form.privacyTitle")}</summary>
          <div id="privacy-description" className="privacy-notice">
            <p>{t("form.privacyDescription")}</p>
          </div>
          <p id="boundary-note" className="boundary-note">
            {t("form.boundaryNote")}
          </p>
          <button
            type="button"
            className="secondary-button demo-button"
            disabled={isLoading}
            onClick={() => {
              onTextChange(t("form.demoText"));
            }}
          >
            {t("form.demoButton")}
          </button>
        </details>
      </form>
    </div>
  );
}

function ScenarioDashboard({
  response,
  activeScenario,
  situationText,
  fieldError,
  isLoading,
  textareaRef,
  locale,
  onTextChange,
  onScenarioChange,
  onSubmit,
}: {
  response?: NormalActionPlanResponse;
  activeScenario: AssistanceScenario;
  situationText: string;
  fieldError: FieldErrorKind | null;
  isLoading: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  locale: InterfaceLocale;
  onTextChange: (value: string) => void;
  onScenarioChange: (scenario: AssistanceScenario) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const { t } = useTranslation();
  const outputDirection = response
    ? getLocaleDefinition(response.output_locale).direction
    : "ltr";

  return (
    <div className="support-dashboard">
      <section className="situation-pane" aria-label={t("scenario.heading")}>
        <div className="scenario-list">
          {SCENARIO_ORDER.map((scenario) => {
            const content = SCENARIO_CONTENT[scenario];
            const active = scenario === activeScenario;
            const ScenarioIcon = content.Icon;
            return (
              <section
                className="scenario-option"
                data-active={active}
                key={scenario}
              >
                <button
                  type="button"
                  className="scenario-example"
                  aria-expanded={active}
                  aria-controls="scenario-form"
                  disabled={isLoading}
                  onClick={() => {
                    onScenarioChange(scenario);
                  }}
                >
                  <ScenarioIcon aria-hidden="true" size={38} weight="regular" />
                  <span className="scenario-copy">
                    <strong>{t(content.title)}</strong>
                    <span>{t(content.description)}</span>
                  </span>
                </button>

                {active ? (
                  <SituationForm
                    situationText={situationText}
                    fieldError={fieldError}
                    isLoading={isLoading}
                    textareaRef={textareaRef}
                    locale={locale}
                    onTextChange={onTextChange}
                    onSubmit={onSubmit}
                  />
                ) : null}
              </section>
            );
          })}
        </div>

        {response ? (
          <div className="important-now">
            <p className="dashboard-subheading">{t("scenario.importantNow")}</p>
            <PhaseCard
              code="now"
              actions={response.plan.now.actions}
              outputLocale={response.output_locale}
            />
          </div>
        ) : (
          <InitialSafetyPreview />
        )}
      </section>

      <aside className="place-pane" aria-labelledby="nearest-help-title">
        <div className="place-pane-heading">
          <h2 id="nearest-help-title">{t("scenario.nearestHelp")}</h2>
          <p>
            <MapPinIcon aria-hidden="true" size={22} weight="fill" />
            <bdi dir="auto">Barcelona</bdi>
          </p>
        </div>
        {response?.selected_place ? (
          <PlaceCard place={response.selected_place} response={response} />
        ) : response ? (
          <section className="empty-place" aria-labelledby="empty-place-title">
            <h3 id="empty-place-title">{t("result.noPlaceTitle")}</h3>
            <p lang={response.output_locale} dir={outputDirection}>
              {response.candidate_context.explanation}
            </p>
            <p lang={response.output_locale} dir={outputDirection}>
              {response.candidate_context.candidate_notice}
            </p>
          </section>
        ) : (
          <section className="pending-place" aria-labelledby="pending-place-title">
            <MapPinIcon aria-hidden="true" size={42} weight="regular" />
            <h3 id="pending-place-title">{t("form.submitButton")}</h3>
            <p>{t("form.introduction")}</p>
          </section>
        )}
      </aside>
    </div>
  );
}

export default function App() {
  const { t, i18n: subscribedI18n } = useTranslation();
  const i18n = useContext(I18nContext).i18n ?? subscribedI18n;
  const locale = activeInterfaceLocale(i18n.resolvedLanguage);
  const [visualMode, setVisualMode] = useState<VisualMode>(
    resolveInitialVisualMode,
  );
  const [settingsOpen, setSettingsOpen] = useState(
    () =>
      typeof window === "undefined" ||
      window.innerWidth > MOBILE_SETTINGS_BREAKPOINT,
  );
  const [situationText, setSituationText] = useState("");
  const [activeScenario, setActiveScenario] =
    useState<AssistanceScenario>("self");
  const [fieldError, setFieldError] = useState<FieldErrorKind | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ActionPlanResponse | null>(null);
  const [error, setError] = useState<UiErrorKind | null>(null);
  const submissionInFlight = useRef(false);
  const situationTextareaRef = useRef<HTMLTextAreaElement>(null);
  const languageSelectRef = useRef<HTMLSelectElement>(null);
  const focusLanguageAfterSettingsOpen = useRef(false);
  const focusSituationAfterScenarioChange = useRef(false);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setSettingsOpen(window.innerWidth > MOBILE_SETTINGS_BREAKPOINT);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (settingsOpen && focusLanguageAfterSettingsOpen.current) {
      focusLanguageAfterSettingsOpen.current = false;
      languageSelectRef.current?.focus();
    }
  }, [settingsOpen]);

  useEffect(() => {
    if (focusSituationAfterScenarioChange.current) {
      focusSituationAfterScenarioChange.current = false;
      situationTextareaRef.current?.focus();
    }
  }, [activeScenario]);

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

  function handleScenarioChange(scenario: AssistanceScenario) {
    if (isLoading || scenario === activeScenario) {
      return;
    }
    focusSituationAfterScenarioChange.current = true;
    setActiveScenario(scenario);
  }

  async function handleLocaleChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    const selectedLocale = event.currentTarget.value;
    if (isLoading || !isInterfaceLocale(selectedLocale)) {
      return;
    }

    const previousLocale = activeInterfaceLocale(i18n.resolvedLanguage);
    if (selectedLocale === previousLocale) {
      return;
    }
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
    persistUnifiedLocale(selectedLocale);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionInFlight.current) {
      return;
    }
    const trimmedText = situationText.trim();
    const requestedOutputLocale = locale;
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

  function handleVisualModeChange(mode: VisualMode) {
    setVisualMode(mode);
    persistVisualMode(mode);
  }

  function requestLanguageFocus() {
    if (settingsOpen) {
      languageSelectRef.current?.focus();
      return;
    }
    focusLanguageAfterSettingsOpen.current = true;
    setSettingsOpen(true);
  }

  return (
    <div id="top" className="app-shell" data-visual-mode={visualMode}>
      <a className="skip-link" href="#main-content">
        {t("navigation.skipToMain")}
      </a>

      <header className="site-header">
        <div className="page-width header-inner">
          <HeatRelayBrand />
          <HeaderSettings
            isOpen={settingsOpen}
            setIsOpen={setSettingsOpen}
            locale={locale}
            visualMode={visualMode}
            isLoading={isLoading}
            languageSelectRef={languageSelectRef}
            onLocaleChange={(event) => {
              void handleLocaleChange(event);
            }}
            onVisualModeChange={handleVisualModeChange}
          />
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section
          id="plan"
          className="task-section page-width"
          aria-labelledby="plan-title"
        >
          <h1 id="plan-title" className="task-heading">
            {t("scenario.heading")}
          </h1>
          {result?.branch === "normal" ? (
            <NormalResult response={result} headingRef={resultHeadingRef}>
              <ScenarioDashboard
                response={result}
                activeScenario={activeScenario}
                situationText={situationText}
                fieldError={fieldError}
                isLoading={isLoading}
                textareaRef={situationTextareaRef}
                locale={locale}
                onTextChange={changeSituationText}
                onScenarioChange={handleScenarioChange}
                onSubmit={handleSubmit}
              />
            </NormalResult>
          ) : result?.branch === "urgent" ? (
            <>
              <EmergencyResult response={result} headingRef={resultHeadingRef} />
              <LanguageContextNotice
                response={result}
                selectedLocale={locale}
                onRequestLanguageFocus={requestLanguageFocus}
                showChangeAction={false}
              />
              <div className="post-urgent-form">
                <SituationForm
                  situationText={situationText}
                  fieldError={fieldError}
                  isLoading={isLoading}
                  textareaRef={situationTextareaRef}
                  locale={locale}
                  onTextChange={changeSituationText}
                  onSubmit={handleSubmit}
                />
              </div>
            </>
          ) : (
            <ScenarioDashboard
              activeScenario={activeScenario}
              situationText={situationText}
              fieldError={fieldError}
              isLoading={isLoading}
              textareaRef={situationTextareaRef}
              locale={locale}
              onTextChange={changeSituationText}
              onScenarioChange={handleScenarioChange}
              onSubmit={handleSubmit}
            />
          )}

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
          {isLoading ? <LoadingState /> : null}
          {error ? <ErrorPanel error={error} headingRef={errorHeadingRef} /> : null}

          {result?.branch === "normal" ? (
            <LanguageContextNotice
              response={result}
              selectedLocale={locale}
              onRequestLanguageFocus={requestLanguageFocus}
              showChangeAction
            />
          ) : null}
        </section>

        <section
          id="trust"
          className="trust-section page-width"
          aria-labelledby="trust-title"
        >
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
          <HeatRelayBrand footer />
          <p>{t("footer.description")}</p>
        </div>
      </footer>
    </div>
  );
}
