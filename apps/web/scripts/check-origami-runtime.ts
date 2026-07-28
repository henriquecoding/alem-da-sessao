import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

/**
 * `check:origami-runtime` — a porta do sistema de geometria real.
 *
 * O `check:origami` que já existia continua a guardar os modelos SVG da
 * homepage, e continua certo para o que eles são: desenhos planos, onde a soma
 * das áreas tem mesmo de igualar a silhueta. Este gate guarda outra coisa —
 * papel dobrado, com camadas — e por isso mede outras grandezas. Os dois
 * coexistem até a homepage passar a usar os assets compilados.
 *
 * Três famílias de verificação:
 *
 * **1. O asset corresponde à sua fonte.** O `sha256` do `source.fold` está
 * gravado no asset. Se alguém editar o FOLD e não recompilar, ou editar o
 * `.ors.json` à mão, os hashes divergem e o build para. É o que impede o
 * ficheiro derivado de se tornar uma fonte paralela.
 *
 * **2. O diagnóstico da simulação está dentro dos limites.** Deformação de
 * aresta, auto-interseções, triângulos degenerados, erro de quantização.
 * Nenhum destes é uma questão de gosto.
 *
 * **3. A fronteira entre autoria e runtime não foi atravessada.** O browser não
 * pode carregar o validador nem o solver. `import type` é permitido — não
 * sobrevive à compilação — e qualquer import de valor falha.
 */

const ASSET_ROOT = "public/origami";

/** Ficheiros que compõem o runtime público. Nenhum pode arrastar autoria. */
const RUNTIME_SOURCES = [
  "components/origami/runtime/asset.ts",
  "components/origami/runtime/colour.ts",
  "components/origami/runtime/program.ts",
  "components/origami/runtime/renderer.ts",
  "components/origami/runtime/shaders.ts",
  "components/origami/use-origami-timeline.ts",
  "components/origami/origami-canvas.tsx",
];

const FORBIDDEN_IN_RUNTIME = [
  {
    // Import de valor do pacote de autoria. `import type { … } from` passa.
    pattern:
      /^\s*import\s+(?!type\s)[^;]*from\s+["']@alem-da-sessao\/origami-core["']/m,
    reason:
      "importa @alem-da-sessao/origami-core como valor (validador e solver)",
  },
  {
    pattern: /from\s+["'](?:three|@react-three\/[^"']+)["']/,
    reason: "importa Three.js antes de o renderizador próprio ter sido medido",
  },
  {
    pattern:
      /from\s+["'](?:framer-motion|gsap|motion|@react-spring|lottie|animejs)["']/,
    reason: "importa uma biblioteca de animação",
  },
  {
    pattern: /\bnode:(?:fs|path|crypto)\b/,
    reason: "usa um módulo de Node num ficheiro que corre no browser",
  },
];

const LIMITS = {
  maxEdgeStrain: 0.0025,
  selfIntersectionCount: 0,
  degenerateTriangleCount: 0,
  /** Em unidades do modelo; a folha mede 1. */
  quantizationError: 1e-4,
  /** Radianos. Uma face do source não tem vinco lá dentro. */
  maxFacePlanarityError: (2 * Math.PI) / 180,
  assetGzipKb: 28,
  fallbackGzipKb: 12,
} as const;

type Failure = { readonly where: string; readonly what: string };

async function checkAssets(failures: Failure[]): Promise<number> {
  let directories: string[];
  try {
    directories = (await readdir(ASSET_ROOT, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  } catch {
    console.log("  nenhum asset compilado ainda (public/origami não existe).");
    return 0;
  }

  if (!directories.length) {
    failures.push({
      where: ASSET_ROOT,
      what: "não há um único modelo compilado; corre `pnpm origami:compile`",
    });
    return 0;
  }

  console.log(
    "  modelo            triâng.  strain    inters.  quant.     asset   fallback",
  );

  for (const id of directories) {
    const base = join(ASSET_ROOT, id);

    let source: string;
    let assetText: string;
    try {
      source = await readFile(join(base, "source.fold"), "utf8");
      assetText = await readFile(join(base, "model.ors.json"), "utf8");
    } catch {
      failures.push({
        where: id,
        what: "falta `source.fold` ou `model.ors.json`",
      });
      continue;
    }

    const asset = JSON.parse(assetText) as {
      format: string;
      version: number;
      modelId: string;
      sourceSha256: string;
      triangles: number[];
      fallback: { svg: string };
      diagnostics: Record<string, number>;
    };

    if (asset.format !== "ads-origami-runtime" || asset.version !== 1) {
      failures.push({
        where: id,
        what: "formato ou versão do asset inesperados",
      });
      continue;
    }

    if (asset.modelId !== id) {
      failures.push({
        where: id,
        what: `o asset diz chamar-se "${asset.modelId}" e está na pasta "${id}"`,
      });
    }

    const digest = createHash("sha256").update(source).digest("hex");
    if (digest !== asset.sourceSha256) {
      failures.push({
        where: id,
        what:
          "o asset não corresponde ao `source.fold` — alguém editou um dos dois " +
          "sem recompilar. Corre `pnpm origami:compile --model " +
          id +
          "`.",
      });
    }

    const assetKb = gzipSync(assetText).length / 1024;
    const fallbackKb = gzipSync(asset.fallback.svg).length / 1024;

    console.log(
      `  ${id.padEnd(17)} ${String(asset.triangles.length / 3).padStart(6)}  ` +
        `${(asset.diagnostics.maxEdgeStrain! * 100).toFixed(4).padStart(7)}%  ` +
        `${String(asset.diagnostics.selfIntersectionCount).padStart(6)}  ` +
        `${asset.diagnostics.quantizationError!.toExponential(1).padStart(8)}  ` +
        `${assetKb.toFixed(1).padStart(6)} kB  ${fallbackKb.toFixed(1).padStart(5)} kB`,
    );

    const check = (
      key: keyof typeof LIMITS,
      value: number,
      label: string,
      format: (v: number) => string = String,
    ) => {
      if (value > LIMITS[key]) {
        failures.push({
          where: id,
          what: `${label} é ${format(value)} e o limite é ${format(LIMITS[key])}`,
        });
      }
    };

    check(
      "maxEdgeStrain",
      asset.diagnostics.maxEdgeStrain!,
      "a deformação de aresta",
      (v) => `${(v * 100).toFixed(4)}%`,
    );
    check(
      "selfIntersectionCount",
      asset.diagnostics.selfIntersectionCount!,
      "o número de auto-interseções",
    );
    check(
      "degenerateTriangleCount",
      asset.diagnostics.degenerateTriangleCount!,
      "o número de triângulos degenerados",
    );
    check(
      "quantizationError",
      asset.diagnostics.quantizationError!,
      "o erro de quantização",
      (v) => v.toExponential(1),
    );
    check(
      "maxFacePlanarityError",
      asset.diagnostics.maxFacePlanarityError!,
      "o desvio de planaridade de face",
      (v) => `${((v * 180) / Math.PI).toFixed(2)}°`,
    );
    check(
      "assetGzipKb",
      assetKb,
      "o asset comprimido",
      (v) => `${v.toFixed(1)} kB`,
    );
    check(
      "fallbackGzipKb",
      fallbackKb,
      "o fallback comprimido",
      (v) => `${v.toFixed(1)} kB`,
    );
  }

  return directories.length;
}

async function checkBoundary(failures: Failure[]): Promise<void> {
  for (const file of RUNTIME_SOURCES) {
    let contents: string;
    try {
      contents = await readFile(file, "utf8");
    } catch {
      failures.push({
        where: file,
        what: "está declarado no gate e não existe",
      });
      continue;
    }

    for (const forbidden of FORBIDDEN_IN_RUNTIME) {
      if (forbidden.pattern.test(contents)) {
        failures.push({ where: file, what: forbidden.reason });
      }
    }
  }

  console.log(
    `  ${RUNTIME_SOURCES.length} ficheiros de runtime verificados; nenhum arrasta autoria.`,
  );
}

async function main() {
  const failures: Failure[] = [];

  console.log("check:origami-runtime — assets compilados\n");
  const count = await checkAssets(failures);

  console.log("\ncheck:origami-runtime — fronteira autoria/browser\n");
  await checkBoundary(failures);

  if (failures.length) {
    console.error("\ncheck:origami-runtime falhou:");
    for (const failure of failures) {
      console.error(`  ${failure.where}: ${failure.what}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    `\ncheck:origami-runtime passou (${count} modelos dentro dos limites).`,
  );
}

void main();
