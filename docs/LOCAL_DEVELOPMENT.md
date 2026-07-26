# Desenvolvimento local

O projeto foi preparado para funcionar sem Supabase, Stripe ou Vercel. Este é o
modo obrigatório até existir autorização explícita para preparar ambientes
externos.

## Primeira execução

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

Rotas principais:

- `/pt-pt` e `/pt-br`: site público;
- `/pt-pt/demo`: escolha de superfície;
- `/pt-pt/pro/hoje`: espaço profissional;
- `/pt-pt/cuidado/hoje`: espaço do cliente;
- `/pt-pt/experiencias`: experiências públicas e gratuitas;
- `/pt-pt/experiencias/estruturas-de-carga`: percurso e parede comunitária;
- `/pt-pt/admin/operacao`: administração;
- `/api/health`: estado técnico sem conteúdo sensível.

## Dados

`NEXT_PUBLIC_DATA_MODE=fixture` inicia todo o produto sem serviços externos. Os
nomes, horários, eventos e estruturas da parede foram inventados. O depósito e
o apoio comunitário funcionam em memória enquanto o processo local estiver
aberto. Não coloque dados clínicos ou contactos reais em fixtures, testes,
screenshots, issues ou commits.

## Supabase futuro

A arquitetura reserva dois projetos independentes:

1. plano clínico: identidade, organizações, cuidado, experiências privadas,
   consentimentos, auditoria e outbox;
2. plano público: diretório verificado, conteúdo editorial, pedidos iniciais
   minimizados e comunidade anónima moderada.

As migrations ficam em `supabase/clinical` e `supabase/public`. Não as aplique
num projeto existente e, em particular, nunca no projeto do Lost Letters Room.

Para persistência entre pessoas, crie um projeto Supabase dedicado ao plano
público, aplique as duas migrations por ordem e configure:

```dotenv
NEXT_PUBLIC_DATA_MODE=supabase
SUPABASE_PUBLIC_URL=https://PROJECT.supabase.co
SUPABASE_PUBLIC_SERVICE_ROLE_KEY=server-only
PUBLIC_EXPERIENCE_HMAC_SECRET=random-server-only-secret
```

O schema `experience_public` precisa de estar na lista de schemas expostos pela
Data API. Isto não o torna acessível ao browser: as tabelas não concedem
privilégios a `anon` ou `authenticated`, forçam RLS e só são usadas pelos Route
Handlers com a chave guardada no servidor.

Antes de testar localmente uma release:

```bash
pnpm verify:release
```

## Lançamento

Não existe configuração de Vercel nem ligação a `alemdasessao.com`. A passagem
para Preview, Staging ou Production exige uma decisão posterior e os gates
descritos em `docs/ARCHITECTURE.md`.
