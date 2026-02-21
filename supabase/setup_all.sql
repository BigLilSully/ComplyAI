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

-- Phase 2: core domain schema + RLS policies
create extension if not exists "uuid-ossp";

create or replace function public.is_workspace_member(_workspace_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.memberships
    where memberships.workspace_id = _workspace_id
      and memberships.user_id = auth.uid()
  );
$$;

create table if not exists public.policies (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  status text not null check (status in ('draft','published','archived')),
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.policy_versions (
  id uuid primary key default uuid_generate_v4(),
  policy_id uuid not null references public.policies(id) on delete cascade,
  version integer not null,
  content text not null,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  unique (policy_id, version)
);

create table if not exists public.controls (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  policy_id uuid references public.policies(id) on delete set null,
  title text not null,
  description text,
  control_type text,
  frequency text,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  control_id uuid not null references public.controls(id) on delete cascade,
  status text not null check (status in ('open','in_progress','blocked','done')),
  due_date date,
  assigned_to uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_cycles (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  frequency text not null check (frequency in ('monthly','quarterly','yearly','custom')),
  next_run_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_runs (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  audit_cycle_id uuid references public.audit_cycles(id) on delete set null,
  period_start date,
  period_end date,
  status text not null check (status in ('scheduled','in_progress','complete')),
  created_at timestamptz not null default now()
);

create table if not exists public.attestations (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  audit_run_id uuid not null references public.audit_runs(id) on delete cascade,
  control_id uuid not null references public.controls(id) on delete cascade,
  user_id uuid not null,
  response text,
  notes text,
  signed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.evidence_items (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  audit_run_id uuid not null references public.audit_runs(id) on delete cascade,
  control_id uuid references public.controls(id) on delete set null,
  file_url text not null,
  metadata jsonb,
  uploaded_by uuid not null,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_id uuid not null,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  created_at timestamptz not null default now()
);

create index if not exists policies_workspace_idx on public.policies(workspace_id);
create index if not exists controls_workspace_idx on public.controls(workspace_id);
create index if not exists tasks_workspace_idx on public.tasks(workspace_id);
create index if not exists audit_cycles_workspace_idx on public.audit_cycles(workspace_id);
create index if not exists audit_runs_workspace_idx on public.audit_runs(workspace_id);
create index if not exists attestations_workspace_idx on public.attestations(workspace_id);
create index if not exists evidence_items_workspace_idx on public.evidence_items(workspace_id);
create index if not exists audit_events_workspace_idx on public.audit_events(workspace_id);

alter table public.policies enable row level security;
alter table public.policy_versions enable row level security;
alter table public.controls enable row level security;
alter table public.tasks enable row level security;
alter table public.audit_cycles enable row level security;
alter table public.audit_runs enable row level security;
alter table public.attestations enable row level security;
alter table public.evidence_items enable row level security;
alter table public.audit_events enable row level security;

create policy "policies: members can view"
on public.policies for select
using (public.is_workspace_member(workspace_id));

create policy "policies: members can insert"
on public.policies for insert
with check (public.is_workspace_member(workspace_id));

create policy "policies: members can update"
on public.policies for update
using (public.is_workspace_member(workspace_id));

create policy "policies: members can delete"
on public.policies for delete
using (public.is_workspace_member(workspace_id));

create policy "policy_versions: members can view"
on public.policy_versions for select
using (
  exists (
    select 1 from public.policies
    where policies.id = policy_versions.policy_id
      and public.is_workspace_member(policies.workspace_id)
  )
);

create policy "policy_versions: members can insert"
on public.policy_versions for insert
with check (
  exists (
    select 1 from public.policies
    where policies.id = policy_versions.policy_id
      and public.is_workspace_member(policies.workspace_id)
  )
);

create policy "controls: members can view"
on public.controls for select
using (public.is_workspace_member(workspace_id));

create policy "controls: members can insert"
on public.controls for insert
with check (public.is_workspace_member(workspace_id));

create policy "controls: members can update"
on public.controls for update
using (public.is_workspace_member(workspace_id));

create policy "tasks: members can view"
on public.tasks for select
using (public.is_workspace_member(workspace_id));

create policy "tasks: members can insert"
on public.tasks for insert
with check (public.is_workspace_member(workspace_id));

create policy "tasks: members can update"
on public.tasks for update
using (public.is_workspace_member(workspace_id));

create policy "audit_cycles: members can view"
on public.audit_cycles for select
using (public.is_workspace_member(workspace_id));

create policy "audit_cycles: members can insert"
on public.audit_cycles for insert
with check (public.is_workspace_member(workspace_id));

create policy "audit_cycles: members can update"
on public.audit_cycles for update
using (public.is_workspace_member(workspace_id));

create policy "audit_runs: members can view"
on public.audit_runs for select
using (public.is_workspace_member(workspace_id));

create policy "audit_runs: members can insert"
on public.audit_runs for insert
with check (public.is_workspace_member(workspace_id));

create policy "audit_runs: members can update"
on public.audit_runs for update
using (public.is_workspace_member(workspace_id));

create policy "attestations: members can view"
on public.attestations for select
using (public.is_workspace_member(workspace_id));

create policy "attestations: members can insert"
on public.attestations for insert
with check (public.is_workspace_member(workspace_id));

create policy "attestations: members can update"
on public.attestations for update
using (public.is_workspace_member(workspace_id));

create policy "evidence_items: members can view"
on public.evidence_items for select
using (public.is_workspace_member(workspace_id));

create policy "evidence_items: members can insert"
on public.evidence_items for insert
with check (public.is_workspace_member(workspace_id));

create policy "audit_events: members can view"
on public.audit_events for select
using (public.is_workspace_member(workspace_id));

create policy "audit_events: members can insert"
on public.audit_events for insert
with check (public.is_workspace_member(workspace_id));
