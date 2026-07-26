# Além da Sessão

Fundação local da plataforma de continuidade terapêutica conduzida por
profissionais. O repositório nasce sem ligação a produção, Vercel, Stripe ou
qualquer projeto Supabase.

## Estado

- execução exclusivamente local;
- dados sintéticos e claramente identificados;
- `pt-PT` e `pt-BR` como localizações fundadoras;
- superfícies pública, profissional, cliente e administração;
- motor de experiências versionado e extensível;
- duas engines interativas completas em modo local;
- workspaces funcionais para profissional, cliente e administração;
- nenhuma integração conceptual ou técnica com o Lost Letters Room;
- nenhum uso de IA para diagnóstico, prescrição ou substituição profissional.

## Requisitos

- Node.js 22 ou superior;
- pnpm 11.

## Executar

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

Abra `http://localhost:3000`. O projeto redireciona para `pt-PT` e disponibiliza
um seletor de demonstração para as três áreas.

## Validar

```bash
pnpm check
pnpm build
```

## Estrutura

```text
apps/web                  aplicação Next.js
packages/authz            permissões e papéis
packages/db               contratos de domínio e fixtures
packages/i18n             localização e terminologia
packages/tool-registry    manifesto das experiências
packages/validation       schemas partilhados
supabase/clinical         migrations do plano clínico
supabase/public           migrations do plano público
docs                      decisões, segurança e execução local
```

Leia [docs/LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md) antes de configurar
serviços externos. A investigação que orienta as engines e a nova paleta está em
[docs/PRODUCT_RESEARCH_2026-07.md](docs/PRODUCT_RESEARCH_2026-07.md).
