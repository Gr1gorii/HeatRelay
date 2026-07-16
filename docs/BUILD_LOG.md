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
