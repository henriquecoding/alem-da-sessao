"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { ArrowRight, Check } from "lucide-react";
import type { Locale } from "@alem-da-sessao/i18n";
import { cn } from "@/lib/utils";

/**
 * O gesto de partilha — relatório v2 §4.5.
 *
 * O momento de maior densidade de design do produto. Um clique é barato demais
 * para o que está a acontecer: alguém está a decidir que outra pessoa vai ler
 * o que escreveu. O gesto deliberado dá ao ato a duração da decisão.
 *
 * **WCAG 2.2 SC 2.5.7 (Dragging Movements) não é opcional aqui.** Toda
 * interação de arraste precisa de alternativa, e o relatório é explícito:
 * *projete a alternativa junto, não depois*. Este componente tem três
 * caminhos equivalentes para o mesmo resultado:
 *
 * 1. arrastar o marcador da margem privada até à partilhada;
 * 2. Enter ou Espaço com o controlo focado;
 * 3. as setas do teclado, para quem prefere avançar passo a passo.
 *
 * O retorno é a travessia (§6.5, `--animate-crossing`), não um toast verde:
 * o movimento explica o gesto em vez de o celebrar.
 */
export function ShareGesture({
  locale,
  recipientName,
  onCrossed,
  disabled = false,
}: {
  locale: Locale;
  recipientName: string;
  onCrossed: () => void;
  disabled?: boolean;
}) {
  const [progress, setProgress] = useState(0);
  const [crossed, setCrossed] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const pt = locale === "pt-PT";

  useEffect(() => {
    if (!crossed) return;
    const timer = window.setTimeout(onCrossed, 900);
    return () => window.clearTimeout(timer);
  }, [crossed, onCrossed]);

  function complete() {
    setProgress(1);
    setCrossed(true);
  }

  function positionFromPointer(clientX: number) {
    const track = trackRef.current;
    if (!track) return 0;
    const bounds = track.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - bounds.left) / bounds.width));
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (disabled || crossed) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingRef.current = true;
  }

  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!draggingRef.current || crossed) return;
    const next = positionFromPointer(event.clientX);
    setProgress(next);
    if (next >= 0.96) {
      draggingRef.current = false;
      complete();
    }
  }

  function onPointerUp() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    // Voltar ao início é a resposta certa a um gesto interrompido: nada
    // atravessa por acidente.
    if (!crossed) setProgress(0);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled || crossed) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      complete();
      return;
    }
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      setProgress((current) => {
        const next = Math.min(1, current + 0.25);
        if (next >= 1) complete();
        return next;
      });
      return;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      setProgress((current) => Math.max(0, current - 0.25));
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={trackRef}
        className={cn(
          "relative flex h-16 items-center overflow-hidden rounded-full border p-2",
          crossed
            ? "border-[var(--shared-border)] bg-[var(--shared-surface)]"
            : "border-[var(--private-border)] bg-[var(--private-surface)]",
          disabled && "opacity-50",
        )}
      >
        {/* As duas margens: privada à esquerda, partilhada à direita. Ambas
            nomeadas por texto, nunca só por cor (§6.3, WCAG 1.4.1). */}
        <span className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-xs font-semibold text-[var(--shared-foreground)]">
          {pt ? "para a Dra." : "para a Dra."} {recipientName.split(" ")[0]}
        </span>

        <span
          aria-hidden="true"
          className="bg-[var(--shared)]/18 pointer-events-none absolute inset-y-2 left-2 rounded-full transition-[width] duration-100"
          style={{ width: `calc(${progress * 100}% - 0.5rem)` }}
        />

        <button
          type="button"
          disabled={disabled}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-valuetext={
            crossed
              ? pt
                ? "Atravessou"
                : "Atravessou"
              : pt
                ? `${Math.round(progress * 100)}% do caminho até à partilha`
                : `${Math.round(progress * 100)}% do caminho até o compartilhamento`
          }
          aria-label={
            pt
              ? `Arrastar para partilhar com ${recipientName}. Em alternativa, prima Enter ou use as setas.`
              : `Arrastar para compartilhar com ${recipientName}. Como alternativa, pressione Enter ou use as setas.`
          }
          className={cn(
            "absolute z-10 grid size-12 touch-none place-items-center rounded-full outline-none",
            "transition-[background-color,box-shadow] duration-200",
            "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
            crossed
              ? "bg-[var(--shared)] text-[var(--on-shared)]"
              : "cursor-grab bg-[var(--surface)] text-[var(--private)] shadow-[var(--shadow-sm)] active:cursor-grabbing",
          )}
          // A posição é calculada em CSS puro contra a largura da pista, sem
          // ler o DOM durante o render: `100%` num `calc` de `left` já resolve
          // contra o bloco que contém, e 4rem é a soma do padding com o botão.
          style={{ left: `calc(0.5rem + ${progress} * (100% - 4rem))` }}
        >
          {crossed ? (
            <Check className="size-5" aria-hidden="true" />
          ) : (
            <ArrowRight className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* A alternativa por botão, sempre visível — não escondida atrás de um
          "modo acessível". É um caminho igual, não um caminho de recurso. */}
      <button
        type="button"
        disabled={disabled || crossed}
        onClick={complete}
        data-drag-alternative
        className={cn(
          "min-h-11 self-start rounded-full px-4 text-sm font-semibold text-[var(--muted-foreground)] outline-none",
          "transition-colors duration-200 hover:text-[var(--foreground)]",
          "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
        )}
      >
        {pt ? "Ou partilhar sem arrastar" : "Ou compartilhar sem arrastar"}
      </button>
    </div>
  );
}
