/**
 * Session Heartbeat panel — ECG canvas with activity overlay text.
 * Shows actions/min, session uptime, and color-codes line by error state.
 */

import { useEffect, useRef, useState } from "react";
import { useDashboardStore } from "../../../store/dashboard-store";
import { EcgCanvas } from "./ecg-canvas";

function formatUptime(startTimeIso: string): string {
  const diffMs = Date.now() - new Date(startTimeIso).getTime();
  const totalSec = Math.floor(diffMs / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/** Session Heartbeat panel — wraps EcgCanvas with text overlay. */
export function SessionHeartbeat() {
  const state = useDashboardStore((s) => s.state);

  const actionsPerMinute = state?.actionsPerMinute ?? 0;
  const lastActivity = state?.lastActivityTimestamp ?? new Date().toISOString();
  const startTime = state?.sessionInfo?.startTime;
  const errors = state?.errors ?? [];
  // Only show error state for unfixed errors within last 2 minutes
  const recentCutoff = Date.now() - 120_000;
  const hasErrors = errors.some(
    (e) => !e.isFixed && new Date(e.timestamp).getTime() > recentCutoff,
  );

  // Live uptime ticker
  const [uptime, setUptime] = useState("0s");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!startTime) return;
    setUptime(formatUptime(startTime));
    intervalRef.current = setInterval(() => setUptime(formatUptime(startTime)), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startTime]);

  const isIdle = Date.now() - new Date(lastActivity).getTime() > 30_000;
  const statusColor = hasErrors
    ? "var(--accent-danger)"
    : actionsPerMinute > 30
      ? "var(--accent-warning)"
      : "var(--accent-success)";

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: "80px" }}>
      {/* ECG canvas fills container */}
      <EcgCanvas
        actionsPerMinute={actionsPerMinute}
        hasErrors={hasErrors}
        lastActivityTimestamp={lastActivity}
      />

      {/* Text overlay — top-left */}
      <div
        style={{
          position: "absolute",
          top: "6px",
          left: "8px",
          display: "flex",
          gap: "16px",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        <span style={{ color: statusColor }}>
          {isIdle ? "IDLE" : `${Math.round(actionsPerMinute)} act/min`}
        </span>
        <span style={{ color: "var(--text-secondary)" }}>
          ◷ {startTime ? uptime : "--"}
        </span>
        {hasErrors && (
          <span style={{ color: "var(--accent-danger)" }}>⚠ errors</span>
        )}
      </div>

      {/* Status dot — top-right */}
      <div
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: statusColor,
          boxShadow: `0 0 6px ${statusColor}`,
          animation: isIdle ? "none" : "hb-pulse 1.2s ease-in-out infinite",
          zIndex: 2,
        }}
      />

      <style>{`
        @keyframes hb-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </div>
  );
}
