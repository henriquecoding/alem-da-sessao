import { defineOrigamiModel } from "../types";

/**
 * Barco à vela — «levar algo adiante».
 *
 * A primeira versão tinha as duas velas com a mesma inclinação e uma diferença
 * de altura pequena. Em silhueta preta lia-se uma tenda: as duas hipotenusas
 * continuavam-se quase em linha reta e o degrau entre elas desaparecia.
 *
 * O que corrige é o mastro. A vela grande e a vela pequena têm agora massas
 * muito diferentes e o degrau entre `mastNotch` e `mastTop` é uma aresta
 * vertical de 80 px contra o céu. É essa vertical — e não a cor, nem a sombra —
 * que faz o objeto ser lido como barco e não como montanha.
 *
 * O casco tem duas faces. A banda superior (`hull-lip`) é o avesso do papel
 * virado para fora, e por isso usa o tom `inner`: não é uma sombra inventada
 * para dar volume, é literalmente a outra face da folha.
 */
export const boatModel = defineOrigamiModel({
  id: "boat",
  viewBox: [0, 0, 260, 214],
  vertices: {
    mastTop: [144, 10],
    mastNotch: [144, 72],
    mastFoot: [144, 138],
    bigClew: [216, 138],
    smallClew: [72, 138],
    hullTopLeft: [28, 138],
    hullTopRight: [232, 138],
    hullMidLeft: [47, 160],
    hullMidRight: [213, 160],
    hullBottomLeft: [78, 196],
    hullBottomRight: [182, 196],
  },
  silhouette: [
    "mastTop",
    "bigClew",
    "hullTopRight",
    "hullMidRight",
    "hullBottomRight",
    "hullBottomLeft",
    "hullMidLeft",
    "hullTopLeft",
    "smallClew",
    "mastNotch",
  ],
  faces: [
    {
      id: "hull-body",
      tone: "shade",
      vertices: [
        "hullMidLeft",
        "hullMidRight",
        "hullBottomRight",
        "hullBottomLeft",
      ],
    },
    {
      id: "hull-lip",
      tone: "inner",
      vertices: [
        "hullTopLeft",
        "smallClew",
        "mastFoot",
        "bigClew",
        "hullTopRight",
        "hullMidRight",
        "hullMidLeft",
      ],
    },
    {
      id: "mainsail",
      tone: "base",
      vertices: ["mastTop", "bigClew", "mastFoot", "mastNotch"],
    },
    {
      id: "jib",
      tone: "lit",
      vertices: ["mastNotch", "mastFoot", "smallClew"],
    },
  ],
  creases: [
    { id: "mast", kind: "mountain", vertices: ["mastNotch", "mastFoot"] },
    {
      id: "deck",
      kind: "edge",
      vertices: ["smallClew", "mastFoot", "bigClew"],
    },
    {
      id: "gunwale",
      kind: "valley",
      vertices: ["hullMidLeft", "hullMidRight"],
    },
  ],
  shadowPath: "M50 199a80 11 0 1 0 160 0a80 11 0 1 0-160 0",
  accessibleLabel: {
    "pt-PT": "Um barco de papel com duas velas, pousado.",
    "pt-BR": "Um barco de papel com duas velas, apoiado.",
  },
});
