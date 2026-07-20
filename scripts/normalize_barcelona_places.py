#!/usr/bin/env python3
"""Build the reviewed Barcelona climate-shelter snapshot.

The upstream JSON is intentionally not committed. This script validates the
official source, selects a small reviewed allowlist, and emits deterministic
snapshot and manifest files.
"""

from __future__ import annotations

import argparse
import hashlib
import ipaddress
import json
import os
import re
import tempfile
import unicodedata
from dataclasses import dataclass
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any, Mapping, Sequence
from urllib.parse import urlsplit

import httpx

ROOT = Path(__file__).resolve().parents[1]

SCHEMA_VERSION = "1.0.0"
SNAPSHOT_ID = "barcelona-climate-shelters-v1-2026-07-16"
PUBLISHER = "Ajuntament de Barcelona"
DATASET_URL = (
    "https://opendata-ajuntament.barcelona.cat/data/en/dataset/"
    "xarxa-refugis-climatics"
)
DISTRIBUTION_URL = (
    "https://opendata-ajuntament.barcelona.cat/data/dataset/"
    "8f9da263-ff41-4765-ab0d-61b97d7a00b2/resource/"
    "d88129fe-7aaa-4ae6-b9fd-908ad3f7480d/download"
)
LICENSE = "CC BY 4.0"
LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/"
ATTRIBUTION = (
    "Source: Ajuntament de Barcelona, “Climate shelters network in the city "
    "of Barcelona”, licensed under CC BY 4.0. HeatRelay selected and "
    "normalized a small reviewed subset; changes were made to structure, "
    "strings, feature states, and opening schedules."
)

SUMMER_CLASSIFICATION_ID = 148414647
SUMMER_CLASSIFICATION_LABEL = "Xarxa de Refugis Climàtics d'Estiu"

# These deliberately broad pilot bounds apply only to normalized official
# Barcelona place coordinates, never user origins or weather coordinates.
BARCELONA_PLACE_MIN_LATITUDE = 41.2
BARCELONA_PLACE_MAX_LATITUDE = 41.6
BARCELONA_PLACE_MIN_LONGITUDE = 1.9
BARCELONA_PLACE_MAX_LONGITUDE = 2.4

FEATURE_CLASSIFICATIONS = {
    "indoor_space": (148414564, 148414756),
    "potable_water": (148414755, 148414823),
    "toilets": (110044, 110045),
    "micro_shelter": (148414839, None),
    "pets_allowed": (110172, 110173),
}

EXPECTED_CLASSIFICATION_LABELS = {
    SUMMER_CLASSIFICATION_ID: SUMMER_CLASSIFICATION_LABEL,
    148414564: "Interior",
    148414756: "A l'aire lliure",
    148414755: "Amb aigua per beure",
    148414823: "Sense aigua per beure",
    110044: "Amb lavabos",
    110045: "Sense lavabo",
    148414839: "Microrefugis",
    110172: "S'admeten animals de companyia",
    110173: "No s'admeten animals de companyia",
}

ACCESSIBILITY_STATES = {
    "0010501001": (
        True,
        "Accessible per a persones amb discapacitat física",
    ),
    "0010501002": (
        False,
        "No accessible per a persones amb discapacitat física",
    ),
    "0010501019": (
        None,
        "Parcialment accessible per a persones amb discapacitat física",
    ),
}

WEEKDAYS = {
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
}

TIME_PATTERN = re.compile(r"^(?:[01][0-9]|2[0-3]):[0-5][0-9]$")
MALFORMED_PERCENT_ESCAPE_PATTERN = re.compile(r"%(?![0-9A-Fa-f]{2})")
HOST_LABEL_PATTERN = re.compile(
    r"^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$"
)
FORBIDDEN_URL_UNICODE_CATEGORIES = frozenset({"Cc", "Cf", "Cs"})

# Narrow Windows-1252 translations for C1 controls observed upstream.
CP1252_C1_TRANSLATION = {
    codepoint: bytes([codepoint]).decode("cp1252")
    for codepoint in range(0x80, 0xA0)
    if codepoint not in {0x81, 0x8D, 0x8F, 0x90, 0x9D}
}


class SourceValidationError(ValueError):
    """Raised when the official source no longer matches reviewed assumptions."""


@dataclass(frozen=True)
class ReviewedPlace:
    """Manual review evidence and normalized schedule for one source record."""

    timetable_id: int
    timetable_sha256: str
    opening_schedule: dict[str, Any] | None
    schedule_verification_status: str


def interval(opens: str, closes: str) -> dict[str, str]:
    """Return one normalized local-time interval."""

    return {"opens": opens, "closes": closes}


def weekly_rule(
    weekdays: Sequence[str],
    intervals: Sequence[dict[str, str]],
) -> dict[str, Any]:
    """Return one weekday rule with deterministic list ordering."""

    return {
        "weekdays": list(weekdays),
        "intervals": [dict(item) for item in intervals],
    }


def season(
    valid_from: str,
    valid_through: str,
    weekly_rules: Sequence[dict[str, Any]],
) -> dict[str, Any]:
    """Return one concrete 2026 schedule season."""

    return {
        "valid_from": valid_from,
        "valid_through": valid_through,
        "weekly_rules": [
            {
                "weekdays": list(rule["weekdays"]),
                "intervals": [dict(item) for item in rule["intervals"]],
            }
            for rule in weekly_rules
        ],
    }


def schedule(*seasons: dict[str, Any]) -> dict[str, Any]:
    """Return a verified Europe/Madrid opening schedule."""

    return {"timezone": "Europe/Madrid", "seasons": list(seasons)}


def _standard_civic_rules(
    weekday_intervals: Sequence[dict[str, str]],
    saturday_intervals: Sequence[dict[str, str]],
) -> list[dict[str, Any]]:
    rules = [
        weekly_rule(
            ["monday", "tuesday", "wednesday", "thursday", "friday"],
            weekday_intervals,
        )
    ]
    if saturday_intervals:
        rules.append(weekly_rule(["saturday"], saturday_intervals))
    return rules


REVIEWED_PLACES: dict[int, ReviewedPlace] = {
    93316140842: ReviewedPlace(
        timetable_id=6283,
        timetable_sha256=(
            "7c1ba9fd1e6282e0be09ea42ced0aaa9ed33cbf79a9a693a49aa6f480e501da0"
        ),
        opening_schedule=schedule(
            season(
                "2026-01-01",
                "2026-07-31",
                _standard_civic_rules(
                    [interval("09:00", "14:00"), interval("15:00", "21:00")],
                    [interval("10:00", "14:00")],
                ),
            ),
            season(
                "2026-08-01",
                "2026-08-31",
                [
                    weekly_rule(
                        [
                            "monday",
                            "tuesday",
                            "wednesday",
                            "thursday",
                            "friday",
                        ],
                        [
                            interval("09:00", "14:00"),
                            interval("15:00", "20:00"),
                        ],
                    )
                ],
            ),
            season(
                "2026-09-01",
                "2026-12-31",
                _standard_civic_rules(
                    [interval("09:00", "14:00"), interval("15:00", "21:00")],
                    [interval("10:00", "14:00")],
                ),
            ),
        ),
        schedule_verification_status="verified",
    ),
    92086035490: ReviewedPlace(
        timetable_id=5577,
        timetable_sha256=(
            "571811cf496cbfafdd61e32cf086d854fbfd00147a6e001a5d54954eb10929db"
        ),
        opening_schedule=schedule(
            season(
                "2026-01-01",
                "2026-07-31",
                _standard_civic_rules(
                    [interval("09:00", "14:00"), interval("16:00", "21:00")],
                    [interval("10:00", "14:00"), interval("16:00", "19:00")],
                ),
            ),
            season(
                "2026-08-01",
                "2026-08-31",
                [
                    weekly_rule(
                        [
                            "monday",
                            "tuesday",
                            "wednesday",
                            "thursday",
                            "friday",
                        ],
                        [interval("10:00", "15:00")],
                    )
                ],
            ),
            season(
                "2026-09-01",
                "2026-12-31",
                _standard_civic_rules(
                    [interval("09:00", "14:00"), interval("16:00", "21:00")],
                    [interval("10:00", "14:00"), interval("16:00", "19:00")],
                ),
            ),
        ),
        schedule_verification_status="verified",
    ),
    2011131453: ReviewedPlace(
        timetable_id=946,
        timetable_sha256=(
            "047bafb50a525cf5694e91ba48f980474bf3cfdd8eab4fea4bc866e0253a7713"
        ),
        opening_schedule=schedule(
            season(
                "2026-01-01",
                "2026-06-30",
                _standard_civic_rules(
                    [interval("09:00", "21:00")],
                    [interval("10:00", "14:00")],
                ),
            ),
            season(
                "2026-07-01",
                "2026-07-31",
                [
                    weekly_rule(
                        [
                            "monday",
                            "tuesday",
                            "wednesday",
                            "thursday",
                            "friday",
                        ],
                        [interval("09:00", "22:00")],
                    )
                ],
            ),
            season(
                "2026-09-01",
                "2026-09-30",
                [
                    weekly_rule(
                        [
                            "monday",
                            "tuesday",
                            "wednesday",
                            "thursday",
                            "friday",
                        ],
                        [interval("09:00", "22:00")],
                    )
                ],
            ),
            season(
                "2026-10-01",
                "2026-12-31",
                _standard_civic_rules(
                    [interval("09:00", "21:00")],
                    [interval("10:00", "14:00")],
                ),
            ),
        ),
        schedule_verification_status="verified",
    ),
    99117135915: ReviewedPlace(
        timetable_id=10987,
        timetable_sha256=(
            "3dc323715dce470924213173fbe04e8d703d28c761cdd771983336b820c719d8"
        ),
        opening_schedule=schedule(
            season(
                "2026-07-01",
                "2026-08-31",
                [
                    weekly_rule(
                        [
                            "monday",
                            "tuesday",
                            "wednesday",
                            "thursday",
                            "friday",
                        ],
                        [interval("09:00", "14:30")],
                    )
                ],
            )
        ),
        schedule_verification_status="verified",
    ),
    99400783086: ReviewedPlace(
        timetable_id=150792,
        timetable_sha256=(
            "601cdd016130b2c8b59666b507fb2696ae86fddc73f3f47eb0810261f417a9aa"
        ),
        opening_schedule=schedule(
            season(
                "2026-06-16",
                "2026-09-13",
                [
                    weekly_rule(
                        [
                            "tuesday",
                            "wednesday",
                            "thursday",
                            "friday",
                            "saturday",
                            "sunday",
                        ],
                        [interval("10:00", "20:00")],
                    )
                ],
            )
        ),
        schedule_verification_status="verified",
    ),
    99400783087: ReviewedPlace(
        timetable_id=150793,
        timetable_sha256=(
            "cdcf934c6748540a16eb4e3b22ba22acf37460f6e29a4cbaada60576cea9548a"
        ),
        opening_schedule=schedule(
            season(
                "2026-06-16",
                "2026-09-06",
                [
                    weekly_rule(
                        ["tuesday", "wednesday", "thursday", "friday"],
                        [interval("16:30", "19:30")],
                    ),
                    weekly_rule(
                        ["saturday"],
                        [
                            interval("11:00", "14:00"),
                            interval("16:30", "19:30"),
                        ],
                    ),
                ],
            )
        ),
        schedule_verification_status="verified",
    ),
    99400287783: ReviewedPlace(
        timetable_id=16377,
        timetable_sha256=(
            "23588d17bff86ead2b73752ac23f5ed1c7a62b6f30ef42fc5f9f15a2527ca91a"
        ),
        opening_schedule=schedule(
            season(
                "2026-06-24",
                "2026-07-31",
                [
                    weekly_rule(
                        ["monday", "friday"],
                        [interval("15:30", "20:00")],
                    ),
                    weekly_rule(
                        ["tuesday", "wednesday", "thursday"],
                        [
                            interval("09:30", "13:30"),
                            interval("15:30", "20:00"),
                        ],
                    ),
                ],
            ),
            season(
                "2026-09-01",
                "2026-09-24",
                [
                    weekly_rule(
                        ["monday", "friday"],
                        [interval("15:30", "20:00")],
                    ),
                    weekly_rule(
                        ["tuesday", "wednesday", "thursday"],
                        [
                            interval("09:30", "13:30"),
                            interval("15:30", "20:00"),
                        ],
                    ),
                ],
            ),
        ),
        schedule_verification_status="verified",
    ),
    99400236720: ReviewedPlace(
        timetable_id=15400,
        timetable_sha256=(
            "68716e28fa3330ff39fd00248f81bbb89f09d68a8c7d2ae4753689e5201455df"
        ),
        opening_schedule=schedule(
            season(
                "2026-06-24",
                "2026-09-24",
                [
                    weekly_rule(
                        ["monday", "wednesday"],
                        [interval("15:30", "20:00")],
                    ),
                    weekly_rule(
                        ["tuesday", "thursday", "friday"],
                        [
                            interval("09:30", "13:30"),
                            interval("15:30", "20:00"),
                        ],
                    ),
                ],
            )
        ),
        schedule_verification_status="verified",
    ),
    249121118: ReviewedPlace(
        timetable_id=394,
        timetable_sha256=(
            "9b5e7ea8d71a4b4a48f73b0be64d36ec40842caf778ae23dfba267868cbe24bc"
        ),
        opening_schedule=schedule(
            season(
                "2026-06-24",
                "2026-09-24",
                [
                    weekly_rule(
                        ["monday", "wednesday", "thursday"],
                        [
                            interval("09:30", "13:30"),
                            interval("15:30", "20:30"),
                        ],
                    ),
                    weekly_rule(
                        ["tuesday", "friday"],
                        [interval("09:30", "20:30")],
                    ),
                    weekly_rule(
                        ["saturday"],
                        [interval("10:00", "14:00")],
                    ),
                ],
            )
        ),
        schedule_verification_status="verified",
    ),
    99400098833: ReviewedPlace(
        timetable_id=12766,
        timetable_sha256=(
            "d1c5f38918123257bd6fc3a020e04b88da29360074c68900248aa18071eff258"
        ),
        opening_schedule=schedule(
            season(
                "2026-06-24",
                "2026-09-24",
                [
                    weekly_rule(
                        ["monday", "friday"],
                        [interval("15:00", "20:00")],
                    ),
                    weekly_rule(
                        ["tuesday", "thursday"],
                        [
                            interval("09:30", "13:30"),
                            interval("15:00", "20:00"),
                        ],
                    ),
                    weekly_rule(
                        ["wednesday"],
                        [interval("09:30", "20:00")],
                    ),
                ],
            )
        ),
        schedule_verification_status="verified",
    ),
    99400270325: ReviewedPlace(
        timetable_id=15974,
        timetable_sha256=(
            "c6e1ef32ceeb7df72e737eb6d2136b181dda41354faca102495324915d891297"
        ),
        opening_schedule=schedule(
            season(
                "2026-06-24",
                "2026-09-24",
                [
                    weekly_rule(
                        ["monday", "tuesday", "wednesday", "thursday"],
                        [
                            interval("09:30", "13:30"),
                            interval("15:30", "20:30"),
                        ],
                    ),
                    weekly_rule(
                        ["friday"],
                        [interval("09:30", "20:30")],
                    ),
                    weekly_rule(
                        ["saturday"],
                        [interval("10:00", "14:00")],
                    ),
                ],
            )
        ),
        schedule_verification_status="verified",
    ),
    99400672437: ReviewedPlace(
        timetable_id=117179,
        timetable_sha256=(
            "4013ee79e3048634db414775c58b5b8681798d66b298d7aa4c6c424cf7fc9e35"
        ),
        opening_schedule=schedule(
            season(
                "2026-06-24",
                "2026-09-24",
                [
                    weekly_rule(
                        ["monday", "thursday"],
                        [interval("15:30", "20:00")],
                    ),
                    weekly_rule(
                        ["tuesday", "wednesday"],
                        [
                            interval("09:30", "13:30"),
                            interval("15:30", "20:00"),
                        ],
                    ),
                    weekly_rule(
                        ["friday"],
                        [interval("09:30", "20:00")],
                    ),
                ],
            )
        ),
        schedule_verification_status="verified",
    ),
    75990552606: ReviewedPlace(
        timetable_id=3083,
        timetable_sha256=(
            "b88b3f83688a8554835d0f21e0dc9f470f697b88ae5fb9f5e3c558857b4e8683"
        ),
        opening_schedule=None,
        schedule_verification_status="unknown",
    ),
    75990000684: ReviewedPlace(
        timetable_id=1054,
        timetable_sha256=(
            "df6025342a67cbc7421f2f77c661ace9da92e3578b4b8b455492d0f4b1b1e969"
        ),
        opening_schedule=None,
        schedule_verification_status="unknown",
    ),
    99400766080: ReviewedPlace(
        timetable_id=136865,
        timetable_sha256=(
            "3a4e4c4d5ee36fb0c02b7d68de33933370a89afa02e706718a60c91a160208c0"
        ),
        opening_schedule=None,
        schedule_verification_status="unknown",
    ),
}


def normalize_string(value: str | None) -> str | None:
    """Normalize source text without fabricating absent values."""

    if value is None:
        return None
    if not isinstance(value, str):
        raise SourceValidationError("Expected a string or null value.")

    translated = value.translate(CP1252_C1_TRANSLATION)
    cleaned_characters: list[str] = []
    for character in translated:
        if character in {"\ufeff", "\u200b", "\u2060"}:
            continue
        category = unicodedata.category(character)
        if category in {"Cc", "Cf"}:
            cleaned_characters.append(" ")
        else:
            cleaned_characters.append(character)

    normalized = unicodedata.normalize("NFC", "".join(cleaned_characters))
    collapsed = " ".join(normalized.split())
    return collapsed or None


def parse_retrieved_at(value: str) -> tuple[datetime, str]:
    """Parse an explicit UTC retrieval timestamp into a canonical string."""

    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as error:
        raise SourceValidationError(
            "--retrieved-at must be an ISO 8601 UTC timestamp."
        ) from error

    if parsed.tzinfo is None or parsed.utcoffset() != timezone.utc.utcoffset(parsed):
        raise SourceValidationError("--retrieved-at must include the UTC offset.")

    parsed_utc = parsed.astimezone(timezone.utc)
    canonical = parsed_utc.isoformat(timespec="seconds").replace("+00:00", "Z")
    return parsed_utc, canonical


def parse_source_datetime(value: Any, field_name: str) -> datetime:
    """Parse one required timezone-aware source datetime."""

    if not isinstance(value, str):
        raise SourceValidationError(f"{field_name} must be a string.")
    try:
        parsed = datetime.fromisoformat(value)
    except ValueError as error:
        raise SourceValidationError(f"{field_name} is not valid ISO 8601.") from error
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        raise SourceValidationError(f"{field_name} must include a timezone.")
    return parsed


def classification_ids(record: Mapping[str, Any]) -> set[int]:
    """Validate and return classification IDs for one source record."""

    classifications = record.get("classifications_data")
    if not isinstance(classifications, list):
        raise SourceValidationError("classifications_data must be an array.")

    identifiers: set[int] = set()
    summer_matches = 0
    for classification in classifications:
        if not isinstance(classification, dict):
            raise SourceValidationError(
                "Each classifications_data entry must be an object."
            )
        identifier = classification.get("id")
        label = classification.get("name")
        if isinstance(identifier, bool) or not isinstance(identifier, int):
            raise SourceValidationError("Classification IDs must be integers.")
        if not isinstance(label, str):
            raise SourceValidationError("Classification names must be strings.")
        identifiers.add(identifier)
        expected_label = EXPECTED_CLASSIFICATION_LABELS.get(identifier)
        if (
            expected_label is not None
            and normalize_string(label) != expected_label
        ):
            raise SourceValidationError(
                f"Classification label mismatch for ID {identifier}."
            )
        if identifier == SUMMER_CLASSIFICATION_ID:
            summer_matches += 1

    if summer_matches > 1:
        raise SourceValidationError(
            f"Classification ID {SUMMER_CLASSIFICATION_ID} appears more than once."
        )
    return identifiers


def validate_record_structure(record: Any, index: int) -> tuple[int, datetime]:
    """Validate the source fields required by normalization."""

    if not isinstance(record, dict):
        raise SourceValidationError(f"Record {index} must be an object.")

    register_id = record.get("register_id")
    if isinstance(register_id, bool) or not isinstance(register_id, int):
        raise SourceValidationError(f"Record {index} register_id must be an integer.")
    if register_id <= 0:
        raise SourceValidationError(f"Record {index} register_id must be positive.")

    name = record.get("name")
    if not isinstance(name, str) or normalize_string(name) is None:
        raise SourceValidationError(f"Record {register_id} has no valid name.")

    modified = parse_source_datetime(
        record.get("modified"),
        f"Record {register_id} modified",
    )

    addresses = record.get("addresses")
    if not isinstance(addresses, list):
        raise SourceValidationError(f"Record {register_id} addresses must be an array.")

    coordinates = record.get("geo_epgs_4326_latlon")
    if not isinstance(coordinates, dict):
        raise SourceValidationError(
            f"Record {register_id} geo_epgs_4326_latlon must be an object."
        )

    accessibility = record.get("accessibility")
    if accessibility is not None and not isinstance(accessibility, dict):
        raise SourceValidationError(
            f"Record {register_id} accessibility must be an object or null."
        )

    values = record.get("values")
    if not isinstance(values, list):
        raise SourceValidationError(f"Record {register_id} values must be an array.")

    timetable = record.get("timetable")
    if timetable is not None and not isinstance(timetable, dict):
        raise SourceValidationError(
            f"Record {register_id} timetable must be an object or null."
        )

    classification_ids(record)
    return register_id, modified


def validate_schedule(review: ReviewedPlace) -> None:
    """Validate the manually reviewed schedule constant."""

    if review.schedule_verification_status not in {
        "verified",
        "unknown",
        "ambiguous",
    }:
        raise SourceValidationError("Invalid schedule verification status.")

    if review.schedule_verification_status == "verified":
        if review.opening_schedule is None:
            raise SourceValidationError("Verified schedules cannot be null.")
    elif review.opening_schedule is not None:
        raise SourceValidationError(
            "Unknown or ambiguous schedules must not include opening intervals."
        )

    if review.opening_schedule is None:
        return
    if review.opening_schedule.get("timezone") != "Europe/Madrid":
        raise SourceValidationError("Opening schedule timezone must be Europe/Madrid.")

    seasons = review.opening_schedule.get("seasons")
    if not isinstance(seasons, list) or not seasons:
        raise SourceValidationError("Verified schedules must contain seasons.")

    previous_valid_through: date | None = None
    for schedule_season in seasons:
        if not isinstance(schedule_season, dict):
            raise SourceValidationError("Schedule seasons must be objects.")
        try:
            valid_from = date.fromisoformat(schedule_season["valid_from"])
            valid_through = date.fromisoformat(schedule_season["valid_through"])
        except (KeyError, TypeError, ValueError) as error:
            raise SourceValidationError("Schedule dates must be ISO dates.") from error
        if valid_from > valid_through:
            raise SourceValidationError("Schedule season starts after it ends.")
        if previous_valid_through is not None and valid_from <= previous_valid_through:
            raise SourceValidationError("Schedule seasons must not overlap.")
        previous_valid_through = valid_through

        rules = schedule_season.get("weekly_rules")
        if not isinstance(rules, list) or not rules:
            raise SourceValidationError("Schedule seasons must contain weekly rules.")

        seen_weekdays: set[str] = set()
        for rule in rules:
            if not isinstance(rule, dict):
                raise SourceValidationError("Weekly rules must be objects.")
            weekdays = rule.get("weekdays")
            intervals = rule.get("intervals")
            if not isinstance(weekdays, list) or not weekdays:
                raise SourceValidationError("Weekly rules must contain weekdays.")
            if not isinstance(intervals, list) or not intervals:
                raise SourceValidationError("Weekly rules must contain intervals.")
            for weekday in weekdays:
                if weekday not in WEEKDAYS:
                    raise SourceValidationError(f"Unknown weekday {weekday!r}.")
                if weekday in seen_weekdays:
                    raise SourceValidationError(
                        "A weekday appears in more than one rule in a season."
                    )
                seen_weekdays.add(weekday)
            for opening_interval in intervals:
                if not isinstance(opening_interval, dict):
                    raise SourceValidationError("Intervals must be objects.")
                opens = opening_interval.get("opens")
                closes = opening_interval.get("closes")
                if (
                    not isinstance(opens, str)
                    or not isinstance(closes, str)
                    or TIME_PATTERN.fullmatch(opens) is None
                    or TIME_PATTERN.fullmatch(closes) is None
                ):
                    raise SourceValidationError(
                        "Opening intervals must use exact HH:MM values."
                    )
                if opens == closes:
                    raise SourceValidationError(
                        "Opening and closing times cannot be identical."
                    )


def validate_reviewed_places(
    reviewed_places: Mapping[int, ReviewedPlace],
    *,
    enforce_milestone_selection: bool,
) -> None:
    """Validate manual review metadata before reading the source."""

    if not reviewed_places:
        raise SourceValidationError("The reviewed place allowlist is empty.")
    for register_id, review in reviewed_places.items():
        if isinstance(register_id, bool) or not isinstance(register_id, int):
            raise SourceValidationError("Reviewed register IDs must be integers.")
        if not re.fullmatch(r"[0-9a-f]{64}", review.timetable_sha256):
            raise SourceValidationError("Timetable hashes must be lowercase SHA-256.")
        validate_schedule(review)

    if enforce_milestone_selection:
        verified_count = sum(
            review.schedule_verification_status == "verified"
            for review in reviewed_places.values()
        )
        if len(reviewed_places) != 15 or verified_count < 12:
            raise SourceValidationError(
                "Milestone 1 requires 15 reviewed places and at least "
                "12 verified 2026 schedules."
            )
        if 99400110882 in reviewed_places:
            raise SourceValidationError(
                "Restricted-subscriber pool 99400110882 must not be selected."
            )


def validate_timetable(
    record: Mapping[str, Any],
    review: ReviewedPlace,
    register_id: int,
) -> None:
    """Require the exact timetable that was manually reviewed."""

    timetable = record.get("timetable")
    if not isinstance(timetable, dict):
        raise SourceValidationError(
            f"Reviewed record {register_id} has no timetable object."
        )
    if timetable.get("id") != review.timetable_id:
        raise SourceValidationError(
            f"Reviewed record {register_id} timetable ID changed."
        )
    if timetable.get("hide") is not False:
        raise SourceValidationError(
            f"Reviewed record {register_id} timetable is hidden."
        )
    alert = normalize_string(timetable.get("alert"))
    if alert is not None:
        raise SourceValidationError(
            f"Reviewed record {register_id} has an active timetable alert."
        )
    html = timetable.get("html")
    if not isinstance(html, str) or not html:
        raise SourceValidationError(
            f"Reviewed record {register_id} timetable HTML is missing."
        )
    actual_hash = hashlib.sha256(html.encode("utf-8")).hexdigest()
    if actual_hash != review.timetable_sha256:
        raise SourceValidationError(
            f"Reviewed record {register_id} timetable content changed."
        )


def choose_address(record: Mapping[str, Any], register_id: int) -> Mapping[str, Any]:
    """Return the single reviewed main address."""

    addresses = record["addresses"]
    if len(addresses) != 1 or not isinstance(addresses[0], dict):
        raise SourceValidationError(
            f"Reviewed record {register_id} must have exactly one address."
        )
    address = addresses[0]
    if address.get("main_address") is not True:
        raise SourceValidationError(
            f"Reviewed record {register_id} address is not marked as main."
        )
    if address.get("hide_address") is not False:
        raise SourceValidationError(
            f"Reviewed record {register_id} address is hidden or its "
            "visibility is unknown."
        )
    return address


def normalize_coordinate(
    value: Any,
    *,
    minimum: float,
    maximum: float,
    field_name: str,
) -> float:
    """Validate and normalize one coordinate."""

    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise SourceValidationError(f"{field_name} must be numeric.")
    normalized = float(value)
    if not minimum <= normalized <= maximum:
        raise SourceValidationError(f"{field_name} is outside its valid range.")
    return normalized


def normalize_accessibility(
    record: Mapping[str, Any],
    classifications: set[int],
) -> bool | None:
    """Map the structured source accessibility state conservatively."""

    accessibility = record.get("accessibility")
    if accessibility is None:
        return None
    identifier = accessibility.get("id")
    text = normalize_string(accessibility.get("text"))
    if identifier not in ACCESSIBILITY_STATES:
        raise SourceValidationError(
            f"Unknown accessibility identifier {identifier!r}."
        )
    state, expected_text = ACCESSIBILITY_STATES[identifier]
    if text != expected_text:
        raise SourceValidationError(
            f"Accessibility label mismatch for identifier {identifier}."
        )

    has_accessible = 105001 in classifications
    has_not_accessible = 105002 in classifications
    has_partial = 105019 in classifications
    if sum([has_accessible, has_not_accessible, has_partial]) > 1:
        return None
    if state is True and has_not_accessible:
        return None
    if state is False and has_accessible:
        return None
    return state


def normalize_feature(
    classifications: set[int],
    true_identifier: int,
    false_identifier: int | None,
) -> bool | None:
    """Map one three-state source feature without treating absence as false."""

    has_true = true_identifier in classifications
    has_false = false_identifier is not None and false_identifier in classifications
    if has_true and has_false:
        return None
    if has_true:
        return True
    if has_false:
        return False
    return None


def information_url(record: Mapping[str, Any], register_id: int) -> str | None:
    """Return the first source-listed optional Web attribute."""

    first_url: str | None = None
    found_url = False
    for value in record["values"]:
        if not isinstance(value, dict):
            raise SourceValidationError(
                f"Record {register_id} values entries must be objects."
            )
        if value.get("attribute") != 100003:
            continue
        raw_url = value.get("url_value")
        if raw_url is None:
            continue
        validated_url = validate_information_url(raw_url, register_id)
        if not found_url:
            first_url = validated_url
            found_url = True
    return first_url


def validate_information_url(value: Any, register_id: int) -> str | None:
    """Validate one source URL, retaining HTTPS and nulling legacy HTTP."""

    if not isinstance(value, str) or not value:
        raise SourceValidationError(
            f"Record {register_id} information URL must be a nonempty string."
        )
    if any(
        character.isspace()
        or unicodedata.category(character)
        in FORBIDDEN_URL_UNICODE_CATEGORIES
        for character in value
    ):
        raise SourceValidationError(
            f"Record {register_id} information URL contains whitespace "
            "or control characters."
        )
    if MALFORMED_PERCENT_ESCAPE_PATTERN.search(value) is not None:
        raise SourceValidationError(
            f"Record {register_id} information URL contains a malformed "
            "percent escape."
        )

    try:
        parsed = urlsplit(value)
        hostname = parsed.hostname
        port = parsed.port
    except (UnicodeError, ValueError) as error:
        raise SourceValidationError(
            f"Record {register_id} information URL is invalid."
        ) from error

    if (
        parsed.scheme not in {"http", "https"}
        or not parsed.netloc
        or hostname is None
    ):
        raise SourceValidationError(
            f"Record {register_id} information URL must be an absolute "
            "HTTP(S) URL."
        )
    if parsed.username is not None or parsed.password is not None:
        raise SourceValidationError(
            f"Record {register_id} information URL must not contain "
            "credentials."
        )

    validate_information_url_port(
        parsed.netloc,
        hostname,
        port,
        register_id,
    )
    validate_information_url_hostname(
        parsed.netloc,
        hostname,
        register_id,
    )
    if parsed.scheme == "http":
        return None
    return value


def validate_information_url_port(
    netloc: str,
    hostname: str,
    port: int | None,
    register_id: int,
) -> None:
    """Reject ports that urllib accepts after repairing their syntax."""

    port_text: str | None = None
    if ":" in hostname:
        if not netloc.startswith("["):
            raise SourceValidationError(
                f"Record {register_id} information URL has invalid IPv6 syntax."
            )
        closing_bracket = netloc.find("]")
        suffix = netloc[closing_bracket + 1 :]
        if suffix:
            if not suffix.startswith(":"):
                raise SourceValidationError(
                    f"Record {register_id} information URL has an invalid port."
                )
            port_text = suffix[1:]
    elif ":" in netloc:
        _, _, port_text = netloc.rpartition(":")

    if port_text is None:
        if port is not None:
            raise SourceValidationError(
                f"Record {register_id} information URL has an invalid port."
            )
        return
    if re.fullmatch(r"[0-9]+", port_text) is None:
        raise SourceValidationError(
            f"Record {register_id} information URL has an invalid port."
        )
    if port is None or not 1 <= port <= 65535:
        raise SourceValidationError(
            f"Record {register_id} information URL port must be between "
            "1 and 65535."
        )


def validate_information_url_hostname(
    netloc: str,
    hostname: str,
    register_id: int,
) -> None:
    """Require an IP address or a syntactically valid DNS hostname."""

    if "%" in hostname or "\\" in hostname:
        raise SourceValidationError(
            f"Record {register_id} information URL has an invalid hostname."
        )

    if ":" in hostname:
        if not netloc.startswith("["):
            raise SourceValidationError(
                f"Record {register_id} information URL has invalid IPv6 syntax."
            )
        try:
            ipaddress.IPv6Address(hostname)
        except ValueError as error:
            raise SourceValidationError(
                f"Record {register_id} information URL has an invalid hostname."
            ) from error
        return

    hostname_without_trailing_dot = (
        hostname[:-1] if hostname.endswith(".") else hostname
    )
    if not hostname_without_trailing_dot:
        raise SourceValidationError(
            f"Record {register_id} information URL has an invalid hostname."
        )

    try:
        ipaddress.IPv4Address(hostname)
        return
    except ValueError:
        if is_ambiguous_numeric_hostname(hostname_without_trailing_dot):
            raise SourceValidationError(
                f"Record {register_id} information URL must use canonical "
                "dotted-decimal IPv4."
            )

    try:
        ascii_hostname = hostname_without_trailing_dot.encode("idna").decode(
            "ascii"
        )
    except UnicodeError as error:
        raise SourceValidationError(
            f"Record {register_id} information URL has an invalid hostname."
        ) from error
    ascii_hostname_without_trailing_dot = (
        ascii_hostname[:-1] if ascii_hostname.endswith(".") else ascii_hostname
    )
    if not ascii_hostname_without_trailing_dot:
        raise SourceValidationError(
            f"Record {register_id} information URL has an invalid hostname."
        )
    try:
        ipaddress.IPv4Address(ascii_hostname_without_trailing_dot)
    except ValueError:
        if is_ambiguous_numeric_hostname(
            ascii_hostname_without_trailing_dot
        ):
            raise SourceValidationError(
                f"Record {register_id} information URL must use canonical "
                "dotted-decimal IPv4."
            )
    else:
        raise SourceValidationError(
            f"Record {register_id} information URL must not use Unicode "
            "characters that map to an IPv4 address."
        )

    labels = ascii_hostname_without_trailing_dot.split(".")
    if len(ascii_hostname_without_trailing_dot) > 253 or any(
        HOST_LABEL_PATTERN.fullmatch(label) is None for label in labels
    ):
        raise SourceValidationError(
            f"Record {register_id} information URL has an invalid hostname."
        )
    validate_idna_alabels(labels, register_id)


def is_ambiguous_numeric_hostname(hostname: str) -> bool:
    """Return whether a hostname resembles a legacy numeric IPv4 form."""

    labels = hostname.split(".")
    if not 1 <= len(labels) <= 4:
        return False
    if all(re.fullmatch(r"[0-9]+", label) is not None for label in labels):
        return True
    numeric_component_pattern = re.compile(r"(?:[0-9]+|0[xX][0-9A-Fa-f]+)")
    return (
        all(
            numeric_component_pattern.fullmatch(label) is not None
            for label in labels
        )
        and any(label.lower().startswith("0x") for label in labels)
    )


def validate_idna_alabels(labels: list[str], register_id: int) -> None:
    """Require every IDNA A-label to decode and encode losslessly."""

    for label in labels:
        lowercase_label = label.lower()
        if not lowercase_label.startswith("xn--"):
            continue
        try:
            decoded_label = lowercase_label.encode("ascii").decode("idna")
            round_tripped_label = decoded_label.encode("idna").decode("ascii")
        except UnicodeError as error:
            raise SourceValidationError(
                f"Record {register_id} information URL has an invalid "
                "IDNA hostname."
            ) from error
        if round_tripped_label.lower() != lowercase_label:
            raise SourceValidationError(
                f"Record {register_id} information URL IDNA hostname "
                "does not round-trip."
            )


def normalize_place(
    record: Mapping[str, Any],
    review: ReviewedPlace,
    retrieved_date: date,
) -> dict[str, Any]:
    """Normalize one manually reviewed place."""

    register_id = record["register_id"]
    classifications = classification_ids(record)
    if SUMMER_CLASSIFICATION_ID not in classifications:
        raise SourceValidationError(
            f"Reviewed record {register_id} is not a summer climate shelter."
        )

    validate_timetable(record, review, register_id)
    address = choose_address(record, register_id)
    coordinates = record["geo_epgs_4326_latlon"]

    return {
        "place_id": f"bcn-{register_id}",
        "source_record_id": str(register_id),
        "name": normalize_string(record["name"]),
        "address": {
            "street": normalize_string(address.get("address_name")),
            "number": normalize_string(address.get("street_number_1")),
            "postal_code": normalize_string(address.get("zip_code")),
            "city": normalize_string(address.get("town")),
        },
        "district": normalize_string(address.get("district_name")),
        "neighborhood": normalize_string(address.get("neighborhood_name")),
        "latitude": normalize_coordinate(
            coordinates.get("lat"),
            minimum=BARCELONA_PLACE_MIN_LATITUDE,
            maximum=BARCELONA_PLACE_MAX_LATITUDE,
            field_name=f"Record {register_id} latitude",
        ),
        "longitude": normalize_coordinate(
            coordinates.get("lon"),
            minimum=BARCELONA_PLACE_MIN_LONGITUDE,
            maximum=BARCELONA_PLACE_MAX_LONGITUDE,
            field_name=f"Record {register_id} longitude",
        ),
        "source_modified_at": record["modified"],
        "accessibility": normalize_accessibility(record, classifications),
        "features": {
            feature_name: normalize_feature(
                classifications,
                true_identifier,
                false_identifier,
            )
            for feature_name, (
                true_identifier,
                false_identifier,
            ) in FEATURE_CLASSIFICATIONS.items()
        },
        "information_url": information_url(record, register_id),
        "opening_schedule": review.opening_schedule,
        "schedule_verification_status": review.schedule_verification_status,
        "last_checked": retrieved_date.isoformat(),
        "source_url": DATASET_URL,
    }


def serialize_json(document: Mapping[str, Any]) -> bytes:
    """Serialize a document deterministically as UTF-8 JSON."""

    return (
        json.dumps(
            document,
            ensure_ascii=False,
            indent=2,
            sort_keys=True,
            separators=(",", ": "),
        )
        + "\n"
    ).encode("utf-8")


def normalize_source(
    raw_bytes: bytes,
    retrieved_at: str,
    *,
    reviewed_places: Mapping[int, ReviewedPlace] | None = None,
    snapshot_id: str = SNAPSHOT_ID,
) -> tuple[dict[str, Any], dict[str, Any]]:
    """Normalize raw official JSON into snapshot and manifest documents."""

    reviews = REVIEWED_PLACES if reviewed_places is None else reviewed_places
    validate_reviewed_places(
        reviews,
        enforce_milestone_selection=reviewed_places is None,
    )
    retrieved_datetime, canonical_retrieved_at = parse_retrieved_at(retrieved_at)

    try:
        source = json.loads(raw_bytes.decode("utf-8-sig"))
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise SourceValidationError("Source is not valid UTF-8 JSON.") from error
    if not isinstance(source, list):
        raise SourceValidationError("Source root must be an array.")
    if not source:
        raise SourceValidationError("Source array must not be empty.")

    records_by_id: dict[int, Mapping[str, Any]] = {}
    source_modified: list[tuple[datetime, str]] = []
    summer_count = 0

    for index, record in enumerate(source):
        register_id, modified = validate_record_structure(record, index)
        if register_id in records_by_id:
            raise SourceValidationError(
                f"Duplicate register_id {register_id} in source."
            )
        records_by_id[register_id] = record
        source_modified.append((modified, record["modified"]))
        if SUMMER_CLASSIFICATION_ID in classification_ids(record):
            summer_count += 1

    missing_reviewed_ids = sorted(set(reviews) - set(records_by_id))
    if missing_reviewed_ids:
        raise SourceValidationError(
            "Reviewed source records are missing: "
            + ", ".join(str(item) for item in missing_reviewed_ids)
        )

    places = [
        normalize_place(
            records_by_id[register_id],
            reviews[register_id],
            retrieved_datetime.date(),
        )
        for register_id in sorted(reviews)
    ]
    places.sort(key=lambda place: place["place_id"])

    snapshot = {
        "schema_version": SCHEMA_VERSION,
        "snapshot_id": snapshot_id,
        "publisher": PUBLISHER,
        "dataset_url": DATASET_URL,
        "distribution_url": DISTRIBUTION_URL,
        "license": LICENSE,
        "license_url": LICENSE_URL,
        "attribution": ATTRIBUTION,
        "places": places,
    }
    snapshot_bytes = serialize_json(snapshot)

    input_count = len(source)
    selected_count = len(places)
    missing_summer_classification = input_count - summer_count
    not_selected_for_reviewed_snapshot = summer_count - selected_count
    if not_selected_for_reviewed_snapshot < 0:
        raise SourceValidationError(
            "Reviewed selection exceeds summer-classified source records."
        )
    rejected_count = input_count - selected_count
    rejection_reasons = {
        "missing_summer_classification": missing_summer_classification,
        "not_selected_for_reviewed_snapshot": (
            not_selected_for_reviewed_snapshot
        ),
    }
    if sum(rejection_reasons.values()) != rejected_count:
        raise SourceValidationError("Manifest rejection counts do not reconcile.")

    upstream_max_modified = max(source_modified, key=lambda item: item[0])[1]
    manifest = {
        "schema_version": SCHEMA_VERSION,
        "snapshot_id": snapshot_id,
        "publisher": PUBLISHER,
        "dataset_url": DATASET_URL,
        "distribution_url": DISTRIBUTION_URL,
        "retrieved_at": canonical_retrieved_at,
        "upstream_max_modified": upstream_max_modified,
        "license": LICENSE,
        "license_url": LICENSE_URL,
        "raw_sha256": hashlib.sha256(raw_bytes).hexdigest(),
        "normalized_sha256": hashlib.sha256(snapshot_bytes).hexdigest(),
        "input_count": input_count,
        "selected_count": selected_count,
        "rejected_count": rejected_count,
        "rejection_reasons": rejection_reasons,
        "attribution": ATTRIBUTION,
    }
    return snapshot, manifest


def download_source(
    timeout_seconds: float = 60,
    *,
    transport: httpx.BaseTransport | None = None,
) -> bytes:
    """Download the official JSON distribution without persisting the raw file."""

    try:
        with httpx.Client(
            timeout=httpx.Timeout(timeout_seconds),
            follow_redirects=False,
            transport=transport,
        ) as client:
            with client.stream(
                "GET",
                DISTRIBUTION_URL,
                headers={"User-Agent": "HeatRelay snapshot normalizer/1.0"},
            ) as response:
                if not 200 <= response.status_code < 300:
                    raise SourceValidationError(
                        "Official Barcelona JSON returned a non-success status."
                    )
                chunks: list[bytes] = []
                total_size = 0
                for chunk in response.iter_bytes(1024 * 1024):
                    total_size += len(chunk)
                    if total_size > 100 * 1024 * 1024:
                        raise SourceValidationError(
                            "Official JSON exceeded the 100 MiB safety limit."
                        )
                    chunks.append(chunk)
    except httpx.HTTPError as error:
        raise SourceValidationError(
            "Could not download the official Barcelona JSON distribution."
        ) from error
    return b"".join(chunks)


def write_bytes(path: Path, content: bytes) -> None:
    """Write bytes atomically within the destination directory."""

    path.parent.mkdir(parents=True, exist_ok=True)
    file_descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{path.name}.",
        dir=path.parent,
    )
    try:
        with os.fdopen(file_descriptor, "wb") as temporary_file:
            temporary_file.write(content)
            temporary_file.flush()
            os.fsync(temporary_file.fileno())
        os.replace(temporary_name, path)
    finally:
        if os.path.exists(temporary_name):
            os.unlink(temporary_name)


def build_parser() -> argparse.ArgumentParser:
    """Build the command-line interface."""

    parser = argparse.ArgumentParser(
        description=(
            "Normalize the official Barcelona climate-shelter JSON into the "
            "reviewed HeatRelay v1 snapshot."
        )
    )
    source_group = parser.add_mutually_exclusive_group(required=True)
    source_group.add_argument(
        "--input",
        type=Path,
        help="Path to an already downloaded official JSON distribution.",
    )
    source_group.add_argument(
        "--download",
        action="store_true",
        help="Download the official JSON distribution in memory.",
    )
    parser.add_argument(
        "--retrieved-at",
        required=True,
        help="Explicit ISO 8601 UTC retrieval time, for example 2026-07-16T19:08:41Z.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=ROOT / "data" / "barcelona" / "climate_shelters.v1.json",
        help="Normalized snapshot output path.",
    )
    parser.add_argument(
        "--manifest-output",
        type=Path,
        default=(
            ROOT
            / "data"
            / "barcelona"
            / "climate_shelters.v1.manifest.json"
        ),
        help="Snapshot manifest output path.",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    """Run the normalization command."""

    parser = build_parser()
    arguments = parser.parse_args(argv)

    try:
        if arguments.download:
            raw_bytes = download_source()
        else:
            raw_bytes = arguments.input.read_bytes()
        snapshot, manifest = normalize_source(
            raw_bytes,
            arguments.retrieved_at,
        )
        snapshot_bytes = serialize_json(snapshot)
        manifest_bytes = serialize_json(manifest)
        write_bytes(arguments.output, snapshot_bytes)
        write_bytes(arguments.manifest_output, manifest_bytes)
    except (OSError, SourceValidationError) as error:
        parser.exit(1, f"error: {error}\n")

    print(
        f"Wrote {len(snapshot['places'])} reviewed places to {arguments.output}",
        flush=True,
    )
    print(f"Wrote manifest to {arguments.manifest_output}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
