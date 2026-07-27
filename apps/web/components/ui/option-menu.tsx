"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * O menu de opções partilhado pelo seletor de tema e pelo de língua.
 *
 * Existe um só porque os dois botões vivem lado a lado: se cada um tivesse a
 * sua implementação, mais cedo ou mais tarde abriam de maneiras diferentes,
 * fechavam com teclas diferentes e um deles perdia o foco no regresso. Um
 * primitivo é o que impede isso — e é também onde o comportamento de teclado
 * fica escrito uma vez em vez de duas.
 *
 * O que ele garante:
 *
 * - `menu` / `menuitemradio` com `aria-checked`, porque isto é uma escolha
 *   entre alternativas exclusivas e não uma lista de ações;
 * - navegação por setas com wrap, Home e End, tal como um menu nativo;
 * - Escape e clique fora fecham **e devolvem o foco ao botão** — sem isto,
 *   quem navega por teclado é atirado para o início da página;
 * - a opção ativa entra focada, para que não seja preciso contar teclas até
 *   chegar ao sítio onde já se está.
 *
 * O painel é montado só quando abre. Um menu fechado que continua no DOM é a
 * forma mais comum de um leitor de ecrã anunciar opções que ninguém pediu.
 */

export type OptionMenuItem<T extends string> = {
  value: T;
  label: string;
  hint?: string;
  icon?: ReactNode;
  /** Quando presente, a opção navega em vez de chamar `onSelect`. */
  href?: string;
};

export function OptionMenu<T extends string>({
  label,
  value,
  items,
  onSelect,
  trigger,
  footer,
  align = "end",
  width = "min-w-[15rem]",
  renderItem,
}: {
  /** Nome acessível do botão. É a pergunta, não a resposta. */
  label: string;
  value: T;
  items: readonly OptionMenuItem<T>[];
  onSelect: (item: OptionMenuItem<T>) => void;
  trigger: ReactNode;
  footer?: ReactNode;
  align?: "start" | "end";
  width?: string;
  renderItem?: (item: OptionMenuItem<T>, active: boolean) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const menuId = useId();

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    // A opção ativa recebe o foco assim que o painel monta.
    const activeIndex = Math.max(
      0,
      items.findIndex((item) => item.value === value),
    );
    itemRefs.current[activeIndex]?.focus();

    function onPointerDown(event: globalThis.PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) close(false);
    }
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, items, value, close]);

  function moveFocus(from: number, delta: number) {
    const count = items.length;
    const next = (from + delta + count) % count;
    itemRefs.current[next]?.focus();
  }

  function onItemKeyDown(event: React.KeyboardEvent, index: number) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveFocus(index, 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveFocus(index, -1);
        break;
      case "Home":
        event.preventDefault();
        itemRefs.current[0]?.focus();
        break;
      case "End":
        event.preventDefault();
        itemRefs.current[items.length - 1]?.focus();
        break;
      case "Tab":
        // Tab sai do menu inteiro, como num menu nativo.
        close(false);
        break;
      default:
        break;
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={label}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          "ease-(--ease-out-quint) inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-xs font-semibold outline-none transition-[background-color,border-color,color] duration-200",
          "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
          open
            ? "border-[var(--border-strong)] bg-[var(--muted)] text-[var(--foreground)]"
            : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
        )}
      >
        {trigger}
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          className={cn(
            "animate-scale-in absolute top-[calc(100%+0.5rem)] z-50 origin-top overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-strong)] p-1.5 shadow-[var(--shadow-lg)]",
            align === "end" ? "right-0" : "left-0",
            width,
          )}
        >
          {items.map((item, index) => {
            const active = item.value === value;
            const content = renderItem ? (
              renderItem(item, active)
            ) : (
              <>
                {item.icon}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    {item.label}
                  </span>
                  {item.hint && (
                    <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                      {item.hint}
                    </span>
                  )}
                </span>
                <Check
                  className={cn(
                    "size-4 shrink-0 text-[var(--primary)]",
                    !active && "invisible",
                  )}
                  aria-hidden="true"
                />
              </>
            );

            const className = cn(
              "flex w-full min-h-11 items-center gap-3 rounded-[var(--radius-sm)] px-2.5 py-2 text-left outline-none",
              "transition-colors duration-150",
              "focus-visible:bg-[var(--muted)] hover:bg-[var(--muted)]",
              active
                ? "bg-[var(--muted)] text-[var(--foreground)]"
                : "text-[var(--foreground)]",
            );

            const shared = {
              role: "menuitemradio" as const,
              "aria-checked": active,
              tabIndex: -1,
              className,
              onKeyDown: (event: React.KeyboardEvent) =>
                onItemKeyDown(event, index),
            };

            if (item.href) {
              return (
                <a
                  key={item.value}
                  href={item.href}
                  {...shared}
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  onClick={() => onSelect(item)}
                >
                  {content}
                </a>
              );
            }

            return (
              <button
                key={item.value}
                type="button"
                {...shared}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                onClick={() => {
                  onSelect(item);
                  close(true);
                }}
              >
                {content}
              </button>
            );
          })}

          {footer && (
            <p className="mt-1 border-t border-[var(--border)] px-2.5 pb-1 pt-2.5 text-xs leading-5 text-[var(--muted-foreground)]">
              {footer}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
