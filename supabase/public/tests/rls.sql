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

rollback;
