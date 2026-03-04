import { motion } from "framer-motion";
import { useMemo } from "react";

interface SpeedometerGaugeProps {
  /** 0–100 mapped from burn rate */
  value: number;
  burnRate: number;
  totalTokens: number;
}

/** Convert polar angle (degrees) to Cartesian x,y on a circle */
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** SVG arc path for a gauge segment */
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polarToCartesian(cx, cy, r, startDeg);
  const e = polarToCartesian(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

// Gauge arc spans 225° → 495° (270° total sweep)
const START_DEG = 135;
const END_DEG = 405;
const TOTAL_SWEEP = END_DEG - START_DEG; // 270°

const CX = 100;
const CY = 86;
const R = 72;
const NEEDLE_LEN = 62;
const STROKE = 10;

/**
 * SVG 270-degree speedometer arc with 3 color zones and animated needle.
 * Green (0-33%) → Yellow (33-66%) → Red (66-100%)
 */
export function SpeedometerGauge({ value, burnRate, totalTokens }: SpeedometerGaugeProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  // Zone boundary angles
  const zone1End = START_DEG + TOTAL_SWEEP * 0.33;
  const zone2End = START_DEG + TOTAL_SWEEP * 0.66;

  // Needle angle based on value
  const needleAngle = START_DEG + (clampedValue / 100) * TOTAL_SWEEP;

  // Needle tip coordinates
  const needleTip = useMemo(() => {
    return polarToCartesian(CX, CY, NEEDLE_LEN, needleAngle);
  }, [needleAngle]);

  // Idle jitter: slight oscillation when value is near 0
  const jitterAnimate = clampedValue < 5
    ? { rotate: [0, 1.5, -1.5, 0.8, -0.8, 0] }
    : {};
  const jitterTransition = clampedValue < 5
    ? { repeat: Infinity, duration: 2, ease: "easeInOut" as const }
    : {};

  return (
    <svg viewBox="0 0 200 170" className="speedometer-svg" aria-label="Token burn rate gauge">
      <defs>
        {/* Glowing needle filter */}
        <filter id="needle-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background arc track */}
      <path
        d={arcPath(CX, CY, R, START_DEG, END_DEG)}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />

      {/* Zone 1: Green */}
      <path
        d={arcPath(CX, CY, R, START_DEG, zone1End)}
        fill="none"
        stroke="#00ff88"
        strokeWidth={STROKE}
        strokeLinecap="round"
        opacity={0.7}
      />

      {/* Zone 2: Yellow */}
      <path
        d={arcPath(CX, CY, R, zone1End, zone2End)}
        fill="none"
        stroke="#ffaa00"
        strokeWidth={STROKE}
        strokeLinecap="round"
        opacity={0.7}
      />

      {/* Zone 3: Red */}
      <path
        d={arcPath(CX, CY, R, zone2End, END_DEG)}
        fill="none"
        stroke="#ff3366"
        strokeWidth={STROKE}
        strokeLinecap="round"
        opacity={0.7}
      />

      {/* Needle */}
      <motion.g
        style={{ transformOrigin: `${CX}px ${CY}px` }}
        animate={jitterAnimate}
        transition={jitterTransition}
      >
        <motion.line
          x1={CX}
          y1={CY}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke="var(--accent-primary)"
          strokeWidth={2.5}
          strokeLinecap="round"
          filter="url(#needle-glow)"
          animate={{ x2: needleTip.x, y2: needleTip.y }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        />
      </motion.g>

      {/* Center cap */}
      <circle cx={CX} cy={CY} r={6} fill="var(--accent-primary)" opacity={0.9} />

      {/* Burn rate text */}
      <text
        x={CX}
        y={CY + 24}
        textAnchor="middle"
        fontSize="11"
        fill="var(--text-primary)"
        fontFamily="var(--font-mono)"
      >
        {burnRate.toFixed(0)} t/min
      </text>

      {/* Total tokens label */}
      <text
        x={CX}
        y={CY + 38}
        textAnchor="middle"
        fontSize="9"
        fill="var(--text-secondary)"
        fontFamily="var(--font-mono)"
      >
        {totalTokens.toLocaleString()} total
      </text>

      {/* Zone labels */}
      <text x={22} y={142} fontSize="8" fill="#00ff88" textAnchor="middle">LOW</text>
      <text x={CX} y={148} fontSize="8" fill="#ffaa00" textAnchor="middle">MED</text>
      <text x={178} y={142} fontSize="8" fill="#ff3366" textAnchor="middle">HOT</text>
    </svg>
  );
}
