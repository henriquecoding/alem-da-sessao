import {
  authorFoldSource,
  bakeModel,
  buildMesh,
  compileModel,
  createSolverState,
  dihedralAngleAndGradients,
  readPositions,
  stagesFromSource,
  step,
  validateFoldSource,
} from "@alem-da-sessao/origami-core";
import { findModelEntry, origamiModelEntries } from "./models/index";

/**
 * `pnpm origami:inspect` — a silhueta no terminal.
 *
 * Existe por uma razão prática e não por gosto: autorar um modelo é um ciclo de
 * tentativa e erro sobre ângulos, e um ciclo que precise de abrir um browser a
 * cada tentativa não se percorre. Aqui a forma projeta-se pela mesma câmara
 * ortográfica do runtime e imprime-se em caracteres.
 *
 * A silhueta é a leitura certa para este teste. É exatamente o que o gate de
 * reconhecimento pede — a forma a preto, sem cor, sem vincos, sem legenda — e é
 * onde as formas bonitas e ilegíveis falham. Se um objeto não se lê aqui, não
 * se vai ler a 96 px.
 */

type Vec3 = readonly [number, number, number];

function normalize(v: Vec3): Vec3 {
  const n = Math.hypot(...v) || 1;
  return [v[0] / n, v[1] / n, v[2] / n];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/** Preenche os triângulos projetados numa grelha de caracteres. */
function silhouette(
  triangles: readonly number[],
  points: readonly (readonly [number, number])[],
  width = 74,
  height = 32,
): string {
  const grid: string[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => " "),
  );

  const inside = (
    px: number,
    py: number,
    a: readonly [number, number],
    b: readonly [number, number],
    c: readonly [number, number],
  ): boolean => {
    const d1 = (b[0] - a[0]) * (py - a[1]) - (b[1] - a[1]) * (px - a[0]);
    const d2 = (c[0] - b[0]) * (py - b[1]) - (c[1] - b[1]) * (px - b[0]);
    const d3 = (a[0] - c[0]) * (py - c[1]) - (a[1] - c[1]) * (px - c[0]);
    const negative = d1 < 0 || d2 < 0 || d3 < 0;
    const positive = d1 > 0 || d2 > 0 || d3 > 0;
    return !(negative && positive);
  };

  for (let t = 0; t < triangles.length; t += 3) {
    const a = points[triangles[t]!]!;
    const b = points[triangles[t + 1]!]!;
    const c = points[triangles[t + 2]!]!;

    const minY = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1])));
    const maxY = Math.min(height - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
    const minX = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0])));
    const maxX = Math.min(width - 1, Math.ceil(Math.max(a[0], b[0], c[0])));

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        if (inside(x + 0.5, y + 0.5, a, b, c)) grid[y]![x] = "█";
      }
    }
  }

  return grid.map((row) => row.join("")).join("\n");
}

async function inspectOne(id: string): Promise<void> {
  const entry = findModelEntry(id);
  const source = authorFoldSource(entry.model, entry.metadata);
  const report = validateFoldSource(source);
  const mesh = buildMesh(source);

  const baked = bakeModel(mesh, stagesFromSource(source, mesh), {
    anchor: source["ads:anchor"],
    lengthProjectionIterations: 30,
  });

  console.log(`\n${"═".repeat(74)}`);
  console.log(
    `${entry.metadata.file_title}  ·  ${id}  ·  ${report.vertexCount} vértices, ` +
      `${report.creaseCount} vincos, ${report.faceCount} faces`,
  );
  console.log("═".repeat(74));

  if (process.argv.includes("--angles")) reportAchievedAngles(source, mesh);

  if (!baked.ok) {
    console.log(`  BAKE FALHOU — ${baked.reason}: ${baked.detail}`);
    console.log(
      `  strain ${(baked.diagnostics.worstEdgeStrain * 100).toFixed(3)}%  ` +
        `ângulo ${baked.diagnostics.finalAngleErrorDegrees.toFixed(1)}°  ` +
        `interseções ${baked.diagnostics.final.selfIntersectionCount}`,
    );
    return;
  }

  const compiled = compileModel(source, mesh, baked, {
    sourceSha256: "inspect",
  });

  // A mesma câmara do runtime, sobre o frame final.
  const forward = normalize(compiled.camera.viewDirection);
  const right = normalize(cross(forward, compiled.camera.up));
  const up = cross(right, forward);
  const half = compiled.camera.halfExtent;

  const width = 74;
  const height = 32;
  const track = compiled.track;
  const lastFrame = track.frameCount - 1;
  const stride = track.vertexCount * 3;
  const bytes = Buffer.from(track.positionsBase64, "base64");
  const values = new Int16Array(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength / 2,
  );

  const points: [number, number][] = [];
  for (let vertex = 0; vertex < track.vertexCount; vertex += 1) {
    const base = lastFrame * stride + vertex * 3;
    const world: Vec3 = [
      (values[base]! + 32767) * track.scale[0] + track.offset[0],
      (values[base + 1]! + 32767) * track.scale[1] + track.offset[1],
      (values[base + 2]! + 32767) * track.scale[2] + track.offset[2],
    ];
    // Caracteres são cerca de duas vezes mais altos do que largos.
    points.push([
      ((dot(world, right) / half) * 0.5 + 0.5) * (width - 1),
      (0.5 - (dot(world, up) / half) * 0.5) * (height - 1),
    ]);
  }

  console.log(silhouette(compiled.triangles, points, width, height));
  console.log(
    `  strain ${(compiled.diagnostics.maxEdgeStrain * 100).toFixed(4)}%  ` +
      `ângulo ${compiled.diagnostics.finalAngleErrorDegrees.toFixed(2)}°  ` +
      `interseções ${compiled.diagnostics.selfIntersectionCount}  ` +
      `triângulos ${compiled.triangles.length / 3}`,
  );
}

/**
 * Os ângulos que o mecanismo realmente permite, por aresta do source.
 *
 * Um vértice de grau quatro tem um só grau de liberdade: os quatro vincos que
 * lá se encontram não são independentes, e pedir-lhes valores arbitrários é
 * pedir-lhes uma configuração que não existe. O solver assenta no compromisso
 * mais próximo — o que interessa é saber qual, para o poder autorar.
 *
 * É o inverso do fluxo da caixa: lá o autor descreve a forma e a ferramenta
 * deriva os ângulos; aqui o autor propõe ângulos e a ferramenta diz quais é que
 * a folha aceita. Os dois acabam no mesmo sítio — um ficheiro FOLD cujos
 * ângulos correspondem à forma que o modelo assume.
 */
function reportAchievedAngles(
  source: ReturnType<typeof authorFoldSource>,
  mesh: ReturnType<typeof buildMesh>,
): void {
  const stages = stagesFromSource(source, mesh);
  const state = createSolverState(mesh, { lengthProjectionIterations: 30 });
  const target = stages[stages.length - 1]!.targets;

  const current = new Float64Array(target.length);
  for (let tick = 1; tick <= 40; tick += 1) {
    for (let i = 0; i < current.length; i += 1) {
      current[i] = target[i]! * (tick / 40);
    }
    for (let s = 0; s < 3000; s += 1) step(state, current);
  }

  const positions = readPositions(state);
  const sourceEdges = source.edges_vertices?.length ?? 0;
  console.log("  ângulos que a folha aceita:");
  for (const crease of mesh.creases) {
    if (crease.edgeIndex >= sourceEdges) continue;
    const { angle } = dihedralAngleAndGradients({
      p1: positions[crease.p1]!,
      p2: positions[crease.p2]!,
      apexA: positions[crease.apexA]!,
      apexB: positions[crease.apexB]!,
    });
    const wanted = source.edges_foldAngle?.[crease.edgeIndex] ?? 0;
    console.log(
      `    aresta ${String(crease.edgeIndex).padStart(2)} ` +
        `(${mesh.edges[crease.edgeIndex]!.vertices.join("–").padEnd(5)})  ` +
        `pedido ${String(wanted).padStart(8)}°   obtido ${((angle * 180) / Math.PI).toFixed(2).padStart(8)}°`,
    );
  }
}

async function main() {
  const requested = process.argv.includes("--model")
    ? [process.argv[process.argv.indexOf("--model") + 1]!]
    : origamiModelEntries.map((entry) => entry.id);

  for (const id of requested) {
    try {
      await inspectOne(id);
    } catch (error) {
      console.log(`\n${id}: ${error instanceof Error ? error.message : error}`);
    }
  }
}

void main();
