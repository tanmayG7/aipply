/**
 * Razorpay Admin Utilities
 * Helper functions for admin subscription management via Razorpay API
 */

// Razorpay API Type Definitions
export interface RazorpayError {
  description?: string;
  message?: string;
}

export interface RazorpayErrorResponse {
  error?: RazorpayError;
  message?: string;
}

export interface RazorpaySubscription {
  id: string;
  status: 'created' | 'authenticated' | 'active' | 'pending' | 'halted' | 'cancelled' | 'completed' | 'expired';
  plan_id: string;
  customer_id: string;
  quantity: number;
  total_count: number;
  paid_count: number;
  remaining_count: number;
  current_start: number;
  current_end: number;
  ended_at: number | null;
  charge_at: number;
  start_at: number;
  end_at: number;
  auth_attempts: number;
  notes: Record<string, string>;
  cancel_at_cycle_end?: boolean;
  cancelled_at?: number | null;
}

export interface RazorpayCustomer {
  id: string;
  entity: string;
  name: string;
  email: string;
  contact: string;
  gstin: string | null;
  notes: Record<string, string>;
  created_at: number;
}

export interface RazorpayPlan {
  id: string;
  entity: string;
  interval: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  item: {
    id: string;
    active: boolean;
    name: string;
    description: string;
    amount: number;
    currency: string;
  };
  notes: Record<string, string>;
  created_at: number;
}

export interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  invoice_id: string | null;
  method: string;
  captured: boolean;
  fee: number;
  tax: number;
  created_at: number;
}

export interface RazorpayPaymentsResponse {
  entity: string;
  count: number;
  items: RazorpayPayment[];
}

export interface RazorpayRefund {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  payment_id: string;
  notes: Record<string, string>;
  receipt: string | null;
  status: string;
  created_at: number;
}

export interface RazorpayInvoice {
  id: string;
  entity: string;
  customer_id: string;
  subscription_id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  paid_at: number | null;
  issued_at: number;
  created_at: number;
}

// Helper function to extract error message from unknown error
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'Unknown error occurred';
}

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

function getAuthHeader(): string {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.error('❌ [Razorpay] Missing credentials!');
    console.error('❌ [Razorpay] KEY_ID exists:', !!RAZORPAY_KEY_ID);
    console.error('❌ [Razorpay] KEY_SECRET exists:', !!RAZORPAY_KEY_SECRET);
    throw new Error('Razorpay credentials not configured');
  }

  console.log('🔑 [Razorpay] Using KEY_ID:', RAZORPAY_KEY_ID?.substring(0, 10) + '...');
  return Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
}

/**
 * Cancel a Razorpay subscription
 */
export async function cancelRazorpaySubscription(
  subscriptionId: string,
  cancelAtCycleEnd: boolean = false
): Promise<{ success: boolean; data?: RazorpaySubscription; error?: string }> {
  try {
    console.log('🔍 [Razorpay Cancel] Starting cancellation process');
    console.log('📋 [Razorpay Cancel] Subscription ID:', subscriptionId);
    console.log('⏰ [Razorpay Cancel] Cancel at cycle end:', cancelAtCycleEnd);

    const auth = getAuthHeader();
    const url = `https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`;

    console.log('🌐 [Razorpay Cancel] API URL:', url);

    const requestBody = {
      cancel_at_cycle_end: cancelAtCycleEnd ? 1 : 0
    };
    console.log('📤 [Razorpay Cancel] Request body:', JSON.stringify(requestBody));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 [Razorpay Cancel] Response status:', response.status, response.statusText);

    const data = await response.json();
    console.log('📥 [Razorpay Cancel] Response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      // Log the full error structure
      console.error('❌ [Razorpay Cancel] API returned error');
      console.error('❌ [Razorpay Cancel] Status:', response.status);
      console.error('❌ [Razorpay Cancel] Error object:', data.error);
      console.error('❌ [Razorpay Cancel] Full response:', data);

      // Extract detailed error message
      const errorMessage =
        data.error?.description ||
        data.error?.message ||
        data.message ||
        `Razorpay API error (${response.status})`;

      return {
        success: false,
        error: errorMessage,
        data: data // Include full response for debugging
      };
    }

    console.log('✅ [Razorpay Cancel] Cancellation successful');
    return {
      success: true,
      data
    };
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error('💥 [Razorpay Cancel] Exception occurred:', error);
    console.error('💥 [Razorpay Cancel] Error message:', errorMessage);
    if (error instanceof Error) {
      console.error('💥 [Razorpay Cancel] Error stack:', error.stack);
    }

    return {
      success: false,
      error: `Network error: ${errorMessage}`
    };
  }
}

/**
 * Pause a Razorpay subscription
 */
export async function pauseRazorpaySubscription(
  subscriptionId: string,
  pauseAt: 'now' | number = 'now'
): Promise<{ success: boolean; data?: RazorpaySubscription; error?: string }> {
  try {
    const auth = getAuthHeader();
    const url = `https://api.razorpay.com/v1/subscriptions/${subscriptionId}/pause`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pause_at: pauseAt
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.description || 'Failed to pause subscription'
      };
    }

    return {
      success: true,
      data
    };
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error('Error pausing Razorpay subscription:', error);
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Resume a paused Razorpay subscription
 */
export async function resumeRazorpaySubscription(
  subscriptionId: string,
  resumeAt: 'now' | number = 'now'
): Promise<{ success: boolean; data?: RazorpaySubscription; error?: string }> {
  try {
    const auth = getAuthHeader();
    const url = `https://api.razorpay.com/v1/subscriptions/${subscriptionId}/resume`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resume_at: resumeAt
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.description || 'Failed to resume subscription'
      };
    }

    return {
      success: true,
      data
    };
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error('Error resuming Razorpay subscription:', error);
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Get Razorpay subscription details
 */
export async function getRazorpaySubscription(
  subscriptionId: string
): Promise<{ success: boolean; data?: RazorpaySubscription; error?: string }> {
  try {
    const auth = getAuthHeader();
    const url = `https://api.razorpay.com/v1/subscriptions/${subscriptionId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.description || 'Failed to fetch subscription'
      };
    }

    return {
      success: true,
      data
    };
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error('Error fetching Razorpay subscription:', error);
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Check if subscription can be cancelled
 */
export async function checkSubscriptionCancellable(
  subscriptionId: string
): Promise<{ cancellable: boolean; reason?: string; status?: string }> {
  try {
    console.log('🔍 [Razorpay] Checking if subscription is cancellable...');
    const result = await getRazorpaySubscription(subscriptionId);

    if (!result.success || !result.data) {
      console.error('❌ [Razorpay] Cannot fetch subscription:', result.error);
      return {
        cancellable: false,
        reason: `Cannot fetch subscription: ${result.error || 'No data returned'}`
      };
    }

    const status = result.data.status;
    console.log('📊 [Razorpay] Subscription status:', status);

    // Razorpay subscription statuses:
    // - created, authenticated, active, pending, halted, cancelled, completed, expired
    const cancellableStatuses = ['active', 'authenticated'];

    if (!cancellableStatuses.includes(status)) {
      console.warn(`⚠️ [Razorpay] Subscription is in '${status}' state and cannot be cancelled`);
      return {
        cancellable: false,
        reason: `Subscription is in '${status}' state and cannot be cancelled`,
        status
      };
    }

    console.log('✅ [Razorpay] Subscription is cancellable');
    return {
      cancellable: true,
      status
    };
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error('💥 [Razorpay] Error checking subscription:', error);
    return {
      cancellable: false,
      reason: `Error checking subscription: ${errorMessage}`
    };
  }
}

/**
 * Create a refund for a payment
 */
export async function createRefund(
  paymentId: string,
  amount?: number,
  notes?: Record<string, string>
): Promise<{ success: boolean; data?: RazorpayRefund; error?: string }> {
  try {
    const auth = getAuthHeader();
    const url = 'https://api.razorpay.com/v1/refunds';

    const body: {
      payment_id: string;
      amount?: number;
      notes?: Record<string, string>;
    } = {
      payment_id: paymentId
    };

    if (amount) {
      body.amount = amount; // Amount in paise
    }

    if (notes) {
      body.notes = notes;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.description || 'Failed to create refund'
      };
    }

    return {
      success: true,
      data
    };
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error('Error creating refund:', error);
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Get all payments for a subscription
 */
export async function getSubscriptionPayments(
  subscriptionId: string
): Promise<{ success: boolean; data?: RazorpayPaymentsResponse; error?: string }> {
  try {
    const auth = getAuthHeader();
    const url = `https://api.razorpay.com/v1/payments?subscription_id=${subscriptionId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.description || 'Failed to fetch payments'
      };
    }

    return {
      success: true,
      data
    };
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error('Error fetching subscription payments:', error);
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Update subscription schedule (for extending subscription)
 */
export async function updateSubscriptionSchedule(
  subscriptionId: string,
  scheduleChange: {
    plan_id?: string;
    quantity?: number;
    schedule_change_at: 'now' | number;
  }
): Promise<{ success: boolean; data?: RazorpaySubscription; error?: string }> {
  try {
    const auth = getAuthHeader();
    const url = `https://api.razorpay.com/v1/subscriptions/${subscriptionId}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(scheduleChange)
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.description || 'Failed to update subscription'
      };
    }

    return {
      success: true,
      data
    };
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error('Error updating subscription schedule:', error);
    return {
      success: false,
      error: errorMessage
    };
  }
}
