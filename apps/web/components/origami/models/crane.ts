import { defineOrigamiModel } from "../types";

/**
 * Grou — «atravessar para uma experiência».
 *
 * Quinta versão. As quatro anteriores falharam, e todas pela mesma causa vista
 * de ângulos diferentes: **simetria**.
 *
 * 1. Asas, pescoço e cauda a irradiar de um centro com ângulos parecidos —
 *    uma estrela de seis pontas.
 * 2. As mesmas pontas, mais gordas — uma estrela mais gorda.
 * 3. Pose de perfil com as asas numa barra horizontal — um dardo.
 * 4. Asas erguidas em V, pescoço à esquerda, cauda à direita — um X. Duas
 *    pontas para cada lado cancelam-se e o olho volta a ler uma estrela.
 *
 * O que resolve é quebrar a simetria: **uma asa só**, grande, erguida para
 * trás, contra um pescoço fino e comprido para a frente. Um lado do objeto é
 * massa, o outro é linha, e nenhuma estrela tem isso.
 *
 * O segundo elemento indispensável é a cabeça. Um pescoço que termina numa
 * cunha com bico virado para a frente é a única coisa que um dardo de papel
 * não pode ter — e é por isso que o bico tem vértices próprios em vez de ser
 * um detalhe desenhado por cima. Um bico que só se vê com cor não é um bico.
 *
 * Nove faces. A asa, o pescoço, a cauda e o corpo partem-se ao longo dos
 * vincos que os formam: é a diferença entre um sólido facetado e papel que foi
 * dobrado.
 */
export const craneModel = defineOrigamiModel({
  id: "crane",
  viewBox: [0, 0, 300, 220],
  vertices: {
    headTop: [42, 16],
    beakTip: [4, 42],
    headChin: [64, 56],
    neckUpperBase: [150, 112],
    neckLowerBase: [118, 134],
    wingTip: [280, 18],
    wingTrailingTip: [240, 108],
    wingRoot: [182, 142],
    tailTipUpper: [294, 158],
    tailTipLower: [278, 182],
    bodyBack: [172, 164],
    keelTip: [128, 198],
  },
  silhouette: [
    "headTop",
    "neckUpperBase",
    "wingTip",
    "wingTrailingTip",
    "wingRoot",
    "tailTipUpper",
    "tailTipLower",
    "bodyBack",
    "keelTip",
    "neckLowerBase",
    "headChin",
    "beakTip",
  ],
  faces: [
    {
      id: "body-back",
      tone: "inner",
      vertices: ["wingRoot", "bodyBack", "keelTip"],
    },
    {
      id: "body-mid",
      tone: "shade",
      vertices: ["neckUpperBase", "wingRoot", "keelTip"],
    },
    {
      id: "body-front",
      tone: "base",
      vertices: ["neckUpperBase", "keelTip", "neckLowerBase"],
    },
    {
      id: "tail-lower",
      tone: "inner",
      vertices: ["wingRoot", "tailTipLower", "bodyBack"],
    },
    {
      id: "tail-upper",
      tone: "shade",
      vertices: ["wingRoot", "tailTipUpper", "tailTipLower"],
    },
    {
      id: "wing-lower",
      tone: "shade",
      vertices: ["neckUpperBase", "wingTrailingTip", "wingRoot"],
    },
    {
      id: "wing-upper",
      tone: "base",
      vertices: ["neckUpperBase", "wingTip", "wingTrailingTip"],
    },
    {
      id: "neck-upper",
      tone: "lit",
      vertices: ["headTop", "neckUpperBase", "neckLowerBase"],
    },
    {
      id: "head",
      tone: "base",
      vertices: ["neckLowerBase", "headChin", "beakTip", "headTop"],
    },
  ],
  creases: [
    {
      id: "wing-fold",
      kind: "mountain",
      vertices: ["neckUpperBase", "wingTrailingTip"],
    },
    {
      id: "wing-root",
      kind: "valley",
      vertices: ["neckUpperBase", "wingRoot"],
    },
    { id: "spine", kind: "mountain", vertices: ["neckUpperBase", "keelTip"] },
    { id: "keel", kind: "valley", vertices: ["wingRoot", "keelTip"] },
    {
      id: "neck-root",
      kind: "valley",
      vertices: ["neckUpperBase", "neckLowerBase"],
    },
    {
      id: "neck-fold",
      kind: "mountain",
      vertices: ["headTop", "neckLowerBase"],
    },
    { id: "tail-root", kind: "valley", vertices: ["wingRoot", "bodyBack"] },
    {
      id: "tail-fold",
      kind: "mountain",
      vertices: ["wingRoot", "tailTipLower"],
    },
  ],
  shadowPath: "M64 202a80 10 0 1 0 160 0a80 10 0 1 0-160 0",
  accessibleLabel: {
    "pt-PT": "Um grou de papel com uma asa erguida e o pescoço à frente.",
    "pt-BR": "Um tsuru de papel com uma asa erguida e o pescoço à frente.",
  },
});
