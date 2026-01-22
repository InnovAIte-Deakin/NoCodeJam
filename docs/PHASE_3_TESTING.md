# Phase 3 Testing Guide

## ✅ What's Been Completed

### Routes Added
- `/pathways` - Browse all published pathways
- `/pathway/:pathwayId` - View pathway details with progress

### Files Created
1. **Edge Function**: `supabase/functions/generate-pathway/index.ts`
2. **Service Layer**: Updated `src/services/aiService.ts` with pathway types
3. **Pages**:
   - `src/pages/BrowsePathways.tsx`
   - `src/pages/PathwayDetail.tsx`
4. **Seed Data**: `seed_pathways.sql`

## 🧪 Testing Steps

### Step 1: Seed Test Data

1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
2. Copy and paste the contents of `seed_pathways.sql`
3. Click "Run" to insert test pathways

This creates:
- 2 pathways (Beginner and Intermediate)
- 2 modules
- 3 challenges

### Step 2: Start Development Server

```bash
npm run dev
```

### Step 3: Test Browse Pathways

1. Navigate to `http://localhost:5173/pathways`
2. You should see 2 pathway cards:
   - "No-Code Web Development Fundamentals" (Beginner)
   - "Full Stack App Development" (Intermediate)

**Test Filters:**
- Search: Type "database" - should show beginner pathway
- Difficulty: Select "Intermediate" - should show only intermediate pathway
- Time: Select "Short" - both should show

**Test Enrollment:**
1. Click "Enroll Now" on a pathway
2. Button should change to "Continue Learning"
3. Card should show "Enrolled" badge

### Step 4: Test Pathway Detail

1. Click on a pathway card
2. Should navigate to `/pathway/{id}`
3. Verify:
   - ✅ Pathway title, description, difficulty badge
   - ✅ Duration and XP displayed correctly
   - ✅ Modules listed in sequence
   - ✅ Challenges listed under each module
   - ✅ If enrolled: Progress bar shows 0/X completed
   - ✅ If not enrolled: "Enroll in Pathway" button visible

**Test Challenge Navigation:**
1. Click "Start" on a challenge
2. Should navigate to challenge detail page

### Step 5: Test Edge Function (Optional)

Deploy the generate-pathway function:

```bash
supabase functions deploy generate-pathway
```

Test with curl:
```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/generate-pathway' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userGoal": "Learn to build a mobile app",
    "difficulty": "Beginner",
    "timeAvailable": 300,
    "userXP": 0
  }'
```

## 🎯 Expected Results

### BrowsePathways Page
- ✅ Shows all published pathways in cards
- ✅ Search filters pathways by title/description
- ✅ Difficulty and time filters work
- ✅ Empty state appears when no results
- ✅ Enrollment status shows correctly
- ✅ XP, duration, and difficulty badges display

### PathwayDetail Page
- ✅ Shows complete pathway information
- ✅ Displays modules and challenges in order
- ✅ Progress tracking for enrolled users
- ✅ "Enroll" button for non-enrolled users
- ✅ Challenge completion checkmarks (if completed)
- ✅ Click-through to challenge detail

### Edge Function
- ✅ Generates structured pathways with modules
- ✅ Applies XP-based filtering (<200 XP = no intermediate)
- ✅ Applies time-based filtering
- ✅ Validates governance rules (recommended tools, no XP values)
- ✅ Returns validation warnings
- ✅ Logs to ai_generation_log

## 🐛 Troubleshooting

### "No pathways found"
- Check seed data was inserted: `SELECT * FROM pathways;`
- Verify status is 'published': `UPDATE pathways SET status = 'published';`

### Progress bar not showing
- Must be enrolled: Check `pathway_enrollments` table
- Try clicking "Enroll" button again

### Challenges not displaying
- Check module_id matches: `SELECT * FROM challenges WHERE module_id IN (SELECT id FROM pathway_modules);`

### Edge Function errors
- Verify ANTHROPIC_API_KEY is set: `supabase secrets list`
- Check function logs: `supabase functions logs generate-pathway`
- Use mock mode for testing (automatic if no API key)

## 📋 Verification Checklist

- [ ] Routes accessible (/pathways, /pathway/:id)
- [ ] Test data seeded successfully
- [ ] Browse page shows pathways
- [ ] Filters work (search, difficulty, time)
- [ ] Enrollment works
- [ ] Detail page shows correct data
- [ ] Progress tracking displays
- [ ] Challenge navigation works
- [ ] Build completes without errors
- [ ] No console errors in browser

## 🚀 Next Steps

After Phase 3 testing is complete, you can:

1. **Add more test pathways** using the seed SQL pattern
2. **Test with real AI generation** (requires Anthropic API key)
3. **Move to Phase 4**: Admin review dashboard
4. **Move to Phase 5**: Security hardening and polish

## 🎉 Success Criteria

Phase 3 is complete when:
- ✅ Users can browse published pathways
- ✅ Users can enroll in pathways
- ✅ Progress is tracked per user
- ✅ Pathway details display correctly
- ✅ XP calculation works automatically
- ✅ Filtering and search work
- ✅ Empty states display properly
- ✅ Mobile responsive design works
