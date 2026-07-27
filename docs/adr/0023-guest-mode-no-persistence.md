# ADR-023 — Modo convidado sem qualquer persistência no servidor

**Estado:** aceite. Relatório v2 §4.10 e §10.4.

Qualquer pessoa faz uma experiência sem conta nenhuma. Nenhuma chamada de
escrita ao servidor durante a experiência; o estado vive em React state e
desaparece com o separador.

No fim, três portas **visualmente equivalentes**: descarregar o artefacto,
criar conta para guardar, descartar sem rasto.

**Três benefícios simultâneos.** Custo marginal ≈ 0 para quem nunca converte
(§1.6); a história de privacidade mais forte que existe — _não guardámos nada_;
e o pedido de conta no único momento em que é natural, quando a pessoa já tem
algo que vale a pena guardar.

**Conversão.** Ao criar conta, as respostas em memória são enviadas uma vez,
cifradas, com `origin = 'guest_converted'`.

**Verificação.** `check:privacy` proíbe `localStorage`, `sessionStorage` e
`indexedDB` em toda a aplicação.
