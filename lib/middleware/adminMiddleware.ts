import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/utils/adminAuth';

/**
 * Middleware to protect admin routes
 * Verifies that the user is authenticated and has admin role
 */
export async function withAdminAuth(
  request: NextRequest,
  handler: (request: NextRequest, userId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    // Extract token
    const token = authHeader.substring(7);

    // Decode token to get user ID
    // In production, use proper token verification (e.g., Firebase Admin SDK)
    let userId: string;
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      userId = decodedToken.user_id || decodedToken.uid;
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token payload' },
        { status: 401 }
      );
    }

    // Verify admin access
    await verifyAdminAccess(userId);

    // Call the handler with verified user ID
    return await handler(request, userId);

  } catch (error: any) {
    console.error('Admin middleware error:', error);

    if (error.message?.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to extract user ID from request
 * Used in API routes that need the current user
 */
export function extractUserId(request: NextRequest): string | null {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    return decodedToken.user_id || decodedToken.uid || null;
  } catch (error) {
    return null;
  }
}

/**
 * Helper function to check if request is from admin
 * Returns user ID if admin, null otherwise
 */
export async function getAdminUserId(request: NextRequest): Promise<string | null> {
  try {
    const userId = extractUserId(request);
    if (!userId) return null;

    // Verify admin access (this will throw if not admin)
    await verifyAdminAccess(userId);
    return userId;
  } catch (error) {
    return null;
  }
}
