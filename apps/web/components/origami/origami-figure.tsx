import type { CSSProperties } from "react";
import { origamiModels } from "./models";
import { pointsAttribute, type OrigamiModelId } from "./types";
import type { PaperFamilyId } from "./tokens/paper";

/**
 * O renderizador. Um componente de servidor: não tem estado, não tem efeitos,
 * e o HTML do objeto chega pronto no primeiro byte.
 *
 * Quatro decisões de desenho, todas contra defeitos concretos da versão
 * anterior:
 *
 * **1. As faces não têm `stroke`.** Aplicar contorno a cada polígono produz
 * linhas duplicadas onde duas faces se encostam e costuras escuras onde não
 * deviam existir. Aqui há exatamente três camadas de linha: um contorno
 * exterior único, os vincos intencionais, e as arestas de sobreposição — e
 * cada uma existe porque descreve alguma coisa que o papel faz.
 *
 * **2. `vector-effect="non-scaling-stroke"`.** O mesmo modelo aparece a 96 px
 * e a 320 px. Sem isto o contorno engorda proporcionalmente e o objeto grande
 * parece um autocolante.
 *
 * **3. A sombra é uma forma, não um filtro.** Dois elipsoides estáticos, sem
 * `feGaussianBlur`: um desfoque SVG numa área grande custa repintura em cada
 * frame de qualquer animação que passe por perto, e o ganho visual sobre duas
 * elipses é nulo a esta escala.
 *
 * **4. A fibra do papel é opcional e degrada em silêncio.** O `<pattern>` vive
 * uma vez por página em `OrigamiDefs`; se não estiver montado, o `fill` cai
 * para o valor de recurso transparente e o objeto continua correto. Nenhuma
 * leitura depende da textura.
 */
export function OrigamiFigure({
  model,
  paper,
  label,
  className,
  style,
  showSilhouette = false,
  showWireframe = false,
  showTexture = true,
  showShadow = true,
  enter = false,
}: {
  model: OrigamiModelId;
  paper: PaperFamilyId;
  /**
   * Presente: a cena transmite significado e é anunciada. Ausente: é
   * decorativa e desaparece da árvore de acessibilidade. Não há terceira via —
   * um SVG sem `aria-hidden` e sem nome é ruído para quem usa leitor de ecrã.
   */
  label?: string;
  className?: string;
  style?: CSSProperties;
  /** Folha de prova: só a silhueta, a preto. */
  showSilhouette?: boolean;
  /** Folha de prova: as faces sem cor, só as arestas. */
  showWireframe?: boolean;
  showTexture?: boolean;
  showShadow?: boolean;
  /** Dispara a sequência de dobra ao montar. Só quando houve uma escolha. */
  enter?: boolean;
}) {
  const definition = origamiModels[model];
  const [x, y, width, height] = definition.viewBox;

  return (
    <svg
      className={["origami-figure", className].filter(Boolean).join(" ")}
      style={style}
      viewBox={`${x} ${y} ${width} ${height}`}
      data-origami-model={model}
      data-paper={paper}
      data-enter={enter ? "true" : undefined}
      data-mode={
        showSilhouette ? "silhouette" : showWireframe ? "wireframe" : "paper"
      }
      shapeRendering="geometricPrecision"
      focusable="false"
      {...(label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": "true" })}
    >
      {showShadow && !showSilhouette && !showWireframe ? (
        <g className="origami-shadow">
          <path className="origami-shadow-ambient" d={definition.shadowPath} />
          <path className="origami-shadow-contact" d={definition.shadowPath} />
        </g>
      ) : null}

      {showSilhouette ? (
        <path className="origami-silhouette" d={definition.silhouettePath} />
      ) : (
        <>
          {!showWireframe ? (
            <g className="origami-faces">
              {definition.faces.map((face, index) => (
                <polygon
                  key={face.id}
                  className="origami-face"
                  data-tone={face.tone}
                  data-face={face.id}
                  points={pointsAttribute(face.points)}
                  style={{ "--face-index": index } as CSSProperties}
                />
              ))}
            </g>
          ) : null}

          {showTexture && !showWireframe ? (
            <path
              className="origami-fiber"
              d={definition.silhouettePath}
              fill="url(#origami-fiber) rgba(0,0,0,0)"
            />
          ) : null}

          <g className="origami-creases">
            {definition.creases.map((crease) => (
              <path
                key={crease.id}
                className="origami-crease"
                data-kind={crease.kind}
                d={crease.path}
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="round"
                strokeLinecap="round"
                fill="none"
              />
            ))}
          </g>

          <path
            className="origami-outline"
            d={definition.silhouettePath}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            fill="none"
          />
        </>
      )}
    </svg>
  );
}

/**
 * A fibra do papel, uma vez por página.
 *
 * Linhas determinísticas e não `feTurbulence`: o ruído procedural é bonito
 * numa captura e caro em cada repintura, e a diferença entre os dois a 1x DPR
 * não sobrevive a uma compressão de imagem.
 */
export function OrigamiDefs() {
  return (
    <svg
      className="origami-defs"
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Três unidades de `viewBox`, não nove. A primeira versão tinha a
            malha do tamanho certo para uma captura de perto e, no palco a
            420 px, lia-se papel milimétrico — o objeto passava a parecer um
            diagrama. Fibra é o que não se vê; é o que só se nota se
            desaparecer. */}
        <pattern
          id="origami-fiber"
          width="3"
          height="3"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(24)"
        >
          <path
            d="M0 1h3"
            className="origami-fiber-line"
            strokeWidth="0.35"
            fill="none"
          />
        </pattern>
      </defs>
    </svg>
  );
}
