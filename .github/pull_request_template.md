## Resultado

Descreva o comportamento entregue e o que permanece deliberadamente fora do
escopo.

## Risco

- [ ] Não altera fronteiras de dados, autenticação, RLS ou conteúdo clínico.
- [ ] Se altera, a ameaça e os testes negativos estão documentados.
- [ ] Não introduz dados reais, segredos ou alegações clínicas.

## Verificação

- [ ] `pnpm verify:release`
- [ ] `pnpm audit --prod`
- [ ] Fluxos afetados validados em `pt-PT` e `pt-BR`
- [ ] Mobile, teclado e movimento reduzido revistos
- [ ] Sem deploy nesta alteração
