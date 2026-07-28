import type { AuthoredModel, Vec3 } from "@alem-da-sessao/origami-core";

/**
 * A caixa — «guardar consigo».
 *
 * É a caixa de canto com gusset: base quadrada, quatro paredes que sobem, e em
 * cada canto um quadrado de papel que não tem para onde ir e se resolve
 * dobrando na diagonal e deitando-se contra a parede seguinte. É o mesmo
 * princípio da masu, e é o modelo certo para provar este sistema primeiro:
 *
 * - é genuinamente tridimensional, portanto exige oclusão a sério;
 * - tem camadas sobrepostas, que é o que o gate de área da versão anterior
 *   tornava impossível de representar;
 * - reconhece-se em silhueta a 96 px, que é o gate que mata a maior parte das
 *   formas bonitas.
 *
 * ## A geometria do canto
 *
 * Com meia-base `b` e altura `h` (e `b + h = 0,5`, porque a folha é o quadrado
 * canónico), a parede este roda `α` em torno de `x = b` e a parede sul em torno
 * de `y = −b`. O quadrado do canto está preso às duas, e à medida que elas se
 * afastam ele tem de dobrar na diagonal.
 *
 * Onde é que a ponta do canto fica, para um `α` qualquer, sai de três
 * distâncias que não podem mudar — `h√2` até ao canto da base e `h` até cada
 * uma das duas paredes. Com a ponta em `A + (t, −t, z)` por simetria, as duas
 * primeiras condições dão `t·cos α + z·sen α = h`, e a terceira fecha o
 * sistema:
 *
 * ```text
 * t(α) = h·(cos α + √2·sen²α) / (1 + sen²α)
 * z(α) = (h − t·cos α) / sen α
 * ```
 *
 * Em `α = 0` isto devolve a folha plana; em `α = 90°` devolve a ponta no bordo
 * da caixa, a apontar para fora pela bissetriz. Ter a fórmula em vez de dois
 * estados escritos à mão é o que permite passar por `α` intermédios — e é isso,
 * e não a rigidez nem o amortecimento, que resolve o canto que ficava preso.
 *
 * ## Porque é que as etapas são três e não duas
 *
 * A primeira tentativa levava o modelo do plano diretamente às paredes a 90° e
 * de lá às abas deitadas. Três cantos fechavam e o quarto ficava a 5°.
 *
 * A causa é uma degenerescência: em `α = 90°` os vértices 5 e 6 caem no mesmo
 * ponto, as duas metades do gusset ficam exatamente coincidentes, e a
 * configuração deixa de dizer ao solver para que lado a aba há de cair. Três
 * cantos decidem por causa de assimetrias numéricas minúsculas; o quarto empata.
 *
 * A etapa a `α = 52°` remove o empate. A esta altura o gusset já escolheu um
 * lado — está a meio de fechar, com os vértices 5 e 6 ainda bem separados — e o
 * que vem a seguir é continuação e não decisão. Não é um número mágico: é
 * qualquer ângulo suficientemente longe do plano para o canto já ter começado e
 * suficientemente longe de 90° para as duas camadas ainda não se tocarem.
 */

const HALF_BASE = 0.3;
const WALL = 0.5 - HALF_BASE;

const b = HALF_BASE;
const h = WALL;
const s = 0.5;

const flat: Vec3[] = [
  [-b, -b, 0], // 0  base sudoeste
  [b, -b, 0], //  1  base sudeste
  [b, b, 0], //   2  base nordeste
  [-b, b, 0], //  3  base noroeste
  [-b, -s, 0], // 4  aresta sul, oeste
  [b, -s, 0], //  5  aresta sul, este
  [s, -b, 0], //  6  aresta este, sul
  [s, b, 0], //   7  aresta este, norte
  [b, s, 0], //   8  aresta norte, este
  [-b, s, 0], //  9  aresta norte, oeste
  [-s, b, 0], //  10 aresta oeste, norte
  [-s, -b, 0], // 11 aresta oeste, sul
  [-s, -s, 0], // 12 canto sudoeste
  [s, -s, 0], //  13 canto sudeste
  [s, s, 0], //   14 canto nordeste
  [-s, s, 0], //  15 canto noroeste
];

/**
 * A caixa com as paredes a `α` graus, e os gussets no único sítio onde podem
 * estar. Ver a dedução no cabeçalho.
 */
function wallsAt(degrees: number): Vec3[] {
  const alpha = (degrees * Math.PI) / 180;
  const cos = Math.cos(alpha);
  const sin = Math.sin(alpha);

  const t = (h * (cos + Math.SQRT2 * sin * sin)) / (1 + sin * sin);
  // Em α = 0 a expressão para `z` divide por zero, e a resposta é a folha plana.
  const z = sin < 1e-9 ? 0 : (h - t * cos) / sin;

  const reach = h * cos;
  const rise = h * sin;

  return [
    [-b, -b, 0],
    [b, -b, 0],
    [b, b, 0],
    [-b, b, 0],
    [-b, -b - reach, rise], // 4  parede sul
    [b, -b - reach, rise], //  5
    [b + reach, -b, rise], //  6  parede este
    [b + reach, b, rise], //   7
    [b, b + reach, rise], //   8  parede norte
    [-b, b + reach, rise], //  9
    [-b - reach, b, rise], //  10 parede oeste
    [-b - reach, -b, rise], // 11
    [-b - t, -b - t, z], //    12 gusset sudoeste
    [b + t, -b - t, z], //     13 gusset sudeste
    [b + t, b + t, z], //      14 gusset nordeste
    [-b - t, b + t, z], //     15 gusset noroeste
  ];
}

/**
 * A caixa acabada: paredes de pé e cada aba deitada contra a parede seguinte.
 *
 * Todas as abas rodam no mesmo sentido — sudeste para a parede este, nordeste
 * para a norte, e assim por diante. É essa torção que as caixas de papel
 * verdadeiras têm, e é o que impede a forma de se ler como uma cruz com quatro
 * bicos simétricos.
 */
const folded: Vec3[] = [
  [-b, -b, 0],
  [b, -b, 0],
  [b, b, 0],
  [-b, b, 0],
  [-b, -b, h], //  4  parede sul
  [b, -b, h], //   5
  [b, -b, h], //   6  parede este
  [b, b, h], //    7
  [b, b, h], //    8  parede norte
  [-b, b, h], //   9
  [-b, b, h], //   10 parede oeste
  [-b, -b, h], //  11
  [h - b, -b, h], // 12 aba sudoeste, deitada na parede sul
  [b, h - b, h], //  13 aba sudeste, deitada na parede este
  [b - h, b, h], //  14 aba nordeste, deitada na parede norte
  [-b, b - h, h], // 15 aba noroeste, deitada na parede oeste
];

const faces: readonly (readonly number[])[] = [
  [0, 1, 2, 3], // base
  [4, 5, 1, 0], // parede sul
  [1, 6, 7, 2], // parede este
  [3, 2, 8, 9], // parede norte
  [11, 0, 3, 10], // parede oeste
  [1, 13, 6], // gusset sudeste, metade que segue a parede este
  [1, 5, 13], // gusset sudeste, metade que segue a parede sul
  [2, 7, 14], // gusset nordeste
  [2, 14, 8],
  [3, 9, 15], // gusset noroeste
  [3, 15, 10],
  [0, 11, 12], // gusset sudoeste
  [0, 12, 4],
];

const edges: readonly (readonly [number, number])[] = [
  // Fronteira, em circuito fechado.
  [12, 4],
  [4, 5],
  [5, 13],
  [13, 6],
  [6, 7],
  [7, 14],
  [14, 8],
  [8, 9],
  [9, 15],
  [15, 10],
  [10, 11],
  [11, 12],
  // Base para parede.
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  // Diagonais dos gussets.
  [1, 13],
  [2, 14],
  [3, 15],
  [0, 12],
  // Gusset para parede.
  [1, 6],
  [1, 5],
  [2, 7],
  [2, 8],
  [3, 9],
  [3, 10],
  [0, 11],
  [0, 4],
];

export const boxModel: AuthoredModel = {
  flat,
  stages: [
    { title: "o canto decide", state: "forming", positions: wallsAt(52) },
    { title: "paredes de pé", state: "forming", positions: wallsAt(90) },
    { title: "abas assentes", state: "formed", positions: folded },
  ],
  faces,
  edges,
  boundary: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  // A base não dobra: os seus três primeiros cantos são o referencial. É o que
  // as mãos fazem — seguram a base enquanto as paredes sobem.
  anchor: { origin: 0, toward: 1, plane: 2 },
};
