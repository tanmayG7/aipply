"use client";

import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import type { OnboardingError } from '@/lib/onboarding-errors';

interface ErrorDisplayProps {
  error: OnboardingError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  variant?: 'default' | 'destructive' | 'warning';
}

export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  className
}: ErrorDisplayProps) {
  if (!error) return null;

  const getVariantStyles = () => {
    switch (error.severity) {
      case 'low':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'medium':
        return 'border-orange-200 bg-orange-50 text-orange-800';
      case 'high':
      case 'critical':
        return 'border-red-200 bg-red-50 text-red-800';
      default:
        return 'border-red-200 bg-red-50 text-red-800';
    }
  };

  const getIcon = () => {
    switch (error.severity) {
      case 'low':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'high':
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <Alert className={cn(getVariantStyles(), className)}>
      <div className="flex items-start justify-between w-full">
        <div className="flex items-start space-x-2 flex-1">
          {getIcon()}
          <div className="flex-1">
            <AlertDescription className="text-sm font-medium">
              {error.userMessage}
            </AlertDescription>
            {error.code && (
              <p className="text-xs mt-1 opacity-75">
                Error Code: {error.code}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1 ml-2">
          {error.retryable && onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="h-8 w-8 p-0 hover:bg-white/20"
              title="Retry operation"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}

          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-8 w-8 p-0 hover:bg-white/20"
              title="Dismiss error"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: OnboardingError; retry: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: OnboardingError | null;
}

export class OnboardingErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Check if it's already an OnboardingError
    if ('code' in error && 'severity' in error) {
      return {
        hasError: true,
        error: error as OnboardingError,
      };
    }

    // Create a generic OnboardingError for unexpected errors
    const onboardingError: OnboardingError = {
      ...error,
      code: 'UNKNOWN_ERROR',
      severity: 'high',
      recoverable: false,
      userMessage: 'An unexpected error occurred. Please refresh the page and try again.',
      retryable: false,
      timestamp: new Date().toISOString(),
    };

    return {
      hasError: true,
      error: onboardingError,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Onboarding Error Boundary caught an error:', {
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
    });
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#020218] p-4">
          <div className="max-w-md w-full">
            <ErrorDisplay
              error={this.state.error}
              onRetry={this.state.error.retryable ? this.retry : undefined}
              className="mb-4"
            />

            {this.state.error.severity === 'critical' && (
              <div className="text-center">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="mt-4"
                >
                  Refresh Page
                </Button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}