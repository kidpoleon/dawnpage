"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Blob = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  hue: number;
};

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

export function AmbientCanvas({ enabled = true }: { enabled?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const blobsRef = useRef<Blob[]>([]);
  const [motionOk, setMotionOk] = useState(true);

  const blobCount = 6;

  const dpr = useMemo(() => {
    if (typeof window === "undefined") return 1;
    return Math.min(2, window.devicePixelRatio || 1);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mql) return;

    const apply = () => setMotionOk(!mql.matches);
    apply();

    mql.addEventListener?.("change", apply);
    return () => mql.removeEventListener?.("change", apply);
  }, []);

  useEffect(() => {
    if (!enabled || !motionOk) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (blobsRef.current.length === 0) {
        const init: Blob[] = [];
        for (let i = 0; i < blobCount; i++) {
          init.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: 180 + Math.random() * 220,
            vx: (Math.random() - 0.5) * 0.12,
            vy: (Math.random() - 0.5) * 0.12,
            hue: 190 + Math.random() * 80,
          });
        }
        blobsRef.current = init;
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const tick = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      ctx.globalCompositeOperation = "lighter";
      for (const b of blobsRef.current) {
        b.x += b.vx;
        b.y += b.vy;

        if (b.x < -b.r) b.x = w + b.r;
        if (b.x > w + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = h + b.r;
        if (b.y > h + b.r) b.y = -b.r;

        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        const a0 = 0.16;
        const a1 = 0.0;
        g.addColorStop(0, `hsla(${b.hue}, 90%, 60%, ${a0})`);
        g.addColorStop(1, `hsla(${b.hue}, 90%, 60%, ${a1})`);

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, w, h);

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [enabled, motionOk, dpr]);

  if (!enabled || !motionOk) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
