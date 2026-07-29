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

Essa é a fronteira real do motor para uma dobragem **fisicamente válida**, e é
estrutural e não de afinação: atravessá-la exige ordenação de faces
(`faceOrders`, que o formato FOLD já prevê e que este compilador ainda ignora) e
deteção de contacto no solver.

Para uma **forma reconhecível** o preço é outro, e mais barato — a §8.1 mostra,
com o paper do próprio OrigamiSimulator, que ele dobra o grou sem modelo de
camadas e sem deteção de colisão, deixando o papel esticar e atravessar-se. O
que bloqueia o grou aqui não é a falta de `faceOrders`: é a rigidez.

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

**Padrões de vincos já podem entrar por SVG — e a fronteira do grou mudou de
sítio, mas não desapareceu.**

`pnpm origami:import` lê um padrão pela convenção de cor do traço e produz os
mesmos três ficheiros que `origami:compile`. O trabalho a sério não é o parser:
é encontrar as faces da subdivisão planar a partir de linhas soltas — soldar
vértices com tolerância relativa, partir cada segmento em cruzamentos e junções
em T, e percorrer meias-arestas ordenadas por ângulo. Está em
`packages/origami-core/src/planar.ts`, com a conta que o protege: a soma das
áreas das faces tem de igualar a área do contorno, que é o único invariante que
apanha um cruzamento por partir.

O que isto **não** resolve é o que a §5 já dizia. O importador entrega a
geometria; continua a não haver modelo de camadas nem deteção de contacto. Um
padrão tradicional levado ao fim atravessa-se, e é por isso que
`bakeModel` ganhou `selfIntersection: "measure"` — ver a ADR 0034. A troca é
explícita: forma reconhecível em troca de papel que se atravessa, com a
contagem gravada na proveniência.

Duas coisas ficaram fixadas em teste por causa disto, e são as duas que
custaram a encontrar:

- **A convenção de sinal é do modelo inteiro ou não é de nenhum.** O ângulo
  diedro só é positivo para um vale se `apexA` estiver à esquerda da aresta
  dirigida `p1→p2`, e isso depende do sentido em que a aresta é declarada e da
  ordem das faces, em conjunto. Com metade dos vincos na convenção invertida
  nada falha — a folha é íntegra, a topologia está correta — e o modelo
  simplesmente assenta longe do alvo. A base preliminar importada parava a 121°.
- **O importador não corrige o que lê.** Um padrão 4/4 no vértice central viola
  o teorema de Maekawa (num vértice interior que dobra plano, montes menos vales
  é ±2) e não fecha. O importador entrega-o na mesma, e é o bake que responde
  com números em vez de uma forma inventada. Com 5/3, o mesmo caminho reproduz a
  base preliminar que `origami-pipeline.test.ts` constrói à mão: 2° do alvo,
  zero interseções.

## 6. Como se verifica

```bash
pnpm origami:compile              # autora, valida, simula, compila
pnpm origami:import --svg <ficheiro> --id <modelo> \
  --attribution <quem> --license <licença>
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

---

## 8. O que os papers confirmam, e onde é que eles põem a fronteira

Lidos depois de o sistema estar construído, o que é a ordem errada mas dá uma
verificação honesta: dizem eles o mesmo que este motor faz?

**Schenk & Guest, «Origami Folding: A Structural Engineering Approach» (5OSME),
§3.2.** Modelam a folha como um pórtico de barras articuladas: cada vértice é
uma rótula, cada vinco uma barra, e as faces são trianguladas. E avisam do
defeito que a triangulação introduz: _«the triangulated facets can easily bend,
which is reflected by an equivalent number of trivial internal mechanisms»_. A
diagonal que se acrescenta para triangular um quadrilátero é uma dobradiça livre
— a face deixa de ser rígida. A correção deles é acrescentar uma restrição de
ângulo diedro sobre essa diagonal.

Este motor faz isso: `topology.ts` regista cada diagonal como aresta `F` com
alvo 0°, e `solver.ts` dá-lhe `facetStiffness: 18` contra `creaseStiffness: 6`
dos vincos verdadeiros. A medição que o confirma já estava a ser feita e a
passar despercebida: **planaridade 0,00° nos seis modelos**. As faces não
dobram.

Uma diferença deliberada: o paper formula a restrição sobre `sin(θ)`, e o
Jacobiano fica com um fator `1/cos(θ)` que explode a ±90°. Metade dos vincos
destes modelos vive perto de 90°. Aqui o ângulo vem de `atan2` com gradientes
exatos, que não tem essa singularidade — ver `dihedralAngleAndGradients` em
`geometry.ts`, verificado por diferenças finitas.

**Tachi, «Freeform Variations of Origami» (2010), §4.** O sistema é
sub-restringido: `nc < 3·nvert`, portanto há um espaço de soluções e não uma
configuração. Ele move-se dentro dele projetando no núcleo do Jacobiano,
`dx = (I − J⁺J)dx₀`.

É a formulação exata do que aqui se aprendeu por tentativa a autorar o barco, e
que está escrito na §5 em linguagem de oficina: os quatro ângulos de um vértice
de grau quatro **não são independentes** — há um grau de liberdade, e pedir-lhes
valores arbitrários é pedir uma configuração que não existe. O `origami:inspect
--angles` existe para dizer quais é que a folha aceita; é uma sonda ao mesmo
espaço de soluções, feita por amostragem em vez de por pseudo-inversa.

**O que isto quer dizer sobre o grou.** Nenhum destes **dois** papers atravessa
a fronteira da §5. Ambos modelam folha sem espessura e sem contacto: Tachi
enumera as condições de validade e diz explicitamente que uma delas é _«that a
valid overlapping ordering exists»_ — a ordenação de camadas — e trata-a como
condição a verificar, não como coisa que o solver resolve. Um _squash fold_ é
uma mudança dessa ordenação.

### 8.1 O terceiro paper diz o contrário, e é o que este motor copiou

Ghassaei, Demaine e Gershenfeld, _Fast, Interactive Origami Simulation using
GPU Computation_ (Origami⁷, 2018) — o paper do OrigamiSimulator, que o
`NOTICE.md` já citava mas que não tinha sido lido contra esta questão. A
Figura 11 responde-lhe diretamente, e a resposta contraria o que a §5 e a ADR
0034 afirmavam:

> **(C)** _The compliance of our method allows non-rigidly foldable designs like
> the crane to ﬁnd their ﬁnal folded state (allowing for some self-intersection)._
>
> **(D)** _Even with collision detection and planar constraints (inﬁnitely stiff
> facet creases) turned off, Freeform Origami is not able to correctly fold a
> crane._
>
> **(E)** _Similarly, increasing the material stiffness in our solver prevents
> the crane from reaching the correct folded state._

E, em «Future Work»: _«Future work may also grow to include collision
detection»_ — ou seja, **o OrigamiSimulator não tem deteção de colisão nenhuma,
e não tem modelo de camadas.** Mesmo assim dobra o grou.

O que isto corrige: a §5 dizia que atravessar a fronteira _«exige `faceOrders` e
deteção de contacto»_. Para uma dobragem **fisicamente válida**, exige. Para uma
**forma reconhecível**, que é o que o produto quer, não exige nada disso — exige
o contrário. O grou aparece porque o papel é deixado esticar um pouco e
atravessar-se; e desaparece assim que se aperta o material (11E) ou se impõe
rigidez exata (11D).

**A consequência incómoda: o que este motor tem de melhor é o que bloqueia o
grou.** A ADR 0034 apresenta o limite de deformação de 0,25% como uma virtude,
e diz que é _«mais apertado do que o OrigamiSimulator alcança»_. As duas coisas
são verdade e a segunda explica a primeira ao contrário do que parecia: a
projeção de comprimento que põe o strain a 0,001% é exatamente o regime rígido
da Figura 11E, onde o grou não fecha.

Medido neste motor, com um hipar — quadrados concêntricos alternados mais as
duas diagonais, o padrão que a Figura 7 do paper usa precisamente para mostrar
strain: com os parâmetros do paper (`EA = 20`, `kfold = kfacet = 0,7`, `ζ = 0,45`,
sem projeção de comprimento) o modelo assenta com **16,7%** de deformação. O
gate deste repositório rejeita acima de 0,25% — cerca de setenta vezes menos.
Nenhuma das duas execuções chegou ao alvo, portanto isto **não** é uma
demonstração de que o hipar dobra aqui; é a medição da distância entre os dois
regimes, e ela é de duas ordens de grandeza.

Falta, portanto, uma terceira coisa além das duas que já foram feitas
(atribuições vindas de um padrão real, e interseção medida em vez de
bloqueante): **um modo complacente** — projeção de comprimento desligada,
rigidez de vinco na ordem do `kfold` do paper, e o limite de deformação a
_medir_ em vez de reprovar. As três juntas são a receita publicada. Nenhuma
delas é `faceOrders`.

### 8.2 O grou tradicional, tentado a sério

A pergunta deixou de ser teórica quando o padrão apareceu: o
`assets/Origami/traditionalCrane.svg` do OrigamiSimulator — 84 `<line>` e um
`<rect>`, exportado do Illustrator, MIT. É o padrão real, não uma reconstrução.

**O importador lê-o por inteiro.** 88 segmentos → 60 vértices, 149 vincos, 76
faces, com o erro de área do arranjo a dar exatamente zero. A geometria do
ficheiro atravessa o pipeline. Isso já não é a parte difícil.

Três gates de autoria reprovaram-no pelo caminho, e cada um ensinou uma coisa
diferente:

1. **Tolerância de soldadura.** A de omissão (1e-4) é apertada de mais para um
   ficheiro de desenho. Medido neste padrão: depois de colapsar o
   arredondamento, os vértices distintos ficam todos a 4,5e-4 ou menos uns dos
   outros por ruído de traçado, e o primeiro espaçamento real está a 3,05e-2 —
   um salto de 68×. Qualquer tolerância nessa banda separa os dois regimes;
   `--weld 3e-3` fica dez vezes acima do ruído e dez vezes abaixo da geometria.
2. **`SHEET_NOT_SQUARE`, e era um defeito nosso.** A folha media 1,0000 ×
   1,0002 porque um vinco a acabar um décimo de pixel fora do bordo entrava na
   tolerância e partia o contorno **sem** ser posto sobre ele. Decidir que um
   ponto está no bordo obriga a pô-lo lá; corrigido em `planar.ts`.
3. **`DEGENERATE_TRIANGLE`.** O padrão tem faces cuja triangulação desce a
   0,013 — abaixo do piso de 0,05, que foi escolhido para modelos escritos à
   mão. É o caso que o paper descreve como _«high-aspect-ratio triangles»_ e
   que não recusa.

**E depois não dobra.** Com tudo isso ultrapassado, nenhum dos quatro regimes
testados chega ao grou:

| regime                           | strain | erro de ângulo | interseções |
| -------------------------------- | -----: | -------------: | ----------: |
| paper (sem projeção, vinco mole) |  34,6% |          85,4° |         164 |
| projeção 8, vinco mole           |  0,71% |         178,0° |         130 |
| projeção 30, vinco mole          |  0,16% |         178,8° |          62 |
| rígido (defaults do repositório) |  0,71% |         179,3° |         135 |

Ou a folha estica um terço do seu tamanho, ou os vincos ficam praticamente por
dobrar. Não há regime intermédio que dê a forma.

**O que falta está identificado, e não é `faceOrders`.** É a §2.4 do paper da
Ghassaei: **restrições de face** — molas sobre os ângulos interiores de cada
triângulo, com `kface`. Este motor nunca as implementou; substituiu-as por
projeção de comprimento, que é outra coisa (fixa comprimentos de aresta, não
ângulos internos). O paper diz para que servem em termos que descrevem
exatamente o que aqui se mediu: _«face constraints increase the stability of
the simulation across a variety of input crease patterns»_, e em particular
para triângulos de razão de aspeto alta — que é do que o grou é feito. Sem
elas, a malha corta em vez de dobrar, e 34% de deformação é o corte a
acontecer.

`kface = 0,2` aparece em todas as configurações que o paper reporta.

### 8.3 As restrições de face foram implementadas. O grou continua a não fechar.

`cornerAngleAndGradients` está em `geometry.ts`, com o gradiente verificado por
diferenças finitas como o do ângulo diedro, e `faceAngleStiffness` no solver.
Fica a **zero por omissão**: os seis modelos autorados recompilam byte a byte
iguais, o que é a prova de que nada do que já estava aprovado se mexeu.

E funcionam. Medido no grou, variando só `kface`:

| `kface` | projeção | strain | erro de ângulo | interseções |
| ------: | -------: | -----: | -------------: | ----------: |
|       0 |        0 | 34,73% |          85,4° |         164 |
|     0,2 |        0 | 19,92% |          87,5° |         137 |
|       1 |        0 | 16,86% |          88,4° |         209 |
|       5 |        0 | 14,55% |          94,2° |         233 |
|     0,2 |        8 |  0,81% |         178,9° |         150 |
|     0,2 |       30 |  0,15% |         178,2° |          77 |

A deformação cai para metade e continua a cair com a rigidez — a restrição faz
exatamente o que o paper diz que faz, e o modo de corte era mesmo o que estava
a consumir a folha. **Mas o erro de ângulo não se mexe:** fica entre 85° e 94°
em todo o intervalo útil, e com projeção de comprimento os vincos ficam
praticamente por dobrar.

Ou seja: a restrição de face era **necessária e não é suficiente**. A hipótese
da §8.1 — que faltava só complacência — está testada e é falsa; a da §8.2 —
que faltavam as restrições de face — está implementada e também não chega. A
fronteira é mais funda do que qualquer das duas, e o que a define já não é
nenhuma peça em falta identificada neste relatório.

O que sobra por investigar, por ordem de suspeita: o percurso de dobragem (a
rampa linear por etapas pode não ser o caminho que este padrão admite), o
orçamento de passos, e o modelo de massa e amortecimento, que aqui é escolhido
para estabilidade com passo único e não é o do paper. Nenhuma destas é uma
peça em falta — são afinações de um sistema que já tem todas as peças
descritas.

Os papers validam a fundação. Dois deles confirmam onde ela acaba; o terceiro
diz por onde se passa, e o preço.
