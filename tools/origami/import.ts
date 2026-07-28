import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import {
  authorFoldSource,
  bakeModel,
  buildMesh,
  compileModel,
  importCreasePattern,
  stagesFromSource,
  validateFoldSource,
  type FoldSourceMetadata,
  type OrigamiModelId,
  type PaperFamilyId,
} from "@alem-da-sessao/origami-core";

/**
 * `pnpm origami:import` — de um SVG de padrão de vincos a asset de produção.
 *
 * É o mesmo caminho de `origami:compile`, com uma diferença só: a geometria não
 * vem de um ficheiro em `models/`, vem de um desenho. Depois do importador, o
 * modelo passa exatamente pelos mesmos passos — validar, simular, compilar — e
 * escreve os mesmos três ficheiros. Não há um segundo caminho até ao asset.
 *
 * ## O que este comando exige e o `compile` não
 *
 * **Atribuição.** Um padrão de vincos que entra por aqui veio de algum lado, e
 * quase sempre de outra pessoa. `--attribution` e `--license` são obrigatórios
 * e vão para `provenance.json`. Um modelo importado sem proveniência é a única
 * coisa que este comando recusa por razões que não são geométricas.
 *
 * **Uma decisão sobre o papel que se atravessa.** Por omissão o gate bloqueia,
 * como em toda a parte. `--allow-self-intersection` troca-o por medição, e a
 * contagem fica gravada na proveniência. A troca está descrita em
 * `packages/origami-core/src/bake.ts` e a razão dela em
 * `docs/ORIGAMI_RUNTIME.md` §5: sem modelo de camadas, um padrão tradicional só
 * chega a uma forma reconhecível atravessando-se.
 */

const PUBLIC_ROOT = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../apps/web/public/origami",
);

function flag(name: string): string | undefined {
  const at = process.argv.indexOf(`--${name}`);
  return at >= 0 ? process.argv[at + 1] : undefined;
}

function required(name: string): string {
  const value = flag(name);
  if (!value) {
    throw new Error(`origami:import — falta --${name}.`);
  }
  return value;
}

function numbers(
  raw: string | undefined,
  fallback: readonly number[],
): number[] {
  if (!raw) return [...fallback];
  const parsed = raw
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((value) => Number.isFinite(value));
  if (!parsed.length) {
    throw new Error(`origami:import — "${raw}" não é uma lista de números.`);
  }
  return parsed;
}

async function main(): Promise<void> {
  const svgPath = required("svg");
  const id = required("id") as OrigamiModelId;
  const attribution = required("attribution");
  const license = required("license");

  const measureIntersections = process.argv.includes(
    "--allow-self-intersection",
  );
  const stageFractions = numbers(flag("stages"), [0.5, 1]);
  const weldTolerance = Number(flag("weld") ?? 1e-4);
  const foldAngleDegrees = Number(flag("angle") ?? 178);

  console.log(`origami:import — ${basename(svgPath)} → ${id}\n`);

  const svg = await readFile(svgPath, "utf8");

  // 1. Ler o desenho: cor do traço, arranjo planar, faces.
  const imported = importCreasePattern(svg, {
    weldTolerance,
    foldAngleDegrees,
    stageFractions,
  });
  const p = imported.report.planar;
  console.log(
    `  lido        ${imported.report.segmentsRead} segmentos → ` +
      `${imported.report.vertexCount} vértices, ${imported.report.edgeCount} arestas, ` +
      `${imported.report.faceCount} faces`,
  );
  console.log(
    `  arranjo     ${p.weldedPoints} soldados, ${p.crossings} cruzamentos, ` +
      `${p.splits} partições, ${p.duplicates} duplicados, ${p.rounds} rondas, ` +
      `erro de área ${p.areaError.toExponential(1)}`,
  );
  console.log(
    `  atribuições ${imported.report.mountainCount}M ${imported.report.valleyCount}V ` +
      `${imported.report.facetCount}F ${imported.report.boundaryCount}B`,
  );

  const metadata: FoldSourceMetadata = {
    file_spec: 1.2,
    file_creator: "tools/origami/import.ts",
    file_author: flag("author") ?? attribution,
    file_title: flag("title") ?? id,
    file_description:
      flag("description") ??
      `Padrão de vincos importado de ${basename(svgPath)}.`,
    file_classes: ["singleModel", "animation"],
    "ads:modelId": id,
    "ads:paper": {
      aspect: 1,
      uncut: true,
      frontFamily: (flag("front") ?? "apricot") as PaperFamilyId,
      backFamily: (flag("back") ?? "mist") as PaperFamilyId,
    },
    "ads:license": {
      id: license,
      sourceUrl: flag("source-url"),
      attribution,
    },
    "ads:presentation": { rotateX: Number(flag("rotate-x") ?? -90) },
  };

  // 2. Autorar e validar: os mesmos invariantes dos modelos escritos à mão.
  const source = authorFoldSource(imported.model, metadata);
  const serialized = `${JSON.stringify(source, null, 2)}\n`;
  const report = validateFoldSource(source);
  console.log(
    `  validação   ${report.triangleCount} triângulos, ` +
      `qualidade mínima ${report.worstTriangleQuality.toFixed(4)}, ` +
      `${report.warnings.length} avisos`,
  );

  const directory = join(PUBLIC_ROOT, id);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, "source.fold"), serialized, "utf8");

  // 3. Simular: o padrão dobra mesmo, ou não dobra.
  const mesh = buildMesh(source);
  const baked = bakeModel(mesh, stagesFromSource(source, mesh), {
    anchor: source["ads:anchor"],
    lengthProjectionIterations: 30,
    selfIntersection: measureIntersections ? "measure" : "reject",
  });

  const d = baked.diagnostics;
  console.log(
    `  bake        ${d.frames} frames, ${d.stepsTaken} passos, ` +
      `strain ${(d.worstEdgeStrain * 100).toFixed(4)}%, ` +
      `ângulo ${d.finalAngleErrorDegrees.toFixed(2)}°, ` +
      `interseções ${d.final.selfIntersectionCount}`,
  );

  if (!baked.ok) {
    console.error(`\norigami:import — ${baked.reason}: ${baked.detail}`);
    console.error(
      "  O `source.fold` foi escrito na mesma: é a leitura do desenho, e é ela que se revê.",
    );
    process.exitCode = 1;
    return;
  }

  if (d.final.selfIntersectionCount > 0) {
    console.warn(
      `\n  AVISO  este modelo atravessa o próprio papel em ${d.final.selfIntersectionCount} pares de ` +
        "triângulos.\n         A forma existe; fisicamente, aquela folha não a faria. " +
        "O número fica na proveniência\n         e nenhum texto do produto pode dizer que nada se atravessa.",
    );
  }

  // 4. Compilar: triangular, quantizar, projetar o fallback.
  const compiled = compileModel(source, mesh, baked, {
    sourceSha256: createHash("sha256").update(serialized).digest("hex"),
  });

  await writeFile(
    join(directory, "model.ors.json"),
    `${JSON.stringify(compiled)}\n`,
    "utf8",
  );

  await writeFile(
    join(directory, "provenance.json"),
    `${JSON.stringify(
      {
        modelId: id,
        title: metadata.file_title,
        description: metadata.file_description,
        author: metadata.file_author,
        sourceFormat: "FOLD 1.2",
        sourceSha256: compiled.sourceSha256,
        // De onde veio o desenho, e não só quem o compilou.
        importedFrom: {
          file: basename(svgPath),
          format: "SVG (cor do traço)",
          sha256: createHash("sha256").update(svg).digest("hex"),
          segments: imported.report.segmentsRead,
          weldTolerance,
          foldAngleDegrees,
          stageFractions,
        },
        license: metadata["ads:license"],
        paper: { uncut: true, square: true },
        topology: {
          vertices: report.vertexCount,
          edges: report.edgeCount,
          faces: report.faceCount,
          triangles: report.triangleCount,
          mountains: report.mountainCount,
          valleys: report.valleyCount,
          worstTriangleQuality: Number(report.worstTriangleQuality.toFixed(4)),
        },
        diagnostics: compiled.diagnostics,
        // O que a política do gate era quando este asset foi produzido. Sem
        // isto, um `selfIntersectionCount` maior que zero na proveniência não
        // se distinguiria de um gate que falhou em silêncio.
        selfIntersectionPolicy: measureIntersections ? "measure" : "reject",
        approval: {
          silhouette: false,
          motion: false,
          light: false,
          dark: false,
          mobile: false,
        },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  const kb = (bytes: number): string => `${(bytes / 1024).toFixed(1)} kB`;
  console.log(
    `  asset       ${compiled.triangles.length / 3} triângulos, ` +
      `${kb(Buffer.byteLength(JSON.stringify(compiled)))}, ` +
      `fallback ${kb(Buffer.byteLength(compiled.fallback.svg))}`,
  );
  console.log(`\norigami:import — ${id} escrito em ${directory}.`);
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
