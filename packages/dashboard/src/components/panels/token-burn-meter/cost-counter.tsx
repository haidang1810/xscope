import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import { COFFEE_COST_USD } from "@xscope/shared";

interface CostCounterProps {
  costUsd: number;
}

/**
 * Animated cost display with slot-machine digit transitions.
 * Shows "$X.XX" with per-digit AnimatePresence animations.
 * Includes coffee comparison below.
 */
export function CostCounter({ costUsd }: CostCounterProps) {
  const formatted = costUsd.toFixed(2);
  const coffees = Math.floor(costUsd / COFFEE_COST_USD);

  // Split into individual characters for per-digit animation
  const chars = useMemo(() => formatted.split(""), [formatted]);

  return (
    <div className="cost-counter">
      <div className="cost-display" aria-label={`Cost: $${formatted}`}>
        <span className="cost-dollar">$</span>
        <div className="cost-digits">
          <AnimatePresence mode="popLayout">
            {chars.map((ch, i) => (
              <motion.span
                key={`${i}-${ch}`}
                className="cost-digit"
                initial={{ y: -16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 16, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: i * 0.03,
                }}
              >
                {ch}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {coffees > 0 && (
        <motion.div
          className="coffee-comparison"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 150, damping: 18 }}
        >
          = {coffees} coffee{coffees !== 1 ? "s" : ""} ☕
        </motion.div>
      )}
    </div>
  );
}
