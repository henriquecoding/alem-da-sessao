# ADR-029 — Um token declara os dois temas; o alternador só muda `color-scheme`

**Estado:** aceite. Relatório v2 §6.3.

## O defeito que originou esta decisão

O tema escuro vivia num `@media (prefers-color-scheme: dark)` com a sua própria
cópia da paleta. Nada obrigava as duas cópias a andar a par, e não andaram:
um token acrescentado ao bloco claro e esquecido no escuro produzia uma caixa
clara com texto claro por cima. A mesma classe de erro apareceu em classes
cegas ao tema — `bg-white/62`, `text-white` — que davam a mesma caixa nos dois
temas enquanto o texto herdado mudava de cor por baixo delas.

O utilizador viu o resultado antes de nós: texto que não se lia, em ecrãs que
passavam em todos os testes que existiam.

## A decisão

**Um token declara-se uma vez, com os dois valores juntos**, em `light-dark()`.

```css
--muted: light-dark(#ebe9e5, #292c2b);
```

A escolha de tema não troca folhas de estilo nem propaga uma classe: muda
`color-scheme` na raiz, e todos os `light-dark()` resolvem de outro lado.

```css
:root {
  color-scheme: light dark;
}
:root[data-theme="light"] {
  color-scheme: light;
}
:root[data-theme="dark"] {
  color-scheme: dark;
}
```

O que isto compra não é elegância — é que **o erro deixa de ser escrevível**.
`light-dark()` exige dois argumentos; não existe forma de declarar um token
para um tema só e descobri-lo mais tarde no outro.

## Consequências

- Valores que não são cores não cabem em `light-dark()`. Onde havia uma
  `opacity` diferente por tema (o grão de `.material`), a diferença passou a
  um token de cor, `--grain-ink`. Nenhum `@media` de tema declara cor: um teste
  falha o build se voltar a declarar.
- Sombras compõem-se de tokens de cor (`--shadow-contact`, `--shadow-ambient-*`)
  porque uma lista de sombras tem vírgulas próprias e partiria a função.
- Tokens deliberadamente iguais nos dois temas — a barra lateral, a superfície
  editorial e o texto que assenta nelas — estão numa lista explícita em
  `tests/palette.test.ts`. Estar nessa lista é uma decisão; estar fora dela por
  esquecimento é o que o teste apanha.
- `check:contrast` lê os pares realmente usados no código e calcula o contraste
  nos dois temas. Se o parser deixar de ver duas paletas distintas, falha em
  vez de passar em silêncio — a engine não pode mentir por omissão.

## Sem armazenamento

A escolha vive num cookie de preferência, não em `localStorage` (ADR-004). Não
tem identificador, não viaja para terceiros e só existe depois de alguém
carregar num botão. `check:privacy` recusa `document.cookie` fora de
`lib/preferences.ts`, para que o segundo cookie tenha de ser uma decisão e não
um descuido.

O cookie é lido por um script inline mínimo antes da primeira pintura. Sem ele
há o flash claro que quase todos os sites com tema escuro têm.
