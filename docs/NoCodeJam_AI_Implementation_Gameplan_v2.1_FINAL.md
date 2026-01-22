# NoCodeJam AI Implementation Gameplan v2.1 (Final)

**Compatible with: Claude Code & Supabase + Vercel**  
**Version:** 2.1 | **Last Updated:** January 13, 2026  
**Author:** James Jones

---

## 🎯 Executive Summary

This gameplan provides a **phased, executable implementation plan** for integrating AI features into NoCodeJam. It's optimized for Claude Code automation while clearly separating what Claude Code can generate versus what requires manual deployment.

**Implementation Priority:**
1. **Phase 1:** Get AI Assist buttons working correctly (1-2 days) ← **START HERE**
2. **Phase 2:** Refactor website to match v2.0 templates (3-5 days)
3. **Phase 3:** Add governance and advanced features (ongoing)

**Key Principles:**
- Templates are mandatory, not optional
- XP is system-calculated, never AI-assigned
- Tools are recommended, never required
- All AI output is draft until human-approved
- API keys NEVER exposed in browser

---

## 📋 Tech Stack Reference

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Routing:** React Router DOM v7 (client-side)
- **Styling:** Tailwind CSS + Radix UI
- **Forms:** react-hook-form + zod
- **Notifications:** sonner

### Backend
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Edge Functions:** Supabase Edge Functions (for AI)
- **API Access:** `@supabase/supabase-js`

### AI Integration
- **Provider:** Anthropic Claude
- **Model:** Claude Sonnet 4 (`claude-sonnet-4-20250514`)
- **⚠️ Security:** API calls MUST run via Supabase Edge Functions, NOT browser
- **Skills:** Use `nocodejam-pathway`, `nocodejam-challenge`, `nocodejam-governance` skills

### Deployment
- **Platform:** Vercel
- **Type:** Static SPA

---

## 🧠 Validation Logic Reference (From V1 - CRITICAL)

**Use this exact logic for all AI Output validation in Edge Functions:**

```javascript
// REQUIRED: Use in Edge Functions and UI validation
function validateAIOutput(output, type) {
  const checks = {
    hasRequiredSections: false,
    noXPValues: false,
    toolsAreRecommended: false,
    hasImagePlaceholders: false,
    respectsTimeBox: false,
    matchesDifficulty: false
  };

  // Template compliance
  if (type === 'pathway') {
    checks.hasRequiredSections = output.includes([
      'Metadata', 'Objectives', 'Structure', 
      'Challenges', 'Reflection'
    ]);
  } else if (type === 'challenge') {
    checks.hasRequiredSections = output.includes([
      'Metadata', 'Description', 'Instructions',
      'Success Criteria', 'Recommended Tools', 'Reflection'
    ]);
  }

  // XP rule compliance (CRITICAL)
  checks.noXPValues = !output.match(/XP:\s*\d+/) && 
                      output.includes('XP: (calculated by system)');

  // Tool language compliance (CRITICAL)
  checks.toolsAreRecommended = 
    !output.match(/must use|required tool|only works with|you need/i) &&
    output.match(/recommended|suggested|works well with/i);

  // Image placeholders
  checks.hasImagePlaceholders = 
    output.includes('Pathway Cover Image') ||
    output.includes('Challenge Thumbnail');

  // Time box validation
  const timeMatch = output.match(/time[_\s]?estimate[:\s]+(\d+)/i);
  if (timeMatch) {
    const minutes = parseInt(timeMatch[1]);
    checks.respectsTimeBox = minutes >= 10 && minutes <= 240;
  }

  // Difficulty check (basic)
  const difficultyMatch = output.match(/difficulty[:\s]+(beginner|intermediate|advanced)/i);
  if (difficultyMatch) {
    checks.matchesDifficulty = true; // More complex logic needed
  }

  return {
    passed: Object.values(checks).every(Boolean),
    checks: checks,
    issues: Object.entries(checks)
      .filter(([_, passed]) => !passed)
      .map(([check, _]) => check)
  };
}
```

**Include this function in EVERY Edge Function that generates content.**

---

## 🚀 PHASE 1: Get AI Assist Working (PRIORITY)

**Goal:** Make the existing AI Assist button functional and secure  
**Timeline:** 1-2 days  
**Status:** START HERE

### What Currently Exists
- ✅ Challenge Request Page with "AI Assist" button (UI only)
- ⚠️ `src/services/aiService.ts` with direct Claude API calls (INSECURE)
- ❌ No Supabase Edge Functions
- ❌ No secure API key handling

### What We Need to Build

#### Step 1.1: Secure AI Infrastructure (Claude Code)

**Ask Claude Code:**
```
"Create Supabase Edge Functions for AI challenge generation following the NoCodeJam governance rules:

1. Create supabase/functions/generate-challenge/index.ts
   - Accept: { title, description, difficulty, category, requirements }
   - Call Claude API with nocodejam-challenge skill prompt from Skills Setup Guide
   - Use the system prompt that includes:
     * XP must be placeholder: '(calculated by system)'
     * Tools must be recommended, not required
     * Follow Challenge Template v2.0 structure exactly
   
2. Parse AI output into structured challenge data
   
3. Validate against governance rules using the nocodejam-governance skill logic:
   - Run the validateAIOutput function (from Validation Logic Reference above)
   - Check: no XP values, recommended tools only, all template sections present
   - Return validation results with specific issues flagged
   
4. Include proper authentication via Supabase Auth
5. Add CORS headers
6. Handle errors gracefully
7. Return: { challenge, validation, aiOutput }

Use the Challenge Template v2.0 and governance rules from the project docs."
```

**Claude Code will generate:**
- ✅ `supabase/functions/generate-challenge/index.ts`
- ✅ Helper functions for parsing and validation (including validateAIOutput)
- ✅ TypeScript types for request/response

**⚠️ Human Tasks After Generation:**
```bash
# Set the Claude API key securely
supabase secrets set ANTHROPIC_API_KEY=sk-ant-your-key-here

# Deploy the Edge Function
supabase functions deploy generate-challenge

# Test it locally first
supabase functions serve generate-challenge

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/generate-challenge' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "title":"Build a Todo App",
    "difficulty":"beginner",
    "category":"web-development"
  }'
```

#### Step 1.2: Update Frontend Service (Claude Code)

**Ask Claude Code:**
```
"Update src/services/aiService.ts to call the Supabase Edge Function instead of calling Claude directly:

1. Replace direct Anthropic API calls with supabase.functions.invoke('generate-challenge')
2. Remove any VITE_CLAUDE_API_KEY references
3. Add proper TypeScript types
4. Add error handling for Edge Function failures
5. Keep the same function signatures so existing components don't break"
```

**Claude Code will generate:**
- ✅ Updated `src/services/aiService.ts`
- ✅ Proper error handling
- ✅ TypeScript types

**⚠️ Human Tasks:**
```bash
# Remove the insecure API key from .env
# (Edit .env and remove VITE_CLAUDE_API_KEY)

# Test the updated service
npm run dev
# Try the AI Assist button on Challenge Request page
```

#### Step 1.3: Enhance Challenge Request UI (Claude Code)

**Ask Claude Code:**
```
"Enhance the Challenge Request page to show AI generation status:

1. Add loading state while AI is generating
2. Add success message with preview of AI-generated challenge
3. Add error handling for failed generations
4. Show validation warnings if governance rules aren't met (display validation.issues)
5. Let user review and edit AI output before submitting
6. Use Radix UI components and Tailwind for consistency"
```

**Claude Code will generate:**
- ✅ Enhanced Challenge Request component
- ✅ Loading/success/error states
- ✅ Preview modal for AI output
- ✅ Validation warning display

**⚠️ Human Tasks:**
- Test the full flow: Click AI Assist → Review output → Submit
- Verify styling matches your design
- Check mobile responsiveness

#### Step 1.4: Add AI Generation Audit Logging (Recommended)

**Ask Claude Code:**
```
"Add logging to track AI challenge generation:

1. In the Edge Function, log to ai_generation_log table:
   - user_id, timestamp, tokens_used, validation_passed, validation_issues
2. Store in Supabase table (create minimal schema if not exists)
3. Don't block the user flow if logging fails
4. Log both successful and failed generations"
```

### Phase 1 Success Criteria

- ✅ AI Assist button generates challenges via secure Edge Function
- ✅ No API keys exposed in browser
- ✅ User sees loading/success/error states
- ✅ Generated challenges follow template structure
- ✅ XP is placeholder only ("calculated by system")
- ✅ Tools are recommended, not required
- ✅ Validation catches all rule violations
- ✅ Audit trail exists for all generations

### Phase 1 Estimated Time

| Task | Claude Code | Human | Total |
|------|-------------|-------|-------|
| Edge Function generation | 15 min | 10 min review | 25 min |
| Deploy Edge Function | 0 min | 20 min | 20 min |
| Update aiService.ts | 10 min | 10 min testing | 20 min |
| Enhance UI components | 20 min | 30 min styling | 50 min |
| End-to-end testing | 0 min | 45 min | 45 min |
| **TOTAL** | **45 min** | **1h 55min** | **2h 40min** |

---

## 🗄️ PHASE 2: Database Schema & Template Refactoring

**Goal:** Expand database to support full pathway/challenge system  
**Timeline:** 2-3 days  
**Status:** AFTER Phase 1 is working

### Current Schema (What Exists)
- ✅ `challenge_requests` table (basic structure)
- ✅ RLS policies on challenge_requests

### New Schema Required (What to Add)

#### Step 2.1: Generate Database Migration (Claude Code)

**Ask Claude Code:**
```
"Create a Supabase migration that adds the full NoCodeJam schema:

1. Create supabase/migrations/YYYYMMDD_add_nocodejam_schema.sql
2. Include these tables:
   - pathways (learning pathways with modules)
   - pathway_modules (phases within pathways)
   - challenges (enhanced from challenge_requests)
   - ai_recommendations (track AI recommendations)
   - ai_generation_log (audit trail)
   - pathway_enrollments (user progress)
   - challenge_completions (completion tracking)

3. Add RLS policies:
   - Public can view published content
   - Users can view/edit their own drafts
   - Users can only view their own logs/enrollments

4. Create indexes for performance
5. Add XP calculation function and triggers

Use the Tech Stack document schema as reference."
```

**Claude Code will generate:**
- ✅ Complete migration SQL file
- ✅ All tables with correct types and constraints
- ✅ RLS policies
- ✅ Indexes
- ✅ XP calculation function (`calculate_challenge_xp`)
- ✅ Triggers for auto-calculation

**⚠️ Human Tasks:**
```bash
# Review the generated migration
cat supabase/migrations/YYYYMMDD_add_nocodejam_schema.sql

# Apply to your Supabase database
supabase db push

# Verify tables were created
# (Check Supabase Dashboard → Database → Tables)

# Test XP calculation function
# Run in SQL Editor:
SELECT calculate_challenge_xp('beginner', 30, 'build');
# Should return 72
```

#### Step 2.2: Migrate Existing Data (Human Task)

**You need to manually:**
1. Decide what to do with existing `challenge_requests`:
   - Option A: Keep as-is (separate from new `challenges` table)
   - Option B: Migrate to new `challenges` table
   - Option C: Archive old requests and start fresh

2. If migrating, create a data migration script:
```sql
-- Example migration from challenge_requests to challenges
INSERT INTO challenges (
  title,
  description,
  difficulty,
  category,
  created_by,
  validation_status,
  ai_generated,
  -- Set defaults for new required fields
  challenge_type,
  time_estimate,
  xp
)
SELECT 
  title,
  description,
  difficulty,
  category,
  user_id,
  CASE 
    WHEN status = 'approved' THEN 'published'
    WHEN status = 'rejected' THEN 'rejected'
    ELSE 'draft'
  END,
  false, -- Assume old requests were not AI-generated
  'build', -- Default challenge type
  60, -- Default 60 minutes
  NULL -- XP will be auto-calculated by trigger
FROM challenge_requests;
```

#### Step 2.3: Update TypeScript Types (Claude Code)

**Ask Claude Code:**
```
"Generate TypeScript types for the new database schema:

1. Create src/types/database.types.ts
2. Include interfaces for:
   - Pathway
   - PathwayModule
   - Challenge
   - AIRecommendation
   - AIGenerationLog
   - PathwayEnrollment
   - ChallengeCompletion

3. Export all types
4. Add utility types (e.g., CreateChallenge, UpdateChallenge)
5. Match the exact Supabase schema column types"
```

#### Step 2.4: Refactor Components to Use New Schema (Claude Code)

**Ask Claude Code:**
```
"Update existing components to use the new challenges table structure:

1. Update Challenge Request form to map to new challenge schema
2. Add fields for:
   - challenge_type (build/modify/analyse/deploy/reflect)
   - time_estimate (in minutes, 10-240 range)
   - learning_objectives (array)
   - recommended_tools (JSON)
   - reflection_prompts (array)

3. Keep backward compatibility where possible
4. Update Supabase queries to use new table names
5. Display XP as read-only (system-calculated)"
```

### Phase 2 Success Criteria

- ✅ New schema deployed to Supabase
- ✅ XP calculation function working correctly
- ✅ Existing challenge requests migrated or archived
- ✅ TypeScript types match database schema exactly
- ✅ Components updated to use new structure
- ✅ No breaking changes to existing features
- ✅ XP displays correctly (system-calculated)

### Phase 2 Estimated Time

| Task | Claude Code | Human | Total |
|------|-------------|-------|-------|
| Generate migration SQL | 20 min | 15 min review | 35 min |
| Deploy migration | 0 min | 15 min | 15 min |
| Data migration planning | 0 min | 45 min | 45 min |
| Generate TypeScript types | 15 min | 10 min review | 25 min |
| Refactor components | 30 min | 1 hour testing | 1.5 hours |
| **TOTAL** | **1h 5min** | **2h 25min** | **3h 30min** |

---

## 🎓 PHASE 3: Learning Pathway Features

**Goal:** Add full learning pathway generation and discovery  
**Timeline:** 3-5 days  
**Status:** AFTER Phase 2 is complete

### Features to Build

#### Step 3.1: Pathway Generation Edge Function (Claude Code)

**Ask Claude Code:**
```
"Create supabase/functions/generate-pathway/index.ts:

1. Accept: { userGoal, difficulty, timeAvailable, userXP (optional) }

2. Call Claude API with nocodejam-pathway skill from Skills Setup Guide

3. Parse AI output into pathway structure with modules and challenges

4. CRITICAL: Apply Recommendation Filtering Logic (from V1):
   - Filter: If userXP < 500, DO NOT recommend 'advanced' pathways
   - Filter: If userXP < 200, DO NOT recommend 'intermediate' pathways
   - Filter: User's timeAvailable MUST be >= Pathway time_estimate
   - Filter: Check prerequisites - user must have completed required pathways
   - Example: If user has 2 weeks, don't recommend 8-week pathway

5. Validate against governance rules using nocodejam-governance skill logic:
   - Use validateAIOutput function
   - Check XP placeholder, recommended tools, template compliance
   
6. Save to database as draft (validation_status = 'draft')
7. Return: { pathway, validation, aiOutput, recommendationReason }
"
```

**IMPORTANT:** The filtering logic ensures AI recommendations are appropriate for the user's skill level and time availability.

#### Step 3.2: AI Learning Assistant Component (Claude Code)

**Ask Claude Code:**
```
"Create src/components/AILearningAssistant.tsx:

1. Conversational form asking:
   - What do you want to learn? (text input)
   - How much time do you have? (dropdown: 1 week, 2 weeks, 1 month, 3 months)
   - What's your experience level? (dropdown: beginner, intermediate, advanced)

2. Get user's current XP from database (for filtering logic)

3. Call Edge Function with user query and XP

4. Display 1-3 recommended pathways with:
   - Title, description, difficulty
   - Time estimate, total XP
   - WHY it was recommended (from recommendationReason)
   - Preview button to see pathway details

5. User manually enrolls (AI doesn't auto-enroll)
   - Clicking 'Enroll' creates record in pathway_enrollments

6. Use Radix UI Dialog for the assistant
7. Match existing design system
8. Add empty state if no suitable pathways found"
```

#### Step 3.3: Pathway Discovery Page (Claude Code)

**Ask Claude Code:**
```
"Create a Browse Pathways page (src/pages/BrowsePathways.tsx):

1. Query published pathways from database (validation_status = 'published')

2. Show pathway cards with:
   - Title, short description
   - Difficulty badge (color-coded)
   - Total XP, time estimate
   - Number of challenges
   - Cover image (use placeholder if null)
   - Enrollment count (optional)

3. Add filters:
   - Difficulty (beginner/intermediate/advanced)
   - Category dropdown
   - Time range slider (0-12 weeks)
   - Search by title/description

4. Click pathway card to view details (navigate to PathwayDetail page)

5. Show 'Enroll' button on each card
   - Disabled if already enrolled
   - Creates pathway_enrollment record

6. Use existing Tailwind/Radix UI patterns
7. Add loading skeleton while fetching
8. Add empty state if no pathways match filters"
```

#### Step 3.4: Pathway Detail & Progress Tracking (Claude Code)

**Ask Claude Code:**
```
"Create pathway detail page (src/pages/PathwayDetail.tsx):

1. Fetch pathway with modules and challenges from database

2. Show pathway overview:
   - Title, description, difficulty
   - Total XP, time estimate
   - Learning objectives (bulleted list)
   - Cover image

3. Display modules (pathway_modules):
   - Module title, description
   - Time estimate per module
   - Challenges within module (ordered by sequence_order)

4. For each challenge, show:
   - Title, difficulty, XP
   - Completion status (if user enrolled)
   - Link to challenge detail page

5. If user is enrolled (check pathway_enrollments):
   - Show progress bar (completed / total challenges)
   - Show XP earned / total XP available
   - Mark completed challenges with checkmark
   - Highlight current/next challenge

6. If not enrolled:
   - Show 'Enroll in Pathway' button (prominent)

7. Use progress bars and completion checkmarks from Radix UI
8. Add breadcrumb navigation
9. Mobile-responsive layout"
```

### Phase 3 Success Criteria

- ✅ AI can generate full learning pathways
- ✅ Recommendation filtering works (XP-based, time-based, prerequisites)
- ✅ Users can browse published pathways
- ✅ Users can enroll in pathways
- ✅ Progress is tracked per user
- ✅ XP calculation works for pathways (sum of challenge XP)
- ✅ UI is polished and accessible
- ✅ Empty states handled gracefully

### Phase 3 Estimated Time

| Task | Claude Code | Human | Total |
|------|-------------|-------|-------|
| Pathway Edge Function | 25 min | 25 min deploy/test | 50 min |
| AI Assistant component | 30 min | 45 min styling | 1h 15min |
| Browse Pathways page | 30 min | 1 hour styling | 1h 30min |
| Pathway Detail page | 35 min | 1 hour styling | 1h 35min |
| Progress tracking logic | 20 min | 45 min testing | 1h 5min |
| **TOTAL** | **2h 20min** | **4h 15min** | **6h 35min** |

---

## ⚖️ PHASE 4: Governance & Content Review

**Goal:** Add human review workflow for AI-generated content  
**Timeline:** 2-3 days  
**Status:** Can be done in parallel with Phase 3

### Features to Build

#### Step 4.1: Content Review Dashboard (Claude Code)

**Ask Claude Code:**
```
"Create an admin dashboard for reviewing AI-generated content (src/pages/ReviewDashboard.tsx):

1. Query all content with validation_status = 'pending_review'
   - Pathways and Challenges

2. For each item, display:
   - Content type (pathway/challenge)
   - Title, difficulty, created by, created date
   - AI-generated flag
   - Validation status badge (passed/failed)
   - Preview button

3. Show AI generation metadata:
   - Model used (claude-sonnet-4-20250514)
   - Tokens used
   - Generation timestamp
   - Validation issues (if any)

4. Action buttons per item:
   - Review (opens ValidationChecklist modal)
   - Quick Approve (if validation passed)
   - Reject (requires reason)

5. Filters:
   - Content type (pathway/challenge)
   - Author
   - Date range
   - Validation status (passed/failed)

6. Only visible to admin users:
   - Add RLS policy: WHERE auth.uid() IN (SELECT user_id FROM admin_users)
   - Or check user metadata: WHERE auth.jwt()->>'role' = 'admin'

7. Paginate results (20 per page)"
```

#### Step 4.2: Validation Checklist Component (Claude Code)

**Ask Claude Code:**
```
"Create a ValidationChecklist component (src/components/ValidationChecklist.tsx) that uses the nocodejam-governance skill logic:

1. Accept props: { content, contentType }

2. Run all governance checks and display results:

   Template Compliance:
   - ✅/❌ All required sections present
   - ✅/❌ Sections in correct order
   - ✅/❌ Image placeholders included

   XP Compliance (CRITICAL):
   - ✅/❌ No AI-assigned XP values
   - ✅/❌ Only placeholder '(calculated by system)' present
   - ✅/❌ XP field is read-only in forms

   Tool Compliance (CRITICAL):
   - ✅/❌ Tools recommended, not required
   - ✅/❌ No 'must use' language
   - ✅/❌ Alternatives provided
   - ✅/❌ No exact version requirements

   Quality Checks:
   - ✅/❌ Difficulty matches complexity
   - ✅/❌ Time estimate realistic (10-240 min for challenges)
   - ✅/❌ Reflection prompts are evidence-based (not vague)
   - ✅/❌ No unexplained jargon (for beginner content)

3. Allow reviewer to:
   - Add notes per check item
   - Override individual checks (with justification)
   - Add overall review notes

4. Submit buttons:
   - Approve (sets validation_status = 'approved', published_at = NOW())
   - Reject (sets validation_status = 'rejected', requires reason)
   - Request Changes (returns to 'draft', notifies author)

5. Display as modal or side panel
6. Use Radix UI Checkbox for check items
7. Color-code: green for passed, red for failed, yellow for warnings"
```

#### Step 4.3: PR/Review Workflow (Human Design + Claude Code)

**You need to decide:**
1. Who can approve content?
   - Option A: Add `is_admin` boolean to user profiles
   - Option B: Create separate `admin_users` table
   - Option C: Use Supabase user metadata (role: 'admin')

2. How many approvals required? (Recommend: 1 for MVP)

3. Can authors approve their own content? (Recommend: No)

4. What happens on rejection?
   - Return to draft (validation_status = 'draft')
   - Notify author via email or in-app notification
   - Author can edit and resubmit

**Then ask Claude Code:**
```
"Implement the review workflow logic:

1. Add is_admin field to user profiles (or use chosen approach)

2. Create RLS policies:
   - Only admins can UPDATE validation_status to 'approved'
   - Authors can UPDATE their own draft content
   - Authors cannot approve their own content

3. Add workflow state transitions:
   - draft → pending_review (author submits)
   - pending_review → approved (admin approves)
   - pending_review → rejected (admin rejects)
   - rejected → draft (author can resubmit)
   - approved → published (automatic or manual trigger)

4. Add notification system (optional):
   - Email author when content is approved/rejected
   - In-app notification center

5. Track reviewer in ai_generation_log table:
   - reviewed_by: UUID
   - review_status: approved/rejected
   - review_notes: TEXT"
```

#### Step 4.4: Audit Log Viewer (Claude Code)

**Ask Claude Code:**
```
"Create an Audit Log page (src/pages/AuditLog.tsx):

1. Query ai_generation_log table with filters:
   - User (author dropdown)
   - Content type (pathway/challenge/recommendation)
   - Date range
   - Review status (draft/approved/rejected)
   - Validation status (passed/failed)

2. Display table with columns:
   - Timestamp
   - User (author name)
   - Content type
   - Content title (link to preview)
   - Validation passed (yes/no badge)
   - Validation issues (expandable list)
   - Review status
   - Reviewer name
   - Tokens used
   - Model used

3. Add export to CSV functionality:
   - Download filtered results
   - Include all columns

4. Only visible to admins

5. Paginate results (50 per page)
6. Sort by timestamp (newest first)
7. Click row to see full generation details"
```

### Phase 4 Success Criteria

- ✅ Reviewers can see all pending content
- ✅ Validation checklist shows all governance checks
- ✅ Approve/reject workflow functional
- ✅ Authors cannot approve their own content
- ✅ Audit trail of all AI operations
- ✅ Content can't be published without approval
- ✅ Notifications sent (if implemented)

---

## 🔒 PHASE 5: Security & Polish

**Goal:** Production-ready security and UX  
**Timeline:** 2-3 days  
**Status:** Before public launch

### Security Checklist

**Ask Claude Code to help verify:**
```
"Review the codebase for security issues:

1. Confirm no API keys in browser/frontend code
   - Search for VITE_CLAUDE, ANTHROPIC_API_KEY in frontend
   - Verify .env.example doesn't include sensitive keys

2. Verify all RLS policies are enabled and correct
   - Check each table has ENABLE ROW LEVEL SECURITY
   - Test policies with different user roles

3. Check that XP calculation is server-side only
   - XP field should be read-only in all forms
   - Only calculate_challenge_xp function can set XP

4. Ensure user authentication required for AI features
   - All Edge Functions check auth.uid()
   - Unauthenticated users can't generate content

5. Verify CORS configuration on Edge Functions
   - Check corsHeaders allow only your domain
   - Test from unauthorized origin (should fail)

6. Check for SQL injection vulnerabilities
   - All user inputs are parameterized
   - No string concatenation in queries

7. Review error messages (don't expose sensitive info)
   - Don't return database errors to frontend
   - Don't expose API keys in error messages
   - Log detailed errors server-side only"
```

**Human Tasks:**
- Penetration testing (hire security professional or use automated tools)
- Load testing Edge Functions (use Artillery or k6)
- Set up rate limiting:
  - Option A: Supabase built-in limits (check docs)
  - Option B: Upstash Redis for custom rate limiting
  - Recommend: 10 AI requests per user per hour
- Configure environment variables in Vercel dashboard
- Set up error monitoring (Sentry, LogRocket, or Supabase logs)
- Review Supabase logs for suspicious activity

### UX Polish Checklist

**Ask Claude Code to help with:**
```
"Polish the UX for production:

1. Add empty states to all pages:
   - No pathways found (Browse page)
   - No enrollments yet (Progress page)
   - No pending reviews (Review Dashboard)
   - Use friendly illustrations or icons

2. Add loading skeletons (not just spinners):
   - Pathway cards skeleton
   - Challenge list skeleton
   - Use Radix UI patterns

3. Improve error messages (user-friendly):
   - Replace technical errors with plain language
   - Provide actionable next steps
   - Example: 'Generation failed' → 'Unable to generate content. Please try again or contact support.'

4. Add success animations:
   - Checkmark animation on enrollment
   - Confetti on pathway completion
   - Use Framer Motion or CSS animations

5. Verify keyboard navigation works:
   - Tab through all interactive elements
   - Enter/Space activate buttons
   - Escape closes modals
   - Test with screen reader (NVDA or VoiceOver)

6. Check ARIA labels and screen reader compatibility:
   - All buttons have aria-label
   - Form inputs have labels
   - Status messages use aria-live

7. Test mobile responsiveness on all pages:
   - iPhone (375px)
   - iPad (768px)
   - Test landscape orientation

8. Add helpful tooltips and onboarding hints:
   - First-time user tour
   - Inline help text for complex features
   - Use Radix UI Tooltip"
```

### Performance Optimization

**Human Tasks:**
- Profile page load times (use Lighthouse)
  - Target: < 2s initial load
  - Target: < 1s navigation
- Optimize images:
  - Compress with ImageOptim or Squoosh
  - Use WebP format
  - Implement lazy loading
- Add caching headers in Vercel (vercel.json):
  ```json
  {
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=3600, s-maxage=86400"
          }
        ]
      }
    ]
  }
  ```
- Database query optimization:
  - Add indexes on frequently queried columns
  - Use database explain plans (EXPLAIN ANALYZE)
  - Consider materialized views for complex queries
- Monitor Edge Function cold starts:
  - Log execution times
  - Consider keeping functions warm with cron

---

## 📊 Success Metrics & Monitoring

### Key Metrics to Track

1. **AI Usage**
   - AI requests per day (track in ai_generation_log)
   - Success rate: validation passed % (target: >90%)
   - Average tokens used per generation (optimize prompts if too high)
   - User satisfaction with AI output (add rating system)

2. **Quality**
   - Template compliance rate (target: 100%)
   - Human approval rate (target: >80%)
   - Time to review AI drafts (target: <10 minutes)
   - Rejection reasons (categorize and track patterns)

3. **Engagement**
   - % users who try AI features (target: >50%)
   - Pathways discovered via AI vs manual browse
   - Challenges created with AI assist vs manual
   - Completion rate of AI-recommended pathways (target: >60%)

4. **Performance**
   - Edge Function latency (target: <2 seconds)
   - Database query times (target: <100ms for reads)
   - Page load times (target: <2 seconds)
   - Error rates (target: <1%)

### Monitoring Setup (Human Task)

```bash
# Supabase monitoring
# 1. Enable database logs in Supabase Dashboard
# 2. Set up alerts for:
#    - Edge Function errors (> 10 per hour)
#    - Database connection pool exhaustion
#    - Slow queries (> 1 second)

# Vercel monitoring
# 1. Enable Web Analytics in Vercel Dashboard
# 2. Set up Vercel Speed Insights
# 3. Configure deployment notifications (Slack/Discord)

# Error tracking (optional but recommended)
npm install @sentry/react
# Configure in src/main.tsx:
Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 0.1,
});
```

**Create monitoring dashboard:**
- Use Supabase built-in analytics
- Or build custom dashboard querying ai_generation_log
- Track metrics over time (daily/weekly/monthly)

---

## 🚦 Implementation Roadmap Summary

### Week 1: AI Assist Working ← **YOU ARE HERE**
- ✅ Phase 1: Secure AI infrastructure and working AI Assist button
- 🎯 **End of week goal:** Users can generate challenges with AI securely

### Week 2: Database & Template Refactoring
- ✅ Phase 2: New database schema and template compliance
- 🎯 **End of week goal:** Database supports full pathway system

### Week 3-4: Learning Pathways
- ✅ Phase 3: Pathway generation and discovery
- 🎯 **End of week goal:** Users can discover and enroll in AI-generated pathways

### Week 4-5: Governance & Security
- ✅ Phase 4: Review workflow and audit logging
- ✅ Phase 5: Security hardening and UX polish
- 🎯 **End of week goal:** Production-ready system

---

## 🛠️ Claude Code Skills Integration

### Using NoCodeJam Skills

Your project should have these skills in `.claude/skills/`:
- `nocodejam-pathway/` - Pathway generation skill
- `nocodejam-challenge/` - Challenge generation skill
- `nocodejam-governance/` - Validation and governance skill

**Reference these skills in Edge Function prompts:**

```typescript
// In generate-challenge Edge Function
const systemPrompt = `
You are using the nocodejam-challenge skill.
Generate a challenge following NoCodeJam Challenge Template v2.0.

CRITICAL RULES:
- XP must be placeholder: "(calculated by system)"
- Tools must be recommended, not required (use "recommended", "suggested")
- Follow exact template structure
- Include reflection prompts (evidence-based, not vague)

Refer to the nocodejam-governance skill for validation rules.
`;
```

### How to Get Best Results from Claude Code

#### 1. Provide Context
Always reference relevant documents:
```
"Using the Challenge Template v2.0, XP Weighting Logic Spec, and nocodejam-challenge skill, create..."
```

#### 2. Be Specific About Constraints
```
"XP must be placeholder only. Tools must be recommended, not required. Follow NoCodeJam governance rules from the nocodejam-governance skill."
```

#### 3. Request Validation
```
"After generating, validate that the output follows the template structure and governance rules using the validateAIOutput function."
```

#### 4. Ask for Incremental Changes
Build iteratively:
```
// Good
"Create the Edge Function for challenge generation"
[Review output]
"Now add validation logic using nocodejam-governance skill"
[Review output]
"Now add error handling"

// Bad
"Create everything for the entire AI system"
```

#### 5. Request Documentation
```
"Add inline comments explaining the XP calculation logic"
"Generate a README for the Edge Functions with examples"
```

### What Claude Code Can Do Well

- ✅ Generate SQL migrations
- ✅ Create Edge Functions with boilerplate
- ✅ Update TypeScript types
- ✅ Refactor existing components
- ✅ Add validation logic (using skills)
- ✅ Generate form components
- ✅ Write helper functions
- ✅ Create React components with Radix UI

### What Requires Human Review

- ⚠️ Security-critical code (API keys, auth)
- ⚠️ Database RLS policies (test thoroughly)
- ⚠️ AI output parsing (unpredictable formats)
- ⚠️ Complex business logic
- ⚠️ UX/accessibility details
- ⚠️ Production deployment configs
- ⚠️ Rate limiting implementation

---

## 📁 Project Structure After Implementation

```
nocodejam-project/
├── .claude/                                 # Claude Code skills
│   └── skills/
│       ├── nocodejam-pathway/
│       │   ├── SKILL.md
│       │   └── references/
│       ├── nocodejam-challenge/
│       │   ├── SKILL.md
│       │   └── references/
│       └── nocodejam-governance/
│           ├── SKILL.md
│           └── references/
│
├── docs/                                    # Documentation
│   ├── NoCodeJam_AI_Implementation_Gameplan_v2.1.md
│   ├── NoCodeJam_Challenge_Template_v2.md
│   ├── NoCodeJam_Learning_Pathway_Template_v2.md
│   ├── NoCodeJam_XP_Weighting_Logic_Spec_v2.md
│   └── NoCodeJam_Tech_Stack.md
│
├── supabase/
│   ├── migrations/
│   │   └── 20260113_add_nocodejam_schema.sql
│   └── functions/
│       ├── generate-challenge/
│       │   └── index.ts
│       ├── generate-pathway/
│       │   └── index.ts
│       ├── recommend-pathway/
│       │   └── index.ts
│       └── validate-content/
│           └── index.ts
│
├── src/
│   ├── components/
│   │   ├── AILearningAssistant.tsx          # NEW
│   │   ├── AIChallengeGenerator.tsx         # ENHANCED
│   │   ├── ValidationChecklist.tsx          # NEW
│   │   ├── PathwayCard.tsx                  # NEW
│   │   └── ProgressTracker.tsx              # NEW
│   │
│   ├── pages/
│   │   ├── BrowsePathways.tsx               # NEW
│   │   ├── PathwayDetail.tsx                # NEW
│   │   ├── ChallengeRequest.tsx             # ENHANCED
│   │   ├── ReviewDashboard.tsx              # NEW (admin)
│   │   └── AuditLog.tsx                     # NEW (admin)
│   │
│   ├── services/
│   │   ├── aiService.ts                     # REFACTORED (Edge Functions)
│   │   ├── pathwayService.ts                # NEW
│   │   └── validationService.ts             # NEW
│   │
│   ├── types/
│   │   ├── database.types.ts                # NEW
│   │   ├── ai.types.ts                      # NEW
│   │   └── validation.types.ts              # NEW
│   │
│   └── lib/
│       └── supabase.ts                      # EXISTING
│
├── .env.example                             # UPDATED (remove VITE_CLAUDE_API_KEY)
├── vercel.json                              # EXISTING
└── package.json                             # EXISTING
```

---

## ⚠️ Critical Reminders

### 1. API Key Security
**NEVER** put the Claude API key in:
- ❌ `.env` files (frontend)
- ❌ `vite.config.ts`
- ❌ Any browser-accessible code

**ALWAYS** put it in:
- ✅ Supabase Edge Function secrets (`supabase secrets set`)
- ✅ Server-side environment only

### 2. XP Calculation
**NEVER** let AI assign XP values:
- ❌ AI output like "XP: 100"
- ❌ Frontend calculations
- ❌ Manual XP assignment

**ALWAYS** use:
- ✅ Database function: `calculate_challenge_xp()`
- ✅ Trigger: `auto_calculate_challenge_xp`
- ✅ Placeholder in AI output: "XP: (calculated by system)"

### 3. Tool Recommendations (From nocodejam-governance skill)
**NEVER** use language like:
- ❌ "You must use Figma"
- ❌ "This requires VS Code"
- ❌ "Only works with..."
- ❌ "You need Node.js 16.4.2 exactly"

**ALWAYS** use:
- ✅ "Recommended: Figma or similar design tools"
- ✅ "Works well with VS Code, Sublime, or any editor"
- ✅ "Suggested: Node.js 16 or higher"
- ✅ "... or equivalent"

### 4. Template Compliance (From nocodejam-governance skill)
**EVERY** AI-generated piece must:
- ✅ Follow the exact template structure (v2.0)
- ✅ Include all required sections in order
- ✅ Have image placeholders with descriptions
- ✅ Include 3-4 evidence-based reflection prompts
- ✅ Pass validateAIOutput() before showing to user

### 5. Human Approval (From governance workflow)
**NO** AI-generated content should:
- ❌ Auto-publish to live site
- ❌ Bypass review workflow
- ❌ Skip validation checks

**ALL** AI content must:
- ✅ Start as draft (validation_status = 'draft')
- ✅ Show validation results to user
- ✅ Require human approval (admin review)
- ✅ Be audited in ai_generation_log

### 6. Recommendation Filtering (From V1 - NEW in v2.1)
**ALWAYS** apply these filters when recommending pathways:
- ✅ Check user XP: No advanced (XP < 500), no intermediate (XP < 200)
- ✅ Check time available: User time >= pathway time estimate
- ✅ Check prerequisites: User completed required pathways
- ✅ Explain WHY pathway was recommended (transparency)

---

## 🎯 Quick Start Commands

### For Claude Code Session

Start with Phase 1:
```
"Let's implement Phase 1 of the AI Implementation Gameplan v2.1.

First, read these documents from /mnt/project/:
- docs/NoCodeJam_AI_Implementation_Gameplan_v2.1.md
- docs/NoCodeJam_Challenge_Template_v2.md
- docs/NoCodeJam_XP_Weighting_Logic_Spec_v2.md
- .claude/skills/nocodejam-challenge/SKILL.md
- .claude/skills/nocodejam-governance/SKILL.md

Then create the generate-challenge Edge Function following Step 1.1.
Include the validateAIOutput function from the Validation Logic Reference section."
```

Continue with each step:
```
"Now update src/services/aiService.ts following Step 1.2"
"Now enhance the Challenge Request UI following Step 1.3"
```

### For Deployment

```bash
# Phase 1 deployment
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase functions deploy generate-challenge

# Test locally
supabase functions serve generate-challenge

# Test the service
npm run dev

# Phase 2 deployment
supabase db push
supabase db diff  # Verify schema

# Test XP calculation
# In Supabase SQL Editor:
SELECT calculate_challenge_xp('beginner', 30, 'build');

# Phase 3 deployment
supabase functions deploy generate-pathway
supabase functions deploy recommend-pathway

# Production deployment
vercel --prod
```

---

## 📝 Final Checklist Before Launch

### Security ✅
- [ ] No API keys in browser/frontend code
- [ ] RLS policies enabled on ALL tables
- [ ] Authentication required for AI features
- [ ] Rate limiting implemented (10 req/hour recommended)
- [ ] CORS configured correctly (only your domain)
- [ ] Error messages don't expose sensitive info
- [ ] Penetration testing completed

### Functionality ✅
- [ ] AI Assist generates valid challenges (template compliant)
- [ ] Pathways can be created, browsed, and enrolled in
- [ ] XP calculation works correctly (test all difficulty/type combinations)
- [ ] Enrollments tracked in pathway_enrollments
- [ ] Completions award XP once only (check UNIQUE constraint)
- [ ] Review workflow functional (approve/reject)
- [ ] Recommendation filtering works (XP, time, prerequisites)

### Quality ✅
- [ ] Template compliance at 100% (validate all AI output)
- [ ] Validation catches all rule violations (test with bad inputs)
- [ ] UI is accessible (WCAG 2.1 AA - test with screen reader)
- [ ] Mobile responsive (test on actual devices)
- [ ] Loading states everywhere (no blank screens)
- [ ] Error handling graceful (user-friendly messages)
- [ ] Empty states implemented (no missing content)

### Documentation ✅
- [ ] README updated with setup instructions
- [ ] API documentation for Edge Functions
- [ ] User guide for AI features
- [ ] Admin guide for content review
- [ ] Deployment instructions (step-by-step)
- [ ] Troubleshooting guide
- [ ] Environment variables documented

---

## 🆘 Troubleshooting Common Issues

### Issue: Edge Function returns 401 Unauthorized
**Cause:** Missing or invalid authentication  
**Fix:**
```typescript
// Ensure you're passing the session token
const { data: { session } } = await supabase.auth.getSession();

const { data, error } = await supabase.functions.invoke('generate-challenge', {
  headers: {
    Authorization: `Bearer ${session.access_token}`,
  },
  body: { ... }
});
```

### Issue: XP is null or 0
**Cause:** Trigger not firing or input values invalid  
**Fix:**
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'auto_calculate_challenge_xp';

-- Test function manually
SELECT calculate_challenge_xp('beginner', 30, 'build');
-- Should return 72

-- Check challenge record
SELECT id, difficulty, time_estimate, challenge_type, xp FROM challenges;
```

### Issue: AI output parsing fails
**Cause:** Claude returned unexpected format  
**Fix:**
- Add more specific prompting in Edge Function:
  ```typescript
  const systemPrompt = `
  You must respond ONLY with valid JSON matching this structure:
  {
    "title": "string",
    "description": "string",
    "difficulty": "beginner" | "intermediate" | "advanced",
    ...
  }
  Do not include any markdown, preamble, or commentary.
  `;
  ```
- Add fallback parsing strategies
- Log failed parses to ai_generation_log for analysis

### Issue: RLS policy blocking read/write
**Cause:** Policy condition doesn't match user context  
**Fix:**
```sql
-- Check what auth.uid() returns
SELECT auth.uid();

-- Test policy with specific user
SELECT * FROM pathways WHERE created_by = 'user-uuid-here';

-- Check if user has required role
SELECT auth.jwt()->>'role';

-- Temporarily disable RLS to test (dev only!)
ALTER TABLE pathways DISABLE ROW LEVEL SECURITY;
-- Re-enable after testing!
ALTER TABLE pathways ENABLE ROW LEVEL SECURITY;
```

### Issue: Validation always fails
**Cause:** validateAIOutput function logic error  
**Fix:**
```javascript
// Debug the validation function
const result = validateAIOutput(aiOutput, 'challenge');
console.log('Validation checks:', result.checks);
console.log('Failed checks:', result.issues);

// Test individual checks
console.log('XP check:', !aiOutput.match(/XP:\s*\d+/));
console.log('Tool check:', aiOutput.match(/recommended|suggested/i));
```

### Issue: Recommendation filtering not working
**Cause:** User XP not being passed or checked correctly  
**Fix:**
```typescript
// In generate-pathway Edge Function, log the filtering
console.log('User XP:', userXP);
console.log('Pathway difficulty:', pathway.difficulty);
console.log('Should filter?', 
  (pathway.difficulty === 'advanced' && userXP < 500) ||
  (pathway.difficulty === 'intermediate' && userXP < 200)
);
```

---

## 📚 Additional Resources

### Supabase Documentation
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)
- [Triggers](https://supabase.com/docs/guides/database/triggers)

### Anthropic Documentation
- [Claude API Reference](https://docs.anthropic.com/claude/reference)
- [Prompt Engineering](https://docs.anthropic.com/claude/docs/prompt-engineering)
- [System Prompts](https://docs.anthropic.com/claude/docs/system-prompts)
- [Message Batches](https://docs.anthropic.com/claude/docs/message-batches)

### NoCodeJam Templates (Reference)
- Challenge Template v2.0 (see docs/ folder)
- Learning Pathway Template v2.0 (see docs/ folder)
- XP Weighting Logic Spec v2.0 (see docs/ folder)

### NoCodeJam Skills (Use in prompts)
- nocodejam-pathway skill (see .claude/skills/nocodejam-pathway/)
- nocodejam-challenge skill (see .claude/skills/nocodejam-challenge/)
- nocodejam-governance skill (see .claude/skills/nocodejam-governance/)

---

## ✅ Version History

- **v2.1** (January 13, 2026): 
  - Added explicit validation logic reference from V1
  - Added recommendation filtering logic from V1 Part 5.B
  - Clarified nocodejam-governance skill usage in Steps 1.1, 3.1, 4.2
  - Updated Project Structure to reference .md templates (not .docx)
  - Added troubleshooting for recommendation filtering
  - Enhanced all prompts to reference skills explicitly

- **v2.0** (January 13, 2026): Complete rewrite with phased approach, prioritizing AI Assist button first

- **v1.0** (January 11, 2026): Initial integrated gameplan

---

## 🎉 Summary of Improvements in v2.1

This version incorporates feedback from Antigravity review:

1. **✅ Recommendation Logic Restored** - Step 3.1 now includes explicit XP-based, time-based, and prerequisite filtering from V1

2. **✅ nocodejam-governance Skill Integrated** - Steps 1.1, 3.1, and 4.2 now explicitly reference the governance skill for validation

3. **✅ Template Format Corrected** - Project structure updated to use .md templates (matching Skills Guide) instead of .docx

4. **✅ Validation Schema Included** - Added the validateAIOutput function from V1 in the "Validation Logic Reference" section with usage instructions

5. **✅ Skills Usage Clarified** - Added "Claude Code Skills Integration" section explaining how to use the three NoCodeJam skills

All critical governance rules, validation logic, and filtering mechanisms are now present and actionable!

---

**Remember:** This is a living document. Update it as you discover new requirements or better approaches. The goal is to make AI a helpful tool that respects your governance rules and enhances the learning experience!

🚀 **Ready to start? Begin with Phase 1, Step 1.1!**
