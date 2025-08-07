# NoCodeJam 🚀

A gamified platform for learning and mastering no-code development through interactive challenges.

## About

NoCodeJam is a hackathon-style platform where developers can:
- Complete no-code development challenges
- Earn XP points and unlock badges
- Compete on leaderboards
- Learn popular no-code tools (Lovable, Bolt, Windsurf, Cursor, etc.)
- Build real-world applications without traditional coding

## Features

- **Onboarding System**: Multi-step guided tutorial for new users with progress tracking
- **Challenge System**: Browse and complete challenges across different difficulty levels
- **Gamification**: Earn XP, collect badges, and climb leaderboards
- **Learning Resources**: Tutorials and guides for popular no-code platforms
- **Community**: User profiles, submission reviews, and social features
- **Admin Panel**: Challenge creation and submission management

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: Radix UI + Tailwind CSS
- **Backend**: Supabase (Auth + Database)
- **Deployment**: Vercel

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Live Demo

🌐 **Live Site**: https://nocodejam2.vercel.app/

## Key Pages

- **Onboarding**: Step-by-step tutorial wizard with progress tracking (`/onboarding/[step]`)
- **Dashboard**: Personal progress, recent submissions, and profile overview
- **Challenges**: Browse and filter challenges by difficulty
- **Leaderboard**: See top developers and your ranking
- **Learn**: Tutorials and resources for no-code platforms
- **Profile**: Manage your profile and view achievements

## Onboarding System

The platform features a comprehensive onboarding system that guides new users through their first no-code development experience:

### Features
- **Multi-Step Wizard**: Progressive tutorial with clear instructions
- **Video Integration**: YouTube videos embedded for visual learning
- **Submission System**: Users submit work for each step (URLs or text responses)
- **Progress Tracking**: Automatic saving and restoration of user progress
- **Smart Navigation**: Auto-redirect to current step when returning
- **Form Validation**: Client-side validation for submissions

### Technical Implementation
- **Frontend**: React components with TypeScript
- **Backend**: Supabase Edge Functions for progress tracking
- **Database**: PostgreSQL with RLS policies for security
- **API Endpoints**:
  - `get-onboarding-steps`: Fetches tutorial steps
  - `get-onboarding-progress`: Tracks user completion
  - `submit-onboarding-step`: Handles step submissions
  - `set-onboarding-visibility`: Manages onboarding card visibility

### User Flow
1. Users see onboarding card on challenges page (if not hidden)
2. Click to start onboarding wizard
3. Progress through steps with video content and instructions
4. Submit work for each step (validated on client and server)
5. Automatic progression tracking and step unlocking
6. Return to exact step if leaving and coming back
7. **Final completion creates master submission for admin review**
8. **Admin reviews and approves/rejects complete onboarding**

### Admin Review System
- **Master Submissions**: Complete onboarding creates parent submission for review
- **Step Aggregation**: Individual step submissions linked via `parent_submission_id`
- **Review Interface**: Admin panel shows complete onboarding journey
- **Approval Workflow**: Single approval affects entire onboarding completion