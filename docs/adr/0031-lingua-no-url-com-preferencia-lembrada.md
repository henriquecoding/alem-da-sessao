# ADR-031 — A língua vive no URL; a escolha é lembrada só para quem chega sem uma

**Estado:** aceite. Relatório v2 §7.5.

A variante é parte do endereço (`/pt-pt/...`, `/pt-br/...`). Um link partilhado
leva a língua consigo, cada variante é indexável em separado, e nenhuma página
precisa de ser dinâmica para saber em que língua está.

## O que estava errado

A troca era duas linhas dentro de um componente:

```ts
const nextPath = pathname.replace(/^\/pt-(pt|br)(?=\/|$)/, `/${nextSegment}`);
```

Três defeitos, nenhum visível a olho:

1. **Perdia a query e o fragmento.** Mudar de língua num diretório filtrado
   devolvia o diretório sem filtros, e ninguém percebia porquê.
2. **Não dizia o que ia mudar.** «PT» e «BR» obrigam a adivinhar. O que difere
   entre as variantes não é a língua — é a ortografia, o tratamento e parte do
   vocabulário clínico.
3. **Não deixava rasto.** Quem escolhia Brasil voltava a cair em Portugal ao
   entrar pela raiz, sempre.

## A decisão

A troca é uma função única, `swapLocaleSegment(pathname, to, search, hash)`,
com testes — incluindo o caminho sem segmento e o `/pt-ptx` que não é uma
língua.

O seletor mostra uma frase real em cada variante — `Pode parar a meio.` contra
`Você pode parar no meio.` — porque essa é a diferença que se sente. As opções
são âncoras verdadeiras, abríveis noutro separador, e existem no HTML.

A preferência é lembrada num cookie (ver ADR-029 para o que esse cookie pode
ser) e usada **num único sítio**: no proxy, para decidir para onde mandar quem
chega sem língua no URL. A escolha explícita ganha ao `Accept-Language`; o
cabeçalho só decide para quem nunca escolheu, e só distingue o Brasil de tudo o
resto, porque mais do que isso seria fingir precisão que ele não tem.

Uma preferência guardada nunca redireciona quem já tem língua no endereço. Um
link para `/pt-pt/precos` abre em português de Portugal para toda a gente.
