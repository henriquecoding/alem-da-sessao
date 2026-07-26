import { describe, expect, it } from "vitest";
import {
  canAccessClinicalResource,
  roleCan,
} from "@alem-da-sessao/authz";

const secureContext = {
  sameOrganization: true,
  hasCareRelationship: true,
  hasExplicitDelegation: false,
  membershipActive: true,
  accountSuspended: false,
  assuranceLevel: 2 as const,
};

describe("authorization contracts", () => {
  it("prevents assistants from reading clinical notes", () => {
    expect(roleCan("assistant", "clinical_note.read")).toBe(false);
  });

  it("requires an active relationship for sensitive resources", () => {
    expect(
      canAccessClinicalResource("clinician", "clinical_note.read", {
        ...secureContext,
        hasCareRelationship: false,
      }),
    ).toBe(false);
  });

  it("requires AAL2 for sensitive resources", () => {
    expect(
      canAccessClinicalResource("clinician", "shared_snapshot.read", {
        ...secureContext,
        assuranceLevel: 1,
      }),
    ).toBe(false);
  });

  it("denies access across organizations", () => {
    expect(
      canAccessClinicalResource("organization_owner", "client.read", {
        ...secureContext,
        sameOrganization: false,
      }),
    ).toBe(false);
  });
});
