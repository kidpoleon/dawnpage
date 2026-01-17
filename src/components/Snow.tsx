"use client";

import { useEffect, useMemo, useState } from "react";
import Snowfall from "react-snowfall";

export function Snow() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mql) return;

    const apply = () => setEnabled(!mql.matches);
    apply();

    mql.addEventListener?.("change", apply);
    return () => mql.removeEventListener?.("change", apply);
  }, []);

  const props = useMemo(
    () => ({
      snowflakeCount: 60,
      speed: [0.15, 0.7] as [number, number],
      wind: [-0.1, 0.25] as [number, number],
      radius: [0.4, 2.2] as [number, number],
      opacity: [0.05, 0.22] as [number, number],
    }),
    []
  );

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Snowfall {...props} />
    </div>
  );
}
