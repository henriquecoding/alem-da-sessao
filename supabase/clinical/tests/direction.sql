-- Além da Sessão — a regra de direção, verificada na base
--
-- Relatório v2 §4.8, §10.1 e §10.6. Estas assertions provam no schema o que
-- `check:direction` prova no código: não existe caminho de C2 (pessoal) para
-- C3 (clínico) que não passe por um snapshot criado deliberadamente.
--
-- Executar com uma base local descartável depois de aplicar as migrações.

begin;

do $$
begin
  -- ---------------------------------------------------------------------
  -- RLS forçado nas duas tabelas novas
  -- ---------------------------------------------------------------------
  if not exists (
    select 1
    from pg_class table_meta
    join pg_namespace schema_meta on schema_meta.oid = table_meta.relnamespace
    where schema_meta.nspname = 'care'
      and table_meta.relname = 'intervals'
      and table_meta.relrowsecurity
      and table_meta.relforcerowsecurity
  ) then
    raise exception 'care.intervals must enable and force RLS';
  end if;

  if not exists (
    select 1
    from pg_class table_meta
    join pg_namespace schema_meta on schema_meta.oid = table_meta.relnamespace
    where schema_meta.nspname = 'care'
      and table_meta.relname = 'session_bridges'
      and table_meta.relrowsecurity
      and table_meta.relforcerowsecurity
  ) then
    raise exception 'care.session_bridges must enable and force RLS';
  end if;

  if has_table_privilege('anon', 'care.intervals', 'select') then
    raise exception 'anon must not select care.intervals';
  end if;

  if has_table_privilege('anon', 'care.session_bridges', 'select') then
    raise exception 'anon must not select care.session_bridges';
  end if;

  -- ---------------------------------------------------------------------
  -- §10.2 — o intervalo é uma coordenada temporal, não um contentor
  --
  -- Se alguém acrescentar uma coluna de conteúdo aqui, a classificação de
  -- dados deixa de ser limpa e o profissional passa a poder ler conteúdo ao
  -- ler a existência do intervalo. Esta assertion é o alarme.
  -- ---------------------------------------------------------------------
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'care'
      and table_name = 'intervals'
      and (
        column_name like '%ciphertext%'
        or column_name like '%content%'
        or column_name like '%body%'
        or column_name like '%note%'
        or column_name like '%payload%'
      )
  ) then
    raise exception
      'care.intervals must not carry clinical content: it is a temporal coordinate (§10.2)';
  end if;

  -- ---------------------------------------------------------------------
  -- §4.8 — a ponte não tem política de leitura para o ator profissional
  --
  -- O único caminho de C2 para C3 é tools.snapshots. Se aparecer aqui uma
  -- política que não seja a do próprio dono, o invariante mais importante do
  -- sistema caiu.
  -- ---------------------------------------------------------------------
  if exists (
    select 1
    from pg_policies
    where schemaname = 'care'
      and tablename = 'session_bridges'
      and policyname <> 'session_bridges_owner_all'
  ) then
    raise exception
      'care.session_bridges must expose no policy beyond the owner (§4.8)';
  end if;

  -- ---------------------------------------------------------------------
  -- §10.2 — proveniência coerente
  -- ---------------------------------------------------------------------
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'tools'
      and table_name = 'runs'
      and column_name = 'origin'
  ) then
    raise exception 'tools.runs.origin is required to express run provenance';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'tools'
      and table_name = 'runs'
      and column_name = 'interval_id'
      and is_nullable = 'YES'
  ) then
    raise exception
      'tools.runs.interval_id must exist and be nullable: a personal run belongs to no interval (§10.2)';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'tools'
      and table_name = 'runs'
      and column_name = 'assignment_id'
      and is_nullable = 'YES'
  ) then
    raise exception
      'tools.runs.assignment_id must be nullable: a personal run has no assignment (§10.1 C2)';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'runs_origin_interval_coherent'
  ) then
    raise exception
      'runs_origin_interval_coherent is required: personal and guest runs never belong to an interval';
  end if;
end
$$;

rollback;
