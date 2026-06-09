// Centralized color constants used across all screens.
// Dark mode is the default; light mode infrastructure is ready.

export const darkColors = {
  bg: "#080c0a",
  surface: "#0f1610",
  surface2: "#162018",
  green: "#22c55e",
  blue: "#00d4ff",
  amber: "#ffb300",
  red: "#ff4757",
  purple: "#c084fc",
  orange: "#ff8c42",
  text: "#dceee0",
  muted: "#6b8c72",
  card: "rgba(22,32,24,0.9)",
  border: "rgba(34,197,94,0.12)",
};

export const lightColors = {
  bg: "#fafbfa",
  surface: "#ffffff",
  surface2: "#f0f3f1",
  green: "#22c55e",
  blue: "#00d4ff",
  amber: "#ffb300",
  red: "#ff4757",
  purple: "#c084fc",
  orange: "#ff8c42",
  text: "#111c14",
  muted: "#5a7d63",
  card: "rgba(255,255,255,0.98)",
  border: "rgba(0,0,0,0.08)",
};

// Default export: dark colors (used by all screens that do `import { colors }`)
export const colors = darkColors;

export type Colors = typeof darkColors;

// Returns the right palette for a given theme string
export function getColors(theme: "dark" | "light"): Colors {
  return theme === "light" ? lightColors : darkColors;
}
