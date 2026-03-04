import { useEffect } from "react";
import { useDashboardStore } from "../store/dashboard-store";
import { PANEL_ORDER } from "../types/theme-types";

/**
 * Global hotkey handler. Ignores keypresses when an input/textarea is focused.
 *
 * T       — cycle theme
 * F       — toggle fullscreen
 * M       — toggle mute
 * R       — reset session
 * E       — (reserved: export markdown)
 * S       — (reserved: screenshot mode)
 * 1-9     — focus panel by index
 * Escape  — unfocus panel
 */
export function useHotkeys(): void {
  const { cycleTheme, toggleMute, resetSession, setFocusedPanel } =
    useDashboardStore();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Ignore when typing in an input field
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement).isContentEditable) return;

      // Ignore modifier combos (Ctrl+C etc)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key;

      switch (key) {
        case "t":
        case "T":
          e.preventDefault();
          cycleTheme();
          break;

        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;

        case "m":
        case "M":
          e.preventDefault();
          toggleMute();
          break;

        case "r":
        case "R":
          e.preventDefault();
          resetSession();
          break;

        case "Escape":
          e.preventDefault();
          setFocusedPanel(null);
          break;

        default:
          // 1-9: focus panel by index
          if (/^[1-9]$/.test(key)) {
            const idx = parseInt(key, 10) - 1;
            const panel = PANEL_ORDER[idx];
            if (panel) {
              e.preventDefault();
              setFocusedPanel(panel);
            }
          }
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cycleTheme, toggleMute, resetSession, setFocusedPanel]);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {
      // Fullscreen may be blocked by browser policy
    });
  } else {
    document.exitFullscreen().catch(() => {});
  }
}
