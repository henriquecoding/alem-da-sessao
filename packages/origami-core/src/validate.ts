import {
  angleIsConsistent,
  CANONICAL_SHEET,
  type Assignment,
  type FoldSource,
  type Vec3,
} from "./fold-types";
import { distance, EPSILON, triangleQuality } from "./geometry";
import { buildMesh, edgeKey, sheetArea, toVec3 } from "./topology";

/**
 * Os invariantes que separam uma folha de um desenho.
 *
 * Vale a pena dizer o que o gate anterior deste repositório fazia, porque a
 * diferença é o núcleo desta reformulação. O `check:origami` que existe hoje
 * exige que **a soma das áreas das faces iguale a área da silhueta**. Para um
 * desenho plano isso apanha sobreposições por descuido, e foi útil. Para papel
 * dobrado é o contrário de um invariante: um origami tem camadas, a silhueta é
 * a projeção de várias folhas empilhadas, e a soma das áreas é necessariamente
 * *maior* do que a silhueta. Aquele gate não é apertado de mais — ele torna
 * impossível representar um modelo dobrado. É preciso substituí-lo, não afiná-lo.
 *
 * O que o substitui:
 *
 * | O que se conserva          | Como se mede                                |
 * | -------------------------- | ------------------------------------------- |
 * | a folha é uma só           | cada aresta tem 1 face (`B`) ou 2           |
 * | a folha não foi cortada    | zero `C`, fronteira é um circuito fechado   |
 * | a matéria não estica       | comprimento de cada aresta ao longo dos frames |
 * | a topologia não muda       | todos os frames indexam a mesma tabela      |
 * | mountain e valley têm sentido | sinal do ângulo confere com a atribuição |
 *
 * Nenhum destes números diz se o objeto é bonito. Dizem que ele é possível — e
 * a versão anterior falhava exatamente aí, não na estética.
 */

export type ValidationCode =
  | "FOLD_SPEC"
  | "CUT_PAPER"
  | "EMPTY_TOPOLOGY"
  | "ASSIGNMENT_LENGTH"
  | "ANGLE_LENGTH"
  | "INDEX_OUT_OF_RANGE"
  | "NON_FINITE_COORDINATE"
  | "ZERO_EDGE"
  | "CUT_NOT_ALLOWED"
  | "UNASSIGNED_EDGE"
  | "ANGLE_SIGN"
  | "INVALID_FACE"
  | "MISSING_EDGE"
  | "NON_MANIFOLD_EDGE"
  | "OPEN_BOUNDARY"
  | "DEGENERATE_TRIANGLE"
  | "FRAME_TOPOLOGY_CHANGED"
  | "SHEET_NOT_SQUARE"
  | "SHEET_NOT_FLAT";

export class OrigamiValidationError extends Error {
  constructor(
    readonly code: ValidationCode,
    readonly detail: string,
  ) {
    super(`${code}: ${detail}`);
    this.name = "OrigamiValidationError";
  }
}

const ALLOWED_ASSIGNMENTS: readonly string[] = ["B", "M", "V", "F", "J"];

/** Abaixo disto o triângulo é fino de mais para o solver o tratar bem (§2.7). */
export const TRIANGLE_QUALITY_REJECT = 0.05;
export const TRIANGLE_QUALITY_WARN = 0.12;

export type ValidationWarning = {
  readonly code: string;
  readonly detail: string;
};

export type ValidationReport = {
  readonly modelId: string;
  readonly vertexCount: number;
  readonly edgeCount: number;
  readonly faceCount: number;
  readonly triangleCount: number;
  readonly creaseCount: number;
  readonly mountainCount: number;
  readonly valleyCount: number;
  readonly sheetArea: number;
  readonly worstTriangleQuality: number;
  readonly warnings: readonly ValidationWarning[];
};

function assertIndex(index: number, count: number, context: string): void {
  if (!Number.isInteger(index) || index < 0 || index >= count) {
    throw new OrigamiValidationError(
      "INDEX_OUT_OF_RANGE",
      `${context}: ${index} não pertence a [0, ${count - 1}]`,
    );
  }
}

function assertFinite(point: Vec3, context: string): void {
  for (const value of point) {
    if (!Number.isFinite(value)) {
      throw new OrigamiValidationError(
        "NON_FINITE_COORDINATE",
        `${context}: coordenada ${value}`,
      );
    }
  }
}

/**
 * Valida o source e devolve o relatório.
 *
 * Lança na primeira violação em vez de acumular. Um modelo com a topologia
 * partida produz erros derivados que escondem o primeiro, e o primeiro é o
 * único que interessa a quem está a autorar.
 */
export type ValidationOptions = {
  /**
   * Abaixo desta qualidade um triângulo é recusado.
   *
   * Tem 0,05 por omissão, e para modelos autorados aqui é o valor certo: um
   * triângulo fino num modelo escrito à mão é um erro de autoria, e o solver
   * trata-o mal.
   *
   * Um padrão de vincos real não obedece a isto. O grou tradicional do
   * OrigamiSimulator tem faces cuja triangulação desce a 0,013 — e o paper
   * deles descreve exatamente este caso («high-aspect-ratio triangles may pose
   * a problem in simulation»), sem o recusar: mitiga-o com rigidez e com
   * triangulação escolhida à mão. Baixar o valor é como se importa um padrão
   * que não foi desenhado para este gate, e sabendo o que se está a aceitar.
   */
  readonly triangleQualityReject?: number;
};

export function validateFoldSource(
  source: FoldSource,
  options: ValidationOptions = {},
): ValidationReport {
  const qualityReject =
    options.triangleQualityReject ?? TRIANGLE_QUALITY_REJECT;
  if (source.file_spec !== 1.2) {
    throw new OrigamiValidationError(
      "FOLD_SPEC",
      `é exigido FOLD 1.2 e o ficheiro declara ${String(source.file_spec)}`,
    );
  }

  if (!source["ads:paper"]?.uncut) {
    throw new OrigamiValidationError(
      "CUT_PAPER",
      "a metáfora exige uma folha íntegra; `ads:paper.uncut` tem de ser verdadeiro",
    );
  }

  const vertices = (source.vertices_coords ?? []).map(toVec3);
  const edges = source.edges_vertices ?? [];
  const assignments = source.edges_assignment ?? [];
  const angles = source.edges_foldAngle ?? [];
  const faces = source.faces_vertices ?? [];

  if (!vertices.length || !edges.length || !faces.length) {
    throw new OrigamiValidationError(
      "EMPTY_TOPOLOGY",
      "`vertices_coords`, `edges_vertices` e `faces_vertices` são todos obrigatórios",
    );
  }

  if (assignments.length !== edges.length) {
    throw new OrigamiValidationError(
      "ASSIGNMENT_LENGTH",
      `edges_assignment tem ${assignments.length} entradas para ${edges.length} arestas`,
    );
  }

  if (angles.length && angles.length !== edges.length) {
    throw new OrigamiValidationError(
      "ANGLE_LENGTH",
      `edges_foldAngle tem ${angles.length} entradas para ${edges.length} arestas`,
    );
  }

  vertices.forEach((point, index) => assertFinite(point, `vértice ${index}`));

  // A folha canónica: quadrada, plana e do tamanho combinado. Todos os ramos
  // partem daqui, e é isso — e não a narrativa — que justifica dizer que é a
  // mesma folha.
  const bounds = vertices.reduce(
    (box, point) => ({
      minX: Math.min(box.minX, point[0]),
      maxX: Math.max(box.maxX, point[0]),
      minY: Math.min(box.minY, point[1]),
      maxY: Math.max(box.maxY, point[1]),
      maxAbsZ: Math.max(box.maxAbsZ, Math.abs(point[2])),
    }),
    {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
      maxAbsZ: 0,
    },
  );

  if (bounds.maxAbsZ > 1e-6) {
    throw new OrigamiValidationError(
      "SHEET_NOT_FLAT",
      `o frame do padrão de vincos tem z = ${bounds.maxAbsZ.toFixed(6)}; a folha de partida é plana`,
    );
  }

  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const side = CANONICAL_SHEET.halfSize * 2;
  if (Math.abs(width - side) > 1e-6 || Math.abs(height - side) > 1e-6) {
    throw new OrigamiValidationError(
      "SHEET_NOT_SQUARE",
      `a folha mede ${width.toFixed(4)} × ${height.toFixed(4)} e a folha canónica mede ${side} × ${side}`,
    );
  }

  const incidentFaces = new Map<string, number[]>();

  edges.forEach(([a, b], edgeIndex) => {
    assertIndex(a, vertices.length, `aresta ${edgeIndex}`);
    assertIndex(b, vertices.length, `aresta ${edgeIndex}`);

    const assignment = assignments[edgeIndex] as Assignment;
    if (assignment === ("C" as Assignment)) {
      throw new OrigamiValidationError(
        "CUT_NOT_ALLOWED",
        `aresta ${edgeIndex} usa "C"; cortar a folha não é permitido`,
      );
    }
    if (assignment === ("U" as Assignment)) {
      throw new OrigamiValidationError(
        "UNASSIGNED_EDGE",
        `aresta ${edgeIndex} usa "U"; um vinco sem sentido declarado não é compilável`,
      );
    }
    if (!ALLOWED_ASSIGNMENTS.includes(assignment)) {
      throw new OrigamiValidationError(
        "UNASSIGNED_EDGE",
        `aresta ${edgeIndex} usa "${assignment}", que não está entre ${ALLOWED_ASSIGNMENTS.join(", ")}`,
      );
    }

    if (a === b || distance(vertices[a]!, vertices[b]!) <= EPSILON) {
      throw new OrigamiValidationError(
        "ZERO_EDGE",
        `aresta ${edgeIndex} liga ${a} a ${b} e tem comprimento nulo`,
      );
    }

    if (angles.length) {
      const declared = angles[edgeIndex] ?? null;
      const radians = declared === null ? null : (declared * Math.PI) / 180;
      if (!angleIsConsistent(assignment, radians)) {
        throw new OrigamiValidationError(
          "ANGLE_SIGN",
          `aresta ${edgeIndex}: atribuição "${assignment}" contradiz o ângulo ${String(declared)}°`,
        );
      }
    }

    incidentFaces.set(edgeKey(a, b), []);
  });

  faces.forEach((face, faceIndex) => {
    const unique = new Set(face);
    if (face.length < 3 || unique.size !== face.length) {
      throw new OrigamiValidationError(
        "INVALID_FACE",
        `face ${faceIndex} tem ${face.length} vértices, ${unique.size} distintos`,
      );
    }

    face.forEach((vertex) =>
      assertIndex(vertex, vertices.length, `face ${faceIndex}`),
    );

    for (let index = 0; index < face.length; index += 1) {
      const a = face[index]!;
      const b = face[(index + 1) % face.length]!;
      const key = edgeKey(a, b);
      const list = incidentFaces.get(key);
      if (!list) {
        throw new OrigamiValidationError(
          "MISSING_EDGE",
          `face ${faceIndex} percorre ${a}→${b}, que não está declarada em edges_vertices`,
        );
      }
      list.push(faceIndex);
    }
  });

  edges.forEach(([a, b], edgeIndex) => {
    const assignment = assignments[edgeIndex] as Assignment;
    const count = incidentFaces.get(edgeKey(a, b))?.length ?? 0;
    const expected = assignment === "B" ? 1 : 2;
    if (count !== expected) {
      throw new OrigamiValidationError(
        "NON_MANIFOLD_EDGE",
        `aresta ${edgeIndex} ("${assignment}") toca ${count} faces; "${assignment}" exige ${expected}`,
      );
    }
  });

  // A fronteira tem de ser um circuito fechado: cada vértice da fronteira
  // pertence a exatamente duas arestas `B`. Uma folha com a fronteira aberta é
  // uma folha rasgada, mesmo que nenhuma aresta esteja marcada como corte.
  const boundaryDegree = new Map<number, number>();
  edges.forEach(([a, b], edgeIndex) => {
    if (assignments[edgeIndex] !== "B") return;
    boundaryDegree.set(a, (boundaryDegree.get(a) ?? 0) + 1);
    boundaryDegree.set(b, (boundaryDegree.get(b) ?? 0) + 1);
  });
  for (const [vertex, degree] of boundaryDegree) {
    if (degree !== 2) {
      throw new OrigamiValidationError(
        "OPEN_BOUNDARY",
        `o vértice ${vertex} tem ${degree} arestas de fronteira; um contorno fechado exige 2`,
      );
    }
  }

  for (const [index, frame] of (source.file_frames ?? []).entries()) {
    if (
      frame.vertices_coords &&
      frame.vertices_coords.length !== vertices.length
    ) {
      throw new OrigamiValidationError(
        "FRAME_TOPOLOGY_CHANGED",
        `frame ${index} declara ${frame.vertices_coords.length} vértices e a folha tem ${vertices.length}`,
      );
    }
    if (frame.edges_vertices || frame.faces_vertices) {
      throw new OrigamiValidationError(
        "FRAME_TOPOLOGY_CHANGED",
        `frame ${index} redefine arestas ou faces; depois do primeiro vinco a malha não muda`,
      );
    }
  }

  const mesh = buildMesh(source);
  const warnings: ValidationWarning[] = [];
  let worstQuality = 1;

  mesh.triangles.forEach((triangle, index) => {
    const [a, b, c] = triangle.indices;
    const quality = triangleQuality(
      mesh.restPositions[a]!,
      mesh.restPositions[b]!,
      mesh.restPositions[c]!,
    );
    worstQuality = Math.min(worstQuality, quality);

    if (quality < qualityReject) {
      throw new OrigamiValidationError(
        "DEGENERATE_TRIANGLE",
        `triângulo ${index} (face ${triangle.faceIndex}) tem qualidade ${quality.toFixed(4)}, abaixo de ${qualityReject}`,
      );
    }
    if (quality < TRIANGLE_QUALITY_WARN) {
      warnings.push({
        code: "THIN_TRIANGLE",
        detail: `triângulo ${index} (face ${triangle.faceIndex}) tem qualidade ${quality.toFixed(4)}`,
      });
    }
  });

  const creaseAssignments = mesh.creases.map((crease) => crease.assignment);

  return {
    modelId: source["ads:modelId"],
    vertexCount: vertices.length,
    edgeCount: edges.length,
    faceCount: faces.length,
    triangleCount: mesh.triangles.length,
    creaseCount: mesh.creases.length,
    mountainCount: creaseAssignments.filter((a) => a === "M").length,
    valleyCount: creaseAssignments.filter((a) => a === "V").length,
    sheetArea: sheetArea(mesh),
    worstTriangleQuality: worstQuality,
    warnings,
  };
}
