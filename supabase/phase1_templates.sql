-- Phase 1 add-on: policy templates seeded per workspace
create table if not exists public.policy_templates (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  category text not null,
  description text not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.policy_templates enable row level security;

create policy "policy_templates: members can view"
on public.policy_templates for select
using (
  exists (
    select 1 from public.memberships
    where memberships.workspace_id = policy_templates.workspace_id
      and memberships.user_id = auth.uid()
  )
);

create policy "policy_templates: members can insert"
on public.policy_templates for insert
with check (
  exists (
    select 1 from public.memberships
    where memberships.workspace_id = policy_templates.workspace_id
      and memberships.user_id = auth.uid()
  )
);
