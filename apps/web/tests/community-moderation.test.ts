import { describe, expect, it } from "vitest";
import type { PublicLoadStructureInput } from "@alem-da-sessao/validation";
import { moderatePublicLoadStructure } from "@/lib/community/moderation";

const preset: PublicLoadStructureInput = {
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
};

describe("anonymous load-structure moderation", () => {
  it("auto-approves a structure assembled only from reviewed presets", () => {
    expect(moderatePublicLoadStructure(preset)).toEqual({
      status: "approved",
      reason: null,
    });
  });

  it("holds free text for review", () => {
    expect(
      moderatePublicLoadStructure({
        ...preset,
        loads: [
          {
            ...preset.loads[0],
            id: "custom-1",
            label: "Organizar os cuidados diários de um familiar",
            custom: true,
          },
        ],
      }),
    ).toEqual({ status: "pending", reason: "free-text-review" });
  });

  it("blocks contact details before publication", () => {
    expect(
      moderatePublicLoadStructure({
        ...preset,
        loads: [
          {
            ...preset.loads[0],
            id: "custom-2",
            label: "Falar sobre isto em pessoa@example.com",
            custom: true,
          },
        ],
      }),
    ).toEqual({
      status: "rejected",
      reason: "possible-identifying-information",
    });
  });
});
