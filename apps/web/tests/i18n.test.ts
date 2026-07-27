import { describe, expect, it } from "vitest";
import { getMessages, localeFromSegment, locales } from "@alem-da-sessao/i18n";

describe("founder locales", () => {
  it("ships exactly the two complete launch locales", () => {
    expect(locales).toEqual(["pt-PT", "pt-BR"]);
  });

  it("keeps localized terminology distinct", () => {
    expect(getMessages("pt-PT").nav.team).toBe("Equipa");
    expect(getMessages("pt-BR").nav.team).toBe("Equipe");
  });

  it("maps stable URL segments to BCP 47 locales", () => {
    expect(localeFromSegment("pt-pt")).toBe("pt-PT");
    expect(localeFromSegment("pt-br")).toBe("pt-BR");
  });
});
