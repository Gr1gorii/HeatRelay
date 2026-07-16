# HeatRelay compliance and dependency record

## Official competition baseline

This submission-planning baseline was verified on 2026-07-16 using only the
[Official Rules](https://openai.devpost.com/rules),
[FAQs](https://openai.devpost.com/details/faqs),
[Resources](https://openai.devpost.com/resources), and
[Updates](https://openai.devpost.com/updates). It does not state that
HeatRelay already satisfies the submission requirements.

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

## Author confirmations

These items are organizational confirmations, not technical blockers for
local Milestone 0 completion. Personal facts are not inferred.

| Confirmation | Status | Basis |
| --- | --- | --- |
| Devpost registration | **Author action required** | No author confirmation was supplied. |
| Competition eligibility | **Author action required** | Eligibility depends on facts the author must review and confirm. |
| GitHub public repository availability | **Confirmed** | [Gr1gorii/HeatRelay](https://github.com/Gr1gorii/HeatRelay) is publicly reachable and returned HTTP 200 on 2026-07-16. |
| Local Git remote configuration | **Author action required** | The local repository has no configured remote. |
| First commit and push | **Author action required** | Local `main` remains unborn and the Milestone 0 files are untracked. |
| Codex access | **Confirmed for this build context** | This milestone is being implemented in the designated primary Codex build thread. |
| Separate OpenAI API access and billing for future GPT-5.6 runtime use | **Author action required** | Codex access does not prove API project access, quota, credits, or billing. |

## Scope and data handling

Milestone 0 contains no live GPT-5.6 integration, weather retrieval, verified
place data, ranking, maps, authentication, deployment, or complete golden
path. It has no accounts, forms, analytics, or intentional collection of
personal information.

The repository contains no real secrets. `.env.example` uses a placeholder
only. A future OpenAI API credential must remain on the server, must never use
a `VITE_` prefix, and must not be committed.

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

### Backend runtime and testing

| Dependency | Version | Purpose | Declared license |
| --- | ---: | --- | --- |
| [fastapi](https://pypi.org/project/fastapi/) | 0.139.2 | HTTP API framework | MIT |
| [uvicorn](https://pypi.org/project/uvicorn/) | 0.51.0 | Local ASGI server | BSD-3-Clause |
| [pytest](https://pypi.org/project/pytest/) | 9.1.1 | Backend test runner | MIT |
| [httpx](https://pypi.org/project/httpx/) | 0.28.1 | ASGI HTTP client used to exercise the health endpoint | BSD-3-Clause |

No OpenAI SDK, weather client, map library, authentication library, analytics
library, UI framework, or process-runner package is included.
