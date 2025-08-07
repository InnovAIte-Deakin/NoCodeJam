// Check submissions table structure for get-onboarding-progress function
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sulcylvskbtobhbkpkte.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1bGN5bHZza2J0b2JoYmtwa3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNTExMjMsImV4cCI6MjA2ODgyNzEyM30.ISG3r9xBlogxb8XyIU-trDGiZT3WrdcigfgBjlnCdpI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSubmissionsStructure() {
  console.log('=== Checking Submissions Table Structure ===');
  
  try {
    // Test each column individually to see which ones exist in submissions table
    const columns = [
      'id',
      'user_id', 
      'challenge_id',
      'onboarding_step_id',
      'step_id',
      'submission_url',
      'submission_text',
      'status',
      'admin_feedback',
      'submitted_at',
      'created_at',
      'updated_at'
    ];
    
    for (const column of columns) {
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select(column)
          .limit(1);
        console.log(`Column '${column}':`, error ? 'DOES NOT EXIST' : 'exists');
      } catch (e) {
        console.log(`Column '${column}': DOES NOT EXIST`);
      }
    }
    
    // Also check challenges table columns
    console.log('\n=== Checking Challenges Table Structure ===');
    const challengeColumns = [
      'id',
      'title',
      'description', 
      'difficulty',
      'category',
      'xp_reward',
      'created_at',
      'updated_at'
    ];
    
    for (const column of challengeColumns) {
      try {
        const { data, error } = await supabase
          .from('challenges')
          .select(column)
          .limit(1);
        console.log(`Column '${column}':`, error ? 'DOES NOT EXIST' : 'exists');
      } catch (e) {
        console.log(`Column '${column}': DOES NOT EXIST`);
      }
    }
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

checkSubmissionsStructure();
