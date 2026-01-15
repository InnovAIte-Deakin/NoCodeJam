import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import OnboardingStepPage from '../onboarding/[step]';

// Mock the router
const mockNavigate = vi.fn();
const mockParams = { step: '1' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => mockParams,
    useNavigate: () => mockNavigate,
  };
});

// Mock Supabase client
const mockInvoke = vi.fn();
const mockGetSession = vi.fn();

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    functions: {
      invoke: mockInvoke,
    },
    auth: {
      getSession: mockGetSession,
    },
  },
}));

// Mock the OnboardingProgressBar component
vi.mock('@/components/OnboardingProgressBar', () => ({
  OnboardingProgressBar: ({ latestCompletedStep, totalSteps }: { latestCompletedStep: number; totalSteps: number }) => (
    <div data-testid="progress-bar">
      Progress: {latestCompletedStep}/{totalSteps}
    </div>
  ),
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  ChevronLeft: () => <div data-testid="chevron-left">←</div>,
  ChevronRight: () => <div data-testid="chevron-right">→</div>,
  Loader2: ({ className }: { className?: string }) => <div data-testid="loader" className={className}>Loading</div>,
  AlertCircle: ({ className }: { className?: string }) => <div data-testid="alert-circle" className={className}>!</div>,
}));

// Mock data
const mockSteps = [
  {
    id: 1,
    step_number: 1,
    title: 'Welcome to NoCodeJam',
    description: 'Learn the basics of no-code development',
    prompt_instructions: 'Follow these instructions to get started...',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    step_number: 2,
    title: 'Building Your First App',
    description: 'Create a simple application using no-code tools',
    prompt_instructions: 'Use the drag-and-drop interface...',
    video_url: 'https://youtu.be/example123',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    step_number: 3,
    title: 'Publishing Your App',
    description: 'Deploy your application to the web',
    prompt_instructions: 'Click the publish button...',
    video_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockSession = {
  access_token: 'fake-token',
  user: { id: 'user-123' },
};

// Wrapper component for router context
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('OnboardingStepPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null });
    mockInvoke.mockResolvedValue({ data: { steps: mockSteps }, error: null });
  });

  describe('Data Fetching', () => {
    it('shows loading state initially', () => {
      renderWithRouter(<OnboardingStepPage />);
      
      expect(screen.getByTestId('loader')).toBeInTheDocument();
      expect(screen.getByText('Loading Onboarding Steps...')).toBeInTheDocument();
    });

    it('fetches onboarding steps on mount', async () => {
      renderWithRouter(<OnboardingStepPage />);
      
      await waitFor(() => {
        expect(mockGetSession).toHaveBeenCalled();
        expect(mockInvoke).toHaveBeenCalledWith('get-onboarding-steps', {
          headers: {
            Authorization: 'Bearer fake-token',
          },
        });
      });
    });

    it('displays step content after successful data fetch', async () => {
      renderWithRouter(<OnboardingStepPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome to NoCodeJam')).toBeInTheDocument();
        expect(screen.getByText('Learn the basics of no-code development')).toBeInTheDocument();
        expect(screen.getByText('Follow these instructions to get started...')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error state when session fetch fails', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null }, error: { message: 'Auth error' } });
      
      renderWithRouter(<OnboardingStepPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('alert-circle')).toBeInTheDocument();
        expect(screen.getByText('Unable to Load Content')).toBeInTheDocument();
        expect(screen.getByText('Authentication required')).toBeInTheDocument();
      });
    });

    it('displays error state when function call fails', async () => {
      mockInvoke.mockResolvedValue({ data: null, error: { message: 'Function error' } });
      
      renderWithRouter(<OnboardingStepPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Function error')).toBeInTheDocument();
      });
    });

    it('displays step not found when step does not exist', async () => {
      mockParams.step = '99';
      
      renderWithRouter(<OnboardingStepPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Step Not Found')).toBeInTheDocument();
        expect(screen.getByText('Step 99 doesn\'t exist. Please check the URL or go back to step 1.')).toBeInTheDocument();
      });
    });
  });

  describe('Step Content Display', () => {
    beforeEach(async () => {
      mockParams.step = '1';
    });

    it('displays YouTube video when video_url is provided', async () => {
      renderWithRouter(<OnboardingStepPage />);
      
      await waitFor(() => {
        const iframe = screen.getByTitle('Welcome to NoCodeJam');
        expect(iframe).toBeInTheDocument();
        expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/dQw4w9WgXcQ');
      });
    });

    it('handles different YouTube URL formats', async () => {
      mockParams.step = '2';
      
      renderWithRouter(<OnboardingStepPage />);
      
      await waitFor(() => {
        const iframe = screen.getByTitle('Building Your First App');
        expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/example123');
      });
    });

    it('shows fallback when video URL is invalid format', async () => {
      const stepsWithInvalidVideo = [...mockSteps];
      stepsWithInvalidVideo[0].video_url = 'https://example.com/not-youtube';
      mockInvoke.mockResolvedValue({ data: { steps: stepsWithInvalidVideo }, error: null });
      
      renderWithRouter(<OnboardingStepPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Video URL format not supported.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'View video here' })).toBeInTheDocument();
      });
    });

    it('does not show video section when video_url is null', async () => {
      mockParams.step = '3';
      
      renderWithRouter(<OnboardingStepPage />);
      
      await waitFor(() => {
        expect(screen.queryByTitle('Publishing Your App')).not.toBeInTheDocument();
        expect(screen.getByText('Publishing Your App')).toBeInTheDocument(); // title should still show
      });
    });

    it('displays instructions in formatted section', async () => {
      renderWithRouter(<OnboardingStepPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Instructions')).toBeInTheDocument();
        expect(screen.getByText('Follow these instructions to get started...')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(async () => {
      mockParams.step = '2';
    });

    it('renders navigation buttons with correct states', async () => {
      renderWithRouter(<OnboardingStepPage />);
      
      await waitFor(() => {
        const previousButton = screen.getByRole('button', { name: /previous/i });
        const nextButton = screen.getByRole('button', { name: /next/i });
        
        expect(previousButton).not.toBeDisabled();
        expect(nextButton).not.toBeDisabled();
      });
    });

    it('disables Previous button on first step', async () => {
      mockParams.step = '1';
      
      renderWithRouter(<OnboardingStepPage />);
      
      await waitFor(() => {
        const previousButton = screen.getByRole('button', { name: /previous/i });
        expect(previousButton).toBeDisabled();
      });
    });

    it('disables Next button on last step', async () => {
      mockParams.step = '3';
      
      renderWithRouter(<OnboardingStepPage />);
      
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /next/i });
        expect(nextButton).toBeDisabled();
      });
    });

    it('navigates to previous step when Previous button is clicked', async () => {
      renderWithRouter(<OnboardingStepPage />);
      
      await waitFor(() => {
        const previousButton = screen.getByRole('button', { name: /previous/i });
        fireEvent.click(previousButton);
        expect(mockNavigate).toHaveBeenCalledWith('/onboarding/1');
      });
    });

    it('navigates to next step when Next button is clicked', async () => {
      renderWithRouter(<OnboardingStepPage />);
      
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextButton);
        expect(mockNavigate).toHaveBeenCalledWith('/onboarding/3');
      });
    });
  });

  describe('Progress Tracking', () => {
    it('displays correct progress information', async () => {
      mockParams.step = '2';
      
      renderWithRouter(<OnboardingStepPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('progress-bar')).toHaveTextContent('Progress: 2/3');
        expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
      });
    });

    it('does not show progress bar while loading', () => {
      renderWithRouter(<OnboardingStepPage />);
      
      expect(screen.queryByTestId('progress-bar')).not.toBeInTheDocument();
    });
  });

  describe('Help Links', () => {
    it('renders help links in footer when content is loaded', async () => {
      renderWithRouter(<OnboardingStepPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /learning resources/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /contact support/i })).toBeInTheDocument();
      });
    });

    it('does not show footer while loading', () => {
      renderWithRouter(<OnboardingStepPage />);
      
      expect(screen.queryByRole('link', { name: /learning resources/i })).not.toBeInTheDocument();
    });
  });
});
