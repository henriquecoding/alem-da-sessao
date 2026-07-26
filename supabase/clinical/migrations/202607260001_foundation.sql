-- Além da Sessão — clinical data plane foundation
-- This migration is designed for a dedicated Supabase project. It must never
-- be applied to the Lost Letters Room database.

begin;

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create schema if not exists identity;
create schema if not exists care;
create schema if not exists tools;
create schema if not exists compliance;
create schema if not exists audit;
create schema if not exists jobs;

revoke all on schema identity, care, tools, compliance, audit, jobs
from public, anon, authenticated;

grant usage on schema identity, care, tools, compliance to authenticated;

create type identity.organization_role as enum (
  'organization_owner',
  'clinician',
  'clinical_supervisor',
  'assistant',
  'billing_manager'
);

create type care.appointment_status as enum (
  'requested',
  'held',
  'confirmed',
  'completed',
  'cancelled_by_client',
  'cancelled_by_professional',
  'no_show'
);

create type care.note_status as enum ('draft', 'signed', 'amended');
create type tools.assignment_status as enum (
  'assigned',
  'opened',
  'draft',
  'saved',
  'shared',
  'reviewed',
  'discarded',
  'expired'
);

create table identity.person_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 120),
  locale text not null check (locale in ('pt-PT', 'pt-BR')),
  timezone text not null default 'Europe/Lisbon',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table identity.organizations (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null check (char_length(legal_name) between 2 and 180),
  display_name text not null check (char_length(display_name) between 2 and 120),
  country_code text not null check (country_code in ('PT', 'BR')),
  timezone text not null,
  status text not null default 'active'
    check (status in ('active', 'suspended', 'closed')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version > 0)
);

create table identity.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references identity.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role identity.organization_role not null,
  status text not null default 'active'
    check (status in ('invited', 'active', 'suspended', 'revoked')),
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index organization_memberships_user_idx
  on identity.organization_memberships(user_id, status);

create function identity.is_active_member(
  actor_id uuid,
  target_organization_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from identity.organization_memberships membership
    where membership.user_id = actor_id
      and membership.organization_id = target_organization_id
      and membership.status = 'active'
  );
$$;

create function identity.has_organization_role(
  actor_id uuid,
  target_organization_id uuid,
  allowed_roles identity.organization_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from identity.organization_memberships membership
    where membership.user_id = actor_id
      and membership.organization_id = target_organization_id
      and membership.status = 'active'
      and membership.role = any(allowed_roles)
  );
$$;

revoke execute on function identity.is_active_member(uuid, uuid) from public;
revoke execute on function identity.has_organization_role(
  uuid,
  uuid,
  identity.organization_role[]
) from public;
grant execute on function identity.is_active_member(uuid, uuid) to authenticated;
grant execute on function identity.has_organization_role(
  uuid,
  uuid,
  identity.organization_role[]
) to authenticated;

create table care.client_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references identity.organizations(id) on delete restrict,
  auth_user_id uuid references auth.users(id) on delete set null,
  display_name text not null check (char_length(display_name) between 1 and 120),
  contact_email_ciphertext text,
  country_code text not null check (country_code in ('PT', 'BR')),
  adult_confirmed boolean not null default false,
  status text not null default 'active'
    check (status in ('invited', 'active', 'paused', 'discharged')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version > 0)
);

create index client_records_org_status_idx
  on care.client_records(organization_id, status, created_at desc);
create index client_records_auth_user_idx
  on care.client_records(auth_user_id)
  where auth_user_id is not null;

create table care.care_relationships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references identity.organizations(id) on delete restrict,
  client_record_id uuid not null
    references care.client_records(id) on delete restrict,
  professional_user_id uuid not null references auth.users(id) on delete restrict,
  relationship_type text not null default 'primary'
    check (relationship_type in ('primary', 'delegated', 'supervision')),
  status text not null default 'active'
    check (status in ('pending', 'active', 'paused', 'ended')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);

create unique index care_relationship_active_unique_idx
  on care.care_relationships(
    organization_id,
    client_record_id,
    professional_user_id,
    relationship_type
  )
  where status in ('pending', 'active', 'paused');

create function care.can_access_client(
  actor_id uuid,
  target_client_id uuid,
  requested_permission text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from care.client_records client
    where client.id = target_client_id
      and (
        client.auth_user_id = actor_id
        or (
          identity.is_active_member(actor_id, client.organization_id)
          and (
            requested_permission in ('client.read', 'client.schedule')
            or exists (
              select 1
              from care.care_relationships relationship
              where relationship.client_record_id = client.id
                and relationship.professional_user_id = actor_id
                and relationship.status = 'active'
            )
          )
        )
      )
  );
$$;

revoke execute on function care.can_access_client(uuid, uuid, text) from public;
grant execute on function care.can_access_client(uuid, uuid, text)
to authenticated;

create table care.appointments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references identity.organizations(id) on delete restrict,
  client_record_id uuid not null
    references care.client_records(id) on delete restrict,
  professional_user_id uuid not null references auth.users(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  slot tstzrange generated always as (
    tstzrange(starts_at, ends_at, '[)')
  ) stored,
  status care.appointment_status not null default 'requested',
  modality text not null check (modality in ('presential', 'online')),
  private_location_ciphertext text,
  external_meeting_url_ciphertext text,
  idempotency_key uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version > 0),
  check (ends_at > starts_at),
  unique (organization_id, idempotency_key),
  exclude using gist (
    professional_user_id with =,
    slot with &&
  ) where (status in ('held', 'confirmed'))
);

create index appointments_org_starts_idx
  on care.appointments(organization_id, starts_at, id);
create index appointments_client_starts_idx
  on care.appointments(client_record_id, starts_at desc);

create table care.clinical_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references identity.organizations(id) on delete restrict,
  client_record_id uuid not null
    references care.client_records(id) on delete restrict,
  author_user_id uuid not null references auth.users(id) on delete restrict,
  appointment_id uuid references care.appointments(id) on delete set null,
  status care.note_status not null default 'draft',
  body_ciphertext text not null,
  encryption_key_version integer not null check (encryption_key_version > 0),
  signed_at timestamptz,
  signed_by uuid references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version > 0),
  check (
    (status = 'draft' and signed_at is null and signed_by is null)
    or (status in ('signed', 'amended') and signed_at is not null and signed_by is not null)
  )
);

create table care.clinical_note_amendments (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references care.clinical_notes(id) on delete restrict,
  author_user_id uuid not null references auth.users(id) on delete restrict,
  reason text not null check (char_length(reason) between 5 and 500),
  body_ciphertext text not null,
  encryption_key_version integer not null check (encryption_key_version > 0),
  created_at timestamptz not null default now()
);

create table tools.catalog_versions (
  id uuid primary key default gen_random_uuid(),
  tool_key text not null,
  semantic_version text not null,
  status text not null check (
    status in ('draft', 'clinical-review', 'published', 'retired')
  ),
  manifest_checksum text not null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (tool_key, semantic_version)
);

create table tools.assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references identity.organizations(id) on delete restrict,
  client_record_id uuid not null
    references care.client_records(id) on delete restrict,
  professional_user_id uuid not null references auth.users(id) on delete restrict,
  tool_version_id uuid not null references tools.catalog_versions(id) on delete restrict,
  status tools.assignment_status not null default 'assigned',
  professional_context_ciphertext text,
  due_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index assignments_client_status_idx
  on tools.assignments(client_record_id, status, created_at desc);

create table tools.runs (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references tools.assignments(id) on delete restrict,
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  run_version integer not null default 1 check (run_version > 0),
  state_ciphertext text not null,
  encryption_key_version integer not null check (encryption_key_version > 0),
  status text not null check (status in ('saved', 'completed', 'discarded')),
  saved_at timestamptz not null default now(),
  discarded_at timestamptz,
  unique (assignment_id, run_version)
);

create table tools.snapshots (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references tools.assignments(id) on delete restrict,
  source_run_id uuid not null references tools.runs(id) on delete restrict,
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  recipient_user_id uuid not null references auth.users(id) on delete restrict,
  content_ciphertext text not null,
  encryption_key_version integer not null check (encryption_key_version > 0),
  idempotency_key uuid not null unique,
  shared_at timestamptz not null default now(),
  reviewed_at timestamptz,
  revoked_at timestamptz
);

create table compliance.consents (
  id uuid primary key default gen_random_uuid(),
  subject_user_id uuid not null references auth.users(id) on delete restrict,
  organization_id uuid references identity.organizations(id) on delete restrict,
  purpose text not null,
  policy_version text not null,
  locale text not null check (locale in ('pt-PT', 'pt-BR')),
  granted_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  evidence jsonb not null default '{}'::jsonb,
  check (withdrawn_at is null or withdrawn_at >= granted_at)
);

create table audit.events (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  actor_user_id uuid,
  organization_id uuid,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  outcome text not null check (outcome in ('allowed', 'denied', 'failed')),
  request_id uuid not null,
  metadata jsonb not null default '{}'::jsonb
);

create index audit_events_org_time_idx
  on audit.events(organization_id, occurred_at desc, id desc);

create function audit.reject_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception 'audit events are append-only';
end;
$$;

create trigger audit_events_no_update
before update or delete on audit.events
for each row execute function audit.reject_mutation();

create table jobs.outbox_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  event_type text not null,
  aggregate_type text not null,
  aggregate_id uuid not null,
  payload jsonb not null,
  status text not null default 'pending'
    check (status in ('pending', 'leased', 'completed', 'dead')),
  available_at timestamptz not null default now(),
  lease_expires_at timestamptz,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  dedupe_key text not null unique,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index outbox_claim_idx
  on jobs.outbox_events(status, available_at, id)
  where status in ('pending', 'leased');

alter table identity.person_profiles enable row level security;
alter table identity.organizations enable row level security;
alter table identity.organization_memberships enable row level security;
alter table care.client_records enable row level security;
alter table care.care_relationships enable row level security;
alter table care.appointments enable row level security;
alter table care.clinical_notes enable row level security;
alter table care.clinical_note_amendments enable row level security;
alter table tools.catalog_versions enable row level security;
alter table tools.assignments enable row level security;
alter table tools.runs enable row level security;
alter table tools.snapshots enable row level security;
alter table compliance.consents enable row level security;

alter table identity.person_profiles force row level security;
alter table identity.organizations force row level security;
alter table identity.organization_memberships force row level security;
alter table care.client_records force row level security;
alter table care.care_relationships force row level security;
alter table care.appointments force row level security;
alter table care.clinical_notes force row level security;
alter table care.clinical_note_amendments force row level security;
alter table tools.catalog_versions force row level security;
alter table tools.assignments force row level security;
alter table tools.runs force row level security;
alter table tools.snapshots force row level security;
alter table compliance.consents force row level security;

create policy person_profile_self
on identity.person_profiles
for all
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy organizations_for_members
on identity.organizations
for select
to authenticated
using (identity.is_active_member((select auth.uid()), id));

create policy memberships_self_or_owner
on identity.organization_memberships
for select
to authenticated
using (
  user_id = (select auth.uid())
  or identity.has_organization_role(
    (select auth.uid()),
    organization_id,
    array['organization_owner']::identity.organization_role[]
  )
);

create policy client_records_authorized_select
on care.client_records
for select
to authenticated
using (
  auth_user_id = (select auth.uid())
  or care.can_access_client((select auth.uid()), id, 'client.read')
);

create policy relationships_authorized_select
on care.care_relationships
for select
to authenticated
using (
  professional_user_id = (select auth.uid())
  or care.can_access_client((select auth.uid()), client_record_id, 'client.read')
);

create policy appointments_authorized_select
on care.appointments
for select
to authenticated
using (
  professional_user_id = (select auth.uid())
  or care.can_access_client((select auth.uid()), client_record_id, 'client.schedule')
);

create policy notes_related_clinician_select
on care.clinical_notes
for select
to authenticated
using (
  author_user_id = (select auth.uid())
  or (
    identity.has_organization_role(
      (select auth.uid()),
      organization_id,
      array[
        'organization_owner',
        'clinician',
        'clinical_supervisor'
      ]::identity.organization_role[]
    )
    and care.can_access_client(
      (select auth.uid()),
      client_record_id,
      'clinical_note.read'
    )
  )
);

create policy note_amendments_through_note
on care.clinical_note_amendments
for select
to authenticated
using (
  exists (
    select 1
    from care.clinical_notes note
    where note.id = clinical_note_amendments.note_id
  )
);

create policy tool_catalog_authenticated_read
on tools.catalog_versions
for select
to authenticated
using (status in ('clinical-review', 'published', 'retired'));

create policy assignments_participants_select
on tools.assignments
for select
to authenticated
using (
  professional_user_id = (select auth.uid())
  or care.can_access_client((select auth.uid()), client_record_id, 'client.read')
);

create policy runs_owner_only
on tools.runs
for all
to authenticated
using (owner_user_id = (select auth.uid()))
with check (owner_user_id = (select auth.uid()));

create policy snapshots_owner_or_active_recipient
on tools.snapshots
for select
to authenticated
using (
  owner_user_id = (select auth.uid())
  or (
    recipient_user_id = (select auth.uid())
    and revoked_at is null
  )
);

create policy consent_subject_select
on compliance.consents
for select
to authenticated
using (subject_user_id = (select auth.uid()));

grant select, insert, update on identity.person_profiles to authenticated;
grant select on identity.organizations, identity.organization_memberships
to authenticated;
grant select on care.client_records, care.care_relationships,
  care.appointments, care.clinical_notes, care.clinical_note_amendments
to authenticated;
grant select on tools.catalog_versions, tools.assignments to authenticated;
grant select, insert, update on tools.runs to authenticated;
grant select on tools.snapshots, compliance.consents to authenticated;

comment on schema care is
  'Sensitive clinical data plane. Access requires server authorization and RLS.';
comment on table tools.runs is
  'Encrypted saved tool state. Draft text must stay in memory until explicit save.';
comment on table tools.snapshots is
  'Immutable share projection; edits to a run never update an existing snapshot.';

commit;
