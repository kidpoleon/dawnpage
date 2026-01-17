"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AppConfig } from "@/lib/schema";
import { ensureConfig, loadConfigFromStorage, saveConfigToStorage } from "@/lib/storage";
import { parseAppConfig } from "@/lib/schema";
import { DEFAULT_CONFIG } from "@/lib/defaults";

function sanitizeConfig(input: AppConfig): AppConfig {
  const widgets = input.widgets;

  const filteredItems = widgets.items.filter((w) => w.type !== "status");
  const ids = new Set(filteredItems.map((w) => w.id));
  const filteredLayout = widgets.layout.filter((l) => ids.has(l.i));

  if (filteredItems.length === widgets.items.length && filteredLayout.length === widgets.layout.length) {
    return input;
  }

  return {
    ...input,
    widgets: {
      ...widgets,
      items: filteredItems,
      layout: filteredLayout,
    },
  };
}

export function useLocalStorageConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  useEffect(() => {
    const c = sanitizeConfig(ensureConfig());
    saveConfigToStorage(c);
    setConfig(c);
  }, []);

  const updateConfig = useCallback((updater: (prev: AppConfig) => AppConfig) => {
    setConfig((prev) => {
      const base = prev ?? ensureConfig();
      const next = updater(base);
      saveConfigToStorage(next);
      setLastSavedAt(Date.now());
      return next;
    });
  }, []);

  const importConfig = useCallback((raw: string): { ok: true } | { ok: false; error: string } => {
    try {
      const json = JSON.parse(raw);
      const parsed = sanitizeConfig(parseAppConfig(json));
      saveConfigToStorage(parsed);
      setConfig(parsed);
      setLastSavedAt(Date.now());
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Invalid config" };
    }
  }, []);

  const validateConfig = useCallback(
    (raw: string): { ok: true; config: AppConfig } | { ok: false; error: string } => {
      try {
        const json = JSON.parse(raw);
        const parsed = sanitizeConfig(parseAppConfig(json));
        return { ok: true, config: parsed };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Invalid config" };
      }
    },
    []
  );

  const exportConfig = useCallback(() => {
    const current = config ?? loadConfigFromStorage() ?? ensureConfig();
    return JSON.stringify(current, null, 2);
  }, [config]);

  const resetConfig = useCallback(() => {
    const parsed = sanitizeConfig(parseAppConfig(DEFAULT_CONFIG));
    saveConfigToStorage(parsed);
    setConfig(parsed);
    setLastSavedAt(Date.now());
  }, []);

  const ready = useMemo(() => config !== null, [config]);

  return {
    ready,
    config,
    setConfig,
    updateConfig,
    importConfig,
    validateConfig,
    exportConfig,
    resetConfig,
    lastSavedAt,
  };
}
