# HeatRelay Roadmap

This is HeatRelay's authoritative forward-looking development sequence as of
2026-07-18. Completed milestones below are historical facts. Milestone 5 is
implemented and verified within the explicitly tested scope, with publication
tracked separately. Milestone 6 remains planned and unimplemented, Milestone 7
remains blocked, and Milestone 8 remains deferred. This roadmap does not claim
accessibility certification, complete standards conformance, deployment
readiness, or release status.

## Completed milestones

- **Milestone 0 — foundation** — `709e1b7`
- **Milestone 1 — deterministic Barcelona context** — `6b3b3bc`
- **Milestone 2 — multilingual situation extraction** — `9386d1b`
- **Milestone 3 — grounded Barcelona action planning** — `b7c5190`
- **Milestone 4 — Barcelona action-plan frontend** — `88f56a2`

The completed milestones retain their existing repository history and scope;
the requirements below are not retroactively attributed to them.

## Milestone 5 — Accessibility and Low-Vision Foundation

**Status:** Implemented and verified within the explicitly tested scope. Publication is tracked separately.

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
5. **Documentation and publication gate** — Final Milestone 5 documentation
   and offline publication-readiness verification are tracked separately from
   the later one-commit publication step.

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

**Status:** Planned and unimplemented.

Language and visual mode remain independent preferences: every completed
locale must work in both Standard and Enhanced Visibility.

1. Establish one typed locale registry, a canonical English catalog,
   deterministic fallback, a formatter boundary, and a local persistence
   contract.
2. Add version-controlled catalog batches covering all 25 required locales.
3. Add an accessible language selector using native language names and no
   flags.
4. Apply `lang`, `dir`, RTL support, logical CSS, and deterministic `Intl`
   formatting.
5. Keep separate typed concepts for interface locale, detected input language,
   input-language source, requested output locale, and text direction.
6. Migrate backend and GPT schemas with explicit output-locale enforcement.
7. Hydrate localized output deterministically so localization cannot alter
   verified facts, IDs, addresses, phone numbers, schedules, timestamps,
   coordinates, or weather values.
8. Add catalog-completeness, interpolation, fallback, RTL, long-text, and
   cross-mode tests.
9. Complete a translation-safety and browser-matrix audit.
10. Run a separately authorized multilingual live smoke only if the author
    approves it after a fresh cost review.
11. Complete Milestone 6 documentation and final verification before its one
    intentional commit and publication step.

### Required locale set

The 25 required locale catalogs are planned as:

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

Documentation may use the wording **Supported launch languages** only after
every catalog is complete. Translation documentation must state human-review
limitations honestly.

Locale identifiers and validation will follow
[BCP 47 / RFC 5646](https://www.rfc-editor.org/info/rfc5646/). Direction handling
will follow [W3C HTML direction guidance](https://www.w3.org/International/questions/qa-html-dir.en),
and deterministic locale-aware formatting will use the
[ECMA-402](https://tc39.es/ecma402/) boundary.

Milestone 6 preserves HeatRelay's closed-code GPT safety architecture. It does
not plan unconstrained model-generated emergency, medical, place, address,
schedule, source, or factual prose. The current extracted
`preferred_language` must not be overloaded: interface-locale and requested
output-locale fields remain separate concepts.

## Milestone 7 — Complete UI Redesign

**Status:** Blocked.

Implementation requires all of the following:

- Milestones 5 and 6 are both completed, verified, and published.
- The author supplies a separate, explicitly approved redesign prompt.
- An attached or otherwise accessible authoritative design file is available.

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
