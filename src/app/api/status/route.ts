import { NextResponse } from "next/server";
import dns from "node:dns/promises";
import net from "node:net";

export const runtime = "nodejs";

function isPrivateIp(ip: string) {
  if (net.isIP(ip) === 0) return true;

  // IPv4 private + loopback + link-local
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map((x) => Number(x));
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 0) return true;
    return false;
  }

  // IPv6 loopback + ULA + link-local
  const normalized = ip.toLowerCase();
  if (normalized === "::1") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (normalized.startsWith("fe80:")) return true;

  return false;
}

async function assertPublicHostname(hostname: string) {
  const res = await dns.lookup(hostname, { all: true });
  if (!res.length) throw new Error("dns_lookup_failed");
  for (const r of res) {
    if (isPrivateIp(r.address)) throw new Error("private_ip_blocked");
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const target = url.searchParams.get("url") ?? "";

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json({ error: "invalid_protocol" }, { status: 400 });
  }

  try {
    await assertPublicHostname(parsed.hostname);
  } catch {
    return NextResponse.json({ error: "blocked" }, { status: 400 });
  }

  const started = Date.now();

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(parsed.toString(), {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "dawnpage-status/1.0",
      },
      cache: "no-store",
    }).finally(() => clearTimeout(t));

    const ms = Date.now() - started;

    return NextResponse.json(
      {
        ok: res.ok,
        status: res.status,
        ms,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch {
    const ms = Date.now() - started;
    return NextResponse.json({ ok: false, status: 0, ms }, { status: 200 });
  }
}
