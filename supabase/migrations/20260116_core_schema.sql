-- Phase 2: Core Database Architecture
-- Creates the foundational tables for Learning Pathways and Challenges

-- 1. UTILITY: XP Calculation Function
-- Calculates XP based on difficulty, time (mins), and type.
CREATE OR REPLACE FUNCTION calculate_challenge_xp(
    difficulty text,
    estimated_time int,
    challenge_type text
) RETURNS int AS $$
DECLARE
    base_xp int;
    multiplier numeric;
BEGIN
    -- Base XP by Difficulty
    CASE lower(difficulty)
        WHEN 'beginner' THEN base_xp := 50;
        WHEN 'intermediate' THEN base_xp := 100;
        WHEN 'advanced' THEN base_xp := 200;
        WHEN 'expert' THEN base_xp := 300;
        ELSE base_xp := 50; -- Default
    END CASE;

    -- Time Multiplier: +10 XP per 15 mins (up to 4 hours)
    -- e.g. 60 mins = +40 XP
    base_xp := base_xp + (LEAST(estimated_time, 240) / 15 * 10);

    -- Type Multiplier
    CASE lower(challenge_type)
        WHEN 'build' THEN multiplier := 1.5; -- Harder
        WHEN 'deploy' THEN multiplier := 1.2;
        WHEN 'modify' THEN multiplier := 1.0;
        WHEN 'analyse' THEN multiplier := 0.8;
        WHEN 'reflect' THEN multiplier := 0.5; -- Easier
        ELSE multiplier := 1.0;
    END CASE;

    RETURN floor(base_xp * multiplier);
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- 2. TABLE: Pathways
-- The container for a learning curriculum
CREATE TABLE IF NOT EXISTS public.pathways (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    slug text UNIQUE NOT NULL, -- url-friendly-name
    description text,
    difficulty text CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    estimated_time int, -- Total minutes
    total_xp int DEFAULT 0, -- Cache of all module XP
    cover_image text,
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. TABLE: Pathway Modules
-- Phases or sections within a pathway
CREATE TABLE IF NOT EXISTS public.pathway_modules (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    pathway_id uuid REFERENCES public.pathways(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    sequence_order int NOT NULL, -- 1, 2, 3...
    created_at timestamptz DEFAULT now()
);

-- 4. TABLE: Challenges (The Core Unit)
-- Represents a single task. Can be standalone or part of a module.
CREATE TABLE IF NOT EXISTS public.challenges (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Structure
    module_id uuid REFERENCES public.pathway_modules(id) ON DELETE SET NULL, -- Optional link to pathway
    
    -- Content
    title text NOT NULL,
    slug text, -- can be null if part of a pathway and not standalone
    description text NOT NULL, -- Full markdown
    requirements text[], -- Array of acceptance criteria
    difficulty text NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    
    -- Meta
    challenge_type text DEFAULT 'Build' CHECK (challenge_type IN ('Build', 'Modify', 'Analyse', 'Deploy', 'Reflect')),
    estimated_time int DEFAULT 60, -- minutes
    recommended_tools text[], -- Array of tool names
    
    -- Rewards
    xp_reward int, -- Auto-calculated via trigger
    
    -- Governance
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'archived')),
    ai_generated boolean DEFAULT false,
    
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 5. TRIGGER: Auto-Calculate XP
CREATE OR REPLACE FUNCTION set_challenge_xp() RETURNS TRIGGER AS $$
BEGIN
    NEW.xp_reward := calculate_challenge_xp(NEW.difficulty, NEW.estimated_time, NEW.challenge_type);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_challenge_xp ON public.challenges;
CREATE TRIGGER trigger_set_challenge_xp
    BEFORE INSERT OR UPDATE OF difficulty, estimated_time, challenge_type ON public.challenges
    FOR EACH ROW
    EXECUTE FUNCTION set_challenge_xp();

-- 6. TABLE: Pathway Enrollments
CREATE TABLE IF NOT EXISTS public.pathway_enrollments (
    user_id uuid REFERENCES auth.users(id),
    pathway_id uuid REFERENCES public.pathways(id),
    status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
    progress int DEFAULT 0, -- Percentage 0-100
    started_at timestamptz DEFAULT now(),
    completed_at timestamptz,
    PRIMARY KEY (user_id, pathway_id)
);

-- 7. TABLE: Challenge Completions
CREATE TABLE IF NOT EXISTS public.challenge_completions (
    user_id uuid REFERENCES auth.users(id),
    challenge_id uuid REFERENCES public.challenges(id),
    submission_url text,
    reflection_notes text,
    xp_earned int, -- Snapshot of XP at time of completion
    completed_at timestamptz DEFAULT now(),
    PRIMARY KEY (user_id, challenge_id)
);

-- 8. INDEXES
CREATE INDEX IF NOT EXISTS idx_challenges_module ON public.challenges(module_id);
CREATE INDEX IF NOT EXISTS idx_pathway_modules_pathway ON public.pathway_modules(pathway_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON public.challenges(status);
CREATE INDEX IF NOT EXISTS idx_pathways_status ON public.pathways(status);

-- 9. RLS POLICIES
ALTER TABLE public.pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pathway_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pathway_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;

-- Reading Content: Published is Public, Draft is Author only
CREATE POLICY "Public can view published pathways" ON public.pathways 
    FOR SELECT USING (status = 'published');
CREATE POLICY "Authors can view own draft pathways" ON public.pathways 
    FOR SELECT USING (auth.uid() = created_by);
    
CREATE POLICY "Public can view published challenges" ON public.challenges 
    FOR SELECT USING (status = 'published');
CREATE POLICY "Authors can view own draft challenges" ON public.challenges 
    FOR SELECT USING (auth.uid() = created_by);

-- Modules follow their parent pathway rules (simplified: all modules are visible if you can find the ID, logic handled in valid queries)
CREATE POLICY "Public can view modules" ON public.pathway_modules FOR SELECT TO authenticated USING (true);

-- User Data: Only Owner
CREATE POLICY "Users view own enrollments" ON public.pathway_enrollments
    FOR ALL USING (auth.uid() = user_id);
    
CREATE POLICY "Users view own completions" ON public.challenge_completions
    FOR ALL USING (auth.uid() = user_id);

-- Writing Content: Authenticated Users can create drafts
CREATE POLICY "Users can create pathways" ON public.pathways
    FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own pathways" ON public.pathways
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can create challenges" ON public.challenges
    FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own challenges" ON public.challenges
    FOR UPDATE USING (auth.uid() = created_by);
