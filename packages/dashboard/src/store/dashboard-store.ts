import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DashboardState } from "@xscope/shared";
import { THEME_ORDER, type ThemeName } from "../types/theme-types";

interface DashboardStore {
  // WebSocket data
  state: DashboardState | null;
  isConnected: boolean;
  isReconnecting: boolean;
  lastUpdate: number;

  // UI state
  theme: ThemeName;
  focusedPanel: string | null;
  isMuted: boolean;

  // Actions
  setFullState: (state: DashboardState) => void;
  applyDelta: (delta: Partial<DashboardState>) => void;
  setConnectionStatus: (connected: boolean, reconnecting?: boolean) => void;
  setTheme: (theme: ThemeName) => void;
  cycleTheme: () => void;
  setFocusedPanel: (panel: string | null) => void;
  toggleMute: () => void;
  resetSession: () => void;
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      // Initial state
      state: null,
      isConnected: false,
      isReconnecting: false,
      lastUpdate: 0,
      theme: "cyberpunk",
      focusedPanel: null,
      isMuted: false,

      setFullState: (state) =>
        set({ state, lastUpdate: Date.now() }),

      applyDelta: (delta) =>
        set((prev) => ({
          state: prev.state ? { ...prev.state, ...delta } : null,
          lastUpdate: Date.now(),
        })),

      setConnectionStatus: (connected, reconnecting = false) =>
        set({ isConnected: connected, isReconnecting: reconnecting }),

      setTheme: (theme) => {
        document.documentElement.setAttribute("data-theme", theme);
        set({ theme });
      },

      cycleTheme: () => {
        const { theme } = get();
        const idx = THEME_ORDER.indexOf(theme);
        const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
        document.documentElement.setAttribute("data-theme", next);
        set({ theme: next });
      },

      setFocusedPanel: (panel) => set({ focusedPanel: panel }),

      toggleMute: () => set((prev) => ({ isMuted: !prev.isMuted })),

      resetSession: () => set({ state: null, lastUpdate: 0 }),
    }),
    {
      // Only persist UI preferences — data comes from WebSocket
      name: "xscope-dashboard",
      partialize: (s) => ({ theme: s.theme, isMuted: s.isMuted }),
      onRehydrateStorage: () => (state) => {
        // Apply persisted theme to DOM on load
        if (state?.theme) {
          document.documentElement.setAttribute("data-theme", state.theme);
        }
      },
    }
  )
);
