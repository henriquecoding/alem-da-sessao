import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function luminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/../g)!
    .map((value) => Number.parseInt(value, 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );

  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

function contrast(first: string, second: string) {
  const firstLuminance = luminance(first);
  const secondLuminance = luminance(second);
  return (
    (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05)
  );
}

describe("Luz de Intervalo palette", () => {
  it.each([
    ["foreground/background", "#1C1F22", "#F8F6F2"],
    ["muted foreground/surface", "#5E656E", "#FDFDFC"],
    ["primary foreground/primary", "#FBFAF8", "#3C6252"],
    ["accent foreground/accent soft", "#7A3A24", "#F2E2D9"],
    ["sidebar foreground/sidebar", "#F1EFE9", "#1F2422"],
    ["sidebar/highlight", "#1F2422", "#E0BB6B"],
  ])("%s meets WCAG AA for normal text", (_, first, second) => {
    expect(contrast(first, second)).toBeGreaterThanOrEqual(4.5);
  });
});

/**
 * A semântica de sensibilidade do relatório v2 §6.3.
 *
 * Estes pares são os que carregam o modelo de privacidade na interface: se um
 * deles cair abaixo de AA, alguém deixa de conseguir ler num relance o que o
 * profissional dele vê.
 */
describe("semântica de sensibilidade (§6.3)", () => {
  it.each([
    ["private/surface", "#556D63", "#FFFCFA"],
    ["private/private surface", "#556D63", "#F3F1ED"],
    ["shared foreground/shared surface", "#6E451C", "#F5EFE5"],
    ["retained/retained surface", "#5E656E", "#ECEEF1"],
    ["withheld/withheld surface", "#576B63", "#E9EEEB"],
    ["error/error surface", "#B83028", "#F6E2DF"],
    ["empty foreground/empty", "#6B6373", "#EBE9E5"],
  ])("%s meets WCAG AA for normal text", (_, first, second) => {
    expect(contrast(first, second)).toBeGreaterThanOrEqual(4.5);
  });

  /**
   * Cor nunca é o único portador de significado (WCAG 1.4.1), mas os dois
   * estados também não podem ser confundíveis por quem distingue cor: privado
   * e partilhado têm de estar visivelmente afastados um do outro.
   */
  it("private and shared are far apart, not two shades of the same idea", () => {
    expect(contrast("#556D63", "#D9943A")).toBeGreaterThanOrEqual(2);
  });
});

/** A segunda paleta do modo escuro, que não é uma inversão da primeira. */
describe("paleta escura (§6.3)", () => {
  it.each([
    ["foreground/background", "#ECE9E3", "#17191A"],
    ["muted foreground/surface", "#A3A49F", "#1E2120"],
    ["primary/background", "#7FB39C", "#17191A"],
    ["private/private surface", "#9DBDAE", "#23282A"],
    ["shared foreground/shared surface", "#F0C48A", "#33281C"],
  ])("%s meets WCAG AA for normal text", (_, first, second) => {
    expect(contrast(first, second)).toBeGreaterThanOrEqual(4.5);
  });
});

/**
 * A engine de tema (§6.3) — regras estruturais, não de gosto.
 *
 * Estes testes existem por causa de um defeito real: a paleta escura vivia
 * num `@media` separado, e um token acrescentado só ao bloco claro produzia
 * uma caixa clara com texto claro por cima no tema escuro. Nada no build o
 * apanhava, porque não havia nada que obrigasse os dois blocos a andar a par.
 *
 * `light-dark()` transforma esse erro em algo impossível de escrever: a função
 * exige os dois argumentos na mesma declaração. Estes testes garantem que a
 * regra não é contornada por distração — quer voltando a abrir um bloco de
 * tema paralelo, quer declarando um token de cor num tema só.
 */
describe("engine de tema", () => {
  const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

  const rootBlock = (() => {
    const start = css.indexOf(":root {");
    return css.slice(start, css.indexOf("\n}", start));
  })();

  /**
   * Tokens deliberadamente iguais nos dois temas. Cada um tem uma razão de
   * desenho: a barra lateral e a superfície editorial são escuras sempre, e o
   * texto que assenta nelas não pode seguir o tema — seguiria para o lado
   * errado. Estar nesta lista é uma decisão; estar fora dela por esquecimento
   * é o que o teste apanha.
   */
  const invariant = new Set([
    // `--shared` é âmbar nos dois temas — é o acento reservado da partilha e
    // não segue a polaridade da página. O texto que assenta nele também não.
    "on-shared",
    "on-shared-muted",
    "on-shared-line",
    "highlight-yellow",
    "scrim",
    "sidebar-muted",
    "sidebar-raised",
    "sidebar-raised-strong",
    "sidebar-border",
    "ink",
    "ink-raised",
    "ink-line",
    "ink-foreground",
    "ink-muted",
    "ember",
    "ember-strong",
    "shadow-primary",
    "shadow-primary-strong",
    "shadow-ember",
  ]);

  it("declares every themed colour token with both values at once", () => {
    const singleTheme: string[] = [];

    for (const match of rootBlock.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
      const name = match[1]!;
      const value = match[2]!;
      if (value.includes("light-dark(")) continue;
      if (invariant.has(name)) continue;
      // Sombras compõem-se de tokens de cor que já são `light-dark()`, e o
      // raio não é cor nenhuma.
      if (value.includes("var(--shadow-")) continue;
      if (!/#[0-9a-f]{3,8}|rgba?\(/i.test(value)) continue;
      singleTheme.push(`--${name}: ${value.trim()}`);
    }

    expect(singleTheme).toEqual([]);
  });

  it("switches themes through color-scheme alone", () => {
    expect(css).toMatch(/:root\s*\{\s*color-scheme:\s*light dark;/);
    expect(css).toMatch(
      /:root\[data-theme="light"\]\s*\{\s*color-scheme:\s*light;/,
    );
    expect(css).toMatch(
      /:root\[data-theme="dark"\]\s*\{\s*color-scheme:\s*dark;/,
    );
  });

  it("keeps no parallel palette that could drift out of sync", () => {
    const parallel = css
      .split("\n")
      .filter((line) => line.includes("prefers-color-scheme"));

    // Um `@media` de tema pode existir para geometria, nunca para cor: é a
    // duplicação da paleta que produz a divergência.
    for (const line of parallel) {
      const start = css.indexOf(line);
      const body = css.slice(start, css.indexOf("\n}", start));
      expect(body).not.toMatch(/--[\w-]+:\s*(#|rgba?\()/i);
    }
  });
});
