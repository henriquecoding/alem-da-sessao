# Gate de release

O projeto permanece local até todos os itens aplicáveis estarem concluídos.

## Barreiras automáticas

`pnpm verify:release` executa formatação, lint, TypeScript, testes, contratos de
localização, privacidade, gates das experiências, alegações, direção dos dados,
acessibilidade, contraste, prontidão de lançamento, build de produção e
orçamento gzip medido nos chunks gerados. `pnpm audit --prod` fecha a verificação
de dependências conhecidas.

O lançamento só é considerado pelo código quando
`APP_ENV=production` **e** `PUBLIC_LAUNCH_ENABLED=true`. Nesse estado,
`check:release-readiness` também exige identificadores para DPIA/AIPD, pentest,
matriz RLS, revisão clínica e reconciliação de faturação, além dos três projetos
Supabase isolados e segredos server-only do Stripe. Identificadores apontam para
evidências; nunca guardam os documentos no ambiente.

O header `X-Robots-Tag` permanece `noindex` de forma incondicional nesta
entrega. Retirá-lo exige uma alteração de código e revisão separada depois de
todos os gates — ativar uma variável de ambiente, sozinho, nunca publica o site.

- [ ] entrevistas e tese de valor validadas;
- [ ] revisão clínica das experiências;
- [ ] `pt-PT` e `pt-BR` completos;
- [ ] DPIA/AIPD e contratos revistos;
- [ ] projetos Supabase isolados e pagos;
- [ ] MFA/AAL2;
- [ ] testes RLS positivos e negativos;
- [ ] cifragem, auditoria e outbox operacionais;
- [ ] backup e restauro ensaiados;
- [ ] páginas legais e subprocessadores;
- [ ] acessibilidade WCAG 2.2 AA revista;
- [ ] testes mobile e desktop;
- [ ] billing sandbox reconciliado;
- [ ] Preview e Staging protegidos;
- [ ] autorização explícita de Henrique para o único primeiro deploy.

Ligar o domínio não faz parte deste gate técnico automático e requer uma decisão
separada.
