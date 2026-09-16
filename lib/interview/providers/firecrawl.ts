// Plain fetch, matching the existing convention in ../llm.ts — no SDK.
// A missing key or any failure returns an empty/null result rather than
// throwing, so the caller can degrade gracefully per spec §3.
const FIRECRAWL_ENDPOINT = "https://api.firecrawl.dev/v1";

export interface FirecrawlSearchResult {
  title: string;
  url: string;
  description?: string;
  markdown?: string;
}

function firecrawlHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
  };
}

export async function firecrawlSearch(
  query: string,
  opts?: { limit?: number; scrapeContent?: boolean }
): Promise<FirecrawlSearchResult[]> {
  if (!process.env.FIRECRAWL_API_KEY) return [];
  try {
    const body: Record<string, unknown> = { query, limit: opts?.limit ?? 4 };
    if (opts?.scrapeContent !== false) {
      body.scrapeOptions = { formats: ["markdown"] };
    }
    // A search with scrapeOptions markdown fetches full page content for
    // every result, not just a lightweight snippet — observed taking close
    // to 20s for 4 results in testing, so a plain-search timeout is too
    // tight here and produces false "no results" on a slow-but-real response.
    const timeoutMs = opts?.scrapeContent === false ? 15000 : 40000;
    const res = await fetch(`${FIRECRAWL_ENDPOINT}/search`, {
      method: "POST",
      headers: firecrawlHeaders(),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) return [];
    return json.data.map((d: Record<string, unknown>) => ({
      title: (d.title as string) || "",
      url: (d.url as string) || "",
      description: (d.description as string) || "",
      markdown: (d.markdown as string) || undefined,
    }));
  } catch {
    return [];
  }
}

export async function firecrawlScrape(url: string): Promise<{ markdown: string } | null> {
  if (!process.env.FIRECRAWL_API_KEY) return null;
  try {
    const res = await fetch(`${FIRECRAWL_ENDPOINT}/scrape`, {
      method: "POST",
      headers: firecrawlHeaders(),
      body: JSON.stringify({ url, formats: ["markdown"] }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success || !json.data?.markdown) return null;
    return { markdown: json.data.markdown as string };
  } catch {
    return null;
  }
}
