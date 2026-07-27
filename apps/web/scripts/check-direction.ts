import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";

/**
 * `check:direction` — relatório v2 §10.5 e §4.8.
 *
 * > A ordem não importa; a direção importa. Nada entra numa relação de cuidado
 * > sem um ato deliberado, independentemente de quando foi criado.
 *
 * Se a Ana fez três experiências sozinha em março e começa terapia com a
 * Dra. X em junho, a Dra. X não vê nada de março automaticamente.
 *
 * O invariante testável: **não existe caminho de leitura de `tools.tool_runs`
 * para qualquer ator profissional.** O único caminho é `shared_snapshots`,
 * criado por ação explícita do cliente. Este check impede que esse caminho
 * apareça por distração, numa query direta ou num import de conveniência.
 */

/** Superfícies onde um ator profissional lê dados. */
const professionalSurfaces = [
  "app/[locale]/(professional)",
  "app/[locale]/(admin)",
  "components/professional-workspaces.tsx",
  "components/admin-workspaces.tsx",
];

/** Tabelas que um ator profissional nunca pode ler diretamente. */
const forbiddenReads = [
  "tool_runs",
  "tool_response_revisions",
  "session_bridges",
  "care.intervals",
];

/** O único caminho legítimo de C2 para C3. */
const permittedPath = "shared_snapshots";

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

async function collect(target: string): Promise<string[]> {
  try {
    const files = await filesUnder(target);
    return files;
  } catch {
    // Um caminho único (ficheiro, não diretório).
    try {
      await readFile(target, "utf8");
      return [target];
    } catch {
      return [];
    }
  }
}

async function main() {
  const failures: string[] = [];
  let scanned = 0;

  for (const surface of professionalSurfaces) {
    for (const file of await collect(surface)) {
      const source = await readFile(file, "utf8");
      const relativePath = relative(".", file).replace(/\\/g, "/");
      scanned += 1;

      for (const table of forbiddenReads) {
        const pattern = new RegExp(
          `(?:from|select|join|\\.from\\(|rpc\\()\\s*['"\`]?[\\w.]*${table.replace(".", "\\.")}`,
          "gi",
        );
        if (pattern.test(source)) {
          failures.push(
            `${relativePath} — superfície profissional referencia "${table}". ` +
              `O único caminho de C2 para C3 é "${permittedPath}", criado por ato deliberado do cliente (§4.8).`,
          );
        }
      }
    }
  }

  // A superfície profissional não pode importar os motores de experiência:
  // isso reintroduziria acesso a conteúdo de cliente pela porta do bundle.
  for (const surface of professionalSurfaces) {
    for (const file of await collect(surface)) {
      const source = await readFile(file, "utf8");
      const relativePath = relative(".", file).replace(/\\/g, "/");

      const engineImport =
        /from\s+["'](?:@\/components\/(?:load-structures-experience|session-inventory-experience)|@alem-da-sessao\/tool-registry\/artifact)["']/;
      if (engineImport.test(source)) {
        failures.push(
          `${relativePath} — superfície profissional importa um motor de experiência ou o renderizador de artefactos. ` +
            `O profissional vê snapshots, nunca o motor que produziu o conteúdo.`,
        );
      }
    }
  }

  if (failures.length) {
    console.error("check:direction — a regra de direção foi violada (§4.8):");
    for (const failure of failures) {
      console.error(`  ${failure}`);
    }
    process.exitCode = 1;
  } else {
    console.log(
      `check:direction passou em ${scanned} ficheiros de superfície profissional (nenhum caminho de leitura para tool_runs).`,
    );
  }
}

void main();
