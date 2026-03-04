import "./context-gauge.css";
import { useDashboardStore } from "../../../store/dashboard-store";
import { LiquidFillSvg } from "./liquid-fill-svg";
import { BubbleCanvas } from "./bubble-canvas";

const BEAKER_W = 120;
const BEAKER_H = 180;

/**
 * Context Window Gauge hero panel.
 * Liquid fill SVG beaker + floating bubble canvas.
 * Warning at >80%, critical at >95%.
 */
export function ContextGauge() {
  const state = useDashboardStore((s) => s.state);

  const percent = state?.contextWindowPercent ?? 0;
  const turnsRemaining = state?.estimatedTurnsRemaining ?? 0;

  const isWarning = percent >= 80;
  const isCritical = percent >= 95;

  const stateClass = isCritical
    ? "is-critical"
    : isWarning
      ? "is-warning"
      : "";

  return (
    <div className={`context-gauge ${stateClass}`}>
      {/* Beaker with bubbles overlaid */}
      <div
        className="context-gauge-beaker"
        style={{ width: BEAKER_W, height: BEAKER_H }}
      >
        <LiquidFillSvg percent={percent} />
        <BubbleCanvas
          fillPercent={percent}
          width={BEAKER_W}
          height={BEAKER_H}
        />
      </div>

      {/* Warning / critical text */}
      {isWarning && (
        <div className="context-warning-text">
          {isCritical ? "CONTEXT FULL" : "CONTEXT ALMOST FULL"}
        </div>
      )}

      {/* Turns remaining */}
      <div className="context-turns-remaining">
        {turnsRemaining > 0 ? (
          <>~<strong>{turnsRemaining}</strong> turns remaining</>
        ) : (
          <span style={{ opacity: 0.5 }}>— turns remaining</span>
        )}
      </div>

      {/* Stats row */}
      <div className="context-stats-row">
        <div className="context-stat">
          <span className="context-stat-label">Used</span>
          <span className="context-stat-value">{percent.toFixed(1)}%</span>
        </div>
        <div className="context-stat">
          <span className="context-stat-label">Free</span>
          <span className="context-stat-value">{(100 - percent).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
