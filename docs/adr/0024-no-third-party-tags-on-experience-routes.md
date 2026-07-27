# ADR-024 — Nenhuma tag de terceiros em rotas de experiência

**Estado:** aceite. Relatório v2 §8.2. **A decisão de maior risco financeiro do
documento.**

Com a superfície pública aberta, o produto tem exatamente a estrutura pela
qual a FTC multou o BetterHelp em US$ 7,8 milhões: partilhar respostas de um
questionário de saúde, emails e IPs com Facebook, Snapchat, Criteo e Pinterest
para retargeting.

A ordem final inclui proibição permanente de partilhar dados de saúde para
publicidade, consentimento explícito antes de qualquer divulgação, e obrigação
de mandar terceiros apagar o já partilhado.

> No momento em que as experiências públicas viram funil de aquisição, tudo o
> que a pessoa escreve nelas passa a ser dado de saúde recolhido com finalidade
> comercial. Artigo 9.º do RGPD; dado sensível na LGPD.

**Três regras que são arquitetura, não política:**

- **F1** — zero tags de terceiros em qualquer rota de experiência. Meta,
  Google Ads, TikTok, nenhum. Nunca.
- **F2** — conteúdo de experiência nunca alimenta targeting, remarketing,
  lookalike ou recomendação.
- **F3** — o encontro com o profissional acontece por filtros declarados e
  verificáveis, nunca pelo que a pessoa escreveu.

**Consequência de produto.** A transição da experiência para o diretório é um
convite neutro. _"Quer procurar um profissional?"_ e nunca _"Com base no que
escreveu, recomendamos a Dra. X."_ — a segunda formulação é simultaneamente
ilegal, antiética e clinicamente indefensável.

**Verificação.** `check:privacy` implementa F1, F2 e F3 e falha o build.
