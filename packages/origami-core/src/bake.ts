import {
  add,
  cross,
  dihedralAngleAndGradients,
  dot,
  normalize,
  scale,
  subtract,
  wrapAngle,
} from "./geometry";
import type { FoldSource, OrigamiSemanticState, Vec3 } from "./fold-types";
import { diagnoseFrame, maxEdgeStrain, type FrameDiagnostics } from "./metrics";
import {
  createSolverState,
  hasDiverged,
  kineticEnergy,
  maxAngleError,
  maxDisplacementPerStep,
  readPositions,
  step,
  type SolverOptions,
} from "./solver";
import type { OrigamiMesh } from "./topology";

/**
 * De um padrão de vincos para uma sequência de frames aprovados.
 *
 * O bake é a fronteira entre os dois mundos deste sistema. Antes dele há física
 * — cara, sensível, capaz de divergir. Depois dele há uma tabela de números que
 * o browser interpola e que se comporta exatamente da mesma maneira em todas as
 * máquinas. É esta separação que permite ter dobragem verdadeira sem pôr um
 * solver instável na homepage de alguém.
 *
 * ## Etapas, e porque é que são necessárias
 *
 * A tentação é levar todos os vincos ao destino ao mesmo tempo, escalados por
 * um único `progress`. Funciona no meio-quadrado e falha em tudo o resto, por
 * uma razão que se vê bem na caixa: a aba do canto tem de existir antes de se
 * poder deitar. Pedir-lhe as duas coisas ao mesmo tempo — fecha a diagonal *e*
 * assenta na parede — é pedir-lhe direções contraditórias, e o solver assenta
 * num compromisso onde a diagonal fica a 5° e nada acontece.
 *
 * Uma etapa é uma configuração-alvo intermédia. O modelo vai do plano à
 * primeira, da primeira à segunda, e assim por diante. É como se dobra papel a
 * sério, e é o que o formato FOLD já previa com `file_frames`.
 *
 * ## O determinismo
 *
 * Nada aqui usa `Math.random` nem lê o relógio. O mesmo source com as mesmas
 * opções produz os mesmos números — que é o que permite ao teste comparar
 * hashes e ao CI detetar que um asset deixou de corresponder à sua fonte.
 */

export type BakeOptions = SolverOptions & {
  /** Frames capturados por etapa. O frame plano conta à parte. */
  readonly framesPerStage: number;
  /** Passos de relaxação entre frames capturados. */
  readonly relaxationSteps: number;
  /** Passos extra no fim de cada etapa, até assentar. */
  readonly settleSteps: number;
  /**
   * Deslocamento máximo por passo, em unidades do modelo, abaixo do qual se
   * considera assente. A folha mede 1, portanto `1e-7` é um sétimo de milésimo
   * de por cento do lado.
   */
  readonly restDisplacement: number;
  /** Acima disto o bake falha em vez de entregar papel esticado. */
  readonly strainLimit: number;
  /** Acima disto o modelo não chegou onde o autor disse que chegava. */
  readonly angleToleranceDegrees: number;
  /** Três vértices que repõem cada frame no referencial da folha. */
  readonly anchor?: FrameAnchor;
};

export const DEFAULT_BAKE_OPTIONS: BakeOptions = {
  integrator: "semi-implicit-euler",
  dt: 0.35,
  axialStiffness: 20,
  creaseStiffness: 6,
  facetStiffness: 18,
  dampingRatio: 0.45,
  lengthProjectionIterations: 8,
  framesPerStage: 12,
  relaxationSteps: 4000,
  settleSteps: 40000,
  restDisplacement: 1e-7,
  strainLimit: 0.0025,
  angleToleranceDegrees: 6,
};

/**
 * Três vértices que fixam o modelo no espaço.
 *
 * O solver não tem nada preso: as forças são todas internas, portanto o modelo
 * conserva a quantidade de movimento e devia ficar onde estava. Na prática não
 * fica — a projeção de comprimento é um passo de Gauss-Seidel e não conserva
 * exatamente o momento, e ao fim de dezenas de milhares de passos a caixa
 * aparece 0,12 abaixo da origem e rodada 5,7°. A forma está certa; o
 * referencial é que fugiu.
 *
 * Isso importa porque a rotação de apresentação declarada no source assume que
 * o modelo está onde o autor o pôs. Em vez de perseguir a deriva no integrador,
 * cada frame capturado é reposto num referencial explícito: uma origem, uma
 * direção, e um terceiro ponto que define o plano.
 *
 * Para a caixa são os três primeiros cantos da base — que é literalmente o que
 * as mãos fazem enquanto se dobra uma caixa.
 */
export type FrameAnchor = {
  readonly origin: number;
  readonly toward: number;
  readonly plane: number;
};

function anchorBasis(a: Vec3, b: Vec3, c: Vec3): readonly [Vec3, Vec3, Vec3] {
  const x = normalize(subtract(b, a));
  const z = normalize(cross(x, subtract(c, a)));
  return [x, cross(z, x), z];
}

/** Repõe uma configuração no referencial em que a folha plana estava. */
export function alignToAnchor(
  positions: readonly Vec3[],
  rest: readonly Vec3[],
  anchor: FrameAnchor,
): Vec3[] {
  const current = anchorBasis(
    positions[anchor.origin]!,
    positions[anchor.toward]!,
    positions[anchor.plane]!,
  );
  const target = anchorBasis(
    rest[anchor.origin]!,
    rest[anchor.toward]!,
    rest[anchor.plane]!,
  );

  const currentOrigin = positions[anchor.origin]!;
  const targetOrigin = rest[anchor.origin]!;

  return positions.map((point) => {
    const local = subtract(point, currentOrigin);
    return add(
      targetOrigin,
      add(
        scale(target[0], dot(local, current[0])),
        add(
          scale(target[1], dot(local, current[1])),
          scale(target[2], dot(local, current[2])),
        ),
      ),
    );
  });
}

export type FoldStage = {
  /** Radianos, um por dobradiça, na ordem de `mesh.creases`. */
  readonly targets: Float64Array;
  readonly state: OrigamiSemanticState;
};

/**
 * Extrai os alvos de uma etapa a partir da configuração que o autor descreveu.
 *
 * O autor diz onde os vértices ficam; isto diz o que cada vinco tem de fazer
 * para lá chegar. Inverter a direção da autoria assim é o que torna um modelo
 * de dezasseis vincos escrevível por uma pessoa.
 */
export function stageFromConfiguration(
  mesh: OrigamiMesh,
  positions: readonly Vec3[],
  state: OrigamiSemanticState,
  clampDegrees = 178,
): FoldStage {
  const clamp = (clampDegrees * Math.PI) / 180;
  const targets = new Float64Array(mesh.creases.length);

  mesh.creases.forEach((crease, index) => {
    const { angle } = dihedralAngleAndGradients({
      p1: positions[crease.p1]!,
      p2: positions[crease.p2]!,
      apexA: positions[crease.apexA]!,
      apexB: positions[crease.apexB]!,
    });
    targets[index] = Math.max(-clamp, Math.min(clamp, angle));
  });

  return { targets, state };
}

/**
 * As etapas lidas do próprio `source.fold`.
 *
 * É a leitura certa por uma razão prática: torna o `.fold` a única fonte. Um
 * modelo recompilado a partir do ficheiro sozinho — sem o script que o gerou —
 * produz exatamente os mesmos frames, venha ele de posições autoradas ou de
 * ângulos escritos à mão. O ficheiro guarda ângulos, que é o que o formato
 * FOLD guarda.
 *
 * As arestas de triangulação não aparecem no source e o seu alvo é sempre zero:
 * uma face do autor não tem vinco lá dentro.
 */
export function stagesFromSource(
  source: FoldSource,
  mesh: OrigamiMesh,
): FoldStage[] {
  const sourceEdgeCount = source.edges_vertices?.length ?? 0;
  const frames = source.file_frames ?? [];

  if (!frames.length) {
    throw new Error(
      `origami: ${source["ads:modelId"]} não declara etapas em file_frames.`,
    );
  }

  return frames.map((frame, index) => {
    const declared = frame.edges_foldAngle ?? source.edges_foldAngle ?? [];
    const targets = new Float64Array(mesh.creases.length);

    mesh.creases.forEach((crease, creaseIndex) => {
      if (crease.edgeIndex >= sourceEdgeCount) return;
      const degrees = declared[crease.edgeIndex];
      targets[creaseIndex] =
        degrees === null || degrees === undefined
          ? 0
          : (degrees * Math.PI) / 180;
    });

    return {
      targets,
      state:
        frame["ads:state"] ??
        (index === frames.length - 1 ? "formed" : "forming"),
    };
  });
}

export type BakedFrame = {
  readonly progress: number;
  readonly positions: readonly Vec3[];
  readonly state: OrigamiSemanticState;
  readonly maxEdgeStrain: number;
};

export type BakeDiagnostics = {
  readonly frames: number;
  readonly stepsTaken: number;
  readonly finalKineticEnergy: number;
  readonly finalAngleErrorDegrees: number;
  readonly worstEdgeStrain: number;
  readonly final: FrameDiagnostics;
};

export type BakeResult =
  | {
      readonly ok: true;
      readonly frames: readonly BakedFrame[];
      readonly diagnostics: BakeDiagnostics;
    }
  | {
      readonly ok: false;
      readonly reason:
        "DIVERGED" | "STRAIN" | "SELF_INTERSECTION" | "NOT_REACHED";
      readonly detail: string;
      readonly frames: readonly BakedFrame[];
      readonly diagnostics: BakeDiagnostics;
    };

/**
 * Que estado da experiência corresponde a que progresso global.
 *
 * A fronteira não é arbitrária: `noticed` é onde a folha deixa de ser plana o
 * suficiente para se ver que alguma coisa começou, e `formed` é o repouso. O
 * mapa vive aqui e não no runtime porque é uma decisão de autoria — o
 * renderizador interpola números e não devia saber o que eles significam.
 */
export function stateForProgress(progress: number): OrigamiSemanticState {
  if (progress <= 0.001) return "flat";
  if (progress < 0.2) return "noticed";
  if (progress < 0.999) return "forming";
  return "formed";
}

export function bakeModel(
  mesh: OrigamiMesh,
  stages: readonly FoldStage[],
  overrides: Partial<BakeOptions> = {},
): BakeResult {
  const options = { ...DEFAULT_BAKE_OPTIONS, ...overrides };
  const state = createSolverState(mesh, options);

  const frames: BakedFrame[] = [];
  let stepsTaken = 0;

  const totalFrames = stages.length * options.framesPerStage;
  let framesEmitted = 0;

  const capture = (progress: number): BakedFrame => {
    const raw = readPositions(state);
    const positions = options.anchor
      ? alignToAnchor(raw, mesh.restPositions, options.anchor)
      : raw;
    return {
      progress,
      positions,
      state: stateForProgress(progress),
      maxEdgeStrain: maxEdgeStrain(mesh, positions),
    };
  };

  const diagnose = (targets: Float64Array): BakeDiagnostics => ({
    frames: frames.length,
    stepsTaken,
    finalKineticEnergy: kineticEnergy(state),
    finalAngleErrorDegrees: (maxAngleError(state, targets) * 180) / Math.PI,
    worstEdgeStrain: frames.reduce(
      (worst, frame) => Math.max(worst, frame.maxEdgeStrain),
      0,
    ),
    final: diagnoseFrame(mesh, readPositions(state)),
  });

  // Frame 0: a folha plana, sem um único passo de simulação. Tem de ser
  // exatamente a folha de partida — se o frame 0 já tivesse ruído, o modelo
  // nunca voltaria ao plano e o «reset» da experiência mentiria.
  frames.push(capture(0));

  let from = new Float64Array(mesh.creases.length);
  const current = new Float64Array(mesh.creases.length);

  for (const [stageIndex, stage] of stages.entries()) {
    const isLastStage = stageIndex === stages.length - 1;

    for (let tick = 1; tick <= options.framesPerStage; tick += 1) {
      const within = tick / options.framesPerStage;
      for (let index = 0; index < current.length; index += 1) {
        // Pelo caminho mais curto, e não pela diferença ingénua.
        //
        // Uma aba que esteja a −45° e tenha de acabar deitada na parede pode
        // lá chegar rodando −133° ou +223°. São o mesmo destino: ±178° é a
        // mesma configuração. Mas o caminho longo passa por 0°, onde a aba fica
        // coplanar com a parede e deixa de ter um lado preferido — um ponto de
        // sela onde o solver pode ficar parado indefinidamente. Era o que
        // acontecia: três cantos da caixa escapavam por assimetrias numéricas
        // minúsculas e o quarto ficava preso a 5°.
        //
        // Dobrar papel é sempre o caminho curto. Ninguém desdobra uma aba até
        // ao plano para a voltar a dobrar pelo outro lado.
        current[index] =
          from[index]! +
          wrapAngle(stage.targets[index]! - from[index]!) * within;
      }

      const isLastFrame = isLastStage && tick === options.framesPerStage;
      const steps = isLastFrame ? options.settleSteps : options.relaxationSteps;

      for (let iteration = 0; iteration < steps; iteration += 1) {
        step(state, current);
        stepsTaken += 1;

        if (hasDiverged(state)) {
          return {
            ok: false,
            reason: "DIVERGED",
            detail: `posições não finitas na etapa ${stageIndex}, passo ${stepsTaken}`,
            frames,
            diagnostics: diagnose(current),
          };
        }

        // Parar cedo quando já assentou poupa a maior parte do trabalho: os
        // primeiros passos de cada incremento fazem quase tudo.
        if (
          iteration > 64 &&
          maxDisplacementPerStep(state) < options.restDisplacement
        ) {
          break;
        }
      }

      framesEmitted += 1;
      const frame = capture(framesEmitted / totalFrames);
      frames.push(frame);

      if (frame.maxEdgeStrain > options.strainLimit) {
        return {
          ok: false,
          reason: "STRAIN",
          detail: `deformação de aresta ${(frame.maxEdgeStrain * 100).toFixed(3)}% na etapa ${stageIndex}; o limite é ${(options.strainLimit * 100).toFixed(3)}%`,
          frames,
          diagnostics: diagnose(current),
        };
      }
    }

    from = Float64Array.from(stage.targets);
  }

  const finalTargets = stages[stages.length - 1]!.targets;
  const diagnostics = diagnose(finalTargets);

  if (diagnostics.finalAngleErrorDegrees > options.angleToleranceDegrees) {
    return {
      ok: false,
      reason: "NOT_REACHED",
      detail:
        `o modelo assentou a ${diagnostics.finalAngleErrorDegrees.toFixed(2)}° do alvo ` +
        `(tolerância ${options.angleToleranceDegrees}°). O padrão dobra, mas não para onde o autor disse.`,
      frames,
      diagnostics,
    };
  }

  if (diagnostics.final.selfIntersectionCount > 0) {
    return {
      ok: false,
      reason: "SELF_INTERSECTION",
      detail: `${diagnostics.final.selfIntersectionCount} pares de triângulos atravessam-se no frame final`,
      frames,
      diagnostics,
    };
  }

  return { ok: true, frames, diagnostics };
}
