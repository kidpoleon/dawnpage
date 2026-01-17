"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "@/components/Modal";
import type { AppConfig } from "@/lib/schema";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function SettingsModal({
  open,
  config,
  onClose,
  onUpdate,
  onExport,
  onImport,
  onValidate,
  onReset,
  onRefreshWallpaper,
}: {
  open: boolean;
  config: AppConfig;
  onClose: () => void;
  onUpdate: (updater: (prev: AppConfig) => AppConfig) => void;
  onExport: () => string;
  onImport: (raw: string) => { ok: true } | { ok: false; error: string };
  onValidate: (raw: string) => { ok: true; config: AppConfig } | { ok: false; error: string };
  onReset: () => void;
  onRefreshWallpaper: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importRaw, setImportRaw] = useState<string | null>(null);
  const [importReady, setImportReady] = useState<AppConfig | null>(null);
  const [copied, setCopied] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteValue, setPasteValue] = useState("");

  useEffect(() => {
    if (!open) return;
    setImportError(null);
    setImportRaw(null);
    setImportReady(null);
    setCopied(false);
    setPasteOpen(false);
    setPasteValue("");
  }, [open]);

  const importSummary = useMemo(() => {
    if (!importReady) return null;
    const links = importReady.links.items.length;
    const sections = importReady.links.sections.length;
    const widgets = importReady.widgets.items.length;
    return { links, sections, widgets };
  }, [importReady]);

  const focusRing =
    "focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-0";

  return (
    <Modal
      open={open}
      title="Settings"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className={`mr-auto rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-100 hover:bg-red-500/15 ${focusRing}`}
            onClick={() => {
              const ok = window.confirm("Reset Dawnpage to defaults? This will overwrite your links/widgets settings.");
              if (!ok) return;
              onReset();
              onClose();
            }}
          >
            Reset
          </button>
          <button
            type="button"
            className={`rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10 ${focusRing}`}
            onClick={onClose}
          >
            Close
          </button>
        </>
      }
    >
      <div className="grid gap-6">
        <section className="grid gap-3">
          <div className="text-xs font-semibold text-white/80">Wallpaper</div>

          <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-white">Enable wallpaper</div>
              <div className="text-xs text-white/50">Daily background image (Bing, with fallback)</div>
            </div>
            <input
              type="checkbox"
              checked={config.wallpaper.enabled}
              onChange={(e) =>
                onUpdate((prev) => ({
                  ...prev,
                  wallpaper: {
                    ...prev.wallpaper,
                    enabled: e.target.checked,
                  },
                }))
              }
              className={focusRing}
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-[11px] text-white/60">Dim</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={config.wallpaper.dim}
                onChange={(e) => {
                  const v = clamp(Number(e.target.value), 0, 1);
                  onUpdate((prev) => ({
                    ...prev,
                    wallpaper: { ...prev.wallpaper, dim: v },
                  }));
                }}
                className={focusRing}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-[11px] text-white/60">Blur</span>
              <input
                type="range"
                min={0}
                max={32}
                step={1}
                value={config.wallpaper.blurPx}
                onChange={(e) => {
                  const v = clamp(Number(e.target.value), 0, 32);
                  onUpdate((prev) => ({
                    ...prev,
                    wallpaper: { ...prev.wallpaper, blurPx: v },
                  }));
                }}
                className={focusRing}
              />
            </label>
          </div>

          <button
            type="button"
            className={`w-fit rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10 ${focusRing}`}
            onClick={onRefreshWallpaper}
          >
            Refresh wallpaper now
          </button>
        </section>

        <section className="grid gap-3">
          <div className="text-xs font-semibold text-white/80">Effects</div>

          <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-white">Ambient canvas</div>
              <div className="text-xs text-white/50">Soft animated color blobs</div>
            </div>
            <input
              type="checkbox"
              checked={config.effects.ambientCanvas}
              onChange={(e) =>
                onUpdate((prev) => ({
                  ...prev,
                  effects: { ...prev.effects, ambientCanvas: e.target.checked },
                }))
              }
              className={focusRing}
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-white">Noise overlay</div>
              <div className="text-xs text-white/50">Adds subtle texture</div>
            </div>
            <input
              type="checkbox"
              checked={config.effects.noise}
              onChange={(e) =>
                onUpdate((prev) => ({
                  ...prev,
                  effects: { ...prev.effects, noise: e.target.checked },
                }))
              }
              className={focusRing}
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-white">Cursor glow</div>
              <div className="text-xs text-white/50">Faint highlight under cursor</div>
            </div>
            <input
              type="checkbox"
              checked={config.effects.cursorGlow}
              onChange={(e) =>
                onUpdate((prev) => ({
                  ...prev,
                  effects: { ...prev.effects, cursorGlow: e.target.checked },
                }))
              }
              className={focusRing}
            />
          </label>
        </section>

        <section className="grid gap-3">
          <div className="text-xs font-semibold text-white/80">Config</div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10 ${focusRing}`}
              onClick={() => {
                const text = onExport();
                const blob = new Blob([text], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `dawnpage.config.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Download
            </button>

            <button
              type="button"
              className={`rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10 ${focusRing}`}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(onExport());
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1200);
                } catch {
                  setCopied(false);
                }
              }}
              title="Copy JSON to clipboard"
            >
              {copied ? "Copied" : "Copy"}
            </button>

            <button
              type="button"
              className={`rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10 ${focusRing}`}
              onClick={() => fileInputRef.current?.click()}
            >
              Import
            </button>

            <button
              type="button"
              className={`rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10 ${focusRing}`}
              onClick={() => {
                setPasteOpen((v) => !v);
                setImportError(null);
              }}
            >
              {pasteOpen ? "Hide paste" : "Paste JSON"}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (e) => {
                setImportError(null);
                const file = e.target.files?.[0];
                if (!file) return;
                const raw = await file.text();
                e.target.value = "";
                setImportRaw(raw);
                const v = onValidate(raw);
                if (!v.ok) {
                  setImportReady(null);
                  setImportError(v.error);
                } else {
                  setImportReady(v.config);
                }
              }}
            />
          </div>

          {pasteOpen ? (
            <div className="grid gap-2">
              <textarea
                value={pasteValue}
                onChange={(e) => setPasteValue(e.target.value)}
                rows={6}
                spellCheck={false}
                className={`w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 font-mono text-[11px] text-white/80 placeholder:text-white/30 ${focusRing}`}
                placeholder="Paste exported Dawnpage config JSON here"
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className={`rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10 ${focusRing}`}
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      setPasteValue(text);
                    } catch {
                      setImportError("Could not read clipboard");
                    }
                  }}
                >
                  Paste from clipboard
                </button>
                <button
                  type="button"
                  className={`rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10 ${focusRing}`}
                  onClick={() => {
                    setImportError(null);
                    setImportRaw(pasteValue);
                    const v = onValidate(pasteValue);
                    if (!v.ok) {
                      setImportReady(null);
                      setImportError(v.error);
                    } else {
                      setImportReady(v.config);
                    }
                  }}
                >
                  Preview paste
                </button>
              </div>
            </div>
          ) : null}

          {importError ? <div className="text-xs text-red-200">Import failed: {importError}</div> : null}

          {importReady && importSummary ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="text-[11px] font-semibold text-white/70">Import preview</div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-white/60">
                <div>
                  <div className="text-white/80">Links</div>
                  <div>{importSummary.links}</div>
                </div>
                <div>
                  <div className="text-white/80">Sections</div>
                  <div>{importSummary.sections}</div>
                </div>
                <div>
                  <div className="text-white/80">Widgets</div>
                  <div>{importSummary.widgets}</div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  className={`rounded-xl bg-white px-3 py-2 text-xs font-semibold text-black ${focusRing}`}
                  onClick={() => {
                    if (!importRaw) return;
                    const r = onImport(importRaw);
                    if (!r.ok) setImportError(r.error);
                    else onClose();
                  }}
                >
                  Apply import
                </button>
                <button
                  type="button"
                  className={`rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10 ${focusRing}`}
                  onClick={() => {
                    setImportRaw(null);
                    setImportReady(null);
                    setImportError(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </Modal>
  );
}
