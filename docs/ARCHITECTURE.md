# HeatRelay architecture

## Milestone 2 boundary

The React, Vite, and TypeScript frontend remains an informational English
shell. It does not call the context APIs, request browser geolocation, or send
personal information. Vite proxies `/api` during local development.

The FastAPI backend exposes four application contracts:

- `GET /api/health` — stable service health.
- `POST /api/v1/weather/context` — normalized Open-Meteo weather context.
- `POST /api/v1/places/candidates` — deterministic candidates from the
  committed Barcelona snapshot.
- `POST /api/v1/situation/extract` — bounded multilingual extraction of
  explicitly reported facts through server-side GPT-5.6.

Both context endpoints use strict JSON request bodies, so origin coordinates
do not appear in normal access-log URLs. HeatRelay does not intentionally log
or store coordinates or request bodies. Weather coordinates are sent
server-side to Open-Meteo; place selection is local. Weather accepts global
WGS84 coordinates, while the verified place catalog remains Barcelona-only.
The situation endpoint also accepts a strict JSON body: its text does not
appear in a URL, and HeatRelay does not intentionally log, persist, or echo
it. That text is sent server-side to OpenAI for extraction. The frontend is
not yet connected to any context or extraction endpoint.

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
5. **Multilingual situation extraction** uses an injected, lazy OpenAI
   adapter. Application import, OpenAPI generation, health, weather, and
   places do not construct a client or require a credential. The adapter
   sends a fixed, versioned developer instruction and the untrusted situation
   text as a separate user message to the Responses API model alias
   `gpt-5.6`. Pydantic Structured Outputs use a closed model-facing schema;
   HeatRelay then revalidates status/value invariants, rejects refusals or
   incomplete and unusable output, canonicalizes bounded lists, and computes
   `missing_information` and the notice in a separate public response model.
   No model-generated advice, plan, diagnosis, place, weather fact, or free-
   form summary is accepted.

Weather time is coordinate-local and is not universally
`Europe/Madrid`. Opening-hours evaluation remains fixed to `Europe/Madrid`
and uses seasonal date ranges, weekday rules, multiple and overnight
intervals, an inclusive opening boundary, and an exclusive closing boundary.
Every candidate response warns that municipal hours may change and should be
checked before travel.

## Credential and provider boundary

Local development reads only the explicit repository-root `.env.local`,
rejects a symlinked or non-regular file, checks the opened descriptor, rejects
every group or other permission bit, and preserves an already exported
backend credential. The supervisor passes `OPENAI_API_KEY` only to the backend
child and removes it from the frontend child environment. A shared Make/npm
boundary also removes the variable before dependency installation, frontend
tests, and production builds. The file remains ignored, `.env.example` keeps
an empty backend-only placeholder, and ordinary tests do not load the local
credential or contact OpenAI.

The extraction adapter explicitly pins the production client to
`https://api.openai.com/v1`; inherited `OPENAI_BASE_URL` state cannot redirect
the destination. Requests set `store=False`, disable SDK retries, use a
30-second SDK request timeout and a separate 30-second bound around
`responses.parse`, and set explicit prompt-cache mode without adding a cache
breakpoint. The request path waits at most one second for best-effort client
cleanup. A timed-out close receives best-effort cancellation and is detached
with a fixed completion callback that consumes its eventual outcome; the
timeout does not guarantee that the underlying client has finished closing.
The request and cleanup limits therefore are not one exact 30-second
end-to-end deadline. Under OpenAI's documented behavior, that cache
configuration does not use prompt caching; `store=False` also avoids stored
Responses application state for later retrieval. Neither setting is a
zero-retention claim: provider abuse-monitoring and other policy-governed
handling may still apply. HeatRelay returns only sanitized, server-owned
errors and never exposes provider payloads, identifiers, headers,
credentials, request text, or model output in an error.

## Deferred pipeline stages

Deterministic action-priority logic remains separate and unimplemented. A
later server-side stage may generate a grounded action plan restricted to
backend-approved candidate places. A subsequent backend validation layer must
check generated output against weather facts, deterministic priorities, place
eligibility, provenance, and safety rules before it reaches the browser.

Milestone 2 implements extraction only. Grounded plan generation, heat action
priority, heat or medical thresholds, emergency decision logic, frontend API
integration, maps, routes, browser geolocation, authentication, analytics,
deployment, and the complete user-facing golden path remain unimplemented.
