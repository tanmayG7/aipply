"use client";

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import type { OnboardingError } from '@/lib/onboarding-errors';

interface OnboardingErrorState {
  systemError: OnboardingError | null;
  retryCount: number;
  lastOperation: string | null;
}

type OnboardingErrorAction =
  | { type: 'SET_SYSTEM_ERROR'; payload: OnboardingError | null }
  | { type: 'INCREMENT_RETRY_COUNT' }
  | { type: 'RESET_RETRY_COUNT' }
  | { type: 'SET_LAST_OPERATION'; payload: string | null };

interface OnboardingErrorContextType {
  state: OnboardingErrorState;
  setSystemError: (error: OnboardingError | null) => void;
  clearSystemError: () => void;
  incrementRetryCount: () => void;
  resetRetryCount: () => void;
  setLastOperation: (operation: string | null) => void;
}

const initialErrorState: OnboardingErrorState = {
  systemError: null,
  retryCount: 0,
  lastOperation: null,
};

function errorReducer(state: OnboardingErrorState, action: OnboardingErrorAction): OnboardingErrorState {
  switch (action.type) {
    case 'SET_SYSTEM_ERROR':
      return { ...state, systemError: action.payload };
    case 'INCREMENT_RETRY_COUNT':
      return { ...state, retryCount: state.retryCount + 1 };
    case 'RESET_RETRY_COUNT':
      return { ...state, retryCount: 0 };
    case 'SET_LAST_OPERATION':
      return { ...state, lastOperation: action.payload };
    default:
      return state;
  }
}

const OnboardingErrorContext = createContext<OnboardingErrorContextType | undefined>(undefined);

export const useOnboardingError = () => {
  const context = useContext(OnboardingErrorContext);
  if (!context) {
    throw new Error('useOnboardingError must be used within an OnboardingErrorProvider');
  }
  return context;
};

export const OnboardingErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(errorReducer, initialErrorState);

  const setSystemError = useCallback((error: OnboardingError | null) => {
    dispatch({ type: 'SET_SYSTEM_ERROR', payload: error });
  }, []);

  const clearSystemError = useCallback(() => {
    dispatch({ type: 'SET_SYSTEM_ERROR', payload: null });
    dispatch({ type: 'RESET_RETRY_COUNT' });
  }, []);

  const incrementRetryCount = useCallback(() => {
    dispatch({ type: 'INCREMENT_RETRY_COUNT' });
  }, []);

  const resetRetryCount = useCallback(() => {
    dispatch({ type: 'RESET_RETRY_COUNT' });
  }, []);

  const setLastOperation = useCallback((operation: string | null) => {
    dispatch({ type: 'SET_LAST_OPERATION', payload: operation });
  }, []);

  // Memoize context value
  const contextValue = useMemo<OnboardingErrorContextType>(() => ({
    state,
    setSystemError,
    clearSystemError,
    incrementRetryCount,
    resetRetryCount,
    setLastOperation,
  }), [
    state,
    setSystemError,
    clearSystemError,
    incrementRetryCount,
    resetRetryCount,
    setLastOperation,
  ]);

  return (
    <OnboardingErrorContext.Provider value={contextValue}>
      {children}
    </OnboardingErrorContext.Provider>
  );
};