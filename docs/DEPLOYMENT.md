# Production deployment contract

HeatRelay has a single-process production package and a selected Fly.io Pay As
You Go target. The checked-in configuration names app `heatrelay-gr1gorii`,
region `ams`, and one always-running `shared-cpu-1x` Machine with 512 MB. The
expected Fly hostname is `heatrelay-gr1gorii.fly.dev`. Repository configuration
or a successful deploy does not establish release readiness; legal, broader
accessibility/browser, translation, and ongoing operational review remain
separate gates.

## Topology

Run exactly one Uvicorn process with one worker per application instance:

```sh
make build-production
make start-production
```

`backend.app.production` serves the built SPA and the existing FastAPI app in
one process. `/api/*` always routes to FastAPI, `/assets/*` serves only existing
files, and other non-API GET/HEAD paths fall back to `index.html`. The runtime
uses the existing process-shared provider task and cleanup limits, one bounded
process-local request limiter, and one process-shared UTC-day OpenAI budget.
Do not add Uvicorn workers. Multiple replicas require a host- or gateway-level
shared rate limiter because process-local counters and budgets are not globally
shared.

The multi-stage `Dockerfile` builds the frontend, installs the exact production
Python closure using `backend/requirements.txt` plus
`backend/constraints-production.txt`, and copies only backend runtime code,
committed data, built frontend assets, and a deterministic production license
bundle into the non-root runtime image. Project and dependency license/notice
texts are available under `/usr/share/licenses/heatrelay/`; the image has OCI
source, description, and project-license labels.
The safe context excludes local environments, `.git`, tests, caches,
`node_modules`, documentation captures, and development servers. Building the
image may require registry/package network access and was intentionally not run
during the offline correction.

## Required environment

Never place values in source control or a frontend `VITE_` variable.

| Variable | Contract |
| --- | --- |
| `OPENAI_API_KEY` | Required nonempty backend-only secret. |
| `HEATRELAY_HOST` | Optional IP literal; default `0.0.0.0`. |
| `HEATRELAY_PORT` | Optional integer `1..65535`; default `8000`. |
| `HEATRELAY_ALLOWED_HOSTS` | Required comma-separated exact host allowlist with no padding. |
| `HEATRELAY_FLY_PROXY_MODE` | Optional exact `true` or `false`; use `true` only behind Fly Proxy. Default `false`. |
| `HEATRELAY_TRUSTED_PROXY_CIDRS` | Optional comma-separated canonical CIDRs with no padding for non-Fly reverse proxies. Empty means no generic trusted proxy. Mutually exclusive with Fly mode. |
| `HEATRELAY_MAX_REQUEST_BODY_BYTES` | Optional integer `1..1048576`; default `16384`. |
| `HEATRELAY_RATE_LIMIT_REQUESTS` | Optional integer `1..1000`; default `10`. |
| `HEATRELAY_RATE_LIMIT_WINDOW_SECONDS` | Optional integer `1..86400`; default `60`. |
| `HEATRELAY_RATE_LIMIT_MAX_CLIENTS` | Optional integer `1..1000000`; default `4096`. |
| `HEATRELAY_OPENAI_DAILY_BUDGET_USD` | Required positive finite decimal with at most six decimal places. |
| `HEATRELAY_OPENAI_PER_CALL_RESERVATION_USD` | Required positive finite conservative reservation, no greater than the daily budget. |
| `HEATRELAY_HTTPS_EXPECTED` | Required exact `true` or `false`; production Internet service should use `true`. |

The per-call value is an operator-selected conservative hard reservation, not
a mutable pricing calculation. Both OpenAI adapters reserve from the same
UTC-day budget before client construction. A failed, timed-out, or cancelled
call keeps its reservation because provider cost may already exist. Exact
remaining budget is neither returned nor logged.

## Proxy, HTTPS, and public perimeter

Terminate HTTPS at the instance or a trusted reverse proxy. When HTTPS is
expected the app emits HSTS. It also emits a restrictive same-origin CSP,
`X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, a restrictive
Permissions Policy, and framing protection. The proxy must preserve the Host
header. A non-Fly proxy may supply a client address only when its immediate
network is in `HEATRELAY_TRUSTED_PROXY_CIDRS`. In explicit Fly mode, only one
canonical provider-authenticated `Fly-Client-IP` is accepted; malformed,
duplicate, comma-separated, zone-qualified, or non-IP values fall back to the
immediate peer, and `X-Forwarded-For` cannot override it. Arbitrary forwarded
headers are not trusted, and client addresses are not logged.
No permissive CORS middleware is installed; the supported production topology
serves the SPA and API from the same origin.

Every `/api/v1/*` POST is pre-read before JSON parsing, limited by declared and
actual bytes, and governed by the process-local per-source rate limit. The
default is 16 KiB and 10 requests per 60 seconds. HTTP 413 and 429 responses are
sanitized; 429 includes `Retry-After`. Authentication is not implemented, so a
public deployment additionally needs network-level monitoring and shared abuse
controls appropriate to its exposure.

## Health, readiness, and routing

- `GET /api/health` is liveness and returns HTTP 200 when the process responds.
- `GET /api/ready` returns HTTP 200 only after production configuration, built
  frontend assets, and the committed Barcelona snapshot/manifest validate;
  otherwise it returns sanitized HTTP 503.
- `/docs`, `/redoc`, and `/openapi.json` return 404 in production.
- `index.html` is `no-cache`; successful hashed assets are long-lived and
  immutable. Missing assets and traversal attempts never fall back to HTML.

A load balancer should use readiness for traffic admission and liveness only
for process restart decisions. Do not expose internal exception details in
health tooling.

## Logs and operations

Successful provider calls emit one record to
`uvicorn.error.heatrelay.usage` containing only an allowlisted model and
aggregate token counts; grounded-plan records also contain payload bytes.
Do not enable body logging. Logs must not contain situation text, model output,
keys, provider bodies, response IDs, place/candidate details, coordinates, or
exact remaining budget. Centralized retention and access policy remain an
operator responsibility.

For an incident, stop new traffic, preserve sanitized operational evidence,
rotate the OpenAI key through the hosting secret store, review budget and
provider activity, and use GitHub private vulnerability reporting where a code
issue may exist. Roll back to a previously verified image and committed data
pair; do not mix snapshot and manifest revisions. After rotation, restart the
single-worker instance so every lazy provider client receives only the new
secret.

This package does not establish provider suitability, availability, backups,
disaster recovery, deployment readiness, current-CVE status, formal security
certification, or release readiness.

## Fly.io deployed profile

`fly.toml` defines one Docker process and one Machine in `ams`, with HTTPS
forced at Fly Proxy, autostop off, automatic start enabled, minimum running
count one, restart on failure, and `/api/ready` checked after a bounded grace
period. Non-secret environment values in the file retain the 16 KiB body cap,
10-per-60-second per-source rate limit, 4,096-client bound, `$1.50` UTC-day
budget, and `$0.15` conservative per-call reservation. Only
`OPENAI_API_KEY` belongs in Fly's secret store.

Deploy with one Machine only; do not add `--ha` capacity or a second replica.
Before traffic admission, verify Machine count/region/size, readiness, HTTPS,
headers, cache behavior, disabled docs, static routing, the runtime license
path, sanitized logs, and the secret name without exposing its value. A proxy
spoof check must use invalid request schemas so it cannot schedule OpenAI or
Open-Meteo. If a security, secret, HTTPS, readiness, or proxy boundary fails,
scale the existing app to zero and preserve it for diagnosis.

The selected approximate base cost is `$3.32` per month plus usage; Fly may
place a temporary card authorization below `$10`. These are planning figures,
not an invoice or a guarantee of future pricing.

## Verified deployed state

Release commit `00e3991628830d0a6a7affaa994aa49d833eb836` is deployed at
[heatrelay-gr1gorii.fly.dev](https://heatrelay-gr1gorii.fly.dev) on the one
configured Amsterdam `shared-cpu-1x`, 512 MB Machine. The bounded verification
observed a started Machine, passing Fly check, `status=ok` liveness, and
`status=ready` readiness. HTTP redirected once to the equivalent HTTPS URL.
The certificate was valid for the hostname.

The root, liveness, readiness, a 404, and a disabled-documentation response
all retained the exact effective production headers: one-year HSTS with
subdomains, the checked-in same-origin CSP, `nosniff`, `no-referrer`, denied
geolocation/microphone/camera permissions, and framing denial. Index HTML was
`no-cache`; a real hashed asset was `public, max-age=31536000, immutable`.
There was no permissive cross-origin response or mixed-content request in the
tested flow.

The deployed multilingual UI audit exercised Russian, Arabic, and Hebrew
mobile/RTL states plus Russian High Contrast desktop without horizontal
overflow or console error. Two explicit places searches made two deterministic
places POSTs and no provider call. The final bounded workflow smoke then passed
one Russian normal and one Traditional Chinese urgent submission with two UI
POSTs, three OpenAI calls, one inferred Open-Meteo call, zero retries, and
4,508 aggregate tokens. The conservative provider reservation bound was
`$0.45`. These checks do not establish complete locale/browser coverage,
medical approval, penetration testing, security certification, formal WCAG
conformance, universal assistive-technology support, or release readiness.
