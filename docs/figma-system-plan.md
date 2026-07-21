# HeatRelay editable Figma system — v1 plan

Run ID: `heatrelay-ds-v1`

## Source truth inventory

### Production code

- Font stack: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- 69 root CSS variables: 32 color tokens, 4 font sizes, 3 line heights, 6 shadows, 3 spacing tokens, 3 border widths, 2 focus tokens, 2 target-size tokens, 1 motion token, and 13 aliases.
- Default target control size: 48 px; enhanced mode: 56 px.
- Visual modes in code: M5 `standard` and `enhanced`, plus M7
  `high-contrast`; first-load fallback still uses `prefers-contrast: more`.
- 25 interface/output locales. RTL: Arabic, Persian, Urdu, Hebrew.
- No Code Connect files are present.
- Reusable UI families implied by the React/CSS source: Brand, Button, Select, Textarea, Status Card, Form Card, Phase Card, Place Card, Alert/Banner, Language Controls, Visual Mode Control, Action List, Emergency Result.

### Existing Figma file

- One page: `Page 1`.
- Existing visual layers: approved desktop, final logo version, enhanced low-vision, high contrast, mobile, tablet, Arabic RTL, and global typography/accessibility board.
- Existing local collections:
  - `HeatRelay / Color`: 11 variables, one `Default` mode.
  - `HeatRelay / Size`: 16 variables, one `Default` mode.
- Existing color values:
  - `color/bg/base` `#FFFFFF`
  - `color/bg/warm` `#FAF8F5`
  - `color/text/primary` `#242424`
  - `color/text/secondary` `#5E5E5E`
  - `color/danger/default` `#C62828`
  - `color/danger/surface` `#FDECEC`
  - `color/danger/border` `#E38B8B`
  - `color/verified/default` `#236B66`
  - `color/verified/surface` `#E8F3F1`
  - `color/border/default` `#DDDAD6`
  - `color/focus/default` `#1B5FA7`
- Existing size values:
  - Spacing: 4, 8, 12, 16, 20, 24, 32, 40, 48, 56.
  - Radius: 8, 12, 16, 20, 999.
  - Control minimum height: 52.
- Existing text-style groups: Label, Button, Display, Heading, Title, Body.
- No reusable component sets were visible in the current layer inventory; current approved screens are flattened image layers.

## Approved source-of-truth decision

Before M7, the production stylesheet and approved mockups were different visual
systems.

- Pre-M7 production code: warm sand `#F6F1E8`, ink `#28251F`, teal `#174B4D`, yellow `#F3C85C`, orange focus `#C84F2D`.
- Approved mockups: white/warm-white backgrounds, assistance red around `#C12620`, teal around `#116B6C`, blue focus around `#195EA8`, restrained emergency surfaces.
- Existing Figma variables are close to the approved mockups but are not exact matches (`#C62828` vs `#C12620`, `#236B66` vs `#116B6C`, and similar differences).

Decision approved by the user on 2026-07-20: the explicitly approved red/white
mockups are the visual source of truth for Figma v1. M7 reconciles production
CSS to that direction without overriding established accessibility,
localization, privacy, API, or safety contracts.

## Locked v1 proposal

### Foundations

- Primitive color collection: approved red/white raw colors from the final mockups.
- Semantic color collection with modes: `Standard`, `High contrast`.
- Size collection: existing spacing and radius scale, corrected control targets 48/56.
- Typography styles: Display, Heading, Title, Body, Supporting, Label, Button; script-specific fallback documentation.
- Effect styles: focus ring, card elevation, emergency emphasis.

### Components

1. `Brand / HeatRelay`
2. `Button` — Style × Size × State
3. `Toolbar control` — standard/enhanced and focus states
4. `Textarea` — default/focus/error/disabled
5. `Scenario card` — localized native-button header with one expanded form
6. `Temperature status`
7. `Place card`
8. `Feature row`
9. `Emergency banner`
10. `Language and visual-mode controls`

### Composed views and prototype

- Desktop default
- Desktop enhanced low vision
- Desktop high contrast
- Tablet default
- Mobile default
- Desktop Arabic RTL
- Prototype connections for visual-mode switching, disclosure expansion, and
  the verified-address external-link boundary

## Phase 0 gap analysis

- Code-only: full React states, form validation, loading/error/result branches, 69 CSS variables, 25 locale catalogs.
- Figma-only: approved red/white direction, exact new logo artwork, responsive mockups, high-contrast mockup, Arabic RTL mockup, language font board.
- Missing in Figma: editable components, variants, semantic modes, component properties, Auto Layout screen composition, prototype reactions, Code Connect.
- Implemented in code by M7: approved red/white visual system, approved logo
  integration, responsive assistance dashboard, and the third High Contrast
  presentation mode while preserving M5/M6 behavior.
- Intentional code deviations: no Listen/speech control, embedded map preview,
  calculated route/ETA, permanent emergency strip, or unverified third initial
  safety instruction. No approved behavioral or verified-data contract exists
  for those elements, so M7 adds no Web Speech, maps SDK, geolocation, routing,
  external font, or new API.
- Blocker: Figma Starter MCP call quota is exhausted; both file inspection and library discovery APIs are unavailable until the quota resets or the plan is upgraded.
- Resolved: the approved red/white direction is implemented in production.

## M7 implementation reconciliation

The current code uses each localized scenario header as a native button and
renders the same single form beneath the active card. Scenario selection is
presentation-only: it is not stored, makes no request, does not rewrite input,
and adds no scenario field. One compact essential form notice stays visible,
the existing longer guidance uses a native disclosure, and one native
three-pair weather definition list retains its own non-overlapping disclosure.
Fixed urgent `112` content appears before any resubmission form, and mobile
Settings opens before focus moves to the existing unified language select. The
only Google Maps surface is an HTTPS
new-tab link containing a backend-verified address; it is not a map, route,
ETA, geolocation, or navigation product.

High Contrast belongs to M7 rather than M5. Standard remains at least 48px,
Enhanced remains at least 56px with automatic programmatic scrolling, and all
three modes preserve strict storage validation, current state, request
noninterference, focus, and RTL behavior. At the time this verification record
was written, the implementation was verified within the bounded offline and
loopback-browser scope and remained uncommitted and unpublished. The correction
is published through the repository commit containing this revision and does
not claim complete design fidelity or release readiness.
