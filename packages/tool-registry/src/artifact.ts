/**
 * Composição procedural determinística — relatório v2 §4.1.
 *
 * Toda experiência produz **um objeto**, não um "concluído". Uma tarefa
 * concluída desaparece; um artefacto acumula, e ao fim de seis meses a pessoa
 * tem uma coleção que conta uma história sem nunca pontuar ninguém.
 *
 * Três restrições que este módulo faz cumprir:
 *
 * 1. **Determinismo.** Mesma entrada, mesma imagem, sempre. Nada aqui chama
 *    `Math.random` nem `Date.now`; toda a variação vem de um hash estável do
 *    conteúdo. É o que permite versionar, comparar e reexportar.
 * 2. **Regista forma, não valor** (a restrição ética do §4.1). O artefacto não
 *    pode ficar "melhor" quando a pessoa está "melhor". Nenhuma dimensão
 *    visual é ordenada por qualidade: a estrutura não desaba nem se estabiliza
 *    com respostas "boas", porque isso reintroduziria o score pela porta dos
 *    fundos (§6.6).
 * 3. **Custo marginal ≈ 0** (§1.6). SVG puro, sem upload e sem média pesada —
 *    é unit economics, não só estética, num produto onde o cliente não paga.
 */

export type ArtifactRenderer =
  "load-structures-plan" | "session-inventory-constellation";

/** Todo artefacto carrega a proveniência necessária para o reabrir e comparar. */
export type ArtifactMeta = {
  toolId: string;
  toolVersion: string;
  locale: "pt-PT" | "pt-BR";
  /** ISO, fornecido por quem chama — nunca lido do relógio aqui dentro. */
  createdAt: string;
};

export type LoadStructuresArtifactInput = {
  loads: readonly {
    id: string;
    label: string;
    impactScale: number;
    durationMonths: number;
    ownership: "mine" | "shared" | "inherited" | "unclear";
    movement: "protect" | "ask" | "negotiate" | "return" | "observe";
  }[];
  support: string;
  anchored: boolean;
};

export type SessionInventoryArtifactInput = {
  fragments: readonly {
    id: string;
    label: string;
    state: "clear" | "alive" | "confused" | "slow";
    destination: "revisit" | "observe" | "practice" | "leave";
  }[];
};

/**
 * FNV-1a de 32 bits. Escolhido por ser curto, estável entre motores e sem
 * dependências — a posição de cada elemento tem de ser reproduzível daqui a
 * um ano, noutra máquina, na mesma versão da ferramenta.
 */
export function stableHash(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** Um valor determinístico em [0, 1) derivado de uma semente textual. */
function unitFrom(seed: string): number {
  return (stableHash(seed) % 100000) / 100000;
}

/** SVG é XML: qualquer texto da pessoa tem de ser escapado antes de entrar. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Padrão de hachura por proveniência. Cada tipo de posse tem uma textura
 * distinta — não uma intensidade, para que nenhuma leitura sugira "melhor" ou
 * "pior". `unclear` é aberto porque não saber ainda é um estado legítimo.
 */
const ownershipHatch: Record<
  LoadStructuresArtifactInput["loads"][number]["ownership"],
  string
> = {
  mine: "M0 3H12",
  shared: "M0 3H12 M0 9H12",
  inherited: "M0 0L12 12",
  unclear: "M0 6H5",
};

/**
 * O movimento ensaiado define o remate do topo da viga: uma forma, não um
 * tamanho. "Proteger" fecha, "pedir" abre, "negociar" divide, "devolver"
 * inclina, "observar" deixa em aberto.
 */
const movementCap: Record<
  LoadStructuresArtifactInput["loads"][number]["movement"],
  (x: number, width: number, y: number) => string
> = {
  protect: (x, width, y) =>
    `<rect x="${x}" y="${y - 6}" width="${width}" height="6" rx="2" />`,
  ask: (x, width, y) =>
    `<path d="M${x} ${y} L${x + width / 2} ${y - 10} L${x + width} ${y}" fill="none" stroke-width="2.5" />`,
  negotiate: (x, width, y) =>
    `<path d="M${x} ${y - 3} H${x + width * 0.42} M${x + width * 0.58} ${y - 3} H${x + width}" fill="none" stroke-width="2.5" />`,
  return: (x, width, y) =>
    `<path d="M${x} ${y - 2} L${x + width} ${y - 9}" fill="none" stroke-width="2.5" />`,
  observe: (x, width, y) =>
    `<circle cx="${x + width / 2}" cy="${y - 6}" r="3" fill="none" stroke-width="2" />`,
};

/**
 * A planta de cargas.
 *
 * Cada responsabilidade é uma viga sobre a fundação. A largura vem da escala
 * de impacto e a altura da duração — ambas descrições, não notas. A ordem
 * horizontal vem do hash do identificador, para que a planta da mesma pessoa
 * seja reconhecível entre sessões sem que ela tenha de a arrumar.
 */
export function renderLoadStructuresPlan(
  input: LoadStructuresArtifactInput,
  meta: ArtifactMeta,
): string {
  const width = 760;
  const height = 460;
  const baseline = 372;
  const palette = {
    ink: "#15171b",
    surface: "#1c1e23",
    line: "#3a3e46",
    ember: "#d58b57",
    text: "#e9e5dd",
    muted: "#8b909b",
  };

  const columns = input.loads.length || 1;
  const slot = (width - 120) / columns;

  const beams = input.loads
    .map((load, index) => {
      const beamWidth = 34 + load.impactScale * 11;
      const beamHeight = 60 + Math.min(load.durationMonths, 120) * 1.55;
      // O deslocamento dentro da coluna é determinístico, o que dá à planta
      // uma irregularidade de coisa construída sem a tornar aleatória.
      const jitter = Math.round(unitFrom(load.id) * (slot - beamWidth - 12));
      const x = Math.round(60 + index * slot + jitter);
      const y = baseline - beamHeight;

      return `
    <g>
      <rect x="${x}" y="${y}" width="${beamWidth}" height="${beamHeight}" rx="3"
            fill="${palette.surface}" stroke="${palette.line}" stroke-width="2" />
      <rect x="${x}" y="${y}" width="${beamWidth}" height="${beamHeight}" rx="3"
            fill="url(#hatch-${load.ownership})" />
      <g stroke="${palette.ember}" fill="${palette.ember}">
        ${movementCap[load.movement](x, beamWidth, y)}
      </g>
      <text x="${x + beamWidth / 2}" y="${baseline + 22}" text-anchor="middle"
            font-family="ui-monospace, monospace" font-size="9"
            letter-spacing="1.4" fill="${palette.muted}">${escapeXml(
              load.label.slice(0, 18).toUpperCase(),
            )}</text>
    </g>`;
    })
    .join("");

  const hatches = Object.entries(ownershipHatch)
    .map(
      ([key, path]) => `
    <pattern id="hatch-${key}" width="12" height="12" patternUnits="userSpaceOnUse"
             patternTransform="rotate(-11)">
      <path d="${path}" stroke="${palette.ember}" stroke-opacity="0.34" stroke-width="1" />
    </pattern>`,
    )
    .join("");

  // A ancoragem é uma marca na fundação, presente ou ausente. Nunca uma barra
  // que enche: isso seria progresso disfarçado.
  const anchor = input.anchored
    ? `<g>
      <circle cx="${width / 2}" cy="${baseline + 46}" r="9" fill="none"
              stroke="${palette.ember}" stroke-width="2.5" />
      <path d="M${width / 2} ${baseline + 8} V${baseline + 37}" stroke="${palette.ember}"
            stroke-width="2.5" stroke-linecap="round" />
    </g>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"
     width="${width}" height="${height}" role="img"
     aria-label="Planta das estruturas de carga">
  <defs>${hatches}</defs>
  <rect width="${width}" height="${height}" fill="${palette.ink}" />
  <g opacity="0.5" stroke="${palette.line}" stroke-width="0.5">
    ${Array.from({ length: 9 }, (_, i) => `<path d="M0 ${i * 46} H${width}" />`).join("")}
  </g>
  ${beams}
  <path d="M40 ${baseline} H${width - 40}" stroke="${palette.ember}" stroke-width="5"
        stroke-linecap="round" />
  ${anchor}
  <text x="40" y="46" font-family="ui-monospace, monospace" font-size="10"
        letter-spacing="2.6" fill="${palette.muted}">ESTRUTURAS DE CARGA</text>
  <text x="40" y="${height - 26}" font-family="ui-monospace, monospace" font-size="9"
        letter-spacing="1.6" fill="${palette.muted}">${escapeXml(
          `${meta.toolVersion} · ${meta.createdAt.slice(0, 10)} · ${input.loads.length} carga(s)`,
        )}</text>
  <text x="${width - 40}" y="${height - 26}" text-anchor="end"
        font-family="ui-monospace, monospace" font-size="9" letter-spacing="1.6"
        fill="${palette.muted}">${escapeXml(input.support.slice(0, 28).toUpperCase())}</text>
</svg>`;
}

/**
 * A constelação do inventário.
 *
 * Cada fragmento é um ponto colocado numa órbita determinística. Os traços
 * ligam fragmentos que partilham destino — a figura emerge das decisões da
 * pessoa, não de uma avaliação delas. Um inventário de um fragmento é uma
 * constelação legítima de um ponto.
 */
export function renderSessionInventoryConstellation(
  input: SessionInventoryArtifactInput,
  meta: ArtifactMeta,
): string {
  const size = 620;
  const centre = size / 2;
  const palette = {
    surface: "#fffcfa",
    line: "#ded8df",
    ink: "#282431",
    muted: "#6b6373",
    primary: "#6848c6",
  };

  // O estado dá a forma do ponto; nenhum é maior ou mais brilhante que outro,
  // porque confusão e clareza têm o mesmo direito a estar na figura.
  const stateShape: Record<
    SessionInventoryArtifactInput["fragments"][number]["state"],
    (x: number, y: number) => string
  > = {
    clear: (x, y) => `<circle cx="${x}" cy="${y}" r="9" />`,
    alive: (x, y) =>
      `<circle cx="${x}" cy="${y}" r="9" /><circle cx="${x}" cy="${y}" r="15" fill="none" stroke-width="1.5" />`,
    confused: (x, y) =>
      `<path d="M${x - 9} ${y - 9} L${x + 9} ${y + 9} M${x + 9} ${y - 9} L${x - 9} ${y + 9}" stroke-width="3" stroke-linecap="round" fill="none" />`,
    slow: (x, y) =>
      `<circle cx="${x}" cy="${y}" r="9" fill="none" stroke-width="3" stroke-dasharray="3 4" />`,
  };

  const points = input.fragments.map((fragment, index) => {
    const count = input.fragments.length;
    // Ângulo base distribuído + desvio determinístico do próprio fragmento.
    const angle =
      (index / Math.max(count, 1)) * Math.PI * 2 +
      unitFrom(fragment.id) * 0.9 -
      Math.PI / 2;
    const radius = 92 + unitFrom(`${fragment.id}:r`) * 96;
    return {
      ...fragment,
      x: Math.round(centre + Math.cos(angle) * radius),
      y: Math.round(centre + Math.sin(angle) * radius),
    };
  });

  const edges = points
    .flatMap((from, i) =>
      points.slice(i + 1).map((to) =>
        from.destination === to.destination
          ? `<path d="M${from.x} ${from.y} L${to.x} ${to.y}" stroke="${palette.primary}"
                   stroke-opacity="0.32" stroke-width="1.25" />`
          : "",
      ),
    )
    .join("");

  const nodes = points
    .map(
      (point) => `
    <g stroke="${palette.primary}" fill="${palette.primary}">
      ${stateShape[point.state](point.x, point.y)}
    </g>
    <text x="${point.x}" y="${point.y + 32}" text-anchor="middle"
          font-family="ui-sans-serif, system-ui" font-size="11" font-weight="600"
          fill="${palette.ink}">${escapeXml(point.label.slice(0, 22))}</text>`,
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"
     width="${size}" height="${size}" role="img"
     aria-label="Constelação do inventário da sessão">
  <rect width="${size}" height="${size}" fill="${palette.surface}" />
  <circle cx="${centre}" cy="${centre}" r="200" fill="none" stroke="${palette.line}"
          stroke-width="1" stroke-dasharray="2 8" />
  <circle cx="${centre}" cy="${centre}" r="120" fill="none" stroke="${palette.line}"
          stroke-width="1" stroke-dasharray="2 8" />
  ${edges}
  ${nodes}
  <text x="${centre}" y="38" text-anchor="middle" font-family="ui-monospace, monospace"
        font-size="10" letter-spacing="2.4" fill="${palette.muted}">INVENTÁRIO DA SESSÃO</text>
  <text x="${centre}" y="${size - 30}" text-anchor="middle"
        font-family="ui-monospace, monospace" font-size="9" letter-spacing="1.6"
        fill="${palette.muted}">${escapeXml(
          `${meta.toolVersion} · ${meta.createdAt.slice(0, 10)} · ${input.fragments.length} fragmento(s)`,
        )}</text>
</svg>`;
}
