import "./token-burn-meter.css";
import { useDashboardStore } from "../../../store/dashboard-store";
import { BURN_RATE_THRESHOLDS } from "@xscope/shared";
import { SpeedometerGauge } from "./speedometer-gauge";
import { FireParticleCanvas } from "./fire-particle-canvas";
import { CostCounter } from "./cost-counter";

/** Map burn rate → 0-100 gauge value using threshold scale */
function burnRateToPercent(rate: number): number {
  if (rate <= 0) return 0;
  if (rate >= BURN_RATE_THRESHOLDS.high) return 100;
  // 0 → low: 0–33%, low → medium: 33–66%, medium → high: 66–100%
  if (rate < BURN_RATE_THRESHOLDS.low) {
    return (rate / BURN_RATE_THRESHOLDS.low) * 33;
  }
  if (rate < BURN_RATE_THRESHOLDS.medium) {
    return 33 + ((rate - BURN_RATE_THRESHOLDS.low) / (BURN_RATE_THRESHOLDS.medium - BURN_RATE_THRESHOLDS.low)) * 33;
  }
  return 66 + ((rate - BURN_RATE_THRESHOLDS.medium) / (BURN_RATE_THRESHOLDS.high - BURN_RATE_THRESHOLDS.medium)) * 34;
}

/**
 * Token Burn Meter hero panel.
 * Composes: SpeedometerGauge + FireParticleCanvas + CostCounter.
 * Reads from Zustand dashboard store.
 */
export function TokenBurnMeter() {
  const state = useDashboardStore((s) => s.state);

  const burnRate = state?.burnRateTokensPerMin ?? 0;
  const totalTokens = state?.totalTokens;
  const gaugeValue = burnRateToPercent(burnRate);

  // Fire intensity: 0 below low threshold, scales to 100 at high
  const fireIntensity = burnRate < BURN_RATE_THRESHOLDS.low
    ? 0
    : Math.min(100, ((burnRate - BURN_RATE_THRESHOLDS.low) / (BURN_RATE_THRESHOLDS.high - BURN_RATE_THRESHOLDS.low)) * 100);

  const burnClass =
    burnRate >= BURN_RATE_THRESHOLDS.medium
      ? "burn-high"
      : burnRate >= BURN_RATE_THRESHOLDS.low
        ? "burn-medium"
        : "burn-low";

  const inputTokens = totalTokens?.inputTokens ?? 0;
  const outputTokens = totalTokens?.outputTokens ?? 0;
  const cacheTokens = (totalTokens?.cacheReadTokens ?? 0) + (totalTokens?.cacheCreationTokens ?? 0);
  const costUsd = totalTokens?.estimatedCostUsd ?? 0;
  const totalCount = totalTokens?.totalTokens ?? 0;

  return (
    <div className={`token-burn-meter ${burnClass}`}>
      {/* Gauge with fire overlay */}
      <div className="burn-gauge-wrapper">
        <SpeedometerGauge
          value={gaugeValue}
          burnRate={burnRate}
          totalTokens={totalCount}
        />
        <FireParticleCanvas
          intensity={fireIntensity}
          width={200}
          height={160}
        />
      </div>

      {/* Input / Output / Cache stats */}
      <div className="burn-token-stats">
        <div className="burn-token-stat">
          <span className="burn-token-stat-label">In</span>
          <span className="burn-token-stat-value input-color">
            {inputTokens.toLocaleString()}
          </span>
        </div>
        <div className="burn-token-stat">
          <span className="burn-token-stat-label">Out</span>
          <span className="burn-token-stat-value output-color">
            {outputTokens.toLocaleString()}
          </span>
        </div>
        <div className="burn-token-stat">
          <span className="burn-token-stat-label">Cache</span>
          <span className="burn-token-stat-value">
            {cacheTokens.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Animated cost display */}
      <CostCounter costUsd={costUsd} />
    </div>
  );
}
