"use client";

import { useEffect, useState } from "react";

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

  if (!enabled) return null;

  return null;
}
