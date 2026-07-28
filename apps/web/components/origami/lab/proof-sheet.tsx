import { origamiModels } from "@/components/origami/models";
import { OrigamiFigure } from "@/components/origami/origami-figure";
import type { OrigamiModelId } from "@/components/origami/types";
import type { PaperFamilyId, StageId } from "@/components/origami/tokens/paper";

/**
 * A folha de prova de um objeto.
 *
 * A ordem das células é a ordem em que as decisões se tomam, e não a ordem em
 * que ficam bonitas: **silhueta primeiro**. Se o objeto falha a preto sobre
 * branco, nada do que vem a seguir o salva — e foi exatamente assim que a
 * primeira e a segunda versões do grou foram recusadas, antes de terem cor.
 */
export function ProofSheet({
  model,
  paper,
  stage,
}: {
  model: OrigamiModelId;
  paper: PaperFamilyId;
  stage: StageId;
}) {
  const definition = origamiModels[model];

  return (
    <section className="grid gap-3">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-semibold tracking-[-0.02em]">
          {definition.id}
        </h3>
        <p className="text-xs text-[var(--muted-foreground)]">
          {definition.faces.length} faces · {definition.creases.length} vincos ·
          viewBox {definition.viewBox.join(" ")}
        </p>
      </header>

      <div className="origami-lab-grid">
        <figure className="origami-proof">
          <figcaption className="origami-proof-label">
            1 · silhueta (teste de reconhecimento)
          </figcaption>
          <div className="origami-proof-silhouette">
            <OrigamiFigure
              model={model}
              paper={paper}
              showSilhouette
              style={{ width: "160px" }}
            />
          </div>
        </figure>

        <figure className="origami-proof">
          <figcaption className="origami-proof-label">
            2 · faces sem cor
          </figcaption>
          <OrigamiFigure
            model={model}
            paper={paper}
            showWireframe
            style={{ width: "160px", margin: "0 auto" }}
          />
        </figure>

        <figure className="origami-proof">
          <figcaption className="origami-proof-label">
            3 · papel sem fibra
          </figcaption>
          <OrigamiFigure
            model={model}
            paper={paper}
            showTexture={false}
            style={{ width: "160px", margin: "0 auto" }}
          />
        </figure>

        <figure className="origami-proof">
          <figcaption className="origami-proof-label">
            4 · papel no palco
          </figcaption>
          <div className="origami-proof-stage origami-stage" data-stage={stage}>
            <OrigamiFigure
              model={model}
              paper={paper}
              style={{ width: "160px" }}
            />
          </div>
        </figure>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {(["light", "dark"] as const).map((theme) => (
          <figure key={theme} className="origami-proof">
            <figcaption className="origami-proof-label">
              5 · {theme} · 96 / 160 / 320 px
            </figcaption>
            <div
              className="origami-proof-stage origami-lab-theme origami-stage"
              data-theme-preview={theme}
              data-stage={stage}
            >
              <div className="origami-proof-scales">
                {[96, 160, 320].map((size) => (
                  <OrigamiFigure
                    key={size}
                    model={model}
                    paper={paper}
                    style={{ width: `${size}px` }}
                  />
                ))}
              </div>
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}
