import { NextRequest, NextResponse } from "next/server";
import { completeJSON } from "@/lib/interview/llm";
import { buildGenerationPrompt } from "@/lib/interview/prepPrompt";
import { stripEmDashes } from "@/lib/interview/validateModules";
import { renderPrepHtml } from "@/lib/interview/renderPrepHtml";
import { getUidFromRequest } from "@/lib/interview/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import { PrepModules, PrepPackDoc, ResearchBundle } from "@/lib/interview/types";

interface GenerateBody {
  company: string;
  roleTitle: string;
  resumeText: string;
  interviewerInput?: string | null;
  profile?: string;
  researchBundle: ResearchBundle;
}

// Correction/re-run mode (spec §9.5): the client only sends packId +
// correctionText, the server reloads resumeText/researchBundle from the
// original doc so nothing expensive is re-sent or re-scraped.
interface CorrectBody {
  packId: string;
  correctionText: string;
}

type PostBody = Partial<GenerateBody & CorrectBody>;

async function generateAndSave(params: {
  uid: string;
  company: string;
  roleTitle: string;
  resumeText: string;
  interviewerInput?: string | null;
  profile?: string;
  researchBundle: ResearchBundle;
  correctionText?: string | null;
  parentPackId?: string | null;
}): Promise<{ id: string | null; modules: PrepModules; html: string }> {
  const prompt = buildGenerationPrompt({
    resumeText: params.resumeText,
    profileSummaryText: params.profile,
    company: params.company,
    roleTitle: params.roleTitle,
    interviewerInput: params.interviewerInput,
    researchBundle: params.researchBundle,
    correctionText: params.correctionText,
  });

  const rawModules = await completeJSON<PrepModules>({
    system: prompt.system,
    messages: prompt.messages,
    maxTokens: 6500,
  });

  const modules = stripEmDashes(rawModules);
  const html = renderPrepHtml(modules, {
    company: params.company,
    roleTitle: params.roleTitle,
    interviewerName: params.researchBundle.interviewer.found ? params.researchBundle.interviewer.name : undefined,
  });

  let id: string | null = null;
  try {
    const doc: Omit<PrepPackDoc, "id"> = {
      userId: params.uid,
      company: params.company,
      jobTitle: params.roleTitle,
      resumeText: params.resumeText,
      interviewerInput: params.interviewerInput || null,
      researchBundle: params.researchBundle,
      modules,
      html,
      parentPackId: params.parentPackId || null,
      correctionText: params.correctionText || null,
      createdAt: new Date().toISOString(),
    };
    const ref = await adminDb.collection("interviewPrepPacks").add(doc);
    id = ref.id;
  } catch (saveErr) {
    // Don't lose an already-generated pack just because saving its history failed.
    console.error("Failed to save prep pack:", saveErr);
  }

  return { id, modules, html };
}

export async function POST(request: NextRequest) {
  const uid = getUidFromRequest(request);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: PostBody = await request.json();

  try {
    if (body.packId) {
      if (!body.correctionText?.trim()) {
        return NextResponse.json({ error: "correctionText is required" }, { status: 400 });
      }

      const snap = await adminDb.collection("interviewPrepPacks").doc(body.packId).get();
      if (!snap.exists) {
        return NextResponse.json({ error: "Original prep pack not found" }, { status: 404 });
      }
      const original = snap.data() as PrepPackDoc;
      // The Admin SDK bypasses Firestore rules entirely, so this check is
      // the actual enforcement stopping one user from correcting (or
      // reading back, via the returned modules/html) another user's pack.
      if (original.userId !== uid) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const result = await generateAndSave({
        uid,
        company: original.company,
        roleTitle: original.jobTitle,
        resumeText: original.resumeText,
        interviewerInput: original.interviewerInput,
        researchBundle: original.researchBundle,
        correctionText: body.correctionText,
        parentPackId: body.packId,
      });
      return NextResponse.json(result);
    }

    const { company, roleTitle, resumeText, interviewerInput, profile, researchBundle } = body as GenerateBody;

    if (!company?.trim()) return NextResponse.json({ error: "Company is required" }, { status: 400 });
    if (!roleTitle?.trim()) return NextResponse.json({ error: "Role is required" }, { status: 400 });
    if (!resumeText?.trim()) {
      // Spec §3: the resume is the only source of truth for the candidate's
      // real facts, the feature cannot proceed without it.
      return NextResponse.json({ error: "Resume text is required" }, { status: 400 });
    }
    if (!researchBundle) {
      return NextResponse.json({ error: "researchBundle is required — run /api/interview/research first" }, { status: 400 });
    }

    const result = await generateAndSave({ uid, company, roleTitle, resumeText, interviewerInput, profile, researchBundle });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Failed to build prep pack" }, { status: 500 });
  }
}
