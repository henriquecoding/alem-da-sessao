import type { Vec3 } from "./fold-types";
import {
  distance,
  dot,
  normalize,
  subtract,
  trianglesIntersect,
  triangleQuality,
} from "./geometry";
import type { OrigamiMesh } from "./topology";

/**
 * As medidas que decidem se um frame pode ser aprovado.
 *
 * Nenhuma delas avalia beleza. Todas avaliam a mesma coisa por ângulos
 * diferentes: **a matéria conservou-se?** Papel não estica, não se atravessa e
 * não muda de área. Um morph entre duas imagens viola as três, e viola-as de
 * uma maneira que o olho deteta antes de a conseguir nomear — é por isso que a
 * versão anterior parecia errada mesmo com as cores certas.
 */

export type StrainDiagnostics = {
  readonly perVertex: readonly number[];
  readonly mean: number;
  readonly p95: number;
  readonly maximum: number;
};

/**
 * Deformação máxima de aresta: quanto o papel esticou ou encolheu.
 *
 * `|L/L₀ − 1|` por aresta, e o que conta é o **máximo**, não a média. Uma média
 * baixa esconde uma ponta destruída: se 400 arestas estão perfeitas e uma
 * estica 40%, a média fica em 0,1% e o bico do grou está derretido. O gate
 * corre sobre o pior caso porque é o pior caso que se vê.
 */
export function maxEdgeStrain(
  mesh: OrigamiMesh,
  positions: readonly Vec3[],
): number {
  let maximum = 0;
  for (const edge of mesh.edges) {
    const [a, b] = edge.vertices;
    if (edge.restLength < 1e-9) continue;
    const current = distance(positions[a]!, positions[b]!);
    maximum = Math.max(maximum, Math.abs(current / edge.restLength - 1));
  }
  return maximum;
}

/** O mesmo, distribuído por vértice, para o mapa de calor do laboratório. */
export function strainDiagnostics(
  mesh: OrigamiMesh,
  positions: readonly Vec3[],
): StrainDiagnostics {
  const totals = new Array<number>(mesh.restPositions.length).fill(0);
  const counts = new Array<number>(mesh.restPositions.length).fill(0);

  for (const edge of mesh.edges) {
    const [a, b] = edge.vertices;
    if (edge.restLength < 1e-9) continue;
    const strain = Math.abs(
      distance(positions[a]!, positions[b]!) / edge.restLength - 1,
    );
    totals[a] += strain;
    totals[b] += strain;
    counts[a] += 1;
    counts[b] += 1;
  }

  const perVertex = totals.map((total, index) =>
    counts[index] ? total / counts[index]! : 0,
  );
  const sorted = [...perVertex].sort((a, b) => a - b);

  return {
    perVertex,
    mean:
      perVertex.reduce((sum, value) => sum + value, 0) /
      (perVertex.length || 1),
    p95: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
    maximum: sorted[sorted.length - 1] ?? 0,
  };
}

/**
 * Quanto uma face poligonal deixou de ser plana.
 *
 * Uma face do source é uma região de papel que não tem vinco lá dentro, logo
 * tem de continuar plana depois de dobrada. Mede-se pelo maior desvio angular
 * entre as normais dos triângulos que a compõem — se os triângulos de uma face
 * apontam para lados diferentes, a face enrolou-se e o papel ganhou uma dobra
 * que ninguém autorou.
 */
export function maxFacePlanarityError(
  mesh: OrigamiMesh,
  positions: readonly Vec3[],
): number {
  const normalsByFace = new Map<number, Vec3[]>();

  for (const triangle of mesh.triangles) {
    const [a, b, c] = triangle.indices;
    const normal = normalize(
      crossOf(positions[a]!, positions[b]!, positions[c]!),
    );
    const list = normalsByFace.get(triangle.faceIndex) ?? [];
    list.push(normal);
    normalsByFace.set(triangle.faceIndex, list);
  }

  let maximum = 0;
  for (const normals of normalsByFace.values()) {
    for (let i = 0; i < normals.length; i += 1) {
      for (let j = i + 1; j < normals.length; j += 1) {
        const cosine = Math.min(1, Math.max(-1, dot(normals[i]!, normals[j]!)));
        maximum = Math.max(maximum, Math.acos(cosine));
      }
    }
  }
  return maximum;
}

function crossOf(a: Vec3, b: Vec3, c: Vec3): Vec3 {
  const u = subtract(b, a);
  const v = subtract(c, a);
  return [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ];
}

/**
 * Agrupa vértices que ocuparam o mesmo ponto.
 *
 * Num modelo dobrado isto acontece constantemente e é o sinal de que a
 * dobragem está certa: na caixa, os vértices 5 e 6 são cantos diferentes da
 * folha que vão parar exatamente à mesma aresta vertical. São duas camadas a
 * encontrarem-se, que é o que papel dobrado faz.
 */
function weldVertices(positions: readonly Vec3[], tolerance: number): number[] {
  const cluster = positions.map((_, index) => index);

  for (let i = 0; i < positions.length; i += 1) {
    for (let j = i + 1; j < positions.length; j += 1) {
      if (cluster[j] !== j) continue;
      if (distance(positions[i]!, positions[j]!) <= tolerance) {
        cluster[j] = cluster[i]!;
      }
    }
  }

  return cluster;
}

/**
 * Conta pares de triângulos que se atravessam.
 *
 * Três categorias de contacto são legítimas e ficam de fora:
 *
 * **Vizinhos por índice.** Dois triângulos que partilham um vértice tocam-se
 * por definição. Testá-los daria um falso positivo em cada vinco do modelo.
 *
 * **Vizinhos por posição.** Dois triângulos que partilham um vértice
 * *coincidente* — vértices diferentes da folha que a dobragem levou ao mesmo
 * ponto — também se tocam por construção. Foi isto que apanhou a caixa na
 * primeira tentativa: quatro «interseções» que eram as quatro arestas verticais
 * onde as paredes se encontram, ou seja, exatamente a prova de que a caixa
 * fechou.
 *
 * **Camadas coplanares encostadas.** Estado normal de papel dobrado;
 * `geometry.trianglesIntersect` devolve `false` para elas.
 *
 * O que fica é o defeito verdadeiro: uma face que passa *através* de outra, que
 * é como se reconhece uma forma que só existe porque nada a impediu.
 *
 * O custo é `O(n²)`. Com algumas centenas de triângulos e a correr no
 * compilador, e nunca no browser, isso é aceitável — e a alternativa (uma
 * grelha espacial) acrescentaria a possibilidade de falhar em silêncio.
 */
export function countSelfIntersections(
  mesh: OrigamiMesh,
  positions: readonly Vec3[],
  weldTolerance = 1e-3,
): number {
  let count = 0;
  const cluster = weldVertices(positions, weldTolerance);

  for (let i = 0; i < mesh.triangles.length; i += 1) {
    const first = mesh.triangles[i]!.indices;
    const firstClusters = first.map((vertex) => cluster[vertex]!);

    for (let j = i + 1; j < mesh.triangles.length; j += 1) {
      const second = mesh.triangles[j]!.indices;

      const touches = second.some((vertex) =>
        firstClusters.includes(cluster[vertex]!),
      );
      if (touches) continue;

      if (
        trianglesIntersect(
          positions[first[0]]!,
          positions[first[1]]!,
          positions[first[2]]!,
          positions[second[0]]!,
          positions[second[1]]!,
          positions[second[2]]!,
        )
      ) {
        count += 1;
      }
    }
  }

  return count;
}

export function countDegenerateTriangles(
  mesh: OrigamiMesh,
  positions: readonly Vec3[],
  threshold = 0.05,
): number {
  return mesh.triangles.filter((triangle) => {
    const [a, b, c] = triangle.indices;
    return (
      triangleQuality(positions[a]!, positions[b]!, positions[c]!) < threshold
    );
  }).length;
}

export type FrameDiagnostics = {
  readonly maxEdgeStrain: number;
  readonly maxFacePlanarityError: number;
  readonly selfIntersectionCount: number;
  readonly degenerateTriangleCount: number;
  readonly strain: StrainDiagnostics;
};

export function diagnoseFrame(
  mesh: OrigamiMesh,
  positions: readonly Vec3[],
): FrameDiagnostics {
  return {
    maxEdgeStrain: maxEdgeStrain(mesh, positions),
    maxFacePlanarityError: maxFacePlanarityError(mesh, positions),
    selfIntersectionCount: countSelfIntersections(mesh, positions),
    degenerateTriangleCount: countDegenerateTriangles(mesh, positions),
    strain: strainDiagnostics(mesh, positions),
  };
}
