"use client";

import { useEffect, useMemo, useState } from "react";

type WallpaperState =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "ready"; url: string; source: "bing" | "picsum" }
  | { state: "error"; message: string };

function dailyPicsumUrl() {
  const d = new Date();
  const seed = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1920/1080`;
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(
    2,
    "0"
  )}`;
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

export function Wallpaper({
  enabled,
  dim,
  blurPx,
  refreshKey,
  onStatus,
}: {
  enabled: boolean;
  dim: number;
  blurPx: number;
  refreshKey?: number;
  onStatus?: (s: WallpaperState) => void;
}) {
  const [wallpaper, setWallpaper] = useState<WallpaperState>({ state: "idle" });

  const cacheStorageKey = useMemo(() => `dawnpage.wallpaper.${todayKey()}`, []);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    (async () => {
      try {
        setWallpaper({ state: "loading" });

        // Try local cache first unless user explicitly refreshed.
        if (typeof window !== "undefined" && !refreshKey) {
          const raw = window.localStorage.getItem(cacheStorageKey);
          if (raw) {
            try {
              const cached = JSON.parse(raw) as { url?: string; source?: "bing" | "picsum" };
              if (cached?.url && (cached.source === "bing" || cached.source === "picsum")) {
                const ok = await preloadImage(cached.url);
                if (!cancelled && ok) {
                  setWallpaper({ state: "ready", url: cached.url, source: cached.source });
                  return;
                }
              }
            } catch {
              // ignore cache parse failures
            }
          }
        }

        const picsum = dailyPicsumUrl();
        const bing = (await tryFetchBingUrl()) ?? null;

        const candidates = [
          bing ? ({ url: bing, source: "bing" } as const) : null,
          ({ url: picsum, source: "picsum" } as const),
        ].filter(Boolean) as Array<{ url: string; source: "bing" | "picsum" }>;

        for (const c of candidates) {
          const ok = await preloadImage(c.url);
          if (cancelled) return;
          if (ok) {
            if (typeof window !== "undefined") {
              window.localStorage.setItem(cacheStorageKey, JSON.stringify({ url: c.url, source: c.source }));
            }
            setWallpaper({ state: "ready", url: c.url, source: c.source });
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
  }, [enabled, cacheStorageKey, refreshKey]);

  useEffect(() => {
    onStatus?.(wallpaper);
  }, [wallpaper, onStatus]);

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
