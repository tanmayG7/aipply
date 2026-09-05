export interface LlmMessage {
  role: "user" | "assistant";
  content: string;
}

interface CompleteRequest {
  system: string;
  messages: LlmMessage[];
  maxTokens?: number;
}

/** Non-streaming Anthropic call, returns the assistant's text. */
export async function completeText({ system, messages, maxTokens }: CompleteRequest): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens || 1500,
      system,
      messages,
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}`);
  const json = await res.json();
  return (json.content || []).map((c: { text?: string }) => c.text || "").join("");
}

/**
 * Streaming Anthropic call — returns the raw fetch Response so the caller
 * can pass its body straight through as an SSE response, same as
 * app/api/generate-cover-letter/route.ts.
 */
export function streamAnthropic({ system, messages, maxTokens }: CompleteRequest): Promise<Response> {
  return fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens || 500,
      system,
      messages,
      stream: true,
    }),
  });
}

/** Calls the model asking for strict JSON and parses it, with one repair pass. */
export async function completeJSON<T = unknown>(req: CompleteRequest): Promise<T> {
  const text = await completeText(req);
  const cleaned = text
    .trim()
    .replace(/^```(json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        /* fall through */
      }
    }
    throw new Error("Model did not return valid JSON");
  }
}
