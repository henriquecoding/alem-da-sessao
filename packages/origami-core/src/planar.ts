import type { Assignment, Vec2 } from "./fold-types";

/**
 * De segmentos soltos para uma subdivisão planar com faces.
 *
 * É o miolo do importador, e a razão é simples: um padrão de vincos em SVG não
 * tem faces. Tem 84 linhas que se cruzam. O resto do pipeline — o triangulador,
 * o solver, o validador — está todo construído sobre `faces_vertices`, e sem
 * faces não há nada para dobrar. Encontrá-las é o trabalho.
 *
 * ## As três coisas que têm de acontecer por esta ordem
 *
 * **1. Soldar.** Duas linhas que o desenho quis ligar chegam com coordenadas a
 * diferir na sexta casa. Se não forem soldadas, o vértice partilhado passa a
 * dois vértices, a folha ganha uma fenda invisível, e a travessia de faces sai
 * pelo buraco. A tolerância é relativa ao lado da folha e não absoluta: um
 * ficheiro exportado a 400 px e o mesmo ficheiro a 40 têm de importar igual.
 *
 * **2. Partir.** Duas linhas que se cruzam a meio não têm vértice no
 * cruzamento — o SVG não tem por onde o declarar. E uma linha que acaba a meio
 * de outra (junção em T) deixa a segunda por dividir. Nos dois casos a
 * subdivisão fica errada de uma maneira que não se vê: as faces em volta do
 * cruzamento fundem-se numa só, maior, e o modelo dobra como se ali não
 * houvesse vinco. É preciso partir cada segmento em todos os pontos onde outro
 * o encontra, e repetir até estabilizar.
 *
 * **3. Percorrer.** Com a subdivisão correta, as faces saem de uma travessia de
 * meias-arestas ordenadas por ângulo em cada vértice. É o mesmo que o
 * `FOLD.convert.vertices_vertices_to_faces_vertices` faz no OrigamiSimulator, e
 * o que o torna correto é uma regra pequena: chegando a `v` vindo de `u`, a
 * meia-aresta seguinte é a que está imediatamente **antes** de `v→u` na ordem
 * anti-horária. Isso percorre as faces limitadas no sentido anti-horário e a
 * face exterior no sentido horário — e é o sinal da área que as distingue, sem
 * ser preciso saber qual é qual à cabeça.
 *
 * ## O que é verificado, e porquê aqui
 *
 * A soma das áreas das faces interiores tem de igualar a área do contorno.
 * Numa folha plana, ao contrário do modelo dobrado, isto é um invariante
 * verdadeiro: não há camadas, e uma face a mais ou a menos aparece na conta.
 * É a única verificação que apanha um cruzamento por partir — o defeito que
 * não tem sintoma visível e que estraga tudo o que vem a seguir.
 */

export type PlanarCode =
  | "DANGLING_EDGE"
  | "CONFLICTING_EDGE"
  | "DISCONNECTED"
  | "AREA_MISMATCH"
  | "NO_FACES"
  | "ARRANGEMENT_UNSTABLE"
  | "BOUNDARY_MISMATCH";

export class PlanarSubdivisionError extends Error {
  constructor(
    readonly code: PlanarCode,
    readonly detail: string,
  ) {
    super(`${code}: ${detail}`);
    this.name = "PlanarSubdivisionError";
  }
}

export type PlanarSegment = {
  readonly a: Vec2;
  readonly b: Vec2;
  readonly assignment: Assignment;
  /** Fração do ângulo total, de 0 a 1. Ver `CreaseSegment.foldFraction`. */
  readonly foldFraction: number;
  readonly source: string;
};

export type PlanarSubdivision = {
  readonly vertices: readonly Vec2[];
  readonly edges: readonly (readonly [number, number])[];
  readonly assignments: readonly Assignment[];
  /** Fração do ângulo total por índice de aresta. */
  readonly foldFractions: readonly number[];
  /** Faces limitadas, cada uma no sentido anti-horário. */
  readonly faces: readonly (readonly number[])[];
  /** Índices das arestas do contorno exterior. */
  readonly boundary: readonly number[];
  readonly diagnostics: PlanarDiagnostics;
};

export type PlanarDiagnostics = {
  /** Pontos que a soldadura juntou a um vértice já existente. */
  readonly weldedPoints: number;
  /** Vértices criados em cruzamentos que o desenho não declarava. */
  readonly crossings: number;
  /** Segmentos partidos, contando junções em T e cruzamentos. */
  readonly splits: number;
  /** Arestas idênticas descartadas. */
  readonly duplicates: number;
  readonly rounds: number;
  readonly sheetArea: number;
  /** Diferença relativa entre a soma das faces e a área do contorno. */
  readonly areaError: number;
};

/**
 * Conjunto de pontos com soldadura por proximidade.
 *
 * Grelha espacial com célula do tamanho da tolerância: cada ponto novo só é
 * comparado com as nove células em volta, e o primeiro representante dentro da
 * tolerância ganha. A ordem de inserção decide os empates, o que torna o
 * resultado determinístico — e determinismo aqui não é elegância, é o que
 * permite gravar o hash do source e detetar no CI que ele mudou.
 */
class WeldedPoints {
  private readonly cells = new Map<string, number[]>();
  readonly points: Vec2[] = [];
  welded = 0;

  constructor(private readonly tolerance: number) {}

  private key(x: number, y: number): string {
    return `${Math.floor(x / this.tolerance)}:${Math.floor(y / this.tolerance)}`;
  }

  add(point: Vec2): number {
    const cx = Math.floor(point[0] / this.tolerance);
    const cy = Math.floor(point[1] / this.tolerance);

    for (let dx = -1; dx <= 1; dx += 1) {
      for (let dy = -1; dy <= 1; dy += 1) {
        for (const index of this.cells.get(`${cx + dx}:${cy + dy}`) ?? []) {
          const existing = this.points[index]!;
          if (
            Math.hypot(existing[0] - point[0], existing[1] - point[1]) <=
            this.tolerance
          ) {
            this.welded += 1;
            return index;
          }
        }
      }
    }

    const index = this.points.length;
    this.points.push(point);
    const key = this.key(point[0], point[1]);
    const bucket = this.cells.get(key);
    if (bucket) bucket.push(index);
    else this.cells.set(key, [index]);
    return index;
  }
}

/** Parâmetro da projeção de `p` sobre o segmento `a→b`, e a distância. */
function projectOnSegment(
  p: Vec2,
  a: Vec2,
  b: Vec2,
): { readonly t: number; readonly distance: number } {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0)
    return { t: 0, distance: Math.hypot(p[0] - a[0], p[1] - a[1]) };
  const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / lengthSquared;
  const clamped = Math.max(0, Math.min(1, t));
  return {
    t,
    distance: Math.hypot(
      p[0] - (a[0] + clamped * dx),
      p[1] - (a[1] + clamped * dy),
    ),
  };
}

/**
 * Ponto onde dois segmentos se atravessam, ou `null`.
 *
 * Só o cruzamento transversal. Segmentos colineares que se sobrepõem não são
 * tratados aqui de propósito: as extremidades de cada um caem no interior do
 * outro, e é o passo das junções em T que os parte. Tratá-los nos dois sítios
 * daria vértices a mais e a duplicação teria de ser desfeita depois.
 */
function crossingPoint(
  a1: Vec2,
  a2: Vec2,
  b1: Vec2,
  b2: Vec2,
  tolerance: number,
): Vec2 | null {
  const rx = a2[0] - a1[0];
  const ry = a2[1] - a1[1];
  const sx = b2[0] - b1[0];
  const sy = b2[1] - b1[1];
  const denominator = rx * sy - ry * sx;
  if (Math.abs(denominator) < 1e-14) return null;

  const qpx = b1[0] - a1[0];
  const qpy = b1[1] - a1[1];
  const t = (qpx * sy - qpy * sx) / denominator;
  const u = (qpx * ry - qpy * rx) / denominator;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;

  const point: Vec2 = [a1[0] + t * rx, a1[1] + t * ry];

  // Um cruzamento que cai em cima de uma ponta já é um vértice partilhado — e
  // criá-lo outra vez só produziria uma aresta de comprimento nulo.
  for (const end of [a1, a2, b1, b2]) {
    if (Math.hypot(point[0] - end[0], point[1] - end[1]) <= tolerance)
      return null;
  }

  return point;
}

type WorkSegment = {
  readonly a: number;
  readonly b: number;
  readonly assignment: Assignment;
  readonly foldFraction: number;
  readonly source: string;
};

/**
 * Constrói a subdivisão planar a partir dos segmentos.
 *
 * `tolerance` é absoluta e nas unidades em que os segmentos vêm. Quem chama
 * normaliza primeiro para a folha unitária, para que a tolerância seja de facto
 * relativa ao tamanho da folha e não ao tamanho do ficheiro.
 */
export function buildPlanarSubdivision(
  segments: readonly PlanarSegment[],
  tolerance: number,
): PlanarSubdivision {
  const set = new WeldedPoints(tolerance);

  let work: WorkSegment[] = [];
  for (const segment of segments) {
    const a = set.add(segment.a);
    const b = set.add(segment.b);
    if (a === b) continue; // linha de comprimento nulo: o desenho tinha-a, a folha não.
    work.push({
      a,
      b,
      assignment: segment.assignment,
      foldFraction: segment.foldFraction,
      source: segment.source,
    });
  }

  let crossings = 0;
  let splits = 0;
  let rounds = 0;
  const MAX_ROUNDS = 8;

  for (; rounds < MAX_ROUNDS; rounds += 1) {
    // 1. Cruzamentos que o desenho não declarava passam a ser vértices.
    const before = set.points.length;
    for (let i = 0; i < work.length; i += 1) {
      for (let j = i + 1; j < work.length; j += 1) {
        const point = crossingPoint(
          set.points[work[i]!.a]!,
          set.points[work[i]!.b]!,
          set.points[work[j]!.a]!,
          set.points[work[j]!.b]!,
          tolerance,
        );
        if (point) set.add(point);
      }
    }
    crossings += set.points.length - before;

    // 2. Cada segmento parte-se em todos os vértices que lhe caem no interior —
    //    os do cruzamento acabados de criar e os das junções em T que já lá
    //    estavam.
    const next: WorkSegment[] = [];
    let splitHere = 0;

    for (const segment of work) {
      const a = set.points[segment.a]!;
      const b = set.points[segment.b]!;
      const interior: { index: number; t: number }[] = [];

      for (let index = 0; index < set.points.length; index += 1) {
        if (index === segment.a || index === segment.b) continue;
        const { t, distance } = projectOnSegment(set.points[index]!, a, b);
        if (distance > tolerance || t <= 0 || t >= 1) continue;
        // Perto de uma ponta não é interior — é a própria ponta, por soldar.
        const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (t * length <= tolerance || (1 - t) * length <= tolerance) continue;
        interior.push({ index, t });
      }

      if (!interior.length) {
        next.push(segment);
        continue;
      }

      interior.sort((first, second) => first.t - second.t);
      splitHere += interior.length;
      const chain = [
        segment.a,
        ...interior.map((entry) => entry.index),
        segment.b,
      ];
      for (let index = 0; index < chain.length - 1; index += 1) {
        if (chain[index] === chain[index + 1]) continue;
        next.push({
          a: chain[index]!,
          b: chain[index + 1]!,
          assignment: segment.assignment,
          foldFraction: segment.foldFraction,
          source: segment.source,
        });
      }
    }

    splits += splitHere;
    work = next;

    if (set.points.length === before && splitHere === 0) {
      rounds += 1;
      break;
    }
  }

  if (rounds >= MAX_ROUNDS) {
    throw new PlanarSubdivisionError(
      "ARRANGEMENT_UNSTABLE",
      `o arranjo não estabilizou em ${MAX_ROUNDS} rondas. ` +
        "Normalmente é tolerância de soldadura de mais, que junta vértices distintos e recria cruzamentos.",
    );
  }

  // 3. Arestas únicas. Uma aresta desenhada duas vezes na mesma cor é descuido
  //    e descarta-se; em duas cores é uma contradição sobre o que o papel faz
  //    naquela linha, e não há forma honesta de escolher uma.
  const edges: [number, number][] = [];
  const assignments: Assignment[] = [];
  const foldFractions: number[] = [];
  const indexByKey = new Map<string, number>();
  let duplicates = 0;

  for (const segment of work) {
    const [low, high] =
      segment.a < segment.b ? [segment.a, segment.b] : [segment.b, segment.a];
    const key = `${low}:${high}`;
    const existing = indexByKey.get(key);

    if (existing !== undefined) {
      const where = set.points[low]!;
      if (assignments[existing] !== segment.assignment) {
        throw new PlanarSubdivisionError(
          "CONFLICTING_EDGE",
          `a aresta em (${where[0].toFixed(4)}, ${where[1].toFixed(4)}) está desenhada como ` +
            `"${assignments[existing]}" e como "${segment.assignment}" (${segment.source}).`,
        );
      }
      // Mesma cor mas opacidades diferentes é a mesma contradição noutra
      // variável: as duas linhas pedem ângulos finais diferentes para o mesmo
      // vinco, e escolher uma seria decidir em silêncio.
      if (Math.abs(foldFractions[existing]! - segment.foldFraction) > 1e-6) {
        throw new PlanarSubdivisionError(
          "CONFLICTING_EDGE",
          `a aresta em (${where[0].toFixed(4)}, ${where[1].toFixed(4)}) está desenhada com ` +
            `opacidade ${foldFractions[existing]!.toFixed(4)} e ${segment.foldFraction.toFixed(4)} ` +
            `(${segment.source}); são dois ângulos finais para o mesmo vinco.`,
        );
      }
      duplicates += 1;
      continue;
    }

    indexByKey.set(key, edges.length);
    edges.push([low, high]);
    assignments.push(segment.assignment);
    foldFractions.push(segment.foldFraction);
  }

  const vertices = set.points;

  // 4. Adjacência ordenada por ângulo. É a estrutura de que a travessia vive.
  const adjacency: { neighbour: number; edge: number; angle: number }[][] =
    vertices.map(() => []);

  edges.forEach(([a, b], edge) => {
    adjacency[a]!.push({
      neighbour: b,
      edge,
      angle: Math.atan2(
        vertices[b]![1] - vertices[a]![1],
        vertices[b]![0] - vertices[a]![0],
      ),
    });
    adjacency[b]!.push({
      neighbour: a,
      edge,
      angle: Math.atan2(
        vertices[a]![1] - vertices[b]![1],
        vertices[a]![0] - vertices[b]![0],
      ),
    });
  });

  for (const list of adjacency)
    list.sort((first, second) => first.angle - second.angle);

  for (const [vertex, list] of adjacency.entries()) {
    if (list.length === 1) {
      const point = vertices[vertex]!;
      throw new PlanarSubdivisionError(
        "DANGLING_EDGE",
        `o vértice (${point[0].toFixed(4)}, ${point[1].toFixed(4)}) tem uma aresta só: ` +
          "há uma linha que acaba no meio do papel. Ou lhe falta comprimento para chegar à seguinte, " +
          "ou a tolerância de soldadura é curta de mais.",
      );
    }
  }

  const position = new Map<string, number>();
  for (const [vertex, list] of adjacency.entries()) {
    list.forEach((entry, index) =>
      position.set(`${vertex}:${entry.edge}`, index),
    );
  }

  const halfEdgeFrom = (edge: number, from: number): number =>
    edges[edge]![0] === from ? edge * 2 : edge * 2 + 1;

  // 5. A travessia. Cada meia-aresta pertence a exatamente um ciclo.
  const visited = new Array<boolean>(edges.length * 2).fill(false);
  const cycles: { vertices: number[]; edges: number[]; area: number }[] = [];

  for (let start = 0; start < edges.length * 2; start += 1) {
    if (visited[start]) continue;

    const cycleVertices: number[] = [];
    const cycleEdges: number[] = [];
    let current = start;
    let guard = edges.length * 2 + 1;

    do {
      if (guard-- <= 0) {
        throw new PlanarSubdivisionError(
          "ARRANGEMENT_UNSTABLE",
          "a travessia de faces não fechou; a adjacência está inconsistente.",
        );
      }
      visited[current] = true;
      const edge = current >> 1;
      const [from, to] =
        current % 2 === 0 ? edges[edge]! : [edges[edge]![1], edges[edge]![0]];

      cycleVertices.push(from);
      cycleEdges.push(edge);

      const list = adjacency[to]!;
      const at = position.get(`${to}:${edge}`)!;
      const nextEntry = list[(at - 1 + list.length) % list.length]!;
      current = halfEdgeFrom(nextEntry.edge, to);
    } while (current !== start);

    let area = 0;
    for (let index = 0; index < cycleVertices.length; index += 1) {
      const p = vertices[cycleVertices[index]!]!;
      const q = vertices[cycleVertices[(index + 1) % cycleVertices.length]!]!;
      area += p[0] * q[1] - q[0] * p[1];
    }

    cycles.push({ vertices: cycleVertices, edges: cycleEdges, area: area / 2 });
  }

  const outer = cycles.filter((cycle) => cycle.area < 0);
  const faces = cycles.filter((cycle) => cycle.area > 0);

  if (!faces.length) {
    throw new PlanarSubdivisionError(
      "NO_FACES",
      "as linhas não fecham nenhuma região; não há folha nenhuma para dobrar.",
    );
  }

  if (outer.length !== 1) {
    throw new PlanarSubdivisionError(
      "DISCONNECTED",
      `o padrão tem ${outer.length} contornos exteriores e uma folha íntegra tem um. ` +
        "Normalmente é um grupo de linhas separado do resto, ou um buraco no meio do papel.",
    );
  }

  const outerCycle = outer[0]!;
  const enclosed = Math.abs(outerCycle.area);
  const covered = faces.reduce((total, face) => total + face.area, 0);
  const areaError = Math.abs(covered - enclosed) / enclosed;

  // A conta que apanha o cruzamento por partir. Numa folha plana não há
  // camadas, portanto as faces cobrem o contorno exatamente uma vez.
  if (areaError > 1e-6) {
    throw new PlanarSubdivisionError(
      "AREA_MISMATCH",
      `as faces somam ${covered.toFixed(6)} e o contorno encerra ${enclosed.toFixed(6)} ` +
        `(erro ${(areaError * 100).toFixed(4)}%). Há região por cobrir ou coberta duas vezes.`,
    );
  }

  const boundary = [...new Set(outerCycle.edges)].sort((a, b) => a - b);
  const declared = assignments
    .map((assignment, index) => (assignment === "B" ? index : -1))
    .filter((index) => index >= 0);

  const boundarySet = new Set(boundary);
  const declaredSet = new Set(declared);
  const missing = boundary.filter((index) => !declaredSet.has(index));
  const extra = declared.filter((index) => !boundarySet.has(index));

  if (missing.length || extra.length) {
    const describe = (index: number): string => {
      const [a, b] = edges[index]!;
      const p = vertices[a]!;
      const q = vertices[b]!;
      return `(${p[0].toFixed(3)}, ${p[1].toFixed(3)})–(${q[0].toFixed(3)}, ${q[1].toFixed(3)})`;
    };
    throw new PlanarSubdivisionError(
      "BOUNDARY_MISMATCH",
      [
        "a fronteira desenhada a preto não coincide com o contorno do papel.",
        missing.length
          ? `No contorno mas não a preto: ${missing.slice(0, 4).map(describe).join(", ")}${missing.length > 4 ? ` (+${missing.length - 4})` : ""}.`
          : "",
        extra.length
          ? `A preto mas no interior: ${extra.slice(0, 4).map(describe).join(", ")}${extra.length > 4 ? ` (+${extra.length - 4})` : ""}.`
          : "",
      ]
        .filter(Boolean)
        .join(" "),
    );
  }

  // 6. O sentido de cada aresta, fixado pela face que a reclama primeiro.
  //
  // Esta é a parte que não se vê e que decide tudo. `buildMesh` toma `p1` e
  // `p2` do sentido em que a aresta vem declarada, e toma `apexA` da face que
  // aparece **mais cedo** na lista. O sinal do ângulo diedro sai da combinação
  // dos dois: inverter o sentido da aresta troca o sinal, e trocar os ápices
  // também. Se as arestas vierem numa ordem qualquer — por índice, por
  // exemplo — metade dos vincos fica com a convenção invertida em relação à
  // outra metade, e a partir daí «monte» quer dizer coisas diferentes em
  // arestas diferentes.
  //
  // O defeito não falha nenhum invariante: a folha continua íntegra, a
  // topologia continua correta, e o modelo simplesmente não assenta — a base
  // preliminar importada parava a 121° do alvo com toda a geometria certa.
  // Alinhar o sentido da aresta com o da face que a reclama primeiro dá uma
  // convenção única para o modelo inteiro.
  const facesVertices = faces.map((face) => face.vertices);
  const claimedBy = new Map<string, number>();
  facesVertices.forEach((face, index) => {
    for (let i = 0; i < face.length; i += 1) {
      claimedBy.set(`${face[i]}:${face[(i + 1) % face.length]}`, index);
    }
  });

  const oriented = edges.map(([u, v]): readonly [number, number] => {
    const forward = claimedBy.get(`${u}:${v}`);
    const backward = claimedBy.get(`${v}:${u}`);
    // Na fronteira só um dos sentidos pertence a uma face — o outro é a face
    // exterior, que não existe como face.
    if (forward === undefined) return backward === undefined ? [u, v] : [v, u];
    if (backward === undefined) return [u, v];
    return forward < backward ? [u, v] : [v, u];
  });

  return {
    vertices,
    edges: oriented,
    assignments,
    foldFractions,
    faces: facesVertices,
    boundary,
    diagnostics: {
      weldedPoints: set.welded,
      crossings,
      splits,
      duplicates,
      rounds,
      sheetArea: covered,
      areaError,
    },
  };
}
