import { NextRequest, NextResponse } from 'next/server';
import { getAdminUserId } from '@/lib/middleware/adminMiddleware';
import { firestore } from '@/lib/firebaseConfig/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const adminUserId = await getAdminUserId(request);
    if (!adminUserId) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    // Get all subscriptions
    const subscriptionsRef = collection(firestore, 'subscriptions');
    const subscriptionsSnapshot = await getDocs(subscriptionsRef);

    // Get all users
    const usersRef = collection(firestore, 'users');
    const usersSnapshot = await getDocs(usersRef);

    // Calculate stats
    let activeSubscriptions = 0;
    let cancelledSubscriptions = 0;
    let expiredSubscriptions = 0;
    let gracePeriodSubscriptions = 0;
    let monthlyRecurringRevenue = 0;
    let newSubscriptionsToday = 0;
    let cancellationsToday = 0;

    const today = new Date().toISOString().split('T')[0];

    subscriptionsSnapshot.forEach((doc) => {
      const subscription = doc.data();

      switch (subscription.subscriptionStatus) {
        case 'premium':
          activeSubscriptions++;
          // Calculate MRR based on plan type
          if (subscription.planType === 'monthly') {
            monthlyRecurringRevenue += subscription.planPrice || 0;
          } else if (subscription.planType === 'quarterly') {
            monthlyRecurringRevenue += (subscription.planPrice || 0) / 3;
          } else if (subscription.planType === 'yearly') {
            monthlyRecurringRevenue += (subscription.planPrice || 0) / 12;
          }
          break;
        case 'cancelled':
          cancelledSubscriptions++;
          break;
        case 'expired':
          expiredSubscriptions++;
          break;
        case 'grace_period':
          gracePeriodSubscriptions++;
          break;
      }

      // Check for new subscriptions today
      if (subscription.subscriptionStartDate) {
        const startDate = subscription.subscriptionStartDate.split('T')[0];
        if (startDate === today && subscription.subscriptionStatus === 'premium') {
          newSubscriptionsToday++;
        }
      }

      // Check for cancellations today
      if (subscription.cancelledDate) {
        const cancelDate = subscription.cancelledDate.split('T')[0];
        if (cancelDate === today) {
          cancellationsToday++;
        }
      }
    });

    const stats = {
      totalUsers: usersSnapshot.size,
      activeSubscriptions,
      cancelledSubscriptions,
      expiredSubscriptions,
      gracePeriodSubscriptions,
      monthlyRecurringRevenue: Math.round(monthlyRecurringRevenue),
      newSubscriptionsToday,
      cancellationsToday,
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
