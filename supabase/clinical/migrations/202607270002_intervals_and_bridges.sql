-- Além da Sessão — o intervalo como objeto de primeira classe
--
-- Relatório v2 §10.2. Três mudanças que juntas tornam a regra de direção
-- (§4.8) expressável no schema em vez de apenas escrita numa política:
--
--   1. `care.intervals` — o intervalo entre duas sessões passa a existir.
--   2. `care.session_bridges` — a ponte bidirecional do §4.3.
--   3. `tools.runs.origin` e `tools.runs.interval_id` — proveniência.
--
-- Por que ninguém fez isto: os EHRs modelam *encontros* porque encontros
-- faturam. Este produto não fatura por encontro, portanto pode modelar a
-- realidade clínica em vez do modelo contabilístico. Uma sessão semanal de 50
-- minutos ocupa 0,5% de uma semana; os outros 99,5% não têm forma nem registo
-- em produto nenhum do mercado.

begin;

-- ---------------------------------------------------------------------------
-- 1. O intervalo
-- ---------------------------------------------------------------------------

create type care.interval_state as enum (
  'open',      -- a sessão anterior terminou, a próxima ainda não aconteceu
  'closing',   -- a próxima sessão está dentro de 24 h
  'bridged',   -- houve ponte de entrada
  'closed',    -- a próxima sessão aconteceu
  'orphaned'   -- não houve próxima sessão (relação pausada ou terminada)
);

-- NOTA CRÍTICA DE DESENHO: esta tabela não tem colunas de conteúdo, e isso é
-- deliberado. O conteúdo vive em `tools.runs` e `care.session_bridges`, que
-- referenciam `interval_id`. O intervalo é uma coordenada temporal, não um
-- contentor de dados clínicos.
--
-- É o que permite ao profissional ver a *existência* de um intervalo sem ver
-- nada dentro dele — e é o que mantém a classificação de dados limpa.
create table care.intervals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references identity.organizations(id) on delete restrict,
  care_relationship_id uuid not null
    references care.care_relationships(id) on delete restrict,
  previous_appointment_id uuid references care.appointments(id) on delete set null,
  next_appointment_id uuid references care.appointments(id) on delete set null,
  opens_at timestamptz not null,
  closes_at timestamptz,
  state care.interval_state not null default 'open',
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete restrict,
  updated_at timestamptz not null default now(),
  updated_by uuid not null references auth.users(id) on delete restrict,
  version integer not null default 1 check (version > 0),
  check (closes_at is null or closes_at > opens_at)
);

-- Uma relação de cuidado tem no máximo um intervalo aberto de cada vez.
create unique index intervals_single_open_idx
  on care.intervals(care_relationship_id)
  where state in ('open', 'closing', 'bridged');

create index intervals_relationship_window_idx
  on care.intervals(care_relationship_id, opens_at desc);

-- ---------------------------------------------------------------------------
-- 2. A ponte de sessão
-- ---------------------------------------------------------------------------

create type care.bridge_direction as enum (
  'outgoing',  -- até ~48 h depois da sessão: "o que ficou de hoje?"
  'incoming'   -- até ~24 h antes da seguinte: "o que quer levar?"
);

-- O conteúdo é cifrado no DAL e nunca em claro, como o resto do conteúdo
-- clínico. A ponte é a peça do produto robusta às duas respostas possíveis à
-- questão do Quenza (§2): funciona mesmo que o profissional nunca atribua nada.
create table care.session_bridges (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references identity.organizations(id) on delete restrict,
  interval_id uuid not null references care.intervals(id) on delete restrict,
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  direction care.bridge_direction not null,
  ciphertext bytea not null,
  key_id text not null,
  nonce bytea not null,
  auth_tag bytea not null,
  algo_version smallint not null default 1 check (algo_version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version > 0),
  unique (interval_id, direction)
);

create index session_bridges_owner_idx
  on care.session_bridges(owner_user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 3. Proveniência das runs — a regra de direção no schema
-- ---------------------------------------------------------------------------

create type tools.run_origin as enum (
  'assigned',        -- o profissional atribuiu
  'self_started',    -- o cliente iniciou dentro da relação de cuidado
  'personal',        -- conta sem relação de cuidado (contexto C2 do §10.1)
  'guest_converted'  -- feito em modo convidado, guardado ao criar conta
);

-- `assignment_id` passa a ser nullable: uma run em C2 não pertence a
-- atribuição nenhuma, e antes desta migração era impossível representá-la.
alter table tools.runs
  alter column assignment_id drop not null;

alter table tools.runs
  add column origin tools.run_origin not null default 'assigned',
  -- Nullable de propósito: uma run pessoal não pertence a intervalo nenhum.
  -- É esta coluna que torna a regra de direção (§4.8) expressável no schema.
  add column interval_id uuid null references care.intervals(id) on delete set null;

alter table tools.runs
  alter column origin drop default;

-- As duas invariantes de proveniência, aplicadas pela base e não pela app:
--   · uma run atribuída tem atribuição; uma run pessoal não tem;
--   · uma run pessoal ou de convidado nunca pertence a um intervalo, porque
--     intervalos só existem dentro de uma relação de cuidado.
alter table tools.runs
  add constraint runs_origin_assignment_coherent check (
    (origin = 'assigned' and assignment_id is not null)
    or (origin <> 'assigned' and assignment_id is null)
  ),
  add constraint runs_origin_interval_coherent check (
    (origin in ('personal', 'guest_converted') and interval_id is null)
    or origin in ('assigned', 'self_started')
  );

create index runs_origin_owner_idx
  on tools.runs(owner_user_id, origin, saved_at desc);

create index runs_interval_idx
  on tools.runs(interval_id)
  where interval_id is not null;

-- ---------------------------------------------------------------------------
-- 4. RLS — deny by default, como todo o resto do plano clínico
-- ---------------------------------------------------------------------------

alter table care.intervals enable row level security;
alter table care.session_bridges enable row level security;
alter table care.intervals force row level security;
alter table care.session_bridges force row level security;

revoke all on care.intervals from anon, authenticated;
revoke all on care.session_bridges from anon, authenticated;

-- O profissional vê que o intervalo existe. É tudo o que vê: a tabela não tem
-- conteúdo, e o §10.6.5 exige que um intervalo vazio seja indistinguível de um
-- intervalo cujos artefactos não foram partilhados.
create policy intervals_participants_select
on care.intervals
for select
to authenticated
using (
  exists (
    select 1
    from care.care_relationships relationship
    where relationship.id = care.intervals.care_relationship_id
      and (
        relationship.professional_user_id = (select auth.uid())
        or care.can_access_client(
          (select auth.uid()),
          relationship.client_record_id,
          'client.read'
        )
      )
  )
);

-- A ponte é do cliente até um ato deliberado de partilha. Não existe política
-- de leitura para o ator profissional: o único caminho de C2 para C3 é
-- `tools.snapshots`, criado por ação explícita do cliente (§4.8, §10.1).
--
-- Isto é o invariante mais importante do sistema. Se um dia alguém precisar de
-- acrescentar aqui uma política para o profissional, essa é a conversa a ter
-- antes de escrever a linha, não depois.
create policy session_bridges_owner_all
on care.session_bridges
for all
to authenticated
using (owner_user_id = (select auth.uid()))
with check (owner_user_id = (select auth.uid()));

grant select on care.intervals to authenticated;
grant select, insert, update on care.session_bridges to authenticated;

commit;
