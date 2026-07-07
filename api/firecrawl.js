// ==========================================
// CivicAI — Firecrawl Web Search / Scrape Proxy
// ==========================================
// Usage:
//   POST /api/firecrawl
//   Body: { mode: "search" | "scrape", query?: string, url?: string, limit?: number }
//
// "search" mode: uses Firecrawl's /search endpoint to get live web data
// "scrape" mode: uses Firecrawl's /scrape endpoint to extract a page's content

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const firecrawlKey =
    process.env.FIRECRAWL_API_KEY ||
    process.env.VITE_FIRECRAWL_API_KEY ||
    req.body?.firecrawlKey;

  if (!firecrawlKey) {
    return res.status(500).json({ error: "Firecrawl API key not configured." });
  }

  const { mode, query, url, limit = 5 } = req.body;

  try {
    if (mode === "search") {
      if (!query) return res.status(400).json({ error: "Missing search query." });

      const response = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${firecrawlKey}`,
        },
        body: JSON.stringify({
          query,
          limit,
          scrapeOptions: {
            formats: ["markdown"],
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return res.status(response.status).json({ error: err?.error || `Firecrawl search error: ${response.status}` });
      }

      const data = await response.json();
      // Return simplified results
      const results = (data.data || []).map(item => ({
        title: item.title || item.metadata?.title || "Untitled",
        url: item.url || item.metadata?.sourceURL || "",
        description: item.description || item.metadata?.description || "",
        content: item.markdown || item.content || "",
      }));

      return res.status(200).json({ results });

    } else if (mode === "scrape") {
      if (!url) return res.status(400).json({ error: "Missing URL to scrape." });

      const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${firecrawlKey}`,
        },
        body: JSON.stringify({
          url,
          formats: ["markdown"],
          actions: [],
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return res.status(response.status).json({ error: err?.error || `Firecrawl scrape error: ${response.status}` });
      }

      const data = await response.json();
      return res.status(200).json({
        title: data.data?.metadata?.title || "",
        content: data.data?.markdown || "",
        url: data.data?.metadata?.sourceURL || url,
      });

    } else {
      return res.status(400).json({ error: "Invalid mode. Use 'search' or 'scrape'." });
    }

  } catch (error) {
    console.error("Firecrawl API error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
