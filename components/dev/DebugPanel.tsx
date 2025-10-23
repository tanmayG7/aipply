/**
 * DebugPanel Component
 *
 * A development-only component for displaying debug information.
 * This component will NEVER render in production environments.
 *
 * Usage:
 * ```tsx
 * import { DebugPanel } from '@/components/dev/DebugPanel';
 *
 * <DebugPanel data={{
 *   authLoading: false,
 *   isGoogleUser: true,
 *   email: "user@example.com"
 * }} />
 * ```
 */

"use client";

import React from 'react';

interface DebugPanelProps {
  data: Record<string, unknown>;
  title?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  data,
  title = 'Dev Info',
  position = 'bottom-right'
}) => {
  // CRITICAL: Only render in development mode
  // This ensures debug info NEVER appears in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-[9999] max-w-sm`}
      data-dev-only="true"
    >
      <div className="bg-gray-900 border-2 border-yellow-500 text-yellow-300 p-3 rounded-lg shadow-lg text-xs font-mono">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-yellow-500/30">
          <span className="text-yellow-500 font-bold">⚠️ DEV MODE</span>
          <span className="text-gray-400">{title}</span>
        </div>
        <div className="space-y-1">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <span className="text-blue-400">{key}:</span>
              <span className="text-white break-all">
                {typeof value === 'object'
                  ? JSON.stringify(value, null, 2)
                  : String(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * useDebugLog Hook
 *
 * A development-only logging hook that only logs in development.
 * Prevents console pollution in production.
 *
 * Usage:
 * ```tsx
 * const debugLog = useDebugLog('ComponentName');
 * debugLog('User authenticated', { userId: user.id });
 * ```
 */
export const useDebugLog = (context: string) => {
  return React.useCallback((message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      const prefix = `🔍 [${context}]`;
      if (data) {
        console.log(prefix, message, data);
      } else {
        console.log(prefix, message);
      }
    }
  }, [context]);
};
