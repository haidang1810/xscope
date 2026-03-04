import { useEffect } from "react";
import { DashboardGrid } from "./components/layout/dashboard-grid";
import { FocusOverlay } from "./components/layout/focus-overlay";
import { PanelCard } from "./components/panel-card";
import { ConnectionStatus } from "./components/connection-status";
import { useWebSocket } from "./hooks/use-websocket";
import { useHotkeys } from "./hooks/use-hotkeys";
import { useDashboardStore } from "./store/dashboard-store";
import { TokenBurnMeter } from "./components/panels/token-burn-meter/token-burn-meter";
import { TokenFlowChart } from "./components/panels/token-flow-chart/token-flow-chart";
import { ContextGauge } from "./components/panels/context-gauge/context-gauge";
import { ProjectBanner } from "./components/panels/project-banner/project-banner";
import { SessionHeartbeat } from "./components/panels/session-heartbeat/session-heartbeat";
import { SessionScoreboard } from "./components/panels/session-scoreboard/session-scoreboard";
import { FileHeatmap } from "./components/panels/file-heatmap";
import { CommandArsenal } from "./components/panels/command-arsenal";
import { ErrorGraveyard } from "./components/panels/error-graveyard";
import { ScreenshotButton } from "./components/screenshot-button";

// WebSocket URL: in dev Vite proxies /ws → CLI port 5757
const WS_URL = `ws://${window.location.host}/ws`;

/**
 * Root application component.
 * Wires WebSocket connection, hotkeys, theme, and renders the 12-panel grid.
 */
export function App() {
  useWebSocket(WS_URL);
  useHotkeys();

  // Apply persisted theme to DOM on first render
  const theme = useDashboardStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <>
      <FocusOverlay />
      <DashboardGrid>
        <PanelCard area="banner" title="Project" icon="◈" titleRight={<><ConnectionStatus /><ScreenshotButton /></>}>
          <ProjectBanner />
        </PanelCard>

        <PanelCard area="burn" title="Token Burn Meter" icon="🔥">
          <TokenBurnMeter />
        </PanelCard>

        <PanelCard area="flow" title="Token Flow Waterfall" icon="◬">
          <TokenFlowChart />
        </PanelCard>

        <PanelCard area="context" title="Context Gauge" icon="◎">
          <ContextGauge />
        </PanelCard>

        <PanelCard area="heatmap" title="File Heatmap" icon="▦">
          <FileHeatmap />
        </PanelCard>

        <PanelCard area="command" title="Command Arsenal" icon="▶">
          <CommandArsenal />
        </PanelCard>

        <PanelCard area="errors" title="Error Graveyard" icon="☠">
          <ErrorGraveyard />
        </PanelCard>

        <PanelCard area="heartbeat" title="Session Heartbeat" icon="♡">
          <SessionHeartbeat />
        </PanelCard>

        <PanelCard area="score" title="Scoreboard" icon="★">
          <SessionScoreboard />
        </PanelCard>

        <PanelCard area="hotkeys" title="Hotkeys" icon="⌨">
          <HotkeyReference />
        </PanelCard>
      </DashboardGrid>
    </>
  );
}

/** Inline hotkey reference panel — replaces placeholder with real content. */
function HotkeyReference() {
  const keys: [string, string][] = [
    ["T", "Cycle theme"],
    ["F", "Toggle fullscreen"],
    ["M", "Toggle mute"],
    ["R", "Reset session"],
    ["1-9", "Focus panel"],
    ["Esc", "Unfocus panel"],
    ["Dbl-click", "Focus panel"],
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        padding: "4px 0",
      }}
    >
      {keys.map(([key, desc]) => (
        <div
          key={key}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
          }}
        >
          <kbd
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-panel)",
              borderRadius: "4px",
              padding: "2px 6px",
              color: "var(--accent-primary)",
              minWidth: "52px",
              textAlign: "center",
              fontSize: "10px",
              flexShrink: 0,
            }}
          >
            {key}
          </kbd>
          <span style={{ color: "var(--text-secondary)" }}>{desc}</span>
        </div>
      ))}
    </div>
  );
}
