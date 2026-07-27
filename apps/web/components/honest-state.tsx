import type { ReactNode } from "react";
import {
  CircleSlash,
  Clock4,
  Inbox,
  Lock,
  TriangleAlert,
  WifiOff,
} from "lucide-react";
import type { AsyncState } from "@alem-da-sessao/db/async-state";
import type { Locale } from "@alem-da-sessao/i18n";
import { voice } from "@alem-da-sessao/i18n/voice";
import { cn } from "@/lib/utils";

/**
 * Renderiza os estados honestos do §7.5 com a voz aprovada do `voice.ts`.
 *
 * Cada estado tem ícone, forma e texto próprios — nunca só cor (WCAG 1.4.1),
 * e nunca a mesma caixa cinzenta reaproveitada, porque a diferença entre
 * "não há nada" e "há e não é seu para ver" é o produto inteiro.
 */

type Tone = {
  surface: string;
  foreground: string;
  icon: typeof Inbox;
};

const tones = {
  empty: {
    surface: "bg-[var(--state-empty)] border-[var(--border)]",
    foreground: "text-[var(--state-empty-foreground)]",
    icon: Inbox,
  },
  withheld: {
    surface:
      "bg-[var(--state-withheld-surface)] border-dashed border-[var(--state-withheld)]",
    foreground: "text-[var(--state-withheld)]",
    icon: Lock,
  },
  forbidden: {
    surface:
      "bg-[var(--state-forbidden-surface)] border-[var(--state-forbidden)]",
    foreground: "text-[var(--state-forbidden)]",
    icon: CircleSlash,
  },
  offline: {
    surface: "bg-[var(--state-offline-surface)] border-[var(--state-offline)]",
    foreground: "text-[var(--state-offline)]",
    icon: WifiOff,
  },
  error: {
    surface: "bg-[var(--state-error-surface)] border-[var(--state-error)]",
    foreground: "text-[var(--state-error)]",
    icon: TriangleAlert,
  },
  expired: {
    surface: "bg-[var(--retained-surface)] border-[var(--retained)]",
    foreground: "text-[var(--retained)]",
    icon: Clock4,
  },
} satisfies Record<string, Tone>;

function StateBlock({
  tone,
  title,
  body,
  action,
  role,
}: {
  tone: keyof typeof tones;
  title: string;
  body?: string;
  action?: ReactNode;
  role?: "status" | "alert";
}) {
  const { surface, foreground, icon: Icon } = tones[tone];

  return (
    <div
      role={role ?? "status"}
      className={cn(
        "flex flex-col items-start gap-3 rounded-[var(--radius-lg)] border p-6 sm:flex-row sm:items-center",
        surface,
      )}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--surface)]",
          foreground,
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-semibold", foreground)}>{title}</p>
        {body && (
          <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
            {body}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function HonestState<T>({
  state,
  locale,
  surface,
  emptyBody,
  holderName,
  action,
}: {
  state: AsyncState<T>;
  locale: Locale;
  /** Muda apenas o texto de vazio: o cliente e o profissional não leem igual. */
  surface: "client" | "professional";
  emptyBody?: string;
  /** Nome de quem guardou, para o estado `withheld`. */
  holderName?: string;
  action?: ReactNode;
}) {
  switch (state.kind) {
    case "loading":
      return (
        <div
          role="status"
          aria-live="polite"
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6"
        >
          <span className="sr-only">A carregar.</span>
          <span
            aria-hidden="true"
            className="block h-2 w-40 animate-pulse rounded-full bg-[var(--muted)]"
          />
        </div>
      );

    case "empty":
      return (
        <StateBlock
          tone="empty"
          title={voice(
            surface === "client" ? "emptyClient" : "emptyProfessional",
            locale,
          )}
          body={emptyBody}
          action={action}
        />
      );

    case "withheld":
      return (
        <StateBlock
          tone="withheld"
          title={voice("withheld", locale, {
            name: holderName ?? (locale === "pt-PT" ? "A pessoa" : "A pessoa"),
          })}
          body={
            state.reason === "revoked"
              ? locale === "pt-PT"
                ? "A partilha foi retirada. O que já integrou o registo clínico permanece, como foi explicado antes da partilha."
                : "O compartilhamento foi retirado. O que já integrou o registro clínico permanece, como foi explicado antes."
              : state.reason === "retained"
                ? "Sujeito a retenção legal."
                : undefined
          }
          action={action}
        />
      );

    case "forbidden":
      return (
        <StateBlock
          tone="forbidden"
          title={
            locale === "pt-PT"
              ? "Este conteúdo não pertence a este contexto."
              : "Este conteúdo não pertence a este contexto."
          }
          action={action}
        />
      );

    case "offline":
      return (
        <StateBlock
          tone="offline"
          title={
            locale === "pt-PT"
              ? "Sem ligação. Mostramos o que estava guardado."
              : "Sem conexão. Mostramos o que estava salvo."
          }
          action={action}
        />
      );

    case "expired":
      return (
        <StateBlock
          tone="expired"
          title={
            locale === "pt-PT"
              ? `Esta partilha caducou a ${state.expiredAt.toLocaleDateString(locale)}.`
              : `Este compartilhamento expirou em ${state.expiredAt.toLocaleDateString(locale)}.`
          }
          action={action}
        />
      );

    case "error":
      return (
        <StateBlock
          role="alert"
          tone="error"
          title={voice("error", locale, { reference: state.referenceId })}
          action={action}
        />
      );

    case "unauthenticated":
      return (
        <StateBlock
          tone="forbidden"
          title={
            locale === "pt-PT"
              ? "Precisa de entrar para ver isto."
              : "Você precisa entrar para ver isso."
          }
          action={action}
        />
      );

    case "ready":
      return null;
  }
}
