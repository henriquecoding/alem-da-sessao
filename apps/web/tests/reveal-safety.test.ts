import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

/**
 * A entrada por scroll é um enfeite; a legibilidade da página não é.
 *
 * Estes testes guardam a única regra que separa as duas: o estado escondido de
 * `.reveal` só pode existir dentro de `.js-reveal`, a classe que o observador
 * põe no `<html>` quando arranca. Sem essa condição, qualquer coisa que impeça
 * o bundle de correr — scripting desligado, hidratação falhada, uma CSP
 * `script-src 'self'` sem nonce a recusar os scripts inline do Next — deixa
 * todas as secções marcadas com `.reveal` a `opacity: 0` para sempre. Foi
 * exatamente isso que aconteceu: a página pública inteira abaixo do herói
 * ficou em branco num build de produção.
 */
describe("a revelação por scroll nunca esconde o que não sabe mostrar", () => {
  it("mantém o estado escondido de .reveal dentro de .js-reveal", async () => {
    const css = await readFile("app/globals.css", "utf8");

    // Um seletor `.reveal` que esconda sem estar dentro de `.js-reveal` é a
    // regressão que este teste existe para apanhar.
    const hidingRules = css.match(/^\s*(?:\.[\w-]+\s+)*\.reveal\s*\{[^}]*\}/gm);
    expect(hidingRules, "não há nenhuma regra `.reveal`").not.toBeNull();

    for (const rule of hidingRules ?? []) {
      if (!/opacity:\s*0/.test(rule)) continue;
      expect(rule, `esconde .reveal fora de .js-reveal:\n${rule}`).toMatch(
        /\.js-reveal\s+\.reveal/,
      );
    }
  });

  it("põe .js-reveal no documento antes de observar seja o que for", async () => {
    const source = await readFile("components/reveal-observer.tsx", "utf8");

    const addsClass = source.indexOf('classList.add("js-reveal")');
    const observes = source.indexOf("new IntersectionObserver");

    expect(addsClass).toBeGreaterThan(-1);
    expect(
      addsClass,
      "a classe tem de ser posta antes de o observador arrancar",
    ).toBeLessThan(observes);
  });

  it("desenha a figura do intervalo sem depender de JavaScript", async () => {
    const css = await readFile("app/globals.css", "utf8");

    // O traçado do herói é `animation ... both`, não uma transição à espera de
    // um observador: acima da dobra, nada pode depender de hidratação.
    expect(css).toMatch(/\.draw-x\s*\{\s*animation:[^;]*both/);
    expect(css).toMatch(/\.draw-y\s*\{\s*animation:[^;]*both/);
  });
});
