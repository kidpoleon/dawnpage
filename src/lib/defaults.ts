import type { AppConfig } from "./schema";

export const DEFAULT_CONFIG: AppConfig = {
  version: 1,
  theme: "dark",
  search: {
    engine: "google",
    showBangTooltips: true,
  },
  wallpaper: {
    enabled: true,
    source: "bing",
    dim: 0.55,
    blurPx: 8,
  },
  effects: {
    ambientCanvas: true,
    noise: true,
    cursorGlow: true,
  },
  links: {
    sections: [
      { id: "main", title: "Main", sort: 0 },
      { id: "dev", title: "Dev", sort: 1 },
    ],
    items: [
      {
        id: "github",
        title: "GitHub",
        url: "https://github.com/",
        sectionId: "dev",
        sort: 0,
        open: "new_tab",
        tags: ["code"],
        icon: { type: "favicon" },
      },
      {
        id: "gmail",
        title: "Gmail",
        url: "https://mail.google.com/",
        sectionId: "main",
        sort: 1,
        open: "new_tab",
        tags: ["mail"],
        icon: { type: "favicon" },
      },
    ],
  },
  widgets: {
    enabled: true,
    items: [
      { type: "clock", id: "w_clock", title: "Time", timezone: "local" },
      {
        type: "weather",
        id: "w_weather",
        title: "Weather",
        latitude: 14.5995,
        longitude: 120.9842,
        timezone: "auto",
        unit: "c",
      },
    ],
    layout: [
      { i: "w_clock", x: 0, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
      { i: "w_weather", x: 4, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
    ],
  },
};
