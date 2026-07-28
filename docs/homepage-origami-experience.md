# Homepage — Atelier de Origami

> **Histórico.** Descreve a primeira iteração, com pássaro, raposa e barco
> desenhados em SVG. A família de objetos mudou duas vezes desde então e as
> figuras desenhadas à mão foram apagadas. Para o estado atual ver
> `ORIGAMI_RUNTIME.md` e ADR-034; para a direção de arte, `ORIGAMI_LAB.md`.
>
> Fica pela §3, que é a única parte que não envelheceu: porque é que a metáfora
> é origami, e as duas leituras que ela evita.

Pesquisa, direção de arte e especificação implementada em 28 de julho de 2026.

## 1. O problema encontrado

A homepage anterior tinha intenção autoral, mas a interação principal continuava
a ser ler:

- uma régua horizontal explicava os sete dias;
- uma lista nomeava momentos possíveis;
- uma tabela apresentava o argumento de negócio;
- só perto do final existia um gesto real.

O resultado era uma landing page editorial com animação, não uma experiência.
A tese aparecia logo no primeiro ecrã, mas o visitante não podia construir
qualquer entendimento através de uma ação. A página também não servia bem um
utilizador recorrente: obrigava-o a atravessar o discurso de aquisição para
encontrar a sua área.

## 2. Pesquisa do território

### 2.1 Produtos adjacentes

Foram estudadas plataformas que combinam gestão de prática e continuidade
entre sessões, entre elas:

- [Yosa](https://www.yosaapp.com/): check-ins, medidas, worksheets e
  acompanhamento de engagement;
- [Bloomsline](https://www.bloomsline.com/): prática, recursos e continuidade
  organizados numa superfície calma;
- [HealBetween](https://healbetween.com/): homework, mensagens, mood logs e
  portais por papel;
- [Quenza](https://quenza.com/features/client-portal): atividades, programas,
  tarefas e comunicação;
- [OpnUp](https://opnup.io/): ferramentas visuais partilháveis por link;
- [Attune](https://tryattune.app/): prática de cenários atribuída por
  profissionais;
- [Linea](https://linea.space/): gestão de prática centrada na continuidade do
  percurso do cliente.

O padrão dominante é consistente: hero com promessa, mockup do dashboard,
grelha de funcionalidades, “como funciona”, prova social e preço. Mesmo quando
o produto fala sobre o intervalo, a homepage mostra software. A oportunidade
não está em inventar outra lista de funcionalidades; está em permitir que a
pessoa compreenda o modelo de privacidade e continuidade através de um gesto.

### 2.2 Relação terapêutica digital

A pesquisa qualitativa sobre aliança terapêutica digital identifica escolha,
empoderamento, flexibilidade, segurança e ausência de julgamento como fatores
relevantes para a relação com intervenções digitais
([Brotherdale, Berry & Bucci, 2024](https://doi.org/10.1177/20552076241277712);
[Tong et al., 2023](https://pubmed.ncbi.nlm.nih.gov/37042076/)).

O estudo sobre goACT descreve valor quando a tecnologia é adequada às
necessidades específicas, promove responsabilidade recíproca e amplia o acesso
ao processo terapêutico, mas também regista preocupações profissionais com
limites, carga de trabalho e risco
([Clough et al.](https://www.tandfonline.com/doi/abs/10.1111/cp.12102)).

Uma meta-análise de 92 ensaios randomizados encontrou resultados positivos
para intervenções digitais, mas também grande heterogeneidade na forma como
“engagement” é medido
([npj Digital Medicine, 2025](https://www.nature.com/articles/s41746-025-01567-5)).
Por isso a homepage não transforma uso em prova clínica, não apresenta
contagens de dias e não promete resultados.

Decisões derivadas:

1. a pessoa escolhe, em vez de ser classificada;
2. nada é escrito para poder experimentar;
3. nada é persistido;
4. privado e partilhado são estados espacialmente diferentes;
5. a tecnologia dá forma à relação humana, não tenta ocupar o lugar dela;
6. não existem streaks, mood scores, recompensas ou pressão de retorno.

### 2.3 Motion e desempenho

Experiências 3D memoráveis convidam o visitante a agir, em vez de usarem
profundidade apenas como decoração. Esta é a premissa observada no trabalho de
estúdios de interação como a [Lusion](https://lusion.co/).

No entanto, a homepage não precisa de WebGL para produzir materialidade. A
orientação da [web.dev](https://web.dev/articles/animations-and-performance)
é privilegiar `transform` e `opacity` para evitar layout e paint durante
animações. A cena foi, portanto, construída com SVG semântico e CSS:

- nenhum Three.js;
- nenhum canvas;
- nenhuma imagem hero;
- nenhum vídeo;
- nenhum ciclo `requestAnimationFrame`;
- silhuetas vetoriais estáveis, sem dependência de rasterização externa;
- transformações só quando o estado muda;
- formas ambientais lentas apenas quando o sistema permite movimento.

A experiência alternativa respeita `prefers-reduced-motion`, cuja função é
remover ou substituir movimento não essencial
([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion)).

### 2.4 Origami reconhecível e contraste contextual

A primeira implementação confundia “geométrico” com “origami”: triângulos
soltos, portais e um losango central produziam profundidade, mas não um objeto
reconhecível. O estudo de _crease patterns_ de
[Robert J. Lang](https://langorigami.com/crease-patterns/) mostrou a distinção
necessária: o padrão de dobras explica a estrutura escondida do modelo, mas não
substitui a sua forma exterior. A abordagem de _polygon packing_ e desenho
estrutural descrita em
[_Origami Design Secrets_](https://langorigami.com/publication/origami-design-secrets-2nd-edition/)
foi traduzida para uma regra visual adequada à web:

1. a silhueta identifica o animal ou objeto sem linhas internas;
2. cada faceta tem função anatómica ou estrutural;
3. uma linha de dobra nunca inventa um volume que o contorno não sustenta;
4. o modelo usa uma aresta própria, mais escura que todas as faces;
5. sombra e movimento confirmam o papel, mas não carregam o reconhecimento.

O segundo problema era cromático. Uma paleta suave não autoriza contraste
suave. As técnicas [G18](https://www.w3.org/WAI/WCAG22/Techniques/general/G18),
[G207](https://www.w3.org/WAI/WCAG22/Techniques/general/G207.html) e
[G209](https://www.w3.org/WAI/WCAG22/Techniques/general/G209.html) do WCAG
exigem verificar texto, ícones e limites no fundo imediatamente adjacente. A
falha [F83](https://www.w3.org/WAI/WCAG22/Techniques/failures/F83.html)
documenta precisamente o risco de imagens ou gradientes tornarem partes do
texto ilegíveis.

Por isso, a implementação deixou de reutilizar cores de conteúdo diretamente
como superfícies. Cada tema tem agora contratos separados para:

- tela;
- painel;
- artefacto;
- texto principal e secundário;
- face clara, intermédia e escura de cada origami;
- aresta e linha de dobra.

## 3. Direção de arte: papel que conserva identidade

O Lost Letters Room foi usado como referência de qualidade, não como biblioteca
de elementos. O princípio aproveitado é a presença de um objeto central que
carrega o ritual inteiro. Não foram transportados envelopes, cartas,
arquivistas, bibliotecas, selos ou a estética de arquivo.

No Além da Sessão, esse objeto é o mesmo papel em diferentes formas. A faixa de
sete dobras preserva a continuidade temporal; o pássaro, a raposa e o barco dão
uma identidade inequívoca ao que a pessoa escolheu.

### Por que origami

- **continuidade:** a folha permanece a mesma em todos os estados;
- **transformação sem apagamento:** uma dobra altera a forma sem destruir o
  material anterior;
- **privacidade:** a face interior existe mesmo quando não está exposta;
- **decisão:** abrir e fechar são gestos inequívocos;
- **complexidade legível:** uma forma rica nasce de ações pequenas;
- **leveza técnica:** profundidade e materialidade podem ser produzidas com
  geometria nativa.

A metáfora evita dois erros comuns: não trata a pessoa como um conjunto de
dados e não apresenta terapia como uma travessia linear de “antes” para
“curado”. A folha muda de forma; não sobe uma barra de progresso clínico.

## 4. A experiência implementada

### Entrada

A frase “A sessão termina. A vida continua.” dá contexto sem tentar encerrar o
argumento. A pessoa escolhe entre duas entradas:

- **Conhecer o espaço:** inicia o ritual;
- **Já utilizo:** transforma a mesma folha em duas portas, cliente e
  profissional.

Não há modal, redirecionamento automático ou perfil persistente.

### Ato 1 — Notar

A faixa está quase plana, dividida em sete segmentos. A pessoa escolhe uma
intenção que ganha uma forma reconhecível:

- algo ficou: pássaro de regresso;
- algo ganhou forma: raposa atenta;
- algo quer seguir: barco de partida.

Não existe campo de texto. A escolha altera silhueta, facetas, cor e a
descrição textual do objeto de papel.

### Ato 2 — Dar forma

O objeto aproxima-se e a página revela uma engine adequada ao tipo de escolha.
A faixa continua visível como contexto, sem tentar transformar sete
quadriláteros no próprio animal. Fica explícito que uma experiência não é uma
caixa de texto: tem objetos, relações, estados e decisões.

### Ato 3 — Decidir

A folha desdobra-se como ponte. O visitante pode manter o objeto deste lado ou
fazê-lo atravessar. A travessia é apenas uma demonstração e isso é dito no
mesmo momento do gesto.

O profissional nunca recebe sinais de atividade, rascunhos ou inferências. Só
um resumo deliberadamente escolhido pode atravessar no produto real.

### Utilizador recorrente

Ao selecionar “Já utilizo”, a composição deixa de apresentar o ritual e dobra
a folha em duas entradas:

- ritmo aberto e lento para o cliente;
- acesso compacto e direto para o profissional.

Isto evita obrigar quem volta a consumir novamente a narrativa de aquisição.

## 5. Estrutura editorial

Depois do teatro principal existem apenas duas sequências:

1. uma composição de duas folhas que explica os dois ritmos do produto;
2. um fecho que afirma o limite central: “Além da sessão, não além do
   profissional”.

Não foram mantidas tabelas comparativas, métricas inventadas, logótipos, mockups
de navegador nem grelhas de benefícios. A informação necessária para SEO
continua visível e legível, mas subordinada à experiência.

## 6. Regras de qualidade

- PT-PT e PT-BR têm copy editorial própria e a mesma estrutura tipada.
- Todos os controlos têm alvo mínimo de 44 px.
- O ritual funciona por botões; não depende de arraste.
- O estado é anunciado por texto, não apenas por cor ou movimento.
- A cena é decorativa para tecnologias assistivas e tem uma descrição textual.
- Cada origami continua reconhecível sem cor; cor e linhas internas apenas
  reforçam a silhueta.
- Superfícies editoriais e artefactos usam tokens próprios para tema claro e
  escuro; não existe texto sobre gradiente de contraste desconhecido.
- As facetas e os ícones mantêm uma aresta contrastante mesmo quando o papel e
  o fundo pertencem à mesma família cromática.
- Sem JavaScript, a mensagem, a proposta e as rotas principais continuam no
  HTML; a interatividade é uma camada progressiva.
- As secções abaixo da dobra são renderizadas de imediato; a homepage não
  introduz esqueletos, atrasos de aparição ou conteúdo “lazy” num percurso que
  deve responder ao scroll sem hesitação.
- Nenhuma escolha usa cookies, `localStorage`, `sessionStorage`, analytics ou
  serviços de terceiros.
- O modo reduzido mantém estados compreensíveis sem movimento espacial.

## 7. Critérios de validação

Antes da integração:

1. `pnpm check`;
2. `pnpm build`;
3. budgets do bundle gerado;
4. auditoria visual em 390 px, 768 px, 1280 px e 1440 px;
5. tema claro e escuro;
6. teclado completo;
7. `prefers-reduced-motion`;
8. PT-PT e PT-BR;
9. links para experiência, demo, cliente, profissional e segurança;
10. silhuetas do pássaro, da raposa e do barco em claro e escuro;
11. contraste dos artefactos e do Inventário da Sessão no pior ponto do fundo;
12. confirmação de que não existe deploy.
