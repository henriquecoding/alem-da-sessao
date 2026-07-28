import { defineOrigamiModel } from "../types";

/**
 * Caixa masu — «guardar consigo».
 *
 * É o modelo mais frágil da família em silhueta pura, e a primeira versão
 * provou-o: um hexágono afunilado que tanto podia ser uma caixa como um cubo,
 * uma pedra ou nada.
 *
 * O que a desambigua é o rebordo saliente. As paredes recuam sob a aba do
 * rebordo (`wallLeft`, `wallRight`), e esse degrau na silhueta é a assinatura
 * de um recipiente aberto — nenhum sólido fechado tem uma aba que avança para
 * fora do corpo. O interior a dois tons (`interior-far`, `interior-near`)
 * confirma a leitura: uma caixa fechada não tem duas superfícies visíveis lá
 * dentro.
 *
 * Continua a ser o modelo com maior risco de leitura ambígua da família, e é
 * assim que está registado no relatório. Aos 96 px aguenta porque o rebordo e
 * o interior ocupam quase metade da altura do objeto.
 */
export const boxModel = defineOrigamiModel({
  id: "box",
  viewBox: [0, 0, 240, 200],
  vertices: {
    rimBack: [120, 46],
    tabLeft: [60, 48],
    tabRight: [180, 48],
    rimLeft: [16, 82],
    rimFront: [120, 118],
    rimRight: [224, 82],
    innerBack: [120, 60],
    innerLeft: [38, 84],
    innerFront: [120, 106],
    innerRight: [202, 84],
    wallLeft: [46, 96],
    wallRight: [194, 96],
    baseLeft: [56, 152],
    baseFront: [120, 174],
    baseRight: [184, 152],
  },
  silhouette: [
    "rimBack",
    "tabRight",
    "rimRight",
    "wallRight",
    "baseRight",
    "baseFront",
    "baseLeft",
    "wallLeft",
    "rimLeft",
    "tabLeft",
  ],
  faces: [
    /* As paredes partem-se na diagonal do canto, e não é decoração: numa masu
       o papel envolve o canto e essa dobra fica visível da base até ao rebordo.
       Sem ela, as paredes são dois quadriláteros lisos e o objeto lê-se como um
       sólido — «só uma caixa» — em vez de papel dobrado à volta de um vazio. */
    {
      id: "wall-left-front",
      tone: "shade",
      vertices: ["rimFront", "baseFront", "baseLeft"],
    },
    {
      id: "wall-left-side",
      tone: "base",
      vertices: ["wallLeft", "rimFront", "baseLeft"],
    },
    {
      id: "wall-right-front",
      tone: "inner",
      vertices: ["rimFront", "baseRight", "baseFront"],
    },
    {
      id: "wall-right-side",
      tone: "shade",
      vertices: ["rimFront", "wallRight", "baseRight"],
    },
    {
      id: "lip-under-left",
      tone: "shade",
      vertices: ["rimLeft", "rimFront", "wallLeft"],
    },
    {
      id: "lip-under-right",
      tone: "inner",
      vertices: ["rimFront", "rimRight", "wallRight"],
    },
    {
      id: "interior-far",
      tone: "inner",
      vertices: ["innerBack", "innerLeft", "innerRight"],
    },
    {
      id: "interior-near",
      tone: "shade",
      vertices: ["innerLeft", "innerFront", "innerRight"],
    },
    {
      id: "rim-back-left",
      tone: "lit",
      vertices: ["rimBack", "tabLeft", "rimLeft", "innerLeft", "innerBack"],
    },
    {
      id: "rim-back-right",
      tone: "lit",
      vertices: ["rimBack", "innerBack", "innerRight", "rimRight", "tabRight"],
    },
    {
      id: "rim-front-left",
      tone: "lit",
      vertices: ["rimLeft", "rimFront", "innerFront", "innerLeft"],
    },
    {
      id: "rim-front-right",
      tone: "lit",
      vertices: ["rimFront", "rimRight", "innerRight", "innerFront"],
    },
  ],
  creases: [
    {
      id: "rim-seam-left",
      kind: "mountain",
      vertices: ["rimLeft", "innerLeft"],
    },
    {
      id: "rim-seam-right",
      kind: "mountain",
      vertices: ["rimRight", "innerRight"],
    },
    { id: "rim-seam-back", kind: "valley", vertices: ["rimBack", "innerBack"] },
    {
      id: "rim-seam-front",
      kind: "mountain",
      vertices: ["rimFront", "innerFront"],
    },
    { id: "corner", kind: "mountain", vertices: ["rimFront", "baseFront"] },
    {
      id: "wrap-left",
      kind: "valley",
      vertices: ["rimFront", "baseLeft"],
    },
    {
      id: "wrap-right",
      kind: "valley",
      vertices: ["rimFront", "baseRight"],
    },
    {
      id: "opening",
      kind: "edge",
      vertices: [
        "innerBack",
        "innerLeft",
        "innerFront",
        "innerRight",
        "innerBack",
      ],
    },
  ],
  shadowPath: "M46 180a74 10 0 1 0 148 0a74 10 0 1 0-148 0",
  accessibleLabel: {
    "pt-PT": "Uma caixa de papel aberta, vista de cima.",
    "pt-BR": "Uma caixa de papel aberta, vista de cima.",
  },
});
