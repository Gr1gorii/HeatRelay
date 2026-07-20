# Production deployment contract

HeatRelay now has a single-process production package, but no hosting provider
has been selected and no deployment is authorized or claimed. This document is
an operator contract for a later, separately approved deployment. The verified
release safeguards are published through the repository commit containing this
revision; deployment, online CVE review, legal review, and deployed verification
remain pending.

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
committed data, and built frontend assets into the non-root runtime image.
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
| `HEATRELAY_TRUSTED_PROXY_CIDRS` | Optional comma-separated canonical CIDRs with no padding. Empty means no trusted proxy. |
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
header and may supply a client address only when its immediate network is in
`HEATRELAY_TRUSTED_PROXY_CIDRS`. Arbitrary forwarded headers are not trusted.
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
