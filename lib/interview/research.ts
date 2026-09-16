import { completeJSON } from "./llm";
import { firecrawlSearch, firecrawlScrape } from "./providers/firecrawl";
import { zenrowsScrapeLinkedIn } from "./providers/zenrows";
import { CompanyResearch, InterviewerResearch, ResearchBundle } from "./types";

export async function researchCompany(company: string): Promise<CompanyResearch> {
  if (!process.env.FIRECRAWL_API_KEY) {
    return { found: false, overviewText: "", strategicSignals: [], unavailableReason: "missing-key" };
  }

  const results = await firecrawlSearch(`${company} company overview funding news`, { limit: 4 });
  const corpus = results
    .filter((r) => r.markdown)
    .map((r) => `== ${r.url} ==\n${r.markdown!.slice(0, 4000)}`)
    .join("\n\n");

  if (!corpus) {
    return { found: false, overviewText: "", strategicSignals: [], unavailableReason: "no-results" };
  }

  try {
    const distilled = await completeJSON<{ overviewText: string; strategicSignals: string[] }>({
      system:
        'You distill live web research about a company for interview prep. Ground everything in the corpus given, never invent. Output ONLY JSON: {"overviewText": string, "strategicSignals": string[]}.',
      messages: [{ role: "user", content: `Company: ${company}\n\nResearch corpus:\n${corpus.slice(0, 12000)}` }],
      maxTokens: 1200,
    });
    return {
      found: true,
      overviewText: distilled.overviewText || "",
      strategicSignals: distilled.strategicSignals || [],
    };
  } catch {
    return { found: false, overviewText: "", strategicSignals: [], unavailableReason: "fetch-failed" };
  }
}

// Only called when the candidate didn't provide a JD (spec §6).
export async function findComparablePostings(
  company: string,
  roleTitle: string
): Promise<CompanyResearch["comparablePostings"]> {
  if (!process.env.FIRECRAWL_API_KEY) return [];
  const [careers, linkedinJobs] = await Promise.all([
    firecrawlSearch(`${company} careers ${roleTitle}`, { limit: 3, scrapeContent: false }),
    firecrawlSearch(`site:linkedin.com/jobs ${company} ${roleTitle}`, { limit: 3, scrapeContent: false }),
  ]);
  return [...careers, ...linkedinJobs]
    .filter((r) => r.url)
    .slice(0, 4)
    .map((r) => ({ title: r.title, url: r.url, snippet: r.description || "" }));
}

// Picking "the longest snippet" is not a reliable proxy for "the most
// substantive one" — a careers page's own listing is often markdown-heavy
// nav chrome ("# Role\n## Hybrid work...\n[Apply now]") that out-lengths a
// shorter but genuinely informative LinkedIn Jobs mirror of the same
// posting (observed in testing against a real Stripe posting). Distill
// honestly instead of guessing from raw length.
async function distillBestPosting(
  company: string,
  roleTitle: string,
  postings: NonNullable<CompanyResearch["comparablePostings"]>
): Promise<{ text: string; title: string; url: string; thin: boolean } | null> {
  if (postings.length === 0) return null;

  // findComparablePostings only collects lightweight search snippets, which
  // are often too thin to be useful (a careers page's own listing is
  // frequently just nav chrome). LinkedIn Jobs pages tend to render fully
  // server-side unlike React-heavy careers pages, so a bounded scrape of
  // the top LinkedIn candidate has a real shot at richer content.
  // firecrawlScrape already times out and returns null safely on its own.
  const linkedinCandidate = postings.find((p) => p.url.includes("linkedin.com/jobs"));
  let enriched = postings;
  if (linkedinCandidate) {
    const scraped = await firecrawlScrape(linkedinCandidate.url);
    if (scraped?.markdown) {
      enriched = postings.map((p) =>
        p.url === linkedinCandidate.url ? { ...p, snippet: scraped.markdown.slice(0, 4000) } : p
      );
    }
  }

  const corpus = enriched.map((p, i) => `[${i}] ${p.title} (${p.url})\n${p.snippet}`).join("\n\n");
  try {
    const distilled = await completeJSON<{ scopeText: string; bestIndex: number; thin: boolean }>({
      system:
        'You are given several real, live search results for postings similar to a role at a company — none may be the exact JD. Pick the ONE result (by index) that best describes real role scope or requirements, and write a short, honest summary of what it actually says. If none of the results contain real scope/requirement detail (e.g. they are just navigation text like "Apply now" or generic equal-opportunity boilerplate), set thin:true and scopeText to a brief honest note that only a job title match was found, with no real detail. Never invent detail beyond what is literally in the given snippets. Output ONLY JSON: {"scopeText": string, "bestIndex": number, "thin": boolean}.',
      messages: [{ role: "user", content: `Company: ${company}\nTarget role: ${roleTitle}\n\nCandidate postings:\n${corpus}` }],
      maxTokens: 500,
    });
    const chosen = enriched[distilled.bestIndex] || enriched[0];
    return { text: distilled.scopeText || "", title: chosen.title, url: chosen.url, thin: !!distilled.thin };
  } catch {
    const fallback = postings[0];
    return { text: `${fallback.title}\n${fallback.snippet}`, title: fallback.title, url: fallback.url, thin: true };
  }
}

export async function researchInterviewer(nameOrUrl: string, company: string): Promise<InterviewerResearch> {
  if (!process.env.ZENROWS_API_KEY) {
    return { found: false, unavailableReason: "missing-key" };
  }

  const raw = await zenrowsScrapeLinkedIn(nameOrUrl, company);
  if (!raw) {
    return { found: false, unavailableReason: "scrape-blocked" };
  }

  try {
    const distilled = await completeJSON<{
      name?: string;
      headline?: string;
      aboutText?: string;
      recentActivity?: string[];
    }>({
      system:
        'You distill a scraped LinkedIn profile page into structured facts for interview prep. List recent activity/posts newest first, and prioritize them over headline/about text since they are more current (spec rule: ground research in what someone is actually saying right now). The page was scraped as a logged-out guest, so LinkedIn often masks deeper content with literal asterisks (e.g. "*** *** **********") and repeats "Sign in to see more" prompts — never treat masked or sign-in-prompt text as real content, leave a field empty if the real value is hidden behind one of these. Ground everything else in the page content given, never invent. Output ONLY JSON: {"name", "headline", "aboutText", "recentActivity": string[]}.',
      messages: [{ role: "user", content: `Scraped LinkedIn profile content:\n${raw.slice(0, 10000)}` }],
      maxTokens: 1200,
    });

    // A bare name/company badge with no About text and no activity isn't
    // useful for Module 6 (spec: needs "something real and current from
    // their own LinkedIn activity") even though the scrape technically
    // succeeded — LinkedIn's guest-view content gate on personal profiles
    // means this is common, not an edge case. Report it honestly as
    // effectively not found rather than a hollow found:true.
    if (!distilled.aboutText && (!distilled.recentActivity || distilled.recentActivity.length === 0)) {
      return { found: false, unavailableReason: "profile-gated" };
    }

    return { found: true, ...distilled };
  } catch {
    return { found: false, unavailableReason: "fetch-failed" };
  }
}

export async function runResearch(input: {
  company: string;
  roleTitle: string;
  jobDescriptionText?: string;
  interviewerInput?: string | null;
}): Promise<ResearchBundle> {
  const [company, interviewer] = await Promise.all([
    researchCompany(input.company),
    input.interviewerInput
      ? researchInterviewer(input.interviewerInput, input.company)
      : Promise.resolve<InterviewerResearch>({ found: false, unavailableReason: "no-profile-given" }),
  ]);

  let jd: ResearchBundle["jd"];
  if (input.jobDescriptionText?.trim()) {
    jd = { text: input.jobDescriptionText, source: "provided" };
  } else {
    const postings = await findComparablePostings(input.company, input.roleTitle);
    // Spec §6 ranks a close-match posting above the interviewer's profile
    // regardless of how detailed the posting text turns out to be — a
    // confirmed title match is still worth more than an unrelated profile.
    // "thin" only changes how honestly we describe what was found, not
    // which source wins.
    const best = postings && postings.length > 0 ? await distillBestPosting(input.company, input.roleTitle, postings) : null;
    if (best) {
      jd = {
        text: best.thin
          ? `${best.title}\nOnly the job title was confirmed via a live posting at ${input.company}, no detailed scope or requirements text was available online. Treat scope beyond the title as unconfirmed.`
          : best.text,
        source: "inferred-posting",
        inferenceNote: best.thin
          ? `No JD was provided. A live posting titled "${best.title}" (${best.url}) confirms this role exists at ${input.company}, but no detailed scope description was found, only the title.`
          : `No JD was provided. Inferred from ${input.company}'s own live posting: "${best.title}" (${best.url}).`,
      };
    } else if (interviewer.found && interviewer.aboutText) {
      jd = {
        text: interviewer.aboutText,
        source: "inferred-interviewer-profile",
        inferenceNote:
          "No JD was provided and no comparable posting was found. Inferred likely scope from the interviewer's own LinkedIn About text.",
      };
    } else {
      jd = { text: "", source: "none" };
    }
  }

  return { company, interviewer, jd, researchedAt: new Date().toISOString() };
}
