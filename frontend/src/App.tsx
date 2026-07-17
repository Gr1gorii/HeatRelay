const plannedSteps = [
  {
    number: "01",
    title: "Understand the warning",
    copy: "The backend can now normalize model-derived weather context with source and freshness details. The browser is not connected to it yet.",
  },
  {
    number: "02",
    title: "Prioritize safe actions",
    copy: "Deterministic rules are planned to put urgent, practical actions ahead of convenience or generated wording.",
  },
  {
    number: "03",
    title: "Choose a verified next step",
    copy: "A reviewed Barcelona place snapshot and deterministic candidate ranking now exist server-side. The browser is not connected to them yet.",
  },
];

const deferredCapabilities = [
  "User-facing live context and the complete action flow",
  "Official heat-warning retrieval and action-priority logic",
  "Maps, routing, and location access",
  "GPT-5.6 plan generation and extraction UI integration",
  "Authentication, deployment, and additional cities",
];

export default function App() {
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
            <a href="#journey">Product</a>
            <a href="#scope">Scope</a>
            <a href="#trust">Trust</a>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section className="hero page-width" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">Barcelona pilot · Milestone 2</p>
            <h1 id="hero-title">From heat warning to a safe next step.</h1>
            <p className="hero-intro">
              HeatRelay is being built to turn trusted heat information into
              clear, practical actions. This release adds bounded backend
              context and situation-extraction services; the interface still
              does not collect a situation or provide live guidance.
            </p>
            <div className="hero-links" aria-label="Page links">
              <a className="primary-link" href="#scope">
                See the pilot boundary
                <span aria-hidden="true">→</span>
              </a>
              <a className="text-link" href="#trust">
                Read safety and privacy notes
              </a>
            </div>
          </div>

          <aside className="status-card" aria-labelledby="status-title">
            <div className="status-card-top">
              <p className="status-kicker">Current release</p>
              <span className="release-badge">Foundation</span>
            </div>
            <h2 id="status-title">A clear boundary from day one</h2>
            <p>
              The shell, health API, and bounded context APIs are ready for
              development. Live heat guidance is intentionally deferred.
            </p>
            <dl className="status-list">
              <div>
                <dt>Product shell</dt>
                <dd className="available">Available</dd>
              </div>
              <div>
                <dt>Health API</dt>
                <dd className="available">Available</dd>
              </div>
              <div>
                <dt>Context APIs</dt>
                <dd className="available">Backend only</dd>
              </div>
              <div>
                <dt>Live guidance</dt>
                <dd>Not available</dd>
              </div>
            </dl>
          </aside>
        </section>

        <section
          id="journey"
          className="section page-width"
          aria-labelledby="journey-title"
        >
          <div className="section-heading">
            <p className="eyebrow">Product direction</p>
            <h2 id="journey-title">One warning. A calmer path forward.</h2>
            <p>
              The planned experience separates trusted facts, safety
              priorities, and generated language. Only the bounded backend
              fact and extraction services exist server-side; the user-facing
              journey is not live.
            </p>
          </div>

          <ol className="step-grid">
            {plannedSteps.map((step) => (
              <li key={step.number} className="step-card">
                <span className="step-number">Planned step {step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="scope"
          className="section page-width scope-section"
          aria-labelledby="scope-title"
        >
          <div className="scope-copy">
            <p className="eyebrow">First MVP boundary</p>
            <h2 id="scope-title">Barcelona pilot</h2>
            <p>
              Barcelona is the planned geographic boundary for the first MVP.
              Expansion should happen only after local source quality, place
              verification, language needs, and safety behavior have been
              evaluated.
            </p>
          </div>

          <div className="scope-note">
            <span className="scope-icon" aria-hidden="true">
              BCN
            </span>
            <div>
              <h3>Local by design</h3>
              <p>
                The backend can retrieve model-derived weather context and
                rank reviewed candidate places. This interface does not
                request a location, call those APIs, or show a map.
              </p>
            </div>
          </div>
        </section>

        <section
          id="trust"
          className="section page-width trust-section"
          aria-labelledby="trust-title"
        >
          <div className="section-heading">
            <p className="eyebrow">Trust boundaries</p>
            <h2 id="trust-title">Honest about what this version can do.</h2>
          </div>

          <div className="trust-grid">
            <article className="trust-card safety-card">
              <p className="card-label">Safety</p>
              <h3>Not an official heat-warning service</h3>
              <p>
                HeatRelay is informational and is not a medical or emergency
                service. Model-derived weather context is not an official
                warning, and this version does not provide personalized safety
                advice. If someone is in immediate danger, contact local
                emergency services.
              </p>
            </article>

            <article className="trust-card privacy-card">
              <p className="card-label">Privacy</p>
              <h3>No personal details requested</h3>
              <p>
                The interface has no accounts, forms, analytics, or location
                access. Backend requests can contain coordinates, which are not
                intentionally logged or stored. Do not share personal or
                medical information.
              </p>
            </article>
          </div>
        </section>

        <section
          className="section page-width deferred-section"
          aria-labelledby="deferred-title"
        >
          <div>
            <p className="eyebrow">Planned, not available yet</p>
            <h2 id="deferred-title">The full golden path comes later.</h2>
          </div>
          <ul className="deferred-list">
            {deferredCapabilities.map((capability) => (
              <li key={capability}>
                <span aria-hidden="true">—</span>
                {capability}
              </li>
            ))}
          </ul>
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
          <p>Milestone 2 · English shell · Barcelona pilot boundary</p>
        </div>
      </footer>
    </div>
  );
}
