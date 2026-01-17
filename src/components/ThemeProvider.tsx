"use client";

import { useEffect } from "react";
import type { Theme } from "@/lib/schema";

export function ThemeProvider({ theme }: { theme: Theme }) {
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  return null;
}
