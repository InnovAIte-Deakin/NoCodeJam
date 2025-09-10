
import React from 'react';

interface OnboardingProgressBarProps {
  latestCompletedStep: number;
  totalSteps: number;
  viewedStep: number;
}

export function OnboardingProgressBar({ latestCompletedStep, totalSteps, viewedStep }: OnboardingProgressBarProps) {
  const progressPercentage = Math.min((latestCompletedStep / totalSteps) * 100, 100);
  const currentStep = latestCompletedStep + 1;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Step Counter Text */}
      <div className="text-center mb-2">
        <span className="text-sm font-medium text-gray-600">
          Step {viewedStep} of {totalSteps}
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        {/* Progress Bar Fill */}
        <div
          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
          role="progressbar"
          aria-valuenow={latestCompletedStep}
          aria-valuemin={0}
          aria-valuemax={totalSteps}
          aria-label={`Completed ${latestCompletedStep} of ${totalSteps} steps`}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-center">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber <= latestCompletedStep;
          const isCurrent = stepNumber === currentStep;
          const isViewed = stepNumber === viewedStep;

          return (
            <div
              key={stepNumber}
              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-all duration-200 border-2 ${
                isViewed
                  ? 'border-purple-500'
                  : 'border-transparent'
              } ${
                isCompleted
                  ? 'bg-green-500 text-white'
                  : isCurrent
                    ? 'bg-purple-500 text-white'
                    : 'bg-white text-gray-600'
              }`}
            >
              {isCompleted ? (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                stepNumber
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
