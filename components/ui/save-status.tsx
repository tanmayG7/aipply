import React from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';

export const SaveStatus: React.FC = () => {
  const { state } = useOnboarding();

  if (state.saveStatus === 'idle') return null;

  const getStatusIcon = () => {
    switch (state.saveStatus) {
      case 'saving':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'saved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (state.saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved';
      case 'error':
        return 'Save failed';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (state.saveStatus) {
      case 'saving':
        return 'text-blue-500';
      case 'saved':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return '';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 text-sm">
      {getStatusIcon()}
      <span className={`font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </span>
      {state.lastSavedAt && state.saveStatus === 'saved' && (
        <span className="text-gray-400 text-xs">
          {state.lastSavedAt.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};