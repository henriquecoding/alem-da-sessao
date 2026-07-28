import type { AuthoredModel, Vec3 } from "@alem-da-sessao/origami-core";

/**
 * A folha — a matéria, antes de qualquer decisão.
 *
 * Não é um retângulo. Uma folha de papel pousada nunca está perfeitamente
 * plana, e desenhá-la plana é a diferença entre «papel» e «fundo». Duas dobras
 * de sete graus em sentidos opostos dão-lhe uma ondulação que quase não se vê e
 * sem a qual o objeto deixa de ter matéria — a luz passa a bater igual em toda
 * a superfície, e uma superfície com iluminação constante lê-se como uma cor
 * chapada.
 *
 * Sete graus é o limite: acima disso a folha começa a parecer dobrada, e a
 * folha ainda não decidiu nada.
 */

const TILT = 7;
const BAND = 1 / 6;
const SKIRT = 0.5 - BAND;

const flat: Vec3[] = [
  [-0.5, -0.5, 0], // 0
  [0.5, -0.5, 0], //  1
  [0.5, -BAND, 0], // 2
  [-0.5, -BAND, 0], // 3
  [0.5, BAND, 0], //  4
  [-0.5, BAND, 0], // 5
  [0.5, 0.5, 0], //   6
  [-0.5, 0.5, 0], //  7
];

const radians = (TILT * Math.PI) / 180;
const drop = SKIRT * Math.sin(radians);
const reach = SKIRT * Math.cos(radians);

const rested: Vec3[] = [
  [-0.5, -BAND - reach, drop],
  [0.5, -BAND - reach, drop],
  [0.5, -BAND, 0],
  [-0.5, -BAND, 0],
  [0.5, BAND, 0],
  [-0.5, BAND, 0],
  [0.5, BAND + reach, -drop],
  [-0.5, BAND + reach, -drop],
];

export const sheetModel: AuthoredModel = {
  flat,
  stages: [{ title: "pousada", state: "flat", positions: rested }],
  faces: [
    [0, 1, 2, 3],
    [3, 2, 4, 5],
    [5, 4, 6, 7],
  ],
  edges: [
    [0, 1],
    [1, 2],
    [2, 4],
    [4, 6],
    [6, 7],
    [7, 5],
    [5, 3],
    [3, 0],
    [3, 2],
    [5, 4],
  ],
  boundary: [0, 1, 2, 3, 4, 5, 6, 7],
  // A banda do meio não se move: é dela que sai o referencial.
  anchor: { origin: 3, toward: 2, plane: 5 },
};
