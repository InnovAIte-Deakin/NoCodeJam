import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data: interactions, error: interactionsError } = await supabaseClient
      .from("user_interactions")
      .select("challenge_id, action, difficulty, challenge_type")
      .eq("user_id", user.id)
      .order("timestamp", { ascending: false })
      .limit(50);

    if (interactionsError) throw interactionsError;

    const { data: completed, error: completedError } = await supabaseClient
      .from("submissions")
      .select("challenge_id")
      .eq("user_id", user.id)
      .eq("status", "approved");

    if (completedError) throw completedError;

    const completedIds = completed?.map((c) => c.challenge_id) || [];
    const userDifficulties = interactions?.map((i) => i.difficulty) || [];

    const difficultyMap = {
      Beginner: 1,
      Intermediate: 2,
      Advanced: 3,
      Expert: 4,
    };

    let avgDifficulty = 2;
    