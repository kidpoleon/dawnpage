"use client";

import { useMemo, useState } from "react";
import type { Icon, LinkItem, LinkOpenBehavior, LinkSection } from "@/lib/schema";
import { nanoid } from "@/lib/utils";
import { Modal } from "@/components/Modal";

type IconMode = "favicon" | "url" | "dashboardicons";

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}

export function AddLinkModal({
  open,
  sections,
  onClose,
  onAdd,
}: {
  open: boolean;
  sections: LinkSection[];
  onClose: () => void;
  onAdd: (item: LinkItem) => void;
}) {
  const defaultSection = sections[0]?.id ?? "main";

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [sectionId, setSectionId] = useState(defaultSection);
  const [openBehavior, setOpenBehavior] = useState<LinkOpenBehavior>("new_tab");

  const [iconMode, setIconMode] = useState<IconMode>("favicon");
  const [iconUrl, setIconUrl] = useState("");
  const [dashboardIconName, setDashboardIconName] = useState("");

  const canSave = useMemo(() => title.trim().length > 0 && url.trim().length > 0, [title, url]);

  function buildIcon(): Icon {
    if (iconMode === "url") {
      return { type: "url", url: normalizeUrl(iconUrl) };
    }

    if (iconMode === "dashboardicons") {
      return { type: "dashboardicons", name: dashboardIconName.trim() || "" };
    }

    return { type: "favicon" };
  }

  return (
    <Modal
      open={open}
      title="Add link"
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
            disabled={!canSave}
            className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-black disabled:opacity-40"
            onClick={() => {
              const item: LinkItem = {
                id: nanoid("link"),
                title: title.trim(),
                url: normalizeUrl(url),
                description: description.trim() || undefined,
                tags: tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
                sectionId,
                sort: 0,
                open: openBehavior,
                icon: buildIcon(),
              };

              onAdd(item);
              onClose();
              setTitle("");
              setUrl("");
              setDescription("");
              setTags("");
              setSectionId(defaultSection);
              setOpenBehavior("new_tab");
              setIconMode("favicon");
              setIconUrl("");
              setDashboardIconName("");
            }}
          >
            Add
          </button>
        </>
      }
    >
      <div className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-[11px] text-white/60">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none"
            placeholder="GitHub"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-[11px] text-white/60">URL</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none"
            placeholder="https://github.com"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-[11px] text-white/60">Description (optional)</span>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none"
            placeholder="Code hosting"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-[11px] text-white/60">Section</span>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none"
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-[11px] text-white/60">Open</span>
            <select
              value={openBehavior}
              onChange={(e) => setOpenBehavior(e.target.value as LinkOpenBehavior)}
              className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none"
            >
              <option value="new_tab">New tab</option>
              <option value="same_tab">Same tab</option>
            </select>
          </label>
        </div>

        <label className="grid gap-1">
          <span className="text-[11px] text-white/60">Tags (comma separated)</span>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none"
            placeholder="dev, mail"
          />
        </label>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <div className="text-[11px] font-semibold text-white/70">Icon</div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setIconMode("favicon")}
              className={
                iconMode === "favicon"
                  ? "rounded-xl bg-white px-2 py-2 text-xs font-semibold text-black"
                  : "rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-xs text-white/80 hover:bg-white/10"
              }
            >
              Favicon
            </button>
            <button
              type="button"
              onClick={() => setIconMode("url")}
              className={
                iconMode === "url"
                  ? "rounded-xl bg-white px-2 py-2 text-xs font-semibold text-black"
                  : "rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-xs text-white/80 hover:bg-white/10"
              }
            >
              Image URL
            </button>
            <button
              type="button"
              onClick={() => setIconMode("dashboardicons")}
              className={
                iconMode === "dashboardicons"
                  ? "rounded-xl bg-white px-2 py-2 text-xs font-semibold text-black"
                  : "rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-xs text-white/80 hover:bg-white/10"
              }
            >
              Dashboard
            </button>
          </div>

          {iconMode === "url" ? (
            <label className="mt-3 grid gap-1">
              <span className="text-[11px] text-white/60">Image / SVG URL</span>
              <input
                value={iconUrl}
                onChange={(e) => setIconUrl(e.target.value)}
                className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none"
                placeholder="https://example.com/icon.svg"
              />
            </label>
          ) : null}

          {iconMode === "dashboardicons" ? (
            <label className="mt-3 grid gap-1">
              <span className="text-[11px] text-white/60">dashboard-icons name</span>
              <input
                value={dashboardIconName}
                onChange={(e) => setDashboardIconName(e.target.value)}
                className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none"
                placeholder="github"
              />
              <div className="text-[10px] text-white/40">
                Uses WalkxCode/dashboard-icons (png). Example: github, gmail, docker, etc.
              </div>
            </label>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
