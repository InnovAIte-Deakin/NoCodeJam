import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OnboardingStepPage from '../src/pages/onboarding/[step]';

// Mock Supabase client
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
  },
  functions: {
    invoke: vi.fn(),
  },
};

vi.mock('../src/lib/supabaseClient', () => ({
  supabase: mockSupabase,
}));

// Mock router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ step: '3' }), // Testing the last step
  };
});

// Mock components
vi.mock('../src/components/OnboardingProgressBar', () => ({
  OnboardingProgressBar: ({ latestCompletedStep, totalSteps }: any) => (
    <div data-testid="progress-bar">
      Step {latestCompletedStep + 1} of {totalSteps}
    </div>
  ),
}));

vi.mock('../src/components/OnboardingSubmissionForm', () => ({
  OnboardingSubmissionForm: ({ onSubmit, isSubmitting, isSubmitted }: any) => (
    <div data-testid="submission-form">
      <button
        onClick={() => onSubmit({ text: 'Test submission' })}
        disabled={isSubmitting || isSubmitted}
        data-testid="submit-button"
      >
        {isSubmitting ? 'Submitting...' : isSubmitted ? 'Submitted' : 'Submit'}
      </button>
    </div>
  ),
}));

vi.mock('../src/components/OnboardingCompleteScreen', () => ({
  OnboardingCompleteScreen: ({ challengeTitle, totalSteps }: any) => (
    <div data-testid="completion-screen">
      <h1>Onboarding Complete!</h1>
      <p>Challenge: {challengeTitle}</p>
      <p>Total Steps: {totalSteps}</p>
    </div>
  ),
}));

// Wrapper component for routing
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('OnboardingStepPage - Completion Flow', () => {
  const mockSession = {
    access_token: 'mock-token',
    user: { id: 'user-123' },
  };

  const mockSteps = [
    {
      id: 1,
      step_number: 1,
      title: 'Step 1',
      description: 'First step',
      prompt_instructions: 'Do this',
      video_url: null,
      submission_type: 'text',
      submission_label: 'Enter text',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: 2,
      step_number: 2,
      title: 'Step 2',
      description: 'Second step',
      prompt_instructions: 'Do that',
      video_url: null,
      submission_type: 'url',
      submission_label: 'Enter URL',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: 3,
      step_number: 3,
      title: 'Final Step',
      description: 'Last step',
      prompt_instructions: 'Complete the challenge',
      video_url: null,
      submission_type: 'text',
      submission_label: 'Final submission',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  ];

  const mockProgress = {
    completedStepIds: [1, 2], // First two steps completed
    highestCompletedStep: 2,
    currentStepNumber: 3,
    challengeId: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful session
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    // Mock successful steps fetch
    mockSupabase.functions.invoke.mockImplementation((functionName) => {
      if (functionName === 'get-onboarding-steps') {
        return Promise.resolve({
          data: { steps: mockSteps },
          error: null,
        });
      }
      if (functionName === 'get-onboarding-progress') {
        return Promise.resolve({
          data: mockProgress,
          error: null,
        });
      }
      if (functionName === 'submit-onboarding-step') {
        return Promise.resolve({
          data: { success: true, submissionId: 123 },
          error: null,
        });
      }
      if (functionName === 'complete-onboarding') {
        return Promise.resolve({
          data: { success: true, masterSubmissionId: 456 },
          error: null,
        });
      }
      return Promise.resolve({ data: null, error: null });
    });
  });

  describe('Final Step Completion', () => {
    it('triggers completion flow when last step is submitted', async () => {
      render(
        <RouterWrapper>
          <OnboardingStepPage />
        </RouterWrapper>
      );

      // Wait for the component to load
      await waitFor(() => {
        expect(screen.getByText('Final Step')).toBeInTheDocument();
      });

      // Submit the final step
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Wait for completion to trigger
      await waitFor(() => {
        expect(mockSupabase.functions.invoke).toHaveBeenCalledWith(
          'submit-onboarding-step',
          expect.objectContaining({
            body: {
              challengeId: 1,
              stepId: 3,
              submissionData: { text: 'Test submission' },
            },
          })
        );
      });

      // Should also call complete-onboarding
      await waitFor(() => {
        expect(mockSupabase.functions.invoke).toHaveBeenCalledWith(
          'complete-onboarding',
          expect.objectContaining({
            body: {
              challengeId: 1,
            },
          })
        );
      });
    });

    it('shows completion screen after successful completion', async () => {
      render(
        <RouterWrapper>
          <OnboardingStepPage />
        </RouterWrapper>
      );

      // Wait for the component to load
      await waitFor(() => {
        expect(screen.getByText('Final Step')).toBeInTheDocument();
      });

      // Submit the final step
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Wait for completion screen to appear
      await waitFor(() => {
        expect(screen.getByTestId('completion-screen')).toBeInTheDocument();
        expect(screen.getByText('Onboarding Complete!')).toBeInTheDocument();
      });
    });

    it('passes correct props to completion screen', async () => {
      render(
        <RouterWrapper>
          <OnboardingStepPage />
        </RouterWrapper>
      );

      // Wait for the component to load
      await waitFor(() => {
        expect(screen.getByText('Final Step')).toBeInTheDocument();
      });

      // Submit the final step
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Wait for completion screen with correct props
      await waitFor(() => {
        expect(screen.getByText('Challenge: NoCodeJam Onboarding')).toBeInTheDocument();
        expect(screen.getByText('Total Steps: 3')).toBeInTheDocument();
      });
    });
  });

  describe('Completion Error Handling', () => {
    it('handles completion API errors gracefully', async () => {
      // Mock completion failure
      mockSupabase.functions.invoke.mockImplementation((functionName) => {
        if (functionName === 'get-onboarding-steps') {
          return Promise.resolve({
            data: { steps: mockSteps },
            error: null,
          });
        }
        if (functionName === 'get-onboarding-progress') {
          return Promise.resolve({
            data: mockProgress,
            error: null,
          });
        }
        if (functionName === 'submit-onboarding-step') {
          return Promise.resolve({
            data: { success: true },
            error: null,
          });
        }
        if (functionName === 'complete-onboarding') {
          return Promise.resolve({
            data: null,
            error: { message: 'Completion failed' },
          });
        }
        return Promise.resolve({ data: null, error: null });
      });

      render(
        <RouterWrapper>
          <OnboardingStepPage />
        </RouterWrapper>
      );

      // Wait for the component to load
      await waitFor(() => {
        expect(screen.getByText('Final Step')).toBeInTheDocument();
      });

      // Submit the final step
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Should show completion error
      await waitFor(() => {
        expect(screen.getByText('Completion Error')).toBeInTheDocument();
        expect(screen.getByText('Completion failed')).toBeInTheDocument();
      });

      // Should not show completion screen
      expect(screen.queryByTestId('completion-screen')).not.toBeInTheDocument();
    });

    it('shows completion loading state', async () => {
      // Mock slow completion
      mockSupabase.functions.invoke.mockImplementation((functionName) => {
        if (functionName === 'get-onboarding-steps') {
          return Promise.resolve({
            data: { steps: mockSteps },
            error: null,
          });
        }
        if (functionName === 'get-onboarding-progress') {
          return Promise.resolve({
            data: mockProgress,
            error: null,
          });
        }
        if (functionName === 'submit-onboarding-step') {
          return Promise.resolve({
            data: { success: true },
            error: null,
          });
        }
        if (functionName === 'complete-onboarding') {
          // Return a never-resolving promise to test loading state
          return new Promise(() => {});
        }
        return Promise.resolve({ data: null, error: null });
      });

      render(
        <RouterWrapper>
          <OnboardingStepPage />
        </RouterWrapper>
      );

      // Wait for the component to load
      await waitFor(() => {
        expect(screen.getByText('Final Step')).toBeInTheDocument();
      });

      // Submit the final step
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Should show completion loading state
      await waitFor(() => {
        expect(screen.getByText('Completing Onboarding...')).toBeInTheDocument();
        expect(screen.getByText(/Please wait while we finalize/)).toBeInTheDocument();
      });
    });
  });

  describe('Non-Final Steps', () => {
    beforeEach(() => {
      // Mock being on step 2 instead of step 3
      vi.mocked(require('react-router-dom').useParams).mockReturnValue({ step: '2' });
      
      // Update progress to reflect being on step 2
      mockSupabase.functions.invoke.mockImplementation((functionName) => {
        if (functionName === 'get-onboarding-steps') {
          return Promise.resolve({
            data: { steps: mockSteps },
            error: null,
          });
        }
        if (functionName === 'get-onboarding-progress') {
          return Promise.resolve({
            data: {
              ...mockProgress,
              completedStepIds: [1],
              currentStepNumber: 2,
            },
            error: null,
          });
        }
        if (functionName === 'submit-onboarding-step') {
          return Promise.resolve({
            data: { success: true },
            error: null,
          });
        }
        return Promise.resolve({ data: null, error: null });
      });
    });

    it('does not trigger completion for non-final steps', async () => {
      render(
        <RouterWrapper>
          <OnboardingStepPage />
        </RouterWrapper>
      );

      // Wait for the component to load
      await waitFor(() => {
        expect(screen.getByText('Second step')).toBeInTheDocument();
      });

      // Submit a non-final step
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Should submit the step but not call completion
      await waitFor(() => {
        expect(mockSupabase.functions.invoke).toHaveBeenCalledWith(
          'submit-onboarding-step',
          expect.anything()
        );
      });

      // Should not call complete-onboarding
      expect(mockSupabase.functions.invoke).not.toHaveBeenCalledWith(
        'complete-onboarding',
        expect.anything()
      );

      // Should not show completion screen
      expect(screen.queryByTestId('completion-screen')).not.toBeInTheDocument();
    });
  });

  describe('Submission Loading States', () => {
    it('disables form during completion process', async () => {
      render(
        <RouterWrapper>
          <OnboardingStepPage />
        </RouterWrapper>
      );

      // Wait for the component to load
      await waitFor(() => {
        expect(screen.getByText('Final Step')).toBeInTheDocument();
      });

      // Mock slow completion for testing loading state
      mockSupabase.functions.invoke.mockImplementation((functionName) => {
        if (functionName === 'complete-onboarding') {
          return new Promise((resolve) => {
            setTimeout(() => resolve({ data: { success: true }, error: null }), 100);
          });
        }
        return Promise.resolve({ data: { success: true }, error: null });
      });

      // Submit the final step
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Button should be disabled during completion
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });
});
