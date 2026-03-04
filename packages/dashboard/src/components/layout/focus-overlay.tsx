import { motion, AnimatePresence } from "framer-motion";
import { useDashboardStore } from "../../store/dashboard-store";

/**
 * Semi-transparent overlay shown when a panel is focused (1-9 hotkeys).
 * Clicking the overlay unfocuses the panel.
 */
export function FocusOverlay() {
  const { focusedPanel, setFocusedPanel } = useDashboardStore();

  return (
    <AnimatePresence>
      {focusedPanel !== null && (
        <motion.div
          key="focus-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => setFocusedPanel(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 5,
            cursor: "pointer",
          }}
          aria-label="Click to exit focus mode"
        />
      )}
    </AnimatePresence>
  );
}
