import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { appendLeadToSheet, LeadData } from '@/lib/googleSheets';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { firstName, lastName, email, mobileNumber, source } = body;

        if (!email || !firstName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const leadData: LeadData = {
            firstName,
            lastName,
            email,
            mobileNumber,
            source: source || 'offer_page',
            timestamp: new Date().toISOString()
        };

        // 1. Write to Firebase (SYSTEM OF RECORD)
        // We use adminDb to bypass client-side rules if needed, or secure logging.
        // Ensure 'leads' collection exists or is created
        console.log("📝 Writing lead to Firebase...");
        try {
            await adminDb.collection('leads').add({
                ...leadData,
                status: 'pending_signup',
                createdAt: new Date()
            });
            console.log("✅ Lead written to Firebase");
        } catch (fbError) {
            console.error("❌ Firebase Write Failed:", fbError);
            // If Firebase fails, this is CRITICAL. Ideally we fail the request, 
            // OR we try to log it elsewhere. For now, we continue to try Sheets.
        }

        // 2. Write to Google Sheets (OPERATIONAL VIEW)
        console.log("📝 Writing lead to Google Sheets...");
        const sheetResult = await appendLeadToSheet(leadData);

        if (!sheetResult.success) {
            console.warn("⚠️ Google Sheet append failed (non-critical):", sheetResult.error);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("❌ Lead API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
