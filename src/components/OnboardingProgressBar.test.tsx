import React from 'react';
import { render, screen } from '@testing-library/react';
import { OnboardingProgressBar } from './OnboardingProgressBar';

describe('OnboardingProgressBar', () => {
  it('renders the correct step text', () => {
    render(<OnboardingProgressBar latestCompletedStep={1} totalSteps={3} />);
    
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
  });

  it('calculates progress bar width correctly', () => {
    render(<OnboardingProgressBar latestCompletedStep={2} totalSteps={4} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle('width: 50%');
  });

  it('handles first step correctly', () => {
    render(<OnboardingProgressBar latestCompletedStep={0} totalSteps={3} />);
    
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle('width: 0%');
  });

  it('handles last step correctly', () => {
    render(<OnboardingProgressBar latestCompletedStep={3} totalSteps={3} />);
    
    expect(screen.getByText('Step 4 of 3')).toBeInTheDocument();
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle('width: 100%');
  });

  it('renders correct number of step indicators', () => {
    render(<OnboardingProgressBar latestCompletedStep={2} totalSteps={5} />);
    
    // Should render 5 step indicators (circles)
    const stepIndicators = screen.getAllByText(/^[1-5]$/);
    expect(stepIndicators).toHaveLength(3); // 3 numbered indicators + 2 checkmarks
  });

  it('shows completed steps with checkmarks', () => {
    render(<OnboardingProgressBar latestCompletedStep={3} totalSteps={5} />);
    
    // Should have checkmarks for completed steps (1, 2, and 3)
    const checkmarks = screen.container.querySelectorAll('svg');
    expect(checkmarks).toHaveLength(3);
  });

  it('highlights the current step', () => {
    render(<OnboardingProgressBar latestCompletedStep={1} totalSteps={3} />);
    
    const currentStepElement = screen.getByText('2');
    expect(currentStepElement).toHaveClass('bg-purple-500', 'text-white', 'ring-2', 'ring-purple-200');
  });

  it('has proper accessibility attributes', () => {
    render(<OnboardingProgressBar latestCompletedStep={2} totalSteps={3} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '2');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '3');
    expect(progressBar).toHaveAttribute('aria-label', 'Completed 2 of 3 steps');
  });

  it('handles edge case where latestCompletedStep exceeds totalSteps', () => {
    render(<OnboardingProgressBar latestCompletedStep={5} totalSteps={3} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle('width: 100%'); // Should cap at 100%
  });
});
