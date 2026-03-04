/**
 * Subtle matrix rain background canvas for project banner.
 * Low opacity katakana + digit characters falling in columns.
 * Designed to be an absolute-positioned background layer.
 */

import { useEffect, useRef } from "react";

const CHARS = "アカサタナハマヤラワイキシチニヒミリヰウクスツヌフムユル0123456789";

interface Column {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  length: number;
}

interface Props {
  opacity?: number;
}

/** Full-size canvas with falling matrix characters as a background effect. */
export function MatrixRainCanvas({ opacity = 0.08 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fontSize = 10;
    let columns: Column[] = [];

    function initColumns() {
      const cols = Math.floor(canvas!.width / fontSize);
      columns = Array.from({ length: cols }, (_, i) => ({
        x: i * fontSize,
        y: Math.random() * -200,
        speed: 0.5 + Math.random() * 1.5,
        chars: Array.from({ length: 12 }, () =>
          CHARS[Math.floor(Math.random() * CHARS.length)],
        ),
        length: 6 + Math.floor(Math.random() * 10),
      }));
    }

    function resize() {
      canvas!.width = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
      initColumns();
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Use CSS variable color via a temporary element
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent-primary")
        .trim() || "#ff2d95";

      for (const col of columns) {
        for (let i = 0; i < col.length; i++) {
          const alpha = (1 - i / col.length) * opacity;
          ctx!.fillStyle = `${color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
          ctx!.font = `${fontSize}px monospace`;
          const char = col.chars[i % col.chars.length];
          ctx!.fillText(char, col.x, col.y - i * fontSize);
        }

        col.y += col.speed;

        // Randomize char occasionally
        if (Math.random() < 0.05) {
          const idx = Math.floor(Math.random() * col.chars.length);
          col.chars[idx] = CHARS[Math.floor(Math.random() * CHARS.length)];
        }

        // Reset column when it passes bottom
        if (col.y - col.length * fontSize > canvas!.height) {
          col.y = Math.random() * -100;
          col.speed = 0.5 + Math.random() * 1.5;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [opacity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
