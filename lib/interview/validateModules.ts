import { PrepModules } from "./types";

// Rule 5 (spec §4) is mechanically checkable, so we enforce it deterministically
// rather than trust the model to always obey the prompt instruction.
// Rule 6 (no exactly-three-item prose lists) stays prompt-only — it's a
// rhythm rule about generated sentences, not something to validate against
// already-structured JSON fields.
//
// Groq's gpt-oss-120b also consistently emits U+2011 (non-breaking hyphen)
// instead of a plain ASCII hyphen in compound words (observed in testing:
// "go‑to‑market", "product‑qualified‑lead"). Visually identical to a normal
// hyphen but behaves differently on copy/search, so normalize it too.
function normalizeText(value: string): string {
  return value
    .replace(/—/g, " → ")
    .replace(/‑/g, "-")
    .replace(/\s{2,}/g, " ");
}

function deepStripEmDashes<T>(value: T): T {
  if (typeof value === "string") {
    return normalizeText(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => deepStripEmDashes(v)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = deepStripEmDashes(v);
    }
    return out as unknown as T;
  }
  return value;
}

export function stripEmDashes(modules: PrepModules): PrepModules {
  return deepStripEmDashes(modules);
}
