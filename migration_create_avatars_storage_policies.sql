-- Migration: Create storage policies for avatars bucket
-- This migration creates the necessary storage policies to allow users to manage their own avatar files

-- First, ensure the avatars bucket exists (this should already exist)
-- If it doesn't exist, uncomment the line below:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Policy 1: Allow authenticated users to upload avatar files
-- Users can only upload files that start with their user ID
CREATE POLICY "Users can upload their own avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'avatars'
    AND starts_with(name, auth.uid()::text || '_')
  );

-- Policy 2: Allow authenticated users to view avatar files
-- Users can view any file in the avatars bucket (for public access)
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Policy 3: Allow authenticated users to update their own avatar files
-- Users can only update files that start with their user ID
CREATE POLICY "Users can update their own avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND starts_with(name, auth.uid()::text || '_')
  ) WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND starts_with(name, auth.uid()::text || '_')
  );

-- Policy 4: Allow authenticated users to delete their own avatar files
-- This is the critical policy that was missing!
CREATE POLICY "Users can delete their own avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND starts_with(name, auth.uid()::text || '_')
  );

-- Policy 5: Allow authenticated users to list files in avatars bucket
-- Users can list files to see what they have access to
CREATE POLICY "Users can list avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Optional: Policy for admins to manage all avatars
-- Uncomment if you want admins to be able to manage all avatar files
/*
CREATE POLICY "Admins can manage all avatars" ON storage.objects
  FOR ALL USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
*/
