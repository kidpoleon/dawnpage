"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

export type WallpaperStatus =
  | { state: "idle" | "loading" }
  | { state: "ready"; source: "bing" | "picsum"; url: string }
  | { state: "error"; message: string };

export type WeatherStatus =
  | { state: "idle" | "loading" }
  | { state: "ready" }
  | { state: "error"; message: string };

function sinceLabel(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 2) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

export function StatusStrip({
  wallpaper,
  weather,
  lastSavedAt,
}: {
  wallpaper: WallpaperStatus;
  weather: WeatherStatus;
  lastSavedAt: number | null;
}) {
  const savedLabel = useMemo(() => {
    if (!lastSavedAt) return "—";
    return sinceLabel(Date.now() - lastSavedAt);
  }, [lastSavedAt]);

  const wallpaperLabel = useMemo(() => {
    if (wallpaper.state === "ready") return wallpaper.source;
    if (wallpaper.state === "error") return "error";
    if (wallpaper.state === "loading") return "loading";
    return "—";
  }, [wallpaper]);

  const weatherLabel = useMemo(() => {
    if (weather.state === "ready") return "ok";
    if (weather.state === "error") return "error";
    if (weather.state === "loading") return "loading";
    return "—";
  }, [weather]);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-white/55">
      <div
        className={cn(
          "rounded-full border px-3 py-1",
          "border-white/10 bg-black/20"
        )}
        title={wallpaper.state === "error" ? wallpaper.message : wallpaper.state === "ready" ? wallpaper.url : ""}
      >
        Wallpaper: <span className="font-semibold text-white/70">{wallpaperLabel}</span>
      </div>
      <div
        className={cn(
          "rounded-full border px-3 py-1",
          "border-white/10 bg-black/20",
          weather.state === "error" ? "border-red-500/20" : ""
        )}
        title={weather.state === "error" ? weather.message : ""}
      >
        Weather: <span className="font-semibold text-white/70">{weatherLabel}</span>
      </div>
      <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
        Saved: <span className="font-semibold text-white/70">{savedLabel}</span>
      </div>
    </div>
  );
}
