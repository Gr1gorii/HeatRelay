"""Deterministic Barcelona climate-shelter candidate selection.

The module deliberately keeps source facts, schedule eligibility, feature
filtering, and distance ordering in backend code. It does not make medical
recommendations or infer missing place attributes.
"""

from __future__ import annotations

import hashlib
import ipaddress
import json
import math
import re
import unicodedata
from datetime import date, datetime, time, timedelta
from functools import lru_cache
from pathlib import Path
from typing import Annotated, Literal
from urllib.parse import urlsplit
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException
from pydantic import (
    AfterValidator,
    AwareDatetime,
    BaseModel,
    ConfigDict,
    Field,
    StrictBool,
    ValidationError,
    field_validator,
    model_validator,
)

OFFICIAL_DATASET_URL = (
    "https://opendata-ajuntament.barcelona.cat/data/en/dataset/"
    "xarxa-refugis-climatics"
)
OFFICIAL_DISTRIBUTION_URL = (
    "https://opendata-ajuntament.barcelona.cat/data/dataset/"
    "8f9da263-ff41-4765-ab0d-61b97d7a00b2/resource/"
    "d88129fe-7aaa-4ae6-b9fd-908ad3f7480d/download"
)
SUPPORTED_SCHEMA_VERSION = "1.0.0"
OFFICIAL_PUBLISHER = "Ajuntament de Barcelona"
CC_BY_4_LICENSE = "CC BY 4.0"
CC_BY_4_LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/"
MADRID_TIMEZONE = ZoneInfo("Europe/Madrid")

# The verified catalog is limited to the Barcelona pilot. These deliberately
# broad bounds apply only to source-backed place records, never user origins.
BARCELONA_PLACE_MIN_LATITUDE = 41.2
BARCELONA_PLACE_MAX_LATITUDE = 41.6
BARCELONA_PLACE_MIN_LONGITUDE = 1.9
BARCELONA_PLACE_MAX_LONGITUDE = 2.4

HOURS_WARNING = (
    "Municipal opening hours may change; check the official source before "
    "travel."
)
CANDIDATE_NOTICE = (
    "These are factual, backend-approved candidate places, not medical "
    "recommendations."
)
MATCH_EXPLANATION = (
    "Candidates met the requested straight-line distance, verified opening "
    "hours, and required-feature filters."
)
EMPTY_EXPLANATION = (
    "No official place in this snapshot met the requested straight-line "
    "distance, verified opening-hours, and required-feature filters. No "
    "fallback place was invented."
)

ROOT_DIRECTORY = Path(__file__).resolve().parents[2]
DEFAULT_SNAPSHOT_PATH = (
    ROOT_DIRECTORY / "data/barcelona/climate_shelters.v1.json"
)
DEFAULT_MANIFEST_PATH = (
    ROOT_DIRECTORY / "data/barcelona/climate_shelters.v1.manifest.json"
)

Weekday = Literal[
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
]
ScheduleVerificationStatus = Literal["verified", "unknown", "ambiguous"]
_WEEKDAY_NAMES: tuple[Weekday, ...] = (
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
)

_CLOCK_PATTERN = re.compile(r"^(?:[01]\d|2[0-3]):[0-5]\d$")
_PLACE_ID_PATTERN = re.compile(r"^bcn-[0-9]+$")
_SOURCE_RECORD_ID_PATTERN = re.compile(r"^[0-9]+$")
_SCHEMA_VERSION_PATTERN = re.compile(r"^[0-9]+\.[0-9]+\.[0-9]+$")
_SHA256_PATTERN = re.compile(r"^[0-9a-f]{64}$")
_MALFORMED_PERCENT_ESCAPE_PATTERN = re.compile(r"%(?![0-9A-Fa-f]{2})")
_HOST_LABEL_PATTERN = re.compile(
    r"^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$"
)
_FORBIDDEN_URL_UNICODE_CATEGORIES = frozenset({"Cc", "Cf", "Cs"})


def _validate_non_blank(value: str) -> str:
    if not value.strip():
        raise ValueError("must not be blank")
    return value


def _validate_semantic_schema_version(value: str) -> str:
    if _SCHEMA_VERSION_PATTERN.fullmatch(value) is None:
        raise ValueError("schema_version must use semantic x.y.z form")
    return value


def _validate_lowercase_sha256(value: str) -> str:
    if _SHA256_PATTERN.fullmatch(value) is None:
        raise ValueError("must be a lowercase hexadecimal SHA-256")
    return value


def validate_place_identifier_pair(
    place_id: str,
    source_record_id: str,
) -> None:
    if _PLACE_ID_PATTERN.fullmatch(place_id) is None:
        raise ValueError("place_id must match bcn-<decimal register_id>")
    if _SOURCE_RECORD_ID_PATTERN.fullmatch(source_record_id) is None:
        raise ValueError("source_record_id must be a decimal register_id")
    if place_id != f"bcn-{source_record_id}":
        raise ValueError("place_id must be derived from source_record_id")


def _validate_http_url(value: str) -> str:
    if not value:
        raise ValueError("must not be empty")
    if any(
        character.isspace()
        or unicodedata.category(character)
        in _FORBIDDEN_URL_UNICODE_CATEGORIES
        for character in value
    ):
        raise ValueError("must not contain whitespace or control characters")
    if _MALFORMED_PERCENT_ESCAPE_PATTERN.search(value) is not None:
        raise ValueError("must not contain malformed percent escapes")

    try:
        parsed = urlsplit(value)
        hostname = parsed.hostname
        port = parsed.port
    except (UnicodeError, ValueError) as error:
        raise ValueError("must be a valid absolute HTTPS URL") from error

    if parsed.scheme != "https" or not parsed.netloc or hostname is None:
        raise ValueError("must be an absolute HTTPS URL")
    if parsed.username is not None or parsed.password is not None:
        raise ValueError("must not contain credentials")

    _validate_url_port(parsed.netloc, hostname, port)
    _validate_url_hostname(parsed.netloc, hostname)
    return value


def _validate_url_port(
    netloc: str,
    hostname: str,
    port: int | None,
) -> None:
    port_text: str | None = None
    if ":" in hostname:
        if not netloc.startswith("["):
            raise ValueError("IPv6 hostnames must use brackets")
        closing_bracket = netloc.find("]")
        suffix = netloc[closing_bracket + 1 :]
        if suffix:
            if not suffix.startswith(":"):
                raise ValueError("must contain a valid port")
            port_text = suffix[1:]
    elif ":" in netloc:
        _, _, port_text = netloc.rpartition(":")

    if port_text is None:
        if port is not None:
            raise ValueError("must contain a valid port")
        return
    if re.fullmatch(r"[0-9]+", port_text) is None:
        raise ValueError("must contain a valid port")
    if port is None or not 1 <= port <= 65535:
        raise ValueError("port must be between 1 and 65535")


def _validate_url_hostname(netloc: str, hostname: str) -> None:
    if "%" in hostname or "\\" in hostname:
        raise ValueError("must contain a valid hostname")

    if ":" in hostname:
        if not netloc.startswith("["):
            raise ValueError("IPv6 hostnames must use brackets")
        try:
            ipaddress.IPv6Address(hostname)
        except ValueError as error:
            raise ValueError("must contain a valid hostname") from error
        return

    hostname_without_trailing_dot = (
        hostname[:-1] if hostname.endswith(".") else hostname
    )
    if not hostname_without_trailing_dot:
        raise ValueError("must contain a valid hostname")

    try:
        ipaddress.IPv4Address(hostname)
        return
    except ValueError:
        if _is_ambiguous_numeric_hostname(hostname_without_trailing_dot):
            raise ValueError("must contain a canonical IPv4 address")

    try:
        ascii_hostname = hostname_without_trailing_dot.encode("idna").decode(
            "ascii"
        )
    except UnicodeError as error:
        raise ValueError("must contain a valid hostname") from error
    ascii_hostname_without_trailing_dot = (
        ascii_hostname[:-1] if ascii_hostname.endswith(".") else ascii_hostname
    )
    if not ascii_hostname_without_trailing_dot:
        raise ValueError("must contain a valid hostname")
    try:
        ipaddress.IPv4Address(ascii_hostname_without_trailing_dot)
    except ValueError:
        if _is_ambiguous_numeric_hostname(
            ascii_hostname_without_trailing_dot
        ):
            raise ValueError("must contain a canonical IPv4 address")
    else:
        raise ValueError("mapped hostnames must not disguise IPv4 addresses")

    labels = ascii_hostname_without_trailing_dot.split(".")
    if len(ascii_hostname_without_trailing_dot) > 253 or any(
        _HOST_LABEL_PATTERN.fullmatch(label) is None for label in labels
    ):
        raise ValueError("must contain a valid hostname")
    _validate_idna_alabels(labels)


def _is_ambiguous_numeric_hostname(hostname: str) -> bool:
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


def _validate_idna_alabels(labels: list[str]) -> None:
    for label in labels:
        lowercase_label = label.lower()
        if not lowercase_label.startswith("xn--"):
            continue
        try:
            decoded_label = lowercase_label.encode("ascii").decode("idna")
            round_tripped_label = decoded_label.encode("idna").decode("ascii")
        except UnicodeError as error:
            raise ValueError("must contain a valid IDNA hostname") from error
        if round_tripped_label.lower() != lowercase_label:
            raise ValueError("IDNA hostname label must round-trip")


NonBlankString = Annotated[str, AfterValidator(_validate_non_blank)]
HttpUrlString = Annotated[
    str,
    AfterValidator(_validate_http_url),
]
Latitude = Annotated[
    float,
    Field(strict=True, ge=-90, le=90, allow_inf_nan=False),
]
Longitude = Annotated[
    float,
    Field(strict=True, ge=-180, le=180, allow_inf_nan=False),
]
BarcelonaPlaceLatitude = Annotated[
    float,
    Field(
        strict=True,
        ge=BARCELONA_PLACE_MIN_LATITUDE,
        le=BARCELONA_PLACE_MAX_LATITUDE,
        allow_inf_nan=False,
    ),
]
BarcelonaPlaceLongitude = Annotated[
    float,
    Field(
        strict=True,
        ge=BARCELONA_PLACE_MIN_LONGITUDE,
        le=BARCELONA_PLACE_MAX_LONGITUDE,
        allow_inf_nan=False,
    ),
]
NonNegativeInteger = Annotated[int, Field(strict=True, ge=0)]


class StrictModel(BaseModel):
    """Base model that rejects undocumented fields and validates defaults."""

    model_config = ConfigDict(
        extra="forbid",
        frozen=True,
        validate_default=True,
    )


class Address(StrictModel):
    street: NonBlankString | None
    number: NonBlankString | None
    postal_code: NonBlankString | None
    city: NonBlankString | None


class PlaceFeatures(StrictModel):
    indoor_space: StrictBool | None
    potable_water: StrictBool | None
    toilets: StrictBool | None
    micro_shelter: StrictBool | None
    pets_allowed: StrictBool | None


class RequiredFeatures(StrictModel):
    indoor_space: StrictBool = False
    potable_water: StrictBool = False
    toilets: StrictBool = False
    micro_shelter: StrictBool = False
    pets_allowed: StrictBool = False


class ScheduleInterval(StrictModel):
    opens: str
    closes: str

    @field_validator("opens", "closes")
    @classmethod
    def validate_clock_time(cls, value: str) -> str:
        if _CLOCK_PATTERN.fullmatch(value) is None:
            raise ValueError("must use exact 24-hour HH:MM format")
        return value

    @model_validator(mode="after")
    def reject_equal_boundaries(self) -> ScheduleInterval:
        if self.opens == self.closes:
            raise ValueError(
                "equal interval boundaries are ambiguous; represent only "
                "source-backed opening periods"
            )
        return self


class WeeklyRule(StrictModel):
    weekdays: list[Weekday] = Field(min_length=1)
    intervals: list[ScheduleInterval] = Field(min_length=1)

    @field_validator("weekdays")
    @classmethod
    def reject_duplicate_weekdays(
        cls,
        value: list[Weekday],
    ) -> list[Weekday]:
        if len(value) != len(set(value)):
            raise ValueError("weekdays must be unique within a rule")
        return value


class ScheduleSeason(StrictModel):
    valid_from: date
    valid_through: date
    weekly_rules: list[WeeklyRule] = Field(min_length=1)

    @model_validator(mode="after")
    def validate_date_range(self) -> ScheduleSeason:
        if self.valid_through < self.valid_from:
            raise ValueError("valid_through must not precede valid_from")

        seen_weekdays: set[str] = set()
        for rule in self.weekly_rules:
            if seen_weekdays.intersection(rule.weekdays):
                raise ValueError(
                    "a weekday must not appear in multiple rules in one season"
                )
            seen_weekdays.update(rule.weekdays)
        return self


class OpeningSchedule(StrictModel):
    timezone: Literal["Europe/Madrid"]
    seasons: list[ScheduleSeason] = Field(min_length=1)

    @model_validator(mode="after")
    def reject_overlapping_seasons(self) -> OpeningSchedule:
        ordered = sorted(self.seasons, key=lambda season: season.valid_from)
        for previous, current in zip(ordered, ordered[1:]):
            if current.valid_from <= previous.valid_through:
                raise ValueError("opening schedule seasons must not overlap")
        return self


class PlaceRecord(StrictModel):
    place_id: str
    source_record_id: str
    name: NonBlankString
    address: Address
    district: NonBlankString | None
    neighborhood: NonBlankString | None
    latitude: BarcelonaPlaceLatitude
    longitude: BarcelonaPlaceLongitude
    source_modified_at: AwareDatetime
    accessibility: StrictBool | None
    features: PlaceFeatures
    information_url: HttpUrlString | None
    opening_schedule: OpeningSchedule | None
    schedule_verification_status: ScheduleVerificationStatus
    last_checked: date
    source_url: HttpUrlString

    @model_validator(mode="after")
    def validate_identifiers_and_schedule(self) -> PlaceRecord:
        validate_place_identifier_pair(self.place_id, self.source_record_id)

        if self.schedule_verification_status == "verified":
            if self.opening_schedule is None:
                raise ValueError("verified schedules must include schedule data")
        elif self.opening_schedule is not None:
            raise ValueError(
                "unknown or ambiguous schedules must not include intervals"
            )
        return self


class ClimateShelterSnapshot(StrictModel):
    schema_version: str
    snapshot_id: NonBlankString
    publisher: NonBlankString
    dataset_url: HttpUrlString
    distribution_url: HttpUrlString
    license: NonBlankString
    license_url: HttpUrlString
    attribution: NonBlankString
    places: list[PlaceRecord]

    @field_validator("schema_version")
    @classmethod
    def validate_schema_version(cls, value: str) -> str:
        return _validate_semantic_schema_version(value)


class ClimateShelterManifest(StrictModel):
    schema_version: str
    snapshot_id: NonBlankString
    publisher: NonBlankString
    dataset_url: HttpUrlString
    distribution_url: HttpUrlString
    retrieved_at: AwareDatetime
    upstream_max_modified: AwareDatetime
    license: NonBlankString
    license_url: HttpUrlString
    raw_sha256: str
    normalized_sha256: str
    input_count: NonNegativeInteger
    selected_count: NonNegativeInteger
    rejected_count: NonNegativeInteger
    rejection_reasons: dict[NonBlankString, NonNegativeInteger]
    attribution: NonBlankString

    @field_validator("schema_version")
    @classmethod
    def validate_schema_version(cls, value: str) -> str:
        return _validate_semantic_schema_version(value)

    @field_validator("raw_sha256", "normalized_sha256")
    @classmethod
    def validate_sha256(cls, value: str) -> str:
        return _validate_lowercase_sha256(value)

    @field_validator("retrieved_at")
    @classmethod
    def validate_retrieval_time_is_utc(
        cls,
        value: datetime,
    ) -> datetime:
        if value.utcoffset() != timedelta(0):
            raise ValueError("retrieved_at must be in UTC")
        return value


class Origin(StrictModel):
    latitude: Latitude
    longitude: Longitude


class PlacesCandidatesRequest(StrictModel):
    origin: Origin
    evaluation_datetime: AwareDatetime
    required_features: RequiredFeatures = Field(
        default_factory=RequiredFeatures
    )
    maximum_distance_m: Annotated[
        float,
        Field(strict=True, gt=0, allow_inf_nan=False),
    ]
    limit: Annotated[int, Field(strict=True, ge=1, le=10)]


class CandidatePlace(StrictModel):
    place_id: str
    source_record_id: str
    name: NonBlankString
    address: Address
    district: NonBlankString | None
    neighborhood: NonBlankString | None
    latitude: BarcelonaPlaceLatitude
    longitude: BarcelonaPlaceLongitude
    distance_m: NonNegativeInteger
    closes_at: AwareDatetime
    accessibility: StrictBool | None
    features: PlaceFeatures
    information_url: HttpUrlString | None
    schedule_verification_status: Literal["verified"]
    source_modified_at: AwareDatetime
    source_url: HttpUrlString
    last_checked: date

    @model_validator(mode="after")
    def validate_identifiers(self) -> CandidatePlace:
        validate_place_identifier_pair(self.place_id, self.source_record_id)
        return self


class SnapshotProvenance(StrictModel):
    schema_version: str
    snapshot_id: NonBlankString
    publisher: NonBlankString
    dataset_url: HttpUrlString
    distribution_url: HttpUrlString
    retrieved_at: AwareDatetime
    upstream_max_modified: AwareDatetime
    license: NonBlankString
    license_url: HttpUrlString
    attribution: NonBlankString
    normalized_sha256: str

    @field_validator("schema_version")
    @classmethod
    def validate_schema_version(cls, value: str) -> str:
        return _validate_semantic_schema_version(value)

    @field_validator("normalized_sha256")
    @classmethod
    def validate_sha256(cls, value: str) -> str:
        return _validate_lowercase_sha256(value)

    @field_validator("retrieved_at")
    @classmethod
    def validate_retrieval_time_is_utc(
        cls,
        value: datetime,
    ) -> datetime:
        if value.utcoffset() != timedelta(0):
            raise ValueError("retrieved_at must be in UTC")
        return value


class PlacesCandidatesResponse(StrictModel):
    candidates: list[CandidatePlace] = Field(max_length=10)
    snapshot: SnapshotProvenance
    explanation: NonBlankString
    hours_warning: NonBlankString
    candidate_notice: NonBlankString

    @model_validator(mode="after")
    def validate_candidate_sources(self) -> PlacesCandidatesResponse:
        place_ids = [candidate.place_id for candidate in self.candidates]
        if len(place_ids) != len(set(place_ids)):
            raise ValueError("candidate place IDs must be unique")
        source_record_ids = [
            candidate.source_record_id for candidate in self.candidates
        ]
        if len(source_record_ids) != len(set(source_record_ids)):
            raise ValueError("candidate source record IDs must be unique")
        if any(
            candidate.source_url != self.snapshot.dataset_url
            for candidate in self.candidates
        ):
            raise ValueError(
                "candidate source_url must match snapshot dataset_url"
            )
        return self


# Short aliases make integration and tests readable without changing the
# public model names used in generated API documentation.
CandidatesRequest = PlacesCandidatesRequest
CandidatesResponse = PlacesCandidatesResponse


class PlaceDataError(RuntimeError):
    """Raised when committed place data is absent or fails validation."""


def _clock(value: str) -> time:
    return time.fromisoformat(value)


def _interval_datetimes(
    start_date: date,
    interval: ScheduleInterval,
) -> tuple[datetime, datetime]:
    opens_at = datetime.combine(
        start_date,
        _clock(interval.opens),
        tzinfo=MADRID_TIMEZONE,
    )
    closes_date = start_date
    if interval.closes <= interval.opens:
        closes_date += timedelta(days=1)
    closes_at = datetime.combine(
        closes_date,
        _clock(interval.closes),
        tzinfo=MADRID_TIMEZONE,
    )
    return opens_at, closes_at


def schedule_closing_time(
    schedule: OpeningSchedule,
    evaluation_datetime: datetime,
) -> datetime | None:
    """Return the applicable closing instant, or ``None`` when not open.

    Intervals are opening-inclusive and closing-exclusive. The previous local
    date is checked so overnight intervals remain tied to the season and
    weekday on which they started.
    """

    local_evaluation = evaluation_datetime.astimezone(MADRID_TIMEZONE)
    possible_start_dates = (
        local_evaluation.date(),
        local_evaluation.date() - timedelta(days=1),
    )
    matching_closes: list[datetime] = []

    for start_date in possible_start_dates:
        weekday = _WEEKDAY_NAMES[start_date.weekday()]
        for season in schedule.seasons:
            if not season.valid_from <= start_date <= season.valid_through:
                continue
            for rule in season.weekly_rules:
                if weekday not in rule.weekdays:
                    continue
                for interval in rule.intervals:
                    opens_at, closes_at = _interval_datetimes(
                        start_date,
                        interval,
                    )
                    if opens_at <= local_evaluation < closes_at:
                        matching_closes.append(closes_at)

    if not matching_closes:
        return None
    return max(matching_closes)


def haversine_distance_m(
    latitude_a: float,
    longitude_a: float,
    latitude_b: float,
    longitude_b: float,
) -> float:
    """Calculate straight-line great-circle distance in metres."""

    earth_radius_m = 6_371_008.8
    latitude_a_rad = math.radians(latitude_a)
    latitude_b_rad = math.radians(latitude_b)
    delta_latitude = math.radians(latitude_b - latitude_a)
    delta_longitude = math.radians(longitude_b - longitude_a)

    haversine = (
        math.sin(delta_latitude / 2) ** 2
        + math.cos(latitude_a_rad)
        * math.cos(latitude_b_rad)
        * math.sin(delta_longitude / 2) ** 2
    )
    haversine = min(1.0, max(0.0, haversine))
    return earth_radius_m * 2 * math.atan2(
        math.sqrt(haversine),
        math.sqrt(1 - haversine),
    )


class PlaceRepository:
    """Load, validate, and query one immutable versioned place snapshot."""

    def __init__(
        self,
        snapshot_path: str | Path = DEFAULT_SNAPSHOT_PATH,
        manifest_path: str | Path = DEFAULT_MANIFEST_PATH,
    ) -> None:
        self.snapshot_path = Path(snapshot_path)
        self.manifest_path = Path(manifest_path)
        self._snapshot: ClimateShelterSnapshot | None = None
        self._manifest: ClimateShelterManifest | None = None

    @property
    def snapshot(self) -> ClimateShelterSnapshot:
        self._ensure_loaded()
        assert self._snapshot is not None
        return self._snapshot

    @property
    def manifest(self) -> ClimateShelterManifest:
        self._ensure_loaded()
        assert self._manifest is not None
        return self._manifest

    @property
    def provenance(self) -> SnapshotProvenance:
        """Return the full identity of this validated snapshot/manifest pair."""

        self._ensure_loaded()
        assert self._manifest is not None
        return self._provenance_from_manifest(self._manifest)

    def load(self) -> PlaceRepository:
        """Read and validate the snapshot and manifest immediately."""

        self._load_files()
        return self

    def _ensure_loaded(self) -> None:
        if self._snapshot is None or self._manifest is None:
            self._load_files()

    def _load_files(self) -> None:
        try:
            snapshot_bytes = self.snapshot_path.read_bytes()
            manifest_bytes = self.manifest_path.read_bytes()
        except OSError as exc:
            raise PlaceDataError("place snapshot files are unavailable") from exc

        try:
            snapshot_payload = json.loads(snapshot_bytes)
            manifest_payload = json.loads(manifest_bytes)
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise PlaceDataError("place snapshot files are not valid JSON") from exc

        try:
            snapshot = ClimateShelterSnapshot.model_validate(snapshot_payload)
            manifest = ClimateShelterManifest.model_validate(manifest_payload)
        except ValidationError as exc:
            raise PlaceDataError("place snapshot schema validation failed") from exc

        self._validate_snapshot_and_manifest(
            snapshot,
            manifest,
            snapshot_bytes,
        )
        self._snapshot = snapshot
        self._manifest = manifest

    @staticmethod
    def _validate_snapshot_and_manifest(
        snapshot: ClimateShelterSnapshot,
        manifest: ClimateShelterManifest,
        snapshot_bytes: bytes,
    ) -> None:
        expected_provenance = {
            "schema_version": SUPPORTED_SCHEMA_VERSION,
            "publisher": OFFICIAL_PUBLISHER,
            "dataset_url": OFFICIAL_DATASET_URL,
            "distribution_url": OFFICIAL_DISTRIBUTION_URL,
            "license": CC_BY_4_LICENSE,
            "license_url": CC_BY_4_LICENSE_URL,
        }
        for field_name, expected_value in expected_provenance.items():
            if getattr(snapshot, field_name) != expected_value:
                raise PlaceDataError(
                    f"snapshot {field_name} is not the approved official value"
                )
            if getattr(manifest, field_name) != expected_value:
                raise PlaceDataError(
                    f"manifest {field_name} is not the approved official value"
                )

        shared_fields = (
            "schema_version",
            "snapshot_id",
            "publisher",
            "dataset_url",
            "distribution_url",
            "license",
            "license_url",
            "attribution",
        )
        for field_name in shared_fields:
            if getattr(snapshot, field_name) != getattr(manifest, field_name):
                raise PlaceDataError(
                    f"snapshot and manifest disagree on {field_name}"
                )

        attribution = snapshot.attribution.casefold()
        if "heatrelay" not in attribution or "normaliz" not in attribution:
            raise PlaceDataError(
                "attribution must explain HeatRelay normalization"
            )

        actual_hash = hashlib.sha256(snapshot_bytes).hexdigest()
        if manifest.normalized_sha256 != actual_hash:
            raise PlaceDataError("normalized snapshot SHA-256 does not match")

        if manifest.selected_count != len(snapshot.places):
            raise PlaceDataError(
                "manifest selected_count does not match snapshot places"
            )
        if (
            manifest.input_count
            != manifest.selected_count + manifest.rejected_count
        ):
            raise PlaceDataError(
                "manifest input_count must equal selected plus rejected"
            )
        if manifest.rejected_count != sum(
            manifest.rejection_reasons.values()
        ):
            raise PlaceDataError(
                "manifest rejection reasons do not sum to rejected_count"
            )

        place_ids: set[str] = set()
        source_record_ids: set[str] = set()
        for place in snapshot.places:
            if place.place_id in place_ids:
                raise PlaceDataError(
                    f"duplicate place_id in snapshot: {place.place_id}"
                )
            if place.source_record_id in source_record_ids:
                raise PlaceDataError(
                    "duplicate source_record_id in snapshot: "
                    f"{place.source_record_id}"
                )
            if place.source_url != snapshot.dataset_url:
                raise PlaceDataError(
                    f"place {place.place_id} has an unexpected source_url"
                )
            if place.source_modified_at > manifest.upstream_max_modified:
                raise PlaceDataError(
                    f"place {place.place_id} is newer than the upstream maximum"
                )
            if place.last_checked != manifest.retrieved_at.date():
                raise PlaceDataError(
                    f"place {place.place_id} last_checked is inconsistent"
                )
            place_ids.add(place.place_id)
            source_record_ids.add(place.source_record_id)

    @staticmethod
    def _provenance_from_manifest(
        manifest: ClimateShelterManifest,
    ) -> SnapshotProvenance:
        return SnapshotProvenance(
            schema_version=manifest.schema_version,
            snapshot_id=manifest.snapshot_id,
            publisher=manifest.publisher,
            dataset_url=manifest.dataset_url,
            distribution_url=manifest.distribution_url,
            retrieved_at=manifest.retrieved_at,
            upstream_max_modified=manifest.upstream_max_modified,
            license=manifest.license,
            license_url=manifest.license_url,
            attribution=manifest.attribution,
            normalized_sha256=manifest.normalized_sha256,
        )

    def find_candidates(
        self,
        request: PlacesCandidatesRequest,
    ) -> PlacesCandidatesResponse:
        """Apply fail-closed schedule/features filters and deterministic rank."""

        return self._find_candidates(
            request,
            accessibility_required=False,
        )

    def find_action_candidates(
        self,
        request: PlacesCandidatesRequest,
        *,
        accessibility_required: bool,
    ) -> PlacesCandidatesResponse:
        """Apply the M3 accessibility requirement before rank and limit."""

        if type(accessibility_required) is not bool:
            raise ValueError("accessibility_required must be a boolean")
        return self._find_candidates(
            request,
            accessibility_required=accessibility_required,
        )

    def _find_candidates(
        self,
        request: PlacesCandidatesRequest,
        *,
        accessibility_required: bool,
    ) -> PlacesCandidatesResponse:
        """Shared immutable-snapshot query for public and action-plan paths."""

        self._ensure_loaded()
        assert self._snapshot is not None
        assert self._manifest is not None

        matches: list[tuple[float, str, PlaceRecord, datetime]] = []
        required_features = request.required_features.model_dump()

        for place in self._snapshot.places:
            distance_m = haversine_distance_m(
                request.origin.latitude,
                request.origin.longitude,
                place.latitude,
                place.longitude,
            )
            if distance_m > request.maximum_distance_m:
                continue
            if (
                place.schedule_verification_status != "verified"
                or place.opening_schedule is None
            ):
                continue

            closes_at = schedule_closing_time(
                place.opening_schedule,
                request.evaluation_datetime,
            )
            if closes_at is None:
                continue

            place_features = place.features.model_dump()
            if any(
                required
                and place_features[feature_name] is not True
                for feature_name, required in required_features.items()
            ):
                continue
            if accessibility_required and place.accessibility is not True:
                continue

            matches.append((distance_m, place.place_id, place, closes_at))

        matches.sort(key=lambda match: (match[0], match[1]))
        selected = matches[: request.limit]

        candidates = [
            CandidatePlace(
                place_id=place.place_id,
                source_record_id=place.source_record_id,
                name=place.name,
                address=place.address,
                district=place.district,
                neighborhood=place.neighborhood,
                latitude=place.latitude,
                longitude=place.longitude,
                distance_m=int(round(distance_m)),
                closes_at=closes_at,
                accessibility=place.accessibility,
                features=place.features,
                information_url=place.information_url,
                schedule_verification_status="verified",
                source_modified_at=place.source_modified_at,
                source_url=place.source_url,
                last_checked=place.last_checked,
            )
            for distance_m, _, place, closes_at in selected
        ]

        return PlacesCandidatesResponse(
            candidates=candidates,
            snapshot=self.provenance,
            explanation=MATCH_EXPLANATION if candidates else EMPTY_EXPLANATION,
            hours_warning=HOURS_WARNING,
            candidate_notice=CANDIDATE_NOTICE,
        )


@lru_cache(maxsize=1)
def get_place_repository() -> PlaceRepository:
    """Return the process-wide repository for the committed snapshot."""

    return PlaceRepository()


def get_committed_snapshot_provenance() -> SnapshotProvenance:
    """Derive the authoritative identity from the validated committed files."""

    return get_place_repository().provenance


router = APIRouter(prefix="/api/v1", tags=["places"])


@router.post(
    "/places/candidates",
    response_model=PlacesCandidatesResponse,
)
def places_candidates(
    request: PlacesCandidatesRequest,
    repository: Annotated[PlaceRepository, Depends(get_place_repository)],
) -> PlacesCandidatesResponse:
    """Return deterministic factual candidates from the approved snapshot."""

    try:
        return repository.find_candidates(request)
    except PlaceDataError:
        raise HTTPException(
            status_code=503,
            detail={
                "code": "places_unavailable",
                "message": "Verified place data is temporarily unavailable.",
            },
        ) from None
