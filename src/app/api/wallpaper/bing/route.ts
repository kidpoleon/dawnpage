import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  const res = await fetch(
    "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US",
    {
      headers: {
        "User-Agent": "dawnpage/1.0",
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "failed" }, { status: 502 });
  }

  const json = (await res.json()) as {
    images?: Array<{ url: string; copyright?: string }>;
  };

  const first = json.images?.[0];
  if (!first?.url) {
    return NextResponse.json({ error: "bad_response" }, { status: 502 });
  }

  const fullUrl = first.url.startsWith("http") ? first.url : `https://www.bing.com${first.url}`;

  return NextResponse.json(
    { url: fullUrl, copyright: first.copyright },
    {
      headers: {
        "Cache-Control": "public, max-age=900",
      },
    }
  );
}
