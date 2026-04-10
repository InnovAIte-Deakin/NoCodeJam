import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import {
  buildFallbackChallenge,
  buildFallbackChatMessage,
  buildFallbackLearningMessage,
  extractAnthropicText,
  getPromptLength,
  hasUserMessage,
  isValidAction,
  normalizeChallenge,
  parseGeneratedChallenge,
  sanitizeMessages,
} from "./shared.js";

type ChallengeAction = 'chat' | 'chat-learn' | 'generate';

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface GeneratedChallenge {
  title?: string;
  challengeId?: string;
  associatedPathway?: string;
  associatedModule?: string;
  difficulty?: string;
  estimatedTime?: number | string;
  challengeType?: string;
  recommendedTools?: string[];
  xp?: string;
  coverImageDescription?: string;
  versionNumber?: string;
  fullDescription?: string;
  requirements?: string[];
}

interface ChatSuccessPayload {
  message: string;
  fallbackUsed?: boolean;
  fallbackReason?: string | null;
}

interface GenerateSuccessPayload {
  challenge: ReturnType<typeof normalizeChallenge>["challenge"];
  validationWarnings: string[];
  fallbackUsed?: boolean;
  fallbackReason?: string | null;
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// System prompt for conversational assistant
const CHAT_SYSTEM_PROMPT = `You are a friendly NoCodeJam Challenge Assistant. Help users refine their challenge ideas through conversation.

Your role:
- Ask clarifying questions about their challenge idea
- Suggest difficulty levels, time estimates, and challenge types
- Help them think through learning objectives and success criteria
- Be encouraging and supportive

Key information to gather:
- Challenge title and main concept
- What learners will build/do
- Difficulty level (Beginner/Intermediate/Advanced)
- Estimated time (in minutes, typically 30-240 minutes)
- Challenge type (Build/Modify/Analyse/Deploy/Reflect)
- Recommended tools (not mandatory)
- Success criteria

Response rules:
- Keep replies concise and practical
- If important details are missing, ask 1-2 targeted follow-up questions
- Use recommended tools language, never mandatory wording
- Don't generate the final challenge JSON yet

Keep responses conversational and helpful.`;

const LEARN_SYSTEM_PROMPT = `You are the NoCodeJam Learning Architect. Your goal is to design personalized learning guidance for beginners.

Your role:
- Clarify what the learner wants to build or understand
- Ask about experience level and time available when that affects the answer
- Recommend suitable tools and a sensible next step
- When helpful, outline a lightweight pathway with phases or milestones

Response rules:
- Keep replies concise and structured
- Prefer practical recommendations over abstract explanations
- Tools are always recommended, never required
- Do not refer to yourself as the Challenge Assistant`;

// System prompt for final generation
const GENERATE_SYSTEM_PROMPT = `You are the NoCodeJam Challenge Generator. Based on the conversation, extract and structure the challenge data.

Return a JSON object with this EXACT structure:
{
  "title": "Challenge Title",
  "challengeId": "",
  "associatedPathway": "",
  "associatedModule": "",
  "difficulty": "Beginner|Intermediate|Advanced",
  "estimatedTime": 60,
  "challengeType": "Build|Modify|Analyse|Deploy|Reflect",
  "recommendedTools": ["Tool 1", "Tool 2"],
  "xp": "(calculated by system)",
  "coverImageDescription": "Description for 1200x630px cover image",
  "versionNumber": "1.0",
  "fullDescription": "# Challenge Title\\n\\n**Difficulty:** Beginner\\n**Time Estimate:** 1-2 hours\\n**XP:** (calculated by system)\\n\\n## Challenge Description\\n[Full markdown content following NoCodeJam template]",
  "requirements": ["Requirement 1", "Requirement 2"]
}

CRITICAL RULES:
1. XP must ALWAYS be "(calculated by system)" - NEVER a number
2. Tools should be recommended, not required
3. fullDescription must include complete challenge following NoCodeJam template structure
4. estimatedTime must be a number in minutes (30-240 typical range)
5. challengeType must be one of: Build, Modify, Analyse, Deploy, Reflect
6. requirements must be a string array
7. Return ONLY valid JSON, no markdown code blocks or extra text`;

const MODEL = "claude-sonnet-4-5-20250929";
const MAX_MESSAGE_LENGTH = 10000;

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function callAnthropic(apiKey: string, system: string, messages: AIMessage[], maxTokens: number) {
  const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });

  if (!anthropicResponse.ok) {
    const errorText = await anthropicResponse.text();
    throw new Error(`Anthropic API Error (${anthropicResponse.status}): ${errorText}`);
  }

  const anthropicData = await anthropicResponse.json();
  return extractAnthropicText(anthropicData);
}

Deno.serve(async (req: Request) => {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Enforce POST-only
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    // 1. Authenticate User
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Missing Authorization header' }, 401);
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return jsonResponse({ error: 'Unauthorized: Invalid Token' }, 401);
    }

    // 2. Initialize Admin Client for Logs & Rate Limits
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const body = await req.json();
    const action = body?.action;
    const messages = sanitizeMessages(body?.messages);

    if (!isValidAction(action)) {
      return jsonResponse({ error: "Invalid action. Use 'chat', 'chat-learn', or 'generate'" }, 400);
    }

    if (messages.length === 0) {
      return jsonResponse({ error: "At least one non-empty message is required." }, 400);
    }

    if (!hasUserMessage(messages)) {
      return jsonResponse({ error: "At least one user message is required." }, 400);
    }

    // 3. Rate Limiting Check (20 requests / hour)
    const ONE_HOUR_AGO = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // Only check rate limit if the table exists (it might not if migration didn't run). 
    // We wrap in try specific to DB to avoid crashing if table is missing, though we should encourage migration.
    // For safety, if error is "relation does not exist", we skip rate limiting.
    let rateLimitExceeded = false;

    try {
      const { count, error: countError } = await supabaseAdmin
        .from('ai_generation_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gt('created_at', ONE_HOUR_AGO);

      if (!countError && count !== null && count >= 20) {
        rateLimitExceeded = true;
      }
    } catch (dbErr) {
      console.warn("Rate limit check failed (ignoring):", dbErr);
    }

    if (rateLimitExceeded) {
      return jsonResponse({ error: "Rate limit exceeded. You can make 20 requests per hour." }, 429);
    }

    // Get API key from environment
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    const useMock = !apiKey;

    // 4. Input Validation (Anti-abuse for token waste)
    const totalMessageLength = getPromptLength(messages);
    if (totalMessageLength > MAX_MESSAGE_LENGTH) {
      return jsonResponse({ error: "Input too long. Please shorten your message." }, 400);
    }

    // Helper to log result
    const logUsage = async (status: string, model: string, responseLen: number, errorMsg?: string) => {
      try {
        await supabaseAdmin.from('ai_generation_log').insert({
          user_id: user.id,
          action: action,
          model: model,
          prompt_length: totalMessageLength,
          response_length: responseLen,
          status: status,
          error_message: errorMsg
        });
      } catch (logErr) {
        console.error("Failed to log usage:", logErr);
      }
    };

    if (useMock) {
      console.log("ANTHROPIC_API_KEY not found. Using Mock Mode.");

      await logUsage('success', 'mock', 100); // Log mock usage too

      if (action === 'chat') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const payload: ChatSuccessPayload = {
          message: "This is a mock response (API Key missing). I'm your Challenge Assistant. Tell me about your challenge idea!",
          fallbackUsed: true,
          fallbackReason: "ANTHROPIC_API_KEY is not configured.",
        };
        return jsonResponse(payload);
      }

      if (action === 'chat-learn') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const payload: ChatSuccessPayload = {
          message: "This is a mock response (API Key missing). I'm your Learning Architect. I can help design a learning pathway for you. What do you want to learn?",
          fallbackUsed: true,
          fallbackReason: "ANTHROPIC_API_KEY is not configured.",
        };
        return jsonResponse(payload);
      }

      if (action === 'generate') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockChallenge = {
          title: "Mock AI Challenge",
          challengeId: "mock-123",
          associatedPathway: "Full Stack Mastery",
          associatedModule: "React Basics",
          difficulty: "Beginner",
          estimatedTime: 60,
          challengeType: "Build",
          recommendedTools: ["React", "Vite", "TailwindCSS"],
          xp: "(calculated by system)",
          coverImageDescription: "A futuristic coding interface with purple glow",
          versionNumber: "1.0",
          fullDescription: "# Mock Challenge\n\nThis is a generated mock challenge.",
          requirements: ["Build a form", "Add validation"]
        };
        const payload: GenerateSuccessPayload = {
          challenge: normalizeChallenge(mockChallenge).challenge,
          validationWarnings: [
            "Fallback content is being used because ANTHROPIC_API_KEY is not configured.",
          ],
          fallbackUsed: true,
          fallbackReason: "ANTHROPIC_API_KEY is not configured.",
        };
        return jsonResponse(payload);
      }
    }

    // Handle chat action - conversational refinement
    if (action === 'chat') {
      try {
        const message = await callAnthropic(apiKey!, CHAT_SYSTEM_PROMPT, messages, 1024);
        await logUsage('success', MODEL, message.length);
        const payload: ChatSuccessPayload = { message };
        return jsonResponse(payload);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown AI error";
        console.error("Anthropic API error:", errorMessage);
        await logUsage('error', MODEL, 0, errorMessage);
        const payload: ChatSuccessPayload = {
          message: buildFallbackChatMessage(messages),
          fallbackUsed: true,
          fallbackReason: "AI service was unavailable for conversational refinement.",
        };
        return jsonResponse(payload);
      }
    }

    // Handle chat-learn action
    if (action === 'chat-learn') {
      try {
        const message = await callAnthropic(apiKey!, LEARN_SYSTEM_PROMPT, messages, 1024);
        await logUsage('success', MODEL, message.length);
        const payload: ChatSuccessPayload = { message };
        return jsonResponse(payload);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown AI error";
        console.error("Anthropic API error (Learn):", errorMessage);
        await logUsage('error', MODEL, 0, errorMessage);
        const payload: ChatSuccessPayload = {
          message: buildFallbackLearningMessage(messages),
          fallbackUsed: true,
          fallbackReason: "AI service was unavailable for learning recommendations.",
        };
        return jsonResponse(payload);
      }
    }

    // Handle generate action - create structured challenge from conversation
    if (action === 'generate') {
      try {
        const generationMessages: AIMessage[] = [
          ...messages,
          {
            role: "user",
            content: "Based on our conversation, please generate the complete challenge data in the required JSON format."
          }
        ];

        const generatedText = await callAnthropic(apiKey!, GENERATE_SYSTEM_PROMPT, generationMessages, 4096);
        const challenge = parseGeneratedChallenge(generatedText);
        const normalizedResult = normalizeChallenge(challenge);
        await logUsage('success', MODEL, generatedText.length);
        const payload: GenerateSuccessPayload = {
          challenge: normalizedResult.challenge,
          validationWarnings: normalizedResult.validationWarnings,
        };
        return jsonResponse(payload);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown AI error";
        console.error("Anthropic generation error:", errorMessage);
        await logUsage('error', MODEL, 0, errorMessage);

        const fallbackResult = buildFallbackChallenge(messages);
        const payload: GenerateSuccessPayload = {
          challenge: fallbackResult.challenge,
          validationWarnings: [
            "Fallback challenge draft was created because the AI service could not return a valid response.",
            ...fallbackResult.validationWarnings,
          ],
          fallbackUsed: true,
          fallbackReason: "AI service was unavailable or returned invalid challenge JSON.",
        };
        return jsonResponse(payload);
      }
    }

    return jsonResponse({ error: "Invalid action. Use 'chat', 'chat-learn', or 'generate'" }, 400);

  } catch (error) {
    console.error("Error in generate-challenge:", error);
    return jsonResponse({
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }, 500);
  }
});
