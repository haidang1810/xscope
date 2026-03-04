import { useDashboardStore } from "../../store/dashboard-store";
import { motion } from "framer-motion";

/** System vitals panel — CPU ring, RAM bar, uptime */
export function SystemVitals() {
  const vitals = useDashboardStore((s) => s.state?.systemVitals);

  const cpu = vitals?.cpuUsagePercent || 0;
  const ramUsed = vitals?.ramUsedMb || 0;
  const ramTotal = vitals?.ramTotalMb || 1;
  const ramPercent = Math.round((ramUsed / ramTotal) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "4px" }}>
      {/* CPU Ring */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <CpuRing percent={cpu} />
        <div>
          <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>CPU</div>
          <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: "var(--font-mono)", color: getColor(cpu) }}>
            {cpu}%
          </div>
        </div>
      </div>

      {/* RAM Bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-secondary)", marginBottom: "4px" }}>
          <span>RAM</span>
          <span style={{ fontFamily: "var(--font-mono)" }}>
            {formatMb(ramUsed)} / {formatMb(ramTotal)}
          </span>
        </div>
        <div style={{ height: "8px", background: "var(--bg-secondary)", borderRadius: "4px", overflow: "hidden" }}>
          <motion.div
            animate={{ width: `${ramPercent}%` }}
            transition={{ type: "spring", stiffness: 100 }}
            style={{ height: "100%", background: getColor(ramPercent), borderRadius: "4px" }}
          />
        </div>
      </div>
    </div>
  );
}

/** SVG circular progress ring for CPU */
function CpuRing({ percent }: { percent: number }) {
  const r = 22;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - percent / 100);

  return (
    <svg width="54" height="54" viewBox="0 0 54 54">
      <circle cx="27" cy="27" r={r} fill="none" stroke="var(--bg-secondary)" strokeWidth="4" />
      <motion.circle
        cx="27" cy="27" r={r}
        fill="none"
        stroke={getColor(percent)}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        animate={{ strokeDashoffset: offset }}
        transition={{ type: "spring", stiffness: 80 }}
        style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
      />
    </svg>
  );
}

function getColor(percent: number): string {
  if (percent > 80) return "#ef4444";
  if (percent > 50) return "#eab308";
  return "var(--accent-primary)";
}

function formatMb(mb: number): string {
  if (mb > 1024) return `${(mb / 1024).toFixed(1)}GB`;
  return `${mb}MB`;
}
