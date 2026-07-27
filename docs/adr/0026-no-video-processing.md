# ADR-026 — Vídeo não é processado pelo produto

**Estado:** aceite. Relatório v2 §1.7.

O MVP gera `.ics` e aceita uma URL externa de videoconferência, entregue apenas
a participantes autorizados. Resolve 100% do problema real.

**Três razões.** Vídeo escala por minuto e a assinatura é plana — destruidor de
margem estrutural. Processar vídeo dispara exposição regulatória
desproporcional: gravação, armazenamento, cifragem, retenção. E há evidência do
próprio mercado: o Allminds cobra R$ 2,00 por sessão de vídeo **por cima** da
assinatura, ou seja, um concorrente direto já concluiu que vídeo é centro de
custo.

**Se algum dia integrar:** um fornecedor com residência de dados na UE. E mesmo
assim, nunca gravar.
