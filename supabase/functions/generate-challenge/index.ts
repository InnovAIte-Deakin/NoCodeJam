// supabase/functions/generate-challenge/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request) => {
  // Basic CORS (safe for dev; restrict later)
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

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

  // Parse JSON body (not yet validated – stub phase)
  try {
    await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  /**
   * Template-aligned mock draft
   * Matches NoCodeJam Challenge Template v2 structure
   * Safe placeholder until Anthropic integration is enabled
   */
  const draft = {
    title: "Draft Challenge (Mock)",
    difficulty: "Beginner",
    estimatedMinutes: 30,

    context:
      "You are building an AI-assisted feature for NoCodeJam that helps users draft structured coding challenges using best-practice templates.",

    objective:
      "Implement a working AI Assist button that generates a challenge draft and populates the request form.",

    prerequisites: [
      "Basic React knowledge",
      "Familiarity with Supabase Edge Functions",
      "Node.js installed locally",
    ],

    tools: [
      "Vite + React + TypeScript",
      "Supabase Edge Functions",
    ],

    steps: [
      {
        title: "Wire the AI Assist button",
        description:
          "Connect the UI button to the generateChallengeDraft service function.",
      },
      {
        title: "Populate the form",
        description:
          "Map returned draft fields into the challenge request form state.",
      },
      {
        title: "Handle loading and errors",
        description:
          "Show a loading indicator and display user-friendly error messages.",
      },
    ],

    deliverables: [
      "AI Assist button successfully populates challenge fields",
      "Clean error handling with no UI crashes",
      "Code committed to the feature branch",
    ],

    acceptanceCriteria: [
      "Draft content follows the NoCodeJam challenge template",
      "Edge Function is called securely via Supabase",
      "No API keys are exposed to the frontend",
    ],

    reflectionPrompt:
      "What design decisions did you make when mapping AI-generated data into the UI, and why?",

    resources: [
      {
        label: "Supabase Edge Functions Documentation",
        url: "https://supabase.com/docs/guides/functions",
      },
    ],

    xp: {
      base: 100,
      bonuses: [
        { label: "Add input validation", xp: 25 },
        { label: "Improve UX with loading states", xp: 25 },
      ],
    },
  };

  return new Response(JSON.stringify({ ok: true, draft }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
