import type {
  Assignment,
  FoldFrame,
  FoldSource,
  OrigamiSemanticState,
  Vec3,
} from "./fold-types";
import { dihedralAngleAndGradients, distance } from "./geometry";
import { buildMesh, type OrigamiMesh } from "./topology";

/**
 * Ferramentas de autoria — como se escreve um padrão de vincos sem o adivinhar.
 *
 * Escrever `edges_foldAngle` à mão é possível para uma dobra e impraticável
 * para dezasseis. Pior: é a classe de erro mais cara deste sistema, porque um
 * ângulo errado por 4° não falha nenhum invariante — a folha continua íntegra,
 * a topologia continua correta, e o modelo simplesmente fecha torto.
 *
 * A inversão que resolve isto: **o autor descreve a forma dobrada, e a
 * ferramenta deriva os ângulos**. Onde é que cada vértice vai parar é uma
 * pergunta que se responde com trigonometria de liceu e que se verifica a
 * olho; qual é o ângulo diedro de cada um dos dezasseis vincos que produzem
 * essa forma não é.
 *
 * `assertIsometric` é o que impede esta conveniência de se tornar uma nova
 * mentira: se a configuração-alvo que o autor descreveu esticar o papel, ela
 * não é uma dobragem, e nenhum ângulo derivado dela vale nada. A verificação
 * corre em **todas** as etapas, e não só na última — um caminho que passe por
 * uma configuração impossível é tão inválido como um destino impossível.
 */

export type DerivedAngle = {
  readonly edgeIndex: number;
  readonly assignment: Assignment;
  /** Graus, na convenção FOLD: `M` negativo, `V` positivo. */
  readonly degrees: number;
};

/**
 * Verifica que a configuração-alvo é alcançável dobrando, e não esticando.
 *
 * Devolve a maior deformação de aresta encontrada. Um alvo com deformação
 * significativa descreve um objeto que não se pode fazer com aquela folha, e o
 * solver vai passar o bake inteiro a tentar resolver uma contradição.
 */
export function assertIsometric(
  mesh: OrigamiMesh,
  target: readonly Vec3[],
  tolerance = 1e-6,
  label = "alvo",
): number {
  let worst = 0;
  let worstEdge = -1;

  mesh.edges.forEach((edge, index) => {
    if (edge.restLength < 1e-9) return;
    const [a, b] = edge.vertices;
    const strain = Math.abs(
      distance(target[a]!, target[b]!) / edge.restLength - 1,
    );
    if (strain > worst) {
      worst = strain;
      worstEdge = index;
    }
  });

  if (worst > tolerance) {
    const edge = mesh.edges[worstEdge]!;
    throw new Error(
      `origami: ${label} estica a aresta ${worstEdge} (${edge.vertices[0]}–${edge.vertices[1]}) em ${(worst * 100).toFixed(4)}%. ` +
        "Uma folha não estica: a configuração descrita não é uma dobragem daquela folha.",
    );
  }

  return worst;
}

/**
 * Deriva o ângulo de cada vinco a partir de uma forma dobrada.
 *
 * `clampDegrees` existe por causa de uma singularidade real: uma dobra
 * completamente fechada tem 180°, e nesse ponto as duas faces são coplanares —
 * o solver deixa de saber para que lado empurrar e pode assentar do lado
 * errado. Um alvo de 178° é indistinguível a olho e fica bem longe do
 * problema. É a única aproximação deliberada em todo o pipeline, e está aqui
 * onde se vê.
 */
export function deriveFoldAngles(
  mesh: OrigamiMesh,
  target: readonly Vec3[],
  options: { readonly clampDegrees?: number } = {},
): DerivedAngle[] {
  const clamp = options.clampDegrees ?? 178;

  return mesh.creases
    .filter((crease) => !mesh.edges[crease.edgeIndex]!.derived)
    .map((crease) => {
      const { angle } = dihedralAngleAndGradients({
        p1: target[crease.p1]!,
        p2: target[crease.p2]!,
        apexA: target[crease.apexA]!,
        apexB: target[crease.apexB]!,
      });

      const degrees = (angle * 180) / Math.PI;
      const limited = Math.max(-clamp, Math.min(clamp, degrees));

      return {
        edgeIndex: crease.edgeIndex,
        assignment: Math.abs(limited) < 1e-6 ? "F" : limited > 0 ? "V" : "M",
        degrees: Number(limited.toFixed(4)),
      };
    });
}

/**
 * Uma configuração intermédia pela qual a dobragem passa.
 *
 * Há duas maneiras de a descrever, e a escolha depende do modelo.
 *
 * **Por posições.** O autor diz onde cada vértice fica. É o caminho certo
 * quando a forma dobrada se calcula — a caixa é o exemplo: paredes a subir 90°,
 * abas a assentar, tudo trigonometria de liceu que se verifica a olho. A
 * ferramenta deriva os ângulos e verifica a isometria.
 *
 * **Por ângulos.** O autor diz quanto cada vinco dobra, e a forma é o que sair
 * daí. É o caminho certo quando o resultado é difícil de escrever e fácil de
 * reconhecer — um casco de barco, uma asa. Aqui não há isometria para
 * verificar à cabeça, porque não se afirmou nenhuma posição: o solver encontra
 * a configuração isométrica que aqueles ângulos permitem, e é ela o resultado.
 *
 * É também a forma nativa do FOLD, que guarda ângulos e não posições.
 */
export type AuthoredStage = {
  readonly title: string;
  readonly state: OrigamiSemanticState;
  readonly positions?: readonly Vec3[];
  /** Graus por índice de aresta. `M` negativo, `V` positivo. */
  readonly angles?: Readonly<Record<number, number>>;
};

export type AuthoredModel = {
  /** A folha plana. `z` é sempre zero. */
  readonly flat: readonly Vec3[];
  /**
   * As etapas da dobragem, por ordem. A última é o modelo acabado.
   *
   * Uma etapa só é necessária quando o passo anterior tem de estar feito para o
   * seguinte fazer sentido. Um modelo simples tem uma; a caixa tem duas, porque
   * a aba do canto tem de existir antes de se poder deitar contra a parede.
   */
  readonly stages: readonly AuthoredStage[];
  readonly faces: readonly (readonly number[])[];
  /** Só a topologia; as atribuições e os ângulos são derivados. */
  readonly edges: readonly (readonly [number, number])[];
  /** Índices das arestas que formam o contorno da folha. */
  readonly boundary: readonly number[];
  /**
   * Três vértices que não se movem um em relação ao outro durante a dobragem,
   * e que por isso servem de referencial. Escolher três que dobrem entre si
   * fixaria o modelo a uma pose que ele nunca tem.
   */
  readonly anchor: {
    readonly origin: number;
    readonly toward: number;
    readonly plane: number;
  };
};

export type FoldSourceMetadata = Omit<
  FoldSource,
  | "vertices_coords"
  | "edges_vertices"
  | "edges_assignment"
  | "edges_foldAngle"
  | "faces_vertices"
  | "file_frames"
>;

/**
 * Monta um `FoldSource` completo a partir da descrição de autoria.
 *
 * O ficheiro que sai daqui é a fonte de verdade do modelo e é ele que fica no
 * repositório — não este código. Um `source.fold` é legível, diffável e
 * verificável por qualquer ferramenta que fale FOLD; um script que o gera é
 * mais uma coisa que pode mudar sem que ninguém repare.
 *
 * O frame de topo leva os ângulos do **modelo acabado** — é isso que dá sentido
 * às atribuições `M` e `V`, que descrevem o destino e não o percurso. As etapas
 * intermédias vivem em `file_frames`, que é exatamente para o que a
 * especificação FOLD as tem.
 */
export function authorFoldSource(
  model: AuthoredModel,
  metadata: FoldSourceMetadata,
): FoldSource {
  if (!model.stages.length) {
    throw new Error("origami: um modelo precisa de pelo menos uma etapa.");
  }

  const boundary = new Set(model.boundary);

  const skeleton = {
    ...metadata,
    vertices_coords: model.flat,
    edges_vertices: model.edges,
    edges_assignment: model.edges.map((_, index) =>
      boundary.has(index) ? "B" : "F",
    ) as Assignment[],
    edges_foldAngle: model.edges.map((_, index) =>
      boundary.has(index) ? null : 0,
    ),
    faces_vertices: model.faces,
  } as FoldSource;

  const mesh = buildMesh(skeleton);

  const anglesPerStage = model.stages.map((stage) => {
    const assignments = [...skeleton.edges_assignment!] as Assignment[];
    const angles = [...skeleton.edges_foldAngle!];

    if (stage.positions) {
      assertIsometric(mesh, stage.positions, 1e-6, `a etapa «${stage.title}»`);
      for (const derived of deriveFoldAngles(mesh, stage.positions)) {
        assignments[derived.edgeIndex] = derived.assignment;
        angles[derived.edgeIndex] = derived.degrees;
      }
      return { assignments, angles };
    }

    if (!stage.angles) {
      throw new Error(
        `origami: a etapa «${stage.title}» não declara posições nem ângulos.`,
      );
    }

    for (const [key, degrees] of Object.entries(stage.angles)) {
      const edgeIndex = Number(key);
      if (boundary.has(edgeIndex)) {
        throw new Error(
          `origami: a etapa «${stage.title}» tenta dobrar a aresta ${edgeIndex}, que é fronteira.`,
        );
      }
      if (!model.edges[edgeIndex]) {
        throw new Error(
          `origami: a etapa «${stage.title}» refere a aresta ${edgeIndex}, que não existe.`,
        );
      }
      const limited = Math.max(-178, Math.min(178, degrees));
      assignments[edgeIndex] =
        Math.abs(limited) < 1e-6 ? "F" : limited > 0 ? "V" : "M";
      angles[edgeIndex] = Number(limited.toFixed(4));
    }

    return { assignments, angles };
  });

  const last = anglesPerStage[anglesPerStage.length - 1]!;

  const frames: FoldFrame[] = model.stages.map((stage, index) => ({
    frame_title: stage.title,
    frame_classes: ["foldedForm"],
    frame_parent: 0,
    frame_inherit: true,
    edges_foldAngle: anglesPerStage[index]!.angles,
    "ads:state": stage.state,
    "ads:progress": (index + 1) / model.stages.length,
  }));

  return {
    ...skeleton,
    "ads:anchor": model.anchor,
    edges_assignment: last.assignments,
    edges_foldAngle: last.angles,
    file_frames: frames,
  };
}
