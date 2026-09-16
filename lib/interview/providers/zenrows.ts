import { firecrawlSearch } from "./firecrawl";

// LinkedIn actively blocks generic scrapers, hence ZenRows specifically
// (js_render + premium_proxy) rather than a plain fetch here. Same
// missing-key/error -> null contract as firecrawl.ts.
const ZENROWS_ENDPOINT = "https://api.zenrows.com/v1/";

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function zenrowsScrapeUrl(url: string): Promise<string | null> {
  if (!process.env.ZENROWS_API_KEY) return null;
  try {
    const params = new URLSearchParams({
      apikey: process.env.ZENROWS_API_KEY,
      url,
      js_render: "true",
      premium_proxy: "true",
    });
    // js_render + premium_proxy warm-up can occasionally push a cold first
    // request past 30s even on a real success (observed in testing: 2 of 3
    // consecutive calls to the same URL landed in 6-14s, one hit 30s+) —
    // this is already expected to be the slowest step in the pipeline, so
    // give it real headroom rather than lose a legitimate result to an
    // avoidable timeout.
    const res = await fetch(`${ZENROWS_ENDPOINT}?${params.toString()}`, {
      signal: AbortSignal.timeout(45000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const text = stripHtml(html);
    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
}

// Resolves a bare name to a LinkedIn profile URL via Firecrawl search, so
// LinkedIn-specific auth-bypassing logic stays isolated to this file and
// general web discovery stays on Firecrawl.
export async function resolveLinkedInUrl(nameOrQuery: string, company: string): Promise<string | null> {
  const results = await firecrawlSearch(`site:linkedin.com/in ${nameOrQuery} ${company}`, {
    limit: 3,
    scrapeContent: false,
  });
  const match = results.find((r) => r.url.includes("linkedin.com/in"));
  return match?.url || null;
}

export async function zenrowsScrapeLinkedIn(nameOrUrl: string, company: string): Promise<string | null> {
  const isUrl = /^https?:\/\//i.test(nameOrUrl);
  const url = isUrl ? nameOrUrl : await resolveLinkedInUrl(nameOrUrl, company);
  if (!url) return null;
  return zenrowsScrapeUrl(url);
}
