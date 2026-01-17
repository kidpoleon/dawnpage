import type { Icon } from "./schema";

export function getIconUrl(icon: Icon, linkUrl: string): string | null {
  if (icon.type === "url") return icon.url;

  if (icon.type === "dashboardicons") {
    const name = icon.name.trim();
    if (!name) return null;
    return `https://raw.githubusercontent.com/walkxcode/dashboard-icons/master/png/${encodeURIComponent(
      name
    )}.png`;
  }

  try {
    const u = new URL(linkUrl);
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
      u.hostname
    )}&sz=128`;
  } catch {
    return null;
  }
}
