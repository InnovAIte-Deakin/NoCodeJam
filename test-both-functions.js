// Test both Edge Functions to see which one is failing
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sulcylvskbtobhbkpkte.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1bGN5bHZza2J0b2JoYmtwa3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNTExMjMsImV4cCI6MjA2ODgyNzEyM30.ISG3r9xBlogxb8XyIU-trDGiZT3WrdcigfgBjlnCdpI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testBothFunctions() {
  console.log('=== Testing Both Edge Functions ===');
  
  try {
    console.log('\n1. Testing get-onboarding-steps function...');
    const stepsResponse = await supabase.functions.invoke('get-onboarding-steps', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Steps Function Response:');
    console.log('- Error:', stepsResponse.error);
    console.log('- Data:', stepsResponse.data);
    console.log('- Status:', stepsResponse.status);
    
    console.log('\n2. Testing get-onboarding-progress function...');
    const progressResponse = await supabase.functions.invoke('get-onboarding-progress', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Progress Function Response:');
    console.log('- Error:', progressResponse.error);
    console.log('- Data:', progressResponse.data);
    console.log('- Status:', progressResponse.status);
    
    // Also test direct database access to related tables
    console.log('\n3. Testing direct database access...');
    
    // Test submissions table structure
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('*')
      .limit(1);
    console.log('Submissions table:', { 
      accessible: !submissionsError, 
      error: submissionsError?.message,
      sampleData: submissions?.[0] 
    });
    
    // Test challenges table structure  
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select('*')
      .limit(1);
    console.log('Challenges table:', { 
      accessible: !challengesError, 
      error: challengesError?.message,
      sampleData: challenges?.[0] 
    });
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

testBothFunctions();
