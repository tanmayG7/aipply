import { NextRequest, NextResponse } from "next/server";
import { runResearch } from "@/lib/interview/research";
import { getUidFromRequest } from "@/lib/interview/auth";

export async function POST(request: NextRequest) {
  if (!getUidFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { company, roleTitle, jobDescriptionText, interviewerInput } = await request.json();
  if (!company?.trim()) return NextResponse.json({ error: "Company is required" }, { status: 400 });
  if (!roleTitle?.trim()) return NextResponse.json({ error: "Role is required" }, { status: 400 });

  try {
    const bundle = await runResearch({ company, roleTitle, jobDescriptionText, interviewerInput });
    return NextResponse.json(bundle);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Failed to research" }, { status: 500 });
  }
}
