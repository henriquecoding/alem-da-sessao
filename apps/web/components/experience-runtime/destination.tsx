"use client";

import { useState, type CSSProperties } from "react";
import { Download, Share2, Trash2, UserPlus } from "lucide-react";
import type { Locale } from "@alem-da-sessao/i18n";
import { voice } from "@alem-da-sessao/i18n/voice";
import { cn } from "@/lib/utils";

/**
 * Tempo 5 do ritual — o Destino (relatório v2 §7.2 e §4.10).
 *
 * **Três caminhos visualmente equivalentes.** Esta é a regra que torna o
 * produto ético em vez de um dark pattern com boas intenções:
 *
 * > O botão de partilhar não pode ser mais bonito que o de descartar. Se a
 * > partilha for o caminho visualmente óbvio, você construiu um dark pattern
 * > com boas intenções. (§4.5)
 *
 * Por isso os três cartões partilham exatamente a mesma classe: mesma borda,
 * mesmo peso, mesmo tamanho de alvo. Nenhum é primário. O que os distingue é o
 * ícone e a consequência escrita — nunca hierarquia visual.
 *
 * O descarte não pergunta "tem a certeza?": declara a consequência
 * (`voice("discard")`), que é a única forma honesta de pedir uma confirmação.
 */

export type DestinationChoice = "download" | "account" | "share" | "discard";

type Option = {
  id: DestinationChoice;
  icon: typeof Download;
  title: string;
  body: string;
};

export function Destination({
  locale,
  mode,
  onChoose,
  className,
}: {
  locale: Locale;
  /**
   * `guest` oferece descarregar · criar conta · descartar (§4.10).
   * `account` troca a criação de conta pela partilha com o profissional.
   */
  mode: "guest" | "account";
  onChoose: (choice: DestinationChoice) => void;
  className?: string;
}) {
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  const pt = locale === "pt-PT";

  const options: Option[] = [
    {
      id: "download",
      icon: Download,
      title: pt ? "Levar comigo" : "Levar comigo",
      body: pt
        ? "Descarrega o objeto para o seu dispositivo. Não fica nada connosco."
        : "Baixa o objeto para o seu dispositivo. Não fica nada conosco.",
    },
    mode === "guest"
      ? {
          id: "account",
          icon: UserPlus,
          title: pt ? "Guardar numa conta" : "Guardar numa conta",
          body: pt
            ? "Cria uma conta para o manter. Continua privado — ninguém o vê sem a sua escolha."
            : "Cria uma conta para mantê-lo. Continua privado — ninguém o vê sem a sua escolha.",
        }
      : {
          id: "share",
          icon: Share2,
          title: pt ? "Preparar partilha" : "Preparar compartilhamento",
          body: pt
            ? "Vê primeiro exatamente o que o profissional receberia, e só depois decide."
            : "Você vê primeiro exatamente o que o profissional receberia, e só depois decide.",
        },
    {
      id: "discard",
      icon: Trash2,
      title: pt ? "Descartar" : "Descartar",
      body: voice("discard", locale),
    },
  ];

  return (
    <section className={cn("mx-auto max-w-4xl", className)}>
      <h2 className="text-balance text-2xl font-bold tracking-[-0.04em]">
        {pt ? "O que quer fazer com isto?" : "O que você quer fazer com isso?"}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
        {pt
          ? "Os três caminhos valem o mesmo. Nenhum é o caminho certo."
          : "Os três caminhos valem o mesmo. Nenhum é o caminho certo."}
      </p>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        {options.map((option, index) => {
          const isDiscard = option.id === "discard";
          const awaitingConfirm = isDiscard && confirmingDiscard;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                if (isDiscard && !confirmingDiscard) {
                  setConfirmingDiscard(true);
                  return;
                }
                onChoose(option.id);
              }}
              // Mesma classe para os três: nenhum é visualmente primário.
              className={cn(
                "enter group/dest flex min-h-44 flex-col items-start rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 text-left outline-none",
                "ease-(--ease-out-quint) transition-[border-color,box-shadow,transform] duration-200",
                "hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]",
                "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
                awaitingConfirm && "border-[var(--state-error)]",
              )}
              style={{ "--d": index } as CSSProperties}
            >
              <span
                className={cn(
                  "grid size-10 place-items-center rounded-2xl bg-[var(--muted)] text-[var(--foreground)]",
                  "ease-(--ease-spring) transition-transform duration-500 group-hover/dest:scale-110",
                  awaitingConfirm &&
                    "bg-[var(--state-error-surface)] text-[var(--state-error)]",
                )}
              >
                <option.icon className="size-[18px]" aria-hidden="true" />
              </span>
              <span className="mt-5 block text-sm font-bold">
                {awaitingConfirm
                  ? pt
                    ? "Confirmar que desaparece"
                    : "Confirmar que desaparece"
                  : option.title}
              </span>
              <span className="mt-2 block text-xs leading-5 text-[var(--muted-foreground)]">
                {option.body}
              </span>
            </button>
          );
        })}
      </div>

      {confirmingDiscard && (
        <p
          role="status"
          className="enter mt-4 text-sm text-[var(--muted-foreground)]"
        >
          {pt
            ? "Toque outra vez em «Descartar» para confirmar, ou escolha outro caminho."
            : "Toque de novo em «Descartar» para confirmar, ou escolha outro caminho."}
        </p>
      )}
    </section>
  );
}
