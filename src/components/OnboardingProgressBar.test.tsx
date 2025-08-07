import React from 'react';
import { render, screen } from '@testing-library/react';
import { OnboardingProgressBar } from './OnboardingProgressBar';

describe('OnboardingProgressBar', () => {
  it('renders the correct step text', () => {
    render(<OnboardingProgressBar currentStep={2} totalSteps={3} />);
    
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
  });

  it('calculates progress bar width correctly', () => {
    render(<OnboardingProgressBar currentStep={2} totalSteps={4} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle('width: 50%');
  });

  it('handles first step correctly', () => {
    render(<OnboardingProgressBar currentStep={1} totalSteps={3} />);
    
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle('width: 33.333333333333336%');
  });

  it('handles last step correctly', () => {
    render(<OnboardingProgressBar currentStep={3} totalSteps={3} />);
    
    expect(screen.getByText('Step 3 of 3')).toBeInTheDocument();
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle('width: 100%');
  });

  it('renders correct number of step indicators', () => {
    render(<OnboardingProgressBar currentStep={2} totalSteps={5} />);
    
    // Should render 5 step indicators (circles)
    const stepIndicators = screen.getAllByText(/^[1-5]$/);
    expect(stepIndicators).toHaveLength(4); // 4 numbered indicators + 1 checkmark
  });

  it('shows completed steps with checkmarks', () => {
    render(<OnboardingProgressBar currentStep={3} totalSteps={5} />);
    
    // Should have checkmarks for completed steps (1 and 2)
    const checkmarks = screen.container.querySelectorAll('svg');
    expect(checkmarks).toHaveLength(2);
  });

  it('highlights the current step', () => {
    render(<OnboardingProgressBar currentStep={2} totalSteps={3} />);
    
    const currentStepElement = screen.getByText('2');
    expect(currentStepElement).toHaveClass('bg-purple-500', 'text-white', 'ring-2', 'ring-purple-200');
  });

  it('has proper accessibility attributes', () => {
    render(<OnboardingProgressBar currentStep={2} totalSteps={3} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '2');
    expect(progressBar).toHaveAttribute('aria-valuemin', '1');
    expect(progressBar).toHaveAttribute('aria-valuemax', '3');
    expect(progressBar).toHaveAttribute('aria-label', 'Step 2 of 3');
  });

  it('handles edge case where currentStep exceeds totalSteps', () => {
    render(<OnboardingProgressBar currentStep={5} totalSteps={3} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle('width: 100%'); // Should cap at 100%
  });
});
