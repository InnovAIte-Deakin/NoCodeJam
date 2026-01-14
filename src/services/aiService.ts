// src/services/aiService.ts
import { supabase } from "../lib/supabaseClient";

export type GenerateChallengeInput = {
  topic?: string;
  difficulty?: "beginner" | "intermediate" | "advanced" | string;
  title?: string;
  description?: string;
  category?: string;
  requirements?: string[];
};

export type GenerateChallengeResponse = {
  ok: boolean;
  input?: unknown;
  draft?: unknown;
  error?: string;
};

export async function generateChallengeDraft(
  input: GenerateChallengeInput
): Promise<GenerateChallengeResponse> {
  const { data, error } = await supabase.functions.invoke("generate-challenge", {
    body: input,
  });

  if (error) {
    throw new Error(error.message ?? "AI generation failed");
  }

  return data as GenerateChallengeResponse;
}
