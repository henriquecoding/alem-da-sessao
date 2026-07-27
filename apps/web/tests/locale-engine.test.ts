import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  localePresentation,
  otherSegment,
  swapLocaleSegment,
} from "@/lib/locale";
import { themeBootstrapScript, themeCookie } from "@/lib/preferences";

/**
 * A troca de língua era duas linhas dentro de um componente. Estes testes
 * existem porque essas duas linhas estavam erradas de formas que ninguém
 * repara a olho: perdiam a query, não sabiam o que fazer com um caminho sem
 * segmento, e tratavam `/pt-ptx` como se fosse português de Portugal.
 */
describe("swapLocaleSegment", () => {
  it("swaps the segment and keeps the rest of the path", () => {
    expect(swapLocaleSegment("/pt-pt/diretorio/lisboa", "pt-br")).toBe(
      "/pt-br/diretorio/lisboa",
    );
  });

  it("keeps the query string, which is where the filters live", () => {
    expect(
      swapLocaleSegment("/pt-pt/diretorio", "pt-br", "?modalidade=online"),
    ).toBe("/pt-br/diretorio?modalidade=online");
  });

  it("accepts a query string with or without its question mark", () => {
    expect(swapLocaleSegment("/pt-pt/x", "pt-br", "a=1")).toBe("/pt-br/x?a=1");
  });

  it("keeps the fragment, which is where the anchor lives", () => {
    expect(swapLocaleSegment("/pt-pt/precos", "pt-br", "", "#planos")).toBe(
      "/pt-br/precos#planos",
    );
  });

  it("handles the locale root without leaving a trailing slash", () => {
    expect(swapLocaleSegment("/pt-pt", "pt-br")).toBe("/pt-br");
  });

  it("gives a locale to a path that arrived without one", () => {
    expect(swapLocaleSegment("/precos", "pt-pt")).toBe("/pt-pt/precos");
  });

  it("does not mistake a longer segment for a locale", () => {
    expect(swapLocaleSegment("/pt-ptx/algo", "pt-br")).toBe(
      "/pt-br/pt-ptx/algo",
    );
  });

  it("is its own inverse", () => {
    const path = "/pt-pt/cuidado/sessoes?ordem=recentes";
    const [pathname, search] = path.split("?");
    const swapped = swapLocaleSegment(pathname!, "pt-br", search);
    expect(swapLocaleSegment(swapped.split("?")[0]!, "pt-pt", search)).toBe(
      path,
    );
  });
});

describe("apresentação das variantes", () => {
  it("names the region, because the language is the same in both", () => {
    expect(localePresentation["pt-pt"].region).toBe("Portugal");
    expect(localePresentation["pt-br"].region).toBe("Brasil");
    expect(localePresentation["pt-pt"].name).toBe(
      localePresentation["pt-br"].name,
    );
  });

  /**
   * A frase de amostra é o que faz o seletor ser compreensível sem explicação.
   * Se as duas fossem iguais, o menu deixaria de dizer alguma coisa.
   */
  it("shows a sample sentence that actually differs between variants", () => {
    expect(localePresentation["pt-pt"].sample).not.toBe(
      localePresentation["pt-br"].sample,
    );
  });

  it("has exactly one other variant", () => {
    expect(otherSegment("pt-pt")).toBe("pt-br");
    expect(otherSegment("pt-br")).toBe("pt-pt");
  });
});

/**
 * O script que aplica o tema antes da primeira pintura é a única coisa entre
 * uma escolha guardada e o flash claro. É minúsculo de propósito, e estes
 * testes fixam o que ele não pode passar a fazer.
 */
describe("engine de tema — arranque antes da pintura", () => {
  it("reads the cookie and nothing else — no storage APIs (ADR-004)", () => {
    expect(themeBootstrapScript).toContain("document.cookie");
    expect(themeBootstrapScript).toContain(themeCookie);
    expect(themeBootstrapScript).not.toMatch(
      /localStorage|sessionStorage|indexedDB/,
    );
  });

  it("only ever writes light or dark — system is the absence of a value", () => {
    expect(themeBootstrapScript).toContain("(light|dark)");
  });
});

/**
 * A CSP que matou o site.
 *
 * `script-src 'self'` parecia a política correta e era, na prática, um site
 * morto em produção: o Next entrega o payload de hidratação em `<script>`
 * inline, o navegador recusava-os todos, e nada no build o dizia — em
 * desenvolvimento a diretiva já trazia `unsafe-inline`, portanto tudo parecia
 * bem em todos os sítios onde alguém olhava.
 *
 * Estes testes fixam as duas metades da correção. A segunda é a menos óbvia e
 * a mais fácil de desfazer com boas intenções: acrescentar um hash a uma
 * diretiva que tem `unsafe-inline` **desliga** o `unsafe-inline`, porque a
 * especificação manda o navegador ignorá-lo assim que existe um hash ou um
 * nonce. Quem acrescentar o hash a pensar que está a apertar a política volta
 * a partir o site inteiro.
 */
describe("Content-Security-Policy", () => {
  const config = readFileSync(join(process.cwd(), "next.config.ts"), "utf8");
  // A linha real da diretiva, não uma das que a prosa acima cita.
  const scriptSrc =
    config
      .split("\n")
      .find((line) => line.trimStart().startsWith("`script-src")) ?? "";

  it("lets the hydration payload run", () => {
    expect(scriptSrc).toContain("'unsafe-inline'");
  });

  it("does not combine a hash or nonce with unsafe-inline", () => {
    expect(scriptSrc).not.toMatch(/sha(?:256|384|512)-/);
    expect(scriptSrc).not.toContain("nonce-");
  });

  it("keeps the directives that actually block XSS escalation shut", () => {
    for (const directive of [
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ]) {
      expect(config).toContain(directive);
    }
  });

  it("allows unsafe-eval only in development", () => {
    expect(scriptSrc).toContain("isDevelopment");
    expect(scriptSrc.replace(/\$\{[^}]*\}/g, "")).not.toContain(
      "'unsafe-eval'",
    );
  });
});
