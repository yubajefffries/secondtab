-- Northstar CRM — core schema (Phase 1)
-- All schema changes live in versioned migrations; no dashboard edits. (PRD §3)
-- Every table gets deny-by-default RLS in 00000000000002_rls_policies.sql. (PRD §7)

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists pgcrypto;

-- ============================================================
-- Enums
-- ============================================================
create type app_role as enum ('owner', 'admin', 'member');

create type deal_status as enum ('open', 'won', 'lost');

create type lead_status as enum ('new', 'working', 'qualified', 'converted', 'disqualified');

create type task_status as enum ('open', 'in_progress', 'completed', 'canceled');

create type task_priority as enum ('low', 'medium', 'high', 'urgent');

create type activity_type as enum (
  'note', 'email', 'call', 'sms', 'meeting', 'stage_change', 'task', 'file',
  'estimate', 'invoice', 'payment', 'system', 'ai_suggestion'
);

create type entity_type as enum (
  'company', 'person', 'deal', 'lead', 'task', 'note', 'estimate', 'invoice'
);

create type notification_kind as enum (
  'task_due', 'record_assigned', 'payment_received', 'workflow_fired',
  'ai_approval_pending', 'mention', 'system'
);

create type job_status as enum ('queued', 'running', 'succeeded', 'failed', 'dead');

create type sync_state as enum ('pending', 'synced', 'error', 'conflict');

-- ============================================================
-- Identity & authorization
-- ============================================================

-- Profile row per auth.users entry. Role lives here and is enforced in RLS.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role app_role not null default 'member',
  timezone text not null default 'UTC',
  theme jsonb not null default '{}'::jsonb,          -- per-user theme choice (PRD §18.5)
  deactivated_at timestamptz,                        -- deactivation preserves history (PRD §19)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helper: current user's role (used inside policies; security definer so it
-- can read profiles regardless of the caller's own row grants).
create or replace function auth_role()
returns app_role
language sql stable security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce((select role in ('owner','admin') from profiles where id = auth.uid()), false)
$$;

create or replace function is_active_user()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce((select deactivated_at is null from profiles where id = auth.uid()), false)
$$;

-- ============================================================
-- Instance settings (single row; PRD §5)
-- ============================================================
create table instance_settings (
  id int primary key default 1 check (id = 1),
  business_name text not null default 'Northstar CRM',
  logo_url text,
  brand_primary text not null default '#2563eb',
  brand_accent text not null default '#7c3aed',
  object_labels jsonb not null default '{}'::jsonb,  -- e.g. {"deal": "Wrap Job"}
  default_currency text not null default 'USD',
  tax_settings jsonb not null default '{}'::jsonb,
  qbo_item_mappings jsonb not null default '{}'::jsonb,
  enabled_modules jsonb not null default '{"email": false, "quickbooks": false, "calendar": false, "ai": false}'::jsonb,
  updated_by uuid references profiles (id),
  updated_at timestamptz not null default now()
);

insert into instance_settings (id) values (1);

-- ============================================================
-- Core CRM objects
-- ============================================================

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text,
  industry text,
  phone text,
  website text,
  address jsonb,
  description text,
  owner_id uuid references profiles (id),
  qbo_customer_id text,
  qbo_sync_token text,
  qbo_sync_state sync_state,
  custom jsonb not null default '{}'::jsonb,         -- custom field values (PRD §8)
  search tsvector generated always as (
    to_tsvector('english', coalesce(name,'') || ' ' || coalesce(domain,'') || ' ' || coalesce(industry,'') || ' ' || coalesce(description,''))
  ) stored,
  created_by uuid references profiles (id),
  updated_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz                              -- soft delete (PRD §5)
);
create index companies_search_idx on companies using gin (search);
create index companies_owner_idx on companies (owner_id) where deleted_at is null;

create table people (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text,
  email text,
  phone text,
  title text,
  avatar_url text,
  owner_id uuid references profiles (id),
  -- communication preferences (PRD §13)
  do_not_contact boolean not null default false,
  preferred_channel text,
  email_opt_out boolean not null default false,
  custom jsonb not null default '{}'::jsonb,
  search tsvector generated always as (
    to_tsvector('english', coalesce(first_name,'') || ' ' || coalesce(last_name,'') || ' ' || coalesce(email,'') || ' ' || coalesce(title,''))
  ) stored,
  created_by uuid references profiles (id),
  updated_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index people_search_idx on people using gin (search);
create index people_email_idx on people (lower(email)) where deleted_at is null;

-- One person can hold roles at multiple companies (PRD §5)
create table person_companies (
  person_id uuid not null references people (id) on delete cascade,
  company_id uuid not null references companies (id) on delete cascade,
  role_title text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (person_id, company_id)
);

create table pipelines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_default boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  pipeline_id uuid not null references pipelines (id) on delete cascade,
  name text not null,
  position int not null default 0,
  probability numeric(5,2) not null default 0 check (probability >= 0 and probability <= 100),
  color text not null default '#3b82f6',
  is_won boolean not null default false,
  is_lost boolean not null default false,
  required_fields jsonb not null default '[]'::jsonb, -- stage-entry rules (PRD §5)
  created_at timestamptz not null default now()
);
create index pipeline_stages_pipeline_idx on pipeline_stages (pipeline_id, position);

create table deals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pipeline_id uuid not null references pipelines (id),
  stage_id uuid not null references pipeline_stages (id),
  company_id uuid references companies (id),
  person_id uuid references people (id),
  owner_id uuid references profiles (id),
  status deal_status not null default 'open',
  close_date date,
  won_at timestamptz,
  lost_at timestamptz,
  lost_reason text,
  next_step text,
  next_step_due date,
  source text,
  priority task_priority,
  currency text not null default 'USD',
  -- amount is derived from line items but denormalized for list/report speed
  amount numeric(14,2) not null default 0,
  custom jsonb not null default '{}'::jsonb,
  search tsvector generated always as (
    to_tsvector('english', coalesce(name,'') || ' ' || coalesce(next_step,'') || ' ' || coalesce(source,''))
  ) stored,
  created_by uuid references profiles (id),
  updated_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index deals_stage_idx on deals (stage_id) where deleted_at is null;
create index deals_owner_idx on deals (owner_id) where deleted_at is null;
create index deals_search_idx on deals using gin (search);

-- Product/service catalog (PRD §13)
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text,
  description text,
  unit_price numeric(14,2) not null default 0,
  taxable boolean not null default true,
  active boolean not null default true,
  qbo_item_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Real line items make real QBO Estimates possible (PRD §5)
create table deal_line_items (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals (id) on delete cascade,
  product_id uuid references products (id),
  description text not null,
  quantity numeric(12,3) not null default 1,
  unit_price numeric(14,2) not null default 0,
  taxable boolean not null default true,
  position int not null default 0,
  qbo_line_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index deal_line_items_deal_idx on deal_line_items (deal_id);

create table leads (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  last_name text,
  email text,
  phone text,
  company_name text,
  message text,
  source text,                                        -- web form / api / manual
  status lead_status not null default 'new',
  owner_id uuid references profiles (id),
  converted_person_id uuid references people (id),
  converted_company_id uuid references companies (id),
  converted_deal_id uuid references deals (id),
  custom jsonb not null default '{}'::jsonb,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index leads_status_idx on leads (status) where deleted_at is null;

create table notes (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  entity_type entity_type not null,
  entity_id uuid not null,
  is_internal boolean not null default false,         -- internal-only notes (PRD §19)
  created_by uuid references profiles (id),
  updated_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index notes_entity_idx on notes (entity_type, entity_id) where deleted_at is null;

create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status task_status not null default 'open',
  priority task_priority not null default 'medium',
  assignee_id uuid references profiles (id),
  due_at timestamptz,
  reminder_at timestamptz,
  recurrence jsonb,                                   -- rrule-style payload
  completed_at timestamptz,
  completed_by uuid references profiles (id),
  created_by uuid references profiles (id),
  updated_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index tasks_assignee_idx on tasks (assignee_id, status) where deleted_at is null;
create index tasks_due_idx on tasks (due_at) where deleted_at is null;

-- Tasks link to one or more records (PRD §5)
create table task_links (
  task_id uuid not null references tasks (id) on delete cascade,
  entity_type entity_type not null,
  entity_id uuid not null,
  primary key (task_id, entity_type, entity_id)
);

-- Auto-logged timeline events (PRD §5). SMS is modeled from day one.
create table activities (
  id uuid primary key default gen_random_uuid(),
  type activity_type not null,
  title text not null,
  body text,
  entity_type entity_type not null,
  entity_id uuid not null,
  actor_id uuid references profiles (id),             -- null for system/integration events
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index activities_entity_idx on activities (entity_type, entity_id, occurred_at desc);

create table attachments (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  storage_path text not null,                         -- RLS on storage paths mirrors this
  entity_type entity_type not null,
  entity_id uuid not null,
  scan_status text not null default 'pending',        -- malware scan / quarantine (PRD §7)
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index attachments_entity_idx on attachments (entity_type, entity_id) where deleted_at is null;

-- ============================================================
-- Financial mirrors (QBO; PRD §12) — never purged by retention rules
-- ============================================================

create table estimates (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals (id),
  number text,
  status text not null default 'draft',               -- draft/sent/accepted/declined per QBO
  total numeric(14,2) not null default 0,
  currency text not null default 'USD',
  qbo_estimate_id text,
  qbo_sync_token text,
  qbo_sync_state sync_state not null default 'pending',
  sync_error text,
  version int not null default 1,                     -- versioned line items (PRD §12)
  line_items jsonb not null default '[]'::jsonb,      -- snapshot at generation time
  sent_at timestamptz,
  accepted_at timestamptz,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index estimates_deal_idx on estimates (deal_id);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals (id),
  estimate_id uuid references estimates (id),
  number text,
  status text not null default 'draft',               -- draft/sent/partial/paid/void
  total numeric(14,2) not null default 0,
  balance numeric(14,2) not null default 0,
  currency text not null default 'USD',
  due_date date,
  qbo_invoice_id text,
  qbo_sync_token text,
  qbo_sync_state sync_state not null default 'pending',
  sync_error text,
  line_items jsonb not null default '[]'::jsonb,
  sent_at timestamptz,
  paid_at timestamptz,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index invoices_deal_idx on invoices (deal_id);

-- ============================================================
-- Customization metadata (PRD §8 — custom fields v1)
-- ============================================================

create table custom_field_definitions (
  id uuid primary key default gen_random_uuid(),
  entity_type entity_type not null,
  key text not null,
  label text not null,
  field_type text not null,                           -- text|number|date|select|multiselect|checkbox|url|phone|currency
  options jsonb,                                      -- for select types
  required boolean not null default false,
  position int not null default 0,
  archived_at timestamptz,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  unique (entity_type, key)
);

-- ============================================================
-- Views, tags, dedupe
-- ============================================================

create table saved_views (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  entity_type entity_type not null,
  filters jsonb not null default '{}'::jsonb,
  columns jsonb not null default '[]'::jsonb,
  sort jsonb,
  is_shared boolean not null default false,
  is_favorite boolean not null default false,
  owner_id uuid not null references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null default '#64748b',
  created_at timestamptz not null default now()
);

create table taggables (
  tag_id uuid not null references tags (id) on delete cascade,
  entity_type entity_type not null,
  entity_id uuid not null,
  primary key (tag_id, entity_type, entity_id)
);

-- Duplicate review queue (PRD §13). Merge preserves both timelines.
create table duplicate_candidates (
  id uuid primary key default gen_random_uuid(),
  entity_type entity_type not null,
  entity_id_a uuid not null,
  entity_id_b uuid not null,
  match_score numeric(5,2) not null,
  match_reasons jsonb not null default '[]'::jsonb,
  status text not null default 'open',                -- open|merged|dismissed
  resolved_by uuid references profiles (id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Integrations, automation, notifications, audit, jobs
-- ============================================================

-- Encrypted OAuth tokens. Values live in Supabase Vault; this table stores
-- references + connection metadata only. Browser never reads decrypted values. (PRD §5, §11)
create table integration_credentials (
  id uuid primary key default gen_random_uuid(),
  provider text not null,                             -- quickbooks|gmail|microsoft|resend|ai
  connected_by uuid references profiles (id),
  scopes jsonb not null default '[]'::jsonb,
  vault_secret_id uuid,                               -- reference into vault.secrets
  external_account text,                              -- e.g. realm id / mailbox address
  status text not null default 'connected',           -- connected|expired|revoked|error
  expires_at timestamptz,
  last_refresh_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table workflow_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  enabled boolean not null default true,
  trigger jsonb not null,                             -- {type: 'stage_changed'|'no_activity'|'lead_created', ...}
  conditions jsonb not null default '[]'::jsonb,
  actions jsonb not null default '[]'::jsonb,         -- risk-tiered; external sends require approval (PRD §9)
  created_by uuid references profiles (id),
  updated_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  kind notification_kind not null,
  title text not null,
  body text,
  entity_type entity_type,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on notifications (user_id, created_at desc);

-- Append-only admin audit trail, separate from the customer-facing timeline (PRD §7)
create table audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,                                      -- null for system
  action text not null,                               -- role_change|invite|integration_connect|export|delete|restore|workflow_change|ai_write|...
  target_type text,
  target_id text,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Job metadata/health. Durable queueing itself uses pgmq (PRD §4);
-- this table is the operator-visible record of sync/queue health.
create table jobs (
  id uuid primary key default gen_random_uuid(),
  kind text not null,                                 -- qbo_sync|email_send|import|export|notification_fanout|...
  status job_status not null default 'queued',
  idempotency_key text unique,
  payload jsonb not null default '{}'::jsonb,
  attempts int not null default 0,
  max_attempts int not null default 5,
  last_error text,
  cursor jsonb,                                       -- sync cursor / delta token (PRD §4)
  scheduled_for timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);
create index jobs_status_idx on jobs (status, scheduled_for);

-- ============================================================
-- updated_at maintenance
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','companies','people','deals','deal_line_items','products','leads',
    'notes','tasks','estimates','invoices','saved_views','integration_credentials',
    'workflow_rules','instance_settings'
  ] loop
    execute format('create trigger %I_updated_at before update on %I for each row execute function set_updated_at()', t, t);
  end loop;
end $$;

-- ============================================================
-- Seed: default pipeline matching the reference design
-- ============================================================
insert into pipelines (id, name, is_default, position)
values ('00000000-0000-0000-0000-000000000001', 'Sales Pipeline', true, 0);

insert into pipeline_stages (pipeline_id, name, position, probability, color, is_won, is_lost) values
('00000000-0000-0000-0000-000000000001', 'New Lead',    0, 10,  '#3b82f6', false, false),
('00000000-0000-0000-0000-000000000001', 'Qualified',   1, 30,  '#06b6d4', false, false),
('00000000-0000-0000-0000-000000000001', 'Proposal',    2, 55,  '#8b5cf6', false, false),
('00000000-0000-0000-0000-000000000001', 'Negotiation', 3, 75,  '#f59e0b', false, false),
('00000000-0000-0000-0000-000000000001', 'Won',         4, 100, '#22c55e', true,  false),
('00000000-0000-0000-0000-000000000001', 'Lost',        5, 0,   '#64748b', false, true);
