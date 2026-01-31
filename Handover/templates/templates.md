# NoCodeJam / InnovAIte — Documentation README

This README is a **single entry-point** to the NoCodeJam / InnovAIte documentation set you uploaded (SRS, tech stack, templates, governance, Claude Code prompts, and operating role docs).

## What NoCodeJam is (from SRS)
NoCodeJam is a **challenge-based learning and ideation SaaS platform** for students and non-technical builders, with:
- Challenge requests
- AI-assisted ideation and refinement ("AI Assist")
- Guided learning pathways and an AI learning assistant

## Quick navigation (recommended reading order)
1. **Product requirements:** `NoCodeJam_SRS_V1_ChatGPT_1fe302857ce14f3aab8699cdc1dd89f3.docx`
2. **Technical architecture:** `NoCodeJam Tech Stack.docx`
3. **AI delivery plan:** `NoCodeJam_AI_Implementation_Gameplan_v2.1_FINAL.md`
4. **Claude/AI prompt governance (Edge Functions):** `NoCodeJam_Claude_System_Prompts_v2.docx`
5. **Content templates + governance:**
   - `NoCodeJam_Challenge_Template_v2.docx`
   - `NoCodeJam_Learning_Pathway_Template_v2.docx`
   - `NoCodeJam_XP_Weighting_Logic_Spec_v2.docx`
   - `NoCodeJam_Moderation_Checklist_v2.docx`
   - `NoCodeJam_PR_Template_v2.docx`
6. **Quality review findings:** `NoCodeJam_Feedback_Report.md`
7. **Operating model:**
   - `InnovAIte_Cross_Stream_Liaison_One_Page_Summary_v2 (1).pdf`
   - `InnovAIte_Cross_Stream_Liaison_Role_Description_v2 (1).pdf`
8. **Windows onboarding runbook:** `Claude Code master prompt.docx`

## Non‑negotiables (cross-document “rules of the road”)
These show up repeatedly across the docs:

### 1) Security: AI keys must never be in the browser
- **All AI generation happens in Supabase Edge Functions**, not in the frontend.
- Frontend env should include **Supabase only** (e.g., `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

### 2) XP is system-calculated only
- **Authors and AI cannot assign XP numbers.**
- AI output must use the placeholder: **`"(calculated by system)"`**.

### 3) Tools are recommended, not required
- Always provide alternatives.
- Avoid “must use / requires / only works with / you need”.

### 4) Templates are mandatory
- Generated content must follow the **v2.0 Challenge / Pathway templates**.
- Outputs are **draft until human-approved**.

### 5) Accessibility & safety
- Accessibility target: **WCAG 2.1 AA**.
- No requests for personal/sensitive learner information.
- Flag uncertainty; don’t fabricate.

## Platform architecture (from Tech Stack)
### Frontend
- React 18 + TypeScript
- Vite
- React Router DOM v7
- Tailwind CSS
- Radix UI
- react-hook-form + zod

### Backend & data
- Supabase Postgres
- Supabase Auth + Storage
- (Optional) Supabase Realtime
- Browser uses `@supabase/supabase-js` for non-sensitive operations

### AI integration (critical)
- Provider: Anthropic Claude
- Model referenced: Claude Sonnet 4 (and `claude-sonnet-4-20250514` in the gameplan)
- **Security note:** the current “direct browser calls” approach is flagged as a **critical issue**; move AI calls into Edge Functions.

### Deployment
- Vercel (static SPA)

## XP system (from XP Weighting Logic Spec v2)
### Author inputs
- Difficulty: Beginner / Intermediate / Advanced
- Estimated time box: 10–240 minutes
- Challenge type: Build / Modify / Analyse / Deploy / Reflect

### System rules
- XP minimum: **25**
- XP maximum: **250**

### Formula
- Base Time XP = minutes × 2
- Difficulty multipliers: Beginner 1.0, Intermediate 1.4, Advanced 1.8
- Type modifiers: Reflect 0.8, Analyse 1.0, Modify 1.1, Build 1.2, Deploy 1.3

Final:

$$	ext{Challenge XP} = (	ext{minutes} 	imes 2) 	imes (	ext{difficulty multiplier}) 	imes (	ext{type modifier})$$

Rounded to nearest whole number and clamped to [25, 250].

## Content creation toolkit (templates)
### Challenge Template v2 (high-level)
A challenge must include:
- Metadata (difficulty, time estimate, type, XP placeholder, cover image placeholder, version)
- Purpose + brief
- Constraints
- Step-by-step guidance (scaled to difficulty)
- Deliverables + verification criteria
- Self-check validation checklist
- Mandatory reflection (150–300 words guidance is included)
- Common pitfalls + progressive hints
- Internal review/moderation section

### Learning Pathway Template v2 (high-level)
A pathway must include:
- Metadata (difficulty, time estimate, prerequisites, learning style, versioning, cover image, total XP system-calculated)
- Objectives + measurable outcomes
- Module structure (recommended 3–7 modules)
- Challenges embedded (recommended 2–5 per module)
- Tool recommendations with alternatives + rationale
- Completion rules, reflection + evidence, extensions, dependencies
- Governance/maintenance + success metrics

### Moderation Checklist v2
A reviewer checks:
- Content accuracy (CRITICAL)
- Template compliance (CRITICAL)
- XP compliance (CRITICAL)
- Tool compliance (IMPORTANT)
- Images + accessibility (CRITICAL)
- Learner experience (IMPORTANT)
- Legal/content policy (CRITICAL)

### PR Template v2
A PR should capture:
- Summary + type/size
- Template usage
- XP compliance checklist
- Impact assessment
- Media + accessibility checks
- Testing performed
- Deployment/rollback plan
- Review assignment + readiness declaration

## AI implementation plan (from Gameplan v2.1)
The gameplan is phased and optimized for Claude Code-assisted delivery:

### Phase 1 — Make AI Assist work securely (start here)
- Create Supabase Edge Function(s) (e.g., `generate-challenge`)
- Move Claude calls out of the browser
- Update `src/services/aiService.ts` to call `supabase.functions.invoke(...)`
- Add UI states (loading/success/errors) and show validation issues

### Phase 2 — Schema & template refactor
- Add tables for pathways, modules, challenges, enrollments, completions, AI logs
- Add DB functions/triggers for XP calculation
- Enforce RLS

### Phase 3 — Pathways & learning assistant
- Pathway generation Edge Function
- Recommendation filtering based on XP/time/prereqs
- Browse/enroll/progress UI

### Phase 4 — Governance workflow
- Review dashboard
- Validation checklist UI
- Approval/rejection workflow
- Audit log viewer

### Phase 5 — Security + polish
- Confirm no API keys in frontend
- Rate limiting
- Monitoring
- UX/accessibility polish

## Claude / Edge Function prompts (from System Prompts v2.1)
The system prompts are designed to run inside Edge Functions.

### Generate Learning Pathway (Edge Function: `generate-pathway`)
Inputs: userGoal, difficulty, timeAvailable, optional userXP.
Rules include:
- XP placeholder only
- tools recommended, not required
- 3–5 modules, 2–5 challenges/module
- reflection prompts + image placeholders
- validate output using governance logic (validateAIOutput)

### Generate Challenge (Edge Function: `generate-challenge`)
Inputs: title, description, difficulty, challengeType, timeEstimate (10–240), optional category.
Rules include:
- XP placeholder only
- recommended tools with alternatives
- measurable success criteria
- 3–5 pitfalls + hints
- reflection prompts (evidence-based)
- validate output using governance logic (validateAIOutput)

## Operations: Cross‑Stream Liaison (InnovAIte)
Two supporting docs define the liaison role that reduces silos and surfaces delivery signals early:
- Fortnightly, time-boxed check-ins with each stream
- Consistent reporting across progress/wins/risks/process/lessons
- Synthesis of themes and evidence-based escalation
- Advisory only (not delivery manager; does not assign work)

## Windows onboarding (Claude Code master prompt)
A Windows-first runbook covers:
- Install Git, Node (LTS), Supabase CLI, Claude Code
- Clone the repo and run locally
- Keep frontend env Supabase-only
- Use Supabase secrets for `ANTHROPIC_API_KEY`
- Deploy Edge Function(s)

Repository referenced: [InnovAIte-Deakin/NoCodeJam](https://github.com/InnovAIte-Deakin/NoCodeJam)

## Document index (what each file is for)
| File | What it contains | When you use it |
|---|---|---|
| `NoCodeJam_SRS_V1_ChatGPT_1fe302857ce14f3aab8699cdc1dd89f3.docx` | Requirements: challenges, AI Assist, Learn tab, pathways; NFRs; governance | Product scope, acceptance criteria |
| `NoCodeJam Tech Stack.docx` | React/Vite/Supabase/Vercel architecture, schema outline, security fixes | Engineering setup + migrations + security plan |
| `NoCodeJam_AI_Implementation_Gameplan_v2.1_FINAL.md` | Step-by-step phased plan with prompts, validation, success criteria | Execution plan + sequencing |
| `NoCodeJam_Claude_System_Prompts_v2.docx` | Edge Function system prompts + rules + validation logic | Prompting standards + enforcement |
| `NoCodeJam_Challenge_Template_v2.docx` | Canonical challenge structure + review requirements | Writing challenges |
| `NoCodeJam_Learning_Pathway_Template_v2.docx` | Canonical pathway structure + governance | Writing pathways |
| `NoCodeJam_XP_Weighting_Logic_Spec_v2.docx` | XP formula, caps, anti-gaming, recalculation policy | XP integrity + implementation |
| `NoCodeJam_Moderation_Checklist_v2.docx` | Publish gate for content | Review & approve |
| `NoCodeJam_PR_Template_v2.docx` | PR checklist for content/tech changes | Team workflow |
| `NoCodeJam_Feedback_Report.md` | Review findings, inconsistencies, platform-level recommendations | Iterate docs + governance |
| `InnovAIte_Cross_Stream_Liaison_One_Page_Summary_v2 (1).pdf` | Liaison purpose/outputs/metrics | Operating cadence |
| `InnovAIte_Cross_Stream_Liaison_Role_Description_v2 (1).pdf` | Role details, responsibilities, boundaries, skills | Staffing/role clarity |
| `Claude Code master prompt.docx` | Windows setup SOP + master “Claude Code” instruction block | Onboarding + consistent execution |

## Suggested folder layout (optional)
If you’re putting these into a repo, a clean structure is:

- `docs/requirements/` (SRS)
- `docs/architecture/` (Tech stack)
- `docs/ai/` (gameplan + system prompts)
- `docs/templates/` (challenge/pathway/xp/moderation/pr)
- `docs/ops/` (liaison docs)
- `docs/onboarding/` (Windows runbook)

