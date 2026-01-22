-- Seed Test Pathways for Phase 3 Testing
-- This creates sample pathways, modules, and challenges for development/testing

-- Create a test pathway: "No-Code Web Development Fundamentals"
INSERT INTO public.pathways (id, title, slug, description, difficulty, estimated_time, total_xp, status, created_at)
VALUES (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'No-Code Web Development Fundamentals',
  'no-code-web-dev-fundamentals',
  'Master the fundamentals of building web applications without writing code. Learn database design, user authentication, and responsive UI development using modern no-code tools.',
  'Beginner',
  300,
  432,
  'published',
  now()
) ON CONFLICT (id) DO NOTHING;

-- Module 1: Database Design
INSERT INTO public.pathway_modules (id, pathway_id, title, description, sequence_order, created_at)
VALUES (
  'b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e',
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'Module 1: Database Design Basics',
  'Learn to design and structure databases for your applications using Supabase.',
  1,
  now()
) ON CONFLICT (id) DO NOTHING;

-- Module 2: User Authentication
INSERT INTO public.pathway_modules (id, pathway_id, title, description, sequence_order, created_at)
VALUES (
  'c3d4e5f6-a7b8-4c5d-8e9f-0a1b2c3d4e5f',
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'Module 2: User Authentication',
  'Implement secure user authentication and authorization in your applications.',
  2,
  now()
) ON CONFLICT (id) DO NOTHING;

-- Challenge 1.1: Create a Simple Database
INSERT INTO public.challenges (
  id, module_id, title, slug, description, requirements, difficulty,
  challenge_type, estimated_time, recommended_tools, status, ai_generated, created_at
)
VALUES (
  'd4e5f6a7-b8c9-4d5e-8f9a-0b1c2d3e4f5a',
  'b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e',
  'Build Your First Database Table',
  'build-first-database-table',
  '# Build Your First Database Table

## Description
Learn to create a well-structured database table in Supabase. You''ll design a "tasks" table for a simple todo application.

## Instructions
1. Create a new Supabase project
2. Navigate to the Table Editor
3. Create a "tasks" table with these columns:
   - id (uuid, primary key)
   - title (text, required)
   - description (text, optional)
   - completed (boolean, default false)
   - created_at (timestamp with timezone)

## Learning Objectives
- Understand database table structure
- Learn about data types and constraints
- Practice using the Supabase dashboard

## Reflection Prompts
- What types of data would you store in different column types?
- Why is it important to set default values?
- How does a primary key help organize data?',
  ARRAY['Create a Supabase project', 'Design a tasks table with 5 columns', 'Set appropriate data types', 'Add constraints (required fields, defaults)'],
  'Beginner',
  'Build',
  45,
  ARRAY['Supabase', 'PostgreSQL'],
  'published',
  false,
  now()
) ON CONFLICT (id) DO NOTHING;

-- Challenge 1.2: Add Relationships Between Tables
INSERT INTO public.challenges (
  id, module_id, title, slug, description, requirements, difficulty,
  challenge_type, estimated_time, recommended_tools, status, ai_generated, created_at
)
VALUES (
  'e5f6a7b8-c9d0-4e5f-8a9b-0c1d2e3f4a5b',
  'b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e',
  'Create Table Relationships',
  'create-table-relationships',
  '# Create Table Relationships

## Description
Extend your database by adding a "users" table and linking tasks to users through foreign keys.

## Instructions
1. Create a "users" table with id, email, and name columns
2. Add a "user_id" column to your tasks table
3. Set up a foreign key relationship between tasks and users
4. Test the relationship by inserting sample data

## Learning Objectives
- Understand one-to-many relationships
- Learn about foreign keys
- Practice data integrity concepts

## Reflection Prompts
- How do foreign keys maintain data consistency?
- What happens if you try to delete a user with tasks?
- When would you use a many-to-many relationship?',
  ARRAY['Create a users table', 'Add user_id column to tasks', 'Configure foreign key constraint', 'Insert test data with relationships'],
  'Beginner',
  'Build',
  60,
  ARRAY['Supabase', 'PostgreSQL'],
  'published',
  false,
  now()
) ON CONFLICT (id) DO NOTHING;

-- Challenge 2.1: Set Up User Registration
INSERT INTO public.challenges (
  id, module_id, title, slug, description, requirements, difficulty,
  challenge_type, estimated_time, recommended_tools, status, ai_generated, created_at
)
VALUES (
  'f6a7b8c9-d0e1-4f5a-8b9c-0d1e2f3a4b5c',
  'c3d4e5f6-a7b8-4c5d-8e9f-0a1b2c3d4e5f',
  'Implement User Registration',
  'implement-user-registration',
  '# Implement User Registration

## Description
Build a user registration flow with email verification using Supabase Auth.

## Instructions
1. Enable email authentication in Supabase settings
2. Create a registration form with email and password fields
3. Implement the signup logic using Supabase client
4. Add email verification handling
5. Create a user profile record on successful registration

## Learning Objectives
- Understand authentication flows
- Learn to use Supabase Auth SDK
- Practice form validation

## Reflection Prompts
- Why is email verification important for security?
- What are the benefits of using a managed auth service?
- How would you handle registration errors gracefully?',
  ARRAY['Enable email auth in Supabase', 'Create registration form', 'Implement signup with Supabase Auth', 'Handle email verification'],
  'Beginner',
  'Build',
  90,
  ARRAY['Supabase', 'React', 'HTML/CSS'],
  'published',
  false,
  now()
) ON CONFLICT (id) DO NOTHING;

-- Challenge 2.2: Add Login and Protected Routes
INSERT INTO public.challenges (
  id, module_id, title, slug, description, requirements, difficulty,
  challenge_type, estimated_time, recommended_tools, status, ai_generated, created_at
)
VALUES (
  'a7b8c9d0-e1f2-4a5b-8c9d-0e1f2a3b4c5d',
  'c3d4e5f6-a7b8-4c5d-8e9f-0a1b2c3d4e5f',
  'Build Login Flow with Protected Routes',
  'build-login-protected-routes',
  '# Build Login Flow with Protected Routes

## Description
Create a login system and protect certain pages so only authenticated users can access them.

## Instructions
1. Create a login form
2. Implement login logic with Supabase Auth
3. Set up session management
4. Create protected route components
5. Add logout functionality

## Learning Objectives
- Understand session-based authentication
- Learn route protection patterns
- Practice state management for auth

## Reflection Prompts
- How does session management work in web applications?
- What are the security considerations for storing tokens?
- How would you handle automatic token refresh?',
  ARRAY['Create login form', 'Implement authentication logic', 'Set up protected routes', 'Add logout functionality', 'Test authentication flow'],
  'Beginner',
  'Build',
  105,
  ARRAY['Supabase', 'React', 'React Router'],
  'published',
  false,
  now()
) ON CONFLICT (id) DO NOTHING;

-- Create a second pathway: "Full Stack App Development"
INSERT INTO public.pathways (id, title, slug, description, difficulty, estimated_time, total_xp, status, created_at)
VALUES (
  'b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e',
  'Full Stack App Development with Supabase',
  'full-stack-supabase',
  'Build a complete full-stack application from scratch. Learn to combine databases, APIs, authentication, and modern frontend frameworks into production-ready apps.',
  'Intermediate',
  480,
  864,
  'published',
  now()
) ON CONFLICT (id) DO NOTHING;

-- Module for intermediate pathway
INSERT INTO public.pathway_modules (id, pathway_id, title, description, sequence_order, created_at)
VALUES (
  'd4e5f6a7-b8c9-4d5e-8f9a-0b1c2d3e4f5a',
  'b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e',
  'Module 1: Building RESTful APIs',
  'Learn to create serverless API endpoints using Supabase Edge Functions.',
  1,
  now()
) ON CONFLICT (id) DO NOTHING;

-- Challenge for intermediate pathway
INSERT INTO public.challenges (
  id, module_id, title, slug, description, requirements, difficulty,
  challenge_type, estimated_time, recommended_tools, status, ai_generated, created_at
)
VALUES (
  'e5f6a7b8-c9d0-4e5f-8a9b-0c1d2e3f4a5b',
  'd4e5f6a7-b8c9-4d5e-8f9a-0b1c2d3e4f5a',
  'Create Your First Edge Function',
  'create-first-edge-function',
  '# Create Your First Edge Function

## Description
Build a serverless API endpoint using Supabase Edge Functions with Deno runtime.

## Instructions
1. Set up Supabase CLI locally
2. Create a new Edge Function
3. Implement a simple API that returns JSON
4. Add CORS headers
5. Deploy to Supabase

## Learning Objectives
- Understand serverless architecture
- Learn Deno basics
- Practice API development

## Reflection Prompts
- What are the benefits of serverless functions?
- How does Deno differ from Node.js?
- When should you use Edge Functions vs database functions?',
  ARRAY['Install Supabase CLI', 'Create Edge Function', 'Implement API logic', 'Add CORS', 'Deploy and test'],
  'Intermediate',
  'Build',
  120,
  ARRAY['Supabase', 'Deno', 'TypeScript'],
  'published',
  false,
  now()
) ON CONFLICT (id) DO NOTHING;

-- Update pathway total_xp based on challenges (this would normally be calculated automatically)
-- For the first pathway: 45 + 60 + 90 + 105 = 300 minutes
-- Using XP calculation: Beginner (50 base) + time bonus + Build multiplier (1.5)
-- Approximate total: 432 XP

-- For the second pathway: 120 minutes
-- Intermediate (100 base) + time bonus + Build multiplier (1.5)
-- Approximate: 192 XP per challenge

UPDATE public.pathways
SET total_xp = (
  SELECT COALESCE(SUM(c.xp_reward), 0)
  FROM public.challenges c
  INNER JOIN public.pathway_modules pm ON c.module_id = pm.id
  WHERE pm.pathway_id = pathways.id
)
WHERE id IN ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e');
