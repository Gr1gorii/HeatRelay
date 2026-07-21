import { afterEach, describe, expect, it, vi } from "vitest";

import {
  PLACE_CANDIDATES_ENDPOINT,
  PlaceCandidatesClientError,
  findPlaceCandidates,
  parsePlaceCandidatesResponse,
} from "./place-candidates";

const DATASET_URL =
  "https://opendata-ajuntament.barcelona.cat/data/en/dataset/xarxa-refugis-climatics";

function candidate(sourceRecordId = "101") {
  return {
    place_id: `bcn-${sourceRecordId}`,
    source_record_id: sourceRecordId,
    name: `Climate shelter ${sourceRecordId}`,
    address: {
      street: "Carrer de la Prova",
      number: sourceRecordId,
      postal_code: "08001",
      city: "Barcelona",
    },
    district: "Ciutat Vella",
    neighborhood: "El Raval",
    latitude: 41.3874,
    longitude: 2.1686,
    distance_m: 125,
    closes_at: "2026-07-21T18:00:00+02:00",
    accessibility: null,
    features: {
      indoor_space: true,
      potable_water: null,
      toilets: false,
      micro_shelter: null,
      pets_allowed: true,
    },
    information_url: "https://example.org/place/101",
    schedule_verification_status: "verified",
    source_modified_at: "2026-07-15T10:00:00Z",
    source_url: DATASET_URL,
    last_checked: "2026-07-16",
  };
}

function validResponse() {
  return {
    candidates: [candidate()],
    snapshot: {
      schema_version: "1.0.0",
      snapshot_id: "barcelona-climate-shelters-v1-test",
      publisher: "Ajuntament de Barcelona",
      dataset_url: DATASET_URL,
      distribution_url: "https://example.org/places.json",
      retrieved_at: "2026-07-16T12:00:00Z",
      upstream_max_modified: "2026-07-15T10:00:00Z",
      license: "CC BY 4.0",
      license_url: "https://creativecommons.org/licenses/by/4.0/",
      attribution: "Barcelona City Council source data, normalized by HeatRelay.",
      normalized_sha256: "a".repeat(64),
    },
    explanation:
      "Candidates met the requested straight-line distance and schedule filters.",
    hours_warning:
      "Municipal opening hours may change; check the official source before travel.",
    candidate_notice:
      "These are factual candidate places, not medical recommendations.",
  };
}

function jsonResponse(body: unknown, ok = true): Pick<Response, "ok" | "json"> {
  return {
    ok,
    json: vi.fn().mockResolvedValue(body),
  };
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("parsePlaceCandidatesResponse", () => {
  it("accepts the complete strict candidate and provenance contract", () => {
    const payload = validResponse();

    expect(parsePlaceCandidatesResponse(payload)).toEqual(payload);
  });

  it.each([
    ["malformed candidate ID", (value: ReturnType<typeof validResponse>) => {
      value.candidates[0].place_id = "BCN-101";
    }],
    ["mismatched source ID", (value: ReturnType<typeof validResponse>) => {
      value.candidates[0].source_record_id = "102";
    }],
    ["duplicate place ID", (value: ReturnType<typeof validResponse>) => {
      value.candidates.push({ ...candidate(), source_record_id: "102" });
    }],
    ["duplicate source ID", (value: ReturnType<typeof validResponse>) => {
      value.candidates.push({
        ...candidate("102"),
        source_record_id: "101",
      });
    }],
    ["non-finite latitude", (value: ReturnType<typeof validResponse>) => {
      value.candidates[0].latitude = Number.NaN;
    }],
    ["non-finite longitude", (value: ReturnType<typeof validResponse>) => {
      value.candidates[0].longitude = Number.POSITIVE_INFINITY;
    }],
    ["fractional distance", (value: ReturnType<typeof validResponse>) => {
      value.candidates[0].distance_m = 1.5;
    }],
    ["negative distance", (value: ReturnType<typeof validResponse>) => {
      value.candidates[0].distance_m = -1;
    }],
    ["distance beyond the requested boundary", (value: ReturnType<typeof validResponse>) => {
      value.candidates[0].distance_m = 3001;
    }],
    ["HTTP information URL", (value: ReturnType<typeof validResponse>) => {
      value.candidates[0].information_url = "http://example.org/place";
    }],
    ["credentialed source URL", (value: ReturnType<typeof validResponse>) => {
      value.candidates[0].source_url = "https://user:pass@example.org/data";
    }],
    ["naive closing time", (value: ReturnType<typeof validResponse>) => {
      value.candidates[0].closes_at = "2026-07-21T18:00:00";
    }],
    ["invalid checked date", (value: ReturnType<typeof validResponse>) => {
      value.candidates[0].last_checked = "2026-02-30";
    }],
    ["unverified schedule", (value: ReturnType<typeof validResponse>) => {
      value.candidates[0].schedule_verification_status = "unknown";
    }],
    ["mismatched candidate source", (value: ReturnType<typeof validResponse>) => {
      value.candidates[0].source_url = "https://example.org/other-source";
    }],
    ["malformed snapshot hash", (value: ReturnType<typeof validResponse>) => {
      value.snapshot.normalized_sha256 = "A".repeat(64);
    }],
    ["HTTP provenance URL", (value: ReturnType<typeof validResponse>) => {
      value.snapshot.dataset_url = "http://example.org/data";
    }],
    ["naive provenance datetime", (value: ReturnType<typeof validResponse>) => {
      value.snapshot.retrieved_at = "2026-07-16T12:00:00";
    }],
    ["extra response field", (value: ReturnType<typeof validResponse>) => {
      Object.assign(value, { raw_backend_detail: "private" });
    }],
  ])("rejects %s", (_, mutate) => {
    const payload = structuredClone(validResponse());
    mutate(payload);

    expect(parsePlaceCandidatesResponse(payload)).toBeNull();
  });

  it("rejects more candidates than the requested limit", () => {
    const payload = validResponse();
    payload.candidates = [candidate("101"), candidate("102"), candidate("103"), candidate("104")];

    expect(parsePlaceCandidatesResponse(payload)).toBeNull();
  });

  it.each([true, false, null])(
    "preserves accessibility %s and an honestly absent information URL",
    (accessibility) => {
      const payload = validResponse();
      Object.assign(payload.candidates[0], {
        accessibility,
        information_url: null,
      });

      expect(parsePlaceCandidatesResponse(payload)).toEqual(payload);
    },
  );
});

describe("findPlaceCandidates", () => {
  it("sends one exact fixed-origin request using the current device instant", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-21T12:34:56.789Z"));
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(validResponse()));
    vi.stubGlobal("fetch", fetchMock);

    await expect(findPlaceCandidates()).resolves.toEqual(validResponse());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(PLACE_CANDIDATES_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: { latitude: 41.3874, longitude: 2.1686 },
        evaluation_datetime: "2026-07-21T12:34:56.789Z",
        required_features: {},
        maximum_distance_m: 3000,
        limit: 3,
      }),
    });
  });

  it.each([
    ["HTTP failure", jsonResponse({ detail: { private: "do not expose" } }, false), "unavailable"],
    ["malformed response", jsonResponse({ private: "do not expose" }), "malformed_response"],
  ] as const)("fails closed without retrying after %s", async (_, response, kind) => {
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);

    await expect(findPlaceCandidates()).rejects.toEqual(
      expect.objectContaining<Partial<PlaceCandidatesClientError>>({ kind }),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
