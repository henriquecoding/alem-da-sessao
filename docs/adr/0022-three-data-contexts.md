# ADR-022 — Três contextos de dados com invariante de direção

**Estado:** aceite. Relatório v2 §10.1 e §4.8.

Abrir a superfície pública criou três contextos que nunca partilham
permissões, finalidade ou acesso implícito:

| Contexto           | Conteúdo                                   | Titular      | Retenção              | Visível a       |
| ------------------ | ------------------------------------------ | ------------ | --------------------- | --------------- |
| **C1 — convidado** | respostas em memória do browser            | a pessoa     | zero                  | ninguém         |
| **C2 — pessoal**   | artefactos de conta sem relação de cuidado | a pessoa     | escolha dela          | só ela          |
| **C3 — clínico**   | snapshots partilhados, notas, agenda       | profissional | política + legal hold | ator autorizado |

**O invariante mais importante do sistema:** não existe caminho de C2 para C3
sem passar por `tools.snapshots`, criado por ato deliberado do cliente.

A ordem de entrada não importa; a direção importa. Se alguém fez três
experiências sozinho em março e começa terapia em junho, o profissional não vê
nada de março automaticamente.

**Verificação.** `check:direction`, `supabase/clinical/tests/direction.sql` e os
testes de invariante em `tests/invariants.test.ts`.
