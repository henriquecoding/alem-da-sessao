import type { BakeResult, BakedFrame } from "./bake";
import type {
  Assignment,
  FoldSource,
  OrigamiModelId,
  OrigamiSemanticState,
  PaperFamilyId,
  Vec3,
} from "./fold-types";
import {
  add,
  cross,
  dot,
  normalize,
  scale,
  subtract,
  triangleNormal,
} from "./geometry";
import { diagnoseFrame } from "./metrics";
import {
  quantizationError,
  quantizeTrack,
  type QuantizedTrack,
} from "./quantize";
import type { OrigamiMesh } from "./topology";

/**
 * O compilador: de frames simulados para o ficheiro que o browser carrega.
 *
 * Tudo o que é caro acontece aqui, uma vez por modelo. O que sai é uma tabela
 * de inteiros, uma lista de triângulos e um SVG — nada que precise de ser
 * resolvido, decidido ou tentado outra vez em runtime.
 *
 * ## Porque é que os vértices são divididos por face
 *
 * Um vértice no meio de um vinco pertence a duas faces que apontam para
 * direções diferentes. Média das normais nesse vértice arredonda o vinco, e um
 * vinco arredondado deixa de ser papel — passa a ser tecido. O compilador
 * divide cada vértice por face, portanto cada face tem a sua normal exata e a
 * aresta entre duas faces é uma descontinuidade verdadeira.
 *
 * Divide por *face* e não por triângulo: uma face é plana por construção, e os
 * triângulos que a compõem partilham a normal. Dividir por triângulo triplicava
 * os vértices sem mudar um único pixel.
 *
 * ## Porque é que o fallback SVG é gerado e não desenhado
 *
 * O fallback tem de mostrar a mesma coisa que o canvas, senão é uma segunda
 * ilustração a fingir-se da primeira — que era exatamente o defeito da versão
 * anterior. Este SVG sai do frame final da mesma simulação, projetado pela
 * mesma câmara, sombreado pela mesma luz, ordenado por profundidade. As cores
 * ficam em `var(--paper-*)` para que o tema continue a funcionar.
 */

export const ORIGAMI_LIGHTING = {
  keyDirection: normalize([-0.42, 0.78, 0.46]),
  fillDirection: normalize([0.58, 0.24, -0.31]),
  ambient: 0.24,
  key: 0.68,
  fill: 0.18,
} as const;

/** A direção de onde se olha. Fixa para toda a família: é o mesmo palco. */
export const ORIGAMI_VIEW_DIRECTION = normalize([-0.36, -0.52, -0.78]);
export const ORIGAMI_VIEW_UP: Vec3 = [0, 1, 0];

export type CompiledClipId =
  "flat-to-noticed" | "noticed-to-forming" | "forming-to-formed";

export type CompiledClip = {
  readonly id: CompiledClipId;
  readonly durationMs: number;
  readonly easing: "paper-in" | "paper-form" | "paper-settle";
  readonly firstFrame: number;
  readonly lastFrame: number;
  readonly endState: OrigamiSemanticState;
};

export type CompiledOrigamiAsset = {
  readonly format: "ads-origami-runtime";
  readonly version: 1;
  readonly modelId: OrigamiModelId;
  readonly sourceSha256: string;
  readonly sourceFoldSpec: 1.2;
  /** Para cada vértice de render, o vértice do source de onde veio. */
  readonly renderToSource: readonly number[];
  /** Triplos de índices de vértices de render. */
  readonly triangles: readonly number[];
  /** Pares de índices de render que desenham a fronteira da folha. */
  readonly boundarySegments: readonly number[];
  /** Pares de índices de render para os vincos verdadeiros, e o seu tipo. */
  readonly creaseSegments: readonly number[];
  readonly creaseAssignments: readonly Assignment[];
  readonly track: QuantizedTrack;
  readonly clips: readonly CompiledClip[];
  readonly camera: {
    readonly projection: "orthographic";
    readonly viewDirection: Vec3;
    readonly up: Vec3;
    readonly center: Vec3;
    /** Metade da altura do volume de visualização, já com margem. */
    readonly halfExtent: number;
  };
  readonly lighting: typeof ORIGAMI_LIGHTING;
  readonly paper: {
    readonly frontFamily: PaperFamilyId;
    readonly backFamily: PaperFamilyId;
  };
  readonly fallback: {
    readonly svg: string;
    readonly silhouettePath: string;
    readonly viewBox: string;
  };
  readonly diagnostics: {
    readonly maxEdgeStrain: number;
    readonly maxFacePlanarityError: number;
    readonly selfIntersectionCount: number;
    readonly degenerateTriangleCount: number;
    readonly quantizationError: number;
    readonly finalKineticEnergy: number;
    /** Graus. O maior desvio entre um vinco e o alvo que o autor declarou. */
    readonly finalAngleErrorDegrees: number;
  };
};

export type CompileOptions = {
  readonly sourceSha256: string;
  /** Margem em torno do objeto, em fração do maior lado. */
  readonly padding?: number;
};

function rotate(
  point: Vec3,
  degrees: { x: number; y: number; z: number },
): Vec3 {
  const toRadians = Math.PI / 180;
  let [x, y, z] = point;

  const rx = degrees.x * toRadians;
  if (rx) {
    const cos = Math.cos(rx);
    const sin = Math.sin(rx);
    [y, z] = [y * cos - z * sin, y * sin + z * cos];
  }

  const ry = degrees.y * toRadians;
  if (ry) {
    const cos = Math.cos(ry);
    const sin = Math.sin(ry);
    [x, z] = [x * cos + z * sin, -x * sin + z * cos];
  }

  const rz = degrees.z * toRadians;
  if (rz) {
    const cos = Math.cos(rz);
    const sin = Math.sin(rz);
    [x, y] = [x * cos - y * sin, x * sin + y * cos];
  }

  return [x, y, z];
}

/** Base ortonormal da câmara: para onde olha, o que é «direita», o que é «cima». */
function cameraBasis(): { forward: Vec3; right: Vec3; up: Vec3 } {
  const forward = normalize(ORIGAMI_VIEW_DIRECTION);
  const right = normalize(cross(forward, ORIGAMI_VIEW_UP));
  const up = cross(right, forward);
  return { forward, right, up };
}

function diffuseAt(normal: Vec3): number {
  const key = Math.max(0, dot(normal, ORIGAMI_LIGHTING.keyDirection));
  const fill = Math.max(0, dot(normal, ORIGAMI_LIGHTING.fillDirection));
  return Math.min(
    1,
    Math.max(
      0,
      ORIGAMI_LIGHTING.ambient +
        key * ORIGAMI_LIGHTING.key +
        fill * ORIGAMI_LIGHTING.fill,
    ),
  );
}

export function compileModel(
  source: FoldSource,
  mesh: OrigamiMesh,
  bake: Extract<BakeResult, { ok: true }>,
  options: CompileOptions,
): CompiledOrigamiAsset {
  const presentation = {
    x: source["ads:presentation"]?.rotateX ?? 0,
    y: source["ads:presentation"]?.rotateY ?? 0,
    z: source["ads:presentation"]?.rotateZ ?? 0,
  };

  // 1. Orientar e centrar. A mesma transformação em todos os frames, senão o
  //    objeto flutuaria entre keyframes por razões que nada têm a ver com a dobra.
  const oriented: BakedFrame[] = bake.frames.map((frame) => ({
    ...frame,
    positions: frame.positions.map((point) => rotate(point, presentation)),
  }));

  const allPoints = oriented.flatMap((frame) => frame.positions);
  const min: Vec3 = [
    Math.min(...allPoints.map((p) => p[0])),
    Math.min(...allPoints.map((p) => p[1])),
    Math.min(...allPoints.map((p) => p[2])),
  ];
  const max: Vec3 = [
    Math.max(...allPoints.map((p) => p[0])),
    Math.max(...allPoints.map((p) => p[1])),
    Math.max(...allPoints.map((p) => p[2])),
  ];
  const center = scale(add(min, max), 0.5);

  const centred: BakedFrame[] = oriented.map((frame) => ({
    ...frame,
    positions: frame.positions.map((point) => subtract(point, center)),
  }));

  // 2. Dividir os vértices por face, para que cada vinco seja uma
  //    descontinuidade verdadeira e não uma média.
  const renderIndexByKey = new Map<string, number>();
  const renderToSource: number[] = [];
  const renderFace: number[] = [];

  const renderIndexOf = (sourceVertex: number, faceIndex: number): number => {
    const key = `${sourceVertex}:${faceIndex}`;
    const existing = renderIndexByKey.get(key);
    if (existing !== undefined) return existing;

    const index = renderToSource.length;
    renderIndexByKey.set(key, index);
    renderToSource.push(sourceVertex);
    renderFace.push(faceIndex);
    return index;
  };

  const triangles: number[] = [];
  for (const triangle of mesh.triangles) {
    for (const vertex of triangle.indices) {
      triangles.push(renderIndexOf(vertex, triangle.faceIndex));
    }
  }

  if (renderToSource.length > 65535) {
    throw new Error(
      `origami: ${source["ads:modelId"]} tem ${renderToSource.length} vértices de render e o formato de índices é Uint16.`,
    );
  }

  // 3. Posições e normais por frame, já no espaço de render.
  const positionFrames: Vec3[][] = [];
  const normalFrames: Vec3[][] = [];

  for (const frame of centred) {
    const positions = renderToSource.map(
      (sourceVertex) => frame.positions[sourceVertex]!,
    );

    // Normal por face: acumulada a partir dos triângulos daquela face, que são
    // coplanares. Somar antes de normalizar dá peso à área, o que torna o
    // resultado estável em faces com um triângulo muito pequeno.
    const faceNormals = new Map<number, [number, number, number]>();
    for (const triangle of mesh.triangles) {
      const [a, b, c] = triangle.indices;
      const normal = triangleNormal(
        frame.positions[a]!,
        frame.positions[b]!,
        frame.positions[c]!,
      );
      const accumulated = faceNormals.get(triangle.faceIndex) ?? [0, 0, 0];
      faceNormals.set(triangle.faceIndex, [
        accumulated[0] + normal[0],
        accumulated[1] + normal[1],
        accumulated[2] + normal[2],
      ]);
    }

    const normals = renderFace.map((faceIndex) =>
      normalize(faceNormals.get(faceIndex) ?? [0, 0, 1]),
    );

    positionFrames.push(positions);
    normalFrames.push(normals);
  }

  const track = quantizeTrack(positionFrames, normalFrames);

  // 4. Linhas: fronteira e vincos verdadeiros. As diagonais da triangulação
  //    ficam de fora — o papel nunca as teve.
  const boundarySegments: number[] = [];
  const creaseSegments: number[] = [];
  const creaseAssignments: Assignment[] = [];

  const anyRenderIndexOf = (sourceVertex: number): number => {
    for (let index = 0; index < renderToSource.length; index += 1) {
      if (renderToSource[index] === sourceVertex) return index;
    }
    return 0;
  };

  for (const edge of mesh.edges) {
    if (edge.derived) continue;
    const [a, b] = edge.vertices;

    if (edge.assignment === "B") {
      boundarySegments.push(anyRenderIndexOf(a), anyRenderIndexOf(b));
      continue;
    }
    if (edge.assignment === "M" || edge.assignment === "V") {
      creaseSegments.push(anyRenderIndexOf(a), anyRenderIndexOf(b));
      creaseAssignments.push(edge.assignment);
    }
  }

  // 5. Câmara: ajustada ao maior frame, não ao último. Se coubesse apenas ao
  //    resultado, a folha plana — que é maior — sairia do enquadramento no
  //    início da animação.
  const basis = cameraBasis();
  const padding = options.padding ?? 0.12;
  let halfExtent = 0;
  for (const frame of positionFrames) {
    for (const point of frame) {
      halfExtent = Math.max(
        halfExtent,
        Math.abs(dot(point, basis.right)),
        Math.abs(dot(point, basis.up)),
      );
    }
  }
  halfExtent *= 1 + padding;

  const finalFrame = centred[centred.length - 1]!;
  const finalDiagnostics = diagnoseFrame(mesh, finalFrame.positions);

  const fallback = renderFallbackSvg(
    mesh,
    finalFrame.positions,
    basis,
    halfExtent,
  );

  const clips = buildClips(centred);

  return {
    format: "ads-origami-runtime",
    version: 1,
    modelId: source["ads:modelId"],
    sourceSha256: options.sourceSha256,
    sourceFoldSpec: 1.2,
    renderToSource,
    triangles,
    boundarySegments,
    creaseSegments,
    creaseAssignments,
    track,
    clips,
    camera: {
      projection: "orthographic",
      viewDirection: ORIGAMI_VIEW_DIRECTION,
      up: ORIGAMI_VIEW_UP,
      center: [0, 0, 0],
      halfExtent,
    },
    lighting: ORIGAMI_LIGHTING,
    paper: {
      frontFamily: source["ads:paper"].frontFamily,
      backFamily: source["ads:paper"].backFamily,
    },
    fallback,
    diagnostics: {
      maxEdgeStrain: bake.diagnostics.worstEdgeStrain,
      maxFacePlanarityError: finalDiagnostics.maxFacePlanarityError,
      selfIntersectionCount: finalDiagnostics.selfIntersectionCount,
      degenerateTriangleCount: finalDiagnostics.degenerateTriangleCount,
      quantizationError: quantizationError(track, positionFrames),
      finalKineticEnergy: bake.diagnostics.finalKineticEnergy,
      finalAngleErrorDegrees: bake.diagnostics.finalAngleErrorDegrees,
    },
  };
}

/**
 * Os clips.
 *
 * Um clip é um par de frames e uma duração — nada mais. O significado (o que é
 * «noticed», o que é «formed») está na máquina de estados da experiência, e o
 * runtime limita-se a interpolar entre os índices que lhe são dados. É esta
 * separação que permite mudar o ritmo da narrativa sem voltar a simular nada.
 */
function buildClips(frames: readonly BakedFrame[]): CompiledClip[] {
  const lastOfState = (state: OrigamiSemanticState): number => {
    for (let index = frames.length - 1; index >= 0; index -= 1) {
      if (frames[index]!.state === state) return index;
    }
    return -1;
  };

  const noticed = lastOfState("noticed");
  const forming = lastOfState("forming");
  const formed = frames.length - 1;

  return [
    {
      id: "flat-to-noticed",
      durationMs: 620,
      easing: "paper-in",
      firstFrame: 0,
      lastFrame: noticed >= 0 ? noticed : Math.min(1, formed),
      endState: "noticed",
    },
    {
      id: "noticed-to-forming",
      durationMs: 900,
      easing: "paper-form",
      firstFrame: noticed >= 0 ? noticed : 0,
      lastFrame: forming >= 0 ? forming : formed,
      endState: "forming",
    },
    {
      id: "forming-to-formed",
      durationMs: 760,
      easing: "paper-settle",
      firstFrame: forming >= 0 ? forming : 0,
      lastFrame: formed,
      endState: "formed",
    },
  ];
}

/**
 * O fallback: o mesmo objeto, projetado e pintado pelo algoritmo do pintor.
 *
 * Ordenar por profundidade média não resolve triângulos que se interpenetram —
 * mas o gate de auto-interseção garante que não há nenhum. Dentro dessa
 * garantia, a ordenação por profundidade é exata, e o SVG mostra a mesma
 * oclusão que o `depth buffer` do canvas mostraria.
 */
function renderFallbackSvg(
  mesh: OrigamiMesh,
  positions: readonly Vec3[],
  basis: { forward: Vec3; right: Vec3; up: Vec3 },
  halfExtent: number,
): CompiledOrigamiAsset["fallback"] {
  const size = 256;
  const project = (point: Vec3): [number, number, number] => {
    const x = dot(point, basis.right);
    const y = dot(point, basis.up);
    const depth = dot(point, basis.forward);
    return [
      ((x / halfExtent) * 0.5 + 0.5) * size,
      (0.5 - (y / halfExtent) * 0.5) * size,
      depth,
    ];
  };

  const drawn = mesh.triangles
    .map((triangle) => {
      const [a, b, c] = triangle.indices;
      const pa = project(positions[a]!);
      const pb = project(positions[b]!);
      const pc = project(positions[c]!);
      const normal = normalize(
        triangleNormal(positions[a]!, positions[b]!, positions[c]!),
      );

      // Uma normal a apontar para longe da câmara é o avesso do papel, e o
      // avesso tem cor própria: é a outra face da mesma folha.
      const facingCamera = dot(normal, basis.forward) < 0;
      const shaded = facingCamera ? normal : scale(normal, -1);

      return {
        depth: (pa[2] + pb[2] + pc[2]) / 3,
        points: `${pa[0].toFixed(2)},${pa[1].toFixed(2)} ${pb[0].toFixed(2)},${pb[1].toFixed(2)} ${pc[0].toFixed(2)},${pc[1].toFixed(2)}`,
        mix: Math.round(diffuseAt(shaded) * 100),
        face: facingCamera ? "front" : "back",
      };
    })
    // Mais longe primeiro: o algoritmo do pintor.
    .sort((first, second) => first.depth - second.depth);

  const polygons = drawn
    .map(
      (triangle) =>
        `<polygon points="${triangle.points}" fill="color-mix(in oklab, var(--paper-${triangle.face === "front" ? "lit" : "inner"}) ${triangle.mix}%, var(--paper-shade))"/>`,
    )
    .join("");

  const boundary = mesh.boundaryEdges
    .map((edgeIndex) => {
      const [a, b] = mesh.edges[edgeIndex]!.vertices;
      const pa = project(positions[a]!);
      const pb = project(positions[b]!);
      return `M${pa[0].toFixed(2)} ${pa[1].toFixed(2)}L${pb[0].toFixed(2)} ${pb[1].toFixed(2)}`;
    })
    .join("");

  return {
    svg: `<g class="origami-fallback-faces">${polygons}</g><path class="origami-fallback-outline" d="${boundary}" fill="none" vector-effect="non-scaling-stroke"/>`,
    silhouettePath: boundary,
    viewBox: `0 0 ${size} ${size}`,
  };
}
