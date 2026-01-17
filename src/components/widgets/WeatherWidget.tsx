"use client";

import { useEffect, useMemo, useState } from "react";

type WeatherState =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "ready"; temp: number; wind: number }
  | { state: "error"; message: string };

export function WeatherWidget({
  title,
  latitude,
  longitude,
  timezone,
  unit,
  onEdit,
}: {
  title: string;
  latitude: number;
  longitude: number;
  timezone: string;
  unit: "c" | "f";
  onEdit?: () => void;
}) {
  const [data, setData] = useState<WeatherState>({ state: "idle" });

  const url = useMemo(() => {
    const tempUnit = unit === "f" ? "fahrenheit" : "celsius";
    const tz = timezone === "auto" ? "auto" : timezone;
    return `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m&temperature_unit=${tempUnit}&timezone=${encodeURIComponent(
      tz
    )}`;
  }, [latitude, longitude, timezone, unit]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setData({ state: "loading" });
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`Weather failed (${res.status})`);
        const json = (await res.json()) as {
          current?: { temperature_2m?: number; wind_speed_10m?: number };
        };
        const temp = json.current?.temperature_2m;
        const wind = json.current?.wind_speed_10m;
        if (typeof temp !== "number" || typeof wind !== "number") throw new Error("Bad weather response");
        if (cancelled) return;
        setData({ state: "ready", temp, wind });
      } catch (e) {
        if (cancelled) return;
        setData({ state: "error", message: e instanceof Error ? e.message : "Failed" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="group relative h-full rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-white/80">{title}</div>
        <div className="text-[10px] text-white/50">
          {latitude.toFixed(2)}, {longitude.toFixed(2)}
        </div>
      </div>

      <div className="mt-2">
        {data.state === "ready" ? (
          <div className="text-white">
            <div className="text-xl font-semibold">
              {data.temp.toFixed(0)}°{unit.toUpperCase()}
            </div>
            <div className="mt-1 text-xs text-white/60">Wind: {data.wind.toFixed(0)} km/h</div>
          </div>
        ) : data.state === "loading" ? (
          <div className="text-sm text-white/60">Loading…</div>
        ) : data.state === "error" ? (
          <div className="text-sm text-red-200">{data.message}</div>
        ) : (
          <div className="text-sm text-white/60">—</div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onEdit?.()}
        className="absolute right-2 bottom-2 rounded-lg bg-black/30 px-2 py-1 text-[10px] text-white/70 opacity-0 transition group-hover:opacity-100"
        title="Edit weather settings"
      >
        Edit
      </button>
    </div>
  );
}
