import test from "node:test";
import assert from "node:assert/strict";

import {
  buildFallbackChallenge,
  buildFallbackChatMessage,
  buildFallbackLearningMessage,
  extractAnthropicText,
  hasUserMessage,
  isValidAction,
  normalizeChallenge,
  parseGeneratedChallenge,
  sanitizeMessages,
} from "../supabase/functions/generate-challenge/shared.js";

test("accepts only supported AI Assist actions", () => {
  assert.equal(isValidAction("chat"), true);
  assert.equal(isValidAction("chat-learn"), true);
  assert.equal(isValidAction("generate"), true);
  assert.equal(isValidAction("unknown"), false);
});

test("sanitizes sample conversation input before sending to AI", () => {
  const rawMessages = [
    { role: "assistant", content: "  Welcome to AI Assist  " },
    { role: "user", content: "   " },
    { role: "system", content: "should be ignored" },
    null,
    { role: "user", content: "Build a beginner Airtable CRM challenge" },
  ];

  const sanitized = sanitizeMessages(rawMessages);

  assert.deepEqual(sanitized, [
    { role: "assistant", content: "Welcome to AI Assist" },
    { role: "user", content: "Build a beginner Airtable CRM challenge" },
  ]);
});

test("keeps only the latest 20 valid messages", () => {
  const rawMessages = Array.from({ length: 25 }, (_, index) => ({
    role: index % 2 === 0 ? "user" : "assistant",
    content: `message-${index}`,
  }));

  const sanitized = sanitizeMessages(rawMessages);

  assert.equal(sanitized.length, 20);
  assert.equal(sanitized[0].content, "message-5");
  assert.equal(sanitized.at(-1)?.content, "message-24");
});

test("requires at least one user message for actionable AI assist flows", () => {
  assert.equal(
    hasUserMessage([
      { role: "assistant", content: "Tell me what you want to build." },
      { role: "assistant", content: "I can help with challenge scope." },
    ]),
    false
  );

  assert.equal(
    hasUserMessage([
      { role: "assistant", content: "Tell me what you want to build." },
      { role: "user", content: "A feedback portal for student teams" },
    ]),
    true
  );
});

test("extracts text-only content from an Anthropic-style payload", () => {
  const message = extractAnthropicText({
    content: [
      { type: "thinking", text: "hidden" },
      { type: "text", text: "First reply" },
      { type: "text", text: "Second reply" },
    ],
  });

  assert.equal(message, "First reply\n\nSecond reply");
});

test("builds a challenge-chat fallback prompt from the latest sample input", () => {
  const fallback = buildFallbackChatMessage([
    { role: "assistant", content: "What do you want to build?" },
    { role: "user", content: "A habit tracker with Supabase auth" },
  ]);

  assert.match(fallback, /habit tracker with Supabase auth/i);
  assert.match(fallback, /difficulty/i);
  assert.match(fallback, /time estimate/i);
});

test("builds a learning-chat fallback prompt from the latest sample input", () => {
  const fallback = buildFallbackLearningMessage([
    { role: "assistant", content: "What do you want to learn?" },
    { role: "user", content: "I want to learn Lovable for landing pages" },
  ]);

  assert.match(fallback, /Lovable for landing pages/i);
  assert.match(fallback, /experience level/i);
  assert.match(fallback, /available time/i);
});

test("parses and normalizes generated challenge JSON from a fenced AI response", () => {
  const generated = parseGeneratedChallenge(`\`\`\`json
{
  "title": "  Airtable CRM Sprint Challenge  ",
  "difficulty": "Beginner",
  "estimatedTime": "90",
  "challengeType": "Build",
  "recommendedTools": ["Airtable", "", "Softr"],
  "xp": "150",
  "fullDescription": "Learners must use Airtable to build a CRM.",
  "requirements": ["Create contacts", "", "Track follow-ups"]
}
\`\`\``);

  const normalized = normalizeChallenge(generated);

  assert.equal(normalized.challenge.title, "Airtable CRM Sprint Challenge");
  assert.equal(normalized.challenge.estimatedTime, 90);
  assert.deepEqual(normalized.challenge.recommendedTools, ["Airtable", "Softr"]);
  assert.deepEqual(normalized.challenge.requirements, ["Create contacts", "Track follow-ups"]);
  assert.equal(normalized.challenge.xp, "(calculated by system)");
  assert.ok(
    normalized.validationWarnings.some((warning) =>
      warning.includes("AI generated specific XP. Reset to system-calculated.")
    )
  );
  assert.ok(
    normalized.validationWarnings.some((warning) =>
      warning.includes("restrictive language")
    )
  );
});

test("returns a usable fallback challenge draft for generate failures", () => {
  const fallback = buildFallbackChallenge([
    { role: "assistant", content: "Tell me your idea." },
    { role: "user", content: "Build a team expense approval workflow" },
  ]);

  assert.match(fallback.challenge.title, /Team Expense Approval Workflow/i);
  assert.equal(fallback.challenge.difficulty, "Beginner");
  assert.equal(fallback.challenge.challengeType, "Build");
  assert.equal(fallback.challenge.estimatedTime, 60);
  assert.ok(fallback.challenge.fullDescription.includes("Build a team expense approval workflow"));
  assert.equal(fallback.validationWarnings.length, 0);
});
