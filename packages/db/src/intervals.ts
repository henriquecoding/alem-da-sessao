/**
 * O intervalo como objeto de primeira classe — relatório v2 §4.2 e §4.3.
 *
 * Uma sessão semanal de 50 minutos ocupa 0,5% de uma semana; os outros 99,5%
 * não têm forma nem registo no modelo de dados de ninguém. Os EHRs modelam
 * *encontros* porque encontros faturam; os marketplaces vivem de comissão por
 * sessão. Este produto não fatura por encontro, portanto pode modelar a
 * realidade clínica em vez do modelo contabilístico.
 *
 * Do lado do cliente isto muda a arquitetura de informação de *lista de
 * tarefas* para *lugar no tempo*: "Está no intervalo entre 14 e 21 de julho."
 *
 * **O risco, e a regra que o desarma:** um intervalo sem conteúdo não pode
 * virar vazio acusatório. O estado `open` sem artefactos é normal e é
 * apresentado como normal (§4.2, e a microcópia `intervalEmpty` do §7.5).
 */

export type IntervalState =
  "open" | "closing" | "bridged" | "closed" | "orphaned";

export type BridgeDirection = "outgoing" | "incoming";

export type SessionBridge = {
  direction: BridgeDirection;
  /** Texto do cliente. Nunca sai daqui sem um snapshot deliberado (§4.8). */
  body: string;
  writtenAt: string;
  /**
   * Uma ponte partilhada deixou de ser só do cliente. Uma ponte não
   * partilhada é invisível para o profissional — nunca "existe e não
   * partilhou", que seria vigilância (§4.3).
   */
  shared: boolean;
};

export type CareInterval = {
  id: string;
  state: IntervalState;
  opensAt: string;
  closesAt: string | null;
  /** Quantos artefactos o cliente guardou. Só o cliente vê este número. */
  artifactCount: number;
  bridges: SessionBridge[];
};

/**
 * A projeção que o profissional recebe.
 *
 * Repare no que **não** está aqui: contagem de artefactos, existência de
 * pontes não partilhadas, última atividade, tempo gasto. É o invariante
 * §10.6.5 — para o profissional, um intervalo vazio e um intervalo cujos
 * artefactos não foram partilhados têm de ser indistinguíveis. É este tipo
 * que torna a ausência de vigilância impossível de contornar por distração.
 */
export type ProfessionalIntervalView = {
  id: string;
  state: IntervalState;
  opensAt: string;
  closesAt: string | null;
  /** Apenas o que atravessou a ponte por ato deliberado do cliente. */
  sharedSnapshotCount: number;
};

export function toProfessionalView(
  interval: CareInterval,
): ProfessionalIntervalView {
  return {
    id: interval.id,
    state: interval.state,
    opensAt: interval.opensAt,
    closesAt: interval.closesAt,
    sharedSnapshotCount: interval.bridges.filter((bridge) => bridge.shared)
      .length,
  };
}

/**
 * As janelas do §4.3. A ponte de saída abre logo após a sessão e fecha por
 * volta das 48 h; a de entrada abre nas 24 h que antecedem a seguinte.
 *
 * São janelas, não prazos: passar a janela não é falha, e nada no produto a
 * enquadra como tal (§7.4).
 */
export const bridgeWindows = {
  outgoingHours: 48,
  incomingHours: 24,
} as const;

export function bridgeWindowIsOpen(
  direction: BridgeDirection,
  interval: CareInterval,
  now: Date,
): boolean {
  const opens = new Date(interval.opensAt).getTime();
  const closes = interval.closesAt
    ? new Date(interval.closesAt).getTime()
    : null;
  const current = now.getTime();

  if (direction === "outgoing") {
    return current <= opens + bridgeWindows.outgoingHours * 3_600_000;
  }

  if (closes === null) return false;
  return current >= closes - bridgeWindows.incomingHours * 3_600_000;
}

function makeFixtureInterval(): CareInterval {
  const now = new Date();
  const daysUntilMonday = (8 - now.getUTCDay()) % 7 || 7;
  const nextMonday = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + daysUntilMonday,
    8,
    30,
  );
  // Mantém uma ponte disponível no protótipo local independentemente do dia
  // em que Henrique o abrir. O calendário de demonstração continua futuro,
  // mas o ritual nunca surge todo fechado por causa de uma data fossilizada.
  const opensAt = now.getTime() - 18 * 3_600_000;

  return {
    id: "interval_fixture_01",
    state: nextMonday - now.getTime() <= 24 * 3_600_000 ? "closing" : "open",
    opensAt: new Date(opensAt).toISOString(),
    closesAt: new Date(nextMonday).toISOString(),
    artifactCount: 2,
    bridges: [
      {
        direction: "outgoing",
        body: "Fiquei com a ideia de que estou a pedir autorização para descansar.",
        writtenAt: new Date(opensAt + 10 * 3_600_000).toISOString(),
        shared: true,
      },
    ],
  };
}

export async function getCurrentInterval(): Promise<CareInterval> {
  return structuredClone(makeFixtureInterval());
}

export async function getProfessionalIntervalView(): Promise<ProfessionalIntervalView> {
  return toProfessionalView(structuredClone(makeFixtureInterval()));
}
