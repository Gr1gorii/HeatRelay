import { FormEvent, RefObject, useEffect, useRef, useState } from "react";

import {
  ActionPlanClientError,
  ActionPlanResponse,
  BARCELONA_DEMO_TEXT,
  NormalActionPlanResponse,
  SelectedPlace,
  SITUATION_TEXT_LIMIT,
  UrgentActionPlanResponse,
  countCodePoints,
  createActionPlan,
} from "./action-plan";

const PRIORITY_LABELS = {
  act_now: "Act now",
  prepare_now: "Prepare now",
  monitor_and_prepare: "Monitor and prepare",
} as const;

const FEATURE_LABELS: Array<[
  keyof SelectedPlace["features"],
  string,
]> = [
  ["indoor_space", "Indoor space"],
  ["potable_water", "Drinking water"],
  ["toilets", "Toilets"],
  ["micro_shelter", "Micro-shelter"],
  ["pets_allowed", "Pets allowed"],
];

type UiError = {
  title: string;
  message: string;
};

function formatDateTime(value: string, timeZone = "Europe/Madrid"): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(new Date(value));
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatTemperature(value: number): string {
  return `${value.toFixed(1)}°C`;
}

function formatDistance(distanceM: number): string {
  return distanceM >= 1000
    ? `${(distanceM / 1000).toFixed(1)} km straight-line`
    : `${Math.round(distanceM)} m straight-line`;
}

function formatAddress(place: SelectedPlace): string {
  const street = [place.address.street, place.address.number]
    .filter(Boolean)
    .join(" ");
  const locality = [place.address.postal_code, place.address.city]
    .filter(Boolean)
    .join(" ");
  return [street, locality].filter(Boolean).join(", ") || "Address unavailable";
}

function accessibilityLabel(value: boolean | null): string {
  if (value === true) {
    return "Accessibility confirmed by the source";
  }
  if (value === false) {
    return "Source reports this place is not accessible";
  }
  return "Accessibility status unknown";
}

function Phase({
  title,
  actions,
}: {
  title: string;
  actions: NormalActionPlanResponse["plan"]["now"]["actions"];
}) {
  return (
    <section className="phase-card" aria-labelledby={`phase-${title.replaceAll(" ", "-")}`}>
      <h3 id={`phase-${title.replaceAll(" ", "-")}`}>{title}</h3>
      <ol className="action-list">
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
  const verifiedFeatures = FEATURE_LABELS.filter(
    ([feature]) => place.features[feature] === true,
  );
  return (
    <section className="place-card" aria-labelledby="selected-place-title">
      <p className="card-label">Backend-approved candidate</p>
      <h3 id="selected-place-title">{place.name}</h3>
      <p className="place-address">{formatAddress(place)}</p>
      <dl className="place-details">
        <div>
          <dt>Distance</dt>
          <dd>{formatDistance(place.distance_m)}</dd>
        </div>
        <div>
          <dt>Closes</dt>
          <dd>
            <time dateTime={place.closes_at}>
              {formatDateTime(place.closes_at)}
            </time>
          </dd>
        </div>
        <div>
          <dt>Accessibility</dt>
          <dd>{accessibilityLabel(place.accessibility)}</dd>
        </div>
        <div>
          <dt>Last checked</dt>
          <dd>
            <time dateTime={place.last_checked}>{formatDate(place.last_checked)}</time>
          </dd>
        </div>
      </dl>

      <div>
        <h4>Verified features</h4>
        {verifiedFeatures.length > 0 ? (
          <ul className="feature-list">
            {verifiedFeatures.map(([feature, label]) => (
              <li key={feature}>{label}</li>
            ))}
          </ul>
        ) : (
          <p>No additional verified features are listed.</p>
        )}
      </div>

      <div className="result-actions" aria-label="Official place links">
        {place.information_url ? (
          <a
            className="text-link"
            href={place.information_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Official information
          </a>
        ) : null}
        <a
          className="text-link"
          href={place.source_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Official source
        </a>
      </div>

      <ul className="warning-list" aria-label="Place cautions">
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
  const notices = Array.from(
    new Set([response.weather.notice, response.plan.notice, ...response.notices]),
  );
  return (
    <section className="result-section" aria-labelledby="result-title">
      <header className="result-header">
        <div>
          <p className="eyebrow">Your Barcelona heat action plan</p>
          <h2 id="result-title" ref={headingRef} tabIndex={-1} className="result-focus">
            {PRIORITY_LABELS[response.priority.priority]}
          </h2>
        </div>
        <span className="priority-badge">
          Priority: {PRIORITY_LABELS[response.priority.priority]}
        </span>
      </header>

      <p className="evaluation-time">
        Evaluated at{" "}
        <time dateTime={response.evaluation_time}>
          {formatDateTime(response.evaluation_time)}
        </time>
      </p>

      <div className="summary-grid" aria-label="Weather summary">
        <div className="summary-card">
          <span>Current</span>
          <strong>{formatTemperature(response.weather.current.temperature_c)}</strong>
        </div>
        <div className="summary-card">
          <span>Feels like</span>
          <strong>
            {formatTemperature(response.weather.current.apparent_temperature_c)}
          </strong>
        </div>
        <div className="summary-card">
          <span>Today’s maximum</span>
          <strong>{formatTemperature(response.weather.today.temperature_max_c)}</strong>
        </div>
      </div>
      <p className="weather-boundary">{response.weather.notice}</p>

      <div className="phase-grid">
        <Phase title="Now" actions={response.plan.now.actions} />
        <Phase title="Next few hours" actions={response.plan.next_few_hours.actions} />
        <Phase title="Tonight" actions={response.plan.tonight.actions} />
      </div>

      {response.plan.bring_items.length > 0 ? (
        <section className="plan-detail" aria-labelledby="bring-title">
          <h3 id="bring-title">Bring with you</h3>
          <ul className="bring-list">
            {response.plan.bring_items.map((item) => (
              <li key={item.code}>{item.text}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="plan-detail" aria-labelledby="why-title">
        <h3 id="why-title">Why this plan</h3>
        <ul className="explanation-list">
          {response.plan.explanations.map((explanation) => (
            <li key={explanation.code}>{explanation.text}</li>
          ))}
        </ul>
      </section>

      {response.plan.local_phrase ? (
        <section className="local-phrase" aria-labelledby="phrase-title">
          <p className="card-label">
            {response.plan.local_phrase.language === "ca" ? "Catalan" : "Spanish"}
          </p>
          <h3 id="phrase-title">A local phrase</h3>
          <blockquote lang={response.plan.local_phrase.language}>
            {response.plan.local_phrase.text}
          </blockquote>
        </section>
      ) : null}

      {response.selected_place ? (
        <PlaceCard place={response.selected_place} response={response} />
      ) : (
        <section className="empty-place" aria-labelledby="empty-place-title">
          <h3 id="empty-place-title">No verified place selected</h3>
          <p>{response.candidate_context.explanation}</p>
          <p>{response.candidate_context.candidate_notice}</p>
        </section>
      )}

      <section className="safety-notices" aria-labelledby="notices-title">
        <h3 id="notices-title">Safety and information notices</h3>
        <ul className="notice-list">
          {notices.map((notice) => (
            <li key={notice}>{notice}</li>
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
  return (
    <section
      className="result-section urgent-result"
      role="alert"
      aria-labelledby="urgent-result-title"
    >
      <p className="eyebrow">Immediate safety result</p>
      <h2
        id="urgent-result-title"
        ref={headingRef}
        tabIndex={-1}
        className="result-focus"
      >
        Urgent help
      </h2>
      <p className="urgent-number">
        <span>{response.urgent_contact.service}</span>
        <strong>{response.urgent_contact.number}</strong>
      </p>
      <p className="urgent-instruction">{response.urgent_contact.instruction}</p>
      <ul className="urgent-actions">
        {response.actions.map((action) => (
          <li key={action.code}>{action.text}</li>
        ))}
      </ul>
      <ul className="notice-list">
        {response.notices.map((notice) => (
          <li key={notice}>{notice}</li>
        ))}
      </ul>
      <a
        className="text-link"
        href={response.urgent_contact.source_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        Official 112 guidance
      </a>
    </section>
  );
}

export default function App() {
  const [situationText, setSituationText] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ActionPlanResponse | null>(null);
  const [error, setError] = useState<UiError | null>(null);
  const submissionInFlight = useRef(false);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (error) {
      errorHeadingRef.current?.focus();
    } else if (result) {
      resultHeadingRef.current?.focus();
    }
  }, [error, result]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionInFlight.current) {
      return;
    }
    const trimmedText = situationText.trim();
    const length = countCodePoints(trimmedText);
    if (length === 0 || length > SITUATION_TEXT_LIMIT) {
      setFieldError(
        length === 0
          ? "Describe the situation before creating a plan."
          : "Keep the description within 2,000 Unicode characters.",
      );
      setResult(null);
      setError({
        title: "Check your description",
        message: "Review the description and try again.",
      });
      return;
    }

    submissionInFlight.current = true;
    setFieldError(null);
    setResult(null);
    setError(null);
    setIsLoading(true);
    try {
      setResult(await createActionPlan(trimmedText));
    } catch (caught) {
      if (caught instanceof ActionPlanClientError) {
        if (caught.kind === "invalid_input") {
          setError({
            title: "Check your description",
            message: "Review the description and try again.",
          });
        } else if (caught.kind === "malformed_response") {
          setError({
            title: "Response unavailable",
            message: "The response could not be safely displayed.",
          });
        } else {
          setError({
            title: "Action plan temporarily unavailable",
            message: "The action plan is temporarily unavailable. Please try again later.",
          });
        }
      } else {
        setError({
          title: "Backend could not be reached",
          message: "The backend could not be reached. Check that the local services are running.",
        });
      }
    } finally {
      submissionInFlight.current = false;
      setIsLoading(false);
    }
  }

  const characterCount = countCodePoints(situationText);

  return (
    <div id="top" className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="site-header">
        <div className="page-width header-inner">
          <a className="brand" href="#top" aria-label="HeatRelay home">
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
            </span>
            <span>HeatRelay</span>
          </a>
          <nav aria-label="Primary">
            <a href="#plan">Create a plan</a>
            <a href="#trust">Safety and privacy</a>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section className="hero page-width" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">Barcelona pilot · Milestone 4</p>
            <h1 id="hero-title">From heat warning to a safe next step.</h1>
            <p className="hero-intro">
              Describe a heat situation and HeatRelay will ask the existing
              backend for one grounded Barcelona action plan using fixed demo
              coordinates.
            </p>
            <a className="primary-link" href="#plan">
              Create a Barcelona plan <span aria-hidden="true">→</span>
            </a>
          </div>
          <aside className="status-card" aria-labelledby="status-title">
            <div className="status-card-top">
              <p className="status-kicker">Current release</p>
              <span className="release-badge">Barcelona demo</span>
            </div>
            <h2 id="status-title">One server-owned workflow</h2>
            <p>
              The browser sends only your description and fixed Barcelona demo
              settings. Weather, priority, places, and factual validation stay
              on the backend.
            </p>
            <dl className="status-list">
              <div>
                <dt>Action-plan API</dt>
                <dd className="available">Same-origin endpoint</dd>
              </div>
              <div>
                <dt>Demo location</dt>
                <dd>Fixed Barcelona point</dd>
              </div>
              <div>
                <dt>Browser location</dt>
                <dd>Not available</dd>
              </div>
            </dl>
          </aside>
        </section>

        <section id="plan" className="section page-width plan-section" aria-labelledby="plan-title">
          <div className="section-heading">
            <p className="eyebrow">Barcelona demo</p>
            <h2 id="plan-title">Create your heat action plan</h2>
            <p>
              Share only the situation details needed to personalize a bounded,
              backend-validated plan. One submission makes one request.
            </p>
          </div>

          <div className="form-card">
            <div id="privacy-description" className="privacy-notice">
              <h3>Before you submit</h3>
              <p>
                Your description is sent server-side to OpenAI for GPT-5.6
                processing. HeatRelay does not intentionally store or log the
                raw text; provider data-handling policies may still apply.
              </p>
            </div>
            <p id="identity-warning" className="identity-warning">
              Do not include names, contact details, addresses, or other
              identifying information.
            </p>

            <form
              className="plan-form"
              aria-busy={isLoading}
              aria-describedby="privacy-description identity-warning boundary-note"
              onSubmit={handleSubmit}
            >
              <div className="field-group">
                <div className="textarea-heading">
                  <label htmlFor="situation-text">Describe the heat situation</label>
                  <span
                    id="character-count"
                    className="character-count"
                    data-over-limit={characterCount > SITUATION_TEXT_LIMIT}
                  >
                    {characterCount.toLocaleString()} / 2,000 code points
                  </span>
                </div>
                <textarea
                  id="situation-text"
                  name="situation_text"
                  rows={7}
                  value={situationText}
                  disabled={isLoading}
                  aria-describedby={`situation-hint character-count${fieldError ? " situation-error" : ""}`}
                  aria-invalid={fieldError ? "true" : undefined}
                  onChange={(event) => {
                    setSituationText(event.target.value);
                    if (fieldError) {
                      setFieldError(null);
                    }
                  }}
                />
                <p id="situation-hint" className="field-hint">
                  Use up to 2,000 Unicode code points. You can describe age,
                  cooling access, mobility, timing, or bounded warning symptoms.
                </p>
                {fieldError ? (
                  <p id="situation-error" className="field-error">
                    {fieldError}
                  </p>
                ) : null}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  disabled={isLoading}
                  onClick={() => {
                    setSituationText(BARCELONA_DEMO_TEXT);
                    setFieldError(null);
                  }}
                >
                  Load Barcelona demo
                </button>
                <button type="submit" className="primary-button" disabled={isLoading}>
                  {isLoading ? "Creating your plan…" : "Create my heat action plan"}
                </button>
              </div>

              <p id="boundary-note" className="boundary-note">
                This MVP uses fixed Barcelona demo coordinates. Browser location
                is not available yet. Distances are straight-line estimates;
                HeatRelay is not medical or emergency advice.
              </p>
            </form>
          </div>

          <p className="status-region" role="status" aria-live="polite">
            {isLoading
              ? "Creating your action plan."
              : result
                ? "Your action plan is ready."
                : ""}
          </p>
          {isLoading ? (
            <div className="loading-state" aria-hidden="true">
              <span />
              <p>Checking the situation, weather, and verified candidates…</p>
            </div>
          ) : null}

          {error ? (
            <section className="error-panel" role="alert" aria-labelledby="error-title">
              <h2 id="error-title" ref={errorHeadingRef} tabIndex={-1} className="result-focus">
                {error.title}
              </h2>
              <p>{error.message}</p>
            </section>
          ) : null}

          {result?.branch === "normal" ? (
            <NormalResult response={result} headingRef={resultHeadingRef} />
          ) : null}
          {result?.branch === "urgent" ? (
            <UrgentResult response={result} headingRef={resultHeadingRef} />
          ) : null}
        </section>

        <section id="trust" className="section page-width trust-section" aria-labelledby="trust-title">
          <div className="section-heading">
            <p className="eyebrow">Trust boundaries</p>
            <h2 id="trust-title">Useful without overstating certainty.</h2>
          </div>
          <div className="trust-grid">
            <article className="trust-card safety-card">
              <p className="card-label">Safety</p>
              <h3>Information, not medical advice</h3>
              <p>
                Weather is model-derived, not an official heat warning. Places,
                hours, straight-line distance, and reachability should be checked
                before travel. Urgent output uses fixed backend-owned content.
              </p>
            </article>
            <article className="trust-card privacy-card">
              <p className="card-label">Privacy</p>
              <h3>Keep identifying details out</h3>
              <p>
                Text stays in React memory in this browser and is sent only in
                the action-plan request body. HeatRelay does not use browser
                storage, analytics, cookies, URL parameters, or geolocation in
                this demo.
              </p>
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
            <span>HeatRelay</span>
          </a>
          <p>Milestone 4 · English Barcelona demo · Fixed coordinates</p>
        </div>
      </footer>
    </div>
  );
}
