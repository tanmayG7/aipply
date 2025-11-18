// lib/email/emailService.ts
import { Resend } from 'resend';

// Lazy initialization to avoid build errors when API key is not set
let resendInstance: Resend | null = null;

function getResendClient(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

interface CVOrderConfirmationEmailData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  amount: number;
  deliveryDays: number;
}

export async function sendCVOrderConfirmationEmail(data: CVOrderConfirmationEmailData) {
  try {
    console.log(`📧 Sending confirmation email to ${data.customerEmail}...`);

    const { customerName, customerEmail, orderId, amount, deliveryDays } = data;

    const resend = getResendClient();
    const emailResponse = await resend.emails.send({
      from: 'AiPply <noreply@updates.aipply.io>',
      to: customerEmail,
      subject: '✅ Your CV Order Confirmation - AiPply',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #52A9FF 0%, #5D29FF 100%);
              padding: 30px 20px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 30px 20px;
            }
            .success-icon {
              text-align: center;
              font-size: 60px;
              color: #10B981;
              margin-bottom: 20px;
            }
            .order-details {
              background: #f9f9f9;
              border-left: 4px solid #5D29FF;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .order-details h3 {
              margin-top: 0;
              color: #5D29FF;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #e0e0e0;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .detail-label {
              font-weight: 600;
              color: #666;
            }
            .detail-value {
              color: #333;
            }
            .next-steps {
              background: #fffbeb;
              border-left: 4px solid #f59e0b;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .next-steps h3 {
              margin-top: 0;
              color: #f59e0b;
            }
            .next-steps ol {
              margin: 10px 0;
              padding-left: 20px;
            }
            .next-steps li {
              margin: 8px 0;
              color: #666;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #52A9FF 0%, #5D29FF 100%);
              color: white;
              padding: 14px 30px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
            }
            .footer {
              background: #f9f9f9;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .footer a {
              color: #5D29FF;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Order Confirmed!</h1>
            </div>

            <div class="content">
              <div class="success-icon">✓</div>

              <p>Hi <strong>${customerName}</strong>,</p>

              <p>Thank you for choosing AiPply's professional CV writing service! Your payment has been successfully processed.</p>

              <div class="order-details">
                <h3>Order Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Order ID:</span>
                  <span class="detail-value">${orderId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Service:</span>
                  <span class="detail-value">Professional CV Writing</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Amount Paid:</span>
                  <span class="detail-value">₹${amount}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Delivery Time:</span>
                  <span class="detail-value">${deliveryDays} hours</span>
                </div>
              </div>

              <div class="next-steps">
                <h3>📋 What Happens Next?</h3>
                <ol>
                  <li><strong>Information Collection:</strong> Our team will send you a detailed form to collect your work experience, skills, education, and career goals.</li>
                  <li><strong>Expert Crafting:</strong> Our professional CV writers will create your ATS-optimized CV tailored to your industry.</li>
                  <li><strong>Delivery:</strong> You'll receive your professionally crafted CV within ${deliveryDays} hours.</li>
                  <li><strong>Unlimited Revisions:</strong> We'll work with you until you're 100% satisfied!</li>
                </ol>
              </div>

              <center>
                <a href="https://aipply.io/dashboard/home" class="button">Go to Dashboard</a>
              </center>

              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                <strong>Need help?</strong> Reply to this email or contact us at <a href="mailto:support@aipply.io" style="color: #5D29FF;">support@aipply.io</a>
              </p>
            </div>

            <div class="footer">
              <p>This is an automated confirmation email from AiPply.</p>
              <p>
                <a href="https://aipply.io">Visit Website</a> |
                <a href="https://aipply.io/contact-us">Contact Support</a>
              </p>
              <p style="margin-top: 15px; font-size: 12px; color: #999;">
                © 2025 AiPply. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`✅ Confirmation email sent successfully:`, emailResponse);
    return { success: true, messageId: emailResponse.data?.id };

  } catch (error) {
    console.error('❌ Failed to send confirmation email:', error);
    // Don't throw - we don't want email failures to break the payment flow
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendCVOrderAdminNotification(data: CVOrderConfirmationEmailData) {
  try {
    console.log(`📧 Sending admin notification for order ${data.orderId}...`);

    const { customerName, customerEmail, orderId, amount } = data;

    const resend = getResendClient();
    const emailResponse = await resend.emails.send({
      from: 'AiPply Orders <orders@updates.aipply.io>',
      to: 'tanmay@aipply.io', // Admin receives order notifications
      subject: `🎯 New CV Order: ${orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 20px auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
            .header { background: #5D29FF; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .details { background: white; padding: 20px; border-radius: 8px; }
            .row { padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
            .label { font-weight: bold; display: inline-block; width: 150px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🎯 New CV Order Received</h2>
            </div>
            <div class="details">
              <div class="row"><span class="label">Order ID:</span> ${orderId}</div>
              <div class="row"><span class="label">Customer:</span> ${customerName}</div>
              <div class="row"><span class="label">Email:</span> ${customerEmail}</div>
              <div class="row"><span class="label">Amount:</span> ₹${amount}</div>
              <div class="row"><span class="label">Status:</span> Payment Confirmed</div>
            </div>
            <p style="margin-top: 20px; color: #666;">
              Please send the information collection form to the customer and begin processing this order.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`✅ Admin notification sent successfully:`, emailResponse);
    return { success: true, messageId: emailResponse.data?.id };

  } catch (error) {
    console.error('❌ Failed to send admin notification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

interface CVOrderFailureEmailData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  amount: number;
  failureReason?: string;
}

export async function sendCVOrderFailureEmail(data: CVOrderFailureEmailData) {
  try {
    console.log(`📧 Sending payment failure email to ${data.customerEmail}...`);

    const { customerName, customerEmail, orderId, amount, failureReason } = data;

    const resend = getResendClient();
    const emailResponse = await resend.emails.send({
      from: 'AiPply <noreply@updates.aipply.io>',
      to: customerEmail,
      subject: '⚠️ Payment Failed - AiPply CV Service',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
              padding: 30px 20px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 30px 20px;
            }
            .warning-icon {
              text-align: center;
              font-size: 60px;
              color: #EF4444;
              margin-bottom: 20px;
            }
            .order-details {
              background: #fef2f2;
              border-left: 4px solid #EF4444;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .order-details h3 {
              margin-top: 0;
              color: #DC2626;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #fecaca;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .detail-label {
              font-weight: 600;
              color: #991b1b;
            }
            .detail-value {
              color: #333;
            }
            .next-steps {
              background: #fffbeb;
              border-left: 4px solid #f59e0b;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .next-steps h3 {
              margin-top: 0;
              color: #f59e0b;
            }
            .next-steps ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .next-steps li {
              margin: 8px 0;
              color: #666;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #52A9FF 0%, #5D29FF 100%);
              color: white;
              padding: 14px 30px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
            }
            .footer {
              background: #f9f9f9;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .footer a {
              color: #5D29FF;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Payment Failed</h1>
            </div>

            <div class="content">
              <div class="warning-icon">✕</div>

              <p>Hi <strong>${customerName}</strong>,</p>

              <p>We're sorry, but your payment for the AiPply CV writing service could not be processed.</p>

              <div class="order-details">
                <h3>Order Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Order ID:</span>
                  <span class="detail-value">${orderId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Service:</span>
                  <span class="detail-value">Professional CV Writing</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Amount:</span>
                  <span class="detail-value">₹${amount}</span>
                </div>
                ${failureReason ? `
                <div class="detail-row">
                  <span class="detail-label">Reason:</span>
                  <span class="detail-value">${failureReason}</span>
                </div>
                ` : ''}
              </div>

              <div class="next-steps">
                <h3>🔄 What You Can Do</h3>
                <ul>
                  <li><strong>Retry Payment:</strong> Visit your dashboard to try the payment again</li>
                  <li><strong>Check Card Details:</strong> Ensure your card has sufficient balance and is enabled for online transactions</li>
                  <li><strong>Try Another Payment Method:</strong> Use a different card or payment method</li>
                  <li><strong>Contact Your Bank:</strong> If the issue persists, your bank may be blocking the transaction</li>
                </ul>
              </div>

              <center>
                <a href="https://aipply.io/dashboard/cv-services" class="button">Try Again</a>
              </center>

              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                <strong>Need help?</strong> Contact us at <a href="mailto:support@aipply.io" style="color: #5D29FF;">support@aipply.io</a> and we'll assist you with your payment.
              </p>
            </div>

            <div class="footer">
              <p>This is an automated notification from AiPply.</p>
              <p>
                <a href="https://aipply.io">Visit Website</a> |
                <a href="https://aipply.io/contact-us">Contact Support</a>
              </p>
              <p style="margin-top: 15px; font-size: 12px; color: #999;">
                © 2025 AiPply. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`✅ Payment failure email sent successfully:`, emailResponse);
    return { success: true, messageId: emailResponse.data?.id };

  } catch (error) {
    console.error('❌ Failed to send payment failure email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
