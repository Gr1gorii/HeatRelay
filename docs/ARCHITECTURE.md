# HeatRelay architecture

## Milestone 0 boundary

The browser application is a static React shell built with Vite and
TypeScript. It communicates no user, weather, place, or model data. The
FastAPI backend is a separate process and currently exposes only
`GET /api/health` as an application endpoint, alongside FastAPI's standard
schema and documentation routes. Vite proxies `/api` during local
development, but the frontend does not yet make an application-data request.

Secrets belong only on the backend. A future OpenAI API key must never be
included in frontend code or exposed through a `VITE_` environment variable.

## Planned backend separation

The following pipeline is a future design boundary, not implemented behavior:

1. **Weather retrieval and normalization** will obtain trusted observations
   and warnings while retaining source and freshness metadata.
2. **Deterministic action-priority logic** will convert verified conditions
   and explicit user constraints into safety-first priorities.
3. **Verified place retrieval and ranking** will keep place facts,
   eligibility checks, and ranking logic separate from generated language.
4. **Server-side GPT-5.6 extraction and plan generation** will produce
   structured interpretations and concise explanations without owning source
   facts or deterministic safety priorities.
5. **Backend output validation** will enforce schemas, provenance,
   freshness, allowed actions, and safety rules before any response reaches
   the frontend.

This separation is intended to keep model output bounded by verified data and
deterministic checks. Weather, place data, ranking, GPT-5.6, and validation
components remain unimplemented in Milestone 0.
