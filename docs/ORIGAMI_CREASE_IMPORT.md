# Importar padrões de vincos, como o OrigamiSimulator faz

**Estado:** por fazer. Este documento existe para que o trabalho comece no sítio
certo em vez de recomeçar do princípio.

## A decisão que o motiva

O sistema atual autora cada modelo à mão, em TypeScript, e recusa qualquer
resultado com auto-interseção. Isso deu seis formas geometricamente íntegras e
visualmente pobres — o portal é um vinco, o envelope é um quadrado com abas.

O OrigamiSimulator faz o contrário, e é por isso que produz um grou. Duas
diferenças, e nenhuma é magia:

1. **Lê padrões de vincos em vez de os autorar.** `assets/` traz 90 padrões,
   incluindo `Origami/traditionalCrane.svg`, `Bases/birdBase.svg`,
   `Bases/boatBase.svg`, `Bases/frogBase.svg` e mais quatro bases clássicas.
2. **Não tem gate de auto-interseção.** Confirmado por busca em toda a base de
   código: `self-intersect`, `collision`, `contact`, `layer order` — zero
   resultados. O único `faceOrder` é `reverseFaceOrder`, que inverte winding.
   Quando ela dobra o grou, **o papel atravessa-se**, e no ecrã não se nota.

O gate de zero interseções é nosso, veio da §20 da especificação, e é ele — não
a física — que impede o grou. A troca é explícita: papel que se atravessa em
troca de formas reconhecíveis.

## O formato de entrada

```xml
<rect stroke="#000000" .../>                    fronteira (B)
<line stroke="#0000FF" x1 y1 x2 y2 .../>        vale (V)
<line stroke="#FF0000" .../>                    monte (M)
```

O grou são 84 `<line>` mais um `<rect>`. Ver `assets/doc/simplePatterns.svg` e
`assets/doc/triangulations.svg` no repositório dela para os casos de bordo, e
`js/pattern.js` para a implementação de referência.

## O trabalho, por ordem

1. **Parser SVG → segmentos com atribuição.** Ler `<line>`, `<rect>`, `<path>`
   com apenas `M`/`L`. Mapear cor do traço para `M`/`V`/`B`/`F`. Direto.

2. **Soldar vértices.** Ela usa `vertTol: 3` sobre uma folha de milhares de px —
   uma tolerância relativa à diagonal da folha, não absoluta. Sem isto os
   segmentos não se ligam e não há faces.

3. **Encontrar as faces da subdivisão planar.** É o miolo. Em cada vértice,
   ordenar as arestas incidentes por ângulo; percorrer sempre a próxima aresta no
   sentido horário para fechar cada face; descartar a face exterior. `pattern.js`
   tem isto.

4. **Ligar ao pipeline existente.** A saída é um `FoldSource` — o mesmo que
   `authoring.ts` já produz. Daí para a frente nada muda: valida, tria, simula,
   assa, compila.

5. **Passar o gate de interseção de erro a medição.** Deixa de bloquear e passa a
   ser um número no `provenance.json` e uma coluna no laboratório. **O relatório
   e o `NOTICE` afirmam hoje «nada se atravessa»; essa afirmação tem de sair no
   mesmo commit**, senão o sistema passa a mentir.

6. **Ângulos-alvo.** `foldUseAngles: true` no `globals.js` dela: quando o FOLD
   traz `edges_foldAngle`, usa-o; um SVG não traz, e ela dobra tudo a
   `creasePercent: 0.6` do plano-flat-folded. É a via mais simples e é a que
   produz o grou dela.

## O que continua verdade depois disto

A dobragem continua a ser física real, não desenho. O que muda é a fronteira do
que se aceita: um objeto pode fechar com camadas que se atravessam, como
acontece no simulador de referência. Um grou a atravessar-se é mais honesto do
que um portal que ninguém reconhece — mas só se estiver escrito que é isso que
acontece.
