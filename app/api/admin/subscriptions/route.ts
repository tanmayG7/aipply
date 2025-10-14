import { NextRequest, NextResponse } from 'next/server';
import { getAdminUserId } from '@/lib/middleware/adminMiddleware';
import { firestore } from '@/lib/firebaseConfig/firebaseConfig';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Get all subscriptions
    let subscriptionsQuery = collection(firestore, 'subscriptions');
    let q = query(subscriptionsQuery);

    // Apply status filter if provided
    if (status && status !== 'all') {
      q = query(subscriptionsQuery, where('subscriptionStatus', '==', status));
    }

    const subscriptionsSnapshot = await getDocs(q);

    // Build subscription list with user details
    const subscriptions: any[] = await Promise.all(
      subscriptionsSnapshot.docs.map(async (subscriptionDoc) => {
        const subscription = subscriptionDoc.data();
        const userId = subscription.userId;

        // Get user details
        let userName = 'Unknown User';
        let userEmail = 'N/A';

        try {
          const userDoc = await getDoc(doc(firestore, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown User';
            userEmail = userData.email || 'N/A';
          }
        } catch (error) {
          console.error(`Error fetching user ${userId}:`, error);
        }

        return {
          ...subscription,
          userId,
          userName,
          userEmail,
        };
      })
    );

    // Apply search filter if provided
    let filteredSubscriptions = subscriptions;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSubscriptions = subscriptions.filter(
        (sub) =>
          sub.userName.toLowerCase().includes(searchLower) ||
          sub.userEmail.toLowerCase().includes(searchLower) ||
          sub.userId.toLowerCase().includes(searchLower) ||
          sub.razorpaySubscriptionId?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by most recent first
    filteredSubscriptions.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({
      subscriptions: filteredSubscriptions,
      total: filteredSubscriptions.length,
    });
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
