// Client-only resume text extraction — runs entirely in the browser, no
// backend round-trip. The extracted text pre-fills the resume textarea for
// the user to review/edit before submitting; it is never auto-submitted.
"use client";

export async function extractResumeText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    return extractPdfText(file);
  }
  if (
    name.endsWith(".docx") ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return extractDocxText(file);
  }
  if (name.endsWith(".txt") || file.type === "text/plain") {
    return file.text();
  }
  throw new Error("Unsupported file type. Upload a PDF, DOCX, or plain text resume.");
}

export async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pageTexts: string[] = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    pageTexts.push(joinTextItems(content.items));
  }
  return pageTexts.join("\n\n").trim();
}

// pdf.js returns each positioned text run separately, with no guarantee a
// run boundary lines up with a word or space boundary. Blindly joining runs
// with " " produces both false spaces (splitting a word like "pipeline"
// into "p ipeline") and doubled spaces (when a run already ends in a space
// and we add another) — observed in testing against a real resume PDF. Use
// each run's actual glyph position to decide whether a space or newline
// belongs between it and the previous run, since the resume text becomes
// the model's only source of truth for the candidate's facts.
function joinTextItems(items: Array<Record<string, unknown>>): string {
  let out = "";
  let prevRight: number | null = null;
  let prevY: number | null = null;

  for (const raw of items) {
    if (typeof raw.str !== "string" || !Array.isArray(raw.transform)) continue;
    const item = raw as { str: string; transform: number[]; width?: number };
    const x = item.transform[4];
    const y = item.transform[5];
    const fontSize = Math.abs(item.transform[3]) || 10;

    if (prevY !== null && Math.abs(y - prevY) > fontSize * 0.4) {
      out += "\n";
    } else if (prevRight !== null && x - prevRight > fontSize * 0.15) {
      out += " ";
    }

    out += item.str;
    prevRight = x + (item.width || 0);
    prevY = y;
  }

  return out.replace(/[ \t]{2,}/g, " ");
}

export async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}
