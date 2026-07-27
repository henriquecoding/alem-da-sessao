# ADR-025 — `canSelfStart` exige gate de revisão clínica

**Estado:** aceite. Relatório v2 §4.9 e §10.3.

Com a porta A aberta existem pessoas a fazer experiências sozinhas, sem
profissional, possivelmente em sofrimento agudo, às 3 da manhã. A imunidade
estrutural do ADR-021 não as cobre: essa pessoa está exatamente na situação do
Woebot.

**Nem toda experiência deve ser auto-iniciável.** Uma sobre redistribuir
responsabilidades, provavelmente sim. Uma que se aproxime de perda, trauma ou
segurança, não — essa só existe atribuída, com alguém do outro lado.

`canSelfStart` deixou de ser boolean e passou a ser um objeto que obriga a
declarar revisor, data, tier de risco e recursos de crise por locale. O tipo
`riskTier` não admite `"high"`: risco alto não é auto-iniciável por construção.

Acompanha: recursos de crise por locale acessíveis por escolha explícita e
**nunca em modal interruptivo**; declaração de que ninguém está a ver e a
plataforma não é monitorizada.

**Regra derivada.** `canRunAsGuest: true` exige `canSelfStart !== false`.

**Verificação.** `check:tools`.
