import { NextRequest } from "next/server";

/**
 * Matches the Bearer-token decode convention used across the site's other
 * API routes (e.g. app/api/subscription/cancel/route.ts) — decodes the JWT
 * payload without verifying its signature against Firebase Admin.
 */
export function getUidFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.substring(7);
  try {
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    return decodedToken.user_id || decodedToken.uid || null;
  } catch {
    return null;
  }
}
