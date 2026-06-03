// Centralized color constants used across all screens
// Previously every screen had its own `const C = {...}` -- this deduplicates them.

export const colors = {
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

export type Colors = typeof colors;
