-- Northstar CRM — Row Level Security (PRD §7)
-- Deny-by-default on every table; no table ships without a policy.
-- Role checks live INSIDE policies, not just application code.

-- ============================================================
-- Enable RLS everywhere
-- ============================================================
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','instance_settings','companies','people','person_companies',
    'pipelines','pipeline_stages','deals','products','deal_line_items','leads',
    'notes','tasks','task_links','activities','attachments','estimates','invoices',
    'custom_field_definitions','saved_views','tags','taggables','duplicate_candidates',
    'integration_credentials','workflow_rules','notifications','audit_log','jobs'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('alter table %I force row level security', t);
  end loop;
end $$;

-- ============================================================
-- profiles
-- ============================================================
create policy "profiles: members read all" on profiles
  for select using (is_active_user());
create policy "profiles: self update" on profiles
  for update using (id = auth.uid())
  with check (
    id = auth.uid()
    -- role escalation is admin-only; a self-update must not change role
    and role = (select p.role from profiles p where p.id = auth.uid())
  );
create policy "profiles: admin update" on profiles
  for update using (is_admin()) with check (is_admin());
create policy "profiles: admin insert" on profiles
  for insert with check (is_admin() or id = auth.uid());

-- ============================================================
-- instance_settings — read all, write admin
-- ============================================================
create policy "settings: read" on instance_settings for select using (is_active_user());
create policy "settings: admin write" on instance_settings
  for update using (is_admin()) with check (is_admin());

-- ============================================================
-- Shared CRM objects — active members read/write, soft-delete aware.
-- Hard delete is admin-only; app uses deleted_at.
-- ============================================================
do $$
declare t text;
begin
  foreach t in array array[
    'companies','people','person_companies','deals','deal_line_items','leads',
    'notes','tasks','task_links','activities','attachments','tags','taggables',
    'duplicate_candidates','products','estimates','invoices'
  ] loop
    execute format('create policy "%1$s: member select" on %1$I for select using (is_active_user())', t);
    execute format('create policy "%1$s: member insert" on %1$I for insert with check (is_active_user())', t);
    execute format('create policy "%1$s: member update" on %1$I for update using (is_active_user()) with check (is_active_user())', t);
    execute format('create policy "%1$s: admin delete" on %1$I for delete using (is_admin())', t);
  end loop;
end $$;

-- Internal-only notes: hide from non-admins unless author (PRD §19)
drop policy "notes: member select" on notes;
create policy "notes: member select" on notes
  for select using (
    is_active_user() and (not is_internal or is_admin() or created_by = auth.uid())
  );

-- ============================================================
-- Pipelines & stages — read members, write admin (structure changes)
-- ============================================================
create policy "pipelines: read" on pipelines for select using (is_active_user());
create policy "pipelines: admin write" on pipelines
  for all using (is_admin()) with check (is_admin());
create policy "stages: read" on pipeline_stages for select using (is_active_user());
create policy "stages: admin write" on pipeline_stages
  for all using (is_admin()) with check (is_admin());

-- ============================================================
-- Custom field definitions — read members, write admin
-- ============================================================
create policy "cfd: read" on custom_field_definitions for select using (is_active_user());
create policy "cfd: admin write" on custom_field_definitions
  for all using (is_admin()) with check (is_admin());

-- ============================================================
-- Saved views — own + shared
-- ============================================================
create policy "views: read own or shared" on saved_views
  for select using (is_active_user() and (owner_id = auth.uid() or is_shared));
create policy "views: own write" on saved_views
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ============================================================
-- integration_credentials — ADMIN ONLY, metadata only.
-- A member-level user must be unable to read this table even with
-- direct PostgREST calls (PRD §7). Decrypted values never leave Vault.
-- ============================================================
create policy "credentials: admin read" on integration_credentials
  for select using (is_admin());
create policy "credentials: admin write" on integration_credentials
  for all using (is_admin()) with check (is_admin());

-- ============================================================
-- workflow_rules — read members, write admin
-- ============================================================
create policy "workflows: read" on workflow_rules for select using (is_active_user());
create policy "workflows: admin write" on workflow_rules
  for all using (is_admin()) with check (is_admin());

-- ============================================================
-- notifications — own rows only
-- ============================================================
create policy "notifications: own read" on notifications
  for select using (user_id = auth.uid());
create policy "notifications: own update" on notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- audit_log — append-only; owner/admin read; nobody updates/deletes.
-- Inserts happen via security-definer functions or service role only.
-- ============================================================
create policy "audit: admin read" on audit_log for select using (is_admin());
-- no insert/update/delete policies: only service role / definer functions write

-- ============================================================
-- jobs — admin visibility (sync health panel); service role writes
-- ============================================================
create policy "jobs: admin read" on jobs for select using (is_admin());

-- ============================================================
-- Audit helper — security definer append (used by server actions)
-- ============================================================
create or replace function log_audit(p_action text, p_target_type text, p_target_id text, p_detail jsonb default '{}'::jsonb)
returns void
language sql security definer
set search_path = public
as $$
  insert into audit_log (actor_id, action, target_type, target_id, detail)
  values (auth.uid(), p_action, p_target_type, p_target_id, p_detail)
$$;
