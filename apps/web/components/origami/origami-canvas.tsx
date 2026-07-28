"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  isCompiledAsset,
  type CompiledOrigamiAsset,
  type OrigamiClipId,
} from "./runtime/asset";
import { OrigamiRenderer, type RenderSnapshot } from "./runtime/renderer";
import {
  OrigamiTimeline,
  useOrigamiAnimation,
  type TimelineSnapshot,
} from "./use-origami-timeline";

/**
 * A ilha de cliente. É o único componente da cena que carrega JavaScript.
 *
 * Tudo o que a pessoa precisa de perceber já chegou no HTML: o título, as
 * escolhas, e a silhueta do objeto em SVG. Este componente acrescenta
 * profundidade a sério — oclusão por `depth buffer`, o avesso do papel com
 * material próprio, a luz a responder à normal de cada face — e desaparece sem
 * consequências se o dispositivo não puder com ele.
 *
 * ## O que faz com que não seja um peso
 *
 * O asset só é pedido quando a cena está perto do ecrã. O renderizador só é
 * criado depois de o asset chegar. O `requestAnimationFrame` só corre durante
 * uma transição. Uma cena parada custa exatamente zero — nem um frame, nem um
 * pedido, nem um listener a fazer trabalho.
 */

export function OrigamiCanvas({
  modelId,
  clip,
  paper,
  reducedMotionDefault = false,
  onReady,
  className,
}: {
  modelId: string;
  /**
   * O clip a tocar. Mudar esta prop dispara a transição — é o estado semântico
   * que conduz a cena, e não o contrário.
   */
  clip: OrigamiClipId;
  /**
   * A família de papel em vigor. O canvas não a usa para pintar — as cores vêm
   * dos tokens CSS no elemento pai — mas precisa de saber **quando** mudou.
   *
   * Sem isto, as cores eram lidas uma vez ao carregar o asset e nunca mais: uma
   * escolha que mudasse o papel sem trocar de modelo ficava a pintar o papel
   * anterior, e a cena que muda de cor no meio de uma transição é a única que
   * ninguém repara que está errada.
   */
  paper?: string;
  reducedMotionDefault?: boolean;
  onReady?: (ready: boolean) => void;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<OrigamiRenderer | null>(null);
  const [asset, setAsset] = useState<CompiledOrigamiAsset | null>(null);
  // A linha de tempo é estado e não `ref`: `useOrigamiAnimation` precisa de a
  // ver mudar para voltar a criar o `play`. Num `ref`, o hook ficaria preso ao
  // `null` do primeiro render e nenhuma transição chegaria a começar.
  const [timeline, setTimeline] = useState<OrigamiTimeline | null>(null);
  const [ready, setReady] = useState(false);
  // Sem `IntersectionObserver` não há como saber quando a cena se aproxima, e a
  // resposta certa é carregar já — decidido no estado inicial para não haver um
  // `setState` síncrono dentro de um efeito.
  const [near, setNear] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  // `onReady` costuma chegar como função inline. Guardá-la numa `ref` evita
  // que a identidade nova a cada render volte a montar o contexto WebGL.
  const readyCallback = useRef(onReady);
  useEffect(() => {
    readyCallback.current = onReady;
  });

  // 1. Só pedir o asset quando a cena está a chegar ao ecrã. Numa homepage com
  //    secções abaixo da dobra, pré-carregar quatro modelos em rede móvel é
  //    gastar o plano de dados de alguém em ilustração.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || near) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setNear(true);
      },
      { rootMargin: "200px" },
    );
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [near]);

  // 2. Carregar. Um pedido cancelado a meio não deve conseguir montar nada.
  useEffect(() => {
    if (!near) return;
    const controller = new AbortController();

    void (async () => {
      try {
        const response = await fetch(`/origami/${modelId}/model.ors.json`, {
          signal: controller.signal,
          cache: "force-cache",
        });
        if (!response.ok) return;
        const parsed: unknown = await response.json();
        if (isCompiledAsset(parsed)) setAsset(parsed);
      } catch {
        // Rede em baixo, asset por compilar, pedido cancelado. Nenhum destes é
        // motivo para a página falhar: o fallback já está desenhado por baixo.
      }
    })();

    return () => controller.abort();
  }, [modelId, near]);

  /*
    O último frame pedido, guardado para poder ser repintado sem a linha do
    tempo. Uma mudança de papel não avança a dobragem — repinta o mesmo frame
    com outra cor — e sem isto não havia como desenhar «outra vez o que já lá
    está» fora do rAF.
  */
  const lastDrawRef = useRef<RenderSnapshot>({
    frameA: 0,
    frameB: 0,
    mix: 0,
    opacity: 1,
  });

  const draw = useCallback((snapshot: TimelineSnapshot) => {
    const state: RenderSnapshot = {
      frameA: snapshot.frameA,
      frameB: snapshot.frameB,
      mix: snapshot.mix,
      opacity: 1,
    };
    lastDrawRef.current = state;
    rendererRef.current?.render(state);
  }, []);

  const play = useOrigamiAnimation(timeline, draw);

  // 3. Montar o renderizador, e voltar a montá-lo se o contexto se perder.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !asset) return;

    const prefersReduced =
      typeof matchMedia === "function"
        ? matchMedia("(prefers-reduced-motion: reduce)").matches
        : reducedMotionDefault;

    const renderer = OrigamiRenderer.create(canvas, asset);
    if (!renderer) {
      setReady(false);
      readyCallback.current?.(false);
      return;
    }

    rendererRef.current = renderer;
    const created = new OrigamiTimeline(asset.clips, prefersReduced);
    setTimeline(created);

    const paint = () => {
      const box = canvas.getBoundingClientRect();
      renderer.resize(box.width, box.height, window.devicePixelRatio);
      renderer.readColours();
      const snapshot = created.rest;
      renderer.render({
        frameA: snapshot.frameA,
        frameB: snapshot.frameB,
        mix: snapshot.mix,
        opacity: 1,
      });
    };

    paint();
    setReady(true);
    readyCallback.current?.(true);

    const observer = new ResizeObserver(paint);
    observer.observe(canvas);

    // Perder o contexto é normal — o sistema recupera memória de GPU quando
    // precisa. O que não é normal é ficar com um retângulo preto até alguém
    // recarregar, e é por isso que o `preventDefault` importa: sem ele o
    // browser nunca dispara o `restored`.
    const onLost = (event: Event) => {
      event.preventDefault();
      setReady(false);
      readyCallback.current?.(false);
    };
    const onRestored = () => {
      if (renderer.acquire()) {
        paint();
        setReady(true);
        readyCallback.current?.(true);
      }
    };

    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    return () => {
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      observer.disconnect();
      renderer.dispose();
      rendererRef.current = null;
      setTimeline(null);
    };
  }, [asset, reducedMotionDefault]);

  // 4. O estado semântico conduz a cena.
  useEffect(() => {
    if (!ready || !timeline) return;
    play(clip);
  }, [clip, play, ready, timeline]);

  // 5. O papel muda por escolha da pessoa, e não por troca de asset.
  useEffect(() => {
    if (!ready) return;
    rendererRef.current?.readColours();
    rendererRef.current?.render(lastDrawRef.current);
  }, [paper, ready]);

  return (
    <canvas
      ref={canvasRef}
      className={["origami-canvas", className].filter(Boolean).join(" ")}
      data-ready={ready ? "true" : "false"}
      // Nunca na ordem de tabulação e nunca na árvore de acessibilidade: o
      // conteúdo é o `figcaption` e o SVG por baixo. Um canvas focável seria
      // uma paragem sem nada para ler.
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
