/**
 * Do CSS para o shader, no espaço de cor certo.
 *
 * As cores do papel vivem em `app/origami.css` como `light-dark(...)`, e é lá
 * que têm de viver: são as mesmas que o `check:contrast` mede e as mesmas que o
 * fallback SVG usa. O runtime lê-as do elemento, já resolvidas pelo tema, e
 * converte-as para linear antes de as entregar à luz.
 *
 * O passo de conversão não é ornamental. `sRGB` é perceptual e não linear;
 * multiplicar um valor sRGB por um termo de Lambert escurece de mais no meio da
 * rampa e produz uma face cinzenta onde devia haver uma face iluminada. É o
 * mesmo erro que faz fotografias parecerem lavadas quando se mistura em
 * gama errada, e a olho lê-se como «isto não é papel».
 */

export type LinearRgb = readonly [number, number, number];

const CHANNEL = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;

const HEX = /^#([0-9a-f]{3,8})$/i;

/** `#rgb`, `#rrggbb` e as variantes com alfa, que se ignora. */
function parseHexColour(text: string): LinearRgb | null {
  const digits = HEX.exec(text)?.[1];
  if (!digits) return null;

  const expand =
    digits.length === 3 || digits.length === 4
      ? digits
          .slice(0, 3)
          .split("")
          .map((d) => d + d)
      : digits.length === 6 || digits.length === 8
        ? [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 6)]
        : null;

  if (!expand) return null;

  const [r, g, b] = expand.map((pair) => srgbToLinear(parseInt(pair, 16))) as [
    number,
    number,
    number,
  ];
  return [r, g, b];
}

function srgbToLinear(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

/**
 * Aceita o que `getComputedStyle` devolve na prática.
 *
 * Os navegadores resolvem `light-dark()` e devolvem `rgb(r g b)` ou
 * `rgb(r, g, b)` — e alguns devolvem `color(srgb ...)` com valores em `0..1`.
 * Um valor que não se consiga ler devolve `null` e quem chama usa o recurso;
 * uma cor errada por engano é pior do que uma cor previsível.
 */
export function parseCssColour(value: string): LinearRgb | null {
  const text = value.trim();
  if (!text) return null;

  // Hex primeiro, e antes de qualquer coisa numérica: `#e0d9f2` tem dígitos lá
  // dentro (`0`, `9`, `2`) que o regex de canais apanha com prazer, devolvendo
  // um quase-preto plausível em vez de nada. Um valor errado que não falha é
  // pior do que um erro — foi assim que o papel lilás saiu cinzento.
  const hex = parseHexColour(text);
  if (hex) return hex;

  const numbers = text.match(CHANNEL)?.map(Number);
  if (!numbers || numbers.length < 3) return null;

  if (text.startsWith("color(")) {
    // `color(srgb 0.93 0.82 0.76)` — já normalizado.
    const [r, g, b] = numbers.slice(-3) as [number, number, number];
    return [
      srgbToLinear(r * 255),
      srgbToLinear(g * 255),
      srgbToLinear(b * 255),
    ];
  }

  const [r, g, b] = numbers as [number, number, number];
  if ([r, g, b].some((channel) => !Number.isFinite(channel))) return null;
  return [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];
}

export type PaperColours = {
  readonly frontLit: LinearRgb;
  readonly frontShade: LinearRgb;
  readonly backLit: LinearRgb;
  readonly backShade: LinearRgb;
};

/** Usadas quando o CSS ainda não montou. Neutras de propósito. */
const FALLBACK: PaperColours = {
  frontLit: [0.72, 0.62, 0.55],
  frontShade: [0.24, 0.19, 0.17],
  backLit: [0.55, 0.52, 0.5],
  backShade: [0.16, 0.15, 0.15],
};

/**
 * Lê os tokens de papel do elemento onde o canvas vive.
 *
 * Lê do elemento e não de `:root` porque a família de papel é escolhida com
 * `data-paper` no palco: duas cenas na mesma página podem ter papéis
 * diferentes, e é o que o laboratório faz para as comparar lado a lado.
 */
export function readPaperColours(element: Element): PaperColours {
  /*
    Não se lê a custom property; pede-se ao browser que a **use**.

    `getComputedStyle(el).getPropertyValue("--paper-lit")` devolve o valor da
    variável no formato em que foi escrita — aqui hex, noutro sítio podia ser
    `color-mix(...)` ou um `light-dark()` por resolver, conforme o motor. Um
    parser que tente cobrir esses formatos todos está sempre a uma sintaxe de
    distância de devolver silenciosamente a cor errada.

    Substituir a variável em `color` num elemento sonda passa o problema para
    quem o sabe resolver: o valor computado de `color` é sempre `rgb(...)`,
    seja qual for a sintaxe de origem.
  */
  const probe = element.ownerDocument.createElement("span");
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText =
    "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
  element.appendChild(probe);

  const read = (token: string, fallback: LinearRgb): LinearRgb => {
    probe.style.color = "";
    probe.style.color = `var(${token})`;
    return parseCssColour(getComputedStyle(probe).color) ?? fallback;
  };

  try {
    return colours(read);
  } finally {
    probe.remove();
  }
}

function colours(
  read: (token: string, fallback: LinearRgb) => LinearRgb,
): PaperColours {
  return {
    frontLit: read("--paper-lit", FALLBACK.frontLit),
    frontShade: read("--paper-shade", FALLBACK.frontShade),
    backLit: read("--paper-inner", FALLBACK.backLit),
    // O avesso não tem token de sombra próprio: é o mesmo papel visto de trás,
    // portanto escurece a partir da mesma sombra da frente.
    backShade: read("--paper-shade", FALLBACK.backShade),
  };
}
