-- Run with a disposable local database after applying clinical migrations.
-- These smoke assertions document the negative cases the full pgTAP suite must
-- cover before any real data is admitted.

begin;

do $$
begin
  if not exists (
    select 1
    from pg_class table_meta
    join pg_namespace schema_meta on schema_meta.oid = table_meta.relnamespace
    where schema_meta.nspname = 'care'
      and table_meta.relname = 'client_records'
      and table_meta.relrowsecurity
      and table_meta.relforcerowsecurity
  ) then
    raise exception 'care.client_records must enable and force RLS';
  end if;

  if has_table_privilege('anon', 'care.clinical_notes', 'select') then
    raise exception 'anon must not select care.clinical_notes';
  end if;

  if has_table_privilege('authenticated', 'audit.events', 'select') then
    raise exception 'authenticated must not read audit.events directly';
  end if;

  if has_table_privilege('authenticated', 'jobs.outbox_events', 'select') then
    raise exception 'authenticated must not read jobs.outbox_events directly';
  end if;

  if not exists (
    select 1
    from pg_proc procedure_meta
    join pg_namespace schema_meta
      on schema_meta.oid = procedure_meta.pronamespace
    where schema_meta.nspname = 'care'
      and procedure_meta.proname = 'can_access_client'
      and procedure_meta.prosecdef
  ) then
    raise exception 'care.can_access_client must remain security definer';
  end if;
end
$$;

rollback;
