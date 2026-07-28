import type { AuthoredModel, Vec3 } from "@alem-da-sessao/origami-core";

/**
 * A primeira dobra — o estado entre a folha e o objeto.
 *
 * Uma dobra só. É o modelo mais pequeno que este sistema consegue ter e serve
 * de referência para todos os outros: se o meio-quadrado não fechar exatamente
 * a 62°, com deformação nula e sem deriva, o problema está no motor e não no
 * padrão de vincos. Foi com ele que se apanhou o sinal do ângulo diedro.
 *
 * Não fecha até ao fim de propósito. Uma folha vincada a 180° já é outra coisa
 * — tem uma decisão tomada — e este estado existe para representar o momento em
 * que ainda não está.
 */

const ANGLE = 62;

const flat: Vec3[] = [
  [-0.5, -0.5, 0], // 0
  [0, -0.5, 0], //    1
  [0.5, -0.5, 0], //  2
  [0.5, 0.5, 0], //   3
  [0, 0.5, 0], //     4
  [-0.5, 0.5, 0], //  5
];

const radians = (ANGLE * Math.PI) / 180;
const reach = 0.5 * Math.cos(radians);
const rise = 0.5 * Math.sin(radians);

const creased: Vec3[] = [
  [-0.5, -0.5, 0],
  [0, -0.5, 0],
  [reach, -0.5, rise],
  [reach, 0.5, rise],
  [0, 0.5, 0],
  [-0.5, 0.5, 0],
];

export const halfFoldModel: AuthoredModel = {
  flat,
  stages: [{ title: "vincada", state: "noticed", positions: creased }],
  faces: [
    [0, 1, 4, 5],
    [1, 2, 3, 4],
  ],
  edges: [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 0],
    [1, 4],
  ],
  boundary: [0, 1, 2, 3, 4, 5],
  // A metade esquerda fica onde estava; é a direita que sobe.
  anchor: { origin: 0, toward: 1, plane: 5 },
};
