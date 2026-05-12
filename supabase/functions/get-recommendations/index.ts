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
          headers: {
            Authorization: req.headers.get("Authorization") ?? "",
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError) throw userError;
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

    const difficultyMap: Record<string, number> = {
      Beginner: 1,
      Intermediate: 2,
      Advanced: 3,
      Expert: 4,
    };

    let avgDifficulty = 2;
    if (userDifficulties.length > 0) {
      const sum = userDifficulties.reduce((acc, d) => {
        return acc + (difficultyMap[d] || 2);
      }, 0);
      avgDifficulty = sum / userDifficulties.length;
    }

    let targetDifficulty = "Intermediate";
    if (avgDifficulty < 1.5) targetDifficulty = "Beginner";
    else if (avgDifficulty < 2.5) targetDifficulty = "Intermediate";
    else if (avgDifficulty < 3.5) targetDifficulty = "Advanced";
    else targetDifficulty = "Expert";

    const { data: challenges, error: challengesError } = await supabaseClient
      .from("challenges")
      .select("*")
      .eq("status", "published")
      .eq("difficulty", targetDifficulty)
      .limit(10);

    if (challengesError) throw challengesError;

    console.log("userId:", user.id);
    console.log("completedIds:", completedIds);
    console.log("avgDifficulty:", avgDifficulty);
    console.log("targetDifficulty:", targetDifficulty);
    console.log("challenges found:", challenges);

    const userTypes = interactions?.map((i) => i.challenge_type) || [];

    const recommendedChallenges = (challenges || [])
      .map((challenge) => {
        let score = 50;
        let reason = "Recommended for your level";

        if (userTypes.includes(challenge.challenge_type)) {
          score += 30;
          reason = `Similar to your recent ${String(challenge.challenge_type).toLowerCase()} challenges`;
        }

        if ((challenge.xp_reward ?? 0) > 100) {
          score += 10;
          reason = "High-value challenge matching your level";
        }

        return { ...challenge, score, reason };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return new Response(
      JSON.stringify({
        debug: {
          userId: user.id,
          completedIds,
          avgDifficulty,
          targetDifficulty,
          fetchedChallenges: challenges?.length || 0,
        },
        recommendations: recommendedChallenges,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return new Response(JSON.stringify({ error: message }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 400,
    });
  }
});