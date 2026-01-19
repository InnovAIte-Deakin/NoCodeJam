# Instructions: Create Complete Post-PR Migration

## Step 1: Open temp_challenges.sql in VS Code

## Step 2: Do Find & Replace (Ctrl+H) in this exact order:

###  1. Fix INSERT columns - Add missing columns after `estimated_time,`
**Find:**
```
  estimated_time,
  recommended_tools,
```

**Replace with:**
```
  estimated_time,
  estimated_minutes,
  xp,
  recommended_tools,
```

### 2. Fix Categories (4 replacements)
**Find:** `'Frontend'`
**Replace:** `'frontend'`

**Find:** `'Backend'`
**Replace:** `'backend'`

**Find:** `'Architecture'`
**Replace:** `'data'`

**Find:** `'AI / Governance'`
**Replace:** `'general'`

### 3. Add image column to INSERT
**Find:**
```
  ai_generated,
  category,
  created_at,
```

**Replace:**
```
  ai_generated,
  category,
  image,
  created_at,
```

### 4. Fix ON CONFLICT clause
**Find:**
```
  status = EXCLUDED.status,
  updated_at = NOW();
```

**Replace:**
```
  status = EXCLUDED.status,
  image = EXCLUDED.image,
  category = EXCLUDED.category,
  updated_at = NOW();
```

## Step 3: Manually add estimated_minutes, xp, and image VALUES

For each challenge (there are 10), after the `recommended_tools` array line, add these 3 lines:

###Challenge 1 (lines ~92-96): After `ARRAY['VS Code', 'CodePen', 'Chrome DevTools', 'Flexbox', 'CSS Grid'],`
```
  150, -- estimated_minutes
  180, -- xp
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', -- image
```

### Challenge 2 (lines ~197-201): After `ARRAY['CSS Variables', 'localStorage', 'JavaScript', 'prefers-color-scheme'],`
```
  150, -- estimated_minutes
  180, -- xp
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800', -- image
```

### Challenge 3 (lines ~316-320): After `ARRAY['Node.js', 'Express', 'Postman', 'curl'],`
```
  105, -- estimated_minutes
  155, -- xp
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800', -- image
```

### Challenge 4 (lines ~443-447): After `ARRAY['React', 'fetch API', 'axios', 'JSONPlaceholder'],`
```
  210, -- estimated_minutes
  320, -- xp
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', -- image
```

### Challenge 5 (lines ~563-567): After `ARRAY['Express.js', 'Middleware', 'Postman', 'RBAC'],`
```
  210, -- estimated_minutes
  320, -- xp
  'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=800', -- image
```

### Challenge 6 (lines ~685-689): After `ARRAY['PostgreSQL', 'SQL', 'Express.js', 'ORM'],`
```
  210, -- estimated_minutes
  320, -- xp
  'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800', -- image
```

### Challenge 7 (lines ~814-818): After `ARRAY['PostgreSQL', 'Express.js', 'Transactions', 'Security'],`
```
  270, -- estimated_minutes
  420, -- xp
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800', -- image
```

### Challenge 8 (lines ~947-951): After `ARRAY['React', 'State Management', 'Async', 'UX'],`
```
  270, -- estimated_minutes
  420, -- xp
  'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800', -- image
```

### Challenge 9 (lines ~1085-1089): After `ARRAY['PostgreSQL', 'Event Sourcing', 'Cryptography', 'CQRS'],`
```
  330, -- estimated_minutes
  540, -- xp
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800', -- image
```

### Challenge 10 (lines ~1224-1228): After `ARRAY['AI API', 'PostgreSQL', 'State Machine', 'Governance'],`
```
  420, -- estimated_minutes
  660, -- xp
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800', -- image
```

## Step 4: Save the fixed file as `temp_challenges_FIXED.sql`

## Step 5: Create final migration file

Copy the header from `supabase/migrations/20260121_post_pr_full_update_COMPLETE.sql` (the PART 1 that converts requirements back to ARRAY), then paste all the challenges from `temp_challenges_FIXED.sql` below it.

Save as: `supabase/migrations/20260121_post_pr_full_update_COMPLETE.sql`

##Done!

Tomorrow after PR merge, run that complete file on live Supabase.
