import { useDashboardStore } from "../store/dashboard-store";

/**
 * Inline connection dot + CPU/RAM vitals.
 * Rendered inside a panel-title-bar via the titleRight prop.
 */
export function ConnectionStatus() {
  const { isConnected, isReconnecting } = useDashboardStore();
  const vitals = useDashboardStore((s) => s.state?.systemVitals);

  const label = isConnected
    ? "Connected"
    : isReconnecting
      ? "Reconnecting…"
      : "Disconnected";

  const dotColor = isConnected
    ? "bg-green-400 shadow-[0_0_6px_#4ade80]"
    : isReconnecting
      ? "bg-yellow-400 shadow-[0_0_6px_#facc15] animate-pulse"
      : "bg-red-500 shadow-[0_0_6px_#ef4444]";

  const cpu = vitals?.cpuUsagePercent ?? 0;
  const ramUsed = vitals?.ramUsedMb ?? 0;
  const ramTotal = vitals?.ramTotalMb ?? 1;
  const ramPct = Math.round((ramUsed / ramTotal) * 100);

  const mono10: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    letterSpacing: "0.08em",
    color: "var(--text-secondary)",
  };

  return (
    <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      {/* Connection dot + label */}
      <span
        className={`inline-block w-2 h-2 rounded-full ${dotColor}`}
        aria-hidden="true"
      />
      <span style={{ ...mono10, textTransform: "uppercase" }}>
        {label}
      </span>

      {/* Separator */}
      <span style={{ width: "1px", height: "12px", background: "var(--border-panel)" }} />

      {/* CPU */}
      <span style={mono10}>
        CPU <span style={{ color: getColor(cpu) }}>{cpu}%</span>
      </span>

      {/* RAM */}
      <span style={mono10}>
        RAM <span style={{ color: getColor(ramPct) }}>{ramPct}%</span>
      </span>
    </span>
  );
}

function getColor(pct: number): string {
  if (pct > 80) return "#ef4444";
  if (pct > 50) return "#eab308";
  return "var(--accent-success)";
}
