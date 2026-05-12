// src/services/aiService.ts
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/errorHandling";
import type { DifficultyLevel, ChallengeType } from "@/types";

// ============================================
// AI Challenge Generation Service
// ============================================

/**
 * Message format for chat-based AI interactions
 */
export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Challenge data structure returned by AI generation
 * Matches the Edge Function's generate action response
 */
export interface AIGeneratedChallenge {
  title: string;
  challengeId?: string;
  associatedPathway?: string;
  associatedModule?: string;
  difficulty: DifficultyLevel;
  estimatedTime: number; // minutes
  challengeType: ChallengeType;
  recommendedTools: string[];
  xp: string; // Always "(calculated by system)"
  coverImageDescription?: string;
  versionNumber?: string;
  fullDescription: string; // Full markdown content
  requirements: string[];
}

/**
 * Response from Edge Function chat action
 */
interface ChatResponse {
  message: string;
  fallbackUsed?: boolean;
  fallbackReason?: string | null;
}

/**
 * Response from Edge Function generate action
 */
interface GenerateResponse {
  challenge: AIGeneratedChallenge;
  validationWarnings?: string[];
  fallbackUsed?: boolean;
  fallbackReason?: string | null;
}

/**
 * Generic error response from Edge Function
 */
interface ErrorResponse {
  error: string;
}

export interface AIFallbackMetadata {
  fallbackUsed: boolean;
  fallbackReason: string | null;
}

function normalizeMessages(messages: AIMessage[]): AIMessage[] {
  return messages
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }))
    .filter((message) => message.content.length > 0);
}

async function invokeChallengeAction<TResponse>(
  action: "chat" | "chat-learn" | "generate",
  messages: AIMessage[]
): Promise<TResponse> {
  const normalizedMessages = normalizeMessages(messages);

  if (normalizedMessages.length === 0) {
    throw new Error("At least one non-empty message is required.");
  }

  const { data, error } = await supabase.functions.invoke<TResponse | ErrorResponse>(
    "generate-challenge",
    {
      body: {
        action,
        messages: normalizedMessages,
      },
    }
  );

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  if (!data || "error" in data) {
    throw new Error(getErrorMessage((data as ErrorResponse)?.error ?? "Invalid response from AI"));
  }

  return data as TResponse;
}

// ============================================
// SERVICE FUNCTIONS
// ============================================

/**
 * Send a chat message to refine a challenge idea
 * @param messages - Conversation history
 * @returns AI assistant's response
 */
export async function chatWithAI(
  messages: AIMessage[]
): Promise<{ message: string; fallback: AIFallbackMetadata }> {
  const data = await invokeChallengeAction<ChatResponse>("chat", messages);
  return {
    message: data.message,
    fallback: {
      fallbackUsed: data.fallbackUsed ?? false,
      fallbackReason: data.fallbackReason ?? null,
    },
  };
}

/**
 * Generate a complete challenge from conversation history
 * @param messages - Conversation history with user and AI
 * @returns Structured challenge data
 */
export async function generateChallengeFromChat(
  messages: AIMessage[]
): Promise<{ challenge: AIGeneratedChallenge; warnings: string[]; fallback: AIFallbackMetadata }> {
  const response = await invokeChallengeAction<GenerateResponse>("generate", messages);
  return {
    challenge: response.challenge,
    warnings: response.validationWarnings || [],
    fallback: {
      fallbackUsed: response.fallbackUsed ?? false,
      fallbackReason: response.fallbackReason ?? null,
    },
  };
}

/**
 * Chat with AI for learning pathway recommendations
 * @param messages - Conversation history
 * @returns AI learning architect's response
 */
export async function chatWithLearningArchitect(
  messages: AIMessage[]
): Promise<{ message: string; fallback: AIFallbackMetadata }> {
  const data = await invokeChallengeAction<ChatResponse>("chat-learn", messages);
  return {
    message: data.message,
    fallback: {
      fallbackUsed: data.fallbackUsed ?? false,
      fallbackReason: data.fallbackReason ?? null,
    },
  };
}

// ============================================
// PATHWAY GENERATION
// ============================================

/**
 * Pathway generation request parameters
 */
export interface GeneratePathwayRequest {
  userGoal: string;
  difficulty?: DifficultyLevel;
  timeAvailable?: number; // minutes
  userXP?: number;
}

/**
 * Challenge structure within a pathway module
 */
export interface PathwayChallenge {
  title: string;
  description: string; // Full markdown
  difficulty: DifficultyLevel;
  challenge_type: ChallengeType;
  estimated_time: number;
  recommended_tools: string[];
  requirements: string[];
}

/**
 * Module structure within a pathway
 */
export interface PathwayModule {
  title: string;
  description: string;
  sequence_order: number;
  challenges: PathwayChallenge[];
}

/**
 * AI-generated pathway structure
 */
export interface AIGeneratedPathway {
  title: string;
  slug: string;
  description: string;
  difficulty: DifficultyLevel;
  estimated_time: number; // Total minutes
  cover_image?: string;
  modules: PathwayModule[];
  recommendation_reason?: string;
}

/**
 * Response from generate-pathway Edge Function
 */
interface GeneratePathwayResponse {
  pathway: AIGeneratedPathway;
  validationWarnings?: string[];
  filtered?: boolean;
  filterReason?: string | null;
}

/**
 * Generate a learning pathway based on user goals
 * @param request - Pathway generation parameters
 * @returns Generated pathway with filtering metadata
 */
export async function generatePathway(
  request: GeneratePathwayRequest
): Promise<{
  pathway: AIGeneratedPathway;
  warnings: string[];
  filtered: boolean;
  filterReason: string | null;
}> {
  const { data, error } = await supabase.functions.invoke<
    GeneratePathwayResponse | ErrorResponse
  >("generate-pathway", {
    body: request,
  });

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  if (!data || "error" in data) {
    throw new Error(getErrorMessage((data as ErrorResponse)?.error ?? "Invalid response from AI"));
  }

  const response = data as GeneratePathwayResponse;
  return {
    pathway: response.pathway,
    warnings: response.validationWarnings || [],
    filtered: response.filtered || false,
    filterReason: response.filterReason || null,
  };
}

// ============================================
// LEGACY SUPPORT (if needed)
// ============================================

/**
 * @deprecated Use chatWithAI and generateChallengeFromChat instead
 */
export type GenerateChallengeInput = {
  title?: string;
  description?: string;
  difficulty?: string;
  requirements?: string[];
};

/**
 * @deprecated Use AIGeneratedChallenge instead
 */
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
