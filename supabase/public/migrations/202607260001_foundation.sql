-- Além da Sessão — public data plane foundation
-- Apply only to the dedicated public Supabase project.

begin;

create extension if not exists pgcrypto;

create schema if not exists directory;
create schema if not exists content;
create schema if not exists intake;
create schema if not exists experience_public;

revoke all on schema directory, content, intake, experience_public
from public, anon, authenticated;

grant usage on schema directory, content, intake to anon, authenticated;

create table directory.professional_profiles (
  id uuid primary key default gen_random_uuid(),
  professional_key uuid not null unique,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  country_code text not null check (country_code in ('PT', 'BR')),
  display_name text not null check (char_length(display_name) between 2 and 120),
  profession text not null check (profession in ('psychologist', 'psychiatrist')),
  credential_authority text not null,
  credential_region text,
  credential_public_label text not null,
  verification_status text not null default 'draft' check (
    verification_status in (
      'draft',
      'submitted',
      'under_review',
      'verified',
      'renewal_due',
      'suspended',
      'rejected'
    )
  ),
  modalities text[] not null default '{}',
  languages text[] not null default '{}',
  locale text not null check (locale in ('pt-PT', 'pt-BR')),
  public_bio text,
  is_published boolean not null default false,
  verified_at timestamptz,
  updated_at timestamptz not null default now(),
  check (not is_published or verification_status in ('verified', 'renewal_due'))
);

create index professional_profiles_discovery_idx
  on directory.professional_profiles(
    country_code,
    locale,
    verification_status,
    updated_at desc
  )
  where is_published;

create table content.experience_pages (
  id uuid primary key default gen_random_uuid(),
  tool_key text not null,
  semantic_version text not null,
  locale text not null check (locale in ('pt-PT', 'pt-BR')),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  summary text not null,
  body jsonb not null,
  review_status text not null default 'draft'
    check (review_status in ('draft', 'clinical-review', 'approved', 'retired')),
  canonical_owner text not null default 'platform'
    check (canonical_owner in ('legacy', 'platform')),
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (tool_key, semantic_version, locale)
);

create table content.editorial_pages (
  id uuid primary key default gen_random_uuid(),
  content_key text not null,
  locale text not null check (locale in ('pt-PT', 'pt-BR')),
  slug text not null,
  title text not null,
  excerpt text not null,
  body jsonb not null,
  canonical_owner text not null check (canonical_owner in ('legacy', 'platform')),
  previous_url text,
  status text not null default 'draft'
    check (status in ('draft', 'review', 'published', 'retired')),
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (content_key, locale),
  unique (locale, slug)
);

create table intake.consultation_requests (
  id uuid primary key default gen_random_uuid(),
  professional_profile_id uuid not null
    references directory.professional_profiles(id) on delete restrict,
  locale text not null check (locale in ('pt-PT', 'pt-BR')),
  contact_email_ciphertext text not null,
  availability text not null check (char_length(availability) between 3 and 280),
  optional_message_ciphertext text,
  status text not null default 'received'
    check (status in ('received', 'accepted', 'declined', 'expired')),
  idempotency_key uuid not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (expires_at > created_at)
);

alter table directory.professional_profiles enable row level security;
alter table content.experience_pages enable row level security;
alter table content.editorial_pages enable row level security;
alter table intake.consultation_requests enable row level security;

alter table directory.professional_profiles force row level security;
alter table content.experience_pages force row level security;
alter table content.editorial_pages force row level security;
alter table intake.consultation_requests force row level security;

create policy verified_professional_profiles_public_read
on directory.professional_profiles
for select
to anon, authenticated
using (
  is_published
  and verification_status in ('verified', 'renewal_due')
);

create policy approved_experience_pages_public_read
on content.experience_pages
for select
to anon, authenticated
using (review_status = 'approved' and published_at is not null);

create policy published_editorial_pages_public_read
on content.editorial_pages
for select
to anon, authenticated
using (status = 'published' and published_at is not null);

-- Intake writes must pass through a server route that encrypts content, applies
-- rate limits and inserts with a dedicated role. No anonymous direct insert.

grant select on directory.professional_profiles,
  content.experience_pages,
  content.editorial_pages
to anon, authenticated;

comment on table intake.consultation_requests is
  'Minimized initial contact. No diagnosis is requested and no browser role can read rows.';

commit;
