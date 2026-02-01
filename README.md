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

2. Configure environment variables (frontend):

   **Important**: The `.env.local` file is not tracked in GitHub for security reasons. You need to obtain this file from **Scott** or **Jesse** to run the project locally.

   Place the `.env.local` file in the project root. It should contain:

   ```bash
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```

   Alternatively, you can create your own by getting these values from Supabase Dashboard → Project Settings → API.

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Live Demo

🌐 **Live Site**: https://nocodejam2.vercel.app/

## Production Deployment

The live site is automatically deployed via Vercel when changes are merged to the `prod` branch.

### Deployment Process

1. **Merge to Production**: Merge your changes from `main` to `prod`
   ```bash
   git checkout prod
   git merge main
   git push origin prod
   ```

2. **Automatic Deployment**: Vercel automatically detects the push to `prod` and triggers the deployment pipeline
   - Builds the application
   - Runs any configured tests
   - Deploys to production
   - Updates the live site at https://nocodejam2.vercel.app/

3. **Monitor Deployment**: Check the Vercel dashboard for deployment status and logs

**Note**: Always ensure your code is tested and reviewed before merging to `prod`. The deployment happens automatically and will update the live site immediately.

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

### Supabase Edge Functions (backend) environment
The functions under `supabase/functions/*` read these from their runtime environment:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (required for admin writes, e.g. `update-onboarding-progress`)

These are configured in Supabase (function secrets / project env), not in the frontend `.env.local`.
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