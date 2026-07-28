-- Além da Sessão — plano comercial isolado
--
-- Esta migração pertence a um projeto Supabase diferente do plano clínico.
-- organization_id é apenas um identificador externo opaco: não existe foreign
-- key, join ou caminho de leitura para care.*, tools.* ou notas clínicas.

begin;

create schema if not exists billing;

create type billing.subscription_status as enum (
  'trialing',
  'active',
  'past_due',
  'paused',
  'cancelled',
  'incomplete'
);

create table billing.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique,
  provider text not null check (provider in ('stripe')),
  provider_customer_id text not null unique,
  country_code text not null check (country_code in ('PT', 'BR')),
  currency text not null check (currency in ('EUR', 'BRL')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table billing.subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references billing.customers(id) on delete restrict,
  provider_subscription_id text not null unique,
  provider_price_id text not null,
  status billing.subscription_status not null,
  seats integer not null default 1 check (seats > 0),
  current_period_starts_at timestamptz,
  current_period_ends_at timestamptz,
  cancel_at_period_end boolean not null default false,
  cancelled_at timestamptz,
  provider_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    current_period_ends_at is null
    or current_period_starts_at is null
    or current_period_ends_at > current_period_starts_at
  )
);

create index subscriptions_customer_status_idx
  on billing.subscriptions(customer_id, status, updated_at desc);

create table billing.invoices (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references billing.customers(id) on delete restrict,
  subscription_id uuid references billing.subscriptions(id) on delete set null,
  provider_invoice_id text not null unique,
  status text not null check (
    status in ('draft', 'open', 'paid', 'void', 'uncollectible')
  ),
  currency text not null check (currency in ('EUR', 'BRL')),
  amount_due_minor bigint not null check (amount_due_minor >= 0),
  amount_paid_minor bigint not null check (amount_paid_minor >= 0),
  hosted_invoice_url text,
  issued_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table billing.webhook_receipts (
  provider text not null check (provider in ('stripe')),
  provider_event_id text not null,
  event_type text not null,
  payload_sha256 text not null check (char_length(payload_sha256) = 64),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text,
  attempts integer not null default 0 check (attempts >= 0),
  primary key (provider, provider_event_id)
);

-- O browser nunca lê nem escreve faturação diretamente. Handlers server-only
-- verificam a assinatura do webhook e usam a service role do projeto
-- comercial. RLS e grants tornam um cliente público incapaz de consultar até
-- metadados de assinatura.
alter table billing.customers enable row level security;
alter table billing.subscriptions enable row level security;
alter table billing.invoices enable row level security;
alter table billing.webhook_receipts enable row level security;
alter table billing.customers force row level security;
alter table billing.subscriptions force row level security;
alter table billing.invoices force row level security;
alter table billing.webhook_receipts force row level security;

revoke all on schema billing from public, anon, authenticated;
revoke all on all tables in schema billing from public, anon, authenticated;
grant usage on schema billing to service_role;
grant all on all tables in schema billing to service_role;

commit;
