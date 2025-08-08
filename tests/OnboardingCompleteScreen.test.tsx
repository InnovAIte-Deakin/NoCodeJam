import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { OnboardingCompleteScreen } from '../src/components/OnboardingCompleteScreen';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Wrapper component for routing
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('OnboardingCompleteScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders the success message and confetti emoji', () => {
      render(
        <RouterWrapper>
          <OnboardingCompleteScreen />
        </RouterWrapper>
      );

      expect(screen.getByText('🎉 Congratulations!')).toBeInTheDocument();
      expect(screen.getByText("You've completed the onboarding!")).toBeInTheDocument();
    });

    it('displays the challenge title and step count', () => {
      render(
        <RouterWrapper>
          <OnboardingCompleteScreen 
            challengeTitle="Custom Challenge" 
            totalSteps={5} 
          />
        </RouterWrapper>
      );

      expect(screen.getByText(/Custom Challenge/)).toBeInTheDocument();
      expect(screen.getByText(/all 5 steps/)).toBeInTheDocument();
    });

    it('uses default values when props are not provided', () => {
      render(
        <RouterWrapper>
          <OnboardingCompleteScreen />
        </RouterWrapper>
      );

      expect(screen.getByText(/NoCodeJam Onboarding/)).toBeInTheDocument();
      expect(screen.getByText(/all 3 steps/)).toBeInTheDocument();
    });
  });

  describe('Achievement Display', () => {
    it('shows all achievement items', () => {
      render(
        <RouterWrapper>
          <OnboardingCompleteScreen totalSteps={4} />
        </RouterWrapper>
      );

      expect(screen.getByText('Completed 4 tutorial steps')).toBeInTheDocument();
      expect(screen.getByText('Submitted all required work')).toBeInTheDocument();
      expect(screen.getByText('Learned no-code fundamentals')).toBeInTheDocument();
      expect(screen.getByText('Ready for challenges')).toBeInTheDocument();
    });

    it('displays the "What You\'ve Accomplished" section', () => {
      render(
        <RouterWrapper>
          <OnboardingCompleteScreen />
        </RouterWrapper>
      );

      expect(screen.getByText("What You've Accomplished")).toBeInTheDocument();
    });
  });

  describe('Navigation Buttons', () => {
    it('renders both navigation buttons', () => {
      render(
        <RouterWrapper>
          <OnboardingCompleteScreen />
        </RouterWrapper>
      );

      const dashboardButton = screen.getByRole('link', { name: /Go to Dashboard/i });
      const challengesButton = screen.getByRole('link', { name: /Browse More Challenges/i });

      expect(dashboardButton).toBeInTheDocument();
      expect(challengesButton).toBeInTheDocument();
    });

    it('has correct links for navigation buttons', () => {
      render(
        <RouterWrapper>
          <OnboardingCompleteScreen />
        </RouterWrapper>
      );

      const dashboardButton = screen.getByRole('link', { name: /Go to Dashboard/i });
      const challengesButton = screen.getByRole('link', { name: /Browse More Challenges/i });

      expect(dashboardButton).toHaveAttribute('href', '/dashboard');
      expect(challengesButton).toHaveAttribute('href', '/challenges');
    });
  });

  describe('Visual Elements', () => {
    it('displays success and trophy icons', () => {
      render(
        <RouterWrapper>
          <OnboardingCompleteScreen />
        </RouterWrapper>
      );

      // Check for icon containers (we can't directly test for Lucide icons in JSDOM)
      const iconContainers = document.querySelectorAll('.w-16.h-16, .w-8.h-8');
      expect(iconContainers.length).toBeGreaterThan(0);
    });

    it('shows the next steps information', () => {
      render(
        <RouterWrapper>
          <OnboardingCompleteScreen />
        </RouterWrapper>
      );

      expect(screen.getByText("What's Next?")).toBeInTheDocument();
      expect(screen.getByText(/Your submission has been sent for admin review/)).toBeInTheDocument();
    });

    it('displays the welcome message', () => {
      render(
        <RouterWrapper>
          <OnboardingCompleteScreen />
        </RouterWrapper>
      );

      expect(screen.getByText('Welcome to the NoCodeJam community! 🚀')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(
        <RouterWrapper>
          <OnboardingCompleteScreen />
        </RouterWrapper>
      );

      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });
      const h3Elements = screen.getAllByRole('heading', { level: 3 });

      expect(h1).toHaveTextContent('🎉 Congratulations!');
      expect(h2).toHaveTextContent("You've completed the onboarding!");
      expect(h3Elements).toHaveLength(2); // "What You've Accomplished" and "What's Next?"
    });

    it('has accessible button and link labels', () => {
      render(
        <RouterWrapper>
          <OnboardingCompleteScreen />
        </RouterWrapper>
      );

      const dashboardLink = screen.getByRole('link', { name: /Go to Dashboard/i });
      const challengesLink = screen.getByRole('link', { name: /Browse More Challenges/i });

      expect(dashboardLink).toBeInTheDocument();
      expect(challengesLink).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('applies gradient background styling', () => {
      render(
        <RouterWrapper>
          <OnboardingCompleteScreen />
        </RouterWrapper>
      );

      const backgroundDiv = document.querySelector('.min-h-screen.bg-gradient-to-br');
      expect(backgroundDiv).toBeInTheDocument();
    });

    it('uses proper spacing and layout classes', () => {
      render(
        <RouterWrapper>
          <OnboardingCompleteScreen />
        </RouterWrapper>
      );

      // Check for key layout elements
      expect(document.querySelector('.max-w-2xl')).toBeInTheDocument();
      expect(document.querySelector('.shadow-2xl')).toBeInTheDocument();
      expect(document.querySelector('.backdrop-blur')).toBeInTheDocument();
    });
  });

  describe('Component Props', () => {
    it('handles undefined props gracefully', () => {
      render(
        <RouterWrapper>
          <OnboardingCompleteScreen 
            challengeTitle={undefined} 
            totalSteps={undefined} 
          />
        </RouterWrapper>
      );

      // Should still render with defaults
      expect(screen.getByText(/NoCodeJam Onboarding/)).toBeInTheDocument();
      expect(screen.getByText(/all 3 steps/)).toBeInTheDocument();
    });

    it('handles zero steps gracefully', () => {
      render(
        <RouterWrapper>
          <OnboardingCompleteScreen totalSteps={0} />
        </RouterWrapper>
      );

      expect(screen.getByText(/all 0 steps/)).toBeInTheDocument();
      expect(screen.getByText('Completed 0 tutorial steps')).toBeInTheDocument();
    });

    it('handles very large step counts', () => {
      render(
        <RouterWrapper>
          <OnboardingCompleteScreen totalSteps={100} />
        </RouterWrapper>
      );

      expect(screen.getByText(/all 100 steps/)).toBeInTheDocument();
      expect(screen.getByText('Completed 100 tutorial steps')).toBeInTheDocument();
    });
  });
});
