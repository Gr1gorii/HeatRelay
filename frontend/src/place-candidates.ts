import {
  BARCELONA_DEMO_MAXIMUM_DISTANCE_M,
  BARCELONA_DEMO_ORIGIN,
} from "./action-plan";

export const PLACE_CANDIDATES_ENDPOINT = "/api/v1/places/candidates";
export const PLACE_CANDIDATES_LIMIT = 3;

const CANDIDATE_KEYS = [
  "place_id",
  "source_record_id",
  "name",
  "address",
  "district",
  "neighborhood",
  "latitude",
  "longitude",
  "distance_m",
  "closes_at",
  "accessibility",
  "features",
  "information_url",
  "schedule_verification_status",
  "source_modified_at",
  "source_url",
  "last_checked",
] as const;

const ADDRESS_KEYS = ["street", "number", "postal_code", "city"] as const;

const FEATURE_KEYS = [
  "indoor_space",
  "potable_water",
  "toilets",
  "micro_shelter",
  "pets_allowed",
] as const;

const SNAPSHOT_KEYS = [
  "schema_version",
  "snapshot_id",
  "publisher",
  "dataset_url",
  "distribution_url",
  "retrieved_at",
  "upstream_max_modified",
  "license",
  "license_url",
  "attribution",
  "normalized_sha256",
] as const;

const RESPONSE_KEYS = [
  "candidates",
  "snapshot",
  "explanation",
  "hours_warning",
  "candidate_notice",
] as const;

const PLACE_ID_PATTERN = /^bcn-[0-9]+$/;
const SOURCE_RECORD_ID_PATTERN = /^[0-9]+$/;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const AWARE_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

export interface PlaceAddress {
  street: string | null;
  number: string | null;
  postal_code: string | null;
  city: string | null;
}

export interface PlaceFeatures {
  indoor_space: boolean | null;
  potable_water: boolean | null;
  toilets: boolean | null;
  micro_shelter: boolean | null;
  pets_allowed: boolean | null;
}

export interface PlaceCandidate {
  place_id: string;
  source_record_id: string;
  name: string;
  address: PlaceAddress;
  district: string | null;
  neighborhood: string | null;
  latitude: number;
  longitude: number;
  distance_m: number;
  closes_at: string;
  accessibility: boolean | null;
  features: PlaceFeatures;
  information_url: string | null;
  schedule_verification_status: "verified";
  source_modified_at: string;
  source_url: string;
  last_checked: string;
}

export interface PlaceSnapshotProvenance {
  schema_version: "1.0.0";
  snapshot_id: string;
  publisher: string;
  dataset_url: string;
  distribution_url: string;
  retrieved_at: string;
  upstream_max_modified: string;
  license: string;
  license_url: string;
  attribution: string;
  normalized_sha256: string;
}

export interface PlaceCandidatesResponse {
  candidates: PlaceCandidate[];
  snapshot: PlaceSnapshotProvenance;
  explanation: string;
  hours_warning: string;
  candidate_notice: string;
}

export type PlaceCandidatesClientErrorKind =
  | "unavailable"
  | "malformed_response";

export class PlaceCandidatesClientError extends Error {
  readonly kind: PlaceCandidatesClientErrorKind;

  constructor(kind: PlaceCandidatesClientErrorKind) {
    super(kind);
    this.name = "PlaceCandidatesClientError";
    this.kind = kind;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
): boolean {
  const actualKeys = Object.keys(value);
  return (
    actualKeys.length === keys.length &&
    keys.every((key) => Object.prototype.hasOwnProperty.call(value, key))
  );
}

function isNonBlankString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNullableNonBlankString(value: unknown): value is string | null {
  return value === null || isNonBlankString(value);
}

function isNullableBoolean(value: unknown): value is boolean | null {
  return value === null || typeof value === "boolean";
}

function isFiniteNumberInRange(
  value: unknown,
  minimum: number,
  maximum: number,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= minimum &&
    value <= maximum
  );
}

function isDateOnly(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) {
    return false;
  }
  const [, yearText, monthText, dayText] = match;
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(
    Number(yearText),
    Number(monthText) - 1,
    Number(dayText),
  );
  return (
    date.getUTCFullYear() === Number(yearText) &&
    date.getUTCMonth() === Number(monthText) - 1 &&
    date.getUTCDate() === Number(dayText)
  );
}

function isAwareDateTime(value: unknown): value is string {
  if (typeof value !== "string" || !AWARE_DATE_TIME_PATTERN.test(value)) {
    return false;
  }
  return Number.isFinite(Date.parse(value));
}

function isSafeHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || /\s/.test(value)) {
    return false;
  }
  try {
    const parsed = new URL(value);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname.length > 0 &&
      parsed.username === "" &&
      parsed.password === ""
    );
  } catch {
    return false;
  }
}

function isNullableSafeHttpsUrl(value: unknown): value is string | null {
  return value === null || isSafeHttpsUrl(value);
}

function isAddress(value: unknown): value is PlaceAddress {
  if (!isRecord(value) || !hasExactKeys(value, ADDRESS_KEYS)) {
    return false;
  }
  return ADDRESS_KEYS.every((key) => isNullableNonBlankString(value[key]));
}

function isFeatures(value: unknown): value is PlaceFeatures {
  if (!isRecord(value) || !hasExactKeys(value, FEATURE_KEYS)) {
    return false;
  }
  return FEATURE_KEYS.every((key) => isNullableBoolean(value[key]));
}

function isCandidate(value: unknown): value is PlaceCandidate {
  if (!isRecord(value) || !hasExactKeys(value, CANDIDATE_KEYS)) {
    return false;
  }
  if (
    typeof value.place_id !== "string" ||
    typeof value.source_record_id !== "string" ||
    !PLACE_ID_PATTERN.test(value.place_id) ||
    !SOURCE_RECORD_ID_PATTERN.test(value.source_record_id) ||
    value.place_id !== `bcn-${value.source_record_id}`
  ) {
    return false;
  }
  return (
    isNonBlankString(value.name) &&
    isAddress(value.address) &&
    isNullableNonBlankString(value.district) &&
    isNullableNonBlankString(value.neighborhood) &&
    isFiniteNumberInRange(value.latitude, -90, 90) &&
    isFiniteNumberInRange(value.longitude, -180, 180) &&
    typeof value.distance_m === "number" &&
    Number.isInteger(value.distance_m) &&
    value.distance_m >= 0 &&
    value.distance_m <= BARCELONA_DEMO_MAXIMUM_DISTANCE_M &&
    isAwareDateTime(value.closes_at) &&
    isNullableBoolean(value.accessibility) &&
    isFeatures(value.features) &&
    isNullableSafeHttpsUrl(value.information_url) &&
    value.schedule_verification_status === "verified" &&
    isAwareDateTime(value.source_modified_at) &&
    isSafeHttpsUrl(value.source_url) &&
    isDateOnly(value.last_checked)
  );
}

function isSnapshot(value: unknown): value is PlaceSnapshotProvenance {
  if (!isRecord(value) || !hasExactKeys(value, SNAPSHOT_KEYS)) {
    return false;
  }
  return (
    value.schema_version === "1.0.0" &&
    isNonBlankString(value.snapshot_id) &&
    isNonBlankString(value.publisher) &&
    isSafeHttpsUrl(value.dataset_url) &&
    isSafeHttpsUrl(value.distribution_url) &&
    isAwareDateTime(value.retrieved_at) &&
    isAwareDateTime(value.upstream_max_modified) &&
    isNonBlankString(value.license) &&
    isSafeHttpsUrl(value.license_url) &&
    isNonBlankString(value.attribution) &&
    typeof value.normalized_sha256 === "string" &&
    SHA256_PATTERN.test(value.normalized_sha256)
  );
}

export function parsePlaceCandidatesResponse(
  value: unknown,
): PlaceCandidatesResponse | null {
  if (!isRecord(value) || !hasExactKeys(value, RESPONSE_KEYS)) {
    return null;
  }
  const snapshot = value.snapshot;
  if (
    !Array.isArray(value.candidates) ||
    value.candidates.length > PLACE_CANDIDATES_LIMIT ||
    !value.candidates.every(isCandidate) ||
    !isSnapshot(snapshot) ||
    !isNonBlankString(value.explanation) ||
    !isNonBlankString(value.hours_warning) ||
    !isNonBlankString(value.candidate_notice)
  ) {
    return null;
  }

  const candidates = value.candidates as PlaceCandidate[];
  const placeIds = candidates.map((candidate) => candidate.place_id);
  const sourceRecordIds = candidates.map(
    (candidate) => candidate.source_record_id,
  );
  if (
    new Set(placeIds).size !== placeIds.length ||
    new Set(sourceRecordIds).size !== sourceRecordIds.length ||
    candidates.some(
      (candidate) => candidate.source_url !== snapshot.dataset_url,
    )
  ) {
    return null;
  }
  return value as unknown as PlaceCandidatesResponse;
}

export async function findPlaceCandidates(): Promise<PlaceCandidatesResponse> {
  const response = await fetch(PLACE_CANDIDATES_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      origin: BARCELONA_DEMO_ORIGIN,
      evaluation_datetime: new Date().toISOString(),
      required_features: {},
      maximum_distance_m: BARCELONA_DEMO_MAXIMUM_DISTANCE_M,
      limit: PLACE_CANDIDATES_LIMIT,
    }),
  });

  if (!response.ok) {
    throw new PlaceCandidatesClientError("unavailable");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new PlaceCandidatesClientError("malformed_response");
  }
  const parsed = parsePlaceCandidatesResponse(payload);
  if (parsed === null) {
    throw new PlaceCandidatesClientError("malformed_response");
  }
  return parsed;
}
