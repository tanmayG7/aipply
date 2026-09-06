import { NextRequest, NextResponse } from "next/server";
import { companyIntel } from "@/lib/interview/companyIntel";
import { completeJSON } from "@/lib/interview/llm";
import { getUidFromRequest } from "@/lib/interview/auth";
import { adminDb } from "@/lib/firebaseAdmin";

interface PrepPack {
  likelyQuestions: { q: string; whyAsked: string; strongAnswer: string }[];
  talkingPoints: string[];
  questionsToAsk: string[];
  redFlagsToProbe: string[];
  salaryContext: string;
  story: string;
}

export async function POST(request: NextRequest) {
  const uid = getUidFromRequest(request);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { company, jobTitle, jobDescription, profile } = await request.json();
  if (!company?.trim()) {
    return NextResponse.json({ error: "Company is required" }, { status: 400 });
  }

  try {
    const intel = await companyIntel(company).catch(() => null);

    const pack = await completeJSON<PrepPack>({
      system: "You are an elite interview coach. Ground everything in the candidate's real background — never invent their experience. Output ONLY JSON.",
      messages: [
        {
          role: "user",
          content: `Prepare me for: ${jobTitle} at ${company}\n${jobDescription ? `JD: ${jobDescription.slice(0, 3000)}` : ""}\n\nMy background:\n${profile || ""}\n\nCompany intel: ${JSON.stringify(intel || {}).slice(0, 4000)}\n\nReturn {"likelyQuestions":[{"q","whyAsked","strongAnswer"}] (8),"talkingPoints":[...],"questionsToAsk":[...],"redFlagsToProbe":[...],"salaryContext","story":"a 60-second 'tell me about yourself' in my voice"}`,
        },
      ],
      maxTokens: 3000,
    });

    try {
      await adminDb.collection("interviewPrepPacks").add({
        userId: uid,
        company,
        jobTitle: jobTitle || null,
        jobDescription: jobDescription || null,
        intel,
        pack,
        createdAt: new Date().toISOString(),
      });
    } catch (saveErr) {
      // Don't lose an already-generated pack just because saving its history failed.
      console.error("Failed to save prep pack:", saveErr);
    }

    return NextResponse.json({ pack, intel });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Failed to build prep pack" }, { status: 500 });
  }
}
