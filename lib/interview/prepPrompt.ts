import { LlmMessage } from "./llm";
import { ResearchBundle } from "./types";

export interface BuildGenerationPromptInput {
  resumeText: string;
  profileSummaryText?: string;
  company: string;
  roleTitle: string;
  interviewerInput?: string | null;
  researchBundle: ResearchBundle;
  correctionText?: string | null;
}

// Encodes the 7 non-negotiable rules from
// `interview prep/Interview Prep - Skill Spec for Sehraj.md` §4, verbatim in
// spirit, plus the exact output shape (matches PrepModules in ./types).
const SYSTEM_PROMPT = `You produce a real, specific interview-prep document for one named candidate applying to one named company and role. This is NOT a generic "top interview questions" generator. Every sentence you write must contain something that could only be true of this one candidate, this one company, and (if given) this one interviewer. A sentence that could be pasted into any other candidate's prep doc unchanged has not been done correctly.

Non-negotiable rules:
1. Never fabricate a fact. Not a metric, not a company detail, not a claimed skill. Every proof point in the Competency Map and every achievement in the Elevator Intro must trace back to something literally written in the candidate's resume text given to you. Do not invent numbers, employers, titles, or projects that are not in the resume.
2. Say plainly when something is missing or inferred. If the job description was not provided, or the interviewer was not found, or a fact was inferred rather than confirmed, name that explicitly as a "flag" entry in summary.topFlags. Do not smooth over it.
3. Name every real gap. If a job requirement has no real match in the resume, that Competency Map row must have isGap: true, and its proofPoint text must honestly state the gap rather than stretching a resume line into a false match.
4. Ground interviewer research in what they're actually saying right now. If recent activity text is available, prioritize it over a stale headline or About text when writing interviewerContext and the Reverse Questions.
5. No em dashes anywhere in any generated text. Use an arrow (→) for a mid-sentence break, or rewrite the sentence as two sentences.
6. No exactly-three-item lists in generated prose sentences. This is a rhythm rule about sentences you write, not about the structured arrays in the output schema (topTraits, competencyMap, reverseQuestions), which are data and exempt.
7. If a correction from the candidate is given to you, treat it as ground truth. It overrides any conflicting research or resume inference below it, and every section of your output must be re-derived consistently with it, not patched around it.

Output ONLY a single JSON object, no markdown fences, no commentary, matching exactly this shape:
{
  "summary": {
    "title": "Interview Prep: <role>, <company>",
    "subtitle": "<candidate name> · interviewer: <name, title> (if known) · <company>",
    "topFlags": [{ "type": "flag" | "strength", "text": "<one plain-language flag, e.g. no JD provided, or a standout match>" }]
  },
  "companyContext": "<panel-card body text about the company, grounded only in what was actually researched>",
  "interviewerContext": "<panel-card body text about the interviewer, OMIT this field entirely if no interviewer research was found>",
  "strategyBrief": {
    "strategicVector": "<company's actual current priority, 1-2 sentences>",
    "whyNow": "<what specifically made this role open right now>",
    "topTraits": ["<2 to 4 traits this hiring bar values, derived from real JD language or interviewer priorities>"],
    "execLevelQuestion": "<one sharp question proving the candidate understands the company's current situation>",
    "bridge": "<the single strongest, most specific connection between the candidate's real resume and the company's real need>"
  },
  "elevatorIntro": {
    "positioning": "<present, 15s, one sentence: current role + core strength>",
    "growthNarrative": "<past, 40-45s: 3-5 real quantified achievements from the resume, told as a story, not a bullet dump>",
    "hookOrBridge": "<future OR honest bridge if there's a real gap: why this role, tied to something concrete>",
    "isHonestBridge": true or false
  },
  "competencyMap": [
    { "requirement": "<JD requirement or inferred requirement>", "questionToExpect": "<question to expect>", "proofPoint": "<real resume proof point, or an honest gap statement if isGap>", "isGap": true or false }
  ],
  "gapWarningNote": "<the single sharpest real gap across the whole map, and how to honestly mitigate it>",
  "handler": {
    "toughestObjection": "<the single toughest, most likely objection, usually the sharpest gap>",
    "directAcknowledge": "<10-15s: say the gap plainly, no hedging>",
    "pivot": "<30s: the closest real, transferable thing they've actually done>",
    "presentFuture": "<20-30s: a concrete, credible plan for closing the gap fast>"
  },
  "quickAnswer": {
    "question": "<a shorter common question this candidate will likely face, e.g. why leaving, why this company>",
    "point1": "<point>",
    "reason": "<reason>",
    "example": "<one real resume proof point>",
    "point2": "<point>"
  },
  "reverseQuestions": [
    { "question": "<question tailored to the specific interviewer's real activity if known, otherwise a sharp company-directed question>", "whatItSignals": "<what asking this signals, plus a brief green-flag/red-flag read of a good vs concerning answer>" }
  ]
}

competencyMap should have 5-7 rows. reverseQuestions should have 4-6 rows.`;

function describeResearch(bundle: ResearchBundle): string {
  const lines: string[] = [];

  lines.push(
    `Job description status: ${bundle.jd.source}${bundle.jd.inferenceNote ? ` (${bundle.jd.inferenceNote})` : ""}`
  );
  lines.push(
    bundle.jd.text
      ? `Job description / inferred scope text:\n${bundle.jd.text}`
      : "No job description text is available. State this plainly in summary.topFlags and build the Competency Map against the closest reasonable inference from the company/role context, flagged as inferred."
  );

  lines.push(`\nCompany research found: ${bundle.company.found}`);
  if (bundle.company.found) {
    lines.push(`Company overview: ${bundle.company.overviewText}`);
    if (bundle.company.strategicSignals.length) {
      lines.push(`Strategic signals:\n- ${bundle.company.strategicSignals.join("\n- ")}`);
    }
  } else {
    lines.push(
      `Company research is unavailable (${bundle.company.unavailableReason || "unknown"}). Do not invent company facts. State this limitation plainly in summary.topFlags and keep companyContext honest about what is and isn't known.`
    );
  }

  lines.push(`\nInterviewer research found: ${bundle.interviewer.found}`);
  if (bundle.interviewer.found) {
    if (bundle.interviewer.name) lines.push(`Interviewer name: ${bundle.interviewer.name}`);
    if (bundle.interviewer.headline) lines.push(`Interviewer headline: ${bundle.interviewer.headline}`);
    if (bundle.interviewer.recentActivity?.length) {
      lines.push(
        `Interviewer recent activity, most recent first (prioritize this over headline/about text per rule 4):\n- ${bundle.interviewer.recentActivity.join("\n- ")}`
      );
    }
    if (bundle.interviewer.aboutText) lines.push(`Interviewer About text: ${bundle.interviewer.aboutText}`);
  } else {
    lines.push(
      `No interviewer information was found (${bundle.interviewer.unavailableReason || "not given"}). OMIT interviewerContext entirely from the output, and build reverseQuestions as sharp company-directed questions instead of naming or inventing a person.`
    );
  }

  return lines.join("\n");
}

export function buildGenerationPrompt(input: BuildGenerationPromptInput): { system: string; messages: LlmMessage[] } {
  const { resumeText, profileSummaryText, company, roleTitle, interviewerInput, researchBundle, correctionText } = input;

  const parts: string[] = [];

  if (correctionText) {
    parts.push(
      `CORRECTION FROM THE CANDIDATE. Treat this as ground truth. It overrides any conflicting research, resume inference, or assumption below, and every section of your output must be consistent with it, not just patched:\n${correctionText}\n`
    );
  }

  parts.push(`Company: ${company}`);
  parts.push(`Role: ${roleTitle}`);
  if (interviewerInput) parts.push(`Interviewer (as given by the candidate): ${interviewerInput}`);

  parts.push(
    `\nCandidate's real resume. This is the only source of truth for the candidate's facts. Every proof point and every quantified achievement you write must trace back to something literally here, never invent beyond it:\n${resumeText}`
  );

  if (profileSummaryText) {
    parts.push(
      `\nSecondary candidate profile info, only use this to fill small gaps like name or current title, the resume above is primary:\n${profileSummaryText}`
    );
  }

  parts.push(`\nResearch bundle:\n${describeResearch(researchBundle)}`);

  return {
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: parts.join("\n") }],
  };
}
