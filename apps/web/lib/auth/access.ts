import "server-only";

import type { OrganizationRole, PlatformRole } from "@alem-da-sessao/authz";
import { organizationRoles, platformRoles } from "@alem-da-sessao/authz";
import { redirect } from "next/navigation";
import type { LocaleSegment } from "@alem-da-sessao/i18n";
import { createClinicalSupabaseClient } from "@/lib/supabase/server";
import { isFixtureMode } from "@/lib/runtime";

export type SurfaceAccess =
  | { mode: "fixture"; userId: null; role: "demo" }
  | {
      mode: "authenticated";
      userId: string;
      role: OrganizationRole | PlatformRole | "client";
    };

function isOrganizationRole(value: unknown): value is OrganizationRole {
  return organizationRoles.includes(value as OrganizationRole);
}

function isPlatformRole(value: unknown): value is PlatformRole {
  return platformRoles.includes(value as PlatformRole);
}

function accessExit(segment: LocaleSegment, reason: string): never {
  redirect(`/${segment}/demo?access=${encodeURIComponent(reason)}`);
}

/**
 * O layout é a fronteira de autorização das três superfícies privadas.
 * Fixture continua acessível sem conta; Supabase nunca. O controlo é repetido
 * pela RLS, portanto conhecer um URL não concede acesso.
 */
export async function requireSurfaceAccess(
  surface: "professional" | "client" | "admin",
  segment: LocaleSegment,
): Promise<SurfaceAccess> {
  if (isFixtureMode()) {
    return { mode: "fixture", userId: null, role: "demo" };
  }

  const supabase = await createClinicalSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) accessExit(segment, "authentication-required");

  if (surface === "admin") {
    const role = user.app_metadata.platform_role;
    if (!isPlatformRole(role)) accessExit(segment, "admin-role-required");

    const { data: assurance } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assurance?.currentLevel !== "aal2") {
      accessExit(segment, "mfa-required");
    }

    return { mode: "authenticated", userId: user.id, role };
  }

  if (surface === "client") {
    const { data: record } = await supabase
      .schema("care")
      .from("client_records")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (!record) accessExit(segment, "client-access-required");
    return { mode: "authenticated", userId: user.id, role: "client" };
  }

  const { data: membership } = await supabase
    .schema("identity")
    .from("organization_memberships")
    .select("role")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  const role = membership?.role;
  if (!isOrganizationRole(role)) {
    accessExit(segment, "professional-membership-required");
  }

  const { data: assurance } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assurance?.currentLevel !== "aal2") {
    accessExit(segment, "mfa-required");
  }

  return { mode: "authenticated", userId: user.id, role };
}
