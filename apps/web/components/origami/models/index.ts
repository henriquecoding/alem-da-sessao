import type {
  OrigamiModelDefinition,
  OrigamiModelId,
  OrigamiResultId,
} from "../types";
import { boatModel } from "./boat";
import { boxModel } from "./box";
import { craneModel } from "./crane";
import { halfFoldModel } from "./half-fold";
import { sheetModel } from "./sheet";
import { suspendedSheetModel } from "./suspended-sheet";

/**
 * A família de resultados é curta de propósito.
 *
 * Um animal por emoção seria simbolismo barato e obrigaria a inventar formas
 * até a qualidade cair. Estes quatro objetos representam decisões — levar,
 * guardar, atravessar, suspender — e é a decisão que o objeto nomeia, nunca o
 * estado interno de quem escolheu.
 */
export const origamiModels = {
  sheet: sheetModel,
  "half-fold": halfFoldModel,
  boat: boatModel,
  box: boxModel,
  crane: craneModel,
  "suspended-sheet": suspendedSheetModel,
} as const satisfies Record<OrigamiModelId, OrigamiModelDefinition>;

export const origamiModelList: readonly OrigamiModelDefinition[] = [
  sheetModel,
  halfFoldModel,
  boatModel,
  boxModel,
  craneModel,
  suspendedSheetModel,
];

/** Só estes passam pelo teste de reconhecimento; os outros dois são estados. */
export const origamiResultIds: readonly OrigamiResultId[] = [
  "boat",
  "box",
  "crane",
  "suspended-sheet",
];

export {
  boatModel,
  boxModel,
  craneModel,
  halfFoldModel,
  sheetModel,
  suspendedSheetModel,
};
