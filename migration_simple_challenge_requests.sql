-- Simple migration for challenge_requests table
-- Run this in your Supabase SQL Editor

-- Create the table
CREATE TABLE challenge_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  difficulty VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  requirements TEXT NOT NULL,
  expected_outcome TEXT NOT NULL,
  estimated_time VARCHAR(50),
  additional_notes TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID
);

-- Enable RLS
ALTER TABLE challenge_requests ENABLE ROW LEVEL SECURITY;

-- Create basic policies (allow all for now, you can restrict later)
CREATE POLICY "Allow all operations for authenticated users" ON challenge_requests
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Create indexes
CREATE INDEX idx_challenge_requests_user_id ON challenge_requests(user_id);
CREATE INDEX idx_challenge_requests_status ON challenge_requests(status);
CREATE INDEX idx_challenge_requests_created_at ON challenge_requests(created_at);
