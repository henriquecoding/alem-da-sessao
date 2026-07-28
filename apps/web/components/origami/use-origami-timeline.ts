"use client";

import { useCallback, useEffect, useRef } from "react";
import type { CompiledOrigamiAsset, OrigamiClipId } from "./runtime/asset";

/**
 * A linha de tempo: de um clip semântico para dois índices e uma mistura.
 *
 * O runtime não sabe o que «formed» significa. Sabe que tem de ir do frame 12
 * ao 36 em 760 ms com uma certa curva. O significado vive na máquina de estados
 * da experiência, e essa separação é o que permite mudar o ritmo da narrativa
 * sem voltar a simular um único vinco.
 *
 * ## Zero loop ocioso
 *
 * Um `requestAnimationFrame` que continue a correr depois de a animação acabar
 * mantém a GPU acordada e a bateria a descer numa página onde nada se move.
 * `sample` devolve `running: false` no instante em que o clip termina, e quem
 * anima usa isso para não voltar a agendar. Não há nenhum caminho neste
 * ficheiro que agende um frame sem que alguma coisa esteja a mudar.
 */

export type TimelineSnapshot = {
  readonly clipId: OrigamiClipId | null;
  readonly frameA: number;
  readonly frameB: number;
  readonly mix: number;
  readonly running: boolean;
};

export const STILL: TimelineSnapshot = {
  clipId: null,
  frameA: 0,
  frameB: 0,
  mix: 0,
  running: false,
};

type Easing = CompiledOrigamiAsset["clips"][number]["easing"];

/**
 * As três curvas.
 *
 * `paper-in` sai depressa e chega devagar: a folha é notada. `paper-form` é
 * simétrica, porque dobrar tem esforço nas duas pontas. `paper-settle` chega e
 * assenta sem ressalto — papel não tem elasticidade, e um ressalto no fim é a
 * coisa que mais depressa transforma papel em borracha.
 */
function ease(curve: Easing, t: number): number {
  if (curve === "paper-in") return 1 - Math.pow(1 - t, 3);
  if (curve === "paper-form") {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  return 1 - Math.pow(1 - t, 4);
}

export class OrigamiTimeline {
  private clip: CompiledOrigamiAsset["clips"][number] | null = null;
  private startedAt = 0;
  private resting: TimelineSnapshot = STILL;

  constructor(
    private readonly clips: readonly CompiledOrigamiAsset["clips"][number][],
    private reducedMotion: boolean,
  ) {}

  setReducedMotion(value: boolean): void {
    this.reducedMotion = value;
  }

  /** O estado parado atual — o que se desenha quando nada está a animar. */
  get rest(): TimelineSnapshot {
    return this.resting;
  }

  play(id: OrigamiClipId, now: number): TimelineSnapshot {
    const clip = this.clips.find((candidate) => candidate.id === id);
    if (!clip) {
      throw new Error(`origami: clip inexistente — ${id}`);
    }

    this.clip = clip;
    this.startedAt = now;

    // Com movimento reduzido não há percurso: o estado final é imediato. Não é
    // «a animação desligada» — é a mesma informação sem deslocação, e quem
    // pediu menos movimento continua a ver o objeto formado.
    if (this.reducedMotion) {
      this.clip = null;
      this.resting = {
        clipId: id,
        frameA: clip.lastFrame,
        frameB: clip.lastFrame,
        mix: 0,
        running: false,
      };
      return this.resting;
    }

    return this.sample(now);
  }

  /** Salta para o frame final de um clip sem o animar. Usado no reset. */
  settleAt(id: OrigamiClipId): TimelineSnapshot {
    const clip = this.clips.find((candidate) => candidate.id === id);
    this.clip = null;
    this.resting = clip
      ? {
          clipId: id,
          frameA: clip.lastFrame,
          frameB: clip.lastFrame,
          mix: 0,
          running: false,
        }
      : STILL;
    return this.resting;
  }

  sample(now: number): TimelineSnapshot {
    const clip = this.clip;
    if (!clip) return this.resting;

    const raw = Math.min(
      1,
      Math.max(0, (now - this.startedAt) / Math.max(1, clip.durationMs)),
    );
    const eased = ease(clip.easing, raw);
    const position =
      clip.firstFrame + eased * (clip.lastFrame - clip.firstFrame);

    const frameA = Math.floor(position);
    const snapshot: TimelineSnapshot = {
      clipId: clip.id,
      frameA,
      frameB: Math.min(clip.lastFrame, frameA + 1),
      mix: position - frameA,
      running: raw < 1,
    };

    if (!snapshot.running) {
      this.clip = null;
      this.resting = {
        ...snapshot,
        mix: 0,
        frameB: clip.lastFrame,
        frameA: clip.lastFrame,
      };
      return this.resting;
    }

    return snapshot;
  }
}

/**
 * Liga a linha de tempo ao `requestAnimationFrame`, e desliga-a.
 *
 * Três coisas param o loop: o clip acabar, a página deixar de estar visível, e
 * o componente desmontar. Não há um quarto caminho, e é deliberado — cada
 * caminho que agenda um frame é um caminho que pode ficar a agendar para
 * sempre.
 */
export function useOrigamiAnimation(
  timeline: OrigamiTimeline | null,
  onFrame: (snapshot: TimelineSnapshot) => void,
): (clip: OrigamiClipId) => void {
  const handle = useRef<number | null>(null);
  const frameCallback = useRef(onFrame);

  // Sincronizada num efeito e não durante o render: escrever numa `ref` no
  // corpo do componente é um efeito secundário no meio de uma função que devia
  // ser pura, e o React 19 recusa-o com razão.
  useEffect(() => {
    frameCallback.current = onFrame;
  });

  const stop = useCallback(() => {
    if (handle.current !== null) {
      cancelAnimationFrame(handle.current);
      handle.current = null;
    }
  }, []);

  const play = useCallback(
    (clip: OrigamiClipId) => {
      if (!timeline) return;
      stop();

      // Declaração de função e não `const`: o laço agenda-se a si próprio, e
      // uma `const` seta só é visível depois de estar atribuída.
      function loop(now: number) {
        const snapshot = timeline!.sample(now);
        frameCallback.current(snapshot);

        if (snapshot.running && document.visibilityState === "visible") {
          handle.current = requestAnimationFrame(loop);
        } else {
          handle.current = null;
        }
      }

      const snapshot = timeline.play(clip, performance.now());
      frameCallback.current(snapshot);
      if (snapshot.running) {
        handle.current = requestAnimationFrame(loop);
      }
    },
    [stop, timeline],
  );

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== "visible") stop();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [stop]);

  return play;
}
