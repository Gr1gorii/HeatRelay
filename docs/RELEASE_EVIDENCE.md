# HeatRelay release evidence

This is a bounded evidence index for release commit
`00e3991628830d0a6a7affaa994aa49d833eb836`. It maps competition and technical
claims to the repository record; it does not claim eligibility, registration,
medical approval, security certification, or general release readiness.

## Official submission requirements

The requirements were refreshed on July 21, 2026 using only the
[Official Rules](https://openai.devpost.com/rules),
[FAQs](https://openai.devpost.com/details/faqs),
[Resources](https://openai.devpost.com/resources), and
[Updates](https://openai.devpost.com/updates).

| Requirement | HeatRelay evidence | Remaining action |
| --- | --- | --- |
| Meaningful Codex and GPT-5.6 use | The [architecture](ARCHITECTURE.md) and [build log](BUILD_LOG.md) record Codex-assisted implementation and two bounded server-side GPT-5.6 Structured Output stages. | Author must review the copy and provide the primary build thread's `/feedback` Session ID. |
| Category and English feature description | A copy-ready draft is in [Devpost submission](DEVPOST_SUBMISSION.md). | Author must choose/confirm the category and submit the final copy. |
| Public repository or judging access | [Gr1gorii/HeatRelay](https://github.com/Gr1gorii/HeatRelay) contains the MIT-licensed source and current release commit. | Author must confirm public judging access at submission time. |
| Working project access through judging | [heatrelay-gr1gorii.fly.dev](https://heatrelay-gr1gorii.fly.dev) was healthy and ready during the bounded deployed checks. | Author must keep access available and monitor hosting through judging. |
| YouTube demo with audio, strictly under three minutes | [Video script](VIDEO_SCRIPT.md) targets 2:30–2:45 and covers the product plus Codex/GPT-5.6 use. | **HUMAN_REQUIRED:** record, review, upload, and supply the publicly accessible YouTube URL. |
| Primary build thread `/feedback` Session ID | The checklist identifies the required field. | **HUMAN_REQUIRED:** run `/feedback` in the primary build thread and copy the real Session ID. |
| Registration and personal eligibility | No registration or personal-eligibility fact is inferred from the repository. | **HUMAN_REQUIRED:** register and confirm eligibility against the Official Rules. |

The authoritative Submission Period ends Tuesday, July 21, 2026 at 5:00 PM
PT. Required materials include a category, English project description,
publicly accessible YouTube demo URL, code repository URL/access instructions,
and the primary Codex build thread's `/feedback` Session ID. The demo must be
under three minutes and include audio explaining what was built and how Codex
and GPT-5.6 were used.

## Deployment evidence

- Fly app: `heatrelay-gr1gorii`
- URL: [https://heatrelay-gr1gorii.fly.dev](https://heatrelay-gr1gorii.fly.dev)
- Topology: one Amsterdam `shared-cpu-1x`, 512 MB Machine
- Release commit: `00e3991628830d0a6a7affaa994aa49d833eb836`
- Passing evidence: Fly check, `/api/health`, `/api/ready`, a single HTTP-to-
  HTTPS redirect, valid hostname certificate, documented security headers,
  HTML `no-cache`, and immutable caching for a real hashed asset

The verified effective header values on the root, health, readiness, tested
404, and disabled-documentation response were:

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: geolocation=(), microphone=(), camera=()
X-Frame-Options: DENY
```

The deployed UI audit covered Russian, Arabic, and Hebrew mobile/RTL states and
Russian High Contrast desktop. The tested views had no horizontal overflow,
mixed-content request, or console error. Two explicit place searches produced
two deterministic places POSTs and no action-plan or provider call.

## Final bounded workflow evidence

| Fact | Observed result |
| --- | --- |
| Scenarios | Russian normal; Traditional Chinese urgent |
| Schemas | Action plan `1.16.0`; nested situation `1.1.0` |
| UI submissions | 2 |
| OpenAI calls | 3 |
| Open-Meteo calls | 1 inferred from the successful normal workflow |
| Retries | 0 |
| Tokens | 4,126 input + 382 output = 4,508 total |
| Conservative reservation bound | `$0.45` (`3 × $0.15`), not exact billing |

The normal result retained its plan when place selection was unavailable or
bounded. The urgent result used the fixed localized `112` branch and omitted
normal plan, weather, place, travel, and grounded-plan content.

## Limits of this evidence

- All 24 non-English catalogs are AI-assisted drafts without independent
  native-speaker, linguistic, cultural, medical, emergency, accessibility, or
  safety-critical review.
- The live workflow covered two scenarios, not all 25 locales or every branch.
- Browser evidence is Chrome/macOS-specific; the earlier VoiceOver evidence is
  one author-confirmed session without independent speech logging.
- No formal WCAG conformance, penetration testing, security certification,
  universal assistive-technology support, cross-browser compatibility,
  medical approval, multiple-city support, or real geolocation is established.

For the detailed chronology and operational contract, see the
[build log](BUILD_LOG.md), [compliance record](COMPLIANCE.md), and
[deployment record](DEPLOYMENT.md).
