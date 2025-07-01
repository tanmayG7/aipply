import { NextRequest, NextResponse } from 'next/server';
import { saveContactFormSubmission } from '@/lib/firebaseConfig/firebaseConfig';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the required fields
    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save to Firestore
    const result = await saveContactFormSubmission(body);
    
    return NextResponse.json(
      { success: true, message: 'Form submitted successfully', id: result.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in contact API:', error);
console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    );
  }
}
