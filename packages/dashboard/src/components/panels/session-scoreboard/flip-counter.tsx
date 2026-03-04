/**
 * Arcade-style flip counter — each digit slides up/down on value change.
 * Uses Framer Motion AnimatePresence with popLayout for smooth digit transitions.
 */

import { AnimatePresence, motion } from "framer-motion";

interface Props {
  value: number;
  /** Minimum number of digits (zero-padded). */
  digits?: number;
  color?: string;
  fontSize?: string;
}

/** Single digit with slide-up/down animation on change. */
function FlipDigit({ digit, color, fontSize }: { digit: string; color: string; fontSize: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        textAlign: "center",
        overflow: "hidden",
        position: "relative",
        verticalAlign: "bottom",
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={digit}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 22 }}
          style={{
            display: "block",
            color,
            fontSize,
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Multi-digit animated counter. */
export function FlipCounter({
  value,
  digits = 4,
  color = "var(--accent-primary)",
  fontSize = "16px",
}: Props) {
  const str = Math.max(0, Math.floor(value)).toString().padStart(digits, "0");

  return (
    <span style={{ display: "inline-flex", alignItems: "flex-end", gap: "1px" }}>
      {str.split("").map((d, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <FlipDigit key={i} digit={d} color={color} fontSize={fontSize} />
      ))}
    </span>
  );
}
