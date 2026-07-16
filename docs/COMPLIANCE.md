# HeatRelay compliance, source, and dependency record

## Official competition baseline

This submission-planning baseline was verified on 2026-07-16 using only the
[Official Rules](https://openai.devpost.com/rules),
[FAQs](https://openai.devpost.com/details/faqs),
[Resources](https://openai.devpost.com/resources), and
[Updates](https://openai.devpost.com/updates). It does not state that
HeatRelay already satisfies every submission requirement.

- The Submission Period runs from July 13, 2026 at 9:00 AM PT through
  July 21, 2026 at 5:00 PM PT.
- Codex and GPT-5.6 are required and must be meaningfully used, not merely
  incidental or decorative.
- The submission requires the `/feedback` Session ID from the primary Codex
  thread where most core functionality was built.
- The repository must be public with relevant licensing, or private with the
  required judging access.
- The demo video must be public on YouTube, strictly under three minutes, and
  include audio explaining the project and its use of Codex and GPT-5.6.
- Event Codex credits are not OpenAI API credits. They do not replace
  separate API access or the author's responsibility for future API billing.
- HeatRelay's planned live, server-side GPT-5.6 workflow is a stricter
  internal implementation strategy. The Devpost requirements mandate
  meaningful GPT-5.6 use but do not prescribe that runtime transport.

## Author confirmations and publication status

These are organizational confirmations, not inferred personal facts. The
author performed the Git identity, authentication, commit, and push actions
listed below; Codex did not perform or claim that publication work.

| Confirmation | Status | Basis |
| --- | --- | --- |
| Devpost registration | **Author action required** | No author confirmation was supplied. |
| Competition eligibility | **Author action required** | Eligibility depends on facts the author must review and confirm. |
| GitHub public repository availability | **Confirmed** | The author confirmed [Gr1gorii/HeatRelay](https://github.com/Gr1gorii/HeatRelay), and the local `origin` URL matches it. |
| Local Git remote configuration | **Confirmed; author performed** | Repository inspection shows `origin` configured for the supplied GitHub URL. |
| First commit and push | **Confirmed; author performed** | Local `main` and `origin/main` point to Milestone 0 commit `709e1b7`. |
| Codex access | **Confirmed for this build context** | Milestones 0 and 1 use the designated primary Codex build thread. |
| Separate OpenAI API access and billing for future GPT-5.6 runtime use | **Author action required** | Codex access does not prove API project access, quota, credits, or billing. |

## Scope and coordinate handling

Milestone 1 adds server-side model-derived weather context and deterministic
queries over a reviewed Barcelona climate-shelter snapshot. It does not add
GPT-5.6, generated plans, official heat warnings, heat-severity thresholds,
medical logic, emergency guidance, maps, routing, browser geolocation,
accounts, analytics, deployment, or the complete user-facing golden path.

Both versioned context endpoints accept coordinates in JSON request bodies,
not URL query parameters. HeatRelay does not intentionally log or store exact
coordinates or request bodies. The weather response does not echo the request
coordinates. The places response includes official candidate-place
coordinates but does not echo the origin.

Weather accepts valid global WGS84 coordinates. It asks Open-Meteo to resolve
`timezone=auto`, validates the returned coordinate-local IANA timezone, and
uses that timezone for the current timestamp and same-day calendar date.
Verified place coverage remains Barcelona-only, and place schedules remain
evaluated in `Europe/Madrid`. The inclusive Barcelona pilot bounds—latitude
`41.2` through `41.6` and longitude `1.9` through `2.4`—apply only to
normalized official place records, not weather coordinates or place-search
origins.

For weather requests, the backend must send the supplied coordinates to
Open-Meteo. Open-Meteo's
[Terms and Privacy](https://open-meteo.com/en/terms) state that troubleshooting
web-server logs may contain geographic coordinates and are deleted after 90
days. This third-party handling is separate from HeatRelay's own logging
policy and must be considered before production use.

The repository contains no real secrets. `.env.example` contains an empty
backend-only OpenAI placeholder. A future OpenAI credential must remain on the
server, must never use a `VITE_` prefix, and must not be committed.

## Data source and license record

### Barcelona climate shelters

- Publisher: Ajuntament de Barcelona.
- Dataset: [Climate shelters network in the city of Barcelona](https://opendata-ajuntament.barcelona.cat/data/en/dataset/xarxa-refugis-climatics).
- Metadata: [official CKAN package](https://opendata-ajuntament.barcelona.cat/data/api/action/package_show?id=xarxa-refugis-climatics).
- Distribution: [official JSON download](https://opendata-ajuntament.barcelona.cat/data/dataset/8f9da263-ff41-4765-ab0d-61b97d7a00b2/resource/d88129fe-7aaa-4ae6-b9fd-908ad3f7480d/download).
- License: [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).

HeatRelay selects and normalizes a deliberately small reviewed subset of the
official source. The versioned snapshot and manifest retain publisher,
source, retrieval, modification, hash, license, and attribution provenance.
Their attribution identifies HeatRelay's normalization so the transformed
subset is not presented as an unmodified or complete municipal dataset. CC BY
4.0 requires appropriate credit, a license link, and an indication that
changes were made; it does not imply municipal endorsement.

Snapshot `barcelona-climate-shelters-v1-2026-07-16` uses schema
`1.0.0`. Its manifest records retrieval at `2026-07-16T19:08:41Z`, 535 input
records, 15 selected records, 520 rejected records, raw SHA-256
`37939392d6e2ca6d905eb291d9bded958e188d7d552354d2baa98407032adadd`,
and normalized SHA-256
`c958b7ba10b133132d9f1c8b98d84cd1b53644d27cbbd225b5b46bb98d89202b`.
The coordinate-local weather correction left both snapshot and manifest
bytes unchanged.

Future refreshes fail closed when a reviewed address is marked hidden, when a
raw information URL would require cleanup or contains malformed percent
escapes, invalid host or port syntax, credentials, or a non-HTTP(S) scheme, or
when an official place coordinate falls outside the documented Barcelona
pilot bounds. Accepted URLs are retained unchanged. These data checks do not
restrict global weather coordinates or place-search origins.

### Open-Meteo weather context

- Service and fields: [Open-Meteo Forecast API documentation](https://open-meteo.com/en/docs).
- Data license: [Open-Meteo license](https://open-meteo.com/en/license), CC BY 4.0.
- Service conditions: [Open-Meteo Terms and Privacy](https://open-meteo.com/en/terms).

HeatRelay returns Open-Meteo attribution and license metadata with every
normalized weather response. The result is model-derived weather context, not
an official heat warning. Weather timestamps and daily context use the
coordinate-local timezone returned by Open-Meteo rather than a universal
Barcelona timezone. Open-Meteo does not guarantee accuracy, completeness,
availability, or suitability. Its free API terms currently restrict use to
non-commercial purposes and publish request limits; any later deployment must
use an applicable plan and re-check the then-current terms.

## Direct dependency license inventory

Versions are pinned in `frontend/package.json` and the backend requirements
files. Licenses are the packages' declared upstream licenses. The HeatRelay
MIT license does not relicense third-party code.

### Frontend runtime

| Dependency | Version | Purpose | Declared license |
| --- | ---: | --- | --- |
| [react](https://www.npmjs.com/package/react) | 19.2.7 | Component UI runtime | MIT |
| [react-dom](https://www.npmjs.com/package/react-dom) | 19.2.7 | Browser rendering | MIT |

### Frontend development and testing

| Dependency | Version | Purpose | Declared license |
| --- | ---: | --- | --- |
| [vite](https://www.npmjs.com/package/vite) | 8.1.5 | Development server and production bundler | MIT |
| [@vitejs/plugin-react](https://www.npmjs.com/package/@vitejs/plugin-react) | 6.0.3 | React JSX transform and development refresh | MIT |
| [typescript](https://www.npmjs.com/package/typescript) | 6.0.3 | Static type checking | Apache-2.0 |
| [vitest](https://www.npmjs.com/package/vitest) | 4.1.10 | Frontend test runner | MIT |
| [jsdom](https://www.npmjs.com/package/jsdom) | 29.1.1 | Browser-like test environment | MIT |
| [@testing-library/react](https://www.npmjs.com/package/@testing-library/react) | 16.3.2 | Accessible React rendering queries | MIT |
| [@testing-library/dom](https://www.npmjs.com/package/@testing-library/dom) | 10.4.1 | DOM query peer required by Testing Library | MIT |
| [@types/react](https://www.npmjs.com/package/@types/react) | 19.2.17 | React TypeScript declarations | MIT |
| [@types/react-dom](https://www.npmjs.com/package/@types/react-dom) | 19.2.3 | React DOM TypeScript declarations | MIT |

### Backend runtime

| Dependency | Version | Purpose | Declared license |
| --- | ---: | --- | --- |
| [fastapi](https://pypi.org/project/fastapi/) | 0.139.2 | Typed HTTP API framework | MIT |
| [httpx](https://pypi.org/project/httpx/) | 0.28.1 | Bounded Open-Meteo client and optional official JSON downloader | BSD-3-Clause |
| [pydantic](https://pypi.org/project/pydantic/) | 2.13.4 | Direct request, response, upstream, snapshot, and manifest validation | MIT |
| [uvicorn](https://pypi.org/project/uvicorn/) | 0.51.0 | Local ASGI server | BSD-3-Clause |

### Backend development and testing

| Dependency | Version | Purpose | Declared license |
| --- | ---: | --- | --- |
| [pytest](https://pypi.org/project/pytest/) | 9.1.1 | Backend test runner | MIT |

No OpenAI SDK, map library, routing client, authentication library, analytics
library, scraping framework, or process-runner package is included.
