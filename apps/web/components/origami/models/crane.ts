import { defineOrigamiModel } from "../types";

/**
 * Grou — «atravessar para uma experiência».
 *
 * Sexta versão, e a primeira que é um grou. As cinco anteriores eram tsurus
 * estilizados — a figura de papel dobrado — e não se percebia o que eram. O
 * erro era de referência, não de desenho: eu andava a desenhar o origami em
 * vez de desenhar a ave.
 *
 * Um grou é uma ave de pernas altas. Nas fotografias da família Gruidae, o que
 * o distingue de qualquer outro pássaro está todo abaixo do corpo e acima do
 * pescoço:
 *
 * - **As pernas valem quase um terço da altura.** Um pássaro sem pernas
 *   compridas não é um grou; é um pássaro genérico. Nenhuma das cinco versões
 *   anteriores tinha pernas.
 * - **O pescoço é erguido e comprido**, não projetado para a frente como um
 *   dardo.
 * - **A cabeça é pequena e tem poupa.** No grou-coroado a coroa é um leque de
 *   espigões, e é o pormenor mais reconhecível de toda a ave em silhueta.
 * - **A cauda cai.** As penas terciárias formam um penacho que desce por trás
 *   do corpo — não é uma ponta afiada, é um pano.
 *
 * O corpo é o mais pequeno dos elementos, e é essa proporção invertida — corpo
 * pequeno, pernas e pescoço longos — que faz a leitura. Corpo grande com pernas
 * curtas dá um pato.
 *
 * Onze faces, e continua a ser papel: cada face é plana, partilha vértices com
 * as vizinhas e parte-se ao longo dos vincos que a formariam.
 *
 * O compromisso conhecido: as canelas têm cerca de 12 unidades de largura num
 * `viewBox` de 300, o que a 96 px dá menos de 4 px. O contorno é
 * `non-scaling-stroke`, por isso a perna não desaparece — mas este é o modelo
 * da família que mais perde nos tamanhos pequenos, e está registado como tal.
 */
export const craneModel = defineOrigamiModel({
  id: "crane",
  viewBox: [0, 0, 300, 300],
  vertices: {
    spikeA: [140, 2],
    crestNotch: [152, 24],
    spikeB: [174, 20],
    headTop: [122, 36],
    headBack: [136, 52],
    headChin: [118, 66],
    beakTip: [78, 62],
    neckMidBack: [132, 104],
    neckMidFront: [118, 108],
    neckBaseBack: [140, 148],
    neckBaseFront: [124, 152],
    bodyTopBack: [178, 160],
    bodyFront: [76, 174],
    bustleTop: [196, 176],
    bustleTip: [228, 214],
    bustleLower: [186, 202],
    bodyBottomBack: [160, 204],
    legBFront: [148, 203],
    legABack: [120, 201],
    bodyBottomFront: [108, 200],
    footBackB: [152, 270],
    footTipB: [126, 284],
    shankFrontB: [142, 266],
    footBackA: [106, 278],
    footTipA: [76, 292],
    shankFrontA: [96, 274],
  },
  silhouette: [
    "spikeA",
    "crestNotch",
    "spikeB",
    "headBack",
    "neckMidBack",
    "neckBaseBack",
    "bodyTopBack",
    "bustleTop",
    "bustleTip",
    "bustleLower",
    "bodyBottomBack",
    "footBackB",
    "footTipB",
    "shankFrontB",
    "legBFront",
    "legABack",
    "footBackA",
    "footTipA",
    "shankFrontA",
    "bodyBottomFront",
    "bodyFront",
    "neckBaseFront",
    "neckMidFront",
    "headChin",
    "beakTip",
    "headTop",
  ],
  faces: [
    {
      id: "bustle",
      tone: "inner",
      vertices: ["bustleTop", "bustleTip", "bustleLower", "bodyBottomBack"],
    },
    {
      id: "flank",
      tone: "shade",
      vertices: ["bodyTopBack", "bustleTop", "bodyBottomBack", "legBFront"],
    },
    {
      id: "leg-back",
      tone: "shade",
      vertices: [
        "legBFront",
        "bodyBottomBack",
        "footBackB",
        "footTipB",
        "shankFrontB",
      ],
    },
    {
      id: "leg-front",
      tone: "base",
      vertices: [
        "bodyBottomFront",
        "legABack",
        "footBackA",
        "footTipA",
        "shankFrontA",
      ],
    },
    {
      id: "wing-mid",
      tone: "shade",
      vertices: ["neckBaseBack", "bodyTopBack", "legBFront", "legABack"],
    },
    {
      id: "wing-front",
      tone: "base",
      vertices: [
        "neckBaseFront",
        "neckBaseBack",
        "legABack",
        "bodyBottomFront",
      ],
    },
    {
      id: "breast",
      tone: "lit",
      vertices: ["bodyFront", "neckBaseFront", "bodyBottomFront"],
    },
    {
      id: "neck-lower",
      tone: "base",
      vertices: [
        "neckMidBack",
        "neckBaseBack",
        "neckBaseFront",
        "neckMidFront",
      ],
    },
    {
      id: "neck-upper",
      tone: "lit",
      vertices: ["headBack", "neckMidBack", "neckMidFront", "headChin"],
    },
    {
      id: "head",
      tone: "base",
      vertices: ["headTop", "headBack", "headChin", "beakTip"],
    },
    {
      id: "crest",
      tone: "lit",
      vertices: ["headTop", "spikeA", "crestNotch", "spikeB", "headBack"],
    },
  ],
  creases: [
    { id: "head-root", kind: "valley", vertices: ["headTop", "headBack"] },
    { id: "neck-collar", kind: "valley", vertices: ["headChin", "headBack"] },
    {
      id: "neck-fold",
      kind: "mountain",
      vertices: ["neckMidFront", "neckMidBack"],
    },
    {
      id: "shoulder",
      kind: "valley",
      vertices: ["neckBaseFront", "neckBaseBack"],
    },
    {
      id: "wing-fold",
      kind: "mountain",
      vertices: ["neckBaseBack", "legABack"],
    },
    { id: "wing-back", kind: "valley", vertices: ["bodyTopBack", "legBFront"] },
    {
      id: "bustle-root",
      kind: "valley",
      vertices: ["bustleTop", "bodyBottomBack"],
    },
    {
      id: "leg-front-root",
      kind: "edge",
      vertices: ["bodyBottomFront", "legABack"],
    },
    {
      id: "leg-back-root",
      kind: "edge",
      vertices: ["legBFront", "bodyBottomBack"],
    },
  ],
  shadowPath: "M76 292a74 8 0 1 0 148 0a74 8 0 1 0-148 0",
  accessibleLabel: {
    "pt-PT":
      "Um grou de papel de pé, com pernas altas, pescoço erguido e poupa.",
    "pt-BR":
      "Um grou de papel em pé, com pernas altas, pescoço erguido e topete.",
  },
});
