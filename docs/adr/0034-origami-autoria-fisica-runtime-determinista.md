# ADR-034 — Origami: a física fica na autoria, o browser recebe frames aprovados

**Estado:** aceite e em uso. A homepage carrega os assets compilados; o sistema
SVG desenhado à mão foi apagado.

## O defeito que sobrevive à correção anterior

O commit `af2dfa2` corrigiu uma coisa verdadeira: os modelos deixaram de ser
polígonos independentes e passaram a partilhar uma tabela de vértices, com um
invariante que recusa fendas e sobreposições. Foi um ganho real e continua a
valer.

Mas continua a ser um desenho. O barco declara `mastTop: [144, 10]` — a posição
final da ponta do mastro, escrita à mão. Não existe folha nenhuma antes dele.
Não há um vinco, não há um ângulo, não há nada que ligue aquela ponta a um
quadrado de papel. A malha é consistente consigo própria e não é consequência de
coisa nenhuma.

Há um segundo problema, e é mais grave porque é ativo: o gate atual exige que
**a soma das áreas das faces iguale a área da silhueta**. Para um desenho plano
isso é correto e apanha sobreposições por descuido. Para papel dobrado é o
contrário de um invariante — um origami tem camadas, a silhueta é a projeção de
várias folhas empilhadas, e a soma das áreas é necessariamente maior. Aquele
gate não está apertado de mais: **ele torna impossível representar um modelo
dobrado**. Qualquer tentativa de fazer origami a sério falharia o CI.

## A decisão

Separar em dois mundos, com uma fronteira verificada por build:

|              | Autoria (`packages/origami-core`)   | Runtime (`components/origami/runtime`) |
| ------------ | ----------------------------------- | -------------------------------------- |
| Entrada      | `source.fold` (FOLD 1.2)            | `model.ors.json`                       |
| O que faz    | valida, tria, simula, assa, compila | descodifica e interpola                |
| Quando corre | quando alguém autora um modelo      | quando a cena está no ecrã             |
| Pode falhar  | sim, e deve                         | não                                    |

O modelo nasce de uma folha quadrada com montes e vales. Um solver bar-and-hinge
— barras que resistem a esticar, dobradiças que resistem a abrir — leva-a do
plano ao objeto. Os frames que saem daí são medidos, quantizados e gravados. O
browser recebe uma tabela de inteiros e uma lista de triângulos, e a única coisa
que faz é misturar dois keyframes num shader.

## Porque é que o solver não vai para a homepage

Não é conservadorismo. É que um solver explícito é sensível a rigidez e a passo,
e a mesma cena convergiria de forma diferente em máquinas diferentes. Uma
homepage precisa de uma forma aprovada, não de um resultado emergente — e uma
forma visualmente errada pode ser fisicamente plausível. Também há custo
permanente: física a correr é trabalho a acontecer numa página onde nada se
move.

O que se ganha em troca é grande: a dobragem é verdadeira **e** o
comportamento é idêntico em todo o lado.

## Os invariantes que substituem a igualdade de áreas

| O que se conserva        | Como se mede                                   |
| ------------------------ | ---------------------------------------------- |
| a folha é uma só         | cada aresta tem 1 face (`B`) ou 2              |
| a folha não foi cortada  | zero `C`, fronteira em circuito fechado        |
| a matéria não estica     | comprimento de cada aresta, em todos os frames |
| a topologia não muda     | todos os frames indexam a mesma tabela         |
| monte e vale têm sentido | sinal do ângulo confere com a atribuição       |
| nada se atravessa        | interseção triângulo-triângulo no frame final  |

O limite de deformação é 0,25%. Vale a pena dizer que é **mais apertado do que
o OrigamiSimulator alcança**: aquele projeto mostra uma visualização de strain
precisamente porque o strain é grande e interessa vê-lo. Aqui não serve, porque
o que sai é o resultado final e não uma exploração.

## Três decisões que não são óbvias

**A inextensibilidade é uma restrição, não uma mola.** Escalar os ângulos-alvo
por um progresso comum não descreve um caminho isométrico: a meio da rampa,
«metade de cada ângulo» é uma combinação que a folha não assume sem esticar. Num
modelo só de molas, quem paga é o comprimento das arestas — mediram-se 9% de
deformação na caixa. Repor cada aresta no seu comprimento por projeção depois de
cada passo baixou isso para 0,001% e tornou o bake vinte vezes mais rápido, por
não ser preciso subir a rigidez axial.

**As etapas são parte do modelo.** Dobrar papel raramente é levar todos os
vincos ao destino ao mesmo tempo. A aba do canto da caixa tem de existir antes
de se poder deitar; pedir-lhe as duas coisas em simultâneo é pedir direções
contraditórias, e o solver assenta num compromisso onde nada acontece. As etapas
vivem em `file_frames`, que é exatamente para o que a especificação FOLD as tem.

**O autor descreve a forma, a ferramenta deriva os ângulos.** Escrever
`edges_foldAngle` à mão é praticável para uma dobra e não para dezasseis — e um
ângulo errado por 4° não falha nenhum invariante, só fecha o modelo torto.
`assertIsometric` impede que essa conveniência se torne uma nova mentira: se a
configuração descrita esticar o papel, ela não é uma dobragem.

## O que fica de fora do browser

`check:origami-runtime` recusa, nos ficheiros do runtime, qualquer import de
valor de `@alem-da-sessao/origami-core`, de Three.js ou de bibliotecas de
animação. `import type` passa: com `verbatimModuleSyntax`, um import de tipo não
sobrevive à compilação, e é o que mantém compilador e runtime a falar do mesmo
formato sem custo.

Three.js resolveria este problema — e traria um runtime maior do que a
experiência inteira. Se um dia forem precisas sombras a sério ou vários
materiais, a resposta certa é `three` por `dynamic import` só no hero, e não
fazer crescer o renderizador próprio até ser um motor.

## A consequência que se seguiu: a família editorial mudou

Esta ADR foi escrita a dizer que não decidia se a homepage mudava, e que `boat`
e `crane` não estavam no registo por ainda não terem padrão de vincos que
fechasse. Metade disso revelou-se otimismo.

O barco fecha — 0,0014% de deformação, 3,47° do alvo, zero interseções — e
mesmo assim não passa, porque em silhueta lê-se como uma tina. O grou nem
chega lá: depois da base preliminar (que este solver colapsa bem, e está fixado
em teste) o modelo precisa de _squash_ e _petal folds_, que **reordenam
camadas**. Um solver que dobra uma malha triangulada fixa por dobradiças não
tem modelo de camadas nem de contacto. Isso não é afinação — é a fronteira do
motor, e atravessá-la exige `faceOrders` e deteção de contacto.

Portanto a escolha real nunca foi «quando é que ficam prontos». Era: manter dois
desenhos a fingir de dobras, ou mudar o que a homepage nomeia. Manter os
desenhos obrigava a sustentar um segundo sistema de renderização inteiro para
dois dos seis objetos, e a §20 da especificação chama a isso rejeição imediata.

`envelope` (base _blintz_) e `gate` (dobra de portas) entraram no lugar. Ambos
fecham a 0,0000% de deformação e nenhum precisa de reordenar camadas.
`origami-system.test.ts` fixa a ausência de `boat` e `crane` para que a
reposição de qualquer um deles tenha de começar por mover essa fronteira. O
`boat.ts` fica em `tools/origami/models/`, fora do registo, porque o que se
aprendeu a autorá-lo — sobre vértices de grau quatro e o seu único grau de
liberdade — é mais útil escrito do que apagado.
