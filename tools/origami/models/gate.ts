import type { AuthoredModel, Vec3 } from "@alem-da-sessao/origami-core";

/**
 * O portal — «atravessar para uma experiência».
 *
 * A dobra em portão: os dois lados do quadrado erguem-se em direção ao eixo
 * central e inclinam-se um para o outro, deixando uma fenda entre eles. É uma
 * passagem — uma coisa que se atravessa, com uma abertura por onde se vê o
 * outro lado.
 *
 * ## Porque é que substitui o grou
 *
 * O grou é um modelo sequencial. Passa pela base de pássaro e por *petal
 * folds*, que fazem o papel deslizar sobre si próprio: um vinco não descreve
 * essa operação, uma reordenação de camadas descreve. Este solver dobra uma
 * malha fixa por dobradiças e não tem modelo de camadas — a fronteira está em
 * `docs/ORIGAMI_RUNTIME.md` §5.
 *
 * A troca não perde significado. «Atravessar para uma experiência» é passar
 * para o outro lado de alguma coisa, e um portal diz isso diretamente, sem
 * pedir que se reconheça uma ave.
 *
 * ## Porque é que os painéis passam dos 90°
 *
 * A 90° o objeto é um canal de fundo plano e duas paredes — e a essa escala,
 * nesta câmara, lê-se como a caixa. A 128° os painéis inclinam-se um para o
 * outro e a silhueta fecha-se em arco, com uma fenda no topo. É a fenda que
 * faz a leitura: uma parede tem-se pela frente, uma passagem tem-se por onde
 * passar.
 */

/** Onde os lados dobram. A um quarto da largura, cada painel chega ao eixo. */
const HINGE = 0.25;
const LEAN = 128;

const h = HINGE;

const flat: Vec3[] = [
  [-0.5, -0.5, 0], // 0
  [-h, -0.5, 0], //   1
  [h, -0.5, 0], //    2
  [0.5, -0.5, 0], //  3
  [0.5, 0.5, 0], //   4
  [h, 0.5, 0], //     5
  [-h, 0.5, 0], //    6
  [-0.5, 0.5, 0], //  7
];

const faces: readonly (readonly number[])[] = [
  [0, 1, 6, 7], // painel poente
  [1, 2, 5, 6], // soleira
  [2, 3, 4, 5], // painel nascente
];

const edges: readonly (readonly [number, number])[] = [
  // Fronteira, em circuito fechado (0–7).
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 0],
  // As duas dobras do portão (8–9).
  [1, 6],
  [2, 5],
];

/**
 * Duas dobras paralelas e independentes.
 *
 * Não há vértice interior nenhum: cada painel roda sozinho em torno da sua
 * linha. Como no envelope, os ângulos pedidos são os ângulos obtidos, e não
 * há mecanismo a negociar entre eles.
 */
function stage(fraction: number): Record<number, number> {
  return { 8: LEAN * fraction, 9: LEAN * fraction };
}

export const gateModel: AuthoredModel = {
  flat,
  stages: [
    { title: "painéis a erguer", state: "forming", angles: stage(0.55) },
    { title: "portal aberto", state: "formed", angles: stage(1) },
  ],
  faces,
  edges,
  boundary: [0, 1, 2, 3, 4, 5, 6, 7],
  // A soleira fica onde estava; é dela que sai o referencial.
  anchor: { origin: 1, toward: 2, plane: 5 },
};
