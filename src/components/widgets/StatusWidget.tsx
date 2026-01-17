"use client";

import { useEffect, useMemo, useState } from "react";

type Target = { id: string; title: string; url: string };

type StatusRow = {
  id: string;
  title: string;
  url: string;
  ok: boolean;
  status: number;
  ms: number;
};

export function StatusWidget({
  title,
  targets,
  intervalSeconds,
}: {
  title: string;
  targets: Target[];
  intervalSeconds: number;
}) {
  const [rows, setRows] = useState<StatusRow[]>([]);
  const orderedTargets = useMemo(
    () => targets.slice().sort((a, b) => a.title.localeCompare(b.title)),
    [targets]
  );

  useEffect(() => {
    let cancelled = false;

    async function pollOnce() {
      const results: StatusRow[] = [];

      for (const t of orderedTargets) {
        try {
          const res = await fetch(`/api/status?url=${encodeURIComponent(t.url)}`,
            { cache: "no-store" }
          );
          const json = (await res.json()) as { ok: boolean; status: number; ms: number };
          results.push({
            id: t.id,
            title: t.title,
            url: t.url,
            ok: Boolean(json.ok),
            status: typeof json.status === "number" ? json.status : 0,
            ms: typeof json.ms === "number" ? json.ms : 0,
          });
        } catch {
          results.push({ id: t.id, title: t.title, url: t.url, ok: false, status: 0, ms: 0 });
        }
      }

      if (!cancelled) setRows(results);
    }

    pollOnce();
    const timer = setInterval(pollOnce, Math.max(10, intervalSeconds) * 1000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [orderedTargets, intervalSeconds]);

  return (
    <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
      <div className="text-xs font-semibold text-white/80">{title}</div>
      <div className="mt-3 space-y-2">
        {rows.length === 0 ? (
          <div className="text-sm text-white/60">No targets configured.</div>
        ) : (
          rows.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-black/25 px-3 py-2"
            >
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-white">{r.title}</div>
                <div className="truncate text-[10px] text-white/50">{r.url}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className={r.ok ? "text-emerald-300" : "text-red-200"}>
                  {r.ok ? "UP" : "DOWN"}
                </div>
                <div className="text-[10px] text-white/60">{r.ms}ms</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
