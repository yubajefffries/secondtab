-- SecondTab — Security hardening (audit findings 2026-08-10)
-- Closes the profiles self-insert privilege escalation, locks down audit
-- writes, pins attribution to the acting user, and tightens deactivated-user
-- and financial-mirror access. Expand-only; no data changes.

-- ============================================================
-- 1. profiles: self-insert must not choose its own role (C1)
-- ============================================================
drop policy "profiles: admin insert" on profiles;
create policy "profiles: admin insert" on profiles
  for insert with check (
    is_admin()
    or (id = auth.uid() and role = 'member')
  );

-- Profiles are normally created by trigger, not by the client. The first
-- account to sign up bootstraps as owner; everyone after is a member until
-- an admin promotes them.
create or replace function handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    case
      when not exists (select 1 from profiles) then 'owner'::app_role
      else 'member'::app_role
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- 2. log_audit: not callable anonymously (M2)
-- ============================================================
revoke execute on function log_audit(text, text, text, jsonb) from public, anon;
grant execute on function log_audit(text, text, text, jsonb) to authenticated, service_role;

-- ============================================================
-- 3. audit_log: append-only enforced, not just implied (L4)
-- ============================================================
revoke update, delete on audit_log from public, anon, authenticated;

create or replace function audit_log_block_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_log is append-only';
end;
$$;

create trigger audit_log_append_only
  before update or delete on audit_log
  for each row execute function audit_log_block_mutation();

-- ============================================================
-- 4. Attribution: created_by / actor_id always reflect the acting
--    user for client writes; service-role (system) writes pass through (M1)
-- ============================================================
create or replace function set_created_by()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null then
    new.created_by := auth.uid();
  end if;
  return new;
end;
$$;

do $$
declare t text;
begin
  for t in
    select table_name from information_schema.columns
    where table_schema = 'public' and column_name = 'created_by'
  loop
    execute format(
      'create trigger set_created_by before insert on %I for each row execute function set_created_by()', t
    );
  end loop;
end $$;

create or replace function set_activity_actor()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null then
    new.actor_id := auth.uid();
  end if;
  return new;
end;
$$;

create trigger set_activity_actor
  before insert on activities
  for each row execute function set_activity_actor();

-- ============================================================
-- 5. Timeline history is immutable for members (M1)
-- ============================================================
drop policy "activities: member update" on activities;

-- ============================================================
-- 6. Financial mirrors: members read and create; edits are admin-only
--    until per-permission financial access lands in Phase 2 (M1/M4)
-- ============================================================
drop policy "estimates: member update" on estimates;
create policy "estimates: admin update" on estimates
  for update using (is_admin()) with check (is_admin());
drop policy "invoices: member update" on invoices;
create policy "invoices: admin update" on invoices
  for update using (is_admin()) with check (is_admin());

-- ============================================================
-- 7. Deactivated users lose saved-view writes and notification access (L2)
-- ============================================================
drop policy "views: own write" on saved_views;
create policy "views: own write" on saved_views
  for all
  using (is_active_user() and owner_id = auth.uid())
  with check (is_active_user() and owner_id = auth.uid());

drop policy "notifications: own read" on notifications;
create policy "notifications: own read" on notifications
  for select using (is_active_user() and user_id = auth.uid());
drop policy "notifications: own update" on notifications;
create policy "notifications: own update" on notifications
  for update
  using (is_active_user() and user_id = auth.uid())
  with check (is_active_user() and user_id = auth.uid());
