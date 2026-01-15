// src/pages/__tests__/ChallengeDetailPage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChallengeDetailPage } from '../ChallengeDetailPage';

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'test-copilot-challenge' }),
  };
});

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  toast: () => {},
}));

// Mock Supabase with proper async
const mockSelect = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    single: vi.fn().mockResolvedValue({
      data: {
        id: 'test-copilot-challenge',
        title: 'GitHub Copilot Code Snippet Generator',
        description: 'Use GitHub Copilot to generate a function...',
        difficulty: 'beginner',
        suggested_tools: 'GitHub Copilot, Replit',
        estimated_time: '30 min',
        xp_reward: 100,
        requirements: 'Must use GitHub Copilot',
        challenge_type: 'standard',
        image: null,
      },
      error: null,
    }),
  }),
});

const mockSelectSubmissions = vi.fn().mockReturnValue({
  eq: vi.fn().mockResolvedValue({
    data: [],
    error: null,
  }),
});

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'challenges') {
        return { select: mockSelect };
      }
      if (table === 'submissions') {
        return { select: mockSelectSubmissions };
      }
      return {};
    }),
  },
}));

describe('ChallengeDetailPage - GitHub Copilot Challenge', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <BrowserRouter>
        <ChallengeDetailPage />
      </BrowserRouter>
    );

    expect(container).toBeTruthy();
  });

  it('displays loading state initially', () => {
    const { getByText } = render(
      <BrowserRouter>
        <ChallengeDetailPage />
      </BrowserRouter>
    );

    expect(getByText(/loading challenge/i)).toBeInTheDocument();
  });
});