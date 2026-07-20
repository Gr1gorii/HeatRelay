# HeatRelay design QA

- Source visual truth: [authoritative final mockup](docs/heatrelay-final-mockup.png)
- Design-system plan: [Figma system plan](docs/figma-system-plan.md)
- Durable implementation evidence: [Enhanced desktop](docs/heatrelay-desktop-enhanced.png), [High Contrast desktop](docs/heatrelay-desktop-high-contrast.png), [mobile](docs/heatrelay-mobile.png), [Arabic RTL](docs/heatrelay-rtl-ar.png), [tablet](docs/heatrelay-tablet.png), and [type/language board](docs/heatrelay-type-language-board.png)
- Durable logo asset: [HeatRelay mark](frontend/src/assets/heatrelay-mark.png)
- Viewport: 1536 × 1056 CSS pixels
- State: Russian interface, Russian normal-result plan, Enhanced Visibility mode, verified temperature and selected-place fields supplied by a deterministic contract-valid QA response
- Browser-rendered URL: `http://127.0.0.1:5173/`

## Findings

The M7 correction pass fixes only the verified audit findings while preserving
the mock's red-and-white assistance identity, compact temperature band, left
scenario/right verified-place composition, strong primary action, numbered
immediate steps, real logo asset, and restrained teal verification accents.

The feedback regression at 800 × 712 was resolved: the full HeatRelay brand now remains visible, the three settings collapse into one accessible control below 901 px, and the generic first-step row with water and cool-space icons appears in the first viewport. At 320 px the page now reflows without horizontal scrolling.

The visible content differences are intentional product constraints rather than design drift. Listen/speech, an embedded map preview, calculated route or ETA, a permanent emergency strip, and an unverified third initial safety instruction are omitted because no approved behavioral or verified-data contract exists. Verified current temperature, opening hours, and fixed emergency content appear only through the existing response contract.

## Required fidelity surfaces

- Fonts and typography: the Inter/Noto fallback hierarchy, 18 px standard body size, 21 px enhanced body size, strong display hierarchy, readable line height, and script-specific stacks were verified. Urdu uses its larger line height; Arabic, Persian, Urdu, and Hebrew use RTL document direction without mirroring the logo. Long German and Ukrainian strings reflow without horizontal overflow.
- Spacing and layout rhythm: the desktop two-column grid, selected scenario density, compact result band, card borders, control radii, and action spacing align with the source direction. The layout collapses to one column below 900 px and reflows at 430 px and 320 px.
- Colors and visual tokens: assistance red, dark red, soft red, warm white, text, border, verification teal, warning, and blue focus tokens match the approved palette. High contrast uses white, near-black text and borders, dark-red actions, and a 4 px blue focus outline.
- Image quality and asset fidelity: the approved raster HeatRelay mark is used at its natural aspect ratio with no shadow, mirroring, CSS reconstruction, inline SVG substitute, or emoji. UI icons come from one pinned Phosphor icon family.
- Copy and content: scenario labels match the approved task framing and are non-interactive examples, because no scenario field exists in the product contract. The website-language and help-plan-language controls remain explicitly distinct. No catalog was changed in this correction.
- States and behavior: normal, urgent, no-place, loading, validation, and server-error states retain their existing contracts. The urgent alert precedes its resubmission form; essential form guidance is permanently exposed; one weather `dl` exposes all three facts; and the mobile language action opens Settings before focusing the existing select with zero request.
- External-link boundary: the Google Maps link exists only for a backend-verified selected place, uses HTTPS, a new tab, and `noopener noreferrer`, and contains only the verified address. It is not an embedded map, geolocation, route engine, ETA, or navigation feature.

## Focused evidence

- Desktop Enhanced Visibility: [heatrelay-desktop-enhanced.png](docs/heatrelay-desktop-enhanced.png)
- Desktop High Contrast: [heatrelay-desktop-high-contrast.png](docs/heatrelay-desktop-high-contrast.png)
- Mobile layout: [heatrelay-mobile.png](docs/heatrelay-mobile.png)
- Arabic RTL mobile: [heatrelay-rtl-ar.png](docs/heatrelay-rtl-ar.png)
- Tablet layout: [heatrelay-tablet.png](docs/heatrelay-tablet.png)
- Typography and language coverage: [heatrelay-type-language-board.png](docs/heatrelay-type-language-board.png)

Focused evidence was required because typography, focus treatment, state banners, mobile wrapping, RTL ordering, and help-centre details were too small to judge reliably in the full-view comparison.
The supplied 800 px before image includes browser chrome while the after capture does not; the focused comparison therefore judges the aligned application content region rather than the outer frame.

## Primary interactions tested

- Changed interface locale independently from output locale.
- Changed Standard, Enhanced Visibility, and High Contrast modes.
- Expanded and collapsed mobile settings.
- Confirmed all three assistance scenarios are non-interactive localized examples and add no request field.
- Entered a situation, submitted a normal plan, and opened all preserved dynamic states.
- Confirmed the Google Maps route link contains only the verified backend address.
- Confirmed no application console errors; only Vite development and React DevTools informational messages were present.

## Comparison history

1. Earlier P1: the implementation retained a generic single-column form and did not reproduce the approved scenario/help-centre dashboard. Fix: introduced the three-scenario selector, compact form, temperature status band, verified help pane, immediate-action row, and consistent real icons. The durable [Enhanced desktop](docs/heatrelay-desktop-enhanced.png) records the resulting layout.
2. Earlier P2: Enhanced Visibility made the selected form and place card too tall, pushing all immediate actions below the first viewport. Fix: reduced textarea rows without fixed heights, moved secondary help and source warnings into accessible disclosures, compacted verified fields and feature rows, and removed redundant layout padding. The durable [Enhanced desktop](docs/heatrelay-desktop-enhanced.png) records the resulting density.
3. Earlier P2: the 430 px temperature summary wrapped numeric units awkwardly and briefly exposed a hidden duplicate current-temperature item. The final semantic correction removes the duplicate and exposes current, apparent, and maximum temperature through one native ordered `dl` without duplicate announcement.
4. Final comparison: no actionable P0/P1/P2 finding remained in the combined [source mockup](docs/heatrelay-final-mockup.png) and durable implementation views at the matched viewport.
5. User-reported P1: at 800 × 712 the settings selectors covered the HeatRelay wordmark and no initial action icons appeared in the first viewport. Fix: moved the compact-settings breakpoint to 900 px, prevented brand shrinking, added the backend-safe initial water/cool-space steps, attached consistent icons to generated actions, and tightened only the compact selected form. The durable [tablet](docs/heatrelay-tablet.png) and [mobile](docs/heatrelay-mobile.png) views record the corrected responsive structure.
6. Follow-up P2: at 320 px the previous `body` minimum width combined with the browser scrollbar created a 15 px horizontal scroll. Fix: removed the fixed body minimum while retaining the responsive page padding and minimum control sizes; measured `scrollWidth === clientWidth`. The durable [mobile view](docs/heatrelay-mobile.png) records the final layout.
7. Final audit findings: ordinary dashboard content preceded the urgent result; essential guidance was hidden in a closed disclosure; Enhanced control boundaries and scrolling were insufficient; weather facts included an `aria-hidden` pair; the mobile language action could focus a select inside closed Settings; result heading order was illogical; and scenario cards falsely appeared interactive. The bounded correction fixes those findings without changing catalogs, backend behavior, requests, or product capabilities.

## Open questions

- None blocking in implementation scope. The approved mock's Listen control, illustrative map, approximate route/ETA, always-visible emergency strip, and third initial safety instruction remain intentionally absent because no approved behavior or verified-data contract exists.

## Implementation checklist

- [x] Approved layout and semantic token direction implemented.
- [x] Real logo and consistent icon family integrated.
- [x] Responsive, enhanced, high-contrast, RTL, and script-aware typography checked.
- [x] Normal, urgent, no-place, loading, validation, and error states checked.
- [x] Browser console checked.
- [x] Full-view and focused visual evidence captured.

The M7 implementation is verified within the recorded bounded scope and remains
uncommitted and unpublished at the time of this curation. This record does not
claim complete design fidelity, formal WCAG conformance, native-speaker review,
cross-browser support, or release readiness.
