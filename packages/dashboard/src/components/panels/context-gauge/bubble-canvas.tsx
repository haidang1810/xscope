import { useEffect, useRef } from "react";

interface Bubble {
  x: number;
  y: number;
  vy: number;
  wobblePhase: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  radius: number;
  opacity: number;
  active: boolean;
}

interface BubbleCanvasProps {
  /** 0–100, controls spawn rate and fill boundary */
  fillPercent: number;
  width: number;
  height: number;
}

const MAX_BUBBLES = 50;

function makeDead(): Bubble {
  return { x: 0, y: 0, vy: 0, wobblePhase: 0, wobbleSpeed: 0, wobbleAmp: 0, radius: 0, opacity: 0, active: false };
}

function resetBubble(b: Bubble, canvasW: number, fillBottomY: number, fillTopY: number) {
  b.x = Math.random() * canvasW;
  // Spawn anywhere within the liquid fill region
  b.y = fillBottomY - Math.random() * (fillBottomY - fillTopY) * 0.8;
  b.vy = -(Math.random() * 0.4 + 0.2);
  b.wobblePhase = Math.random() * Math.PI * 2;
  b.wobbleSpeed = Math.random() * 0.04 + 0.02;
  b.wobbleAmp = Math.random() * 3 + 1;
  b.radius = Math.random() * 2.5 + 1;
  b.opacity = Math.random() * 0.4 + 0.3;
  b.active = true;
}

/**
 * Canvas bubble particles rising inside the liquid fill.
 * 50 bubbles max, spawn rate proportional to fillPercent.
 * Uses object pool to avoid GC pressure.
 */
export function BubbleCanvas({ fillPercent, width, height }: BubbleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poolRef = useRef<Bubble[]>(Array.from({ length: MAX_BUBBLES }, makeDead));
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);

  // Liquid occupies bottom `fillPercent`% of the canvas area
  const fillBottomY = height - 14;
  const fillTopY = fillBottomY - (height - 24) * (fillPercent / 100);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxRaw = canvas.getContext("2d");
    if (!ctxRaw) return;
    const ctx: CanvasRenderingContext2D = ctxRaw;

    const pool = poolRef.current;
    // Spawn ~1 bubble every N frames; more at higher fill
    const spawnInterval = Math.max(4, Math.round(30 - fillPercent * 0.2));

    function findDead(): number {
      for (let i = 0; i < MAX_BUBBLES; i++) {
        if (!pool[i].active) return i;
      }
      return -1;
    }

    function tick() {
      ctx.clearRect(0, 0, width, height);
      timeRef.current++;

      // Spawn
      if (fillPercent > 5 && timeRef.current % spawnInterval === 0) {
        const slot = findDead();
        if (slot !== -1) resetBubble(pool[slot], width, fillBottomY, fillTopY);
      }

      // Update + draw
      for (let i = 0; i < MAX_BUBBLES; i++) {
        const b = pool[i];
        if (!b.active) continue;

        b.y += b.vy;
        b.wobblePhase += b.wobbleSpeed;
        const cx = b.x + Math.sin(b.wobblePhase) * b.wobbleAmp;

        // Deactivate when bubble reaches the liquid surface
        if (b.y < fillTopY) {
          b.active = false;
          continue;
        }

        ctx.beginPath();
        ctx.arc(cx, b.y, b.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${b.opacity})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        // Slight inner highlight
        ctx.fillStyle = `rgba(255,255,255,${b.opacity * 0.3})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [fillPercent, width, height, fillBottomY, fillTopY]);

  if (fillPercent <= 5) return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
      }}
    />
  );
}
