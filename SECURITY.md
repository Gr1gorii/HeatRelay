# Security policy

HeatRelay is a bounded Barcelona pilot, not a deployed or release-ready
service. Security reports should avoid including API keys, private situation
text, provider responses, or other personal data.

The verified release safeguards are published through the repository commit
containing this revision. Deployment, online CVE review, legal review, and
deployed verification remain pending; publication does not establish security
certification or release readiness.

## Reporting a vulnerability

Use [GitHub private vulnerability reporting](https://github.com/Gr1gorii/HeatRelay/security/advisories/new).
Do not open a public issue for a suspected vulnerability. Include a concise
reproduction, affected revision, impact, and the smallest relevant evidence.
No personal email address is used as the reporting route.

## Supported versions

Only the current `main` branch is considered for fixes. The repository has no
deployed production version, security certification, or guaranteed response
time. A maintainer will triage a private report and coordinate a correction
and disclosure boundary where appropriate.

## Operational boundary

Production operation requires the validated single-worker entrypoint described
in [Deployment](docs/DEPLOYMENT.md). Operators must provide HTTPS termination,
secret storage, trusted-host and proxy configuration, monitoring, backup and
rollback procedures, and shared rate limiting when running multiple replicas.
Never commit `.env.local` or expose `OPENAI_API_KEY` through frontend variables.

The offline dependency review records installed versions and declared
licenses, but does not establish current vulnerability status. Online advisory
and legal review remain required before any release or deployment.
