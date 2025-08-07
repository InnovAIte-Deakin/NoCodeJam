// Test database connection and environment
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sulcylvskbtobhbkpkte.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1bGN5bHZza2J0b2JoYmtwa3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNTExMjMsImV4cCI6MjA2ODgyNzEyM30.ISG3r9xBlogxb8XyIU-trDGiZT3WrdcigfgBjlnCdpI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEnvironment() {
  console.log('=== Environment and Connection Test ===');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Using anon key starting with:', supabaseAnonKey.substring(0, 50) + '...');
  
  try {
    // Test connection with different tables to see what we can access
    console.log('\n1. Testing different table access:');
    
    // Test users table
    const { data: users, error: usersError, count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .limit(1);
    console.log('- Users table:', { 
      accessible: !usersError, 
      count: usersCount,
      error: usersError?.message 
    });
    
    // Test challenges table
    const { data: challenges, error: challengesError, count: challengesCount } = await supabase
      .from('challenges')
      .select('*', { count: 'exact' })
      .limit(1);
    console.log('- Challenges table:', { 
      accessible: !challengesError, 
      count: challengesCount,
      error: challengesError?.message 
    });
    
    // Test onboarding_steps with count
    const { data: steps, error: stepsError, count: stepsCount } = await supabase
      .from('onboarding_steps')
      .select('*', { count: 'exact' })
      .limit(1);
    console.log('- Onboarding_steps table:', { 
      accessible: !stepsError, 
      count: stepsCount,
      error: stepsError?.message 
    });
    
    // Test submissions table
    const { data: submissions, error: submissionsError, count: submissionsCount } = await supabase
      .from('submissions')
      .select('*', { count: 'exact' })
      .limit(1);
    console.log('- Submissions table:', { 
      accessible: !submissionsError, 
      count: submissionsCount,
      error: submissionsError?.message 
    });
    
    console.log('\n2. Testing onboarding_steps with different approaches:');
    
    // Try selecting specific IDs that we see in the dashboard
    const { data: step1, error: step1Error } = await supabase
      .from('onboarding_steps')
      .select('*')
      .eq('id', 1);
    console.log('- Select ID 1:', { 
      found: step1?.length > 0, 
      data: step1, 
      error: step1Error?.message 
    });
    
    // Try without any filters
    const { data: allSteps, error: allError } = await supabase
      .from('onboarding_steps')
      .select('*');
    console.log('- Select all:', { 
      count: allSteps?.length || 0, 
      data: allSteps, 
      error: allError?.message 
    });
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

testEnvironment();
