import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";
import {
  VISUAL_MODE_STORAGE_KEY,
  type VisualMode,
} from "./visual-mode";

const DEMO_TEXT =
  "I am 69, I live alone, I have no air conditioning, I walk slowly, and I do not speak Spanish.";
const SYNTHETIC_SITUATION = "A synthetic heat-planning description.";

const WEATHER_NOTICE =
  "This is model-derived weather context from Open-Meteo, not an official heat warning.";
const PLAN_NOTICE =
  "This is informational heat-safety planning, not medical advice, a route, or a guarantee that a place will remain available.";
const HOURS_WARNING =
  "Synthetic opening hours can change; check the official source before travel.";
const DISTANCE_WARNING =
  "Distances are straight-line estimates only; no route or travel time is provided.";
const REACHABILITY_WARNING =
  "Being open at evaluation time does not prove the place can be reached before closing.";

const normalResponse = {
  branch: "normal",
  evaluation_time: "2026-07-17T08:00:00Z",
  priority: { priority: "act_now" },
  weather: {
    current: {
      temperature_c: 33,
      apparent_temperature_c: 34.5,
    },
    today: { temperature_max_c: 36 },
    notice: WEATHER_NOTICE,
  },
  plan: {
    now: {
      actions: [
        {
          code: "move_to_cooler_space",
          text: "Move to the coolest available synthetic space.",
          explanation: "This reduces synthetic heat exposure.",
        },
        {
          code: "travel_to_selected_place",
          text: "Consider the selected synthetic place after checking its hours.",
          explanation: "It came from the backend-approved synthetic candidates.",
        },
      ],
    },
    next_few_hours: {
      actions: [
        {
          code: "keep_drinking_water",
          text: "Keep synthetic water available.",
          explanation: "This supports a synthetic hydration plan.",
        },
      ],
    },
    tonight: {
      actions: [
        {
          code: "keep_water_nearby",
          text: "Keep synthetic water nearby tonight.",
          explanation: "This makes the synthetic plan easier to follow.",
        },
      ],
    },
    bring_items: [
      { code: "water", text: "Water" },
      { code: "phone", text: "A charged phone" },
    ],
    explanations: [
      {
        code: "forecast_at_or_above_36c",
        text: "The synthetic maximum meets the 36.0°C policy boundary.",
      },
      {
        code: "verified_open_candidate",
        text: "The synthetic place was verified open at evaluation time.",
      },
    ],
    local_phrase: {
      code: "catalan_request_cool_space",
      language: "ca",
      text: "Necessito un lloc fresc, si us plau.",
    },
    notice: PLAN_NOTICE,
  },
  selected_place: {
    place_id: "synthetic-place-001",
    name: "Barcelona Synthetic Cooling Centre",
    address: {
      street: "Carrer de Prova",
      number: "10",
      postal_code: "08001",
      city: "Barcelona",
    },
    district: "Synthetic District",
    neighborhood: "Synthetic Neighbourhood",
    distance_m: 725,
    closes_at: "2026-07-17T18:30:00Z",
    accessibility: null,
    features: {
      indoor_space: true,
      potable_water: true,
      toilets: false,
      micro_shelter: null,
      pets_allowed: null,
    },
    information_url: "https://example.test/synthetic-place",
    source_url: "https://example.test/synthetic-dataset",
    last_checked: "2026-07-15",
  },
  candidate_context: {
    explanation: "Synthetic candidates met the backend filters.",
    hours_warning: HOURS_WARNING,
    candidate_notice:
      "These are synthetic backend-approved candidates, not medical recommendations.",
    distance_warning: DISTANCE_WARNING,
    reachability_warning: REACHABILITY_WARNING,
  },
  notices: [
    "Synthetic HeatRelay policy does not prove an official warning is active.",
    HOURS_WARNING,
    DISTANCE_WARNING,
    REACHABILITY_WARNING,
    PLAN_NOTICE,
  ],
} as const;

const urgentResponse = {
  branch: "urgent",
  evaluation_time: "2026-07-17T08:00:00Z",
  urgent_contact: {
    service: "112 emergències",
    number: "112",
    instruction: "Call 112 now for emergency assistance.",
    source_url:
      "https://112.gencat.cat/es/us-del-112/preguntes-frequeents/",
  },
  actions: [
    {
      code: "contact_emergency_service_now",
      text: "Call 112 now.",
    },
    {
      code: "do_not_use_shelter_as_medical_substitute",
      text: "Climate shelters are not substitutes for medical attention.",
    },
  ],
  notices: [
    "Climate shelters are not substitutes for medical attention.",
    "Because a bounded warning symptom was explicitly reported, HeatRelay did not retrieve weather or places and did not ask GPT-5.6 for a plan.",
  ],
} as const;

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

function situationField(): HTMLTextAreaElement {
  return screen.getByRole("textbox", {
    name: /describe .*situation/i,
  }) as HTMLTextAreaElement;
}

function visualModeSelect(): HTMLSelectElement {
  return screen.getByRole("combobox", {
    name: "Visual mode",
  }) as HTMLSelectElement;
}

function appShell(): HTMLDivElement {
  const shell = document.querySelector<HTMLDivElement>(".app-shell");
  if (!shell) {
    throw new Error("Synthetic test setup expected the app shell.");
  }
  return shell;
}

function expectVisualMode(mode: VisualMode): void {
  expect(visualModeSelect().value).toBe(mode);
  expect(appShell().getAttribute("data-visual-mode")).toBe(mode);
  expect(document.querySelectorAll("[data-visual-mode]")).toHaveLength(1);
}

function stubMatchMedia(matches: boolean) {
  const matchMedia = vi.fn((query: string) =>
    ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    }) satisfies MediaQueryList,
  );
  vi.stubGlobal("matchMedia", matchMedia);
  return matchMedia;
}

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(values.keys())[index] ?? null;
    },
    removeItem(key: string) {
      values.delete(key);
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  } satisfies Storage;
}

function submitSituation(value = SYNTHETIC_SITUATION): void {
  fireEvent.change(situationField(), { target: { value } });
  fireEvent.click(
    screen.getByRole("button", { name: "Create my heat action plan" }),
  );
}

const fetchMock = vi.fn<typeof globalThis.fetch>();

async function expectMalformedSuccess(payload: unknown): Promise<void> {
  fetchMock.mockResolvedValue(jsonResponse(payload));
  render(<App />);
  submitSituation();

  const alert = await screen.findByRole("alert");
  expect(alert.textContent).toMatch(/response could not be safely displayed/i);
  expect(screen.queryByRole("heading", { name: "Urgent help" })).toBeNull();
  expect(screen.queryByRole("heading", { name: "Act now" })).toBeNull();
}

beforeEach(() => {
  vi.stubGlobal("localStorage", createMemoryStorage());
  stubMatchMedia(false);
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Visual mode preference foundation", () => {
  it.each([
    ["uses Standard without storage or a contrast match", null, false, "standard", true],
    ["uses Enhanced Visibility for a first-load contrast match", null, true, "enhanced", true],
    ["lets stored Standard override matching system contrast", "standard", true, "standard", false],
    ["restores stored Enhanced Visibility", "enhanced", false, "enhanced", false],
    ["falls through an invalid stored value", "invalid-mode", true, "enhanced", true],
  ] as const)(
    "%s",
    (_label, storedValue, contrastMatches, expectedMode, checksSystem) => {
      if (storedValue !== null) {
        window.localStorage.setItem(VISUAL_MODE_STORAGE_KEY, storedValue);
      }
      const matchMedia = stubMatchMedia(contrastMatches);
      const storageWrite = vi.spyOn(window.localStorage, "setItem");

      render(<App />);

      expectVisualMode(expectedMode);
      expect(storageWrite).not.toHaveBeenCalled();
      if (checksSystem) {
        expect(matchMedia).toHaveBeenCalledOnce();
        expect(matchMedia).toHaveBeenCalledWith("(prefers-contrast: more)");
      } else {
        expect(matchMedia).not.toHaveBeenCalled();
      }
    },
  );

  it("continues to system detection when storage reads throw", () => {
    stubMatchMedia(true);
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new Error("Synthetic blocked storage read");
    });

    expect(() => render(<App />)).not.toThrow();
    expectVisualMode("enhanced");
  });

  it.each(["missing", "throwing"] as const)(
    "falls back to Standard when matchMedia is %s",
    (failureMode) => {
      vi.stubGlobal(
        "matchMedia",
        failureMode === "missing"
          ? undefined
          : vi.fn(() => {
              throw new Error("Synthetic matchMedia failure");
            }),
      );

      expect(() => render(<App />)).not.toThrow();
      expectVisualMode("standard");
    },
  );

  it("renders one described native select with the exact option contract", () => {
    render(<App />);

    const select = visualModeSelect();
    expect(select.tagName).toBe("SELECT");
    expect(VISUAL_MODE_STORAGE_KEY).toBe("heatrelay.visual-mode.v1");
    expect(
      Array.from(select.options, (option) => [option.value, option.textContent]),
    ).toEqual([
      ["standard", "Standard"],
      ["enhanced", "Enhanced Visibility"],
    ]);
    const descriptionId = select.getAttribute("aria-describedby");
    expect(descriptionId).toBe("visual-mode-description");
    expect(document.getElementById(String(descriptionId))?.textContent).toMatch(
      /Enhanced Visibility is intended for people with low vision or anyone who prefers larger and clearer content\./,
    );
    expectVisualMode("standard");
  });

  it("switches both directions and writes only the approved key and values", () => {
    render(<App />);
    const storageWrite = vi.spyOn(window.localStorage, "setItem");

    fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });
    expectVisualMode("enhanced");
    fireEvent.change(visualModeSelect(), { target: { value: "standard" } });
    expectVisualMode("standard");

    expect(storageWrite.mock.calls).toEqual([
      [VISUAL_MODE_STORAGE_KEY, "enhanced"],
      [VISUAL_MODE_STORAGE_KEY, "standard"],
    ]);
  });

  it("keeps the selected session mode when storage writes throw", () => {
    render(<App />);
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("Synthetic blocked storage write");
    });

    expect(() =>
      fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } }),
    ).not.toThrow();
    expectVisualMode("enhanced");
  });

  it("restores an explicit preference after unmount and a fresh render", () => {
    render(<App />);
    fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });
    expectVisualMode("enhanced");

    cleanup();
    render(<App />);

    expectVisualMode("enhanced");
  });

  it("preserves entered situation text and makes no request while switching", () => {
    render(<App />);
    fireEvent.change(situationField(), { target: { value: SYNTHETIC_SITUATION } });

    fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });
    fireEvent.change(visualModeSelect(), { target: { value: "standard" } });

    expect(situationField().value).toBe(SYNTHETIC_SITUATION);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("stays enabled during loading without creating a duplicate request", async () => {
    let resolveFetch!: (response: Response) => void;
    fetchMock.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      }),
    );
    render(<App />);
    submitSituation();

    expect(visualModeSelect().disabled).toBe(false);
    fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });
    expectVisualMode("enhanced");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFetch(jsonResponse(normalResponse));
    });
    await screen.findByRole("heading", { name: "Act now" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each(["normal", "urgent", "error"] as const)(
    "remains available after a %s terminal state",
    async (terminalState) => {
      fetchMock.mockResolvedValue(
        terminalState === "normal"
          ? jsonResponse(normalResponse)
          : terminalState === "urgent"
            ? jsonResponse(urgentResponse)
            : jsonResponse({ detail: { message: "Synthetic hidden detail" } }, 503),
      );
      render(<App />);
      submitSituation();

      const terminal =
        terminalState === "normal"
          ? await screen.findByRole("heading", { name: "Act now" })
          : terminalState === "urgent"
            ? await screen.findByRole("heading", { name: "Urgent help" })
            : await screen.findByRole("alert");
      const requestCount = fetchMock.mock.calls.length;

      expect(visualModeSelect().disabled).toBe(false);
      fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });
      expectVisualMode("enhanced");
      expect(terminal.isConnected).toBe(true);
      expect(situationField().value).toBe(SYNTHETIC_SITUATION);
      expect(fetchMock).toHaveBeenCalledTimes(requestCount);
    },
  );

  it("never writes situation text to local storage", async () => {
    const storageWrite = vi.spyOn(window.localStorage, "setItem");
    fetchMock.mockResolvedValue(jsonResponse(normalResponse));
    render(<App />);

    submitSituation(SYNTHETIC_SITUATION);
    await screen.findByRole("heading", { name: "Act now" });

    expect(storageWrite).not.toHaveBeenCalled();
  });
});

describe("Barcelona action-plan flow", () => {
  it("renders an accessible initial form and explicit privacy boundary", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "From heat warning to a safe next step.",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: /create.*heat action plan/i }),
    ).toBeTruthy();
    expect(
      screen.getByRole("form", { name: "Create your heat action plan" }),
    ).toBeTruthy();

    const textarea = situationField();
    expect(textarea.getAttribute("aria-describedby")).toBe(
      "privacy-description identity-warning situation-hint character-count boundary-note",
    );
    expect(textarea.hasAttribute("aria-invalid")).toBe(false);
    expect(textarea.hasAttribute("aria-errormessage")).toBe(false);
    expect(screen.getByText(/2,000 code points/i)).toBeTruthy();
    expect(
      screen.getByText(/sent server-side.*GPT-5\.6 processing/i),
    ).toBeTruthy();
    expect(screen.getByText(/does not intentionally store/i)).toBeTruthy();
    expect(
      screen.getByText(/situation text stays.*not stored in browser storage/i),
    ).toBeTruthy();
    const privacyCopy = screen
      .getByRole("heading", { name: "Keep identifying details out" })
      .closest("article")
      ?.textContent?.replace(/\s+/g, " ");
    expect(privacyCopy).toContain(
      "Only the visual-mode preference is stored locally; it is never included in the action-plan request.",
    );
    expect(privacyCopy).not.toContain("non-sensitive");
    expect(privacyCopy).toContain(
      "Situation text stays in React memory in this browser, is sent only in the action-plan request body, and is not stored in browser storage.",
    );
    expect(
      screen.getByText(/never included in the action-plan request/i),
    ).toBeTruthy();
    expect(
      screen.getByText(
        /do not include names, contact details, addresses, or other identifying information/i,
      ),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Load Barcelona demo" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Create my heat action plan" }),
    ).toBeTruthy();
    expect(
      screen.getByText(/fixed Barcelona demo coordinates/i),
    ).toBeTruthy();
    expect(
      screen.getByText(/browser location is not available yet/i),
    ).toBeTruthy();
    expect(screen.getByText(/straight-line estimates/i)).toBeTruthy();
    expect(screen.getByText(/not medical or emergency advice/i)).toBeTruthy();
  });

  it("uses the associated field-error path for an empty submission", async () => {
    render(<App />);

    fireEvent.click(
      screen.getByRole("button", { name: "Create my heat action plan" }),
    );

    const textarea = situationField();
    const fieldError = document.getElementById("situation-error");
    expect(fieldError?.textContent).toBe(
      "Describe the situation before creating a plan.",
    );
    expect(textarea.getAttribute("aria-invalid")).toBe("true");
    expect(textarea.getAttribute("aria-errormessage")).toBe("situation-error");
    expect(textarea.getAttribute("aria-describedby")).toBe(
      "privacy-description identity-warning situation-hint character-count boundary-note situation-error",
    );
    await waitFor(() => expect(document.activeElement).toBe(textarea));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("removes the field error and its association when input is corrected", async () => {
    render(<App />);

    fireEvent.click(
      screen.getByRole("button", { name: "Create my heat action plan" }),
    );
    const textarea = situationField();
    await waitFor(() => expect(document.activeElement).toBe(textarea));

    fireEvent.change(textarea, { target: { value: SYNTHETIC_SITUATION } });

    expect(document.getElementById("situation-error")).toBeNull();
    expect(textarea.hasAttribute("aria-invalid")).toBe(false);
    expect(textarea.hasAttribute("aria-errormessage")).toBe(false);
    expect(textarea.getAttribute("aria-describedby")).toBe(
      "privacy-description identity-warning situation-hint character-count boundary-note",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps one programmatically focusable main target for the skip link", () => {
    render(<App />);

    const skipLink = screen.getByRole("link", { name: "Skip to main content" });
    const mainLandmarks = screen.getAllByRole("main");

    expect(skipLink.getAttribute("href")).toBe("#main-content");
    expect(mainLandmarks).toHaveLength(1);
    expect(mainLandmarks[0].id).toBe("main-content");
    expect(mainLandmarks[0].tabIndex).toBe(-1);
  });

  it("loads the synthetic Barcelona demo without submitting", () => {
    render(<App />);

    fireEvent.click(
      screen.getByRole("button", { name: "Load Barcelona demo" }),
    );

    expect(situationField().value).toBe(DEMO_TEXT);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends only the trimmed situation and fixed Barcelona request facts", async () => {
    fetchMock.mockResolvedValue(jsonResponse(normalResponse));
    render(<App />);
    const storageWrite = vi.spyOn(window.localStorage, "setItem");

    fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });

    submitSituation(`  ${SYNTHETIC_SITUATION}  `);

    await screen.findByRole("heading", { name: "Act now" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, options] = fetchMock.mock.calls[0];
    expect(endpoint).toBe("/api/v1/action-plan");
    expect(options?.method).toBe("POST");
    expect(options?.headers).toEqual({ "Content-Type": "application/json" });
    const body = JSON.parse(String(options?.body));
    expect(body).toEqual({
      situation_text: SYNTHETIC_SITUATION,
      origin: { latitude: 41.3874, longitude: 2.1686 },
      maximum_distance_m: 3000,
    });
    expect(Object.keys(body).sort()).toEqual([
      "maximum_distance_m",
      "origin",
      "situation_text",
    ]);
    expect(storageWrite.mock.calls).toEqual([
      [VISUAL_MODE_STORAGE_KEY, "enhanced"],
    ]);
    expect(JSON.stringify(body)).not.toContain("visual-mode");
    expect(JSON.stringify(body)).not.toContain("storage");
  });

  it("shows an accessible loading state and prevents duplicate requests", async () => {
    let resolveFetch!: (response: Response) => void;
    fetchMock.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      }),
    );
    render(<App />);

    submitSituation();

    const submit = screen.getByRole("button", {
      name: /creating your plan/i,
    }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    expect(screen.getByText(/creating.*action plan/i)).toBeTruthy();
    const form = submit.closest("form");
    expect(form?.getAttribute("aria-busy")).toBe("true");
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.getAttribute("aria-atomic")).toBe("true");
    expect(status.textContent).toBe("Creating your action plan.");

    fireEvent.submit(form as HTMLFormElement);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFetch(jsonResponse(normalResponse));
    });
    await screen.findByRole("heading", { name: "Act now" });
    expect(status.textContent).toBe("Your action plan is ready.");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("renders every normal-plan phase, weather fact, and selected-place fact", async () => {
    fetchMock.mockResolvedValue(jsonResponse(normalResponse));
    render(<App />);

    submitSituation();

    const priorityHeading = await screen.findByRole("heading", {
      name: "Act now",
    });
    expect(document.activeElement).toBe(priorityHeading);
    expect(screen.getByText(/17 Jul 2026.*10:00/i)).toBeTruthy();
    expect(screen.getByText("33.0°C", { selector: "strong" })).toBeTruthy();
    expect(screen.getByText("34.5°C", { selector: "strong" })).toBeTruthy();
    expect(screen.getByText("36.0°C", { selector: "strong" })).toBeTruthy();
    expect(screen.getAllByText(WEATHER_NOTICE).length).toBeGreaterThan(0);

    for (const phase of ["Now", "Next few hours", "Tonight"]) {
      expect(screen.getByRole("heading", { name: phase })).toBeTruthy();
    }
    for (const phase of [
      ...normalResponse.plan.now.actions,
      ...normalResponse.plan.next_few_hours.actions,
      ...normalResponse.plan.tonight.actions,
    ]) {
      expect(screen.getByText(phase.text)).toBeTruthy();
      expect(screen.getByText(phase.explanation)).toBeTruthy();
    }
    expect(screen.getByText("Water")).toBeTruthy();
    expect(screen.getByText("A charged phone")).toBeTruthy();
    for (const explanation of normalResponse.plan.explanations) {
      expect(screen.getByText(explanation.text)).toBeTruthy();
    }
    expect(
      screen.getByText("Necessito un lloc fresc, si us plau."),
    ).toBeTruthy();
    for (const notice of normalResponse.notices) {
      expect(screen.getAllByText(notice).length).toBeGreaterThan(0);
    }

    expect(
      screen.getByRole("heading", {
        name: "Barcelona Synthetic Cooling Centre",
      }),
    ).toBeTruthy();
    expect(
      screen.getByText(/Carrer de Prova 10.*08001 Barcelona/i),
    ).toBeTruthy();
    expect(screen.getByText(/725 m/)).toBeTruthy();
    expect(screen.getByText(/20:30/)).toBeTruthy();
    expect(screen.getByText(/accessibility status unknown/i)).toBeTruthy();
    expect(screen.getByText("Indoor space")).toBeTruthy();
    expect(screen.getByText("Drinking water")).toBeTruthy();
    expect(screen.getByText(/15 Jul 2026/i)).toBeTruthy();

    const officialLink = screen.getByRole("link", {
      name: /official information/i,
    });
    expect(officialLink.getAttribute("href")).toBe(
      "https://example.test/synthetic-place",
    );
    expect(officialLink.getAttribute("target")).toBe("_blank");
    expect(officialLink.getAttribute("rel")).toBe("noopener noreferrer");
    const sourceLink = screen.getByRole("link", { name: "Official source" });
    expect(sourceLink.getAttribute("target")).toBe("_blank");
    expect(sourceLink.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("exposes the weather summary as one native description list", async () => {
    fetchMock.mockResolvedValue(jsonResponse(normalResponse));
    render(<App />);

    submitSituation();
    await screen.findByRole("heading", { name: "Act now" });

    const summaries = document.querySelectorAll(
      'dl.summary-grid[aria-label="Weather summary"]',
    );
    expect(summaries).toHaveLength(1);
    const cards = Array.from(summaries[0].children);
    expect(cards).toHaveLength(3);
    expect(cards.map((card) => card.tagName)).toEqual(["DIV", "DIV", "DIV"]);
    expect(
      cards.map((card) => card.firstElementChild?.textContent),
    ).toEqual(["Current temperature", "Feels like", "Today’s maximum"]);
    expect(cards.map((card) => card.firstElementChild?.tagName)).toEqual([
      "DT",
      "DT",
      "DT",
    ]);
    expect(cards.map((card) => card.lastElementChild?.tagName)).toEqual([
      "DD",
      "DD",
      "DD",
    ]);
    expect(
      cards.map((card) => card.lastElementChild?.querySelector("strong")?.textContent),
    ).toEqual(["33.0°C", "34.5°C", "36.0°C"]);
  });

  it.each([
    ["prepare_now", "Prepare now"],
    ["monitor_and_prepare", "Monitor and prepare"],
  ] as const)(
    "renders the %s priority as %s",
    async (priority, label) => {
      fetchMock.mockResolvedValue(
        jsonResponse({
          ...normalResponse,
          priority: { priority },
        }),
      );
      render(<App />);

      submitSituation();

      expect(await screen.findByRole("heading", { name: label })).toBeTruthy();
    },
  );

  it("keeps the normal plan visible when no selected place is returned", async () => {
    const candidateExplanation =
      "No synthetic official place met the current filters. No fallback place was invented.";
    fetchMock.mockResolvedValue(
      jsonResponse({
        ...normalResponse,
        plan: {
          ...normalResponse.plan,
          bring_items: [],
          local_phrase: null,
        },
        selected_place: null,
        candidate_context: {
          ...normalResponse.candidate_context,
          explanation: candidateExplanation,
        },
      }),
    );
    render(<App />);

    submitSituation();

    await screen.findByRole("heading", { name: "Act now" });
    expect(screen.getByRole("heading", { name: "Now" })).toBeTruthy();
    expect(screen.getByText(candidateExplanation)).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: /no verified place/i }),
    ).toBeTruthy();
    expect(
      screen.queryByText("Barcelona Synthetic Cooling Centre"),
    ).toBeNull();
  });

  it("renders urgent help and omits every normal-plan surface", async () => {
    fetchMock.mockResolvedValue(jsonResponse(urgentResponse));
    render(<App />);

    submitSituation();

    const urgentHeading = await screen.findByRole("heading", {
      name: "Urgent help",
    });
    expect(document.activeElement).toBe(urgentHeading);
    expect(urgentHeading.closest('[role="alert"]')).toBeTruthy();
    expect(screen.getByText("112 emergències")).toBeTruthy();
    expect(screen.getByText("112")).toBeTruthy();
    expect(
      screen.getByText("Call 112 now for emergency assistance."),
    ).toBeTruthy();
    for (const action of urgentResponse.actions) {
      expect(screen.getAllByText(action.text).length).toBeGreaterThan(0);
    }
    for (const notice of urgentResponse.notices) {
      expect(screen.getAllByText(notice).length).toBeGreaterThan(0);
    }
    const sourceLink = screen.getByRole("link", {
      name: /official 112/i,
    });
    expect(sourceLink.getAttribute("target")).toBe("_blank");
    expect(sourceLink.getAttribute("rel")).toBe("noopener noreferrer");

    for (const phase of ["Now", "Next few hours", "Tonight"]) {
      expect(screen.queryByRole("heading", { name: phase })).toBeNull();
    }
    expect(screen.queryByText(/current temperature/i)).toBeNull();
    expect(screen.queryByText(/bring/i)).toBeNull();
    expect(screen.queryByText(/local phrase/i)).toBeNull();
    expect(
      screen.queryByText("Barcelona Synthetic Cooling Centre"),
    ).toBeNull();
  });

  it.each(["normal", "urgent", "error"] as const)(
    "clears a stale %s terminal state when the situation text changes",
    async (terminalState) => {
      fetchMock.mockResolvedValue(
        terminalState === "normal"
          ? jsonResponse(normalResponse)
          : terminalState === "urgent"
            ? jsonResponse(urgentResponse)
            : jsonResponse({ detail: { message: "Synthetic hidden detail" } }, 503),
      );
      render(<App />);
      submitSituation();

      const terminal =
        terminalState === "normal"
          ? await screen.findByRole("heading", { name: "Act now" })
          : terminalState === "urgent"
            ? await screen.findByRole("heading", { name: "Urgent help" })
            : await screen.findByRole("alert");
      expect(fetchMock).toHaveBeenCalledTimes(1);

      fireEvent.change(situationField(), {
        target: { value: "A changed synthetic situation." },
      });

      expect(terminal.isConnected).toBe(false);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );

  it.each(["normal", "urgent", "error"] as const)(
    "clears a stale %s terminal state when the Barcelona demo is loaded",
    async (terminalState) => {
      fetchMock.mockResolvedValue(
        terminalState === "normal"
          ? jsonResponse(normalResponse)
          : terminalState === "urgent"
            ? jsonResponse(urgentResponse)
            : jsonResponse({ detail: { message: "Synthetic hidden detail" } }, 503),
      );
      render(<App />);
      submitSituation();

      const terminal =
        terminalState === "normal"
          ? await screen.findByRole("heading", { name: "Act now" })
          : terminalState === "urgent"
            ? await screen.findByRole("heading", { name: "Urgent help" })
            : await screen.findByRole("alert");

      fireEvent.click(
        screen.getByRole("button", { name: "Load Barcelona demo" }),
      );

      expect(situationField().value).toBe(DEMO_TEXT);
      expect(terminal.isConnected).toBe(false);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );

  it.each([
    [
      "changed contact",
      {
        ...urgentResponse,
        urgent_contact: {
          ...urgentResponse.urgent_contact,
          service: "Forged emergency service",
        },
      },
    ],
    [
      "changed source",
      {
        ...urgentResponse,
        urgent_contact: {
          ...urgentResponse.urgent_contact,
          source_url: "https://example.test/forged-guidance",
        },
      },
    ],
    [
      "changed action code",
      {
        ...urgentResponse,
        actions: [
          { ...urgentResponse.actions[0], code: "forged_action" },
          urgentResponse.actions[1],
        ],
      },
    ],
    [
      "changed action text",
      {
        ...urgentResponse,
        actions: [
          { ...urgentResponse.actions[0], text: "Forged urgent action." },
          urgentResponse.actions[1],
        ],
      },
    ],
    ["missing action", { ...urgentResponse, actions: [urgentResponse.actions[0]] }],
    [
      "additional action",
      {
        ...urgentResponse,
        actions: [
          ...urgentResponse.actions,
          { code: "forged_action", text: "Forged urgent action." },
        ],
      },
    ],
    [
      "reordered actions",
      {
        ...urgentResponse,
        actions: [urgentResponse.actions[1], urgentResponse.actions[0]],
      },
    ],
    [
      "changed notice",
      {
        ...urgentResponse,
        notices: [urgentResponse.notices[0], "Forged urgent notice."],
      },
    ],
    ["missing notice", { ...urgentResponse, notices: [urgentResponse.notices[0]] }],
    [
      "additional notice",
      {
        ...urgentResponse,
        notices: [...urgentResponse.notices, "Forged urgent notice."],
      },
    ],
    [
      "reordered notices",
      {
        ...urgentResponse,
        notices: [urgentResponse.notices[1], urgentResponse.notices[0]],
      },
    ],
  ] as const)("rejects forged urgent content: %s", async (_label, payload) => {
    await expectMalformedSuccess(payload);
  });

  it.each([
    [
      "impossible normal evaluation time",
      {
        ...normalResponse,
        evaluation_time: "2026-02-30T08:00:00Z",
      },
    ],
    [
      "timezone-less normal evaluation time",
      {
        ...normalResponse,
        evaluation_time: "2026-07-17T08:00:00",
      },
    ],
    [
      "impossible urgent evaluation time",
      {
        ...urgentResponse,
        evaluation_time: "2026-02-30T08:00:00Z",
      },
    ],
    [
      "timezone-less urgent evaluation time",
      {
        ...urgentResponse,
        evaluation_time: "2026-07-17T08:00:00",
      },
    ],
    [
      "impossible closing time",
      {
        ...normalResponse,
        selected_place: {
          ...normalResponse.selected_place,
          closes_at: "2026-02-30T18:30:00Z",
        },
      },
    ],
    [
      "timezone-less closing time",
      {
        ...normalResponse,
        selected_place: {
          ...normalResponse.selected_place,
          closes_at: "2026-07-17T18:30:00",
        },
      },
    ],
    [
      "invalid time component",
      {
        ...normalResponse,
        evaluation_time: "2026-07-17T24:00:00Z",
      },
    ],
    [
      "invalid offset component",
      {
        ...normalResponse,
        selected_place: {
          ...normalResponse.selected_place,
          closes_at: "2026-07-17T18:30:00+24:00",
        },
      },
    ],
  ] as const)("rejects invalid datetime: %s", async (_label, payload) => {
    await expectMalformedSuccess(payload);
  });

  it.each([
    ["UTC Z", "2026-07-17T08:00:00Z", "2026-07-17T18:30:00Z"],
    [
      "numeric offset",
      "2026-07-17T10:00:00+02:00",
      "2026-07-17T20:30:00+02:00",
    ],
    [
      "fractional seconds",
      "2026-07-17T08:00:00.123456Z",
      "2026-07-17T18:30:00.654321Z",
    ],
  ] as const)(
    "accepts valid %s datetimes",
    async (_label, evaluationTime, closesAt) => {
      fetchMock.mockResolvedValue(
        jsonResponse({
          ...normalResponse,
          evaluation_time: evaluationTime,
          selected_place: {
            ...normalResponse.selected_place,
            closes_at: closesAt,
          },
        }),
      );
      render(<App />);
      submitSituation();

      expect(await screen.findByRole("heading", { name: "Act now" })).toBeTruthy();
      expect(
        screen.getByRole("heading", {
          name: "Barcelona Synthetic Cooling Centre",
        }),
      ).toBeTruthy();
    },
  );

  it.each([400, 422])(
    "maps HTTP %i invalid input to the safe associated field error",
    async (status) => {
      const response = jsonResponse(
        {
          detail: {
            code: "invalid_action_plan_request",
            message: "Synthetic raw backend detail that must stay hidden.",
          },
        },
        status,
      );
      fetchMock.mockResolvedValue(response);
      render(<App />);

      submitSituation();

      const fieldError = await screen.findByText(
        "Review the description and try again.",
      );
      const textarea = situationField();
      expect(fieldError.id).toBe("situation-error");
      expect(textarea.getAttribute("aria-invalid")).toBe("true");
      expect(textarea.getAttribute("aria-errormessage")).toBe(
        "situation-error",
      );
      expect(textarea.getAttribute("aria-describedby")).toBe(
        "privacy-description identity-warning situation-hint character-count boundary-note situation-error",
      );
      await waitFor(() => expect(document.activeElement).toBe(textarea));
      expect(screen.queryByRole("alert")).toBeNull();
      expect(document.body.textContent).not.toContain(
        "Synthetic raw backend detail",
      );
      expect(response.json).not.toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );

  it.each([502, 503, 504])(
    "maps backend status %i to the temporary-unavailable message",
    async (status) => {
      fetchMock.mockResolvedValue(
        jsonResponse({ detail: { message: "Hidden provider detail." } }, status),
      );
      render(<App />);

      submitSituation();

      const alert = await screen.findByRole("alert");
      expect(alert.textContent).toMatch(/action plan is temporarily unavailable/i);
      expect(alert.textContent).not.toContain("Hidden provider detail");
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );

  it("turns unknown success JSON into a safe malformed-response error", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ branch: "unknown", private_backend_value: "hidden" }),
    );
    render(<App />);

    submitSituation();

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/response could not be safely displayed/i);
    expect(alert.textContent).not.toContain("hidden");
  });

  it.each(["not-a-date", "2026-02-30"])(
    "rejects unsafe place date %s instead of crashing during rendering",
    async (lastChecked) => {
      fetchMock.mockResolvedValue(
        jsonResponse({
          ...normalResponse,
          selected_place: {
            ...normalResponse.selected_place,
            last_checked: lastChecked,
          },
        }),
      );
      render(<App />);

      submitSituation();

      const alert = await screen.findByRole("alert");
      expect(alert.textContent).toMatch(
        /response could not be safely displayed/i,
      );
      expect(
        screen.queryByRole("heading", {
          name: "Barcelona Synthetic Cooling Centre",
        }),
      ).toBeNull();
    },
  );

  it("turns invalid JSON into a safe malformed-response error", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi
        .fn()
        .mockRejectedValue(new SyntaxError("Synthetic parser detail")),
    } as unknown as Response);
    render(<App />);

    submitSituation();

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/response could not be safely displayed/i);
    expect(alert.textContent).not.toContain("Synthetic parser detail");
  });

  it("maps a fetch rejection to a fixed backend-connection error without retry", async () => {
    fetchMock.mockRejectedValue(new TypeError("Synthetic network detail"));
    render(<App />);

    submitSituation();

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/backend could not be reached/i);
    expect(alert.textContent).not.toContain("Synthetic network detail");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("never echoes submitted private text inside an error", async () => {
    const privateText =
      "PRIVATE-SYNTHETIC-SENTINEL: identifying details must not be echoed.";
    fetchMock.mockResolvedValue(
      jsonResponse({ detail: { message: privateText } }, 503),
    );
    render(<App />);

    submitSituation(privateText);

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).not.toContain(privateText);
  });

  it("validates the 2,000 limit by Unicode code points", async () => {
    fetchMock.mockResolvedValue(jsonResponse(urgentResponse));
    render(<App />);

    submitSituation("🧊man".repeat(500));

    await screen.findByRole("heading", { name: "Urgent help" });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    cleanup();
    fetchMock.mockClear();
    render(<App />);
    const textarea = situationField();
    fireEvent.change(textarea, { target: { value: "🧚".repeat(2001) } });

    expect(
      screen.getByText("2,001 / 2,000 code points — 1 over limit"),
    ).toBeTruthy();
    expect(textarea.getAttribute("aria-invalid")).toBe("true");
    expect(textarea.hasAttribute("aria-errormessage")).toBe(false);
    expect(document.getElementById("character-count")?.hasAttribute("aria-live")).toBe(
      false,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Create my heat action plan" }),
    );

    const fieldError = screen.getByText(
      "Keep the description within 2,000 Unicode characters.",
    );
    expect(fieldError.id).toBe("situation-error");
    expect(textarea.getAttribute("aria-errormessage")).toBe("situation-error");
    expect(textarea.getAttribute("aria-describedby")).toBe(
      "privacy-description identity-warning situation-hint character-count boundary-note situation-error",
    );
    await waitFor(() => expect(document.activeElement).toBe(textarea));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not request browser geolocation", async () => {
    const getCurrentPosition = vi.fn();
    const watchPosition = vi.fn();
    const originalDescriptor = Object.getOwnPropertyDescriptor(
      navigator,
      "geolocation",
    );
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition,
        watchPosition,
        clearWatch: vi.fn(),
      },
    });
    fetchMock.mockResolvedValue(jsonResponse(normalResponse));

    try {
      render(<App />);
      submitSituation();
      await screen.findByRole("heading", { name: "Act now" });

      expect(getCurrentPosition).not.toHaveBeenCalled();
      expect(watchPosition).not.toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(navigator, "geolocation", originalDescriptor);
      } else {
        Reflect.deleteProperty(navigator, "geolocation");
      }
    }
  });
});
