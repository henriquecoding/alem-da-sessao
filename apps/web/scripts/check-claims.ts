import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";

/**
 * `check:claims` — relatório v2 §10.5, a defesa arquitetural do §8.4.
 *
 * Software com finalidade médica própria pode qualificar como dispositivo sob
 * o MDR, frequentemente classe IIa ou superior pela Regra 11. Os gatilhos são
 * conhecidos: calcular score de sintoma, implementar instrumento psicométrico
 * com interpretação, gerar recomendação de intervenção, alertar sobre
 * deterioração, alegar eficácia terapêutica.
 *
 * Com a porta A aberta a disciplina fica **mais** estrita, não menos, porque
 * não há clínico a interpretar o que a pessoa fez sozinha (§8.4).
 *
 * A negação é aprovada e desejada: *"não diagnostica, não prescreve e não
 * substitui o acompanhamento profissional"* é exatamente a frase que queremos
 * no site. O que falha o build é a afirmação.
 */

const roots = ["app", "components", "lib", "../../packages", "../../docs"];

type ClaimRule = {
  /** O que a ocorrência afirmaria, para a mensagem de erro ser acionável. */
  reason: string;
  pattern: RegExp;
};

const claims: ClaimRule[] = [
  {
    pattern: /\bcura(?:r|mos|do|tivo)?\b/gi,
    reason: "alegação de cura",
  },
  {
    pattern: /\bdiagnostica(?:r|mos)?\b|\bdiagnóstic[oa]s?\b/gi,
    reason: "alegação de diagnóstico",
  },
  {
    pattern: /\breduz(?:ir|imos)?\s+(?:os\s+)?sintomas\b/gi,
    reason: "alegação de redução de sintomas",
  },
  {
    pattern:
      /\beficaz\s+(?:para|no|na|contra)\b|\befic[áa]cia\s+(?:comprovada|cl[íi]nica)\b/gi,
    reason: "alegação de eficácia",
  },
  {
    pattern:
      /\b(?:clinicamente|cientificamente)\s+(?:comprovad|testad|validad)[oa]s?\b/gi,
    reason: "alegação de comprovação clínica",
  },
  {
    pattern: /\bavalia(?:r|ção)?\s+(?:o\s+)?risco\b/gi,
    reason: "alegação de avaliação de risco",
  },
  {
    pattern:
      /\bmede\s+(?:o\s+)?progresso\b|\bmedi(?:r|ção)\s+(?:de|do)\s+progresso\b/gi,
    reason: "alegação de medição de progresso",
  },
  {
    pattern: /\bdete(?:c|ç|cç)?[aãt](?:a|ar|ção|cção)\s+(?:de\s+)?crise\b/gi,
    reason: "alegação de deteção de crise",
  },
  {
    pattern: /\btrata\s+(?:a|o|as|os)\s+\w+/gi,
    reason: "alegação de tratamento",
  },
  {
    pattern:
      /\bsubstitui\s+(?:a\s+)?(?:terapia|psicoterapia|acompanhamento)\b/gi,
    reason: "alegação de substituição do acompanhamento",
  },
];

/**
 * Marcadores de negação, avaliados sobre a **frase inteira** e não só sobre o
 * que vem antes: "não produzir diagnósticos" e "diagnóstico automático fica
 * fora do MVP" são ambos a formulação que o produto quer — a afirmação do que
 * ele não faz. É por isso que a janela é a linha e não um prefixo curto.
 */
const negations =
  /\b(?:não|nao|nunca|sem|jamais|nenhum|nenhuma|proibid[oa]s?|recusa|evita|impede|isenta|exclui|fora\s+d[oe]|em\s+vez\s+de|nada\s+de)\b/i;

/**
 * Qualificadores que tiram a ocorrência do domínio clínico. "Diagnóstico
 * operacional" de um sistema não é uma alegação de saúde.
 */
const nonClinicalQualifier =
  /^\s*(?:operacional|t[ée]cnic[oa]|de\s+sistema|de\s+infraestrutura|de\s+rede)/i;

/**
 * Aprovação explícita e auditável. Prosa regulatória tem de poder nomear os
 * gatilhos do MDR para os recusar; a marca obriga a escrever o motivo, para
 * que ninguém a use para silenciar uma alegação a sério.
 */
const approvalMarker = /claims-ok:\s*\S+/i;

/** Ficheiros que existem justamente para falar de alegações proibidas. */
const exemptFiles = new Set([
  "scripts/check-claims.ts",
  "docs/design/anti-padroes.md",
  "docs/adr/0011-no-clinical-ai.md",
]);

async function filesUnder(path: string): Promise<string[]> {
  const entries = await readdir(path, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const child = join(path, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await filesUnder(child)));
    } else if (
      [".ts", ".tsx", ".md", ".mdx", ".json"].includes(extname(entry.name))
    ) {
      files.push(child);
    }
  }

  return files;
}

function lineAndContext(source: string, index: number, matchLength: number) {
  const before = source.slice(0, index);
  const line = before.split("\n").length;
  const lineStart = before.lastIndexOf("\n") + 1;
  const lineEndOffset = source.indexOf("\n", index);
  const lineEnd = lineEndOffset === -1 ? source.length : lineEndOffset;

  return {
    line,
    text: source.slice(lineStart, lineEnd),
    after: source.slice(index + matchLength, lineEnd),
  };
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
      const relativePath = relative(".", file).replace(/\\/g, "/");
      const normalised = file.replace(/\\/g, "/");
      if (
        exemptFiles.has(normalised) ||
        [...exemptFiles].some((exempt) => normalised.endsWith(exempt))
      ) {
        continue;
      }

      const source = await readFile(file, "utf8");
      scanned += 1;

      for (const claim of claims) {
        claim.pattern.lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = claim.pattern.exec(source)) !== null) {
          const { line, text, after } = lineAndContext(
            source,
            match.index,
            match[0].length,
          );

          if (negations.test(text)) continue;
          if (nonClinicalQualifier.test(after)) continue;
          if (approvalMarker.test(text)) continue;

          failures.push(
            `${relativePath}:${line} — ${claim.reason}: "${match[0].trim()}"`,
          );
        }
      }
    }
  }

  if (failures.length) {
    console.error(
      "check:claims — alegações não aprovadas (§8.4 fronteira de dispositivo médico):",
    );
    for (const failure of failures) {
      console.error(`  ${failure}`);
    }
    console.error(
      "\nUma alegação precedida de negação é aprovada. Se a ocorrência for legítima, reformule-a como aquilo que o produto não faz.",
    );
    process.exitCode = 1;
  } else {
    console.log(
      `check:claims passou em ${scanned} ficheiros (dicionário de ${claims.length} alegações).`,
    );
  }
}

void main();
