import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ... (System Prompts remain unchanged, omitting for brevity in this replace block, but need to be careful not to delete them if I replace the whole file. 
// Ah, the tool requires me to replace chunks. I will replace the BEGINNING and the END separately to avoid massive payload, or replace the main logic block.)

// Let's redefine the prompts here just to be safe if I target a large block, 
// OR simpler: Insert the imports at the top, then wrap the logic.
// I will assume the previous prompts are fine and focus on the handler.

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

Keep responses conversational and helpful. Don't generate the full challenge yet - just help them refine their idea.`;

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
6. Return ONLY valid JSON, no markdown code blocks or extra text`;

Deno.serve(async (req: Request) => {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Enforce POST-only
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // 1. Authenticate User
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: corsHeaders });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid Token' }), { status: 401, headers: corsHeaders });
    }

    // 2. Initialize Admin Client for Logs & Rate Limits
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const body = await req.json();
    const { action, messages } = body;

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
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. You can make 20 requests per hour." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get API key from environment
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    const useMock = !apiKey;

    // 4. Input Validation (Anti-abuse for token waste)
    const totalMessageLength = JSON.stringify(messages).length;
    if (totalMessageLength > 10000) {
      return new Response(
        JSON.stringify({ error: "Input too long. Please shorten your message." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
        return new Response(
          JSON.stringify({
            message: "This is a mock response (API Key missing). I'm your Challenge Assistant. Tell me about your challenge idea!"
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (action === 'chat-learn') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return new Response(
          JSON.stringify({
            message: "This is a mock response (API Key missing). I'm your Learning Architect. I can help design a learning pathway for you. What do you want to learn?"
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
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
        return new Response(
          JSON.stringify({ challenge: mockChallenge }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // --- Real API Logic (only if apiKey exists) ---
    const MODEL = "claude-sonnet-4-5-20250929";

    // Handle chat action - conversational refinement
    if (action === 'chat') {
      const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey!,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1024,
          system: CHAT_SYSTEM_PROMPT,
          messages: messages
        })
      });

      if (!anthropicResponse.ok) {
        const errorText = await anthropicResponse.text();
        console.error("Anthropic API error:", errorText);
        await logUsage('error', MODEL, 0, errorText);

        return new Response(
          JSON.stringify({ message: `I'm having trouble connecting to my brain right now. (Error: ${anthropicResponse.status})` }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const anthropicData = await anthropicResponse.json();
      const message = anthropicData.content[0].text;

      await logUsage('success', MODEL, message.length);

      return new Response(
        JSON.stringify({ message }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle chat-learn action
    if (action === 'chat-learn') {
      const LEARN_SYSTEM_PROMPT = `You are the NoCodeJam Learning Architect. Your goal is to design personalized Learning Pathways.
      
      A Learning Pathway is a structured curriculum containing:
      1. **Metadata**: Title, Difficulty (Beginner/Intermediate/Advanced), Time Estimate.
      2. **Objectives**: What the learner will achieve.
      3. **Modules**: Logical phases (e.g., "Phase 1: Database Design", "Phase 2: UI Building").
      4. **Recommended Tools**: Suggest specific No-Code tools (e.g., Supabase, FlutterFlow, Bubble) relevant to the goal. *Tools are always recommended, never mandatory.*
      
      Your style:
      - Be structured and encouraging.
      - Ask clarifying questions about experience level and time availability if needed.
      - When proposing a pathway, outline the Modules and key Challenges within them.
      - Do NOT refer to yourself as the "Challenge Assistant". You are the "Learning Architect".`;

      const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey!,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1024,
          system: LEARN_SYSTEM_PROMPT,
          messages: messages
        })
      });

      if (!anthropicResponse.ok) {
        const errorText = await anthropicResponse.text();
        console.error("Anthropic API error (Learn):", errorText);
        await logUsage('error', MODEL, 0, errorText);

        return new Response(
          JSON.stringify({ message: `I'm having trouble providing recommendations right now. (Error: ${anthropicResponse.status})` }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const anthropicData = await anthropicResponse.json();
      const message = anthropicData.content[0].text;

      await logUsage('success', MODEL, message.length);

      return new Response(
        JSON.stringify({ message }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle generate action - create structured challenge from conversation
    if (action === 'generate') {
      const generationMessages = [
        ...messages,
        {
          role: "user",
          content: "Based on our conversation, please generate the complete challenge data in the required JSON format."
        }
      ];

      const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey!,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 4096,
          system: GENERATE_SYSTEM_PROMPT,
          messages: generationMessages
        })
      });

      if (!anthropicResponse.ok) {
        const errorText = await anthropicResponse.text();
        await logUsage('error', MODEL, 0, errorText);
        throw new Error(`Anthropic API Error: ${errorText}`);
      }

      const anthropicData = await anthropicResponse.json();
      let generatedText = anthropicData.content[0].text;

      await logUsage('success', MODEL, generatedText.length);

      // Extract JSON from potential markdown code blocks
      const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || generatedText.match(/```\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        generatedText = jsonMatch[1];
      }

      // Clean up any remaining markdown artifacts
      generatedText = generatedText.trim();
      if (generatedText.startsWith('```')) {
        generatedText = generatedText.substring(3);
      }
      if (generatedText.endsWith('```')) {
        generatedText = generatedText.substring(0, generatedText.length - 3);
      }

      // Parse the JSON
      const challenge = JSON.parse(generatedText);

      // Enforce critical governance rules
      if (!challenge.xp || challenge.xp !== "(calculated by system)") {
        challenge.xp = "(calculated by system)";
      }

      // Ensure estimatedTime is a number
      if (typeof challenge.estimatedTime !== 'number') {
        challenge.estimatedTime = parseInt(challenge.estimatedTime) || 60;
      }

      return new Response(
        JSON.stringify({ challenge }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Invalid action
    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'chat', 'chat-learn', or 'generate'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-challenge:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
