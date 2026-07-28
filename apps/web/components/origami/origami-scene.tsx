"use client";

import type { CSSProperties } from "react";
import type { OrigamiFallback } from "./asset-loader";
import { OrigamiCanvas } from "./origami-canvas";
import type { OrigamiClipId } from "./runtime/asset";
import type { PaperFamilyId } from "./tokens/paper";
import type { OrigamiModelId } from "./types";

/**
 * A cena. Um objeto, dobrado a partir de uma folha quadrada.
 *
 * Já não há duas vias. A versão anterior deste ficheiro escolhia entre a
 * geometria real e uma figura SVG desenhada à mão, porque dois dos seis modelos
 * ainda não dobravam. Os seis dobram, as figuras foram apagadas, e o que resta
 * é uma coisa só.
 *
 * ## As duas camadas, e porque é que ambas ficam
 *
 * O SVG que chega no HTML **não é uma ilustração alternativa**: é o frame final
 * da mesma simulação, projetado pela mesma câmara ortográfica, sombreado pela
 * mesma luz e ordenado por profundidade. Quem nunca chega a ter WebGL vê a
 * mesma forma — perde o percurso da dobragem, não perde o objeto.
 *
 * E não desaparece quando o canvas monta: fica por baixo, invisível. É a
 * diferença entre uma perda de contexto WebGL ser um pisca-pisca e ser um
 * retângulo vazio.
 */
export function OrigamiScene({
  model,
  paper,
  clip,
  fallbacks,
  label,
  className,
  style,
}: {
  model: OrigamiModelId;
  paper: PaperFamilyId;
  clip: OrigamiClipId;
  /** Silhuetas vindas do servidor, por modelo. */
  fallbacks: Record<string, OrigamiFallback>;
  /**
   * Presente: a cena transmite significado e é anunciada. Ausente: é decorativa
   * e sai da árvore de acessibilidade. Não há terceira via — um objeto sem nome
   * e sem `aria-hidden` é ruído para quem usa leitor de ecrã.
   */
  label?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const fallback = fallbacks[model];

  if (!fallback) {
    // Um modelo por compilar reserva o espaço e não desenha nada. Não deve
    // acontecer — `check:origami-runtime` exige os seis — mas partir a página
    // por causa de um ficheiro em falta seria pior do que um espaço vazio.
    return (
      <div
        className={["origami-stage-shell", className].filter(Boolean).join(" ")}
        style={style}
        data-origami-model={model}
        data-origami-state="missing"
        data-paper={paper}
      />
    );
  }

  return (
    <figure
      className={["origami-stage-shell", className].filter(Boolean).join(" ")}
      style={style}
      data-origami-model={model}
      data-origami-state="ready"
      data-paper={paper}
      {...(label ? {} : { "aria-hidden": "true" })}
    >
      {label ? <figcaption className="sr-only">{label}</figcaption> : null}

      {/*
        Gerado pelo compilador a partir do `source.fold` versionado neste
        repositório e lido do disco no servidor. Não há aqui entrada de
        utilizador nenhuma.
      */}
      <svg
        className="origami-fallback"
        viewBox={fallback.viewBox}
        aria-hidden="true"
        focusable="false"
        shapeRendering="geometricPrecision"
        dangerouslySetInnerHTML={{ __html: fallback.svg }}
      />

      {/*
        Sem `key`: mudar de modelo troca o asset dentro do mesmo canvas em vez
        de destruir e recriar o contexto WebGL. Um contexto novo por cada
        escolha seria trabalho real de GPU para não mudar um pixel do resultado.
      */}
      <OrigamiCanvas modelId={model} clip={clip} paper={paper} />
    </figure>
  );
}
