import { defineOrigamiModel } from "../types";

/**
 * A folha dobrada ao meio. O estado intermédio entre «notar» e «decidir».
 *
 * Existe por uma razão de honestidade narrativa: se o objeto final aparecesse
 * logo a seguir à primeira escolha, a metáfora falhava — o papel teria mudado
 * por magia e não por dobras. Este é o passo em que a folha deixa de ser folha
 * e ainda não é coisa nenhuma.
 *
 * A primeira versão era um triângulo, e um triângulo não é papel dobrado: é um
 * triângulo. O que faz a diferença é a **camada de trás a espreitar**. Quando
 * se dobra uma folha ao meio, as duas metades quase nunca ficam alinhadas —
 * fica sempre uma faixa da camada de baixo à vista, e é essa faixa que diz que
 * existem duas camadas em vez de uma superfície.
 *
 * A faixa é uma cunha e não uma banda de espessura constante. Com espessura
 * constante o objeto lia-se como um ecrã sobre uma base — um portátil — e a
 * assimetria é o que o devolve a papel mal alinhado.
 *
 * A faixa usa o tom `inner` porque é literalmente o avesso do papel, e as duas
 * arestas onde a camada da frente passa por cima são vincos de tipo `edge` —
 * sombra de contacto curta, não linha de luz.
 *
 * A silhueta continua deliberadamente pouco: um estado intermédio que já fosse
 * reconhecível como alguma coisa roubaria a leitura ao objeto final.
 */
export const halfFoldModel = defineOrigamiModel({
  id: "half-fold",
  viewBox: [0, 0, 240, 200],
  vertices: {
    foldLeft: [44, 72],
    foldMid: [126, 68],
    foldRight: [206, 64],
    frontRight: [198, 146],
    frontMid: [126, 149],
    frontLeft: [52, 152],
    backRight: [186, 156],
    backLeft: [34, 182],
  },
  silhouette: [
    "foldLeft",
    "foldMid",
    "foldRight",
    "frontRight",
    "backRight",
    "backLeft",
    "frontLeft",
  ],
  faces: [
    {
      id: "back-layer",
      tone: "inner",
      vertices: [
        "frontLeft",
        "frontMid",
        "frontRight",
        "backRight",
        "backLeft",
      ],
    },
    {
      id: "front-left",
      tone: "lit",
      vertices: ["foldLeft", "foldMid", "frontMid", "frontLeft"],
    },
    {
      id: "front-right",
      tone: "base",
      vertices: ["foldMid", "foldRight", "frontRight", "frontMid"],
    },
  ],
  creases: [
    { id: "half", kind: "mountain", vertices: ["foldMid", "frontMid"] },
    {
      id: "layer-edge",
      kind: "edge",
      vertices: ["frontLeft", "frontMid", "frontRight"],
    },
  ],
  shadowPath: "M50 178a72 9 0 1 0 144 0a72 9 0 1 0-144 0",
  accessibleLabel: {
    "pt-PT": "A folha dobrada ao meio, com a camada de baixo à vista.",
    "pt-BR": "A folha dobrada ao meio, com a camada de baixo aparecendo.",
  },
});
