/**
 * Vibe Indicator panel — shows current session mood with animated emoji,
 * background tint matching mood, and reason text.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useDashboardStore } from "../../../store/dashboard-store";
import { MoodEmoji, MOOD_CONFIG } from "./mood-emoji";
import type { VibeMood } from "@xscope/shared";

const DEFAULT_MOOD: VibeMood = "idle";

/** Vibe Indicator panel with mood-tinted background. */
export function VibeIndicator() {
  const state = useDashboardStore((s) => s.state);

  const mood: VibeMood = (state?.vibe?.mood as VibeMood) ?? DEFAULT_MOOD;
  const reason = state?.vibe?.reason ?? "Waiting for activity…";
  const config = MOOD_CONFIG[mood] ?? MOOD_CONFIG.idle;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      {/* Animated background tint */}
      <AnimatePresence>
        <motion.div
          key={`bg-${mood}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: "absolute",
            inset: 0,
            background: config.bg,
            borderRadius: "inherit",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      </AnimatePresence>

      {/* Emoji + label layer */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MoodEmoji mood={mood} reason={reason} />
      </div>
    </div>
  );
}
