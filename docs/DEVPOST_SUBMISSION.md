# Devpost submission draft

## Core fields

- **Project title:** HeatRelay
- **One-line pitch:** From heat warning to a clear next step: multilingual,
  safety-bounded action plans and factual Barcelona cooling-place information.
- **Category:** **HUMAN_REQUIRED** — choose and confirm one category in Devpost.
- **Deployed project:**
  [https://heatrelay-gr1gorii.fly.dev](https://heatrelay-gr1gorii.fly.dev)
- **Repository:**
  [https://github.com/Gr1gorii/HeatRelay](https://github.com/Gr1gorii/HeatRelay)
- **Demo video:** **HUMAN_REQUIRED** — add the publicly accessible YouTube URL.
- **Primary build thread `/feedback` Session ID:** **HUMAN_REQUIRED**.

## Problem

Heat information is often broad, while a person in a hot room needs a small
set of concrete next steps that reflect what they reported. Language,
readability, uncertainty about nearby facilities, and urgent symptoms can make
that gap harder to navigate.

## Solution and intended audience

HeatRelay is a Barcelona-bounded informational demo for people seeking a clear
heat action plan for themselves or someone they care about. It combines a
structured multilingual description, deterministic policy and public-data
checks, server-side GPT-5.6 code selection, and backend-owned localized prose.
It also provides a separate factual search of verified Barcelona climate-
shelter candidates from a fixed demo point.

HeatRelay is not a medical or emergency service. It does not diagnose risk,
use browser geolocation, calculate routes or ETAs, guarantee that a place is
open or reachable, or replace official or medical guidance. Its urgent branch
is a fixed bounded-symptom rule that directs the user to `112`.

## Meaningful Codex and GPT-5.6 use

Codex was the primary implementation environment across the milestone-based
build. It helped inspect and modify the repository, develop the strict schemas
and deterministic hydration boundaries, build multilingual and RTL UI support,
add production safeguards, run offline verification, and document evidence.
The project author supplied the product boundaries and safety decisions,
reviewed the generated work, authorized bounded live checks, and made the
publication and deployment decisions.

GPT-5.6 performs two narrow server-side Structured Output tasks for a normal
action plan:

1. Extract a schema-validated situation profile from the submitted text.
2. Select only from backend-approved action, reason, item, phrase, and candidate
   ID codes grounded in validated facts.

The backend then revalidates and hydrates every public sentence and fact from
immutable catalogs and deterministic data. A deterministic source-text guard
can only upgrade the fixed urgent path when a closed urgent symptom is present.
Urgent results bypass weather, places, and grounded planning.

## Architecture and safety approach

- React/Vite frontend with one unified language selector and three visual modes
- FastAPI single-process production package serving the SPA and API
- exact four-field action-plan request and strict schema versions
- Open-Meteo context plus a reviewed Barcelona climate-shelter snapshot
- 25 immutable backend output catalogs and 25 bundled interface catalogs
- fixed `112` urgent branch, strict provider/output revalidation, sanitized
  errors, request/body/rate/cost controls, and safe aggregate usage logging
- one Amsterdam Fly Machine with readiness, HTTPS, security headers, and
  deterministic cache policy

## Accessibility and language support

The interface and backend output support 25 exact locales, including four RTL
languages. HeatRelay uses native controls, semantic headings and lists,
keyboard focus management, Standard, Enhanced Visibility, and High Contrast
modes, and response-owned `lang`/`dir` boundaries. Bounded Chrome/macOS checks
covered 320px reflow, actual 200% zoom, Russian/Arabic/Hebrew RTL/mobile views,
and one author-confirmed VoiceOver session.

These checks are not formal WCAG certification or universal browser/screen-
reader support. All 24 non-English catalogs remain AI-assisted drafts without
independent native-speaker, cultural, medical, emergency, accessibility, or
safety-critical approval.

## Copy-ready description

HeatRelay turns a short description of a heat situation into a structured,
multilingual action plan while keeping emergency guidance and public facts
under deterministic backend control. A user can describe their situation for
themselves or someone they care about, choose one of 25 interface/output
languages, and receive a normal plan with three phases or a fixed urgent `112`
response when a closed reported warning symptom is present.

The server uses GPT-5.6 in two bounded Structured Output stages. The first
extracts a validated situation profile. For normal results, the second chooses
only from backend-approved action and explanation codes plus verified candidate
IDs. HeatRelay revalidates those choices and hydrates every public sentence and
fact from immutable locale catalogs, deterministic policy, Open-Meteo context,
and a reviewed Barcelona climate-shelter snapshot. The model never supplies
official names, addresses, URLs, phone numbers, schedules, coordinates, or
weather values.

The standalone place search is separate from personal action planning. It uses
a fixed Barcelona demo point and shows factual candidates, straight-line
distance, verified schedule/accessibility fields, and official links without
claiming a route, ETA, recommendation, availability, reachability, or safety.

Codex supported the milestone-based implementation, testing, accessibility and
RTL verification, production safeguards, and evidence documentation. The
project author set and reviewed the behavioral and safety boundaries. The
current release is deployed at
[heatrelay-gr1gorii.fly.dev](https://heatrelay-gr1gorii.fly.dev), with the
source at [Gr1gorii/HeatRelay](https://github.com/Gr1gorii/HeatRelay).

HeatRelay remains a Barcelona-bounded informational demo, not medical or
emergency care. It has no real geolocation, routing, ETA, guarantee of place
availability, multiple-city coverage, human-reviewed translations, formal
WCAG certification, penetration-test claim, or universal browser/assistive-
technology guarantee.
