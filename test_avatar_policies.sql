-- Test script to verify avatar storage policies are working
-- Run this after applying the migration to verify the policies are correct

-- Check if the avatars bucket exists
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Check all storage policies for the objects table
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- Test the policy logic (replace 'your-user-id' with an actual user ID)
-- This query simulates what the policy should allow
SELECT 
    'Test policy logic' as test_type,
    'Users can delete their own avatars' as policy_name,
    CASE 
        WHEN 'e605040b-a75d-4cf5-81ec-b16bbda08b75_1757847236670.jpg' LIKE 'e605040b-a75d-4cf5-81ec-b16bbda08b75_%' 
        THEN 'PASS - File name matches user ID pattern'
        ELSE 'FAIL - File name does not match user ID pattern'
    END as test_result;

-- Check if there are any conflicting policies
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND cmd = 'DELETE'
AND policyname NOT LIKE '%avatar%';
