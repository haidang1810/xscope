import { useDashboardStore } from "../../store/dashboard-store";
import { motion, AnimatePresence } from "framer-motion";

/** Error graveyard — tombstones for each error */
export function ErrorGraveyard() {
  const errors = useDashboardStore((s) => s.state?.errors);

  if (!errors || errors.length === 0) {
    return (
      <div style={{ color: "var(--text-secondary)", fontSize: "13px", textAlign: "center", padding: "20px" }}>
        No errors — smooth sailing! ⛵
      </div>
    );
  }

  const killStreak = errors.length;
  const streakText =
    killStreak >= 5 ? "PENTA KILL 💀" :
    killStreak >= 3 ? "TRIPLE KILL" :
    killStreak >= 2 ? "DOUBLE KILL" : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Skull counter */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", justifyContent: "space-between", flexShrink: 0 }}>
        <motion.span
          key={killStreak}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
          style={{ fontSize: "14px", fontWeight: 700, color: "var(--accent-error, #ef4444)" }}
        >
          ☠️ ×{killStreak}
        </motion.span>
        {streakText && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ fontSize: "11px", color: "#ef4444", fontWeight: 700, fontFamily: "var(--font-mono)" }}
          >
            {streakText}
          </motion.span>
        )}
      </div>

      {/* Tombstones — max-height forces scroll instead of growing the card */}
      <div style={{ maxHeight: "280px", display: "flex", flexDirection: "column", gap: "6px", overflow: "auto", paddingBottom: "4px" }}>
        <AnimatePresence>
          {[...errors].reverse().slice(0, 15).map((err, i) => (
            <Tombstone key={err.id} error={err} index={i} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Tombstone({ error, index }: { error: { id: string; message: string; timestamp: string; isFixed: boolean; category: string }; index: number }) {
  const shortMsg = error.message.length > 80 ? error.message.slice(0, 77) + "..." : error.message;
  const time = new Date(error.timestamp).toLocaleTimeString();

  return (
    <motion.div
      initial={{ y: 20, opacity: 0, rotate: -2 }}
      animate={{ y: 0, opacity: error.isFixed ? 0.4 : 1, rotate: 0 }}
      exit={{ y: 20, opacity: 0 }}
      transition={{ delay: index * 0.05, type: "spring" }}
      style={{
        background: error.isFixed ? "var(--bg-secondary)" : "rgba(127, 29, 29, 0.3)",
        border: `1px solid ${error.isFixed ? "var(--border-panel)" : "rgba(239, 68, 68, 0.4)"}`,
        borderRadius: "6px 6px 2px 2px",
        padding: "8px",
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontWeight: 600, color: "var(--accent-error, #ef4444)" }}>
          🪦 RIP
        </span>
        <span style={{ color: "var(--text-secondary)", fontSize: "9px" }}>{time}</span>
      </div>
      <div style={{ color: "var(--text-primary)", lineHeight: 1.3 }}>{shortMsg}</div>
      {error.isFixed && (
        <div style={{ color: "var(--accent-success, #22c55e)", fontSize: "9px", marginTop: "4px" }}>
          ✨ REST IN PEACE — fixed
        </div>
      )}
    </motion.div>
  );
}
