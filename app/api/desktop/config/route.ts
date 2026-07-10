import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Public Firebase Web config for the AiPply desktop app. These values are
// NOT secret — they're the same NEXT_PUBLIC_* values already shipped in this
// app's own client-side bundle. The desktop app fetches this at launch so
// the key can be rotated here without shipping a new desktop release.
export async function GET() {
  return NextResponse.json({
    firebaseWebApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}
