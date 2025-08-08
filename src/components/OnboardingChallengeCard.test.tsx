import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { OnboardingChallengeCard } from './OnboardingChallengeCard';

// Mock the UI components since they're from external libraries
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>{children}</div>
  ),
  CardDescription: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-description" className={className}>{children}</div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-header" className={className}>{children}</div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h2 data-testid="card-title" className={className}>{children}</h2>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, asChild, className, ...props }: { 
    children: React.ReactNode; 
    asChild?: boolean; 
    className?: string;
    size?: string;
  }) => {
    if (asChild) {
      return <>{children}</>;
    }
    return <button data-testid="button" className={className} {...props}>{children}</button>;
  },
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span data-testid="badge" className={className}>{children}</span>
  ),
}));

jest.mock('lucide-react', () => ({
  PlayCircle: () => <svg data-testid="play-circle-icon" />,
  Sparkles: () => <svg data-testid="sparkles-icon" />,
}));

// Wrapper component to provide Router context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('OnboardingChallengeCard', () => {
  const mockOnHide = jest.fn();
  const mockProps = {
    title: 'Test Onboarding Title',
    description: 'Test onboarding description for the component.',
    onHide: mockOnHide
  };

  beforeEach(() => {
    mockOnHide.mockClear();
  });

  it('renders the component with all required elements', () => {
    render(
      <TestWrapper>
        <OnboardingChallengeCard {...mockProps} />
      </TestWrapper>
    );

    // Assert that the title is present
    expect(screen.getByText('Test Onboarding Title')).toBeInTheDocument();

    // Assert that the description is present
    expect(screen.getByText('Test onboarding description for the component.')).toBeInTheDocument();

    // Assert that the "Start Here" banner is present
    expect(screen.getByText('Start Here')).toBeInTheDocument();

    // Assert that the "Start Tutorial" button is present
    expect(screen.getByText('Start Tutorial')).toBeInTheDocument();
  });

  it('renders the Start Here badge with correct styling', () => {
    render(
      <TestWrapper>
        <OnboardingChallengeCard {...mockProps} />
      </TestWrapper>
    );

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-gradient-to-r', 'from-yellow-400', 'to-orange-400', 'text-black', 'font-bold');
  });

  it('renders the Start Tutorial button as a link to onboarding step 1', () => {
    render(
      <TestWrapper>
        <OnboardingChallengeCard {...mockProps} />
      </TestWrapper>
    );

    const link = screen.getByRole('link', { name: /start tutorial/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/onboarding/1');
  });

  it('displays additional information about the tutorial', () => {
    render(
      <TestWrapper>
        <OnboardingChallengeCard {...mockProps} />
      </TestWrapper>
    );

    // Assert that step count is shown
    expect(screen.getByText('3 Interactive Steps')).toBeInTheDocument();

    // Assert that XP reward is shown
    expect(screen.getByText('500 XP Reward')).toBeInTheDocument();
  });

  it('has gradient background styling', () => {
    render(
      <TestWrapper>
        <OnboardingChallengeCard {...mockProps} />
      </TestWrapper>
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-gradient-to-br', 'from-purple-600', 'via-blue-600', 'to-indigo-700');
  });

  it('renders with custom title and description props', () => {
    const customProps = {
      title: 'Custom Title',
      description: 'Custom description text',
      onHide: mockOnHide
    };

    render(
      <TestWrapper>
        <OnboardingChallengeCard {...customProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom description text')).toBeInTheDocument();
  });
});
