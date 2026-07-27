import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { toolRegistry } from "@alem-da-sessao/tool-registry";

/**
 * `check:budgets` — relatório v2 §6.2 e §10.5.
 *
 * Os dois modos do produto têm de continuar separados por construção:
 *
 * | | Care OS | Experiência |
 * | Ritmo  | rápido; latência é hostilidade | lento; pressa é hostilidade |
 * | Bundle | mínimo, zero libs de animação  | isolado por rota, sob demanda |
 *
 * Falha o build se qualquer chunk do Care OS importar, direta ou
 * transitivamente, um motor de experiência, uma fonte editorial ou uma
 * biblioteca de animação; e se uma experiência exceder o `bundleBudgetKb`
 * que ela própria declarou no manifesto.
 */

/** Rotas e componentes do Care OS — o modo de competência tranquila. */
const careOsEntrypoints = [
  "app/[locale]/(professional)",
  "app/[locale]/(admin)",
  "app/[locale]/(client)/cuidado/hoje",
  "app/[locale]/(client)/cuidado/sessoes",
  "app/[locale]/(client)/cuidado/partilhas",
  "app/[locale]/(client)/cuidado/conta",
];

/** Módulos que o Care OS não pode arrastar. */
const forbiddenInCareOs = [
  {
    pattern: /@\/components\/load-structures-experience/,
    reason: "motor de experiência",
  },
  {
    pattern: /@\/components\/session-inventory-experience/,
    reason: "motor de experiência",
  },
  {
    pattern: /@\/components\/load-structures-community/,
    reason: "motor de experiência",
  },
  {
    pattern: /@alem-da-sessao\/tool-registry\/artifact/,
    reason: "renderizador de artefactos",
  },
  { pattern: /@fontsource[-/]variable\/newsreader/, reason: "fonte editorial" },
  {
    pattern:
      /from\s+["'](?:framer-motion|gsap|motion|@react-spring|lottie|animejs)/,
    reason: "biblioteca de animação",
  },
];

/** Ficheiros que compõem cada experiência, para medir o orçamento declarado. */
const experienceSources: Record<string, string[]> = {
  "load-structures": [
    "components/load-structures-experience.tsx",
    "components/load-structures-community.tsx",
  ],
  "session-inventory": ["components/session-inventory-experience.tsx"],
};

async function filesUnder(path: string): Promise<string[]> {
  const entries = await readdir(path, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name === "node_modules") continue;
    const child = join(path, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await filesUnder(child)));
    } else if ([".ts", ".tsx"].includes(extname(entry.name))) {
      files.push(child);
    }
  }

  return files;
}

/**
 * Resolve imports locais em profundidade. Um import proibido escondido a três
 * saltos de distância continua a ir para o chunk, e é exatamente esse o caso
 * que a revisão humana não apanha.
 */
async function transitiveLocalImports(
  entry: string,
  seen = new Set<string>(),
): Promise<string[]> {
  if (seen.has(entry)) return [];
  seen.add(entry);

  let source: string;
  try {
    source = await readFile(entry, "utf8");
  } catch {
    return [];
  }

  const collected = [entry];
  const importPattern = /from\s+["'](@\/[^"']+)["']/g;
  let match: RegExpExecArray | null;

  while ((match = importPattern.exec(source)) !== null) {
    const specifier = match[1]!.replace(/^@\//, "");
    for (const candidate of [
      `${specifier}.tsx`,
      `${specifier}.ts`,
      join(specifier, "index.tsx"),
      join(specifier, "index.ts"),
    ]) {
      try {
        await stat(candidate);
        collected.push(...(await transitiveLocalImports(candidate, seen)));
        break;
      } catch {
        continue;
      }
    }
  }

  return collected;
}

async function main() {
  const failures: string[] = [];

  // 1. O Care OS não arrasta o modo Experiência.
  for (const entrypoint of careOsEntrypoints) {
    let entryFiles: string[];
    try {
      entryFiles = await filesUnder(entrypoint);
    } catch {
      continue;
    }

    for (const entryFile of entryFiles) {
      const graph = await transitiveLocalImports(entryFile);
      for (const file of graph) {
        const source = await readFile(file, "utf8");
        for (const forbidden of forbiddenInCareOs) {
          if (forbidden.pattern.test(source)) {
            failures.push(
              `${relative(".", entrypoint)} → ${relative(".", file)} arrasta ${forbidden.reason} (§6.2).`,
            );
          }
        }
      }
    }
  }

  // 2. Cada experiência dentro do orçamento que declarou no manifesto.
  for (const tool of toolRegistry) {
    const sources = experienceSources[tool.id];
    if (!sources) {
      failures.push(
        `${tool.id} não tem ficheiros declarados em check:budgets — o orçamento não é verificável.`,
      );
      continue;
    }

    let bytes = 0;
    for (const source of sources) {
      try {
        bytes += (await stat(source)).size;
      } catch {
        failures.push(`${tool.id}: ficheiro declarado não existe — ${source}.`);
      }
    }

    const kb = Math.round((bytes / 1024) * 10) / 10;
    const budget = tool.originality.visualDirection.bundleBudgetKb;
    if (kb > budget) {
      failures.push(
        `${tool.id}: fonte da experiência ocupa ${kb} kB e o orçamento declarado é ${budget} kB.`,
      );
    } else {
      console.log(`  ${tool.id}: ${kb} kB / ${budget} kB declarados.`);
    }
  }

  if (failures.length) {
    console.error("check:budgets — separação dos dois modos violada (§6.2):");
    for (const failure of [...new Set(failures)]) {
      console.error(`  ${failure}`);
    }
    process.exitCode = 1;
  } else {
    console.log("check:budgets passou (Care OS isolado, orçamentos dentro).");
  }
}

void main();
