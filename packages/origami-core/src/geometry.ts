import type { Vec3 } from "./fold-types";

/**
 * A matemática de que tudo o resto depende.
 *
 * Um vinco não é uma linha: é a relação entre duas faces que partilham uma
 * aresta. O número que a descreve é o **ângulo diedro**, e a força que a
 * corrige é o gradiente desse ângulo em relação aos quatro vértices envolvidos.
 * Se este ficheiro estiver errado por um sinal, o modelo dobra para o lado
 * errado a meio da animação e nenhum teste de topologia apanha isso — a
 * topologia continua perfeita enquanto a forma se vira do avesso.
 *
 * Por isso a convenção está fixada aqui, verificada por diferenças finitas em
 * `tests/geometry.test.ts`, e não descoberta por tentativa até «parecer certo».
 */

export const EPSILON = 1e-9;

/**
 * Traz uma diferença de ângulos para `(-π, π]`.
 *
 * Sem isto, um vinco quase fechado é ingovernável. O ângulo diedro vive em
 * `(-π, π]`, portanto uma dobra com alvo `+178°` que passe dos `180°` reaparece
 * em `−179°` — e a diferença ingénua `alvo − atual` dá `357°`, um momento
 * enorme a empurrar pelo caminho mais longo. O vinco roda, volta a passar, e o
 * modelo entra numa rotação que nunca assenta. Com o embrulho, os mesmos dois
 * ângulos estão a `3°` um do outro, que é a verdade.
 */
export function wrapAngle(value: number): number {
  return Math.atan2(Math.sin(value), Math.cos(value));
}

export function subtract(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function scale(a: Vec3, k: number): Vec3 {
  return [a[0] * k, a[1] * k, a[2] * k];
}

export function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

export function norm(a: Vec3): number {
  return Math.hypot(a[0], a[1], a[2]);
}

export function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

export function normalize(a: Vec3): Vec3 {
  const length = norm(a);
  if (length < EPSILON) return [0, 0, 0];
  return [a[0] / length, a[1] / length, a[2] / length];
}

export function triangleArea(a: Vec3, b: Vec3, c: Vec3): number {
  return norm(cross(subtract(b, a), subtract(c, a))) / 2;
}

/** Normal não normalizada; o seu comprimento é o dobro da área. */
export function triangleNormal(a: Vec3, b: Vec3, c: Vec3): Vec3 {
  return cross(subtract(b, a), subtract(c, a));
}

/**
 * Qualidade do triângulo, `1` no equilátero e `0` no degenerado.
 *
 * O próprio OrigamiSimulator avisa que triângulos compridos e estreitos tornam
 * os padrões instáveis: a rigidez do vinco depende da altura da face, e uma
 * altura quase nula transforma uma força pequena numa rotação enorme. Medir
 * isto no compilador é mais barato do que descobri-lo como tremor na animação.
 *
 * `q = 4√3·A / (a² + b² + c²)`
 */
export function triangleQuality(a: Vec3, b: Vec3, c: Vec3): number {
  const ab = distance(a, b);
  const bc = distance(b, c);
  const ca = distance(c, a);
  const sumOfSquares = ab * ab + bc * bc + ca * ca;
  if (sumOfSquares < EPSILON) return 0;
  return (4 * Math.sqrt(3) * triangleArea(a, b, c)) / sumOfSquares;
}

/**
 * Os quatro vértices de um vinco, na ordem que esta convenção exige.
 *
 * `p1`→`p2` é a aresta partilhada. `apexA` é o vértice oposto na primeira face
 * e `apexB` o da segunda. A ordem importa: trocar `apexA` com `apexB` inverte o
 * sinal do ângulo, que é exatamente a diferença entre mountain e valley.
 */
export type CreaseVertices = {
  readonly p1: Vec3;
  readonly p2: Vec3;
  readonly apexA: Vec3;
  readonly apexB: Vec3;
};

export type DihedralResult = {
  /** Radianos em `(-π, π]`. Zero é plano. */
  readonly angle: number;
  /** `∂θ/∂p1`, `∂θ/∂p2`, `∂θ/∂apexA`, `∂θ/∂apexB`, nesta ordem. */
  readonly gradients: readonly [Vec3, Vec3, Vec3, Vec3];
};

/**
 * O ângulo diedro e o seu gradiente exato.
 *
 * ## A convenção de sinal
 *
 * Com a aresta `e = p2 − p1` e as normais
 *
 * ```text
 * nA = e × (apexA − p1)
 * nB = (apexB − p1) × e
 * ```
 *
 * ambas apontam para `+z` quando a folha está plana no plano `z = 0` com os
 * vértices na ordem esperada. O ângulo é
 *
 * ```text
 * θ = atan2( (n̂B × n̂A) · ê , n̂A · n̂B )
 * ```
 *
 * e o sinal fica assim: **θ positivo quando os vértices opostos sobem para
 * `+z`** — que é o lado de onde se olha para a frente do papel. É a definição
 * de valley, e é por isso que `V` exige ângulo positivo e `M` negativo.
 *
 * ## Os gradientes
 *
 * Deslocar um vértice oposto na direção da normal da sua face roda a face em
 * torno da aresta, e a taxa é o inverso da altura dessa face sobre a aresta:
 *
 * ```text
 * ∇_apexA θ = n̂A / hA = L·nA / |nA|²      (hA = |nA| / L)
 * ```
 *
 * Os vértices da própria aresta recebem o que sobra, ponderado pela projeção de
 * cada ápice sobre a aresta. Não é uma aproximação por conveniência: é o que
 * garante que a soma dos quatro gradientes é zero, ou seja, que uma translação
 * rígida não gera momento. Um vinco que empurrasse só os dois vértices opostos
 * — a simplificação tentadora — acelera o modelo inteiro e estica a aresta.
 */
export type CornerVertices = {
  /** O vértice onde o ângulo é medido. */
  readonly apex: Vec3;
  readonly a: Vec3;
  readonly b: Vec3;
};

export type CornerResult = {
  readonly angle: number;
  /** Na ordem `[apex, a, b]`. */
  readonly gradients: readonly [Vec3, Vec3, Vec3];
};

/**
 * O ângulo interior de um triângulo, e o seu gradiente exato.
 *
 * É a §2.4 do paper da Ghassaei — a restrição que faltava aqui, e cuja falta se
 * viu no grou tradicional: sem ela a malha **corta** em vez de dobrar, e a
 * medição foi 34% de deformação com os vincos ainda a 85° do alvo.
 *
 * A barra impede uma aresta de mudar de comprimento e a dobradiça impede duas
 * faces de se afastarem do ângulo pedido. Nenhuma das duas impede um triângulo
 * de **deslizar sobre si próprio** mantendo os três lados: é o modo de corte, e
 * num triângulo fino ele é quase livre. O paper diz exatamente isto — as
 * restrições de face existem para «prevent shearing of the folding surface,
 * especially for high-aspect-ratio triangles» — e um padrão de vincos real está
 * cheio deles.
 *
 * ## A convenção de sinal
 *
 * Com `u = a − apex`, `v = b − apex` e a normal `n̂ = û × v̂`:
 *
 * ```text
 * ∇_a θ = −(n̂ × u) / |u|²
 * ```
 *
 * `n̂ × u` aponta *para* `v`, portanto o sinal negativo diz que afastar `a` de
 * `b` aumenta o ângulo — que é o que a palavra «ângulo» quer dizer. O gradiente
 * em `b` é simétrico, e o do vértice do ângulo é o que sobra, para que a soma
 * dos três seja zero: uma translação rígida não pode gerar força.
 *
 * Verificado por diferenças finitas, como o ângulo diedro. Um sinal trocado
 * aqui não falha nenhum invariante — deforma a malha na direção errada e o
 * modelo assenta torto, que é a classe de defeito mais cara deste ficheiro.
 */
export function cornerAngleAndGradients(
  vertices: CornerVertices,
): CornerResult {
  const { apex, a, b } = vertices;

  const u = subtract(a, apex);
  const v = subtract(b, apex);
  const lengthU = norm(u);
  const lengthV = norm(v);

  const flat: CornerResult = {
    angle: 0,
    gradients: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
  };

  if (lengthU < EPSILON || lengthV < EPSILON) return flat;

  const normal = cross(u, v);
  const normalLength = norm(normal);
  // Colinear: o ângulo é 0 ou π e o gradiente não está definido — não há plano
  // em que rodar. Devolver zero é preferível a propagar NaN pela malha toda.
  if (normalLength < EPSILON) return flat;

  const angle = Math.atan2(normalLength, dot(u, v));
  const unitNormal = scale(normal, 1 / normalLength);

  const gradientA = scale(cross(unitNormal, u), -1 / (lengthU * lengthU));
  const gradientB = scale(cross(unitNormal, v), 1 / (lengthV * lengthV));

  return {
    angle,
    gradients: [
      [
        -(gradientA[0] + gradientB[0]),
        -(gradientA[1] + gradientB[1]),
        -(gradientA[2] + gradientB[2]),
      ],
      gradientA,
      gradientB,
    ],
  };
}

export function dihedralAngleAndGradients(
  vertices: CreaseVertices,
): DihedralResult {
  const { p1, p2, apexA, apexB } = vertices;

  const edge = subtract(p2, p1);
  const edgeLength = norm(edge);

  const flat: DihedralResult = {
    angle: 0,
    gradients: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
  };

  if (edgeLength < EPSILON) return flat;

  const unitEdge = scale(edge, 1 / edgeLength);
  const normalA = cross(edge, subtract(apexA, p1));
  const normalB = cross(subtract(apexB, p1), edge);

  const lengthA = norm(normalA);
  const lengthB = norm(normalB);

  // Uma face colapsada não define um plano, portanto não define um ângulo. É
  // preferível devolver zero e deixar o gate de triângulos degenerados falhar
  // com uma mensagem exata a produzir um NaN que se propaga pelo solver todo.
  if (lengthA < EPSILON || lengthB < EPSILON) return flat;

  const unitA = scale(normalA, 1 / lengthA);
  const unitB = scale(normalB, 1 / lengthB);

  const angle = Math.atan2(
    dot(cross(unitB, unitA), unitEdge),
    dot(unitA, unitB),
  );

  // ∇θ em relação a cada ápice: L·n / |n|².
  const gradientA = scale(normalA, edgeLength / (lengthA * lengthA));
  const gradientB = scale(normalB, edgeLength / (lengthB * lengthB));

  // Onde cai o pé da perpendicular de cada ápice sobre a aresta, em unidades
  // do comprimento da aresta. Zero é sobre `p1`, um é sobre `p2`.
  const squaredEdge = edgeLength * edgeLength;
  const weightA = dot(subtract(apexA, p1), edge) / squaredEdge;
  const weightB = dot(subtract(apexB, p1), edge) / squaredEdge;

  const gradientP1 = add(
    scale(gradientA, weightA - 1),
    scale(gradientB, weightB - 1),
  );
  const gradientP2 = add(
    scale(gradientA, -weightA),
    scale(gradientB, -weightB),
  );

  return {
    angle,
    gradients: [gradientP1, gradientP2, gradientA, gradientB],
  };
}

/**
 * Interseção triângulo-triângulo em 3D, pelo método dos intervalos de Möller.
 *
 * Serve um único propósito: apanhar o modelo que atravessa o próprio papel. Um
 * origami tem camadas que se tocam e se encostam — o que não pode acontecer é
 * uma face passar *através* de outra, e essa é a diferença entre uma dobra
 * possível e uma imagem que só existe porque nada a impediu.
 *
 * Triângulos que partilham um vértice são ignorados por quem chama: são
 * vizinhos legítimos, e testá-los produziria um falso positivo em cada vinco.
 */
export function trianglesIntersect(
  a0: Vec3,
  a1: Vec3,
  a2: Vec3,
  b0: Vec3,
  b1: Vec3,
  b2: Vec3,
  tolerance = 1e-6,
): boolean {
  const rawA = triangleNormal(a0, a1, a2);
  const rawB = triangleNormal(b0, b1, b2);
  const lengthA = norm(rawA);
  const lengthB = norm(rawB);

  // Um triângulo degenerado não define um plano. O gate de qualidade apanha-o
  // com uma mensagem útil; aqui não se inventa uma resposta.
  if (lengthA < EPSILON || lengthB < EPSILON) return false;

  // Normais unitárias, para que `tolerance` seja uma distância em unidades do
  // modelo e não um número que muda de significado com a área do triângulo.
  // Era esta a origem de falsos positivos numa folha quase plana: as
  // distâncias ao plano vinham escaladas pela área e nunca caíam dentro da
  // tolerância de coplanaridade.
  const normalA = scale(rawA, 1 / lengthA);
  const normalB = scale(rawB, 1 / lengthB);

  // Planos paralelos. Ou são o mesmo plano — duas camadas de papel encostadas,
  // que é o estado normal de um origami dobrado — ou estão separados e nunca se
  // encontram. Em nenhum dos casos há travessia, e o eixo de separação que o
  // método usa a seguir seria um vetor nulo.
  if (norm(cross(normalA, normalB)) < 1e-7) return false;

  const offsetB = -dot(normalB, b0);
  const distancesA = [
    dot(normalB, a0) + offsetB,
    dot(normalB, a1) + offsetB,
    dot(normalB, a2) + offsetB,
  ];

  const offsetA = -dot(normalA, a0);
  const distancesB = [
    dot(normalA, b0) + offsetA,
    dot(normalA, b1) + offsetA,
    dot(normalA, b2) + offsetA,
  ];

  /**
   * Atravessar é ter vértices dos **dois** lados do plano do outro.
   *
   * Tocar não conta, e a distinção não é um detalhe: numa folha dobrada os
   * triângulos encostam-se uns aos outros o tempo todo, e um vértice pousado
   * exatamente no plano do vizinho é o caso normal, não a exceção. Tratar isso
   * como travessia dava dois falsos positivos já na folha lisa — dois
   * triângulos que se tocavam num vértice do vinco e mais nada.
   */
  const straddles = (distances: readonly number[]): boolean =>
    distances.some((d) => d > tolerance) &&
    distances.some((d) => d < -tolerance);

  if (!straddles(distancesA) || !straddles(distancesB)) return false;

  const direction = cross(normalA, normalB);
  const axis = [
    Math.abs(direction[0]),
    Math.abs(direction[1]),
    Math.abs(direction[2]),
  ].reduce(
    (best, value, index, all) => (value > all[best]! ? index : best),
    0,
  ) as 0 | 1 | 2;

  const intervalOf = (
    points: readonly [Vec3, Vec3, Vec3],
    distances: readonly number[],
  ): readonly [number, number] | null => {
    const projected = points.map((point) => point[axis]);

    // O vértice isolado é o que fica sozinho de um lado; os dois segmentos que
    // saem dele são os que furam o plano. Com a travessia já garantida acima,
    // há sempre exatamente um positivo ou exatamente um negativo.
    const positives = distances.filter((d) => d > tolerance).length;
    const isolated =
      positives === 1
        ? distances.findIndex((d) => d > tolerance)
        : distances.findIndex((d) => d < -tolerance);
    if (isolated < 0) return null;

    const others = [0, 1, 2].filter((index) => index !== isolated);
    const crossings: number[] = [];
    for (const other of others) {
      const denominator = distances[isolated]! - distances[other]!;
      if (Math.abs(denominator) < tolerance) {
        crossings.push(projected[other]!);
        continue;
      }
      crossings.push(
        projected[isolated]! +
          (projected[other]! - projected[isolated]!) *
            (distances[isolated]! / denominator),
      );
    }

    return [
      Math.min(crossings[0]!, crossings[1]!),
      Math.max(crossings[0]!, crossings[1]!),
    ];
  };

  const intervalA = intervalOf([a0, a1, a2], distancesA);
  const intervalB = intervalOf([b0, b1, b2], distancesB);
  if (!intervalA || !intervalB) return false;

  return (
    intervalA[0] <= intervalB[1] - tolerance &&
    intervalB[0] <= intervalA[1] - tolerance
  );
}
