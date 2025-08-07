// Debug script to check table structure
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sulcylvskbtobhbkpkte.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1bGN5bHZza2J0b2JoYmtwa3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNTExMjMsImV4cCI6MjA2ODgyNzEyM30.ISG3r9xBlogxb8XyIU-trDGiZT3WrdcigfgBjlnCdpI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTableStructure() {
  console.log('=== Checking Database Structure and Permissions ===');
  
  try {
    // Check if we can access any tables
    console.log('\n1. Testing access to different tables:');
    
    // Test users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    console.log('Users table access:', { hasData: !!users, error: usersError?.message });
    
    // Test challenges table  
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select('id')
      .limit(1);
    console.log('Challenges table access:', { hasData: !!challenges, error: challengesError?.message });
    
    // Test submissions table
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('id')
      .limit(1);
    console.log('Submissions table access:', { hasData: !!submissions, error: submissionsError?.message });
    
    // Test onboarding_steps table (minimal select)
    const { data: onboardingSteps, error: onboardingError } = await supabase
      .from('onboarding_steps')
      .select('id')
      .limit(1);
    console.log('Onboarding_steps table access:', { hasData: !!onboardingSteps, error: onboardingError?.message });
    
    // If onboarding_steps is accessible, try to understand its structure
    if (!onboardingError) {
      console.log('\n2. Testing onboarding_steps table structure:');
      
      // Try each column individually to see which ones exist
      const columns = [
        'id',
        'step_number', 
        'title',
        'description',
        'prompt_instructions',
        'video_url',
        'submission_type',
        'submission_label',
        'created_at',
        'updated_at'
      ];
      
      for (const column of columns) {
        try {
          const { data, error } = await supabase
            .from('onboarding_steps')
            .select(column)
            .limit(1);
          console.log(`Column '${column}':`, error ? 'DOES NOT EXIST' : 'exists');
        } catch (e) {
          console.log(`Column '${column}': DOES NOT EXIST`);
        }
      }
      
      // Try to get a count of rows
      console.log('\n3. Checking row count:');
      const { count, error: countError } = await supabase
        .from('onboarding_steps')
        .select('*', { count: 'exact', head: true });
      console.log('Row count:', { count, error: countError?.message });
    }
    
  } catch (error) {
    console.error('Debug script error:', error);
  }
}

// Run the debug function
checkTableStructure();
