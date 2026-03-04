import { useEffect, useRef, useState } from "react";

interface LiquidFillSvgProps {
  /** 0–100 fill percent */
  percent: number;
}

const W = 120;
const H = 180;
const WALL = 8;
// Beaker inner bounds
const INNER_X = WALL;
const INNER_W = W - WALL * 2;
const INNER_TOP = 10;
const INNER_BOTTOM = H - 12;
const INNER_H = INNER_BOTTOM - INNER_TOP;

/** Interpolate between two hex colors by t ∈ [0,1] */
function lerpColor(a: string, b: string, t: number): string {
  const parse = (h: string) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const blue = Math.round(ab + (bb - ab) * t);
  return `rgb(${r},${g},${blue})`;
}

function getWaterColor(percent: number): string {
  if (percent < 50) return lerpColor("#2266ff", "#2266ff", 0);
  if (percent < 80) return lerpColor("#2266ff", "#ffaa00", (percent - 50) / 30);
  return lerpColor("#ffaa00", "#ff3344", (percent - 80) / 20);
}

/**
 * SVG beaker liquid fill with animated sine-wave surface.
 * Color: blue (<50%) → yellow (50-80%) → red (>80%).
 * Uses requestAnimationFrame for wave animation.
 */
export function LiquidFillSvg({ percent }: LiquidFillSvgProps) {
  const clamp = Math.min(100, Math.max(0, percent));
  const timeRef = useRef(0);
  const [wavePath, setWavePath] = useState("");
  const rafRef = useRef<number>(0);

  const isWarning = clamp >= 80;
  const isCritical = clamp >= 95;
  const amplitude = isWarning ? 5 : 3;

  // Liquid top Y (higher percent = lower Y value = higher fill)
  const liquidTopY = INNER_TOP + INNER_H * (1 - clamp / 100);
  const waterColor = getWaterColor(clamp);

  useEffect(() => {
    function buildWave(t: number, topY: number): string {
      const points: string[] = [];
      const steps = 20;
      for (let i = 0; i <= steps; i++) {
        const x = INNER_X + (i / steps) * INNER_W;
        const y = topY + Math.sin((i / steps) * Math.PI * 4 + t) * amplitude;
        points.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
      }
      // Close: down right side, across bottom, up left side
      points.push(
        `L ${INNER_X + INNER_W} ${INNER_BOTTOM}`,
        `L ${INNER_X} ${INNER_BOTTOM}`,
        "Z"
      );
      return points.join(" ");
    }

    function tick() {
      timeRef.current += 0.04;
      setWavePath(buildWave(timeRef.current, liquidTopY));
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [liquidTopY, amplitude]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      aria-label={`Context window ${clamp.toFixed(0)}% full`}
    >
      <defs>
        <clipPath id="beaker-clip">
          <rect x={INNER_X} y={INNER_TOP} width={INNER_W} height={INNER_H} rx={4} />
        </clipPath>
        {isCritical && (
          <filter id="critical-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {/* Beaker outline */}
      <rect
        x={INNER_X}
        y={INNER_TOP}
        width={INNER_W}
        height={INNER_H}
        rx={4}
        fill="rgba(255,255,255,0.04)"
        stroke={isCritical ? "#ff3344" : isWarning ? "#ffaa00" : "rgba(255,255,255,0.15)"}
        strokeWidth={isWarning ? 2 : 1.5}
        filter={isCritical ? "url(#critical-glow)" : undefined}
      />

      {/* Liquid body with wave surface */}
      {wavePath && (
        <path
          d={wavePath}
          fill={waterColor}
          fillOpacity={0.75}
          clipPath="url(#beaker-clip)"
        />
      )}

      {/* Tick marks on right side */}
      {[25, 50, 75].map((mark) => {
        const my = INNER_TOP + INNER_H * (1 - mark / 100);
        return (
          <g key={mark}>
            <line
              x1={INNER_X + INNER_W - 10}
              y1={my}
              x2={INNER_X + INNER_W}
              y2={my}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={1}
            />
            <text
              x={INNER_X + INNER_W - 13}
              y={my + 3}
              fontSize="7"
              fill="rgba(255,255,255,0.35)"
              textAnchor="end"
              fontFamily="var(--font-mono)"
            >
              {mark}
            </text>
          </g>
        );
      })}

      {/* Percent label centered in beaker */}
      <text
        x={W / 2}
        y={INNER_TOP + INNER_H / 2 + 4}
        textAnchor="middle"
        fontSize="18"
        fontWeight="700"
        fill="rgba(255,255,255,0.85)"
        fontFamily="var(--font-mono)"
      >
        {clamp.toFixed(0)}%
      </text>
    </svg>
  );
}
