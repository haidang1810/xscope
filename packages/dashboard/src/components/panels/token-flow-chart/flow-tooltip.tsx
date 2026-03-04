interface FlowTooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface TooltipPayload {
  turn: number;
  input: number;
  output: number;
  total: number;
  cachePercent: number;
  responseTimeMs: number;
  model: string;
  timestamp: string;
}

interface FlowTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: TooltipPayload; dataKey: string; value: number; color: string }>;
  label?: string | number;
}

/**
 * Custom Recharts tooltip for Token Flow Waterfall.
 * Shows turn details: tokens breakdown, cache hit %, response time, model.
 */
export function FlowTooltip({ active, payload }: FlowTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-panel)",
        borderRadius: "6px",
        padding: "8px 10px",
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        color: "var(--text-primary)",
        minWidth: "140px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ marginBottom: "6px", color: "var(--accent-secondary)", fontWeight: 700 }}>
        Turn #{data.turn}
      </div>

      <Row label="Input" value={data.input.toLocaleString()} color="#4488ff" />
      <Row label="Output" value={data.output.toLocaleString()} color="#9944ff" />
      <Row label="Total" value={data.total.toLocaleString()} color="var(--text-primary)" />

      <div style={{ margin: "5px 0", borderTop: "1px solid var(--border-panel)" }} />

      <Row label="Cache hit" value={`${data.cachePercent.toFixed(0)}%`} />
      <Row label="Response" value={`${data.responseTimeMs}ms`} />
      <Row label="Model" value={data.model.replace("claude-", "")} />
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", lineHeight: "1.6" }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ color: color ?? "var(--text-primary)", fontWeight: 600 }}>{value}</span>
    </div>
  );
}
