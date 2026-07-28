import {
  isCreaseAssignment,
  type Assignment,
  type Edge,
  type FoldSource,
  type Vec2,
  type Vec3,
} from "./fold-types";
import {
  cross,
  distance,
  dot,
  EPSILON,
  normalize,
  subtract,
  triangleArea,
} from "./geometry";

/**
 * De um ficheiro FOLD para uma malha que um solver consegue resolver.
 *
 * Três coisas acontecem aqui, e a ordem entre elas não é negociável.
 *
 * **1. A triangulação é feita uma vez, sobre a folha plana.** O renderizador
 * desenha triângulos e o solver resolve triângulos, mas o autor desenha
 * polígonos — um quadrado da folha é um quadrado, não dois triângulos. A
 * triangulação acontece no padrão de vincos, antes de qualquer dobra, e os
 * índices que dela saem valem para todos os frames. É isto que dá sentido à
 * frase «a mesma folha»: não é uma metáfora editorial, é a garantia de que o
 * frame 0 e o frame 40 indexam a mesma tabela de vértices.
 *
 * **2. As diagonais da triangulação não são vincos.** São arestas `F`, com
 * ângulo-alvo zero, e existem para que uma face poligonal não se enrole sobre
 * si própria — o papel resiste a deixar de ser plano dentro de uma face. Se
 * aparecessem desenhadas junto dos vincos verdadeiros, o modelo passava a
 * exibir linhas que o papel nunca teve.
 *
 * **3. Um vinco só existe onde há duas faces.** A aresta da fronteira tem uma
 * face e não dobra; a aresta interior tem duas e dobra. Qualquer outra
 * contagem não é uma folha, e o validador recusa-a antes de o solver correr.
 */

export type MeshTriangle = {
  readonly indices: readonly [number, number, number];
  /** Qual das faces do source originou este triângulo. */
  readonly faceIndex: number;
};

export type MeshEdge = {
  readonly vertices: Edge;
  readonly assignment: Assignment;
  /** Radianos. `null` na fronteira. */
  readonly targetAngle: number | null;
  readonly restLength: number;
  /** Índices dos triângulos incidentes. Um na fronteira, dois no interior. */
  readonly triangles: readonly number[];
  /** Verdadeiro para as diagonais criadas pela triangulação. */
  readonly derived: boolean;
};

export type MeshCrease = {
  readonly edgeIndex: number;
  readonly assignment: Assignment;
  readonly targetAngle: number;
  /** `p1`, `p2` da aresta e os dois ápices, na ordem de `dihedralAngleAndGradients`. */
  readonly p1: number;
  readonly p2: number;
  readonly apexA: number;
  readonly apexB: number;
};

export type OrigamiMesh = {
  /** A folha plana. É a referência de comprimento para todo o resto. */
  readonly restPositions: readonly Vec3[];
  readonly triangles: readonly MeshTriangle[];
  readonly edges: readonly MeshEdge[];
  readonly creases: readonly MeshCrease[];
  /** As arestas `B`, para o contorno da silhueta. */
  readonly boundaryEdges: readonly number[];
  readonly faceCount: number;
};

export function toVec3(value: Vec2 | Vec3 | readonly number[]): Vec3 {
  return [value[0] ?? 0, value[1] ?? 0, value[2] ?? 0];
}

export function edgeKey(a: number, b: number): string {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

/**
 * Normal de um polígono pelo método de Newell.
 *
 * Robusto a polígonos não perfeitamente planos e a vértices colineares, ao
 * contrário do produto vetorial de três vértices consecutivos — que devolve
 * zero exatamente nos casos em que a triangulação mais precisa de uma resposta.
 */
export function polygonNormal(points: readonly Vec3[]): Vec3 {
  let x = 0;
  let y = 0;
  let z = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index]!;
    const next = points[(index + 1) % points.length]!;
    x += (current[1] - next[1]) * (current[2] + next[2]);
    y += (current[2] - next[2]) * (current[0] + next[0]);
    z += (current[0] - next[0]) * (current[1] + next[1]);
  }
  return normalize([x, y, z]);
}

/**
 * Triangulação por corte de orelhas, no plano da própria face.
 *
 * Não é uma triangulação em leque a partir do primeiro vértice: num polígono
 * côncavo — e a caixa masu tem vários — o leque produz triângulos fora da face.
 * O corte de orelhas custa `O(n²)` e as faces aqui têm menos de dez vértices,
 * portanto o custo é irrelevante e a correção não é.
 *
 * Devolve triplos de índices **locais** ao polígono.
 */
export function triangulatePolygon(
  points: readonly Vec3[],
): readonly (readonly [number, number, number])[] {
  if (points.length < 3) return [];
  if (points.length === 3) return [[0, 1, 2]];

  const normal = polygonNormal(points);

  // Base ortonormal no plano da face, para reduzir o problema a 2D.
  const reference: Vec3 = Math.abs(normal[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const axisU = normalize(cross(normal, reference));
  const axisV = cross(normal, axisU);

  const flat = points.map((point): Vec2 => [
    dot(point, axisU),
    dot(point, axisV),
  ]);

  const signedArea = (indices: readonly number[]): number => {
    let sum = 0;
    for (let index = 0; index < indices.length; index += 1) {
      const [x1, y1] = flat[indices[index]!]!;
      const [x2, y2] = flat[indices[(index + 1) % indices.length]!]!;
      sum += x1 * y2 - x2 * y1;
    }
    return sum / 2;
  };

  const remaining = points.map((_, index) => index);
  // Trabalhar sempre no mesmo sentido evita ter de testar as duas convenções
  // de «orelha» mais abaixo.
  if (signedArea(remaining) < 0) remaining.reverse();

  const isConvex = (a: number, b: number, c: number): boolean => {
    const [ax, ay] = flat[a]!;
    const [bx, by] = flat[b]!;
    const [cx, cy] = flat[c]!;
    return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax) > EPSILON;
  };

  const containsPoint = (
    a: number,
    b: number,
    c: number,
    p: number,
  ): boolean => {
    const [ax, ay] = flat[a]!;
    const [bx, by] = flat[b]!;
    const [cx, cy] = flat[c]!;
    const [px, py] = flat[p]!;
    const d1 = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
    const d2 = (cx - bx) * (py - by) - (cy - by) * (px - bx);
    const d3 = (ax - cx) * (py - cy) - (ay - cy) * (px - cx);
    return d1 >= -EPSILON && d2 >= -EPSILON && d3 >= -EPSILON;
  };

  const triangles: (readonly [number, number, number])[] = [];
  let guard = remaining.length * remaining.length + 16;

  while (remaining.length > 3 && guard-- > 0) {
    let clipped = false;

    for (let index = 0; index < remaining.length; index += 1) {
      const a = remaining[(index + remaining.length - 1) % remaining.length]!;
      const b = remaining[index]!;
      const c = remaining[(index + 1) % remaining.length]!;

      if (!isConvex(a, b, c)) continue;

      const swallowsAnother = remaining.some(
        (candidate) =>
          candidate !== a &&
          candidate !== b &&
          candidate !== c &&
          containsPoint(a, b, c, candidate),
      );
      if (swallowsAnother) continue;

      triangles.push([a, b, c]);
      remaining.splice(index, 1);
      clipped = true;
      break;
    }

    // Nenhuma orelha num polígono com mais de três vértices significa que ele
    // se auto-interseta. Falhar aqui é melhor do que devolver uma malha que o
    // solver aceita e o olho recusa.
    if (!clipped) {
      throw new Error(
        "origami: face sem orelha para cortar — o polígono auto-interseta-se ou tem vértices repetidos.",
      );
    }
  }

  if (remaining.length === 3) {
    triangles.push([remaining[0]!, remaining[1]!, remaining[2]!]);
  }

  return triangles;
}

/**
 * Constrói a malha resolvível a partir do frame plano do source.
 *
 * O frame plano é a verdade: comprimentos de repouso, triangulação e índices
 * saem todos daqui. Os frames dobrados que o ficheiro traga servem para semear
 * o solver, nunca para redefinir a topologia.
 */
export function buildMesh(source: FoldSource): OrigamiMesh {
  const restPositions = (source.vertices_coords ?? []).map(toVec3);
  const sourceEdges = source.edges_vertices ?? [];
  const assignments = source.edges_assignment ?? [];
  const angles = source.edges_foldAngle ?? [];
  const faces = source.faces_vertices ?? [];

  const triangles: MeshTriangle[] = [];
  const edgeIndexByKey = new Map<string, number>();
  const edges: {
    vertices: Edge;
    assignment: Assignment;
    targetAngle: number | null;
    restLength: number;
    triangles: number[];
    derived: boolean;
  }[] = [];

  const registerEdge = (
    a: number,
    b: number,
    assignment: Assignment,
    targetAngle: number | null,
    derived: boolean,
  ): number => {
    const key = edgeKey(a, b);
    const existing = edgeIndexByKey.get(key);
    if (existing !== undefined) return existing;

    const index = edges.length;
    edgeIndexByKey.set(key, index);
    edges.push({
      vertices: [a, b],
      assignment,
      targetAngle,
      restLength: distance(restPositions[a]!, restPositions[b]!),
      triangles: [],
      derived,
    });
    return index;
  };

  // As arestas declaradas pelo autor entram primeiro, para que uma diagonal da
  // triangulação nunca possa reivindicar uma aresta que já tem sentido.
  sourceEdges.forEach(([a, b], index) => {
    const assignment = assignments[index] ?? "F";
    const declared = angles[index];
    const targetAngle =
      assignment === "B" ? null : ((declared ?? 0) * Math.PI) / 180;
    registerEdge(a, b, assignment, targetAngle, false);
  });

  faces.forEach((face, faceIndex) => {
    const points = face.map((vertex) => restPositions[vertex]!);
    const local = triangulatePolygon(points);

    for (const [a, b, c] of local) {
      const triangleIndex = triangles.length;
      triangles.push({
        indices: [face[a]!, face[b]!, face[c]!],
        faceIndex,
      });

      for (const [from, to] of [
        [face[a]!, face[b]!],
        [face[b]!, face[c]!],
        [face[c]!, face[a]!],
      ] as const) {
        const index = registerEdge(from, to, "F", 0, true);
        edges[index]!.triangles.push(triangleIndex);
      }
    }
  });

  /**
   * Os dois ápices de um vinco.
   *
   * Cada triângulo incidente contribui com o vértice que não pertence à aresta.
   * A ordem — qual é `apexA` e qual é `apexB` — segue a ordem dos triângulos,
   * que segue a ordem das faces no ficheiro. É determinística, e é o que fixa o
   * sinal do ângulo: trocar os dois transformaria mountain em valley.
   */
  const apexOf = (triangleIndex: number, a: number, b: number): number => {
    const [x, y, z] = triangles[triangleIndex]!.indices;
    if (x !== a && x !== b) return x;
    if (y !== a && y !== b) return y;
    return z;
  };

  const creases: MeshCrease[] = [];
  edges.forEach((edge, edgeIndex) => {
    if (!isCreaseAssignment(edge.assignment)) return;
    if (edge.triangles.length !== 2) return;

    const [a, b] = edge.vertices;
    const [triangleA, triangleB] = edge.triangles as [number, number];

    creases.push({
      edgeIndex,
      assignment: edge.assignment,
      targetAngle: edge.targetAngle ?? 0,
      p1: a,
      p2: b,
      apexA: apexOf(triangleA, a, b),
      apexB: apexOf(triangleB, a, b),
    });
  });

  return {
    restPositions,
    triangles,
    edges: edges.map((edge) => ({
      vertices: edge.vertices,
      assignment: edge.assignment,
      targetAngle: edge.targetAngle,
      restLength: edge.restLength,
      triangles: edge.triangles,
      derived: edge.derived,
    })),
    creases,
    boundaryEdges: edges
      .map((edge, index) => (edge.assignment === "B" ? index : -1))
      .filter((index) => index >= 0),
    faceCount: faces.length,
  };
}

/** Área total das faces da folha plana — a área do papel antes de dobrar. */
export function sheetArea(mesh: OrigamiMesh): number {
  return mesh.triangles.reduce((total, triangle) => {
    const [a, b, c] = triangle.indices;
    return (
      total +
      triangleArea(
        mesh.restPositions[a]!,
        mesh.restPositions[b]!,
        mesh.restPositions[c]!,
      )
    );
  }, 0);
}

/** Normal de um triângulo numa configuração qualquer. Usada pelo compilador. */
export function triangleNormalAt(
  positions: readonly Vec3[],
  triangle: MeshTriangle,
): Vec3 {
  const [a, b, c] = triangle.indices;
  return normalize(
    cross(
      subtract(positions[b]!, positions[a]!),
      subtract(positions[c]!, positions[a]!),
    ),
  );
}
