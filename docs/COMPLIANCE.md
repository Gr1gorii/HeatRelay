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
  separate API access or the author's responsibility for API billing.
- HeatRelay's server-side GPT-5.6 workflow is a stricter
  internal implementation strategy. The Devpost requirements mandate
  meaningful GPT-5.6 use but do not prescribe that runtime transport.

## Author confirmations and publication status

These are organizational confirmations, not inferred personal facts. The
author performed the local Git identity, authentication, remote configuration,
and initial Milestone 0 commit and push listed below; Codex did not perform or
claim that initial publication work. Later milestone publication facts are
recorded separately and attributed to the primary Codex build thread from the
supplied publication reports, not inferred from Git author metadata.

| Confirmation | Status | Basis |
| --- | --- | --- |
| Devpost registration | **Author action required** | No author confirmation was supplied. |
| Competition eligibility | **Author action required** | Eligibility depends on facts the author must review and confirm. |
| GitHub public repository availability | **Confirmed** | The author confirmed [Gr1gorii/HeatRelay](https://github.com/Gr1gorii/HeatRelay), and the local `origin` URL matches it. |
| Local Git remote configuration | **Confirmed; author performed** | Repository inspection shows `origin` configured for the supplied GitHub URL. |
| Initial Milestone 0 commit and push | **Confirmed; author performed** | The author published Milestone 0 as commit `709e1b7`; this remains a historical publication fact. |
| Milestone 1 commit and push | **Confirmed; primary Codex build thread performed** | The primary Codex build thread published Milestone 1 as commit `6b3b3bc5c04cd6dbe31a603fe2b44e388ea98586`; this remains a historical publication fact even as branch refs advance. |
| Milestone 2 commit and push | **Confirmed; primary Codex build thread performed** | The supplied publication report records commit `9386d1b4ffc6b2aaf0f85a9c7617407ad2b0c337` (`feat: add multilingual situation extraction`) pushed normally to `origin/main`. |
| Milestone 3 commit and push | **Confirmed; primary Codex build thread performed** | The supplied publication report records commit `b7c5190ca1c07c111b4d9e79587a75255f0bc67d` (`feat: add grounded Barcelona action planning`) pushed normally to `origin/main`. |
| Milestone 4 commit and push | **Confirmed; primary Codex build thread performed** | The supplied publication report records commit `88f56a25f1f9dd372809010721ce5733701e0033` (`feat: add Barcelona action-plan frontend`) pushed normally to `origin/main`. |
| Milestone 5 commit and push | **Confirmed; primary Codex build thread performed** | The supplied publication report records commit `5f5d23c4ba3af9c318e8427ed717f7b5b7656a00` (`feat: add accessibility and low-vision mode`) pushed normally to `origin/main`. |
| Codex access | **Confirmed for this build context** | Milestones 0 through the Milestone 6 implementation use the designated primary Codex build thread. |
| Separate OpenAI API access and billing for GPT-5.6 runtime use | **Author confirmed** | The author confirmed separate API access and billing; no balance amount is published. |
| Live GPT-5.6 extraction access | **Verified for one bounded Milestone 2 smoke on 2026-07-17** | One synthetic extraction request through the documented local backend returned HTTP 200, passed the strict public schema, and matched its expected explicit facts on the first OpenAI network attempt. No broader accuracy claim is made. |
| Live GPT-5.6 grounded-plan access | **Historical pass-1 verification on 2026-07-17** | One direct internal plan-service request with synthetic prevalidated backend facts succeeded on the first and only Responses API attempt; strict pass-1 model-schema and exact request-candidate whitelist checks passed. The public workflow, M2 extraction, and later corrected model-facing/public-validation contract were not exercised, and no broader accuracy claim is made. |
| Corrected-contract grounded-plan access | **Verified by one separately authorized final smoke on 2026-07-17** | Exactly one direct `GroundedPlanService` request with zero retries passed strict Pydantic, allowed-code, safe-model-metadata, and exact candidate-whitelist validation. It used 1,326 input and 171 output tokens; this single scenario is not a general accuracy evaluation. |
| Live Milestone 4 browser workflow | **Verified for one bounded smoke on 2026-07-18** | One Chrome submission produced one observed action-plan POST and HTTP 200, rendering the normal `Prepare now` no-place result with zero retries. Extraction, Open-Meteo, and grounded-plan calls were inferred rather than independently provider-logged. Model metadata and token usage were unavailable; `$0.25` was a conservative authorized upper bound, not the actual measured charge. |
| Milestone 5 accessibility and low-vision foundation | **Verified within the explicitly tested scope on 2026-07-18** | Offline automated tests and the production build passed. An isolated loopback harness verified corrected 320px reflow; actual Chrome verified 200% page zoom; runtime macOS Reduce Motion was exercised and restored; and one actual VoiceOver session was manually confirmed by the author. This is platform- and scenario-bounded evidence, not formal accessibility certification or a claim of complete conformance. |

The Milestone 3 adversarial correction implementations and ordinary
verification were deliberately offline. The later final smoke was a separate,
explicitly authorized one-attempt direct adapter check; it did not invoke the
public workflow, extraction, weather, downloads, or another network service.
That implementation was later published in the Milestone 3 commit recorded
above. Any future live call requires separate author authorization and a fresh
official price check.

## Scope, submitted text, and coordinate handling

The first Milestone 4 slice preserves the M1 context services, M2 bounded
extraction, and M3 Barcelona action workflow, then adds one browser flow for
the action-plan endpoint. It fixes the demo origin at latitude `41.3874` and
longitude `2.1686`, with a `3000` metre maximum distance; browser geolocation
is not available. It does not add medical diagnosis or risk scoring,
official-warning retrieval, routes, ETA, reservations, guaranteed hours, maps,
translations, accounts, analytics, deployment, or additional cities. The
action-plan origin rectangle is bounded pilot coverage, not evidence of
Barcelona municipal membership and not an administrative-boundary geofence.

Situation text is kept only in React memory, accepted only in the JSON body,
and sent server-side to OpenAI. The frontend does not use browser storage,
cookies, analytics, logging, or URL parameters for that text. Explicit visual
mode, interface language, and action-plan language preferences are stored
locally under `heatrelay.visual-mode.v1`,
`heatrelay.interface-locale.v1`, and `heatrelay.output-locale.v1`. Only the
selected action-plan language code enters the four-field action-plan request;
visual mode and interface locale do not. HeatRelay does not
intentionally log, persist, or echo the raw text, parsed sensitive fields,
complete provider responses, or OpenAI response IDs. The
public extraction output is a strict structured summary and explicitly is not
medical advice, an emergency assessment, or an action plan. Refusals, incomplete or
unusable model output, provider failures, and timeouts return fixed sanitized
errors without request or provider content.
`missing_information` must exactly equal the canonically ordered fields whose
status is `not_stated` or `unknown`. The extraction route explicitly
revalidates service output, and nested action-plan profiles are revalidated at
their separate sanitized workflow boundary.

The second plan call receives no raw situation text, origin or candidate
coordinates, names, addresses, URLs, phone numbers, credentials, source
metadata, or full schedules. It receives only the normalized bounded profile,
minimal weather facts, deterministic policy codes, and no more than three
frozen request-scoped records containing `place_id`, integer straight-line
distance, closing timestamp, accessibility, and five source-backed feature
states, plus closed allowed- and required-code lists.
One pure backend-owned normal-plan contract derives the applicable allowed
actions, items, reasons, and local phrases from the normalized situation,
weather, housing, language, movement, and candidate facts. Context construction
and public validation share that contract, while the canonical required-code
function remains the single minimum matrix. Backend code enforces byte-exact
request-candidate membership and hydrates all public facts and text. Both model
calls use the same application-side non-logging and sanitized-error boundary.
The action-plan HTTP boundary also captures strict endpoint-owned UTC instants
immediately before and after the workflow call. Both response branches must
place their evaluation time inside that interval before any final trusted
place-repository query.

Milestone 4 frontend tests use mocked `fetch` responses and make no live
frontend-to-backend request. They remain offline contract evidence and do not
by themselves prove live operation. The separately authorized one-submission
Chrome smoke recorded above provides one-scenario integration evidence only;
it does not cover urgent, selected-place, error, or deployment behavior. The
OpenAI credential remains backend-only and no OpenAI-prefixed frontend
variable is used. Any future live call requires separate author authorization
and a fresh cost review.

## Milestone 5 local preference and accessibility boundary

Milestone 5 adds a presentation preference without an account. The exact
local-storage key is `heatrelay.visual-mode.v1`, and its only accepted values
are `standard` and `enhanced`. Only that presentation value is stored: the
situation text is not written there, the preference is not included in the
action-plan request, and no analytics receives it. Enhanced Visibility is a
presentation preference intended for low vision or clearer content; it is not
sensitive-profile processing, a medical classification, or a distinct data
or model workflow.

Offline automated tests and the production build cover preference resolution,
storage failures, API noninterference, shared UI behavior, and semantic
interaction contracts. The HeatRelay mock-state checks used an isolated
loopback harness and reached no backend or provider. Browser verification
exercised corrected 320px reflow and text spacing, actual Chrome 200% zoom,
and runtime macOS Reduce Motion. One actual VoiceOver session was manually
confirmed by the project author; individual spoken utterances were not
independently logged, and no other screen reader was tested. These checks do
not establish formal WCAG certification, complete conformance, or
compatibility with every browser, platform, or assistive technology.

Milestone 5 added or removed no dependency. Its published commit is
`5f5d23c4ba3af9c318e8427ed717f7b5b7656a00`.

## Milestone 6.30 output-language preference and privacy boundary

Milestone 6 bundles 25 interface catalogs and 25 immutable backend action-plan
output catalogs: 21 LTR and four RTL (`ar`, `ur`, `fa`, and `he`). Its closed
detected-input contract contains 26 tags, including input-only Catalan.
Interface locale, detected input language and source, requested output locale,
and direction remain separate. Successful action plans use schema `1.16.0` and
their nested situation uses schema `1.1.0`.

All 25 registered action-plan output locales are selectable through one native,
labelled form control. English remains the default. An exact valid value stored
under `heatrelay.output-locale.v1` is restored; every missing, malformed,
unsupported, wrong-type, inaccessible, or throwing read falls back to English
without writing or repairing storage. Output resolution does not use browser
language and is not coupled to interface language. Only explicit valid user
selection writes the exact code, and a failed write does not invalidate the
current in-memory choice.

The selected code applies to the next submission and does not translate or
replace an already displayed response. The request remains exactly four fields:
`situation_text`, `origin`, `maximum_distance_m`, and `output_locale`. No
visual-mode value, interface locale, local-storage metadata, or detected-input
metadata is added. Situation text is never placed in browser storage. The
frontend uses no analytics, cookies, URL parameters, or geolocation for these
preferences.

The frontend's English fallback applies only to invalid or unavailable stored
preferences. Backend locale validation is exact and strict: unsupported values
are rejected rather than normalized, inferred, translated, or silently
replaced. Backend catalogs localize registered prose only. Facts, IDs, names,
addresses, phone numbers, URLs, schedules, timestamps, coordinates, distances,
weather values, order, and provenance remain backend-owned.

M6.30 was an offline frontend and documentation slice. It changed no backend,
successful-response schema, GPT prompt or payload, weather, places, or action
policy. At the close of that slice, language-mismatch UI, live multilingual
and RTL QA, independent human review, final Milestone 6 verification, and
publication remained pending.

## Milestone 6.31 language-context accessibility boundary

Successful normal and urgent results may now be followed by a calm, labelled
language-information section. It is derived only from the validated detected-
input language and response output locale. The deterministic classification
handles `unknown`, `other`, Catalan as an input-only language, and supported-
language mismatch in that order; matching supported languages produce no input-
language notice. No browser language, interface locale, model confidence, or
other model-internal value participates in the classification.

Displayed-plan language and next-plan preference remain distinct. Changing the
selector after a response updates only the next-plan fact and never rewrites
the existing response. The section has no alert, status, live-region, or
automatic-focus semantics. A normal-result button only focuses the existing
labelled selector. Urgent language information follows the complete fixed
`112` instruction, actions, notices, and official link and deliberately has no
change-language action.

This offline automated accessibility slice changed no backend, schema,
`heatrelay.output-locale.v1` storage contract, request shape, API behavior, GPT
boundary, dependency, safety policy, weather, or place behavior. It is not
browser, screen-reader, multilingual, RTL, or WCAG certification evidence by
itself. At the close of M6.31, independent review, runtime QA, final
verification, and publication remained pending.

## Milestone 6 bounded verification and provider-usage evidence

M6.32 exercised multilingual, bidirectional, accessibility-tree, keyboard,
320px reflow, WCAG text-spacing, and actual 200% zoom behavior in Chrome on
macOS. One actual VoiceOver session was manually confirmed by the author
without independent speech logging. Product corrections addressed native-name
selector clipping, German hero-heading wrapping, and Russian status-value
overflow. These are bounded platform/scenario results, not formal WCAG
certification or universal assistive-technology evidence.

M6.33 added exact per-leaf preservation counts for eight protected factual
tokens in all backend action-plan catalogs and an exhaustive explicit
English-equality allowlist for all 24 non-English interface catalogs. The
stronger invariant identified and corrected one candidate-warning leaf in 13
backend catalogs; no other catalog leaf changed.

M6.34-C1 made sanitized successful-call usage visible through
`uvicorn.error.heatrelay.usage` under standard Uvicorn logging. Records contain
only an allowlisted model and aggregate input, output, and total tokens;
grounded-plan records also contain payload bytes. They never contain submitted
text, model output, model-visible content, locale, public prose, candidate or
place data, coordinates, credentials, response IDs, exceptions, provider
bodies, or raw unapproved metadata. The correction passed 248 focused tests
and all 2,568 backend tests offline at `$0.00` API cost.

An earlier Spanish-only M6.34 attempt remains incomplete historical evidence
because usage was unavailable; it is not counted in C2. M6.34-C2 completed
four fresh UI submissions spanning Spanish, Arabic, Russian input with Hebrew
output, and Traditional Chinese urgent output. It produced seven OpenAI calls,
three Open-Meteo calls, zero retries, 9,223 input tokens, 792 output tokens,
and 10,015 total tokens. `$0.1628075` is the deliberately conservative C2
upper-bound calculation, not exact provider billing.

All 24 non-English catalogs remain AI-assisted drafts without independent
native-speaker, linguistic, cultural, medical, emergency, accessibility, or
safety-critical approval. The live smoke covered four scenarios, not all 25
locales. The evidence does not establish formal WCAG conformance, universal
assistive-technology behavior, cross-browser compatibility, medical approval,
deployment readiness, or release readiness. At the time this verification
record was written, Milestone 6 was uncommitted and unpublished. Publication
is represented by the repository commit containing this compliance revision.

The second model cannot omit the backend-owned minimum safety matrix. All
three normal priorities require the immediate `move_to_cooler_space`,
`reduce_physical_effort`, and conditionally worded `drink_water` codes.
`act_now` then requires continued hydration, staying cool, and an updated-
weather check, plus coolest-room, nearby-water, and night-weather actions;
`prepare_now` requires continued hydration, updated weather, and tonight
preparation, plus the same three tonight actions; `monitor_and_prepare`
requires updated weather and tonight preparation, plus nearby water and a
night-weather check. Every deterministic priority reason and every applicable
movement, travel-support, unresolved-travel, or verified-candidate branch
reason is required, and those branch reasons are rejected when their fact does
not apply. For explicitly unsheltered housing, a canonical branch variant
removes the room-dependent coolest-room action and forbids window ventilation;
only actions that do not assume a room, home, or window remain. Unsheltered
output also never offers home cooling, even with reported air conditioning or
fan-only cooling below `40.0°C`; those bounded cooling paths remain available
for stable or temporary housing. The same backend-owned matrix is enforced at
context construction, context validation, parsed-plan validation, and strict
public-response validation. Public selected codes must also be subsets of the
shared situation-, weather-, and candidate-derived allowed lists. Explanation
codes equal the deterministic priority and applicable branch reasons, plus
`verified_open_candidate` if and only if travel is selected.

An `unknown` status or any reported bounded value in either the time-constraint
or mobility-constraint field suppresses immediate travel because the
extraction does not retain exact deadlines, routes, travel time, or walking
range. The response supplies a fixed
`unresolved_travel_constraint` reason and notice; accessibility filtering is
not described as proof of reachability. No-travel output must have no selected
place, travel action, bring items, or local phrase. A travel branch requires
one exact request candidate, the immediate travel action, at least water and
phone, and one allowed local phrase; these fields cannot appear independently.

The Responses API request uses `store=False` and explicit prompt-cache mode
without a breakpoint. OpenAI documents that this cache configuration disables
the implicit breakpoint and does not use prompt caching; `store=False` avoids
stored Responses application state for later retrieval. These settings do not
establish Zero Data Retention. Under OpenAI's
[API data controls](https://developers.openai.com/api/docs/guides/your-data),
default abuse-monitoring logs may retain customer content for up to 30 days
unless approved data controls apply, and API data is not used to train models
unless the customer explicitly opts in.

Both OpenAI adapters enforce hard request-path waits with an explicit provider
task and bounded `asyncio.wait`, not cancellation-cooperative `wait_for`.
Extraction gives cleanup only the remainder of its 30-second overall
asynchronous budget, capped at one second; grounded planning keeps separate
30-second provider and one-second cleanup waits. Timed-out provider tasks are
cancelled and detached best effort, while timed-out cleanup is detached without
cancellation; fixed private-safe callbacks consume eventual results, and a
timeout does not prove the underlying operation stopped. Both a provider and
cleanup reservation must be acquired before either adapter constructs a
client. The adapters share a loop-neutral process-local limit of four actual
provider tasks and four constructed-client cleanup paths. Saturation starts no
client or provider task. Provider capacity remains occupied until actual
provider completion; cleanup capacity remains occupied until successful actual
closure. A failed close is retained in finite fail-closed quarantine so SDK
destruction cannot schedule untracked cleanup work. Extraction rechecks its
remaining budget immediately before provider task creation; blocking
synchronous factory code cannot be preempted, but expiry starts no paid
provider work. The grounded-plan adapter also
rejects before client construction when the compact UTF-8 representation of
the complete application-defined model-visible request exceeds 20,000 bytes.
That count includes the role/content wrappers, instruction, minimized context,
and fully wrapped strict JSON Schema response format rather than only the plain
schema. An offline `httpx.MockTransport` regression against pinned
`openai==2.46.0` compares the actual serialized `input` and `text.format` with
the application-owned representation, including multibyte content. Related
real-client offline tests cover cleanup saturation and destructor behavior
without opening a socket.

The Barcelona action workflow accepts weather only when it is finite and
range-valid, reports `Europe/Madrid`, and coheres with its captured evaluation
instant. The observed and daily dates must match the Barcelona evaluation day;
UTC retrieval must be no earlier than evaluation and no later than the
five-second weather allowance plus one second. The observation may be at most
90 minutes old and at most five minutes ahead of retrieval. Current temperature
and apparent temperature cannot exceed their same-day maxima. Failure is
sanitized before priority, places, or plan generation; no impossible value is
repaired.

Candidate and snapshot responses are strictly revalidated before planning:
canonical paired IDs, nonblank fields, finite Barcelona coordinates, aware
timestamps, lowercase SHA-256 values, credential-free HTTP(S) URLs, and the
complete immutable identity derived from the validated committed snapshot and
manifest are mandatory. That identity includes schema and snapshot IDs,
publisher, dataset and distribution URLs, retrieval and upstream-modified
timestamps, license and URL, exact attribution, and normalized hash. Each
candidate source and chronology must agree with it. Haversine distance is
recomputed from the private origin, must exactly match integer `distance_m`,
and is used for the maximum-distance check. Invalid data returns the existing
sanitized place-unavailable boundary before any plan call. Strict urgent and
normal public response models also enforce branch consistency and exact
backend-owned catalog hydration. At the final API boundary, a selected
projection is independently reconciled with an eligible committed repository
record using the private request origin, server evaluation time, request
distance preference, and applicable accessibility filter. This is a bounded
independent trust check, not a general claim about arbitrary malicious internal
dependencies.

Both versioned context endpoints accept coordinates in JSON request bodies,
not URL query parameters. HeatRelay does not intentionally log or store exact
coordinates or request bodies. The weather response does not echo the request
coordinates. The places response includes official candidate-place
coordinates but does not echo the origin.

Weather accepts valid global WGS84 coordinates. It asks Open-Meteo to resolve
`timezone=auto`, validates the returned coordinate-local IANA timezone, and
uses that timezone for the current timestamp and same-day calendar date.
Verified place coverage remains Barcelona-only, and place schedules remain
evaluated in `Europe/Madrid`. The inclusive place-record validation bounds—
latitude `41.2` through `41.6` and longitude `1.9` through `2.4`—apply to
normalized official place records. They do not restrict global weather
coordinates or the standalone place-search origin. Separately named
public-origin pilot constants currently use the same numbers for the
action-plan route so Barcelona policy is not applied globally. This broad
rectangle is a product-coverage bound; without a sourced municipal polygon it
must not be described as proof of city membership or a geofence of Barcelona's
administrative boundary.

For weather requests, the backend must send the supplied coordinates to
Open-Meteo. Open-Meteo's
[Terms and Privacy](https://open-meteo.com/en/terms) state that troubleshooting
web-server logs may contain geographic coordinates and are deleted after 90
days. This third-party handling is separate from HeatRelay's own logging
policy and must be considered before production use.

Tracked repository content contains no real secrets. `.env.example` contains
an empty backend-only OpenAI placeholder. The author-supplied local credential
remains in the ignored, untracked repository-root `.env.local`; the development
supervisor rejects symlinks, non-regular files, and every group or other
permission bit, preserves an already exported backend value, and removes
`OPENAI_API_KEY` from the frontend child environment. The root Make targets
also remove the variable from npm installation, test, and build processes.
Both production OpenAI clients are explicitly pinned to
`https://api.openai.com/v1`, independent of ambient `OPENAI_BASE_URL` state.
The credential must never use a `VITE_` prefix or be committed.

## Milestone 3 reviewed policy and model sources

The following primary sources were accessed on **2026-07-17**. Each row states
the exact bounded rule HeatRelay derives; it does not attribute HeatRelay's
implementation choices verbatim to the publisher.

| Publisher and source | HeatRelay rule derived from the source |
| --- | --- |
| Ajuntament de Barcelona — Serveis Socials, [published heat thresholds](https://ajuntament.barcelona.cat/serveissocials/es/noticia/crece-la-red-de-refugios-climaticos-para-protegerse-del-calor_1523924) | Apply the published `34.0°C` and `36.0°C` daytime boundaries only as versioned HeatRelay heuristics over Open-Meteo's model-derived same-day maximum. Do not implement the article's nighttime criteria or claim municipal alert activation. |
| Ajuntament de Barcelona — Barcelona pel Clima, [climate-shelter network](https://www.barcelona.cat/barcelona-pel-clima/ca/accions-concretes/xarxa-de-refugis-climatics) | Keep the check-hours-before-travel warning, never guarantee availability or reachability, and never offer a climate shelter as a substitute for medical attention. |
| Generalitat de Catalunya — Canal Salut, [effects of excess heat](https://canalsalut.gencat.cat/ca/vida-saludable/consells-estacionals/estiu/calor/efectes-exces/) | An explicitly reported bounded warning symptom takes the fixed urgent branch and bypasses weather, place lookup, and plan generation; HeatRelay does not infer broader symptoms or diagnose an emergency. |
| Generalitat de Catalunya — 112 emergències, [112 FAQ](https://112.gencat.cat/es/us-del-112/preguntes-frequeents/) | Route every value in the current closed six-symptom catalog to fixed backend-owned `112` content. Code asserts exact equality between this universal routing set and the extraction catalog so a future symptom cannot silently inherit a default. |
| World Health Organization, [Heat and health](https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health) | Keep output informational and deterministic, with no diagnosis, probability, or medical risk score. Offer reported fan-only cooling only when current and same-day maximum temperatures are both strictly below `40.0°C`; this is a conservative HeatRelay action boundary, not an official alert threshold. |
| OpenAI, [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) | Use Responses API Pydantic Structured Outputs and explicit refusal handling, then perform independent local semantic validation because schema adherence does not establish factual or request-scoped candidate correctness. |
| OpenAI, [API pricing](https://developers.openai.com/api/docs/pricing) | Before the separately authorized final smoke, the configured ceiling was recalculated at the supplied standard rates: `$5.00` per million input tokens and `$30.00` per million output tokens. The `$0.13072` conservative bound stayed below `$0.15`; actual aggregate usage produced a coarse `$0.01176` estimate. Any future live call requires separate author authorization and a fresh official price check. |

The universal fixed urgent set is confusion, fainting or loss of consciousness,
seizure, difficulty breathing, chest pain, and repeated vomiting. Every one
routes to `112`. This is a closed server-owned contact rule, not a diagnosis,
general symptom recognition, or a claim that the source publishes this exact
application schema.

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
place-record validation bounds. Accepted URLs are retained unchanged. These
data checks do not restrict global weather coordinates or place-search origins.

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
files. Licenses are the packages' declared upstream licenses. Milestone 6 adds
the two direct localization dependencies listed below. The HeatRelay MIT
license does not relicense third-party code.

### Frontend runtime

| Dependency | Version | Purpose | Declared license |
| --- | ---: | --- | --- |
| [react](https://www.npmjs.com/package/react) | 19.2.7 | Component UI runtime | MIT |
| [react-dom](https://www.npmjs.com/package/react-dom) | 19.2.7 | Browser rendering | MIT |
| [i18next](https://www.npmjs.com/package/i18next) | 26.3.6 | Bundled interface-catalog runtime | MIT |
| [react-i18next](https://www.npmjs.com/package/react-i18next) | 17.0.10 | React localization bindings | MIT |

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
| [openai](https://pypi.org/project/openai/) | 2.46.0 | Official asynchronous Responses API client for extraction and grounded plan Structured Outputs | Apache-2.0 |
| [pydantic](https://pypi.org/project/pydantic/) | 2.13.4 | Direct request, response, model, policy, upstream, snapshot, and manifest validation | MIT |
| [uvicorn](https://pypi.org/project/uvicorn/) | 0.51.0 | Local ASGI server | BSD-3-Clause |

### Backend development and testing

| Dependency | Version | Purpose | Declared license |
| --- | ---: | --- | --- |
| [python-dotenv](https://pypi.org/project/python-dotenv/) | 1.2.2 | Explicit backend-only `.env.local` parsing for the development supervisor | BSD-3-Clause |
| [pytest](https://pypi.org/project/pytest/) | 9.1.1 | Backend test runner | MIT |

No map library, routing client, authentication library, analytics library,
scraping framework, or process-runner package is included.
