import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Onboarding Error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error?: Error; resetError: () => void }> = ({ error, resetError }) => (
  <div className="min-h-screen flex items-center justify-center bg-[#020218] p-4">
    <div className="text-center text-white max-w-md">
      <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
      <p className="text-gray-400 mb-6">
        We encountered an error while setting up your profile. Don&apos;t worry, your progress has been saved.
      </p>
      {error && (
        <details className="text-left text-sm text-gray-500 mb-6">
          <summary className="cursor-pointer">Technical details</summary>
          <pre className="mt-2 p-2 bg-gray-800 rounded text-xs overflow-auto">
            {error.message}
          </pre>
        </details>
      )}
      <button
        onClick={resetError}
        className="px-6 py-2 bg-[#5D29FF] hover:bg-[#4A1FCC] rounded-lg text-white font-medium transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);