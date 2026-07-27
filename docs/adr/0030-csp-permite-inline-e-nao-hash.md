# ADR-030 — `script-src` permite inline, e nunca hash junto de `unsafe-inline`

**Estado:** aceite.

## O defeito

A política era `script-src 'self'` em produção, com `'unsafe-inline'` apenas em
desenvolvimento. Parecia a diretiva correta. O efeito real era um site morto:
o Next entrega o payload de hidratação em `<script>` inline
(`self.__next_f.push(...)`), um por fragmento, e o navegador recusava-os todos.

**Em produção nada hidratava.** Nenhum menu abria, nenhum botão respondia,
nenhum estado mudava. Ninguém reparou porque em desenvolvimento a diretiva já
trazia `'unsafe-inline'`, e era em desenvolvimento que toda a gente olhava.

## A decisão

`script-src 'self' 'unsafe-inline'`.

As duas saídas honestas eram nonce ou inline. O nonce obriga a gerar um valor
por pedido, o que tira as páginas da geração estática e da cache de CDN — um
custo permanente de latência e de compute (§1.6) para fechar um vetor que este
produto não tem: não há uma única superfície onde HTML de terceiros seja
renderizado, e o único `dangerouslySetInnerHTML` do código é uma constante
nossa.

O que fecha os caminhos de escalada de XSS continua fechado: `object-src
'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`.

## A regra que impede o regresso do defeito

**Não se acrescenta um hash nem um nonce a esta diretiva.** Quando existe um
hash ou um nonce, a especificação manda o navegador **ignorar** `'unsafe-inline'`
— e o site volta ao estado morto. Quem acrescentar o hash a pensar que está a
apertar a política parte tudo outra vez.

`tests/locale-engine.test.ts` falha o build se a diretiva passar a conter
`sha256-` ou `nonce-`.

## Quando reverter

No momento em que qualquer superfície renderizar HTML que não escrevemos, esta
linha passa a nonce e as páginas passam a dinâmicas. Até lá, não.
