import { parseAppConfig, type AppConfig } from "./schema";
import { DEFAULT_CONFIG } from "./defaults";

export const STORAGE_KEY = "dawnpage.config";

export function loadConfigFromStorage(): AppConfig | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = parseAppConfig(JSON.parse(raw));
    return parsed;
  } catch {
    return null;
  }
}

export function saveConfigToStorage(config: AppConfig): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function ensureConfig(): AppConfig {
  const existing = loadConfigFromStorage();
  if (existing) return existing;
  saveConfigToStorage(DEFAULT_CONFIG);
  return DEFAULT_CONFIG;
}
