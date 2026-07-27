# ADR-021 — Preço e métricas de sucesso nunca dependem do engajamento do cliente

**Estado:** aceite. Relatório v2 §1.3 e §7.7. **Trate isto como arquitetura de
segurança, porque é.**

O Woebot encerrou o app de consumidor em 2025 tendo feito tudo certo:
validação clínica revista por pares, processo regulatório, salvaguardas. O
modo de falha, formulado com precisão:

> Um produto construído sobre contenção compete contra produtos construídos
> sobre captura, e a contenção perde nas métricas que sustentam o negócio.

A estrutura cliente-grátis / profissional-pagante torna a contenção gratuita.
Um cliente que abre a plataforma duas vezes por mês, faz uma experiência e
fecha é sucesso comercial pleno aqui e falência para o Woebot.

**A regra.** No dia em que o preço, o plano ou uma métrica de sucesso passar a
depender do engajamento do cliente, o produto vira o Woebot. Nunca streaks,
nunca notificações de engajamento, nunca scores. Não por disciplina moral —
por desenho do negócio a proteger o produto de nós próprios num dia de pressa.

**A métrica que substitui o DAU.** Retenção do profissional aos 30/90/180 dias,
e a fração de intervalos com pelo menos um artefacto, agregada por organização
e nunca por cliente.
