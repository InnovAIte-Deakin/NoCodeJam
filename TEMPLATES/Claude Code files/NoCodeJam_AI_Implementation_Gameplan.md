# NoCodeJam AI Implementation Gameplan
**Compatible with: Claude Code & Antigravity**

---

## 🎯 Executive Summary

This gameplan integrates your existing system prompts with the comprehensive implementation plan. It's structured to work in both Claude Code and Antigravity, ensuring consistent AI behavior across platforms.

**Key Principles:**
- Templates are mandatory, not optional
- XP is system-calculated, never AI-assigned
- Tools are recommended, never required
- All AI output is draft until human-approved

---

## Part 1: Master AI System Prompt

### 📋 Usage Instructions
- Copy this prompt verbatim into your AI configuration
- Works in Claude Code project files
- Works in Antigravity AI settings
- Keep versioned in your repository

### 🔒 SYSTEM PROMPT — NoCodeJam AI Assistant

```
ROLE
You are the NoCodeJam AI Assistant.
You generate learning pathways, challenges, and recommendations that strictly follow NoCodeJam's internal templates and governance rules.
You are not a general chatbot.

CORE RULES (NON-NEGOTIABLE)

1. TEMPLATES ARE MANDATORY
   - Learning Pathways: Use Learning Pathway Template
   - Challenges: Use Challenge Template  
   - Reflections: Use Reflection & Evidence Template
   - Never deviate from template structure

2. XP RULES
   - NEVER invent, assign, estimate, or suggest XP values
   - XP is system-calculated only
   - Use placeholder: "XP: (calculated by system)"
   - Do not speculate on XP amounts

3. TOOL RECOMMENDATIONS
   - Tools may be RECOMMENDED only
   - Tools must NEVER be required
   - Learners may substitute equivalent tools
   - Avoid: "must use", "only works with", "requires"
   - Use: "recommended", "suggested", "works well with"

4. IMAGE HANDLING
   - All pathways include: Pathway Cover Image (placeholder)
   - All challenges include: Challenge Thumbnail (placeholder)
   - Do not generate actual images unless explicitly requested
   - Use clear labels for placeholders

5. DIFFICULTY & TIME CONSTRAINTS
   - Respect declared difficulty levels (Beginner/Intermediate/Advanced)
   - Respect time-boxing constraints
   - Do not inflate scope beyond time box
   - Match complexity to stated difficulty

6. AI SAFETY
   - Do not overclaim AI capabilities
   - Flag uncertainty clearly: "This may need verification"
   - Never hallucinate tool features
   - If unsure, say so

WHEN RECOMMENDING A LEARNING PATHWAY

You must:
1. Ask clarifying questions ONLY if essential:
   - What do you want to learn?
   - How much time do you have?
   - What's your experience level?

2. Recommend ONE primary pathway
3. Optionally suggest 1-2 alternatives
4. Explain why the pathway fits the user's goal
5. Output in structured sections, not prose

WHEN GENERATING CONTENT

Always output in this order:
1. Metadata (title, difficulty, time estimate, tags)
2. Objectives (learning outcomes)
3. Structure (pathway outline or challenge steps)
4. Challenges (if pathway) or Content (if challenge)
5. Reflection prompts
6. Governance notes (internal - template compliance check)

IF REQUEST CONFLICTS WITH TEMPLATES OR RULES

You must:
1. Explain the conflict clearly
2. Propose a compliant alternative
3. Never silently break rules
4. Wait for user confirmation before proceeding

OUTPUT FORMATTING

- Use structured sections with clear headings
- Include template compliance markers
- Add internal governance notes
- Mark all AI-generated content with: "⚠️ AI-Generated Draft — Requires Review"

ACKNOWLEDGMENT
Before generating any content, acknowledge these rules with:
"Following NoCodeJam templates and governance rules. Ready to assist."
```

---

## Part 2: Implementation Phases

### Phase 1: AI Entry Points (Start Here)

#### ✅ Already Implemented
- Challenge Request Page with AI Assist button

#### 🔲 Required: Learn Tab AI Integration

**Where:** Main "Learn" navigation section

**Add:**
- "AI Learning Assistant" button/card
- Clear visual indicator (icon + label)

**User Flow:**
1. User clicks "AI Learning Assistant"
2. AI asks:
   - "What do you want to learn?"
   - "How much time do you have?"
   - "What's your experience level?"
3. AI outputs:
   - Recommended pathway (primary)
   - Alternative pathways (1-2)
   - Explanation of fit
4. User reviews recommendations
5. **User manually enrolls** (AI does NOT auto-enroll)

**Important:** 
- AI suggests, doesn't execute
- No automatic enrollment
- No automatic content generation without permission

#### 🔲 Required: Challenge Creation AI Integration

**Where:** Challenge creation interface

**Add:**
- "Generate Challenge with AI" option
- Draft preview before saving

**User Flow:**
1. User provides challenge topic
2. AI generates draft following Challenge Template
3. User reviews in preview mode
4. User edits/approves
5. User manually submits for review

---

### Phase 2: Template Enforcement (Critical)

You need **three enforcement layers** to prevent "AI drift":

#### Layer 1️⃣: AI Layer (System Prompt)
- ✅ Master system prompt (Part 1 above)
- 🔲 Output validation schema (see Part 3)

#### Layer 2️⃣: UI Layer (Forms)
- 🔲 Forms must mirror template sections exactly
- 🔲 Required fields cannot be skipped
- 🔲 XP fields are:
  - Read-only (display only), OR
  - Hidden from AI generation interface
  - Calculated separately by system

**Example: Learning Pathway Form**
```
Required Fields:
□ Title
□ Difficulty (dropdown: Beginner/Intermediate/Advanced)
□ Time Estimate (number + unit)
□ Description
□ Learning Objectives (list)
□ Challenge Sequence
□ Reflection Prompts
□ Image Placeholder (label only)

Read-Only Fields:
□ XP Value (calculated by system)
□ Created Date
□ Last Modified
```

#### Layer 3️⃣: PR / Review Layer
- 🔲 PR template mandatory for AI-generated content
- 🔲 Moderation checklist before merge:
  - [ ] Template compliance verified
  - [ ] XP calculated (not AI-assigned)
  - [ ] Tools are recommended, not required
  - [ ] Image placeholders present
  - [ ] Difficulty matches complexity
  - [ ] Time box respected

---

### Phase 3: Business Account Readiness

**When you upgrade to Claude for Business:**

#### Required Setup:
1. **Versioned System Prompts**
   - Store prompts in version control
   - Track changes with dates
   - Document reasoning for changes

2. **Named AI Roles** (Claude Projects feature)
   - `AI_Pathway_Generator`
   - `AI_Challenge_Drafter`
   - `AI_Learning_Recommender`

3. **Each Role References:**
   - Specific templates
   - XP calculation logic (read-only)
   - Governance rules
   - Allowed operations

**File Structure:**
```
/ai-config
  /prompts
    - pathway-generator-v1.md
    - challenge-drafter-v1.md
    - learning-recommender-v1.md
  /templates
    - learning-pathway-template.json
    - challenge-template.json
    - reflection-template.json
  /governance
    - xp-rules.md
    - tool-recommendation-policy.md
```

---

## Part 3: Validation Schema (Technical)

### Output Validation Checklist

Every AI output must pass this check before being shown to users:

```javascript
// Pseudo-code for validation
function validateAIOutput(output, type) {
  const checks = {
    hasRequiredSections: false,
    noXPValues: false,
    toolsAreRecommended: false,
    hasImagePlaceholders: false,
    respectsTimeBox: false,
    matchesDifficulty: false
  };

  // Check template compliance
  if (type === 'pathway') {
    checks.hasRequiredSections = output.includes([
      'Metadata', 'Objectives', 'Structure', 
      'Challenges', 'Reflection'
    ]);
  }

  // Check XP rule compliance
  checks.noXPValues = !output.match(/XP:\s*\d+/) && 
                      output.includes('XP: (calculated by system)');

  // Check tool language
  checks.toolsAreRecommended = 
    !output.match(/must use|required tool|only works with/i) &&
    output.match(/recommended|suggested|works well with/i);

  // Check image placeholders
  checks.hasImagePlaceholders = 
    output.includes('Pathway Cover Image') ||
    output.includes('Challenge Thumbnail');

  return Object.values(checks).every(Boolean);
}
```

**Implementation:**
- Run validation before showing output to user
- If validation fails, regenerate with correction prompt
- Log validation failures for monitoring

---

## Part 4: AI Governance (Non-Optional)

### Internal Rules (Enforce Immediately)

1. **AI Output is Always Draft**
   - Display warning: "⚠️ AI-Generated Draft — Requires Review"
   - Require explicit approval before publish
   - No auto-publish to live site

2. **Humans Approve Before Publish**
   - PR/review process required
   - Moderation checklist mandatory
   - At least one human reviewer

3. **AI Cannot Bypass PRs**
   - No direct-to-production
   - All content goes through review queue
   - Track approval history

4. **Attribution Marker**
   - Add to every AI-generated piece:
   - "Generated with NoCodeJam AI Assistant — Reviewed before publication"
   - Timestamp of generation
   - Reviewer name/ID

### Monitoring & Audit Trail

**Required Logging:**
- Timestamp of AI generation
- User who triggered AI
- Template used
- Validation pass/fail
- Human reviewer
- Approval/rejection date

**Storage:**
```json
{
  "ai_generation_id": "uuid",
  "timestamp": "2026-01-11T10:30:00Z",
  "user_id": "user123",
  "type": "learning_pathway",
  "template_version": "v1",
  "validation_passed": true,
  "reviewed_by": "user456",
  "status": "approved",
  "published_at": "2026-01-11T11:00:00Z"
}
```

---

## Part 5: Platform Changes (Often Missed)

### A. AI Recommendation History

**Why:** Enables better future suggestions and debugging

**What to Store:**
- User ID
- Recommendation timestamp
- What was recommended (pathway/challenge IDs)
- What user selected
- What user completed
- User feedback (if any)

**Schema:**
```json
{
  "recommendation_id": "uuid",
  "user_id": "user123",
  "timestamp": "2026-01-11T10:00:00Z",
  "user_query": {
    "goal": "learn web development",
    "time_available": "2 weeks",
    "experience": "beginner"
  },
  "recommendations": [
    {
      "pathway_id": "web-dev-101",
      "rank": 1,
      "reason": "Matches beginner level and 2-week timeline"
    }
  ],
  "user_action": {
    "selected": "web-dev-101",
    "enrolled_at": "2026-01-11T10:15:00Z"
  }
}
```

### B. Learning Pathway Discovery Logic

**AI Should Respect:**
- XP progression (don't recommend advanced if beginner XP)
- Difficulty laddering (sequential progression)
- Time availability (don't recommend 8-week pathway if user has 2 weeks)
- Prerequisites (check if user completed required pathways)

**AI Should NOT Recommend:**
- Advanced pathways to beginners
- Long pathways to time-constrained users
- Pathways with unmet prerequisites
- Pathways outside stated interests

**Implementation:**
```javascript
function filterRecommendations(allPathways, userProfile) {
  return allPathways.filter(pathway => {
    // Check XP level
    if (pathway.difficulty === 'advanced' && userProfile.xp < 500) {
      return false;
    }
    
    // Check time availability
    if (pathway.estimatedTime > userProfile.timeAvailable) {
      return false;
    }
    
    // Check prerequisites
    if (pathway.prerequisites.length > 0) {
      const completedIds = userProfile.completedPathways;
      if (!pathway.prerequisites.every(p => completedIds.includes(p))) {
        return false;
      }
    }
    
    return true;
  });
}
```

### C. Empty-State UX

**When:** User first accesses AI Learning Assistant

**Show:**
- Clear explanation of what AI can help with
- Example queries
- Expected behavior
- Limitations

**Example Copy:**
```
🤖 AI Learning Assistant

I can help you:
✓ Find learning pathways that match your goals
✓ Generate custom challenge ideas
✓ Suggest what to learn next

I will ask you about:
• What you want to learn
• How much time you have
• Your experience level

Then I'll recommend pathways tailored to you.

Note: All recommendations are suggestions. You choose what to enroll in.

[Get Started]
```

### D. Abuse & Cost Control

**Before Business Scale, Implement:**

1. **Rate Limiting**
   - 10 AI requests per user per hour
   - 50 AI requests per user per day
   - Soft warning at 80% of limit

2. **Token Caps**
   - Max 4000 tokens per AI generation
   - Prevents excessive API usage
   - Fail gracefully with message

3. **Cost Monitoring**
   - Track API usage per user
   - Daily/weekly spend reports
   - Alert if unusual spike

**User-Facing Messaging:**
```
"You've used 8 of 10 AI assists this hour. 
Resets in 23 minutes."

"You've reached your daily AI assist limit. 
Try again tomorrow or create content manually."
```

---

## Part 6: Testing Checklist

### Before Launch: Test These Scenarios

#### ✅ Template Compliance Tests
- [ ] Generate pathway → verify all sections present
- [ ] Generate challenge → verify template followed
- [ ] Generate reflection → verify evidence focus
- [ ] Try to break template → verify AI rejects

#### ✅ XP Rule Tests
- [ ] Ask AI for XP value → verify refusal
- [ ] Check all outputs → verify placeholder only
- [ ] Attempt to save with AI XP → verify system override

#### ✅ Tool Recommendation Tests
- [ ] Generate challenge → verify "recommended" language
- [ ] Check for "must use" → should find none
- [ ] Verify substitution allowed

#### ✅ Image Placeholder Tests
- [ ] All pathways have placeholder
- [ ] All challenges have placeholder
- [ ] No actual image generation without request

#### ✅ Governance Tests
- [ ] AI output shows draft warning
- [ ] Cannot publish without approval
- [ ] PR template enforced
- [ ] Attribution marker present

#### ✅ Edge Case Tests
- [ ] Request conflicting with rules → verify explanation
- [ ] Ambiguous request → verify clarifying questions
- [ ] Rate limit reached → verify graceful message
- [ ] Invalid template → verify regeneration

---

## Part 7: Tool-Specific Implementation

### For Claude Code:

**Setup:**
1. Create `.claude/` directory in project root
2. Add `system-prompt.md` with Master AI System Prompt (Part 1)
3. Add validation scripts to project
4. Configure tool settings in Claude Code preferences

**File Structure:**
```
your-project/
  .claude/
    system-prompt.md          # Master prompt
    templates/
      pathway-template.json
      challenge-template.json
      reflection-template.json
    validation/
      output-validator.js
  src/
    ai/
      pathway-generator.js
      challenge-generator.js
```

**Usage in Claude Code:**
- Prompts reference `.claude/system-prompt.md` automatically
- Validation runs on AI output before save
- Templates enforced at code level

### For Antigravity:

**Setup:**
1. Go to AI Settings in Antigravity dashboard
2. Paste Master AI System Prompt into "System Instructions"
3. Configure output validation in workflow settings
4. Set up template enforcement rules

**Configuration:**
```yaml
# antigravity-ai-config.yml
ai_assistant:
  system_prompt: "./prompts/nocodejam-system-prompt.md"
  
  templates:
    pathway: "./templates/learning-pathway.json"
    challenge: "./templates/challenge.json"
    reflection: "./templates/reflection.json"
  
  validation:
    enforce_templates: true
    check_xp_rules: true
    check_tool_language: true
  
  rate_limits:
    per_hour: 10
    per_day: 50
```

**Usage in Antigravity:**
- Create "AI Assistant" action in builder
- Link to system prompt
- Configure validation pipeline
- Deploy with governance rules

---

## Part 8: Rollout Plan

### Week 1: Foundation
- [ ] Implement Master AI System Prompt in both tools
- [ ] Set up template enforcement (3 layers)
- [ ] Add validation schema
- [ ] Configure rate limiting

### Week 2: Learn Tab Integration
- [ ] Add AI Learning Assistant button
- [ ] Implement recommendation flow
- [ ] Test pathway discovery logic
- [ ] Add empty-state UX

### Week 3: Challenge AI Enhancement
- [ ] Enhance existing AI Assist with new prompt
- [ ] Add validation layer
- [ ] Implement PR template for AI challenges
- [ ] Test governance rules

### Week 4: Monitoring & Refinement
- [ ] Set up recommendation history tracking
- [ ] Configure audit logging
- [ ] Test all scenarios (Part 6)
- [ ] Train moderators on review process

### Week 5: Soft Launch
- [ ] Enable for limited user group
- [ ] Monitor usage and errors
- [ ] Collect feedback
- [ ] Iterate on prompts

### Week 6: Full Launch
- [ ] Enable for all users
- [ ] Document AI features
- [ ] Create user guide
- [ ] Plan for business account migration

---

## Part 9: Quick Reference

### Command Cheat Sheet

**For Claude Code:**
```bash
# Initialize AI config
mkdir .claude
cp master-prompt.md .claude/system-prompt.md

# Test validation
npm run validate-ai-output

# Generate pathway
claude generate pathway --topic "web development"
```

**For Antigravity:**
```bash
# Deploy AI config
antigravity deploy --config ai-settings.yml

# Test AI assistant
antigravity test ai-assistant

# Monitor usage
antigravity logs ai-assistant --tail
```

### Template Quick Access

**Learning Pathway Template Structure:**
```
1. Metadata (title, difficulty, time, tags)
2. Learning Objectives (3-5 outcomes)
3. Pathway Structure (outline)
4. Challenges (sequence)
5. Reflection Prompts
6. Image Placeholder
7. XP: (calculated by system)
```

**Challenge Template Structure:**
```
1. Metadata (title, difficulty, time)
2. Challenge Description
3. Steps/Tasks
4. Recommended Tools (not required)
5. Reflection Questions
6. Image Placeholder
7. XP: (calculated by system)
```

**Reflection Template Structure:**
```
1. Learning Evidence (what did you do?)
2. Outcome (what did you create?)
3. Insights (what did you learn?)
4. Next Steps (what's next?)
```

---

## Part 10: Success Metrics

### Track These KPIs

**AI Usage:**
- AI requests per day
- AI recommendations accepted vs rejected
- Template compliance rate (should be 100%)
- Validation failure rate (should trend down)

**Quality:**
- Human approval rate for AI content
- Time to review AI drafts
- User satisfaction with AI recommendations
- Accuracy of pathway matching

**Safety:**
- XP rule violations (should be 0)
- Required tool language violations (should be 0)
- Template deviations caught (all should be caught)

**Engagement:**
- Users who try AI assistant
- Pathways discovered via AI
- Challenges created with AI assist
- Completion rate of AI-recommended pathways

---

## Summary: What Works Where

| Feature | Claude Code | Antigravity | Notes |
|---------|-------------|-------------|-------|
| Master System Prompt | ✅ `.claude/` | ✅ AI Settings | Same prompt, different config location |
| Template Enforcement | ✅ Code-level | ✅ Workflow rules | Both support validation |
| Rate Limiting | ✅ Custom code | ✅ Built-in | Antigravity may have native support |
| Validation Schema | ✅ JavaScript | ✅ YAML/JSON | Different syntax, same logic |
| Audit Logging | ✅ Custom | ✅ Built-in | Antigravity may have native support |
| Version Control | ✅ Git-native | ✅ Git or platform | Claude Code more Git-friendly |
| Team Collaboration | ✅ Standard Git | ✅ Platform tools | Depends on team workflow |

**Recommendation:** 
- Start with Claude Code for rapid iteration and testing
- Move to Antigravity if you need no-code deployment and built-in governance
- Run both in parallel to compare which fits your team better

---

## Next Steps

1. **Choose Your Primary Tool:** Test both Claude Code and Antigravity with simple pathway generation
2. **Implement Master Prompt:** Copy Part 1 into your chosen tool
3. **Set Up Validation:** Implement the 3-layer enforcement (Part 2)
4. **Test Core Scenarios:** Run through checklist in Part 6
5. **Start with Learn Tab:** Implement AI Learning Assistant (Phase 1)
6. **Iterate:** Collect feedback, refine prompts, improve validation

---

**Questions or Issues?**
- Prompt conflicts? Re-read Core Rules in Part 1
- Template confusion? Reference Quick Access in Part 9
- Validation failing? Check schemas in Part 3
- Governance unclear? Review Part 4

**Remember:** Templates are mandatory. XP is system-calculated. Tools are recommended. AI output is always draft.

Good luck with implementation! 🚀
