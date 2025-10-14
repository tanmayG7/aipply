import { auth, getUserProfile } from '@/lib/firebaseConfig/firebaseConfig';
import { UserDetails } from '@/lib/types';

/**
 * Check if the current user has admin role
 */
export async function isAdmin(userId?: string): Promise<boolean> {
  try {
    // Get user ID from auth if not provided
    if (!userId) {
      const currentUser = auth.currentUser;
      if (!currentUser) return false;
      userId = currentUser.uid;
    }

    // Get user profile
    const userProfile = await getUserProfile(userId);

    // Check if user has admin role
    return userProfile.userRole === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Verify admin access for API routes
 * Throws error if user is not authenticated or not an admin
 */
export async function verifyAdminAccess(userId: string): Promise<UserDetails> {
  if (!userId) {
    throw new Error('Unauthorized: No user ID provided');
  }

  const userProfile = await getUserProfile(userId);

  if (userProfile.userRole !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  return userProfile;
}

/**
 * Get admin user details from Firebase Auth token
 */
export async function getAdminFromToken(token: string): Promise<UserDetails | null> {
  try {
    // In a production environment, you would verify the token here
    // For now, we'll decode it to get the user ID
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const userId = decodedToken.user_id || decodedToken.uid;

    if (!userId) return null;

    const userProfile = await getUserProfile(userId);

    if (userProfile.userRole !== 'admin') {
      return null;
    }

    return userProfile;
  } catch (error) {
    console.error('Error getting admin from token:', error);
    return null;
  }
}

/**
 * Check if user is admin (client-side)
 */
export async function checkAdminRole(): Promise<boolean> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;

    // First check if email is in admin list (quick check)
    if (currentUser.email && isAdminEmail(currentUser.email)) {
      return true;
    }

    // Then check Firestore userRole
    return await isAdmin(currentUser.uid);
  } catch (error) {
    console.error('Error checking admin role:', error);
    return false;
  }
}

/**
 * Admin role constants
 */
export const ADMIN_ROLES = {
  USER: 'user' as const,
  ADMIN: 'admin' as const,
};

/**
 * List of admin email addresses (fallback check)
 * In production, this should be moved to environment variables
 */
export const ADMIN_EMAILS = [
  'admin@aipply.io',
  'tanmay@aipply.io',
  // Add more admin emails here
];

/**
 * Check if email is in admin list
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
