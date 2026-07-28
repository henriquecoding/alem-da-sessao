import type { AuthoredModel, Vec3 } from "@alem-da-sessao/origami-core";

/**
 * O envelope — «levar algo adiante».
 *
 * É a base blintz: os quatro cantos do quadrado dobram para o centro ao longo
 * do quadrado inscrito que une os pontos médios dos lados. É a dobra com que
 * começa metade do origami tradicional, e é também, sozinha, um objeto —
 * a forma de fechar uma folha para a entregar a alguém.
 *
 * ## Porque é que substitui o barco
 *
 * O barco tradicional faz-se por sequência, com *squash folds* que reordenam
 * camadas, e este solver não tem modelo de camadas. A tentativa que fecha está
 * em `boat.ts`, fora do registo: dobra, mas em silhueta lê-se como uma tina.
 *
 * O envelope diz melhor o que a cópia promete. «Levar algo adiante» é, na
 * plataforma, uma nota de intervalo que chega à próxima sessão porque alguém
 * decidiu partilhá-la — e isso é uma carta fechada, não um barco. A forma
 * passou a nomear a decisão com mais precisão do que nomeava antes.
 *
 * ## Porque é que não fecha até ao fim
 *
 * A 178° os quatro triângulos ficam praticamente coplanares com a base, as
 * normais quase não diferem, e o objeto renderiza-se como um losango liso —
 * um envelope selado é, visualmente, um retângulo. A 148° cada aba tem
 * inclinação própria, apanha luz própria, e lê-se o gesto: uma folha a ser
 * fechada, não uma folha fechada.
 */

const FOLD = 148;

const flat: Vec3[] = [
  [-0.5, -0.5, 0], // 0 canto sudoeste
  [0.5, -0.5, 0], //  1 canto sudeste
  [0.5, 0.5, 0], //   2 canto nordeste
  [-0.5, 0.5, 0], //  3 canto noroeste
  [0, -0.5, 0], //    4 meio sul
  [0.5, 0, 0], //     5 meio este
  [0, 0.5, 0], //     6 meio norte
  [-0.5, 0, 0], //    7 meio oeste
];

const faces: readonly (readonly number[])[] = [
  [4, 5, 6, 7], // o quadrado inscrito: o corpo da carta
  [0, 4, 7], //   aba sudoeste
  [4, 1, 5], //   aba sudeste
  [5, 2, 6], //   aba nordeste
  [6, 3, 7], //   aba noroeste
];

const edges: readonly (readonly [number, number])[] = [
  // Fronteira, em circuito fechado (0–7).
  [0, 4],
  [4, 1],
  [1, 5],
  [5, 2],
  [2, 6],
  [6, 3],
  [3, 7],
  [7, 0],
  // O quadrado inscrito: as quatro linhas por onde as abas dobram (8–11).
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4],
];

/**
 * As quatro abas são independentes.
 *
 * Cada uma roda sozinha em torno da sua linha, sem partilhar vértice interior
 * com as outras — não há vértice de grau quatro, não há mecanismo, não há
 * acoplamento. É o modelo mais simples desta família e o único em que os
 * ângulos pedidos são exatamente os ângulos obtidos.
 */
function stage(fraction: number): Record<number, number> {
  return {
    8: FOLD * fraction,
    9: FOLD * fraction,
    10: FOLD * fraction,
    11: FOLD * fraction,
  };
}

export const envelopeModel: AuthoredModel = {
  flat,
  stages: [
    { title: "abas a levantar", state: "forming", angles: stage(0.5) },
    { title: "carta fechada", state: "formed", angles: stage(1) },
  ],
  faces,
  edges,
  boundary: [0, 1, 2, 3, 4, 5, 6, 7],
  // O corpo da carta não dobra: é dele que sai o referencial.
  anchor: { origin: 4, toward: 5, plane: 6 },
};
