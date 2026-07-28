import type { AuthoredModel, Vec3 } from "@alem-da-sessao/origami-core";

/**
 * A folha suspensa — «manter em suspenso».
 *
 * Quatro vincos paralelos, todos no mesmo sentido e todos pequenos. Não é um
 * acordeão: um acordeão alterna monte e vale e lê-se como um objeto decidido,
 * com uma estrutura. Aqui todos os vincos vão para o mesmo lado, e o que sai é
 * uma folha enrolada — a forma que o papel toma quando é largado e ninguém o
 * pousou.
 *
 * É o único da família que não fecha em nada. O objeto é o próprio adiamento, e
 * teria sido fácil e errado dar-lhe uma forma mais definida: uma decisão
 * suspensa que se lesse como um objeto acabado seria a interface a mentir sobre
 * o que a pessoa escolheu.
 *
 * ## Como se constrói
 *
 * Cada faixa mede `0,2` e cada vinco roda mais `18°` que o anterior, portanto a
 * folha percorre `72°` do início ao fim. Andar ao longo das faixas somando a
 * direção de cada uma garante a isometria por construção — o comprimento nunca
 * entra na conta, só a direção muda.
 */

const BANDS = 5;
const BAND = 1 / BANDS;
const TURN = 18;

const levels = Array.from(
  { length: BANDS + 1 },
  (_, index) => -0.5 + index * BAND,
);

const flat: Vec3[] = levels.flatMap((y): Vec3[] => [
  [-0.5, y, 0],
  [0.5, y, 0],
]);

/**
 * A folha enrolada.
 *
 * O passeio começa na primeira faixa, deitada, e a cada vinco a direção roda
 * `TURN` graus para baixo. A posição de cada nível é a anterior mais uma faixa
 * na direção atual.
 */
const curled: Vec3[] = (() => {
  const points: Vec3[] = [];
  let y = -0.5;
  let z = 0;

  for (let level = 0; level <= BANDS; level += 1) {
    points.push([-0.5, y, z], [0.5, y, z]);
    const angle = (level * TURN * Math.PI) / 180;
    y += BAND * Math.cos(angle);
    z -= BAND * Math.sin(angle);
  }

  return points;
})();

const faces = Array.from({ length: BANDS }, (_, band) => {
  const bottom = band * 2;
  return [bottom, bottom + 1, bottom + 3, bottom + 2];
});

const edges: (readonly [number, number])[] = [
  // Bordo de baixo.
  [0, 1],
  // Lado direito, a subir.
  ...Array.from(
    { length: BANDS },
    (_, band) => [band * 2 + 1, band * 2 + 3] as const,
  ),
  // Bordo de cima.
  [BANDS * 2 + 1, BANDS * 2],
  // Lado esquerdo, a descer.
  ...Array.from(
    { length: BANDS },
    (_, band) => [(BANDS - band) * 2, (BANDS - band - 1) * 2] as const,
  ),
  // Os vincos.
  ...Array.from(
    { length: BANDS - 1 },
    (_, crease) => [(crease + 1) * 2, (crease + 1) * 2 + 1] as const,
  ),
];

export const suspendedSheetModel: AuthoredModel = {
  flat,
  stages: [{ title: "enrolada", state: "formed", positions: curled }],
  faces,
  edges,
  boundary: Array.from({ length: 2 * BANDS + 2 }, (_, index) => index),
  // A primeira faixa não roda: é ela que segura o referencial.
  anchor: { origin: 0, toward: 1, plane: 2 },
};
