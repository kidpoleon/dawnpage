"use client";

import { useEffect, useRef, useState } from "react";

export function NoiseOverlay({ enabled = true }: { enabled?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [motionOk, setMotionOk] = useState(true);

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

    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Draw one static noise frame (no animation required)
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 18; // alpha
    }
    ctx.putImageData(imageData, 0, 0);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [enabled, motionOk]);

  if (!enabled || !motionOk) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[5] opacity-[0.18] mix-blend-overlay">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
