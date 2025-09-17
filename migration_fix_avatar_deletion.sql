-- Migration: Fix avatar deletion by adding missing DELETE policy
-- This migration specifically addresses the issue where file deletion returns success but files remain

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can list avatars" ON storage.objects;

-- Create comprehensive storage policies for avatars bucket

-- 1. Allow users to upload their own avatar files
CREATE POLICY "Users can upload their own avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND starts_with(name, auth.uid()::text || '_')
  );

-- 2. Allow anyone to view avatar files (for public access)
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- 3. Allow users to update their own avatar files
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

-- 4. CRITICAL: Allow users to delete their own avatar files
-- This is the policy that was missing and causing the deletion issue
CREATE POLICY "Users can delete their own avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND starts_with(name, auth.uid()::text || '_')
  );

-- 5. Allow users to list files in avatars bucket
CREATE POLICY "Users can list avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%avatar%';
