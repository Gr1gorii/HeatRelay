# HeatRelay

**From heat warning to a safe next step.**

HeatRelay is being designed to turn trusted heat information into clear,
practical next steps. Barcelona is the boundary for the first planned MVP.
Milestone 0 establishes only a verified application foundation: an accessible
React shell, a FastAPI health endpoint, automated smoke tests, and local
development commands.

## Milestone 0 status

Implemented:

- Responsive English React, Vite, and TypeScript shell.
- Explicit Barcelona pilot, privacy, and safety boundaries.
- FastAPI `GET /api/health` endpoint.
- Backend and frontend smoke tests.
- One command to run both local services with coordinated shutdown.

Live GPT-5.6 integration, weather retrieval, verified cooling-place data,
deterministic action-priority logic, place ranking, maps, authentication,
deployment, and the full golden path are **not implemented in Milestone 0**.
The interface does not claim that these capabilities work.

## Intended audience

HeatRelay is planned for people especially vulnerable to heat and for people
assisting them. This includes older adults living alone, people without air
conditioning, people with limited mobility or language barriers, outdoor
workers, families with young children, and relatives, neighbors, or care
workers helping someone take a safer next step.

## Planned server-side GPT-5.6 role

The following tasks are planned and remain unimplemented:

1. **Multilingual structured situation extraction** to turn a person's
   description into a bounded backend schema.
2. **Grounded action-plan generation** restricted to candidate places already
   approved by the backend.

Deterministic backend code—not GPT-5.6—will own weather facts, action
priority, place eligibility, and factual validation.

## Prerequisites

- Node.js `^22.13.0` or `>=24.0.0` and npm.
- Python `>=3.10`.
- GNU Make.
- macOS or Linux; the development supervisor uses POSIX process groups.
- Network access during initial dependency installation.

This milestone was verified locally with Node.js 26.0.0, npm 11.12.1,
Python 3.10.0, and GNU Make 3.81.

## Setup

From the repository root, install all frontend and backend dependencies:

```sh
make setup
```

This creates `.venv`, installs the pinned Python dependencies, and installs
the exact npm dependency tree from `frontend/package-lock.json`.

## Development

Start the FastAPI and Vite development servers together:

```sh
make dev
```

- Frontend: <http://127.0.0.1:5173>
- Backend health endpoint: <http://127.0.0.1:8000/api/health>

Press `Ctrl-C` once to stop both services. The development supervisor also
stops the other service if either process exits unexpectedly.

The health endpoint returns:

```json
{"status":"ok","service":"heatrelay-api"}
```

## Test

Run the backend suite:

```sh
make test-backend
```

Run the frontend suite:

```sh
make test-frontend
```

Run both suites:

```sh
make test
```

## Build

Type-check and create the frontend production bundle:

```sh
make build
```

The generated files are written to `frontend/dist/`.

## Project layout

```text
backend/                FastAPI application and pytest coverage
frontend/               React, Vite, TypeScript application and smoke test
scripts/dev.py          Coordinated local process supervisor
docs/ARCHITECTURE.md    Current boundary and planned backend separation
docs/BUILD_LOG.md       Work and decision provenance
docs/COMPLIANCE.md      Author confirmations and dependency licenses
```

## Privacy, safety, and secrets

Milestone 0 has no accounts, forms, analytics, location access, or intentional
collection of personal information. Do not submit personal or medical
information. HeatRelay is not a medical or emergency service, and this version
does not issue live warnings or personalized safety advice. If someone is in
immediate danger, contact local emergency services.

The example environment file contains placeholders only. Any future OpenAI API
key must remain server-side, must never use a `VITE_` prefix, and must never be
committed. No OpenAI SDK is installed in this milestone.

## Documentation and license

- [Architecture](docs/ARCHITECTURE.md)
- [Build log](docs/BUILD_LOG.md)
- [Compliance and direct dependency licenses](docs/COMPLIANCE.md)
- [MIT License](LICENSE)
