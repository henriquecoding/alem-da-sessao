import type { Locale } from "@alem-da-sessao/i18n";

/**
 * Origami é uma estrutura, não uma textura.
 *
 * O erro da direção anterior não foi de cor nem de sombra: foi topológico.
 * Cada animal era um conjunto de polígonos independentes que por acaso ficavam
 * próximos. Nenhum deles partilhava um vértice com o vizinho, portanto nenhum
 * deles pertencia à mesma folha — e o cérebro lê isso em menos de um segundo,
 * mesmo sem saber nomear o que está errado.
 *
 * O modelo de dados aqui existe para tornar essa falha impossível de repetir.
 * Um modelo não declara polígonos: declara **vértices nomeados**, e as faces
 * referem-se a eles por nome. Duas faces adjacentes citam literalmente a mesma
 * entrada da tabela, portanto não podem divergir por um arredondamento.
 *
 * Sobre essa base, `tests/origami-topology.test.ts` verifica o invariante que
 * distingue papel dobrado de colagem geométrica:
 *
 * > Cada aresta pertence a exactamente duas faces (é um vinco), ou a uma só
 * > face — e nesse caso tem de ser uma aresta da silhueta.
 *
 * Uma aresta órfã significa uma fenda. Uma aresta em três faces significa
 * sobreposição não declarada. Ambas falham o build.
 */

export type OrigamiPoint = readonly [number, number];

/** Quatro categorias tonais derivadas de uma única direção de luz (§7.2). */
export type OrigamiTone = "lit" | "base" | "shade" | "inner";

/**
 * `mountain` e `valley` são vincos reais do modelo. `edge` é outra coisa: é a
 * aresta de uma camada que passa por cima de outra. Distinguem-se porque se
 * desenham de forma diferente — um vinco é uma linha de luz, uma sobreposição
 * projecta uma sombra de contacto curta.
 */
export type OrigamiCreaseKind = "mountain" | "valley" | "edge";

/**
 * `sheet` e `half-fold` não pertencem à família de resultados: são a matéria e
 * o estado intermédio. Estão aqui porque a narrativa começa antes da primeira
 * dobra e não pode saltar dela para o objeto acabado.
 */
export type OrigamiModelId =
  "sheet" | "half-fold" | "boat" | "box" | "crane" | "suspended-sheet";

/** Os quatro objetos que uma decisão pode produzir. */
export type OrigamiResultId = "boat" | "box" | "crane" | "suspended-sheet";

export type OrigamiFace = {
  id: string;
  points: readonly OrigamiPoint[];
  /** Os mesmos vértices, por nome. É isto que o teste de topologia lê. */
  vertices: readonly string[];
  tone: OrigamiTone;
  /** Ordem de pintura. Não substitui a topologia; só resolve empates visuais. */
  layer: number;
};

export type OrigamiCrease = {
  id: string;
  path: string;
  vertices: readonly string[];
  kind: OrigamiCreaseKind;
};

export type OrigamiModelDefinition = {
  id: OrigamiModelId;
  viewBox: readonly [number, number, number, number];
  /** A silhueta canónica: o teste de reconhecimento corre sobre este caminho. */
  silhouettePath: string;
  silhouette: readonly string[];
  vertices: Readonly<Record<string, OrigamiPoint>>;
  faces: readonly OrigamiFace[];
  creases: readonly OrigamiCrease[];
  shadowPath: string;
  accessibleLabel: Record<Locale, string>;
};

type FaceSpec = {
  id: string;
  vertices: readonly string[];
  tone: OrigamiTone;
  layer?: number;
};

type CreaseSpec = {
  id: string;
  vertices: readonly string[];
  kind: OrigamiCreaseKind;
};

export type OrigamiModelSpec = {
  id: OrigamiModelId;
  viewBox: readonly [number, number, number, number];
  vertices: Readonly<Record<string, OrigamiPoint>>;
  /** Percurso fechado, em sentido horário, pela fronteira exterior. */
  silhouette: readonly string[];
  faces: readonly FaceSpec[];
  creases: readonly CreaseSpec[];
  /** A sombra é uma forma única e não uma sombra por polígono (§7.4). */
  shadowPath: string;
  accessibleLabel: Record<Locale, string>;
};

function resolve(
  vertices: Readonly<Record<string, OrigamiPoint>>,
  keys: readonly string[],
  owner: string,
): OrigamiPoint[] {
  return keys.map((key) => {
    const point = vertices[key];
    if (!point) {
      throw new Error(
        `origami: ${owner} refere o vértice "${key}", que não existe na tabela do modelo.`,
      );
    }
    return point;
  });
}

function toPath(points: readonly OrigamiPoint[], close: boolean): string {
  const [first, ...rest] = points;
  const head = `M${first[0]} ${first[1]}`;
  const tail = rest.map(([x, y]) => `L${x} ${y}`).join("");
  return `${head}${tail}${close ? "Z" : ""}`;
}

/**
 * Constrói a definição a partir da tabela de vértices.
 *
 * A resolução acontece uma vez, no módulo, e não em cada render: a geometria é
 * uma constante do produto. Nada aqui é gerado proceduralmente em runtime —
 * essa era exactamente a origem dos «triângulos a flutuar sem causa».
 */
export function defineOrigamiModel(
  spec: OrigamiModelSpec,
): OrigamiModelDefinition {
  const silhouettePoints = resolve(
    spec.vertices,
    spec.silhouette,
    `${spec.id}.silhouette`,
  );

  return {
    id: spec.id,
    viewBox: spec.viewBox,
    vertices: spec.vertices,
    silhouette: spec.silhouette,
    silhouettePath: toPath(silhouettePoints, true),
    faces: spec.faces.map((face, index) => ({
      id: face.id,
      vertices: face.vertices,
      points: resolve(spec.vertices, face.vertices, `${spec.id}.${face.id}`),
      tone: face.tone,
      layer: face.layer ?? index,
    })),
    creases: spec.creases.map((crease) => ({
      id: crease.id,
      vertices: crease.vertices,
      kind: crease.kind,
      path: toPath(
        resolve(spec.vertices, crease.vertices, `${spec.id}.${crease.id}`),
        false,
      ),
    })),
    shadowPath: spec.shadowPath,
    accessibleLabel: spec.accessibleLabel,
  };
}

export function pointsAttribute(points: readonly OrigamiPoint[]): string {
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}
