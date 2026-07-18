export type VisualMode = "standard" | "enhanced";

export const VISUAL_MODE_STORAGE_KEY = "heatrelay.visual-mode.v1";

const MORE_CONTRAST_QUERY = "(prefers-contrast: more)";

function browserWindow(): Window | null {
  return typeof window === "undefined" ? null : window;
}

function isVisualMode(value: string | null): value is VisualMode {
  return value === "standard" || value === "enhanced";
}

export function resolveInitialVisualMode(): VisualMode {
  const currentWindow = browserWindow();
  if (!currentWindow) {
    return "standard";
  }

  try {
    const storedMode = currentWindow.localStorage.getItem(
      VISUAL_MODE_STORAGE_KEY,
    );
    if (isVisualMode(storedMode)) {
      return storedMode;
    }
  } catch {
    // Local persistence is optional; system preference remains available.
  }

  try {
    if (
      typeof currentWindow.matchMedia === "function" &&
      currentWindow.matchMedia(MORE_CONTRAST_QUERY).matches
    ) {
      return "enhanced";
    }
  } catch {
    // Standard is the safe fallback when contrast detection is unavailable.
  }

  return "standard";
}

export function persistVisualMode(mode: VisualMode): void {
  const currentWindow = browserWindow();
  if (!currentWindow) {
    return;
  }

  try {
    currentWindow.localStorage.setItem(VISUAL_MODE_STORAGE_KEY, mode);
  } catch {
    // The selected in-memory mode remains active when persistence is blocked.
  }
}
