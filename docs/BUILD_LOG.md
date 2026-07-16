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
