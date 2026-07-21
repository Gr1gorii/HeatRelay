# HeatRelay Roadmap

This is HeatRelay's authoritative forward-looking development sequence as of
2026-07-21. Completed milestones below are historical facts. Milestone 5 is
published at `5f5d23c4ba3af9c318e8427ed717f7b5b7656a00`. Milestone 6 is
implemented, verified within the explicitly tested scope, and published
through the repository commit containing this roadmap revision. Milestone 7 is
published at `6866b4c31649751ecea665c8045d028e228796fb`. Milestone 8.1's
offline audit and the bounded M8.2 corrections are implemented and verified
offline, and the release safeguards are published through the repository
commit containing this roadmap revision. The current release commit
`00e3991628830d0a6a7affaa994aa49d833eb836` is deployed and has passed the
bounded checks recorded below. This roadmap does not claim accessibility
certification, complete standards conformance, medical approval, or universal
release readiness.

## Completed milestones

- **Milestone 0 — foundation** — `709e1b7`
- **Milestone 1 — deterministic Barcelona context** — `6b3b3bc`
- **Milestone 2 — multilingual situation extraction** — `9386d1b`
- **Milestone 3 — grounded Barcelona action planning** — `b7c5190`
- **Milestone 4 — Barcelona action-plan frontend** — `88f56a2`
- **Milestone 5 — accessibility and low-vision foundation** —
  `5f5d23c4ba3af9c318e8427ed717f7b5b7656a00`

The completed milestones retain their existing repository history and scope;
the requirements below are not retroactively attributed to them.

## Milestone 5 — Accessibility and Low-Vision Foundation

**Status:** Published at `5f5d23c4ba3af9c318e8427ed717f7b5b7656a00`.

1. **Visual-mode preference architecture** — Implemented `Standard` and
   `Enhanced Visibility` in one application through an accessible native
   selector, defensive local persistence, explicit-choice precedence over
   first-load contrast detection, and safe fallbacks. The preference requires
   no account and is not transmitted to the server.
2. **Enhanced Visibility token layer** — Implemented presentation-token
   overrides, not duplicated components, for larger text and controls,
   increased spacing and line height, stronger contrast, borders, focus,
   selected and disabled states, and reduced decoration and motion.
3. **Semantic and interaction accessibility** — Added direct labels and
   descriptions, validation associations, logical keyboard focus, status and
   error announcements, native weather-summary semantics, and textual or
   structural meaning that does not depend on color alone.
4. **Reflow and low-vision verification** — Verified the explicitly tested
   Standard and Enhanced flows at a 320 CSS-pixel viewport, with the WCAG
   text-spacing override, at actual 200% Chrome zoom, with runtime macOS Reduce
   Motion, and in one actual VoiceOver session manually confirmed by the project
   author. The verified CSS corrections removed root minimum-width overflow and
   made Enhanced viewport scrolling automatic.
5. **Documentation and publication gate** — Completed the final Milestone 5
   documentation, offline verification, one intentional commit, and
   publication.

Both modes target [WCAG 2.2](https://www.w3.org/TR/WCAG22/) AA where reasonably
testable, with stronger internal targets for Enhanced Visibility. This is a
development target, not certification or a claim of complete conformance.
Enhanced Visibility is a presentation preference for people with low vision
and anyone who prefers larger, clearer content. It is not a medical
classification and is not described as a mode for completely blind users.

The audit is not formal WCAG certification or a claim of complete conformance.
Runtime evidence is specific to Chrome on macOS, and the VoiceOver evidence is
limited to one real session manually confirmed by the project author. It does
not establish compatibility with every browser, platform, screen reader, or
assistive technology.

## Milestone 6 — Internationalization and Multilingual Processing

**Status:** Implemented, verified within the explicitly tested scope, and
published through the repository commit containing this roadmap revision.

Language and visual mode remain independent preferences: every completed
locale must work in both Standard and Enhanced Visibility.

1. **Implemented:** one typed locale registry, canonical English interface
   catalog, deterministic frontend fallback, formatter boundary, and defensive
   local persistence contracts.
2. **Implemented:** 25 bundled interface catalogs and 25 independent immutable
   backend action-plan output catalogs.
3. **Implemented:** one accessible native language selector using native names
   and no flags; it controls the interface and the next plan locale while the
   visual-mode selector remains separate.
4. **Implemented and boundedly verified:** `lang`, `dir`, four RTL locales,
   logical CSS, and deterministic `Intl` formatting.
5. **Implemented:** separate typed interface locale, detected input language,
   input-language source, requested output locale, and direction concepts.
6. **Implemented:** action-plan schema `1.16.0`, nested situation schema
   `1.1.0`, and exact strict output-locale request/response enforcement.
7. **Implemented and verified:** deterministic single-catalog hydration while
   facts, IDs, names, addresses, phone numbers, URLs, schedules, timestamps,
   coordinates, distances, weather values, and provenance remain backend-owned.
8. **Implemented:** catalog completeness, key/interpolation parity, exact
   fallback, immutability, token, RTL, long-text, parser, workflow, and
   cross-mode tests.
9. **Verified within the audited scope:** multilingual/bidirectional Chrome,
   320px reflow, actual 200% zoom, one author-confirmed VoiceOver session, and
   translation-safety checks; corrected selector, German heading, and Russian
   status overflow defects.
10. **Verified within four authorized live scenarios:** Spanish and Arabic
    matching normal results, Russian input with Hebrew output, and Traditional
    Chinese urgent bypass, with seven OpenAI calls, three Open-Meteo calls,
    zero retries, and conservative cost bound `$0.1628075`.
11. **Implemented and verified offline:** synchronized Milestone 6
    documentation and final verification, followed by publication through the
    repository commit containing this roadmap revision.

### Required locale set

The 25 supported interface and backend output locale catalogs are implemented:

- `en`
- `es`
- `zh-CN`
- `zh-TW`
- `hi`
- `ar`
- `pt-BR`
- `bn`
- `ru`
- `ja`
- `fr`
- `de`
- `ur`
- `id`
- `tr`
- `ko`
- `it`
- `uk`
- `pl`
- `vi`
- `th`
- `fa`
- `sw`
- `he`
- `nl`

All 24 non-English catalogs remain AI-assisted drafts without independent
native-speaker, linguistic, cultural, medical, emergency, accessibility, or
safety-critical approval. This does not block a bounded implementation commit,
but it prohibits human-reviewed or release-ready claims. The live smoke covered
four scenarios, not all 25 locales; browser evidence is Chrome/macOS-specific,
and the VoiceOver evidence is one author-confirmed session without independent
speech logging.

Locale identifiers and validation follow
[BCP 47 / RFC 5646](https://www.rfc-editor.org/info/rfc5646/). Direction handling
will follow [W3C HTML direction guidance](https://www.w3.org/International/questions/qa-html-dir.en),
and deterministic locale-aware formatting uses the
[ECMA-402](https://tc39.es/ecma402/) boundary.

Milestone 6 preserves HeatRelay's closed-code GPT safety architecture. It does
not use unconstrained model-generated emergency, medical, place, address,
schedule, source, or factual prose. The current extracted
`preferred_language` must not be overloaded: interface-locale and requested
output-locale fields remain separate concepts.

## Milestone 7 — Complete UI Redesign

**Status:** Implemented, verified within the bounded offline/browser scope, and
published at `6866b4c31649751ecea665c8045d028e228796fb`.

- The approved red-and-white mockup is implemented through the existing React
  flow without changing the four-field request, backend, catalogs, or safety
  policy.
- M5 Standard and Enhanced Visibility remain intact. High Contrast is the M7
  third visual mode under the same strict storage, state, request, target-size,
  focus, and RTL contracts; it is not retroactively attributed to M5.
- The form keeps one compact essential privacy, identity, fixed-origin,
  OpenAI-processing, and demo-boundary notice permanently available before
  submission, with the longer facts in a native disclosure. Native scenario
  buttons move the same form without storage, requests, text rewriting, or a
  scenario request field.
- Normal weather is one accessible native three-pair definition list. Urgent
  results put the one complete fixed `112` alert before any resubmission form
  and omit ordinary dashboard/normal-result surfaces ahead of it.
- A normal-result language action opens mobile Settings before focusing the
  native unified language selector, preserves the displayed result, and makes
  no request.
- The Google Maps boundary is one HTTPS new-tab link for a backend-verified
  selected-place address only. It is not an embedded map, geolocation, route,
  ETA, or navigation feature.
- Listen/speech, an embedded map preview, a calculated route or ETA, a permanent
  emergency strip, and an unverified third initial safety instruction remain
  intentional omissions because no approved behavioral or verified-data
  contract exists.

The ordered offline and loopback-only M7 verification and publication are
complete. The evidence does not establish complete design
fidelity, formal WCAG conformance, native-speaker review, cross-browser
support, medical approval, or release readiness.

## Milestone 8 — Release Verification

**Status:** M8.1 offline audit completed. M8.2A and the bounded M8.2 B–D
corrections are implemented, verified offline, and published through the
repository commit containing this roadmap revision. M8.4A selected Fly.io Pay
As You Go; M8.4B adds the bounded single-Machine Fly configuration, proxy
identity contract, and deterministic license bundle. Release commit
`00e3991628830d0a6a7affaa994aa49d833eb836` is deployed to one Amsterdam
Machine; health, readiness, HTTPS/security headers, caching, multilingual
mobile/RTL behavior, and the bounded Russian-normal/Traditional-Chinese-urgent
live smoke passed. Legal and human translation review, broader accessibility
and browser coverage, and the human Devpost submission steps remain separate.

All release work moves to this milestone:

1. **Completed:** audit security, privacy, cost abuse, dependencies, packaging,
   documentation, and licenses offline; M8.4A added a point-in-time online
   advisory review that must still be refreshed at release.
2. **Implemented and verified offline:** bounded corrections supported by the
   audit, including source-grounded urgent symptoms, abuse controls, a shared
   hard provider budget, HTTPS-only official links, and operational records.
3. **Implemented and verified offline:** single-process production packaging,
   deterministic constraints, readiness, security headers, and secret/context
   exclusion.
4. **Selected/configured:** Fly.io Pay As You Go, one `shared-cpu-1x`, 512 MB
   Machine in `ams`, autostop off, readiness at `/api/ready`.
5. **Completed within the tested scope:** deployed one Amsterdam
   `shared-cpu-1x`, 512 MB Machine and verified HTTPS, exact security headers,
   health/readiness, cache policy, mobile/RTL layout, and deterministic places
   without a provider call.
6. **Completed within the tested scope:** one Russian normal and one
   Traditional Chinese urgent deployed UI smoke produced two submissions,
   three OpenAI calls, one inferred Open-Meteo call, zero retries, and a
   `$0.45` conservative reservation bound.
7. **Completed:** synchronized current release evidence and limitations.
8. **Prepared; human actions remain:** Devpost copy, a 2:30–2:45 video script,
   and the submission checklist are documented. Registration, personal
   eligibility confirmation, public YouTube publication, and the primary build
   thread's `/feedback` Session ID remain `HUMAN_REQUIRED`.

Planning the remaining gates does not establish compliance or authorize
deployment, network calls, paid verification, or submission activity.
