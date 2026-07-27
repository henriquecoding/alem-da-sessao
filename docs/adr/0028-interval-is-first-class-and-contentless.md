# ADR-028 — O intervalo é entidade de primeira classe e não contém conteúdo

**Estado:** aceite. Relatório v2 §4.2 e §10.2.

Uma sessão semanal de 50 minutos ocupa 0,5% de uma semana. Os outros 99,5% não
têm forma nem registo no modelo de dados de ninguém, porque os EHRs modelam
encontros — encontros faturam, o intervalo não. Não faturando por encontro,
este produto pode modelar a realidade clínica em vez do modelo contabilístico.

`care.intervals` **não tem colunas de conteúdo**, e isso é a decisão. O
conteúdo vive em `tools.runs` e `care.session_bridges`, que referenciam
`interval_id`. O intervalo é uma coordenada temporal, não um contentor de dados
clínicos.

Isso mantém a classificação de dados limpa e permite ao profissional ver a
_existência_ de um intervalo sem ver nada dentro dele.

**O risco, e a regra que o desarma.** Um intervalo sem conteúdo não pode virar
vazio acusatório: o estado `open` sem artefactos é normal e é apresentado como
normal.

**O invariante que prova a ausência de vigilância.** Para o profissional, um
intervalo vazio e um intervalo cujos artefactos não foram partilhados têm de ser
indistinguíveis.

**Verificação.** `supabase/clinical/tests/direction.sql` falha se aparecer uma
coluna de conteúdo; `tests/invariants.test.ts` cobre a indistinguibilidade.
