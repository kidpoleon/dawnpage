"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/Modal";

export function EditWeatherModal({
  open,
  latitude,
  longitude,
  timezone,
  unit,
  onClose,
  onSave,
}: {
  open: boolean;
  latitude: number;
  longitude: number;
  timezone: string;
  unit: "c" | "f";
  onClose: () => void;
  onSave: (next: { latitude: number; longitude: number; timezone: string; unit: "c" | "f" }) => void;
}) {
  const [lat, setLat] = useState(String(latitude));
  const [lon, setLon] = useState(String(longitude));
  const [tz, setTz] = useState(timezone);
  const [u, setU] = useState<"c" | "f">(unit);

  const latNum = useMemo(() => Number.parseFloat(lat), [lat]);
  const lonNum = useMemo(() => Number.parseFloat(lon), [lon]);

  const latOk = Number.isFinite(latNum) && latNum >= -90 && latNum <= 90;
  const lonOk = Number.isFinite(lonNum) && lonNum >= -180 && lonNum <= 180;

  return (
    <Modal
      open={open}
      title="Weather settings"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!latOk || !lonOk}
            className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-black disabled:opacity-40"
            onClick={() => {
              onSave({
                latitude: latNum,
                longitude: lonNum,
                timezone: tz.trim() || "auto",
                unit: u,
              });
              onClose();
            }}
          >
            Save
          </button>
        </>
      }
    >
      <div className="grid gap-3">
        <div className="text-xs text-white/60">
          Open‑Meteo uses latitude/longitude. You can get them from Google Maps.
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-[11px] text-white/60">Latitude</span>
            <input
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none"
              placeholder="14.5995"
            />
            {!latOk ? <span className="text-[10px] text-red-200">Must be between -90 and 90</span> : null}
          </label>
          <label className="grid gap-1">
            <span className="text-[11px] text-white/60">Longitude</span>
            <input
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none"
              placeholder="120.9842"
            />
            {!lonOk ? <span className="text-[10px] text-red-200">Must be between -180 and 180</span> : null}
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-[11px] text-white/60">Unit</span>
            <select
              value={u}
              onChange={(e) => setU(e.target.value as "c" | "f")}
              className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none"
            >
              <option value="c">Celsius</option>
              <option value="f">Fahrenheit</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-[11px] text-white/60">Timezone</span>
            <input
              value={tz}
              onChange={(e) => setTz(e.target.value)}
              className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none"
              placeholder="auto"
            />
            <span className="text-[10px] text-white/40">Use <b>auto</b> or IANA (Asia/Manila)</span>
          </label>
        </div>
      </div>
    </Modal>
  );
}
