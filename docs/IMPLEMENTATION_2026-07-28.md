# Elevação de qualidade — implementação de 28 de julho de 2026

## Resultado

Esta revisão transforma a fundação visual num protótipo local verificável e
numa arquitetura que falha fechada quando alguém tenta tratá-la como produção.
Não declara prontidão clínica nem faz deploy.

## Entregue

- nova paleta **Luz de Intervalo**, com base mineral, violeta como ação,
  pigmentos pastel e receitas verificadas nos temas claro e escuro;
- redução das esperas artificiais e suporte consistente a movimento reduzido;
- navegação pública mobile completa, footer, estados de loading/erro/404 e
  páginas de privacidade, termos, acessibilidade e subprocessadores;
- agenda interativa com navegação semanal, criação local e deteção de conflitos;
- diretório de clientes pesquisável, convite local separado e estados vazios;
- detalhe de cliente com tabs acessíveis, notas, atribuição de experiência e
  revisão de snapshots;
- autenticação por superfície, autorização por papel e MFA/AAL2 fora do modo
  fixture;
- RLS endurecida por relação de cuidado e testes estruturais negativos;
- engines bloqueadas em produção até aprovação clínica real; a demonstração
  local continua utilizável e identificada;
- origem obrigatória nas mutações públicas e proteção por HMAC/rate limit;
- leitura profissional por DAL Supabase, sem fallback de dados fictícios em
  produção;
- moeda, fuso e datas fundadoras diferenciadas entre `pt-PT` e `pt-BR`;
- SEO localizado preparado, mas `noindex` permanece incondicional e o sitemap
  vazio antes de uma alteração de lançamento revista separadamente;
- base comercial num projeto Supabase separado, acessível apenas por service
  role;
- dependências atualizadas, overrides de segurança e remoção da fonte editorial
  global;
- CI com verificação integral, auditoria de produção, concorrência cancelável,
  CODEOWNERS, template de PR e Dependabot;
- orçamento medido no build real: base partilhada e custo incremental por rota
  são verificados separadamente.

## Gates que código não pode fabricar

Revisão clínica independente, DPIA/AIPD jurídica, pentest, teste RLS contra
projetos reais, ensaio de backup/restauro e reconciliação Stripe permanecem
bloqueadores externos. `check:release-readiness` exige identificadores dessas
evidências quando o lançamento for deliberadamente ativado.

## Comandos de aceitação

```bash
pnpm verify:release
pnpm audit --prod
```

O modo de produção deve ainda ser testado negativamente sem evidências: a
verificação precisa recusar o lançamento. Nenhuma etapa deste trabalho publica
na Vercel ou liga o domínio.
