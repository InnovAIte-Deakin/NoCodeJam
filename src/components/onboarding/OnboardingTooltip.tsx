import React, { useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { OnboardingStep } from './onboardingSteps';

interface TooltipPosition {
  top: number;
  left: number;
  width: number;
  placement: 'top' | 'bottom';
}

interface OnboardingTooltipProps {
  step: OnboardingStep;
  currentStep: number;
  totalSteps: number;
  position: TooltipPosition;
  onBack: () => void;
  onNext: () => void;
  onSkipAll: () => void;
}

export function OnboardingTooltip({
  step,
  currentStep,
  totalSteps,
  position,
  onBack,
  onNext,
  onSkipAll,
}: OnboardingTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const titleId = `onboarding-title-${currentStep}`;
  const descriptionId = `onboarding-description-${currentStep}`;
  const isLastStep = currentStep === totalSteps - 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const stepsRemaining = Math.max(totalSteps - currentStep - 1, 0);

  const focusableSelector = useMemo(
    () =>
      [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', '),
    []
  );

  useEffect(() => {
    const tooltip = tooltipRef.current;
    if (!tooltip) return;

    const focusable = Array.from(tooltip.querySelectorAll<HTMLElement>(focusableSelector));
    const first = focusable[0] ?? tooltip;
    first.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onSkipAll();
        return;
      }

      if (event.key !== 'Tab') return;

      const currentFocusable = Array.from(tooltip.querySelectorAll<HTMLElement>(focusableSelector));
      if (currentFocusable.length === 0) {
        event.preventDefault();
        tooltip.focus();
        return;
      }

      const firstElement = currentFocusable[0];
      const lastElement = currentFocusable[currentFocusable.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    tooltip.addEventListener('keydown', handleKeyDown);
    return () => tooltip.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, focusableSelector, onSkipAll]);

  return (
    <div
      ref={tooltipRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      tabIndex={-1}
      className={cn(
        'onboarding-tooltip fixed z-[120] rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] shadow-2xl outline-none',
        'transition-all duration-300 ease-out',
        position.placement === 'top' ? 'animate-onboarding-slide-up' : 'animate-onboarding-slide-down'
      )}
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
      }}
    >
      <div className="space-y-3 p-3 sm:p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-xs font-medium text-gray-400">
            <span>
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span aria-live="polite">
              {stepsRemaining === 0 ? 'Last step' : `${stepsRemaining} remaining`}
            </span>
          </div>
          <Progress value={progress} className="h-1.5" aria-label="Tour progress" />
        </div>

        <div>
          <h2 id={titleId} className="mb-1.5 text-base font-semibold leading-tight text-white">
            {step.title}
          </h2>
          <p id={descriptionId} className="mb-0 text-xs leading-5 text-gray-300 sm:text-sm">
            {step.description}
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSkipAll}
            aria-label="Skip all onboarding tours"
          >
            Skip All
          </Button>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBack}
              disabled={currentStep === 0}
              aria-label="Go to previous onboarding step"
            >
              Back
            </Button>
            <Button type="button" size="sm" onClick={onNext} aria-label={isLastStep ? 'Finish tour' : 'Go to next step'}>
              {isLastStep ? 'Finish' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
