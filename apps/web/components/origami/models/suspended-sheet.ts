import { defineOrigamiModel } from "../types";

/**
 * Folha parcialmente dobrada — «deixar em suspenso».
 *
 * O canto dobrado não foi desenhado a olho: `foldedCorner` é o reflexo exato do
 * canto superior direito sobre a linha `foldStart` → `foldEnd`. É por isso que
 * a aba tem o tamanho certo — uma aba desenhada à mão parece sempre uma segunda
 * folha pousada por cima, e é essa a diferença entre papel dobrado e colagem.
 *
 * A primeira versão dobrava um canto pequeno e lia-se como um retângulo com uma
 * esquina cortada. Esta dobra quase metade da folha: a aba atravessa da aresta
 * de cima até à da direita e o avesso do papel ocupa área suficiente para ser
 * uma superfície, não um detalhe.
 *
 * A aba não é uma camada sobreposta no modelo de dados: é uma face vizinha que
 * ocupa exatamente o canto que a folha deixou de ocupar. A sobreposição real
 * fica só nos dois vincos de tipo `edge`, que é onde ela existe fisicamente.
 *
 * Este é o único modelo cuja silhueta é quase a folha original — e é
 * deliberado. «Deixar em suspenso» não devia produzir um objeto acabado.
 */
export const suspendedSheetModel = defineOrigamiModel({
  id: "suspended-sheet",
  viewBox: [0, 0, 240, 200],
  vertices: {
    sheetTopLeft: [40, 50],
    foldStart: [112, 46],
    foldedCorner: [106, 140],
    foldEnd: [204, 138],
    sheetBottomRight: [196, 160],
    sheetBottomLeft: [32, 152],
  },
  silhouette: [
    "sheetTopLeft",
    "foldStart",
    "foldEnd",
    "sheetBottomRight",
    "sheetBottomLeft",
  ],
  faces: [
    {
      id: "sheet-lower",
      tone: "base",
      vertices: [
        "foldStart",
        "foldedCorner",
        "foldEnd",
        "sheetBottomRight",
        "sheetBottomLeft",
      ],
    },
    {
      id: "sheet-upper",
      tone: "lit",
      vertices: ["sheetTopLeft", "foldStart", "sheetBottomLeft"],
    },
    {
      id: "flap",
      tone: "inner",
      vertices: ["foldStart", "foldEnd", "foldedCorner"],
    },
  ],
  creases: [
    {
      id: "soft-bend",
      kind: "valley",
      vertices: ["foldStart", "sheetBottomLeft"],
    },
    {
      id: "flap-edge",
      kind: "edge",
      vertices: ["foldStart", "foldedCorner", "foldEnd"],
    },
  ],
  shadowPath: "M42 168a76 10 0 1 0 152 0a76 10 0 1 0-152 0",
  accessibleLabel: {
    "pt-PT": "Uma folha de papel com um canto grande dobrado para dentro.",
    "pt-BR": "Uma folha de papel com um canto grande dobrado para dentro.",
  },
});
