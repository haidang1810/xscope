import { useState } from "react";
import { useDashboardStore } from "../../store/dashboard-store";
import { motion, AnimatePresence } from "framer-motion";

/** Command history panel — shows bash commands with status indicators */
export function CommandArsenal() {
  const commands = useDashboardStore((s) => s.state?.commands);

  if (!commands || commands.length === 0) {
    return (
      <div style={{ color: "var(--text-secondary)", fontSize: "13px", textAlign: "center", padding: "20px" }}>
        No commands executed yet
      </div>
    );
  }

  // Show most recent first, limit to 30
  const recent = [...commands].reverse().slice(0, 30);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", overflow: "auto", maxHeight: "300px" }}>
      <AnimatePresence initial={false}>
        {recent.map((cmd, i) => (
          <CommandCard key={cmd.id} cmd={cmd} index={i} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function CommandCard({ cmd, index }: { cmd: { id: string; command: string; status: string; exitCode: number | null; durationMs: number | null; timestamp: string }; index: number }) {
  const [copied, setCopied] = useState(false);
  const borderColor =
    cmd.status === "success" ? "var(--accent-success, #22c55e)" :
    cmd.status === "failed" ? "var(--accent-error, #ef4444)" :
    "var(--accent-warning, #eab308)";

  const handleCopy = () => {
    navigator.clipboard.writeText(cmd.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Only show Bash commands, skip Read/Write/Edit/Glob
  if (!cmd.command.startsWith("Bash:") && cmd.command.includes(":")) {
    const toolName = cmd.command.split(":")[0];
    if (["Read", "Write", "Edit", "Glob", "Grep"].includes(toolName)) return null;
  }

  const displayCmd = cmd.command.length > 120 ? cmd.command.slice(0, 117) + "..." : cmd.command;

  return (
    <motion.div
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -30, opacity: 0 }}
      transition={{ delay: index * 0.02 }}
      style={{
        borderLeft: `3px solid ${borderColor}`,
        background: "var(--bg-secondary)",
        borderRadius: "4px",
        padding: "6px 8px",
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <div style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-primary)" }}>
        {displayCmd}
      </div>
      {cmd.durationMs != null && (
        <span style={{ color: "var(--text-secondary)", fontSize: "10px", flexShrink: 0 }}>
          {cmd.durationMs > 1000 ? `${(cmd.durationMs / 1000).toFixed(1)}s` : `${cmd.durationMs}ms`}
        </span>
      )}
      <button
        onClick={handleCopy}
        style={{
          background: "none",
          border: "1px solid var(--border-panel)",
          borderRadius: "3px",
          color: copied ? "var(--accent-success, #22c55e)" : "var(--text-secondary)",
          cursor: "pointer",
          padding: "2px 6px",
          fontSize: "10px",
          flexShrink: 0,
        }}
      >
        {copied ? "✓" : "⎘"}
      </button>
    </motion.div>
  );
}
