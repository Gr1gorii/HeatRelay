export const ACTION_PLAN_ENDPOINT = "/api/v1/action-plan";
export const BARCELONA_DEMO_ORIGIN = {
  latitude: 41.3874,
  longitude: 2.1686,
} as const;
export const BARCELONA_DEMO_MAXIMUM_DISTANCE_M = 3000;
export const SITUATION_TEXT_LIMIT = 2000;
export const BARCELONA_DEMO_TEXT =
  "I am 69, I live alone, I have no air conditioning, I walk slowly, and I do not speak Spanish.";

const FIXED_URGENT_CONTACT = {
  service: "112 emergències",
  number: "112",
  instruction: "Call 112 now for emergency assistance.",
  source_url:
    "https://112.gencat.cat/es/us-del-112/preguntes-frequeents/",
} as const;

const FIXED_URGENT_ACTIONS = [
  {
    code: "contact_emergency_service_now",
    text: "Call 112 now.",
  },
  {
    code: "do_not_use_shelter_as_medical_substitute",
    text: "Climate shelters are not substitutes for medical attention.",
  },
] as const;

const FIXED_URGENT_NOTICES = [
  "Climate shelters are not substitutes for medical attention.",
  "Because a bounded warning symptom was explicitly reported, HeatRelay did not retrieve weather or places and did not ask GPT-5.6 for a plan.",
] as const;

export type PriorityCode =
  | "act_now"
  | "prepare_now"
  | "monitor_and_prepare";

export interface HydratedAction {
  code: string;
  text: string;
  explanation: string;
}

export interface PlanPhase {
  actions: HydratedAction[];
}

export interface SelectedPlace {
  place_id: string;
  name: string;
  address: {
    street: string | null;
    number: string | null;
    postal_code: string | null;
    city: string | null;
  };
  district: string | null;
  neighborhood: string | null;
  distance_m: number;
  closes_at: string;
  accessibility: boolean | null;
  features: {
    indoor_space: boolean | null;
    potable_water: boolean | null;
    toilets: boolean | null;
    micro_shelter: boolean | null;
    pets_allowed: boolean | null;
  };
  information_url: string | null;
  source_url: string;
  last_checked: string;
}

export interface NormalActionPlanResponse {
  branch: "normal";
  evaluation_time: string;
  priority: { priority: PriorityCode };
  weather: {
    current: {
      temperature_c: number;
      apparent_temperature_c: number;
    };
    today: { temperature_max_c: number };
    notice: string;
  };
  plan: {
    now: PlanPhase;
    next_few_hours: PlanPhase;
    tonight: PlanPhase;
    bring_items: Array<{ code: string; text: string }>;
    explanations: Array<{ code: string; text: string }>;
    local_phrase: {
      code: string;
      language: "es" | "ca";
      text: string;
    } | null;
    notice: string;
  };
  selected_place: SelectedPlace | null;
  candidate_context: {
    explanation: string;
    hours_warning: string;
    candidate_notice: string;
    distance_warning: string;
    reachability_warning: string;
  };
  notices: string[];
}

export interface UrgentActionPlanResponse {
  branch: "urgent";
  evaluation_time: string;
  urgent_contact: {
    service: string;
    number: string;
    instruction: string;
    source_url: string;
  };
  actions: Array<{ code: string; text: string }>;
  notices: string[];
}

export type ActionPlanResponse =
  | NormalActionPlanResponse
  | UrgentActionPlanResponse;

export type ActionPlanClientErrorKind =
  | "invalid_input"
  | "unavailable"
  | "malformed_response";

export class ActionPlanClientError extends Error {
  readonly kind: ActionPlanClientErrorKind;

  constructor(kind: ActionPlanClientErrorKind) {
    super(kind);
    this.name = "ActionPlanClientError";
    this.kind = kind;
  }
}

export function countCodePoints(value: string): number {
  return Array.from(value).length;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isStrictIsoDateTime(value: unknown): value is string {
  if (!isString(value)) {
    return false;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-](\d{2}):(\d{2}))$/.exec(
    value,
  );
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const isLeapYear =
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    isLeapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  if (
    year < 1 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth[month - 1] ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    return false;
  }
  if (
    match[7] !== "Z" &&
    (Number(match[8]) > 23 || Number(match[9]) > 59)
  ) {
    return false;
  }
  return !Number.isNaN(Date.parse(value));
}

function isDateOnly(value: unknown): value is string {
  if (!isString(value) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(timestamp) &&
    new Date(timestamp).toISOString().slice(0, 10) === value
  );
}

function isSafeHttpUrl(value: unknown): value is string {
  if (
    !isString(value) ||
    value !== value.trim() ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return false;
  }
  try {
    const parsed = new URL(value);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      parsed.username === "" &&
      parsed.password === ""
    );
  } catch {
    return false;
  }
}

function isAction(value: unknown): value is HydratedAction {
  return (
    isRecord(value) &&
    isString(value.code) &&
    isString(value.text) &&
    isString(value.explanation)
  );
}

function isPhase(value: unknown): value is PlanPhase {
  return (
    isRecord(value) && Array.isArray(value.actions) && value.actions.every(isAction)
  );
}

function hasTextItems(value: unknown): value is Array<{ code: string; text: string }> {
  return (
    Array.isArray(value) &&
    value.every(
      (item) => isRecord(item) && isString(item.code) && isString(item.text),
    )
  );
}

function hasExactTextItems(
  value: unknown,
  expected: ReadonlyArray<{ readonly code: string; readonly text: string }>,
): boolean {
  return (
    Array.isArray(value) &&
    value.length === expected.length &&
    value.every(
      (item, index) =>
        isRecord(item) &&
        item.code === expected[index].code &&
        item.text === expected[index].text,
    )
  );
}

function hasExactStrings(
  value: unknown,
  expected: readonly string[],
): boolean {
  return (
    Array.isArray(value) &&
    value.length === expected.length &&
    value.every((item, index) => item === expected[index])
  );
}

function isSelectedPlace(value: unknown): value is SelectedPlace {
  if (!isRecord(value) || !isRecord(value.address) || !isRecord(value.features)) {
    return false;
  }
  const address = value.address;
  const features = value.features;
  const featureValues = [
    features.indoor_space,
    features.potable_water,
    features.toilets,
    features.micro_shelter,
    features.pets_allowed,
  ];
  return (
    isString(value.place_id) &&
    isString(value.name) &&
    isNullableString(address.street) &&
    isNullableString(address.number) &&
    isNullableString(address.postal_code) &&
    isNullableString(address.city) &&
    isNullableString(value.district) &&
    isNullableString(value.neighborhood) &&
    isFiniteNumber(value.distance_m) &&
    value.distance_m >= 0 &&
    isStrictIsoDateTime(value.closes_at) &&
    (value.accessibility === null || typeof value.accessibility === "boolean") &&
    featureValues.every(
      (feature) => feature === null || typeof feature === "boolean",
    ) &&
    (value.information_url === null || isSafeHttpUrl(value.information_url)) &&
    isSafeHttpUrl(value.source_url) &&
    isDateOnly(value.last_checked)
  );
}

function isNormalResponse(value: Record<string, unknown>): boolean {
  if (
    value.branch !== "normal" ||
    !isStrictIsoDateTime(value.evaluation_time) ||
    !isRecord(value.priority) ||
    !isRecord(value.weather) ||
    !isRecord(value.plan) ||
    !isRecord(value.candidate_context) ||
    !isStringArray(value.notices)
  ) {
    return false;
  }
  const priority = value.priority.priority;
  const weather = value.weather;
  const plan = value.plan;
  const candidateContext = value.candidate_context;
  if (
    !["act_now", "prepare_now", "monitor_and_prepare"].includes(
      String(priority),
    ) ||
    !isRecord(weather.current) ||
    !isRecord(weather.today) ||
    !isFiniteNumber(weather.current.temperature_c) ||
    !isFiniteNumber(weather.current.apparent_temperature_c) ||
    !isFiniteNumber(weather.today.temperature_max_c) ||
    !isString(weather.notice) ||
    !isPhase(plan.now) ||
    !isPhase(plan.next_few_hours) ||
    !isPhase(plan.tonight) ||
    !hasTextItems(plan.bring_items) ||
    !hasTextItems(plan.explanations) ||
    !isString(plan.notice) ||
    !isString(candidateContext.explanation) ||
    !isString(candidateContext.hours_warning) ||
    !isString(candidateContext.candidate_notice) ||
    !isString(candidateContext.distance_warning) ||
    !isString(candidateContext.reachability_warning)
  ) {
    return false;
  }
  if (
    plan.local_phrase !== null &&
    (!isRecord(plan.local_phrase) ||
      !isString(plan.local_phrase.code) ||
      !["es", "ca"].includes(String(plan.local_phrase.language)) ||
      !isString(plan.local_phrase.text))
  ) {
    return false;
  }
  return value.selected_place === null || isSelectedPlace(value.selected_place);
}

function isUrgentResponse(value: Record<string, unknown>): boolean {
  if (
    value.branch !== "urgent" ||
    !isStrictIsoDateTime(value.evaluation_time) ||
    !isRecord(value.urgent_contact) ||
    !hasExactTextItems(value.actions, FIXED_URGENT_ACTIONS) ||
    !hasExactStrings(value.notices, FIXED_URGENT_NOTICES)
  ) {
    return false;
  }
  const contact = value.urgent_contact;
  return (
    contact.service === FIXED_URGENT_CONTACT.service &&
    contact.number === FIXED_URGENT_CONTACT.number &&
    contact.instruction === FIXED_URGENT_CONTACT.instruction &&
    contact.source_url === FIXED_URGENT_CONTACT.source_url
  );
}

export function parseActionPlanResponse(value: unknown): ActionPlanResponse | null {
  if (!isRecord(value)) {
    return null;
  }
  if (isUrgentResponse(value)) {
    return value as unknown as UrgentActionPlanResponse;
  }
  if (isNormalResponse(value)) {
    return value as unknown as NormalActionPlanResponse;
  }
  return null;
}

export async function createActionPlan(
  situationText: string,
): Promise<ActionPlanResponse> {
  const response = await fetch(ACTION_PLAN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      situation_text: situationText,
      origin: BARCELONA_DEMO_ORIGIN,
      maximum_distance_m: BARCELONA_DEMO_MAXIMUM_DISTANCE_M,
    }),
  });

  if (!response.ok) {
    throw new ActionPlanClientError(
      response.status === 400 || response.status === 422
        ? "invalid_input"
        : "unavailable",
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ActionPlanClientError("malformed_response");
  }
  const parsed = parseActionPlanResponse(payload);
  if (parsed === null) {
    throw new ActionPlanClientError("malformed_response");
  }
  return parsed;
}
