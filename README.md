# HeatRelay

**From heat warning to a safe next step.**

HeatRelay is being designed to turn trusted heat information into clear,
practical next steps. Barcelona is the boundary for the first MVP's verified
place catalog; weather context accepts valid global coordinates. Milestone 1
added bounded backend fact services and a reviewed municipal-data snapshot.
Milestone 2 adds extraction-only, server-side GPT-5.6 processing for a bounded
multilingual situation profile. The existing English interface is not
connected to these APIs.

## Implemented scope through Milestone 2

Included in this milestone:

- Responsive React, Vite, and TypeScript product shell from Milestone 0.
- Stable FastAPI `GET /api/health` endpoint.
- Server-side `POST /api/v1/weather/context` using Open-Meteo.
- A versioned, normalized snapshot of 15 official Barcelona climate shelters.
- Deterministic `POST /api/v1/places/candidates` filtering and ranking.
- Server-side `POST /api/v1/situation/extract` using GPT-5.6 through the
  OpenAI Responses API and Pydantic Structured Outputs.
- Deterministic validation, canonical ordering, and missing-information
  reconciliation for the extracted situation profile.
- Strict request, upstream, snapshot, manifest, and response validation.
- Offline backend tests, a frontend rendering smoke test, production build,
  and coordinated local development command.

The browser does not call the backend APIs, request location, display live
weather, submit situation text, or recommend a place. Grounded action-plan
generation, official heat-warning retrieval, heat action priority, medical or
emergency decision logic, maps, routes, travel times, authentication,
analytics, deployment, additional cities, frontend integration, and the full
user-facing golden path remain **unimplemented**.

## Intended audience

HeatRelay is planned for people especially vulnerable to heat and for people
assisting them. This includes older adults living alone, people without air
conditioning, people with limited mobility or language barriers, outdoor
workers, families with young children, and relatives, neighbors, or care
workers helping someone take a safer next step.

## Server-side GPT-5.6 boundary

Milestone 2 implements only the first of two planned GPT-5.6 tasks:

1. **Implemented:** multilingual extraction of explicitly reported facts into
   a bounded backend schema.
2. **Unimplemented:** grounded action-plan generation restricted to candidate
   places already approved by the backend.

Deterministic backend code—not GPT-5.6—owns weather facts, opening-hours and
feature eligibility, distance ranking, schema enforcement, canonical ordering,
missing-information reconciliation, and factual validation. Deterministic
heat action priority is planned for backend code but remains unimplemented.

## Prerequisites

- Node.js `^22.13.0` or `>=24.0.0` and npm.
- Python `>=3.10`.
- GNU Make.
- macOS or Linux; the development supervisor uses POSIX process groups.
- Network access for initial dependency installation and any explicit live
  weather, data-refresh, or GPT-5.6 smoke check.

## Setup

From the repository root:

```sh
make setup
```

This creates `.venv`, installs the pinned Python dependencies, and installs
the exact npm dependency tree from `frontend/package-lock.json`. Every npm
process launched by the root Make targets runs with `OPENAI_API_KEY` removed
from its child environment.

### Local backend credential

OpenAI requires a separate API key and billing for live extraction. Create the
ignored repository-root file from the tracked placeholder:

```sh
cp .env.example .env.local
chmod 600 .env.local
```

Then set the empty `OPENAI_API_KEY=` entry in `.env.local` locally. Never
commit this file or use a `VITE_` OpenAI variable. `make dev` reads only this
exact root file, refuses a symlinked or non-regular file, and does not search
parent directories. After opening the file safely, it rejects any group or
other permission bit; keep it owner-only (for example, mode `0600`). An
already exported `OPENAI_API_KEY` takes precedence over the local file. The
key is passed only to the backend child process and is explicitly removed
from the frontend child environment, even when it was exported by the parent
shell. Root Make targets also remove it before npm dependency installation,
frontend tests, and the production build. Application import and ordinary
tests do not load `.env.local`.

## Development

Start FastAPI and Vite together:

```sh
make dev
```

- Frontend: <http://127.0.0.1:5173>
- Backend health: <http://127.0.0.1:8000/api/health>
- OpenAPI UI: <http://127.0.0.1:8000/docs>

Press `Ctrl-C` once to stop both services. The supervisor also stops the other
service if either process exits unexpectedly.

## Test

```sh
make test-backend
make test-frontend
make test
```

The backend tests mock outbound weather and OpenAI traffic; the normal test
suite does not read the real `.env.local` or require live network access. A
configuration-only regression constructs the official SDK client with a
synthetic credential to verify its effective base URL, then closes it without
sending an API request; tests of extraction traffic use injected fakes.

One tightly bounded paid GPT-5.6 smoke was performed only after the offline
suite and build passed, through the documented local development path. It is
not part of `make test`; its safe, redacted evidence is recorded in
`docs/BUILD_LOG.md`. The mocked suite remains distinct from that single live
verification.

## Build

```sh
make build
```

This type-checks the frontend and writes the production bundle to
`frontend/dist/`.

## API contracts

All request models reject undocumented fields. Invalid coordinates, a naive
place-evaluation datetime, invalid limits, or extra fields return FastAPI's
HTTP 422 validation response.

### `GET /api/health`

Response, HTTP 200:

```json
{"status":"ok","service":"heatrelay-api"}
```

### `POST /api/v1/weather/context`

Request body:

```json
{
  "latitude": 41.3874,
  "longitude": 2.1686
}
```

`latitude` must be between -90 and 90 and `longitude` between -180 and 180.
These are global WGS84 bounds; weather requests are not restricted to
Barcelona.
The backend requests only current temperature, apparent temperature, relative
humidity, weather code, and same-day maximum temperature, apparent
temperature, and UV index from Open-Meteo. It sends `timezone=auto`, requests
one forecast day, Celsius, and ISO 8601 timestamps, and uses a bounded timeout
with no retries. The backend validates Open-Meteo's coordinate-local IANA
timezone with the Python standard library, resolves the local timestamp and
UTC offset including DST folds, and requires `today.date` to match that local
calendar date.

Successful response shape, HTTP 200:

```text
{
  "retrieved_at": aware UTC datetime,
  "timezone": validated coordinate-local IANA timezone,
  "units": {
    "temperature": "celsius",
    "relative_humidity": "percent",
    "uv_index": "index"
  },
  "current": {
    "observed_at": aware coordinate-local datetime,
    "temperature_c": number,
    "apparent_temperature_c": number,
    "relative_humidity_pct": number,
    "weather_code": integer
  },
  "today": {
    "date": ISO date,
    "temperature_max_c": number,
    "apparent_temperature_max_c": number,
    "uv_index_max": number
  },
  "source": {
    "name": "Open-Meteo",
    "url": "https://open-meteo.com/en/docs",
    "license": "CC BY 4.0",
    "license_url": "https://open-meteo.com/en/license",
    "attribution": "Weather data by Open-Meteo.com."
  },
  "notice": "This is model-derived weather context from Open-Meteo, not an official heat warning."
}
```

Timeouts, non-2xx responses, invalid JSON, missing values, invalid ranges,
invalid or unavailable timezone identifiers, inconsistent UTC offsets,
nonexistent local timestamps, mismatched local daily dates, and upstream
schema mismatches all return the same non-sensitive response, HTTP 503:

```json
{
  "detail": {
    "code": "weather_unavailable",
    "message": "Weather context is temporarily unavailable."
  }
}
```

The error never exposes an upstream body or a URL containing coordinates.

### `POST /api/v1/situation/extract`

Request body:

```json
{
  "situation_text": "Synthetic case: I am helping an older relative who says they have no home cooling."
}
```

The request must be a strict JSON object containing only `situation_text`.
The value must be a real string; the backend trims it, rejects blank content,
rejects unsupported control or surrogate characters, and limits the retained
text to 2,000 Unicode code points. The text stays in the JSON body and is
never placed in a URL, echoed in a response, or included in an API error.

The model-facing Structured Output contains only these required fields:

- `detected_input_language`: `en`, `es`, `ca`, `fr`, `de`, `it`, `pt`, `ru`,
  `uk`, `ar`, `other`, or `unknown`.
- `preferred_language`: status `not_stated`, `no_preference`, or `reported`,
  plus a supported language value, `other`, or `null`. Message language alone
  never establishes a preference.
- `vulnerability_factors`, `mobility_constraints`, `time_constraints`, and
  `reported_symptoms`: status `not_stated`, `unknown`, `explicit_none`, or
  `reported`, plus a closed list of values. Only `reported` may contain
  values; duplicates fail validation and accepted values use backend-defined
  order.
- `cooling_access` and `housing_situation`: status `not_stated`, `unknown`, or
  `reported`, plus one closed value or `null`. Only `reported` may contain a
  value.

Vulnerability values are `older_adult`, `young_child_in_household`,
`pregnancy_reported`, `chronic_condition_reported`, `disability_reported`,
`outdoor_worker`, `living_alone`, `housing_insecurity`, and
`caregiver_responsibility`. Mobility values are `walks_slowly`,
`limited_walking_distance`, `step_free_access_required`,
`wheelchair_access_required`, `cannot_travel_alone`, and
`cannot_leave_current_location`. Cooling values are `air_conditioning`,
`fan_only`, and `no_home_cooling`; housing values are `stable_housing`,
`temporary_housing`, and `unsheltered`. Time values are `cannot_leave_now`,
`must_leave_soon`, `daytime_only`, `evening_only`,
`must_return_by_deadline`, `work_schedule`, and `caregiving_schedule`.
Symptom values are `confusion`, `fainting_or_loss_of_consciousness`, `seizure`,
`difficulty_breathing`, `chest_pain`, and `repeated_vomiting`.

Successful response shape, HTTP 200:

```text
{
  "schema_version": "1.0.0",
  "detected_input_language": supported language code,
  "preferred_language": {"status": status, "value": code | null},
  "vulnerability_factors": {"status": status, "values": [...]},
  "mobility_constraints": {"status": status, "values": [...]},
  "cooling_access": {"status": status, "value": value | null},
  "housing_situation": {"status": status, "value": value | null},
  "time_constraints": {"status": status, "values": [...]},
  "reported_symptoms": {"status": status, "values": [...]},
  "missing_information": [
    "preferred_language" | "vulnerability_factors" |
    "mobility_constraints" | "cooling_access" | "housing_situation" |
    "time_constraints" | "reported_symptoms"
  ],
  "notice": "This output is a structured summary of explicitly reported information. It is not medical advice, an emergency assessment, or an action plan."
}
```

Backend code computes `missing_information` in a fixed order. A field is
missing only when its status is `not_stated` or `unknown`; `no_preference` and
`explicit_none` are not missing. The endpoint transcribes bounded categories
and does not diagnose, assess an emergency, choose an action, or generate a
plan.

Malformed JSON, wrong types, blank or excessive text, unsupported controls,
and extra request fields return this route-specific response, HTTP 422:

```json
{
  "detail": {
    "code": "invalid_situation_request",
    "message": "Situation request is invalid."
  }
}
```

Other failures use the same non-sensitive `detail` envelope:

| HTTP | Code | Message |
| ---: | --- | --- |
| 502 | `situation_extraction_refused` | `Situation extraction was refused.` |
| 502 | `situation_extraction_invalid_response` | `Situation extraction returned an unusable response.` |
| 503 | `situation_extraction_not_configured` | `Situation extraction is not configured.` |
| 503 | `situation_extraction_unavailable` | `Situation extraction is temporarily unavailable.` |
| 504 | `situation_extraction_timeout` | `Situation extraction timed out.` |

The backend uses the OpenAI Responses API with model alias `gpt-5.6`, a fixed
versioned developer instruction, the user text as a separate untrusted user
message, Pydantic Structured Outputs, no tools, no streaming, no retries,
`reasoning.effort="none"`, and a 1,024-token output cap. The client is pinned
explicitly to `https://api.openai.com/v1`, so an inherited
`OPENAI_BASE_URL` cannot redirect the credential or situation text. The SDK
request timeout is 30 seconds and the `responses.parse` await has a separate
30-second bound. The request path waits at most one second for best-effort
client cleanup. If cleanup exceeds that interval, HeatRelay emits a fixed
generic warning, requests task cancellation, and detaches the task while
safely consuming its eventual outcome; reaching the interval does not prove
that the underlying client finished closing. These are separate limits, not
an exact 30-second end-to-end deadline. The adapter rejects refusals,
incomplete responses, partial or multiple parsed outputs, unexpected content,
and locally invalid schema or status/value combinations without attempting
JSON repair or a second model request.

### `POST /api/v1/places/candidates`

Request body:

```json
{
  "origin": {
    "latitude": 41.3874,
    "longitude": 2.1686
  },
  "evaluation_datetime": "2026-07-20T10:00:00+02:00",
  "required_features": {
    "indoor_space": true,
    "potable_water": false,
    "toilets": false,
    "micro_shelter": false,
    "pets_allowed": false
  },
  "maximum_distance_m": 5000.0,
  "limit": 5
}
```

`evaluation_datetime` must include a timezone offset. `maximum_distance_m`
must be positive, and `limit` must be an integer from 1 through 10. The
`required_features` object is optional; omitted flags default to `false`.
Setting a flag to `true` requires the official source state to be exactly
`true`; both `false` and `null` fail that requirement.

Successful response shape, HTTP 200:

```text
{
  "candidates": [
    {
      "place_id": string,
      "source_record_id": string,
      "name": string,
      "address": {
        "street": string | null,
        "number": string | null,
        "postal_code": string | null,
        "city": string | null
      },
      "district": string | null,
      "neighborhood": string | null,
      "latitude": number,
      "longitude": number,
      "distance_m": integer,
      "closes_at": aware Europe/Madrid datetime,
      "accessibility": true | false | null,
      "features": {
        "indoor_space": true | false | null,
        "potable_water": true | false | null,
        "toilets": true | false | null,
        "micro_shelter": true | false | null,
        "pets_allowed": true | false | null
      },
      "information_url": string | null,
      "schedule_verification_status": "verified",
      "source_modified_at": aware datetime,
      "source_url": string,
      "last_checked": ISO date
    }
  ],
  "snapshot": {
    "schema_version": string,
    "snapshot_id": string,
    "publisher": string,
    "dataset_url": string,
    "distribution_url": string,
    "retrieved_at": aware UTC datetime,
    "upstream_max_modified": aware datetime,
    "license": "CC BY 4.0",
    "license_url": "https://creativecommons.org/licenses/by/4.0/",
    "attribution": string,
    "normalized_sha256": lowercase SHA-256
  },
  "explanation": string,
  "hours_warning": "Municipal opening hours may change; check the official source before travel.",
  "candidate_notice": "These are factual, backend-approved candidate places, not medical recommendations."
}
```

An empty match is HTTP 200 with `"candidates": []` and this explanation:

```text
No official place in this snapshot met the requested straight-line distance,
verified opening-hours, and required-feature filters. No fallback place was
invented.
```

If the versioned snapshot or manifest cannot be loaded or validated, the
endpoint returns HTTP 503:

```json
{
  "detail": {
    "code": "places_unavailable",
    "message": "Verified place data is temporarily unavailable."
  }
}
```

Candidates are factual place matches, not medical recommendations.

## Barcelona snapshot

The approved source is Ajuntament de Barcelona's
[climate-shelter dataset](https://opendata-ajuntament.barcelona.cat/data/en/dataset/xarxa-refugis-climatics),
using only its
[official JSON distribution](https://opendata-ajuntament.barcelona.cat/data/dataset/8f9da263-ff41-4765-ab0d-61b97d7a00b2/resource/d88129fe-7aaa-4ae6-b9fd-908ad3f7480d/download).
The source and HeatRelay's normalized subset are documented under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

Snapshot `barcelona-climate-shelters-v1-2026-07-16` uses schema `1.0.0` and
contains 15 deliberately selected records, not complete Barcelona coverage.
Twelve have manually reviewed, source-traceable 2026 schedules. Three retain
unknown schedules and can never be returned as open candidates. Unknown
source facts remain `null`. Municipal and participating-place hours can
change; every response tells clients to check the official source before
travel.

Normalized place coordinates must fall within the inclusive Barcelona pilot
bounds latitude `41.2` through `41.6` and longitude `1.9` through `2.4`.
These bounds apply only to official place records: weather coordinates and a
place-search origin remain valid at their global WGS84 ranges. Refreshes also
fail closed if a reviewed address is hidden or a raw information URL contains
whitespace or control/format artifacts, malformed percent escapes, invalid
host or port syntax, credentials, or is not absolute HTTP(S). Accepted URLs
are retained exactly as supplied.

This correction does not change the snapshot or manifest bytes. The normalized
snapshot SHA-256 remains
`c958b7ba10b133132d9f1c8b98d84cd1b53644d27cbbd225b5b46bb98d89202b`.

The approximately 42 MB upstream file is not committed. See
[data/barcelona/README.md](data/barcelona/README.md) for the review rules and
full provenance details.

Normalize an already downloaded official JSON file:

```sh
.venv/bin/python scripts/normalize_barcelona_places.py \
  --input /absolute/path/to/official-climate-shelters.json \
  --retrieved-at YYYY-MM-DDTHH:MM:SSZ
```

Or download the official JSON in memory and normalize it directly:

```sh
.venv/bin/python scripts/normalize_barcelona_places.py \
  --download \
  --retrieved-at YYYY-MM-DDTHH:MM:SSZ
```

Use the real UTC retrieval time. Before replacing a snapshot, review upstream
changes, timetable hashes and visibility, every normalized interval, the
manifest counts and hashes, address visibility, unchanged strictly validated
information URLs, Barcelona place bounds, and the licensing. Run the command
twice with the same raw bytes and retrieval time and confirm byte-identical
outputs. Never silently overwrite a reviewed version when its assumptions
changed.

## Deterministic place rules

The backend:

1. Loads and validates the snapshot and manifest, including IDs, provenance,
   counts, normalized SHA-256, strict raw HTTP(S) URL syntax, and the
   Barcelona-only bounds for source-backed place coordinates.
2. Excludes places beyond `maximum_distance_m`.
3. Excludes missing, unknown, ambiguous, expired, or otherwise unverified
   schedules.
4. Evaluates schedules in `Europe/Madrid`, including seasonal ranges,
   weekdays, multiple intervals, and overnight intervals. Opening is
   inclusive; closing is exclusive.
5. Applies required features fail-closed.
6. Sorts by raw Haversine distance, then `place_id` ascending as the complete
   tie-breaker.
7. Rounds returned distance to integer metres and applies `limit`.

No fallback place is invented.

## Privacy, safety, and source limits

Coordinates are accepted in JSON request bodies rather than query parameters,
so they do not appear in normal access-log URLs. HeatRelay does not
intentionally log or store exact coordinates or request bodies. The browser
does not call these endpoints or access geolocation.

Weather accepts global coordinates and uses the coordinate-local timezone
returned by Open-Meteo. Place schedules remain fixed to `Europe/Madrid`, and
verified place coverage remains Barcelona-only; a place-search origin may be
outside Barcelona.

The weather backend sends exact coordinates to Open-Meteo. Open-Meteo's
[Terms and Privacy](https://open-meteo.com/en/terms) say troubleshooting logs
may contain geographic coordinates and are deleted after 90 days. Their data
is model-derived and supplied without accuracy or availability guarantees;
it is not an official heat warning. The free API is subject to its current
non-commercial terms and request limits.

Situation text is sent from the backend to OpenAI for structured extraction.
HeatRelay does not intentionally log or persist the raw text, complete model
response, parsed sensitive fields, API response IDs, or request and response
bodies. The API response and its sanitized errors do not echo the submitted
text. The OpenAI request sets `store=False`, which asks the Responses API not
to store the response for later retrieval; this is not a claim of zero
provider retention. It also sets explicit prompt-cache mode and supplies no
cache breakpoint, so the request does not rely on an implicit prompt-cache
breakpoint. Provider data controls and retention policies remain distinct
from HeatRelay's application-side handling.

HeatRelay is informational, not a medical or emergency service. Situation
extraction is a bounded summary of reported facts and does not issue
personalized guidance. If someone is in immediate danger, contact local
emergency services.

The example environment file contains an empty backend-only placeholder. A
real OpenAI API key remains server-side, must never use a `VITE_` prefix, and
must never be committed or passed to the frontend process.

## Project layout

```text
backend/                    FastAPI services, validation, and pytest coverage
backend/app/situation.py    Injected OpenAI extraction adapter and schemas
data/barcelona/             Versioned snapshot, manifest, and data notes
frontend/                   React, Vite, TypeScript shell and smoke test
scripts/dev.py              Coordinated local process supervisor
scripts/normalize_barcelona_places.py
                            Deterministic official-source normalizer
docs/ARCHITECTURE.md        Current boundaries and deferred pipeline stages
docs/BUILD_LOG.md           Work, decision, publication, and verification record
docs/COMPLIANCE.md          Competition, source, privacy, and license record
```

## Documentation and license

- [Architecture](docs/ARCHITECTURE.md)
- [Build log](docs/BUILD_LOG.md)
- [Compliance, data sources, and direct dependency licenses](docs/COMPLIANCE.md)
- [Barcelona snapshot notes](data/barcelona/README.md)
- [MIT License](LICENSE)
