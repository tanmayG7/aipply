import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasWebhookSecret: !!process.env.RAZORPAY_WEBHOOK_SECRET,
    secretLength: process.env.RAZORPAY_WEBHOOK_SECRET?.length || 0,
    // Don't log the actual secret for security
    secretPreview: process.env.RAZORPAY_WEBHOOK_SECRET?.substring(0, 5) + '...' || 'undefined'
  });
}
