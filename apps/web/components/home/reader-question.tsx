"use client";

import { useState, type ReactNode } from "react";
import { Check, Pencil } from "lucide-react";
import type { Messages } from "@alem-da-sessao/i18n";
import { cn } from "@/lib/utils";

export type Reader = "professional" | "client" | "curious" | null;

/**
 * A pergunta de chegada, e o que ela deliberadamente **não** faz.
 *
 * Perguntar «o que o traz aqui?» antes de servir a página é o oposto de um
 * modal de intenção: não bloqueia, não é obrigatório, e a página inteira
 * funciona sem lhe tocar. Quem responde vê a ordem das portas mudar e a nota
 * certa em destaque; quem não responde vê tudo, pela ordem original.
 *
 * **A resposta não sai desta visita.** Não vai para cookie, não vai para
 * armazenamento nenhum, não é enviada a lado nenhum — vive em estado de React
 * e desaparece com a aba. Isto não é falta de ambição técnica: lembrar-se de
 * que alguém disse «estou em processo» seria começar a manter um perfil de
 * saúde mental de um visitante anónimo, que é exatamente a estrutura pela qual
 * a FTC multou o BetterHelp em 7,8 milhões (§8.2, F2). O produto que promete
 * que nada sai daqui não pode falhar essa promessa na primeira interação da
 * homepage.
 *
 * Por isso a frase por baixo diz o que faz, e é verdade verificável: o
 * `check:privacy` recusa qualquer escrita de armazenamento neste ficheiro.
 */
export function ReaderQuestion({
  copy,
  value,
  onChange,
}: {
  copy: Messages["home"]["question"];
  value: Reader;
  onChange: (reader: Reader) => void;
}) {
  const [dismissed, setDismissed] = useState(false);

  const options = [
    { key: "professional" as const, ...copy.options.professional },
    { key: "client" as const, ...copy.options.client },
    { key: "curious" as const, ...copy.options.curious },
  ];

  if (value) {
    const chosen = options.find((option) => option.key === value)!;
    return (
      <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-5 text-sm sm:px-6 lg:px-8">
        <Check
          className="size-4 shrink-0 text-[var(--primary)]"
          aria-hidden="true"
        />
        <p className="font-semibold">{chosen.label}</p>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="link-underline inline-flex min-h-11 items-center gap-1.5 text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
        >
          <Pencil className="size-3.5" aria-hidden="true" />
          {copy.change}
        </button>
      </div>
    );
  }

  if (dismissed) return null;

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8">
      <fieldset className="reveal">
        <legend className="text-sm font-semibold">{copy.label}</legend>

        <div className="mt-4 flex flex-wrap gap-2.5">
          {options.map((option) => (
            <Option
              key={option.key}
              onClick={() => {
                onChange(option.key);
                setDismissed(true);
              }}
            >
              <span className="block font-semibold">{option.label}</span>
              <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                {option.hint}
              </span>
            </Option>
          ))}
        </div>

        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          {copy.forget}
        </p>
      </fieldset>
    </div>
  );
}

function Option({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "ease-(--ease-out-quint) min-h-11 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-left outline-none",
        "transition-[background-color,border-color,transform] duration-200",
        "hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:bg-[var(--muted)]",
        "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
      )}
    >
      {children}
    </button>
  );
}
