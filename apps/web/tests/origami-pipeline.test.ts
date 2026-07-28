import { describe, expect, it } from "vitest";
import {
  assertIsometric,
  authorFoldSource,
  bakeModel,
  buildMesh,
  maxEdgeStrain,
  OrigamiValidationError,
  stageFromConfiguration,
  validateFoldSource,
  type FoldSource,
  type FoldSourceMetadata,
  type Vec3,
} from "@alem-da-sessao/origami-core";

/**
 * O que substitui a contagem de polígonos.
 *
 * O teste antigo verificava que a figura tinha «pelo menos N polígonos». Um
 * desenho abstrato com dez triângulos passava. Estes verificam o que
 * efetivamente distingue papel dobrado de polígonos encostados — e, sobretudo,
 * verificam que cada defeito **falha pelo motivo certo**. Um validador que
 * rejeita tudo é tão inútil como um que aceita tudo; o que interessa é a
 * mensagem que ele dá a quem está a autorar.
 */

const METADATA: FoldSourceMetadata = {
  file_spec: 1.2,
  file_creator: "teste",
  file_author: "teste",
  file_title: "fixture",
  file_classes: ["singleModel"],
  "ads:modelId": "half-fold",
  "ads:paper": {
    aspect: 1,
    uncut: true,
    frontFamily: "apricot",
    backFamily: "mist",
  },
  "ads:license": { id: "PROJETO", attribution: "teste" },
};

/** Quadrado canónico com uma diagonal. A menor folha que dobra. */
function diagonalSource(overrides: Partial<FoldSource> = {}): FoldSource {
  return {
    ...METADATA,
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
    ...overrides,
  } as FoldSource;
}

function codeOf(run: () => unknown): string {
  try {
    run();
  } catch (error) {
    if (error instanceof OrigamiValidationError) return error.code;
    return `NÃO-VALIDAÇÃO: ${String(error)}`;
  }
  return "NÃO FALHOU";
}

describe("validador de FOLD", () => {
  it("aceita a folha canónica", () => {
    const report = validateFoldSource(diagonalSource());
    expect(report.sheetArea).toBeCloseTo(1, 9);
    expect(report.valleyCount).toBe(1);
    expect(report.warnings).toEqual([]);
  });

  it.each([
    [
      "uma folha que não é o quadrado canónico",
      "SHEET_NOT_SQUARE",
      {
        vertices_coords: [
          [-0.5, -0.5, 0],
          [0.3, -0.5, 0],
          [0.3, 0.5, 0],
          [-0.5, 0.5, 0],
        ],
      },
    ],
    [
      "um padrão de vincos que já não está plano",
      "SHEET_NOT_FLAT",
      {
        vertices_coords: [
          [-0.5, -0.5, 0],
          [0.5, -0.5, 0.2],
          [0.5, 0.5, 0],
          [-0.5, 0.5, 0],
        ],
      },
    ],
    [
      "um monte com ângulo positivo",
      "ANGLE_SIGN",
      { edges_assignment: ["B", "B", "B", "B", "M"] },
    ],
    [
      "um corte",
      "CUT_NOT_ALLOWED",
      { edges_assignment: ["B", "B", "B", "B", "C"] },
    ],
    [
      "um vinco por atribuir",
      "UNASSIGNED_EDGE",
      { edges_assignment: ["B", "B", "B", "B", "U"] },
    ],
    [
      "uma aresta interior com uma face só",
      "NON_MANIFOLD_EDGE",
      { faces_vertices: [[0, 1, 2]] },
    ],
    [
      "uma face que usa uma aresta não declarada",
      "MISSING_EDGE",
      {
        faces_vertices: [
          [0, 1, 3],
          [1, 2, 3],
        ],
      },
    ],
    [
      "um índice fora do intervalo",
      "INDEX_OUT_OF_RANGE",
      {
        faces_vertices: [
          [0, 1, 9],
          [0, 2, 3],
        ],
      },
    ],
    [
      "uma coordenada não finita",
      "NON_FINITE_COORDINATE",
      {
        vertices_coords: [
          [-0.5, -0.5, 0],
          [0.5, Number.NaN, 0],
          [0.5, 0.5, 0],
          [-0.5, 0.5, 0],
        ],
      },
    ],
    [
      "uma folha declarada como cortada",
      "CUT_PAPER",
      {
        "ads:paper": {
          aspect: 1,
          uncut: false,
          frontFamily: "apricot",
          backFamily: "mist",
        },
      },
    ],
    [
      "um frame que redefine a topologia",
      "FRAME_TOPOLOGY_CHANGED",
      { file_frames: [{ faces_vertices: [[0, 1, 2]] }] },
    ],
  ])("rejeita %s com %s", (_label, code, overrides) => {
    expect(
      codeOf(() => validateFoldSource(diagonalSource(overrides as never))),
    ).toBe(code);
  });

  it("rejeita uma fronteira aberta", () => {
    // Sem a aresta 3–0 o contorno deixa de fechar, e uma folha com a fronteira
    // aberta é uma folha rasgada — mesmo sem nenhuma aresta marcada como corte.
    expect(
      codeOf(() =>
        validateFoldSource(
          diagonalSource({
            edges_vertices: [
              [0, 1],
              [1, 2],
              [2, 3],
              [0, 2],
            ],
            edges_assignment: ["B", "B", "B", "V"],
            edges_foldAngle: [null, null, null, 90],
            faces_vertices: [[0, 1, 2]],
          } as never),
        ),
      ),
    ).toBe("NON_MANIFOLD_EDGE");
  });
});

describe("autoria a partir da forma dobrada", () => {
  const flat: Vec3[] = [
    [-0.5, -0.5, 0],
    [0.5, -0.5, 0],
    [0.5, 0.5, 0],
    [-0.5, 0.5, 0],
  ];

  const model = {
    flat,
    faces: [
      [0, 1, 2],
      [0, 2, 3],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [0, 2],
    ],
    boundary: [0, 1, 2, 3],
    anchor: { origin: 0, toward: 1, plane: 2 },
  } as const;

  /**
   * Rodar `point` em torno do eixo que passa por `origin` na direção `axis`.
   *
   * Escrito à mão no teste de propósito: uma configuração-alvo produzida pelo
   * mesmo código que a valida não provaria nada.
   */
  function rotateAbout(
    point: Vec3,
    origin: Vec3,
    axis: Vec3,
    radians: number,
  ): Vec3 {
    const length = Math.hypot(...axis);
    const [ux, uy, uz] = axis.map((v) => v / length) as [
      number,
      number,
      number,
    ];
    const [dx, dy, dz] = [
      point[0] - origin[0],
      point[1] - origin[1],
      point[2] - origin[2],
    ];

    const along = dx * ux + dy * uy + dz * uz;
    const parallel: Vec3 = [ux * along, uy * along, uz * along];
    const perpendicular: Vec3 = [
      dx - parallel[0],
      dy - parallel[1],
      dz - parallel[2],
    ];
    const binormal: Vec3 = [
      uy * perpendicular[2] - uz * perpendicular[1],
      uz * perpendicular[0] - ux * perpendicular[2],
      ux * perpendicular[1] - uy * perpendicular[0],
    ];

    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    return [
      origin[0] + parallel[0] + perpendicular[0] * cos + binormal[0] * sin,
      origin[1] + parallel[1] + perpendicular[1] * cos + binormal[1] * sin,
      origin[2] + parallel[2] + perpendicular[2] * cos + binormal[2] * sin,
    ];
  }

  it("deriva o ângulo que produz a forma descrita", () => {
    // Metade direita erguida 60° em torno da diagonal 0→2.
    const lifted = rotateAbout(
      [0.5, -0.5, 0],
      [-0.5, -0.5, 0],
      [1, 1, 0],
      Math.PI / 3,
    );

    const source = authorFoldSource(
      {
        ...model,
        stages: [
          {
            title: "dobrada",
            state: "formed",
            positions: [
              [-0.5, -0.5, 0],
              lifted,
              [0.5, 0.5, 0],
              [-0.5, 0.5, 0],
            ] as Vec3[],
          },
        ],
      },
      METADATA,
    );

    expect(source.edges_assignment?.[4]).toMatch(/[MV]/);
    expect(Math.abs(source.edges_foldAngle?.[4] as number)).toBeCloseTo(60, 4);
    expect(source.file_frames).toHaveLength(1);
    expect(source["ads:anchor"]).toEqual(model.anchor);
  });

  /**
   * O guarda que impede a conveniência de se tornar uma nova mentira: se a
   * configuração descrita esticar o papel, ela não é uma dobragem, e nenhum
   * ângulo derivado dela vale coisa nenhuma.
   */
  it("recusa uma configuração que estica o papel", () => {
    expect(() =>
      authorFoldSource(
        {
          ...model,
          stages: [
            {
              title: "impossível",
              state: "formed",
              positions: [
                [-0.5, -0.5, 0],
                [0.9, -0.5, 0],
                [0.5, 0.5, 0],
                [-0.5, 0.5, 0],
              ] as Vec3[],
            },
          ],
        },
        METADATA,
      ),
    ).toThrow(/estica a aresta/);
  });
});

describe("bake", () => {
  const source = diagonalSource();
  const mesh = buildMesh(source);
  // A folha plana dá alvos todos a zero — é a prova de que
  // `stageFromConfiguration` lê a configuração e não inventa nada.
  const flatStage = stageFromConfiguration(mesh, mesh.restPositions, "flat");
  const quarterTurn = {
    targets: Float64Array.from([Math.PI / 2]),
    state: "formed" as const,
  };

  it("lê zero em todos os vincos quando a configuração é a folha plana", () => {
    expect([...flatStage.targets]).toEqual([0]);
  });

  it("chega ao alvo sem esticar o papel", () => {
    const result = bakeModel(mesh, [quarterTurn]);
    expect(result.ok).toBe(true);
    expect(result.diagnostics.worstEdgeStrain).toBeLessThan(0.0025);
    expect(result.diagnostics.finalAngleErrorDegrees).toBeLessThan(6);
    expect(result.diagnostics.final.selfIntersectionCount).toBe(0);
  });

  it("começa exatamente na folha plana", () => {
    const result = bakeModel(mesh, [quarterTurn]);
    const first = result.frames[0]!;
    expect(first.progress).toBe(0);
    expect(maxEdgeStrain(mesh, first.positions)).toBe(0);
    first.positions.forEach((point, index) => {
      expect(point[0]).toBeCloseTo(mesh.restPositions[index]![0], 12);
      expect(point[2]).toBeCloseTo(0, 12);
    });
  });

  /**
   * Determinismo. É o que permite gravar o hash da fonte no asset e detetar no
   * CI que um ficheiro derivado deixou de corresponder à sua origem.
   */
  it("produz exatamente os mesmos números duas vezes", () => {
    const first = bakeModel(mesh, [quarterTurn]);
    const second = bakeModel(mesh, [quarterTurn]);
    expect(JSON.stringify(first.frames)).toBe(JSON.stringify(second.frames));
  });

  it("mantém a isometria em todos os frames, e não só no último", () => {
    const result = bakeModel(mesh, [quarterTurn]);
    expect(result.ok).toBe(true);
    for (const frame of result.frames) {
      expect(() =>
        assertIsometric(mesh, frame.positions, 0.0025),
      ).not.toThrow();
    }
  });

  /**
   * Nunca aceitar o último frame de uma execução que não assentou.
   *
   * Sem este gate, um bake sem passos suficientes entrega uma forma a meio da
   * dobra com ar de resultado, e o defeito só aparece na captura de ecrã — se
   * alguém a tirar.
   */
  it("recusa uma execução que não teve passos para chegar ao alvo", () => {
    const starved = bakeModel(
      mesh,
      [{ targets: Float64Array.from([Math.PI / 2]), state: "formed" }],
      { framesPerStage: 2, relaxationSteps: 2, settleSteps: 2 },
    );
    expect(starved.ok).toBe(false);
    if (!starved.ok) expect(starved.reason).toBe("NOT_REACHED");
  });
});
