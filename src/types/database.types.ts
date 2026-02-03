// Database types matching Phase 2 Schema (20260116_core_schema.sql)
// Auto-generated types for Supabase tables

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type ChallengeType = 'Build' | 'Modify' | 'Analyse' | 'Deploy' | 'Reflect';
export type ContentStatus = 'draft' | 'pending_review' | 'published' | 'archived';
export type PathwayStatus = 'draft' | 'published' | 'archived';
export type EnrollmentStatus = 'active' | 'completed' | 'dropped';

// ============================================
// PATHWAYS
// ============================================

export interface Pathway {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  difficulty: DifficultyLevel;
  estimated_time: number | null; // Total minutes
  total_xp: number; // Cache of all module XP
  cover_image: string | null;
  status: PathwayStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePathwayInput {
  title: string;
  slug: string;
  description?: string;
  difficulty: DifficultyLevel;
  estimated_time?: number;
  cover_image?: string;
  status?: PathwayStatus;
  created_by: string;
}

export interface UpdatePathwayInput {
  title?: string;
  slug?: string;
  description?: string;
  difficulty?: DifficultyLevel;
  estimated_time?: number;
  total_xp?: number;
  cover_image?: string;
  status?: PathwayStatus;
  updated_at?: string;
}

// ============================================
// PATHWAY MODULES
// ============================================

export interface PathwayModule {
  id: string;
  pathway_id: string;
  title: string;
  description: string | null;
  sequence_order: number; // 1, 2, 3...
  created_at: string;
}

export interface CreateModuleInput {
  pathway_id: string;
  title: string;
  description?: string;
  sequence_order: number;
}

export interface UpdateModuleInput {
  title?: string;
  description?: string;
  sequence_order?: number;
}

// ============================================
// CHALLENGES
// ============================================

export interface Challenge {
  id: string;
  module_id: string | null; // Optional link to pathway module
  title: string;
  slug: string | null; // Can be null if part of pathway only
  description: string; // Full markdown
  requirements: string[]; // Array of acceptance criteria
  difficulty: DifficultyLevel;
  challenge_type: ChallengeType;
  estimated_time: number; // minutes, default 60
  recommended_tools: string[]; // Array of tool names
  xp_reward: number | null; // Auto-calculated via trigger
  status: ContentStatus;
  ai_generated: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateChallengeInput {
  module_id?: string | null;
  title: string;
  slug?: string | null;
  description: string;
  requirements?: string[];
  difficulty: DifficultyLevel;
  challenge_type?: ChallengeType;
  estimated_time?: number;
  recommended_tools?: string[];
  status?: ContentStatus;
  ai_generated?: boolean;
  created_by: string;
}

export interface UpdateChallengeInput {
  module_id?: string | null;
  title?: string;
  slug?: string | null;
  description?: string;
  requirements?: string[];
  difficulty?: DifficultyLevel;
  challenge_type?: ChallengeType;
  estimated_time?: number;
  recommended_tools?: string[];
  status?: ContentStatus;
  ai_generated?: boolean;
  updated_at?: string;
}

// ============================================
// ENROLLMENTS & COMPLETIONS
// ============================================

export interface PathwayEnrollment {
  user_id: string;
  pathway_id: string;
  status: EnrollmentStatus;
  progress: number; // Percentage 0-100
  started_at: string;
  completed_at: string | null;
}

export interface CreateEnrollmentInput {
  user_id: string;
  pathway_id: string;
  status?: EnrollmentStatus;
  progress?: number;
}

export interface UpdateEnrollmentInput {
  status?: EnrollmentStatus;
  progress?: number;
  completed_at?: string | null;
}

export interface ChallengeCompletion {
  user_id: string;
  challenge_id: string;
  submission_url: string | null;
  reflection_notes: string | null;
  xp_earned: number | null; // Snapshot of XP at time of completion
  completed_at: string;
}

export interface CreateCompletionInput {
  user_id: string;
  challenge_id: string;
  submission_url?: string;
  reflection_notes?: string;
  xp_earned?: number;
}

// ============================================
// AI GENERATION LOG (from audit migration)
// ============================================

export interface AIGenerationLog {
  id: string;
  user_id: string | null;
  content_type: 'challenge' | 'pathway' | 'recommendation';
  content_id: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  model_used: string | null;
  validation_passed: boolean;
  validation_issues: string[] | null;
  created_at: string;
}

export interface CreateAILogInput {
  user_id?: string | null;
  content_type: 'challenge' | 'pathway' | 'recommendation';
  content_id?: string | null;
  prompt_tokens?: number;
  completion_tokens?: number;
  model_used?: string;
  validation_passed: boolean;
  validation_issues?: string[] | null;
}

// ============================================
// UTILITY TYPES
// ============================================

// For pathway with nested modules and challenges
export interface PathwayWithModules extends Pathway {
  modules: Array<PathwayModule & {
    challenges: Challenge[];
  }>;
}

// For user progress tracking
export interface UserPathwayProgress extends PathwayEnrollment {
  pathway: Pathway;
  completed_challenges: number;
  total_challenges: number;
  xp_earned: number;
}

// For challenge detail with completion status
export interface ChallengeWithCompletion extends Challenge {
  completion?: ChallengeCompletion;
  is_completed: boolean;
}

// XP Calculation (matches database function)
export interface XPCalculationInput {
  difficulty: DifficultyLevel;
  estimated_time: number; // minutes
  challenge_type: ChallengeType;
}
