import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// System prompt for pathway generation
const GENERATE_PATHWAY_PROMPT = `You are the NoCodeJam Learning Pathway Architect. Generate a structured learning pathway based on the user's goals.

Return a JSON object with this EXACT structure:
{
  "title": "Pathway Title",
  "slug": "url-friendly-slug",
  "description": "Detailed description of what learners will achieve",
  "difficulty": "Beginner|Intermediate|Advanced|Expert",
  "estimated_time": 180,
  "cover_image": "Description for pathway cover image",
  "modules": [
    {
      "title": "Module 1: Getting Started",
      "description": "Module description",
      "sequence_order": 1,
      "challenges": [
        {
          "title": "Challenge Title",
          "description": "# Challenge Title\\n\\nFull markdown description...",
          "difficulty": "Beginner",
          "challenge_type": "Build",
          "estimated_time": 60,
          "recommended_tools": ["Tool 1", "Tool 2"],
          "requirements": ["Requirement 1", "Requirement 2"]
        }
      ]
    }
  ]
}

CRITICAL RULES (NoCodeJam Governance):
1. XP is NEVER mentioned - system calculates it automatically
2. Tools must be "recommended" not "required" - use language like "suggested", "works well with"
3. All challenges must have estimated_time between 10-240 minutes
4. Each module should have 2-4 challenges
5. Total pathway estimated_time should be realistic (sum of all challenge times + buffer)
6. Difficulty must match complexity - don't mark complex pathways as Beginner
7. Include specific, measurable requirements for each challenge
8. Use proper markdown formatting in challenge descriptions

Return ONLY valid JSON, no markdown code blocks or extra text.`;

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
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid Token' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 2. Initialize Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const body = await req.json();
    const { userGoal, difficulty, timeAvailable, userXP } = body;

    // 3. Rate Limiting Check (20 requests / hour)
    const ONE_HOUR_AGO = new Date(Date.now() - 60 * 60 * 1000).toISOString();
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

    // Helper to log usage
    const logUsage = async (status: string, model: string, responseLen: number, errorMsg?: string) => {
      try {
        await supabaseAdmin.from('ai_generation_log').insert({
          user_id: user.id,
          content_type: 'pathway',
          model: model,
          prompt_length: JSON.stringify(body).length,
          response_length: responseLen,
          validation_passed: status === 'success',
          status: status,
          error_message: errorMsg
        });
      } catch (logErr) {
        console.error("Failed to log usage:", logErr);
      }
    };

    // Mock Mode
    if (useMock) {
      console.log("ANTHROPIC_API_KEY not found. Using Mock Mode.");
      await logUsage('success', 'mock', 500);
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockPathway = {
        title: "Full Stack No-Code Development",
        slug: "full-stack-no-code",
        description: "Learn to build complete web applications using Supabase, FlutterFlow, and modern no-code tools.",
        difficulty: "Beginner",
        estimated_time: 240,
        cover_image: "A modern dashboard with no-code tools",
        modules: [
          {
            title: "Module 1: Database Foundations",
            description: "Learn database design with Supabase",
            sequence_order: 1,
            challenges: [
              {
                title: "Create Your First Database",
                description: "# Create Your First Database\n\nLearn to set up a Supabase project...",
                difficulty: "Beginner",
                challenge_type: "Build",
                estimated_time: 60,
                recommended_tools: ["Supabase", "PostgreSQL"],
                requirements: ["Create a Supabase project", "Design a simple schema"]
              }
            ]
          }
        ],
        recommendation_reason: "Mock pathway - API key not configured"
      };

      return new Response(
        JSON.stringify({ pathway: mockPathway, validationWarnings: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Real API Logic ---
    const MODEL = "claude-sonnet-4-5-20250929";

    // Build the generation prompt with user context
    const userPrompt = `Generate a learning pathway for: "${userGoal}"

User Context:
- Desired difficulty: ${difficulty || 'Not specified'}
- Available time: ${timeAvailable ? `${timeAvailable} minutes` : 'Flexible'}
- Current XP: ${userXP || 0}

Please create a comprehensive pathway that matches their skill level and time availability.`;

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
        system: GENERATE_PATHWAY_PROMPT,
        messages: [{
          role: "user",
          content: userPrompt
        }]
      })
    });

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error("Anthropic API error:", errorText);
      await logUsage('error', MODEL, 0, errorText);
      throw new Error(`Anthropic API Error: ${errorText}`);
    }

    const anthropicData = await anthropicResponse.json();
    let generatedText = anthropicData.content[0].text;

    // Extract JSON from potential markdown code blocks
    const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || generatedText.match(/```\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      generatedText = jsonMatch[1];
    }

    // Clean up markdown artifacts
    generatedText = generatedText.trim();
    if (generatedText.startsWith('```')) {
      generatedText = generatedText.substring(3);
    }
    if (generatedText.endsWith('```')) {
      generatedText = generatedText.substring(0, generatedText.length - 3);
    }

    // Parse the JSON
    const pathway = JSON.parse(generatedText);

    // --- Validation & Filtering Logic ---
    const validationWarnings: string[] = [];
    let shouldFilter = false;
    let filterReason = "";

    // 1. XP-Based Filtering (from V1 Recommendation Logic)
    if (userXP !== undefined && userXP !== null) {
      const pathwayDifficulty = pathway.difficulty?.toLowerCase();

      if (pathwayDifficulty === 'advanced' && userXP < 500) {
        shouldFilter = true;
        filterReason = `Advanced pathways require at least 500 XP (you have ${userXP} XP)`;
      } else if (pathwayDifficulty === 'intermediate' && userXP < 200) {
        shouldFilter = true;
        filterReason = `Intermediate pathways require at least 200 XP (you have ${userXP} XP)`;
      }
    }

    // 2. Time-Based Filtering
    if (timeAvailable && pathway.estimated_time > timeAvailable) {
      shouldFilter = true;
      filterReason = `This pathway requires ${pathway.estimated_time} minutes, but you only have ${timeAvailable} minutes available`;
    }

    // 3. Template Compliance Validation
    const requiredFields = ['title', 'description', 'difficulty', 'modules'];
    for (const field of requiredFields) {
      if (!pathway[field]) {
        validationWarnings.push(`Missing required field: ${field}`);
      }
    }

    // 4. Tool Language Check (must be recommended, not required)
    const restrictedTerms = ["must use", "required", "mandatory", "have to use", "only works with"];
    const textToCheck = JSON.stringify(pathway).toLowerCase();

    for (const term of restrictedTerms) {
      if (textToCheck.includes(term)) {
        validationWarnings.push(`Content contains restrictive language ('${term}'). Tools should be 'recommended' or 'suggested'.`);
      }
    }

    // 5. Time Estimate Validation
    if (pathway.modules && Array.isArray(pathway.modules)) {
      for (const module of pathway.modules) {
        if (module.challenges && Array.isArray(module.challenges)) {
          for (const challenge of module.challenges) {
            if (challenge.estimated_time < 10 || challenge.estimated_time > 240) {
              validationWarnings.push(`Challenge "${challenge.title}" has invalid time estimate: ${challenge.estimated_time} minutes (must be 10-240)`);
            }
          }
        }
      }
    }

    // Log the result
    await logUsage('success', MODEL, generatedText.length);

    // Add recommendation reason
    pathway.recommendation_reason = shouldFilter
      ? `Not recommended: ${filterReason}`
      : `Matches your ${difficulty || 'current'} skill level and is achievable in ${pathway.estimated_time} minutes`;

    // Return pathway with filtering metadata
    return new Response(
      JSON.stringify({
        pathway,
        validationWarnings,
        filtered: shouldFilter,
        filterReason: shouldFilter ? filterReason : null
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-pathway:", error);
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
