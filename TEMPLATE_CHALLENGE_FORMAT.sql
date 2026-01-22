-- ============================================================================
-- TEMPLATE: This shows the EXACT format for each challenge
-- Copy this structure for all 10 challenges
-- ============================================================================

-- Challenge X: [TITLE] ([DIFFICULTY] - [CATEGORY])
INSERT INTO public.challenges (
  id,
  title,
  slug,
  description,
  requirements,
  difficulty,
  challenge_type,
  estimated_time,
  estimated_minutes,  -- ← ADDED THIS
  xp,                 -- ← ADDED THIS
  recommended_tools,
  status,
  ai_generated,
  category,
  image,              -- ← ADDED THIS
  created_at,
  updated_at
)
VALUES (
  'c3000001-0001-0001-0001-100000000001'::uuid,  -- ← Change UUID for each challenge
  'Build a Responsive Card Component',              -- ← From temp_challenges.sql
  'build-responsive-card-component',                -- ← From temp_challenges.sql
  '# Build a Responsive Card Component              -- ← FULL DESCRIPTION from temp_challenges.sql
...                                                  --   Copy everything between the quotes
...',
  ARRAY[                                            -- ← From temp_challenges.sql
    'Card displays vertically on mobile...',
    '...more requirements...'
  ],
  'Beginner',                                       -- ← From temp_challenges.sql
  'Build',                                          -- ← From temp_challenges.sql
  150,                                              -- ← estimated_time from temp_challenges.sql
  150,                                              -- ← ADD estimated_minutes (same as above usually)
  180,                                              -- ← ADD xp value (see table below)
  ARRAY['VS Code', 'CodePen', ...],                -- ← From temp_challenges.sql
  'published',
  true,
  'frontend',                                       -- ← LOWERCASE category (not 'Frontend')
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', -- ← ADD image URL
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  status = EXCLUDED.status,
  image = EXCLUDED.image,        -- ← ADDED THIS
  category = EXCLUDED.category,  -- ← ADDED THIS
  updated_at = NOW();

-- ============================================================================
-- QUICK REFERENCE TABLE FOR ALL 10 CHALLENGES
-- ============================================================================

-- Challenge | ID Last 4 | est_mins | xp  | category  | Image URL
-- -----------------------------------------------------------------------
-- 1. Responsive Card    | ...0001 | 150 | 180 | frontend  | photo-1507003211169
-- 2. Dark Mode          | ...0002 | 150 | 180 | frontend  | photo-1618005182384
-- 3. Health Check API   | ...0003 | 105 | 155 | backend   | photo-1558494949-ef
-- 4. Paginated List     | ...0004 | 210 | 320 | frontend  | photo-1460925895917
-- 5. Role-Based Auth    | ...0005 | 210 | 320 | backend   | photo-1633265486064
-- 6. Soft Delete        | ...0006 | 210 | 320 | backend   | photo-1544383835-bda
-- 7. Audit Logging      | ...0007 | 270 | 420 | data      | photo-1551288049-beb
-- 8. Optimistic UI      | ...0008 | 270 | 420 | frontend  | photo-1555949963-aa7
-- 9. Immutable XP       | ...0009 | 330 | 540 | data      | photo-1511512578047
-- 10. AI Approval Gate  | ...0010 | 420 | 660 | general   | photo-1677442136019

-- Full Image URLs (all start with https://images.unsplash.com/ and end with ?w=800)
