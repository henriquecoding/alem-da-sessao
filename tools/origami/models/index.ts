import type {
  AuthoredModel,
  FoldSourceMetadata,
  OrigamiModelId,
} from "@alem-da-sessao/origami-core";
import { boxModel } from "./box";
import { envelopeModel } from "./envelope";
import { gateModel } from "./gate";
import { halfFoldModel } from "./half-fold";
import { sheetModel } from "./sheet";
import { suspendedSheetModel } from "./suspended-sheet";

/**
 * O registo de modelos autorados.
 *
 * Um modelo entra aqui quando **passa todos os gates**, e não quando alguém
 * começou a desenhá-lo. É essa a razão de esta lista ser mais curta do que a
 * família que a experiência da homepage usa hoje: O barco e o grou tradicionais não
 * entraram: fazem-se por sequência, com dobras que reordenam camadas, e este
 * solver não tem modelo de camadas. Foram substituídos pelo envelope e pelo
 * portal, que dobram de uma vez e dizem a mesma coisa com mais precisão.
 *
 * O motivo completo está em `docs/ORIGAMI_RUNTIME.md` §5.
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
    id: "envelope",
    model: envelopeModel,
    metadata: metadata(
      "envelope",
      "Envelope",
      "Base blintz: os quatro cantos dobram para o quadrado inscrito. Uma folha fechada para ser entregue.",
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
    id: "gate",
    model: gateModel,
    metadata: metadata(
      "gate",
      "Portal",
      "Dobra em portão: dois painéis erguem-se e inclinam-se um para o outro, deixando uma passagem.",
      "mist",
      "jade",
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
