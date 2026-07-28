import "server-only";

import {
  getClientById as getFixtureClientById,
  getProfessionalToday as getFixtureProfessionalToday,
  type Appointment,
  type ClientSummary,
  type ProfessionalToday,
} from "@alem-da-sessao/db";
import type { ProfessionalIntervalView } from "@alem-da-sessao/db/intervals";
import { getProfessionalIntervalView as getFixtureIntervalView } from "@alem-da-sessao/db/intervals";
import { dataMode } from "@/lib/runtime";
import { createClinicalSupabaseClient } from "@/lib/supabase/server";

type ClientRow = {
  id: string;
  display_name: string;
  status: "invited" | "active" | "paused" | "discharged";
  created_at: string;
};

type AppointmentRow = {
  id: string;
  client_record_id: string;
  starts_at: string;
  ends_at: string;
  status: Appointment["status"];
  modality: Appointment["modality"];
};

function initialsFor(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase() ?? "")
    .join("");
}

function failDataBoundary(
  context: string,
  error?: { message: string } | null,
): never {
  const detail =
    process.env.NODE_ENV === "development" && error?.message
      ? `: ${error.message}`
      : "";
  throw new Error(`Não foi possível carregar ${context}${detail}`);
}

async function authenticatedContext() {
  const supabase = await createClinicalSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) failDataBoundary("a sessão autenticada", authError);

  const [{ data: membership, error: membershipError }, profileResult] =
    await Promise.all([
      supabase
        .schema("identity")
        .from("organization_memberships")
        .select("organization_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle(),
      supabase
        .schema("identity")
        .from("person_profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle(),
    ]);

  if (membershipError || !membership?.organization_id) {
    failDataBoundary("a organização ativa", membershipError);
  }
  if (profileResult.error) {
    failDataBoundary("o perfil profissional", profileResult.error);
  }

  return {
    supabase,
    user,
    organizationId: membership.organization_id as string,
    professionalName:
      (profileResult.data?.display_name as string | undefined) ??
      user.email?.split("@")[0] ??
      "Profissional",
  };
}

/**
 * Única fronteira de leitura do dashboard profissional.
 *
 * Fixture existe apenas no modo local. Em Supabase, qualquer erro termina a
 * leitura: dados de demonstração nunca podem ser apresentados como dados
 * clínicos reais por uma queda silenciosa do backend.
 */
export async function getProfessionalDashboardData(): Promise<ProfessionalToday> {
  if (dataMode() === "fixture") return getFixtureProfessionalToday();

  const { supabase, user, organizationId, professionalName } =
    await authenticatedContext();

  const now = new Date().toISOString();
  const [
    organizationResult,
    clientsResult,
    appointmentsResult,
    relationshipsResult,
    requestsResult,
    notesResult,
    snapshotsResult,
  ] = await Promise.all([
    supabase
      .schema("identity")
      .from("organizations")
      .select("display_name")
      .eq("id", organizationId)
      .single(),
    supabase
      .schema("care")
      .from("client_records")
      .select("id, display_name, status, created_at")
      .eq("organization_id", organizationId)
      .in("status", ["active", "paused"])
      .order("display_name"),
    supabase
      .schema("care")
      .from("appointments")
      .select("id, client_record_id, starts_at, ends_at, status, modality")
      .eq("organization_id", organizationId)
      .eq("professional_user_id", user.id)
      .gte("starts_at", now)
      .in("status", ["requested", "held", "confirmed"])
      .order("starts_at")
      .limit(100),
    supabase
      .schema("care")
      .from("care_relationships")
      .select("client_record_id, starts_at")
      .eq("organization_id", organizationId)
      .eq("professional_user_id", user.id)
      .in("status", ["active", "paused"]),
    supabase
      .schema("care")
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("professional_user_id", user.id)
      .eq("status", "requested"),
    supabase
      .schema("care")
      .from("clinical_notes")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("author_user_id", user.id)
      .eq("status", "draft"),
    supabase
      .schema("tools")
      .from("snapshots")
      .select("id", { count: "exact", head: true })
      .eq("recipient_user_id", user.id)
      .is("reviewed_at", null)
      .is("revoked_at", null),
  ]);

  const results = [
    organizationResult,
    clientsResult,
    appointmentsResult,
    relationshipsResult,
    requestsResult,
    notesResult,
    snapshotsResult,
  ];
  const firstError = results.find((result) => result.error)?.error;
  if (firstError) failDataBoundary("o painel profissional", firstError);

  const clientRows = (clientsResult.data ?? []) as ClientRow[];
  const appointmentRows = (appointmentsResult.data ?? []) as AppointmentRow[];
  const names = new Map(
    clientRows.map((client) => [client.id, client.display_name]),
  );
  const relationshipStarts = new Map(
    (
      (relationshipsResult.data ?? []) as {
        client_record_id: string;
        starts_at: string;
      }[]
    ).map((relationship) => [
      relationship.client_record_id,
      relationship.starts_at,
    ]),
  );

  const appointments: Appointment[] = appointmentRows.map((appointment) => ({
    id: appointment.id,
    clientId: appointment.client_record_id,
    clientName: names.get(appointment.client_record_id) ?? "Cliente",
    startsAt: appointment.starts_at,
    endsAt: appointment.ends_at,
    status: appointment.status,
    modality: appointment.modality,
  }));

  const clients: ClientSummary[] = clientRows.map((client) => ({
    id: client.id,
    initials: initialsFor(client.display_name),
    displayName: client.display_name,
    nextAppointment:
      appointments.find((item) => item.clientId === client.id)?.startsAt ??
      null,
    relationshipSince: relationshipStarts.get(client.id) ?? client.created_at,
    pendingItem: null,
    status: client.status === "active" ? "active" : "paused",
  }));

  return {
    professionalName,
    organizationName:
      (organizationResult.data?.display_name as string | undefined) ??
      "Organização",
    nextAppointment: appointments[0] ?? null,
    appointments,
    clients,
    actionCounts: {
      newRequests: requestsResult.count ?? 0,
      unsignedNotes: notesResult.count ?? 0,
      sharedExperiences: snapshotsResult.count ?? 0,
      // Pagamentos de sessões continuam fora do plano clínico até existir um
      // conector financeiro escolhido e um fundamento jurídico definido.
      pendingPayments: 0,
    },
  };
}

export async function getProfessionalClient(
  clientId: string,
): Promise<ClientSummary | null> {
  if (dataMode() === "fixture") return getFixtureClientById(clientId);
  const data = await getProfessionalDashboardData();
  return data.clients.find((client) => client.id === clientId) ?? null;
}

export async function getProfessionalIntervalSummary(): Promise<ProfessionalIntervalView | null> {
  if (dataMode() === "fixture") return getFixtureIntervalView();

  const { supabase, user, organizationId } = await authenticatedContext();
  const { data: interval, error } = await supabase
    .schema("care")
    .from("intervals")
    .select("id, state, opens_at, closes_at")
    .eq("organization_id", organizationId)
    .in("state", ["open", "closing", "bridged"])
    .order("opens_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) failDataBoundary("o intervalo clínico", error);
  if (!interval) return null;

  const { data: snapshots, error: snapshotError } = await supabase
    .schema("tools")
    .from("snapshots")
    .select("source_run:source_run_id(interval_id)")
    .eq("recipient_user_id", user.id)
    .is("revoked_at", null);

  if (snapshotError)
    failDataBoundary("as partilhas do intervalo", snapshotError);

  const sharedSnapshotCount = (snapshots ?? []).filter((snapshot) => {
    const source = snapshot.source_run as
      { interval_id: string | null } | { interval_id: string | null }[] | null;
    return Array.isArray(source)
      ? source.some((run) => run.interval_id === interval.id)
      : source?.interval_id === interval.id;
  }).length;

  return {
    id: interval.id as string,
    state: interval.state as ProfessionalIntervalView["state"],
    opensAt: interval.opens_at as string,
    closesAt: (interval.closes_at as string | null) ?? null,
    sharedSnapshotCount,
  };
}
