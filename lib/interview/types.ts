// Shared shapes for the Interview Prep v1 rebuild — research, generation, and
// rendering all read/write these types. See:
// interview prep/Interview Prep - Skill Spec for Sehraj.md

export type ResearchUnavailableReason =
  | "missing-key"
  | "fetch-failed"
  | "no-results"
  | "no-profile-given"
  | "scrape-blocked"
  // LinkedIn served a real page (not bot-blocked) but gated the
  // substantive content — About/Experience/Activity — behind a "sign in to
  // see more" wall for guest viewers, common on personal profiles even
  // when the scrape itself succeeds. Distinct from scrape-blocked because
  // the failure mode (and any future fix) is different.
  | "profile-gated";

export interface CompanyResearch {
  found: boolean;
  overviewText: string;
  strategicSignals: string[];
  comparablePostings?: { title: string; url: string; snippet: string }[];
  unavailableReason?: ResearchUnavailableReason;
}

export interface InterviewerResearch {
  found: boolean;
  name?: string;
  headline?: string;
  aboutText?: string;
  recentActivity?: string[];
  unavailableReason?: ResearchUnavailableReason;
}

export type JDSource =
  | "provided"
  | "inferred-posting"
  | "inferred-interviewer-profile"
  | "none";

export interface ResearchBundle {
  company: CompanyResearch;
  interviewer: InterviewerResearch;
  jd: { text: string; source: JDSource; inferenceNote?: string };
  researchedAt: string;
}

// ---- Generation output (Modules 1-6 + header) ----

export interface StrategyBrief {
  strategicVector: string;
  whyNow: string;
  topTraits: string[]; // 2-4
  execLevelQuestion: string;
  bridge: string;
}

export interface ElevatorIntro {
  positioning: string; // present, 15s
  growthNarrative: string; // past, 40-45s
  hookOrBridge: string; // future OR honest-bridge
  isHonestBridge: boolean; // drives the beat label at render time
}

export interface CompetencyMapRow {
  requirement: string;
  questionToExpect: string;
  proofPoint: string; // if isGap, this is the honest gap explanation instead
  isGap: boolean;
}

export interface Handler {
  toughestObjection: string; // the objection this module answers, used as the heading
  directAcknowledge: string;
  pivot: string;
  presentFuture: string;
}

export interface QuickAnswer {
  question: string; // e.g. "Why leaving?"
  point1: string;
  reason: string;
  example: string;
  point2: string;
}

export interface ReverseQuestionRow {
  question: string;
  whatItSignals: string;
}

export interface PrepSummary {
  title: string; // "Interview Prep: <role>, <company>"
  subtitle: string; // candidate · interviewer (if any) · company
  topFlags: { type: "flag" | "strength"; text: string }[];
}

export interface PrepModules {
  summary: PrepSummary;
  companyContext: string; // panel-card body text (company facts)
  interviewerContext?: string; // panel-card body text, omitted if not found
  strategyBrief: StrategyBrief;
  elevatorIntro: ElevatorIntro;
  competencyMap: CompetencyMapRow[];
  gapWarningNote: string; // the one sharpest gap, feeds the Handler
  handler: Handler;
  quickAnswer: QuickAnswer;
  reverseQuestions: ReverseQuestionRow[];
}

export interface PrepPackDoc {
  id?: string;
  userId: string;
  company: string;
  jobTitle: string;
  resumeText: string;
  interviewerInput: string | null;
  researchBundle: ResearchBundle;
  modules: PrepModules;
  html: string;
  parentPackId: string | null;
  correctionText: string | null;
  createdAt: string;
}
