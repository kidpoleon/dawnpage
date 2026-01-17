"use client";

import { useEffect, useState } from "react";

type WallpaperState =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "ready"; url: string }
  | { state: "error"; message: string };

function dailyPicsumUrl() {
  const d = new Date();
  const seed = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1920/1080`;
}

async function tryFetchBingUrl(): Promise<string | null> {
  try {
    const res = await fetch("/api/wallpaper/bing", { cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as { url?: string };
    if (!json?.url) return null;
    return json.url;
  } catch {
    return null;
  }
}

async function preloadImage(url: string): Promise<boolean> {
  return await new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.loading = "eager";
    img.referrerPolicy = "no-referrer";
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

export function Wallpaper({ enabled, dim, blurPx }: { enabled: boolean; dim: number; blurPx: number }) {
  const [wallpaper, setWallpaper] = useState<WallpaperState>({ state: "idle" });

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    (async () => {
      try {
        setWallpaper({ state: "loading" });
        const picsum = dailyPicsumUrl();
        const bing = (await tryFetchBingUrl()) ?? null;

        const candidates = [bing, picsum].filter(Boolean) as string[];
        for (const url of candidates) {
          const ok = await preloadImage(url);
          if (cancelled) return;
          if (ok) {
            setWallpaper({ state: "ready", url });
            return;
          }
        }

        if (cancelled) return;
        setWallpaper({ state: "error", message: "Wallpaper image failed to load." });
      } catch (e) {
        if (cancelled) return;
        setWallpaper({ state: "error", message: e instanceof Error ? e.message : "Failed" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  if (!enabled) return null;
  if (wallpaper.state !== "ready") {
    if (wallpaper.state === "error") {
      return (
        <div aria-hidden className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-black" />
          <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${dim})` }} />
        </div>
      );
    }
    return null;
  }

  return (
    <div aria-hidden className="fixed inset-0 z-0">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${wallpaper.url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: `blur(${blurPx}px)`,
          transform: "scale(1.05)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `rgba(0,0,0,${dim})`,
        }}
      />
    </div>
  );
}
