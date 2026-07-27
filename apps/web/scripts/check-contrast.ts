import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";

/**
 * `check:contrast` — a engine que impede a composição ilegível.
 *
 * O problema que este check existe para resolver: uma classe como
 * `bg-white/62` é cega ao tema. No modo claro dá uma caixa quase branca com
 * texto escuro; no modo escuro dá exatamente a mesma caixa quase branca, mas
 * o texto que ela herda passou a ser quase branco também. O resultado é texto
 * invisível, e nada no build o apanhava — o teste de paleta só verificava
 * pares que alguém se lembrou de escrever à mão.
 *
 * A abordagem: em vez de verificar uma lista de pares imaginados, este script
 * lê os pares **realmente usados** no código. Para cada elemento JSX extrai as
 * classes de fundo e de texto, resolve-as contra os tokens declarados em
 * `globals.css` (nos dois temas), e calcula o contraste real.
 *
 * Três regras que o tornam útil em vez de barulhento:
 *
 * 1. **Cores cegas ao tema são erro por si só.** `bg-white`, `bg-black` e
 *    literais hexadecimais em superfícies que herdam `--foreground` falham
 *    sem sequer precisar de cálculo: não existe um valor que funcione nos
 *    dois temas.
 * 2. **Um fundo sem cor de texto explícita herda `--foreground`**, e é essa a
 *    combinação que se verifica. Foi precisamente esse o caso que falhou.
 * 3. **O alfa é resolvido por composição** sobre a superfície do tema, porque
 *    `bg-white/62` no escuro não é "branco a 62%", é o cinzento-claro que
 *    resulta de o compor sobre `#1e2120`.
 */

const roots = ["app", "components"];
const cssFile = "app/globals.css";

/** Superfícies com paleta própria declarada no manifesto (§6.2). */
const ownPaletteSurfaces = [
  "load-structures-experience",
  "load-structures-community",
  "estruturas-de-carga",
  "experience-library",
];

/**
 * Superfícies invariantes: têm o mesmo valor nos dois temas, portanto uma cor
 * fixa sobre elas não é cega ao tema — é correta. A barra lateral é escura
 * sempre, por decisão de desenho.
 *
 * Mesmo assim não se escreve `text-white` lá: existe `--sidebar-foreground`
 * para isso, e é ele que aparece nesta lista. Uma cor literal continua a ser
 * erro em qualquer sítio, porque o dia em que a barra lateral mudar de tom
 * ninguém se vai lembrar de a procurar.
 */
const invariantSurfaces = new Set([
  "sidebar",
  "sidebar-raised",
  "sidebar-raised-strong",
  "ink",
  "ink-raised",
]);

/** Tokens de texto que já declaram sobre que superfície invariante assentam. */
const invariantForegrounds = new Set([
  "sidebar-foreground",
  "sidebar-muted",
  "ink-foreground",
  "ink-muted",
]);

/**
 * Classes que indicam que o elemento carrega texto. Sem uma destas, um fundo
 * é decorativo (uma pastilha, um traço, um halo) e verificar a herança de
 * `--foreground` produziria ruído em vez de defeitos.
 */
const carriesText =
  /\b(?:text-(?:xs|sm|base|lg|xl|\d?xl|\[)|font-(?:medium|semibold|bold|mono|serif)|leading-|tracking-)/;

type Rgb = { r: number; g: number; b: number };

function parseHex(hex: string): Rgb | null {
  const value = hex.replace("#", "").trim();
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  };
}

function channel(value: number): number {
  const v = value / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminance({ r, g, b }: Rgb): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

/** Compõe uma cor com alfa sobre um fundo opaco. */
function composite(fg: Rgb, alpha: number, bg: Rgb): Rgb {
  return {
    r: Math.round(fg.r * alpha + bg.r * (1 - alpha)),
    g: Math.round(fg.g * alpha + bg.g * (1 - alpha)),
    b: Math.round(fg.b * alpha + bg.b * (1 - alpha)),
  };
}

type Palette = Record<string, Rgb>;

/**
 * Lê os tokens de `globals.css` para os dois temas.
 *
 * Cada token declara-se uma vez só, e as duas variantes vivem juntas na mesma
 * linha: `--muted: light-dark(#ebe9e5, #292c2b);`. Um valor único — sem
 * `light-dark()` — é um token invariante e vale para os dois temas.
 *
 * Esta função é a razão de a engine não poder mentir por omissão. Enquanto a
 * paleta escura vivia num `@media` à parte, um erro de recorte fazia o script
 * ler zero tokens escuros e ainda assim reportar sucesso — a mesma classe de
 * falha silenciosa que já apareceu no `check:privacy`. Por isso o resultado é
 * validado a seguir: se os dois temas coincidirem, alguma coisa se partiu.
 */
async function readPalettes(): Promise<{ light: Palette; dark: Palette }> {
  const css = await readFile(cssFile, "utf8");
  const light: Palette = {};
  const dark: Palette = {};

  // Aliases: `--success-soft: light-dark(var(--pigment-sage), #22302a);`.
  const alias: Array<{ name: string; theme: "light" | "dark"; of: string }> =
    [];

  const dual =
    /--([\w-]+):\s*light-dark\(\s*(#[0-9a-fA-F]{3,8}|var\(--[\w-]+\))\s*,\s*(#[0-9a-fA-F]{3,8}|var\(--[\w-]+\))\s*\)\s*;/g;
  const single = /--([\w-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g;

  const assign = (
    name: string,
    raw: string,
    target: Palette,
    theme: "light" | "dark",
  ) => {
    const ref = raw.match(/^var\(--([\w-]+)\)$/);
    if (ref) {
      alias.push({ name, theme, of: ref[1]! });
      return;
    }
    const rgb = parseHex(raw);
    if (rgb) target[name] = rgb;
  };

  let match: RegExpExecArray | null;
  while ((match = dual.exec(css)) !== null) {
    assign(match[1]!, match[2]!, light, "light");
    assign(match[1]!, match[3]!, dark, "dark");
  }

  // Tokens invariantes (`--sidebar-muted: #a8ada9;`) valem nos dois temas.
  while ((match = single.exec(css)) !== null) {
    const rgb = parseHex(match[2]!);
    if (!rgb) continue;
    light[match[1]!] ??= rgb;
    dark[match[1]!] ??= rgb;
  }

  for (const { name, theme, of } of alias) {
    const target = theme === "light" ? light : dark;
    const value = target[of];
    if (value) target[name] = value;
  }

  const themesDiffer = Object.keys(light).some(
    (name) =>
      dark[name] &&
      (dark[name]!.r !== light[name]!.r ||
        dark[name]!.g !== light[name]!.g ||
        dark[name]!.b !== light[name]!.b),
  );

  if (Object.keys(light).length < 40 || !themesDiffer) {
    throw new Error(
      `check:contrast não conseguiu ler as duas paletas de ${cssFile} ` +
        `(${Object.keys(light).length} tokens claros, ${Object.keys(dark).length} escuros, ` +
        `diferem: ${themesDiffer}). A engine seria inútil assim — corrija o parser antes de continuar.`,
    );
  }

  return { light, dark };
}

type ColourRef =
  | { kind: "token"; name: string; alpha: number }
  | { kind: "literal"; rgb: Rgb; alpha: number }
  | { kind: "blind"; raw: string };

/** `bg-[var(--surface)]`, `bg-white/62`, `text-[#abc123]`, `bg-black/40`. */
function parseColour(token: string, prefix: "bg" | "text"): ColourRef | null {
  const alphaMatch = token.match(/\/(\d{1,3})$/);
  const alpha = alphaMatch ? Number(alphaMatch[1]) / 100 : 1;
  const base = alphaMatch ? token.slice(0, -alphaMatch[0].length) : token;

  const varMatch = base.match(
    new RegExp(`^${prefix}-\\[var\\(--([\\w-]+)\\)\\]$`),
  );
  if (varMatch) return { kind: "token", name: varMatch[1]!, alpha };

  const hexMatch = base.match(
    new RegExp(`^${prefix}-\\[(#[0-9a-fA-F]{3,8})\\]$`),
  );
  if (hexMatch) {
    const rgb = parseHex(hexMatch[1]!);
    return rgb ? { kind: "literal", rgb, alpha } : null;
  }

  if (base === `${prefix}-white` || base === `${prefix}-black`) {
    return { kind: "blind", raw: base };
  }

  return null;
}

function resolve(ref: ColourRef, palette: Palette, over: Rgb): Rgb | null {
  if (ref.kind === "blind") return null;
  const base = ref.kind === "literal" ? ref.rgb : (palette[ref.name] ?? null);
  if (!base) return null;
  return ref.alpha < 1 ? composite(base, ref.alpha, over) : base;
}

async function filesUnder(path: string): Promise<string[]> {
  const entries = await readdir(path, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.name === "node_modules") continue;
    const child = join(path, entry.name);
    if (entry.isDirectory()) files.push(...(await filesUnder(child)));
    else if (extname(entry.name) === ".tsx") files.push(child);
  }
  return files;
}

async function main() {
  const { light, dark } = await readPalettes();
  const failures: string[] = [];
  let pairsChecked = 0;

  const surfaceOf = (palette: Palette) =>
    palette.surface ?? { r: 255, g: 255, b: 255 };

  for (const root of roots) {
    let files: string[];
    try {
      files = await filesUnder(root);
    } catch {
      continue;
    }

    for (const file of files) {
      const show = relative(".", file).replace(/\\/g, "/");
      if (ownPaletteSurfaces.some((surface) => show.includes(surface)))
        continue;

      const source = await readFile(file, "utf8");
      const line = (index: number) => source.slice(0, index).split("\n").length;

      // Cada string entre aspas é tratada como um conjunto de classes de um
      // elemento. É aproximado, mas é exatamente como o Tailwind as compõe.
      for (const match of source.matchAll(
        /["'`]([^"'`\n]*\b(?:bg|text)-[^"'`\n]*)["'`]/g,
      )) {
        const classes = match[1]!.split(/\s+/);
        const bgToken = classes.find((c) => /^bg-(\[|white|black)/.test(c));
        const textToken = classes.find((c) => /^text-(\[|white|black)/.test(c));
        if (!bgToken) continue;

        const bgRef = parseColour(bgToken, "bg");
        if (!bgRef) continue;

        // Regra 1: uma cor literal é sempre erro. Não existe um valor fixo que
        // sirva os dois temas, e mesmo numa superfície invariante ela deixa de
        // acompanhar a paleta no dia em que essa superfície mudar.
        if (bgRef.kind === "blind" || bgRef.kind === "literal") {
          failures.push(
            `${show}:${line(match.index!)} — "${bgToken}" é uma cor fixa. ` +
              `Use um token: --surface e --muted no conteúdo, --sidebar-raised na barra lateral, --pigment-* nas superfícies de acento.`,
          );
          continue;
        }

        const textRef = textToken ? parseColour(textToken, "text") : null;
        if (
          textRef &&
          (textRef.kind === "blind" || textRef.kind === "literal")
        ) {
          failures.push(
            `${show}:${line(match.index!)} — "${textToken}" é uma cor fixa. ` +
              `Use --foreground, --muted-foreground, --sidebar-foreground ou --primary-foreground.`,
          );
          continue;
        }

        // Um fundo invariante com um texto invariante é um par declarado, e o
        // contraste dele é verificado uma vez só (é igual nos dois temas).
        const onInvariant =
          bgRef.kind === "token" && invariantSurfaces.has(bgRef.name);

        // Regra 2: sem cor de texto explícita o elemento herda --foreground,
        // mas isso só interessa se ele carregar texto de facto.
        if (!textRef && !carriesText.test(match[1]!)) continue;

        for (const [themeName, palette] of [
          ["claro", light],
          ["escuro", dark],
        ] as const) {
          const bg = resolve(bgRef, palette, surfaceOf(palette));
          if (!bg) continue;

          const fg = textRef
            ? resolve(textRef, palette, bg)
            : (palette.foreground ?? null);
          if (!fg) continue;

          // Um fundo invariante herdar `--foreground` é sempre erro: no tema
          // errado o texto desaparece. Tem de declarar o seu par.
          if (onInvariant && !textRef) {
            failures.push(
              `${show}:${line(match.index!)} — "${bgToken}" é uma superfície invariante ` +
                `e o texto herda --foreground, que muda com o tema. Declare --sidebar-foreground ou --ink-foreground.`,
            );
            break;
          }

          if (
            onInvariant &&
            textRef?.kind === "token" &&
            invariantForegrounds.has(textRef.name) &&
            themeName === "escuro"
          ) {
            // Par invariante: já verificado no tema claro, o valor é o mesmo.
            continue;
          }

          pairsChecked += 1;
          const ratio = contrast(fg, bg);
          if (ratio < 4.5) {
            failures.push(
              `${show}:${line(match.index!)} — tema ${themeName}: ` +
                `"${textToken ?? "(herda --foreground)"}" sobre "${bgToken}" ` +
                `dá ${ratio.toFixed(2)}:1, abaixo de 4.5:1 (WCAG AA).`,
            );
          }
        }
      }
    }
  }

  if (failures.length) {
    console.error("check:contrast — composição ilegível (§6.3, WCAG 1.4.3):");
    for (const failure of [...new Set(failures)]) {
      console.error(`  ${failure}`);
    }
    process.exitCode = 1;
  } else {
    console.log(
      `check:contrast passou (${pairsChecked} pares texto/fundo verificados nos dois temas).`,
    );
  }
}

void main();
