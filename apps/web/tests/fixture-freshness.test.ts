import { describe, expect, it } from "vitest";
import { getProfessionalToday } from "@alem-da-sessao/db";
import {
  bridgeWindowIsOpen,
  getCurrentInterval,
} from "@alem-da-sessao/db/intervals";

describe("fixtures locais", () => {
  it("mantém a próxima sessão no futuro", async () => {
    const data = await getProfessionalToday();
    expect(data.nextAppointment).not.toBeNull();
    expect(new Date(data.nextAppointment!.startsAt).getTime()).toBeGreaterThan(
      Date.now(),
    );
  });

  it("mantém pelo menos a ponte de saída disponível no protótipo", async () => {
    const interval = await getCurrentInterval();
    expect(bridgeWindowIsOpen("outgoing", interval, new Date())).toBe(true);
    expect(new Date(interval.closesAt!).getTime()).toBeGreaterThan(Date.now());
  });
});
