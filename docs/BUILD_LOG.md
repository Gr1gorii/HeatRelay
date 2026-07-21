# HeatRelay build log

## Milestone 0 — 2026-07-16

### Work performed with Codex in the primary build thread

- Inspected the local Git repository, history, status, remotes, files,
  manifests, and available Node.js and Python tooling before editing.
- Established the React, Vite, and TypeScript frontend foundation.
- Implemented the accessible English product shell and explicit scope,
  privacy, and safety notices.
- Implemented the FastAPI health endpoint and backend pytest coverage.
- Added the frontend rendering smoke test, root Make commands, coordinated
  development supervisor, environment example, ignore rules, MIT license,
  and project documentation.
- Selected and checked the declared licenses of all direct dependencies.
- Ran the verification workflow recorded below.

### Product, scope, and safety decisions supplied by the author

The author supplied the HeatRelay name, the tagline “From heat warning to a
safe next step.”, Barcelona as the first MVP city, the future server-side
GPT-5.6 direction, the requested privacy and safety posture, the required
milestone acceptance criteria, and the list of capabilities to defer.

Codex translated those constraints into this foundation. It did not originate
or independently validate competition eligibility, registration, personal
facts, API billing status, or later product decisions.

### Third-party frameworks and dependencies

The implementation uses React, React DOM, Vite, TypeScript, FastAPI, Uvicorn,
Vitest, jsdom, Testing Library, pytest, and HTTPX. These projects remain the
work of their respective maintainers. Their direct purpose, pinned version,
and declared license are documented in
[COMPLIANCE.md](COMPLIANCE.md#direct-dependency-license-inventory).

### Thread roles and author ownership

The primary English-language Codex build thread is used for repository
inspection, implementation, debugging, tests, and project documentation.

A separate Russian-language planning and compliance thread is used for product
scope, milestone design, safety decisions, rule verification, and preparing
prompts for the primary thread. No core implementation is attributed to the
planning thread.

The author retains final product, scope, safety, and submission decisions.
Devpost registration, personal eligibility, local remote configuration, the
first push, and future OpenAI API access or billing remain author-owned
confirmations or actions.

### Verification record

Commands were run from the repository root unless noted otherwise.

| Command or check | Exit status | Result |
| --- | ---: | --- |
| `npm --prefix frontend install` | 0 | Generated the lockfile; 0 reported vulnerabilities. |
| `make setup` | 0 | Created `.venv`, installed backend packages, and completed `npm ci`; 0 reported npm vulnerabilities. |
| `.venv/bin/python -m pytest backend/tests` | 0 | 2 backend tests passed without warnings. |
| `npm --prefix frontend test` | 0 | 1 frontend test file and 1 test passed. |
| `npm --prefix frontend run build` | 0 | Type-check and Vite production build passed. |
| `make test` | 0 | Complete root command passed: 2 backend tests and 1 frontend smoke test. |
| `make build` | 0 | Complete root frontend build command passed. |
| `.venv/bin/python -m pip check` | 0 | No broken Python requirements were found. |
| `npm --prefix frontend ls --depth=0` | 0 | Installed direct dependency versions match the manifest. |
| Host-permitted `make dev` | 0 on final SIGTERM run | Both services started; the supervisor stopped both process groups. |
| `curl --fail --silent --show-error http://127.0.0.1:8000/api/health` | 0 | Returned `{"status":"ok","service":"heatrelay-api"}`. |
| Frontend HTTP status check at `http://127.0.0.1:5173/` | 0 | Returned HTTP 200. |
| Vite proxy request to `http://127.0.0.1:5173/api/health` | 0 | Returned the exact health JSON. |
| Read-only request to the supplied GitHub repository URL | 0 | Returned HTTP 200; local Git still has no remote or commits. |
| Post-shutdown `lsof` checks for ports 8000 and 5173 | 1 each, expected | No listening process matched either port. |
| Post-shutdown `pgrep` checks for Uvicorn and Vite | 1 each, expected | No matching process remained. |
| `git diff --check` | 0 | No tracked diff errors; the repository has no tracked files yet. |
| Project-file trailing-whitespace scan with `rg` | 1, expected | No match across nonignored project files. |
| Filename-only key-pattern scan with `rg -l` | 1, expected | No key-like value matched; no candidate value was printed. |
| `git status --short` | 0 | Only the new, intentionally untracked milestone files were listed. |

Environmental failures and limitations were handled explicitly:

1. Initial npm and PyPI registry lookups inside the network-restricted sandbox
   exited 1 with DNS resolution errors. Read-only metadata checks and setup
   were rerun with network permission and succeeded.
2. The first Uvicorn run used the optional reloader, which exited 3 with
   `[Errno 1] Operation not permitted` in the restricted environment. The
   reloader flag was removed; backend reload was not an acceptance criterion.
3. A sandboxed bind attempt exited 3 because this environment blocks listening
   on localhost. The same final command was rerun with permission to bind to
   `127.0.0.1`. Sandboxed `curl` attempts then exited 7 because they could not
   reach the host-permitted listeners; the same requests rerun with host
   permission passed.
4. Sandboxed `pgrep` checks exited 3 because the process-list service was
   unavailable. Host-permitted reruns exited 1 as expected with no matches.
5. `pip check` printed a warning that the user-level pip cache directory was
   not writable. It still exited 0 and reported no broken requirements.

An intentional `Ctrl-C` run caused the PTY wrapper to report status 1 while
the supervisor logged its shutdown path. Both services stopped, and the
listener and process checks were empty. A separate final SIGTERM run ended
`make dev` with status 0 and the same clean shutdown.

An independent implementation review then found that the original shutdown
helper could return after a direct process leader exited even if a stubborn
descendant remained in its process group. An adversarial probe reproduced that
edge. The helper was updated to track complete process groups through the
grace period, force-stop remaining descendants, and wait for group removal.
The repeated probe passed, and a pytest regression test now covers this case.

One read-only reviewer also issued a malformed combined `rg` command that
failed before scanning with a shell quoting error (exit 1). The reviewer reran
the patterns separately, and the root agent's final filename-only scan also
completed with no key-like matches. The quoting error was a superseded
verification-command failure, not a repository finding.

## Milestone 0 correction pass — 2026-07-16

### Corrections performed in the primary build thread

- Changed the future backend OpenAI environment placeholder to an empty value.
- Added the official competition baseline and separated confirmed public
  repository existence from pending local remote configuration and first push.
- Documented the distinct roles of the primary English build thread and the
  separate Russian planning and compliance thread.
- Added intended-audience and planned server-side GPT-5.6 boundaries to the
  README without implementing those capabilities.
- Added separate root backend and frontend test targets.
- Added concise cleanup warnings for denied process-group signals and an
  isolated regression test that monkeypatches all signal operations.

No dependency version, frontend design, API contract, or deferred Milestone 1
functionality changed in this pass.

### Correction-pass verification record

Commands were run from the repository root.

| Command or check | Exit status | Result |
| --- | ---: | --- |
| `make test-backend` | 0 | 3 backend tests passed. |
| `make test-frontend` | 0 | 1 frontend smoke test passed. |
| `make test` | 0 | Both split test targets passed: 3 backend tests and 1 frontend test. |
| `make build` | 0 | Type-check and Vite production build passed. |
| `.venv/bin/python -m pip check` | 0 | No broken requirements; the existing unwritable user-cache warning was printed. |
| `npm --prefix frontend ls --depth=0` | 0 | Installed direct dependency versions remain unchanged and match the manifest. |
| Filename-only actual-key-pattern scan | 1, expected | No real key-like value or nonempty `OPENAI_API_KEY` assignment matched. |
| Project-wide real `.env` filename check | 1, expected | No `.env` file was found outside excluded generated directories. |
| Frontend OpenAI key-variable scan | 1, expected | No `OPENAI_API_KEY` or OpenAI-prefixed `VITE_` variable was found in `frontend/`. |
| Project-wide trailing-whitespace scan | 1, expected | No match across untracked project files; generated and cache directories were excluded. |
| `git diff --check` | 0 | No tracked diff errors; all project files remain untracked, so the separate project-wide scan covers them. |
| `git status --short` | 0 | Only the intended untracked Milestone 0 files were listed. |
| Host-permitted `make dev` | 0 on SIGTERM | Backend and frontend started, and the supervisor shut down both service process groups. |
| Backend health request | 0 | Returned `{"status":"ok","service":"heatrelay-api"}`. |
| Frontend reachability request | 0 | Returned HTTP 200. |
| Vite proxy health request | 0 | Returned the exact backend health JSON. |
| Post-shutdown `lsof` and host-permitted `pgrep` checks | 1 each, expected | No listeners or matching Uvicorn/Vite processes remained. |
| Read-only public GitHub repository request | 0 | `https://github.com/Gr1gorii/HeatRelay` returned HTTP 200. |

## Milestone 0 publication — author-performed

After Milestone 0 passed independent verification, the author manually:

- restored GitHub authentication;
- configured the approved Git identity in the local HeatRelay repository;
- created commit `709e1b7` with message
  `chore: establish HeatRelay milestone 0 foundation`; and
- pushed local `main` to `origin/main`.

Repository inspection at the start of Milestone 1 showed local `main` and
`origin/main` at `709e1b7`, with `origin` set to
`https://github.com/Gr1gorii/HeatRelay.git`. These publication actions were
performed by the author and are not attributed to Codex.

## Milestone 1 — 2026-07-16

### Work performed with Codex in the primary build thread

- Re-inspected the clean repository, current commit, remote, source, tests,
  documentation, dependency manifests, and established conventions before
  editing.
- Reviewed the official Barcelona dataset metadata and JSON distribution and
  the Open-Meteo documentation, license, and terms supplied by the author.
- Added a deterministic normalization workflow for a small, reviewed,
  versioned Barcelona climate-shelter snapshot and its provenance manifest;
  the large upstream JSON is not committed.
- Added strict snapshot loading, seasonal opening-hours eligibility,
  fail-closed required-feature filtering, Haversine distance ranking, and a
  stable lexical `place_id` tie-breaker.
- Added a bounded server-side Open-Meteo client, normalized weather contract,
  stable sanitized failure response, and the two versioned context endpoints.
- Added offline automated coverage for weather failure modes, normalization,
  snapshot integrity, schedules, filtering, ranking, response contracts, and
  the unchanged health endpoint.
- Updated the existing English frontend copy only enough to acknowledge that
  the context services exist on the backend; the interface remains
  disconnected from them.
- Updated project architecture, source, privacy, license, refresh, and scope
  documentation.

### Product, scope, source, and safety decisions supplied by the author

The author defined Milestone 1 as a bounded backend and data milestone,
selected the only permitted Barcelona and Open-Meteo sources, required a
small reviewed snapshot instead of a completeness claim, and specified the
privacy, provenance, deterministic filtering, hours-verification, and
fail-closed safety rules.

The author also required GPT-5.6, generated plans, medical logic, official
warning interpretation, maps, routing, browser geolocation, authentication,
analytics, deployment, and additional cities to remain out of scope. The
author retains final product, scope, safety, data-review, and submission
decisions.

### Thread roles and third-party work

The primary English-language Codex build thread remains the location for
repository inspection, implementation, debugging, tests, and project
documentation. The separate Russian-language planning and compliance thread
continues to cover product scope, milestone design, safety decisions, rule
verification, and prompt preparation. No core implementation is attributed
to the planning thread.

Barcelona source records remain the work of Ajuntament de Barcelona.
Open-Meteo and all software dependencies remain the work of their respective
publishers and maintainers. HeatRelay's contribution is the bounded service
implementation and the documented selection and normalization of source
data.

### Milestone 1 verification record

Commands were run from the repository root unless noted otherwise.

| Command or check | Exit status | Result |
| --- | ---: | --- |
| `make setup` | 0 | The pinned Python requirements were already satisfied and `npm ci` installed 106 packages. Pip's optional index check printed DNS retries and the existing unwritable user-cache warning, but installation completed. |
| `make test-backend` | 0 | All 78 backend tests passed. |
| `make test-frontend` | 0 | The frontend smoke test passed. |
| `make test` | 0 | The complete root command passed: 78 backend tests and 1 frontend test. |
| `make build` | 0 | Type-check and Vite production build passed. |
| `.venv/bin/python -m pip check` | 0 | No broken requirements; the existing unwritable user-cache warning was printed. |
| `npm --prefix frontend ls --depth=0` | 0 | All installed direct frontend versions matched the manifest. |
| Python `pip show` and installed npm `package.json` license inventory | 0 | Direct dependency versions and declared MIT, BSD-3-Clause, and Apache-2.0 licenses matched `COMPLIANCE.md`. |
| Default `PlaceRepository().load()` snapshot validation | 0 | Loaded snapshot `barcelona-climate-shelters-v1-2026-07-16`: 15 places and normalized SHA-256 `c958b7ba10b133132d9f1c8b98d84cd1b53644d27cbbd225b5b46bb98d89202b`. |
| Two same-input normalizer runs plus snapshot/manifest `cmp` checks | 0 each | Both generated documents were byte-identical to each other and to the current snapshot and manifest. |
| Live `--download` official-source normalization | 0 on final run | Retrieved and validated 535 official JSON records at `2026-07-16T19:31:30Z`; 15 were selected and 520 rejected. Raw and normalized hashes matched the current provenance, and the normalized snapshot was byte-identical. |
| Live `WeatherService` Open-Meteo smoke check | 0 | Returned normalized, timezone-aware current and same-day context with attribution and the model-derived warning; request coordinates were not returned. |
| Host-permitted `make dev` | 1 from the PTY wrapper after intentional `Ctrl-C` | Uvicorn and Vite started successfully, the supervisor logged its shutdown path, and both service processes stopped. |
| Backend health and Vite proxy health requests | 0 each | Both returned `{"status":"ok","service":"heatrelay-api"}`. |
| Frontend reachability request | 0 | Returned HTTP 200. |
| Local weather endpoint request | 0 | Returned HTTP 200 with the normalized live weather contract. |
| Local deterministic open-place request | 0 | Returned the expected first three place IDs with distances 1382, 1398, and 1954 metres and verified closing times. |
| Vite-proxied empty-candidate request | 0 | Returned HTTP 200, an empty candidate array, the no-fallback explanation, and the hours warning. |
| Post-shutdown `lsof` and host-permitted `pgrep` checks | 1 each, expected | No listeners or matching Uvicorn/Vite processes remained. |
| Filename-only actual-key-pattern scan | 1, expected | No key-shaped credential or nonempty `OPENAI_API_KEY` assignment matched; no candidate value was printed. |
| Project-wide real `.env` filename scan | 1, expected | No real `.env` or `.env.*` file was present outside excluded generated directories. |
| Project-wide trailing-whitespace scan | 1, expected | No match across tracked and untracked project files; generated and cache directories were excluded. |
| `git check-ignore` for environments, dependencies, build output, and caches | 0 | `.venv`, `frontend/node_modules`, `frontend/dist`, `.pytest_cache`, and Python caches remained ignored. |
| `git diff --check` | 0 | No tracked diff errors were found; the separate project-wide scan covered untracked files. |
| `git status --short --untracked-files=all` | 0 | Only the intended Milestone 1 edits and new project files were listed; no generated dependency or build directory appeared. |

The live verification also exposed and resolved two implementation issues:

1. The original standard-library direct downloader exited 1 because this
   host's Python trust store could not verify the official Barcelona HTTPS
   certificate, although a read-only `curl --head` returned HTTP 200.
   The downloader was changed to the already-pinned HTTPX client. Its first
   focused test exited 1 because the top-level `httpx.stream` helper does not
   accept a test transport; the implementation was corrected to use
   `httpx.Client`, after which the focused suite and live download passed.
2. Sandboxed `make dev` exited 2 because the environment denied localhost
   binds and also denied one cleanup signal, which produced the supervisor's
   intended warning. The same workflow was rerun with localhost permission;
   all requests passed, intentional `Ctrl-C` shut down both services, and
   post-shutdown listener and process checks were empty.

## Milestone 1 coordinate-time correction pass — 2026-07-16

Independent verification after the initial Milestone 1 pass found that the
weather request accepted global coordinates while requesting and normalizing
all results as `Europe/Madrid`. The earlier live weather check exercised
Barcelona only and therefore did not establish the global coordinate-time
contract.

At the time this verification was recorded, this narrow correction was
uncommitted:

- changes the Open-Meteo request to `timezone=auto`;
- validates the returned coordinate-local IANA timezone with the Python
  standard library;
- resolves local timestamps against the returned UTC offset, including DST
  folds, while rejecting invalid zones, inconsistent offsets, nonexistent
  local timestamps, and mismatched daily dates through the existing sanitized
  `weather_unavailable` response;
- keeps verified place schedules in `Europe/Madrid`;
- adds fail-closed refresh and runtime validation for hidden reviewed
  addresses, strictly validated raw information URLs, and source-backed place
  coordinates outside the inclusive Barcelona pilot bounds latitude
  `41.2`–`41.6` and longitude `1.9`–`2.4`; and
- adds focused regression coverage without changing dependency versions,
  endpoint paths, the health response, place selection, reviewed schedules,
  ranking rules, or later-milestone scope.

The Barcelona bounds apply only to normalized place records. Weather
coordinates and place-search origins retain global WGS84 validation. The
current snapshot and manifest have not been edited; the expected raw source
SHA-256 remains
`37939392d6e2ca6d905eb291d9bded958e188d7d552354d2baa98407032adadd` and
the expected normalized snapshot SHA-256 remains
`c958b7ba10b133132d9f1c8b98d84cd1b53644d27cbbd225b5b46bb98d89202b`.

### Correction-pass verification record

Commands were run from the repository root unless noted otherwise.

| Command or check | Exit status | Result |
| --- | ---: | --- |
| `make test-backend` | 0 | All 91 backend tests passed. |
| `make test-frontend` | 0 | The frontend smoke test passed. |
| `make test` | 0 | The complete root command passed: 91 backend tests and 1 frontend test. |
| `make build` | 0 | Type-check and Vite production build passed. |
| `.venv/bin/python -m pip check` | 0 | No broken requirements; the existing unwritable user-cache warning was printed. |
| `npm --prefix frontend ls --depth=0` | 0 | Installed direct frontend dependency versions remained unchanged and matched the manifest. |
| Two normalizer runs using `/tmp/heatrelay-climate-shelters-upstream.json` and retrieval time `2026-07-16T19:08:41Z` | 0 each | Both runs selected the same 15 reviewed records and wrote their requested snapshot and manifest outputs. |
| Four snapshot and manifest `cmp` checks | 0 each | The two generated pairs were byte-identical to each other and to the current snapshot and manifest. |
| `shasum -a 256` for the raw source, snapshot, and manifest | 0 | The raw and normalized hashes remained `37939392d6e2ca6d905eb291d9bded958e188d7d552354d2baa98407032adadd` and `c958b7ba10b133132d9f1c8b98d84cd1b53644d27cbbd225b5b46bb98d89202b`; the unchanged manifest hash was `d0ce55c3dd8cd730307324a12e214fdc54ad6783b8ce97a5bb3f14ac1c783c9f`. |
| Direct live `WeatherService` smoke check | 0 | Barcelona returned `Europe/Madrid` with `+02:00`; New York returned `America/New_York` with `-04:00`, and both daily dates matched their normalized local current timestamps. |
| Host-permitted `make dev` | 1 from the PTY wrapper after intentional `Ctrl-C` | Uvicorn and Vite started, all local requests completed, the supervisor logged shutdown, and both service process groups stopped. |
| Direct health, frontend, and Vite-proxy health requests | 0 each | Health returned the stable JSON directly and through the proxy; the frontend returned HTTP 200. |
| Local Barcelona and Vite-proxied New York weather requests | 0 each | The endpoints returned coordinate-local `Europe/Madrid` and `America/New_York` timezones respectively; coordinates were not echoed. |
| Local deterministic open-place request | 0 | The unchanged first three place IDs were returned at 1382, 1398, and 1954 metres. |
| Vite-proxied empty-place request | 0 | Returned HTTP 200 with an empty candidate array and the no-fallback explanation. |
| Post-shutdown `lsof` and host-permitted `pgrep` checks | 1 each, expected | No listeners or matching Uvicorn/Vite processes remained. |
| Filename-only actual-key-pattern scan | 1, expected | No key-shaped credential or nonempty `OPENAI_API_KEY` assignment matched; no candidate value was printed. |
| Project-wide real `.env` filename scan | 1, expected | No real `.env` file was present outside excluded generated directories. |
| Project-wide trailing-whitespace scan | 1, expected | No match across tracked and untracked project files; generated and cache directories were excluded. |
| `git check-ignore` for environments, dependencies, build output, and caches | 0 | `.venv`, `frontend/node_modules`, `frontend/dist`, `.pytest_cache`, and Python caches remained ignored. |
| `git diff --check` | 0 | No tracked diff errors were found; the separate project-wide scan covered untracked files. |
| `git status --short --untracked-files=all` | 0 | At verification time, only the intended uncommitted Milestone 1 files were listed; no generated dependency or build directory appeared. |

Two superseded verification failures were retained rather than omitted:

1. An intermediate `make test-backend` run exited 2 because the existing API
   test fixture had not yet supplied the newly required dynamic timezone. The
   fixture was corrected, and the final backend and root test commands passed
   with 91 backend tests.
2. The first direct live-weather Python one-liner exited 1 with a local
   `SyntaxError` because it placed an `async def` after a semicolon. The
   corrected command then exited 0 and verified both Barcelona and New York.

At the time these results were recorded, this correction pass was
intentionally uncommitted and unpublished.

## Milestone 1 strict information-URL correction — 2026-07-16

A final refresh-path audit found that generic string cleanup ran before
information-URL validation. That could trim whitespace or remove BOM,
zero-width, and other control/format characters, turning an invalid raw source
value into a valid-looking URL. The normalizer and runtime snapshot validation
now apply equivalent strict checks to untouched URL strings. Malformed percent
escapes, invalid hostname or port syntax, credentials, non-HTTP(S) schemes,
and any whitespace or control/format character fail closed; accepted URLs are
serialized unchanged.

At the time of this verification, this narrow correction was uncommitted. It
did not change dependencies, weather, place selection, schedules, ranking,
API paths, frontend behavior, snapshot contents, or later-milestone scope.

### Strict information-URL correction verification

Commands were run from the repository root.

| Command or check | Exit status | Result |
| --- | ---: | --- |
| `.venv/bin/python -m pytest backend/tests/test_normalize_barcelona_places.py backend/tests/test_places.py -k 'information_url or percent_escapes'` | 0 | All 44 focused URL-validation cases passed. |
| `make test-backend` | 0 | All 130 backend tests passed. |
| `make test-frontend` | 0 | The frontend smoke test passed. |
| `make test` | 0 | The complete root command passed: 130 backend tests and 1 frontend test. |
| `make build` | 0 | Type-check and Vite production build passed. |
| `.venv/bin/python -m pip check` | 0 | No broken requirements; the existing unwritable user-cache warning was printed. |
| `npm --prefix frontend ls --depth=0` | 0 | Installed direct frontend dependency versions remained unchanged and matched the manifest. |
| Two normalizer runs using `/tmp/heatrelay-climate-shelters-upstream.json` and retrieval time `2026-07-16T19:08:41Z` | 0 each | Both runs selected the same 15 reviewed records and wrote their requested snapshot and manifest outputs. |
| Four snapshot and manifest `cmp` checks | 0 each | Both generated pairs were byte-identical to each other and to the current snapshot and manifest. |
| `shasum -a 256` for the raw source, snapshot, and manifest | 0 | All three expected hashes matched exactly. |
| `git diff --check` | 0 | No tracked diff errors were found. |
| Filename-only actual-key-pattern scan | 1, expected | No key-shaped credential or nonempty `OPENAI_API_KEY` assignment matched; no candidate value was printed. |
| Project-wide trailing-whitespace scan | 1, expected | No match across tracked and untracked project files; generated and cache directories were excluded. |
| `git status --short --branch --untracked-files=all` | 0 | At verification time, only the intended uncommitted Milestone 1 files were listed; no generated dependency or build directory appeared. |

No live weather or localhost workflow was rerun because this correction does
not modify those systems and the author explicitly required only the complete
automated suite. At verification time, the correction was uncommitted and
unpublished.

## Milestone 1 hostname-policy correction — 2026-07-16

A final hostname-specific audit found that the standard-library IDNA encoder
passes malformed ASCII `xn--` labels through unchanged and that browser-style
legacy numeric IPv4 forms can resemble valid DNS labels. The normalizer and
runtime snapshot validator now require each IDNA A-label to decode and
re-encode losslessly. They accept only canonical dotted-decimal IPv4 through
`ipaddress.IPv4Address` and reject ambiguous decimal, octal-looking,
hexadecimal, shorthand, or Unicode-mapped numeric forms before and after IDNA
mapping. Legitimate IDNs, valid A-labels, canonical IPv4, bracketed IPv6,
ordinary DNS labels, and valid percent escapes remain unchanged.

This correction changes only hostname validation and its mirrored tests. It
does not change URL serialization, weather, place data, schedules, ranking,
API contracts, frontend files, dependencies, snapshot bytes, or
later-milestone scope. The earlier strict-URL verification remains historical;
the following commands verify this final follow-up.

| Command or check | Exit status | Result |
| --- | ---: | --- |
| `.venv/bin/python -m pytest backend/tests/test_normalize_barcelona_places.py backend/tests/test_places.py -k 'information_url or hostname or percent_escapes'` | 0 | All 74 focused hostname and URL cases passed. |
| `make test-backend` | 0 | All 160 backend tests passed. |
| `make test-frontend` | 0 | The frontend smoke test passed. |
| `make test` | 0 | The complete root command passed: 160 backend tests and 1 frontend test. |
| `make build` | 0 | Type-check and Vite production build passed. |
| `.venv/bin/python -m pip check` | 0 | No broken requirements; the existing unwritable user-cache warning was printed. |
| `npm --prefix frontend ls --depth=0` | 0 | Installed direct frontend dependency versions remained unchanged and matched the manifest. |
| Two normalizer runs using `/tmp/heatrelay-climate-shelters-upstream.json` and retrieval time `2026-07-16T19:08:41Z` | 0 each | Both runs selected the same 15 reviewed records and wrote their requested snapshot and manifest outputs. |
| Four snapshot and manifest `cmp` checks | 0 each | Both generated pairs were byte-identical to each other and to the current snapshot and manifest. |
| `shasum -a 256` for the raw source, snapshot, and manifest | 0 | All three expected hashes matched exactly. |
| `git diff --check` | 0 | No tracked diff errors were found. |
| Filename-only actual-key-pattern scan | 1, expected | No key-shaped credential or nonempty `OPENAI_API_KEY` assignment matched; no candidate value was printed. |
| Project-wide trailing-whitespace scan | 1, expected | No match across tracked and untracked project files; generated and cache directories were excluded. |
| `git status --short --branch --untracked-files=all` | 0 | At verification time, only the intended uncommitted Milestone 1 files were listed; no generated dependency or build directory appeared. |

Live weather and localhost checks were not repeated because this hostname-only
correction does not affect those systems. At verification time, it was
uncommitted and unpublished.

## Milestone 1 publication — primary Codex build thread

After the final Milestone 1 verification, the primary Codex build thread
staged the intended milestone files, created commit
`6b3b3bc5c04cd6dbe31a603fe2b44e388ea98586` with message
`feat: add deterministic Barcelona context services`, pushed `main` normally,
and verified that local `main` and `origin/main` referenced that commit. This
publication is distinct from the initial Milestone 0 identity,
authentication, commit, and push work performed manually by the author.

## Milestone 2 — extraction-only GPT-5.6 service — 2026-07-17

### Baseline and official contract review

Repository inspection found clean local and remote-tracking `main` at
Milestone 1 commit `6b3b3bc5c04cd6dbe31a603fe2b44e388ea98586`, with the expected
GitHub `origin`. The existing health, weather, places, snapshot, schedules,
ranking, frontend, and Git history were preserved.

Before implementation, the primary build thread reviewed current official
OpenAI documentation for GPT-5.6, Structured Outputs, latest-model guidance,
prompt caching, Responses API data handling, error codes, and the Responses
API schema. The selected official SDK version supports asynchronous
`responses.parse`, Pydantic Structured Outputs, `reasoning.effort="none"`,
`store=False`, explicit prompt-cache mode, client timeouts, and disabled
automatic retries. The `gpt-5.6` alias routes to GPT-5.6 Sol; it is not
documented as a fixed snapshot.

### Work performed with Codex in the primary build thread

- Added a strict extraction request, a closed model-facing schema, and a
  separate server-owned public response with deterministic list ordering,
  status/value validation, `missing_information`, schema version, and notice.
- Added an injected, lazy `AsyncOpenAI` adapter using the Responses API. It
  keeps the fixed versioned developer instruction separate from untrusted
  user text, uses no tools or streaming, disables SDK retries, bounds SDK and
  overall time, caps output, disables stored Responses application state, and
  disables the implicit prompt-cache breakpoint without adding an explicit
  breakpoint.
- Added explicit response walking, refusal detection, incomplete-response
  rejection, exactly-one-parsed-result enforcement, strict local
  revalidation, and server-owned sanitized 422/502/503/504 errors.
- Added explicit repository-root `.env.local` loading for `make dev`. The
  supervisor rejects symlinked and non-regular files, honors an already
  exported backend value, forwards only the OpenAI key from the file, and
  removes that key from the frontend child environment.
- Added offline contract, schema, adapter, failure, privacy, and supervisor
  coverage. Twelve synthetic profile fixtures are validation fixtures, not a
  claim of live-model accuracy.
- Updated only truthful frontend copy; the browser remains disconnected from
  all backend APIs and no frontend design or workflow was added.
- Updated setup, API, privacy, provider-handling, architecture, compliance,
  dependency-license, and deferred-scope documentation.

The author supplied the product fields, allowed categories, status semantics,
privacy boundary, error contract, live-smoke limit, cost controls, and the
requirement that action priority, generated plans, medical or emergency
decisions, frontend integration, and later milestones remain out of scope.
The author also confirmed separate OpenAI API access and billing without
publishing a balance amount. The author retains final product, safety, scope,
and submission decisions.

OpenAI provides GPT-5.6 and the Responses API; the official SDK and every
other dependency remain third-party work. Codex implementation and testing
occurred in the primary build thread. No core implementation is attributed to
the separate planning and compliance thread.

### Offline verification record

Commands were run from the repository root. At the time this initial
verification was recorded, ordinary tests did not read the real `.env.local`,
instantiate a live OpenAI client, or access the network.

| Command or check | Exit status | Result |
| --- | ---: | --- |
| `.venv/bin/python -m pip install -r backend/requirements-dev.txt` | 0 | Installed the pinned manifests, including `openai==2.46.0` and `python-dotenv==1.2.2`; existing direct pins remained unchanged. |
| `.venv/bin/python -m pytest backend/tests/test_situation.py backend/tests/test_situation_api.py backend/tests/test_dev_supervisor.py -q` | 0 | All 88 focused extraction, API, and credential-boundary tests passed. |
| `make test-backend` | 0 | All 246 backend tests passed. |
| `make test-frontend` | 0 | The single frontend rendering smoke test passed. |
| `make test` | 0 | The complete root suite passed: 246 backend tests and one frontend test. |
| `make build` | 0 | TypeScript checking and the Vite production build passed. |
| `.venv/bin/python -m pip check` | 0 | No broken requirements; pip printed the existing unwritable user-cache warning. |
| `npm --prefix frontend ls --depth=0` | 0 | All installed direct frontend versions matched the unchanged manifest. |
| Installed distribution metadata check | 0 | `openai==2.46.0` declared Apache-2.0 and `python-dotenv==1.2.2` declared BSD-3-Clause. |
| Snapshot and manifest `shasum -a 256` | 0 | The unchanged hashes remained `c958b7ba10b133132d9f1c8b98d84cd1b53644d27cbbd225b5b46bb98d89202b` and `d0ce55c3dd8cd730307324a12e214fdc54ad6783b8ce97a5bb3f14ac1c783c9f`. |
| `git diff --check` | 0 | No diff whitespace errors were found before the live smoke. |
| Initial redacted credential scan | 1, superseded | One filename-level false positive came from treating README's inline empty placeholder as a nonempty assignment; no candidate value was printed. |
| Corrected redacted credential scan | 0 | No key-shaped credential or nonempty key assignment was found in tracked or intended untracked project files; no candidate value was printed. |
| Ignored `.env.local` metadata boundary check | 0 | The file remained a non-symlinked regular file with no group/other permission bits, was ignored, and was untracked; its value was not printed or measured. |
| Frontend `VITE_` OpenAI-variable check | 0 | No OpenAI-prefixed frontend variable existed, including in local environment variable names; no environment value was printed. |
| Project-wide trailing-whitespace scan | 0 | No trailing whitespace was found across tracked and intended untracked files. |

### One bounded live GPT-5.6 smoke

After the offline suite and production build passed, a silent presence check
confirmed the existing ignored credential without printing or measuring it.
The documented `make dev` path loaded it only into the backend child. A
temporary local smoke harness initially exited 1 with `ModuleNotFoundError`
before it sent any HTTP request, so that preflight failure made zero OpenAI
network attempts. The corrected harness then sent one short, obviously
synthetic multilingual JSON-body request to the local extraction endpoint.

- OpenAI network attempts: **1**. SDK retries were disabled; no second
  high-level attempt was made.
- Local HTTP result: **200**.
- Strict public-schema validation: **passed**.
- Expected explicitly stated synthetic facts and no prohibited housing
  inference: **passed**.
- Returned provider model name and input/output/total token counts: **not
  available** through the public HeatRelay response, and the development log
  did not emit that optional safe telemetry. No response ID or provider body
  was recorded.
- Coarse configured cost bound: **under approximately USD 0.15** for this
  request shape at the documented standard GPT-5.6 Sol rates, using the
  2,000-code-point input ceiling, fixed instruction/schema, and 1,024-token
  output cap. This is a conservative configuration estimate, not measured
  billing for the smoke.

Intentional `Ctrl-C` made the PTY wrapper report exit 1 after the supervisor's
normal shutdown path. Uvicorn completed application shutdown, and read-only
`lsof` checks for ports 8000 and 5173 plus a matching `pgrep` each exited 1 as
expected because no service remained. Raw request text, the full extracted
profile, credential material, provider response IDs, and complete provider
responses were not added to this log.

Final post-documentation checks also passed: `git diff --check`, the corrected
redacted credential scan, the ignored/untracked local-environment boundary,
the no-`VITE_` OpenAI-variable check, project-wide trailing whitespace, and
the unchanged snapshot hashes all exited 0. Final
`git status --short --branch --untracked-files=all` exited 0 and listed only
the intended uncommitted Milestone 2 source, test, documentation, dependency,
environment-example, supervisor, and minimal frontend-copy changes. It did
not list `.env.local` or generated dependency/build output.

At the time this verification was recorded, Milestone 2 was intentionally
uncommitted and unpublished in this task.

## Milestone 2 security-boundary correction — 2026-07-17

A focused follow-up audit found four boundary defects in the otherwise
verified Milestone 2 work: ambient `OPENAI_BASE_URL` could redirect the SDK
client, root Makefile npm commands inherited an exported backend key,
`.env.local` loading did not reject group or other permission bits, and SDK
client cleanup could wait without a bound. The correction:

- pins the production extraction client to `https://api.openai.com/v1` and
  adds a no-network effective-configuration regression using only a synthetic
  credential; that regression constructs the real SDK client but sends no
  request, while extraction-traffic tests continue to use injected fakes;
- removes `OPENAI_API_KEY` at the shared frontend/npm execution boundary used
  for setup, frontend tests, and production builds;
- checks the already-open `.env.local` descriptor and refuses any group or
  other permission bit while retaining the symlink, regular-file,
  `O_NOFOLLOW`, exported-value precedence, and backend-only forwarding rules;
- retains the 30-second SDK request timeout and separate 30-second
  `responses.parse` wait, and applies a separate one-second best-effort bound
  to client cleanup with generic warnings; and
- records that, at the time of that correction, `main` and `origin/main`
  pointed to published Milestone 1 commit
  `6b3b3bc5c04cd6dbe31a603fe2b44e388ea98586`, without changing the historical
  author-performed Milestone 0 publication.

No OpenAI request or `make dev` run belongs to this correction pass. It does
not change extraction schemas, API paths, dependency versions, weather,
places, snapshots, schedules, ranking, frontend design, or later-milestone
scope.

### Correction verification record

Commands were run from the repository root. No command read the real local
credential, started the development services, or sent an OpenAI request.

| Command or check | Exit status | Result |
| --- | ---: | --- |
| `.venv/bin/python -m pytest backend/tests/test_situation.py backend/tests/test_situation_api.py backend/tests/test_dev_supervisor.py backend/tests/test_makefile.py -q` | 0 | All 93 focused adapter, endpoint, supervisor, permission, frontend-isolation, and cleanup tests passed. |
| `make test-backend` | 0 | All 251 backend tests passed. |
| `make test-frontend` | 0 | The single frontend rendering smoke test passed; npm ran through the key-removal boundary. |
| `make test` | 0 | The complete root suite passed: 251 backend tests and one frontend test. |
| `make build` | 0 | TypeScript checking and the Vite production build passed through the same key-removal boundary. |
| `.venv/bin/python -m pip check` | 0 | No broken requirements; pip printed the existing unwritable user-cache warning. |
| `npm --prefix frontend ls --depth=0` | 0 | Installed direct frontend dependency versions matched the unchanged manifest. |
| Snapshot and manifest `shasum -a 256` | 0 | Both committed data hashes remained unchanged. |
| Filename-only key-shaped credential scan and empty-placeholder check | 0 | No key-shaped value was found in tracked or intended untracked files, and `.env.example` retained only the empty placeholder; no candidate value was printed. |
| OpenAI-prefixed `VITE_` variable scan | 0 | No matching frontend variable was found in tracked or intended untracked files. |
| Project-wide trailing-whitespace scan | 0 | No trailing whitespace was found in tracked or intended untracked files; ignored dependencies, builds, caches, and `.env.local` were not read. |
| Ignored `.env.local` metadata check | 0 | The file remained a non-symlinked regular file with mode `0600`, was ignored, and was untracked; its contents and value were not read or measured. |
| `git diff --check` | 0 | The final check, including this verification record, found no diff whitespace errors. |
| `git status --short --branch --untracked-files=all` plus cached-diff check | 0 | Only the intended uncommitted Milestone 2 and correction files were listed, and the index remained empty. |

## Milestone 2 cancellation-resistant cleanup correction — 2026-07-17

A second focused review established that the first cleanup correction used
`asyncio.wait_for(client.close(), timeout=...)`, which was insufficient as a
hard request-path waiting boundary. After its timeout, `wait_for` requests
cancellation and then waits for the inner coroutine to finish cancelling; a
client close that catches `CancelledError` can therefore continue past the
configured interval or never return.

The follow-up correction starts cleanup as an explicit managed task and waits
only for the configured cleanup interval. If cleanup is still pending,
HeatRelay emits the same fixed generic timeout warning, requests cancellation
best effort, and lets the response path continue without awaiting cancellation
completion. A retained task reference and fixed done callback consume any
eventual cancellation or exception without exposing exception text or private
request/provider data. This bounds only how long the request path waits; it
does not prove that the underlying client finished closing.

### Follow-up verification record

All commands ran from the repository root without reading the real local
credential, starting `make dev`, or making an OpenAI or other network request.

| Command or check | Exit status | Result |
| --- | ---: | --- |
| Initial focused cleanup selection | 1, superseded | Eight tests passed and two new adversarial cases failed because the test expected the fake to observe scheduled cancellation before the event loop received another turn. The request-time assertion had already passed. The test was corrected to observe cancellation only after measuring the returned request path. |
| `.venv/bin/python -m pytest backend/tests/test_situation.py -q -k 'cleanup or overall_deadline or provider_failures or semantic'` | 0 | All 10 selected cleanup, timeout, provider-failure, and semantic-validation tests passed; 54 were deselected. |
| `.venv/bin/python -m pytest backend/tests/test_situation.py backend/tests/test_situation_api.py backend/tests/test_dev_supervisor.py backend/tests/test_makefile.py -q` | 0 | All 94 focused cleanup, adapter, endpoint, supervisor, permission, and frontend-isolation tests passed. |
| `make test-backend` | 0 | All 252 backend tests passed. |
| `make test-frontend` | 0 | The single frontend rendering smoke test passed. |
| `make test` | 0 | The complete root suite passed: 252 backend tests and one frontend test. |
| `make build` | 0 | TypeScript checking and the Vite production build passed. |
| `.venv/bin/python -m pip check` | 0 | No broken requirements; pip printed the existing unwritable user-cache warning. |
| `npm --prefix frontend ls --depth=0` | 0 | Installed direct frontend dependency versions matched the unchanged manifest. |
| Offline cancellation-resistant timing probe | 0 | With a `0.01`-second cleanup budget and a fake that continued for `0.30` seconds after cancellation, success returned in `0.011192` seconds and sanitized provider failure returned in `0.011390` seconds. |
| Snapshot and manifest `shasum -a 256` | 0 | Both committed data hashes remained unchanged. |
| Pre-record `git diff --check`, redacted key-shaped and OpenAI-prefixed `VITE_` scans, empty-placeholder check, and project whitespace scan | 0 | No diff error, key-shaped value, OpenAI frontend variable, nonempty example key, or trailing whitespace was found; scans printed no candidate secret value. |
| Ignored `.env.local` metadata and Git-state checks | 0 | The file remained a non-symlinked regular file with mode `0600`, ignored and untracked; the index was empty and only the same 16 intended working-tree paths were listed. Its contents were not read or measured. |

## Milestone 2 publication — primary Codex build thread

According to the author-supplied publication report, the primary Codex build
thread created commit
`9386d1b4ffc6b2aaf0f85a9c7617407ad2b0c337` with message
`feat: add multilingual situation extraction` and pushed it normally to
`origin/main`. This attribution comes from that publication report, not from
Git author metadata. It is distinct from the author-performed Milestone 0
publication and the primary-thread Milestone 1 publication recorded above.

## Milestone 3 implementation and verification pass 1 — 2026-07-17

> **Historical-state note:** This section preserves the implementation and
> verification evidence recorded after pass 1. Its `112`/`061` split,
> cancellation-cooperative M2 provider deadline, and “complete” payload-cap
> wording were superseded by the adversarial correction record below. The
> command results remain historical facts and are not rewritten as results of
> the later correction.

The primary Codex build thread started from clean local and remote `main` at
Milestone 2 commit `9386d1b4ffc6b2aaf0f85a9c7617407ad2b0c337`. The author
supplied the bounded Barcelona policy, safety, privacy, paid-smoke, and scope
decisions. Codex inspected the existing contracts, reviewed the named official
sources, implemented the backend workflow and tests, performed adversarial
follow-up review, and updated project documentation and minimal truthful shell
copy. No Milestone 3 publication action belongs to this pass.

Implemented work:

- a strict Barcelona-only `POST /api/v1/action-plan` request and discriminated
  urgent/normal response;
- one server-owned UTC evaluation instant, existing M2 extraction, an urgent
  fixed-contact bypass, existing model-derived weather, versioned deterministic
  priority, immutable place eligibility, and exactly one grounded plan call;
- a pure `heatrelay-barcelona-action-policy-1.0.0` precedence function using
  the `36.0°C` and `34.0°C` daytime boundaries only as HeatRelay heuristics,
  never as proof of an official municipal alert;
- accessibility-before-rank filtering for explicit wheelchair or step-free
  requirements, movement and support-person invariants, and an exact frozen
  request-candidate whitelist;
- a second GPT-5.6 Structured Output that can select only reviewed codes and
  one exact candidate ID, followed by strict local semantic validation and
  coordinate-free hydration from backend-owned catalogs and trusted objects;
- fixed urgent `112`/`061` contact content, with `112` precedence for the
  bounded emergency-indicator set and no climate-shelter normal plan in the
  urgent branch; and
- a hard request-path bound for a cancellation-resistant plan provider task,
  separate bounded best-effort client cleanup, zero retries, a 20,000-byte
  complete application-payload ceiling, a 1,024-token output ceiling, and
  sanitized fixed errors.

A fresh adversarial review found and corrected issues before the final gates:
the first provider deadline used cancellation-cooperative `wait_for`; the full
place object could echo an origin that exactly matched a place coordinate; a
verified-place reason was not paired with an actual selection; unrelated
mobility facts could offer an invented mobility aid; an invalid server clock
was misclassified; priority reasons were not closed; closed/stale candidates
needed workflow defense in depth; and two fixed action/explanation branches
could imply facts not actually reported. Regression tests now cover each case.

### Reviewed sources and derived rules

All sources below were accessed on `2026-07-17`. The HeatRelay rule is a
project decision derived from the source, not copied publisher wording.

| Publisher and source | HeatRelay rule |
| --- | --- |
| Ajuntament de Barcelona — Serveis Socials, [published thresholds](https://ajuntament.barcelona.cat/serveissocials/es/noticia/crece-la-red-de-refugios-climaticos-para-protegerse-del-calor_1523924) | Use published `34.0°C` and `36.0°C` daytime boundaries as versioned heuristics over model-derived same-day maximum temperature, not as official activation. |
| Ajuntament de Barcelona — Barcelona pel Clima, [climate-shelter network](https://www.barcelona.cat/barcelona-pel-clima/ca/accions-concretes/xarxa-de-refugis-climatics) | Preserve the hours warning and never present a shelter as medical care. |
| Generalitat de Catalunya — Canal Salut, [excess-heat effects](https://canalsalut.gencat.cat/ca/vida-saludable/consells-estacionals/estiu/calor/efectes-exces/) | Explicit bounded warning symptoms take the fixed urgent branch; retain `061 Salut Respon` as backend-owned urgent heat-health contact content. |
| Generalitat de Catalunya — 112 emergències, [112 FAQ](https://112.gencat.cat/es/us-del-112/preguntes-frequeents/) | Keep `112` emergency and `061` medical-urgency contacts fixed; HeatRelay conservatively gives `112` precedence for its bounded emergency-indicator set. |
| World Health Organization, [Heat and health](https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health) | Treat heat as a serious hazard without diagnosis, probability, or a medical risk score. |
| OpenAI, [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) | Use Pydantic Structured Outputs and refusal handling, then independently validate request-scoped semantics. |
| OpenAI, [API pricing](https://developers.openai.com/api/docs/pricing) | Recheck standard rates before the one authorized plan smoke and do not call if configured bounds can exceed USD `$0.15`. |

The exact symptom split is a conservative HeatRelay mapping, not a verbatim
official symptom-by-symptom table. Chest pain, difficulty breathing, seizure,
or fainting/loss of consciousness selects `112`; confusion or repeated
vomiting selects `061`; `112` wins for a mixed reported set.

### Offline verification record

Ordinary tests used injected synthetic fakes and made no OpenAI, weather,
download, or other network call. The real `.env.local` value was not read,
printed, measured, or modified.

| Command or check | Exit status | Result |
| --- | ---: | --- |
| `.venv/bin/python -m pytest backend/tests/test_action_priority.py backend/tests/test_grounded_plan.py backend/tests/test_action_plan_workflow.py backend/tests/test_action_plan_api.py -q` | 0 | All 179 focused policy, adapter, validation, workflow, and HTTP-contract tests passed. These are synthetic contract/adversarial fixtures, not a general live-model accuracy evaluation. |
| `make test-backend` | 0 | All 432 backend tests passed. |
| `make test-frontend` | 0 | The single frontend rendering smoke test passed. |
| `make test` | 0 | The complete root suite passed: 432 backend tests and one frontend test. |
| `make build` | 0 | TypeScript checking and the Vite production build passed. |
| `.venv/bin/python -m pip check` | 0 | No broken requirements; pip emitted only its existing unwritable-cache warning. |
| `npm --prefix frontend ls --depth=0` | 0 | Installed direct frontend versions matched the unchanged manifest. |
| Installed direct-dependency metadata checks | 0 | Backend and frontend licenses matched the existing documented MIT, Apache-2.0, BSD-3-Clause, and OpenAI SDK Apache-2.0 records; no dependency changed. |
| Snapshot and manifest `shasum -a 256` | 0 | Hashes remained `c958b7ba10b133132d9f1c8b98d84cd1b53644d27cbbd225b5b46bb98d89202b` and `d0ce55c3dd8cd730307324a12e214fdc54ad6783b8ce97a5bb3f14ac1c783c9f`. |
| Request-scoped place-ID evaluation | 0 | The exact current candidate was accepted; all 15 fabricated, filtered, case-changed, padded, encoded, or Unicode-confusable IDs were rejected. A real snapshot-known but request-filtered ID also failed closed: zero noncandidate IDs were accepted. |
| Redacted credential, environment, frontend-variable, and whitespace checks | 0 | No real key-shaped value, unexpected environment file, OpenAI-prefixed `VITE_` variable, or trailing whitespace was found. `.env.local` remained regular, non-symlinked, mode `0600`, ignored, and untracked; its contents were not inspected. |
| `git diff --check` and cached-diff check | 0 | No diff whitespace error was found and the index remained empty. |

The first normalized no-`VITE_` shell wrapper exited 1 because it assigned to
zsh's read-only `status` variable; the underlying bare search had also exited 1
with no output, which is ripgrep's normal no-match result. Replacing the wrapper
variable with `rc` produced the recorded exit 0 and `openai_vite_scan=clear`.
No source change was required.

At the time this verification record was written, all Milestone 3 changes were
intentionally uncommitted and unpublished. The one authorized paid direct-plan
smoke is recorded separately below only if actually attempted.

### One authorized paid grounded-plan smoke

Immediately before the attempt, the primary thread re-read OpenAI's official
pricing page. Standard `gpt-5.6-sol` pricing remained `$5.00` per million input
tokens and `$30.00` per million output tokens. The configured conservative
worst-case estimate remained `$0.13072`, below the author-approved `$0.15`
ceiling.

The internal `GroundedPlanService` was invoked directly once with a short,
synthetic, prevalidated profile and synthetic backend-owned weather/candidate
facts. It did not invoke the public action workflow, M2 extraction, Open-Meteo,
place downloads, or another network service. SDK retries and application
retries were both zero, and no second attempt was made.

| Safe evidence | Result |
| --- | --- |
| Responses API attempts | `1` |
| Result | Passed on the first and only attempt |
| Returned model metadata | `gpt-5.6-sol` |
| Strict Pydantic model validation | Passed |
| Exact request-scoped candidate whitelist | Passed |
| Aggregate token counts | 1,161 input; 171 output; 1,332 total |
| Coarse standard-rate estimate | `$0.010935` |
| Configured cost ceiling | `$0.15` |

No credential, response ID, raw request, origin, complete profile, full plan,
provider body, account balance, or `.env.local` content was printed or added to
the repository. This one scenario verifies the live adapter/schema/whitelist
path only; it is not evidence of general model accuracy.

## Milestone 3 adversarial correction pass — 2026-07-17

The primary Codex build thread continued the existing uncommitted Milestone 3
working tree. It did not restart the implementation, alter dependencies, or
make a publication action. This correction made no OpenAI, weather, download,
or other network request and did not read the ignored `.env.local` contents.
The prior one-attempt grounded-plan smoke remains historical evidence; it was
not repeated.

The correction makes these safety invariants backend-owned and fail-closed:

- Every normal priority has an exact required action matrix. All three require
  immediate cooler-space, reduced-effort, and conditionally worded hydration
  actions. `act_now` additionally requires continued hydration, staying cool,
  and updated weather before its fixed three-action tonight core;
  `prepare_now` requires continued hydration, updated weather, tonight
  preparation, and that same tonight core; `monitor_and_prepare` requires
  updated weather, tonight preparation, nearby water, and a night-weather
  check. Every deterministic priority and applicable branch reason is also
  required; the model can choose only compatible supplemental codes.
- No-travel output requires no selected ID, travel action, bring item, or local
  phrase. Travel requires one exact request candidate, the `now` travel code,
  at least water and phone, and one allowed phrase. Movement prohibition also
  requires `remain_at_current_location`.
- Every reported bounded time or mobility constraint suppresses immediate
  travel because exact timing, route, travel time, deadline, and walking-range
  compatibility cannot be proven from retained facts. The fixed
  `unresolved_travel_constraint` reason and public notice explain the
  suppression; accessibility remains a filter, not proof of reachability.
- Reported air conditioning may expose home cooling. Reported fan-only cooling
  exposes it only when current and same-day maximum temperatures are both
  strictly below `40.0°C`. This conservative WHO-derived HeatRelay rule is not
  an official alert threshold.
- Every value in the explicit fixed closed catalog—confusion, fainting/loss of
  consciousness, seizure, difficulty breathing, chest pain, and repeated
  vomiting—now routes to fixed `112` content. Code asserts that this separately
  declared policy set equals both the extraction literal and canonical order,
  so a future symptom cannot silently inherit a default. This universal rule
  supersedes the pass-1 symptom partition; urgent requests still bypass
  weather, places, and the second GPT call.
- The normal workflow captures its evaluation instant after extraction,
  requires `Europe/Madrid`-compatible weather metadata and the same Barcelona
  local date, and uses that instant for place eligibility. Mismatches fail the
  entire workflow without a partial plan.
- Both OpenAI adapters now place provider work in an explicit task and bound
  request-path waiting with `asyncio.wait`. Cancellation-resistant timed-out
  work is cancelled and detached best effort, its eventual outcome is consumed
  privately, and timeout does not prove the task stopped. Extraction gives
  cleanup only the remainder of its overall asynchronous budget, while the
  grounded adapter retains separate provider and cleanup bounds. Both share
  process-local non-queueing limits of four provider tasks and four cleanup
  tasks; a slot remains occupied until the actual task finishes.
- The 20,000-byte pre-client bound now counts the compact UTF-8 serialization
  of the complete application-defined model-visible request, including role and
  content wrappers, instruction, minimized context, and the fully wrapped
  strict JSON Schema response format. Candidate closing timestamps are
  timezone-aware typed values.
- Separately named action-origin constants define a coarse Barcelona pilot
  rectangle. Their current numbers intentionally match the place-record
  validation rectangle, but neither rectangle establishes municipal membership
  or an administrative-boundary geofence.

Offline verification used only injected synthetic fakes. It did not load the
real credential, start the development services, or make an OpenAI, weather,
download, or other network request.

| Command or check | Exit status | Result |
| --- | ---: | --- |
| `.venv/bin/python -m pytest backend/tests/test_action_priority.py backend/tests/test_grounded_plan.py backend/tests/test_action_plan_workflow.py backend/tests/test_action_plan_api.py backend/tests/test_situation.py -q` | 0 | All 346 focused priority, invariant, adapter, workflow, and API tests passed. |
| Eleven explicitly selected hard-timeout, caller-cancellation, provider-capacity, cleanup-capacity, and cross-adapter saturation tests | 0 | All 11 passed. The tests use `0.01`-second synthetic deadlines, assert request-path return below `0.08` or `0.12` seconds as applicable, and assert saturated rejection below `0.05` seconds while resistant tasks remain retained until explicitly released. |
| `make test-backend` | 0 | All 535 backend tests passed. |
| `make test-frontend` | 0 | The frontend rendering test passed, including Milestone 3/backend-only/no-live-guidance truth-boundary assertions. |
| `make test` | 0 | The complete root suite passed: 535 backend tests and one frontend test. |
| `make build` | 0 | TypeScript checking and the Vite production build passed. |
| `.venv/bin/python -m pip check` | 0 | No broken requirements; pip printed only the existing unwritable-cache warning. |
| `npm --prefix frontend ls --depth=0` | 0 | Installed direct frontend versions matched the unchanged manifest. |
| Snapshot and manifest `shasum -a 256` | 0 | Hashes remained `c958b7ba10b133132d9f1c8b98d84cd1b53644d27cbbd225b5b46bb98d89202b` and `d0ce55c3dd8cd730307324a12e214fdc54ad6783b8ce97a5bb3f14ac1c783c9f`. |
| `git diff --check` | 0 | No diff whitespace error was found. |
| Project-wide trailing-whitespace, key-shaped credential, and OpenAI-prefixed `VITE_` scans | 1 for each `rg` no-match search | No matching line or filename was found; ripgrep uses status 1 for no matches and no candidate value was printed. |
| `.env.local` and example metadata checks | 0 | `.env.local` remained ignored, untracked, regular, non-symlinked, and mode `0600`; `.env.example` retained exactly one empty `OPENAI_API_KEY=` placeholder. Only filenames and metadata were inspected. |
| Dependency-manifest, snapshot-byte, index, changed-scope, and final status checks | 0 | Dependency manifests and data bytes were unchanged, the index was empty, and only the intended Milestone 3/correction paths were listed. |

At the time this verification was recorded, Milestone 3 remained intentionally
uncommitted and unpublished.

## Milestone 3 final adversarial correction pass — 2026-07-17

The primary Codex build thread continued the existing uncommitted Milestone 3
working tree without restarting the implementation or changing dependencies.
This record supersedes the prior pass's current cleanup statement: cancelling
and detaching a timed-out `client.close()` was insufficient with the pinned SDK
because later object destruction could schedule untracked asynchronous close
work.

The corrected boundary requires both provider and cleanup reservations before
constructing either OpenAI client. Saturation therefore rejects before client
construction or provider work. Every constructed client remains held by its
cleanup reservation; a timed-out close is detached without cancellation, and
capacity is released only after actual successful closure. Ordinary close
failure is retained in a finite fail-closed quarantine rather than exposing an
untracked SDK destructor path. Provider timeout may still request cancellation,
but provider capacity remains occupied until actual task completion. Extraction
also rechecks its remaining monotonic budget immediately before provider task
creation: synchronous client-factory work cannot be preempted, but no provider
coroutine starts after expiry. Fixed callbacks consume late outcomes without
private data, and caller cancellation continues to propagate.

The deterministic workflow corrections are also fail-closed:

- `unknown` mobility or time-constraint status suppresses candidates, travel,
  preparation items, and local phrase just as an unresolved reported value
  does; `not_stated` and `explicit_none` remain distinct.
- Barcelona-pilot weather now requires finite range-valid values, aware
  timestamps, aware UTC retrieval from evaluation through
  `WEATHER_TIMEOUT_SECONDS + 1` second, a maximum 90-minute observation age,
  no more than five minutes of future observation skew, matching Madrid-local
  observed/daily/evaluation dates, and daily maxima no lower than current
  values. Near-midnight and Barcelona daylight-saving-transition cases retain
  one aware evaluation instant. Failure occurs before priority, places, or
  planning.
- Candidate and snapshot responses require canonical paired IDs, strict
  strings and URLs, finite Barcelona source coordinates, aware timestamps,
  lowercase hashes, approved provenance, and candidate-source/dataset
  agreement. The workflow recomputes Haversine distance from the private
  request origin and rejects any mismatch or request-range violation before
  the model call.
- The canonical safety matrix has an explicit unsheltered variant that removes
  room- and window-dependent actions. One production matrix function governs
  context construction, context validation, generated-plan validation, and
  strict public normal-response validation. Urgent and normal public models
  independently enforce fixed branch facts and exact backend-owned hydration.
- A pinned `openai==2.46.0` regression uses `httpx.MockTransport` to compare
  the real SDK's serialized model-visible `input` and `text.format` with the
  application-owned payload and byte count, including multibyte content.
  Separate real-client offline cases cover cleanup saturation and garbage
  collection without opening a network socket.

This correction pass is offline-only. It does not repeat either historical
paid smoke, read the ignored credential contents, or make an OpenAI, weather,
download, Git-remote, or other network request. At the time this record is
written, Milestone 3 remains intentionally uncommitted and unpublished.

Final-pass verification recorded in the primary thread:

The first complete backend run in this final pass exited 2 with two newly
added intrinsic-matrix fixtures: their synthetic `monitor_and_prepare`
weather used current `31.5°C` with a `30.0°C` daily maximum, so the new
coherence guard correctly rejected them. The fixtures were corrected to use a
coherent `29.0°C` current value; no production rule was weakened. The rerun
below passed.

| Command or check | Exit status | Result |
| --- | ---: | --- |
| `.venv/bin/python -m pytest backend/tests/test_situation.py backend/tests/test_grounded_plan.py backend/tests/test_action_priority.py backend/tests/test_action_plan_workflow.py backend/tests/test_action_plan_api.py backend/tests/test_places.py backend/tests/test_weather.py -q` | 0 | All 585 focused adapter, policy, workflow, API, place-contract, and weather-contract tests passed, including the explicit Barcelona daylight-saving-transition case. |
| 14 explicitly selected real-SDK cleanup/payload, deadline, cancellation, capacity, process-control, and metadata test functions | 0 | All 22 parametrized cases passed offline with synthetic inputs and `httpx.MockTransport`. |
| Ten explicitly selected universal-urgent and fan-boundary test functions | 0 | All 34 parametrized cases passed. Every closed symptom, mixed/nonreported controls, and coherent `39.9`/`40.0`/`40.1°C` fan boundaries passed; incoherent current-above-maximum fixtures failed before fan policy. |
| `make test-backend` | 0 | 675 backend tests passed. |
| `make test-frontend` | 0 | One frontend rendering test passed. |
| `make test` | 0 | 675 backend tests and one frontend test passed. |
| `make build` | 0 | TypeScript checking and the Vite production build passed. |
| `.venv/bin/python -m pip check` | 0 | No broken requirements were found; pip emitted its existing unwritable-cache warning. |
| `npm --prefix frontend ls --depth=0` | 0 | Installed direct frontend dependencies matched the unchanged manifest. |
| Snapshot and manifest `shasum -a 256` | 0 | The accepted snapshot and manifest hashes remained unchanged. |
| `git diff --check`; cached-diff check | 0 | No diff whitespace error was found and the index remained empty. |
| Corrected redacted key-shaped, OpenAI-prefixed `VITE_`, `.env.example`, and project-wide trailing-whitespace scan | 0 | No candidate filename was found, the OpenAI placeholder remained empty, and no trailing whitespace was found. An initial over-broad expression exited 1 because Markdown punctuation following the documented empty placeholder was treated as a value; a redacted diagnostic printed only filenames and redacted lines, and the corrected expression passed. |
| `.env.local` metadata-only check | 0 | It remained ignored, untracked, regular, non-symlinked, and mode `0600`; contents and size were not inspected. |
| Generated-path ignore check | 0 after correcting the shell wrapper | `.venv`, `frontend/node_modules`, `frontend/dist`, pytest, and Python caches remained ignored. The first wrapper exited 1 because assigning to zsh's special `path` variable removed `git` from command lookup; renaming the loop variable fixed the check without a source change. |

## Milestone 3 public-contract and provenance correction pass — 2026-07-17

The primary Codex build thread continued the existing uncommitted Milestone 3
working tree with a strictly offline, zero-cost correction. It did not repeat
the historical paid smoke, inspect the ignored credential contents, or make an
OpenAI, weather, download, Git-remote, or other network request.

Direct adversarial construction showed that the previous strict public model
could still accept some catalog-valid but situation-incompatible supplemental
codes, false branch reasons, inapplicable phrases, and well-formed but
untrusted snapshot or selected-place projections. The earlier statements that
all such supplemental incompatibilities or arbitrary committed membership were
already rejected are superseded by this correction; the historical test
results themselves remain unchanged.

The correction uses one pure backend-owned normal-plan contract for both model
context construction and public normal-response validation. It derives the
applicable movement, support, accessibility, unresolved-travel, cooling,
household, housing, language, candidate, allowed-code, and phrase facts. The
existing canonical required-code function remains the single minimum-action
matrix. Public selected codes must be subsets of the shared allowed lists, and
explanations must equal the deterministic priority and applicable branch
reasons plus `verified_open_candidate` if and only if travel is selected.

Snapshot provenance now compares the full immutable identity derived from the
validated committed snapshot and manifest, including schema and snapshot IDs,
publisher, dataset and distribution URLs, retrieval and upstream-modification
timestamps, license and URL, exact attribution, and normalized hash. Candidate
source and chronology must agree with that identity. At the final API boundary,
a selected projection is independently reconciled with an eligible committed
repository record using the private origin, evaluation time, request distance
preference, and applicable accessibility filter. This is the implemented
independent trust source; it is not a claim that every arbitrary malicious
internal dependency is safe.

The pass-1 Build Log description of the action-plan route as “strict
Barcelona-only” is also explicitly superseded. The route uses a coarse
Barcelona pilot rectangle to bound product coverage; that rectangle does not
prove municipal membership and is not an administrative-boundary geofence.

The one paid grounded-plan smoke recorded above remains historical pass-1
evidence only. It did not exercise this corrected model-facing and public
validation contract, which has not been live re-smoked. Any future re-smoke
requires separate author authorization and a fresh check of official OpenAI
pricing. At the time this record is written, Milestone 3 remains intentionally
uncommitted and unpublished.

Verification for this correction was entirely offline. The first one-off
adversarial reproduction command confirmed 12 direct-model acceptances and
HTTP 200 fake-workflow responses, then exited 1 because its remaining
chronology fixture supplied a datetime string to a strict internal model. The
corrected reproduction used aware `datetime` objects and confirmed the
remaining closing, distance, provenance, and unknown-ID acceptances. During
implementation, the first API/workflow collection then exited 2 because the
old synthetic snapshot identity was no longer authoritative. After switching
the controls to committed provenance, two historical schedule tests correctly
failed because their evaluation instants preceded snapshot retrieval; the
fixtures moved to valid post-retrieval instants, including the later 2026
Madrid DST transition. The first targeted rerun then exposed a test-only
fixed-offset-versus-`ZoneInfo` equality assertion and initially selected a
season that ended before retrieval; the test now compares the UTC instant and
offset and selects a reviewed post-retrieval interval. No production guard was
weakened.

| Command or check | Exit status | Result |
| --- | ---: | --- |
| `.venv/bin/python -m pytest backend/tests/test_action_plan_api.py -q -k 'normal_public_model or asgi or shared_normal_contract or committed_candidate'` | 0 | 57 direct-model, fake-workflow ASGI, shared-contract, and committed-candidate cases passed; 30 were deselected. |
| `.venv/bin/python -m pytest backend/tests/test_action_plan_workflow.py backend/tests/test_places.py -q -k 'provenance or chronology or committed or forged'` | 0 | 72 provenance, chronology, committed-data, and forged-input cases passed; 191 were deselected. |
| `.venv/bin/python -m pytest backend/tests/test_action_plan_api.py backend/tests/test_action_plan_workflow.py backend/tests/test_places.py backend/tests/test_weather.py backend/tests/test_grounded_plan.py -q` | 0 | All 498 focused public-model, ASGI, workflow, provenance, places, weather, and grounded-plan tests passed. |
| `make test-backend` | 0 | All 737 backend tests passed. |
| `make test-frontend` | 0 | The one frontend rendering test passed. |
| `make test` | 0 | The complete root suite passed: 737 backend tests and one frontend test. |
| `make build` | 0 | TypeScript checking and the Vite production build passed. |
| `.venv/bin/python -m pip check` | 0 | No broken requirements were found; pip emitted only the existing unwritable-cache warning. |
| `npm --prefix frontend ls --depth=0` | 0 | Installed direct frontend dependencies matched the unchanged manifest. |
| Snapshot and manifest `shasum -a 256` | 0 | Both accepted hashes remained unchanged. |
| `git diff --check`; cached-diff check | 0 | No diff whitespace error was found and the index remained empty. |
| Corrected redacted credential, OpenAI-prefixed `VITE_`, empty-placeholder, and trailing-whitespace scans | 0 | No non-fixture credential candidate, frontend OpenAI assignment, nonempty placeholder, or trailing whitespace was found. The one key-shaped match is the intentional provider-metadata sanitization fixture. |
| `.env.local` and generated-path metadata checks | 0 | `.env.local` remained ignored, untracked, regular, non-symlinked, and mode `0600`; generated dependency/build/cache paths remained ignored. Contents and size were not inspected. |

## Milestone 3 final trust-boundary correction and authorized smoke — 2026-07-17

The primary Codex build thread preserved the existing uncommitted Milestone 3
implementation. Before the live request, `main` and local `origin/main` both
resolved to `9386d1b4ffc6b2aaf0f85a9c7617407ad2b0c337`, the index was empty,
and the working tree contained exactly the expected 21 Milestone 3 paths,
including `backend/tests/test_situation_api.py`.

The final correction added three narrow backend-owned invariants:

- Explicitly unsheltered housing never exposes
  `use_available_home_cooling`, even with reported air conditioning or
  fan-only cooling at `39.9°C`. Stable and temporary housing retain air
  conditioning and fan-only cooling only under the existing strict below-
  `40.0°C` boundary.
- `missing_information` must exactly match the canonically ordered
  `not_stated` and `unknown` fields. Missing, extra, duplicate, or reordered
  entries fail validation. The standalone extraction route explicitly
  revalidates a service response and uses the sanitized 502 invalid-response
  error; an invalid nested action-plan profile uses the sanitized 503 workflow
  error.
- The action-plan endpoint captures injectable strict UTC instants immediately
  before and after `workflow.create()`. Urgent and normal response evaluation
  times must fall inside that interval; naive or reversed clocks and outside
  times fail before final trusted place-repository reconciliation.

Focused correction verification passed 8 cooling cases, 3 canonical missing-
information/standalone-response cases, and 10 endpoint-time or nested-response
cases. The complete correction suite then passed 757 backend tests and one
frontend test, plus the production build and dependency checks.

### One final authorized corrected-contract grounded-plan smoke

Using the supplied standard rates of `$5.00` per million input tokens and
`$30.00` per million output tokens, the existing 20,000-byte input bound and
1,024-token output cap produced the unchanged conservative `$0.13072` ceiling,
below the authorized `$0.15` limit. The secure repository helper loaded the
ignored backend credential into process memory without printing or passing it
on the command line.

Exactly one direct `GroundedPlanService` Responses API attempt was made with a
short synthetic prevalidated normal profile, synthetic weather, and one exact
candidate from the committed repository. SDK retries and application retries
were zero. The public workflow, M2 extraction, weather service, downloads, and
Git remotes were not called, and no retry was made.

| Safe evidence | Result |
| --- | --- |
| Responses API attempts | `1` |
| Result | Passed on the first and only attempt |
| Returned safe model metadata | `gpt-5.6-sol` |
| Strict Pydantic response validation | Passed |
| Allowed-action-code validation | Passed |
| Exact request-scoped candidate whitelist | Passed |
| Aggregate token counts | 1,326 input; 171 output; 1,497 total |
| Coarse standard-rate estimate | `$0.01176` |
| Configured conservative bound | `$0.13072`, below the `$0.15` ceiling |

No raw request, response, plan, response ID, profile, origin, candidate detail,
provider body, credential, or account balance was printed or recorded. The
earlier pass-1 smoke remains historical evidence; this final smoke separately
exercises the corrected direct grounded-plan schema, allowed-code, and exact
candidate-whitelist path. It does not prove general model accuracy or exercise
the full public workflow. After this attempt, no additional network call was
made.

Final post-smoke verification remained local and offline:

| Command | Exit status | Result |
| --- | ---: | --- |
| `make test` | 0 | 757 backend tests and one frontend test passed. |
| `make build` | 0 | TypeScript checking and the Vite production build passed. |
| `.venv/bin/python -m pip check` | 0 | No broken requirements were found; pip emitted only its existing unwritable-cache warning. |
| `npm --prefix frontend ls --depth=0` | 0 | Installed direct frontend dependencies matched the unchanged manifest. |
| `git diff --check` | 0 | No diff whitespace error was found. |

Only `README.md`, `docs/ARCHITECTURE.md`, `docs/COMPLIANCE.md`, and this Build
Log were edited during the final smoke-record synchronization. The index
remained empty; nothing was staged, committed, pushed, tagged, or otherwise
published. At the time this verification record was written, Milestone 3 was
uncommitted and unpublished.

## Milestone 4 Barcelona frontend slice — 2026-07-17

The first Milestone 4 slice replaces the informational shell with one
accessible single-page flow for the existing `POST /api/v1/action-plan`
contract. The form keeps text only in React memory, enforces a visible
2,000-Unicode-code-point limit, provides a non-submitting synthetic Barcelona
example, and submits the trimmed text with fixed origin `41.3874, 2.1686` and
maximum distance `3000`. Browser geolocation is explicitly unavailable.

The frontend makes at most one same-origin action-plan request per submission,
prevents duplicates while loading, and does not retry or call the situation,
weather, or places endpoints separately. Narrow response contracts and a small
runtime discriminator support accessible loading, normal, no-place, urgent,
malformed-response, backend-error, and connection-error states. Normal output
renders backend-owned phases, weather, place facts when present, and safety
notices; urgent output stays separate and fixed. Errors never echo submitted
text.

Focused frontend tests mock `globalThis.fetch`; during this implementation pass
they were offline evidence, not a live end-to-end check. At the end of the
implementation pass, a live frontend-to-backend smoke was still pending
separate authorization. That pass made no OpenAI, weather, download, or other
live API request, so its API cost was `$0.00`. The OpenAI key remained
backend-only, raw user text was not intentionally stored or logged, and no
dependency, backend, Vite-configuration, snapshot, Git-history, or publication
change belonged to this slice. Maps, routing, translations, browser
geolocation, deployment, and additional cities remained unavailable.

## Milestone 4 authorized live browser smoke — 2026-07-18

An earlier in-app-browser preflight was blocked before the form opened. It
produced no form submission, action-plan POST, OpenAI call, Open-Meteo call, or
other external API call, and its API cost was exactly `$0.00`.

Chrome subsequently loaded the real local frontend. One proxy health GET
returned HTTP 200. Exactly one form submission produced one observed
`POST /api/v1/action-plan`, which returned HTTP 200 with zero retries. The UI
rendered the normal `Prepare now` result, the `Current`, `Feels like`, and
`Today’s maximum` weather cards, all three plan phases, `Why this plan`, the
accepted `No verified place selected` state, and safety notices.

Extraction, Open-Meteo, and grounded-plan call counts were inferred from
successful completion of the normal workflow; they were not independently
provider-logged. Model metadata and token usage were unavailable, so the exact
cost is unknown. The `$0.25` figure was only the conservative authorized upper
bound, not an actual measured charge. Services stopped cleanly. At the time the
smoke completed, the same eight-path Milestone 4 working tree remained
uncommitted and unpublished.

## Milestones 5–8 roadmap gate — 2026-07-18

The author approved the revised sequence: Milestone 5 accessibility and
low-vision foundations, Milestone 6 internationalization and multilingual
processing, Milestone 7 a separately gated complete redesign, and Milestone 8
release verification and submission preparation. This pass changed
documentation only. It changed no product behavior, application source, tests,
dependency, API contract, model workflow, deployment state, or Git history. No
API or network request was made, so API cost was `$0.00`. At the time of this
record, Milestones 5–8 remained planned and unimplemented.

## Milestone 5 accessibility and low-vision foundation — 2026-07-18

### Preference foundation

Milestone 5 adds a native labeled `Visual mode` selector with `Standard` and
`Enhanced Visibility` options. The only persistence key is
`heatrelay.visual-mode.v1`, and only `standard` or `enhanced` are accepted. A
valid stored value takes precedence; otherwise first-load
`prefers-contrast: more` detection may select Enhanced Visibility, with
Standard as the safe fallback. Storage and `matchMedia` failures do not crash
the application, and an explicit in-memory selection remains usable if a write
fails.

An automatic system-derived choice is not persisted. Explicit selections are
stored locally, require no account, and never add a visual-mode field or cause
a request. Situation text is never written to local storage and remains only
in React memory before submission.

### Enhanced token layer

Standard and Enhanced Visibility use the same application and component tree.
A shared semantic CSS-token layer preserves Standard visual fidelity while
Enhanced Visibility supplies larger typography and controls, increased spacing
and line height, stronger contrast, borders and focus, clearer selected and
disabled states, larger practical targets, reduced decoration, and reduced
motion. The implementation adds no dependency, duplicated component tree,
browser-zoom simulation, or alternate route.

### Semantic interaction work

The form is a named landmark, and the situation textarea directly references
the permanent privacy, identity, input, count, and product-boundary
descriptions. Field errors are programmatically associated and focus returns to
the textarea for client-side and sanitized HTTP 400/422 input failures without
a duplicate page alert. Changing the actual situation text clears stale output;
changing visual mode preserves the input and terminal output.

The same pass retains one skip link and focusable main target, logical terminal
focus, one polite atomic status region, a native weather `dl`/`dt`/`dd`
summary, and distinct urgent and page-error alert semantics. Visible labels and
structure preserve meaning without relying on color alone.

### Browser audit and CSS correction

The initial isolated browser audit used 85 synthetic mock action-plan POSTs and
found two product defects:

1. `body { min-width: 320px; }` caused 15 pixels of root overflow at the
   audited narrow viewport.
2. Enhanced Visibility left smooth scrolling on the actual root viewport.

The bounded correction removed the root `min-width: 320px` declaration and
added Enhanced root `scroll-behavior: auto`. It added no overflow clipping,
CSS zoom, scale transform, or JavaScript viewport logic.

The focused correction recheck measured Standard and Enhanced initial,
empty-error, normal, urgent, and HTTP 503 states with
`clientWidth = scrollWidth = 305px`. Enhanced text-spacing normal, urgent, and
HTTP 503 states also measured `305px = 305px`. Dynamic root behavior changed
Standard `smooth` → Enhanced `auto` → Standard `smooth` without a reload or
state loss. Mock counts were normal 3, urgent 3, HTTP 503 3, total 9, with zero
retries and zero unexpected mock requests.

### Actual browser, system, and assistive-technology verification

Chrome visibly showed an actual page zoom of 200%. Its layout viewport changed
from 1710 to 855 pixels. Standard and Enhanced initial, normal, urgent, and HTTP
503 states each measured `clientWidth = scrollWidth = 847px`, and Chrome was
restored to 100% afterward.

macOS Reduce Motion was originally off. Enabling it through the visible system
control made the Chrome runtime media query match, changed root scrolling to
`auto`, reduced representative transitions to `0.01ms`, and left no running
animation. Reduce Motion was restored to off and the runtime media query
returned to false.

VoiceOver is classified as **PASS — manually confirmed by the project author
during the actual VoiceOver session**. This evidence is limited to one real
session with manual author confirmation: speech was not independently logged
for every checkpoint, and no other screen reader was tested. M5.4C mock counts
were normal 2, urgent 2, HTTP 503 2, total 6, with zero retries and zero
unexpected mock requests.

### Audit deviation

During a VoiceOver repeat, Chrome dropped the initial `h` from a typed loopback
URL and issued exactly one unintended Google search. The audit stopped
immediately. The navigation did not reach HeatRelay, its mock API, OpenAI, or
Open-Meteo, and it caused no retry, provider usage, repository change, or API
charge. The session is therefore not described as having zero external
navigation. This was an audit-procedure deviation, not a HeatRelay product
defect.

### Final verification

This final documentation and publication-readiness pass was offline. It did
not start the application or an audit harness and made no API, provider,
weather, download, browser, or Git-remote request.

| Command or check | Exit status | Result |
| --- | ---: | --- |
| `make test` | 0 | All 757 backend tests and all 72 frontend tests passed. |
| `make build` | 0 | `tsc --noEmit` type checking and the Vite production build passed. |
| `.venv/bin/python -m pip check` | 0 | No broken Python requirements were found; pip printed only its existing unwritable-cache warning. |
| `env -u OPENAI_API_KEY npm --prefix frontend ls --depth=0` | 0 | Installed direct frontend dependencies matched the unchanged manifest. |
| Snapshot and manifest `shasum -a 256` | 0 | The accepted snapshot and manifest hashes remained unchanged. |
| `git diff --check` | 0 | No diff whitespace errors were found. |
| `git diff --cached --quiet` | 0 | The index remained empty. |
| Relative Markdown-link existence check | 0 on the corrected command | Eight relative documentation links were checked and none was missing. The first read-only inline expression exited 1 with a Python f-string `SyntaxError`; the corrected multiline check passed without a repository change. |
| Project-wide trailing-whitespace check | 0 on the corrected wrapper | No trailing whitespace was found outside excluded dependency, build, cache, and Git paths. The first wrapper exited 1 because `status` is read-only in zsh; renaming the local variable fixed the check without a repository change. |
| Exact working-tree scope comparison | 0 | Exactly the nine authorized Milestone 5 paths were modified or untracked. |
| Filename-only key-shaped, empty-placeholder, nonempty-assignment, and frontend `VITE_` scans | 0 | Only the two unchanged approved synthetic-fixture filenames matched the key shape; the single OpenAI placeholder remained empty, and no nonempty key or OpenAI-prefixed frontend assignment was found. No candidate value was printed. |
| `.env.local` metadata-only check | 0 | The file remained ignored, untracked, regular, non-symlinked, and mode `0600`; its contents, hash, and size were not inspected. |
| Protected frontend and dependency-manifest hashes | 0 | The test file, stylesheet, visual-mode helper, and all four dependency manifests remained byte-identical to the accepted baseline. |

The repository has no dedicated frontend lint script and no repository-wide
verification script, so neither command was claimed or run. `make build`
performs the configured TypeScript check with `tsc --noEmit` before the Vite
build. Milestone 5 implementation and verification incurred `$0.00` in API or
provider cost. At the time this verification record was written, Milestone 5
was uncommitted and unpublished.

## Milestone 6.30 — output-language preference foundation

M6.30 adds one native, labelled action-plan-language select to the existing
form. Its ordered options come from the shared 25-locale registry. The exact
local key is `heatrelay.output-locale.v1`; exact valid stored values are
restored, all other reads fall back to English without storage repair, and only
an explicit valid selection writes. Browser-language detection and interface
locale do not participate in output resolution. A failed storage write leaves
the valid in-memory selection usable.

Submission snapshots the selected locale and uses the existing exact four-field
request. Situation text is never stored; visual-mode and interface-locale
preferences remain local-only. Output selection makes no request, affects only
the next submission, and does not rewrite existing normal, urgent, validation,
or error state. Result prose retains its response-owned language and direction.

This bounded pass updates all 25 interface catalogs with the selector copy and
current privacy boundary. It changes no backend, action-plan schema, GPT
boundary, provider behavior, dependency, or API field. At the close of the
slice, language-mismatch UI, live multilingual and RTL browser QA, independent
human review, final Milestone 6 verification, and publication remained
pending. The slice was implemented offline and made no browser,
backend-runtime, network, API, provider, download, or Git-remote call;
API/provider cost remained `$0.00`. At the time this verification record was
written, Milestone 6 was uncommitted and unpublished.

## Milestone 6.31 — deterministic language-context information

M6.31 adds one shared passive language-context section after successful normal
and urgent results. It classifies the validated detected-input language against
the response-owned output locale in the exact order `unknown`, `other`, Catalan
input-only, and supported-language mismatch. A matching supported language has
no input-language notice. The displayed response language remains separate
from a different saved next-plan preference, and no browser language, interface
locale, confidence score, or model-internal value is used.

The section uses a semantic definition list without alert, status, live-region,
or automatic-focus behavior. The normal-result action only focuses the existing
action-plan-language select. Urgent language information follows all fixed
`112` content and the official link and has no change-language action. All 25
interface catalogs received the same twelve keys with no interpolation.

This offline frontend and documentation slice changes no backend, action-plan
schema, storage key or resolution, API field, four-field request, GPT boundary,
provider behavior, dependency, weather, places, or action policy. At the close
of the slice, browser and assistive-technology multilingual and RTL QA,
independent human linguistic and safety review, final Milestone 6 verification,
and publication remained pending. At the time this verification record was
written, Milestone 6 was uncommitted and unpublished.

## Milestone 6.32 — bounded multilingual browser and accessibility verification

M6.32A used an isolated loopback Vite/mock harness to audit 13 representative
interface/output/state combinations without touching the real backend or a
provider. It covered LTR, RTL, and CJK content, 320px reflow, keyboard order,
the accessibility tree, target sizing, text spacing, deterministic language-
context placement, loading/duplicate protection, and response-owned language
and direction. The audit identified native selector-option clipping and a
German hero-heading overflow. The correction rendered native names only in
both language selectors, allowed the hero copy and heading to wrap, and made
the two narrow header controls single-column without changing catalogs or
control semantics.

M6.32B exercised actual Chrome 200% zoom and one real VoiceOver session on
macOS with manual author confirmation. The evidence is bounded to the tested
Chrome/macOS cases; speech was not independently logged. A Russian status
value (`Фиксированная точка Barcelona`) exposed a remaining flex-item overflow
at 200% zoom. M6.32B-C1 corrected only `.status-list dd` with `min-width: 0`
and `overflow-wrap: anywhere`; focused real-Chrome rechecking confirmed the
value wrapped without page-level horizontal overflow. These checks are not
formal WCAG certification or universal screen-reader/cross-browser evidence.

## Milestone 6.33 — translation-safety hardening and correction

M6.33 strengthened the backend factual-token invariant from presence to exact
per-leaf occurrence-count parity with English for `HeatRelay`, `Barcelona`,
`Open-Meteo`, `GPT-5.6`, `112`, `34.0°C`, `36.0°C`, and `40.0°C`. It also
added an exhaustive explicit allowlist of every intentional English-equal
interface value across all 24 non-English catalogs, so either an accidental
fallback or an unexpected allowlisted change fails closed.

The new backend invariant found exactly one extra `Barcelona` token in
`candidate_warnings.candidate_notice` for 13 locales: `ru`, `uk`, `pl`, `ja`,
`ko`, `id`, `vi`, `th`, `tr`, `sw`, `ur`, `fa`, and `he`. M6.33-C1 replaced
only that leaf in each catalog with a direct translation of the canonical
factual, backend-approved candidate-place notice and updated the corresponding
catalog characterizations. Full verification passed with 2,546 backend and
1,323 frontend tests at that stage. Structural automation does not constitute
native-speaker or safety approval.

## Milestone 6.34 — bounded multilingual live-smoke evidence

An initial Spanish-only M6.34 attempt completed one normal UI result but did
not expose provider usage under standard Uvicorn logging. Its usage and cost
were therefore unavailable. It remains incomplete historical evidence and is
not counted toward C2.

M6.34-C1 routed the two existing sanitized successful-call usage records
through `uvicorn.error.heatrelay.usage` at `INFO`, without changing provider
requests, responses, schemas, or logging configuration. The focused adapter
suite passed 248 tests and the full backend suite passed 2,568 tests. The
correction was offline and cost `$0.00`.

M6.34-C2 was a fresh separately authorized four-case live smoke through the
real frontend and backend. Spanish and Arabic matching normal results,
Russian input with Hebrew output, and a Traditional Chinese matching urgent
result each completed with one UI submission and no retry. Accounting was:

- UI action-plan submissions: 4.
- OpenAI situation-extraction calls: 4.
- OpenAI grounded-plan calls: 3.
- Total OpenAI calls: 7.
- Open-Meteo calls: 3.
- Retries: 0.
- Aggregate input tokens: 9,223.
- Aggregate output tokens: 792.
- Aggregate total tokens: 10,015.
- Conservative authorized cost bound: `$0.1628075`.

The bound prices every recorded token at the supplied conservative priority
rates without a caching discount; it is not exact provider billing. The urgent
case made no weather or grounded-plan call. This smoke covered four scenarios,
not all 25 locales, and establishes neither model accuracy nor translation,
medical, accessibility, deployment, or release approval.

## Milestone 6.35 — documentation synchronization and final offline verification

M6.35 synchronizes the README, architecture, build log, compliance record,
roadmap, and translation record with the implemented Milestone 6 contract. It
changes no application code, test, catalog, schema, dependency, configuration,
or data file. The verification was offline: no service or browser was started,
no `.env.local` content was read, and no network, OpenAI, Open-Meteo, download,
or Git-remote operation occurred.

| Command or check | Exit status | Result |
| --- | ---: | --- |
| `make test` | 0 | All 2,568 backend tests and all 1,323 frontend tests passed. |
| `make build` | 0 | `tsc --noEmit` and the Vite production build passed; Vite retained its informational large-chunk warning. |
| `.venv/bin/python -m pip check` | 0 | No broken Python requirements were found. |
| `env -u OPENAI_API_KEY npm --prefix frontend ls --depth=0` | 0 | The installed direct frontend dependency tree matched the manifest. |
| Exact localization dependency check | 0 | `i18next` `26.3.6` and `react-i18next` `17.0.10` each declared MIT. |
| Frontend/backend catalog and registry checks | 0 | Exactly 25 interface catalogs and 25 backend output catalogs were present; output order and registry/catalog parity were exact, and interface/output membership matched. |
| Barcelona snapshot hashes | 0 | Snapshot `c958b7ba10b133132d9f1c8b98d84cd1b53644d27cbbd225b5b46bb98d89202b` and manifest `d0ce55c3dd8cd730307324a12e214fdc54ad6783b8ce97a5bb3f14ac1c783c9f` remained exact. |
| Relative Markdown links | 0 | Eight relative links across the six synchronized documents resolved. |
| Credential and frontend environment scans | 0 | Only three approved secret-shaped synthetic test fixtures in two backend test files were present; no production credential candidate and no OpenAI-prefixed frontend variable was found. No candidate value was printed. |
| Trailing-whitespace and `git diff --check` checks | 0 | No project trailing whitespace or diff whitespace error was found. |
| `git diff --cached --quiet` | 0 | The index remained empty. |

The final scope comparison records five baseline-dirty documentation files
changed, the other 75 baseline paths byte-identical, and the previously clean
`docs/ROADMAP.md` as the only newly dirty path, for 81 dirty paths total.
Milestone 6 implementation and M6.35 verification incurred `$0.00` incremental
API/provider cost.

All 24 non-English catalogs remain AI-assisted drafts without independent
native-speaker, linguistic, cultural, medical, emergency, accessibility, or
safety-critical approval. The live smoke covered four scenarios rather than
all 25 locales; browser evidence is Chrome/macOS-specific; and VoiceOver
evidence is one author-confirmed session without independent speech logging.
No formal WCAG certification, universal assistive-technology support, medical
approval, cross-browser compatibility, deployment readiness, or release
readiness is established. At the time this verification record was written,
Milestone 6 was uncommitted and unpublished.

## Milestone 7 redesign audit correction — 2026-07-20

This bounded pass corrects the verified redesign audit findings without
redesigning the page again or expanding the product contract. It changes only
the authorized frontend integration, CSS, tests, and synchronized M7
documentation. Backend code, translation catalogs, dependencies, the
four-field action-plan request, schemas, safety policy, and provider boundaries
remain unchanged.

- Urgent output now places the one complete fixed `112` alert before the
  resubmission form and does not precede it with the ordinary scenario
  dashboard, generic advice, empty place pane, weather, or normal-plan content.
- Privacy, identity, fixed Barcelona origin, server-side OpenAI processing, and
  demo limitations remain permanently exposed before submission; only the
  optional demo-loading explanation remains in the disclosure.
- Enhanced Visibility uses a stronger necessary control boundary and automatic
  programmatic scrolling while retaining 56px targets and existing focus.
- All three weather facts are exposed once through one native ordered `dl`.
- A normal-result language action opens closed mobile Settings before focusing
  the native output-language select, without persistence, fetch, retry, or
  result mutation.
- One page `h1` precedes focused normal, urgent, and error `h2` result headings.
- The three localized scenario cards are non-interactive examples and add no
  scenario field to the exact request.
- The Google Maps surface remains one HTTPS new-tab link based only on a
  backend-verified address. It is not a map, geolocation, route engine, ETA, or
  navigation implementation.
- High Contrast is attributed to M7, not M5, and preserves strict storage,
  state, request, target-size, focus, and RTL contracts.

The mockup's Listen/speech control, embedded map preview, calculated route or
ETA, permanent emergency strip, and unverified third initial safety instruction
remain intentional deviations because no approved behavioral or verified-data
contract exists. This pass adds no Web Speech integration, maps SDK,
geolocation, routing, external font, dependency, or new API.

The focused changed-component run passed all 662 tests. The ordered offline
verification then passed 1,329 frontend tests and 2,568 backend tests in the
separate suite runs, followed by the same counts through `make test`. The
production build, `pip check`, direct frontend dependency check, and
`git diff --check` also passed. The final build retained only Vite's
informational large-chunk warning.

A loopback-only browser pass used a temporary Vite proxy and strict mock API;
it made four exact UI submissions, with four mock POSTs, no retry, no invalid
body, no unexpected request, and no console warning or error. Desktop root and
body widths were both `1265 / 1265` CSS pixels (client/scroll); the 320px pass
reported `305 / 305`. It verified the initial view, a normal result, the
urgent-first result, mobile Settings opening before output-language focus,
Arabic RTL content, and Standard, Enhanced Visibility, and High Contrast.
Standard and High Contrast selects remained 48px; Enhanced Visibility selects
remained 56px, used automatic scroll behavior, and exposed the strengthened
`rgb(130, 123, 114)` control boundary on white. The authoritative mockup
comparison confirmed that the implemented red-and-white structure is retained
while the documented Listen control, embedded map, route/ETA, permanent
emergency strip, and unverified third initial instruction remain omitted.

At the time this verification record was written, Milestone 7 was implemented
and verified within this bounded scope but was uncommitted and unpublished. No
formal WCAG conformance, complete design fidelity, native-speaker review,
cross-browser support, medical approval, or release readiness is claimed.

## Milestone 8.1 offline release-readiness audit — 2026-07-20

The read-only audit started from published Milestone 7 commit
`6866b4c31649751ecea665c8045d028e228796fb`, a clean index and worktree, and
preserved all 51 ignored local QA artifacts. It found evidence-backed release
blockers rather than implementing speculative hardening:

- a schema-valid extraction could omit an explicitly reported bounded urgent
  symptom and enter the normal workflow;
- production had no pre-parse body bound, per-source rate bound, hard shared
  provider budget, trusted-host/proxy contract, readiness policy, or disabled
  documentation policy;
- no one-process package served the built SPA and API with production headers;
- seven reviewed optional information links remained HTTP;
- the direct Python declarations lacked an exact transitive production
  constraints file; and
- deployment, security reporting, incident, dependency notice, and operational
  documentation were incomplete.

The audit used no live backend/browser path, provider call, online advisory
database, package download, deployment, or Git remote. It did not establish
current CVE status or legal sufficiency.

## Milestone 8.2A bounded urgent source grounding — 2026-07-20

The correction reproduced the real workflow failure with a schema-valid fake
provider extraction that omitted an explicit source symptom. A compact,
immutable Unicode-normalized phrase/stem and canonical-denial table now covers
all 26 supported input tags independently of model-reported language metadata.
Deterministic positive matches merge into a newly validated response in
canonical symptom order before priority selection, never remove a model
symptom, and route through the fixed localized `112` branch. Genuine source
denials and ordinary heat text remain normal. The urgent path makes zero
weather, place, or grounded-plan calls. This remains closed-code grounding,
not diagnosis or general multilingual NLP.

## Milestone 8.2 B–D release-blocker correction — 2026-07-20

This offline pass adds one production ASGI perimeter without authentication or
API-shape changes:

- every production `/api/v1/*` POST is pre-read with a default 16 KiB declared
  and actual body bound and a bounded default 10-per-60-second process-local
  client limiter;
- forwarded source addresses are ignored unless the immediate proxy belongs to
  the configured canonical allowlist;
- both OpenAI adapters share one lock-protected integer-microdollar UTC-day
  budget and the existing provider/cleanup capacity. Conservative per-call
  reservations occur before client construction and remain consumed after a
  failure or timeout;
- one-worker `backend.app.production` serves the SPA, real hashed assets and
  FastAPI with API precedence, readiness/liveness separation, production docs
  disabled, cache policy, traversal rejection, trusted hosts and security
  headers;
- a multi-stage Docker definition and safe context install the exact pinned
  Python production closure and omit secrets, tests, caches, Node modules and
  development servers from the runtime;
- legacy HTTP information links normalize to `null`, and backend/public/
  frontend validation is HTTPS-only; exactly seven snapshot leaves changed;
  and
- security reporting, deployment, incident/rollback/rotation, and complete
  installed production dependency/license records were added.

The local raw source used for regeneration retained SHA-256
`37939392d6e2ca6d905eb291d9bded958e188d7d552354d2baa98407032adadd`.
The new normalized snapshot is
`b7ee112ce2e272894865a07111e40430d5d25a73b923de6cb5c0d78b16495ce5`;
the new manifest file is
`969097c05ed478d98b16db9a3020c6efce008314497d34256c9202fc44bb0a1f`.
A structural comparison against published M7 showed only the seven expected
`information_url: http://...` to `null` changes.

| Focused verification | Exit | Evidence |
| --- | ---: | --- |
| Abuse, readiness, production routing, packaging, budget, M8.2A, URL, snapshot and API suites | 0 | 2,449 tests passed. |
| Frontend HTTPS/null parser regression | 0 | 1 test passed; 662 unrelated tests were filtered. |

No container image was built and no live service, browser, OpenAI, Open-Meteo,
download, vulnerability database, deployment, or Git remote was used. The
incremental provider cost was `$0.00`.

### Final M8.2 B–D offline verification

| Verification | Exit | Result |
| --- | ---: | --- |
| Final focused production/action-plan rerun | 0 | 984 tests passed. |
| `make test` | 0 | 2,661 backend and 1,330 frontend tests passed. |
| `make build` | 0 | TypeScript and Vite production build passed; the existing informational large-chunk warning remained. |
| `.venv/bin/python -m pip check` | 0 | No broken requirements. |
| Installed requirements/constraints comparison | 0 | All 5 direct declarations matched the exact installed 22-package production closure. |
| `npm --prefix frontend ls --depth=0` | 0 | Installed direct frontend dependency tree was consistent. |
| Offline production ASGI smoke | 0 | `/`, one hashed asset, liveness, readiness, three disabled docs paths, and an unknown SPA route returned the expected status/cache contracts using a synthetic key and no provider call. |
| Snapshot structural comparison | 0 | Exactly seven `information_url` leaves changed from legacy HTTP to `null`; no unrelated field or ordering changed. |
| Markdown links, credential candidates, frontend environment, whitespace and Docker-context checks | 0 | Relative links resolved; only one approved synthetic secret-shaped test filename was found; no production credential or frontend OpenAI variable was present; context/runtime copies exclude forbidden development and secret material. |
| `git diff --check` and cached-diff check | 0 | No whitespace error and the index remained empty. |

The production smoke was in-process and loopback-free through the ASGI
transport; it did not start Uvicorn or invoke extraction, weather, places, or
grounded planning. Docker was inspected but not built because base-layer and
package resolution could require downloads. Current online CVE status,
third-party notice legal sufficiency, host-level distributed limiting, hosting
selection, deployment, and post-deployment verification remained for a later
authorized milestone at the time of that offline record.

At the time this verification record was written, Milestone 8.2 A–D was
uncommitted and unpublished. The verified release safeguards were later
published through the repository commit containing this revision. Deployment,
online CVE review, legal review, and deployed verification remained pending at
the time of that verification record.

## Milestone 8.4A hosting selection — 2026-07-20

The separately authorized current-source comparison selected Fly.io Pay As You
Go for the bounded HeatRelay release-candidate topology: one Amsterdam
`shared-cpu-1x`, 512 MB Machine with an approximate `$3.32` monthly base charge
plus usage and a possible temporary card authorization below `$10`. No account,
billing, repository, or infrastructure state changed during that selection.
The online dependency-advisory evidence is point-in-time and does not replace a
release-time refresh or legal review.

## Milestone 8.4B Fly correction and offline gate — 2026-07-20

Before any Fly resource creation, this bounded correction added an explicit
Fly Proxy identity mode, deterministic production license bundle, OCI image
labels, and `fly.toml` for one always-running Amsterdam Machine. In Fly mode,
only one canonical `Fly-Client-IP` is accepted; malformed or multiple values
fall back to the immediate peer, `X-Forwarded-For` cannot override it, and the
generic trusted-CIDR mode is mutually exclusive. The license generator reads
the exact Python constraints and npm lock/install production closure and
preserves upstream license and notice texts in a stable runtime bundle.

| Offline verification | Exit | Result |
| --- | ---: | --- |
| Focused proxy, production, packaging, and license-bundle tests | 0 | 38 tests passed. |
| `make test` | 0 | 2,673 backend and 1,330 frontend tests passed. |
| `make build` | 0 | TypeScript and Vite production build passed; the existing informational large-chunk warning remained. |
| `.venv/bin/python -m pip check` | 0 | No broken requirements. |
| `npm --prefix frontend ls --depth=0` | 0 | Installed direct frontend dependency tree was consistent. |
| `git diff --check` | 0 | No whitespace error. |

No provider call, application service, Fly app, Machine, secret, deployment, or
billing change occurred during the offline gate. `flyctl` was not installed at
that point, so CLI configuration validation was deferred until the separately
gated official-CLI step. The incremental API/provider cost was `$0.00`.

## Release-candidate UX correction — 2026-07-21

A bounded frontend correction made all three localized scenario cards operate
the same single form without adding a scenario field, storage, text rewriting,
or a request. Scenario changes preserve the entered text, errors, preferences,
and displayed result, focus the existing textarea, and are disabled only while
a submission is pending. The exact request remains `situation_text`, `origin`,
`maximum_distance_m`, and `output_locale`.

The form now keeps one compact privacy, identity, fixed-Barcelona,
OpenAI-processing, and medical/emergency-boundary notice visible before the
primary action. The unchanged longer privacy and demo explanations remain in
the existing native disclosure. All 25 interface catalogs retained exact key
and interpolation parity. User-facing counters now say ordinary “characters”
while the technical validation continues counting the trimmed submitted value
as Unicode code points with the unchanged 2,000-point limit.

The expanded native weather disclosure was constrained to its assigned grid
area and given safe wrapping, removing the reproduced collision with current
temperature and priority content while preserving the one native three-pair
weather definition list. This correction did not change backend code, schemas,
API fields, dependencies, provider behavior, or data.

## Unified language selector and compact-content verification — 2026-07-21

The two visible M6 language selectors were superseded by one labelled native
selector with the same 25 registry-ordered native-name options. An explicit
choice changes the i18next interface locale and the next action-plan
`output_locale`, synchronizes the two legacy locale storage keys, makes no
request, and does not translate input or rewrite a displayed response. Initial
resolution prefers a valid stored interface locale, then a valid stored output
locale, then browser matching, then English; automatic resolution does not
write storage.

The exact action-plan request remains the four fields `situation_text`,
`origin`, `maximum_distance_m`, and `output_locale`. The existing language-
context action now opens Settings when necessary and focuses the unified
selector. The compact form hierarchy is shared across phone, tablet, and
desktop: visible label, trimmed character counter, textarea, short hint,
bounded safety/privacy notice, primary action, then a closed native disclosure
containing the longer privacy/demo explanation and demo-text action. No
backend, schema, dependency, Fly, Docker, security, data, or provider behavior
changed.

Focused App/i18n verification passed 1,369 tests. The required frontend and
backend suites passed 1,369 and 2,673 tests respectively, and the combined
target repeated both counts successfully. The production build, Python
dependency check, npm dependency-tree check, and whitespace check passed; the
existing informational large-chunk build warning remained. A loopback-only
320px mock pass submitted one Russian and one Arabic request: exactly two
strict four-field POSTs, zero retries, zero invalid or unexpected requests,
correct LTR/RTL ownership, no horizontal overflow, and 48px Standard / 56px
Enhanced control targets. Tablet and desktop initial-form checks used the same
compact DOM hierarchy with the long copy closed inside the native disclosure.

## Standalone Barcelona-demo place lookup — 2026-07-21

The place scenario now opens a dedicated factual search panel rather than the
action-plan situation form. Scenario selection preserves the action-plan text,
validation, result, Settings, unified language, visual mode, and direction and
makes no request or storage write. An explicit search sends one fixed five-field
request to the existing deterministic `/api/v1/places/candidates` endpoint:
Barcelona demo origin, device-time ISO evaluation instant, empty required
features, 3,000-metre maximum distance, and limit `3`. It sends no situation
text, scenario, locale, preference, visual mode, or geolocation data and does
not merge candidates into `ActionPlanResponse`.

The frontend adds strict runtime validation for the complete candidate and
snapshot provenance response, including identifier pairing and uniqueness,
finite coordinates and bounded distances, aware datetimes, verified schedules,
tri-state accessibility, HTTPS-or-null information URLs, HTTPS provenance, and
exact response keys. Candidate cards retain backend-owned facts, mark backend
warnings as English, and state that straight-line distance is not a route or
ETA and that travel, current hours, and personal accessibility were not
verified. All 25 interface catalogs retained exact key/interpolation parity and
removed proximity or device-location implications from the place scenario.

Focused parser/i18n/App verification passed 1,400 tests. The required frontend
and backend suites passed 1,400 and 2,673 tests respectively; the combined
target repeated both counts. The final production build, Python dependency
check, installed npm tree, and whitespace check passed. The build retained its
existing informational large-chunk warning. A loopback-only browser pass used
four explicit search clicks for Russian 320px success, empty, and safe-error
states plus Arabic desktop success: exactly four places POSTs, zero action-plan
POSTs, zero invalid or unexpected requests, zero retries, and zero console
errors. Root/body reflow stayed exact at 320px; Russian Standard and Arabic
Enhanced targets exceeded 48px and 56px respectively; English backend warnings
remained explicitly LTR. Pointer scenario switching passed. The controller
focused the native scenario buttons but did not synthesize Enter/Space
activation, so keyboard activation was not independently re-proven in this
browser pass; native `type="button"` semantics and state transitions remain
covered offline.

## Compact guidance, cooling preview, and place results — 2026-07-21

The shared form now places only its label/counter, textarea, one concise
age/cooling/mobility/symptom hint, one compact OpenAI/identity/fixed-Barcelona/
emergency notice, and the primary action before the existing closed disclosure.
The full provider, storage, logging, location, distance, and medical-boundary
copy remains in that disclosure. The initial normal-plan preview now contains
exactly three concise actions: move to the coolest available spot where the
person already is, reduce physical effort, and drink water regularly when
safe. Personalized normal actions replace the preview, and urgent output never
shows it.

Standalone candidate cards now keep only name/address, a compact distance/
closing/accessibility row, confirmed-feature chips, and official-information/
Maps actions visible. One initially closed result-set disclosure retains every
non-confirmed feature, per-candidate last-checked and source facts, publisher
and attribution once, device-time and route limitations, and the three exact
English backend notices. The polite live region remains available without
visibly duplicating the results heading.

Focused App/i18n verification passed 1,375 tests. The full frontend and
backend suites passed 1,402 and 2,673 tests respectively, and the combined
target repeated both counts. The production build passed with the existing
informational large-chunk warning. In the final loopback browser session,
Russian Standard at 320×800 placed the primary action at 542 CSS pixels with
a 73-pixel target; Arabic Enhanced retained 56-pixel minimum visible controls.
Russian and Arabic result views at 320 and 1280 CSS pixels had no horizontal
overflow. Three compact candidates rendered with a single closed verification
disclosure and one shared attribution. Exactly one places POST occurred, with
zero action-plan POSTs, invalid requests, unexpected requests, retries,
provider calls, or console errors.

## Deployed release and mobile/RTL/security audit — 2026-07-21

Release commit `00e3991628830d0a6a7affaa994aa49d833eb836` was deployed to
`https://heatrelay-gr1gorii.fly.dev` on one started Amsterdam
`shared-cpu-1x`, 512 MB Fly Machine. Fly health checks, `/api/health`, and
`/api/ready` passed. HTTP redirected once to HTTPS; the hostname certificate,
one-year HSTS with subdomains, the checked-in restrictive CSP, nosniff,
no-referrer, restrictive Permissions Policy, framing denial, HTML `no-cache`,
and immutable caching for a real hashed asset matched the production contract.
The disabled docs routes and tested error responses retained the same security
header boundary.

The audit exercised Russian Standard at 320×800, Arabic Enhanced at 320×800,
Hebrew Standard at 390×844, and Russian High Contrast at 1280×800. Tested root,
body, main, active panels, and cards did not horizontally overflow. The tested
views had no mixed-content request or console error. Exactly two explicit
deterministic places searches produced two places POSTs and zero action-plan,
OpenAI, or Open-Meteo calls. Scenario selection made no request. The audit was
Chrome-specific and was not penetration testing, formal WCAG certification,
or complete locale/assistive-technology coverage.

## Final bounded deployed E2E smoke — 2026-07-21

One Russian normal submission and one Traditional Chinese urgent submission
passed through the deployed UI. Both returned action-plan schema `1.16.0` with
nested situation schema `1.1.0`. The Russian result retained Russian interface
and response ownership, complete normal phases, non-overlapping weather, and
focused result heading. The Traditional Chinese result retained the fixed
urgent `112` alert, focused urgent heading, and omitted normal plan, weather,
place, travel, and grounded-plan content.

| Accounting | Result |
| --- | ---: |
| UI action-plan submissions | 2 |
| OpenAI calls / sanitized usage records | 3 |
| Inferred Open-Meteo calls | 1 |
| Retries | 0 |
| Input tokens | 4,126 |
| Output tokens | 382 |
| Total tokens | 4,508 |
| Conservative reservation bound | `$0.45` (`3 × $0.15`) |

The three usage records contained allowlisted model metadata and internally
consistent non-negative aggregate token counts without submitted text, keys,
or private provider payloads. The `$0.45` figure is the configured conservative
reservation bound, not an assertion about exact provider billing. This
two-scenario smoke is not 25-locale coverage, native-speaker or medical review,
formal WCAG conformance, cross-browser validation, or release certification.

## Final M8 evidence and submission-kit synchronization — 2026-07-21

The official Rules, FAQs, Resources, and Updates were refreshed without a
product test, build, provider call, deployment, or repository publication.
The authoritative deadline remains Tuesday, July 21, 2026 at 5:00 PM PT. The
required submission materials include category, English feature description,
publicly accessible YouTube demo under three minutes with audio, repository and
testing access, meaningful Codex/GPT-5.6 explanation, and the primary build
thread's `/feedback` Session ID. The latest update clarifies that meaningful
GPT-5.6 use does not itself require API credits.

Current deployment, audit, and E2E facts were synchronized into the release
documents. Copy-ready Devpost material, a 2:30–2:45 video script, release
evidence map, and a submission checklist were added. Devpost registration,
personal eligibility confirmation, public YouTube publication, and the
primary thread's `/feedback` Session ID remain `HUMAN_REQUIRED`; no value or
claim was invented.
