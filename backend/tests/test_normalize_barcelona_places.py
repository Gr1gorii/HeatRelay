import hashlib
import json
from copy import deepcopy

import httpx
import pytest

from scripts import normalize_barcelona_places as normalizer


def source_record(
    register_id: int,
    *,
    timetable_html: str = "<table><tr><td>09:00-17:00</td></tr></table>",
    timetable_id: int = 1,
    summer_label: str = normalizer.SUMMER_CLASSIFICATION_LABEL,
    classifications: list[dict[str, object]] | None = None,
    accessibility: dict[str, str] | None = None,
) -> dict[str, object]:
    source_classifications = [
        {
            "id": normalizer.SUMMER_CLASSIFICATION_ID,
            "name": summer_label,
        }
    ]
    if classifications:
        source_classifications.extend(classifications)

    return {
        "register_id": register_id,
        "name": "  Refugi\u0092 de prova \ufeff ",
        "modified": "2026-07-09T14:05:12.962376+02:00",
        "addresses": [
            {
                "main_address": True,
                "address_name": " Carrer de Prova ",
                "street_number_1": " 1 ",
                "zip_code": "08001",
                "town": "Barcelona",
                "district_name": "Ciutat Vella",
                "neighborhood_name": "el Raval",
                "hide_address": False,
            }
        ],
        "classifications_data": source_classifications,
        "geo_epgs_4326_latlon": {
            "lat": 41.38,
            "lon": 2.17,
        },
        "accessibility": accessibility,
        "values": [],
        "timetable": {
            "id": timetable_id,
            "html": timetable_html,
            "hide": False,
            "alert": "",
        },
    }


def non_summer_source_record(register_id: int) -> dict[str, object]:
    record = source_record(register_id)
    record["classifications_data"] = [
        {"id": 148414646, "name": "Xarxa de Refugis Climàtics d'Hivern"}
    ]
    return record


def reviewed_place(
    html: str,
    *,
    timetable_id: int = 1,
    verified: bool = True,
) -> normalizer.ReviewedPlace:
    opening_schedule = None
    status = "unknown"
    if verified:
        opening_schedule = normalizer.schedule(
            normalizer.season(
                "2026-06-01",
                "2026-09-30",
                [
                    normalizer.weekly_rule(
                        ["monday"],
                        [normalizer.interval("09:00", "17:00")],
                    )
                ],
            )
        )
        status = "verified"
    return normalizer.ReviewedPlace(
        timetable_id=timetable_id,
        timetable_sha256=hashlib.sha256(html.encode("utf-8")).hexdigest(),
        opening_schedule=opening_schedule,
        schedule_verification_status=status,
    )


def raw_json(records: list[dict[str, object]]) -> bytes:
    return json.dumps(records, ensure_ascii=False, separators=(",", ":")).encode()


def test_normalization_is_byte_identical_for_same_input() -> None:
    record = source_record(10)
    review = {10: reviewed_place(record["timetable"]["html"])}
    source = raw_json([record])

    first_snapshot, first_manifest = normalizer.normalize_source(
        source,
        "2026-07-16T19:08:41Z",
        reviewed_places=review,
        snapshot_id="test-snapshot",
    )
    second_snapshot, second_manifest = normalizer.normalize_source(
        source,
        "2026-07-16T19:08:41Z",
        reviewed_places=review,
        snapshot_id="test-snapshot",
    )

    assert normalizer.serialize_json(first_snapshot) == normalizer.serialize_json(
        second_snapshot
    )
    assert normalizer.serialize_json(first_manifest) == normalizer.serialize_json(
        second_manifest
    )


def test_duplicate_source_ids_fail_visibly() -> None:
    record = source_record(10)
    review = {10: reviewed_place(record["timetable"]["html"])}

    with pytest.raises(
        normalizer.SourceValidationError,
        match="Duplicate register_id 10",
    ):
        normalizer.normalize_source(
            raw_json([record, deepcopy(record)]),
            "2026-07-16T19:08:41Z",
            reviewed_places=review,
        )


@pytest.mark.parametrize(
    ("source", "message"),
    [
        (b'{"records":[]}', "Source root must be an array"),
        (
            raw_json(
                [
                    source_record(
                        10,
                        summer_label="Unexpected translated label",
                    )
                ]
            ),
            "Classification label mismatch for ID 148414647",
        ),
    ],
)
def test_source_structure_and_classification_label_are_validated(
    source: bytes,
    message: str,
) -> None:
    html = "<table><tr><td>09:00-17:00</td></tr></table>"
    review = {10: reviewed_place(html)}

    with pytest.raises(normalizer.SourceValidationError, match=message):
        normalizer.normalize_source(
            source,
            "2026-07-16T19:08:41Z",
            reviewed_places=review,
        )


def test_unknown_values_remain_null_and_encoding_artifacts_are_cleaned() -> None:
    record = source_record(10)
    review = {
        10: reviewed_place(
            record["timetable"]["html"],
            verified=False,
        )
    }

    snapshot, _ = normalizer.normalize_source(
        raw_json([record]),
        "2026-07-16T19:08:41Z",
        reviewed_places=review,
    )
    place = snapshot["places"][0]

    assert place["name"] == "Refugi’ de prova"
    assert place["accessibility"] is None
    assert place["features"] == {
        "indoor_space": None,
        "potable_water": None,
        "toilets": None,
        "micro_shelter": None,
        "pets_allowed": None,
    }
    assert place["opening_schedule"] is None
    assert place["schedule_verification_status"] == "unknown"


def test_explicit_negative_features_are_false_not_unknown() -> None:
    record = source_record(
        10,
        classifications=[
            {"id": 148414756, "name": "A l'aire lliure"},
            {"id": 148414823, "name": "Sense aigua per beure"},
            {"id": 110045, "name": "Sense lavabo"},
            {
                "id": 110173,
                "name": "No s'admeten animals de companyia",
            },
        ],
    )
    review = {10: reviewed_place(record["timetable"]["html"])}

    snapshot, _ = normalizer.normalize_source(
        raw_json([record]),
        "2026-07-16T19:08:41Z",
        reviewed_places=review,
    )

    assert snapshot["places"][0]["features"] == {
        "indoor_space": False,
        "potable_water": False,
        "toilets": False,
        "micro_shelter": None,
        "pets_allowed": False,
    }


def test_first_source_listed_information_url_is_retained() -> None:
    record = source_record(10)
    record["values"] = [
        {
            "attribute": 100003,
            "url_value": None,
        },
        {
            "attribute": 100003,
            "url_value": "https://example.test/general",
        },
        {
            "attribute": 100003,
            "url_value": "https://example.test/registrations",
        },
    ]
    review = {10: reviewed_place(record["timetable"]["html"])}

    snapshot, _ = normalizer.normalize_source(
        raw_json([record]),
        "2026-07-16T19:08:41Z",
        reviewed_places=review,
    )

    assert (
        snapshot["places"][0]["information_url"]
        == "https://example.test/general"
    )


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
def test_valid_information_url_is_retained_without_rewriting(
    retained_url: str,
) -> None:
    record = source_record(10)
    record["values"] = [
        {
            "attribute": 100003,
            "url_value": retained_url,
        }
    ]
    review = {10: reviewed_place(record["timetable"]["html"])}

    snapshot, _ = normalizer.normalize_source(
        raw_json([record]),
        "2026-07-16T19:08:41Z",
        reviewed_places=review,
    )

    assert snapshot["places"][0]["information_url"] == retained_url


def test_null_information_url_remains_absent() -> None:
    record = source_record(10)
    record["values"] = [
        {
            "attribute": 100003,
            "url_value": None,
        }
    ]
    review = {10: reviewed_place(record["timetable"]["html"])}

    snapshot, _ = normalizer.normalize_source(
        raw_json([record]),
        "2026-07-16T19:08:41Z",
        reviewed_places=review,
    )

    assert snapshot["places"][0]["information_url"] is None


def test_legacy_http_information_url_is_deterministically_nulled() -> None:
    record = source_record(10)
    record["values"] = [
        {
            "attribute": 100003,
            "url_value": "http://example.test/legacy-place",
        },
        {
            "attribute": 100003,
            "url_value": "https://example.test/later-place",
        },
    ]
    review = {10: reviewed_place(record["timetable"]["html"])}

    snapshot, _ = normalizer.normalize_source(
        raw_json([record]),
        "2026-07-16T19:08:41Z",
        reviewed_places=review,
    )

    assert snapshot["places"][0]["information_url"] is None


def test_hidden_reviewed_address_is_rejected() -> None:
    record = source_record(10)
    record["addresses"][0]["hide_address"] = True
    review = {10: reviewed_place(record["timetable"]["html"])}

    with pytest.raises(
        normalizer.SourceValidationError,
        match="address is hidden",
    ):
        normalizer.normalize_source(
            raw_json([record]),
            "2026-07-16T19:08:41Z",
            reviewed_places=review,
        )


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
def test_invalid_information_url_is_rejected(invalid_url: str) -> None:
    record = source_record(10)
    record["values"] = [
        {
            "attribute": 100003,
            "url_value": invalid_url,
        }
    ]
    review = {10: reviewed_place(record["timetable"]["html"])}

    with pytest.raises(
        normalizer.SourceValidationError,
        match="information URL",
    ):
        normalizer.normalize_source(
            raw_json([record]),
            "2026-07-16T19:08:41Z",
            reviewed_places=review,
        )


def test_place_outside_barcelona_pilot_bounds_is_rejected() -> None:
    record = source_record(10)
    record["geo_epgs_4326_latlon"]["lat"] = 40.7128
    review = {10: reviewed_place(record["timetable"]["html"])}

    with pytest.raises(
        normalizer.SourceValidationError,
        match="latitude is outside its valid range",
    ):
        normalizer.normalize_source(
            raw_json([record]),
            "2026-07-16T19:08:41Z",
            reviewed_places=review,
        )


def test_manifest_counts_hash_and_provenance_reconcile() -> None:
    selected = source_record(10)
    non_selected_summer = source_record(11)
    non_summer = non_summer_source_record(12)
    source = raw_json([selected, non_selected_summer, non_summer])
    review = {10: reviewed_place(selected["timetable"]["html"])}

    snapshot, manifest = normalizer.normalize_source(
        source,
        "2026-07-16T19:08:41+00:00",
        reviewed_places=review,
        snapshot_id="test-snapshot",
    )
    snapshot_bytes = normalizer.serialize_json(snapshot)

    assert manifest == {
        "schema_version": "1.0.0",
        "snapshot_id": "test-snapshot",
        "publisher": "Ajuntament de Barcelona",
        "dataset_url": normalizer.DATASET_URL,
        "distribution_url": normalizer.DISTRIBUTION_URL,
        "retrieved_at": "2026-07-16T19:08:41Z",
        "upstream_max_modified": "2026-07-09T14:05:12.962376+02:00",
        "license": "CC BY 4.0",
        "license_url": normalizer.LICENSE_URL,
        "raw_sha256": hashlib.sha256(source).hexdigest(),
        "normalized_sha256": hashlib.sha256(snapshot_bytes).hexdigest(),
        "input_count": 3,
        "selected_count": 1,
        "rejected_count": 2,
        "rejection_reasons": {
            "missing_summer_classification": 1,
            "not_selected_for_reviewed_snapshot": 1,
        },
        "attribution": normalizer.ATTRIBUTION,
    }


@pytest.mark.parametrize(
    ("change", "message"),
    [
        ({"hide": True}, "timetable is hidden"),
        ({"alert": "Tancat"}, "active timetable alert"),
        ({"html": "<table>changed</table>"}, "timetable content changed"),
    ],
)
def test_reviewed_timetable_must_still_match_source(
    change: dict[str, object],
    message: str,
) -> None:
    record = source_record(10)
    review = {10: reviewed_place(record["timetable"]["html"])}
    record["timetable"].update(change)

    with pytest.raises(normalizer.SourceValidationError, match=message):
        normalizer.normalize_source(
            raw_json([record]),
            "2026-07-16T19:08:41Z",
            reviewed_places=review,
        )


def test_default_reviewed_selection_is_bounded_and_excludes_restricted_pool() -> None:
    verified_count = sum(
        review.schedule_verification_status == "verified"
        for review in normalizer.REVIEWED_PLACES.values()
    )

    assert len(normalizer.REVIEWED_PLACES) == 15
    assert verified_count == 12
    assert 99400110882 not in normalizer.REVIEWED_PLACES


def test_download_source_uses_only_the_official_json_distribution() -> None:
    requests: list[httpx.Request] = []
    content = b'[{"official":true}]'

    def handler(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        return httpx.Response(
            200,
            content=content,
            headers={"content-type": "application/json"},
        )

    result = normalizer.download_source(
        timeout_seconds=7,
        transport=httpx.MockTransport(handler),
    )

    assert result == content
    assert len(requests) == 1
    assert requests[0].method == "GET"
    assert str(requests[0].url) == normalizer.DISTRIBUTION_URL
    assert requests[0].headers["user-agent"] == (
        "HeatRelay snapshot normalizer/1.0"
    )
    assert requests[0].extensions["timeout"] == {
        "connect": 7,
        "read": 7,
        "write": 7,
        "pool": 7,
    }
