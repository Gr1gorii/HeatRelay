# Translation review status

English is the canonical source catalog.

The Spanish, Simplified Chinese, Traditional Chinese, Hindi, Arabic, Brazilian Portuguese, Bengali, Russian, Japanese, French, German, Urdu, Indonesian, Turkish, Korean, Italian, Ukrainian, Polish, Vietnamese, Thai, Persian, Swahili, Hebrew, and Dutch catalogs are AI-assisted drafts. None has received independent native-speaker, linguistic, cultural, accessibility, or safety-critical translation review or approval. Arabic, Urdu, Persian, and Hebrew are separate catalogs, not variants or copies of one another.

Automated tests verify structural completeness, interpolation consistency, direction contracts, and deterministic formatter output. They do not establish linguistic accuracy, cultural suitability, accessibility certification, safety approval, or visual browser conformance.

Backend action-plan output supports exactly all 25 launch locales in this order: English (`en`), Spanish (`es`), Simplified Chinese (`zh-CN`), Traditional Chinese for Taiwan (`zh-TW`), Hindi (`hi`), Bengali (`bn`), Modern Standard Arabic (`ar`), Brazilian Portuguese (`pt-BR`), French (`fr`), Italian (`it`), German (`de`), Dutch (`nl`), Russian (`ru`), Ukrainian (`uk`), Polish (`pl`), Japanese (`ja`), Korean (`ko`), Indonesian (`id`), Vietnamese (`vi`), Thai (`th`), Turkish (`tr`), Swahili (`sw`), Urdu (`ur`), Persian (`fa`), and Hebrew (`he`). English remains the default. The frontend does not translate backend-owned prose or official facts.

The Thai interface uses the default `th-TH` `Intl` calendar presentation, which displays Buddhist Era years in visible localized dates. The original Gregorian API values and machine-readable HTML `dateTime` attributes remain unchanged. HeatRelay applies no manual year arithmetic or calendar conversion.

The Persian interface uses the default `fa-IR` `Intl` Persian calendar for visible localized dates. The original Gregorian API values and machine-readable HTML `dateTime` attributes remain unchanged, with no manual calendar arithmetic or Gregorian override.

All 25 required interface catalog files are now present: 21 left-to-right and four right-to-left. The semantic direction and shared logical-CSS RTL foundation are implemented offline. The M6.13A Chrome RTL and reflow audit passed within its explicitly tested scope. That audit covered one browser only and does not establish linguistic quality, native-speaker review, screen-reader behavior, 200% zoom behavior, universal browser compatibility, or WCAG conformance or certification. The complete “Supported launch languages” interface catalog set must not be presented as human-reviewed or release-ready.

The backend represents all 25 launch tags plus Barcelona pilot Catalan in a closed detected-input-language contract. Its `input_language_source` is derived deterministically by backend code; no user-selected input-language source exists. Detected input language and an explicitly reported preferred language remain separate facts. M6.14 automated tests establish schema and propagation handling, not live multilingual detection accuracy.

## Historical Milestone 6 catalog snapshots

M6.15 centralizes the 67 existing HeatRelay-authored English action-plan strings in one deterministic backend catalog. Successful action-plan prose remains English-only; no backend translation was added or claimed. Deterministic facts and the fixed Spanish/Catalan local phrases remain outside output-locale translation.

M6.16 added action-plan-only locale-ready projections for the nested situation and weather responses. The standalone situation and weather endpoints remain unchanged and English-exact. Their two notices extended the backend action-plan catalog to 69 English strings while deterministic facts remained unchanged. At that milestone, output support remained English-only and a future output locale was required to provide a complete registered catalog before registration.

M6.17 adds complete deterministic Spanish API-level action-plan output and advances the successful action-plan schema to `1.4.0`. English remains the default. Interface locale and output locale remain independent: there is no output-language selector, stored output preference, automatic interface/output coupling, or language-mismatch interface.

The Spanish backend action-plan catalog is an AI-assisted draft. It has not received independent native-speaker, linguistic, cultural, accessibility, medical, emergency, or safety-critical review or approval. API-level support is not a release-readiness claim; native-Spanish and safety review remain required before public release claims. At M6.17, the other 23 backend output locales remained pending.

M6.18 adds complete deterministic `zh-CN` and `zh-TW` API-level action-plan output and advances the successful action-plan schema to `1.5.0`. The two Chinese backend catalogs are independently authored catalogs, not runtime conversions of one another. Both are AI-assisted drafts without independent Mainland Simplified Chinese or Taiwan Traditional Chinese native-speaker, linguistic, medical, emergency, cultural, accessibility, or safety-critical review or approval. Chinese API-level support is not a release-readiness claim, and separate human review remains required before release claims.

At M6.18, the supported output-locale set was exactly `en`, `es`, `zh-CN`, and `zh-TW`, with `en` still the default. The other 21 backend output locales remained pending.

M6.19 adds complete deterministic Hindi (`hi`) and Bengali (`bn`) API-level action-plan output and advances the successful action-plan schema to `1.6.0`. Hindi and Bengali are independently authored backend catalogs. Both are AI-assisted drafts without independent native-speaker, linguistic, medical, emergency, cultural, accessibility, or safety-critical review or approval. API-level support is not a release-readiness claim, and separate human review remains required before release claims.

At M6.19, the supported output-locale set was exactly `en`, `es`, `zh-CN`, `zh-TW`, `hi`, and `bn`, with `en` still the default. The other 19 backend output locales remained pending.

M6.20 adds complete deterministic Modern Standard Arabic (`ar`) API-level action-plan output and advances the successful action-plan schema to `1.7.0`. Arabic is an independently authored backend catalog. It is an AI-assisted draft without independent native-speaker, dialect, linguistic, medical, emergency, cultural, accessibility, RTL/bidi, or safety-critical review or approval. Arabic API-level support is not a release-readiness claim. Rendering future Arabic action-plan output still requires dedicated RTL/bidi browser and assistive-technology QA; the earlier Arabic-interface audit does not establish that future output-rendering behavior.

The supported output-locale set is now exactly `en`, `es`, `zh-CN`, `zh-TW`, `hi`, `bn`, and `ar`, with `en` still the default. There is no fallback, output-language selector, output-locale storage, output direction field, automatic interface/output coupling, or mismatch message, and the application continues to submit English output requests. The other 18 backend output locales, live multilingual and RTL validation, human review, output selection and storage, mismatch messaging, publication, and final documentation synchronization remain pending. Milestone 6 is not complete.

M6.21 adds complete deterministic Brazilian Portuguese (`pt-BR`) API-level action-plan output and advances the successful action-plan schema to `1.8.0`. The Brazilian Portuguese backend catalog is independently authored and does not imply support for generic Portuguese (`pt`) or European Portuguese (`pt-PT`). It is an AI-assisted draft without independent native Brazilian-Portuguese, regional, linguistic, medical, emergency, cultural, accessibility, or safety-critical review or approval. API-level support is not a release-readiness claim, and human review remains required before public release claims.

The supported output-locale set is now exactly `en`, `es`, `zh-CN`, `zh-TW`, `hi`, `bn`, `ar`, and `pt-BR`, with `en` still the default. There is no fallback, output-language selector, output-locale storage, browser-language output selection, automatic interface/output coupling, or mismatch message, and the application continues to submit English output requests. The other 17 backend output catalogs, live multilingual validation, human review, output selection and storage, mismatch messaging, publication, and final documentation synchronization remain pending. Milestone 6 is not complete.

M6.22 adds complete deterministic French (`fr`) and Italian (`it`) API-level action-plan output and advances the successful action-plan schema to `1.9.0`. The French and Italian backend catalogs are complete, independently authored catalogs rather than runtime adaptations of another locale. Both are AI-assisted drafts without independent native-speaker, regional, linguistic, medical, emergency, cultural, accessibility, or safety-critical review or approval. API-level support is not a release-readiness claim, and separate human review remains required before public release claims.

The supported output-locale set is now exactly `en`, `es`, `zh-CN`, `zh-TW`, `hi`, `bn`, `ar`, `pt-BR`, `fr`, and `it`, with `en` still the default. There is no fallback, output-language selector, output-locale storage, browser-language output selection, automatic interface/output coupling, or mismatch message, and the application continues to submit English output requests. The other 15 backend output catalogs, live multilingual validation, human review, output selection and storage, mismatch messaging, publication, and final documentation synchronization remain pending. Milestone 6 is not complete.

M6.23 adds complete deterministic German (`de`) and Dutch (`nl`) API-level action-plan output and advances the successful action-plan schema to `1.10.0`. The German and Dutch backend catalogs are complete and independently authored rather than derived from another locale at runtime. Both are AI-assisted drafts without independent native-speaker, regional, linguistic, medical, emergency, cultural, accessibility, or safety-critical review or approval. API-level support is not a release-readiness claim, and separate native-speaker and safety review remains required before public release claims.

The supported output-locale set is now exactly `en`, `es`, `zh-CN`, `zh-TW`, `hi`, `bn`, `ar`, `pt-BR`, `fr`, `it`, `de`, and `nl`, with `en` still the default. There is no fallback, output-language selector, output-locale storage, browser-language output selection, automatic interface/output coupling, or mismatch message, and the application continues to submit English output requests. The other 13 backend output catalogs, live multilingual validation, human review, output selection and storage, mismatch messaging, publication, and final documentation synchronization remain pending. Milestone 6 is not complete.

M6.24 adds complete deterministic Russian (`ru`), Ukrainian (`uk`), and Polish (`pl`) API-level action-plan output and advances the successful action-plan schema to `1.11.0`. The three backend catalogs are complete and independently authored rather than derived from another locale at runtime. All three are AI-assisted drafts without independent native-speaker, regional, linguistic, medical, emergency, cultural, accessibility, or safety-critical review or approval. API-level support is not a release-readiness claim, and separate native-speaker and safety review remains required before public release claims.

The supported output-locale set is now exactly `en`, `es`, `zh-CN`, `zh-TW`, `hi`, `bn`, `ar`, `pt-BR`, `fr`, `it`, `de`, `nl`, `ru`, `uk`, and `pl`, with `en` still the default. There is no fallback, output-language selector, output-locale storage, browser-language output selection, automatic interface/output coupling, or mismatch message, and the application continues to submit English output requests. The other 10 backend output catalogs, live multilingual validation, human review, output selection and storage, mismatch messaging, publication, and final documentation synchronization remain pending. Milestone 6 is not complete.

M6.25 adds complete deterministic Japanese (`ja`) and Korean (`ko`) API-level action-plan output and advances the successful action-plan schema to `1.12.0`. The Japanese and Korean backend catalogs are complete and independently authored rather than derived from another locale at runtime. Both are AI-assisted drafts without independent native-speaker, regional, linguistic, medical, emergency, cultural, accessibility, or safety-critical review or approval. API-level support is not a release-readiness claim, and separate native-speaker and safety review remains required before public release claims.

The supported output-locale set is now exactly `en`, `es`, `zh-CN`, `zh-TW`, `hi`, `bn`, `ar`, `pt-BR`, `fr`, `it`, `de`, `nl`, `ru`, `uk`, `pl`, `ja`, and `ko`, with `en` still the default. There is no fallback, output-language selector, output-locale storage, browser-language output selection, automatic interface/output coupling, or mismatch message, and the application continues to submit English output requests. The other 8 backend output catalogs, live multilingual validation, human review, output selection and storage, mismatch messaging, publication, and final documentation synchronization remain pending. Milestone 6 is not complete.

M6.26 adds complete deterministic Indonesian (`id`), Vietnamese (`vi`), and Thai (`th`) API-level action-plan output and advances the successful action-plan schema to `1.13.0`. The three backend catalogs are complete and independently authored rather than derived from another locale at runtime. All three are AI-assisted drafts without independent native-speaker, regional, linguistic, medical, emergency, cultural, accessibility, or safety-critical review or approval. API-level support is not a release-readiness claim, and separate native-speaker and safety review remains required before public release claims.

The supported output-locale set is now exactly `en`, `es`, `zh-CN`, `zh-TW`, `hi`, `bn`, `ar`, `pt-BR`, `fr`, `it`, `de`, `nl`, `ru`, `uk`, `pl`, `ja`, `ko`, `id`, `vi`, and `th`, with `en` still the default. There is no fallback, output-language selector, output-locale storage, browser-language output selection, automatic interface/output coupling, or mismatch message, and the application continues to submit English output requests. The other 5 backend output catalogs, live multilingual validation, human review, output selection and storage, mismatch messaging, publication, and final documentation synchronization remain pending. Milestone 6 is not complete.

M6.27 adds complete deterministic Turkish (`tr`) and Swahili (`sw`) API-level action-plan output and advances the successful action-plan schema to `1.14.0`. The Turkish and Swahili backend catalogs are complete and independently authored rather than derived from another locale at runtime. Both are AI-assisted drafts without independent native-speaker, regional, linguistic, medical, emergency, cultural, accessibility, or safety-critical review or approval. API-level support is not a release-readiness claim, and separate native-speaker and safety review remains required before public release claims.

The supported output-locale set is now exactly `en`, `es`, `zh-CN`, `zh-TW`, `hi`, `bn`, `ar`, `pt-BR`, `fr`, `it`, `de`, `nl`, `ru`, `uk`, `pl`, `ja`, `ko`, `id`, `vi`, `th`, `tr`, and `sw`, with `en` still the default. There is no fallback, output-language selector, output-locale storage, browser-language output selection, automatic interface/output coupling, or mismatch message, and the application continues to submit English output requests. The other 3 backend output catalogs, live multilingual validation, human review, output selection and storage, mismatch messaging, publication, and final documentation synchronization remain pending. Milestone 6 is not complete.

M6.28 adds complete deterministic Urdu (`ur`) and Persian (`fa`) API-level action-plan output and advances the successful action-plan schema to `1.15.0`. The Urdu and Persian backend catalogs are complete and independently authored rather than derived from another locale at runtime. Both are AI-assisted drafts without independent native-speaker, regional, linguistic, medical, emergency, cultural, accessibility, RTL/bidi, or safety-critical review or approval. API-level support is not a release-readiness claim, does not constitute browser or visual RTL QA, and separate native-speaker, safety, and future output-rendering review remains required before public release claims.

The supported output-locale set is now exactly `en`, `es`, `zh-CN`, `zh-TW`, `hi`, `bn`, `ar`, `pt-BR`, `fr`, `it`, `de`, `nl`, `ru`, `uk`, `pl`, `ja`, `ko`, `id`, `vi`, `th`, `tr`, `sw`, `ur`, and `fa`, with `en` still the default. There is no fallback, output-language selector, output-locale storage, browser-language output selection, automatic interface/output coupling, direction field, or mismatch message, and the application continues to submit English output requests. The remaining Hebrew (`he`) backend output catalog, live multilingual and RTL validation, human review, output selection and storage, mismatch messaging, publication, and final documentation synchronization remain pending. Milestone 6 is not complete.

M6.29 adds complete deterministic Hebrew (`he`) API-level action-plan output and advances the successful action-plan schema to `1.16.0`. The Hebrew backend catalog is complete and independently authored rather than derived from another locale at runtime. It is an AI-assisted draft without independent native-speaker, regional, linguistic, medical, emergency, cultural, accessibility, RTL/bidi, or safety-critical review or approval. API-level support is not a release-readiness claim, does not constitute browser or visual RTL QA, and separate native-speaker, safety, assistive-technology, and future output-rendering review remains required before public release claims.

At M6.29, the supported output-locale set contained all 25 interface locale tags in the exact order `en`, `es`, `zh-CN`, `zh-TW`, `hi`, `bn`, `ar`, `pt-BR`, `fr`, `it`, `de`, `nl`, `ru`, `uk`, `pl`, `ja`, `ko`, `id`, `vi`, `th`, `tr`, `sw`, `ur`, `fa`, and `he`, with `en` still the default. All 25 backend output catalogs were implemented, while output selection and storage remained pending.

M6.30 adds one accessible native action-plan-language selector backed by the exact 25-locale registry. The preference key is `heatrelay.output-locale.v1`: an exact valid stored member is restored, while missing, invalid, inaccessible, wrong-type, or throwing storage falls back to English without writing a repair. Output resolution does not inspect browser languages or derive from interface locale. Explicit selection is persisted and affects only the next submission; it does not rewrite an existing result.

The action-plan request remains exactly four fields. Only the selected output-locale code is added from the preference boundary; visual mode and interface locale remain local-only, and situation text is never stored. M6.30 changes no backend, successful-response schema, GPT prompt or payload, weather, places, or action policy. At the close of M6.30, language-mismatch messaging, live multilingual and RTL browser QA, independent human review of the AI-assisted catalogs, final Milestone 6 verification, and publication remained pending. At the time this verification record was written, Milestone 6 was uncommitted and unpublished.

M6.31 adds deterministic language-context information after validated normal and urgent results. The classification uses only the response's detected-input language and output locale, in the exact order `unknown`, `other`, Catalan input-only, and supported-language mismatch. Matching supported languages produce no input-language notice. The displayed-plan language remains response-owned, while a different saved selection is shown separately as the next-plan language; changing it does not rewrite existing output. No browser or interface language, confidence value, or other model-internal information is used.

The information is a calm labelled section rather than an alert or live region. A normal result can focus the existing action-plan-language selector through a button that performs no selection, persistence, request, or submission. Urgent language information follows the complete fixed `112` content and official link and offers no change-language action. All 25 interface catalogs contain the same twelve localized, interpolation-free keys; these remain AI-assisted drafts without independent human approval.

M6.31 changes no backend, successful-response schema (`1.16.0`), output-preference storage, four-field request, API behavior, GPT boundary, dependency, weather, places, or action policy. At the close of M6.31, multilingual and RTL browser and assistive-technology QA, independent linguistic and safety review, final Milestone 6 verification, documentation synchronization, and publication remained pending. At the time this verification record was written, Milestone 6 was uncommitted and unpublished.

## M6.32 browser and assistive-technology evidence

M6.32 exercised bounded Chrome/macOS multilingual, bidirectional, keyboard,
accessibility-tree, 320px reflow, text-spacing, and actual 200% zoom scenarios.
One real VoiceOver session was manually confirmed by the project author; there
is no independent speech log. The audit found and corrected native language
selector clipping, German long-heading overflow, and Russian status-value
overflow. The fixes retained native selects, full native names, logical CSS,
visible focus, and the existing 48px Standard and 56px Enhanced target
contracts. This evidence is browser- and scenario-specific, not formal WCAG
certification or universal assistive-technology support.

## M6.33 translation-safety hardening

M6.33 strengthened backend tests to compare exact per-leaf occurrence counts
of `HeatRelay`, `Barcelona`, `Open-Meteo`, `GPT-5.6`, `112`, `34.0°C`,
`36.0°C`, and `40.0°C` against the aligned English source across every
non-English catalog. Frontend tests now require the complete, explicit set of
intentional English-equal values for every non-English interface catalog; an
added fallback or removed allowlisted equality fails the test.

That token test identified one incorrect `candidate_warnings.candidate_notice`
leaf in each of 13 catalogs: `ru`, `uk`, `pl`, `ja`, `ko`, `id`, `vi`, `th`,
`tr`, `sw`, `ur`, `fa`, and `he`. Each leaf was replaced with a direct
translation of the canonical factual, backend-approved candidate-place notice;
no other leaf changed. Automated structural and token checks do not establish
linguistic or safety approval.

## M6.34 provider evidence

M6.34-C1 routes exactly one sanitized successful-call record per provider call
through `uvicorn.error.heatrelay.usage`, making the existing allowlisted model
and aggregate token counts visible under standard Uvicorn logging. The record
does not include submitted text, model output, locale, candidates, coordinates,
credentials, response IDs, provider bodies, or raw metadata. Focused and full
backend verification passed offline with 248 and 2,568 tests respectively and
zero API cost.

An earlier Spanish-only M6.34 attempt returned a successful normal result but
had unavailable usage accounting. It is retained only as incomplete historical
evidence and is excluded from M6.34-C2 totals.

M6.34-C2 then completed four fresh UI submissions: Spanish matching normal,
Arabic matching normal, Russian input with Hebrew output, and Traditional
Chinese matching urgent. The run observed four extraction calls, three
grounded-plan calls, three Open-Meteo calls, and zero retries. Safe usage
records totaled 9,223 input tokens, 792 output tokens, and 10,015 total tokens;
the conservative authorized cost bound was `$0.1628075`, not exact provider
billing. The urgent case bypassed weather and grounded planning.

## Authoritative current state

HeatRelay now bundles 25 complete interface catalogs and 25 independently
authored immutable backend action-plan catalogs. Twenty-one locales are LTR;
`ar`, `ur`, `fa`, and `he` are RTL. The backend detects a closed set of 26
input-language tags, consisting of the 25 launch locales plus input-only
Catalan, with additional bounded `other` and `unknown` results. Interface
locale, detected language and source, requested output locale, and direction
are separate concepts.

The successful action-plan schema is `1.16.0`, with nested situation schema
`1.1.0`. The request has exactly `situation_text`, `origin`,
`maximum_distance_m`, and `output_locale`. The current interface exposes one
native language selector: an explicit choice changes the i18next interface and
the next request's output locale without translating input or rewriting an
existing result. For compatibility it writes the same exact code to the legacy
interface- and output-locale keys. Initial resolution prefers a valid stored
interface locale, then a valid stored output locale, then browser matching,
then English, without an automatic storage write. The API itself accepts only exact registered output codes and rejects
unsupported variants. Catalog hydration changes only registered prose.
Verified facts, IDs, official names, addresses, phone numbers, URLs, schedules,
timestamps, coordinates, distances, weather values, order, and provenance
remain backend-owned. Selecting a different language does not
rewrite an existing result, and deterministic language-context information is
passive rather than alerting.

The localized place scenario identifies the fixed Barcelona demo area without
“nearby” or device-location implications. Each of the 25 interface catalogs
carries exact-parity labels for explicit search, loading, success, empty,
safe-error, and compact boundary states. Scenario selection itself makes no
request; the standalone response parser keeps backend-owned candidate facts
and English backend warnings separate from action-plan output. These new and
revised translations remain AI-assisted drafts under the same human-review
limitations as the rest of each catalog.

The current catalogs also share exact-parity concise pre-submit copy: a
four-item age/cooling/mobility/symptom hint, one OpenAI/identity/fixed-point/
emergency notice, and three initial cooling actions. The longer disclosure
copy remains unchanged and available. Standalone results use one localized
compact boundary, confirmed-feature chips, and a single closed verification
disclosure; backend-authored notices remain English with explicit LTR
ownership.

Adding a future locale requires all of the following:

1. Add one complete interface catalog with exact key and interpolation parity,
   safe plain text, direction metadata, and deterministic formatter coverage.
2. Add one independent immutable backend `ActionPlanCatalog` with exact field,
   key-order, leaf-count, uniqueness, duplication, locked-safety, and factual-
   token invariants; do not import another locale's prose.
3. Register the exact code in the canonical frontend and backend orders and
   update strict request/response types and the successful schema version.
4. Extend catalog characterization, fallback, alias-rejection, immutability,
   mixed-catalog, deterministic-fact, GPT-boundary, parser, exact-request,
   reflow, bidi, and documentation tests.
5. Obtain independent native-speaker, linguistic, cultural, medical,
   emergency, accessibility, and safety-critical review before any reviewed or
   release-ready claim. Do not add runtime fallback, machine translation,
   locale inheritance, script conversion, or inference.

All 24 non-English interface and backend catalogs remain AI-assisted drafts
without that independent approval. This limitation does not block a bounded
Milestone 6 implementation commit, but it prohibits claims that the
translations are human-reviewed or release-ready. The live smoke covered four
scenarios, not all 25 locales; browser evidence is Chrome/macOS-specific; and
VoiceOver evidence is one author-confirmed session without independent speech
logging. No formal WCAG certification, universal assistive-technology support,
medical approval, cross-browser compatibility, deployment readiness, or
release readiness is established. Milestone 6 is implemented, verified within
the explicitly tested scope, and published through the repository commit
containing this translation-status revision.
