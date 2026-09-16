import { PrepModules } from "./types";

// Ports the exact visual system used across the real calibration files in
// `interview prep/*.html` — .bar/.wrap/.header/.flag/.strength/.module/
// .module-h/.panel-card/.callout/.gap/.beat/.beat-lbl/tables/.note.
// Module 7 (roadmap-phase/quickwin) and Module 8 (prompt-box) are
// deliberately omitted — out of scope for this build.

interface RenderMeta {
  company: string;
  roleTitle: string;
  interviewerName?: string;
}

const ACCENT_PAIRS: { accent: string; accent2: string }[] = [
  { accent: "#1a5c8c", accent2: "#d4a017" },
  { accent: "#b8542f", accent2: "#1a3a5c" },
  { accent: "#2c6e49", accent2: "#c98a3b" },
  { accent: "#5b3a8c", accent2: "#2a9d8f" },
  { accent: "#7a2e2e", accent2: "#3a6b7a" },
  { accent: "#1f4e5f", accent2: "#c9622d" },
];

function pickAccentPair(company: string) {
  let hash = 0;
  for (let i = 0; i < company.length; i++) hash = (hash * 31 + company.charCodeAt(i)) >>> 0;
  return ACCENT_PAIRS[hash % ACCENT_PAIRS.length];
}

function escapeHtml(value: string | undefined | null): string {
  if (!value) return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderCss(accent: string, accent2: string): string {
  return `
  :root {
    --accent: ${accent};
    --accent-2: ${accent2};
    --ink: #1c1c22;
    --sub: #5a5c66;
    --rule: #d8d8dc;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Public Sans', -apple-system, sans-serif; color: var(--ink); background: #f4f1ec; line-height: 1.5; }
  h1, h2 { font-family: 'Archivo', sans-serif; }

  .bar { height: 8px; width: 100%; background: linear-gradient(90deg, var(--accent), var(--accent-2)); }
  .wrap { max-width: 820px; margin: 0 auto; padding: 30px 24px 60px 24px; }

  .header { border-bottom: 1px solid var(--rule); padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { font-size: 22pt; font-weight: 800; }
  .header .sub { font-size: 11pt; color: var(--sub); margin-top: 4px; }

  .flag { background: #fdf3e7; border-left: 3px solid #d8a900; padding: 10px 16px; margin: 18px 0 26px 0; font-size: 10.3pt; }
  .strength { background: #eef7f0; border-left: 3px solid #2c8a51; padding: 10px 16px; margin: 18px 0 26px 0; font-size: 10.3pt; }

  .module { margin-bottom: 34px; }
  .module-h {
    font-size: 10pt; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ink); border-bottom: 2px solid var(--accent); padding-bottom: 6px; margin-bottom: 12px;
  }
  .module h3 { font-size: 12.5pt; font-weight: 700; margin: 14px 0 4px 0; color: var(--accent); }
  .module p { font-size: 10.5pt; margin-bottom: 6px; }
  .module ul { margin: 4px 0 10px 20px; }
  .module li { font-size: 10.5pt; margin-bottom: 5px; }
  .callout { background: #fff; border: 1px solid var(--rule); border-radius: 6px; padding: 12px 16px; margin: 10px 0; font-size: 10.3pt; }
  .gap { background: #fdf3e7; border-left: 3px solid #d8a900; padding: 10px 16px; margin-top: 14px; font-size: 10.3pt; }
  .beat { margin: 8px 0 14px 0; }
  .beat-lbl { font-size: 8.6pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--accent-2); }
  .beat p { margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 9.6pt; margin-top: 8px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--rule); vertical-align: top; }
  th { font-size: 8.6pt; text-transform: uppercase; letter-spacing: 0.05em; color: var(--sub); }
  .note { font-size: 9.5pt; color: var(--sub); font-style: italic; }
  .panel-card { background: #fff; border: 1px solid var(--rule); border-radius: 6px; padding: 12px 16px; margin-bottom: 10px; }
  .panel-name { font-size: 11pt; font-weight: 700; }
  .panel-role { font-size: 9.3pt; color: var(--accent); font-weight: 600; margin: 1px 0 4px 0; }
  .panel-card p { font-size: 9.8pt; color: var(--sub); margin: 0; }`;
}

function renderTopFlags(modules: PrepModules): string {
  return modules.summary.topFlags
    .map((f) => `  <div class="${f.type}">${escapeHtml(f.text)}</div>`)
    .join("\n");
}

function renderCompanyModule(modules: PrepModules, meta: RenderMeta): string {
  const heading = modules.interviewerContext ? "Company &amp; Interviewer Context" : "Company Context";
  const interviewerCard = modules.interviewerContext
    ? `
    <div class="panel-card">
      <div class="panel-name">${escapeHtml(meta.interviewerName || "Interviewer")}</div>
      <p>${escapeHtml(modules.interviewerContext)}</p>
    </div>`
    : "";
  return `
  <div class="module">
    <div class="module-h">${heading}</div>
    <div class="panel-card">
      <div class="panel-name">${escapeHtml(meta.company)}</div>
      <p>${escapeHtml(modules.companyContext)}</p>
    </div>${interviewerCard}
  </div>`;
}

function renderStrategyBrief(modules: PrepModules): string {
  const { strategyBrief } = modules;
  const traits = strategyBrief.topTraits.map((t) => `<li>${escapeHtml(t)}</li>`).join("\n      ");
  return `
  <div class="module">
    <div class="module-h">Research &mdash; Strategy Brief</div>
    <h3>Strategic Vector</h3>
    <p>${escapeHtml(strategyBrief.strategicVector)}</p>
    <h3>The "Why Now"</h3>
    <p>${escapeHtml(strategyBrief.whyNow)}</p>
    <h3>Top Traits This Hiring Bar Values</h3>
    <ul>
      ${traits}
    </ul>
    <h3>The Exec-Level Question</h3>
    <div class="callout">${escapeHtml(strategyBrief.execLevelQuestion)}</div>
    <h3>The Bridge</h3>
    <p>${escapeHtml(strategyBrief.bridge)}</p>
  </div>`;
}

function renderElevatorIntro(modules: PrepModules): string {
  const { elevatorIntro } = modules;
  const thirdLabel = elevatorIntro.isHonestBridge ? "The Honest Bridge (present/future)" : "The Hook (15s, future)";
  return `
  <div class="module">
    <div class="module-h">Elevator &mdash; 60-Second Intro</div>
    <div class="beat">
      <div class="beat-lbl">Positioning (15s, present)</div>
      <p>${escapeHtml(elevatorIntro.positioning)}</p>
    </div>
    <div class="beat">
      <div class="beat-lbl">Growth Narrative (40s, past)</div>
      <p>${escapeHtml(elevatorIntro.growthNarrative)}</p>
    </div>
    <div class="beat">
      <div class="beat-lbl">${thirdLabel}</div>
      <p>${escapeHtml(elevatorIntro.hookOrBridge)}</p>
    </div>
  </div>`;
}

function renderCompetencyMap(modules: PrepModules): string {
  const rows = modules.competencyMap
    .map((row) => {
      const proofCell = row.isGap
        ? `<td class="gap" style="margin:0;"><b>Gap.</b> ${escapeHtml(row.proofPoint)}</td>`
        : `<td>${escapeHtml(row.proofPoint)}</td>`;
      return `      <tr><td>${escapeHtml(row.requirement)}</td><td>${escapeHtml(row.questionToExpect)}</td>${proofCell}</tr>`;
    })
    .join("\n");
  const gapWarning = modules.gapWarningNote
    ? `\n    <div class="gap"><b>Gap Warning:</b> ${escapeHtml(modules.gapWarningNote)}</div>`
    : "";
  return `
  <div class="module">
    <div class="module-h">Competency Map</div>
    <table>
      <tr><th>JD Requirement</th><th>Question to Expect</th><th>Resume Proof Point</th></tr>
${rows}
    </table>${gapWarning}
  </div>`;
}

function renderHandler(modules: PrepModules): string {
  const { handler } = modules;
  return `
  <div class="module">
    <div class="module-h">Handler &mdash; "${escapeHtml(handler.toughestObjection)}"</div>
    <div class="beat">
      <div class="beat-lbl">Direct Acknowledge</div>
      <p>${escapeHtml(handler.directAcknowledge)}</p>
    </div>
    <div class="beat">
      <div class="beat-lbl">The Pivot</div>
      <p>${escapeHtml(handler.pivot)}</p>
    </div>
    <div class="beat">
      <div class="beat-lbl">The Present/Future</div>
      <p>${escapeHtml(handler.presentFuture)}</p>
    </div>
  </div>`;
}

function renderQuickAnswer(modules: PrepModules): string {
  const { quickAnswer } = modules;
  return `
  <div class="module">
    <div class="module-h">Quick Answer &mdash; "${escapeHtml(quickAnswer.question)}"</div>
    <p><b>Point:</b> ${escapeHtml(quickAnswer.point1)}</p>
    <p><b>Reason:</b> ${escapeHtml(quickAnswer.reason)}</p>
    <p><b>Example:</b> ${escapeHtml(quickAnswer.example)}</p>
    <p><b>Point:</b> ${escapeHtml(quickAnswer.point2)}</p>
  </div>`;
}

function renderReverseQuestions(modules: PrepModules, meta: RenderMeta): string {
  const heading = meta.interviewerName ? `Reverse Questions for ${escapeHtml(meta.interviewerName)}` : "Reverse Questions";
  const rows = modules.reverseQuestions
    .map((q) => `      <tr><td>${escapeHtml(q.question)}</td><td>${escapeHtml(q.whatItSignals)}</td></tr>`)
    .join("\n");
  return `
  <div class="module">
    <div class="module-h">${heading}</div>
    <table>
      <tr><th>Question</th><th>What It Signals</th></tr>
${rows}
    </table>
  </div>`;
}

export function renderPrepHtml(modules: PrepModules, meta: RenderMeta): string {
  const { accent, accent2 } = pickAccentPair(meta.company);
  const docTitle = `${meta.company} - ${meta.roleTitle} Interview Prep`;

  const sections = [
    renderTopFlags(modules),
    renderCompanyModule(modules, meta),
    renderStrategyBrief(modules),
    renderElevatorIntro(modules),
    renderCompetencyMap(modules),
    renderHandler(modules),
    renderQuickAnswer(modules),
    renderReverseQuestions(modules, meta),
  ].join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(docTitle)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=Public+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>${renderCss(accent, accent2)}
</style>
</head>
<body>
<div class="bar"></div>
<div class="wrap">

  <div class="header">
    <h1>${escapeHtml(modules.summary.title)}</h1>
    <div class="sub">${escapeHtml(modules.summary.subtitle)}</div>
  </div>
${sections}

</div>
</body>
</html>
`;
}
