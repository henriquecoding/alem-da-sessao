import { describe, expect, it } from "vitest";
import {
  loadStructuresSchema,
  publicLoadStructureSchema,
} from "@alem-da-sessao/validation";

const valid = {
  loads: [
    {
      id: "care-family",
      label: "Cuidar de alguém",
      impactScale: 3,
      durationMonths: 12,
      ownership: "shared",
      movement: "ask",
      includeInShare: true,
    },
  ],
  effects: ["No tempo", "No sono"],
  support: "Dividir uma tarefa",
  hiddenFrom: "partner",
  nextSessionNote: "Quero perceber como pedir apoio.",
};

describe("load structures input", () => {
  it("accepts a structured map without producing a score", () => {
    expect(loadStructuresSchema.safeParse(valid).success).toBe(true);
    expect("score" in loadStructuresSchema.parse(valid)).toBe(false);
  });

  it("rejects a map without a selected load", () => {
    expect(
      loadStructuresSchema.safeParse({ ...valid, loads: [] }).success,
    ).toBe(false);
  });

  it("keeps the public load contract structurally minimal", () => {
    const result = publicLoadStructureSchema.parse({
      locale: "pt-PT",
      consent: true,
      loads: [
        {
          id: "home",
          label: "Manter a casa a funcionar",
          impactScale: 3,
          durationMonths: 12,
          ownership: "shared",
          movement: "negotiate",
          custom: false,
        },
      ],
      nextSessionNote: "Isto nunca deve atravessar o contrato.",
      support: "Levar à sessão",
      hiddenFrom: "partner",
      effects: ["No sono"],
    });

    expect(result).not.toHaveProperty("nextSessionNote");
    expect(result).not.toHaveProperty("support");
    expect(result).not.toHaveProperty("hiddenFrom");
    expect(result).not.toHaveProperty("effects");
  });
});
