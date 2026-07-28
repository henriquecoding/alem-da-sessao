"use client";

import type { CSSProperties } from "react";
import type { OrigamiFallback } from "./asset-loader";
import { OrigamiCanvas } from "./origami-canvas";
import { OrigamiFigure } from "./origami-figure";
import type { OrigamiClipId } from "./runtime/asset";
import type { PaperFamilyId } from "./tokens/paper";
import type { OrigamiModelId } from "./types";

/**
 * A cena da homepage: geometria real onde ela existe, desenho onde ainda não.
 *
 * Este componente é a fronteira entre os dois sistemas, e existe porque a
 * substituição é gradual por decisão e não por acidente. Um modelo passa a usar
 * o runtime quando tem um `source.fold` que dobra e passa os gates — não quando
 * alguém decide que está na altura.
 *
 * Hoje isso são quatro dos seis: `sheet`, `half-fold`, `box` e
 * `suspended-sheet`. `boat` e `crane` continuam nas figuras SVG autoradas à mão
 * até terem padrão de vincos próprio, e o motivo está em
 * `docs/ORIGAMI_RUNTIME.md` §5.
 *
 * ## Porque é que a mistura não parte a leitura
 *
 * Os dois sistemas partilham tudo o que define a linguagem visual: as mesmas
 * famílias de papel (`--paper-lit`, `--paper-shade`, `--paper-inner`), o mesmo
 * palco, a mesma direção de luz. O que muda entre eles é a **profundidade** —
 * um resolve oclusão com `depth buffer` e normais, o outro com ordem de pintura
 * e tons declarados.
 *
 * É uma diferença que se nota se se procurar, e que não produz duas linguagens.
 * A alternativa — segurar o sistema todo até seis modelos estarem prontos —
 * mantinha em produção o defeito que este trabalho existe para corrigir, por
 * causa de dois modelos que ainda não existem.
 */
export function OrigamiScene({
  model,
  paper,
  clip,
  fallbacks,
  label,
  className,
  style,
  enter = false,
}: {
  model: OrigamiModelId;
  paper: PaperFamilyId;
  clip: OrigamiClipId;
  /** Silhuetas vindas do servidor, por modelo compilado. */
  fallbacks: Record<string, OrigamiFallback>;
  label?: string;
  className?: string;
  style?: CSSProperties;
  /** Só vale para as figuras SVG; a cena real anima pelo clip. */
  enter?: boolean;
}) {
  const fallback = fallbacks[model];

  if (!fallback) {
    return (
      <OrigamiFigure
        model={model}
        paper={paper}
        label={label}
        className={className}
        style={style}
        enter={enter}
      />
    );
  }

  return (
    <figure
      className={["origami-stage-shell", className].filter(Boolean).join(" ")}
      style={style}
      data-origami-model={model}
      data-paper={paper}
      {...(label ? {} : { "aria-hidden": "true" })}
    >
      {label ? <figcaption className="sr-only">{label}</figcaption> : null}

      {/*
        Chega no HTML e fica por baixo do canvas para sempre — não é removido
        quando o WebGL monta, só fica invisível. É a diferença entre uma perda
        de contexto ser um pisca-pisca e ser um retângulo vazio.

        O conteúdo é gerado pelo compilador a partir do `source.fold` versionado
        neste repositório e lido do disco no servidor; não há aqui entrada de
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
      <OrigamiCanvas modelId={model} clip={clip} />
    </figure>
  );
}
