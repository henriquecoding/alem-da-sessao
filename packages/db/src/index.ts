export type AppointmentStatus =
  | "requested"
  | "held"
  | "confirmed"
  | "completed"
  | "cancelled_by_client"
  | "cancelled_by_professional"
  | "no_show";

export type Appointment = {
  id: string;
  clientId: string;
  clientName: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  modality: "presential" | "online";
};

export type ClientSummary = {
  id: string;
  initials: string;
  displayName: string;
  nextAppointment: string | null;
  relationshipSince: string;
  pendingItem: string | null;
  status: "active" | "paused";
};

export type ProfessionalToday = {
  professionalName: string;
  organizationName: string;
  nextAppointment: Appointment | null;
  appointments: Appointment[];
  clients: ClientSummary[];
  actionCounts: {
    newRequests: number;
    unsignedNotes: number;
    sharedExperiences: number;
    pendingPayments: number;
  };
};

const appointments: Appointment[] = [
  {
    id: "apt_fixture_01",
    clientId: "client_fixture_01",
    clientName: "Marta Oliveira",
    startsAt: "2026-07-27T08:30:00.000Z",
    endsAt: "2026-07-27T09:20:00.000Z",
    status: "confirmed",
    modality: "online",
  },
  {
    id: "apt_fixture_02",
    clientId: "client_fixture_02",
    clientName: "Rui Martins",
    startsAt: "2026-07-27T10:00:00.000Z",
    endsAt: "2026-07-27T10:50:00.000Z",
    status: "confirmed",
    modality: "presential",
  },
  {
    id: "apt_fixture_03",
    clientId: "client_fixture_03",
    clientName: "Beatriz Costa",
    startsAt: "2026-07-27T13:30:00.000Z",
    endsAt: "2026-07-27T14:20:00.000Z",
    status: "held",
    modality: "online",
  },
];

const clients: ClientSummary[] = [
  {
    id: "client_fixture_01",
    initials: "MO",
    displayName: "Marta Oliveira",
    nextAppointment: appointments[0]?.startsAt ?? null,
    relationshipSince: "2026-02-12",
    pendingItem: "Partilha por rever",
    status: "active",
  },
  {
    id: "client_fixture_02",
    initials: "RM",
    displayName: "Rui Martins",
    nextAppointment: appointments[1]?.startsAt ?? null,
    relationshipSince: "2025-11-08",
    pendingItem: "Nota por assinar",
    status: "active",
  },
  {
    id: "client_fixture_03",
    initials: "BC",
    displayName: "Beatriz Costa",
    nextAppointment: appointments[2]?.startsAt ?? null,
    relationshipSince: "2026-06-03",
    pendingItem: null,
    status: "active",
  },
  {
    id: "client_fixture_04",
    initials: "LS",
    displayName: "Leonor Silva",
    nextAppointment: null,
    relationshipSince: "2025-09-20",
    pendingItem: "Novo pedido de horário",
    status: "paused",
  },
];

export const fixtureProfessionalToday: ProfessionalToday = {
  professionalName: "Dra. Inês Almeida",
  organizationName: "Consultório Horizonte",
  nextAppointment: appointments[0] ?? null,
  appointments,
  clients,
  actionCounts: {
    newRequests: 2,
    unsignedNotes: 1,
    sharedExperiences: 3,
    pendingPayments: 2,
  },
};

export async function getProfessionalToday(): Promise<ProfessionalToday> {
  // The fixture adapter is intentionally server-safe and contains no real data.
  return structuredClone(fixtureProfessionalToday);
}

export async function getClientById(
  clientId: string,
): Promise<ClientSummary | null> {
  return structuredClone(
    clients.find((client) => client.id === clientId) ?? null,
  );
}
