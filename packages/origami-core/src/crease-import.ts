import type { AuthoredModel, AuthoredStage } from "./authoring";
import type {
  Assignment,
  OrigamiSemanticState,
  Vec2,
  Vec3,
} from "./fold-types";
import {
  buildPlanarSubdivision,
  type PlanarDiagnostics,
  type PlanarSegment,
} from "./planar";
import { parseCreasePatternSvg, SvgCreaseError } from "./svg-crease";

/**
 * De um SVG de padrão de vincos a um `AuthoredModel` que o pipeline já consome.
 *
 * O que este módulo faz de diferente dos modelos em `tools/origami/models/` é
 * só a origem da geometria: lá é escrita à mão e derivada por trigonometria,
 * aqui é lida de um desenho. Depois desta função, o caminho é exatamente o
 * mesmo — `authorFoldSource`, `validateFoldSource`, `bakeModel`, `compileModel`
 * — e é essa a razão de o importador entregar um `AuthoredModel` e não um
 * `FoldSource` já montado: um segundo caminho até ao asset seria um segundo
 * sítio onde os invariantes podem não ser aplicados.
 *
 * ## O que o padrão de vincos não diz, e como isso é declarado
 *
 * Um padrão de vincos diz **onde** e **em que sentido**. Não diz **quanto**.
 * A cor de um traço distingue monte de vale e não carrega amplitude nenhuma;
 * a convenção do domínio é que um padrão descreve o modelo completamente
 * dobrado, ou seja ±180° em cada vinco.
 *
 * Isto tem de ser dito porque é a única coisa que o importador acrescenta ao
 * ficheiro. `foldAngleDegrees` tem 178 por omissão pela mesma razão que
 * `deriveFoldAngles` limita aí: a 180° as duas faces são coplanares e o solver
 * perde o lado para onde empurrar. E `stages` existe porque levar todos os
 * vincos ao destino ao mesmo tempo é precisamente o que a base preliminar já
 * mostrou não assentar — quem importa um padrão real vai ter de dizer por onde
 * a dobragem passa, e o formato para o dizer é o mesmo dos modelos autorados.
 *
 * O que **não** acontece é o importador afirmar que o resultado dobra. Isso
 * quem responde é o bake, com números.
 */

export type CreaseImportOptions = {
  /**
   * Tolerância de soldadura, relativa ao lado da folha.
   *
   * Relativa e não absoluta: o mesmo padrão exportado a 400 px e a 40 tem de
   * dar o mesmo modelo. O valor por omissão é 1e-4 do lado — folgado o
   * suficiente para absorver o arredondamento a duas casas decimais que as
   * ferramentas de desenho produzem, e cerca de seiscentas vezes menor do que
   * a menor distância entre vincos de um padrão denso.
   */
  readonly weldTolerance?: number;
  /** Amplitude de um vinco completamente dobrado, em graus. */
  readonly foldAngleDegrees?: number;
  /**
   * Por onde a dobragem passa: frações da amplitude total, por ordem.
   *
   * Cada fração é uma etapa. O valor por omissão leva o padrão inteiro de uma
   * vez em dois passos — que é o caso mais simples e raramente o que um padrão
   * real precisa.
   */
  readonly stageFractions?: readonly number[];
  /** Quanto os lados do contorno podem diferir antes de a folha não ser quadrada. */
  readonly squareTolerance?: number;
};

export type CreaseImportCode =
  "NO_BOUNDARY" | "SHEET_NOT_SQUARE" | "SHEET_EMPTY" | "NO_CREASES";

export class CreaseImportError extends Error {
  constructor(
    readonly code: CreaseImportCode,
    readonly detail: string,
  ) {
    super(`${code}: ${detail}`);
    this.name = "CreaseImportError";
  }
}

export type CreaseImportReport = {
  readonly segmentsRead: number;
  readonly vertexCount: number;
  readonly edgeCount: number;
  readonly faceCount: number;
  readonly mountainCount: number;
  readonly valleyCount: number;
  readonly facetCount: number;
  readonly boundaryCount: number;
  /** Lado do contorno no ficheiro de origem, antes da normalização. */
  readonly sourceSide: number;
  readonly planar: PlanarDiagnostics;
};

export type CreaseImport = {
  readonly model: AuthoredModel;
  /** Atribuição por índice de aresta, na ordem de `model.edges`. */
  readonly assignments: readonly Assignment[];
  readonly report: CreaseImportReport;
};

const DEFAULTS = {
  weldTolerance: 1e-4,
  foldAngleDegrees: 178,
  stageFractions: [0.5, 1] as readonly number[],
  squareTolerance: 1e-3,
};

/**
 * Escolhe três vértices que servem de referencial durante a dobragem.
 *
 * Têm de ser três que não se movam um em relação ao outro, e há um sítio onde
 * isso é garantido por construção: **dentro de uma face**. Uma face é papel
 * que não dobra — os vincos estão todos nas suas arestas — portanto quaisquer
 * três dos seus vértices mantêm as distâncias em qualquer configuração.
 *
 * Escolhe-se a maior face, e dentro dela os três vértices que formam o maior
 * triângulo: um referencial assente em três pontos quase colineares amplifica
 * o ruído numérico até a orientação do modelo tremer entre frames.
 */
function chooseAnchor(
  faces: readonly (readonly number[])[],
  vertices: readonly Vec2[],
): {
  readonly origin: number;
  readonly toward: number;
  readonly plane: number;
} {
  const area = (face: readonly number[]): number => {
    let sum = 0;
    for (let index = 0; index < face.length; index += 1) {
      const p = vertices[face[index]!]!;
      const q = vertices[face[(index + 1) % face.length]!]!;
      sum += p[0] * q[1] - q[0] * p[1];
    }
    return Math.abs(sum) / 2;
  };

  const largest = faces.reduce((best, face) =>
    area(face) > area(best) ? face : best,
  );

  let origin = largest[0]!;
  let toward = largest[0]!;
  let plane = largest[0]!;
  let best = -1;

  // O maior triângulo inscrito na face. As faces têm poucos vértices e isto
  // corre uma vez por importação, portanto a força bruta é o custo certo.
  for (const a of largest) {
    for (const b of largest) {
      for (const c of largest) {
        if (a === b || b === c || a === c) continue;
        const pa = vertices[a]!;
        const pb = vertices[b]!;
        const pc = vertices[c]!;
        const value = Math.abs(
          (pb[0] - pa[0]) * (pc[1] - pa[1]) - (pb[1] - pa[1]) * (pc[0] - pa[0]),
        );
        if (value > best) {
          best = value;
          origin = a;
          toward = b;
          plane = c;
        }
      }
    }
  }

  return { origin, toward, plane };
}

/**
 * Importa um padrão de vincos em SVG.
 *
 * A normalização acontece **antes** do arranjo planar, e não depois, por duas
 * razões. A primeira é a tolerância: normalizar primeiro faz com que ela seja
 * de facto uma fração da folha. A segunda é o sinal — o SVG tem o `y` a
 * crescer para baixo e a folha canónica tem-no a crescer para cima, e é a
 * conversão que põe o desenho num referencial destro, com a frente do papel
 * virada para `+z`. Fazer a travessia de faces antes disso daria as faces no
 * sentido oposto, e o sentido das faces é o que fixa o sinal de cada ângulo
 * diedro: monte e vale trocariam de significado sem nada falhar.
 */
export function importCreasePattern(
  svg: string,
  options: CreaseImportOptions = {},
): CreaseImport {
  const weldTolerance = options.weldTolerance ?? DEFAULTS.weldTolerance;
  const foldAngle = options.foldAngleDegrees ?? DEFAULTS.foldAngleDegrees;
  const fractions = options.stageFractions ?? DEFAULTS.stageFractions;
  const squareTolerance = options.squareTolerance ?? DEFAULTS.squareTolerance;

  const segments = parseCreasePatternSvg(svg);

  const boundarySegments = segments.filter(
    (segment) => segment.assignment === "B",
  );
  if (!boundarySegments.length) {
    throw new CreaseImportError(
      "NO_BOUNDARY",
      "nenhuma linha a preto (#000000). O contorno do papel tem de estar desenhado: " +
        "é ele que diz qual é a folha, e sem ele o importador teria de a adivinhar a partir da extensão dos vincos.",
    );
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const segment of boundarySegments) {
    for (const point of [segment.a, segment.b]) {
      minX = Math.min(minX, point[0]);
      maxX = Math.max(maxX, point[0]);
      minY = Math.min(minY, point[1]);
      maxY = Math.max(maxY, point[1]);
    }
  }

  const width = maxX - minX;
  const height = maxY - minY;

  if (!(width > 0) || !(height > 0)) {
    throw new CreaseImportError(
      "SHEET_EMPTY",
      `o contorno mede ${width} × ${height}; não encerra folha nenhuma.`,
    );
  }

  // Esquadrar por escalas diferentes em `x` e `y` mudaria todos os ângulos do
  // padrão — que é a definição de importar outra coisa. Recusa-se com os dois
  // números, para que se veja de quanto se trata.
  const skew = Math.abs(width - height) / Math.max(width, height);
  if (skew > squareTolerance) {
    throw new CreaseImportError(
      "SHEET_NOT_SQUARE",
      `o contorno mede ${width.toFixed(4)} × ${height.toFixed(4)} (diferença de ${(skew * 100).toFixed(3)}%). ` +
        "Este produto só dobra folhas quadradas, e esticar uma para outra proporção mudaria todos os ângulos do padrão.",
    );
  }

  const scale = 2 / (width + height);
  const centreX = (minX + maxX) / 2;
  const centreY = (minY + maxY) / 2;

  const place = (point: Vec2): Vec2 => [
    (point[0] - centreX) * scale,
    -(point[1] - centreY) * scale,
  ];

  const placed: PlanarSegment[] = segments.map((segment) => ({
    a: place(segment.a),
    b: place(segment.b),
    assignment: segment.assignment,
    source: segment.source,
  }));

  const subdivision = buildPlanarSubdivision(placed, weldTolerance);

  const creaseEdges = subdivision.assignments
    .map((assignment, index) => ({ assignment, index }))
    .filter((entry) => entry.assignment === "M" || entry.assignment === "V");

  if (!creaseEdges.length) {
    throw new CreaseImportError(
      "NO_CREASES",
      "o padrão tem contorno mas nenhum monte nem vale: não há nada que dobre.",
    );
  }

  const flat: Vec3[] = subdivision.vertices.map((point) => [
    point[0],
    point[1],
    0,
  ]);

  const stages: AuthoredStage[] = fractions.map((fraction, index) => {
    const angles: Record<number, number> = {};
    for (const entry of creaseEdges) {
      angles[entry.index] =
        (entry.assignment === "M" ? -foldAngle : foldAngle) * fraction;
    }
    const last = index === fractions.length - 1;
    return {
      title: last
        ? "padrão dobrado"
        : `dobragem a ${Math.round(fraction * 100)}%`,
      state: (last ? "formed" : "forming") satisfies OrigamiSemanticState,
      angles,
    };
  });

  const model: AuthoredModel = {
    flat,
    stages,
    faces: subdivision.faces,
    edges: subdivision.edges,
    boundary: subdivision.boundary,
    anchor: chooseAnchor(subdivision.faces, subdivision.vertices),
  };

  const count = (assignment: Assignment): number =>
    subdivision.assignments.filter((value) => value === assignment).length;

  return {
    model,
    assignments: subdivision.assignments,
    report: {
      segmentsRead: segments.length,
      vertexCount: subdivision.vertices.length,
      edgeCount: subdivision.edges.length,
      faceCount: subdivision.faces.length,
      mountainCount: count("M"),
      valleyCount: count("V"),
      facetCount: count("F"),
      boundaryCount: count("B"),
      sourceSide: (width + height) / 2,
      planar: subdivision.diagnostics,
    },
  };
}

export { SvgCreaseError };
