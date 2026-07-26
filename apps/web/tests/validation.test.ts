import { describe, expect, it } from "vitest";
import { loadStructuresSchema } from "@alem-da-sessao/validation";

const valid = {
  responsibility:
    "Tenho coordenado sozinho os cuidados diários de um familiar.",
  observableEffects:
    "Tenho menos tempo livre e adio decisões pessoais importantes.",
  currentSupport: "Uma amiga ajuda uma tarde por semana.",
  desiredRedistribution: "Gostaria de dividir tarefas de transporte.",
  nextSessionFocus: "Quero conversar sobre como pedir ajuda.",
};

describe("load structures input", () => {
  it("accepts a complete reflection without producing a score", () => {
    expect(loadStructuresSchema.safeParse(valid).success).toBe(true);
    expect("score" in loadStructuresSchema.parse(valid)).toBe(false);
  });

  it("rejects an empty core responsibility", () => {
    expect(
      loadStructuresSchema.safeParse({ ...valid, responsibility: "curto" })
        .success,
    ).toBe(false);
  });
});
