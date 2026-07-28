-- Tighten client access so an active organization membership is not, by
-- itself, a clinical relationship. This migration is safe to apply after the
-- two foundation migrations and preserves the function signature used by RLS.

begin;

create or replace function care.can_access_client(
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
        (
          client.auth_user_id = actor_id
          and requested_permission = any (
            array['client.read', 'client.write', 'client.schedule']::text[]
          )
        )
        or exists (
          select 1
          from identity.organization_memberships membership
          where membership.user_id = actor_id
            and membership.organization_id = client.organization_id
            and membership.status = 'active'
            and (
              (
                membership.role = 'organization_owner'
                and requested_permission = any (
                  array[
                    'client.read',
                    'client.write',
                    'client.schedule',
                    'clinical_note.read',
                    'clinical_note.write',
                    'shared_snapshot.read'
                  ]::text[]
                )
              )
              or (
                membership.role = 'assistant'
                and requested_permission = any (
                  array['client.read', 'client.write', 'client.schedule']::text[]
                )
              )
              or (
                membership.role in ('clinician', 'clinical_supervisor')
                and requested_permission = any (
                  array[
                    'client.read',
                    'client.write',
                    'client.schedule',
                    'clinical_note.read',
                    'clinical_note.write',
                    'shared_snapshot.read'
                  ]::text[]
                )
                and exists (
                  select 1
                  from care.care_relationships relationship
                  where relationship.client_record_id = client.id
                    and relationship.professional_user_id = actor_id
                    and relationship.status = 'active'
                    and (
                      membership.role = 'clinician'
                      or relationship.relationship_type in (
                        'delegated',
                        'supervision'
                      )
                    )
                )
              )
            )
        )
      )
  );
$$;

revoke execute on function care.can_access_client(uuid, uuid, text) from public;
grant execute on function care.can_access_client(uuid, uuid, text)
to authenticated;

commit;
