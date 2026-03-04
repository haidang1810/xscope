import { useDashboardStore } from "../../store/dashboard-store";
import { motion } from "framer-motion";

/** Treemap-style file heatmap showing file modification frequency */
export function FileHeatmap() {
  const fileChanges = useDashboardStore((s) => s.state?.fileChanges);

  if (!fileChanges || fileChanges.length === 0) {
    return (
      <div style={{ color: "var(--text-secondary)", fontSize: "13px", textAlign: "center", padding: "20px" }}>
        No file changes yet
      </div>
    );
  }

  // Sort by touch count descending
  const sorted = [...fileChanges].sort((a, b) => b.touchCount - a.touchCount);
  const maxTouch = sorted[0]?.touchCount || 1;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", padding: "4px" }}>
      {sorted.slice(0, 20).map((file, i) => {
        const intensity = file.touchCount / maxTouch;
        const bg = getHeatColor(intensity);
        const shortName = file.filePath.split("/").pop() || file.filePath;

        return (
          <motion.div
            key={file.filePath}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.03, type: "spring", stiffness: 300 }}
            title={`${file.filePath}\nModified ${file.touchCount}x`}
            style={{
              background: bg,
              borderRadius: "4px",
              padding: "4px 8px",
              fontSize: "10px",
              fontFamily: "var(--font-mono)",
              color: intensity > 0.5 ? "#fff" : "var(--text-primary)",
              cursor: "pointer",
              minWidth: `${Math.max(60, 40 + intensity * 80)}px`,
              border: "1px solid rgba(255,255,255,0.1)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            <div style={{ fontWeight: 600 }}>{shortName}</div>
            <div style={{ opacity: 0.7, fontSize: "9px" }}>×{file.touchCount}</div>
          </motion.div>
        );
      })}
    </div>
  );
}

function getHeatColor(intensity: number): string {
  if (intensity > 0.7) return "rgba(239, 68, 68, 0.8)";
  if (intensity > 0.4) return "rgba(249, 115, 22, 0.6)";
  if (intensity > 0.2) return "rgba(234, 179, 8, 0.4)";
  return "rgba(34, 197, 94, 0.3)";
}
