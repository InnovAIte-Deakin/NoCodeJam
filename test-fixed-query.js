// Test the fixed query without updated_at column
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sulcylvskbtobhbkpkte.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1bGN5bHZza2J0b2JoYmtwa3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNTExMjMsImV4cCI6MjA2ODgyNzEyM30.ISG3r9xBlogxb8XyIU-trDGiZT3WrdcigfgBjlnCdpI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFixedQuery() {
  console.log('=== Testing Fixed Query (without updated_at) ===');
  
  try {
    // Test the exact query that the fixed Edge Function will use
    const { data: steps, error } = await supabase
      .from('onboarding_steps')
      .select('id, step_number, title, description, prompt_instructions, video_url, submission_type, submission_label, created_at')
      .order('step_number', { ascending: true });
    
    console.log('Query result:');
    console.log('- Error:', error);
    console.log('- Data:', steps);
    console.log('- Count:', steps?.length || 0);
    
    if (steps && steps.length > 0) {
      console.log('\nDetailed data:');
      steps.forEach((step, index) => {
        console.log(`\nStep ${index + 1}:`);
        console.log(`  ID: ${step.id}`);
        console.log(`  Step Number: ${step.step_number}`);
        console.log(`  Title: ${step.title}`);
        console.log(`  Description: ${step.description}`);
        console.log(`  Submission Type: ${step.submission_type}`);
        console.log(`  Submission Label: ${step.submission_label}`);
      });
    }
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

testFixedQuery();
