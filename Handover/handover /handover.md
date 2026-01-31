# NoCodeJam (InnovAIte) — Project Handover

> **Purpose**: This document is the single handover reference for the NoCodeJam platform work completed to date (T3 2025) and what the next team should do next.

## 1) Platform vision (what this is / what it is not)
NoCodeJam is defined as an **AI-assisted, challenge-first learning platform**.

It is explicitly **not**:
- A tutorial repository
- A “vibe coding” playground
- An unguided AI prompt surface

Core learning philosophy:
- Learning through doing, reflection, and evidence
- AI assists understanding; it **never** completes the work
- XP and progression are earned, auditable, and governed

## 2) Governance-first architecture (non-negotiables)
Governance is treated as **infrastructure**.

Enforcement occurs at three layers:
1. **AI prompt / skill layer** (guardrails in skills + prompts)
2. **System & validation layer** (schema constraints, validations, functions)
3. **Human moderation / PR review layer** (review, adjudication, policy)

## 3) Data & Supabase architecture
### 3.1 Core tables
Designed/created/validated core tables include:
- `challenges`
- `challenge_requests`
- `challenge_completions`
- `pathways`
- `pathway_modules`
- `pathway_enrollments`
- `badges`
- `leaderboard`
- `onboarding_steps`
- `ai_generation_log`

All tables include:
- UUID primary keys
- Timestamp tracking
- Foreign key integrity
- Ownership and traceability

### 3.2 Schema constraints & iteration notes
- Difficulty enforced via `CHECK` constraints
- Enum-style validation for challenge metadata
- Schema aligned with frontend TypeScript models
- Functions dropped/recreated during iteration to resolve parameter conflicts

### 3.3 XP execution context
- XP is calculated via controlled functions
- RPCs must execute through an **authenticated Supabase client**
- XP events are logged for auditability

## 4) XP model (v2.0) — rules & anti-gaming
### 4.1 Mathematical model
- Base XP derived from estimated time
- Difficulty multipliers:
  - Beginner: 1.0
  - Intermediate: 1.4
  - Advanced: 1.8
- Challenge-type modifiers:
  - Reflect: 0.8
  - Build: 1.2
  - Deploy: 1.3

### 4.2 Constraints
- XP awarded **once per challenge** (no retry farming)
- Time bounds enforced: **10–240 minutes**
- Minimum XP: **25**
- Maximum XP: **250**
- Validation based on **≥ 3 tester confirmations**

### 4.3 Compositional XP
- Pathway XP = sum of challenge XP
- Optional pathway completion bonus: **5%**
- Full audit trail for XP calculations
- “Grandfathering” policy needed when formula changes
- Health metrics defined to monitor XP inflation

## 5) AI architecture & assist features
### 5.1 Claude Code skills (guardrails)
Three custom, versioned skills were created:
- `nocodejam-pathway`
- `nocodejam-challenge`
- `nocodejam-governance`

Each skill includes:
- Structured directory layout
- `SKILL.md` with validation logic
- Embedded reference templates
- Example outputs for testing
- Enforced schema compliance
- Auditability and reuse

> These are **AI guardrails**, not “just prompts”.

### 5.2 System prompts (v2.0)
Six discrete prompt types:
1. Generate Learning Pathway
2. Generate Challenge
3. Review Generated Content
4. Validate Challenge Difficulty
5. Generate Hints (No Solutions)
6. Modify Existing Content

Each includes:
- Template references with version numbers
- Validation rules and edge case handling
- QA checklist
- Ambiguity handling (“ask before assuming”)
- Safety constraints (no PII, no dangerous content)

### 5.3 AI Assist UI integration
AI Assist buttons implemented in:
- Learn tab: concept clarification, strategy suggestions, contextual explanations
- Challenge tab: task breakdown, hint generation, next-step guidance

AI explicitly cannot:
- Generate final answers
- Complete challenges
- Award XP

All interactions are logged in `ai_generation_log`.

## 6) Templates as system contracts
### 6.1 Canonical templates
- Challenge Template
- Pathway Template
- Reflection Template
- Governance Rules Template
- XP Mapping Template
- Moderation Checklist Template
- PR Template

### 6.2 Versioning & evolution
- Semantic versioning (v1.0, v1.1, v2.0)
- Version history embedded in templates
- Backwards compatibility policy
- Deprecation + migration guides
- Scheduled template refresh policy

Example notes captured:
- Challenge Template v2.0 added accessibility, prerequisites, validation checklist
- Pathway Template v2.0 added dependencies, success metrics, governance section

Templates are integrated into:
- AI skills
- System prompts
- PR review process

## 7) Learning pathways & learning graph
- Pathways expanded beyond tech-centric content
- Learning graph supports:
  - Required prerequisites
  - Recommended prior knowledge
  - Complementary pathways
  - Career progression mapping

Enables:
- Smart AI recommendations
- XP-gated discovery
- Prevention of premature advanced content

## 8) Reflection & evidence framework
- Reflection is mandatory for completion
- No XP awarded for reflection (anti-gaming)
- Stored as learner portfolio artifacts

Structured reflection prompts:
- Evidence-based prompts only
- Examples of good vs bad reflections
- Length guidelines:
  - Challenges: 150–300 words
  - Pathways: 150–400 words

## 9) UX, accessibility & inclusion
- Interfaces tidied (Learn, Challenge, Admin)
- Leaderboard fixes: correct XP aggregation + ordering
- Accessibility standard: **WCAG 2.1 AA**

Accessibility enforcement via:
- Templates
- AI prompts
- PR checklist

Accessibility violations are classified as **CRITICAL**.

## 10) Safety & content policy enforcement
Restrictions include:
- No PII requests
- No malware/exploits/weapons
- Age-appropriate content only
- Copyright compliance
- Plagiarism detection (XP revocable)

Three-layer enforcement:
1. AI prompt & skill layer
2. System validation layer
3. Human moderation layer

AI must flag uncertainty rather than hallucinate.

## 11) PR & moderation framework (v2.0)
PR template includes:
- XP impact assessment fields
- Testing checklist (multiple test types)
- Deployment plan with rollback
- Migration plan for in-progress learners
- Reviewer assignment logic

Moderation checklist:
- Severity: CRITICAL / IMPORTANT / NICE-TO-HAVE
- Validation categories:
  - Content Accuracy
  - Template Compliance
  - XP Compliance
  - Tool Compliance
  - Accessibility
  - Learner Experience
  - Legal & Policy
  - Technical Performance
  - Final Approval

## 12) Multi-platform AI implementation gameplan
An implementation gameplan document was produced that functions as a deployment manual:
- 10-part deployment guide
- Master AI system prompt
- Three-phase rollout
- Template enforcement at AI, UI, PR levels
- Cost controls & rate limiting
- Abuse prevention
- Validation pseudocode
- Tool-specific setup (Claude Code vs Antigravity)
- 6-week rollout timeline
- KPIs and success metrics
- Empty-state UX guidance
- Recommendation history tracking

## 13) QA / testing (how to validate the platform)
Use the **Comprehensive End-to-End Testing Checklist** as the primary regression guide.

Core areas covered:
- Public access & auth
- Onboarding flow
- Dashboard & profile
- Pathways
- Challenges & submissions
- Leaderboard & community
- Settings
- Admin dashboard
- Edge cases, accessibility, performance
- Cross-browser and cleanup

## 14) Handover checklist (capstone)
Each stream should complete the following before handover:

### 14.1 Project management tool
- Status commentary on all tasks
- Completed column updated
- Sprint lists organised
- Backlog updated with tasks not completed
- Delete tasks no longer required
- Handover tasks written with clear instructions

### 14.2 GitHub
- All project work finalised and committed
- All pull requests reviewed and adjudicated
- Folders organised
- README updated with clear getting started + best practices

### 14.3 Company report & handover presentation
- Complete project handover template
- Complete stakeholder video presentation (overview, demo, next steps)

### 14.4 Stakeholder engagement
- PO meeting: present solution + discuss future
- Leadership meeting: present solution + discuss future
- YouTube updated with stakeholder video presentation
- LinkedIn updated with stakeholder video presentation
- Industry events attended & prototypes presented
- Feedback compiled and incorporated into handover

### 14.5 Finalise handover
- Liaise with other teams and compile overall company report
- Microsoft Teams handover post with clear onboarding instructions
- Submit overall company report in Ontrack

## Next-team backlog (handover task list)

Backlog items captured:
- Liaison role: implement and extend to other areas of InnovAIte (AAIE etc.)
- Build Learn page CMS in admin dashboard (currently hardcoded)
- Update Learning Pathways (admin functionality makes this easy)
- Update Learn page content (admin functionality makes this easy)
- Implement a role/system to keep content up to date and relevant
- Adjust show/hide password button sizing
- AI Assist: add API key via Supabase secrets (Edge Function/Secrets)
  - Gemini noted as a low-cost option
  - Free tier noted: 15 req/min (MVP-sufficient)
- Train chatbot (use T3 learnings from AAIE)
- Add social features (comments/discussions)
- Analytics dashboard (data-driven decisions)
- Auto-validation system (verify challenge completion automatically)
- Pathway Builder (user-generated content)

## Appendix: Where each source came from
This handover consolidates:
- Project Log (platform definition, governance, DB, XP, AI systems, templates, accessibility, safety)
- Capstone Project Handover Checklist (handover items)
- Handover task list (next backlog)
- Comprehensive E2E Testing Checklist (QA regression)

