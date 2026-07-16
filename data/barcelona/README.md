# Barcelona climate-shelter snapshot

HeatRelay Milestone 1 uses a deliberately small, reviewed snapshot of 15
places from Barcelona's official climate-shelter dataset. It is not complete
Barcelona coverage and must not be presented as a live municipal directory.

## Official source and license

- Dataset: <https://opendata-ajuntament.barcelona.cat/data/en/dataset/xarxa-refugis-climatics>
- CKAN metadata: <https://opendata-ajuntament.barcelona.cat/data/api/action/package_show?id=xarxa-refugis-climatics>
- JSON distribution: <https://opendata-ajuntament.barcelona.cat/data/dataset/8f9da263-ff41-4765-ab0d-61b97d7a00b2/resource/d88129fe-7aaa-4ae6-b9fd-908ad3f7480d/download>
- License: [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)

Source: Ajuntament de Barcelona, “Climate shelters network in the city of
Barcelona”, licensed under CC BY 4.0. HeatRelay selected and normalized a
small reviewed subset; changes were made to structure, strings, feature
states, and opening schedules. Attribution must not imply municipal
endorsement.

## What is committed

- `climate_shelters.v1.json`: 15 normalized, source-backed place records.
- `climate_shelters.v1.manifest.json`: source, license, hash, count, and
  retrieval provenance.

The approximately 42 MB upstream JSON is never committed. Contact email,
telephone, transport, image, raw HTML, and unrelated source fields are also
excluded.

The reviewed selection contains 12 schedules with concrete 2026 validity
ranges. Three micro-shelter records retain source-backed factual fields and
feature states but have `opening_schedule: null` and verification status
`unknown`; deterministic candidate logic must exclude them as open places.
One swimming-pool record was deliberately excluded because an upstream
“limited to subscribers” note spans its timetable and public eligibility
could not be established safely.

Municipal and participating-place hours can change. HeatRelay must always
warn users to verify hours before travel.

## Normalization rules

The normalizer:

- accepts an official JSON file or downloads the official JSON distribution
  in memory;
- requires an explicit UTC retrieval time so repeated runs are byte
  identical;
- validates the top-level structure, required record fields, unique
  `register_id` values, coordinates, and timezone-aware modification times;
- requires each retained official place coordinate to fall within the
  inclusive Barcelona pilot bounds: latitude `41.2` through `41.6` and
  longitude `1.9` through `2.4`;
- requires a reviewed main address to be explicitly visible and rejects it if
  `hide_address` is true or visibility cannot be established;
- selects only classification ID `148414647` and verifies its exact official
  label, `Xarxa de Refugis Climàtics d'Estiu`;
- derives stable IDs as `bcn-<register_id>`;
- narrowly repairs observed Windows-1252 C1 characters, strips BOM and
  zero-width artifacts, applies Unicode NFC, and collapses whitespace in
  normalized text fields other than URLs;
- maps explicit positive and negative classifications to `true` and `false`;
- preserves missing or contradictory feature evidence as `null`;
- verifies each reviewed timetable ID, SHA-256, visibility, and alert state
  before applying a manually reviewed schedule;
- sorts places and JSON object keys and writes UTF-8 with a final newline.

The `source_url` field points to the official dataset because the JSON does
not provide a canonical per-record page. Source attribute `100003` is retained
separately as `information_url`; when the source lists more than one Web value,
the first source-listed value is retained deterministically. Every nonblank
raw `url_value` is validated before any cleanup. An accepted URL is serialized
exactly as supplied and must already be absolute HTTP(S), with valid hostname,
port, and percent-escape syntax and no credentials, whitespace, or Unicode
control/format characters. A non-null invalid URL fails normalization rather
than being repaired or converted to `null`.

The Barcelona coordinate bounds apply only to normalized official place
records and are also enforced when the backend loads a snapshot. They do not
restrict global weather coordinates or the user origin used for distance
calculation.

This correction does not change the current snapshot or manifest bytes. Raw
source SHA-256 remains
`37939392d6e2ca6d905eb291d9bded958e188d7d552354d2baa98407032adadd`, and
normalized snapshot SHA-256 remains
`c958b7ba10b133132d9f1c8b98d84cd1b53644d27cbbd225b5b46bb98d89202b`.

## Refresh from an existing download

Download the official JSON outside the repository, then run:

```sh
.venv/bin/python scripts/normalize_barcelona_places.py \
  --input /absolute/path/to/official-climate-shelters.json \
  --retrieved-at 2026-07-16T19:08:41Z
```

Use the real UTC retrieval time for a new fetch. The timestamp above records
the source used for snapshot v1 and is not a reusable placeholder.

## Download and normalize directly

When network access is available:

```sh
.venv/bin/python scripts/normalize_barcelona_places.py \
  --download \
  --retrieved-at YYYY-MM-DDTHH:MM:SSZ
```

The default outputs are:

```text
data/barcelona/climate_shelters.v1.json
data/barcelona/climate_shelters.v1.manifest.json
```

For a future refresh, inspect all upstream changes before updating the
snapshot. In particular:

1. Confirm the dataset and distribution URLs and CC BY 4.0 license.
2. Confirm the summer classification ID and exact label.
3. Review any selected place whose timetable ID, HTML hash, alert, or hidden
   state changed.
4. Confirm every retained address is explicitly visible, every retained
   information URL passes strict raw validation unchanged, and every normalized
   place remains inside the documented Barcelona bounds.
5. Update manual 2026 schedule mappings only when every interval is traceable
   to the official timetable.
6. Replace or version the snapshot ID rather than silently changing an
   existing reviewed snapshot.
7. Run the normalizer twice against the same raw bytes and explicit retrieval
   timestamp, then confirm byte-identical snapshot and manifest output.

Do not infer omitted features, public access, or opening hours. A missing,
ambiguous, expired, changed, or unverified schedule must remain unavailable
to candidate ranking.
