# HeatRelay Roadmap

This is HeatRelay's authoritative forward-looking development sequence as of
2026-07-19. Completed milestones below are historical facts. Milestone 5 is
published at `5f5d23c4ba3af9c318e8427ed717f7b5b7656a00`. Milestone 6 is
implemented, verified within the explicitly tested scope, and published
through the repository commit containing this roadmap revision. Milestone 7
remains blocked, and Milestone 8 remains deferred. This roadmap does not claim
accessibility certification, complete standards conformance, deployment
readiness, or release status.

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
3. **Implemented:** accessible native interface- and action-plan-language
   selectors using native names and no flags.
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

**Status:** Blocked.

Implementation requires all of the following:

- The author supplies a separate, explicitly approved redesign prompt.
- An attached or otherwise accessible authoritative design file is available.
- Any conflict with the established accessibility, localization, privacy, or
  safety contracts is resolved before implementation.

The design source must cover, or explicitly define handling for, the initial
screen, form, loading, normal result, no-place result, urgent result, error
states, settings, mobile and desktop layouts, Standard and Enhanced Visibility,
RTL, long translated strings, and privacy and safety notices.

If the design source is absent, inaccessible, ambiguous, or conflicts with
accessibility, localization, privacy, or safety contracts, the implementation
task must return `HUMAN_REQUIRED` with no code changes. HeatRelay will not invent
a replacement visual identity from prose.

## Milestone 8 — Release Verification

**Status:** Deferred until after the verified Milestone 7 redesign.

All release work moves to this milestone:

1. Audit security, privacy, cost abuse, dependencies, vulnerabilities, and
   licenses.
2. Make bounded corrections supported by that audit.
3. Add single-process production packaging and verify secret exclusion.
4. Select a hosting provider and deploy.
5. Verify HTTPS, headers, health, static assets, logs, and secret exposure.
6. Run one separately authorized deployed browser golden-path smoke.
7. Finalize documentation and release evidence.
8. Prepare the Devpost description, video script and storyboard, submission
   checklist, and the primary build thread's `/feedback` Session ID.

Planning these gates does not establish compliance or authorize deployment,
network calls, paid verification, publication, or submission activity.
