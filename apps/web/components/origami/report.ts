import {
  paperFamilyList,
  stageSurfaces,
  type PaperTones,
} from "./tokens/paper";

/**
 * O relatório que decide se a direção pode ser integrada.
 *
 * Vive aqui, ao lado dos modelos, e não em `scripts/`, porque tem dois
 * leitores: o `check:origami` que corre no CI e a própria página do
 * laboratório, que mostra as mesmas tabelas a quem está a decidir. Um
 * relatório que só existisse no terminal obrigaria a confiar em números que
 * ninguém vê ao lado das imagens que eles descrevem.
 *
 * Cobria duas famílias de defeito. A primeira — topologia — mudou de sítio:
 * era verificada sobre polígonos desenhados, e passou a ser verificada sobre a
 * folha, pelo validador em `@alem-da-sessao/origami-core`. Um desenho podia
 * ser topologicamente correto sem vir de folha nenhuma; um `source.fold` não.
 *
 * Fica a segunda, que continua a ser desta camada: **contraste real, contra a
 * cor adjacente real.** Não a média de um gradiente, não o par que alguém se
 * lembrou de escrever à mão: cada família de papel contra cada palco, nos dois
 * temas.
 *
 * Quem carrega o contraste muda com o tema. No claro é o contorno; no escuro é
 * o preenchimento. As duas vias são aceites, mas uma delas tem de passar —
 * `objeto vs palco` falha quando nenhuma passa.
 */

type Rgb = { r: number; g: number; b: number };

function parseHex(hex: string): Rgb {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  };
}

function channel(value: number): number {
  const srgb = value / 255;
  return srgb <= 0.04045 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

export function luminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrast(a: string, b: string): number {
  const first = luminance(a);
  const second = luminance(b);
  const light = Math.max(first, second);
  const dark = Math.min(first, second);
  return (light + 0.05) / (dark + 0.05);
}

export type ContrastRow = {
  stage: string;
  family: string;
  theme: "light" | "dark";
  edgeVsStage: number;
  edgeVsBase: number;
  litVsShade: number;
  baseVsStage: number;
  boundary: "contorno" | "preenchimento";
  passes: boolean;
};

const thresholds = {
  boundary: 3,
  edgeOnPaper: 3,
  toneRamp: 1.6,
  moat: 1.3,
} as const;

export function contrastReport(): ContrastRow[] {
  const rows: ContrastRow[] = [];

  for (const [stageId, stage] of Object.entries(stageSurfaces)) {
    for (const family of paperFamilyList) {
      for (const theme of ["light", "dark"] as const) {
        const tones: PaperTones = family[theme];
        const surface = stage[theme];
        const edgeVsStage = contrast(tones.edge, surface);
        const edgeVsBase = contrast(tones.edge, tones.base);
        const litVsShade = contrast(tones.lit, tones.shade);
        const baseVsStage = contrast(tones.base, surface);

        // A fronteira do objeto pode ser desenhada pelo contorno ou pelo
        // próprio preenchimento. Uma das duas tem de chegar a 3:1.
        const byOutline =
          edgeVsStage >= thresholds.boundary &&
          edgeVsBase >= thresholds.edgeOnPaper;
        const byFill = baseVsStage >= thresholds.boundary;

        rows.push({
          stage: stageId,
          family: family.id,
          theme,
          edgeVsStage,
          edgeVsBase,
          litVsShade,
          baseVsStage,
          boundary: byFill && !byOutline ? "preenchimento" : "contorno",
          passes:
            (byOutline || byFill) &&
            edgeVsBase >= thresholds.edgeOnPaper &&
            litVsShade >= thresholds.toneRamp &&
            baseVsStage >= thresholds.moat,
        });
      }
    }
  }

  return rows;
}
