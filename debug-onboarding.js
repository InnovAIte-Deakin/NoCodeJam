// Debug script to test the onboarding steps query directly
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sulcylvskbtobhbkpkte.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1bGN5bHZza2J0b2JoYmtwa3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNTExMjMsImV4cCI6MjA2ODgyNzEyM30.ISG3r9xBlogxb8XyIU-trDGiZT3WrdcigfgBjlnCdpI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugOnboardingSteps() {
  console.log('=== Debug Onboarding Steps Query ===');
  
  try {
    // Test 1: Simple select all from onboarding_steps
    console.log('\n1. Testing basic select from onboarding_steps table:');
    const { data: allSteps, error: allError } = await supabase
      .from('onboarding_steps')
      .select('*');
    
    console.log('Result:', { data: allSteps, error: allError });
    console.log('Number of rows:', allSteps?.length || 0);
    
    if (allSteps && allSteps.length > 0) {
      console.log('First row:', allSteps[0]);
    }
    
    // Test 2: Select with order by step_number
    console.log('\n2. Testing select with ORDER BY step_number:');
    const { data: orderedSteps, error: orderedError } = await supabase
      .from('onboarding_steps')
      .select('*')
      .order('step_number', { ascending: true });
    
    console.log('Result:', { data: orderedSteps, error: orderedError });
    
    // Test 3: Check table permissions (try to select with different approaches)
    console.log('\n3. Testing with specific columns only:');
    const { data: specificSteps, error: specificError } = await supabase
      .from('onboarding_steps')
      .select('id, step_number, title, description');
    
    console.log('Result:', { data: specificSteps, error: specificError });
    
    // Test 4: Try the exact query from the Edge Function
    console.log('\n4. Testing exact Edge Function query:');
    const { data: edgeFunctionSteps, error: edgeFunctionError } = await supabase
      .from('onboarding_steps')
      .select('id, step_number, title, description, prompt_instructions, video_url, submission_type, submission_label, created_at, updated_at')
      .order('step_number', { ascending: true });
    
    console.log('Result:', { data: edgeFunctionSteps, error: edgeFunctionError });
    
  } catch (error) {
    console.error('Debug script error:', error);
  }
}

// Run the debug function
debugOnboardingSteps();
