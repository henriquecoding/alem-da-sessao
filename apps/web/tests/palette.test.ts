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
    ["foreground/background", "#282431", "#F7F5F8"],
    ["muted foreground/surface", "#6B6373", "#FFFCFA"],
    ["primary foreground/primary", "#FFFFFF", "#6848C6"],
    ["accent foreground/accent soft", "#7A3022", "#F9DAD2"],
    ["sidebar foreground/sidebar", "#FBF8FD", "#231E2D"],
    ["sidebar/highlight", "#231E2D", "#F2CF63"],
  ])("%s meets WCAG AA for normal text", (_, first, second) => {
    expect(contrast(first, second)).toBeGreaterThanOrEqual(4.5);
  });
});
