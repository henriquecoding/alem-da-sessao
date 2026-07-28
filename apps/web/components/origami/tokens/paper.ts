/**
 * Famílias de papel.
 *
 * «Pastel» descreve a atmosfera das grandes superfícies. Não autoriza texto
 * desbotado nem objetos invisíveis — e foi essa confusão que produziu a versão
 * anterior, onde o origami e o palco tinham praticamente a mesma luminância e
 * o objeto central só existia por causa de uma sombra.
 *
 * Cada família traz cinco valores por tema. Quatro são tons de face derivados
 * de uma única direção de luz (§7.2) e o quinto é a tinta das arestas:
 *
 * - `lit`   — face virada à luz;
 * - `base`  — face neutra, a que define a cor da família;
 * - `shade` — face em sombra;
 * - `inner` — avesso do papel ou face ocluída;
 * - `edge`  — contorno exterior e vincos.
 *
 * **Quem carrega o contraste muda com o tema, e isso é deliberado.** No tema
 * claro, papel claro sobre palco claro nunca chega a 3:1 pelo preenchimento —
 * quem garante a fronteira é o contorno escuro. No tema escuro é o contrário:
 * o papel é muito mais claro do que o palco e o preenchimento chega lá
 * sozinho, portanto o contorno pode voltar a ser só um vinco.
 *
 * As regras verificadas em `tests/origami-contrast.test.ts`, para cada família
 * e cada tema:
 *
 * 1. `edge` contra o palco ≥ 3:1 — a fronteira do objeto é percetível;
 * 2. `edge` contra `base` ≥ 3:1 — o contorno vê-se sobre o próprio papel;
 * 3. `lit` contra `shade` ≥ 1.6:1 — a rampa tonal revela a dobra;
 * 4. `base` contra o palco ≥ 1.3:1 — o «fosso tonal»: nenhuma face principal
 *    se funde com o fundo.
 *
 * Estas cores não codificam emoções clínicas. São famílias composicionais, e o
 * objeto nomeia sempre uma decisão — nunca um estado interno de quem escolheu.
 */

export type PaperFamilyId = "apricot" | "mist" | "jade" | "lilac";

export type PaperTones = {
  lit: string;
  base: string;
  shade: string;
  inner: string;
  edge: string;
};

export type PaperFamily = {
  id: PaperFamilyId;
  /** O que a família faz na composição, não o que «significa». */
  role: string;
  light: PaperTones;
  dark: PaperTones;
};

export const paperFamilies: Record<PaperFamilyId, PaperFamily> = {
  apricot: {
    id: "apricot",
    role: "calor, decisão, continuidade",
    light: {
      lit: "#fae0cb",
      base: "#e3a97f",
      shade: "#c07f56",
      inner: "#94573a",
      edge: "#4a2210",
    },
    dark: {
      lit: "#f2d5be",
      base: "#dcaf8d",
      shade: "#b58260",
      inner: "#8a5a3c",
      edge: "#2b160a",
    },
  },
  mist: {
    id: "mist",
    role: "clareza, distância, reflexão",
    light: {
      lit: "#dfeaf6",
      base: "#a4c3e0",
      shade: "#7699bb",
      inner: "#4e6f92",
      edge: "#142c40",
    },
    dark: {
      lit: "#dae8f4",
      base: "#b0cae2",
      shade: "#809fbd",
      inner: "#557797",
      edge: "#0e1f2d",
    },
  },
  jade: {
    id: "jade",
    role: "estabilidade, cuidado, equilíbrio",
    light: {
      lit: "#d8ece3",
      base: "#9bc7b2",
      shade: "#6d9d88",
      inner: "#467760",
      edge: "#0f2f22",
    },
    dark: {
      lit: "#d4ebe1",
      base: "#a8d0be",
      shade: "#7aa793",
      inner: "#4f7d68",
      edge: "#0b2118",
    },
  },
  lilac: {
    id: "lilac",
    role: "imaginação, suspensão, interioridade",
    light: {
      lit: "#e5dff5",
      base: "#b6a8de",
      shade: "#8878b6",
      inner: "#5e4f8b",
      edge: "#221942",
    },
    dark: {
      lit: "#e0d9f2",
      base: "#bfb2e2",
      shade: "#9384bd",
      inner: "#665893",
      edge: "#191134",
    },
  },
};

export const paperFamilyList: readonly PaperFamily[] = [
  paperFamilies.apricot,
  paperFamilies.mist,
  paperFamilies.jade,
  paperFamilies.lilac,
];

/**
 * O palco. Existe aqui, ao lado do papel, porque o «fosso tonal» é uma relação
 * entre os dois — verificar o papel isolado não diz nada sobre se o objeto se
 * vê.
 *
 * Cada direção de arte tem o seu, e é por isso que uma direção não se avalia
 * só pelas cores do objeto.
 */
export type StageId = "atelier" | "field" | "notebook";

export const stageSurfaces: Record<
  StageId,
  { light: string; dark: string; role: string }
> = {
  atelier: {
    role: "papel sobre mesa: fundo quente e ligeiramente mais escuro que a página",
    light: "#f0e9e0",
    dark: "#191510",
  },
  field: {
    role: "espaço abstrato controlado: fundo frio, muita área negativa",
    light: "#ece9f2",
    dark: "#14131b",
  },
  notebook: {
    role: "plano editorial: fundo neutro com margens e pautas",
    light: "#f1efe9",
    dark: "#17171a",
  },
};
