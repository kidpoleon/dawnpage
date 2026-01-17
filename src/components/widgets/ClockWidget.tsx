"use client";

import { useEffect, useMemo, useState } from "react";

function getNowParts(timeZone: string) {
  const d = new Date();
  const opts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "long",
    month: "short",
    day: "2-digit",
  };

  if (timeZone !== "local") opts.timeZone = timeZone;

  const fmt = new Intl.DateTimeFormat(undefined, opts);
  return fmt.format(d);
}

export function ClockWidget({
  title,
  timezone,
  onEdit,
}: {
  title: string;
  timezone: string;
  onEdit?: () => void;
}) {
  const tzLabel = useMemo(() => (timezone === "local" ? "Local" : timezone), [timezone]);
  const [value, setValue] = useState(() => getNowParts(timezone));

  useEffect(() => {
    const t = setInterval(() => {
      setValue(getNowParts(timezone));
    }, 250);
    return () => clearInterval(t);
  }, [timezone]);

  return (
    <div className="group relative h-full rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-white/80">{title}</div>
        <div className="text-[10px] text-white/50">{tzLabel}</div>
      </div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
      <button
        type="button"
        onClick={() => onEdit?.()}
        className="absolute right-2 bottom-2 rounded-lg bg-black/30 px-2 py-1 text-[10px] text-white/70 opacity-0 transition group-hover:opacity-100"
        title="Edit timezone"
      >
        Edit
      </button>
    </div>
  );
}
