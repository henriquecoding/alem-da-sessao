import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";

/**
 * `check:accessibility` — relatório v2 §10.5, sobre os critérios do §7.6.
 *
 * O European Accessibility Act aplica-se desde 28/06/2025 a serviços digitais
 * oferecidos a consumidores na UE, com referência técnica na EN 301 549.
 * Portugal está no âmbito, portanto isto é obrigação legal, não boa prática.
 *
 * Além da conformidade: populações com deficiência visual, motora e cognitiva
 * estão sobre-representadas em saúde mental, e sofrimento agudo produz défices
 * temporários de atenção e memória de trabalho. Projetar para carga cognitiva
 * reduzida é projetar para o estado típico do utilizador no momento em que
 * ele mais precisa do produto.
 *
 * Este check cobre as assertions estruturais que se verificam sobre a fonte.
 * Os critérios que exigem um navegador (contraste calculado, ordem de foco
 * real) ficam para os testes de componente e para a auditoria manual.
 */

const roots = ["app", "components"];

type Rule = {
  id: string;
  reason: string;
  /** Devolve as ocorrências problemáticas de um ficheiro. */
  find: (source: string) => string[];
};

function matchAll(source: string, pattern: RegExp): string[] {
  return [...source.matchAll(pattern)].map((match) => match[0]);
}

const rules: Rule[] = [
  {
    id: "3.3.8 Accessible Authentication",
    reason:
      "bloquear colagem num campo de código é violação — verifique o campo TOTP",
    find: (source) =>
      matchAll(
        source,
        /onPaste\s*=\s*\{?\s*\(?[^)]*\)?\s*=>\s*[^}]*preventDefault/g,
      ),
  },
  {
    id: "2.5.7 Dragging Movements",
    reason:
      "toda interação de arraste precisa de alternativa por botão ou teclado, projetada junto e não depois",
    find: (source) => {
      const hasDrag =
        /onPointerMove|onDragStart|onTouchMove|draggable\s*=\s*\{?true/.test(
          source,
        );
      if (!hasDrag) return [];
      // A alternativa aceite: teclado no mesmo controlo, ou um controlo
      // explicitamente marcado como alternativa.
      const hasAlternative = /onKeyDown|onKeyUp|data-drag-alternative/.test(
        source,
      );
      return hasAlternative ? [] : ["arraste sem alternativa declarada"];
    },
  },
  {
    id: "2.5.8 Target Size",
    reason:
      "alvos interativos precisam de altura mínima — o produto exige 44px (min-h-11)",
    find: (source) =>
      matchAll(
        source,
        /<button(?![^>]*(?:min-h-|size-1[01]|size-9|h-9|h-1[0-3]|sr-only|aria-hidden))[^>]*className="[^"]*"/g,
      ),
  },
  {
    id: "1.1.1 Non-text Content",
    reason:
      "SVG decorativo precisa de aria-hidden; SVG informativo de role e rótulo",
    find: (source) =>
      matchAll(
        source,
        /<svg(?![^>]*(?:aria-hidden|role=|aria-label|aria-labelledby))[^>]*>/g,
      ),
  },
  {
    id: "4.1.2 Name, Role, Value",
    reason: "botão só com ícone precisa de aria-label",
    find: (source) =>
      matchAll(
        source,
        /<button(?![^>]*(?:aria-label|aria-labelledby|title=))[^>]*>\s*\{?\s*<(?:[A-Z]\w+|svg)[^>]*\/>\s*\}?\s*<\/button>/g,
      ),
  },
];

async function filesUnder(path: string): Promise<string[]> {
  const entries = await readdir(path, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name === "node_modules") continue;
    const child = join(path, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await filesUnder(child)));
    } else if ([".tsx"].includes(extname(entry.name))) {
      files.push(child);
    }
  }

  return files;
}

async function main() {
  const failures: string[] = [];
  let scanned = 0;

  for (const root of roots) {
    let files: string[];
    try {
      files = await filesUnder(root);
    } catch {
      continue;
    }

    for (const file of files) {
      const source = await readFile(file, "utf8");
      scanned += 1;
      const show = relative(".", file).replace(/\\/g, "/");

      for (const rule of rules) {
        for (const occurrence of rule.find(source)) {
          failures.push(
            `${show} — ${rule.id}: ${rule.reason}\n      ${occurrence.slice(0, 120).replace(/\s+/g, " ")}`,
          );
        }
      }
    }
  }

  if (failures.length) {
    console.error("check:accessibility — WCAG 2.2 AA (§7.6, EN 301 549):");
    for (const failure of failures) {
      console.error(`  ${failure}`);
    }
    process.exitCode = 1;
  } else {
    console.log(
      `check:accessibility passou em ${scanned} componentes (${rules.length} critérios estruturais).`,
    );
  }
}

void main();
