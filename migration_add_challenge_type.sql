-- Add challenge_type field to help identify onboarding challenges
ALTER TABLE challenges 
ADD COLUMN challenge_type VARCHAR(50) DEFAULT 'general';

-- Update or insert an onboarding challenge
-- First try to update an existing challenge
UPDATE challenges 
SET challenge_type = 'onboarding',
    title = 'NoCodeJam Onboarding Challenge',
    description = 'Complete this challenge to learn the basics of no-code development'
WHERE id = 1;

-- If no challenge exists with id = 1, you may need to insert one:
-- INSERT INTO challenges (title, description, challenge_type, created_at, updated_at)
-- VALUES ('NoCodeJam Onboarding Challenge', 'Complete this challenge to learn the basics of no-code development', 'onboarding', NOW(), NOW());
