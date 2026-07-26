begin;

do $$
begin
  if has_table_privilege('anon', 'intake.consultation_requests', 'select') then
    raise exception 'anon must never read consultation requests';
  end if;

  if has_table_privilege('anon', 'intake.consultation_requests', 'insert') then
    raise exception 'anonymous intake must pass through the protected server route';
  end if;
end
$$;

do $$
begin
  if has_table_privilege('anon', 'experience_public.load_structures_posts', 'select')
    or has_table_privilege('anon', 'experience_public.load_structures_posts', 'insert') then
    raise exception 'anonymous community access must pass through the protected server route';
  end if;

  if has_table_privilege('anon', 'experience_public.load_structure_supports', 'select')
    or has_table_privilege('anon', 'experience_public.load_structure_supports', 'insert') then
    raise exception 'anonymous support records must remain server-only';
  end if;

  if has_function_privilege(
    'anon',
    'experience_public.support_load_structure(uuid,text)',
    'execute'
  ) then
    raise exception 'anonymous users must not call the support function directly';
  end if;
end
$$;

rollback;
