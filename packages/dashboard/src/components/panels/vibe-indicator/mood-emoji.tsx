/**
 * Animated emoji display for current vibe mood.
 * Uses Framer Motion AnimatePresence for spring-bounce transitions.
 */

import { AnimatePresence, motion } from "framer-motion";
import type { VibeMood } from "@xscope/shared";

export interface MoodConfig {
  emoji: string;
  label: string;
  bg: string;
}

export const MOOD_CONFIG: Record<VibeMood, MoodConfig> = {
  shipping:   { emoji: "🚀", label: "Shipping Fast",  bg: "rgba(0, 68, 34, 0.35)" },
  on_fire:    { emoji: "🔥", label: "On Fire",        bg: "rgba(68, 34, 0, 0.35)" },
  bug_hell:   { emoji: "💀", label: "Bug Hell",       bg: "rgba(68, 0, 0, 0.35)" },
  idle:       { emoji: "😴", label: "Idle",           bg: "rgba(30, 30, 50, 0.35)" },
  focused:    { emoji: "🎯", label: "Focused",        bg: "rgba(0, 51, 34, 0.35)" },
  money_burn: { emoji: "💸", label: "Money Burn",     bg: "rgba(51, 34, 0, 0.35)" },
  victory:    { emoji: "🏆", label: "Victory",        bg: "rgba(51, 51, 0, 0.35)" },
};

interface Props {
  mood: VibeMood;
  reason: string;
}

/** Large emoji that bounces in/out on mood change. */
export function MoodEmoji({ mood, reason }: Props) {
  const config = MOOD_CONFIG[mood] ?? MOOD_CONFIG.idle;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        width: "100%",
        height: "100%",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={mood}
          initial={{ scale: 0.3, opacity: 0, rotate: -15 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          style={{ lineHeight: 1, userSelect: "none" }}
        >
          <span style={{ fontSize: "clamp(36px, 5vw, 52px)" }}>{config.emoji}</span>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={`label-${mood}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          style={{ textAlign: "center" }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {config.label}
          </div>
          {reason && (
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "11px",
                color: "var(--text-secondary)",
                marginTop: "2px",
                maxWidth: "180px",
              }}
            >
              {reason}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
