"use client";

import type { LinkItem } from "@/lib/schema";
import { getIconUrl } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { GripVertical, Pencil, Trash2 } from "lucide-react";

export function LinkCard({
  item,
  query,
  onEdit,
  onDelete,
  dragHandleProps,
}: {
  item: LinkItem;
  query: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}) {
  const iconUrl = getIconUrl(item.icon, item.url);

  const openInNewTab = item.open === "new_tab";

  return (
    <a
      href={item.url}
      target={openInNewTab ? "_blank" : undefined}
      rel={openInNewTab ? "noreferrer" : undefined}
      className={cn(
        "group relative block w-full rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition",
        "hover:bg-white/10 hover:-translate-y-0.5 hover:border-white/15"
      )}
      title={item.description ?? item.url}
    >
      <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
        {dragHandleProps ? (
          <button
            type="button"
            {...dragHandleProps}
            className={cn(
              "cursor-grab rounded-lg border border-white/10 bg-black/25 px-2 py-1 text-[10px] text-white/70 backdrop-blur-sm",
              "hover:bg-black/35 active:cursor-grabbing",
              dragHandleProps.className
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              dragHandleProps.onClick?.(e);
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              dragHandleProps.onPointerDown?.(e);
            }}
            title="Drag"
          >
            <GripVertical className="h-3.5 w-3.5" aria-hidden />
          </button>
        ) : null}

        {onEdit ? (
          <button
            type="button"
            className={cn(
              "rounded-lg border border-white/10 bg-black/25 px-2 py-1 text-[10px] text-white/70 backdrop-blur-sm",
              "hover:bg-black/35"
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(item.id);
            }}
            title="Edit"
            aria-label="Edit link"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden />
          </button>
        ) : null}

        {onDelete ? (
          <button
            type="button"
            className={cn(
              "rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1 text-[10px] text-red-100 backdrop-blur-sm",
              "hover:bg-red-500/15"
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(item.id);
            }}
            title="Delete"
            aria-label="Delete link"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
          </button>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 overflow-hidden rounded-xl bg-black/25 ring-1 ring-white/5">
          {iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={iconUrl} alt="" className="h-10 w-10 object-cover" loading="lazy" />
          ) : null}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white">{item.title}</div>
          <div className="truncate text-xs text-white/55">{item.description ?? item.url}</div>
        </div>
      </div>
      {query ? (
        <div className="mt-3 flex flex-wrap gap-1">
          {item.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] text-white/70"
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </a>
  );
}
