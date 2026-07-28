import type { Assignment, Vec2 } from "./fold-types";

/**
 * O lado do SVG: de um desenho de vincos para segmentos com sentido declarado.
 *
 * Um padrão de vincos distribuído como SVG não é um formato — é uma convenção,
 * e a convenção é a cor do traço. É a mesma que o OrigamiSimulator lê em
 * `js/pattern.js`, e está aqui reproduzida por valor exato e não por
 * aproximação:
 *
 * | Cor                  | Atribuição | O que é                       |
 * | -------------------- | ---------- | ----------------------------- |
 * | `#ff0000` (vermelho) | `M`        | monte — dobra para trás       |
 * | `#0000ff` (azul)     | `V`        | vale — dobra para a frente    |
 * | `#000000` (preto)    | `B`        | fronteira da folha            |
 * | `#ffff00` (amarelo)  | `F`        | linha de triangulação, sem dobra |
 * | `#00ff00` (verde)    | corte      | **recusado** — ver abaixo     |
 *
 * O verde é o único que o formato de origem admite e este não. A razão é a
 * mesma que está em `fold-types.ts`: a metáfora do produto depende de a folha
 * permanecer inteira, e uma folha cortada é outra coisa. Recusa-se com o nome
 * da cor e a posição da linha, para que quem autorou saiba o que apagar.
 *
 * ## Porque é que a correspondência é exata
 *
 * `#fe0000` não é vermelho aqui. Aceitar quase-vermelho obrigaria a escolher um
 * raio no espaço de cor, e esse raio decidiria em silêncio que um `#ff8800`
 * mal-intencionado é um monte. A correspondência exata falha de forma legível
 * — diz qual foi a cor encontrada e quais são as cinco aceites — e quem
 * exportou corrige na origem, que é onde o erro está.
 *
 * ## O que é lido, e o que não é
 *
 * Lê-se `line`, `polyline`, `polygon`, `rect` e `path` limitado a `M`, `L`,
 * `H`, `V` e `Z`. Uma curva de Bézier num padrão de vincos não é um vinco: o
 * papel dobra em linhas retas, e aproximar a curva por segmentos inventaria
 * vincos que ninguém desenhou. Recusa-se com o comando encontrado.
 *
 * Lê-se também a pilha de `transform` e a herança de `stroke` pelos `<g>`,
 * porque ignorá-las não falharia — produziria um padrão diferente do que o
 * ficheiro desenha, que é a única classe de defeito que este módulo não pode
 * ter. Um bloco `<style>` é interpretado para seletores simples (`.classe`,
 * `#id`, `elemento` e a combinação dos três), por ordem do documento e sem
 * cálculo de especificidade — o suficiente para os ficheiros que o Inkscape e
 * o Illustrator produzem, e declarado aqui para que ninguém conte com mais.
 */

export type SvgCreaseCode =
  | "SVG_EMPTY"
  | "UNSUPPORTED_PATH_COMMAND"
  | "MALFORMED_PATH"
  | "MISSING_STROKE"
  | "UNKNOWN_STROKE"
  | "CUT_NOT_ALLOWED"
  | "NO_SEGMENTS"
  | "BAD_TRANSFORM"
  | "NON_FINITE_COORDINATE";

export class SvgCreaseError extends Error {
  constructor(
    readonly code: SvgCreaseCode,
    readonly detail: string,
  ) {
    super(`${code}: ${detail}`);
    this.name = "SvgCreaseError";
  }
}

/** Um segmento lido do ficheiro, ainda nas coordenadas do próprio SVG. */
export type CreaseSegment = {
  readonly a: Vec2;
  readonly b: Vec2;
  readonly assignment: Assignment;
  /** Elemento de origem, para as mensagens de erro serem acionáveis. */
  readonly source: string;
};

/* ------------------------------------------------------------------ cores */

const NAMED_COLOURS: Readonly<Record<string, string>> = {
  red: "#ff0000",
  blue: "#0000ff",
  black: "#000000",
  green: "#00ff00",
  lime: "#00ff00",
  yellow: "#ffff00",
};

const ASSIGNMENT_BY_COLOUR: Readonly<Record<string, Assignment>> = {
  "#ff0000": "M",
  "#0000ff": "V",
  "#000000": "B",
  "#ffff00": "F",
};

/** A cor que o formato de origem usa para corte, e que este produto recusa. */
const CUT_COLOUR = "#00ff00";

/**
 * Reduz uma cor de traço à forma `#rrggbb`, ou devolve `null` se não a souber ler.
 *
 * Não é um parser de CSS: cobre as quatro formas que aparecem em ficheiros de
 * padrões — nome, `#rgb`, `#rrggbb` e `rgb(…)`. Qualquer outra coisa devolve
 * `null` e é reportada com o texto original, que é mais útil do que um palpite.
 */
export function normalizeStrokeColour(raw: string): string | null {
  const value = raw.trim().toLowerCase();
  if (!value || value === "none") return null;

  const named = NAMED_COLOURS[value];
  if (named) return named;

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(value);
  if (hex) {
    const digits = hex[1]!;
    return digits.length === 3
      ? `#${digits
          .split("")
          .map((d) => d + d)
          .join("")}`
      : `#${digits}`;
  }

  const rgb = /^rgba?\(([^)]*)\)$/.exec(value);
  if (rgb) {
    const parts = rgb[1]!
      .split(/[\s,/]+/)
      .filter(Boolean)
      .slice(0, 3);
    if (parts.length !== 3) return null;
    const channels = parts.map((part) => {
      const percent = part.endsWith("%");
      const number = Number.parseFloat(percent ? part.slice(0, -1) : part);
      if (!Number.isFinite(number)) return Number.NaN;
      return Math.round(percent ? (number / 100) * 255 : number);
    });
    if (channels.some((c) => !Number.isFinite(c) || c < 0 || c > 255)) {
      return null;
    }
    return `#${channels.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
  }

  return null;
}

function assignmentForColour(colour: string, where: string): Assignment {
  if (colour === CUT_COLOUR) {
    throw new SvgCreaseError(
      "CUT_NOT_ALLOWED",
      `${where} usa ${colour} (corte). A folha tem de permanecer inteira: ` +
        "apague a linha ou mude-a para uma das cinco de dobra.",
    );
  }
  const assignment = ASSIGNMENT_BY_COLOUR[colour];
  if (!assignment) {
    throw new SvgCreaseError(
      "UNKNOWN_STROKE",
      `${where} tem traço ${colour}, que não é nenhuma das aceites: ` +
        "#ff0000 (monte), #0000ff (vale), #000000 (fronteira), #ffff00 (triangulação).",
    );
  }
  return assignment;
}

/* -------------------------------------------------------------- transforms */

/** Afim 2D na ordem do SVG: `[a, b, c, d, e, f]`. */
type Matrix = readonly [number, number, number, number, number, number];

const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];

function multiply(m: Matrix, n: Matrix): Matrix {
  return [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4],
    m[1] * n[4] + m[3] * n[5] + m[5],
  ];
}

function applyMatrix(m: Matrix, point: Vec2): Vec2 {
  return [
    m[0] * point[0] + m[2] * point[1] + m[4],
    m[1] * point[0] + m[3] * point[1] + m[5],
  ];
}

const NUMBER = /[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g;

function numbersIn(text: string): number[] {
  return (text.match(NUMBER) ?? []).map(Number);
}

function radians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Compõe a lista de transformações de um atributo `transform`.
 *
 * Da esquerda para a direita, que é a ordem em que o SVG as aplica ao sistema
 * de coordenadas — `translate(10,0) scale(2)` escala e depois translada o
 * resultado, e não o contrário.
 */
export function parseTransform(value: string): Matrix {
  let matrix = IDENTITY;
  const pattern = /([a-zA-Z]+)\s*\(([^)]*)\)/g;

  for (const match of value.matchAll(pattern)) {
    const name = match[1]!.toLowerCase();
    const args = numbersIn(match[2]!);
    const at = (index: number, fallback = 0): number => args[index] ?? fallback;

    switch (name) {
      case "translate":
        matrix = multiply(matrix, [1, 0, 0, 1, at(0), at(1)]);
        break;
      case "scale": {
        const sx = at(0, 1);
        matrix = multiply(matrix, [sx, 0, 0, args[1] ?? sx, 0, 0]);
        break;
      }
      case "rotate": {
        const angle = radians(at(0));
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const rotation: Matrix = [cos, sin, -sin, cos, 0, 0];
        if (args.length >= 3) {
          const [, cx, cy] = args as [number, number, number];
          matrix = multiply(
            multiply(multiply(matrix, [1, 0, 0, 1, cx, cy]), rotation),
            [1, 0, 0, 1, -cx, -cy],
          );
        } else {
          matrix = multiply(matrix, rotation);
        }
        break;
      }
      case "skewx":
        matrix = multiply(matrix, [1, 0, Math.tan(radians(at(0))), 1, 0, 0]);
        break;
      case "skewy":
        matrix = multiply(matrix, [1, Math.tan(radians(at(0))), 0, 1, 0, 0]);
        break;
      case "matrix":
        if (args.length < 6) {
          throw new SvgCreaseError(
            "BAD_TRANSFORM",
            `matrix(${match[2]!.trim()}) precisa de seis números e tem ${args.length}`,
          );
        }
        matrix = multiply(matrix, args.slice(0, 6) as unknown as Matrix);
        break;
      default:
        throw new SvgCreaseError(
          "BAD_TRANSFORM",
          `transformação "${name}" não é suportada; use translate, scale, rotate, skewX, skewY ou matrix`,
        );
    }
  }

  if (matrix.some((value) => !Number.isFinite(value))) {
    throw new SvgCreaseError(
      "BAD_TRANSFORM",
      `transform="${value}" produz uma matriz não finita`,
    );
  }

  return matrix;
}

/* -------------------------------------------------------------- caminhos */

type SubPath = { readonly points: Vec2[]; readonly closed: boolean };

/**
 * Lê um atributo `d` limitado aos comandos que descrevem retas.
 *
 * Uma curva é recusada em vez de aproximada. Aproximá-la produziria vincos que
 * o autor não desenhou, e o resto do pipeline não teria como saber que aquela
 * geometria é inventada.
 */
export function parsePathData(d: string, where: string): SubPath[] {
  const tokens = d.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g);
  if (!tokens) return [];

  const subPaths: SubPath[] = [];
  let points: Vec2[] = [];
  let closed = false;
  let current: Vec2 = [0, 0];
  let start: Vec2 = [0, 0];
  let command = "";
  let index = 0;

  const flush = (): void => {
    if (points.length >= 2) subPaths.push({ points, closed });
    points = [];
    closed = false;
  };

  const takeNumber = (): number => {
    const token = tokens[index];
    if (token === undefined || /[a-zA-Z]/.test(token)) {
      throw new SvgCreaseError(
        "MALFORMED_PATH",
        `${where}: o comando "${command}" ficou sem números suficientes`,
      );
    }
    index += 1;
    return Number(token);
  };

  while (index < tokens.length) {
    const token = tokens[index]!;
    if (/[a-zA-Z]/.test(token)) {
      command = token;
      index += 1;
      // Um `M` seguido de mais pares é um `M` e depois `L`s implícitos; o `m`
      // minúsculo continua relativo. É a regra da especificação, e um padrão
      // exportado por ferramenta usa-a constantemente.
      if (command === "M" || command === "m") {
        flush();
        const x = takeNumber();
        const y = takeNumber();
        current = command === "m" ? [current[0] + x, current[1] + y] : [x, y];
        start = current;
        points.push(current);
        command = command === "m" ? "l" : "L";
        continue;
      }
    }

    switch (command) {
      case "L":
      case "l": {
        const x = takeNumber();
        const y = takeNumber();
        current = command === "l" ? [current[0] + x, current[1] + y] : [x, y];
        points.push(current);
        break;
      }
      case "H":
      case "h": {
        const x = takeNumber();
        current =
          command === "h" ? [current[0] + x, current[1]] : [x, current[1]];
        points.push(current);
        break;
      }
      case "V":
      case "v": {
        const y = takeNumber();
        current =
          command === "v" ? [current[0], current[1] + y] : [current[0], y];
        points.push(current);
        break;
      }
      case "Z":
      case "z": {
        closed = true;
        current = start;
        flush();
        points = [current];
        break;
      }
      default:
        throw new SvgCreaseError(
          "UNSUPPORTED_PATH_COMMAND",
          `${where}: o comando "${command}" não descreve uma reta. ` +
            "Um vinco é uma reta; curvas têm de ser convertidas em segmentos na origem.",
        );
    }
  }

  flush();
  return subPaths;
}

/* ---------------------------------------------------------------- leitura */

type Attributes = Readonly<Record<string, string>>;

const ATTRIBUTE = /([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

function readAttributes(text: string): Attributes {
  const attributes: Record<string, string> = {};
  for (const match of text.matchAll(ATTRIBUTE)) {
    attributes[match[1]!.toLowerCase()] = match[2] ?? match[3] ?? "";
  }
  return attributes;
}

function readDeclarations(style: string): Readonly<Record<string, string>> {
  const declarations: Record<string, string> = {};
  for (const part of style.split(";")) {
    const colon = part.indexOf(":");
    if (colon < 0) continue;
    declarations[part.slice(0, colon).trim().toLowerCase()] = part
      .slice(colon + 1)
      .trim();
  }
  return declarations;
}

type CssRule = {
  readonly tag?: string;
  readonly className?: string;
  readonly id?: string;
  readonly stroke: string;
};

/**
 * Lê os blocos `<style>` para seletores simples.
 *
 * Por ordem do documento, sem cálculo de especificidade: a última regra que
 * casa é a que vale. É deliberadamente menos do que o CSS faz, e é o que
 * chega para os ficheiros que as ferramentas de desenho exportam — onde as
 * regras são uma por classe e não competem entre si.
 */
function readStyleRules(css: string): CssRule[] {
  const rules: CssRule[] = [];
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const stroke = readDeclarations(match[2]!).stroke;
    if (!stroke) continue;
    for (const selector of match[1]!.split(",")) {
      const trimmed = selector.trim();
      const parsed = /^([a-zA-Z][\w-]*)?(?:\.([\w-]+))?(?:#([\w-]+))?$/.exec(
        trimmed,
      );
      if (!trimmed || !parsed || (!parsed[1] && !parsed[2] && !parsed[3])) {
        continue;
      }
      rules.push({
        tag: parsed[1]?.toLowerCase(),
        className: parsed[2],
        id: parsed[3],
        stroke,
      });
    }
  }
  return rules;
}

function strokeFromRules(
  rules: readonly CssRule[],
  tag: string,
  attributes: Attributes,
): string | undefined {
  const classes = new Set(
    (attributes.class ?? "").split(/\s+/).filter(Boolean),
  );
  let found: string | undefined;
  for (const rule of rules) {
    if (rule.tag && rule.tag !== tag) continue;
    if (rule.className && !classes.has(rule.className)) continue;
    if (rule.id && rule.id !== attributes.id) continue;
    found = rule.stroke;
  }
  return found;
}

/** Ordem de resolução: `style` inline, regra CSS, atributo, herança. */
function resolveStroke(
  rules: readonly CssRule[],
  tag: string,
  attributes: Attributes,
  inherited: string | undefined,
): string | undefined {
  const inline = readDeclarations(attributes.style ?? "").stroke;
  return (
    inline ??
    strokeFromRules(rules, tag, attributes) ??
    attributes.stroke ??
    inherited
  );
}

type Frame = { readonly matrix: Matrix; readonly stroke: string | undefined };

const SHAPES = new Set(["line", "polyline", "polygon", "rect", "path"]);

/** Elementos cujo conteúdo é definição e não desenho. */
const SKIPPED_SUBTREES = new Set([
  "defs",
  "clippath",
  "mask",
  "marker",
  "pattern",
  "symbol",
  "style",
  "text",
]);

function pointPairs(raw: string, where: string): Vec2[] {
  const numbers = numbersIn(raw);
  if (numbers.length % 2 !== 0) {
    throw new SvgCreaseError(
      "MALFORMED_PATH",
      `${where}: lista de pontos com ${numbers.length} números, que é ímpar`,
    );
  }
  const points: Vec2[] = [];
  for (let index = 0; index < numbers.length; index += 2) {
    points.push([numbers[index]!, numbers[index + 1]!]);
  }
  return points;
}

/**
 * Lê um SVG e devolve os segmentos com atribuição, nas coordenadas do ficheiro.
 *
 * O varrimento é por etiquetas e não por DOM porque este pacote corre no
 * compilador, em Node, e trazer um parser de XML para ler cinco elementos seria
 * uma dependência a pesar num sítio onde o formato é conhecido e restrito.
 */
export function parseCreasePatternSvg(svg: string): CreaseSegment[] {
  if (!svg.trim()) {
    throw new SvgCreaseError("SVG_EMPTY", "o ficheiro está vazio");
  }

  const styles = [...svg.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((match) => match[1]!)
    .join("\n");
  const rules = readStyleRules(styles);

  const cleaned = svg
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, "")
    .replace(/<\?[\s\S]*?\?>/g, "")
    .replace(/<!DOCTYPE[^>]*>/gi, "");

  const segments: CreaseSegment[] = [];
  const stack: Frame[] = [{ matrix: IDENTITY, stroke: undefined }];
  /** Profundidade a partir da qual tudo é ignorado (`<defs>` e afins). */
  let skipDepth: number | null = null;
  let elementIndex = 0;

  const TAG =
    /<\s*(\/?)\s*([a-zA-Z][\w:.-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)\s*>/g;

  for (const match of cleaned.matchAll(TAG)) {
    const closing = match[1] === "/";
    const tag = match[2]!.toLowerCase().replace(/^.*:/, "");
    const body = match[3] ?? "";
    const selfClosing = match[4] === "/";

    if (closing) {
      if (skipDepth !== null && stack.length <= skipDepth) skipDepth = null;
      if (stack.length > 1) stack.pop();
      continue;
    }

    const parent = stack[stack.length - 1]!;
    const attributes = readAttributes(body);
    const transform = attributes.transform
      ? multiply(parent.matrix, parseTransform(attributes.transform))
      : parent.matrix;
    const stroke = resolveStroke(rules, tag, attributes, parent.stroke);
    const frame: Frame = { matrix: transform, stroke };

    if (!selfClosing) stack.push(frame);

    if (skipDepth !== null) continue;
    if (SKIPPED_SUBTREES.has(tag)) {
      if (!selfClosing) skipDepth = stack.length;
      continue;
    }
    if (!SHAPES.has(tag)) continue;

    elementIndex += 1;
    const where = `<${tag}> #${elementIndex}`;

    if (!stroke) {
      throw new SvgCreaseError(
        "MISSING_STROKE",
        `${where} não tem cor de traço. É a cor que declara se a linha é monte, ` +
          "vale, fronteira ou triangulação, e sem ela a linha não tem sentido.",
      );
    }

    const colour = normalizeStrokeColour(stroke);
    if (!colour) {
      throw new SvgCreaseError(
        "UNKNOWN_STROKE",
        `${where} tem traço "${stroke}", que não foi possível ler como cor.`,
      );
    }
    const assignment = assignmentForColour(colour, where);

    /** Emite a linha poligonal já transformada, ligando o fecho se for o caso. */
    const emit = (points: readonly Vec2[], closed: boolean): void => {
      const placed = points.map((point) => applyMatrix(transform, point));
      const limit = closed ? placed.length : placed.length - 1;
      for (let index = 0; index < limit; index += 1) {
        const a = placed[index]!;
        const b = placed[(index + 1) % placed.length]!;
        if (
          a.some((v) => !Number.isFinite(v)) ||
          b.some((v) => !Number.isFinite(v))
        ) {
          throw new SvgCreaseError(
            "NON_FINITE_COORDINATE",
            `${where} produz uma coordenada não finita`,
          );
        }
        segments.push({ a, b, assignment, source: where });
      }
    };

    switch (tag) {
      case "line": {
        const number = (name: string): number =>
          Number.parseFloat(attributes[name] ?? "0") || 0;
        emit(
          [
            [number("x1"), number("y1")],
            [number("x2"), number("y2")],
          ],
          false,
        );
        break;
      }
      case "polyline":
        emit(pointPairs(attributes.points ?? "", where), false);
        break;
      case "polygon":
        emit(pointPairs(attributes.points ?? "", where), true);
        break;
      case "rect": {
        const number = (name: string): number =>
          Number.parseFloat(attributes[name] ?? "0") || 0;
        const x = number("x");
        const y = number("y");
        const width = number("width");
        const height = number("height");
        // Um retângulo de cantos redondos não descreve uma folha: o contorno
        // deixaria de ser feito de retas. Ignorar `rx` daria um padrão
        // silenciosamente diferente do desenho.
        if (number("rx") !== 0 || number("ry") !== 0) {
          throw new SvgCreaseError(
            "UNSUPPORTED_PATH_COMMAND",
            `${where} tem cantos redondos (rx/ry). O contorno de uma folha é feito de retas.`,
          );
        }
        emit(
          [
            [x, y],
            [x + width, y],
            [x + width, y + height],
            [x, y + height],
          ],
          true,
        );
        break;
      }
      case "path":
        for (const sub of parsePathData(attributes.d ?? "", where)) {
          emit(sub.points, sub.closed);
        }
        break;
    }
  }

  if (!segments.length) {
    throw new SvgCreaseError(
      "NO_SEGMENTS",
      "o ficheiro não tem nenhuma linha, polilinha, polígono, retângulo ou caminho com traço.",
    );
  }

  return segments;
}
