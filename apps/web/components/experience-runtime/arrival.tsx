import type { CSSProperties } from "react";
import { Clock3, EyeOff, FileDown, Lock } from "lucide-react";
import type { Locale } from "@alem-da-sessao/i18n";
import { voice } from "@alem-da-sessao/i18n/voice";
import type { ToolManifest } from "@alem-da-sessao/tool-registry";
import { CrisisPanel } from "@/components/experience-runtime/crisis-panel";
import { cn } from "@/lib/utils";

/**
 * Tempo 1 do ritual — a Chegada (relatório v2 §7.2).
 *
 * O que é isto, quanto tempo leva, e o que acontece com o que eu escrever —
 * **antes de qualquer campo**. É o tempo que 100% dos concorrentes salta, e é
 * o que separa "um lugar" de "um formulário decorado".
 *
 * Três coisas que esta tela é obrigada a dizer quando a experiência corre em
 * modo convidado (§10.4):
 *
 * - que o rascunho vive só na memória do browser e nada é enviado;
 * - que **ninguém está a ver** e a plataforma não é monitorizada;
 * - onde estão os recursos de crise, sem os empurrar.
 */
export function Arrival({
  manifest,
  locale,
  onBegin,
  tone = "light",
}: {
  manifest: ToolManifest;
  locale: Locale;
  onBegin: React.ReactNode;
  tone?: "light" | "ink";
}) {
  const ink = tone === "ink";
  const gate = manifest.capabilities.canSelfStart;
  const guest = manifest.capabilities.canRunAsGuest;

  const promises = [
    {
      icon: Clock3,
      title:
        locale === "pt-PT"
          ? `Cerca de ${manifest.estimatedMinutes} minutos`
          : `Cerca de ${manifest.estimatedMinutes} minutos`,
      body:
        locale === "pt-PT"
          ? "Pode parar a meio. Não há contagem, nem sequência a manter."
          : "Você pode parar no meio. Não há contagem, nem sequência a manter.",
    },
    {
      icon: Lock,
      title:
        locale === "pt-PT"
          ? "O rascunho não sai deste navegador"
          : "O rascunho não sai deste navegador",
      body:
        locale === "pt-PT"
          ? "Enquanto escreve, nada é enviado para servidor nenhum. No fim decide o que fazer com o que fez."
          : "Enquanto você escreve, nada é enviado para servidor nenhum. No fim você decide o que fazer com o que fez.",
    },
    {
      icon: FileDown,
      title:
        locale === "pt-PT"
          ? "No fim há um objeto, não um «concluído»"
          : "No fim há um objeto, não um «concluído»",
      body:
        locale === "pt-PT"
          ? "Pode descarregá-lo, guardá-lo ou apagá-lo sem deixar rasto. Os três caminhos valem o mesmo."
          : "Você pode baixá-lo, guardá-lo ou apagá-lo sem deixar rastro. Os três caminhos valem o mesmo.",
    },
  ];

  return (
    <section
      className={cn(
        "mx-auto max-w-3xl",
        ink ? "text-[var(--ink-foreground)]" : "text-[var(--foreground)]",
      )}
      aria-labelledby="arrival-title"
    >
      <p
        className={cn(
          "enter font-mono text-[10px] uppercase tracking-[0.2em]",
          ink ? "text-[var(--ember)]" : "text-[var(--accent-foreground)]",
        )}
      >
        {locale === "pt-PT" ? "Antes de começar" : "Antes de começar"}
      </p>

      <h1
        id="arrival-title"
        className={cn(
          "enter mt-3 text-balance text-[clamp(1.9rem,1.2rem+2.6vw,2.9rem)] font-bold leading-[1.05] tracking-[-0.045em]",
          ink && "font-serif font-medium",
        )}
        style={{ "--d": 1 } as CSSProperties}
      >
        {manifest.title[locale]}
      </h1>

      <p
        className={cn(
          "enter mt-4 max-w-2xl text-base leading-7",
          ink ? "text-[var(--ink-muted)]" : "text-[var(--muted-foreground)]",
        )}
        style={{ "--d": 2 } as CSSProperties}
      >
        {manifest.summary[locale]}
      </p>

      <p
        className={cn(
          "enter mt-3 max-w-2xl text-sm leading-6",
          ink ? "text-[var(--ink-muted)]" : "text-[var(--muted-foreground)]",
        )}
        style={{ "--d": 2 } as CSSProperties}
      >
        {manifest.originality.humanTruth}
      </p>

      <ul className="mt-9 space-y-3">
        {promises.map((promise, index) => (
          <li
            key={promise.title}
            className={cn(
              "enter flex gap-4 rounded-2xl border p-4",
              ink
                ? "border-[#2f3239] bg-[#1a1c20]"
                : "border-[var(--border)] bg-[var(--surface)]",
            )}
            style={{ "--d": 3 + index } as CSSProperties}
          >
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-xl",
                ink
                  ? "bg-[#24272d] text-[var(--ember)]"
                  : "bg-[var(--muted)] text-[var(--primary)]",
              )}
            >
              <promise.icon className="size-[18px]" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">
                {promise.title}
              </span>
              <span
                className={cn(
                  "mt-1 block text-sm leading-6",
                  ink
                    ? "text-[var(--ink-muted)]"
                    : "text-[var(--muted-foreground)]",
                )}
              >
                {promise.body}
              </span>
            </span>
          </li>
        ))}
      </ul>

      {/* §4.9 — a declaração de não-monitorização é obrigatória sempre que o
          gate de auto-iniciação está ativo e a experiência corre em modo
          convidado. Está aqui, na Chegada, e não escondida no rodapé. */}
      {guest && gate !== false && gate.unattendedNotice && (
        <p
          className={cn(
            "enter mt-6 flex items-start gap-3 rounded-2xl border border-dashed p-4 text-sm leading-6",
            ink
              ? "border-[#4a4237] bg-[#1e1b18] text-[#c9c2b6]"
              : "border-[var(--border-strong)] bg-[var(--private-surface)] text-[var(--private)]",
          )}
          style={{ "--d": 6 } as CSSProperties}
        >
          <EyeOff className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{voice("unattended", locale)}</span>
        </p>
      )}

      <div
        className="enter mt-8 flex flex-col gap-4"
        style={{ "--d": 7 } as CSSProperties}
      >
        {onBegin}
        <CrisisPanel locale={locale} tone={tone} />
      </div>
    </section>
  );
}
