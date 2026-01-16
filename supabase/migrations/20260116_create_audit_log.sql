-- Create a table to track AI usage for audit and rate limiting
create table if not exists public.ai_generation_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id), -- Nullable if we want to track anonymous attempts, but usually strict
  action text not null,     -- 'chat', 'chat-learn', 'generate'
  model text,               -- e.g. 'claude-sonnet-4-5-20250929'
  prompt_length int,        -- approximate char count or tokens
  response_length int,      -- approximate char count
  status text,              -- 'success', 'error', 'rate_limit'
  error_message text,
  metadata jsonb,           -- Any extra context
  created_at timestamptz default now()
);

-- Index for fast rate limiting lookups (counting recent requests by user)
create index if not exists idx_ai_log_user_created 
  on public.ai_generation_log(user_id, created_at);

-- Enable RLS
alter table public.ai_generation_log enable row level security;

-- Policies
-- 1. Users can view their own logs (optional, good for transparency)
create policy "Users can view own logs"
  on public.ai_generation_log for select
  using ( auth.uid() = user_id );

-- 2. Only Service Role (Edge Functions) can insert. 
-- We do NOT want users manually inserting logs via client API to fake usage or spam.
-- So we add NO insert policy for public/authenticated roles.
-- The Edge Function will use the Service Role Key to bypass RLS for writing logs.
