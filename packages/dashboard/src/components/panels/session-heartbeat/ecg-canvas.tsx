/**
 * Canvas-based ECG heartbeat line.
 * Scrolls left continuously; spikes on activity; flatlines on idle.
 * Circular buffer of 500 points — old segments fade darker.
 */

import { useEffect, useRef } from "react";

interface Props {
  actionsPerMinute: number;
  hasErrors: boolean;
  lastActivityTimestamp: string;
}

const BUFFER_SIZE = 500;
const FLATLINE_THRESHOLD_MS = 30_000;
const BASE_TICK_PER_FRAME = 1.5; // horizontal pixels advanced per frame

/** Draws a single ECG spike into the point buffer at the current write cursor. */
function generateSpike(
  buf: Float32Array,
  cursor: number,
  amplitude: number,
  baseY: number,
): number {
  let c = cursor;
  const len = buf.length;
  // P wave — small upward bump
  buf[c % len] = baseY - amplitude * 0.15; c++;
  buf[c % len] = baseY - amplitude * 0.2; c++;
  buf[c % len] = baseY; c++;
  // QRS complex
  buf[c % len] = baseY + amplitude * 0.1; c++; // Q dip
  buf[c % len] = baseY - amplitude; c++;        // R peak
  buf[c % len] = baseY - amplitude * 0.6; c++;
  buf[c % len] = baseY + amplitude * 0.3; c++; // S dip
  buf[c % len] = baseY; c++;
  // T wave — gentle bump
  buf[c % len] = baseY - amplitude * 0.12; c++;
  buf[c % len] = baseY - amplitude * 0.14; c++;
  buf[c % len] = baseY - amplitude * 0.1; c++;
  buf[c % len] = baseY; c++;
  return c;
}

/** ECG canvas that scrolls left and draws heartbeat spikes. */
export function EcgCanvas({ actionsPerMinute, hasErrors, lastActivityTimestamp }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  // Shared mutable state for the animation loop
  const stateRef = useRef({
    pointBuf: new Float32Array(BUFFER_SIZE),
    writeHead: 0,
    readHead: 0,
    pendingSpike: false,
    actionsPerMinute,
    hasErrors,
    lastActivityTimestamp,
  });

  // Keep stateRef in sync with props without re-running the effect
  useEffect(() => {
    stateRef.current.actionsPerMinute = actionsPerMinute;
    stateRef.current.hasErrors = hasErrors;
    stateRef.current.lastActivityTimestamp = lastActivityTimestamp;
  });

  // Periodic spike timer — generates spikes at a rate matching actionsPerMinute
  useEffect(() => {
    if (actionsPerMinute <= 0) return;
    // Convert act/min to ms interval, clamped to reasonable range
    const intervalMs = Math.max(400, Math.min(5000, 60_000 / Math.max(1, actionsPerMinute)));
    const id = setInterval(() => {
      stateRef.current.pendingSpike = true;
    }, intervalMs);
    // Fire one immediately
    stateRef.current.pendingSpike = true;
    return () => clearInterval(id);
  }, [actionsPerMinute]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      canvas!.width = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
      // Initialise buffer to baseline
      const baseY = canvas!.height / 2;
      stateRef.current.pointBuf.fill(baseY);
      stateRef.current.writeHead = 0;
      stateRef.current.readHead = 0;
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    function draw() {
      const { width, height } = canvas!;
      const baseY = height / 2;
      const s = stateRef.current;
      const buf = s.pointBuf;

      const isIdle =
        Date.now() - new Date(s.lastActivityTimestamp).getTime() > FLATLINE_THRESHOLD_MS;
      // Amplitude: minimum 25% of canvas height for any activity, scales up to 38%
      const amplitude = isIdle
        ? 0
        : Math.max(height * 0.25, Math.min(height * 0.38, (s.actionsPerMinute / 30) * height * 0.35 + height * 0.2));

      // Decide line color
      const lineColor = s.hasErrors
        ? "#ff3366"
        : s.actionsPerMinute > 30
          ? "#ffaa00"
          : "#00ff88";

      // Advance write head — fill with baseline or spike
      const ticks = Math.round(BASE_TICK_PER_FRAME);
      for (let i = 0; i < ticks; i++) {
        if (s.pendingSpike && amplitude > 0) {
          // Check if we have room for a full spike (12 pts)
          s.writeHead = generateSpike(buf, s.writeHead, amplitude, baseY);
          s.pendingSpike = false;
        } else {
          buf[s.writeHead % BUFFER_SIZE] = baseY + (Math.random() - 0.5) * (isIdle ? 0 : 1.2);
          s.writeHead++;
        }
      }

      // ---- Draw ----
      ctx!.clearRect(0, 0, width, height);

      // Scan line cursor position (rightmost drawn pixel)
      const scanX = ((s.writeHead % BUFFER_SIZE) / BUFFER_SIZE) * width;

      // Draw trail — map circular buffer onto canvas width
      const totalPts = Math.min(s.writeHead, BUFFER_SIZE);
      if (totalPts < 2) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx!.beginPath();
      for (let i = 0; i < totalPts; i++) {
        const bufIdx = ((s.writeHead - totalPts + i) % BUFFER_SIZE + BUFFER_SIZE) % BUFFER_SIZE;
        const x = (i / (BUFFER_SIZE - 1)) * width;
        const y = buf[bufIdx];
        const alpha = 0.15 + (i / totalPts) * 0.85; // fade from dim to bright

        if (i === 0) {
          ctx!.moveTo(x, y);
        } else {
          // Stroke previous segment with its alpha
          ctx!.strokeStyle =
            lineColor + Math.round(alpha * 255).toString(16).padStart(2, "0");
          ctx!.lineWidth = 1.5;
          ctx!.stroke();
          ctx!.beginPath();
          ctx!.moveTo(x - (width / (BUFFER_SIZE - 1)), buf[((bufIdx - 1 + BUFFER_SIZE) % BUFFER_SIZE)]);
          ctx!.lineTo(x, y);
        }
      }
      ctx!.strokeStyle = lineColor + "ff";
      ctx!.lineWidth = 1.8;
      ctx!.stroke();

      // Scan line — vertical bright glow at cursor
      const grad = ctx!.createLinearGradient(scanX - 4, 0, scanX + 4, 0);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(0.5, lineColor + "99");
      grad.addColorStop(1, "transparent");
      ctx!.fillStyle = grad;
      ctx!.fillRect(scanX - 4, 0, 8, height);

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
