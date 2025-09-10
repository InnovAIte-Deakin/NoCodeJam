-- Create challenge_requests table
CREATE TABLE IF NOT EXISTS challenge_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  category VARCHAR(100) NOT NULL,
  requirements TEXT NOT NULL,
  expected_outcome TEXT NOT NULL,
  estimated_time VARCHAR(50),
  additional_notes TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_challenge_requests_user_id ON challenge_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_requests_status ON challenge_requests(status);
CREATE INDEX IF NOT EXISTS idx_challenge_requests_created_at ON challenge_requests(created_at);

-- Enable Row Level Security
ALTER TABLE challenge_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own requests
CREATE POLICY "Users can view own challenge requests" ON challenge_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own requests
CREATE POLICY "Users can insert own challenge requests" ON challenge_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending requests
CREATE POLICY "Users can update own pending requests" ON challenge_requests
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all requests
CREATE POLICY "Admins can view all challenge requests" ON challenge_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Admins can update all requests
CREATE POLICY "Admins can update all challenge requests" ON challenge_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_challenge_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_challenge_requests_updated_at
  BEFORE UPDATE ON challenge_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_requests_updated_at();
