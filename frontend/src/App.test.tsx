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
  });
});
