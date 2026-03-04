// Theme name union type for type-safe theme selection
export type ThemeName =
  | "cyberpunk"
  | "matrix"
  | "synthwave"
  | "nord"
  | "dracula"
  | "terminal-green";

// Panel area names matching grid-template-areas
export type PanelArea =
  | "banner"
  | "burn"
  | "flow"
  | "heatmap"
  | "context"
  | "command"
  | "errors"
  | "heartbeat"
  | "score"
  | "hotkeys";

// Ordered list of panels for 1-9 hotkey focus
export const PANEL_ORDER: PanelArea[] = [
  "banner",
  "burn",
  "flow",
  "heatmap",
  "context",
  "command",
  "errors",
];

export const THEME_ORDER: ThemeName[] = [
  "cyberpunk",
  "matrix",
  "synthwave",
  "nord",
  "dracula",
  "terminal-green",
];
