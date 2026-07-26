import type { PublicLoadStructureInput } from "@alem-da-sessao/validation";

const presetIds = new Set([
  "work-decisions",
  "deadlines",
  "care-family",
  "home",
  "relationship",
  "finances",
]);

const identifyingPatterns = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /https?:\/\/|www\./i,
  /(?:\+?\d[\s().-]*){9,}/,
  /@[a-z0-9_]{2,}/i,
];

export type ModerationDecision = {
  status: "approved" | "pending" | "rejected";
  reason: string | null;
};

export function moderatePublicLoadStructure(
  input: PublicLoadStructureInput,
): ModerationDecision {
  const labels = input.loads.map((load) => load.label);

  if (
    labels.some((label) => identifyingPatterns.some((rule) => rule.test(label)))
  ) {
    return {
      status: "rejected",
      reason: "possible-identifying-information",
    };
  }

  const containsFreeText = input.loads.some(
    (load) => load.custom || !presetIds.has(load.id),
  );

  if (containsFreeText) {
    return { status: "pending", reason: "free-text-review" };
  }

  return { status: "approved", reason: null };
}
