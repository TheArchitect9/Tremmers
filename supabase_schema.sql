-- Supabase schema for Alpha Work Tracker

-- Profiles table links to auth.users (created by Supabase Auth)
-- NOTE: changed default for `approved` to true so accounts are usable immediately after signup.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  approved boolean default true,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- If you already have profiles, run this update to set them to approved
-- UPDATE profiles SET approved = true WHERE approved IS DISTINCT FROM true;

-- Sessions (work records)
create table if not exists sessions (
  id bigserial primary key,
  user_id uuid references profiles(id) on delete set null,
  function text,
  machine text,
  boat text,
  hold text,
  start timestamptz,
  end timestamptz,
  duration_ms bigint,
  created_at timestamptz default now()
);

-- Maintenance logs
create table if not exists maintenance (
  id bigserial primary key,
  user_id uuid references profiles(id) on delete set null,
  machine text,
  options text[],
  ts timestamptz default now()
);

-- Indexes for faster queries
create index if not exists idx_sessions_user on sessions(user_id);
create index if not exists idx_maintenance_user on maintenance(user_id);
