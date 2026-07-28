import { origamiModelList } from "./models";
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
 * Cobre as duas famílias de defeito que a versão anterior tinha e que nenhum
 * lint apanhava:
 *
 * **1. Topologia.** Um origami é uma folha. Se duas faces vizinhas não citarem
 * o mesmo vértice, existe uma fenda — e uma fenda é a diferença entre papel
 * dobrado e polígonos encostados. O invariante: cada aresta pertence a duas
 * faces (é um vinco) ou a uma só, e nesse caso tem de ser aresta da silhueta.
 * A soma das áreas das faces tem de igualar a área da silhueta; isso apanha
 * sobreposições que a contagem de arestas deixaria passar.
 *
 * **2. Contraste real, contra a cor adjacente real.** Não a média de um
 * gradiente, não o par que alguém se lembrou de escrever à mão: cada família
 * de papel contra cada palco, nos dois temas.
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

function area(points: readonly (readonly [number, number])[]): number {
  let sum = 0;
  for (let index = 0; index < points.length; index += 1) {
    const [x1, y1] = points[index];
    const [x2, y2] = points[(index + 1) % points.length];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
}

function edgeKey(a: string, b: string): string {
  return [a, b].sort().join("|");
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

export type TopologyRow = {
  model: string;
  faces: number;
  silhouetteArea: number;
  faceArea: number;
  problems: string[];
};

export function topologyReport(): TopologyRow[] {
  return origamiModelList.map((model) => {
    const owners = new Map<string, string[]>();
    for (const face of model.faces) {
      for (let index = 0; index < face.vertices.length; index += 1) {
        const key = edgeKey(
          face.vertices[index],
          face.vertices[(index + 1) % face.vertices.length],
        );
        owners.set(key, [...(owners.get(key) ?? []), face.id]);
      }
    }

    const silhouetteEdges = new Set<string>();
    for (let index = 0; index < model.silhouette.length; index += 1) {
      silhouetteEdges.add(
        edgeKey(
          model.silhouette[index],
          model.silhouette[(index + 1) % model.silhouette.length],
        ),
      );
    }

    const problems: string[] = [];
    for (const [key, faces] of owners) {
      if (faces.length === 1 && !silhouetteEdges.has(key)) {
        problems.push(`fenda: aresta ${key} só existe em ${faces[0]}`);
      }
      if (faces.length === 2 && silhouetteEdges.has(key)) {
        problems.push(`aresta interior ${key} declarada também na silhueta`);
      }
      if (faces.length > 2) {
        problems.push(`sobreposição: ${key} em ${faces.length} faces`);
      }
    }
    for (const key of silhouetteEdges) {
      if (!owners.has(key)) {
        problems.push(`aresta da silhueta ${key} sem face que a desenhe`);
      }
    }

    const silhouetteArea = area(
      model.silhouette.map((key) => model.vertices[key]),
    );
    const faceArea = model.faces.reduce(
      (total, face) => total + area(face.points),
      0,
    );
    if (Math.abs(silhouetteArea - faceArea) > 0.5) {
      problems.push(
        `área das faces (${faceArea.toFixed(1)}) não iguala a silhueta (${silhouetteArea.toFixed(1)})`,
      );
    }

    return {
      model: model.id,
      faces: model.faces.length,
      silhouetteArea,
      faceArea,
      problems,
    };
  });
}
