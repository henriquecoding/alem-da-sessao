import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  authorFoldSource,
  bakeModel,
  buildMesh,
  compileModel,
  stagesFromSource,
  validateFoldSource,
  type BakeResult,
} from "@alem-da-sessao/origami-core";
import { findModelEntry, origamiModelEntries } from "./models/index";

/**
 * `pnpm origami:compile` — de modelo autorado a asset de produção.
 *
 * Três ficheiros por modelo, todos versionados:
 *
 * | Ficheiro          | O que é                                          |
 * | ----------------- | ------------------------------------------------ |
 * | `source.fold`     | FOLD 1.2. A fonte de verdade, legível e diffável. |
 * | `model.ors.json`  | O que o browser carrega. Derivado, nunca editado. |
 * | `provenance.json` | Autoria, licença, diagnóstico e estado de aprovação. |
 *
 * O `source.fold` é gerado a partir da descrição em `tools/origami/models/`,
 * mas é ele — e não o script — que fica como fonte. Um `.fold` é legível por
 * qualquer ferramenta que fale o formato e revê-se num diff; um script que o
 * produz é mais uma coisa que pode mudar sem que ninguém repare.
 *
 * Nada disto corre no browser, e nada disto corre no build do Next. Corre
 * quando alguém autora um modelo, e o resultado vai para o repositório.
 */

// Relativo a este ficheiro, e não ao diretório de trabalho: o script corre a
// partir do seu próprio pacote e escreve na app.
const PUBLIC_ROOT = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../apps/web/public/origami",
);

type CompileOutcome = {
  readonly id: string;
  readonly ok: boolean;
  readonly detail: string;
};

function formatBake(result: BakeResult): string {
  const d = result.diagnostics;
  return [
    `${d.frames} frames`,
    `${d.stepsTaken} passos`,
    `strain ${(d.worstEdgeStrain * 100).toFixed(4)}%`,
    `ângulo ${d.finalAngleErrorDegrees.toFixed(2)}°`,
    `interseções ${d.final.selfIntersectionCount}`,
    `planaridade ${((d.final.maxFacePlanarityError * 180) / Math.PI).toFixed(2)}°`,
  ].join("  ");
}

async function compileOne(id: string): Promise<CompileOutcome> {
  const entry = findModelEntry(id);

  // 1. Autorar: as configurações-alvo tornam-se ângulos de vinco.
  const source = authorFoldSource(entry.model, entry.metadata);
  const serialized = `${JSON.stringify(source, null, 2)}\n`;

  // 2. Validar: os invariantes que separam uma folha de um desenho.
  const report = validateFoldSource(source);

  // 3. Simular: o padrão dobra mesmo, ou não dobra.
  const mesh = buildMesh(source);
  const baked = bakeModel(mesh, stagesFromSource(source, mesh), {
    anchor: source["ads:anchor"],
    lengthProjectionIterations: 30,
  });

  const directory = join(PUBLIC_ROOT, id);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, "source.fold"), serialized, "utf8");

  if (!baked.ok) {
    return {
      id,
      ok: false,
      detail: `${baked.reason} — ${baked.detail}\n      ${formatBake(baked)}`,
    };
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
        title: entry.metadata.file_title,
        description: entry.metadata.file_description,
        author: entry.metadata.file_author,
        sourceFormat: "FOLD 1.2",
        sourceSha256: compiled.sourceSha256,
        license: entry.metadata["ads:license"],
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
        // Nenhum asset entra na homepage com um destes a falso. A revisão é
        // humana e é registada à mão — um campo que um script pusesse a
        // verdadeiro não seria uma aprovação.
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

  const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} kB`;

  return {
    id,
    ok: true,
    detail:
      `${formatBake(baked)}\n      ` +
      `${compiled.triangles.length / 3} triângulos, ${compiled.renderToSource.length} vértices de render, ` +
      `quantização ±${compiled.diagnostics.quantizationError.toExponential(1)}\n      ` +
      `asset ${kb(Buffer.byteLength(JSON.stringify(compiled)))}, fallback ${kb(Buffer.byteLength(compiled.fallback.svg))}`,
  };
}

async function main() {
  const requested = process.argv.includes("--model")
    ? [process.argv[process.argv.indexOf("--model") + 1]!]
    : origamiModelEntries.map((entry) => entry.id);

  console.log("origami:compile\n");

  const outcomes: CompileOutcome[] = [];
  for (const id of requested) {
    process.stdout.write(`  ${id.padEnd(16)} `);
    try {
      const outcome = await compileOne(id);
      outcomes.push(outcome);
      console.log(`${outcome.ok ? "ok" : "FALHOU"}\n      ${outcome.detail}\n`);
    } catch (error) {
      outcomes.push({
        id,
        ok: false,
        detail: error instanceof Error ? error.message : String(error),
      });
      console.log(
        `ERRO\n      ${error instanceof Error ? error.message : String(error)}\n`,
      );
    }
  }

  const failed = outcomes.filter((outcome) => !outcome.ok);
  if (failed.length) {
    console.error(
      `origami:compile — ${failed.length} de ${outcomes.length} não passaram: ${failed
        .map((outcome) => outcome.id)
        .join(", ")}`,
    );
    process.exitCode = 1;
  } else {
    console.log(`origami:compile — ${outcomes.length} modelos compilados.`);
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
