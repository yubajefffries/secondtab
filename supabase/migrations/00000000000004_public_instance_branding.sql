-- Keep private settings restricted to admins, including direct table requests.
drop policy "settings: read" on public.instance_settings;
create policy "settings: admin read" on public.instance_settings
  for select using (public.is_admin());

-- Explicit projection: never expose tax_settings or qbo_item_mappings.
create function public.public_instance_branding()
returns table (
  business_name text,
  logo_url text,
  brand_primary text,
  brand_accent text,
  object_labels jsonb,
  enabled_modules jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select s.business_name, s.logo_url, s.brand_primary, s.brand_accent,
         s.object_labels, s.enabled_modules
  from public.instance_settings as s
  where s.id = 1;
$$;

revoke execute on function public.public_instance_branding() from public;
grant execute on function public.public_instance_branding() to anon, authenticated;

-- Remove implicit PUBLIC execution from existing application functions.
-- Policy helpers still need execution for roles evaluating RLS policies.
revoke execute on function public.auth_role(), public.is_admin(),
  public.is_active_user() from public;
grant execute on function public.auth_role(), public.is_admin(),
  public.is_active_user() to anon, authenticated, service_role;

revoke execute on function public.set_updated_at(), public.handle_new_user(),
  public.audit_log_block_mutation(), public.set_created_by(),
  public.set_activity_actor() from public, anon, authenticated;
revoke execute on function public.log_audit(text, text, text, jsonb) from public, anon;
