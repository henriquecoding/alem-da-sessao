# Origami Runtime System — relatório

**Data:** 28 de julho de 2026
**Estado:** seis modelos a passar os gates, homepage a usá-los, sistema SVG
apagado. Não houve deploy.

---

## 1. O que mudou em relação à especificação recebida

A especificação foi escrita contra `main` em `bd827d7`. `main` está em `7b7359f`
e o commit `af2dfa2` já corrigiu parte da auditoria: `interval-studio.tsx` foi
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
  inspect.ts                    pnpm origami:inspect [--model <id>] [--angles]
  models/                       a descrição de cada modelo

apps/web/public/origami/<id>/
  source.fold                   a fonte. Legível, diffável, versionada.
  model.ors.json                o que o browser carrega. Derivado.
  provenance.json               autoria, licença, medições, aprovação

apps/web/components/origami/
  runtime/{asset,colour,program,renderer,shaders}.ts
  use-origami-timeline.ts
  origami-canvas.tsx            ilha de cliente
  origami-scene.tsx             fallback SVG + canvas, exatamente sobrepostos
  origami-stage.tsx             o palco onde a cena assenta
  asset-loader.ts               leitura server-only, memoizada
  types.ts                      reexportação de tipos; nenhuma geometria
  lab/runtime-panel.tsx         padrão de vincos · objeto · medições
```

---

## 3. Os seis modelos que passam

| Modelo            | Triâng. | Vincos | Etapas | Deformação | Interseções | Erro angular | Asset gzip |
| ----------------- | ------: | -----: | -----: | ---------: | ----------: | -----------: | ---------: |
| `sheet`           |       6 |      2 |      1 |    0,0000% |           0 |        0,00° |     1,6 kB |
| `half-fold`       |       4 |      1 |      1 |    0,0000% |           0 |        0,00° |     1,5 kB |
| `envelope`        |       6 |      4 |      1 |    0,0000% |           0 |        0,00° |     2,3 kB |
| `gate`            |       6 |      2 |      1 |    0,0000% |           0 |        0,00° |     2,0 kB |
| `box`             |      18 |     16 |      3 |    0,0010% |           0 |        1,72° |     7,5 kB |
| `suspended-sheet` |      10 |      4 |      1 |    0,0000% |           0 |        0,00° |     2,3 kB |

O orçamento é 28 kB comprimido por modelo. O maior usa 27% dele.

A caixa é o que prova o sistema: base quadrada, quatro paredes, quatro abas de
canto deitadas contra a parede seguinte. Tem camadas sobrepostas — exatamente o
que o gate anterior tornava impossível — e sai de uma folha quadrada íntegra
cujo padrão de vincos se pode ler no laboratório, ao lado do objeto.

`envelope` e `gate` entraram no lugar de `boat` e `crane`, e a §5 explica
porquê. Os dois são bases clássicas — _blintz_ e dobra de portas — o que quer
dizer que existem enquanto dobra antes de existirem aqui: quatro cantos ao
centro num caso, dois batentes ao eixo no outro. Nenhum dos dois precisa de
reordenar camadas, que é a fronteira deste motor.

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

**`boat` e `crane` saíram do produto. `envelope` e `gate` ocuparam o lugar.**

Esta é a decisão pedida na §7 da versão anterior deste relatório, tomada: a
família editorial passou a ser a dos modelos que dobram de facto. A cópia PT-PT
e PT-BR diz agora «Envelope» e «Portal», e `origami-system.test.ts` fixa a
ausência dos dois antigos para que ninguém os reponha sem primeiro mexer na
fronteira do solver descrita abaixo.

O que se segue é o registo do que os reprovou.

O barco foi autorado e dobra: quilha em três troços, quatro diagonais, dois
vértices de grau quatro. Fecha com 0,0014% de deformação, 3,47° do alvo e zero
interseções — todos os números passam. O que falha é o único critério que
nenhum número mede: **em silhueta lê-se como uma tina.** O casco é raso e as
pontas não sobem acima do bordo, que é exatamente o que faz um barco ser um
barco. Fica em `tools/origami/models/boat.ts`, fora do registo, com o que
aprendi pelo caminho:

- Um vértice de grau quatro é o mais pequeno que sai do plano — com três vincos
  a folha é rígida.
- Dois vincos colineares nesse vértice degeneram-no: a folha dobra como um
  livro e as diagonais nunca entram. A quilha tem de quebrar.
- Um vértice de grau quatro só dobra com **três vincos de um tipo e um do
  outro**. Com dois e dois fica preso no plano.
- Os quatro ângulos não são independentes: há um grau de liberdade. Pedir-lhes
  valores arbitrários é pedir uma configuração que não existe, e o
  `origami:inspect --angles` existe para dizer quais é que a folha aceita.

O que falta é proporção, não estrutura: a quilha precisa de dobrar mais fundo
do que estas diagonais permitem, o que provavelmente exige um segundo par de
vincos a meio do costado para o bordo subir sem levar o fundo atrás.

**O grou não foi autorado, e as referências mostraram porquê.**

O `origami-canoe` e o `origami-hummingbird` do `origamiok.com` começam os dois
no mesmo sítio: dois diagonais, dois eixos medianos, e um colapso em que os
quatro cantos se juntam num ponto — a **base preliminar**. É a peça comum a
quase todo o origami tradicional, e valia a pena saber se este motor a
conseguia antes de tentar qualquer modelo em cima dela.

**Consegue.** Está fixado em `tests/origami-pipeline.test.ts`: a base colapsa
com 0,013% de deformação, 2° do alvo e zero interseções.

O que se segue é que não passa. Depois da base, os dois modelos usam _squash
folds_ e _petal folds_ — operações que **reordenam camadas**, fazendo o papel
deslizar sobre si próprio. Este solver dobra uma malha triangulada fixa por
dobradiças: sabe levar um ângulo diedro de A a B, e não tem modelo de camadas
nem de contacto. Um squash fold não é um conjunto de ângulos-alvo; é uma
mudança de que camada está por cima de qual.

Essa é a fronteira real do motor, e é estrutural e não de afinação. Atravessá-la
exige ordenação de faces (`faceOrders`, que o formato FOLD já prevê e que este
compilador ainda ignora) e deteção de contacto no solver.

**Consequência para o produto, e a escolha que se seguiu.** Havia duas saídas:
manter figuras desenhadas à mão para os dois nomes que o motor não serve, ou
mudar os nomes. Manter as figuras significava que dois dos seis objetos da
homepage seriam desenhos a fingir de dobras — a §20 da especificação chama a
isso rejeição imediata, e teria mantido vivo um segundo sistema de renderização
inteiro só para os sustentar. Mudaram-se os nomes.

A troca aproximou a forma da decisão em vez de a afastar. «Levar adiante» é,
nesta plataforma, uma nota que chega à sessão seguinte porque alguém a
partilhou: isso é uma carta fechada, não um barco. «Atravessar» é passar para o
outro lado: isso é uma passagem, não uma ave.

**O sistema SVG desenhado à mão foi apagado.** `origami-figure.tsx`, os sete
ficheiros de `components/origami/models/`, as folhas de prova do laboratório e
as regras CSS das figuras já não existem. Não foram substituídos por
equivalentes: o tom de cada face deixou de ser um valor escolhido à mão e passou
a sair da normal da face no fragment shader. O SVG que ainda chega no HTML é
outra coisa — é o frame final da mesma simulação, gerado pelo compilador, e
serve quem não tem WebGL2.

**Não há capturas automatizadas.** O contact sheet e os testes visuais com
Playwright não foram feitos. O painel do laboratório mostra padrão de vincos,
objeto e medições lado a lado, e o `origami:inspect` imprime a silhueta no
terminal — foi assim que o barco foi reprovado e assim que o envelope e o
portal foram aceites.

**O teste de reconhecimento humano não foi feito** para os seis que passam. É
humano por definição, e os campos `approval` em `provenance.json` estão todos a
`false`.

**Espessura de papel e sombra projetada não estão implementadas.** A cena usa
`depth buffer` e material de frente/avesso.

**O renderizador não tem teste de GPU.** `jsdom` não tem WebGL2. O que está
testado é o que decide quando desenhar e com que cor.

## 6. Como se verifica

```bash
pnpm origami:compile              # autora, valida, simula, compila
pnpm check:origami-runtime        # assets vs fonte, limites, fronteira
pnpm check                        # tudo, incluindo o acima
pnpm dev                          # /dev/origami-lab, secção 0
```

`pnpm check` e `pnpm build` passam.

---

## 7. O que fica por decidir

A decisão de família editorial foi tomada — §5. O que resta é humano e não se
resolve com um gate:

1. **Os seis são reconhecíveis?** Em silhueta, a 96 px, sem legenda. Ver
   `/dev/origami-lab`, secção **1 · Do padrão de vincos ao objeto**, que põe o
   padrão de vincos, o objeto e as medições lado a lado. Se algum não for, o
   problema é de proporção — são números no ficheiro do modelo em
   `tools/origami/models/` — e não do sistema.
2. **Os `approval` continuam a `false`** em todos os `provenance.json`, e é
   assim que devem ficar até alguém olhar. O campo existe para registar um juízo
   humano; pô-lo a `true` por um script seria transformá-lo em ruído.
