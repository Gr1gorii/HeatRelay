# HeatRelay architecture

## Milestone 1 boundary

The React, Vite, and TypeScript frontend remains an informational English
shell. It does not call the context APIs, request browser geolocation, or send
personal information. Vite proxies `/api` during local development.

The FastAPI backend exposes three application contracts:

- `GET /api/health` — stable service health.
- `POST /api/v1/weather/context` — normalized Open-Meteo weather context.
- `POST /api/v1/places/candidates` — deterministic candidates from the
  committed Barcelona snapshot.

Both context endpoints use strict JSON request bodies, so origin coordinates
do not appear in normal access-log URLs. HeatRelay does not intentionally log
or store coordinates or request bodies. Weather coordinates are sent
server-side to Open-Meteo; place selection is local. Weather accepts global
WGS84 coordinates, while the verified place catalog remains Barcelona-only.
The frontend is not yet connected to either endpoint.

## Implemented backend separation

1. **Weather retrieval and normalization** uses a bounded HTTPX request for
   only the required Open-Meteo fields and requests `timezone=auto`. The
   coordinate-local IANA timezone returned upstream is validated with
   `zoneinfo.ZoneInfo`; current local time, UTC offset, DST folds, and the
   same local daily date must be mutually consistent. Strict validation
   converts upstream failures or schema problems to one non-sensitive `503
   weather_unavailable` contract. Returned data is explicitly model-derived,
   not an official heat warning.
2. **Versioned place data** is produced from the official Barcelona JSON by a
   deterministic normalization script. HTTPX is used only for its optional
   direct-download path; source validation, string cleanup, reviewed schedule
   mapping, and serialization use the Python standard library. A small
   reviewed snapshot and manifest retain source, hash, license, retrieval,
   and modification provenance; the large raw source file is not committed.
   Refresh validation rejects hidden reviewed addresses and validates raw
   information URLs without cleanup: accepted values remain unchanged, while
   whitespace or control/format artifacts, malformed percent escapes, invalid
   hosts or ports, credentials, and non-HTTP(S) URLs fail closed. It also
   rejects source-backed place coordinates outside the inclusive Barcelona
   pilot bounds: latitude `41.2`–`41.6`, longitude `1.9`–`2.4`.
3. **Verified place eligibility and ranking** loads and validates that
   snapshot, including the same Barcelona record bounds, excludes unverified
   or closed schedules, applies required features fail-closed, filters by
   maximum straight-line distance, and sorts by Haversine distance then
   `place_id`. User origins retain global WGS84 bounds and may be outside
   Barcelona.
4. **Typed output validation** uses strict Pydantic request, upstream,
   snapshot, manifest, and response models. Unknown source values remain
   `null`; backend code does not invent fallback places or facts.

Weather time is coordinate-local and is not universally
`Europe/Madrid`. Opening-hours evaluation remains fixed to `Europe/Madrid`
and uses seasonal date ranges, weekday rules, multiple and overnight
intervals, an inclusive opening boundary, and an exclusive closing boundary.
Every candidate response warns that municipal hours may change and should be
checked before travel.

## Deferred pipeline stages

Deterministic action-priority logic remains separate and unimplemented. A
future server-side GPT-5.6 layer is planned for multilingual structured
situation extraction and plan generation restricted to backend-approved
candidate places. A later validation layer must check generated output against
weather facts, deterministic priorities, place eligibility, provenance, and
safety rules before it reaches the browser.

GPT-5.6, generated plans, heat thresholds, medical or emergency logic, maps,
routes, browser geolocation, authentication, analytics, deployment, and the
complete user-facing golden path are outside Milestone 1.
