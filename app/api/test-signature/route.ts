// app/api/test-signature/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { payload } = await request.json();
    
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(payload, 'utf8')
      .digest('hex');
    
    return NextResponse.json({ 
      signature,
      payloadLength: payload.length,
      secretConfigured: !!process.env.RAZORPAY_WEBHOOK_SECRET
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to generate signature',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
