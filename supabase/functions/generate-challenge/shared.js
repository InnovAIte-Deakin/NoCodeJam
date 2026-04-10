export const RESTRICTED_TERMS = ["must use", "required", "mandatory", "have to use"];

export function isValidAction(value) {
  return value === "chat" || value === "chat-learn" || value === "generate";
}

export function sanitizeMessages(input) {
  if (!Array.isArray(input)) return [];

  return input
    .map((message) => {
      if (!message || typeof message !== "object") return null;

      const role = message.role;
      const content = message.content;

      if ((role !== "user" && role !== "assistant") || typeof content !== "string") {
        return null;
      }

      const trimmedContent = content.trim();
      if (!trimmedContent) return null;

      return {
        role,
        content: trimmedContent,
      };
    })
    .filter((message) => message !== null)
    .slice(-20);
}

export function getPromptLength(messages) {
  return JSON.stringify(messages).length;
}

export function hasUserMessage(messages) {
  return Array.isArray(messages) && messages.some((message) => message?.role === "user");
}

export function extractAnthropicText(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid AI response payload");
  }

  const content = payload.content;
  if (!Array.isArray(content)) {
    throw new Error("AI response content missing");
  }

  const text = content
    .filter((block) => block?.type === "text" && typeof block.text === "string")
    .map((block) => block.text?.trim() ?? "")
    .filter(Boolean)
    .join("\n\n");

  if (!text) {
    throw new Error("AI response text missing");
  }

  return text;
}

export function getLastUserMessage(messages) {
  const userMessages = messages.filter((message) => message.role === "user");
  return userMessages[userMessages.length - 1]?.content ?? "";
}

export function toTitleCase(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function buildFallbackChatMessage(messages) {
  const latestPrompt = getLastUserMessage(messages);

  if (!latestPrompt) {
    return "I'm having trouble reaching the AI service. For now, tell me three things: what the learner should build, the difficulty level, and the estimated time.";
  }

  return `I'm having trouble reaching the AI service right now, but we can keep going. Based on "${latestPrompt}", tell me the learner outcome, target difficulty, and time estimate, and I'll help you shape the challenge manually.`;
}

export function buildFallbackLearningMessage(messages) {
  const latestPrompt = getLastUserMessage(messages);

  if (!latestPrompt) {
    return "I'm having trouble reaching the AI service. For now, tell me what you want to learn, your current experience level, and how much time you have.";
  }

  return `I'm having trouble reaching the AI service right now, but we can still narrow it down. Based on "${latestPrompt}", reply with your experience level and available time, and we can outline a practical next step manually.`;
}

export function stripMarkdownCodeFence(value) {
  const jsonMatch = value.match(/```json\s*([\s\S]*?)\s*```/) ?? value.match(/```\s*([\s\S]*?)\s*```/);
  const raw = jsonMatch ? jsonMatch[1] : value;
  return raw.trim().replace(/^```/, "").replace(/```$/, "").trim();
}

export function parseGeneratedChallenge(text) {
  const cleanedText = stripMarkdownCodeFence(text);
  const parsed = JSON.parse(cleanedText);

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("AI returned an invalid challenge payload");
  }

  return parsed;
}

export function normalizeChallenge(challenge) {
  const validationWarnings = [];

  const normalizedChallenge = {
    title: typeof challenge.title === "string" ? challenge.title.trim() : "",
    challengeId: typeof challenge.challengeId === "string" ? challenge.challengeId : "",
    associatedPathway: typeof challenge.associatedPathway === "string" ? challenge.associatedPathway : "",
    associatedModule: typeof challenge.associatedModule === "string" ? challenge.associatedModule : "",
    difficulty: typeof challenge.difficulty === "string" ? challenge.difficulty : "",
    estimatedTime: typeof challenge.estimatedTime === "number"
      ? challenge.estimatedTime
      : parseInt(String(challenge.estimatedTime ?? ""), 10) || 60,
    challengeType: typeof challenge.challengeType === "string" ? challenge.challengeType : "",
    recommendedTools: Array.isArray(challenge.recommendedTools)
      ? challenge.recommendedTools.filter((tool) => typeof tool === "string" && tool.trim().length > 0)
      : [],
    xp: typeof challenge.xp === "string" ? challenge.xp : "(calculated by system)",
    coverImageDescription: typeof challenge.coverImageDescription === "string" ? challenge.coverImageDescription : "",
    versionNumber: typeof challenge.versionNumber === "string" ? challenge.versionNumber : "1.0",
    fullDescription: typeof challenge.fullDescription === "string" ? challenge.fullDescription : "",
    requirements: Array.isArray(challenge.requirements)
      ? challenge.requirements.filter((item) => typeof item === "string" && item.trim().length > 0)
      : [],
  };

  if (normalizedChallenge.xp !== "(calculated by system)") {
    normalizedChallenge.xp = "(calculated by system)";
    validationWarnings.push("AI generated specific XP. Reset to system-calculated.");
  }

  const textToCheck = `${normalizedChallenge.recommendedTools.join(" ")} ${normalizedChallenge.fullDescription}`.toLowerCase();
  for (const term of RESTRICTED_TERMS) {
    if (textToCheck.includes(term)) {
      validationWarnings.push(`Content contains restrictive language ('${term}'). Tools should be 'recommended'.`);
    }
  }

  const requiredFields = ["title", "difficulty", "estimatedTime", "challengeType"];
  for (const field of requiredFields) {
    if (!normalizedChallenge[field]) {
      validationWarnings.push(`Missing required field: ${field}`);
    }
  }

  return { challenge: normalizedChallenge, validationWarnings };
}

export function buildFallbackChallenge(messages) {
  const latestPrompt = getLastUserMessage(messages);
  const titleSeed = latestPrompt || "Custom NoCode Challenge";
  const title = toTitleCase(titleSeed) || "Custom NoCode Challenge";
  const safeTitle = title.endsWith("Challenge") ? title : `${title} Challenge`;

  return normalizeChallenge({
    title: safeTitle,
    difficulty: "Beginner",
    estimatedTime: 60,
    challengeType: "Build",
    recommendedTools: ["Supabase", "Vite"],
    xp: "(calculated by system)",
    coverImageDescription: "A clean product mockup showing a no-code workflow in progress.",
    versionNumber: "1.0",
    fullDescription: `# ${safeTitle}

**Difficulty:** Beginner
**Time Estimate:** 60 minutes
**XP:** (calculated by system)

## Challenge Description
Create a first draft of this challenge based on the request below, then refine it manually before submission.

### User Request
${latestPrompt || "No detailed request was provided."}

## Suggested Approach
- Define the main user outcome
- Build a small working prototype
- Review the result and document what was learned
`,
    requirements: [
      "Create a working first version of the requested challenge",
      "Document the expected learner outcome",
      "Review the generated draft before submitting",
    ],
  });
}
