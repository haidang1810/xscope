/**
 * Session Scoreboard panel — rank badge, productivity score, stat grid,
 * rank progress bar, and error-free streak display.
 */

import { useDashboardStore } from "../../../store/dashboard-store";
import { FlipCounter } from "./flip-counter";
import { RankBadge } from "./rank-badge";
import { RankProgressBar } from "./rank-progress-bar";
import type { SessionScore } from "@xscope/shared";

const DEFAULT_SCORE: SessionScore = {
  filesCreated: 0,
  filesModified: 0,
  filesDeleted: 0,
  linesGenerated: 0,
  commandsExecuted: 0,
  commandSuccessRate: 100,
  longestErrorFreeStreak: 0,
  productivityScore: 0,
  rank: "bronze",
  rankProgress: 0,
};

interface StatRowProps {
  label: string;
  value: number;
  digits?: number;
  color?: string;
  suffix?: string;
}

function StatRow({ label, value, digits = 4, color, suffix }: StatRowProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "3px 0",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--text-secondary)",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </span>
      <span style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
        <FlipCounter value={value} digits={digits} color={color ?? "var(--text-primary)"} fontSize="12px" />
        {suffix && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-secondary)" }}>
            {suffix}
          </span>
        )}
      </span>
    </div>
  );
}

/** Session Scoreboard panel with rank, score, stats, and progress. */
export function SessionScoreboard() {
  const state = useDashboardStore((s) => s.state);
  const score: SessionScore = state?.score ?? DEFAULT_SCORE;

  const successPct = Math.round(score.commandSuccessRate * 100);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Top row: badge + productivity score */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
        <RankBadge rank={score.rank} />

        <div style={{ flex: 1, overflow: "visible" }}>
          {/* Score display */}
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--text-secondary)",
              letterSpacing: "0.1em",
              marginBottom: "4px",
            }}
          >
            PRODUCTIVITY SCORE
          </div>
          <FlipCounter
            value={score.productivityScore}
            digits={6}
            color="var(--accent-primary)"
            fontSize="22px"
          />

          {/* Streak */}
          {score.longestErrorFreeStreak > 0 && (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--accent-success)",
                marginTop: "4px",
              }}
            >
              🔥 {score.longestErrorFreeStreak} error-free streak
            </div>
          )}
        </div>
      </div>

      {/* Rank progress bar */}
      <RankProgressBar rank={score.rank} rankProgress={score.rankProgress} />

      {/* Stat grid */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <StatRow label="Files Created"   value={score.filesCreated}   digits={3} color="var(--accent-success)" />
        <StatRow label="Files Modified"  value={score.filesModified}  digits={3} color="var(--accent-secondary)" />
        <StatRow label="Files Deleted"   value={score.filesDeleted}   digits={3} color="var(--accent-danger)" />
        <StatRow label="Lines Generated" value={score.linesGenerated} digits={5} color="var(--text-primary)" />
        <StatRow label="Commands Run"    value={score.commandsExecuted} digits={4} color="var(--accent-warning)" />
        <StatRow label="Success Rate"    value={successPct}           digits={1} color="var(--accent-success)" suffix="%" />
      </div>
    </div>
  );
}
