/**
 * Onboarding error handling system
 * Provides typed errors with categorization and recovery strategies
 */

export type OnboardingErrorCode =
  | 'SAVE_FAILED'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR'
  | 'PROFILE_LOAD_ERROR'
  | 'CONTEXT_ERROR'
  | 'TIMEOUT_ERROR'
  | 'UNKNOWN_ERROR';

export type OnboardingErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface OnboardingError extends Error {
  code: OnboardingErrorCode;
  severity: OnboardingErrorSeverity;
  recoverable: boolean;
  userMessage: string;
  technicalDetails?: string;
  retryable: boolean;
  retryDelay?: number;
  timestamp: string;
  context?: Record<string, unknown>;
}

/**
 * Error configuration mapping error codes to their properties
 */
export const ERROR_CONFIG: Record<OnboardingErrorCode, {
  severity: OnboardingErrorSeverity;
  recoverable: boolean;
  retryable: boolean;
  retryDelay?: number;
  userMessage: string;
}> = {
  SAVE_FAILED: {
    severity: 'medium',
    recoverable: true,
    retryable: true,
    retryDelay: 5000,
    userMessage: 'Failed to save your progress. We\'ll retry automatically in a few seconds.',
  },
  VALIDATION_ERROR: {
    severity: 'low',
    recoverable: true,
    retryable: false,
    userMessage: 'Please check your input and try again.',
  },
  NETWORK_ERROR: {
    severity: 'medium',
    recoverable: true,
    retryable: true,
    retryDelay: 3000,
    userMessage: 'Network connection issue. Please check your internet connection.',
  },
  AUTH_ERROR: {
    severity: 'high',
    recoverable: false,
    retryable: false,
    userMessage: 'Authentication failed. Please log in again.',
  },
  PROFILE_LOAD_ERROR: {
    severity: 'medium',
    recoverable: true,
    retryable: true,
    retryDelay: 2000,
    userMessage: 'Failed to load your profile. We\'ll try again shortly.',
  },
  CONTEXT_ERROR: {
    severity: 'critical',
    recoverable: false,
    retryable: false,
    userMessage: 'Application error occurred. Please refresh the page.',
  },
  TIMEOUT_ERROR: {
    severity: 'medium',
    recoverable: true,
    retryable: true,
    retryDelay: 1000,
    userMessage: 'Request timed out. Retrying...',
  },
  UNKNOWN_ERROR: {
    severity: 'high',
    recoverable: false,
    retryable: false,
    userMessage: 'An unexpected error occurred. Please try again or contact support.',
  },
};

/**
 * Creates a typed OnboardingError with proper categorization
 */
export function createOnboardingError(
  code: OnboardingErrorCode,
  originalError?: Error | unknown,
  context?: Record<string, unknown>
): OnboardingError {
  const config = ERROR_CONFIG[code];
  const timestamp = new Date().toISOString();

  let technicalDetails: string | undefined;
  const message = config.userMessage;

  if (originalError instanceof Error) {
    technicalDetails = `${originalError.name}: ${originalError.message}`;
    if (originalError.stack) {
      technicalDetails += `\nStack: ${originalError.stack}`;
    }
  } else if (typeof originalError === 'string') {
    technicalDetails = originalError;
  } else if (originalError) {
    technicalDetails = JSON.stringify(originalError);
  }

  const error = new Error(message) as OnboardingError;
  error.name = 'OnboardingError';
  error.code = code;
  error.severity = config.severity;
  error.recoverable = config.recoverable;
  error.userMessage = config.userMessage;
  error.technicalDetails = technicalDetails;
  error.retryable = config.retryable;
  error.retryDelay = config.retryDelay;
  error.timestamp = timestamp;
  error.context = context;

  return error;
}

/**
 * Type guard to check if an error is an OnboardingError
 */
export function isOnboardingError(error: unknown): error is OnboardingError {
  return error instanceof Error &&
         'code' in error &&
         'severity' in error &&
         'recoverable' in error;
}

/**
 * Error classification helper
 */
export function classifyError(error: unknown): OnboardingErrorCode {
  if (isOnboardingError(error)) {
    return error.code;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network-related errors
    if (message.includes('network') ||
        message.includes('fetch') ||
        message.includes('connection') ||
        message.includes('timeout')) {
      return 'NETWORK_ERROR';
    }

    // Authentication errors
    if (message.includes('auth') ||
        message.includes('unauthorized') ||
        message.includes('permission')) {
      return 'AUTH_ERROR';
    }

    // Validation errors
    if (message.includes('validation') ||
        message.includes('invalid') ||
        message.includes('required')) {
      return 'VALIDATION_ERROR';
    }

    // Save/database errors
    if (message.includes('save') ||
        message.includes('database') ||
        message.includes('firestore')) {
      return 'SAVE_FAILED';
    }
  }

  return 'UNKNOWN_ERROR';
}

/**
 * Error recovery strategies
 */
export interface ErrorRecoveryStrategy {
  shouldRetry: (error: OnboardingError, attemptCount: number) => boolean;
  getRetryDelay: (error: OnboardingError, attemptCount: number) => number;
  getMaxRetries: (error: OnboardingError) => number;
}

export const DEFAULT_RECOVERY_STRATEGY: ErrorRecoveryStrategy = {
  shouldRetry: (error: OnboardingError, attemptCount: number) => {
    return error.retryable && attemptCount < 3;
  },

  getRetryDelay: (error: OnboardingError, attemptCount: number) => {
    const baseDelay = error.retryDelay || 1000;
    // Exponential backoff: delay * (2 ^ attemptCount)
    return baseDelay * Math.pow(2, attemptCount);
  },

  getMaxRetries: (error: OnboardingError) => {
    switch (error.severity) {
      case 'low': return 2;
      case 'medium': return 3;
      case 'high': return 1;
      case 'critical': return 0;
      default: return 1;
    }
  },
};

/**
 * Error logging utility
 */
export function logOnboardingError(error: OnboardingError): void {
  const logData = {
    code: error.code,
    severity: error.severity,
    message: error.userMessage,
    technicalDetails: error.technicalDetails,
    timestamp: error.timestamp,
    context: error.context,
    recoverable: error.recoverable,
    retryable: error.retryable,
  };

  // Log based on severity
  switch (error.severity) {
    case 'low':
      console.info('Onboarding Info:', logData);
      break;
    case 'medium':
      console.warn('Onboarding Warning:', logData);
      break;
    case 'high':
    case 'critical':
      console.error('Onboarding Error:', logData);
      break;
  }
}

/**
 * Helper function to handle errors consistently
 */
export function handleOnboardingError(
  error: unknown,
  context?: Record<string, unknown>
): OnboardingError {
  let onboardingError: OnboardingError;

  if (isOnboardingError(error)) {
    onboardingError = error;
  } else {
    const code = classifyError(error);
    onboardingError = createOnboardingError(code, error, context);
  }

  logOnboardingError(onboardingError);
  return onboardingError;
}