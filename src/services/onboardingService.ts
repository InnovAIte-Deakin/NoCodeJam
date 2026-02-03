import { supabase } from '../lib/supabaseClient';

export interface OnboardingProgress {
  latest_completed_step: number;
}

export interface UpdateProgressRequest {
  completed_step: number;
}


export interface VerifyStepRequest {
  code: string;
  challengeId: string;
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

export async function verifyOnboardingStep(code: string, challengeId: string): Promise<VerifyStepResponse> {
  try {
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      throw new Error('Invalid code: must be a non-empty string');
    }
    if (!challengeId || typeof challengeId !== 'string' || challengeId.trim().length === 0) {
      throw new Error('Invalid challengeId: must be a non-empty string');
    }

    const endpoint = 'verify';
    const requestBody = { code: code.trim(), challengeId: challengeId.trim() };
    console.log(`[verifyOnboardingStep] Invoking edge function: ${endpoint}`);
    console.log('[verifyOnboardingStep] Request body:', requestBody);
    const { data, error } = await supabase.functions.invoke(endpoint, {
      body: requestBody
    });
    console.log('[verifyOnboardingStep] Raw response:', data, error);

    if (error) {
      console.error(`[verifyOnboardingStep] Error from edge function (${endpoint}):`, error, data);
      return {
        success: false,
        message: (error && error.message) || (data && data.error) || 'Verification failed'
      };
    }

    // Assuming the verify function returns { success: boolean, message?: string }
    return data as VerifyStepResponse;
  } catch (error) {
    console.error('[verifyOnboardingStep] Exception:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Verification failed'
    };
  }
}

/**
 * Fetches the challengeId for a given onboarding step
 * @param stepId The onboarding step's id
 * @returns Promise<string>
 */
export async function getChallengeId(stepId: number): Promise<string> {
  try {
    const endpoint = 'get-challenge-id';
    console.log(`[getChallengeId] Invoking edge function: ${endpoint}`);
    console.log('[getChallengeId] Request body:', { step_id: stepId });
    const { data, error } = await supabase.functions.invoke(endpoint, {
      body: { step_id: stepId }
    });
    console.log('[getChallengeId] Raw response:', data, error);
    if (error) {
      console.error(`[getChallengeId] Error from edge function (${endpoint}):`, error, data);
      throw new Error((error && error.message) || (data && data.error) || 'Failed to fetch challengeId');
    }
    if (!data || typeof data !== 'object') {
      throw new Error('[getChallengeId] Response is not an object: ' + JSON.stringify(data));
    }
    if (!('challenge_id' in data)) {
      throw new Error('[getChallengeId] challenge_id property missing: ' + JSON.stringify(data));
    }
    if (!data.challenge_id || typeof data.challenge_id !== 'string') {
      throw new Error('[getChallengeId] challenge_id is empty or not a string: ' + JSON.stringify(data));
    }
    console.log('[getChallengeId] challenge_id:', data.challenge_id);
    return data.challenge_id as string;
  } catch (error) {
    console.error('[getChallengeId] Exception:', error);
    throw error;
  }
}
