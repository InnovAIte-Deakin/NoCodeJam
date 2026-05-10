import { onboardingPageKeys, type OnboardingPageKey } from './onboardingSteps';

export const ONBOARDING_RESTART_EVENT = 'nocodejam:onboarding-restart';

export type OnboardingStatus = 'in-progress' | 'completed' | 'skipped';

export interface StoredOnboardingProgress {
  status: OnboardingStatus;
  currentStep: number;
}

const STORAGE_PREFIX = 'nocodejam:onboarding';

export function onboardingStorageKey(userId: string, pageKey: OnboardingPageKey) {
  return `${STORAGE_PREFIX}:${userId}:${pageKey}`;
}

export function readOnboardingProgress(userId: string, pageKey: OnboardingPageKey) {
  try {
    const raw = window.localStorage.getItem(onboardingStorageKey(userId, pageKey));
    if (!raw) return null;
    return JSON.parse(raw) as StoredOnboardingProgress;
  } catch {
    return null;
  }
}

export function writeOnboardingProgress(
  userId: string,
  pageKey: OnboardingPageKey,
  progress: StoredOnboardingProgress
) {
  try {
    window.localStorage.setItem(onboardingStorageKey(userId, pageKey), JSON.stringify(progress));
  } catch {
    // localStorage can be unavailable in private browsing or test environments.
  }
}

export function skipAllOnboardingTours(userId: string) {
  onboardingPageKeys.forEach((pageKey) => {
    writeOnboardingProgress(userId, pageKey, { status: 'skipped', currentStep: 0 });
  });
}

export function skipOnboardingPage(userId: string, pageKey: OnboardingPageKey, currentStep = 0) {
  writeOnboardingProgress(userId, pageKey, {
    status: 'skipped',
    currentStep,
  });
}

export function restartAllOnboardingTours(userId: string) {
  try {
    onboardingPageKeys.forEach((pageKey) => {
      window.localStorage.removeItem(onboardingStorageKey(userId, pageKey));
    });
  } catch {
    // Ignore unavailable storage.
  }
}
