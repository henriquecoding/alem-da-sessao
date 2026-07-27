/**
 * O cubo de seis faces — o modelo, sem interface.
 *
 * Um cubo 3×3 é aqui um objeto de acoplamento, não um puzzle: cada face é uma
 * área que a pessoa nomeia, e girar uma face **obriga** peças das outras a
 * mover-se. Essa é a única afirmação que o objeto faz, e faz--la por
 * construção em vez de por texto — não se muda uma coisa isoladamente.
 *
 * Três restrições herdadas do §4.1 e dos anti-padrões vivem neste ficheiro:
 *
 * 1. **Não há estado resolvido.** Não existe `isSolved`, não se conta
 *    movimentos e não se mede distância a coisa nenhuma. Um cubo com uma
 *    solução transformaria a pessoa num problema com resposta certa, e o
 *    tempo até lá numa pontuação — o anti-padrão #1 pela porta dos fundos.
 * 2. **Nada é aleatório.** A desordem inicial é derivada das palavras da
 *    própria pessoa por um hash estável. O cubo dela é o cubo dela: reabre
 *    igual daqui a um ano, o que é o que o artefacto determinístico exige.
 * 3. **Regista forma, não valor.** O que sai daqui é que configuração existe e
 *    o que se moveu com o quê — nunca se está melhor ou pior.
 *
 * O modelo é geométrico em vez de tabelado: cada peça tem posição e orientação
 * e uma rotação de camada aplica a mesma matriz inteira a ambas. Sai mais
 * código do que uma tabela de permutações copiada, mas é correto por
 * construção e verificável — uma tabela errada só se descobre a olhar.
 */

import { stableHash } from "./artifact";

/** As seis faces, na ordem em que a interface as apresenta. */
export const FACES = [
  "cima",
  "esquerda",
  "frente",
  "direita",
  "tras",
  "baixo",
] as const;

export type Face = (typeof FACES)[number];

/** Normal exterior de cada face, no referencial do cubo. */
const NORMALS: Record<Face, Vec> = {
  cima: [0, 1, 0],
  baixo: [0, -1, 0],
  frente: [0, 0, 1],
  tras: [0, 0, -1],
  direita: [1, 0, 0],
  esquerda: [-1, 0, 0],
};

type Vec = readonly [number, number, number];
/** Matriz 3×3 de inteiros, por linhas. */
type Mat = readonly [Vec, Vec, Vec];

const IDENTITY: Mat = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

/** Rotação de 90° em torno de um eixo, no sentido direto. */
function rotation(axis: 0 | 1 | 2): Mat {
  if (axis === 0) {
    return [
      [1, 0, 0],
      [0, 0, -1],
      [0, 1, 0],
    ];
  }
  if (axis === 1) {
    return [
      [0, 0, 1],
      [0, 1, 0],
      [-1, 0, 0],
    ];
  }
  return [
    [0, -1, 0],
    [1, 0, 0],
    [0, 0, 1],
  ];
}

function apply(matrix: Mat, vector: Vec): Vec {
  return [
    matrix[0][0] * vector[0] +
      matrix[0][1] * vector[1] +
      matrix[0][2] * vector[2],
    matrix[1][0] * vector[0] +
      matrix[1][1] * vector[1] +
      matrix[1][2] * vector[2],
    matrix[2][0] * vector[0] +
      matrix[2][1] * vector[1] +
      matrix[2][2] * vector[2],
  ];
}

function multiply(a: Mat, b: Mat): Mat {
  const row = (index: 0 | 1 | 2): Vec => [
    a[index][0] * b[0][0] + a[index][1] * b[1][0] + a[index][2] * b[2][0],
    a[index][0] * b[0][1] + a[index][1] * b[1][1] + a[index][2] * b[2][1],
    a[index][0] * b[0][2] + a[index][1] * b[1][2] + a[index][2] * b[2][2],
  ];
  return [row(0), row(1), row(2)];
}

/** Uma peça: onde está, e como está virada em relação a como nasceu. */
export type Piece = {
  position: Vec;
  orientation: Mat;
};

export type CubeState = readonly Piece[];

/** O cubo assente: cada face inteira de uma cor, cada peça na origem. */
export function restingCube(): CubeState {
  const pieces: Piece[] = [];
  for (let x = -1; x <= 1; x += 1) {
    for (let y = -1; y <= 1; y += 1) {
      for (let z = -1; z <= 1; z += 1) {
        if (x === 0 && y === 0 && z === 0) continue;
        pieces.push({ position: [x, y, z], orientation: IDENTITY });
      }
    }
  }
  return pieces;
}

const AXIS_OF: Record<Face, 0 | 1 | 2> = {
  direita: 0,
  esquerda: 0,
  cima: 1,
  baixo: 1,
  frente: 2,
  tras: 2,
};

/** A camada que cada face arrasta: +1 ou −1 ao longo do seu eixo. */
function layerOf(face: Face): number {
  const normal = NORMALS[face];
  return normal[AXIS_OF[face]];
}

/**
 * Gira uma face um quarto de volta.
 *
 * Devolve o novo estado **e** quais as outras faces cujas peças vieram atrás —
 * é esse segundo valor que a experiência mostra à pessoa, porque é ele que diz
 * a coisa toda: mexeu-se aqui, e aquilo ali moveu-se sem ter sido convidado.
 */
export function turn(
  state: CubeState,
  face: Face,
): { state: CubeState; moved: readonly Face[] } {
  const axis = AXIS_OF[face];
  const layer = layerOf(face);
  // Uma face gira no seu próprio sentido: a camada negativa vê o mesmo
  // movimento espelhado, e sem isto `esquerda` rodaria ao contrário de si.
  const base = rotation(axis);
  const matrix = layer >= 0 ? base : multiply(multiply(base, base), base);

  const movedFaces = new Set<Face>();
  const next = state.map((piece) => {
    if (piece.position[axis] !== layer) return piece;

    for (const candidate of FACES) {
      if (candidate === face) continue;
      // Uma peça pertence visualmente a uma face se toca nela.
      const normal = NORMALS[candidate];
      const touches =
        piece.position[AXIS_OF[candidate]] === normal[AXIS_OF[candidate]];
      if (touches) movedFaces.add(candidate);
    }

    return {
      position: apply(matrix, piece.position),
      orientation: multiply(matrix, piece.orientation),
    };
  });

  return { state: next, moved: FACES.filter((item) => movedFaces.has(item)) };
}

/**
 * A cor que uma peça mostra numa dada face — isto é, de que face ela veio.
 *
 * A orientação diz como a peça foi virada desde a origem; desfazê-la sobre a
 * normal atual devolve a normal original, e portanto a face de nascimento.
 */
export function originFace(piece: Piece, showing: Face): Face | null {
  const normal = NORMALS[showing];
  if (piece.position[AXIS_OF[showing]] !== normal[AXIS_OF[showing]])
    return null;

  // A orientação é uma rotação: a inversa é a transposta.
  const transposed: Mat = [
    [piece.orientation[0][0], piece.orientation[1][0], piece.orientation[2][0]],
    [piece.orientation[0][1], piece.orientation[1][1], piece.orientation[2][1]],
    [piece.orientation[0][2], piece.orientation[1][2], piece.orientation[2][2]],
  ];
  const original = apply(transposed, normal);

  for (const candidate of FACES) {
    const target = NORMALS[candidate];
    if (
      original[0] === target[0] &&
      original[1] === target[1] &&
      original[2] === target[2]
    ) {
      return candidate;
    }
  }
  return null;
}

/**
 * A desordem inicial, derivada do que a pessoa nomeou.
 *
 * Nada de `Math.random`: as palavras dela são a semente, por hash estável. Duas
 * consequências, ambas deliberadas — o cubo dela reabre exatamente igual daqui
 * a um ano (o artefacto exige-o), e a desordem de onde parte é a dela e não uma
 * que o produto lhe atribuiu.
 */
export function scrambleFrom(
  labels: readonly string[],
  turns = 12,
): { state: CubeState; sequence: readonly Face[] } {
  const seed = labels.map((label) => label.trim().toLowerCase()).join("|");
  const sequence: Face[] = [];
  let state = restingCube();

  for (let index = 0; index < turns; index += 1) {
    const face = FACES[stableHash(`${seed}#${index}`) % FACES.length]!;
    sequence.push(face);
    state = turn(state, face).state;
  }

  return { state, sequence };
}

/**
 * Quantas peças de cada face estão fora da face onde nasceram.
 *
 * Isto **não** é um score e não deve ser apresentado como um: não há alvo, não
 * há direção boa e o número não melhora com nada. Existe porque o artefacto
 * desenha a configuração, e desenhar exige saber o que está onde.
 */
export function displacement(state: CubeState): Record<Face, number> {
  const counts = Object.fromEntries(FACES.map((face) => [face, 0])) as Record<
    Face,
    number
  >;

  for (const piece of state) {
    for (const face of FACES) {
      const origin = originFace(piece, face);
      if (origin !== null && origin !== face) counts[face] += 1;
    }
  }

  return counts;
}
