import type { Vec3 } from "./fold-types";
import {
  cornerAngleAndGradients,
  dihedralAngleAndGradients,
  dot,
  wrapAngle,
} from "./geometry";
import type { OrigamiMesh } from "./topology";

/**
 * O solver bar-and-hinge — o motor de autoria.
 *
 * Este ficheiro **não pode chegar ao browser**. Existe para responder a uma
 * pergunta que só se responde uma vez por modelo: *este padrão de vincos dobra
 * mesmo?* A resposta é cara de calcular, sensível a parâmetros, e nada disso
 * deve acontecer enquanto alguém abre a homepage. O que vai para produção são
 * os frames que este motor produziu e que um humano aprovou.
 *
 * O modelo físico é o do OrigamiSimulator, reimplementado a partir das equações
 * e não do código:
 *
 * - **barra**: cada aresta resiste a mudar de comprimento. É isto que faz o
 *   papel não esticar.
 * - **dobradiça**: cada aresta interior resiste a afastar-se do seu ângulo-alvo.
 *   Nos vincos verdadeiros o alvo é o que o autor declarou; nas diagonais da
 *   triangulação o alvo é zero, e é isso que impede uma face de se enrolar.
 *
 * ## Porque é que a massa é o que é
 *
 * A escolha menos óbvia aqui é dar a cada nó uma massa igual à soma das
 * rigidezes que o puxam. Não é realismo — papel tem densidade uniforme. É
 * estabilidade: com esta massa, a frequência natural fica aproximadamente igual
 * em todos os nós, e um integrador explícito pode usar um passo único sem que o
 * vértice mais preso do modelo exploda enquanto o resto ainda nem se mexeu.
 *
 * A alternativa — massa uniforme — obriga o passo a servir o pior nó do modelo,
 * e o pior nó de um padrão com triângulos finos é muito pior do que a média.
 * O mesmo `dt` passa a precisar de ser dez vezes menor, e o bake de um modelo
 * passa de segundos a minutos sem que o resultado melhore.
 */

export type Integrator = "semi-implicit-euler" | "verlet";

export type SolverOptions = {
  readonly integrator: Integrator;
  readonly dt: number;
  /** Rigidez axial por unidade de comprimento. Guia elástico, não a garantia. */
  readonly axialStiffness: number;
  /** Rigidez dos vincos verdadeiros (`M`, `V`, `J`). */
  readonly creaseStiffness: number;
  /** Rigidez das diagonais de triangulação. Mantém a face plana. */
  readonly facetStiffness: number;
  /**
   * Rigidez dos ângulos interiores de cada triângulo — o `kface` da §2.4.
   *
   * Não confundir com `facetStiffness`, que é o `kfacet` do mesmo paper e faz
   * outra coisa: `kfacet` é a dobradiça das diagonais de triangulação, e impede
   * uma face poligonal de **vergar** ao longo da diagonal. `kface` é uma mola
   * sobre cada ângulo interno de cada triângulo, e impede o triângulo de
   * **cortar** — de deslizar sobre si próprio mantendo os três lados.
   *
   * Uma barra fixa comprimentos, uma dobradiça fixa o ângulo entre faces, e
   * nenhuma das duas fixa a forma de um triângulo no seu próprio plano. Num
   * triângulo equilátero isso quase não importa; num triângulo fino o modo de
   * corte é quase livre, e é por isso que o paper diz que estas restrições
   * servem sobretudo para «high-aspect-ratio triangles».
   *
   * **Zero por omissão, e é uma decisão e não um esquecimento.** Os seis
   * modelos autorados aqui não têm triângulos finos e os seus assets estão
   * gravados e verificados; ligar isto por omissão mudava-lhes a geometria sem
   * que ninguém tivesse pedido. Quem importa um padrão de vincos real liga-o —
   * `0,2` é o valor que o paper usa em todas as configurações que reporta.
   */
  readonly faceAngleStiffness: number;
  /** `0` sem amortecimento, `1` criticamente amortecido. */
  readonly dampingRatio: number;
  /**
   * Passos de projeção de comprimento por passo de integração.
   *
   * Zero desliga a projeção e deixa a inextensibilidade a cargo das molas
   * axiais — o modelo puro do OrigamiSimulator, útil para comparar.
   */
  readonly lengthProjectionIterations: number;
};

export const DEFAULT_SOLVER_OPTIONS: SolverOptions = {
  integrator: "semi-implicit-euler",
  dt: 0.35,
  axialStiffness: 20,
  creaseStiffness: 6,
  facetStiffness: 18,
  faceAngleStiffness: 0,
  dampingRatio: 0.45,
  lengthProjectionIterations: 8,
};

type Beam = {
  readonly a: number;
  readonly b: number;
  readonly restLength: number;
  readonly stiffness: number;
  readonly damping: number;
};

type Hinge = {
  readonly p1: number;
  readonly p2: number;
  readonly apexA: number;
  readonly apexB: number;
  readonly stiffness: number;
};

/** Um ângulo interior de um triângulo, com o valor que tinha na folha plana. */
type Corner = {
  readonly apex: number;
  readonly a: number;
  readonly b: number;
  readonly restAngle: number;
  readonly stiffness: number;
};

export type SolverState = {
  readonly mesh: OrigamiMesh;
  readonly options: SolverOptions;
  readonly count: number;
  readonly positions: Float64Array;
  readonly previous: Float64Array;
  readonly velocities: Float64Array;
  readonly forces: Float64Array;
  readonly mass: Float64Array;
  readonly beams: readonly Beam[];
  readonly hinges: readonly Hinge[];
  readonly corners: readonly Corner[];
  time: number;
};

function readVec(buffer: Float64Array, index: number): Vec3 {
  const base = index * 3;
  return [buffer[base]!, buffer[base + 1]!, buffer[base + 2]!];
}

export function createSolverState(
  mesh: OrigamiMesh,
  overrides: Partial<SolverOptions> = {},
): SolverState {
  const options = { ...DEFAULT_SOLVER_OPTIONS, ...overrides };
  const count = mesh.restPositions.length;

  const positions = new Float64Array(count * 3);
  mesh.restPositions.forEach((point, index) => {
    positions[index * 3] = point[0];
    positions[index * 3 + 1] = point[1];
    positions[index * 3 + 2] = point[2];
  });

  const mass = new Float64Array(count);

  const beams: Beam[] = mesh.edges.map((edge) => {
    const [a, b] = edge.vertices;
    // `EA/L`: uma aresta curta é mais rígida do que uma longa feita do mesmo
    // papel. Sem isto, os triângulos pequenos de uma ponta comportam-se como
    // elásticos e a ponta oscila sozinha.
    const stiffness = options.axialStiffness / Math.max(edge.restLength, 1e-6);
    mass[a] += stiffness;
    mass[b] += stiffness;
    return { a, b, restLength: edge.restLength, stiffness, damping: 0 };
  });

  const hinges: Hinge[] = mesh.creases.map((crease) => {
    const isFacet = crease.assignment === "F";
    const restLength = mesh.edges[crease.edgeIndex]!.restLength;
    const stiffness =
      (isFacet ? options.facetStiffness : options.creaseStiffness) * restLength;

    // O que um vinco «pesa» num vértice é `kθ·|∇θ|²`, e `|∇θ|` é o inverso da
    // altura da face sobre a aresta. Avaliado na folha plana, uma vez.
    const rest = mesh.restPositions;
    const dihedral = dihedralAngleAndGradients({
      p1: rest[crease.p1]!,
      p2: rest[crease.p2]!,
      apexA: rest[crease.apexA]!,
      apexB: rest[crease.apexB]!,
    });
    const nodes = [crease.p1, crease.p2, crease.apexA, crease.apexB] as const;
    dihedral.gradients.forEach((gradient, slot) => {
      mass[nodes[slot]!] += stiffness * dot(gradient, gradient);
    });

    return {
      p1: crease.p1,
      p2: crease.p2,
      apexA: crease.apexA,
      apexB: crease.apexB,
      stiffness,
    };
  });

  // Três ângulos por triângulo. O de repouso é lido na folha plana, uma vez —
  // é a forma que o triângulo tem de conservar, e conservá-la é o que impede o
  // corte.
  const corners: Corner[] = [];
  if (options.faceAngleStiffness > 0) {
    const rest = mesh.restPositions;
    for (const triangle of mesh.triangles) {
      const [i, j, k] = triangle.indices;
      for (const [apex, a, b] of [
        [i, j, k],
        [j, k, i],
        [k, i, j],
      ] as const) {
        const corner = cornerAngleAndGradients({
          apex: rest[apex]!,
          a: rest[a]!,
          b: rest[b]!,
        });

        const nodes = [apex, a, b] as const;
        corner.gradients.forEach((gradient, slot) => {
          mass[nodes[slot]!] +=
            options.faceAngleStiffness * dot(gradient, gradient);
        });

        corners.push({
          apex,
          a,
          b,
          restAngle: corner.angle,
          stiffness: options.faceAngleStiffness,
        });
      }
    }
  }

  // Um nó sem nada ligado não existe num modelo válido, mas uma divisão por
  // zero num passo de integração propaga NaN por toda a malha em três frames.
  for (let index = 0; index < count; index += 1) {
    if (mass[index]! < 1e-9) mass[index] = 1;
  }

  const dampedBeams = beams.map((beam) => ({
    ...beam,
    damping:
      options.dampingRatio *
      2 *
      Math.sqrt(beam.stiffness * ((mass[beam.a]! + mass[beam.b]!) / 2)),
  }));

  return {
    mesh,
    options,
    count,
    positions,
    previous: Float64Array.from(positions),
    velocities: new Float64Array(count * 3),
    forces: new Float64Array(count * 3),
    mass,
    beams: dampedBeams,
    hinges,
    corners,
    time: 0,
  };
}

function accumulateBeamForces(state: SolverState): void {
  const { positions, velocities, forces } = state;

  for (const beam of state.beams) {
    const a = beam.a * 3;
    const b = beam.b * 3;

    const dx = positions[b]! - positions[a]!;
    const dy = positions[b + 1]! - positions[a + 1]!;
    const dz = positions[b + 2]! - positions[a + 2]!;
    const length = Math.hypot(dx, dy, dz);
    if (length < 1e-9) continue;

    const nx = dx / length;
    const ny = dy / length;
    const nz = dz / length;

    const relative =
      (velocities[b]! - velocities[a]!) * nx +
      (velocities[b + 1]! - velocities[a + 1]!) * ny +
      (velocities[b + 2]! - velocities[a + 2]!) * nz;

    const magnitude =
      beam.stiffness * (length - beam.restLength) + beam.damping * relative;

    forces[a] += magnitude * nx;
    forces[a + 1] += magnitude * ny;
    forces[a + 2] += magnitude * nz;
    forces[b] -= magnitude * nx;
    forces[b + 1] -= magnitude * ny;
    forces[b + 2] -= magnitude * nz;
  }
}

/**
 * Momento de cada dobradiça, distribuído pelos quatro vértices.
 *
 * Os alvos chegam de fora, um por dobradiça, e não vivem na dobradiça. É o que
 * permite ao bake conduzir o modelo por etapas: dobrar papel a sério raramente
 * é levar todos os vincos ao destino ao mesmo tempo, e a caixa é o exemplo — as
 * paredes sobem primeiro, e só depois é que a aba do canto se deita.
 */
function accumulateHingeForces(
  state: SolverState,
  targets: Float64Array,
): void {
  const { positions, forces } = state;

  state.hinges.forEach((hinge, hingeIndex) => {
    const dihedral = dihedralAngleAndGradients({
      p1: readVec(positions, hinge.p1),
      p2: readVec(positions, hinge.p2),
      apexA: readVec(positions, hinge.apexA),
      apexB: readVec(positions, hinge.apexB),
    });

    const moment =
      hinge.stiffness * wrapAngle(targets[hingeIndex]! - dihedral.angle);

    const nodes = [hinge.p1, hinge.p2, hinge.apexA, hinge.apexB] as const;
    for (let slot = 0; slot < 4; slot += 1) {
      const gradient = dihedral.gradients[slot]!;
      const base = nodes[slot]! * 3;
      forces[base] += gradient[0] * moment;
      forces[base + 1] += gradient[1] * moment;
      forces[base + 2] += gradient[2] * moment;
    }
  });
}

/**
 * A força que impede um triângulo de cortar.
 *
 * Cada ângulo interior puxa de volta ao valor que tinha na folha plana, com a
 * mesma forma das outras duas restrições: `F = k(α₀ − α)·∇α`. O alvo não vem de
 * fora como nas dobradiças — é uma propriedade da folha e não da dobragem, e
 * por isso vive na própria restrição.
 */
function accumulateCornerForces(state: SolverState): void {
  const { positions, forces } = state;

  for (const corner of state.corners) {
    const result = cornerAngleAndGradients({
      apex: readVec(positions, corner.apex),
      a: readVec(positions, corner.a),
      b: readVec(positions, corner.b),
    });

    const moment = corner.stiffness * (corner.restAngle - result.angle);
    const nodes = [corner.apex, corner.a, corner.b] as const;

    for (let slot = 0; slot < 3; slot += 1) {
      const gradient = result.gradients[slot]!;
      const base = nodes[slot]! * 3;
      forces[base] += gradient[0] * moment;
      forces[base + 1] += gradient[1] * moment;
      forces[base + 2] += gradient[2] * moment;
    }
  }
}

/**
 * Amortecimento proporcional à massa.
 *
 * Com a massa escolhida acima, a frequência natural é ≈1 em todo o lado, e
 * `F = −2ζm·v` amortece todos os modos por igual. Sem isto o modelo oscila para
 * sempre em torno da forma certa: o bake nunca converge e o critério de paragem
 * nunca dispara.
 */
function accumulateDamping(state: SolverState): void {
  const { forces, velocities, mass, options } = state;
  const coefficient = 2 * options.dampingRatio;

  for (let index = 0; index < state.count; index += 1) {
    const base = index * 3;
    const factor = coefficient * mass[index]!;
    forces[base] -= factor * velocities[base]!;
    forces[base + 1] -= factor * velocities[base + 1]!;
    forces[base + 2] -= factor * velocities[base + 2]!;
  }
}

/**
 * Projeção de comprimento: o papel deixa de esticar por construção.
 *
 * Esta é a alteração mais importante em relação ao modelo do OrigamiSimulator,
 * e vale a pena explicar porquê, porque não é uma otimização — é uma correção
 * de fundo.
 *
 * Escalar todos os ângulos-alvo pelo mesmo `progress` **não descreve um
 * caminho isométrico**. A meio da rampa, «metade de cada ângulo» é uma
 * combinação que aquela folha não consegue assumir sem esticar. Num modelo só
 * de molas, quem paga essa contradição é o comprimento das arestas: mediu-se
 * 9% de deformação na caixa, e o gate deste produto é 0,25%. O OrigamiSimulator
 * vive bem com isso — tem uma visualização de strain precisamente porque o
 * strain é grande e interessa vê-lo. Aqui não serve: o que sai deste solver vai
 * ser assado e mostrado como resultado final.
 *
 * A alternativa correta não é subir a rigidez axial — isso torna o sistema mais
 * rígido, obriga a um passo menor e multiplica o custo por um fator de dezenas
 * sem nunca chegar a zero. É tratar a inextensibilidade como aquilo que
 * fisicamente é: uma **restrição**, não uma força. Depois de cada passo de
 * integração, cada aresta é reposta no seu comprimento por Gauss-Seidel, com a
 * correção distribuída pelo inverso das massas.
 *
 * O efeito é o que se quer: os vincos ficam livres para puxar com força — e
 * portanto para dobrar depressa — enquanto o comprimento das arestas se mantém
 * onde tem de estar. O caminho que o modelo segue passa a ser o caminho
 * isométrico mais próximo do que os ângulos pedem, que é exatamente o que
 * dobrar papel é.
 */
function projectEdgeLengths(state: SolverState): void {
  const { positions, mass, options } = state;

  for (
    let iteration = 0;
    iteration < options.lengthProjectionIterations;
    iteration += 1
  ) {
    for (const beam of state.beams) {
      const a = beam.a * 3;
      const b = beam.b * 3;

      const dx = positions[b]! - positions[a]!;
      const dy = positions[b + 1]! - positions[a + 1]!;
      const dz = positions[b + 2]! - positions[a + 2]!;
      const length = Math.hypot(dx, dy, dz);
      if (length < 1e-9) continue;

      const inverseA = 1 / mass[beam.a]!;
      const inverseB = 1 / mass[beam.b]!;
      const total = inverseA + inverseB;
      if (total < 1e-12) continue;

      const correction = (length - beam.restLength) / length;
      const shareA = (inverseA / total) * correction;
      const shareB = (inverseB / total) * correction;

      positions[a] += dx * shareA;
      positions[a + 1] += dy * shareA;
      positions[a + 2] += dz * shareA;
      positions[b] -= dx * shareB;
      positions[b + 1] -= dy * shareB;
      positions[b + 2] -= dz * shareB;
    }
  }
}

export function step(state: SolverState, targets: Float64Array): void {
  state.forces.fill(0);
  accumulateBeamForces(state);
  accumulateHingeForces(state, targets);
  accumulateCornerForces(state);
  accumulateDamping(state);

  const { positions, velocities, forces, mass, previous, options } = state;
  const dt = options.dt;

  previous.set(positions);

  if (options.integrator === "verlet") {
    // Verlet sem velocidade explícita: a velocidade é a diferença entre
    // posições, e é recuperada depois da projeção como em qualquer integrador
    // baseado em posições.
    for (let index = 0; index < state.count; index += 1) {
      const inverseMass = 1 / mass[index]!;
      for (let axis = 0; axis < 3; axis += 1) {
        const slot = index * 3 + axis;
        positions[slot] +=
          velocities[slot]! * dt + forces[slot]! * inverseMass * dt * dt;
      }
    }
  } else {
    for (let index = 0; index < state.count; index += 1) {
      const inverseMass = 1 / mass[index]!;
      for (let axis = 0; axis < 3; axis += 1) {
        const slot = index * 3 + axis;
        velocities[slot] += forces[slot]! * inverseMass * dt;
        positions[slot] += velocities[slot]! * dt;
      }
    }
  }

  if (options.lengthProjectionIterations > 0) {
    projectEdgeLengths(state);

    // A velocidade tem de incluir o que a projeção fez. Sem isto, o passo
    // seguinte volta a empurrar na direção que a restrição acabou de anular e o
    // sistema entra num ciclo que nunca assenta.
    for (let slot = 0; slot < positions.length; slot += 1) {
      velocities[slot] = (positions[slot]! - previous[slot]!) / dt;
    }
  }

  state.time += dt;
}

/**
 * O maior passo que um vértice ainda dá, em unidades do modelo.
 *
 * É este — e não a energia cinética — o critério de «já assentou». A energia
 * depende da massa, a massa depende da rigidez, e a rigidez varia por duas
 * ordens de grandeza entre modelos: um limiar absoluto de energia dispara
 * imediatamente num modelo pesado e nunca dispara num leve. Um deslocamento
 * compara-se com o tamanho da folha, que é sempre 1.
 */
export function maxDisplacementPerStep(state: SolverState): number {
  let maximum = 0;
  for (let index = 0; index < state.count; index += 1) {
    const base = index * 3;
    maximum = Math.max(
      maximum,
      Math.hypot(
        state.velocities[base]!,
        state.velocities[base + 1]!,
        state.velocities[base + 2]!,
      ),
    );
  }
  return maximum * state.options.dt;
}

/** Energia cinética total. Diagnóstico, não critério de paragem. */
export function kineticEnergy(state: SolverState): number {
  let total = 0;
  for (let index = 0; index < state.count; index += 1) {
    const base = index * 3;
    const speedSquared =
      state.velocities[base]! ** 2 +
      state.velocities[base + 1]! ** 2 +
      state.velocities[base + 2]! ** 2;
    total += 0.5 * state.mass[index]! * speedSquared;
  }
  return total;
}

/** O maior desvio angular entre um vinco e o seu alvo, em radianos. */
export function maxAngleError(
  state: SolverState,
  targets: Float64Array,
): number {
  let maximum = 0;
  state.hinges.forEach((hinge, hingeIndex) => {
    const { angle } = dihedralAngleAndGradients({
      p1: readVec(state.positions, hinge.p1),
      p2: readVec(state.positions, hinge.p2),
      apexA: readVec(state.positions, hinge.apexA),
      apexB: readVec(state.positions, hinge.apexB),
    });
    maximum = Math.max(
      maximum,
      Math.abs(wrapAngle(targets[hingeIndex]! - angle)),
    );
  });
  return maximum;
}

/** Os ângulos diedros atuais, um por dobradiça. */
export function readHingeAngles(state: SolverState): Float64Array {
  const angles = new Float64Array(state.hinges.length);
  state.hinges.forEach((hinge, hingeIndex) => {
    angles[hingeIndex] = dihedralAngleAndGradients({
      p1: readVec(state.positions, hinge.p1),
      p2: readVec(state.positions, hinge.p2),
      apexA: readVec(state.positions, hinge.apexA),
      apexB: readVec(state.positions, hinge.apexB),
    }).angle;
  });
  return angles;
}

export function hasDiverged(state: SolverState): boolean {
  for (let index = 0; index < state.positions.length; index += 1) {
    if (!Number.isFinite(state.positions[index]!)) return true;
  }
  return false;
}

export function readPositions(state: SolverState): Vec3[] {
  const points: Vec3[] = [];
  for (let index = 0; index < state.count; index += 1) {
    points.push(readVec(state.positions, index));
  }
  return points;
}
