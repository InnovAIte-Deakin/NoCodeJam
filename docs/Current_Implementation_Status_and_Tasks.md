# NoCodeJam AI Implementation - Remaining Tasks

*Status as of Jan 16, 2026*
*Derived from: `NoCodeJam_AI_Implementation_Gameplan_v2.1_FINAL.md`*

## 🚨 Phase 1: Governance & Security (Immediate Priority)
The secure infrastructure is in place, but strict validation and audit logging are missing.

- [ ] **Implement Strict Validation Logic (`validateAIOutput`)**
    - **Target:** `supabase/functions/generate-challenge/index.ts`
    - **Logic:**
        - Check `XP` is strictly `(calculated by system)`.
        - Verify `Tools` uses purely recommendation language (no "must", "required").
        - Ensure JSON structure matches Challenge Template v2.0.
    - **Action:** Return specific validation warnings to the UI so the user sees *why* their prompt might need adjustment.

- [ ] **Implement Audit Logging**
    - **Database:** Create `ai_generation_log` table (Columns: `id`, `user_id`, `content_type`, `prompt_tokens`, `completion_tokens`, `model`, `validation_passed`, `created_at`).
    - **Backend:** Update Edge Function to insert a log record for *every* generation attempt.

---

## 🏗️ Phase 2: Core Database Architecture
We are currently operating on legacy tables. The full schema is needed to support Learning Pathways.

- [ ] **Database Migration**
    - **File:** `supabase/migrations/YYYYMMDD_add_nocodejam_schema.sql`
    - **New Tables:**
        - `pathways` (curriculum containers)
        - `pathway_modules` (phases within pathways)
        - `challenges` (upgraded from simple requests)
        - `pathway_enrollments` & `challenge_completions` (user progress)
    - **Functions:** Add `calculate_challenge_xp()` trigger.

- [ ] **Data Migration Strategy**
    - Decide: Archive old `challenge_requests` or migrate valid ones to `challenges`.

- [ ] **Type System Update**
    - Create `src/types/database.types.ts` reflecting the new schema.

- [ ] **Component Refactor**
    - Update `ChallengeRequestModal` to submit to the new `challenges` table.
    - Update `Dashboard` to read progress from new tables.

---

## 🎓 Phase 3: Learning Pathways (Deep Implementation)
Currently, "AI Assist" in Learn Tab is just a chat. We need to persist these pathways.

- [ ] **Pathway Generation Backend**
    - **New Function:** `supabase/functions/generate-pathway/index.ts`
    - **Logic:** Generate structured JSON for a full pathway (Metadata -> Objectives -> Modules).
    - **Filtering:** Apply logic to check if user has time/skills (XP < 500 = No Advanced).

- [ ] **Pathway Discovery UI**
    - **Page:** `src/pages/BrowsePathways.tsx`
    - **Features:** Grid view of pathways, filters (Time, Level), "Enroll" button.

- [ ] **Pathway Detail & Progress UI**
    - **Page:** `src/pages/PathwayDetail.tsx`
    - **Features:** Module list, progress bars, checkmarks for completed items.

---

## ⚖️ Phase 4: Admin Governance
Tools for humans to review and approve the AI's drafts.

- [ ] **Review Dashboard**
    - **Page:** `src/pages/ReviewDashboard.tsx` (Admin only).
    - **Features:** List `pending_review` items. Quick "Approve" (Publish) or "Reject" buttons.

- [ ] **Validation Checklist Component**
    - **Component:** `src/components/ValidationChecklist.tsx`.
    - **Usage:** Visual aide for admins showing which governance rules passed/failed.
