import { useState } from "react";
import html2canvas from "html2canvas";
import { motion } from "framer-motion";

/** Export panel — single screenshot button that captures the dashboard grid as PNG. */
export function ExportPanel() {
  const [capturing, setCapturing] = useState(false);
  const [done, setDone] = useState(false);

  const handleScreenshot = async () => {
    const grid = document.querySelector<HTMLElement>(".dashboard-grid");
    if (!grid) return;

    setCapturing(true);
    try {
      const canvas = await html2canvas(grid, { useCORS: true, backgroundColor: null });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `xscope-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.png`;
      a.click();
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "8px" }}>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleScreenshot}
        disabled={capturing}
        style={{
          background: done ? "var(--accent-success, #22c55e)" : "var(--bg-secondary)",
          border: "1px solid var(--border-panel)",
          borderRadius: "6px",
          padding: "10px 16px",
          color: done ? "#fff" : "var(--text-primary)",
          cursor: capturing ? "not-allowed" : "pointer",
          fontSize: "12px",
          fontFamily: "var(--font-mono)",
          transition: "background 0.2s, color 0.2s",
          width: "100%",
        }}
      >
        {capturing ? "Capturing…" : done ? "Saved!" : "📸 Screenshot"}
      </motion.button>
    </div>
  );
}
