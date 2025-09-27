import React from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';

export const ProgressIndicator: React.FC = () => {
  const { state, calculateProgress } = useOnboarding();
  const progress = calculateProgress();

  return (
    <div className="w-full">
      {/* Step indicators */}
      <div className="flex gap-2 sm:gap-4 items-center justify-center max-w-[320px] sm:max-w-[400px] lg:max-w-[520px] w-full mx-auto mb-4">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`w-[10%] h-[3px] sm:h-[4px] rounded-full transition-all duration-300 ${
              state.currentPage - 1 > index ? "bg-[#5D29FF]" : "bg-white/30"
            }`}
          ></div>
        ))}
      </div>

      {/* Progress percentage */}
      <div className="text-center text-sm text-gray-400 mb-2">
        {progress}% Complete
      </div>

      {/* Overall progress bar */}
      <div className="w-full bg-white/10 rounded-full h-2 mb-4">
        <div
          className="bg-gradient-to-r from-[#5D29FF] to-[#7C4DFF] h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Page indicator */}
      <div className="text-center text-xs text-gray-500">
        Step {state.currentPage} of 5
      </div>
    </div>
  );
};