# NOTICE

Trabalho de terceiros que influenciou código deste repositório, e em que termos.

## OrigamiSimulator — Amanda Ghassaei

- Repositório: <https://github.com/amandaghassaei/OrigamiSimulator>
- Commit estudado: `7855983a613c879c171b2b1557f8cd102d2640cf`
- Licença: MIT
- Artigo: Ghassaei, Demaine e Gershenfeld, _Fast, Interactive Origami Simulation
  using GPU Computation_ (Origami⁷, 2018) —
  <https://erikdemaine.org/papers/OrigamiSimulator_Origami7/>

`packages/origami-core` é uma **reimplementação**, não uma adaptação de código.
Nenhum ficheiro, função ou shader do OrigamiSimulator foi copiado. O que foi
adotado é o modelo físico descrito no artigo e legível no repositório:

- o formato FOLD como estrutura interna, com `edges_assignment` e
  `edges_foldAngle` a carregarem o sentido e a amplitude de cada vinco;
- a decomposição bar-and-hinge — nós, barras axiais e dobradiças angulares —
  sobre uma malha triangulada;
- a força de vinco como momento proporcional ao desvio do ângulo diedro,
  distribuído pelos quatro vértices das duas faces incidentes;
- a distinção entre vincos autorados e arestas de triangulação com ângulo-alvo
  zero;
- o aviso, presente na aplicação viva, de que triângulos compridos e estreitos
  tornam os padrões instáveis — aqui traduzido no gate de qualidade de
  triângulo.

Onde este projeto diverge, e porquê, está em
`docs/adr/0034-origami-autoria-fisica-runtime-determinista.md`. As diferenças
principais: a inextensibilidade é tratada como restrição de posição e não como
mola rígida; a dobragem passa por etapas autoradas em vez de uma rampa única; e
o solver não corre no browser — corre no compilador, e o que vai para produção
são frames já verificados.

Se alguma porção substancial de código do OrigamiSimulator vier a ser
incorporada, o texto da licença MIT e a nota de copyright originais têm de
acompanhar esse código.

## FOLD specification — Erik Demaine et al.

- Especificação: <https://github.com/edemaine/fold/blob/main/doc/spec.md>
- Versão suportada: 1.2

Os ficheiros `source.fold` deste repositório seguem a especificação, restringida
a cinco atribuições de aresta (`B`, `M`, `V`, `F`, `J`) e estendida com campos
`ads:` — a extensão por prefixo que o próprio formato prevê. Nenhum código da
implementação de referência é usado.

## Modelos

Os padrões de vincos em `apps/web/public/origami/*/source.fold` foram autorados
para este projeto. Três deles seguem princípios construtivos que são domínio
público e conhecidos há séculos — nenhum é uma transcrição de diagrama de
autor:

| Modelo     | Dobra tradicional                     | O que foi derivado aqui                           |
| ---------- | ------------------------------------- | ------------------------------------------------- |
| `box`      | caixa masu                            | meia-base, altura e a trajetória do canto         |
| `envelope` | base blintz (quatro cantos ao centro) | profundidade das abas e o ângulo de fecho de 148° |
| `gate`     | dobra de portas                       | posição da dobradiça e a inclinação de 88°        |

A geometria concreta de cada um está derivada no ficheiro correspondente em
`tools/origami/models/`.
