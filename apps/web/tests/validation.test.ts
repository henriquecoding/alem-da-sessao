import { describe, expect, it } from "vitest";
import { loadStructuresSchema } from "@alem-da-sessao/validation";

const valid = {
  loads: [
    {
      id: "care-family",
      label: "Cuidar de alguém",
      intensity: 3,
      ownership: "shared",
      movement: "ask",
      includeInShare: true,
    },
  ],
  effects: ["No tempo", "No sono"],
  support: "Dividir uma tarefa",
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
});
