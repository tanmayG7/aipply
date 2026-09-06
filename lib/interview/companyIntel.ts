import { completeJSON } from "./llm";

export interface CompanyIntel {
  overview: string;
  rating: number | null;
  pros: string[];
  cons: string[];
  redFlags: string[];
  commonInterviewQuestions: string[];
  salaryBands: { role: string; range: string }[];
  verified: boolean;
}

function slug(s: string): string {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Pull public review/interview/salary signals (AmbitionBox et al.). We fetch
 * server-rendered pages and let the model distill them; if the fetch fails
 * (blocked/offline), prep proceeds from the model's knowledge with an
 * explicit "unverified" flag.
 */
export async function companyIntel(company: string): Promise<CompanyIntel> {
  const sources = [
    `https://www.ambitionbox.com/overview/${slug(company)}-overview`,
    `https://www.ambitionbox.com/interviews/${slug(company)}-interview-questions`,
  ];

  let corpus = "";
  for (const url of sources) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers: { "user-agent": "Mozilla/5.0" },
      });
      if (res.ok) {
        const html = await res.text();
        corpus +=
          "\n\n== " +
          url +
          " ==\n" +
          html
            .replace(/<script[\s\S]*?<\/script>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .slice(0, 6000);
      }
    } catch {
      /* blocked or offline — fine */
    }
  }

  return completeJSON<CompanyIntel>({
    system: "You distill company intelligence for interview prep. Output ONLY JSON.",
    messages: [
      {
        role: "user",
        content: `Company: ${company}\n${
          corpus ? `Public data scraped just now:\n${corpus.slice(0, 10000)}` : "No live data available — use general knowledge and mark unverified."
        }\n\nReturn {"overview","rating":number|null,"pros":[...],"cons":[...],"redFlags":[...],"commonInterviewQuestions":[...],"salaryBands":[{"role","range"}],"verified":${corpus ? "true" : "false"}}`,
      },
    ],
    maxTokens: 1500,
  });
}
