import { loadCompiledAsset } from "./asset-loader";
import { OrigamiCanvas } from "./origami-canvas";
import type { OrigamiClipId } from "./runtime/asset";

/**
 * A cena completa: o fallback que chega no HTML e o canvas que o melhora.
 *
 * É um componente de servidor. O SVG que sai daqui é o **frame final da mesma
 * simulação** que o canvas vai desenhar, projetado pela mesma câmara
 * ortográfica, sombreado pela mesma luz e ordenado pelo algoritmo do pintor.
 * Não é uma ilustração alternativa: é o mesmo objeto, sem interpolação.
 *
 * Essa equivalência é o que torna o fallback honesto. A versão anterior tinha
 * dois desenhos diferentes a fingir-se do mesmo objeto, e quem via o segundo
 * via outra coisa. Aqui, quem não tiver WebGL vê exatamente a forma que teria
 * visto — perde o percurso da dobragem, não perde a forma.
 *
 * As cores ficam em `var(--paper-*)`, portanto o tema continua a funcionar sem
 * o canvas e sem JavaScript.
 */

export async function OrigamiStage({
  modelId,
  clip,
  paper,
  label,
  className,
}: {
  modelId: string;
  clip: OrigamiClipId;
  paper: string;
  /**
   * Presente: a cena transmite significado e é anunciada. Ausente: é decorativa
   * e sai da árvore de acessibilidade. Não há terceira via — um objeto sem nome
   * e sem `aria-hidden` é ruído para quem usa leitor de ecrã.
   */
  label?: string;
  className?: string;
}) {
  const asset = await loadCompiledAsset(modelId);

  if (!asset) {
    // Um modelo por compilar não desenha nada e não parte a página. O estado é
    // legível no DOM para o laboratório o poder mostrar como o que é.
    return (
      <div
        className={["origami-stage-shell", className].filter(Boolean).join(" ")}
        data-origami-model={modelId}
        data-origami-state="missing"
        data-paper={paper}
      />
    );
  }

  return (
    <figure
      className={["origami-stage-shell", className].filter(Boolean).join(" ")}
      data-origami-model={modelId}
      data-origami-state="ready"
      data-paper={paper}
      {...(label ? {} : { "aria-hidden": "true" })}
    >
      {label ? <figcaption className="sr-only">{label}</figcaption> : null}

      <svg
        className="origami-fallback"
        viewBox={asset.fallback.viewBox}
        aria-hidden="true"
        focusable="false"
        shapeRendering="geometricPrecision"
        // O conteúdo vem do compilador, não de entrada de utilizador: são
        // polígonos e um `path` gerados a partir do `source.fold` versionado
        // neste repositório, e o ficheiro é lido do disco no servidor.
        dangerouslySetInnerHTML={{ __html: asset.fallback.svg }}
      />

      <OrigamiCanvas modelId={modelId} clip={clip} />
    </figure>
  );
}
