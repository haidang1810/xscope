import "./token-flow-chart.css";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useDashboardStore } from "../../../store/dashboard-store";
import type { TurnTokens } from "@xscope/shared";
import { CustomBarShape } from "./custom-bar-shape";
import { FlowTooltip } from "./flow-tooltip";

const MAX_TURNS = 20;
const EMPTY_TURNS: TurnTokens[] = [];

interface ChartRow {
  turn: number;
  input: number;
  output: number;
  total: number;
  cachePercent: number;
  responseTimeMs: number;
  model: string;
  timestamp: string;
}

function turnToRow(t: TurnTokens, idx: number): ChartRow {
  const total = t.usage.totalTokens || 1;
  return {
    turn: idx + 1,
    input: t.usage.inputTokens,
    output: t.usage.outputTokens,
    total: t.usage.totalTokens,
    cachePercent: Math.round(t.cacheHitRate * 100),
    responseTimeMs: t.responseTimeMs,
    model: t.model,
    timestamp: t.timestamp,
  };
}

/**
 * Token Flow Waterfall — stacked bar chart (input + output per turn).
 * Shows last 20 turns. Gradient color bars via CustomBarShape.
 * Tooltip shows turn details on hover.
 */
export function TokenFlowChart() {
  const turns = useDashboardStore((s) => s.state?.turns ?? EMPTY_TURNS);

  const chartData = useMemo(() => {
    const slice = turns.slice(-MAX_TURNS);
    return slice.map((t, i) => turnToRow(t, turns.length - slice.length + i));
  }, [turns]);

  const maxTotal = useMemo(
    () => Math.max(1, ...chartData.map((d) => d.total)),
    [chartData]
  );

  if (chartData.length === 0) {
    return (
      <div className="token-flow-chart">
        <div className="token-flow-empty">Waiting for token data...</div>
      </div>
    );
  }

  return (
    <div className="token-flow-chart">
      {/* Legend */}
      <div className="token-flow-legend">
        <div className="token-flow-legend-item">
          <div className="token-flow-legend-dot" style={{ background: "#4488ff" }} />
          <span>Input</span>
        </div>
        <div className="token-flow-legend-item">
          <div className="token-flow-legend-dot" style={{ background: "#9944ff" }} />
          <span>Output</span>
        </div>
      </div>

      {/* Chart */}
      <div className="token-flow-chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            barCategoryGap="20%"
          >
            <CartesianGrid vertical={false} strokeDasharray="2 4" />
            <XAxis
              dataKey="turn"
              tick={{ fontSize: 9, fill: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
              tickLine={false}
              axisLine={false}
              label={{ value: "Turn", position: "insideBottomRight", offset: -4, fontSize: 9, fill: "var(--text-secondary)" }}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
            />
            <Tooltip
              content={<FlowTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
            />
            <Bar
              dataKey="input"
              stackId="tokens"
              isAnimationActive={chartData.length < 3}
              shape={(props: unknown) => (
                <CustomBarShape
                  {...(props as Record<string, unknown>)}
                  barType="input"
                  maxValue={maxTotal}
                />
              )}
            />
            <Bar
              dataKey="output"
              stackId="tokens"
              isAnimationActive={chartData.length < 3}
              shape={(props: unknown) => (
                <CustomBarShape
                  {...(props as Record<string, unknown>)}
                  barType="output"
                  maxValue={maxTotal}
                />
              )}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
