// Script to insert onboarding steps data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sulcylvskbtobhbkpkte.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1bGN5bHZza2J0b2JoYmtwa3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNTExMjMsImV4cCI6MjA2ODgyNzEyM30.ISG3r9xBlogxb8XyIU-trDGiZT3WrdcigfgBjlnCdpI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const onboardingStepsData = [
  {
    step_number: 1,
    title: 'Introduction to AI Prompts',
    description: 'Learn the basics of writing effective AI prompts',
    prompt_instructions: 'Watch the video and learn about creating effective prompts for AI tools. Then write a brief summary of what you learned.',
    video_url: 'https://www.youtube.com/watch?v=placeholder1',
    submission_type: 'text',
    submission_label: 'Write your summary of AI prompt basics'
  },
  {
    step_number: 2,
    title: 'Building a Landing Page',
    description: 'Use a no-code tool to build a simple landing page',
    prompt_instructions: 'Follow the tutorial to create a landing page using a no-code tool like Webflow, Framer, or similar. Submit the URL to your completed page.',
    video_url: 'https://www.youtube.com/watch?v=placeholder2',
    submission_type: 'url',
    submission_label: 'Submit your landing page URL'
  },
  {
    step_number: 3,
    title: 'Final Review',
    description: 'Record a short video explaining your creation',
    prompt_instructions: 'Create a short video (2-3 minutes) explaining your landing page and what you learned during this onboarding process. Upload to YouTube or similar platform.',
    video_url: 'https://www.youtube.com/watch?v=placeholder3',
    submission_type: 'url',
    submission_label: 'Submit your video URL'
  }
];

async function insertOnboardingSteps() {
  console.log('=== Inserting Onboarding Steps ===');
  
  try {
    // First, check if any data already exists
    const { data: existing, error: checkError } = await supabase
      .from('onboarding_steps')
      .select('*');
    
    if (checkError) {
      console.error('Error checking existing data:', checkError);
      return;
    }
    
    console.log(`Found ${existing?.length || 0} existing rows`);
    
    if (existing && existing.length > 0) {
      console.log('Data already exists. Deleting existing data first...');
      const { error: deleteError } = await supabase
        .from('onboarding_steps')
        .delete()
        .gte('id', 0); // Delete all rows
      
      if (deleteError) {
        console.error('Error deleting existing data:', deleteError);
        return;
      }
      console.log('Existing data deleted successfully');
    }
    
    // Insert the new data
    console.log('Inserting new onboarding steps...');
    const { data, error } = await supabase
      .from('onboarding_steps')
      .insert(onboardingStepsData)
      .select();
    
    if (error) {
      console.error('Error inserting data:', error);
      return;
    }
    
    console.log('Success! Inserted onboarding steps:');
    console.log(data);
    
    // Verify the data was inserted
    const { data: verification, error: verifyError } = await supabase
      .from('onboarding_steps')
      .select('*')
      .order('step_number', { ascending: true });
    
    if (verifyError) {
      console.error('Error verifying data:', verifyError);
    } else {
      console.log(`\nVerification: ${verification?.length || 0} rows in table`);
      verification?.forEach(step => {
        console.log(`- Step ${step.step_number}: ${step.title}`);
      });
    }
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

// Run the function
insertOnboardingSteps();
