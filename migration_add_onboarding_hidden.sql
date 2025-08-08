-- Add onboarding_hidden column to users table
ALTER TABLE users 
ADD COLUMN onboarding_hidden boolean NOT NULL DEFAULT false;
