import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { locales } from "@alem-da-sessao/i18n";
import {
  forbiddenPhrases,
  voice,
  voiceEntries,
  voiceKeys,
} from "@alem-da-sessao/i18n/voice";

/**
 * A microcópia como sistema verificável — relatório v2 §7.5.
 *
 * A lacuna da alfabetização emocional do software (§3.6) é "Registo guardado
 * com sucesso!" para quem acabou de escrever sobre o pai que morreu. Uma
 * tabela num documento não impede isso de voltar; um teste impede.
 */

const repoRoot = join(process.cwd(), "..", "..");

/** Ficheiros de interface onde a voz do produto é falada. */
const surfaces = [
  "components/session-bridge.tsx",
  "components/interval-place.tsx",
  "components/honest-state.tsx",
  "components/sensitivity.tsx",
  "components/experience-runtime/arrival.tsx",
  "components/experience-runtime/destination.tsx",
  "components/experience-runtime/share-receipt.tsx",
  "components/experience-runtime/crisis-panel.tsx",
];

describe("sistema de voz (§7.5)", () => {
  it("cobre os dois locales fundadores em todas as chaves", () => {
    for (const key of voiceKeys) {
      for (const locale of locales) {
        expect(voiceEntries[key][locale], `${key}.${locale}`).toBeTruthy();
      }
    }
  });

  it("documenta o que cada entrada nunca diz", () => {
    // O `never` existe para que o motivo sobreviva a quem escreveu a
    // alternativa. Sem ele a tabela vira uma lista de strings.
    for (const key of voiceKeys) {
      expect(voiceEntries[key].never.length, key).toBeGreaterThan(3);
    }
  });

  it("substitui todos os marcadores e recusa-se a mostrar um por preencher", () => {
    expect(voice("saved", "pt-PT", { time: "21h04" })).toBe(
      "Guardado às 21h04.",
    );
    expect(voice("error", "pt-BR", { reference: "4F2A" })).toContain("4F2A");

    // Preferimos falhar em teste a mostrar "{time}" a alguém.
    expect(() => voice("saved", "pt-PT")).toThrow(/time/);
  });

  it("nenhuma frase aprovada contém uma frase proibida", () => {
    for (const key of voiceKeys) {
      for (const locale of locales) {
        const text = voiceEntries[key][locale].toLowerCase();
        for (const phrase of forbiddenPhrases) {
          expect(text, `${key}.${locale}`).not.toContain(phrase);
        }
      }
    }
  });

  it("nenhuma superfície de interface usa uma frase proibida", () => {
    for (const surface of surfaces) {
      const source = readFileSync(join(process.cwd(), surface), "utf8");

      // Comentários fora primeiro. Um JSDoc que cita a frase proibida para
      // explicar por que ela é proibida é documentação, não voz do produto —
      // e um teste que não distingue as duas coisas empurra o código a parar
      // de explicar as suas próprias regras.
      const spoken = source
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/^\s*\/\/.*$/gm, "");

      const strings = [...spoken.matchAll(/"([^"\\]{4,})"/g)]
        .map((match) => match[1]!.toLowerCase())
        .join(" | ");

      for (const phrase of forbiddenPhrases) {
        expect(strings, `${surface} — "${phrase}"`).not.toContain(phrase);
      }
    }
  });

  it("os anti-padrões documentados nomeiam as verificações que os aplicam", () => {
    const document = readFileSync(
      join(repoRoot, "docs/design/anti-padroes.md"),
      "utf8",
    );

    for (const check of [
      "check:claims",
      "check:budgets",
      "voice.ts",
      "check:tools",
    ]) {
      expect(document).toContain(check);
    }
  });
});
