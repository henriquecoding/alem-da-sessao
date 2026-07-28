import { describe, expect, it } from "vitest";
import { formatCurrency, formatTime, timeZoneFor } from "@/lib/format";

describe("localização operacional", () => {
  it("separa moeda e fuso entre as duas localizações fundadoras", () => {
    expect(timeZoneFor("pt-PT")).toBe("Europe/Lisbon");
    expect(timeZoneFor("pt-BR")).toBe("America/Sao_Paulo");
    expect(formatCurrency(55, "pt-PT")).toContain("€");
    expect(formatCurrency(55, "pt-BR")).toContain("R$");
  });

  it("formata a mesma sessão no fuso local correto", () => {
    const instant = "2026-07-28T12:00:00.000Z";
    expect(formatTime(instant, "pt-PT")).not.toBe(formatTime(instant, "pt-BR"));
  });
});
