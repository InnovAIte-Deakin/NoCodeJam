// supabase/functions/generate-challenge/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request) => {
  // Basic CORS (safe default for local/dev)
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Minimal "contract": accept anything for now; return a mocked challenge
  const mocked = {
    title: "Draft Challenge (Mock)",
    difficulty: "Beginner",
    timeLimitMinutes: 30,
    description:
      "This is a mocked response from the generate-challenge Edge Function. Replace with real Anthropic call after secrets are available.",
    requirements: [
      "Follow the NoCodeJam challenge template structure",
      "Include clear deliverables and a reflection prompt",
    ],
  };

  return new Response(JSON.stringify({ ok: true, input: body, draft: mocked }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
