import { NextRequest, NextResponse } from "next/server";
import { companyIntel } from "@/lib/interview/companyIntel";
import { getUidFromRequest } from "@/lib/interview/auth";

export async function POST(request: NextRequest) {
  if (!getUidFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { company } = await request.json();
  if (!company?.trim()) {
    return NextResponse.json({ error: "Company is required" }, { status: 400 });
  }

  try {
    const intel = await companyIntel(company);
    return NextResponse.json({ intel });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Failed to research company" }, { status: 500 });
  }
}
