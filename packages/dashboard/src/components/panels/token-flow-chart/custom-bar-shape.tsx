import type { ReactElement } from "react";

interface CustomBarProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
  maxValue?: number;
  stackId?: string;
  fill?: string;
  /** "input" | "output" — determines gradient direction */
  barType?: "input" | "output";
  index?: number;
}

/** Interpolate hex color based on normalized intensity 0–1 */
function intensityColor(norm: number, type: "input" | "output"): [string, string] {
  if (type === "input") {
    // Blue (#4488ff) → Purple (#9944ff)
    if (norm < 0.5) return ["#4488ff", "#6666ff"];
    return ["#6666ff", "#9944ff"];
  }
  // Output: Purple (#9944ff) → Red-orange (#ff4444)
  if (norm < 0.5) return ["#9944ff", "#cc2288"];
  return ["#cc2288", "#ff4444"];
}

/**
 * Recharts custom bar shape with vertical gradient.
 * Color intensity scales from blue (low) → purple → red-orange (high).
 * Used for both input and output stacked bars.
 */
export function CustomBarShape(props: CustomBarProps): ReactElement | null {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    value = 0,
    maxValue = 1,
    barType = "input",
    index = 0,
  } = props;

  if (height <= 0 || width <= 0) return null;

  const norm = Math.min(1, (value || 0) / Math.max(1, maxValue));
  const [colorStart, colorEnd] = intensityColor(norm, barType);
  const gradientId = `bar-grad-${barType}-${index}`;

  return (
    <g>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colorEnd} stopOpacity={0.95} />
          <stop offset="100%" stopColor={colorStart} stopOpacity={0.75} />
        </linearGradient>
      </defs>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={`url(#${gradientId})`}
        rx={2}
        ry={2}
      />
    </g>
  );
}
