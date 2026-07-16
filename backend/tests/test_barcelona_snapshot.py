"""Validation of the committed reviewed Barcelona snapshot."""

import hashlib
from pathlib import Path

from backend.app.places import (
    CC_BY_4_LICENSE_URL,
    OFFICIAL_DATASET_URL,
    OFFICIAL_DISTRIBUTION_URL,
    OFFICIAL_PUBLISHER,
    PlaceRepository,
)

ROOT = Path(__file__).resolve().parents[2]
SNAPSHOT_PATH = ROOT / "data/barcelona/climate_shelters.v1.json"
MANIFEST_PATH = ROOT / "data/barcelona/climate_shelters.v1.manifest.json"
EXPECTED_RAW_SHA256 = (
    "37939392d6e2ca6d905eb291d9bded958e188d7d552354d2baa98407032adadd"
)
EXPECTED_NORMALIZED_SHA256 = (
    "c958b7ba10b133132d9f1c8b98d84cd1b53644d27cbbd225b5b46bb98d89202b"
)
EXPECTED_PLACE_IDS = {
    "bcn-2011131453",
    "bcn-249121118",
    "bcn-75990000684",
    "bcn-75990552606",
    "bcn-92086035490",
    "bcn-93316140842",
    "bcn-99117135915",
    "bcn-99400098833",
    "bcn-99400236720",
    "bcn-99400270325",
    "bcn-99400287783",
    "bcn-99400672437",
    "bcn-99400766080",
    "bcn-99400783086",
    "bcn-99400783087",
}


def test_committed_snapshot_manifest_and_provenance_are_consistent() -> None:
    repository = PlaceRepository(SNAPSHOT_PATH, MANIFEST_PATH).load()
    snapshot = repository.snapshot
    manifest = repository.manifest

    assert snapshot.schema_version == "1.0.0"
    assert snapshot.snapshot_id == "barcelona-climate-shelters-v1-2026-07-16"
    assert snapshot.publisher == OFFICIAL_PUBLISHER
    assert snapshot.dataset_url == OFFICIAL_DATASET_URL
    assert snapshot.distribution_url == OFFICIAL_DISTRIBUTION_URL
    assert snapshot.license == "CC BY 4.0"
    assert snapshot.license_url == CC_BY_4_LICENSE_URL
    assert "HeatRelay" in snapshot.attribution
    assert "normalized" in snapshot.attribution

    assert manifest.raw_sha256 == EXPECTED_RAW_SHA256
    assert hashlib.sha256(
        SNAPSHOT_PATH.read_bytes()
    ).hexdigest() == EXPECTED_NORMALIZED_SHA256
    assert manifest.normalized_sha256 == EXPECTED_NORMALIZED_SHA256
    assert manifest.input_count == 535
    assert manifest.selected_count == 15
    assert manifest.rejected_count == 520
    assert manifest.rejection_reasons == {
        "missing_summer_classification": 4,
        "not_selected_for_reviewed_snapshot": 516,
    }
    assert manifest.retrieved_at.isoformat() == "2026-07-16T19:08:41+00:00"
    assert (
        manifest.upstream_max_modified.isoformat()
        == "2026-07-09T14:05:12.962376+02:00"
    )


def test_committed_places_are_unique_bounded_and_source_backed() -> None:
    places = PlaceRepository(SNAPSHOT_PATH, MANIFEST_PATH).load().snapshot.places

    assert {place.place_id for place in places} == EXPECTED_PLACE_IDS
    assert len({place.source_record_id for place in places}) == 15
    assert sum(
        place.schedule_verification_status == "verified" for place in places
    ) == 12
    assert sum(
        place.schedule_verification_status == "unknown" for place in places
    ) == 3

    for place in places:
        assert place.place_id == f"bcn-{place.source_record_id}"
        assert 41.2 <= place.latitude <= 41.6
        assert 1.9 <= place.longitude <= 2.4
        assert place.source_url == OFFICIAL_DATASET_URL
        assert place.last_checked.isoformat() == "2026-07-16"
        if place.schedule_verification_status == "verified":
            assert place.opening_schedule is not None
        else:
            assert place.opening_schedule is None

    assert any(
        feature is None
        for place in places
        for feature in place.features.model_dump().values()
    )
