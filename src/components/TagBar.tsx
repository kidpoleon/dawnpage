"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type TagCount = { tag: string; count: number };

export function TagBar({
  tags,
  selected,
  onSelect,
  onClear,
}: {
  tags: TagCount[];
  selected: string | null;
  onSelect: (tag: string) => void;
  onClear: () => void;
}) {
  if (tags.length === 0) return null;

  const [mode, setMode] = useState<"top" | "all">("top");

  const shown = useMemo(() => {
    const sorted = [...tags];
    if (selected) {
      const idx = sorted.findIndex((t) => t.tag.toLowerCase() === selected.toLowerCase());
      if (idx >= 0) {
        const [picked] = sorted.splice(idx, 1);
        sorted.unshift(picked);
      }
    }

    if (mode === "all") return sorted;
    return sorted.slice(0, 14);
  }, [tags, selected, mode]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="mr-1 flex items-center gap-1">
        <button
          type="button"
          className={cn(
            "rounded-full border px-3 py-1 text-[11px] transition",
            mode === "top"
              ? "border-white/20 bg-white text-black"
              : "border-white/10 bg-black/20 text-white/75 hover:bg-black/30"
          )}
          onClick={() => setMode("top")}
          title="Show top tags"
        >
          Top
        </button>
        <button
          type="button"
          className={cn(
            "rounded-full border px-3 py-1 text-[11px] transition",
            mode === "all"
              ? "border-white/20 bg-white text-black"
              : "border-white/10 bg-black/20 text-white/75 hover:bg-black/30"
          )}
          onClick={() => setMode("all")}
          title="Show all tags"
        >
          All
        </button>
      </div>

      {selected ? (
        <button
          type="button"
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/80 hover:bg-white/10"
          onClick={onClear}
          title="Clear tag filter"
        >
          Tag: <span className="font-semibold">{selected}</span> ×
        </button>
      ) : null}

      {shown.map((t) => {
        const active = selected === t.tag;
        return (
          <button
            key={t.tag}
            type="button"
            className={cn(
              "rounded-full border px-3 py-1 text-[11px] transition",
              active
                ? "border-white/20 bg-white text-black"
                : "border-white/10 bg-black/20 text-white/75 hover:bg-black/30"
            )}
            onClick={() => onSelect(t.tag)}
            title={`${t.count} link${t.count === 1 ? "" : "s"}`}
          >
            {t.tag}
            <span className={cn("ml-1 opacity-70", active ? "text-black/70" : "text-white/60")}>
              {t.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
