-- Add submission fields to onboarding_steps table
ALTER TABLE onboarding_steps 
ADD COLUMN submission_type VARCHAR(10) CHECK (submission_type IN ('url', 'text')),
ADD COLUMN submission_label VARCHAR(255);

-- Update existing steps with sample submission requirements
UPDATE onboarding_steps 
SET 
  submission_type = 'url',
  submission_label = 'Project URL'
WHERE step_number = 1;

UPDATE onboarding_steps 
SET 
  submission_type = 'text',
  submission_label = 'Your Learning Summary'
WHERE step_number = 2;

UPDATE onboarding_steps 
SET 
  submission_type = 'url',
  submission_label = 'Deployed Application URL'
WHERE step_number = 3;
