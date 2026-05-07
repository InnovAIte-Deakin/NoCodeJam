const { data: challenges, error: challengesError } = await supabaseClient
  .from('challenges')
  .select('*')
  .eq('status', 'published')
  .eq('difficulty', targetDifficulty)
  .limit(10)

if (challengesError) throw challengesError;

console.log('targetDifficulty:', targetDifficulty);
console.log('completedIds:', completedIds);
console.log('challenges found:', challenges);