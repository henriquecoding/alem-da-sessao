import type {
  AuthoredModel,
  FoldSourceMetadata,
  OrigamiModelId,
} from "@alem-da-sessao/origami-core";
import { boxModel } from "./box";
import { halfFoldModel } from "./half-fold";
import { sheetModel } from "./sheet";
import { suspendedSheetModel } from "./suspended-sheet";

/**
 * O registo de modelos autorados.
 *
 * Um modelo entra aqui quando **passa todos os gates**, e não quando alguém
 * começou a desenhá-lo. É essa a razão de esta lista ser mais curta do que a
 * família que a experiência da homepage usa hoje: `boat` e `crane` ainda não
 * têm um padrão de vincos que feche, e um registo que os incluísse a fingir
 * seria a mesma promessa vazia que este sistema existe para acabar.
 *
 * O que falta a cada um está em `docs/ORIGAMI_RUNTIME.md`, com o motivo.
 */

export type OrigamiModelEntry = {
  readonly id: OrigamiModelId;
  readonly model: AuthoredModel;
  readonly metadata: FoldSourceMetadata;
};

function metadata(
  id: OrigamiModelId,
  title: string,
  description: string,
  front: FoldSourceMetadata["ads:paper"]["frontFamily"],
  back: FoldSourceMetadata["ads:paper"]["backFamily"],
  presentation: FoldSourceMetadata["ads:presentation"],
): FoldSourceMetadata {
  return {
    file_spec: 1.2,
    file_creator: "tools/origami/compile.ts",
    file_author: "Além da Sessão",
    file_title: title,
    file_description: description,
    file_classes: ["singleModel", "animation"],
    "ads:modelId": id,
    "ads:paper": {
      aspect: 1,
      uncut: true,
      frontFamily: front,
      backFamily: back,
    },
    "ads:license": {
      id: "PROJETO",
      attribution:
        "Padrão de vincos autorado para o Além da Sessão. Estrutura do solver inspirada em amandaghassaei/OrigamiSimulator (MIT); ver NOTICE.md.",
    },
    "ads:presentation": presentation,
  };
}

export const origamiModelEntries: readonly OrigamiModelEntry[] = [
  {
    id: "sheet",
    model: sheetModel,
    metadata: metadata(
      "sheet",
      "Folha",
      "A matéria antes de qualquer decisão: quadrado íntegro com duas ondulações de sete graus.",
      "apricot",
      "mist",
      { rotateX: -90 },
    ),
  },
  {
    id: "half-fold",
    model: halfFoldModel,
    metadata: metadata(
      "half-fold",
      "Primeira dobra",
      "Um vinco só, a 62°. O estado entre a folha e o objeto.",
      "apricot",
      "mist",
      { rotateX: -90 },
    ),
  },
  {
    id: "box",
    model: boxModel,
    metadata: metadata(
      "box",
      "Caixa",
      "Caixa de canto com gusset: base quadrada, quatro paredes e quatro abas deitadas.",
      "jade",
      "mist",
      { rotateX: -90 },
    ),
  },
  {
    id: "suspended-sheet",
    model: suspendedSheetModel,
    metadata: metadata(
      "suspended-sheet",
      "Folha suspensa",
      "Quatro vincos paralelos no mesmo sentido: papel enrolado, sem decisão tomada.",
      "lilac",
      "mist",
      { rotateX: -90 },
    ),
  },
];

export const origamiModelIds = origamiModelEntries.map((entry) => entry.id);

export function findModelEntry(id: string): OrigamiModelEntry {
  const entry = origamiModelEntries.find((candidate) => candidate.id === id);
  if (!entry) {
    throw new Error(
      `origami: não há modelo autorado com id "${id}". Conhecidos: ${origamiModelIds.join(", ")}.`,
    );
  }
  return entry;
}
