"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export function CursorGlow({ enabled = true }: { enabled?: boolean }) {
  const [motionOk, setMotionOk] = useState(true);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [visible, setVisible] = useState(true);
  const rafRef = useRef<number | null>(null);
  const nextRef = useRef<{ x: number; y: number } | null>(null);

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

    const onVis = () => setVisible(document.visibilityState === "visible");
    onVis();
    document.addEventListener("visibilitychange", onVis);

    const flush = () => {
      rafRef.current = null;
      if (nextRef.current) setPos(nextRef.current);
    };

    const onMove = (e: MouseEvent) => {
      nextRef.current = { x: e.clientX, y: e.clientY };
      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(flush);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [enabled, motionOk]);

  const style = useMemo(() => {
    if (!pos) return undefined;
    const x = Math.round(pos.x);
    const y = Math.round(pos.y);
    return {
      background: `radial-gradient(600px circle at ${x}px ${y}px, rgba(255,255,255,0.08), rgba(255,255,255,0.0) 60%)`,
    } as React.CSSProperties;
  }, [pos]);

  if (!enabled || !motionOk || !visible) return null;

  return <div className="pointer-events-none fixed inset-0 z-[6]" style={style} />;
}
