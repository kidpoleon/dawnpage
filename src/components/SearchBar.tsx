"use client";

import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder,
  inputRef,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const localRef = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? localRef;

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const tooltip = useMemo(() => {
    return (
      "Bangs: /g (Google) | /yt (YouTube) | /r (Reddit)\n" +
      "Tip: press Enter to search, Esc to clear"
    );
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-md dark:bg-black/40">
        <div className="text-xs text-white/70">Search</div>
        <input
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit();
            if (e.key === "Escape") onChange("");
          }}
          placeholder={placeholder ?? "Type to search or filter links…"}
          className={cn(
            "h-8 w-full bg-transparent text-base text-white outline-none placeholder:text-white/40"
          )}
        />
        <div className="text-xs text-white/60" title={tooltip}>
          /?
        </div>
      </div>
    </div>
  );
}
