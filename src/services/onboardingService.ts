import { supabase } from '../lib/supabaseClient';

export interface OnboardingProgress {
  latest_completed_step: number;
}

export interface UpdateProgressRequest {
  completed_step: number;
}

export interface VerifyStepRequest {
  code: string;
}

export interface VerifyStepResponse {
  success: boolean;
  message?: string;
}

/**
 * Fetches the user's current onboarding progress
 * @returns Promise<OnboardingProgress>
 */
export async function getOnboardingProgress(): Promise<OnboardingProgress> {
  try {
    const { data, error } = await supabase.functions.invoke('get-onboarding-progress');

    if (error) {
      console.error('Error fetching onboarding progress:', error);
      throw new Error(error.message || 'Failed to fetch onboarding progress');
    }

    if (!data || typeof data.latest_completed_step !== 'number') {
      throw new Error('Invalid response format from get-onboarding-progress');
    }

    return data as OnboardingProgress;
  } catch (error) {
    console.error('getOnboardingProgress error:', error);
    throw error;
  }
}

/**
 * Updates the user's onboarding progress
 * @param completed_step The step number that was just completed
 * @returns Promise<void>
 */
export async function updateOnboardingProgress(completed_step: number): Promise<void> {
  try {
    if (typeof completed_step !== 'number' || completed_step < 0) {
      throw new Error('Invalid completed_step: must be a non-negative number');
    }

    const { data, error } = await supabase.functions.invoke('update-onboarding-progress', {
      body: { completed_step }
    });

    if (error) {
      console.error('Error updating onboarding progress:', error);
      throw new Error(error.message || 'Failed to update onboarding progress');
    }

    // The function returns a success message, but we don't need to return it
    console.log('Onboarding progress updated successfully');
  } catch (error) {
    console.error('updateOnboardingProgress error:', error);
    throw error;
  }
}

/**
 * Verifies an onboarding step with the provided code
 * @param code The verification code to submit
 * @returns Promise<VerifyStepResponse>
 */
export async function verifyOnboardingStep(code: string): Promise<VerifyStepResponse> {
  try {
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      throw new Error('Invalid code: must be a non-empty string');
    }

    const { data, error } = await supabase.functions.invoke('verify', {
      body: { code: code.trim() }
    });

    if (error) {
      console.error('Error verifying onboarding step:', error);
      return {
        success: false,
        message: error.message || 'Verification failed'
      };
    }

    // Assuming the verify function returns { success: boolean, message?: string }
    return data as VerifyStepResponse;
  } catch (error) {
    console.error('verifyOnboardingStep error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Verification failed'
    };
  }
}
