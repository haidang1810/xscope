/**
 * Rank badge — shield SVG with tier color and glow.
 * Burst animation on rank-up via Framer Motion scale pulse.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { SessionScore } from "@xscope/shared";

type Rank = SessionScore["rank"];

const RANK_COLORS: Record<Rank, { primary: string; glow: string; label: string }> = {
  bronze:   { primary: "#cd7f32", glow: "#cd7f3244", label: "BRONZE" },
  silver:   { primary: "#c0c0c0", glow: "#c0c0c044", label: "SILVER" },
  gold:     { primary: "#ffd700", glow: "#ffd70044", label: "GOLD" },
  platinum: { primary: "#e5e4e2", glow: "#e5e4e244", label: "PLATINUM" },
  diamond:  { primary: "#b9f2ff", glow: "#b9f2ff44", label: "DIAMOND" },
};

interface Props {
  rank: Rank;
}

/** Animated shield badge for current session rank tier. */
export function RankBadge({ rank }: Props) {
  const colors = RANK_COLORS[rank] ?? RANK_COLORS.bronze;

  return (
    <div style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      {/* Burst glow behind badge on mount */}
      <AnimatePresence>
        <motion.div
          key={rank}
          initial={{ scale: 0.5, opacity: 0.8 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: colors.glow,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      </AnimatePresence>

      {/* Shield SVG */}
      <motion.div
        key={`shield-${rank}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        style={{ position: "relative", zIndex: 1 }}
      >
        <svg
          width="44"
          height="52"
          viewBox="0 0 44 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={`${colors.label} rank`}
        >
          {/* Outer shield */}
          <path
            d="M22 2L4 10V24C4 35 12 44.5 22 50C32 44.5 40 35 40 24V10L22 2Z"
            fill={colors.glow}
            stroke={colors.primary}
            strokeWidth="2"
          />
          {/* Inner shield highlight */}
          <path
            d="M22 8L8 15V25C8 33 14 40.5 22 45C30 40.5 36 33 36 25V15L22 8Z"
            fill="rgba(0,0,0,0.3)"
            stroke={colors.primary}
            strokeWidth="1"
            strokeOpacity="0.4"
          />
          {/* Rank initial */}
          <text
            x="22"
            y="31"
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontWeight="bold"
            fontSize="14"
            fill={colors.primary}
          >
            {colors.label[0]}
          </text>
        </svg>
      </motion.div>

      {/* Rank label */}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: colors.primary,
          textShadow: `0 0 8px ${colors.primary}`,
        }}
      >
        {colors.label}
      </span>
    </div>
  );
}
