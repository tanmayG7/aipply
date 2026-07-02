"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { auth, getUserProfile, checkSubscriptionStatus } from '@/lib/firebaseConfig/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * User profile data stored in context
 */
export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
}

/**
 * Subscription status type
 */
export type SubscriptionStatus = 'free' | 'premium' | 'grace_period';

/**
 * User context state
 */
export interface UserContextState {
  profile: UserProfile | null;
  subscriptionStatus: SubscriptionStatus;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  userId: string | null;
}

/**
 * User context value with state and methods
 */
export interface UserContextValue extends UserContextState {
  refreshUserData: () => Promise<void>;
}

// Create the context
const UserContext = createContext<UserContextValue | undefined>(undefined);

/**
 * Hook to access user context
 * Throws error if used outside UserContextProvider
 */
export const useUserContext = (): UserContextValue => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }
  return context;
};

/**
 * Provider component for user context
 * Fetches and manages user profile and subscription data
 */
export const UserContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<UserContextState>({
    profile: null,
    subscriptionStatus: 'free',
    isLoading: true,
    isInitialized: false,
    error: null,
    userId: null,
  });

  /**
   * Fetch user profile and subscription data
   */
  const fetchUserData = async (userId: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Fetch both in parallel for performance
      const [profileData, subscriptionStatusData] = await Promise.all([
        getUserProfile(userId),
        checkSubscriptionStatus(userId),
      ]);

      setState((prev) => ({
        ...prev,
        profile: {
          firstName: profileData?.firstName || '',
          lastName: profileData?.lastName || '',
          email: profileData?.email || '',
          profileImage: profileData?.uploadFile || '',
        },
        subscriptionStatus: subscriptionStatusData || 'free',
        isLoading: false,
        isInitialized: true,
        userId,
        error: null,
      }));
    } catch (err) {
      console.error('Error fetching user data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user data';

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        isInitialized: true,
        subscriptionStatus: 'free',
      }));
    }
  };

  /**
   * Method to manually refresh user data
   */
  const refreshUserData = useCallback(async () => {
    if (!auth) return;
    const currentUser = auth?.currentUser;
    if (currentUser) {
      await fetchUserData(currentUser.uid);
    }
  }, []);

  /**
   * Set up auth state listener
   * Fetches user data when auth state changes
   */
  useEffect(() => {
    if (!auth) {
      // Auth not initialized — mark as initialized with logged-out state
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isInitialized: true,
      }));
      return;
    }

    const unsubscribe = onAuthStateChanged(auth!, async (user) => {
      if (user) {
        await fetchUserData(user.uid);
      } else {
        setState({
          profile: null,
          subscriptionStatus: 'free',
          isLoading: false,
          isInitialized: true,
          error: null,
          userId: null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Memoize context value to prevent unnecessary re-renders
   * Only recalculate when state changes
   */
  const contextValue = useMemo<UserContextValue>(
    () => ({
      ...state,
      refreshUserData,
    }),
    [state, refreshUserData]
  );

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
