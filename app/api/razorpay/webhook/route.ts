// app/api/razorpay/webhook/route.ts (STEP 1 DEBUG VERSION)
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  console.log('🔔 =================================');
  console.log('🔔 WEBHOOK DEBUG - NEW REQUEST');
  console.log('🔔 =================================');
  
  try {
    // Log all headers
    console.log('📋 All Headers:');
    for (const [key, value] of request.headers.entries()) {
      console.log(`   ${key}: ${value}`);
    }
    
    // Get the raw body
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    
    console.log('📝 Raw body:', body);
    console.log('📝 Body length:', body.length);
    console.log('🔐 Signature header value:', signature || 'NULL');
    console.log('🔐 Signature length:', signature?.length || 0);
    console.log('🔑 Webhook secret configured:', !!process.env.RAZORPAY_WEBHOOK_SECRET);
    console.log('🔑 Secret length:', process.env.RAZORPAY_WEBHOOK_SECRET?.length || 0);
    
    // Return success for now without verification
    return NextResponse.json({ 
      status: 'debug_success',
      receivedSignature: signature || 'missing',
      bodyLength: body.length,
      hasSecret: !!process.env.RAZORPAY_WEBHOOK_SECRET
    });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
