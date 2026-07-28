import { defineOrigamiModel } from "../types";

/**
 * A folha. O estado 0 da homepage.
 *
 * Não faz parte da família de resultados — é a matéria de que os resultados
 * são feitos, e existe porque a narrativa começa antes da primeira dobra. Sem
 * ela o primeiro ecrã teria de mostrar já um objeto, e a promessa («ganha
 * forma») ficava por cumprir logo no início.
 *
 * A primeira versão era um retângulo com um vinco ao meio, e a crítica foi
 * exata: não era nada. Um retângulo plano num ecrã é indistinguível de um
 * bloco de cor, por mais tons que tenha.
 *
 * Esta tem uma ondulação real. As arestas de cima e de baixo não são retas —
 * sobem e descem alguns pixels — e a folha divide-se em três planos ao longo de
 * dois vincos suaves. É a irregularidade das arestas que diz «papel»: uma folha
 * pousada nunca fica com o bordo a direito.
 */
export const sheetModel = defineOrigamiModel({
  id: "sheet",
  viewBox: [0, 0, 240, 200],
  vertices: {
    topLeft: [40, 54],
    topFirst: [106, 44],
    topSecond: [166, 52],
    topRight: [204, 40],
    bottomRight: [198, 152],
    bottomSecond: [162, 160],
    bottomFirst: [102, 150],
    bottomLeft: [34, 158],
  },
  silhouette: [
    "topLeft",
    "topFirst",
    "topSecond",
    "topRight",
    "bottomRight",
    "bottomSecond",
    "bottomFirst",
    "bottomLeft",
  ],
  faces: [
    {
      id: "wave-left",
      tone: "lit",
      vertices: ["topLeft", "topFirst", "bottomFirst", "bottomLeft"],
    },
    {
      id: "wave-mid",
      tone: "base",
      vertices: ["topFirst", "topSecond", "bottomSecond", "bottomFirst"],
    },
    {
      id: "wave-right",
      tone: "shade",
      vertices: ["topSecond", "topRight", "bottomRight", "bottomSecond"],
    },
  ],
  creases: [
    { id: "wave-one", kind: "valley", vertices: ["topFirst", "bottomFirst"] },
    {
      id: "wave-two",
      kind: "mountain",
      vertices: ["topSecond", "bottomSecond"],
    },
  ],
  shadowPath: "M46 168a74 9 0 1 0 148 0a74 9 0 1 0-148 0",
  accessibleLabel: {
    "pt-PT": "Uma folha de papel pousada, ainda por dobrar.",
    "pt-BR": "Uma folha de papel apoiada, ainda sem dobras.",
  },
});
