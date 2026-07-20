# Third-party notices

HeatRelay is licensed under the repository [MIT License](LICENSE). The
following inventory records the direct and transitive production packages
installed and inspected offline for this revision. Package names, versions,
and licenses come from installed package metadata. This summary is not a
replacement for upstream license texts or legal review.

The production image includes the project license, this inventory, and the
verbatim license and notice files available in the exact production closures
at `/usr/share/licenses/heatrelay/`. The deterministic generator treats the
locked `html-parse-stringify` 3.0.1 package specially because its published
package contains only an MIT declaration in its README rather than a separate
license file; the bundle preserves that declaration and its package author
metadata without supplying invented text.

## Python production closure

| Package | Version | Declared license |
| --- | ---: | --- |
| annotated-doc | 0.0.4 | MIT |
| annotated-types | 0.7.0 | MIT |
| anyio | 4.14.2 | MIT |
| certifi | 2026.6.17 | MPL-2.0 |
| click | 8.4.2 | BSD-3-Clause |
| distro | 1.9.0 | Apache-2.0 |
| exceptiongroup | 1.3.1 | MIT |
| fastapi | 0.139.2 | MIT |
| h11 | 0.16.0 | MIT |
| httpcore | 1.0.9 | BSD-3-Clause |
| httpx | 0.28.1 | BSD-3-Clause |
| idna | 3.18 | BSD-3-Clause |
| jiter | 0.16.0 | MIT |
| openai | 2.46.0 | Apache-2.0 |
| pydantic | 2.13.4 | MIT |
| pydantic-core | 2.46.4 | MIT |
| sniffio | 1.3.1 | MIT OR Apache-2.0 |
| starlette | 1.3.1 | BSD-3-Clause |
| tqdm | 4.68.4 | MPL-2.0 AND MIT |
| typing-extensions | 4.16.0 | PSF-2.0 |
| typing-inspection | 0.4.2 | MIT |
| uvicorn | 0.51.0 | BSD-3-Clause |

The exact closure is pinned in
`backend/constraints-production.txt`; direct intent remains in
`backend/requirements.txt`.

## Frontend production closure

| Package | Version | Declared license |
| --- | ---: | --- |
| @babel/runtime | 7.29.7 | MIT |
| @phosphor-icons/react | 2.1.10 | MIT |
| html-parse-stringify | 3.0.1 | MIT |
| i18next | 26.3.6 | MIT |
| react | 19.2.7 | MIT |
| react-dom | 19.2.7 | MIT |
| react-i18next | 17.0.10 | MIT |
| scheduler | 0.27.0 | MIT |
| typescript | 6.0.3 | Apache-2.0 |
| use-sync-external-store | 1.6.0 | MIT |
| void-elements | 3.1.0 | MIT |

TypeScript is included by the installed production dependency graph as
declared by the localization packages even though HeatRelay uses it primarily
at build time.

## Data and services

The reviewed Barcelona climate-shelter subset is derived from Ajuntament de
Barcelona open data under CC BY 4.0, with transformation attribution and
provenance in the committed snapshot and manifest. Open-Meteo weather context
is attributed in every API response under the documented CC BY 4.0 terms.
Service terms and suitability must be rechecked before deployment.

Current online vulnerability status was not checked during the offline audit.
Third-party notice completeness, license compatibility, and legal sufficiency
remain subject to independent release review.
