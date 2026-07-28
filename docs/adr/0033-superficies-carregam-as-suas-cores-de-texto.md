# ADR-033 — Não se aplica uma cor de fundo; aplica-se uma superfície

**Estado:** aceite. Relatório v2 §6.3, WCAG 1.4.3.

## O defeito

Um cartão punha `bg-[var(--primary)]`. O parágrafo lá dentro, **noutro
elemento**, herdava `--foreground` ou escrevia `text-white/62`. As duas cores
nunca se encontravam no mesmo sítio do código, portanto a verificação de pares
que existia — que comparava fundo e texto dentro da mesma string de classes —
nunca lhes tocou. No ecrã, o parágrafo desaparecia.

Isto passou duas vezes. Da segunda, o código tinha chegado ao ponto de ter um
condicional a escolher `text-white/68` quando o cartão era verde: a prova de
que o modelo estava errado, não a cor.

## A decisão

**Nunca se aplica uma cor de fundo. Aplica-se uma superfície.**

Uma superfície declara o seu fundo _e redefine os tokens de texto no seu
próprio escopo_:

```css
.surface-primary {
  --surface-bg: var(--primary);
  --foreground: var(--on-primary);
  --muted-foreground: var(--on-primary-muted);
  --border: var(--on-primary-line);
}
```

Um descendente que escreva `text-[var(--muted-foreground)]` recebe o valor
certo **sem saber em que superfície está** — que é a única forma de isto
continuar correto no dia em que alguém mover o componente.

Duas famílias, e a distinção é tudo:

- **Tonais** (`surface-raised`, `surface-muted`, `surface-private`, …) — a
  mesma polaridade da página. Herdam o texto porque herdar está certo.
- **Fortes** (`surface-primary`, `surface-accent`, `surface-shared`,
  `surface-sidebar`, `surface-ink`, …) — polaridade invertida. Trazem o
  conjunto completo, obrigatoriamente.

## As três peças que a tornam uma engine e não uma convenção

1. **`check:contrast` valida as receitas, não os usos.** Se
   `.surface-primary` estiver certa, _todos_ os seus descendentes estão
   certos, incluindo os que ainda não foram escritos. Vinte receitas × dois
   temas × texto e texto secundário, exaustivamente. Quatro das receitas
   originais falharam nesta verificação e foram corrigidas **no token**, que é
   onde a correção pertence.
2. **`check:contrast` recusa `bg-[var(--primary)]` no código** e nomeia a
   classe que o substitui. Recusa também qualquer cor fixa —
   `text-white/62`, `border-black/5` — em qualquer sítio, sem depender de
   haver um fundo na mesma string. Era essa dependência o buraco.
3. **`cn` sabe que as superfícies são exclusivas.** Sem isso,
   `cn("surface-raised", "surface-primary")` devolvia as duas e ganhava a que
   estivesse escrita depois na folha de estilos — não a que o autor pediu. O
   resultado foi um cartão com o fundo de uma superfície e o texto de outra,
   que é a pior combinação possível. O grupo entra no `tailwind-merge` ao lado
   de `bg-*` e `text-*`, porque é a mesma categoria de decisão.

## Camadas

As receitas vivem em `@layer components`. A ordem do Tailwind é
`theme, base, components, utilities`, portanto uma utilidade escrita no sítio
ainda ganha à superfície — uma superfície que não pode ser afinada onde é
usada é uma prisão, não uma engine. Fora de qualquer camada, ganhariam a tudo.

## O que isto apaga do código

O condicional. Não há `area.tone.includes(...) ? "text-white/68" : "…"`, não
há variante de botão escolhida pela cor do pai, não há um `text-white` em lado
nenhum do produto. O parágrafo pede o texto secundário da superfície onde
está, e a superfície é que sabe qual é.
