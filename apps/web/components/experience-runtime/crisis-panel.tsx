"use client";

import { useState } from "react";
import { ChevronDown, LifeBuoy } from "lucide-react";
import type { Locale } from "@alem-da-sessao/i18n";
import { getCrisisResources } from "@/lib/crisis-resources";
import { cn } from "@/lib/utils";

/**
 * Recursos de crise — relatório v2 §4.9.
 *
 * Fechado por omissão e aberto por escolha explícita. **Nunca um modal que
 * interrompe:** a mensagem existe onde é procurada, não onde incomoda.
 *
 * Um `<details>` nativo em vez de um acordeão feito à mão — funciona sem
 * JavaScript, é pesquisável pelo Ctrl+F do navegador, e um leitor de ecrã
 * anuncia-o corretamente sem ARIA nenhuma. Numa lista que alguém pode estar a
 * procurar em pânico, isso importa mais do que a animação.
 */
export function CrisisPanel({
  locale,
  tone = "light",
  className,
}: {
  locale: Locale;
  tone?: "light" | "ink";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const resources = getCrisisResources(locale);
  const ink = tone === "ink";

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className={cn(
        "group/crisis rounded-2xl border",
        ink
          ? "border-[#3b3f48] bg-[var(--ink-raised)]"
          : "border-[var(--border)] bg-[var(--surface)]",
        className,
      )}
    >
      <summary
        className={cn(
          "flex min-h-11 cursor-pointer list-none items-center gap-3 px-4 py-3 text-sm font-semibold outline-none",
          "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
          ink ? "text-[#d8d9dd]" : "text-[var(--foreground)]",
        )}
      >
        <LifeBuoy
          className={cn(
            "size-4 shrink-0",
            ink ? "text-[var(--ember)]" : "text-[var(--accent-foreground)]",
          )}
          aria-hidden="true"
        />
        <span className="flex-1">
          {locale === "pt-PT"
            ? "Se precisar de falar com alguém agora"
            : "Se você precisar falar com alguém agora"}
        </span>
        <ChevronDown
          className="size-4 shrink-0 transition-transform duration-200 group-open/crisis:rotate-180"
          aria-hidden="true"
        />
      </summary>

      <div
        className={cn(
          "border-t px-4 py-4 text-sm",
          ink ? "border-[#2d3037]" : "border-[var(--border)]",
        )}
      >
        <p
          className={cn(
            "leading-6",
            ink ? "text-[#9da2ad]" : "text-[var(--muted-foreground)]",
          )}
        >
          {locale === "pt-PT"
            ? "Estas linhas são atendidas por pessoas. Esta plataforma não substitui nenhuma delas."
            : "Estas linhas são atendidas por pessoas. Esta plataforma não substitui nenhuma delas."}
        </p>

        <ul className="mt-4 space-y-3">
          {[resources.emergency, ...resources.lines].map((resource) => (
            <li key={resource.name} className="flex flex-col gap-0.5">
              <span
                className={cn(
                  "text-sm font-semibold",
                  ink ? "text-[#eeeae2]" : "text-[var(--foreground)]",
                )}
              >
                {resource.href ? (
                  <a
                    href={resource.href}
                    className="link-underline"
                    rel={
                      resource.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    target={
                      resource.href.startsWith("http") ? "_blank" : undefined
                    }
                  >
                    {resource.name} · {resource.contact}
                  </a>
                ) : (
                  `${resource.name} · ${resource.contact}`
                )}
              </span>
              <span
                className={cn(
                  "text-xs",
                  ink ? "text-[#828793]" : "text-[var(--muted-foreground)]",
                )}
              >
                {resource.availability}
              </span>
            </li>
          ))}
        </ul>

        <p
          className={cn(
            "mt-4 text-[11px]",
            ink ? "text-[#6d7381]" : "text-[var(--muted-foreground)]",
          )}
        >
          {locale === "pt-PT" ? "Lista revista a " : "Lista revisada em "}
          {resources.lastReviewed}.
        </p>
      </div>
    </details>
  );
}
