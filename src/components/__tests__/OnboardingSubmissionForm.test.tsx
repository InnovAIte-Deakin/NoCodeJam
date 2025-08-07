import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OnboardingSubmissionForm } from '../OnboardingSubmissionForm';

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  CheckCircle: ({ className }: { className?: string }) => <div data-testid="check-circle" className={className}>✓</div>,
  AlertCircle: ({ className }: { className?: string }) => <div data-testid="alert-circle" className={className}>!</div>,
  Loader2: ({ className }: { className?: string }) => <div data-testid="loader" className={className}>Loading</div>,
}));

describe('OnboardingSubmissionForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('URL Submission Type', () => {
    const defaultProps = {
      submissionType: 'url' as const,
      submissionLabel: 'Project URL',
      onSubmit: mockOnSubmit,
    };

    it('renders URL input when submissionType is url', () => {
      render(<OnboardingSubmissionForm {...defaultProps} />);
      
      const input = screen.getByLabelText('Project URL');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'url');
      expect(input).toHaveAttribute('placeholder', 'https://example.com');
    });

    it('shows URL helper text', () => {
      render(<OnboardingSubmissionForm {...defaultProps} />);
      
      expect(screen.getByText(/Please enter a valid URL starting with http/)).toBeInTheDocument();
    });

    it('validates URL format and shows error for invalid URL', async () => {
      render(<OnboardingSubmissionForm {...defaultProps} />);
      
      const input = screen.getByLabelText('Project URL');
      const submitButton = screen.getByRole('button', { name: /submit step/i });
      
      fireEvent.change(input, { target: { value: 'invalid-url' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('alert-circle')).toBeInTheDocument();
        expect(screen.getByText(/Please enter a valid URL/)).toBeInTheDocument();
      });
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('accepts valid URL and calls onSubmit with correct data', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      render(<OnboardingSubmissionForm {...defaultProps} />);
      
      const input = screen.getByLabelText('Project URL');
      const submitButton = screen.getByRole('button', { name: /submit step/i });
      
      fireEvent.change(input, { target: { value: 'https://example.com' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({ url: 'https://example.com' });
      });
    });

    it('trims whitespace from URL input', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      render(<OnboardingSubmissionForm {...defaultProps} />);
      
      const input = screen.getByLabelText('Project URL');
      const submitButton = screen.getByRole('button', { name: /submit step/i });
      
      fireEvent.change(input, { target: { value: '  https://example.com  ' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({ url: 'https://example.com' });
      });
    });
  });

  describe('Text Submission Type', () => {
    const defaultProps = {
      submissionType: 'text' as const,
      submissionLabel: 'Your Response',
      onSubmit: mockOnSubmit,
    };

    it('renders textarea when submissionType is text', () => {
      render(<OnboardingSubmissionForm {...defaultProps} />);
      
      const textarea = screen.getByLabelText('Your Response');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
      expect(textarea).toHaveAttribute('placeholder', 'Enter your response here...');
    });

    it('shows text helper text', () => {
      render(<OnboardingSubmissionForm {...defaultProps} />);
      
      expect(screen.getByText(/Provide your response or explanation/)).toBeInTheDocument();
    });

    it('validates minimum text length and shows error for short text', async () => {
      render(<OnboardingSubmissionForm {...defaultProps} />);
      
      const textarea = screen.getByLabelText('Your Response');
      const submitButton = screen.getByRole('button', { name: /submit step/i });
      
      fireEvent.change(textarea, { target: { value: 'Hi' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('alert-circle')).toBeInTheDocument();
        expect(screen.getByText(/Please provide at least 5 characters/)).toBeInTheDocument();
      });
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('accepts valid text and calls onSubmit with correct data', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      render(<OnboardingSubmissionForm {...defaultProps} />);
      
      const textarea = screen.getByLabelText('Your Response');
      const submitButton = screen.getByRole('button', { name: /submit step/i });
      
      const responseText = 'This is my detailed response to the step.';
      fireEvent.change(textarea, { target: { value: responseText } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({ text: responseText });
      });
    });

    it('trims whitespace from text input', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      render(<OnboardingSubmissionForm {...defaultProps} />);
      
      const textarea = screen.getByLabelText('Your Response');
      const submitButton = screen.getByRole('button', { name: /submit step/i });
      
      fireEvent.change(textarea, { target: { value: '  My response text  ' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({ text: 'My response text' });
      });
    });
  });

  describe('Form Validation', () => {
    const defaultProps = {
      submissionType: 'text' as const,
      submissionLabel: 'Test Label',
      onSubmit: mockOnSubmit,
    };

    it('shows required field error for empty input', async () => {
      render(<OnboardingSubmissionForm {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /submit step/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Test Label is required/)).toBeInTheDocument();
      });
    });

    it('clears validation error when input changes', async () => {
      render(<OnboardingSubmissionForm {...defaultProps} />);
      
      const textarea = screen.getByLabelText('Test Label');
      const submitButton = screen.getByRole('button', { name: /submit step/i });
      
      // Trigger validation error
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText(/Test Label is required/)).toBeInTheDocument();
      });
      
      // Change input to clear error
      fireEvent.change(textarea, { target: { value: 'Some text' } });
      
      expect(screen.queryByText(/Test Label is required/)).not.toBeInTheDocument();
    });

    it('disables submit button when input is empty', () => {
      render(<OnboardingSubmissionForm {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /submit step/i });
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when input has value', () => {
      render(<OnboardingSubmissionForm {...defaultProps} />);
      
      const textarea = screen.getByLabelText('Test Label');
      const submitButton = screen.getByRole('button', { name: /submit step/i });
      
      fireEvent.change(textarea, { target: { value: 'Some text' } });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Submission States', () => {
    const defaultProps = {
      submissionType: 'text' as const,
      submissionLabel: 'Test Label',
      onSubmit: mockOnSubmit,
    };

    it('shows loading state when isSubmitting is true', () => {
      render(<OnboardingSubmissionForm {...defaultProps} isSubmitting={true} />);
      
      expect(screen.getByTestId('loader')).toBeInTheDocument();
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
      
      const submitButton = screen.getByRole('button', { name: /submitting/i });
      expect(submitButton).toBeDisabled();
    });

    it('disables form inputs when isSubmitting is true', () => {
      render(<OnboardingSubmissionForm {...defaultProps} isSubmitting={true} />);
      
      const textarea = screen.getByLabelText('Test Label');
      expect(textarea).toBeDisabled();
    });

    it('shows success state when isSubmitted is true', () => {
      render(<OnboardingSubmissionForm {...defaultProps} isSubmitted={true} />);
      
      expect(screen.getByTestId('check-circle')).toBeInTheDocument();
      expect(screen.getByText('Step Completed!')).toBeInTheDocument();
      expect(screen.getByText('Your submission has been saved successfully.')).toBeInTheDocument();
    });

    it('does not show form when isSubmitted is true', () => {
      render(<OnboardingSubmissionForm {...defaultProps} isSubmitted={true} />);
      
      expect(screen.queryByLabelText('Test Label')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /submit step/i })).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    const defaultProps = {
      submissionType: 'text' as const,
      submissionLabel: 'Test Label',
      onSubmit: mockOnSubmit,
    };

    it('shows error message when onSubmit throws', async () => {
      mockOnSubmit.mockRejectedValue(new Error('Network error'));
      render(<OnboardingSubmissionForm {...defaultProps} />);
      
      const textarea = screen.getByLabelText('Test Label');
      const submitButton = screen.getByRole('button', { name: /submit step/i });
      
      fireEvent.change(textarea, { target: { value: 'Valid input text' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to submit. Please try again./)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    const defaultProps = {
      submissionType: 'url' as const,
      submissionLabel: 'Project URL',
      onSubmit: mockOnSubmit,
    };

    it('associates label with input correctly', () => {
      render(<OnboardingSubmissionForm {...defaultProps} />);
      
      const input = screen.getByLabelText('Project URL');
      expect(input).toHaveAttribute('id', 'submission-input');
    });

    it('uses aria-describedby for validation errors', async () => {
      render(<OnboardingSubmissionForm {...defaultProps} />);
      
      const input = screen.getByLabelText('Project URL');
      const submitButton = screen.getByRole('button', { name: /submit step/i });
      
      fireEvent.change(input, { target: { value: 'invalid' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-describedby', 'validation-error');
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });
});
