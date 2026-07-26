-- Além da Sessão — anonymous, moderated load-structures community
-- Apply only to the dedicated public Supabase project.

begin;

create table experience_public.load_structures_posts (
  id uuid primary key default gen_random_uuid(),
  locale text not null check (locale in ('pt-PT', 'pt-BR')),
  structural_payload jsonb not null,
  actor_hash text not null check (char_length(actor_hash) = 64),
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending', 'approved', 'rejected', 'hidden')),
  moderation_reason text,
  support_count integer not null default 0 check (support_count >= 0),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '180 days'),
  check (jsonb_typeof(structural_payload) = 'array'),
  check (jsonb_array_length(structural_payload) between 1 and 4),
  check (expires_at > created_at)
);

create index load_structures_public_wall_idx
  on experience_public.load_structures_posts(created_at desc)
  where moderation_status = 'approved';

create index load_structures_actor_rate_idx
  on experience_public.load_structures_posts(actor_hash, created_at desc);

create or replace function experience_public.enforce_load_structure_rate_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(new.actor_hash, 0)
  );

  if (
    select count(*)
    from experience_public.load_structures_posts
    where actor_hash = new.actor_hash
      and created_at >= now() - interval '24 hours'
  ) >= 3 then
    raise exception 'anonymous publication rate limit reached';
  end if;

  return new;
end;
$$;

create trigger enforce_load_structure_rate_limit
before insert on experience_public.load_structures_posts
for each row execute function experience_public.enforce_load_structure_rate_limit();

revoke all on function experience_public.enforce_load_structure_rate_limit()
from public, anon, authenticated;

create table experience_public.load_structure_supports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null
    references experience_public.load_structures_posts(id) on delete cascade,
  supporter_hash text not null check (char_length(supporter_hash) = 64),
  created_at timestamptz not null default now(),
  unique (post_id, supporter_hash)
);

create index load_structure_supports_rate_idx
  on experience_public.load_structure_supports(supporter_hash, created_at desc);

alter table experience_public.load_structures_posts enable row level security;
alter table experience_public.load_structures_posts force row level security;
alter table experience_public.load_structure_supports enable row level security;
alter table experience_public.load_structure_supports force row level security;

grant usage on schema experience_public to service_role;

revoke all on experience_public.load_structures_posts,
  experience_public.load_structure_supports
from public, anon, authenticated;

-- Only the server-side service role reaches these tables. The public wall is
-- projected through a Route Handler that strips actor and moderation fields.
grant select, insert, update, delete
on experience_public.load_structures_posts,
  experience_public.load_structure_supports
to service_role;

create or replace function experience_public.support_load_structure(
  target_post_id uuid,
  anonymous_supporter_hash text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  updated_count integer;
begin
  if char_length(anonymous_supporter_hash) <> 64 then
    raise exception 'invalid supporter hash';
  end if;

  if not exists (
    select 1
    from experience_public.load_structures_posts
    where id = target_post_id
      and moderation_status = 'approved'
      and actor_hash <> anonymous_supporter_hash
  ) then
    raise exception 'structure is unavailable';
  end if;

  insert into experience_public.load_structure_supports(post_id, supporter_hash)
  values (target_post_id, anonymous_supporter_hash)
  on conflict (post_id, supporter_hash) do nothing;

  if not found then
    select support_count into updated_count
    from experience_public.load_structures_posts
    where id = target_post_id and moderation_status = 'approved';
    return jsonb_build_object(
      'supportCount', updated_count,
      'alreadySupported', true
    );
  end if;

  update experience_public.load_structures_posts
  set support_count = support_count + 1
  where id = target_post_id and moderation_status = 'approved'
  returning support_count into updated_count;

  return jsonb_build_object(
    'supportCount', updated_count,
    'alreadySupported', false
  );
end;
$$;

revoke all on function experience_public.support_load_structure(uuid, text)
from public, anon, authenticated;
grant execute on function experience_public.support_load_structure(uuid, text)
to service_role;

comment on table experience_public.load_structures_posts is
  'Moderated anonymous artefacts. No session notes, support requests, identity, raw IP or clinical record IDs.';

commit;
