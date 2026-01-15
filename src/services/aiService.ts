// src/services/aiService.ts
import { supabase } from "@/lib/supabaseClient";

export type GenerateChallengeInput = {
  // keep flexible; you can extend later
  title?: string;
  description?: string;
  difficulty?: string;
  requirements?: string[];
};

export type ChallengeDraft = {
  title: string;
  difficulty: string;
  estimatedMinutes: number;
  context: string;
  objective: string;
  prerequisites: string[];
  tools: string[];
  steps: Array<{ title: string; description: string }>;
  deliverables: string[];
  acceptanceCriteria: string[];
  reflectionPrompt: string;
  resources: Array<{ label: string; url: string }>;
  xp?: {
    base: number;
    bonuses: Array<{ label: string; xp: number }>;
  };
};

type EdgeOk = { ok: true; draft: ChallengeDraft };
type EdgeErr = { ok?: false; error: string };

export async function generateChallengeDraft(
  input: GenerateChallengeInput
): Promise<ChallengeDraft> {
  const { data, error } = await supabase.functions.invoke<EdgeOk | EdgeErr>(
    "generate-challenge",
    { body: input }
  );

  if (error) {
    throw new Error(error.message || "Edge function invocation failed");
  }

  if (!data || (data as EdgeErr).error) {
    const msg = (data as EdgeErr | null)?.error ?? "Invalid response from server";
    throw new Error(msg);
  }

  return (data as EdgeOk).draft;
}
