import { useEffect, useMemo, useRef, useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Wallpaper } from "@/components/Wallpaper";
import { SearchBar } from "@/components/SearchBar";
import { WidgetGrid } from "@/components/WidgetGrid";
import { useLocalStorageConfig } from "@/hooks/useLocalStorageConfig";
import { AddLinkModal } from "@/components/AddLinkModal";
import { EditClockModal } from "@/components/EditClockModal";
import { EditWeatherModal } from "@/components/EditWeatherModal";
import { EditLinkModal } from "@/components/EditLinkModal";
import { LinkGrid } from "@/components/LinkGrid";
import { AmbientCanvas } from "@/components/AmbientCanvas";
import { TagBar } from "@/components/TagBar";
import { NoiseOverlay } from "@/components/NoiseOverlay";
import { CursorGlow } from "@/components/CursorGlow";
import { SettingsModal } from "@/components/SettingsModal";
import { ShortcutsModal } from "@/components/ShortcutsModal";
import { StatusStrip, type WallpaperStatus, type WeatherStatus } from "@/components/StatusStrip";
import type { LinkItem, LinkSection, Widget } from "@/lib/schema";

function googleSearchUrl(query: string) {
  const trimmed = query.trim();
  const q = trimmed.replace(/^\/g\s+/, "");
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

export default function App() {
  const { ready, config, updateConfig, exportConfig, importConfig, validateConfig, resetConfig, lastSavedAt } =
    useLocalStorageConfig();
  const [query, setQuery] = useState("");

  const searchRef = useRef<HTMLInputElement>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [wallpaperRefreshKey, setWallpaperRefreshKey] = useState(0);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const [wallpaperStatus, setWallpaperStatus] = useState<WallpaperStatus>({ state: "idle" });
  const [weatherStatus, setWeatherStatus] = useState<WeatherStatus>({ state: "idle" });

  const filteredLinks = useMemo(() => {
    if (!config) return [];
    const q = query.trim().toLowerCase();

    const ordered = [...config.links.items].sort(
      (a, b) => (a.sort ?? 0) - (b.sort ?? 0) || a.title.localeCompare(b.title)
    );

    const byTag = tagFilter
      ? ordered.filter((i) => i.tags.map((t) => t.toLowerCase()).includes(tagFilter.toLowerCase()))
      : ordered;

    if (!q) return byTag;

    return byTag.filter((i) => {
      const hay = `${i.title} ${i.url} ${i.description ?? ""} ${i.tags.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [config, query, tagFilter]);

  const tagCounts = useMemo(() => {
    if (!config) return [] as { tag: string; count: number }[];
    const m = new Map<string, number>();
    for (const item of config.links.items) {
      for (const t of item.tags) {
        const key = t.trim();
        if (!key) continue;
        m.set(key, (m.get(key) ?? 0) + 1);
      }
    }
    return Array.from(m.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }, [config]);

  const orderedSections = useMemo(() => {
    if (!config) return [] as LinkSection[];
    return [...config.links.sections].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  }, [config]);

  const linksBySection = useMemo(() => {
    if (!config) return [] as { section: LinkSection; items: LinkItem[] }[];
    return orderedSections.map((s) => ({
      section: s,
      items: filteredLinks
        .filter((l) => l.sectionId === s.id)
        .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || a.title.localeCompare(b.title)),
    }));
  }, [config, orderedSections, filteredLinks]);

  const editingWidget: Widget | null = useMemo(() => {
    if (!config || !editingWidgetId) return null;
    return config.widgets.items.find((w) => w.id === editingWidgetId) ?? null;
  }, [config, editingWidgetId]);

  const editingLink = useMemo(() => {
    if (!config || !editingLinkId) return null;
    return config.links.items.find((l) => l.id === editingLinkId) ?? null;
  }, [config, editingLinkId]);

  const modalOpen = addOpen || !!editingLinkId || !!editingWidgetId || settingsOpen || shortcutsOpen;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (modalOpen) return;

      const target = e.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || (target as any).isContentEditable);
      if (typing) return;

      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      }

      if (e.key.toLowerCase() === "a") {
        e.preventDefault();
        setAddOpen(true);
      }

      if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        setSettingsOpen(true);
      }

      if (e.key === "?") {
        e.preventDefault();
        setShortcutsOpen(true);
      }

      if (e.key === "Escape") {
        if (tagFilter) {
          setTagFilter(null);
          return;
        }
        if (query) {
          setQuery("");
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalOpen, query, tagFilter]);

  if (!ready || !config) {
    return <div className="min-h-screen bg-black text-white">Loading…</div>;
  }

  return (
    <div className="min-h-screen text-white">
      <AmbientCanvas enabled={config.wallpaper.enabled && config.effects.ambientCanvas} />
      <NoiseOverlay enabled={config.wallpaper.enabled && config.effects.noise} />
      <CursorGlow enabled={config.wallpaper.enabled && config.effects.cursorGlow} />
      <ThemeProvider theme={config.theme} />
      <Wallpaper
        enabled={config.wallpaper.enabled}
        dim={config.wallpaper.dim}
        blurPx={config.wallpaper.blurPx}
        refreshKey={wallpaperRefreshKey}
        onStatus={(s) => {
          if (s.state === "ready") setWallpaperStatus({ state: "ready", source: s.source, url: s.url });
          else if (s.state === "error") setWallpaperStatus({ state: "error", message: s.message });
          else setWallpaperStatus({ state: s.state });
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/favicons/favicon-32x32.png" alt="" className="h-4 w-4 rounded-sm" />
            <div className="text-sm font-semibold text-white/80 tracking-tight">Dawnpage</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 text-[11px] text-white/40 md:flex">
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1">/</span>
              <span>search</span>
              <span className="mx-1">·</span>
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1">A</span>
              <span>add</span>
              <span className="mx-1">·</span>
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1">S</span>
              <span>settings</span>
              <span className="mx-1">·</span>
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1">?</span>
              <span>help</span>
            </div>
            <button
              type="button"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
              onClick={() => setSettingsOpen(true)}
              title="Settings"
            >
              Settings
            </button>
            <button
              type="button"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
              onClick={() => setShortcutsOpen(true)}
              title="Keyboard shortcuts"
            >
              Help
            </button>
            <button
              type="button"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
              onClick={() => setAddOpen(true)}
              title="Add link"
            >
              Add link
            </button>
            {tagFilter ? (
              <button
                type="button"
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                onClick={() => setTagFilter(null)}
                title="Clear tag filter"
              >
                Clear tag
              </button>
            ) : null}
          </div>
        </div>

        <StatusStrip wallpaper={wallpaperStatus} weather={weatherStatus} lastSavedAt={lastSavedAt} />

        <div className="mt-4">
          <TagBar
            tags={tagCounts}
            selected={tagFilter}
            onSelect={(t) => setTagFilter((prev) => (prev === t ? null : t))}
            onClear={() => setTagFilter(null)}
          />
        </div>

        <div className="mt-6">
          <SearchBar
            value={query}
            onChange={setQuery}
            inputRef={searchRef}
            onSubmit={() => {
              const q = query.trim();
              if (!q) return;
              window.open(googleSearchUrl(q), "_blank", "noreferrer");
            }}
          />
        </div>

        <div className="mt-6">
          <WidgetGrid
            config={config}
            onChangeLayout={(layout) => {
              updateConfig((prev) => ({
                ...prev,
                widgets: {
                  ...prev.widgets,
                  layout,
                },
              }));
            }}
            onEditWidget={(widgetId) => setEditingWidgetId(widgetId)}
            onWeatherStatus={(s) => {
              if (s.state === "ready") setWeatherStatus({ state: "ready" });
              else if (s.state === "error") setWeatherStatus({ state: "error", message: s.message });
              else setWeatherStatus({ state: s.state });
            }}
          />
        </div>

        <div className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-semibold text-white/60">Links</div>
            <div className="text-[11px] text-white/40">
              Drag cards to reorder · Hover for actions
            </div>
          </div>
          {query.trim() ? (
            <LinkGrid
              items={filteredLinks}
              query={query}
              onEdit={(id) => setEditingLinkId(id)}
              onDelete={(id) => {
                const ok = window.confirm("Delete this link?");
                if (!ok) return;
                updateConfig((prev) => ({
                  ...prev,
                  links: {
                    ...prev.links,
                    items: prev.links.items.filter((l) => l.id !== id),
                  },
                }));
              }}
              onReorder={(orderedIds) => {
                updateConfig((prev) => {
                  const pos = new Map<string, number>(orderedIds.map((id, idx) => [id, idx]));
                  const nextItems = prev.links.items.map((l) => {
                    const p = pos.get(l.id);
                    return typeof p === "number" ? { ...l, sort: p } : l;
                  });
                  return {
                    ...prev,
                    links: {
                      ...prev.links,
                      items: nextItems,
                    },
                  };
                });
              }}
            />
          ) : (
            <div className="grid gap-8">
              {linksBySection.filter(({ items }) => items.length > 0).map(({ section, items }) => (
                <div key={section.id}>
                  <div className="mb-3 text-xs font-semibold text-white/50">{section.title}</div>
                  <LinkGrid
                    items={items}
                    query={""}
                    onEdit={(id) => setEditingLinkId(id)}
                    onDelete={(id) => {
                      const ok = window.confirm("Delete this link?");
                      if (!ok) return;
                      updateConfig((prev) => ({
                        ...prev,
                        links: {
                          ...prev.links,
                          items: prev.links.items.filter((l) => l.id !== id),
                        },
                      }));
                    }}
                    onReorder={(orderedIds) => {
                      updateConfig((prev) => {
                        const pos = new Map<string, number>(orderedIds.map((id, idx) => [id, idx]));
                        const nextItems = prev.links.items.map((l) => {
                          const p = pos.get(l.id);
                          if (typeof p !== "number") return l;
                          if (l.sectionId !== section.id) return l;
                          return { ...l, sort: p };
                        });
                        return {
                          ...prev,
                          links: {
                            ...prev.links,
                            items: nextItems,
                          },
                        };
                      });
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AddLinkModal
        open={addOpen}
        sections={config.links.sections}
        onClose={() => setAddOpen(false)}
        onAdd={(item) => {
          updateConfig((prev) => ({
            ...prev,
            links: {
              ...prev.links,
              items: [
                { ...item, sort: (prev.links.items.reduce((m, i) => Math.max(m, i.sort ?? 0), -1) + 1) | 0 },
                ...prev.links.items,
              ],
            },
          }));
        }}
      />

      {editingLink ? (
        <EditLinkModal
          open={!!editingLink}
          item={editingLink}
          sections={config.links.sections}
          onClose={() => setEditingLinkId(null)}
          onDelete={(id) => {
            updateConfig((prev) => ({
              ...prev,
              links: {
                ...prev.links,
                items: prev.links.items.filter((l) => l.id !== id),
              },
            }));
            setEditingLinkId(null);
          }}
          onSave={(next) => {
            updateConfig((prev) => ({
              ...prev,
              links: {
                ...prev.links,
                items: prev.links.items.map((l) => (l.id === next.id ? next : l)),
              },
            }));
          }}
        />
      ) : null}

      <EditClockModal
        open={editingWidget?.type === "clock"}
        timezone={editingWidget?.type === "clock" ? editingWidget.timezone : "local"}
        onClose={() => setEditingWidgetId(null)}
        onSave={(timezone) => {
          if (!editingWidget || editingWidget.type !== "clock") return;
          updateConfig((prev) => ({
            ...prev,
            widgets: {
              ...prev.widgets,
              items: prev.widgets.items.map((w) =>
                w.id === editingWidget.id && w.type === "clock" ? { ...w, timezone } : w
              ),
            },
          }));
        }}
      />

      <EditWeatherModal
        open={editingWidget?.type === "weather"}
        latitude={editingWidget?.type === "weather" ? editingWidget.latitude : 0}
        longitude={editingWidget?.type === "weather" ? editingWidget.longitude : 0}
        timezone={editingWidget?.type === "weather" ? editingWidget.timezone : "auto"}
        unit={editingWidget?.type === "weather" ? editingWidget.unit : "c"}
        onClose={() => setEditingWidgetId(null)}
        onSave={(next) => {
          if (!editingWidget || editingWidget.type !== "weather") return;
          updateConfig((prev) => ({
            ...prev,
            widgets: {
              ...prev.widgets,
              items: prev.widgets.items.map((w) =>
                w.id === editingWidget.id && w.type === "weather" ? { ...w, ...next } : w
              ),
            },
          }));
        }}
      />

      {config ? (
        <SettingsModal
          open={settingsOpen}
          config={config}
          onClose={() => setSettingsOpen(false)}
          onUpdate={updateConfig}
          onExport={exportConfig}
          onImport={importConfig}
          onValidate={validateConfig}
          onReset={resetConfig}
          onRefreshWallpaper={() => setWallpaperRefreshKey((k) => k + 1)}
        />
      ) : null}

      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}
