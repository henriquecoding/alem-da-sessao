# ADR-032 — A homepage não descreve o intervalo: é um intervalo

**Estado:** aceite. Relatório v2 §4.2, §4.5, §6.8, §7.2.

## O que estava lá

Eyebrow, `h1`, parágrafo, dois botões, três ícones com três benefícios, duas
colunas comparativas, captura de ecrã do produto. Competente e **totalmente
intercambiável**: trocando o logótipo e a paleta, servia qualquer SaaS.

Isso não é uma crítica estética. A tese deste produto é que ele não é
substituível por nenhum dos incumbentes (§1.4); uma homepage com a forma de
todos eles contradiz a tese antes de a enunciar. O §6.8 chama-lhe o terceiro
teste de qualidade — *isto podia pertencer a outro produto?* — e a resposta era
sim, a tudo.

## A decisão

Cinco tempos, deliberadamente os mesmos cinco do ritual das experiências
(§7.2), para que a página **ensaie aquilo que vende**:

1. **A chegada.** Não há herói. Quem entra aterra dentro da semana entre duas
   sessões, com a régua desenhada à escala: duas âncoras finas e sete dias de
   nada entre elas. O vazio é o argumento, e vê-se antes de se ler.
2. **Os momentos.** Seis linhas de uma semana qualquer, com hora, no
   infinitivo. É a parte que não vende nada. Se duas forem reconhecidas, o
   resto do argumento já não precisa de ser feito.
3. **O argumento.** A pergunta óbvia — *então porque é que ninguém fez isto?* —
   respondida com os incentivos de EHRs, marketplaces e apps D2C, em vez de
   logótipos de clientes que não existem.
4. **O gesto.** O `ShareGesture` verdadeiro, não uma reconstituição. A tese —
   *escrever é privado, atravessar é uma decisão* — é sobre a **duração** de um
   ato, e uma frase a explicá-la não convence ninguém. Arrastar durante um
   segundo e ver o recibo do outro lado convence em silêncio. Se o gesto se
   partir em produção, parte-se aqui à vista de toda a gente.
5. **As portas.** Dois ritmos opostos, com tipografia e densidade diferentes,
   porque os dois modos do produto são diferentes (§6.2) — a forma da porta já
   diz o que está do outro lado.

## A pergunta de chegada, e o que ela não faz

Uma pergunta única perto do topo — *o que o traz aqui?* — reordena o resto:
quem acompanha pessoas recebe o argumento antes dos momentos, quem está em
processo recebe o oposto, e a porta correspondente lidera. Não bloqueia, não é
obrigatória, e a página inteira funciona sem lhe tocar.

**A resposta não sai da visita.** Não vai para cookie, não vai para
armazenamento nenhum, não é enviada a lado nenhum: vive em estado de React e
desaparece com a aba.

Isto não é falta de ambição técnica. Lembrar que alguém disse «estou em
processo» seria começar a manter um perfil de saúde mental de um visitante
anónimo — exatamente a estrutura pela qual a FTC multou o BetterHelp em US$
7,8M (§8.2, F2). O produto que promete que nada sai daqui não pode falhar essa
promessa na primeira interação da homepage. `check:privacy` recusa qualquer
escrita de armazenamento nesses ficheiros, portanto a frase é verificável e não
uma intenção.

## Restrições que a página respeita

- **Estática.** A chegada, os momentos e o argumento são componentes de
  servidor e vão inteiros no HTML — são eles que carregam o texto, e texto que
  precisa de JavaScript para existir é texto que o primeiro frame não tem. Só a
  pergunta, o gesto e as portas são cliente, e os tempos 2 e 3 entram no
  componente de cliente como slots já renderizados.
- **Sem imagens.** Tudo é tipografia, CSS e SVG (§6.6). Não há custo por
  visitante e não há nada para otimizar depois.
- **Movimento que explica.** A única animação infinita é o halo do «está aqui»:
  um ponto parado é um gráfico, um ponto que respira é alguém. Com
  `prefers-reduced-motion` fica parado e a composição não perde nada —
  verificado: zero elementos invisíveis nesse modo.
- **O gesto tem três vias equivalentes** — arrastar, Enter, setas — porque é o
  componente real e o WCAG 2.2 SC 2.5.7 aplica-se aqui como em qualquer lado.
- **Nenhuma alegação clínica.** `check:claims` cobre a copy nova.

## Nota de convergência

Enquanto esta página era escrita, outra sessão desenhou um motor de coreografia
sem dependências (`useChoreography`, `CountUp`) e animou a `IntervalFigure` do
herói antigo. As duas linhas encontraram-se num merge.

O que ficou: **o motor**, aplicado à régua da chegada. A ordem que essa sessão
desenhou — primeiro a semana, depois as duas sessões, por último o tamanho do
que fica no meio — é exatamente o argumento desta página, e agora é a régua
inteira que a executa em vez de um cartão no canto.

O que saiu: `interval-figure.tsx`. A figura existia para o herói que esta
página substituiu, e depois do merge não era renderizada em lado nenhum. Deixar
um componente órfão no repositório seria pior do que apagá-lo — a ideia dele
não se perdeu, mudou de escala.

As duas sessões encontraram também a mesma falha de hidratação por caminhos
diferentes, e as duas correções ficam. A da folha de estilos (`.reveal` só
esconde dentro de `.js-reveal`) continua a valer no dia em que o bundle falhar
por uma razão que não seja a CSP; a da CSP (ADR-030) remove a razão que de
facto o estava a partir.
