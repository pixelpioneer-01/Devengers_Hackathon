// ==========================================
// CivicAI — Firecrawl Client Helper
// ==========================================
// Provides search() and scrape() functions for use inside React components.
// Routes through /api/firecrawl Vercel serverless proxy when available.
// Falls back to direct Firecrawl API calls for local dev (with VITE_FIRECRAWL_API_KEY set).

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v1";

async function callFirecrawlProxy(mode, payload) {
  const firecrawlKey = import.meta.env.VITE_FIRECRAWL_API_KEY || '';

  // 1. Try serverless proxy first
  try {
    const res = await fetch('/api/firecrawl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, ...payload, firecrawlKey }),
    });

    if (res.ok) return await res.json();
    if (res.status !== 404) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Firecrawl proxy error: ${res.status}`);
    }
  } catch (err) {
    if (!err.message.includes('404') && !err.message.includes('Failed to fetch')) throw err;
  }

  // 2. Direct client-side fallback (only works with CORS-allowed endpoints)
  console.warn('[Firecrawl] Serverless proxy not found. Attempting direct call.');
  if (!firecrawlKey) throw new Error('VITE_FIRECRAWL_API_KEY not set for local dev fallback.');

  if (mode === 'search') {
    const res = await fetch(`${FIRECRAWL_BASE}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firecrawlKey}`,
      },
      body: JSON.stringify({ query: payload.query, limit: payload.limit || 5, scrapeOptions: { formats: ['markdown'] } }),
    });
    if (!res.ok) throw new Error(`Firecrawl search failed: ${res.status}`);
    const data = await res.json();
    return {
      results: (data.data || []).map(item => ({
        title: item.title || item.metadata?.title || 'Untitled',
        url: item.url || item.metadata?.sourceURL || '',
        description: item.description || item.metadata?.description || '',
        content: item.markdown || item.content || '',
      }))
    };
  }

  if (mode === 'scrape') {
    const res = await fetch(`${FIRECRAWL_BASE}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firecrawlKey}`,
      },
      body: JSON.stringify({ url: payload.url, formats: ['markdown'] }),
    });
    if (!res.ok) throw new Error(`Firecrawl scrape failed: ${res.status}`);
    const data = await res.json();
    return {
      title: data.data?.metadata?.title || '',
      content: data.data?.markdown || '',
      url: data.data?.metadata?.sourceURL || payload.url,
    };
  }

  throw new Error(`Unknown Firecrawl mode: ${mode}`);
}

/**
 * Search the web using Firecrawl.
 * @param {string} query - The search query string.
 * @param {number} limit - Max number of results (default: 5).
 * @returns {Promise<Array>} Array of { title, url, description, content } objects.
 */
export async function firecrawlSearch(query, limit = 5) {
  const data = await callFirecrawlProxy('search', { query, limit });
  return data.results || [];
}

/**
 * Scrape a single web page using Firecrawl.
 * @param {string} url - The URL to scrape.
 * @returns {Promise<Object>} Object with { title, content, url }.
 */
export async function firecrawlScrape(url) {
  return await callFirecrawlProxy('scrape', { url });
}
