import { useState } from "react";
import { toPng } from "html-to-image";

/** Small inline screenshot button for the title bar. Captures .dashboard-grid as PNG. */
export function ScreenshotButton() {
  const [capturing, setCapturing] = useState(false);
  const [done, setDone] = useState(false);

  const handleScreenshot = async () => {
    const grid = document.querySelector<HTMLElement>(".dashboard-grid");
    if (!grid || capturing) return;

    setCapturing(true);
    try {
      const dataUrl = await toPng(grid, {
        cacheBust: true,
        pixelRatio: 2,
        /* skip canvas elements that html-to-image can't clone */
        filter: (node: HTMLElement) => node.tagName !== "CANVAS",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `xscope-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.png`;
      a.click();
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch (err) {
      console.error("Screenshot failed:", err);
    } finally {
      setCapturing(false);
    }
  };

  return (
    <button
      onClick={handleScreenshot}
      disabled={capturing}
      title="Screenshot dashboard"
      style={{
        background: done ? "var(--accent-success, #22c55e)" : "transparent",
        border: "1px solid var(--border-panel)",
        borderRadius: "4px",
        padding: "2px 8px",
        color: done ? "#fff" : "var(--text-secondary)",
        cursor: capturing ? "not-allowed" : "pointer",
        fontSize: "11px",
        fontFamily: "var(--font-mono)",
        lineHeight: 1.2,
        transition: "background 0.2s, color 0.2s",
      }}
    >
      {capturing ? "..." : done ? "OK" : "📸"}
    </button>
  );
}
