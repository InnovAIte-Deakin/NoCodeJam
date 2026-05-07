import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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

    const { data: { user } } = await supabaseClient.auth.getUser();
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

    const interactedIds = [...new Set((interactions || []).map(i => i.challenge_id))];
    const completedIds = [...new Set((completed || []).map(c => c.challenge_id))];
    const excludedIds = [...new Set([...interactedIds, ...completedIds])];

    const difficultyMap: Record<string, number> = {
      Beginner: 1,
      Intermediate: 2,
      Expert: 3,
    };

    const reverseDifficultyMap: Record<number, string> = {
      1: "Beginner",
      2: "Intermediate",
      3: "Expert",
    };

    const userDifficulties = (interactions || [])
      .map(i => difficultyMap[i.difficulty])
      .filter(Boolean);

    let avgDifficulty = 2;
    if (userDifficulties.length > 0) {
      avgDifficulty =
        userDifficulties.reduce((acc, n) => acc + n, 0) / userDifficulties.length;
    }

    const roundedDifficulty = Math.min(3, Math.max(1, Math.round(avgDifficulty)));
    const targetDifficulty = reverseDifficultyMap[roundedDifficulty] || "Intermediate";

    let query = supabaseClient
      .from("challenges")
      .select("*")
      .eq("status", "published")
      .eq("difficulty", targetDifficulty);

    if (excludedIds.length > 0) {
      query = query.filter("id", "not.in", `(${excludedIds.map(id => `"${id}"`).join(",")})`);
    }

    const { data: challenges, error: challengesError } = await query.limit(10);

    if (challengesError) throw challengesError;

    const userTypes = (interactions || []).map(i => i.challenge_type).filter(Boolean);

    const recommendedChallenges = (challenges || [])
      .map((challenge) => {
        let score = 50;
        let reason = "Recommended for your level";

        if (userTypes.includes(challenge.challenge_type)) {
          score += 30;
          reason = `Similar to your recent ${challenge.challenge_type.toLowerCase()} challenges`;
        }

        if (challenge.xp_reward > 100) {
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
          avgDifficulty,
          targetDifficulty,
          interactedIds,
          completedIds,
          excludedIds,
          fetchedChallenges: challenges?.length || 0,
        },
        recommendations: recommendedChallenges,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});