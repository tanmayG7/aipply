import { NextRequest } from "next/server";
import { streamText, LlmMessage } from "@/lib/interview/llm";
import { interviewerSystemPrompt } from "@/lib/interview/mockPrompt";
import { getUidFromRequest } from "@/lib/interview/auth";

export const runtime = "edge";

interface MockRequestBody {
  messages: LlmMessage[];
  company?: string;
  jobTitle?: string;
  jobDescription?: string;
  profile?: string;
}

export async function POST(request: NextRequest) {
  if (!getUidFromRequest(request)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, company, jobTitle, jobDescription, profile }: MockRequestBody = await request.json();
  if (!messages?.length) {
    return new Response(JSON.stringify({ error: "messages is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const system = interviewerSystemPrompt({ company, jobTitle, jobDescription, profile: profile || "" });
  const groqRes = await streamText({ system, messages: messages.slice(-40), maxTokens: 500 });

  return new Response(groqRes.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}
