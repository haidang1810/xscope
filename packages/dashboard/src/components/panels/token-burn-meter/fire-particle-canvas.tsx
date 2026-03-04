import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number; // 0 (red) → 60 (yellow)
  active: boolean;
}

interface FireParticleCanvasProps {
  /** 0-100, controls spawn rate */
  intensity: number;
  width: number;
  height: number;
}

const MAX_PARTICLES = 300;

function createDeadParticle(): Particle {
  return { x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 0, hue: 0, active: false };
}

function resetParticle(p: Particle, cx: number, cy: number) {
  p.x = cx + (Math.random() - 0.5) * 40;
  p.y = cy;
  p.vx = (Math.random() - 0.5) * 1.5;
  p.vy = -(Math.random() * 2.5 + 1.5);
  p.maxLife = Math.random() * 60 + 60;
  p.life = p.maxLife;
  p.size = Math.random() * 4 + 2;
  p.hue = 0; // start red, rises to yellow
  p.active = true;
}

/**
 * Canvas 2D fire particle system using an object pool (no GC pressure).
 * Spawn rate scales with intensity (0–100).
 * Max 300 particles at 60 FPS.
 */
export function FireParticleCanvas({ intensity, width, height }: FireParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poolRef = useRef<Particle[]>(Array.from({ length: MAX_PARTICLES }, createDeadParticle));
  const rafRef = useRef<number>(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxRaw = canvas.getContext("2d");
    if (!ctxRaw) return;
    const ctx: CanvasRenderingContext2D = ctxRaw;

    const pool = poolRef.current;
    // Emit origin: bottom-center of canvas
    const cx = width / 2;
    const cy = height - 10;

    // Spawn rate: 0 particles/frame at intensity 0, up to 8/frame at 100
    const spawnPerFrame = (intensity / 100) * 8;

    function findDeadSlot(): number {
      for (let i = 0; i < MAX_PARTICLES; i++) {
        if (!pool[i].active) return i;
      }
      return -1;
    }

    function tick() {
      ctx.clearRect(0, 0, width, height);
      frameRef.current++;

      // Spawn new particles
      if (intensity > 10) {
        const toSpawn = Math.floor(spawnPerFrame) + (Math.random() < spawnPerFrame % 1 ? 1 : 0);
        for (let s = 0; s < toSpawn; s++) {
          const slot = findDeadSlot();
          if (slot !== -1) resetParticle(pool[slot], cx, cy);
        }
      }

      // Update + draw
      for (let i = 0; i < MAX_PARTICLES; i++) {
        const p = pool[i];
        if (!p.active) continue;

        p.life--;
        if (p.life <= 0) {
          p.active = false;
          continue;
        }

        // Physics
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.03; // slight upward acceleration
        p.vx += (Math.random() - 0.5) * 0.1; // x drift

        // Hue rises from 0 (red) → 60 (yellow) as particle ages
        const lifeRatio = 1 - p.life / p.maxLife;
        p.hue = lifeRatio * 60;

        const alpha = (p.life / p.maxLife) * 0.85;
        const currentSize = p.size * (p.life / p.maxLife);

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, currentSize), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 55%, ${alpha})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [intensity, width, height]);

  // Hide canvas entirely when intensity is low
  if (intensity <= 10) return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        mixBlendMode: "screen",
      }}
    />
  );
}
