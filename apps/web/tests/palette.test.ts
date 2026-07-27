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
