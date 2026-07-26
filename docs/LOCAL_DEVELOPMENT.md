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
- `/pt-pt/admin/operacao`: administração;
- `/api/health`: estado técnico sem conteúdo sensível.

## Dados

`NEXT_PUBLIC_DATA_MODE=fixture` é o único modo suportado nesta fase. Os nomes,
horários e eventos apresentados foram inventados. Não coloque dados clínicos ou
contactos reais em fixtures, testes, screenshots, issues ou commits.

## Supabase futuro

A arquitetura reserva dois projetos independentes:

1. plano clínico: identidade, organizações, cuidado, experiências privadas,
   consentimentos, auditoria e outbox;
2. plano público: diretório verificado, conteúdo editorial e pedidos iniciais
   minimizados.

As migrations ficam em `supabase/clinical` e `supabase/public`. Não as aplique
num projeto existente e, em particular, nunca no projeto do Lost Letters Room.

## Lançamento

Não existe configuração de Vercel nem ligação a `alemdasessao.com`. A passagem
para Preview, Staging ou Production exige uma decisão posterior e os gates
descritos em `docs/ARCHITECTURE.md`.
