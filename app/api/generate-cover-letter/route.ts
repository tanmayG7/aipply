import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { name, role, skills, jd, tone } = await req.json();

  if (!jd?.trim()) {
    return new Response(JSON.stringify({ error: "Job description is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const prompt = `You are an expert career coach and professional writer. Write a compelling, tailored cover letter for a job application.

Applicant details:
- Name: ${name || "the applicant"}
- Role/Field: ${role || "the relevant field"}
- Key Skills: ${skills || "as relevant to the job description"}

Job Description:
${jd}

Instructions:
- Tone: ${tone || "Professional"}
- Length: 3-4 short paragraphs (no more than 300 words)
- Structure: Opening hook → Why I'm a fit → Specific value I bring → Call to action
- Reference specific keywords and requirements from the JD naturally
- Do NOT include subject lines, "Dear Hiring Manager" headers, or meta-commentary
- Start directly with the first paragraph of the letter
- End with a confident closing line and "Sincerely, ${name || "[Your Name]"}"
- Make it feel human and specific, not generic`;

  const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      stream: true,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  return new Response(anthropicRes.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}
