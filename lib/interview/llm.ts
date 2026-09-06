// Interview-prep runs on Groq's free tier (open-source models), not Anthropic —
// a deliberate cost choice for this feature, distinct from the rest of the
// site (e.g. generate-cover-letter, which still calls Anthropic directly).
// No fallback chain: if Groq fails, this feature fails, by design.
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1";
// Matches the desktop app's own Groq default (main/model-gateway.js) — verify
// against Groq's current model catalog once a real key is in hand.
const GROQ_MODEL = "openai/gpt-oss-120b";

export interface LlmMessage {
  role: "user" | "assistant";
  content: string;
}

interface CompleteRequest {
  system: string;
  messages: LlmMessage[];
  maxTokens?: number;
}

function buildBody({ system, messages, maxTokens }: CompleteRequest, stream: boolean, json: boolean) {
  const body: Record<string, unknown> = {
    model: GROQ_MODEL,
    messages: [{ role: "system", content: system }, ...messages],
    max_tokens: maxTokens || 1500,
    stream,
  };
  if (json) body.response_format = { type: "json_object" };
  return body;
}

function groqHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
  };
}

/** Non-streaming Groq call, returns the assistant's text. */
export async function completeText(req: CompleteRequest): Promise<string> {
  const res = await fetch(`${GROQ_ENDPOINT}/chat/completions`, {
    method: "POST",
    headers: groqHeaders(),
    body: JSON.stringify(buildBody(req, false, false)),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const json = await res.json();
  return json.choices?.[0]?.message?.content || "";
}

/**
 * Streaming Groq call — returns the raw fetch Response so the caller can
 * pass its body straight through as an SSE response. Chunks arrive in the
 * standard OpenAI-compatible shape: choices[0].delta.content.
 */
export function streamText(req: CompleteRequest): Promise<Response> {
  return fetch(`${GROQ_ENDPOINT}/chat/completions`, {
    method: "POST",
    headers: groqHeaders(),
    body: JSON.stringify(buildBody(req, true, false)),
  });
}

/** Calls the model asking for strict JSON and parses it, with one repair pass. */
export async function completeJSON<T = unknown>(req: CompleteRequest): Promise<T> {
  const res = await fetch(`${GROQ_ENDPOINT}/chat/completions`, {
    method: "POST",
    headers: groqHeaders(),
    body: JSON.stringify(buildBody(req, false, true)),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const data = await res.json();
  const text: string = data.choices?.[0]?.message?.content || "";

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
