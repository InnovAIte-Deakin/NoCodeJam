# Skill Agents

A consolidated reference for agent “skills” plus related plugin READMEs.

## Included skills
- `edge-function` — Supabase Edge Functions (secure serverless patterns)
- `frontend-design` — distinctive, production-grade UI design skill

## Included reference READMEs (verbatim)
- Superpowers Lab
- Superpowers: Developing for Claude Code
- Superpowers
- Code Review Plugin

## Skill: edge-function

---
name: edge-function
description: Use when creating Supabase Edge Functions with authentication, CORS, error handling, API integrations (especially Anthropic Claude API), or any serverless function that needs production security and reliability
---

# Supabase Edge Functions

## Overview

Create secure, production-ready Supabase Edge Functions with proper authentication, CORS configuration, error handling, input validation, and external API integration patterns.

## When to Use

Use this skill when:
- Creating new Supabase Edge Functions
- Integrating with external APIs (Anthropic, OpenAI, etc.)
- Building authenticated API endpoints
- Creating serverless functions with TypeScript/Deno

**Do NOT use when:**
- Writing client-side code
- Creating database functions (use sql-migration skill)

## Core Patterns

### 1. Function Structure Template

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Environment configuration at top
const CONFIG = {
  anthropicKey: Deno.env.get("ANTHROPIC_API_KEY")!,
  supabaseUrl: Deno.env.get("SUPABASE_URL")!,
  supabaseAnonKey: Deno.env.get("SUPABASE_ANON_KEY")!,
  allowedOrigins: (Deno.env.get("ALLOWED_ORIGINS") || "*").split(","),
  maxMessageLength: parseInt(Deno.env.get("MAX_MESSAGE_LENGTH") || "10000"),
  requestTimeout: parseInt(Deno.env.get("REQUEST_TIMEOUT_MS") || "30000"),
} as const;

// Request/response types
interface FunctionRequest {
  message: string;
  // ... other fields
}

serve(async (req) => {
  const requestId = crypto.randomUUID();

  try {
    // 1. CORS preflight
    if (req.method === "OPTIONS") {
      return corsResponse();
    }

    // 2. Method validation
    if (req.method !== "POST") {
      return errorResponse(405, "Method not allowed", requestId);
    }

    // 3. Environment validation
    validateEnvironment();

    // 4. Authentication
    const user = await authenticateUser(req);

    // 5. Parse and validate input
    const body = await parseAndValidate(req);

    // 6. Business logic
    const result = await processRequest(body, user);

    // 7. Success response
    return successResponse(result, requestId);

  } catch (error) {
    return handleError(error, requestId);
  }
});
```

### 2. CORS Configuration

**Never use wildcard (*) in production.**

```typescript
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": getAllowedOrigin(req),
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400", // 24 hours
};

function getAllowedOrigin(req: Request): string {
  const origin = req.headers.get("origin") || "";
  const allowedOrigins = CONFIG.allowedOrigins;

  // Specific origins only (no wildcard in production)
  if (allowedOrigins.includes(origin)) {
    return origin;
  }

  // Development mode
  if (allowedOrigins.includes("*")) {
    return "*";
  }

  // Default to first allowed origin
  return allowedOrigins[0] || "";
}

function corsResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
```

### 3. Authentication Pattern

```typescript
async function authenticateUser(req: Request) {
  // Extract auth header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    throw new AuthError("Missing authorization header");
  }

  // Create Supabase client with user's token
  const supabase = createClient(
    CONFIG.supabaseUrl,
    CONFIG.supabaseAnonKey,
    {
      global: {
        headers: { Authorization: authHeader },
      },
    }
  );

  // Verify authentication
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthError("Invalid or expired token");
  }

  return user;
}
```

### 4. Input Validation with Limits

```typescript
async function parseAndValidate(req: Request): Promise<FunctionRequest> {
  // Parse with timeout
  const parseTimeout = setTimeout(() => {
    throw new ValidationError("Request body too large or parse timeout");
  }, 5000);

  let body: unknown;
  try {
    body = await req.json();
  } finally {
    clearTimeout(parseTimeout);
  }

  // Validate structure
  if (!body || typeof body !== "object") {
    throw new ValidationError("Request body must be a JSON object");
  }

  const data = body as Record<string, unknown>;

  // Validate required fields
  if (!data.message || typeof data.message !== "string") {
    throw new ValidationError("Field 'message' is required and must be a string");
  }

  // Validate length limits
  if (data.message.length > CONFIG.maxMessageLength) {
    throw new ValidationError(
      `Message exceeds maximum length of ${CONFIG.maxMessageLength} characters`
    );
  }

  if (data.message.trim().length === 0) {
    throw new ValidationError("Message cannot be empty");
  }

  return {
    message: data.message.trim(),
    // ... other validated fields
  };
}
```

### 5. Anthropic Claude API Integration

```typescript
interface AnthropicRequest {
  model: string;
  max_tokens: number;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

async function callClaudeAPI(
  request: AnthropicRequest
): Promise<ClaudeResponse> {
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    CONFIG.requestTimeout
  );

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CONFIG.anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle rate limits
    if (response.status === 429) {
      const retryAfter = response.headers.get("retry-after");
      throw new RateLimitError(
        `Rate limit exceeded. Retry after ${retryAfter} seconds`
      );
    }

    // Handle API errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ExternalAPIError(
        `Anthropic API error: ${response.status}`,
        response.status,
        errorData
      );
    }

    return await response.json();

  } catch (error) {
    clearTimeout(timeoutId);

    // Handle timeout
    if (error instanceof Error && error.name === "AbortError") {
      throw new TimeoutError(
        `API request timeout after ${CONFIG.requestTimeout}ms`
      );
    }

    throw error;
  }
}
```

### 6. Error Handling Hierarchy

```typescript
// Base error class
class FunctionError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Specific error types
class AuthError extends FunctionError {
  constructor(message: string) {
    super(message, 401, "AUTH_ERROR");
  }
}

class ValidationError extends FunctionError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

class RateLimitError extends FunctionError {
  constructor(message: string) {
    super(message, 429, "RATE_LIMIT_ERROR");
  }
}

class TimeoutError extends FunctionError {
  constructor(message: string) {
    super(message, 504, "TIMEOUT_ERROR");
  }
}

class ExternalAPIError extends FunctionError {
  constructor(
    message: string,
    statusCode: number,
    public apiError?: unknown
  ) {
    super(message, 502, "EXTERNAL_API_ERROR");
  }
}

// Error response handler
function handleError(error: unknown, requestId: string): Response {
  console.error(`[${requestId}] Error:`, error);

  // Known error types
  if (error instanceof FunctionError) {
    return errorResponse(error.statusCode, error.message, requestId, error.code);
  }

  // Unknown errors - don't leak details
  return errorResponse(
    500,
    "Internal server error",
    requestId,
    "INTERNAL_ERROR"
  );
}
```

### 7. Response Helpers

```typescript
function errorResponse(
  status: number,
  message: string,
  requestId: string,
  code?: string
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        message,
        code: code || "ERROR",
        requestId,
      },
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS,
      },
    }
  );
}

function successResponse(data: unknown, requestId: string): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      requestId,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS,
      },
    }
  );
}
```

### 8. Environment Validation

```typescript
function validateEnvironment(): void {
  const required = [
    "ANTHROPIC_API_KEY",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
  ];

  const missing = required.filter((key) => !Deno.env.get(key));

  if (missing.length > 0) {
    // Log for debugging but don't expose in error response
    console.error(`Missing environment variables: ${missing.join(", ")}`);
    throw new FunctionError("Service configuration error", 500, "CONFIG_ERROR");
  }
}
```

## Quick Reference

| Pattern | Implementation | Notes |
|---------|----------------|-------|
| CORS | Validate origin from allowlist | Never use `*` in production |
| Auth | `supabase.auth.getUser()` | Validate token on every request |
| Input limits | Max length checks | Prevent abuse and DoS |
| Timeouts | AbortController + setTimeout | Set timeout on external calls |
| Error codes | Specific error classes | Client can handle errors properly |
| Request ID | crypto.randomUUID() | Essential for debugging |
| Environment | Validate on startup | Fail fast if misconfigured |
| Rate limits | Handle 429 responses | Retry-After header |

## Security Checklist

- [ ] CORS configured with specific origins (not `*`)
- [ ] Authentication required and validated
- [ ] Input length limits enforced
- [ ] Request timeout configured
- [ ] Environment variables validated
- [ ] Error messages don't leak sensitive data
- [ ] API keys never logged or exposed
- [ ] Rate limiting handled gracefully
- [ ] Request IDs for tracing
- [ ] AbortController for all external API calls

## Complete Example

See the template in "Function Structure Template" section above for a complete working example.

## Red Flags - STOP and Fix

| Thought | Reality |
|---------|---------|
| "CORS * is fine for now" | Gets deployed to production. Use allowlist. |
| "I'll add auth later" | Later never comes. Require auth from start. |
| "Input validation can be loose" | Users send malicious data. Validate strictly. |
| "Errors should be descriptive" | Leaks implementation details. Generic messages only. |
| "No timeout needed" | Function hangs forever. Always set timeouts. |
| "Environment check at request time" | Wastes cycles. Validate once at startup. |
| "Rate limits won't happen" | They will. Handle 429 responses. |
| "Request IDs are overkill" | Impossible to debug production. Always include. |

**All of these mean: Follow this skill's patterns. No shortcuts.**

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Wildcard CORS | Security vulnerability | Use origin allowlist |
| No input length limits | DoS attack vector | Enforce max lengths |
| No request timeout | Functions hang indefinitely | Use AbortController |
| Exposing error details | Information disclosure | Generic error messages |
| Missing CORS on errors | CORS failures on error path | Include CORS headers on all responses |
| API keys in logs | Credential leakage | Never log sensitive data |
| No rate limit handling | Function fails on burst traffic | Catch 429, return appropriate error |
| Trusting input types | Runtime type errors | Validate all inputs |

## Real-World Impact

**Without these patterns:**
- CORS wildcard = Cross-site attacks
- No timeouts = Functions hang and cost money
- No input limits = DoS attacks succeed
- Detailed errors = Attackers learn system internals
- No auth = Public access to sensitive operations

**With these patterns:**
- Secure CORS prevents unauthorized access
- Timeouts prevent runaway costs
- Input limits stop abuse
- Generic errors protect implementation
- Auth ensures only authorized users access functions


## Skill: frontend-design

---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.


## Appendix A — README: Superpowers Lab

# Superpowers Lab

Experimental skills for [Claude Code Superpowers](https://github.com/obra/superpowers) - new techniques and tools under active development.

## What is this?

This plugin contains experimental skills that extend Claude Code's capabilities with new techniques that are still being refined and tested. These skills are functional but may evolve based on real-world usage and feedback.

## Current Skills

### using-tmux-for-interactive-commands

Enables Claude Code to control interactive CLI tools (vim, git rebase -i, menuconfig, REPLs, etc.) through tmux sessions.

**Use cases:**
- Interactive text editors (vim, nano)
- Terminal UI tools (menuconfig, htop)
- Interactive REPLs (Python, Node, etc.)
- Interactive git operations (rebase -i, add -p)
- Any tool requiring keyboard navigation and real-time interaction

**How it works:** Creates detached tmux sessions, sends keystrokes programmatically, and captures terminal output to enable automation of traditionally manual workflows.

See [skills/using-tmux-for-interactive-commands/SKILL.md](skills/using-tmux-for-interactive-commands/SKILL.md) for full documentation.

## Installation

```bash
# Install the plugin
claude-code plugin install https://github.com/obra/superpowers-lab

# Or add to your claude.json
{
  "plugins": [
    "https://github.com/obra/superpowers-lab"
  ]
}
```

## Requirements

- tmux must be installed on your system
- Skills are tested on Linux/macOS (tmux required)

## Experimental Status

Skills in this plugin are:
- ✅ Functional and tested
- 🧪 Under active refinement
- 📝 May evolve based on usage
- 🔬 Open to feedback and improvements

## Contributing

Found a bug or have an improvement? Please open an issue or PR!

## Related Projects

- [superpowers](https://github.com/obra/superpowers) - Core skills library for Claude Code
- [superpowers-chrome](https://github.com/obra/superpowers-chrome) - Browser automation skills

## License

MIT License - see [LICENSE](LICENSE) for details


## Appendix B — README: Superpowers: Developing for Claude Code

# Superpowers: Developing for Claude Code

A Claude Code plugin providing skills and comprehensive documentation for building plugins, skills, MCP servers, and other Claude Code extensions.

## Features

### Skills

#### working-with-claude-code
Complete, authoritative documentation for Claude Code directly from docs.claude.com.

- **42 documentation files** covering all Claude Code features
- **Self-update script** to fetch latest docs
- **Quick reference table** for common tasks
- **Progressive disclosure** - load only what you need

Topics covered:
- Plugin development
- Skill creation
- MCP server integration
- Hooks configuration
- CLI commands
- Integrations (VS Code, JetBrains, GitHub Actions, etc.)
- Configuration, security, networking
- Troubleshooting

#### developing-claude-code-plugins
Streamlined workflows and patterns for creating Claude Code plugins.

- **Step-by-step workflows** for plugin creation
- **Component guides** for skills, commands, hooks, and MCP servers
- **Common patterns** with working examples
- **Debugging tips** and troubleshooting
- **Best practices** for portability and testing
- **References this plugin** as a working example

Use this skill to make plugin development faster and easier - it synthesizes official docs into actionable steps.

## Installation

### Development Mode

1. Add the development marketplace:
```bash
claude
/plugin marketplace add /path/to/superpowers-developing-for-claude-code
```

2. Install the plugin:
```bash
/plugin install superpowers-developing-for-claude-code@superpowers-developing-for-claude-code-dev
```

3. Restart Claude Code

## Usage

The skills are automatically available to Claude when working on tasks that match their descriptions.

### Updating Documentation

To fetch the latest Claude Code documentation:

```bash
node ~/.claude/plugins/plugin:superpowers-developing-for-claude-code@superpowers-developing-for-claude-code-dev/skills/working-with-claude-code/scripts/update_docs.js
```

Or ask Claude to update it:
```
Update the Claude Code documentation in the working-with-claude-code skill
```

## Development

### Structure

```
superpowers-developing-for-claude-code/
├── .claude-plugin/
│   ├── plugin.json           # Plugin metadata
│   └── marketplace.json      # Dev marketplace config
├── skills/
│   ├── working-with-claude-code/
│   │   ├── SKILL.md          # Documentation access skill
│   │   ├── scripts/
│   │   │   └── update_docs.js
│   │   └── references/       # 42 documentation files
│   └── developing-claude-code-plugins/
│       └── SKILL.md          # Plugin development workflows
└── README.md
```

### Future Skills

Skills to consider adding:
- `testing-claude-code-plugins` - Testing strategies and validation
- `distributing-plugins` - Publishing and marketplace guidelines
- `writing-mcp-servers` - MCP server development guide

## License

MIT License - See LICENSE file

## Author

Jesse Vincent <jesse@fsck.com>

## Repository

https://github.com/obra/superpowers-developing-for-claude-code


## Appendix C — README: Superpowers

# Superpowers

Superpowers is a complete software development workflow for your coding agents, built on top of a set of composable "skills" and some initial instructions that make sure your agent uses them.

## How it works

It starts from the moment you fire up your coding agent. As soon as it sees that you're building something, it *doesn't* just jump into trying to write code. Instead, it steps back and asks you what you're really trying to do. 

Once it's teased a spec out of the conversation, it shows it to you in chunks short enough to actually read and digest. 

After you've signed off on the design, your agent puts together an implementation plan that's clear enough for an enthusiastic junior engineer with poor taste, no judgement, no project context, and an aversion to testing to follow. It emphasizes true red/green TDD, YAGNI (You Aren't Gonna Need It), and DRY. 

Next up, once you say "go", it launches a *subagent-driven-development* process, having agents work through each engineering task, inspecting and reviewing their work, and continuing forward. It's not uncommon for Claude to be able to work autonomously for a couple hours at a time without deviating from the plan you put together.

There's a bunch more to it, but that's the core of the system. And because the skills trigger automatically, you don't need to do anything special. Your coding agent just has Superpowers.


## Sponsorship

If Superpowers has helped you do stuff that makes money and you are so inclined, I'd greatly appreciate it if you'd consider [sponsoring my opensource work](https://github.com/sponsors/obra).

Thanks! 

- Jesse


## Installation

**Note:** Installation differs by platform. Claude Code has a built-in plugin system. Codex and OpenCode require manual setup.

### Claude Code (via Plugin Marketplace)

In Claude Code, register the marketplace first:

```bash
/plugin marketplace add obra/superpowers-marketplace
```

Then install the plugin from this marketplace:

```bash
/plugin install superpowers@superpowers-marketplace
```

### Verify Installation

Check that commands appear:

```bash
/help
```

```
# Should see:
# /superpowers:brainstorm - Interactive design refinement
# /superpowers:write-plan - Create implementation plan
# /superpowers:execute-plan - Execute plan in batches
```

### Codex

Tell Codex:

```
Fetch and follow instructions from https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.codex/INSTALL.md
```

**Detailed docs:** [docs/README.codex.md](docs/README.codex.md)

### OpenCode

Tell OpenCode:

```
Fetch and follow instructions from https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.opencode/INSTALL.md
```

**Detailed docs:** [docs/README.opencode.md](docs/README.opencode.md)

## The Basic Workflow

1. **brainstorming** - Activates before writing code. Refines rough ideas through questions, explores alternatives, presents design in sections for validation. Saves design document.

2. **using-git-worktrees** - Activates after design approval. Creates isolated workspace on new branch, runs project setup, verifies clean test baseline.

3. **writing-plans** - Activates with approved design. Breaks work into bite-sized tasks (2-5 minutes each). Every task has exact file paths, complete code, verification steps.

4. **subagent-driven-development** or **executing-plans** - Activates with plan. Dispatches fresh subagent per task with two-stage review (spec compliance, then code quality), or executes in batches with human checkpoints.

5. **test-driven-development** - Activates during implementation. Enforces RED-GREEN-REFACTOR: write failing test, watch it fail, write minimal code, watch it pass, commit. Deletes code written before tests.

6. **requesting-code-review** - Activates between tasks. Reviews against plan, reports issues by severity. Critical issues block progress.

7. **finishing-a-development-branch** - Activates when tasks complete. Verifies tests, presents options (merge/PR/keep/discard), cleans up worktree.

**The agent checks for relevant skills before any task.** Mandatory workflows, not suggestions.

## What's Inside

### Skills Library

**Testing**
- **test-driven-development** - RED-GREEN-REFACTOR cycle (includes testing anti-patterns reference)

**Debugging**
- **systematic-debugging** - 4-phase root cause process (includes root-cause-tracing, defense-in-depth, condition-based-waiting techniques)
- **verification-before-completion** - Ensure it's actually fixed

**Collaboration** 
- **brainstorming** - Socratic design refinement
- **writing-plans** - Detailed implementation plans
- **executing-plans** - Batch execution with checkpoints
- **dispatching-parallel-agents** - Concurrent subagent workflows
- **requesting-code-review** - Pre-review checklist
- **receiving-code-review** - Responding to feedback
- **using-git-worktrees** - Parallel development branches
- **finishing-a-development-branch** - Merge/PR decision workflow
- **subagent-driven-development** - Fast iteration with two-stage review (spec compliance, then code quality)

**Meta**
- **writing-skills** - Create new skills following best practices (includes testing methodology)
- **using-superpowers** - Introduction to the skills system

## Philosophy

- **Test-Driven Development** - Write tests first, always
- **Systematic over ad-hoc** - Process over guessing
- **Complexity reduction** - Simplicity as primary goal
- **Evidence over claims** - Verify before declaring success

Read more: [Superpowers for Claude Code](https://blog.fsck.com/2025/10/09/superpowers/)

## Contributing

Skills live directly in this repository. To contribute:

1. Fork the repository
2. Create a branch for your skill
3. Follow the `writing-skills` skill for creating and testing new skills
4. Submit a PR

See `skills/writing-skills/SKILL.md` for the complete guide.

## Updating

Skills update automatically when you update the plugin:

```bash
/plugin update superpowers
```

## License

MIT License - see LICENSE file for details

## Support

- **Issues**: https://github.com/obra/superpowers/issues
- **Marketplace**: https://github.com/obra/superpowers-marketplace


## Appendix D — README: Code Review Plugin

# Code Review Plugin

Automated code review for pull requests using multiple specialized agents with confidence-based scoring to filter false positives.

## Overview

The Code Review Plugin automates pull request review by launching multiple agents in parallel to independently audit changes from different perspectives. It uses confidence scoring to filter out false positives, ensuring only high-quality, actionable feedback is posted.

## Commands

### `/code-review`

Performs automated code review on a pull request using multiple specialized agents.

**What it does:**
1. Checks if review is needed (skips closed, draft, trivial, or already-reviewed PRs)
2. Gathers relevant CLAUDE.md guideline files from the repository
3. Summarizes the pull request changes
4. Launches 4 parallel agents to independently review:
   - **Agents #1 & #2**: Audit for CLAUDE.md compliance
   - **Agent #3**: Scan for obvious bugs in changes
   - **Agent #4**: Analyze git blame/history for context-based issues
5. Scores each issue 0-100 for confidence level
6. Filters out issues below 80 confidence threshold
7. Posts review comment with high-confidence issues only

**Usage:**
```bash
/code-review
```

**Example workflow:**
```bash
# On a PR branch, run:
/code-review

# Claude will:
# - Launch 4 review agents in parallel
# - Score each issue for confidence
# - Post comment with issues ≥80 confidence
# - Skip posting if no high-confidence issues found
```

**Features:**
- Multiple independent agents for comprehensive review
- Confidence-based scoring reduces false positives (threshold: 80)
- CLAUDE.md compliance checking with explicit guideline verification
- Bug detection focused on changes (not pre-existing issues)
- Historical context analysis via git blame
- Automatic skipping of closed, draft, or already-reviewed PRs
- Links directly to code with full SHA and line ranges

**Review comment format:**
```markdown
## Code review

Found 3 issues:

1. Missing error handling for OAuth callback (CLAUDE.md says "Always handle OAuth errors")

https://github.com/owner/repo/blob/abc123.../src/auth.ts#L67-L72

2. Memory leak: OAuth state not cleaned up (bug due to missing cleanup in finally block)

https://github.com/owner/repo/blob/abc123.../src/auth.ts#L88-L95

3. Inconsistent naming pattern (src/conventions/CLAUDE.md says "Use camelCase for functions")

https://github.com/owner/repo/blob/abc123.../src/utils.ts#L23-L28
```

**Confidence scoring:**
- **0**: Not confident, false positive
- **25**: Somewhat confident, might be real
- **50**: Moderately confident, real but minor
- **75**: Highly confident, real and important
- **100**: Absolutely certain, definitely real

**False positives filtered:**
- Pre-existing issues not introduced in PR
- Code that looks like a bug but isn't
- Pedantic nitpicks
- Issues linters will catch
- General quality issues (unless in CLAUDE.md)
- Issues with lint ignore comments

## Installation

This plugin is included in the Claude Code repository. The command is automatically available when using Claude Code.

## Best Practices

### Using `/code-review`
- Maintain clear CLAUDE.md files for better compliance checking
- Trust the 80+ confidence threshold - false positives are filtered
- Run on all non-trivial pull requests
- Review agent findings as a starting point for human review
- Update CLAUDE.md based on recurring review patterns

### When to use
- All pull requests with meaningful changes
- PRs touching critical code paths
- PRs from multiple contributors
- PRs where guideline compliance matters

### When not to use
- Closed or draft PRs (automatically skipped anyway)
- Trivial automated PRs (automatically skipped)
- Urgent hotfixes requiring immediate merge
- PRs already reviewed (automatically skipped)

## Workflow Integration

### Standard PR review workflow:
```bash
# Create PR with changes
/code-review

# Review the automated feedback
# Make any necessary fixes
# Merge when ready
```

### As part of CI/CD:
```bash
# Trigger on PR creation or update
# Automatically posts review comments
# Skip if review already exists
```

## Requirements

- Git repository with GitHub integration
- GitHub CLI (`gh`) installed and authenticated
- CLAUDE.md files (optional but recommended for guideline checking)

## Troubleshooting

### Review takes too long

**Issue**: Agents are slow on large PRs

**Solution**:
- Normal for large changes - agents run in parallel
- 4 independent agents ensure thoroughness
- Consider splitting large PRs into smaller ones

### Too many false positives

**Issue**: Review flags issues that aren't real

**Solution**:
- Default threshold is 80 (already filters most false positives)
- Make CLAUDE.md more specific about what matters
- Consider if the flagged issue is actually valid

### No review comment posted

**Issue**: `/code-review` runs but no comment appears

**Solution**:
Check if:
- PR is closed (reviews skipped)
- PR is draft (reviews skipped)
- PR is trivial/automated (reviews skipped)
- PR already has review (reviews skipped)
- No issues scored ≥80 (no comment needed)

### Link formatting broken

**Issue**: Code links don't render correctly in GitHub

**Solution**:
Links must follow this exact format:
```
https://github.com/owner/repo/blob/[full-sha]/path/file.ext#L[start]-L[end]
```
- Must use full SHA (not abbreviated)
- Must use `#L` notation
- Must include line range with at least 1 line of context

### GitHub CLI not working

**Issue**: `gh` commands fail

**Solution**:
- Install GitHub CLI: `brew install gh` (macOS) or see [GitHub CLI installation](https://cli.github.com/)
- Authenticate: `gh auth login`
- Verify repository has GitHub remote

## Tips

- **Write specific CLAUDE.md files**: Clear guidelines = better reviews
- **Include context in PRs**: Helps agents understand intent
- **Use confidence scores**: Issues ≥80 are usually correct
- **Iterate on guidelines**: Update CLAUDE.md based on patterns
- **Review automatically**: Set up as part of PR workflow
- **Trust the filtering**: Threshold prevents noise

## Configuration

### Adjusting confidence threshold

The default threshold is 80. To adjust, modify the command file at `commands/code-review.md`:
```markdown
Filter out any issues with a score less than 80.
```

Change `80` to your preferred threshold (0-100).

### Customizing review focus

Edit `commands/code-review.md` to add or modify agent tasks:
- Add security-focused agents
- Add performance analysis agents
- Add accessibility checking agents
- Add documentation quality checks

## Technical Details

### Agent architecture
- **2x CLAUDE.md compliance agents**: Redundancy for guideline checks
- **1x bug detector**: Focused on obvious bugs in changes only
- **1x history analyzer**: Context from git blame and history
- **Nx confidence scorers**: One per issue for independent scoring

### Scoring system
- Each issue independently scored 0-100
- Scoring considers evidence strength and verification
- Threshold (default 80) filters low-confidence issues
- For CLAUDE.md issues: verifies guideline explicitly mentions it

### GitHub integration
Uses `gh` CLI for:
- Viewing PR details and diffs
- Fetching repository data
- Reading git blame and history
- Posting review comments

## Author

Boris Cherny (boris@anthropic.com)

## Version

1.0.0
