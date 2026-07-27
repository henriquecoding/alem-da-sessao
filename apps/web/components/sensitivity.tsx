import type { ReactNode } from "react";
import { Eye, EyeOff, Landmark, Lock } from "lucide-react";
import type { Locale } from "@alem-da-sessao/i18n";
import { cn } from "@/lib/utils";

/**
 * A semântica de sensibilidade do relatório v2 §6.3.
 *
 * Regra de ouro: privado e partilhado têm de ser distinguíveis num relance e
 * **nunca só por cor** (WCAG 1.4.1). Cada nível traz quatro portadores de
 * significado simultâneos — cor, forma de borda, ícone e texto — para que
 * alguém saiba em menos de 300 ms o que o profissional dele vê.
 *
 * `--shared` é o acento reservado do produto. Não existe fora daqui e das
 * superfícies de partilha; `check:tokens` falha o build se escapar.
 */
export type Sensitivity = "private" | "shared" | "retained";

const copy: Record<
  Locale,
  Record<Sensitivity, { label: string; hint: string }>
> = {
  "pt-PT": {
    private: {
      label: "Só seu",
      hint: "Ninguém mais vê isto. Nem o seu profissional.",
    },
    shared: {
      label: "Partilhado",
      hint: "Atravessou a ponte por escolha sua.",
    },
    retained: {
      label: "Retido por obrigação legal",
      hint: "Já integrou registo clínico e não pode ser apagado por agora.",
    },
  },
  "pt-BR": {
    private: {
      label: "Só seu",
      hint: "Ninguém mais vê isso. Nem o seu profissional.",
    },
    shared: {
      label: "Compartilhado",
      hint: "Atravessou a ponte por escolha sua.",
    },
    retained: {
      label: "Retido por obrigação legal",
      hint: "Já integrou registro clínico e não pode ser apagado por ora.",
    },
  },
};

const icons: Record<Sensitivity, typeof Lock> = {
  private: Lock,
  shared: Eye,
  retained: Landmark,
};

/**
 * Forma de borda como portador de significado independente da cor:
 * privado é contínuo e fechado, partilhado é tracejado (algo atravessou),
 * retido é sólido e espesso à esquerda (está preso a uma obrigação).
 */
const shapes: Record<Sensitivity, string> = {
  private:
    "border border-[var(--private-border)] bg-[var(--private-surface)] text-[var(--private)] rounded-full",
  shared:
    "border border-dashed border-[var(--shared-border)] bg-[var(--shared-surface)] text-[var(--shared-foreground)] rounded-full",
  retained:
    "border-y border-r border-l-4 border-[var(--retained)] bg-[var(--retained-surface)] text-[var(--retained)] rounded-r-full rounded-l-sm",
};

export function SensitivityTag({
  level,
  locale,
  className,
  children,
}: {
  level: Sensitivity;
  locale: Locale;
  className?: string;
  children?: ReactNode;
}) {
  const Icon = icons[level];
  const text = copy[locale][level];

  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold leading-none",
        shapes[level],
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      {children ?? text.label}
    </span>
  );
}

/**
 * A versão longa, para quando há espaço para explicar em vez de apenas
 * etiquetar — usada antes de qualquer decisão de partilha.
 */
export function SensitivityNote({
  level,
  locale,
  className,
}: {
  level: Sensitivity;
  locale: Locale;
  className?: string;
}) {
  const Icon = level === "private" ? EyeOff : icons[level];
  const text = copy[locale][level];

  return (
    <p
      className={cn(
        "flex items-start gap-3 p-4 text-sm leading-6",
        shapes[level],
        "rounded-2xl",
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>
        <strong className="font-semibold">{text.label}.</strong> {text.hint}
      </span>
    </p>
  );
}
