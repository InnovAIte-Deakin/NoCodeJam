// Check RLS policies and suggest solutions
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sulcylvskbtobhbkpkte.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1bGN5bHZza2J0b2JoYmtwa3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNTExMjMsImV4cCI6MjA2ODgyNzEyM30.ISG3r9xBlogxb8XyIU-trDGiZT3WrdcigfgBjlnCdpI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRLSPolicies() {
  console.log('=== RLS Policy Check ===');
  
  try {
    // Test with a simple insert that should fail due to RLS
    console.log('Testing RLS on onboarding_steps table...');
    const { data, error } = await supabase
      .from('onboarding_steps')
      .insert([{ 
        step_number: 999, 
        title: 'Test', 
        description: 'Test description' 
      }]);
    
    if (error) {
      if (error.code === '42501' && error.message.includes('row-level security')) {
        console.log('✓ RLS is ENABLED on onboarding_steps table');
        console.log('✓ Anonymous users cannot insert data');
        
        // Test reading
        const { data: readData, error: readError } = await supabase
          .from('onboarding_steps')
          .select('*')
          .limit(1);
        
        if (readError && readError.code === '42501') {
          console.log('✓ Anonymous users cannot read data either');
        } else if (!readError) {
          console.log('✓ Anonymous users CAN read data');
        }
        
      } else {
        console.log('Different error:', error);
      }
    } else {
      console.log('✓ Insert succeeded - RLS might not be enabled');
    }
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

checkRLSPolicies();
