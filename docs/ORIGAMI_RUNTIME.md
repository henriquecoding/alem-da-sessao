# Origami Runtime System — relatório

**Data:** 28 de julho de 2026
**Estado:** laboratório construído, quatro modelos a passar os gates, homepage
inalterada. Não houve deploy.

---

## 1. O que mudou em relação à especificação recebida

A especificação foi escrita contra `main` em `bd827d7`. `main` está em `7b7359f`
e o commit `af2dfa2` já corrigiu parte do diagnóstico: `interval-studio.tsx` foi
apagado, o teste que contava polígonos desapareceu, os modelos passaram a
partilhar uma tabela de vértices, o `stroke` por face saiu, existe uma máquina
de estados explícita e o `/dev/origami-lab` já lá está.

O que **não** foi corrigido, e é o núcleo desta entrega:

- A geometria continua desenhada na posição final. `boat.ts` declara
  `mastTop: [144, 10]` — a ponta do mastro escrita à mão. Não existe folha
  nenhuma antes disso.
- Não há `edges_assignment`, não há ângulo de dobra, não há 3D, não há oclusão.
  O tom de cada face é escolhido à mão (`lit`, `base`, `shade`, `inner`), que é
  literalmente o item de rejeição imediata §20 da especificação.
- A «dobra» é uma transição CSS de `transform` e `opacity`.
- E o mais consequente: **o gate `check:origami` torna o origami impossível.**
  Exige `área das faces == área da silhueta`. Papel dobrado tem camadas; a soma
  das áreas é sempre maior. Aquele invariante é correto para desenhos planos e
  proíbe qualquer modelo verdadeiramente dobrado.

Duas divergências deliberadas em relação ao texto da especificação:

| Especificação            | Aqui              | Porquê                                                                                                                                   |
| ------------------------ | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| modelo `masu`            | `box`             | o identificador atravessa a máquina de estados e a cópia PT-PT/PT-BR; renomeá-lo era uma migração de texto disfarçada de decisão técnica |
| papéis `coral`/`mineral` | `apricot`/`lilac` | são os nomes que os tokens já têm em `tokens/paper.ts` e que o `check:contrast` mede                                                     |
| ADR-020                  | ADR-034           | 0020 já está ocupado                                                                                                                     |

---

## 2. O que foi construído

```text
packages/origami-core/          autoria — nunca chega ao browser
  fold-types.ts                 FOLD 1.2 restringido a B, M, V, F, J
  geometry.ts                   ângulo diedro, gradientes, interseção
  topology.ts                   triangulação por corte de orelhas, vincos
  validate.ts                   19 invariantes, cada um com código próprio
  metrics.ts                    strain, planaridade, auto-interseção
  solver.ts                     bar-and-hinge + projeção de comprimento
  bake.ts                       etapas, rampa, captura, ancoragem
  authoring.ts                  deriva ângulos a partir da forma dobrada
  compile.ts                    divisão por face, câmara, fallback SVG
  quantize.ts                   Int16 posições, Int8 normais

tools/origami/                  CLI de autoria
  compile.ts                    pnpm origami:compile [--model <id>]
  models/                       a descrição de cada modelo

apps/web/public/origami/<id>/
  source.fold                   a fonte. Legível, diffável, versionada.
  model.ors.json                o que o browser carrega. Derivado.
  provenance.json               autoria, licença, medições, aprovação

apps/web/components/origami/
  runtime/{asset,colour,program,renderer,shaders}.ts
  use-origami-timeline.ts
  origami-canvas.tsx            ilha de cliente
  origami-stage.tsx             servidor: fallback + canvas
  asset-loader.ts               leitura server-only, memoizada
  lab/runtime-panel.tsx         padrão de vincos · objeto · medições
```

---

## 3. Os quatro modelos que passam

| Modelo            | Triâng. | Vincos | Etapas | Deformação | Interseções | Erro angular | Asset gzip |
| ----------------- | ------: | -----: | -----: | ---------: | ----------: | -----------: | ---------: |
| `sheet`           |       6 |      2 |      1 |    0,0000% |           0 |        0,00° |     1,6 kB |
| `half-fold`       |       4 |      1 |      1 |    0,0000% |           0 |        0,00° |     1,5 kB |
| `box`             |      18 |     16 |      3 |    0,0010% |           0 |        1,72° |     7,5 kB |
| `suspended-sheet` |      10 |      4 |      1 |    0,0000% |           0 |        0,00° |     2,3 kB |

O orçamento é 28 kB comprimido por modelo. O maior usa 27% dele.

A caixa é o que prova o sistema: base quadrada, quatro paredes, quatro abas de
canto deitadas contra a parede seguinte. Tem camadas sobrepostas — exatamente o
que o gate anterior tornava impossível — e sai de uma folha quadrada íntegra
cujo padrão de vincos se pode ler no laboratório, ao lado do objeto.

---

## 4. Os quatro defeitos reais encontrados durante a construção

Ficam registados porque cada um deles produzia uma imagem plausível e errada.

**O momento de vinco não embrulhava.** Um alvo de `+178°` e um estado atual de
`−179°` estão a 3° um do outro, mas a subtração ingénua dá `357°` — um momento
enorme na direção errada. O modelo entrava numa rotação que nunca assentava. Os
três primeiros baques da caixa vinham daqui.

**A rampa linear de ângulos não é isométrica.** «Metade de cada ângulo» é uma
combinação que a folha não assume sem esticar. Com molas axiais só, a caixa
chegava a 9% de deformação — trinta e seis vezes o limite. A correção não foi
subir a rigidez (que multiplicaria o custo do bake por dezenas sem chegar a
zero): foi tratar a inextensibilidade como restrição de posição. 9% → 0,001%.

**O caminho longo passava por uma sela.** Interpolar o alvo de `−45°` para
`+178°` atravessa `0°`, onde a aba fica coplanar com a parede e deixa de ter
lado preferido. Três cantos da caixa escapavam por assimetrias numéricas
minúsculas; o quarto ficava preso a 5°, sempre o mesmo. Interpolar pelo caminho
curto — que é o que dobrar papel faz — resolve-o. Ninguém desdobra uma aba até
ao plano para a voltar a dobrar do outro lado.

**O teste de auto-interseção dava falsos positivos onde o modelo estava certo.**
Duas causas: distâncias ao plano escaladas pela área do triângulo (numa folha
quase plana nunca caíam dentro da tolerância de coplanaridade), e tratar um
toque num vértice como travessia. As quatro «interseções» da caixa eram as
quatro arestas verticais onde as paredes se encontram — ou seja, precisamente a
prova de que a caixa tinha fechado.

Há ainda um defeito menor mas revelador: `finalAngleError` foi renomeado no
solver e o compilador continuou a ler o nome antigo. O campo saía `undefined` e
`JSON.stringify` apagava-o em silêncio. **Todos os assets foram gravados sem
essa medição e nada falhou.** Foi o painel do laboratório que o mostrou.

---

## 5. O que não está feito

**`boat` e `crane` não existem.** Não estão no registo e não têm asset. Ambos
são modelos sequenciais tradicionais — o barco de papel dobra-se ao meio, abre,
volta a dobrar; o grou passa pela base de pássaro com camadas a deslizarem umas
sobre as outras. O sistema de etapas construído aqui é a peça que os torna
exprimíveis, mas cada um precisa da sua sequência autorada e verificada, e o
grou provavelmente precisa também de tratamento de contacto que este solver não
tem. A especificação manda fazer um de cada vez com gate individual (§Fase 5), e
é o que está a acontecer.

A homepage continua a usar as figuras SVG anteriores, incluindo o barco e o
grou. Não há regressão: o sistema novo vive ao lado, no laboratório.

**Não há capturas automatizadas.** O contact sheet e os testes visuais com
Playwright não foram feitos. O painel do laboratório mostra padrão de vincos,
objeto e medições lado a lado, que é o que permite a revisão humana; a
automatização das capturas fica por fazer.

**O teste de reconhecimento não foi feito.** É humano por definição — três
pessoas a nomear a forma em silhueta em dois segundos — e nenhuma assertion o
substitui. Os campos `approval` em `provenance.json` estão todos a `false`, e é
verificado por teste que assim seja.

**Espessura de papel e sombra projetada não estão implementadas.** A cena usa
`depth buffer` e material de frente/avesso; camadas exatamente coincidentes
podem produzir z-fighting em ângulos rasantes. Não aconteceu nos quatro modelos
atuais.

**O renderizador não tem teste de GPU.** `jsdom` não tem WebGL2, e fingi-lo com
um duplo não provaria nada sobre desenhar. O que está testado é o que decide
quando desenhar (linha de tempo) e com que cor (conversão sRGB→linear).

---

## 6. Como se verifica

```bash
pnpm origami:compile              # autora, valida, simula, compila
pnpm check:origami-runtime        # assets vs fonte, limites, fronteira
pnpm check                        # tudo, incluindo o acima
pnpm dev                          # /dev/origami-lab, secção 0
```

`pnpm check` e `pnpm build` passam. O bundle de `/[locale]` mantém-se em 14 kB
gzip: o runtime não entra na homepage porque a homepage ainda não o usa.

---

## 7. Decisão pedida

Ver `/dev/origami-lab`, secção **0 · Geometria real**, e responder a duas
perguntas:

1. **A caixa é reconhecível?** Em silhueta, a 96 px, sem legenda. Se não for, o
   problema é de proporção — meia-base e altura são dois números em
   `tools/origami/models/box.ts` — e não do sistema.
2. **`boat` e `crane` valem o investimento**, ou a família editorial deve passar
   a ser dos modelos que dobram de facto? A especificação diz para não manter
   uma peça inferior só para preservar simetria editorial; a decisão sobre o que
   a homepage nomeia é de produto, não de engenharia.

Nada na homepage muda antes dessas respostas.
