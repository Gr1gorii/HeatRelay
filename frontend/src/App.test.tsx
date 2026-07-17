import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "./App";

describe("HeatRelay shell", () => {
  it("renders the product boundary and safety notice", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "From heat warning to a safe next step.",
      }),
    ).toBeTruthy();
    expect(screen.getByText("Barcelona pilot", { selector: "h2" })).toBeTruthy();
    expect(
      screen.getByRole("heading", {
        name: "Not an official heat-warning service",
      }),
    ).toBeTruthy();
    expect(screen.getByText("Backend only")).toBeTruthy();
    expect(screen.getByText(/Barcelona pilot · Milestone 3/)).toBeTruthy();
    expect(
      screen.getByText(
        /bounded backend context, situation extraction, deterministic priority, and grounded plan services/,
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        /the interface still does not collect a situation or provide live guidance/,
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        /GPT-5.6 extraction and grounded action planning are implemented in the backend/,
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        /grounded action planning is available only through the backend API; frontend integration and live guidance remain unavailable/,
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "Frontend integration for backend GPT-5.6 extraction and grounded action planning",
      ),
    ).toBeTruthy();
  });
});
