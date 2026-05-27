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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_owner()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_admin = true
  );
$$;

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

create table if not exists active_sessions (
  local_id text primary key,
  user_id uuid references profiles(id) on delete cascade,
  username text,
  function text,
  machine text,
  boat text,
  hold text,
  start timestamptz,
  elapsed_ms bigint default 0,
  status text default 'active',
  updated_at timestamptz default now()
);

-- Indexes for faster queries
create index if not exists idx_sessions_user on sessions(user_id);
create index if not exists idx_maintenance_user on maintenance(user_id);
create index if not exists idx_active_sessions_user on active_sessions(user_id);
create index if not exists idx_active_sessions_updated_at on active_sessions(updated_at);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'active_sessions'
  ) then
    alter publication supabase_realtime add table active_sessions;
  end if;
end $$;

alter table profiles enable row level security;
alter table sessions enable row level security;
alter table maintenance enable row level security;
alter table active_sessions enable row level security;

drop policy if exists "profiles_select_own_or_admin" on profiles;
create policy "profiles_select_own_or_admin"
on profiles for select
to authenticated
using (
  id = auth.uid()
  or public.is_owner()
);

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own"
on profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "sessions_select_own_or_admin" on sessions;
create policy "sessions_select_own_or_admin"
on sessions for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_owner()
);

drop policy if exists "sessions_insert_own" on sessions;
create policy "sessions_insert_own"
on sessions for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "maintenance_select_own_or_admin" on maintenance;
create policy "maintenance_select_own_or_admin"
on maintenance for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_owner()
);

drop policy if exists "maintenance_insert_own" on maintenance;
create policy "maintenance_insert_own"
on maintenance for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "active_sessions_select_own_or_admin" on active_sessions;
create policy "active_sessions_select_own_or_admin"
on active_sessions for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_owner()
);

drop policy if exists "active_sessions_insert_own" on active_sessions;
create policy "active_sessions_insert_own"
on active_sessions for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "active_sessions_update_own" on active_sessions;
create policy "active_sessions_update_own"
on active_sessions for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "active_sessions_delete_own" on active_sessions;
create policy "active_sessions_delete_own"
on active_sessions for delete
to authenticated
using (user_id = auth.uid());
