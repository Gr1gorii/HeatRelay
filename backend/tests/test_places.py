import asyncio
import hashlib
import json
from copy import deepcopy
from datetime import datetime
from pathlib import Path
from typing import Any, Callable

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from backend.app.places import (
    BARCELONA_PLACE_MAX_LATITUDE,
    CANDIDATE_NOTICE,
    CandidatePlace,
    CC_BY_4_LICENSE,
    CC_BY_4_LICENSE_URL,
    EMPTY_EXPLANATION,
    HOURS_WARNING,
    OFFICIAL_DATASET_URL,
    OFFICIAL_DISTRIBUTION_URL,
    OFFICIAL_PUBLISHER,
    MATCH_EXPLANATION,
    OpeningSchedule,
    PlaceDataError,
    PlaceRepository,
    PlacesCandidatesResponse,
    PlacesCandidatesRequest,
    SnapshotProvenance,
    get_committed_snapshot_provenance,
    get_place_repository,
    router,
    schedule_closing_time,
)

ORIGIN = {"latitude": 41.3874, "longitude": 2.1686}
EVALUATION_DATETIME = "2026-07-20T10:00:00+02:00"


def _schedule(
    *,
    valid_from: str = "2026-06-01",
    valid_through: str = "2026-09-30",
    weekdays: list[str] | None = None,
    intervals: list[dict[str, str]] | None = None,
) -> dict[str, Any]:
    return {
        "timezone": "Europe/Madrid",
        "seasons": [
            {
                "valid_from": valid_from,
                "valid_through": valid_through,
                "weekly_rules": [
                    {
                        "weekdays": weekdays or ["monday"],
                        "intervals": intervals
                        or [{"opens": "09:00", "closes": "18:00"}],
                    }
                ],
            }
        ],
    }


def _place(
    source_record_id: str,
    *,
    name: str | None = None,
    latitude: float = ORIGIN["latitude"],
    longitude: float = ORIGIN["longitude"],
    accessibility: bool | None = None,
    features: dict[str, bool | None] | None = None,
    schedule: dict[str, Any] | None = None,
    schedule_status: str = "verified",
) -> dict[str, Any]:
    if schedule_status == "verified" and schedule is None:
        schedule = _schedule()
    if schedule_status != "verified":
        schedule = None
    return {
        "place_id": f"bcn-{source_record_id}",
        "source_record_id": source_record_id,
        "name": name or f"Climate shelter {source_record_id}",
        "address": {
            "street": "Carrer de la Prova",
            "number": source_record_id,
            "postal_code": "08001",
            "city": "Barcelona",
        },
        "district": "Ciutat Vella",
        "neighborhood": "El Raval",
        "latitude": latitude,
        "longitude": longitude,
        "source_modified_at": "2026-07-15T10:00:00Z",
        "accessibility": accessibility,
        "features": features
        or {
            "indoor_space": True,
            "potable_water": None,
            "toilets": None,
            "micro_shelter": None,
            "pets_allowed": None,
        },
        "information_url": None,
        "opening_schedule": schedule,
        "schedule_verification_status": schedule_status,
        "last_checked": "2026-07-16",
        "source_url": OFFICIAL_DATASET_URL,
    }


def _write_repository(
    tmp_path: Path,
    places: list[dict[str, Any]],
    *,
    snapshot_changes: dict[str, Any] | None = None,
    manifest_changes: dict[str, Any] | None = None,
) -> tuple[PlaceRepository, dict[str, Any], dict[str, Any]]:
    tmp_path.mkdir(parents=True, exist_ok=True)
    snapshot: dict[str, Any] = {
        "schema_version": "1.0.0",
        "snapshot_id": "barcelona-climate-shelters-v1-test",
        "publisher": OFFICIAL_PUBLISHER,
        "dataset_url": OFFICIAL_DATASET_URL,
        "distribution_url": OFFICIAL_DISTRIBUTION_URL,
        "license": CC_BY_4_LICENSE,
        "license_url": CC_BY_4_LICENSE_URL,
        "attribution": (
            "Barcelona City Council source data, normalized by HeatRelay."
        ),
        "places": places,
    }
    if snapshot_changes:
        snapshot.update(snapshot_changes)

    snapshot_bytes = (
        json.dumps(
            snapshot,
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
        )
        + "\n"
    ).encode()
    snapshot_path = tmp_path / "climate_shelters.v1.json"
    snapshot_path.write_bytes(snapshot_bytes)

    rejected_count = 2
    manifest: dict[str, Any] = {
        "schema_version": snapshot["schema_version"],
        "snapshot_id": snapshot["snapshot_id"],
        "publisher": snapshot["publisher"],
        "dataset_url": snapshot["dataset_url"],
        "distribution_url": snapshot["distribution_url"],
        "retrieved_at": "2026-07-16T12:00:00Z",
        "upstream_max_modified": "2026-07-15T10:00:00Z",
        "license": snapshot["license"],
        "license_url": snapshot["license_url"],
        "raw_sha256": "a" * 64,
        "normalized_sha256": hashlib.sha256(snapshot_bytes).hexdigest(),
        "input_count": len(places) + rejected_count,
        "selected_count": len(places),
        "rejected_count": rejected_count,
        "rejection_reasons": {"not_selected_for_review": rejected_count},
        "attribution": snapshot["attribution"],
    }
    if manifest_changes:
        manifest.update(manifest_changes)

    manifest_path = tmp_path / "climate_shelters.v1.manifest.json"
    manifest_path.write_text(
        json.dumps(
            manifest,
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
        )
        + "\n",
        encoding="utf-8",
    )
    return PlaceRepository(snapshot_path, manifest_path), snapshot, manifest


def _request(
    **changes: Any,
) -> PlacesCandidatesRequest:
    payload: dict[str, Any] = {
        "origin": ORIGIN,
        "evaluation_datetime": EVALUATION_DATETIME,
        "required_features": {},
        "maximum_distance_m": 5_000,
        "limit": 10,
    }
    payload.update(changes)
    return PlacesCandidatesRequest.model_validate(payload)


def _candidate_contract_payload() -> dict[str, Any]:
    payload = _place("101", accessibility=True)
    payload.pop("opening_schedule")
    payload.update(
        {
            "distance_m": 25,
            "closes_at": "2026-07-20T18:00:00+02:00",
        }
    )
    return payload


def _provenance_contract_payload() -> dict[str, Any]:
    return {
        "schema_version": "1.0.0",
        "snapshot_id": "barcelona-climate-shelters-v1-test",
        "publisher": OFFICIAL_PUBLISHER,
        "dataset_url": OFFICIAL_DATASET_URL,
        "distribution_url": OFFICIAL_DISTRIBUTION_URL,
        "retrieved_at": "2026-07-16T12:00:00Z",
        "upstream_max_modified": "2026-07-15T10:00:00Z",
        "license": CC_BY_4_LICENSE,
        "license_url": CC_BY_4_LICENSE_URL,
        "attribution": (
            "Barcelona City Council source data, normalized by HeatRelay."
        ),
        "normalized_sha256": "a" * 64,
    }


def _test_app(repository: PlaceRepository) -> FastAPI:
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_place_repository] = lambda: repository
    return app


def _post_json(
    app: FastAPI,
    payload: dict[str, Any],
) -> tuple[int, dict[str, Any]]:
    async def request() -> tuple[int, dict[str, Any]]:
        transport = ASGITransport(app=app)
        async with AsyncClient(
            transport=transport,
            base_url="http://testserver",
        ) as client:
            response = await client.post(
                "/api/v1/places/candidates",
                json=payload,
            )
            return response.status_code, response.json()

    return asyncio.run(request())


def test_repository_validates_manifest_hash_counts_and_provenance(
    tmp_path: Path,
) -> None:
    repository, _, manifest_payload = _write_repository(
        tmp_path,
        [_place("101"), _place("102")],
    )

    repository.load()

    assert repository.snapshot.schema_version == "1.0.0"
    assert repository.snapshot.publisher == "Ajuntament de Barcelona"
    assert repository.snapshot.dataset_url == OFFICIAL_DATASET_URL
    assert repository.snapshot.distribution_url == OFFICIAL_DISTRIBUTION_URL
    assert repository.snapshot.license == "CC BY 4.0"
    assert repository.snapshot.license_url == CC_BY_4_LICENSE_URL
    assert repository.manifest.selected_count == 2
    assert repository.manifest.input_count == 4
    assert repository.manifest.rejected_count == 2
    assert repository.manifest.normalized_sha256 == (
        manifest_payload["normalized_sha256"]
    )
    assert len({place.place_id for place in repository.snapshot.places}) == 2
    assert all(
        -90 <= place.latitude <= 90
        and -180 <= place.longitude <= 180
        and place.source_url == OFFICIAL_DATASET_URL
        for place in repository.snapshot.places
    )
    assert repository.provenance == SnapshotProvenance(
        schema_version=manifest_payload["schema_version"],
        snapshot_id=manifest_payload["snapshot_id"],
        publisher=manifest_payload["publisher"],
        dataset_url=manifest_payload["dataset_url"],
        distribution_url=manifest_payload["distribution_url"],
        retrieved_at=manifest_payload["retrieved_at"],
        upstream_max_modified=manifest_payload["upstream_max_modified"],
        license=manifest_payload["license"],
        license_url=manifest_payload["license_url"],
        attribution=manifest_payload["attribution"],
        normalized_sha256=manifest_payload["normalized_sha256"],
    )


def test_committed_provenance_is_derived_from_validated_manifest() -> None:
    provenance = get_committed_snapshot_provenance()

    assert provenance == get_place_repository().provenance
    assert provenance.snapshot_id == "barcelona-climate-shelters-v1-2026-07-16"
    assert provenance.normalized_sha256 == (
        "c958b7ba10b133132d9f1c8b98d84cd1b53644d27cbbd225b5b46bb98d89202b"
    )


@pytest.mark.parametrize(
    ("place_updates", "manifest_changes", "error_match"),
    [
        (
            {"source_modified_at": "2026-07-15T10:00:01Z"},
            None,
            "newer than the upstream maximum",
        ),
        (
            {"last_checked": "2026-07-15"},
            None,
            "last_checked is inconsistent",
        ),
    ],
)
def test_repository_rejects_place_chronology_inconsistent_with_manifest(
    tmp_path: Path,
    place_updates: dict[str, Any],
    manifest_changes: dict[str, Any] | None,
    error_match: str,
) -> None:
    place = _place("101")
    place.update(place_updates)
    repository, _, _ = _write_repository(
        tmp_path,
        [place],
        manifest_changes=manifest_changes,
    )

    with pytest.raises(PlaceDataError, match=error_match):
        repository.load()


def test_repository_does_not_invent_source_modified_before_retrieval_rule(
    tmp_path: Path,
) -> None:
    place = _place("101")
    place["source_modified_at"] = "2026-07-17T10:00:00Z"
    repository, _, _ = _write_repository(
        tmp_path,
        [place],
        manifest_changes={
            "upstream_max_modified": "2026-07-17T10:00:00Z",
        },
    )

    repository.load()

    assert repository.snapshot.places[0].source_modified_at > (
        repository.manifest.retrieved_at
    )


@pytest.mark.parametrize(
    "manifest_changes, error_match",
    [
        ({"normalized_sha256": "0" * 64}, "SHA-256"),
        ({"selected_count": 99}, "selected_count"),
        ({"input_count": 99}, "input_count"),
        ({"rejected_count": 3, "input_count": 4}, "rejection reasons"),
        ({"schema_version": "2.0.0"}, "official value"),
        ({"publisher": "Other publisher"}, "official value"),
        ({"dataset_url": "https://example.com/data"}, "official value"),
    ],
)
def test_repository_rejects_invalid_manifest_provenance_and_counts(
    tmp_path: Path,
    manifest_changes: dict[str, Any],
    error_match: str,
) -> None:
    repository, _, _ = _write_repository(
        tmp_path,
        [_place("101")],
        manifest_changes=manifest_changes,
    )

    with pytest.raises(PlaceDataError, match=error_match):
        repository.load()


def test_repository_rejects_duplicate_and_invalid_place_ids(
    tmp_path: Path,
) -> None:
    duplicate_repository, _, _ = _write_repository(
        tmp_path / "duplicate",
        [_place("101"), _place("101")],
    )
    invalid_place = _place("102")
    invalid_place["place_id"] = "invalid 102"
    invalid_repository, _, _ = _write_repository(
        tmp_path / "invalid",
        [invalid_place],
    )

    with pytest.raises(PlaceDataError, match="duplicate place_id"):
        duplicate_repository.load()
    with pytest.raises(PlaceDataError, match="schema validation"):
        invalid_repository.load()


def test_repository_rejects_place_outside_barcelona_pilot_bounds(
    tmp_path: Path,
) -> None:
    outside_place = _place(
        "101",
        latitude=BARCELONA_PLACE_MAX_LATITUDE + 0.01,
    )
    repository, _, _ = _write_repository(tmp_path, [outside_place])

    with pytest.raises(PlaceDataError, match="schema validation"):
        repository.load()


@pytest.mark.parametrize(
    "retained_url",
    [
        "https://127.0.0.1/path",
        "https://[2001:db8::1]/path",
        "https://münich.example/path",
        "https://xn--mnich-kva.example/path",
        "https://example.test/a%20b?next=%2Fsafe",
        "https://0xrelay.example/path",
    ],
)
def test_repository_retains_valid_information_url_without_rewriting(
    tmp_path: Path,
    retained_url: str,
) -> None:
    place = _place("101")
    place["information_url"] = retained_url
    repository, _, _ = _write_repository(tmp_path, [place])

    repository.load()

    assert repository.snapshot.places[0].information_url == retained_url


@pytest.mark.parametrize(
    "invalid_url",
    [
        " https://example.test/place",
        "https://example.test/place ",
        "https://example.test/\tplace",
        "https://example.test/\nplace",
        "\ufeffhttps://example.test/place",
        "https://exam\u200bple.test/place",
        "https://exam\u2060ple.test/place",
        "https://example.test/%",
        "https://example.test/%zz",
        "https://example.test/%z1",
        "https://example.test/%1z",
        "ftp://example.test/place",
        "/relative/place",
        "https://user:password@example.test/place",
        "https://example .test/place",
        "https://example..test/place",
        "https://example.test:/place",
        "https://example.test:+80/place",
        "https://example.test:0/place",
        "https://example.test:65536/place",
        "https://xn--a.test/",
        "https://xn--abc.test/",
        "https://xn--a-ecp.test/",
        "https://１２７.１/",
        "https://１２７.０.０.１/",
        "https://2130706433/",
        "https://127.1/",
        "https://0177.0.0.1/",
        "https://0x7f000001/",
        "https://0x7f.0x0.0x0.0x1/",
    ],
)
def test_repository_rejects_invalid_information_url(
    tmp_path: Path,
    invalid_url: str,
) -> None:
    place = _place("101")
    place["information_url"] = invalid_url
    repository, _, _ = _write_repository(tmp_path, [place])

    with pytest.raises(PlaceDataError, match="schema validation"):
        repository.load()


@pytest.mark.parametrize(
    ("field_name", "invalid_value"),
    [
        ("place_id", "bcn-synthetic-101"),
        ("place_id", "bcn-102"),
        ("source_record_id", "synthetic-101"),
        ("source_record_id", "102"),
        ("name", " \t"),
        ("district", ""),
        ("neighborhood", "\n"),
        ("latitude", float("nan")),
        ("latitude", float("inf")),
        ("latitude", BARCELONA_PLACE_MAX_LATITUDE + 0.01),
        ("longitude", float("-inf")),
        ("distance_m", -1),
        ("distance_m", 1.5),
        ("distance_m", True),
        ("closes_at", None),
        ("closes_at", "2026-07-20T18:00:00"),
        ("source_modified_at", "2026-07-15T10:00:00"),
        ("accessibility", 1),
    ],
)
def test_candidate_contract_rejects_forged_or_weak_factual_fields(
    field_name: str,
    invalid_value: object,
) -> None:
    payload = _candidate_contract_payload()
    payload[field_name] = invalid_value

    with pytest.raises(ValueError):
        CandidatePlace.model_validate(payload)


@pytest.mark.parametrize(
    "address_changes",
    [
        {"street": ""},
        {"number": "  "},
        {"postal_code": "\t"},
        {"city": "\n"},
    ],
)
def test_candidate_contract_reuses_strict_nonblank_address_fields(
    address_changes: dict[str, object],
) -> None:
    payload = _candidate_contract_payload()
    payload["address"].update(address_changes)

    with pytest.raises(ValueError):
        CandidatePlace.model_validate(payload)


@pytest.mark.parametrize(
    ("field_name", "invalid_url"),
    [
        ("information_url", "javascript:alert(1)"),
        ("information_url", "file:///tmp/place"),
        ("information_url", "https://user:password@example.test/place"),
        ("information_url", "https://example.test/%zz"),
        ("source_url", "javascript:alert(1)"),
        ("source_url", "file:///tmp/place"),
        ("source_url", "https://user:password@example.test/place"),
        ("source_url", "https://example.test/%zz"),
    ],
)
def test_candidate_contract_rejects_unsafe_urls(
    field_name: str,
    invalid_url: str,
) -> None:
    payload = _candidate_contract_payload()
    payload[field_name] = invalid_url

    with pytest.raises(ValueError):
        CandidatePlace.model_validate(payload)


def test_candidate_contract_accepts_exact_reviewed_factual_shape() -> None:
    payload = _candidate_contract_payload()
    payload["information_url"] = (
        "https://example.test/a%20b?next=%2Fsafe"
    )

    candidate = CandidatePlace.model_validate(payload)

    assert candidate.place_id == "bcn-101"
    assert candidate.source_record_id == "101"
    assert candidate.distance_m == 25
    assert candidate.information_url == payload["information_url"]


@pytest.mark.parametrize(
    ("field_name", "invalid_value"),
    [
        ("schema_version", "1"),
        ("snapshot_id", " "),
        ("publisher", "\t"),
        ("license", ""),
        ("attribution", "\n"),
        ("retrieved_at", "2026-07-16T12:00:00"),
        ("retrieved_at", "2026-07-16T14:00:00+02:00"),
        ("upstream_max_modified", "2026-07-15T10:00:00"),
        ("normalized_sha256", "A" * 64),
        ("normalized_sha256", "a" * 63),
    ],
)
def test_snapshot_provenance_rejects_weak_fields(
    field_name: str,
    invalid_value: object,
) -> None:
    payload = _provenance_contract_payload()
    payload[field_name] = invalid_value

    with pytest.raises(ValueError):
        SnapshotProvenance.model_validate(payload)


@pytest.mark.parametrize(
    "field_name",
    ["dataset_url", "distribution_url", "license_url"],
)
@pytest.mark.parametrize(
    "invalid_url",
    [
        "javascript:alert(1)",
        "file:///tmp/provenance",
        "https://user:password@example.test/data",
        "https://example.test/%zz",
    ],
)
def test_snapshot_provenance_rejects_unsafe_urls(
    field_name: str,
    invalid_url: str,
) -> None:
    payload = _provenance_contract_payload()
    payload[field_name] = invalid_url

    with pytest.raises(ValueError):
        SnapshotProvenance.model_validate(payload)


def test_candidate_response_requires_source_url_to_match_snapshot() -> None:
    candidate_payload = _candidate_contract_payload()
    candidate_payload["source_url"] = "https://example.test/other-dataset"

    with pytest.raises(ValueError, match="source_url"):
        PlacesCandidatesResponse.model_validate(
            {
                "candidates": [candidate_payload],
                "snapshot": _provenance_contract_payload(),
                "explanation": MATCH_EXPLANATION,
                "hours_warning": HOURS_WARNING,
                "candidate_notice": CANDIDATE_NOTICE,
            }
        )


def test_candidate_response_rejects_duplicate_identifiers() -> None:
    first = _candidate_contract_payload()

    with pytest.raises(ValueError, match="must be unique"):
        PlacesCandidatesResponse.model_validate(
            {
                "candidates": [first, deepcopy(first)],
                "snapshot": _provenance_contract_payload(),
                "explanation": MATCH_EXPLANATION,
                "hours_warning": HOURS_WARNING,
                "candidate_notice": CANDIDATE_NOTICE,
            }
        )


@pytest.mark.parametrize(
    ("field_path", "malformed_value"),
    [
        (("accessibility",), 1),
        (("features", "indoor_space"), "true"),
    ],
)
def test_repository_rejects_coerced_snapshot_booleans(
    tmp_path: Path,
    field_path: tuple[str, ...],
    malformed_value: object,
) -> None:
    malformed_place = _place("101")
    target: dict[str, Any] = malformed_place
    for field_name in field_path[:-1]:
        target = target[field_name]
    target[field_path[-1]] = malformed_value
    repository, _, _ = _write_repository(tmp_path, [malformed_place])

    with pytest.raises(PlaceDataError, match="schema validation"):
        repository.load()


def test_schedule_matches_season_weekday_and_exact_boundaries() -> None:
    schedule = OpeningSchedule.model_validate(
        _schedule(
            valid_from="2026-07-20",
            valid_through="2026-07-20",
            intervals=[{"opens": "09:00", "closes": "12:00"}],
        )
    )

    assert schedule_closing_time(
        schedule,
        datetime.fromisoformat("2026-07-20T09:00:00+02:00"),
    ) == datetime.fromisoformat("2026-07-20T12:00:00+02:00")
    assert schedule_closing_time(
        schedule,
        datetime.fromisoformat("2026-07-20T07:00:00+00:00"),
    ) == datetime.fromisoformat("2026-07-20T12:00:00+02:00")
    assert schedule_closing_time(
        schedule,
        datetime.fromisoformat("2026-07-20T11:59:59+02:00"),
    ) == datetime.fromisoformat("2026-07-20T12:00:00+02:00")
    assert (
        schedule_closing_time(
            schedule,
            datetime.fromisoformat("2026-07-20T12:00:00+02:00"),
        )
        is None
    )
    assert (
        schedule_closing_time(
            schedule,
            datetime.fromisoformat("2026-07-21T10:00:00+02:00"),
        )
        is None
    )


def test_schedule_supports_multiple_and_previous_day_overnight_intervals(
) -> None:
    split_schedule = OpeningSchedule.model_validate(
        _schedule(
            intervals=[
                {"opens": "09:00", "closes": "12:00"},
                {"opens": "14:00", "closes": "18:00"},
            ]
        )
    )
    overnight_schedule = OpeningSchedule.model_validate(
        _schedule(
            valid_from="2026-07-19",
            valid_through="2026-07-19",
            weekdays=["sunday"],
            intervals=[{"opens": "22:00", "closes": "02:00"}],
        )
    )

    assert (
        schedule_closing_time(
            split_schedule,
            datetime.fromisoformat("2026-07-20T13:00:00+02:00"),
        )
        is None
    )
    assert schedule_closing_time(
        split_schedule,
        datetime.fromisoformat("2026-07-20T15:00:00+02:00"),
    ) == datetime.fromisoformat("2026-07-20T18:00:00+02:00")
    assert schedule_closing_time(
        overnight_schedule,
        datetime.fromisoformat("2026-07-20T01:00:00+02:00"),
    ) == datetime.fromisoformat("2026-07-20T02:00:00+02:00")
    assert (
        schedule_closing_time(
            overnight_schedule,
            datetime.fromisoformat("2026-07-20T02:00:00+02:00"),
        )
        is None
    )


@pytest.mark.parametrize(
    "invalid_schedule",
    [
        {
            "timezone": "Europe/Madrid",
            "seasons": [
                {
                    "valid_from": "2026-06-01",
                    "valid_through": "2026-08-31",
                    "weekly_rules": [
                        {
                            "weekdays": ["monday"],
                            "intervals": [
                                {"opens": "09:00", "closes": "12:00"}
                            ],
                        }
                    ],
                },
                {
                    "valid_from": "2026-08-01",
                    "valid_through": "2026-09-30",
                    "weekly_rules": [
                        {
                            "weekdays": ["tuesday"],
                            "intervals": [
                                {"opens": "09:00", "closes": "12:00"}
                            ],
                        }
                    ],
                },
            ],
        },
        {
            "timezone": "Europe/Madrid",
            "seasons": [
                {
                    "valid_from": "2026-06-01",
                    "valid_through": "2026-09-30",
                    "weekly_rules": [
                        {
                            "weekdays": ["monday"],
                            "intervals": [
                                {"opens": "09:00", "closes": "12:00"}
                            ],
                        },
                        {
                            "weekdays": ["monday"],
                            "intervals": [
                                {"opens": "14:00", "closes": "18:00"}
                            ],
                        },
                    ],
                }
            ],
        },
    ],
)
def test_schedule_schema_rejects_ambiguous_rule_structures(
    invalid_schedule: dict[str, Any],
) -> None:
    with pytest.raises(ValueError):
        OpeningSchedule.model_validate(invalid_schedule)


def test_candidates_exclude_unknown_ambiguous_expired_and_closed_hours(
    tmp_path: Path,
) -> None:
    repository, _, _ = _write_repository(
        tmp_path,
        [
            _place("101"),
            _place("102", schedule_status="unknown"),
            _place("103", schedule_status="ambiguous"),
            _place(
                "104",
                schedule=_schedule(
                    valid_from="2025-06-01",
                    valid_through="2025-09-30",
                ),
            ),
            _place(
                "105",
                schedule=_schedule(
                    intervals=[{"opens": "11:00", "closes": "12:00"}]
                ),
            ),
        ],
    )

    response = repository.find_candidates(_request())

    assert [place.place_id for place in response.candidates] == ["bcn-101"]


def test_required_features_fail_closed_for_false_and_null(
    tmp_path: Path,
) -> None:
    base_features = {
        "indoor_space": True,
        "potable_water": None,
        "toilets": True,
        "micro_shelter": None,
        "pets_allowed": None,
    }
    false_features = {**base_features, "toilets": False}
    null_features = {**base_features, "toilets": None}
    repository, _, _ = _write_repository(
        tmp_path,
        [
            _place("101", features=base_features),
            _place("102", features=false_features),
            _place("103", features=null_features),
        ],
    )

    response = repository.find_candidates(
        _request(required_features={"toilets": True})
    )

    assert [place.place_id for place in response.candidates] == ["bcn-101"]


def test_action_candidates_filter_accessibility_before_rank_and_limit(
    tmp_path: Path,
) -> None:
    repository, _, _ = _write_repository(
        tmp_path,
        [
            _place("101", latitude=41.38741, accessibility=False),
            _place("102", latitude=41.38742, accessibility=None),
            _place("103", latitude=41.38750, accessibility=True),
        ],
    )

    response = repository.find_action_candidates(
        _request(limit=1),
        accessibility_required=True,
    )
    unchanged_public_response = repository.find_candidates(_request(limit=1))

    assert [place.place_id for place in response.candidates] == ["bcn-103"]
    assert response.candidates[0].accessibility is True
    assert [
        place.place_id for place in unchanged_public_response.candidates
    ] == ["bcn-101"]


def test_candidates_rank_by_raw_haversine_then_lexical_place_id(
    tmp_path: Path,
) -> None:
    repository, _, _ = _write_repository(
        tmp_path,
        [
            _place("2", latitude=41.38745),
            _place("10", latitude=41.38745),
            _place("3", latitude=41.38744),
        ],
    )

    response = repository.find_candidates(_request())

    assert [place.place_id for place in response.candidates] == [
        "bcn-3",
        "bcn-10",
        "bcn-2",
    ]
    assert all(isinstance(place.distance_m, int) for place in response.candidates)


def test_candidates_apply_maximum_distance_and_limit(
    tmp_path: Path,
) -> None:
    repository, _, _ = _write_repository(
        tmp_path,
        [
            _place("101", latitude=41.3875),
            _place("102", latitude=41.3876),
            _place("103", latitude=41.3900),
        ],
    )

    response = repository.find_candidates(
        _request(maximum_distance_m=100, limit=1)
    )

    assert [place.place_id for place in response.candidates] == ["bcn-101"]
    assert response.candidates[0].distance_m < 100


def test_candidate_request_accepts_origin_outside_barcelona() -> None:
    request = _request(
        origin={"latitude": 40.7128, "longitude": -74.0060},
        maximum_distance_m=7_000_000,
    )

    assert request.origin.latitude == 40.7128
    assert request.origin.longitude == -74.0060


def test_empty_candidates_are_honest_and_keep_required_notices(
    tmp_path: Path,
) -> None:
    repository, _, _ = _write_repository(
        tmp_path,
        [_place("101", latitude=41.4)],
    )

    response = repository.find_candidates(
        _request(maximum_distance_m=10)
    )

    assert response.candidates == []
    assert response.explanation == EMPTY_EXPLANATION
    assert response.hours_warning == HOURS_WARNING
    assert response.candidate_notice == CANDIDATE_NOTICE


def _set_invalid_latitude(payload: dict[str, Any]) -> None:
    payload["origin"]["latitude"] = 91


def _set_invalid_longitude(payload: dict[str, Any]) -> None:
    payload["origin"]["longitude"] = -181


def _set_naive_datetime(payload: dict[str, Any]) -> None:
    payload["evaluation_datetime"] = "2026-07-20T10:00:00"


def _set_zero_limit(payload: dict[str, Any]) -> None:
    payload["limit"] = 0


def _set_excessive_limit(payload: dict[str, Any]) -> None:
    payload["limit"] = 11


def _set_extra_field(payload: dict[str, Any]) -> None:
    payload["unexpected"] = True


def _set_nested_extra_field(payload: dict[str, Any]) -> None:
    payload["origin"]["unexpected"] = True


@pytest.mark.parametrize(
    "mutate_payload",
    [
        _set_invalid_latitude,
        _set_invalid_longitude,
        _set_naive_datetime,
        _set_zero_limit,
        _set_excessive_limit,
        _set_extra_field,
        _set_nested_extra_field,
    ],
)
def test_invalid_candidate_requests_return_422(
    tmp_path: Path,
    mutate_payload: Callable[[dict[str, Any]], None],
) -> None:
    repository, _, _ = _write_repository(tmp_path, [_place("101")])
    payload: dict[str, Any] = {
        "origin": deepcopy(ORIGIN),
        "evaluation_datetime": EVALUATION_DATETIME,
        "required_features": {},
        "maximum_distance_m": 5_000,
        "limit": 10,
    }
    mutate_payload(payload)

    status_code, response_payload = _post_json(
        _test_app(repository),
        payload,
    )

    assert status_code == 422
    assert response_payload["detail"]


def test_candidates_endpoint_has_exact_response_contract(
    tmp_path: Path,
) -> None:
    repository, _, manifest = _write_repository(
        tmp_path,
        [_place("101", accessibility=True)],
    )
    request_payload = {
        "origin": ORIGIN,
        "evaluation_datetime": EVALUATION_DATETIME,
        "required_features": {"indoor_space": True},
        "maximum_distance_m": 5_000,
        "limit": 1,
    }

    status_code, payload = _post_json(
        _test_app(repository),
        request_payload,
    )

    assert status_code == 200
    assert payload == {
        "candidates": [
            {
                "place_id": "bcn-101",
                "source_record_id": "101",
                "name": "Climate shelter 101",
                "address": {
                    "street": "Carrer de la Prova",
                    "number": "101",
                    "postal_code": "08001",
                    "city": "Barcelona",
                },
                "district": "Ciutat Vella",
                "neighborhood": "El Raval",
                "latitude": 41.3874,
                "longitude": 2.1686,
                "distance_m": 0,
                "closes_at": "2026-07-20T18:00:00+02:00",
                "accessibility": True,
                "features": {
                    "indoor_space": True,
                    "potable_water": None,
                    "toilets": None,
                    "micro_shelter": None,
                    "pets_allowed": None,
                },
                "information_url": None,
                "schedule_verification_status": "verified",
                "source_modified_at": "2026-07-15T10:00:00Z",
                "source_url": OFFICIAL_DATASET_URL,
                "last_checked": "2026-07-16",
            }
        ],
        "snapshot": {
            "schema_version": "1.0.0",
            "snapshot_id": "barcelona-climate-shelters-v1-test",
            "publisher": "Ajuntament de Barcelona",
            "dataset_url": OFFICIAL_DATASET_URL,
            "distribution_url": OFFICIAL_DISTRIBUTION_URL,
            "retrieved_at": "2026-07-16T12:00:00Z",
            "upstream_max_modified": "2026-07-15T10:00:00Z",
            "license": "CC BY 4.0",
            "license_url": CC_BY_4_LICENSE_URL,
            "attribution": (
                "Barcelona City Council source data, normalized by HeatRelay."
            ),
            "normalized_sha256": manifest["normalized_sha256"],
        },
        "explanation": MATCH_EXPLANATION,
        "hours_warning": HOURS_WARNING,
        "candidate_notice": CANDIDATE_NOTICE,
    }


def test_endpoint_returns_stable_non_sensitive_error_for_invalid_data(
    tmp_path: Path,
) -> None:
    missing_repository = PlaceRepository(
        tmp_path / "missing-snapshot.json",
        tmp_path / "missing-manifest.json",
    )

    status_code, payload = _post_json(
        _test_app(missing_repository),
        {
            "origin": ORIGIN,
            "evaluation_datetime": EVALUATION_DATETIME,
            "required_features": {},
            "maximum_distance_m": 5_000,
            "limit": 1,
        },
    )

    assert status_code == 503
    assert payload == {
        "detail": {
            "code": "places_unavailable",
            "message": "Verified place data is temporarily unavailable.",
        }
    }
    assert str(tmp_path) not in json.dumps(payload)
