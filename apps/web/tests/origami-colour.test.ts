import { describe, expect, it } from "vitest";
import { parseCssColour } from "@/components/origami/runtime/colour";
import { paperFamilyList } from "@/components/origami/tokens/paper";

/**
 * O defeito que este ficheiro existe para impedir.
 *
 * `parseCssColour` extraía canais com um regex numérico. Sobre `rgb(224, 217,
 * 242)` funciona; sobre `#e0d9f2` — que é o que o browser devolve quando lê a
 * custom property, porque é assim que os tokens estão escritos — apanhava os
 * dígitos `0`, `9` e `2` que por acaso lá estão, e devolvia um quase-preto.
 *
 * Não devolvia `null`. Nunca caía no valor de recurso. Não havia erro em
 * consola, o canvas ficava pronto, os testes passavam — e o papel lilás era
 * pintado com uma cor que não existe em lado nenhum. Um parser que devolve uma
 * resposta errada em vez de nenhuma é a pior falha possível numa fronteira de
 * formato, e é por isso que a leitura real passou a ser feita por sonda: o
 * browser resolve, e o parser só vê `rgb(...)`.
 *
 * Este teste guarda o parser à mesma, porque ele continua a ser a última linha.
 */

const near = (value: number, expected: number) =>
  expect(Math.abs(value - expected)).toBeLessThan(0.002);

describe("parseCssColour", () => {
  it("lê `rgb()` nas duas sintaxes", () => {
    for (const text of ["rgb(224, 217, 242)", "rgb(224 217 242)"]) {
      const parsed = parseCssColour(text);
      expect(parsed, text).not.toBeNull();
      near(parsed![0], 0.7454);
    }
  });

  it("lê hex, que é como os tokens estão escritos", () => {
    const parsed = parseCssColour("#e0d9f2");
    expect(parsed).not.toBeNull();
    near(parsed![0], 0.7454);
    near(parsed![1], 0.6939);
    near(parsed![2], 0.8879);
  });

  it("não confunde os dígitos de um hex com canais", () => {
    // O bug exato: `#e0d9f2` → [0, 9, 2] → quase-preto.
    const hex = parseCssColour("#e0d9f2")!;
    const wrong = parseCssColour("rgb(0, 9, 2)")!;
    expect(hex[0]).toBeGreaterThan(wrong[0] + 0.5);
  });

  it("aceita hex curto e ignora o alfa", () => {
    expect(parseCssColour("#fff")).toEqual(parseCssColour("#ffffff"));
    expect(parseCssColour("#e0d9f280")).toEqual(parseCssColour("#e0d9f2"));
  });

  it("devolve null onde não há cor nenhuma", () => {
    for (const text of ["", "   ", "none", "var(--paper-lit)"]) {
      expect(parseCssColour(text), text).toBeNull();
    }
  });

  /**
   * A prova que interessa ao produto: todos os tokens de papel que existem são
   * legíveis, e nenhum deles cai no valor de recurso.
   */
  it("lê todos os tokens de papel reais nos dois temas", () => {
    for (const family of paperFamilyList) {
      for (const theme of ["light", "dark"] as const) {
        for (const [tone, value] of Object.entries(family[theme])) {
          const parsed = parseCssColour(value);
          expect(
            parsed,
            `${family.id}.${theme}.${tone} = ${value}`,
          ).not.toBeNull();
          for (const channel of parsed!) {
            expect(channel).toBeGreaterThanOrEqual(0);
            expect(channel).toBeLessThanOrEqual(1);
          }
        }
      }
    }
  });
});
