# A Folha Entre Sessões — relatório do laboratório

**Estado:** laboratório concluído, direção escolhida e integrada.
**Direção em produção:** Ateliê de luz (`stage="atelier"` em `app/[locale]/(public)/page.tsx`).
**Rota interna:** `/dev/origami-lab` (só em desenvolvimento, fora do sitemap, sem ligação pública).
**Porta do CI:** `pnpm check:origami`.

`A Folha Entre Sessões` é um nome interno de trabalho. Não é uma marca, não
aparece no produto e não substitui Além da Sessão.

---

## 1. Auditoria da direção anterior

O que estava na homepage antes deste trabalho, e porquê foi recusado.

### 1.1. Topologia — o defeito de origem

Os três modelos (`crane`, `fox`, `boat` em `components/home/interval-studio.tsx`)
eram conjuntos de 8 a 10 `<polygon>` independentes. Nenhuma aresta era
partilhada entre faces vizinhas: cada polígono tinha as suas próprias
coordenadas, e duas faces «encostadas» só o estavam por coincidência numérica.

Isto não é um detalhe de implementação. Uma folha de papel tem uma propriedade
que a torna reconhecível antes de qualquer cor: **as faces vêm todas da mesma
superfície contínua**. Um conjunto de polígonos que não partilha vértices lê-se
como colagem geométrica, e nenhuma sombra ou gradiente corrige isso.

### 1.2. Reconhecimento — nenhuma figura passava

Nenhum dos três modelos sobrevivia ao teste de silhueta preta. A raposa lia-se
como losango, a garça como um conjunto de estilhaços, o barco como um triângulo
sobre uma barra. Todos precisavam da legenda para serem nomeados, que é a
definição do teste falhado.

### 1.3. Composição — hierarquia invertida

O palco tinha sete «folhas de semana», dois portais laterais, três formas de
ambiente animadas e um objeto central pequeno. O elemento que devia dominar era
o menor da cena.

### 1.4. Movimento sem causa

`.home-ambient-one/two/three` eram três halos com animação permanente. Não
respondiam a nada, não acabavam, e o custo de repintura era pago em todos os
frames da página.

### 1.5. Estado — combinações impossíveis

`mode`, `step`, `moment` e `crossing` viviam como quatro `useState`
independentes no mesmo componente. `mode: "returning"` com `step: 2` era um
estado que o código permitia escrever e o produto não tem.

---

## 2. Método

A ordem foi imposta pelo relatório de direção e cumprida à letra:

1. auditoria;
2. rota isolada `/dev/origami-lab`, fora do sitemap e inexistente em produção;
3. três direções comparáveis, com o mesmo conteúdo em cada painel;
4. folha de prova por objeto, silhueta primeiro;
5. contact sheet de todas as combinações;
6. recomendação fundamentada;
7. **paragem para escolha humana** antes de tocar na homepage.

### 2.1. O invariante que substitui o olho

`components/origami/report.ts` verifica, para cada modelo:

> Cada aresta pertence a exactamente duas faces (é um vinco) ou a uma só — e
> nesse caso tem de ser uma aresta da silhueta. A soma das áreas das faces tem
> de igualar a área da silhueta.

A primeira condição apanha fendas e sobreposições não declaradas; a segunda
apanha faces que se cobrem umas às outras. Os modelos declaram **vértices
nomeados** e as faces referem-se a eles por nome, portanto duas faces adjacentes
citam literalmente a mesma entrada da tabela e não podem divergir por
arredondamento.

Resultado actual: 6 modelos, 0 problemas, delta de área 0.00 em todos.

| modelo            | faces | vincos | delta de área |
| ----------------- | ----: | -----: | ------------: |
| `sheet`           |     3 |      2 |          0.00 |
| `half-fold`       |     3 |      2 |          0.00 |
| `boat`            |     4 |      3 |          0.00 |
| `box`             |    12 |      8 |          0.00 |
| `crane`           |    11 |      9 |          0.00 |
| `suspended-sheet` |     3 |      2 |          0.00 |

---

## 3. As três direções

Variam em linguagem e não só em cor: muda o palco, muda a relação do objeto com
o plano em que assenta, muda o que a cena diz sobre onde a pessoa está.

### Ateliê de luz — `#f0e9e0` / `#191510`

O papel está pousado numa superfície real. Uma luz superior esquerda, um plano
de mesa que escurece para o lado oposto, sombra de contacto curta e sombra
projetada larga. A cena diz: **isto é um objeto, e alguém está a trabalhá-lo**.

_Risco:_ é a mais próxima do território «ilustração de produtividade» se a
paleta aquecer demais.

### Campo suspenso — `#ece9f2` / `#14131b`

Não há mesa. O objeto ocupa um espaço abstrato com muita área negativa e uma
zona tonal circular que o segura. A sombra afasta-se e difunde-se, como
acontece a um corpo suspenso. A cena diz: **isto ainda não pousou em lado
nenhum**.

_Risco:_ em ecrãs pequenos sobra fundo e o objeto parece pequeno demais.

### Caderno arquitetónico — `#f1efe9` / `#17171a`

O papel está sobre um plano com pauta e margem. Luz mais plana; o volume vem dos
vincos e da oclusão, não da rampa tonal. A cena diz: **isto é trabalho, é
registo, é uma decisão a ser tomada**.

_Risco:_ depende de linhas finas, que são as primeiras a desaparecer com
antialiasing.

---

## 4. Folhas de prova — o que cada objeto aguenta

Cada modelo foi validado em silhueta preta, wireframe, papel sem fibra, papel no
palco, e a 96 / 160 / 320 px nos dois temas.

| objeto            | silhueta a 2 s | 96 px | veredito                                   |
| ----------------- | -------------- | ----- | ------------------------------------------ |
| `boat`            | passa          | passa | aceite à primeira revisão                  |
| `crane`           | passa          | fraco | aceite à **sexta** versão, ver §4.1        |
| `box`             | passa          | passa | aceite à terceira versão                   |
| `suspended-sheet` | passa          | passa | aceite à segunda versão                    |
| `sheet`           | n/a            | passa | matéria, não resultado                     |
| `half-fold`       | n/a            | passa | estado intermédio, deliberadamente ambíguo |

A primeira família foi recusada em revisão humana com um veredito curto e
correcto: _«o único que está bem feito é o barco, o pássaro não parece pássaro,
a caixa é só uma caixa, e o resto não é nada.»_ As três secções seguintes são o
que essa recusa produziu.

### 4.1. O grou custou seis versões, e cinco delas eram o pássaro errado

As primeiras cinco falharam por simetria — estrela, estrela gorda, dardo, X — e
cada correcção resolvia o sintoma sem tocar na causa. A sexta veio de uma
revisão humana que trouxe a referência que faltava: fotografias de **grous a
sério**, da família Gruidae.

O erro era de referência, não de desenho. Eu andava a desenhar o _tsuru_ — a
figura de origami — em vez de desenhar a ave. São coisas diferentes, e só uma
delas se chama grou.

Um grou é uma ave de pernas altas, e o que o distingue de qualquer outro
pássaro está todo abaixo do corpo e acima do pescoço:

- **As pernas valem quase um terço da altura.** Nenhuma das cinco versões
  anteriores tinha pernas. Um pássaro sem pernas compridas não é um grou.
- **O pescoço é erguido e fino**, não projetado para a frente. É a razão de o
  pescoço ter agora 15 unidades de largura contra um corpo de 120 de
  comprimento: é a desproporção que faz a leitura.
- **A cabeça é pequena e tem poupa.** No grou-coroado a coroa é um leque de
  espigões, e é o pormenor mais reconhecível da ave inteira em silhueta. Está
  construída com um entalhe entre duas pontas, porque um leque sem entalhe
  funde-se com a cabeça e vira um bloco.
- **A cauda cai.** As terciárias formam um penacho que desce por trás do corpo.
  Na primeira tentativa desta versão o penacho descia até à altura das pernas e
  competia com elas; subiu, e as pernas voltaram a ler-se.

**Custo registado:** é o modelo da família que mais perde nos tamanhos
pequenos. As canelas têm 12 unidades num `viewBox` de 300 — menos de 4 px a
96 px. O contorno é `non-scaling-stroke`, portanto a perna não desaparece, mas
a 96 px o grou lê-se como «ave de pernas altas» e não como «grou».

### 4.2. A caixa deixou de ser «só uma caixa»

A segunda versão passava o teste de silhueta e falhava o teste que interessa:
lia-se como um sólido, não como papel. O rebordo saliente resolvia a ambiguidade
«caixa ou cubo», mas nada dizia que aquilo tinha sido dobrado.

O que resolve são as **costuras diagonais das paredes**. Numa masu o papel
envolve o canto, e essa dobra fica visível da base até ao rebordo. Com as
paredes partidas na diagonal — quatro faces em vez de duas — o objeto passa a
ter a assinatura de papel que envolve um vazio. O interior a dois tons continua
a confirmar que está aberta.

### 4.3. A folha e a meia dobra deixaram de ser «nada»

Um retângulo com um vinco ao meio não é uma folha: é um bloco de cor com uma
linha. Um triângulo não é papel dobrado: é um triângulo.

- **`sheet`** ganhou uma ondulação real — as arestas de cima e de baixo já não
  são retas, e a folha divide-se em três planos. É a irregularidade do bordo que
  diz «papel»; uma folha pousada nunca fica a direito.
- **`half-fold`** ganhou a camada de trás a espreitar. Quando se dobra uma folha
  ao meio, as duas metades quase nunca ficam alinhadas, e é essa faixa
  desalinhada que diz que existem duas camadas em vez de uma superfície. A faixa
  é uma cunha e não uma banda constante — com espessura constante o objeto lia-se
  como um ecrã sobre uma base.
- **`suspended-sheet`** passou a dobrar quase metade da folha em vez de um canto
  pequeno. O avesso do papel ocupa agora área suficiente para ser uma superfície
  em vez de um detalhe.

### 4.4. O barco custou duas versões

A primeira tinha as duas velas com a mesma inclinação e uma diferença de altura
pequena: as hipotenusas continuavam-se quase em linha reta e lia-se uma tenda. O
que corrige é o mastro — a aresta vertical de 60 px entre o topo da vela pequena
e o topo da vela grande, contra o céu. Foi o único objeto aprovado à primeira
revisão humana.

---

## 5. Relatório de contraste

24 combinações: 4 famílias de papel × 3 palcos × 2 temas. Todas passam.

**Quem carrega o contraste muda com o tema, e isso é deliberado.** No tema
claro, papel claro sobre palco claro nunca chega a 3:1 pelo preenchimento — quem
garante a fronteira é o contorno escuro (11,4:1 a 14,2:1 contra o palco). No
tema escuro é o contrário: o papel é muito mais claro do que o palco e o
preenchimento chega lá sozinho (9,0:1 a 10,9:1), e o contorno volta a ser só um
vinco.

Regras verificadas por combinação:

| regra                                           | limiar | pior valor observado |
| ----------------------------------------------- | -----: | -------------------: |
| fronteira do objeto (contorno ou preenchimento) |  3,0:1 |                8,9:1 |
| contorno sobre o próprio papel                  |  3,0:1 |                6,7:1 |
| rampa tonal `lit` vs `shade`                    |  1,6:1 |                2,1:1 |
| «fosso tonal» `base` vs palco                   |  1,3:1 |                1,5:1 |

O «fosso tonal» é a regra que a versão anterior não tinha: garante que nenhuma
face principal se funde com o fundo, mesmo quando o contorno já resolveu a
fronteira.

Reproduzir: `pnpm check:origami`.

---

## 6. Movimento

Gramática implementada em `app/origami.css` e `app/homepage-experience.css`:

| causa               | efeito                                       |         duração |
| ------------------- | -------------------------------------------- | --------------: |
| escolher uma opção  | a folha assenta e as faces entram em cascata | 720 ms / 560 ms |
| avançar de etapa    | o palco inclina 1–1,5°                       |          480 ms |
| microinteração      | elevação de 1 px, mudança tonal              |          150 ms |
| stagger entre faces | —                                            |           45 ms |

Só `transform` e `opacity`. Nenhum `filter`, `box-shadow`,
`background-position` ou `clip-path` animado; nenhum loop permanente; nenhuma
animação bloqueia navegação.

`prefers-reduced-motion: reduce` não desliga nada: substitui a dobragem por uma
dissolução de 160 ms, remove a inclinação do palco e mantém foco, seleção e
progresso visíveis. As mesmas mudanças de estado acontecem na mesma ordem.

---

## 7. Performance

- A página é um Server Component; só `HomeExperience` e o seletor de tema do
  laboratório são cliente.
- Zero dependências novas. Sem Three.js, sem biblioteca de motion, sem bitmap.
- Geometria resolvida uma vez no módulo, nunca em runtime — 6 modelos, entre 2 e
  10 `<polygon>` cada.
- A sombra são duas elipses estáticas. Nenhum `feGaussianBlur`, nenhum
  `feTurbulence`: um desfoque SVG numa área grande custa repintura em cada frame
  de qualquer animação que passe perto.
- A fibra do papel é um `<pattern>` determinista de três unidades, declarado uma
  vez por página em `OrigamiDefs`. Se não estiver montado, o `fill` cai para o
  valor de recurso transparente e o objeto continua correto.
- Sem layout shift: o palco tem `min-height` própria e o SVG tem rácio
  intrínseco.

---

## 8. Decisões de arquitetura que valem a pena saber

### 8.1. `@container` e não `@media`

A experiência responde à largura que lhe é dada. Com `@media`, um recorte de
390 px dentro de um laboratório a 1400 px continuava a usar o layout de duas
colunas e a escala tipográfica de desktop — o recorte mentia, e mostrava um
telemóvel que nunca existiria. É exactamente o defeito «a versão mobile é a
desktop reduzida». Com `@container`, o recorte é o telemóvel.

O título usa `cqi` em vez de `vw` pela mesma razão.

### 8.2. A cor do papel só chega no fim

Durante o ritual a folha é sempre lilás — é matéria, não resultado. A família de
papel só muda no objeto final, e é escolhida pela **decisão** (levar, guardar,
atravessar, suspender), nunca pelo que a pessoa notou. Uma folha que virasse cor
diferente conforme a emoção seria uma leitura sobre a pessoa disfarçada de
ilustração.

### 8.3. Nada persiste

O estado vive num `useReducer` e desaparece ao recarregar. Sem `localStorage`,
sem pedido de rede, sem evento de analytics sobre uma escolha. É por isso que a
demonstração pode fazer perguntas sem se tornar um questionário de saúde.

---

## 9. O que ainda não está pronto

Registado por honestidade, não por modéstia.

1. **Pré-visualização de tema lado a lado é parcial.** `color-scheme` num
   subárvore resolve `light-dark()` para os tokens declarados lá dentro — o
   palco e o papel — mas `--background` e `--foreground` são declarados em
   `:root` e resolvem lá. Nos recortes desktop/mobile do laboratório o texto não
   acompanha a pré-visualização; para avaliar a experiência inteira no outro
   tema usa-se o seletor no topo, que troca `data-theme` no `<html>` como o
   produto faz. Consequência visível: a pauta do «Caderno arquitetónico» não
   aparece nas células escuras lado a lado.
2. **Dois tamanhos do laboratório são inline.** Os cartões de resultado fixam
   4,5 × 3,75 rem por `style` em vez de classe. Durante a sessão, as declarações
   de `width`/`height` da classe não chegaram ao navegador enquanto `display` e
   `align-self` da mesma regra chegaram — provável actualização parcial de CSS
   do servidor de desenvolvimento. Vale confirmar num servidor limpo e devolver
   as duas declarações à folha de estilo.

3. **A validação de telemóvel foi feita no laboratório, não numa janela de
   390 px.** O Chromium sem interface desta máquina ignora `--window-size` para
   efeitos de viewport de layout: mede `clientWidth` de 500 px e recorta a
   captura a 390, o que produz imagens que parecem transbordar quando
   `scrollWidth === clientWidth` diz que não transbordam. O recorte de 390 px do
   laboratório é uma caixa de 390 px CSS a sério e, com consultas de contentor,
   comporta-se como o telemóvel — mas **nenhuma medição foi feita num
   dispositivo real nem num emulador fiável**, e é assim que deve ser lido.
4. **Sem verificação automática de reconhecimento.** O teste das silhuetas é
   humano e continua a sê-lo. O que está automatizado é a topologia e o
   contraste — o que impede um objeto errado de ser _construído_, não de ser
   _escolhido_.
5. **Sem medição de INP em dispositivo real.** As afirmações de performance
   são estruturais (o que não existe não custa) e não medidas em campo.
6. **A família tem quatro objetos e todos passaram a segunda revisão.** A caixa
   deixou de ter reserva depois das costuras diagonais (§4.2), mas continua a
   ser a que mais depende do interior visível — não deve aparecer recortada a
   preto num tamanho pequeno.
7. **Sem capturas a 2× DPR.** As folhas de prova cobrem 96/160/320 px a 1×.

---

## 10. Recomendação

**Ateliê de luz**, com o grou em `mist` e o barco em `apricot`. **Escolhida e
integrada.**

A tese do produto é que o que fica entre sessões _ganha forma_. Uma mesa dá ao
objeto um sítio onde ser trabalhado, e é a única das três direções em que a cena
diz que alguém está a fazer alguma coisa — que é literalmente o que a pessoa está
a fazer no ecrã.

**Campo suspenso** é a mais bonita das três e a que melhor combina com a paleta
existente do produto (o palco `#ece9f2` é quase o `--background` actual), mas o
que ela diz — «isto ainda não pousou» — contradiz a promessa de continuidade.
Fica como segunda escolha, e é a escolha certa se a preferência for coesão com o
sistema visual actual em vez de força narrativa.

**Caderno arquitetónico** lê-se como trabalho administrativo. É provavelmente a
direção certa para a área profissional, e a errada para a porta de entrada.
