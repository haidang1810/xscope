/**
 * Progress bar showing overall rank advancement across all tiers.
 * Each tier occupies an equal segment. Current tier fills based on rankProgress.
 */

import { motion } from "framer-motion";
import type { SessionScore } from "@xscope/shared";

const RANK_ORDER: SessionScore["rank"][] = ["bronze", "silver", "gold", "platinum", "diamond"];
const RANK_LABELS: Record<SessionScore["rank"], string> = {
  bronze: "B",
  silver: "S",
  gold: "G",
  platinum: "P",
  diamond: "D",
};

interface Props {
  rank: SessionScore["rank"];
  /** 0–100 progress percentage within the current rank tier. */
  rankProgress: number;
}

/** Animated progress bar showing overall rank progress across all tiers. */
export function RankProgressBar({ rank, rankProgress }: Props) {
  const clampedProgress = Math.min(100, Math.max(0, rankProgress));
  const rankIdx = RANK_ORDER.indexOf(rank);
  const totalTiers = RANK_ORDER.length;
  const isMax = rank === "diamond" && clampedProgress >= 100;

  // Overall percentage: completed tiers + current tier progress
  const overallPct = ((rankIdx + clampedProgress / 100) / totalTiers) * 100;

  return (
    <div style={{ width: "100%" }}>
      {/* Track with tier markers */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "8px",
          background: "var(--bg-secondary)",
          borderRadius: "4px",
          overflow: "hidden",
          border: "1px solid var(--border-panel)",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${isMax ? 100 : overallPct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            height: "100%",
            borderRadius: "4px",
            background: isMax
              ? "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary), var(--accent-primary))"
              : "linear-gradient(90deg, var(--accent-secondary), var(--accent-success))",
            boxShadow: "0 0 6px var(--accent-secondary)",
          }}
        />
      </div>

      {/* Rank labels below bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "4px",
          padding: "0 0",
        }}
      >
        {RANK_ORDER.map((r, i) => {
          const achieved = i < rankIdx || (i === rankIdx && clampedProgress > 0);
          const isCurrent = i === rankIdx;
          return (
            <span
              key={r}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "8px",
                fontWeight: isCurrent ? 700 : 400,
                color: achieved
                  ? "var(--accent-secondary)"
                  : isCurrent
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
                textShadow: isCurrent ? "0 0 4px var(--accent-secondary)" : "none",
                letterSpacing: "0.05em",
              }}
            >
              {RANK_LABELS[r]}
            </span>
          );
        })}
      </div>
    </div>
  );
}
