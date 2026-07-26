export const organizationRoles = [
  "organization_owner",
  "clinician",
  "clinical_supervisor",
  "assistant",
  "billing_manager",
] as const;

export const platformRoles = [
  "platform_support",
  "platform_admin",
  "security_admin",
] as const;

export type OrganizationRole = (typeof organizationRoles)[number];
export type PlatformRole = (typeof platformRoles)[number];

export type Permission =
  | "organization.manage"
  | "team.manage"
  | "client.read"
  | "client.write"
  | "appointment.manage"
  | "clinical_note.read"
  | "clinical_note.write"
  | "experience.assign"
  | "shared_snapshot.read"
  | "billing.read"
  | "billing.manage";

const rolePermissions: Record<OrganizationRole, readonly Permission[]> = {
  organization_owner: [
    "organization.manage",
    "team.manage",
    "client.read",
    "client.write",
    "appointment.manage",
    "clinical_note.read",
    "clinical_note.write",
    "experience.assign",
    "shared_snapshot.read",
    "billing.read",
    "billing.manage",
  ],
  clinician: [
    "client.read",
    "client.write",
    "appointment.manage",
    "clinical_note.read",
    "clinical_note.write",
    "experience.assign",
    "shared_snapshot.read",
    "billing.read",
  ],
  clinical_supervisor: [
    "client.read",
    "clinical_note.read",
    "shared_snapshot.read",
  ],
  assistant: [
    "client.read",
    "client.write",
    "appointment.manage",
    "billing.read",
  ],
  billing_manager: ["billing.read", "billing.manage"],
};

export function roleCan(
  role: OrganizationRole,
  permission: Permission,
): boolean {
  return rolePermissions[role].includes(permission);
}

export type CareAccessContext = {
  sameOrganization: boolean;
  hasCareRelationship: boolean;
  hasExplicitDelegation: boolean;
  membershipActive: boolean;
  accountSuspended: boolean;
  assuranceLevel: 1 | 2;
};

export function canAccessClinicalResource(
  role: OrganizationRole,
  permission: Permission,
  context: CareAccessContext,
): boolean {
  if (
    !context.sameOrganization ||
    !context.membershipActive ||
    context.accountSuspended ||
    !roleCan(role, permission)
  ) {
    return false;
  }

  const clinicallySensitive =
    permission === "clinical_note.read" ||
    permission === "clinical_note.write" ||
    permission === "shared_snapshot.read";

  if (!clinicallySensitive) {
    return true;
  }

  if (context.assuranceLevel < 2) {
    return false;
  }

  return context.hasCareRelationship || context.hasExplicitDelegation;
}
