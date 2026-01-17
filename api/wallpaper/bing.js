export default async function handler(req, res) {
  try {
    const r = await fetch(
      "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US",
      {
        headers: {
          "User-Agent": "dawnpage/1.0",
        },
      }
    );

    if (!r.ok) {
      res.status(502).json({ error: "upstream_failed" });
      return;
    }

    const json = await r.json();
    const first = json?.images?.[0];
    const url = first?.url;

    if (!url) {
      res.status(502).json({ error: "bad_response" });
      return;
    }

    const fullUrl = url.startsWith("http") ? url : `https://www.bing.com${url}`;

    res.setHeader("Cache-Control", "public, max-age=900");
    res.status(200).json({ url: fullUrl, copyright: first?.copyright });
  } catch {
    res.status(500).json({ error: "internal" });
  }
}
