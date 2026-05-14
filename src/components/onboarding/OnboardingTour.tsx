import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingTooltip } from './OnboardingTooltip';
import { getOnboardingPageKey, onboardingSteps, type OnboardingPageKey } from './onboardingSteps';
import {
  ONBOARDING_RESTART_EVENT,
  readOnboardingProgress,
  skipOnboardingPage,
  writeOnboardingProgress,
} from './onboardingStorage';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TooltipPosition {
  top: number;
  left: number;
  width: number;
  placement: 'top' | 'bottom';
}

const SPOTLIGHT_PADDING = 8;
const TOOLTIP_GAP = 16;
const TOOLTIP_MAX_WIDTH = 340;
const TOOLTIP_ESTIMATED_HEIGHT = 230;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getSpotlightRect(target: Element): SpotlightRect {
  const rect = target.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const top = clamp(rect.top - SPOTLIGHT_PADDING, 8, viewportHeight - 16);
  const left = clamp(rect.left - SPOTLIGHT_PADDING, 8, viewportWidth - 16);
  const right = clamp(rect.right + SPOTLIGHT_PADDING, 16, viewportWidth - 8);
  const bottom = clamp(rect.bottom + SPOTLIGHT_PADDING, 16, viewportHeight - 8);

  return {
    top,
    left,
    width: Math.max(right - left, 1),
    height: Math.max(bottom - top, 1),
  };
}

function getTooltipPosition(spotlight: SpotlightRect): TooltipPosition {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const width = Math.min(TOOLTIP_MAX_WIDTH, viewportWidth - 32);
  const centeredLeft = spotlight.left + spotlight.width / 2 - width / 2;
  const left = clamp(centeredLeft, 16, viewportWidth - width - 16);
  const hasRoomBelow = spotlight.top + spotlight.height + TOOLTIP_GAP + TOOLTIP_ESTIMATED_HEIGHT < viewportHeight;
  const placement = hasRoomBelow ? 'bottom' : 'top';
  const preferredTop = hasRoomBelow
    ? spotlight.top + spotlight.height + TOOLTIP_GAP
    : spotlight.top - TOOLTIP_GAP - TOOLTIP_ESTIMATED_HEIGHT;

  return {
    top: clamp(preferredTop, 16, Math.max(16, viewportHeight - TOOLTIP_ESTIMATED_HEIGHT - 16)),
    left,
    width,
    placement,
  };
}

export function OnboardingTour() {
  const location = useLocation();
  const { user } = useAuth();
  const pageKey = useMemo(() => getOnboardingPageKey(location.pathname), [location.pathname]);
  const [activePage, setActivePage] = useState<OnboardingPageKey | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const steps = activePage ? onboardingSteps[activePage] : [];
  const step = steps[currentStep];
  const isActive = Boolean(user && activePage && step);

  const startPageTour = useCallback(
    (nextPageKey: OnboardingPageKey) => {
      if (!user) return;

      const saved = readOnboardingProgress(user.id, nextPageKey);
      if (saved?.status === 'completed' || saved?.status === 'skipped') {
        setActivePage(null);
        return;
      }

      const totalSteps = onboardingSteps[nextPageKey].length;
      const savedStep =
        saved?.status === 'in-progress' ? clamp(saved.currentStep, 0, Math.max(totalSteps - 1, 0)) : 0;

      setActivePage(nextPageKey);
      setCurrentStep(savedStep);
      writeOnboardingProgress(user.id, nextPageKey, {
        status: 'in-progress',
        currentStep: savedStep,
      });
    },
    [user]
  );

  useEffect(() => {
    setSpotlight(null);
    setTooltipPosition(null);

    if (!user || !pageKey) {
      setActivePage(null);
      return;
    }

    const timeoutId = window.setTimeout(() => startPageTour(pageKey), 250);
    return () => window.clearTimeout(timeoutId);
  }, [pageKey, startPageTour, user]);

  useEffect(() => {
    const handleRestart = () => {
      if (!pageKey) return;
      setActivePage(pageKey);
      setCurrentStep(0);
      setRefreshTick((tick) => tick + 1);
      if (user) {
        writeOnboardingProgress(user.id, pageKey, {
          status: 'in-progress',
          currentStep: 0,
        });
      }
    };

    window.addEventListener(ONBOARDING_RESTART_EVENT, handleRestart);
    return () => window.removeEventListener(ONBOARDING_RESTART_EVENT, handleRestart);
  }, [pageKey, user]);

  useEffect(() => {
    if (!isActive) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isActive]);

  const measureCurrentTarget = useCallback(() => {
    if (!step) return;

    const target = document.querySelector(step.target);
    if (!target) {
      setSpotlight(null);
      setTooltipPosition(null);
      return;
    }

    const rect = getSpotlightRect(target);
    setSpotlight(rect);
    setTooltipPosition(getTooltipPosition(rect));
  }, [step]);

  useEffect(() => {
    if (!isActive || !step) return;

    const target = document.querySelector(step.target);
    target?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

    const firstMeasure = window.setTimeout(measureCurrentTarget, 180);
    const interval = window.setInterval(measureCurrentTarget, 300);

    window.addEventListener('resize', measureCurrentTarget);
    window.addEventListener('scroll', measureCurrentTarget, true);

    return () => {
      window.clearTimeout(firstMeasure);
      window.clearInterval(interval);
      window.removeEventListener('resize', measureCurrentTarget);
      window.removeEventListener('scroll', measureCurrentTarget, true);
    };
  }, [currentStep, isActive, measureCurrentTarget, refreshTick, step]);

  const completePageTour = useCallback(() => {
    if (!user || !activePage) return;
    writeOnboardingProgress(user.id, activePage, {
      status: 'completed',
      currentStep: onboardingSteps[activePage].length - 1,
    });
    setActivePage(null);
  }, [activePage, user]);

  const handleNext = useCallback(() => {
    if (!user || !activePage) return;

    if (currentStep >= steps.length - 1) {
      completePageTour();
      return;
    }

    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    writeOnboardingProgress(user.id, activePage, {
      status: 'in-progress',
      currentStep: nextStep,
    });
  }, [activePage, completePageTour, currentStep, steps.length, user]);

  const handleBack = useCallback(() => {
    if (!user || !activePage) return;

    const previousStep = Math.max(currentStep - 1, 0);
    setCurrentStep(previousStep);
    writeOnboardingProgress(user.id, activePage, {
      status: 'in-progress',
      currentStep: previousStep,
    });
  }, [activePage, currentStep, user]);

  const handleSkipAll = useCallback(() => {
    if (!user || !activePage) return;
    skipOnboardingPage(user.id, activePage, currentStep);
    setActivePage(null);
  }, [activePage, currentStep, user]);

  if (!isActive || !spotlight || !tooltipPosition || !step) {
    return null;
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const topHeight = Math.max(spotlight.top, 0);
  const bottomTop = Math.min(spotlight.top + spotlight.height, viewportHeight);
  const bottomHeight = Math.max(viewportHeight - bottomTop, 0);
  const middleTop = spotlight.top;
  const middleHeight = Math.max(spotlight.height, 0);
  const leftWidth = Math.max(spotlight.left, 0);
  const rightLeft = Math.min(spotlight.left + spotlight.width, viewportWidth);
  const rightWidth = Math.max(viewportWidth - rightLeft, 0);

  return createPortal(
    <>
      <div className="fixed inset-0 z-[90] cursor-default" aria-hidden="true" />
      <div className="onboarding-overlay fixed left-0 top-0 z-[91]" style={{ width: viewportWidth, height: topHeight }} />
      <div
        className="onboarding-overlay fixed left-0 z-[91]"
        style={{ top: bottomTop, width: viewportWidth, height: bottomHeight }}
      />
      <div
        className="onboarding-overlay fixed left-0 z-[91]"
        style={{ top: middleTop, width: leftWidth, height: middleHeight }}
      />
      <div
        className="onboarding-overlay fixed z-[91]"
        style={{ top: middleTop, left: rightLeft, width: rightWidth, height: middleHeight }}
        aria-hidden="true"
      />
      <div
        className="onboarding-spotlight fixed z-[92] rounded-lg"
        style={{
          top: spotlight.top,
          left: spotlight.left,
          width: spotlight.width,
          height: spotlight.height,
        }}
        aria-hidden="true"
      />
      <OnboardingTooltip
        step={step}
        currentStep={currentStep}
        totalSteps={steps.length}
        position={tooltipPosition}
        onBack={handleBack}
        onNext={handleNext}
        onSkipAll={handleSkipAll}
      />
    </>,
    document.body
  );
}
