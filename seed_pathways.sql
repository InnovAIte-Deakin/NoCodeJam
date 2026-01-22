-- Quick Seed: Test Pathways for Phase 3
-- Run this in Supabase SQL Editor to create test data

-- Pathway 1: Beginner
INSERT INTO public.pathways (id, title, slug, description, difficulty, estimated_time, total_xp, status)
VALUES (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'::uuid,
  'No-Code Web Development Fundamentals',
  'no-code-web-dev-fundamentals',
  'Master the fundamentals of building web applications without writing code.',
  'Beginner',
  300,
  432,
  'published'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- Module 1.1
INSERT INTO public.pathway_modules (id, pathway_id, title, description, sequence_order)
VALUES (
  'b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e'::uuid,
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'::uuid,
  'Module 1: Database Design Basics',
  'Learn database design with Supabase',
  1
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- Challenge 1.1.1
INSERT INTO public.challenges (
  id, module_id, title, description, requirements, difficulty,
  challenge_type, estimated_time, recommended_tools, status, ai_generated
)
VALUES (
  'd4e5f6a7-b8c9-4d5e-8f9a-0b1c2d3e4f5a'::uuid,
  'b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e'::uuid,
  'Build Your First Database Table',
  '# Build Your First Database Table

Learn to create a database table in Supabase.',
  ARRAY['Create Supabase project', 'Design tasks table'],
  'Beginner',
  'Build',
  45,
  ARRAY['Supabase', 'PostgreSQL'],
  'published',
  false
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- Challenge 1.1.2
INSERT INTO public.challenges (
  id, module_id, title, description, requirements, difficulty,
  challenge_type, estimated_time, recommended_tools, status, ai_generated
)
VALUES (
  'e5f6a7b8-c9d0-4e5f-8a9b-0c1d2e3f4a5b'::uuid,
  'b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e'::uuid,
  'Create Table Relationships',
  '# Create Table Relationships

Link tables with foreign keys.',
  ARRAY['Add users table', 'Create foreign key'],
  'Beginner',
  'Build',
  60,
  ARRAY['Supabase'],
  'published',
  false
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- Pathway 2: Intermediate
INSERT INTO public.pathways (id, title, slug, description, difficulty, estimated_time, total_xp, status)
VALUES (
  'b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e'::uuid,
  'Full Stack App Development',
  'full-stack-supabase',
  'Build production-ready full-stack applications.',
  'Intermediate',
  240,
  576,
  'published'
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- Module 2.1
INSERT INTO public.pathway_modules (id, pathway_id, title, description, sequence_order)
VALUES (
  'd4e5f6a7-b8c9-4d5e-8f9a-0b1c2d3e4f5a'::uuid,
  'b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e'::uuid,
  'Module 1: Building APIs',
  'Create serverless APIs with Edge Functions',
  1
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- Challenge 2.1.1
INSERT INTO public.challenges (
  id, module_id, title, description, requirements, difficulty,
  challenge_type, estimated_time, recommended_tools, status, ai_generated
)
VALUES (
  'f6a7b8c9-d0e1-4f5a-8b9c-0d1e2f3a4b5c'::uuid,
  'd4e5f6a7-b8c9-4d5e-8f9a-0b1c2d3e4f5a'::uuid,
  'Create Your First Edge Function',
  '# Create Your First Edge Function

Build a serverless API endpoint.',
  ARRAY['Setup Supabase CLI', 'Create function', 'Deploy'],
  'Intermediate',
  'Build',
  120,
  ARRAY['Supabase', 'Deno', 'TypeScript'],
  'published',
  false
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- Update pathway XP totals
UPDATE public.pathways
SET total_xp = (
  SELECT COALESCE(SUM(c.xp_reward), 0)
  FROM public.challenges c
  JOIN public.pathway_modules pm ON c.module_id = pm.id
  WHERE pm.pathway_id = pathways.id
);

SELECT 'Seed complete! Created 2 pathways with challenges.' AS result;
