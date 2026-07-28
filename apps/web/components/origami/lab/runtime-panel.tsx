import { loadCompiledAsset, loadProvenance } from "../asset-loader";
import { OrigamiStage } from "../origami-stage";

/**
 * O painel que prova que a forma veio de uma folha.
 *
 * Tudo o resto no laboratório compara direções de arte: palco, papel, tema.
 * Este bloco responde a outra pergunta, e é a pergunta que a versão anterior
 * não conseguia responder — *isto dobra mesmo?*
 *
 * Para cada modelo mostra três coisas ao lado uma da outra:
 *
 * 1. **O padrão de vincos**, lido diretamente do `source.fold`. É a folha
 *    quadrada com os montes e os vales onde o autor os pôs.
 * 2. **A cena a correr**, com o mesmo asset que a homepage carregaria.
 * 3. **Os números da simulação**, que são o que decide se passa.
 *
 * Quem olha para os três em conjunto consegue verificar a cadeia inteira sem
 * confiar em nenhuma afirmação: o quadrado à esquerda, os vincos marcados, e à
 * direita o objeto que sai deles.
 */

const MODELS = ["sheet", "half-fold", "box", "suspended-sheet"] as const;

const PAPER: Record<string, string> = {
  sheet: "apricot",
  "half-fold": "apricot",
  box: "jade",
  "suspended-sheet": "lilac",
};

type FoldFile = {
  vertices_coords: number[][];
  edges_vertices: [number, number][];
  edges_assignment: string[];
  edges_foldAngle: (number | null)[];
  file_title: string;
  file_description?: string;
  file_frames?: { frame_title?: string }[];
};

async function readSource(modelId: string): Promise<FoldFile | null> {
  try {
    const { readFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    return JSON.parse(
      await readFile(
        join(process.cwd(), "public", "origami", modelId, "source.fold"),
        "utf8",
      ),
    ) as FoldFile;
  } catch {
    return null;
  }
}

/**
 * O padrão de vincos, desenhado a partir do FOLD e não de um SVG separado.
 *
 * Monte a tracejado, vale a cheio, fronteira em traço grosso — a convenção dos
 * diagramas de origami. Se este desenho e o objeto ao lado discordarem, um dos
 * dois está errado, e é exatamente isso que este painel existe para deixar
 * visível.
 */
function CreasePattern({ source }: { source: FoldFile }) {
  const scale = 220;
  const project = (index: number) => {
    const [x = 0, y = 0] = source.vertices_coords[index] ?? [];
    return [(x + 0.5) * scale, (0.5 - y) * scale];
  };

  return (
    <svg
      viewBox={`-8 -8 ${scale + 16} ${scale + 16}`}
      className="origami-crease-pattern"
      role="img"
      aria-label={`Padrão de vincos de ${source.file_title}`}
    >
      {source.edges_vertices.map((edge, index) => {
        const [ax, ay] = project(edge[0]);
        const [bx, by] = project(edge[1]);
        const assignment = source.edges_assignment[index] ?? "F";
        const angle = source.edges_foldAngle[index];

        return (
          <line
            key={`${edge[0]}-${edge[1]}`}
            x1={ax}
            y1={ay}
            x2={bx}
            y2={by}
            data-assignment={assignment}
            vectorEffect="non-scaling-stroke"
          >
            <title>
              {`${edge[0]}–${edge[1]} · ${assignment}${
                angle === null || angle === undefined
                  ? ""
                  : ` · ${angle.toFixed(1)}°`
              }`}
            </title>
          </line>
        );
      })}
    </svg>
  );
}

function Metric({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div className="grid gap-0.5">
      <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
        {label}
      </dt>
      <dd
        className="font-mono text-sm"
        style={{ color: ok ? undefined : "var(--destructive, #b3261e)" }}
      >
        {value}
        {ok ? "" : " ✗"}
      </dd>
    </div>
  );
}

export async function RuntimePanel() {
  const entries = await Promise.all(
    MODELS.map(async (id) => ({
      id,
      asset: await loadCompiledAsset(id),
      provenance: await loadProvenance(id),
      source: await readSource(id),
    })),
  );

  return (
    <div className="grid gap-8">
      {entries.map(({ id, asset, provenance, source }) => {
        if (!asset || !source) {
          return (
            <p key={id} className="text-sm text-[var(--muted-foreground)]">
              <code>{id}</code> ainda não tem um asset compilado. Corre{" "}
              <code>pnpm origami:compile --model {id}</code>.
            </p>
          );
        }

        const d = asset.diagnostics;
        const stages = source.file_frames?.length ?? 1;

        return (
          <article key={id} className="grid gap-3">
            <header className="grid gap-1">
              <h3 className="text-lg font-semibold tracking-[-0.03em]">
                {source.file_title}{" "}
                <code className="font-mono text-xs font-normal text-[var(--muted-foreground)]">
                  {id}
                </code>
              </h3>
              <p className="max-w-[70ch] text-sm leading-6 text-[var(--muted-foreground)]">
                {source.file_description}
              </p>
            </header>

            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)]">
              <figure className="grid gap-2">
                <figcaption className="origami-proof-label">
                  Padrão de vincos · {source.vertices_coords.length} vértices,{" "}
                  {source.edges_vertices.length} arestas
                </figcaption>
                <div
                  className="origami-stage rounded-xl p-4"
                  data-stage="atelier"
                >
                  <CreasePattern source={source} />
                </div>
              </figure>

              <figure className="grid gap-2">
                <figcaption className="origami-proof-label">
                  Objeto · {asset.triangles.length / 3} triângulos,{" "}
                  {asset.track.frameCount} frames, {stages}{" "}
                  {stages === 1 ? "etapa" : "etapas"}
                </figcaption>
                <div
                  className="origami-stage rounded-xl p-4"
                  data-stage="atelier"
                  data-paper={PAPER[id]}
                >
                  <OrigamiStage
                    modelId={id}
                    clip="forming-to-formed"
                    paper={PAPER[id] ?? "mist"}
                    label={`${source.file_title}, dobrado a partir de uma folha quadrada`}
                  />
                </div>
              </figure>

              <div className="grid gap-2">
                <p className="origami-proof-label">Medições da simulação</p>
                <dl className="grid grid-cols-2 gap-3 rounded-xl border border-[var(--border)] p-4">
                  <Metric
                    label="deformação"
                    value={`${(d.maxEdgeStrain * 100).toFixed(4)}%`}
                    ok={d.maxEdgeStrain <= 0.0025}
                  />
                  <Metric
                    label="auto-interseções"
                    value={String(d.selfIntersectionCount)}
                    ok={d.selfIntersectionCount === 0}
                  />
                  <Metric
                    label="triâng. degenerados"
                    value={String(d.degenerateTriangleCount)}
                    ok={d.degenerateTriangleCount === 0}
                  />
                  <Metric
                    label="planaridade"
                    value={`${((d.maxFacePlanarityError * 180) / Math.PI).toFixed(2)}°`}
                    ok={d.maxFacePlanarityError < (2 * Math.PI) / 180}
                  />
                  <Metric
                    label="erro angular"
                    value={`${d.finalAngleErrorDegrees.toFixed(2)}°`}
                    ok={d.finalAngleErrorDegrees < 6}
                  />
                  <Metric
                    label="quantização"
                    value={d.quantizationError.toExponential(1)}
                    ok={d.quantizationError < 1e-4}
                  />
                </dl>
                <p className="font-mono text-[10px] leading-4 text-[var(--muted-foreground)]">
                  sha256 {asset.sourceSha256.slice(0, 16)}…
                  <br />
                  aprovação humana:{" "}
                  {Object.entries(provenance?.approval ?? {})
                    .map(([key, value]) => `${key}=${value ? "sim" : "não"}`)
                    .join(" ")}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
