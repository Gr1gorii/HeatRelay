# HeatRelay

**From heat warning to a safe next step.**

HeatRelay is being designed to turn trusted heat information into clear,
practical next steps. Barcelona is the boundary for the first MVP's verified
place catalog; weather context accepts valid global coordinates. Milestone 1
added bounded backend fact services and a reviewed municipal-data snapshot.
Milestone 2 added extraction-only, server-side GPT-5.6 processing for a bounded
multilingual situation profile. Milestone 3 adds a Barcelona-pilot,
server-owned action workflow with deterministic priority and a second grounded
GPT-5.6 code-selection step. The pilot accepts origins only inside a documented
rectangle; that coarse bound is not a municipal-boundary geofence. The existing
English interface is not connected to these APIs.

## Implemented scope through Milestone 3

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
- Strict `POST /api/v1/action-plan` orchestration for the Barcelona pilot.
- Versioned deterministic action priority, a fixed urgent-contact branch, and
  request-scoped accessibility and movement eligibility.
- A second GPT-5.6 Structured Output task that selects only closed action,
  item, reason, phrase, and exact backend-approved candidate-ID codes; backend
  code validates and hydrates every public fact and sentence.
- Backend-owned required action and explanation codes that the second model
  cannot omit, plus exact no-travel/travel consistency checks.
- Strict request, upstream, snapshot, manifest, and response validation.
- Offline backend tests, a frontend rendering smoke test, production build,
  and coordinated local development command.

The browser does not call the backend APIs, request location, display live
weather, submit situation text, or recommend a place. Official heat-warning
retrieval, medical diagnosis or risk scoring, free-form medical or emergency
decision logic, maps, routes, travel times, authentication, analytics,
deployment, additional cities, frontend integration, and the full user-facing
golden path remain **unimplemented**.

## Intended audience

HeatRelay is planned for people especially vulnerable to heat and for people
assisting them. This includes older adults living alone, people without air
conditioning, people with limited mobility or language barriers, outdoor
workers, families with young children, and relatives, neighbors, or care
workers helping someone take a safer next step.

## Server-side GPT-5.6 boundary

Milestone 3 implements two separately bounded GPT-5.6 tasks:

1. **Implemented:** multilingual extraction of explicitly reported facts into
   a bounded backend schema.
2. **Implemented:** grounded selection and sequencing from backend-owned action,
   item, reason, phrase, and request-scoped candidate-ID catalogs.

Deterministic backend code—not GPT-5.6—owns weather facts, opening-hours and
feature eligibility, distance ranking, schema enforcement, canonical ordering,
missing-information reconciliation, action priority, urgent contacts,
candidate eligibility, candidate-ID validation, public prose, and factual
validation. The second call never receives raw situation text, origin or place
coordinates, candidate names or addresses, URLs, phone numbers, source
metadata, or full schedules.

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

OpenAI requires a separate API key and billing for live extraction and grounded
plan generation. Create the ignored repository-root file from the tracked
placeholder:

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
sending an API request; tests of extraction and plan traffic use injected
fakes.

The ordinary suite never makes a paid call. Milestone 2's extraction smoke,
Milestone 3's initial grounded-plan pass-1 smoke, and one separately authorized
final corrected-contract grounded-plan smoke completed on 2026-07-17 and are
not part of `make test`; only safe, redacted evidence belongs in
`docs/BUILD_LOG.md`. The final smoke made exactly one direct plan-service
request with zero retries. Synthetic fixtures verify contracts and adversarial
invariants, and neither live plan smoke proves general model accuracy.

The Milestone 3 adversarial correction implementations and their ordinary
verification remained offline. The earlier grounded-plan smoke remains
historical pass-1 evidence because it predates the later shared normal-plan and
public-validation corrections; the separately authorized final smoke exercised
the corrected direct grounded-plan schema, allowed-code, and exact candidate-
whitelist path. Any future live call requires separate author authorization and
a fresh official price check.

The Milestone 3 focused offline matrices exercise policy, workflow, adapter,
grounding, and HTTP contracts. The request-scoped-ID matrix accepted the one
exact candidate ID and rejected all 15 fabricated, filtered, padded,
case-changed, encoded, and Unicode-confusable variants. This proves the tested
contract invariant—zero accepted noncandidate IDs—not live-model accuracy.

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
`explicit_none` are not missing. The public model requires that list to match
the canonical reconciliation exactly, including order and uniqueness. The
standalone endpoint revalidates even a bypass-constructed service response;
invalid standalone output uses the sanitized 502 extraction error, while an
invalid nested action-plan profile uses the sanitized 503 workflow error. The
endpoint transcribes bounded categories and does not diagnose, assess an
emergency, choose an action, or generate a plan.

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
request timeout is 30 seconds and the extraction adapter has a hard 30-second
overall asynchronous request-path budget implemented with an explicit task.
If cancellation is resisted, the task is cancelled and detached best effort;
its eventual outcome is consumed without exposing private data, and the
timeout does not prove that provider work stopped. Client cleanup receives
only the time remaining in that overall budget, capped at one second. If no
budget remains or cleanup exceeds its allowance, HeatRelay emits a fixed
generic warning and detaches the cleanup without cancelling it; reaching the
bound does not prove that the underlying client finished closing. A provider
and cleanup reservation must both be available before either adapter
constructs an OpenAI client. Every constructed client keeps its cleanup
reservation until actual closure succeeds; failed closure is retained in a
finite fail-closed quarantine so SDK destruction cannot schedule untracked
cleanup work. Both adapters share process-local, non-queueing capacity for at
most four actual provider tasks and four constructed-client cleanup paths.
Saturation returns the existing sanitized unavailable response before client
construction or provider work. Provider capacity remains occupied until its
underlying task really finishes. Extraction also rechecks its remaining
monotonic budget immediately before scheduling `responses.parse`; synchronous
client-factory work cannot be preempted, but an expired budget starts no
provider coroutine.
The adapter rejects refusals,
incomplete responses, partial or multiple parsed outputs, unexpected content,
and locally invalid schema or status/value combinations without attempting
JSON repair or a second model request. Aggregate situation telemetry accepts
only the configured model name and reviewed returned alias; every other
provider-controlled model string is recorded as `unavailable`.

### `POST /api/v1/action-plan`

This endpoint is explicitly limited to the Barcelona pilot. Weather requests
remain global, but this workflow rejects an origin outside the inclusive
latitude `41.2`–`41.6`, longitude `1.9`–`2.4` pilot rectangle so Barcelona
policy and place data are not silently applied elsewhere. These separately
named public-origin bounds intentionally match the current place-record
validation rectangle, but neither rectangle proves municipal membership or
acts as a Barcelona administrative-boundary geofence.

Strict request body:

```json
{
  "situation_text": "Synthetic case: I have no home cooling and use a wheelchair.",
  "origin": {"latitude": 41.3874, "longitude": 2.1686},
  "maximum_distance_m": 3000
}
```

`situation_text` uses the same trimmed, nonblank, 2,000-code-point boundary as
the extraction endpoint. `maximum_distance_m` is an optional strict integer
from `100` through `10000` and defaults to `3000`. The client cannot supply an
extracted profile, weather, priority, candidate, place ID, feature assertion,
evaluation time, or source metadata. Invalid input receives the fixed
`422 invalid_action_plan_request` response without echoing text or origin.

After extraction completes, the backend captures one aware UTC
`evaluation_time` for the remainder of the normal workflow. That instant
labels the workflow and is passed unchanged to the local place query; place
schedules convert it to `Europe/Madrid`. The Barcelona-pilot weather response
must also identify `Europe/Madrid`, and both its observed date and
`today.date` must equal the evaluation instant's Barcelona local date.
Retrieval must be aware UTC, no earlier than the evaluation instant, and no
later than the five-second weather request allowance plus one second.
Observation age may be at most 90 minutes, with no more than five minutes of
future skew relative to retrieval. All numeric weather values must be finite
and inside their existing reviewed ranges, and each same-day temperature
maximum must be at least its corresponding current value. Any incoherence
fails the whole normal workflow through the sanitized unavailable boundary,
before priority, places, or plan generation, so a previous-day place schedule
cannot be combined with next-day weather and impossible maxima are never
repaired. Weather timestamps remain source-owned; they are not rewritten to
equal the workflow instant. The urgent branch captures its evaluation time
after extraction but does not retrieve weather or places. Independently, the
HTTP endpoint captures strict UTC instants immediately before and after the
workflow call and accepts either response branch only when its evaluation time
falls inside that interval. This endpoint-owned check runs before final trusted
place-repository reconciliation.

The server then runs this closed sequence:

1. GPT-5.6 extracts the bounded M2 situation profile.
2. Any explicitly reported bounded warning symptom selects a fixed urgent
   branch. Weather, place lookup, and the second GPT call are skipped.
3. Otherwise Open-Meteo supplies the existing model-derived weather context.
4. Backend policy `heatrelay-barcelona-action-policy-1.0.0` applies the highest
   matching rule: `urgent_help`; `act_now` at `>=36.0°C`; `prepare_now` at
   `>=34.0°C` or for an explicit preparation factor; otherwise
   `monitor_and_prepare`.
5. The immutable Barcelona snapshot supplies verified-open, distance-ranked
   candidates. Wheelchair or step-free requirements retain only
   `accessibility=true`; `false` and `null` fail closed. That flag does not
   prove route or travel compatibility. A status of `unknown`, or any reported
   bounded value, in either the time-constraint or mobility-constraint field
   suppresses immediate travel because the retained extraction does not
   contain the exact time, deadline, route, travel time, or walking range
   needed to prove compatibility. The response
   includes the fixed `unresolved_travel_constraint` reason and notice:
   “Immediate travel was not offered because compatibility with an explicitly
   reported time or mobility constraint could not be verified.” Explicit
   inability to leave additionally requires `remain_at_current_location`;
   inability to travel alone requires `contact_support_person`, even though
   immediate travel remains suppressed.
6. Exactly one second GPT-5.6 call selects closed codes and at most one exact
   ID from no more than three frozen request candidates.
7. Backend code rejects the whole plan if any code or ID violates the dynamic
   whitelist or policy, then hydrates accepted codes and place facts from fixed
   catalogs and the frozen candidate objects.

The `34.0°C` and `36.0°C` boundaries are transparent HeatRelay heuristics based
on Barcelona's published daytime thresholds. Open-Meteo does not supply an
official alert, and matching a boundary does not prove municipal activation.
The urgent policy routes every value in the current closed six-symptom catalog
to fixed server-owned `112` content: confusion, fainting or loss of
consciousness, seizure, difficulty breathing, chest pain, and repeated
vomiting. Code asserts that this universal set exactly equals the extraction
catalog so a future symptom cannot silently inherit a default contact. This is
a bounded server-owned routing rule, not a diagnosis or broader symptom
recognition. Urgent output contains no normal plan or climate-shelter
recommendation and states that shelters do not replace medical attention.

Policy version `heatrelay-barcelona-action-policy-1.0.0` was reviewed on
2026-07-17 against the official
[Barcelona daytime thresholds](https://ajuntament.barcelona.cat/serveissocials/es/noticia/crece-la-red-de-refugios-climaticos-para-protegerse-del-calor_1523924),
[climate-shelter limitations and hours warning](https://www.barcelona.cat/barcelona-pel-clima/ca/accions-concretes/xarxa-de-refugis-climatics),
[Canal Salut heat guidance](https://canalsalut.gencat.cat/ca/vida-saludable/consells-estacionals/estiu/calor/efectes-exces/),
[Catalonia 112 guidance](https://112.gencat.cat/es/us-del-112/preguntes-frequeents/),
and [WHO heat-health guidance](https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health).
The publisher, access date, and exact derived HeatRelay rule are also retained
in the server-owned policy metadata and compliance record.

HeatRelay also applies a conservative WHO-derived fan boundary. Explicitly
reported air conditioning may expose the existing home-cooling action. An
explicitly reported fan-only option may expose that action only when both the
current temperature and model-derived same-day maximum are strictly below
`40.0°C`; exactly `40.0°C` or above on either value fails closed. This is a
HeatRelay cooling-action rule, not an official alert threshold.

### Backend-owned minimum plan matrix

One pure backend-owned normal-plan contract derives the applicable movement,
support, accessibility, unresolved-travel, cooling, household, housing,
language, and candidate facts. It produces the exact allowed code lists and
delegates the required minimum to the single canonical matrix below. Context
construction and strict public normal-response validation use that same
contract. The second model may select only compatible supplemental codes from
its derived allowed lists. It cannot omit this deterministic core, and every
backend priority reason must be returned in canonical order.
`movement_prohibited`, `travel_support_required`,
`unresolved_travel_constraint`, and `verified_open_candidate` must appear
exactly when their corresponding branch fact applies:

| Priority | Required `now` codes | Required `next_few_hours` codes | Required `tonight` codes |
| --- | --- | --- | --- |
| `act_now` | `move_to_cooler_space`, `reduce_physical_effort`, `drink_water` | `keep_drinking_water`, `stay_in_cool_space`, `check_updated_weather` | `sleep_in_coolest_available_room`, `keep_water_nearby`, `check_updated_weather_tonight` |
| `prepare_now` | `move_to_cooler_space`, `reduce_physical_effort`, `drink_water` | `keep_drinking_water`, `check_updated_weather`, `prepare_for_tonight` | `sleep_in_coolest_available_room`, `keep_water_nearby`, `check_updated_weather_tonight` |
| `monitor_and_prepare` | `move_to_cooler_space`, `reduce_physical_effort`, `drink_water` | `check_updated_weather`, `prepare_for_tonight` | `keep_water_nearby`, `check_updated_weather_tonight` |

`drink_water` and the continuing hydration actions retain their existing
conditional wording (“if you can do so safely” or equivalent); they are not
medical instructions tailored to an individual condition.

For explicitly reported `unsheltered` housing, the canonical matrix removes
`sleep_in_coolest_available_room`, and `ventilate_when_outside_is_cooler` is
not allowed. The retained tonight core uses only actions that do not assume a
room, home, or window. It also never exposes `use_available_home_cooling`, even
when air conditioning or safely bounded fan-only cooling was reported. Those
cooling paths remain available for stable or temporary housing, with fan-only
cooling still requiring both current and same-day maximum temperature to be
strictly below `40.0°C`. This branch does not invent shelter availability or a
destination; temporary housing remains a separate condition.

Successful responses form a strict union on `branch`:

- `urgent` contains schema/policy versions, the server evaluation time, the
  normalized situation, fixed priority/reasons, fixed contact/actions, and
  safety notices. It contains no weather, candidate, or generated plan.
- `normal` contains those server-owned identifiers plus the exact normalized
  weather context, backend-hydrated `now`, `next_few_hours`, and `tonight`
  sections, bring items, explanation codes, one fixed Spanish or Catalan
  phrase when travel is selected or `null` otherwise, an exact selected
  backend candidate projection or `null`, snapshot provenance,
  and hours, straight-line-distance, reachability, and informational notices.
  The projection preserves trusted name, address, distance, accessibility,
  closing time, features, source, last-checked data, and provenance, but omits
  candidate coordinates so it cannot echo an exact origin that coincides with
  a place.

The local phrase is chosen from reviewed fixed text. Catalan is offered only
when the explicit preferred language or, absent a preference, detected input
language is Catalan; every other case deterministically falls back to Spanish.
This is not runtime free-form translation.

The model-facing plan output has no free-form text. It contains only bounded
phase action-code lists, bring-item codes, explanation-reason codes, one
nullable phrase code, and one nullable `selected_place_id`. With no selected
place and travel action, bring items must be empty and the phrase must be
`null`. A travel branch requires one exact selected ID, the `now` travel code,
at least `water` and `phone`, and one allowed local phrase; none of those
travel fields is accepted independently. Keys remain optional. The backend
requires byte-exact membership in this request's candidate set, rejects case
changes, whitespace,
Unicode confusables, stale or filtered IDs, and never repairs or partially
accepts an invalid plan. Later phases cannot reference a place.
Backend code does not offer a mobility-aid item without an explicit bounded
source fact, and it offers the household-member check only when a young child
in the household was explicitly reported.

The same canonical required-code function is enforced when the model context
is built, when that context is validated, after Structured Output parsing, and
again in the strict public normal-response model. Separately, the shared
normal-plan contract requires every public selected code to be a subset of the
situation-, weather-, and candidate-derived allowed lists. It also requires the
exact deterministic reasons, with `verified_open_candidate` present if and
only if travel is selected. Public urgent and normal models enforce their
remaining branch invariants and byte-exact backend catalog hydration, so
directly constructed or response-model-serialized inconsistent objects fail
closed rather than bypassing workflow checks.

Before planning, the workflow revalidates every candidate and snapshot field,
including canonical paired IDs, nonblank text, finite Barcelona place
coordinates, aware timestamps, lowercase SHA-256 values, and absolute
credential-free HTTP(S) URLs. The authoritative immutable snapshot identity is
derived from the validated committed snapshot and manifest: schema and
snapshot IDs, publisher, dataset and distribution URLs, retrieval and upstream
modification timestamps, license and URL, attribution, and normalized SHA-256
must all match. Candidate source and chronology must agree with that identity.
The backend recomputes Haversine distance from the private request origin and
requires exact integer agreement with `distance_m`; forged or out-of-range
distances fail as unavailable place data before GPT is called.

At the final API boundary, a selected projection is independently reconciled
with the committed repository using the private request origin, server
evaluation time, request distance preference, and applicable accessibility
filter. Its ID and immutable fields must match an eligible committed record,
its closing time must be later than evaluation, and its disclosed distance
must remain within the request maximum. This is a concrete independent trust
source for the selected projection; it is not a blanket claim that every
arbitrarily malicious internal dependency can be made safe.

Plan-stage failures use fixed non-sensitive errors:

| HTTP | Code |
| ---: | --- |
| 502 | `action_plan_generation_refused` |
| 502 | `action_plan_generation_invalid_response` |
| 503 | `action_plan_generation_not_configured` |
| 503 | `action_plan_generation_unavailable` |
| 503 | `action_plan_unavailable` |
| 504 | `action_plan_generation_timeout` |

Extraction, weather, and place-stage failures retain their existing stable
codes. A required source failure never returns a partial normal plan.

The second adapter uses the same pinned OpenAI base URL, `gpt-5.6` alias,
Responses API, Pydantic Structured Outputs, `reasoning.effort="none"`,
`store=False`, explicit cache mode without a breakpoint, zero SDK or
application retries, a 30-second SDK timeout, a hard 30-second request-path
wait around the plan call, a one-second request-path cleanup wait, and a
1,024-token output cap. On plan-call timeout, the provider task is cancelled
and detached best effort; a fixed callback consumes its eventual outcome, and
the timeout does not prove the underlying provider coroutine completed. It
fixes `service_tier="default"`
for the documented standard pricing path. Before client construction it counts
the compact UTF-8 serialization of the complete application-defined
model-visible request: developer and user role/content wrappers, versioned
instruction, minimized serialized context, and the fully wrapped strict JSON
Schema response format used to represent `text_format`. It fails closed above
`20,000` bytes. Candidate closing timestamps are bounded, timezone-aware typed
values before entering that payload. Both adapters share the finite
four-provider/four-cleanup process-local capacities described above. The two
sequential GPT stages do not share one exact end-to-end deadline: extraction
uses its overall budget for provider and cleanup waiting, while the plan
adapter retains separate provider and cleanup wait bounds.

An offline real-SDK regression uses `openai==2.46.0` with
`httpx.MockTransport` to compare the SDK's actually serialized `input` and
`text.format` bytes with the application-owned payload representation,
including multibyte content. Related real-client regressions exercise cleanup
saturation and garbage collection without opening a network socket.

At the standard rates reviewed on 2026-07-17 (`$5.00`/M input and
`$30.00`/M output for `gpt-5.6-sol`), conservatively treating every allowed
payload byte as one input token plus all 1,024 output tokens yields a configured
upper estimate of `$0.13072`, below the authorized `$0.15` smoke ceiling. Rates
were applied again before the separately authorized final smoke; this bound is
not measured billing. That one corrected-contract attempt used 1,326 input and
171 output tokens, for a coarse standard-rate estimate of `$0.01176`. Any
future live call requires separate author authorization and a fresh official
price check.

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
outside Barcelona. The separate action-plan workflow is intentionally stricter:
its origin must be inside the documented Barcelona pilot rectangle because the
workflow applies Barcelona policy. The rectangle is a coarse product-coverage
bound, not a municipal-membership determination or administrative geofence.

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

The second GPT-5.6 call receives only the validated bounded profile, minimal
weather numbers, deterministic priority/reason codes, and up to three frozen
request-scoped place records containing only `place_id`, integer straight-line
`distance_m`, `closes_at`, accessibility, indoor-space, potable-water, toilets,
micro-shelter, and pets-allowed states, plus closed allowed-code lists. It does
not receive raw situation text, origin or candidate coordinates,
names, addresses, URLs, phone numbers, credentials, source metadata, or full
schedules. The same `store=False` and explicit-cache caveats apply. Exact
origin and raw text are absent from successful action responses and fixed
errors, and HeatRelay does not intentionally log request/response bodies,
parsed sensitive profiles, complete provider responses, or response IDs.

HeatRelay is informational, not a medical or emergency service. The urgent
branch is a fixed transcription-triggered contact rule, not a diagnosis or a
claim that GPT assessed an emergency. Climate shelters are not substitutes for
medical attention.

The example environment file contains an empty backend-only placeholder. A
real OpenAI API key remains server-side, must never use a `VITE_` prefix, and
must never be committed or passed to the frontend process.

## Project layout

```text
backend/                    FastAPI services, validation, and pytest coverage
backend/app/situation.py    Injected OpenAI extraction adapter and schemas
backend/app/grounded_plan.py
                            Closed second-call adapter and dynamic validation
backend/app/action_plan.py  Barcelona policy, orchestration, and hydration
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
