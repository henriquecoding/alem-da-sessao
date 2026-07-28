import type { AuthoredModel, Vec3 } from "@alem-da-sessao/origami-core";

/**
 * O barco — «levar algo adiante». **Não aprovado. Não está no registo.**
 *
 * Dobra e fecha: 0,0014% de deformação, 3,47° do alvo, zero interseções. O que
 * falha é o único gate que nenhum número mede — em silhueta lê-se como uma
 * tina, não como um barco. O casco é raso de mais e as pontas não sobem acima
 * do bordo, que é precisamente o que faz um barco ser um barco.
 *
 * Fica aqui porque a estrutura está certa e o problema é de proporção: a
 * quilha precisa de dobrar mais fundo do que as diagonais permitem neste
 * padrão, e provavelmente é preciso um segundo par de vincos a meio do costado
 * para o bordo subir sem levar o fundo atrás. Ver `docs/ORIGAMI_RUNTIME.md` §5.
 *
 * Um casco em V com as pontas erguidas, dobrado a partir de uma quilha e de
 * quatro diagonais. Não é o barquinho de papel tradicional: esse faz-se por
 * sequência — dobra ao meio, abre, volta a dobrar — e o padrão de vincos que
 * dele resulta tem camadas que deslizam umas sobre as outras. Este é o casco
 * que se obtém quando a mesma folha dobra de uma vez.
 *
 * ## A estrutura
 *
 * A quilha corre ao longo de `y = 0` e está partida em três: o troço do meio
 * dobra fundo e faz o fundo do casco; os dois troços das pontas dobram menos e
 * é isso que abre a proa e a popa. Nos dois vértices onde a quilha muda de
 * ângulo — `B` e `C` — encontram-se quatro vincos, e é essa a peça que faz o
 * barco funcionar.
 *
 * Um vértice de grau quatro é o mais pequeno que dobra em três dimensões: com
 * três vincos a folha fica rígida e não sai do plano. Aqui os quatro estão a
 * `59°` e `121°` alternados, que somam `180°` de cada lado — a condição de
 * Kawasaki. O vértice tem um grau de liberdade, e é ele que converte a dobra da
 * quilha no levantamento das pontas: não são dois movimentos, é um só.
 *
 * ## Porque é que os ângulos são autorados e não derivados
 *
 * A caixa descreve-se por posições: sabe-se onde cada parede vai parar e a
 * ferramenta deriva os ângulos. Aqui é ao contrário. A forma final de um
 * vértice de grau quatro não se escreve — resolve-se — e tentar fixá-la por
 * coordenadas seria afirmar uma configuração que provavelmente não é
 * isométrica. Declaram-se os ângulos, que é o que o formato FOLD guarda, e o
 * casco é o que o solver encontra dentro deles.
 */

/** Onde a quilha muda de ângulo. Mais perto do centro, pontas mais longas. */
const KEEL_BREAK = 0.22;
/**
 * O quanto a quilha desce no meio, e a razão de não ser zero.
 *
 * Com `B` e `C` sobre `y = 0` os dois troços da quilha ficam colineares, e um
 * vértice de grau quatro com dois vincos em linha reta é degenerado: comporta-se
 * como uma dobra simples ao longo dessa reta e as outras duas dobras não
 * chegam a entrar. Foi o que aconteceu na primeira tentativa — a folha dobrou
 * ao meio como um livro e as diagonais ficaram a zero.
 *
 * Baixar o meio da quilha torna o vértice genérico. É também o que dá ao casco
 * o fundo mais estreito do que o bordo, que é a forma de um casco.
 */
const KEEL_DIP = 0.13;

const k = KEEL_BREAK;
const d = KEEL_DIP;

const flat: Vec3[] = [
  [-0.5, 0, 0], //     0  A · popa, na aresta
  [-k, -d, 0], //      1  B · quebra de ré
  [k, -d, 0], //       2  C · quebra de vante
  [0.5, 0, 0], //      3  D · proa, na aresta
  [-0.5, -0.5, 0], //  4  E
  [0.5, -0.5, 0], //   5  F
  [0.5, 0.5, 0], //    6  G
  [-0.5, 0.5, 0], //   7  H
];

const faces: readonly (readonly number[])[] = [
  [0, 4, 1], //       popa, bordo sul
  [1, 4, 5, 2], //    fundo, bordo sul
  [2, 5, 3], //       proa, bordo sul
  [0, 1, 7], //       popa, bordo norte
  [1, 2, 6, 7], //    fundo, bordo norte
  [2, 3, 6], //       proa, bordo norte
];

const edges: readonly (readonly [number, number])[] = [
  // Fronteira, em circuito fechado (índices 0–5).
  [0, 4],
  [4, 5],
  [5, 3],
  [3, 6],
  [6, 7],
  [7, 0],
  // Quilha (6–8).
  [0, 1],
  [1, 2],
  [2, 3],
  // Diagonais que erguem as pontas (9–12).
  [1, 4],
  [1, 7],
  [2, 5],
  [2, 6],
];

const KEEL_AFT = 6;
const KEEL_MID = 7;
const KEEL_FORE = 8;
const RISERS = [9, 10, 11, 12] as const;

/**
 * Uma etapa: quilha e diagonais em proporção do valor final.
 *
 * Em cada vértice há três vales e um monte. Não é uma escolha estética: um
 * vértice de grau quatro só dobra com três vincos de um tipo e um do outro —
 * com dois e dois fica preso no plano. Aqui os vales são o fundo do casco e as
 * duas diagonais que sobem o costado; o monte é o troço da quilha que segue
 * para a ponta, e é ele que faz a proa erguer-se em vez de continuar o fundo.
 */
function stage(fraction: number): Record<number, number> {
  const angles: Record<number, number> = {
    [KEEL_MID]: 112.5 * fraction,
    [KEEL_AFT]: 122.8 * fraction,
    [KEEL_FORE]: 122.8 * fraction,
  };
  for (const riser of RISERS) angles[riser] = 44.8 * fraction;
  return angles;
}

export const boatModel: AuthoredModel = {
  flat,
  stages: [
    { title: "quilha a marcar", state: "forming", angles: stage(0.45) },
    { title: "casco fechado", state: "formed", angles: stage(1) },
  ],
  faces,
  edges,
  boundary: [0, 1, 2, 3, 4, 5],
  // O painel de bombordo do fundo não dobra sobre si próprio: é dele que sai o
  // referencial. Segurar o fundo é o que as mãos fazem.
  anchor: { origin: 1, toward: 2, plane: 6 },
};
