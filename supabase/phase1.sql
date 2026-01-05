-- Phase 1: workspaces + memberships
create extension if not exists "uuid-ossp";

create table if not exists public.workspaces (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_id uuid not null,
  created_at timestamptz not null default now()
);

create table if not exists public.memberships (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('admin','member','viewer')),
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

alter table public.workspaces enable row level security;
alter table public.memberships enable row level security;

create policy "workspaces: owner or member can view"
on public.workspaces for select
using (
  exists (
    select 1 from public.memberships
    where memberships.workspace_id = workspaces.id
      and memberships.user_id = auth.uid()
  )
  or workspaces.owner_id = auth.uid()
);

create policy "workspaces: owner can insert"
on public.workspaces for insert
with check (auth.uid() = owner_id);

create policy "memberships: user can view own memberships"
on public.memberships for select
using (auth.uid() = user_id);

create policy "memberships: user can insert own membership"
on public.memberships for insert
with check (auth.uid() = user_id);
