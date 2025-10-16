/**
 * Razorpay Admin Utilities
 * Helper functions for admin subscription management via Razorpay API
 */

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
): Promise<{ success: boolean; data?: any; error?: string }> {
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
  } catch (error: any) {
    console.error('💥 [Razorpay Cancel] Exception occurred:', error);
    console.error('💥 [Razorpay Cancel] Error message:', error.message);
    console.error('💥 [Razorpay Cancel] Error stack:', error.stack);

    return {
      success: false,
      error: `Network error: ${error.message}`
    };
  }
}

/**
 * Pause a Razorpay subscription
 */
export async function pauseRazorpaySubscription(
  subscriptionId: string,
  pauseAt: 'now' | number = 'now'
): Promise<{ success: boolean; data?: any; error?: string }> {
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
  } catch (error: any) {
    console.error('Error pausing Razorpay subscription:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}

/**
 * Resume a paused Razorpay subscription
 */
export async function resumeRazorpaySubscription(
  subscriptionId: string,
  resumeAt: 'now' | number = 'now'
): Promise<{ success: boolean; data?: any; error?: string }> {
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
  } catch (error: any) {
    console.error('Error resuming Razorpay subscription:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}

/**
 * Get Razorpay subscription details
 */
export async function getRazorpaySubscription(
  subscriptionId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
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
  } catch (error: any) {
    console.error('Error fetching Razorpay subscription:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
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

    if (!result.success) {
      console.error('❌ [Razorpay] Cannot fetch subscription:', result.error);
      return {
        cancellable: false,
        reason: `Cannot fetch subscription: ${result.error}`
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
  } catch (error: any) {
    console.error('💥 [Razorpay] Error checking subscription:', error);
    return {
      cancellable: false,
      reason: `Error checking subscription: ${error.message}`
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
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const auth = getAuthHeader();
    const url = 'https://api.razorpay.com/v1/refunds';

    const body: any = {
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
  } catch (error: any) {
    console.error('Error creating refund:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}

/**
 * Get all payments for a subscription
 */
export async function getSubscriptionPayments(
  subscriptionId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
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
  } catch (error: any) {
    console.error('Error fetching subscription payments:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
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
): Promise<{ success: boolean; data?: any; error?: string }> {
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
  } catch (error: any) {
    console.error('Error updating subscription schedule:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}
