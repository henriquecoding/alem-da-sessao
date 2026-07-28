import { describe, expect, it } from "vitest";
import {
  buildMesh,
  dihedralAngleAndGradients,
  triangleQuality,
  triangulatePolygon,
  trianglesIntersect,
  wrapAngle,
  type FoldSource,
  type Vec3,
} from "@alem-da-sessao/origami-core";

/**
 * A matemática, verificada e não assumida.
 *
 * Um sinal trocado no gradiente do ângulo diedro não falha nenhum invariante de
 * topologia: a folha continua íntegra, as arestas continuam a ter duas faces, e
 * o modelo dobra para o lado errado. É o defeito mais caro deste sistema e o
 * único que nenhuma captura de ecrã apanha depressa — por isso é o único que
 * tem um teste que compara a derivada analítica com a numérica.
 */

const FLAT = {
  p1: [0, 0, 0],
  p2: [1, 0, 0],
  apexA: [0, 1, 0],
  apexB: [0, -1, 0],
} as const satisfies Record<string, Vec3>;

describe("ângulo diedro", () => {
  it("dá zero na folha plana", () => {
    expect(dihedralAngleAndGradients(FLAT).angle).toBeCloseTo(0, 12);
  });

  it("dá ângulo positivo quando o papel dobra para o observador", () => {
    // `V` é positivo por convenção FOLD, e a convenção só serve se o sinal
    // corresponder ao gesto: erguer os vértices opostos para +z é um vale.
    const phi = 0.4;
    const { angle } = dihedralAngleAndGradients({
      ...FLAT,
      apexB: [0, -Math.cos(phi), Math.sin(phi)],
    });
    expect(angle).toBeCloseTo(phi, 9);
  });

  it("dá ângulo negativo quando dobra para o lado oposto", () => {
    const phi = 0.4;
    const { angle } = dihedralAngleAndGradients({
      ...FLAT,
      apexB: [0, -Math.cos(phi), -Math.sin(phi)],
    });
    expect(angle).toBeCloseTo(-phi, 9);
  });

  /**
   * O teste que importa.
   *
   * Perturba cada uma das doze coordenadas e compara a derivada central com o
   * gradiente analítico. Se algum sinal estiver trocado, ou se a distribuição
   * pelos vértices da aresta estiver errada, isto falha — e falha a apontar
   * para o vértice e o eixo exatos.
   */
  it("tem gradiente que bate com a derivada numérica", () => {
    const configuration: Record<string, Vec3> = {
      p1: [0.1, -0.05, 0.02],
      p2: [1.05, 0.08, -0.03],
      apexA: [0.3, 0.9, 0.35],
      apexB: [0.42, -0.85, 0.18],
    };

    const slots = ["p1", "p2", "apexA", "apexB"] as const;
    const analytic = dihedralAngleAndGradients(
      configuration as never,
    ).gradients;
    const h = 1e-6;

    slots.forEach((slot, slotIndex) => {
      for (let axis = 0; axis < 3; axis += 1) {
        const shift = (delta: number) => {
          const moved = [...configuration[slot]!] as [number, number, number];
          moved[axis] += delta;
          return dihedralAngleAndGradients({
            ...configuration,
            [slot]: moved,
          } as never).angle;
        };

        const numeric = (shift(h) - shift(-h)) / (2 * h);
        expect(numeric, `∂θ/∂${slot}[${axis}]`).toBeCloseTo(
          analytic[slotIndex]![axis]!,
          5,
        );
      }
    });
  });

  /**
   * Invariância a translações.
   *
   * Se a soma dos quatro gradientes não for zero, mover o modelo inteiro gera
   * momento — o vinco empurra o objeto pelo espaço em vez de o dobrar. É o
   * sintoma da aproximação tentadora: empurrar só os dois vértices opostos.
   */
  it("tem gradientes que somam zero", () => {
    const { gradients } = dihedralAngleAndGradients({
      p1: [0.1, -0.05, 0.02],
      p2: [1.05, 0.08, -0.03],
      apexA: [0.3, 0.9, 0.35],
      apexB: [0.42, -0.85, 0.18],
    });

    for (let axis = 0; axis < 3; axis += 1) {
      const total = gradients.reduce(
        (sum, gradient) => sum + gradient[axis]!,
        0,
      );
      expect(total).toBeCloseTo(0, 10);
    }
  });

  it("devolve zero em vez de NaN quando uma face colapsa", () => {
    const result = dihedralAngleAndGradients({
      p1: [0, 0, 0],
      p2: [1, 0, 0],
      apexA: [0.5, 0, 0],
      apexB: [0, -1, 0],
    });
    expect(Number.isFinite(result.angle)).toBe(true);
    expect(result.angle).toBe(0);
  });
});

describe("embrulho de ângulos", () => {
  it("leva a diferença pelo caminho curto", () => {
    const target = (178 * Math.PI) / 180;
    const current = (-179 * Math.PI) / 180;
    // Sem embrulho, isto seriam 357°: um momento enorme na direção errada, e o
    // modelo entra numa rotação que nunca assenta.
    expect(Math.abs(wrapAngle(target - current))).toBeLessThan(
      (4 * Math.PI) / 180,
    );
  });
});

describe("triangulação", () => {
  it("corta um quadrado em dois", () => {
    const square: Vec3[] = [
      [0, 0, 0],
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
    ];
    expect(triangulatePolygon(square)).toHaveLength(2);
  });

  /**
   * Um leque a partir do primeiro vértice produziria triângulos fora da face.
   * A caixa tem polígonos côncavos, e um triângulo fora da face é papel que não
   * existe.
   */
  it("não põe triângulos fora de um polígono côncavo", () => {
    const arrow: Vec3[] = [
      [0, 0, 0],
      [2, 0, 0],
      [2, 2, 0],
      [1, 1, 0],
      [0, 2, 0],
    ];
    const triangles = triangulatePolygon(arrow);
    expect(triangles).toHaveLength(3);

    const area = (a: Vec3, b: Vec3, c: Vec3) =>
      Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) /
      2;

    const total = triangles.reduce(
      (sum, [i, j, k]) => sum + area(arrow[i]!, arrow[j]!, arrow[k]!),
      0,
    );
    // Área da seta: quadrado 2×2 menos o entalhe triangular de área 1.
    expect(total).toBeCloseTo(3, 9);
  });

  it("recusa um polígono que se auto-interseta", () => {
    const bowtie: Vec3[] = [
      [0, 0, 0],
      [1, 1, 0],
      [1, 0, 0],
      [0, 1, 0],
    ];
    expect(() => triangulatePolygon(bowtie)).toThrow(/orelha/);
  });
});

describe("qualidade de triângulo", () => {
  it("dá 1 no equilátero", () => {
    expect(
      triangleQuality([0, 0, 0], [1, 0, 0], [0.5, Math.sqrt(3) / 2, 0]),
    ).toBeCloseTo(1, 9);
  });

  it("aproxima-se de zero num triângulo agulha", () => {
    expect(triangleQuality([0, 0, 0], [1, 0, 0], [0.5, 1e-4, 0])).toBeLessThan(
      0.01,
    );
  });
});

describe("auto-interseção", () => {
  it("apanha dois triângulos que se atravessam", () => {
    expect(
      trianglesIntersect(
        [-1, 0, 0],
        [1, 0, 0],
        [0, 1, 0],
        [0, 0.25, -1],
        [0, 0.25, 1],
        [0, 1.5, 0],
      ),
    ).toBe(true);
  });

  /**
   * Camadas encostadas são o estado normal de papel dobrado. Se isto desse
   * `true`, nenhum modelo dobrado passaria alguma vez o gate.
   */
  it("não conta camadas coplanares como travessia", () => {
    expect(
      trianglesIntersect(
        [0, 0, 0],
        [1, 0, 0],
        [0, 1, 0],
        [0.1, 0.1, 0],
        [0.6, 0.1, 0],
        [0.1, 0.6, 0],
      ),
    ).toBe(false);
  });

  /**
   * Tocar num vértice não é atravessar. Foi este caso que deu dois falsos
   * positivos na folha lisa — dois triângulos encostados ao mesmo vinco.
   */
  it("não conta um toque num vértice como travessia", () => {
    expect(
      trianglesIntersect(
        [0, 0, 0],
        [1, 0, 0],
        [0.5, 1, 0.4],
        [1, 0, 0],
        [2, 0, 0],
        [1.5, 1, -0.4],
      ),
    ).toBe(false);
  });
});

describe("construção da malha", () => {
  const source = {
    file_spec: 1.2,
    file_creator: "teste",
    file_author: "teste",
    file_title: "diagonal",
    file_classes: ["singleModel"],
    "ads:modelId": "half-fold",
    "ads:paper": {
      aspect: 1,
      uncut: true,
      frontFamily: "apricot",
      backFamily: "mist",
    },
    "ads:license": { id: "PROJETO", attribution: "teste" },
    vertices_coords: [
      [-0.5, -0.5, 0],
      [0.5, -0.5, 0],
      [0.5, 0.5, 0],
      [-0.5, 0.5, 0],
    ],
    edges_vertices: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [0, 2],
    ],
    edges_assignment: ["B", "B", "B", "B", "V"],
    edges_foldAngle: [null, null, null, null, 90],
    faces_vertices: [
      [0, 1, 2],
      [0, 2, 3],
    ],
  } as unknown as FoldSource;

  it("faz um vinco só da aresta interior", () => {
    const mesh = buildMesh(source);
    expect(mesh.creases).toHaveLength(1);
    expect(mesh.creases[0]!.assignment).toBe("V");
    expect(mesh.creases[0]!.targetAngle).toBeCloseTo(Math.PI / 2, 9);
  });

  it("dá quatro arestas de fronteira e nenhum vinco nelas", () => {
    const mesh = buildMesh(source);
    expect(mesh.boundaryEdges).toHaveLength(4);
    for (const index of mesh.boundaryEdges) {
      expect(mesh.edges[index]!.triangles).toHaveLength(1);
    }
  });

  it("guarda o comprimento de repouso de cada aresta", () => {
    const mesh = buildMesh(source);
    const diagonal = mesh.edges.find((edge) => edge.assignment === "V");
    expect(diagonal?.restLength).toBeCloseTo(Math.SQRT2, 9);
  });
});
