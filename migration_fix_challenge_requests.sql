-- Fix challenge_requests table to match the simplified form
-- Run this in your Supabase SQL Editor

-- Make category column nullable (or remove it entirely)
ALTER TABLE challenge_requests ALTER COLUMN category DROP NOT NULL;

-- Set default value for category if you want to keep it
UPDATE challenge_requests SET category = 'general' WHERE category IS NULL;

-- Or if you want to remove the category column entirely, uncomment this:
-- ALTER TABLE challenge_requests DROP COLUMN category;

-- Also make other columns nullable that we removed from the form
ALTER TABLE challenge_requests ALTER COLUMN expected_outcome DROP NOT NULL;
ALTER TABLE challenge_requests ALTER COLUMN estimated_time DROP NOT NULL;
ALTER TABLE challenge_requests ALTER COLUMN additional_notes DROP NOT NULL;
