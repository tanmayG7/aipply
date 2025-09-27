"use client";

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SanitizationWarningsProps {
  warnings: Record<string, string[]>;
  className?: string;
}

export function SanitizationWarnings({ warnings, className }: SanitizationWarningsProps) {
  const hasWarnings = Object.keys(warnings).length > 0;

  if (!hasWarnings) return null;

  return (
    <Alert className={`border-yellow-200 bg-yellow-50 text-yellow-800 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription>
        <div className="font-medium mb-2">Input has been automatically cleaned:</div>
        <ul className="text-sm space-y-1">
          {Object.entries(warnings).map(([field, fieldWarnings]) => (
            <li key={field}>
              <strong className="capitalize">{field}:</strong>{' '}
              {fieldWarnings.join(', ')}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}