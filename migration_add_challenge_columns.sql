-- Add missing columns to challenges table
-- Run this in your Supabase SQL Editor

-- Add image column if it doesn't exist
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS image TEXT;

-- Add created_by column if it doesn't exist
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS created_by UUID;

-- Add suggested_tools column if it doesn't exist
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS suggested_tools TEXT;

-- Add estimated_time column if it doesn't exist
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS estimated_time TEXT;

-- Add updated_at column if it doesn't exist
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for challenges table
DROP TRIGGER IF EXISTS update_challenges_updated_at ON challenges;
CREATE TRIGGER update_challenges_updated_at
    BEFORE UPDATE ON challenges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
