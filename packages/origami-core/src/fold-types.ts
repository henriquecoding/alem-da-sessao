/**
 * O contrato de entrada: FOLD 1.2, restringido ao que este produto aceita.
 *
 * FOLD é o formato do `edemaine/fold` que o OrigamiSimulator usa como estrutura
 * interna. A razão para o adotar não é compatibilidade com ferramentas de
 * terceiros — é que ele obriga a declarar a coisa que a versão anterior deste
 * repositório nunca declarou: **de que folha é que a forma veio**.
 *
 * Um modelo em FOLD não descreve o resultado. Descreve uma folha (`vertices_coords`
 * do frame plano), onde ela se dobra (`edges_vertices`), em que sentido
 * (`edges_assignment`) e quanto (`edges_foldAngle`). O resultado é o que sai
 * disso. É a diferença entre desenhar um barco e dobrar um.
 *
 * ## O que está restringido, e porquê
 *
 * A especificação FOLD admite sete atribuições de aresta. Aqui aceitam-se cinco:
 *
 * | Código | Significado                        | Ângulo esperado |
 * | ------ | ---------------------------------- | --------------- |
 * | `B`    | fronteira da folha                 | `null`          |
 * | `M`    | mountain — dobra para trás         | negativo        |
 * | `V`    | valley — dobra para a frente       | positivo        |
 * | `F`    | aresta plana (triangulação)        | zero            |
 * | `J`    | junção de modelação, sem vinco     | zero            |
 *
 * `U` (por atribuir) fica de fora porque um vinco sem sentido declarado é um
 * vinco por decidir, e o compilador não adivinha. `C` (corte) fica de fora por
 * uma razão de produto e não de engenharia: a metáfora inteira depende de a
 * folha permanecer inteira. Uma folha cortada é outra coisa, e chamar-lhe
 * origami seria a mesma mentira que a versão anterior contava com polígonos
 * encostados.
 *
 * ## Os campos `ads:`
 *
 * FOLD permite extensões por prefixo. Os campos `ads:` carregam o que o formato
 * não modela e este produto exige: qual é a folha canónica, que papel é, quem
 * autorou, e que estado da experiência cada frame representa. Ficam no ficheiro
 * de origem — e não numa tabela paralela — porque um modelo sem proveniência
 * não deve conseguir sequer ser lido.
 */

export type Vec2 = readonly [number, number];
export type Vec3 = readonly [number, number, number];
export type Edge = readonly [number, number];

/** As cinco atribuições que este produto aceita. Ver tabela acima. */
export type Assignment = "B" | "M" | "V" | "F" | "J";

/** Vinco verdadeiro: tem duas faces e pode ter ângulo. `B` nunca é isto. */
export type CreaseAssignment = Exclude<Assignment, "B">;

export type FaceOrder = readonly [number, number, -1 | 0 | 1];

/**
 * Os estados que a experiência sabe nomear.
 *
 * Um frame do ficheiro FOLD declara qual destes representa. É isto que liga a
 * geometria à narrativa sem que o renderizador precise de saber o que
 * significam — ele interpola números; o significado vive na máquina de estados.
 */
export type OrigamiSemanticState =
  "flat" | "noticed" | "forming" | "formed" | "settled";

/**
 * Os identificadores são os que a homepage e o `packages/i18n` já usam.
 *
 * A especificação falava em `masu` para a caixa. Mantém-se `box`: o
 * identificador atravessa a máquina de estados, a cópia em PT-PT e PT-BR e os
 * rótulos acessíveis, e renomeá-lo seria uma migração de texto a fingir-se de
 * decisão técnica. `masu` é o nome da dobra; `box` é o nome da decisão que o
 * objeto representa no produto, e é a decisão que a interface nomeia.
 */
export type OrigamiModelId =
  "sheet" | "half-fold" | "boat" | "box" | "crane" | "suspended-sheet";

/** Os quatro que representam uma decisão. `sheet` e `half-fold` são estados. */
export type OrigamiResultId = "boat" | "box" | "crane" | "suspended-sheet";

export type PaperFamilyId = "apricot" | "mist" | "jade" | "lilac";

export type FoldFrame = {
  readonly frame_title?: string;
  readonly frame_classes?: readonly ("creasePattern" | "foldedForm")[];
  readonly frame_parent?: number;
  readonly frame_inherit?: boolean;
  readonly vertices_coords?: readonly (Vec2 | Vec3)[];
  readonly edges_vertices?: readonly Edge[];
  readonly edges_assignment?: readonly Assignment[];
  readonly edges_foldAngle?: readonly (number | null)[];
  readonly faces_vertices?: readonly (readonly number[])[];
  readonly faceOrders?: readonly FaceOrder[];
  /** Que estado da experiência este frame representa. */
  readonly "ads:state"?: OrigamiSemanticState;
  /** Progresso normalizado dentro do percurso de dobra, 0..1. */
  readonly "ads:progress"?: number;
};

export type FoldSource = FoldFrame & {
  readonly file_spec: 1.2;
  readonly file_creator: string;
  readonly file_author: string;
  readonly file_title: string;
  readonly file_description?: string;
  readonly file_classes: readonly ("singleModel" | "animation")[];
  readonly file_frames?: readonly FoldFrame[];
  readonly "ads:modelId": OrigamiModelId;
  readonly "ads:paper": {
    /** Quadrada. Não há suporte para outro rácio, e é deliberado. */
    readonly aspect: 1;
    readonly uncut: true;
    readonly frontFamily: PaperFamilyId;
    readonly backFamily: PaperFamilyId;
  };
  readonly "ads:license": {
    readonly id: string;
    readonly sourceUrl?: string;
    readonly attribution: string;
  };
  /**
   * Três vértices que fixam o modelo no espaço durante o bake.
   *
   * Vive no source porque é uma propriedade do modelo e não da execução: sem
   * ele, recompilar o mesmo ficheiro daria a mesma forma noutra orientação.
   */
  readonly "ads:anchor"?: {
    readonly origin: number;
    readonly toward: number;
    readonly plane: number;
  };
  /**
   * Como se põe o objeto em cima da mesa.
   *
   * O padrão de vincos autora-se deitado no plano `XY`, porque é assim que se
   * desenha um padrão de vincos. O objeto dobrado quase nunca se apresenta
   * nessa orientação — um barco visto de cima não é um barco. Estas rotações,
   * em graus e aplicadas por esta ordem, levam o resultado do bake da
   * orientação de autoria para a orientação de apresentação.
   *
   * Vive no source e não no compilador porque é uma decisão sobre *este*
   * modelo, e porque é a única forma de a rever ao lado do padrão que a
   * justifica.
   */
  readonly "ads:presentation"?: {
    readonly rotateX?: number;
    readonly rotateY?: number;
    readonly rotateZ?: number;
  };
};

/**
 * A folha canónica.
 *
 * Todos os ramos começam aqui — mesmo tamanho, mesma orientação, mesma matéria.
 * É o que permite dizer «a mesma folha» sem que seja publicidade: o quadrado
 * unitário centrado na origem, no plano `z = 0`, com o avesso virado para `-z`.
 *
 * A troca de topologia entre ramos só é legítima neste estado, onde duas folhas
 * são visualmente indistinguíveis. Depois do primeiro vinco, nunca.
 */
export const CANONICAL_SHEET = {
  halfSize: 0.5,
  corners: [
    [-0.5, -0.5, 0],
    [0.5, -0.5, 0],
    [0.5, 0.5, 0],
    [-0.5, 0.5, 0],
  ] as const satisfies readonly Vec3[],
} as const;

export function isCreaseAssignment(
  assignment: Assignment,
): assignment is CreaseAssignment {
  return assignment !== "B";
}

/**
 * O ângulo que uma atribuição exige.
 *
 * `M` é negativo e `V` é positivo por convenção do formato, e a convenção só
 * vale se for imposta: o validador rejeita um `M` com ângulo positivo em vez de
 * o corrigir em silêncio. Um sinal trocado que passe daqui reaparece como uma
 * dobra para o lado errado a meio da animação, e nessa altura já ninguém sabe
 * de onde veio.
 */
export function angleIsConsistent(
  assignment: Assignment,
  angle: number | null,
  epsilon = 1e-7,
): boolean {
  if (assignment === "B") return angle === null || Math.abs(angle) <= epsilon;
  if (angle === null) return false;
  if (assignment === "M") return angle < -epsilon;
  if (assignment === "V") return angle > epsilon;
  return Math.abs(angle) <= epsilon;
}
