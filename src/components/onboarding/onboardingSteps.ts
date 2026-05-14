export type OnboardingPageKey = 'dashboard' | 'learn' | 'challenges' | 'leaderboard' | 'profile';

export interface OnboardingStep {
  target: string;
  title: string;
  description: string;
}

export const onboardingPageKeys: OnboardingPageKey[] = [
  'dashboard',
  'learn',
  'challenges',
  'leaderboard',
  'profile',
];

export const onboardingSteps: Record<OnboardingPageKey, OnboardingStep[]> = {
  dashboard: [
    {
      target: '#dashboard-welcome',
      title: 'Start From Your Home Base',
      description: 'Use the dashboard to get a quick read on your learning activity and where to jump in next.',
    },
    {
      target: '#xp-card',
      title: 'Track Your Progress',
      description: 'View your XP, completed challenges, and progress toward your next learning milestone.',
    },
    {
      target: '#recent-submissions-card',
      title: 'Review Recent Work',
      description: 'Check your latest challenge submissions, approval status, and feedback from reviewers.',
    },
    {
      target: '#dashboard-profile-card',
      title: 'Keep Your Profile Handy',
      description: 'Open your profile from here to update your details and review your public learning identity.',
    },
    {
      target: '#dashboard-badges-card',
      title: 'Celebrate Achievements',
      description: 'Badges highlight the skills and milestones you unlock as you complete more challenges.',
    },
  ],
  learn: [
    {
      target: '#learn-header',
      title: 'Explore Learning Tools',
      description: 'Browse no-code and AI platforms that can help you prototype, build, and ship faster.',
    },
    {
      target: '#learn-mode-buttons',
      title: 'Choose Your Browse Mode',
      description: 'Switch between a simple platform browser and guided filters for more targeted discovery.',
    },
    {
      target: '#learn-path-buttons',
      title: 'Shape Your Path',
      description: 'Use filters, AI assist, or learning pathways to narrow tools around your goals and skill level.',
    },
    {
      target: '#learn-platforms',
      title: 'Compare Platforms',
      description: 'Scan platform cards for difficulty, pricing, categories, and key features before diving deeper.',
    },
    {
      target: '#learn-selected-tool',
      title: 'Follow Tutorials',
      description: 'Open docs and tutorials from the selected tool details when you are ready to learn by doing.',
    },
  ],
  challenges: [
    {
      target: '#challenges-header',
      title: 'Find Practical Challenges',
      description: 'Challenges turn learning into buildable tasks, with XP and badges tied to completion.',
    },
    {
      target: '#challenge-request-button',
      title: 'Request New Challenges',
      description: 'Suggest a challenge when you spot a tool, workflow, or skill the platform should cover next.',
    },
    {
      target: '#challenge-filters-card',
      title: 'Filter The Challenge List',
      description: 'Search by topic or narrow by difficulty so you can pick the right next step.',
    },
    {
      target: '#challenge-grid',
      title: 'Start Building',
      description: 'Open a challenge card to read the requirements, submit your work, and earn XP.',
    },
  ],
  leaderboard: [
    {
      target: '#leaderboard-header',
      title: 'See The Community Race',
      description: 'The leaderboard shows how learners rank by XP across the NoCodeJam community.',
    },
    {
      target: '#top-10-card',
      title: 'Meet Top Builders',
      description: 'Top entries show rank, XP, completed challenges, badges, and recent rank movement.',
    },
    {
      target: '#leaderboard-list',
      title: 'Inspect Rankings',
      description: 'Select a profile from the rankings to learn from other builders and their progress.',
    },
    {
      target: '#leaderboard-stats',
      title: 'Track Shared Momentum',
      description: 'Community totals summarize XP, completed challenges, and badges earned across the platform.',
    },
  ],
  profile: [
    {
      target: '#profile-summary-card',
      title: 'Manage Your Identity',
      description: 'Update your avatar, username, bio, and GitHub details so your profile reflects your work.',
    },
    {
      target: '#profile-stats-card',
      title: 'Review Account Stats',
      description: 'Track XP, badges, role, and completed challenges from your profile sidebar.',
    },
    {
      target: '#profile-submissions-card',
      title: 'Audit Your Submissions',
      description: 'Your submissions history keeps challenge status and feedback close when you revisit your work.',
    },
    {
      target: '#profile-badges-card',
      title: 'View Earned Badges',
      description: 'Badges help tell the story of what you have completed and where you are growing.',
    },
    {
      target: '#profile-settings-card',
      title: 'Restart Tours Anytime',
      description: 'Use Profile settings to restart onboarding tours whenever you want a fresh walkthrough.',
    },
  ],
};

export function getOnboardingPageKey(pathname: string): OnboardingPageKey | null {
  if (pathname === '/dashboard') return 'dashboard';
  if (pathname === '/learn') return 'learn';
  if (pathname === '/challenges') return 'challenges';
  if (pathname === '/leaderboard') return 'leaderboard';
  if (pathname === '/profile') return 'profile';
  return null;
}
