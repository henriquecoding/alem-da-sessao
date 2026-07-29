import { describe, expect, it } from "vitest";
import {
  authorFoldSource,
  bakeModel,
  buildMesh,
  buildPlanarSubdivision,
  CreaseImportError,
  importCreasePattern,
  normalizeStrokeColour,
  parseCreasePatternSvg,
  parsePathData,
  PlanarSubdivisionError,
  stagesFromSource,
  SvgCreaseError,
  validateFoldSource,
  type FoldSourceMetadata,
} from "@alem-da-sessao/origami-core";

/**
 * O importador de padrões de vincos.
 *
 * O que estes testes protegem não é «o parser lê linhas». É a classe de defeito
 * que este módulo pode ter e que não tem sintoma visível: um padrão importado
 * **errado** produz um modelo que valida, dobra, e é outra coisa. Três guardas
 * cobrem isso — a área do arranjo, a convenção de sinal, e a reprodução exata
 * de um modelo que o repositório já tinha fixado à mão.
 */

const METADATA: FoldSourceMetadata = {
  file_spec: 1.2,
  file_creator: "teste",
  file_author: "teste",
  file_title: "fixture",
  file_classes: ["singleModel", "animation"],
  "ads:modelId": "sheet",
  "ads:paper": {
    aspect: 1,
    uncut: true,
    frontFamily: "apricot",
    backFamily: "mist",
  },
  "ads:license": { id: "PROJETO", attribution: "teste" },
};

const RED = "#FF0000";
const BLUE = "#0000FF";

function svg(body: string, size = 400): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
    <rect x="0" y="0" width="${size}" height="${size}" stroke="#000000" fill="none"/>
    ${body}
  </svg>`;
}

function codeOf(run: () => unknown): string {
  try {
    run();
  } catch (error) {
    if (
      error instanceof SvgCreaseError ||
      error instanceof PlanarSubdivisionError ||
      error instanceof CreaseImportError
    ) {
      return error.code;
    }
    return `NÃO-IMPORTAÇÃO: ${String(error)}`;
  }
  return "NÃO FALHOU";
}

/**
 * A base preliminar, com a atribuição que a torna dobrável.
 *
 * `d` são as quatro meias-diagonais (centro→canto) e `m` as quatro
 * meias-medianas (centro→meio do lado). O teorema de Maekawa exige que num
 * vértice interior que dobra plano a diferença entre montes e vales seja
 * exatamente dois — com oito vincos, 5/3 e nunca 4/4.
 */
function preliminaryBase(d: readonly string[], m: readonly string[]): string {
  return svg(`
    <line x1="200" y1="200" x2="400" y2="0"   stroke="${d[0]}"/>
    <line x1="200" y1="200" x2="0"   y2="0"   stroke="${d[1]}"/>
    <line x1="200" y1="200" x2="0"   y2="400" stroke="${d[2]}"/>
    <line x1="200" y1="200" x2="400" y2="400" stroke="${d[3]}"/>
    <line x1="200" y1="200" x2="400" y2="200" stroke="${m[0]}"/>
    <line x1="200" y1="200" x2="200" y2="0"   stroke="${m[1]}"/>
    <line x1="200" y1="200" x2="0"   y2="200" stroke="${m[2]}"/>
    <line x1="200" y1="200" x2="200" y2="400" stroke="${m[3]}"/>
  `);
}

const FOLDABLE = preliminaryBase(
  [RED, RED, RED, BLUE],
  [BLUE, BLUE, BLUE, BLUE],
);

describe("cor do traço", () => {
  it.each([
    ["#F00", "#ff0000"],
    ["#ff0000", "#ff0000"],
    ["blue", "#0000ff"],
    ["  Black ", "#000000"],
    ["rgb(255, 255, 0)", "#ffff00"],
    ["rgb(0 0 255)", "#0000ff"],
    ["rgb(100%, 0%, 0%)", "#ff0000"],
  ])("lê %s como %s", (input, expected) => {
    expect(normalizeStrokeColour(input)).toBe(expected);
  });

  it.each([["none"], [""], ["url(#gradiente)"], ["chartreuse"]])(
    "não inventa uma cor para %s",
    (input) => {
      expect(normalizeStrokeColour(input)).toBeNull();
    },
  );

  it("recusa o verde em vez de o tratar como dobra", () => {
    // O formato de origem usa verde para corte. Aqui a folha tem de ficar
    // inteira, e a recusa diz porquê em vez de descartar a linha em silêncio.
    expect(
      codeOf(() => parseCreasePatternSvg(svg('<line stroke="#00FF00"/>'))),
    ).toBe("CUT_NOT_ALLOWED");
  });

  it("recusa uma cor que não é nenhuma das cinco", () => {
    expect(
      codeOf(() =>
        parseCreasePatternSvg(svg('<line x2="10" stroke="#FE0000"/>')),
      ),
    ).toBe("UNKNOWN_STROKE");
  });

  it("recusa uma linha sem cor de traço", () => {
    expect(codeOf(() => parseCreasePatternSvg(svg('<line x2="10"/>')))).toBe(
      "MISSING_STROKE",
    );
  });
});

describe("leitura do SVG", () => {
  it("herda o traço do grupo e deixa o filho sobrepor-se", () => {
    const segments = parseCreasePatternSvg(
      svg(`<g stroke="${RED}">
             <line x1="0" y1="0" x2="10" y2="0"/>
             <line x1="0" y1="0" x2="10" y2="0" stroke="${BLUE}"/>
           </g>`),
    );
    expect(segments.filter((s) => s.assignment === "M")).toHaveLength(1);
    expect(segments.filter((s) => s.assignment === "V")).toHaveLength(1);
  });

  it("o style inline ganha ao atributo", () => {
    const [segment] = parseCreasePatternSvg(
      svg(
        `<line x1="0" y1="0" x2="10" y2="0" stroke="${RED}" style="stroke:${BLUE}"/>`,
      ),
    ).filter((s) => s.assignment !== "B");
    expect(segment!.assignment).toBe("V");
  });

  it("lê uma regra de um bloco style", () => {
    const [segment] = parseCreasePatternSvg(
      svg(`<style>.vale { stroke: blue; }</style>
           <line class="vale" x1="0" y1="0" x2="10" y2="0"/>`),
    ).filter((s) => s.assignment !== "B");
    expect(segment!.assignment).toBe("V");
  });

  it("ignora o que está dentro de defs", () => {
    const segments = parseCreasePatternSvg(
      svg(`<defs><line x1="0" y1="0" x2="10" y2="0" stroke="${RED}"/></defs>`),
    );
    expect(segments.every((s) => s.assignment === "B")).toBe(true);
  });

  /**
   * Ignorar um `transform` não falharia: produziria um padrão diferente
   * daquele que o ficheiro desenha. É a única classe de defeito que este
   * módulo não se pode permitir, e por isso a pilha é composta e testada.
   */
  it("aplica a pilha de transformações", () => {
    const [segment] = parseCreasePatternSvg(
      svg(`<g transform="translate(100,50)">
             <g transform="scale(2)">
               <line x1="0" y1="0" x2="10" y2="0" stroke="${RED}"/>
             </g>
           </g>`),
    ).filter((s) => s.assignment !== "B");
    expect(segment!.a).toEqual([100, 50]);
    expect(segment!.b).toEqual([120, 50]);
  });

  it("roda em torno de um centro declarado", () => {
    const [segment] = parseCreasePatternSvg(
      svg(
        `<line x1="10" y1="0" x2="20" y2="0" stroke="${RED}" transform="rotate(90, 0, 0)"/>`,
      ),
    ).filter((s) => s.assignment !== "B");
    expect(segment!.a[0]).toBeCloseTo(0, 9);
    expect(segment!.a[1]).toBeCloseTo(10, 9);
    expect(segment!.b[0]).toBeCloseTo(0, 9);
    expect(segment!.b[1]).toBeCloseTo(20, 9);
  });

  it("lê polyline, polygon e path com M/L/H/V/Z", () => {
    expect(
      parseCreasePatternSvg(
        svg(`<polyline points="0,0 10,0 10,10" stroke="${RED}"/>`),
      ).filter((s) => s.assignment === "M"),
    ).toHaveLength(2);

    // Um polígono fecha, portanto três pontos dão três segmentos.
    expect(
      parseCreasePatternSvg(
        svg(`<polygon points="0,0 10,0 10,10" stroke="${RED}"/>`),
      ).filter((s) => s.assignment === "M"),
    ).toHaveLength(3);

    expect(parsePathData("M 0 0 L 10 0 H 20 V 10 Z", "teste")).toEqual([
      {
        points: [
          [0, 0],
          [10, 0],
          [20, 0],
          [20, 10],
        ],
        closed: true,
      },
    ]);
  });

  it("trata os pares extra de um M como L implícitos", () => {
    expect(parsePathData("M 0 0 10 0 20 0", "teste")).toEqual([
      {
        points: [
          [0, 0],
          [10, 0],
          [20, 0],
        ],
        closed: false,
      },
    ]);
  });

  /**
   * Uma curva não é um vinco. Aproximá-la por segmentos inventaria dobras que
   * ninguém desenhou, e o resto do pipeline não teria como saber que aquela
   * geometria não veio do autor.
   */
  it("recusa uma curva em vez de a aproximar", () => {
    expect(codeOf(() => parsePathData("M 0 0 C 1 1 2 2 3 3", "teste"))).toBe(
      "UNSUPPORTED_PATH_COMMAND",
    );
  });

  it("recusa um retângulo de cantos redondos", () => {
    expect(
      codeOf(() =>
        parseCreasePatternSvg(
          `<svg><rect x="0" y="0" width="10" height="10" rx="2" stroke="#000000"/></svg>`,
        ),
      ),
    ).toBe("UNSUPPORTED_PATH_COMMAND");
  });
});

describe("arranjo planar", () => {
  const square = [
    { a: [0, 0], b: [1, 0] },
    { a: [1, 0], b: [1, 1] },
    { a: [1, 1], b: [0, 1] },
    { a: [0, 1], b: [0, 0] },
  ] as const;

  const boundary = square.map((edge) => ({
    a: edge.a as [number, number],
    b: edge.b as [number, number],
    assignment: "B" as const,
    source: "teste",
  }));

  it("solda pontos que o desenho quis coincidentes", () => {
    // O canto superior direito chega com um desvio de 1e-6 em cada linha.
    const result = buildPlanarSubdivision(
      [
        { a: [0, 0], b: [1, 0], assignment: "B", source: "t" },
        { a: [1.000001, 0.000001], b: [1, 1], assignment: "B", source: "t" },
        { a: [1, 1], b: [0, 1], assignment: "B", source: "t" },
        { a: [0, 1], b: [0, 0], assignment: "B", source: "t" },
      ],
      1e-4,
    );
    expect(result.vertices).toHaveLength(4);
    expect(result.faces).toHaveLength(1);
  });

  /**
   * Duas linhas que se cruzam a meio não têm vértice no cruzamento — o SVG não
   * tem por onde o declarar. Sem partir, as quatro faces em volta fundem-se
   * numa só e o modelo dobra como se ali não houvesse vinco.
   */
  it("parte duas linhas que se cruzam a meio", () => {
    const result = buildPlanarSubdivision(
      [
        ...boundary,
        { a: [0, 0.5], b: [1, 0.5], assignment: "M", source: "t" },
        { a: [0.5, 0], b: [0.5, 1], assignment: "V", source: "t" },
      ],
      1e-4,
    );
    expect(result.diagnostics.crossings).toBe(1);
    expect(result.faces).toHaveLength(4);
    expect(result.diagnostics.areaError).toBeLessThan(1e-9);
  });

  it("parte uma linha numa junção em T", () => {
    const result = buildPlanarSubdivision(
      [
        ...boundary,
        { a: [0.5, 0], b: [0.5, 1], assignment: "M", source: "t" },
        { a: [0.5, 0.5], b: [1, 0.5], assignment: "V", source: "t" },
      ],
      1e-4,
    );
    expect(result.faces).toHaveLength(3);
    expect(result.diagnostics.splits).toBeGreaterThan(0);
  });

  it("recusa uma linha que acaba no meio do papel", () => {
    expect(
      codeOf(() =>
        buildPlanarSubdivision(
          [
            ...boundary,
            { a: [0.5, 0.5], b: [1, 0.5], assignment: "M", source: "t" },
          ],
          1e-4,
        ),
      ),
    ).toBe("DANGLING_EDGE");
  });

  it("recusa a mesma aresta desenhada em duas cores", () => {
    expect(
      codeOf(() =>
        buildPlanarSubdivision(
          [
            ...boundary,
            { a: [0, 0], b: [1, 1], assignment: "M", source: "t" },
            { a: [0, 0], b: [1, 1], assignment: "V", source: "t" },
          ],
          1e-4,
        ),
      ),
    ).toBe("CONFLICTING_EDGE");
  });

  it("recusa um preto no interior do papel", () => {
    expect(
      codeOf(() =>
        buildPlanarSubdivision(
          [...boundary, { a: [0, 0], b: [1, 1], assignment: "B", source: "t" }],
          1e-4,
        ),
      ),
    ).toBe("BOUNDARY_MISMATCH");
  });
});

describe("importação", () => {
  it("exige o contorno desenhado", () => {
    expect(
      codeOf(() =>
        importCreasePattern(
          `<svg><line x1="0" y1="0" x2="10" y2="10" stroke="${RED}"/></svg>`,
        ),
      ),
    ).toBe("NO_BOUNDARY");
  });

  it("recusa uma folha que não é quadrada", () => {
    expect(
      codeOf(() =>
        importCreasePattern(
          `<svg><rect x="0" y="0" width="400" height="300" stroke="#000000"/></svg>`,
        ),
      ),
    ).toBe("SHEET_NOT_SQUARE");
  });

  it("recusa um contorno sem nada que dobre", () => {
    expect(codeOf(() => importCreasePattern(svg("")))).toBe("NO_CREASES");
  });

  it("normaliza para a folha canónica seja qual for a escala do ficheiro", () => {
    const small = importCreasePattern(
      preliminaryBase([RED, RED, RED, BLUE], [BLUE, BLUE, BLUE, BLUE])
        .replace(/400/g, "40")
        .replace(/200/g, "20"),
    );
    const large = importCreasePattern(FOLDABLE);

    expect(small.report.vertexCount).toBe(large.report.vertexCount);
    expect(small.report.edgeCount).toBe(large.report.edgeCount);
    small.model.flat.forEach((point, index) => {
      expect(point[0]).toBeCloseTo(large.model.flat[index]![0], 9);
      expect(point[1]).toBeCloseTo(large.model.flat[index]![1], 9);
      expect(point[2]).toBe(0);
    });
  });

  it("produz a topologia da base preliminar", () => {
    const { report } = importCreasePattern(FOLDABLE);
    expect(report).toMatchObject({
      vertexCount: 9,
      edgeCount: 16,
      faceCount: 8,
      boundaryCount: 8,
      mountainCount: 3,
      valleyCount: 5,
    });
    // A conta que apanha um cruzamento por partir: as faces cobrem o contorno
    // exatamente uma vez.
    expect(report.planar.sheetArea).toBeCloseTo(1, 9);
    expect(report.planar.areaError).toBeLessThan(1e-9);
  });

  /**
   * A convenção de sinal, que é o defeito que este módulo teve.
   *
   * `dihedralAngleAndGradients` dá ângulo positivo quando as duas faces sobem
   * para `+z` — e isso só é verdade se `apexA` estiver **à esquerda** da aresta
   * dirigida `p1→p2`. O sentido de cada aresta e a ordem das faces decidem-no
   * em conjunto, e nada no validador o verifica: com metade dos vincos na
   * convenção invertida a folha continua íntegra, a topologia continua
   * correta, e o modelo simplesmente não assenta.
   */
  it("dá a todos os vincos a mesma convenção de sinal", () => {
    const source = authorFoldSource(
      importCreasePattern(FOLDABLE).model,
      METADATA,
    );
    const mesh = buildMesh(source);

    expect(mesh.creases.length).toBeGreaterThan(0);
    for (const crease of mesh.creases) {
      const p1 = mesh.restPositions[crease.p1]!;
      const p2 = mesh.restPositions[crease.p2]!;
      const apex = mesh.restPositions[crease.apexA]!;
      const side =
        (p2[0] - p1[0]) * (apex[1] - p1[1]) -
        (p2[1] - p1[1]) * (apex[0] - p1[0]);
      expect(side).toBeGreaterThan(0);
    }
  });

  it("passa o validador do pipeline sem alterações", () => {
    const source = authorFoldSource(
      importCreasePattern(FOLDABLE).model,
      METADATA,
    );
    const report = validateFoldSource(source);
    expect(report.sheetArea).toBeCloseTo(1, 9);
    expect(report.warnings).toEqual([]);
    expect(report.mountainCount + report.valleyCount).toBe(8);
  });
});

/**
 * A prova de que o importador não inventa: o mesmo modelo que
 * `origami-pipeline.test.ts` constrói à mão, lido de um SVG, tem de dobrar
 * para o mesmo sítio com os mesmos números.
 */
describe("base preliminar, importada", () => {
  function bake(pattern: string) {
    const source = authorFoldSource(
      importCreasePattern(pattern).model,
      METADATA,
    );
    const mesh = buildMesh(source);
    return bakeModel(mesh, stagesFromSource(source, mesh), {
      anchor: source["ads:anchor"],
      lengthProjectionIterations: 30,
      selfIntersection: "measure",
    });
  }

  it("colapsa sem esticar e sem atravessar", () => {
    const result = bake(FOLDABLE);
    expect(result.ok).toBe(true);
    expect(result.diagnostics.worstEdgeStrain).toBeLessThan(0.0025);
    expect(result.diagnostics.finalAngleErrorDegrees).toBeLessThan(6);
    expect(result.diagnostics.final.selfIntersectionCount).toBe(0);
  });

  /**
   * O teorema de Maekawa: num vértice interior que dobra plano, a diferença
   * entre montes e vales é exatamente dois. Com oito vincos no centro, 4/4 não
   * dobra — e o importador não tem de o saber, porque não corrige o que lê. O
   * que ele garante é que a atribuição que sai é a que estava desenhada, e o
   * bake responde com números em vez de uma forma inventada.
   */
  it("não finge um colapso para um padrão que não fecha", () => {
    const balanced = preliminaryBase(
      [RED, RED, RED, RED],
      [BLUE, BLUE, BLUE, BLUE],
    );
    const imported = importCreasePattern(balanced);
    expect(imported.report.mountainCount).toBe(4);
    expect(imported.report.valleyCount).toBe(4);

    const source = authorFoldSource(imported.model, METADATA);
    const mesh = buildMesh(source);
    // Orçamento curto de propósito: o que se verifica é que **não** chega, e
    // gastar o bake inteiro a confirmá-lo só torna a suite lenta.
    const result = bakeModel(mesh, stagesFromSource(source, mesh), {
      framesPerStage: 6,
      relaxationSteps: 600,
      settleSteps: 2400,
      angleToleranceDegrees: 180,
      lengthProjectionIterations: 30,
    });

    expect(result.diagnostics.finalAngleErrorDegrees).toBeGreaterThan(20);
  });
});

/**
 * O gate de auto-interseção, agora com duas políticas.
 *
 * A folha enrolada é o caso que as separa, e é honesta como exemplo: quatro
 * vincos paralelos no mesmo sentido levados a 178° cada um fazem o papel dar
 * duas voltas sobre si próprio. Chega ao alvo exatamente, não estica nada — e
 * atravessa-se dezassete vezes, porque este solver não tem modelo de camadas
 * nem de contacto.
 *
 * É exatamente a troca que a mudança regista: com `"reject"` não sai forma
 * nenhuma; com `"measure"` sai a forma **e** o número que diz o quanto ela é
 * fisicamente impossível.
 */
describe("gate de auto-interseção", () => {
  const rolled = svg(`
    <line x1="0" y1="80"  x2="400" y2="80"  stroke="${BLUE}"/>
    <line x1="0" y1="160" x2="400" y2="160" stroke="${BLUE}"/>
    <line x1="0" y1="240" x2="400" y2="240" stroke="${BLUE}"/>
    <line x1="0" y1="320" x2="400" y2="320" stroke="${BLUE}"/>
  `);

  const source = authorFoldSource(
    importCreasePattern(rolled, { stageFractions: [1] }).model,
    METADATA,
  );
  const mesh = buildMesh(source);
  const stages = stagesFromSource(source, mesh);
  const budget = {
    anchor: source["ads:anchor"],
    lengthProjectionIterations: 30,
    framesPerStage: 8,
    relaxationSteps: 4000,
    settleSteps: 16000,
  } as const;

  it("bloqueia por omissão", () => {
    const result = bakeModel(mesh, stages, budget);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("SELF_INTERSECTION");
    // O modelo chegou ao alvo e não esticou: o que o reprova é só atravessar-se.
    expect(result.diagnostics.finalAngleErrorDegrees).toBeLessThan(6);
    expect(result.diagnostics.final.selfIntersectionCount).toBeGreaterThan(0);
  });

  it("mede quando lhe pedem, e o número não desaparece", () => {
    const result = bakeModel(mesh, stages, {
      ...budget,
      selfIntersection: "measure",
    });
    expect(result.ok).toBe(true);
    expect(result.diagnostics.final.selfIntersectionCount).toBeGreaterThan(0);
  });

  /**
   * As duas políticas decidem, e não alteram: os frames que saem são os
   * mesmos. Se medir mudasse a geometria, o número deixaria de descrever o que
   * vai para o asset.
   */
  it("não muda a geometria, só a decisão", () => {
    const strict = bakeModel(mesh, stages, budget);
    const measured = bakeModel(mesh, stages, {
      ...budget,
      selfIntersection: "measure",
    });
    expect(JSON.stringify(strict.frames)).toBe(JSON.stringify(measured.frames));
  });
});
