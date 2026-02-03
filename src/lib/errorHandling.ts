import { PostgrestError } from '@supabase/supabase-js';

/**
 * User-friendly error messages for common Supabase/Postgres errors
 */
export const ERROR_MESSAGES = {
  // Authentication errors
  'Invalid login credentials': 'The email or password you entered is incorrect. Please try again.',
  'Email not confirmed': 'Please verify your email address before signing in.',
  'User already registered': 'An account with this email already exists. Try signing in instead.',

  // Database errors
  '23505': 'This record already exists.',
  '23503': 'Cannot complete this action because it would affect related data.',
  '23502': 'Required information is missing.',
  'PGRST116': 'No data found.',

  // Network errors
  'Failed to fetch': 'Unable to connect to the server. Please check your internet connection.',
  'NetworkError': 'Network error. Please check your connection and try again.',

  // Permission errors
  'JWT expired': 'Your session has expired. Please sign in again.',
  'insufficient_privilege': 'You don\'t have permission to perform this action.',

  // Generic fallback
  'default': 'Something went wrong. Please try again.',
};

/**
 * Extract a user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  // Handle null/undefined
  if (!error) {
    return ERROR_MESSAGES.default;
  }

  // Handle PostgrestError from Supabase
  if (isPostgrestError(error)) {
    // Check for specific error codes
    if (error.code && ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES]) {
      return ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES];
    }

    // Check error message patterns
    if (error.message) {
      // Check if message matches known patterns
      for (const [pattern, message] of Object.entries(ERROR_MESSAGES)) {
        if (error.message.includes(pattern)) {
          return message;
        }
      }
    }

    return error.message || ERROR_MESSAGES.default;
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    // Check for network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return ERROR_MESSAGES['Failed to fetch'];
    }

    // Check for known error messages
    for (const [pattern, message] of Object.entries(ERROR_MESSAGES)) {
      if (error.message.toLowerCase().includes(pattern.toLowerCase())) {
        return message;
      }
    }

    return error.message || ERROR_MESSAGES.default;
  }

  // Handle string errors
  if (typeof error === 'string') {
    // Check for known patterns
    for (const [pattern, message] of Object.entries(ERROR_MESSAGES)) {
      if (error.toLowerCase().includes(pattern.toLowerCase())) {
        return message;
      }
    }
    return error;
  }

  // Handle objects with message property
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const msg = String((error as { message: unknown }).message);
    for (const [pattern, message] of Object.entries(ERROR_MESSAGES)) {
      if (msg.toLowerCase().includes(pattern.toLowerCase())) {
        return message;
      }
    }
    return msg;
  }

  return ERROR_MESSAGES.default;
}

/**
 * Type guard for PostgrestError
 */
function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  );
}

/**
 * Log error details for debugging while showing user-friendly message
 */
export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString();
  const contextMsg = context ? `[${context}]` : '';

  console.error(`${timestamp} ${contextMsg} Error:`, error);

  // Log additional details for Postgrest errors
  if (isPostgrestError(error)) {
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
  }
}

/**
 * Handle an error and return a user-friendly message
 * Also logs the error for debugging
 */
export function handleError(error: unknown, context?: string): string {
  logError(error, context);
  return getErrorMessage(error);
}

/**
 * Common error scenarios with specific messages
 */
export const SCENARIO_ERRORS = {
  authentication: {
    loginFailed: 'Unable to sign in. Please check your credentials and try again.',
    signupFailed: 'Unable to create your account. Please try again.',
    logoutFailed: 'Unable to sign out. Please refresh the page.',
    sessionExpired: 'Your session has expired. Please sign in again.',
  },

  challenges: {
    loadFailed: 'Unable to load challenges. Please refresh the page.',
    createFailed: 'Unable to create challenge. Please try again.',
    updateFailed: 'Unable to update challenge. Please try again.',
    deleteFailed: 'Unable to delete challenge. Please try again.',
    submitFailed: 'Unable to submit your solution. Please try again.',
  },

  pathways: {
    loadFailed: 'Unable to load pathways. Please refresh the page.',
    enrollFailed: 'Unable to enroll in this pathway. Please try again.',
    progressFailed: 'Unable to update your progress. Please try again.',
  },

  profile: {
    loadFailed: 'Unable to load profile. Please refresh the page.',
    updateFailed: 'Unable to update profile. Please try again.',
    avatarUploadFailed: 'Unable to upload avatar. Please try a smaller image.',
  },

  ai: {
    generateFailed: 'Unable to generate content. Please try again.',
    rateLimitExceeded: 'You\'ve reached your limit of AI requests. Please try again later.',
    validationFailed: 'The generated content didn\'t meet our quality standards. Please try again.',
  },
};
