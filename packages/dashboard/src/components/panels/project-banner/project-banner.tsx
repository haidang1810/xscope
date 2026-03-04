/**
 * Project Banner panel — full-width header with ASCII art project name,
 * matrix rain background, glitch effect, tech stack badges, session info,
 * and vibe mood badge (formerly the Vibe Indicator panel).
 */

import { useDashboardStore } from "../../../store/dashboard-store";
import { AsciiTextRenderer } from "./ascii-text-renderer";
import { GlitchText } from "./glitch-text";
import { MatrixRainCanvas } from "./matrix-rain-canvas";
import { TechStackBadges } from "./tech-stack-badges";
import { MOOD_CONFIG } from "../vibe-indicator/mood-emoji";
import type { VibeMood } from "@xscope/shared";

function formatUptime(startTimeIso: string): string {
  const diffMs = Date.now() - new Date(startTimeIso).getTime();
  const s = Math.floor(diffMs / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

/** Full-width project banner with ASCII name, matrix background, session meta, and vibe badge. */
export function ProjectBanner() {
  const state = useDashboardStore((s) => s.state);

  const projectName = state?.sessionInfo?.projectName ?? "XSCOPE";
  const gitBranch = state?.sessionInfo?.gitBranch ?? "main";
  const techStack = state?.sessionInfo?.techStack ?? [];
  const startTime = state?.sessionInfo?.startTime;
  const uptime = startTime ? formatUptime(startTime) : "0s";
  const startLabel = startTime
    ? new Date(startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  // Vibe mood data (formerly the Vibe Indicator panel)
  const mood: VibeMood = (state?.vibe?.mood as VibeMood) ?? "idle";
  const moodReason = state?.vibe?.reason ?? "";
  const moodConfig = MOOD_CONFIG[mood] ?? MOOD_CONFIG.idle;

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        minHeight: "100px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "4px",
      }}
    >
      {/* Matrix rain background — absolute positioned */}
      <MatrixRainCanvas opacity={0.07} />

      {/* Content layer above rain */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <GlitchText text={projectName.toUpperCase()}>
          <AsciiTextRenderer text={projectName} maxChars={18} />
        </GlitchText>

        {/* Session meta row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginTop: "6px",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--text-secondary)",
          }}
        >
          <span>
            <span style={{ color: "var(--accent-secondary)" }}>⎇ </span>
            {gitBranch}
          </span>
          <span>
            <span style={{ color: "var(--accent-success)" }}>◷ </span>
            Started {startLabel} · {uptime} ago
          </span>
          {state?.sessionInfo?.model && (
            <span>
              <span style={{ color: "var(--accent-primary)" }}>◈ </span>
              {state.sessionInfo.model}
            </span>
          )}

          {/* Vibe mood badge — compact inline indicator */}
          <span
            title={moodReason || moodConfig.label}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              background: moodConfig.bg,
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "4px",
              padding: "1px 6px",
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              color: "var(--text-primary)",
              cursor: "default",
            }}
          >
            {moodConfig.emoji} {moodConfig.label}
          </span>
        </div>

        {/* Tech stack badges */}
        <TechStackBadges techStack={techStack} />
      </div>
    </div>
  );
}
