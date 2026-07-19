# HeatRelay architecture

## Current application boundary

The React, Vite, and TypeScript frontend implements one localized Barcelona
demo flow for `POST /api/v1/action-plan`. It sends exactly the user's trimmed
situation text, fixed origin latitude `41.3874` and longitude `2.1686`, maximum
distance `3000` metres, and the exact selected `output_locale`. It does not
request browser geolocation or call the situation, weather, or places
endpoints separately. Vite proxies `/api` to `http://127.0.0.1:8000` during
local development.

The FastAPI backend exposes five application contracts:

- `GET /api/health` — stable service health.
- `POST /api/v1/weather/context` — normalized Open-Meteo weather context.
- `POST /api/v1/places/candidates` — deterministic candidates from the
  committed Barcelona snapshot.
- `POST /api/v1/situation/extract` — bounded multilingual extraction of
  explicitly reported facts through server-side GPT-5.6.
- `POST /api/v1/action-plan` — bounded Barcelona-pilot server orchestration
  with deterministic priority and request-grounded GPT-5.6 code selection.

Both context endpoints use strict JSON request bodies, so origin coordinates
do not appear in normal access-log URLs. HeatRelay does not intentionally log
or store coordinates or request bodies. Weather coordinates are sent
server-side to Open-Meteo; place selection is local. Weather accepts global
WGS84 coordinates, while the verified place catalog remains Barcelona-only.
The situation endpoint also accepts a strict JSON body: its text does not
appear in a URL, and HeatRelay does not intentionally log, persist, or echo
it. That text is sent server-side to OpenAI for extraction. The action-plan
route also accepts text and origin only in a strict body, does not echo either,
and rejects origins outside the inclusive Barcelona pilot rectangle. Its
separately named public-origin constants intentionally match the current
place-record validation rectangle, but a coarse rectangle does not prove
municipal membership and is not an administrative-boundary geofence. The
frontend uses the same-origin action-plan path and does not receive an API key.
Successful action-plan responses use schema `1.16.0`; their nested situation
projection remains schema `1.1.0`.

## Implemented frontend integration

The single-page form keeps situation text only in React memory, validates its
trimmed value with a 2,000-Unicode-code-point limit, and can populate a
synthetic Barcelona example without submitting it. A valid submit starts at
most one `fetch`, disables duplicate submission while it is pending, and makes
no automatic retry. The request contains exactly `situation_text`, `origin`,
`maximum_distance_m`, and `output_locale`.

Narrow discriminated TypeScript contracts cover only displayed fields, and
strict runtime validation admits usable `normal` or `urgent` schema `1.16.0`
responses only when their response locale matches the submission snapshot.
Unknown or malformed JSON becomes fixed safe copy. The UI renders backend-owned
normal-plan phases, weather, destination or no-place state, urgent contact
content, and safety notices without echoing submitted text in an error.
Frontend tests mock `globalThis.fetch`; they do not establish live end-to-end
operation. A separately authorized one-submission Chrome smoke on 2026-07-18
exercised the real local same-origin path: one observed action-plan POST
returned HTTP 200 and rendered the normal `Prepare now` no-place result with
zero retries. The downstream extraction, Open-Meteo, and grounded-plan calls
were inferred from the completed normal workflow rather than independently
logged. This is one-scenario integration evidence, not exhaustive branch or
reliability coverage. Later bounded Milestone 6 Chrome/macOS audits exercised
multilingual, bidirectional, 320px, actual 200% zoom, and author-confirmed
VoiceOver behavior. A separate four-case live smoke exercised Spanish,
Arabic, Russian-to-Hebrew, and Traditional Chinese urgent output through the
real frontend and backend; those bounded cases are not 25-locale coverage.

## Milestone 6 localization architecture

The canonical locale registry defines 25 bundled interface locales, native
names, English names, and direction metadata. Twenty-one are left-to-right;
`ar`, `ur`, `fa`, and `he` are right-to-left. The frontend imports one bundled
interface catalog per locale, requires exact key and interpolation parity,
uses shared locale-aware formatters, and keeps catalog and documentation checks
synchronized. There is no runtime translation service.

Input detection is closed to 26 language tags: the 25 launch locales plus
input-only Catalan. The validated response also admits the bounded `other` and
`unknown` states and pairs `unknown` with source `fallback`; every other
accepted result uses `automatically_detected`. Interface locale, detected
input language and source, requested output locale, and text direction remain
separate typed concepts.

The backend output registry contains the same 25 output locales in its
canonical API order. It maps each exact code to one independently authored,
immutable `ActionPlanCatalog`; the workflow then hydrates bounded action,
explanation, item, notice, policy, candidate, situation, and weather prose from
exactly that catalog. Catalog modules import shared frozen types but not prose
from another locale. Verified facts, IDs, official names, addresses, phone
numbers, URLs, schedules, timestamps, coordinates, distances, weather values,
ordering, and provenance remain backend-owned and locale-independent.

Frontend preference recovery and API validation intentionally differ. An
invalid, absent, inaccessible, or throwing stored interface/output preference
falls back locally to English without repairing storage. The API accepts only
an exact member of the output registry and rejects unsupported, padded,
case-altered, aliased, or regional values before downstream work. It neither
normalizes nor silently falls back.

## Milestone 5 frontend accessibility and visual-mode boundary

Milestone 5 keeps one React application and one component tree for every
state. The existing `.app-shell` owns exactly one `data-visual-mode` value:
`standard` or `enhanced`. A native, visibly labelled `Visual mode` select
offers `Standard` and `Enhanced Visibility`; it remains available during the
initial, loading, normal, urgent, and error states. Standard and Enhanced
therefore share the same normal, no-place, urgent, loading, validation, and
error components and the same data and safety contracts.

The visual-mode preference uses the single local-storage key
`heatrelay.visual-mode.v1` and accepts only `standard` or `enhanced`. Its
first-load resolution order is:

1. A valid stored value.
2. `prefers-contrast: more` when no valid value is stored and that media query
   is supported and matches.
3. Standard as the safe fallback.

The contrast query is an initial-load fallback, not a live preference
listener. Storage and `matchMedia` read failures fall back safely, and a
storage write failure does not prevent the current in-memory selection from
remaining usable. Only an explicit user change is persisted locally. The
visual mode is never included in an API payload, switching it creates no
request, and situation text is never written to local storage.

## Milestone 6.30 action-plan language preference boundary

The interface locale, detected input language, action-plan output locale, and
text direction remain separate typed concepts. The native action-plan-language
select is inside the existing form and is populated from the same 25-locale
registry in backend order. Its value never changes document `lang`, document
`dir`, or the interface locale. Changing it makes no request, preserves the
current application state, and affects only the next submission.

The exact storage key is `heatrelay.output-locale.v1`. Resolution accepts an
exact registered value or falls back to the existing English default. It does
not trim, normalize, alias, negotiate, inspect browser languages, or derive a
value from the interface locale. Missing, invalid, inaccessible, wrong-type,
or throwing storage therefore yields English without writing a repair. Only an
explicit valid user change is persisted, including an explicit change to
English; a failed write leaves the valid in-memory selection usable.

Submission snapshots the selected locale and passes it to the existing client.
The JSON body remains exactly `situation_text`, `origin`,
`maximum_distance_m`, and `output_locale`. Situation text is never stored.
Visual mode and interface locale are local-only and do not enter the request.
The response must match the submitted locale, while rendered result prose keeps
its response-owned language and direction. M6.30 changes no backend, response
schema, GPT boundary, weather, place, or action-policy behavior.

At the close of the M6.30 slice, language-mismatch messaging, live
multilingual and RTL browser QA, independent human review, final Milestone 6
verification, and publication were still pending.

## Milestone 6.31 deterministic language-context boundary

Language-context rendering uses only the already validated
`detected_input_language` in the response situation and the response-owned
`output_locale`. Classification is ordered and closed: `unknown`, `other`,
Catalan input with unavailable Catalan output, then a mismatch between a
supported input language and the displayed output language. Matching supported
languages produce no input-language notice. Browser language and interface
locale are not comparison inputs, and model confidence or other model-internal
state is not exposed.

The displayed-plan language remains immutable response state. A currently
selected output preference is a separate next-plan fact and is shown only when
it differs from the displayed response. The language-context component is an
ordinary labelled section with a definition list, outside the complete normal
or urgent result. It is neither an alert nor a live region and receives no
automatic focus. A normal result may offer a button whose sole behavior is to
focus the existing action-plan-language select. The urgent variant is passive,
appears only after all fixed `112` guidance and the official link, and has no
change-language action.

M6.31 changed no backend, successful-response schema, output-preference key or
resolution, four-field request, API behavior, GPT prompt or payload, dependency,
weather, place, or action-policy boundary. At the close of that slice,
multilingual and RTL browser and assistive-technology QA, human linguistic and
safety review, final Milestone 6 verification, and publication remained
pending.

## Milestone 6 verification boundary

The completed offline and bounded runtime evidence now includes catalog and
schema invariants across all 25 output locales, exhaustive interface-key and
interpolation parity, 320px multilingual and bidirectional reflow, real Chrome
200% zoom checks, one author-confirmed VoiceOver session without independent
speech logging, and a four-case live multilingual smoke. Corrected audit
findings covered native-name selector clipping, German hero wrapping, and a
Russian status-value flex overflow. The live smoke covered only Spanish,
Arabic, Russian input with Hebrew output, and a Traditional Chinese urgent
case; it is not exhaustive 25-locale runtime evidence.

All 24 non-English interface and backend catalogs remain AI-assisted drafts
without independent native-speaker, linguistic, cultural, medical, emergency,
accessibility, or safety-critical approval. The evidence does not establish
formal WCAG conformance, universal assistive-technology behavior,
cross-browser compatibility, medical approval, deployment readiness, or
release readiness. Milestone 6 is published through the repository commit
containing this architecture revision.

Enhanced Visibility is a CSS-token presentation layer over the same DOM, not
a duplicated route or component tree and not a browser-zoom simulation. It
uses stronger typography, spacing, contrast, borders, focus and state tokens,
larger controls, reduced decoration, and reduced motion. Enhanced itself sets
automatic viewport scrolling. Independently, system
`prefers-reduced-motion: reduce` changes root scrolling to `auto`, reduces
transitions to the existing near-zero duration, and introduces no animation.

The semantic interaction work provides one skip link and programmatically
focusable main target, one named form, permanent textarea descriptions,
programmatically associated field errors, logical focus movement, polite
atomic status updates, native weather `dl`/`dt`/`dd` semantics, and urgent and
page-error alerts. Text and structure continue to identify validation,
loading, priority, phases, warnings, urgent output, disabled controls, and
availability without relying on color alone.

Milestone 5 changes no backend behavior, API contract, GPT workflow,
place/weather data, dependency, or Vite proxy configuration.

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
   place-record validation bounds: latitude `41.2`–`41.6`, longitude
   `1.9`–`2.4`.
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
   That list must exactly equal the canonically ordered `not_stated` and
   `unknown` fields. The standalone HTTP route explicitly revalidates service
   output, and the action-plan response models revalidate the same nested
   contract, mapping failures to their existing sanitized 502 and 503
   boundaries respectively.
   No model-generated advice, plan, diagnosis, place, weather fact, or free-
   form summary is accepted.
6. **Deterministic Barcelona action policy** captures one aware UTC evaluation
   instant after extraction, gives explicitly reported bounded symptoms
   precedence, then applies closed `36.0°C`, `34.0°C`, explicit preparation-
   factor, and baseline rules.
   The numeric boundaries are versioned HeatRelay heuristics derived from
   published municipal daytime thresholds applied to model-derived weather;
   they are not proof of an official alert. GPT cannot alter priority, reason
   codes, policy version, urgent contact, or fixed urgent actions. Every value
   in the closed six-symptom catalog routes to fixed `112` content, and code
   asserts that this universal set exactly equals that catalog. For reported
   fan-only cooling, the existing home-cooling action is allowed only when
   current and same-day maximum temperatures are both strictly below
   `40.0°C`; this conservative WHO-derived HeatRelay boundary is not an
   official alert threshold. Explicitly unsheltered housing never exposes the
   home-cooling action, even with reported air conditioning or safe fan-only
   temperatures; stable and temporary housing retain those bounded paths.
7. **Action candidate eligibility** reuses the immutable snapshot, schedule,
   distance, and ranking path. An explicit wheelchair or step-free requirement
   is applied before rank/limit and accepts only `accessibility=true`.
   Accessibility does not prove reachability. A status of `unknown`, or any
   reported bounded value, in either the mobility-constraint or time-constraint
   field suppresses immediate travel because the retained facts cannot prove
   timing, route, travel-time, or walking-range compatibility. The fixed
   `unresolved_travel_constraint` reason and notice explain this.
   Inability to leave also requires `remain_at_current_location`; inability to
   travel alone requires `contact_support_person`, while travel remains
   suppressed under the current bounded extraction schema.
8. **Grounded plan selection** gives the second injected GPT-5.6 adapter only
   the normalized bounded profile, minimal weather facts, deterministic policy
   codes, and at most three frozen request-scoped records containing only the
   official `place_id`, integer straight-line distance, closing timestamp,
   accessibility, and five source-backed feature states, plus closed allowed-
   code lists. It never receives raw text, origin or place
   coordinates, candidate names or addresses, URLs, phone numbers, credentials,
   source metadata, or full schedules. Separate backend-owned required-code
   lists carry the deterministic safety core and exact priority/branch reasons;
   allowed-code lists expose only possible supplemental personalization. A
   pure backend-owned normal-plan contract derives those lists from the
   normalized situation, weather, priority, and candidate branch. Context
   construction and public normal-response validation call the same helper;
   the separate `canonical_required_plan_codes()` function remains the sole
   minimum-action matrix.
9. **Dynamic validation and hydration** revalidates the parsed Pydantic model,
   then checks its nullable `selected_place_id` byte-for-byte against the frozen
   request list. Case changes, whitespace, confusables, stale or filtered IDs,
   invalid travel sequencing, missing required codes, extra fields,
   noncanonical code order, and every branch-incompatible result reject the
   whole plan. With no travel, items must be empty and the phrase must be
   `null`; travel requires one exact selected ID, the `now` travel action,
   `water`, `phone`, and one allowed phrase. Public registered-catalog actions,
   explanations, items, a fixed Spanish/Catalan phrase, weather, place facts
   projected without coordinates,
   provenance, and notices come only from backend-owned catalogs and validated
   objects. At the final API boundary, a selected projection is independently
   reconciled with the committed place repository using the private request
   origin, evaluation instant, distance preference, and applicable
   accessibility filter. This establishes a concrete selected-place trust
   source rather than assuming an arbitrary internal dependency is trusted.
10. **Candidate and provenance defense in depth** revalidates the complete
   repository response before truncation or planning. Canonical paired IDs,
   nonblank fields, finite Barcelona place coordinates, aware timestamps,
   lowercase SHA-256 values, and absolute credential-free HTTP(S) URLs are
   mandatory. The complete immutable snapshot identity is derived from the
   validated committed snapshot and manifest: schema and snapshot IDs,
   publisher, dataset and distribution URLs, retrieval and upstream-modified
   timestamps, license and URL, attribution, and normalized hash must match.
   Each candidate source and chronology must agree with that identity. The
   workflow recomputes Haversine distance from the private request origin,
   requires exact integer agreement with the reported distance, and applies
   the request maximum to that recomputed value. Invalid place data fails
   before the second GPT call.

Weather time is coordinate-local and is not universally
`Europe/Madrid`. Opening-hours evaluation remains fixed to `Europe/Madrid`
and uses seasonal date ranges, weekday rules, multiple and overnight
intervals, an inclusive opening boundary, and an exclusive closing boundary.
Every candidate response warns that municipal hours may change and should be
checked before travel.

After extraction, the action workflow captures its UTC evaluation instant and
passes it unchanged to the place query, where schedules are evaluated in
`Europe/Madrid`. The normal branch requires `Europe/Madrid`, with the observed
date and `today.date` equal to that instant's Barcelona local date. Retrieval
is aware UTC, must fall from the evaluation instant through
`WEATHER_TIMEOUT_SECONDS + 1` second, and observation may be no more than 90
minutes old or five minutes ahead of retrieval. Finite values and the existing
weather ranges/catalog remain mandatory; current temperature and apparent
temperature cannot exceed their corresponding same-day maxima. A mismatch
fails the whole workflow before priority, place lookup, or plan generation,
preventing previous-day schedules, stale or future context, and impossible
maxima from entering a plan. Source timestamps are not rewritten.

At the HTTP boundary, an injectable endpoint-owned clock captures strict UTC
instants immediately before and after `workflow.create()`. Urgent and normal
responses are accepted only when their evaluation time is inside that
inclusive interval; naive clocks, reversed intervals, and outside response
times fail through the sanitized workflow-unavailable boundary before the
trusted place repository is queried.

The deterministic minimum plan matrix is:

| Priority | Required now | Required next few hours | Required tonight |
| --- | --- | --- | --- |
| `act_now` | cooler space, reduced effort, conditionally worded hydration | continued hydration, remain cool, updated weather | coolest available room, nearby water, updated night weather |
| `prepare_now` | cooler space, reduced effort, conditionally worded hydration | continued hydration, updated weather, prepare for tonight | coolest available room, nearby water, updated night weather |
| `monitor_and_prepare` | cooler space, reduced effort, conditionally worded hydration | updated weather, prepare for tonight | nearby water, updated night weather |

These rows map to canonical catalog codes in the model context. The shared
normal-plan contract independently derives allowed supplemental actions,
items, reasons, and phrases from situation, weather, housing, movement,
language, and candidate facts. Both context construction and public validation
require selected codes to be subsets of those lists. The model cannot omit the
matrix or any backend priority reason. Movement-prohibited, travel-support,
and unresolved-travel reasons have exact branch equivalence;
`verified_open_candidate` appears if and only if travel is selected.

Explicitly unsheltered housing selects a canonical variant that removes the
room-dependent `sleep_in_coolest_available_room` requirement and forbids the
window-dependent `ventilate_when_outside_is_cooler` supplement. Its tonight
core retains only catalog actions that do not assume a room, home, or window.
The same canonical matrix function is mandatory during context construction,
context validation, parsed-plan validation, and public normal-response
validation. Strict urgent and normal public models additionally enforce fixed
branch facts and byte-exact catalog hydration, so an inconsistent object cannot
bypass workflow validation through direct construction or response
serialization.

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

Both OpenAI adapters explicitly pin the production client to
`https://api.openai.com/v1`; inherited `OPENAI_BASE_URL` state cannot redirect
the destination. Requests set `store=False`, disable SDK retries, use a
30-second SDK request timeout, and set explicit prompt-cache mode without
adding a cache breakpoint. Both adapters use an explicit provider task plus
`asyncio.wait`, so cancellation-resistant provider code cannot extend the
request-path wait. A timed-out task is cancelled and detached best effort, and
a fixed callback consumes its eventual result without private data; timeout
does not prove that provider work stopped. Extraction uses one hard 30-second
overall asynchronous request-path budget: client cleanup receives only its
remaining time, capped at one second. Grounded planning uses a hard 30-second
provider wait plus a separate one-second cleanup wait. A timed-out close is
detached without cancellation; the retained task owns its client and cleanup
reservation until closure actually succeeds. A fixed callback consumes its
eventual outcome, and the timeout does not guarantee that the underlying
client has finished closing.

A loop-neutral process-local capacity shared by both adapters reserves at most
four actual provider tasks and four constructed-client cleanup paths. Both a
provider and cleanup reservation are acquired before client construction; if
either is unavailable, any earlier reservation is released and the request is
rejected before construction, `responses.parse`, or provider work. Each
constructed client remains held by exactly one cleanup reservation. Successful
closure releases it; failed closure is retained in a finite fail-closed
quarantine so the pinned SDK destructor cannot schedule an untracked close.
No wait queue is created. Provider capacity is released only when the actual
provider task finishes, including a cancellation-resistant detached task.
Extraction rechecks its monotonic budget immediately before task creation:
synchronous factory work cannot be preempted, but no provider coroutine starts
after expiry. These bounds do not prove a timed-out underlying task or client
close has stopped.

Under OpenAI's documented behavior, that cache configuration does not use
prompt caching; `store=False` also avoids stored
Responses application state for later retrieval. Neither setting is a
zero-retention claim: provider abuse-monitoring and other policy-governed
handling may still apply. HeatRelay returns only sanitized, server-owned
errors and never exposes provider payloads, identifiers, headers,
credentials, request text, or model output in an error. Situation telemetry
allowlists only the configured model and reviewed alias; every other
provider-controlled model value becomes `unavailable`.

Each successful provider call emits exactly one sanitized `INFO` record
through the dedicated `uvicorn.error.heatrelay.usage` logger. Records contain
only an allowlisted model plus aggregate `input_tokens`, `output_tokens`, and
`total_tokens`; grounded-plan records also contain `payload_bytes`. Invalid or
unapproved metadata is reduced to `None`/`unavailable`. Failed, refused,
invalid, incomplete, cancelled, and timed-out calls emit no successful usage
record. Submitted text, parsed or model-visible content, locale, public prose,
candidate/place data, coordinates, response IDs, credentials, exceptions,
provider bodies, and raw metadata are never fields of these records.

The plan call additionally fixes `service_tier="default"`, caps output at
1,024 tokens, uses no tools, streaming, conversation, prompt reuse, or
application retry, and fails before client construction when the compact UTF-8
serialization of the complete application-defined model-visible request
exceeds 20,000 bytes. The counted structure uses the same developer/user role
and content wrappers, versioned instruction, minimized serialized context, and
fully wrapped strict JSON Schema response-format representation passed through
the SDK contract; it does not rely on a private SDK helper. Candidate closing
timestamps are timezone-aware typed values rather than arbitrary strings. An
offline regression compares this representation byte-for-byte with the actual
serialized `input` and `text.format` emitted by pinned `openai==2.46.0`
through `httpx.MockTransport`, including multibyte content and without opening
a network socket. The extraction and plan calls are sequential and
independently bounded; Milestone
3 does not claim one exact end-to-end workflow deadline. A cleanup timeout
bounds only how long the applicable request path waits and does not prove the
underlying close completed.
At the standard rates reviewed on 2026-07-17, the configured byte/output
ceilings yield a conservative `$0.13072` upper estimate, below the authorized
`$0.15` smoke ceiling. This is a configuration estimate, not measured billing.
The historical pass-1 smoke remains separate evidence. A later, separately
authorized one-attempt direct smoke exercised the corrected grounded-plan
schema, allowed-code validation, and exact candidate whitelist; it returned
1,326 input and 171 output tokens for a coarse `$0.01176` standard-rate
estimate. Any future live call requires separate author authorization and a
fresh check of official pricing.

## Deferred pipeline stages

The first Milestone 4 slice adds one complete fixed-coordinate Barcelona demo
path over the existing server-side extraction, deterministic priority, urgent
contact routing, and grounded closed-code plan selection. It does not implement
medical diagnosis or risk scoring, official-warning retrieval, routes, ETA,
reservations, guaranteed availability or hours, free-form runtime translation,
maps, browser geolocation, authentication, analytics, deployment, or
additional cities.
