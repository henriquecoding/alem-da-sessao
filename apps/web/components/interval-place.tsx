import type { CSSProperties } from "react";
import type { CareInterval } from "@alem-da-sessao/db/intervals";
import type { Locale } from "@alem-da-sessao/i18n";
import { voice } from "@alem-da-sessao/i18n/voice";
import { SensitivityTag } from "@/components/sensitivity";
import { cn } from "@/lib/utils";

/**
 * O intervalo, do lado do cliente — relatório v2 §4.2.
 *
 * Não é uma lista de tarefas com um cabeçalho de datas. É *um lugar no tempo*:
 * "Está no intervalo entre 20 e 27 de julho." A diferença não é cosmética —
 * uma lista de tarefas cria dívida, um lugar não.
 *
 * **A regra que impede o vazio acusatório:** um intervalo sem artefactos é
 * normal e é apresentado como normal. Não há contagem por cumprir, barra por
 * encher, nem enquadramento de falta. A microcópia vem do `voice.ts` para que
 * isso não dependa de quem escreveu o componente.
 */
export function IntervalPlace({
  interval,
  locale,
  className,
  style,
}: {
  interval: CareInterval;
  locale: Locale;
  className?: string;
  style?: CSSProperties;
}) {
  const format = (iso: string) =>
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" }).format(
      new Date(iso),
    );

  const empty = interval.artifactCount === 0 && interval.bridges.length === 0;

  return (
    <section
      className={cn(
        "material relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-7",
        className,
      )}
      style={style}
      aria-labelledby="interval-place-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          {locale === "pt-PT" ? "Onde está agora" : "Onde você está agora"}
        </p>
        <SensitivityTag level="private" locale={locale} />
      </div>

      <h2
        id="interval-place-title"
        className="mt-3 text-balance text-[1.6rem] font-bold leading-[1.15] tracking-[-0.04em] sm:text-[1.9rem]"
      >
        {voice("intervalOpen", locale, {
          from: format(interval.opensAt),
          to: interval.closesAt
            ? format(interval.closesAt)
            : locale === "pt-PT"
              ? "a próxima sessão"
              : "a próxima sessão",
        })}
      </h2>

      {empty ? (
        // O estado vazio é uma afirmação, não uma cobrança.
        <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted-foreground)]">
          {voice("intervalEmpty", locale)}{" "}
          {locale === "pt-PT"
            ? "Se alguma coisa aparecer, tem um lugar para a pousar."
            : "Se alguma coisa aparecer, você tem um lugar para pousá-la."}
        </p>
      ) : (
        <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted-foreground)]">
          {locale === "pt-PT"
            ? `Guardou ${interval.artifactCount} ${interval.artifactCount === 1 ? "objeto" : "objetos"} neste intervalo. Continuam seus até decidir o contrário.`
            : `Você guardou ${interval.artifactCount} ${interval.artifactCount === 1 ? "objeto" : "objetos"} neste intervalo. Continuam seus até você decidir o contrário.`}
        </p>
      )}

      {/* Uma linha do tempo que descreve posição, não progresso. Não enche,
          não pontua, e não muda de cor conforme o que a pessoa fez. */}
      <div
        className="mt-7 flex items-center gap-3"
        role="img"
        aria-label={
          locale === "pt-PT"
            ? `Intervalo entre ${format(interval.opensAt)} e ${interval.closesAt ? format(interval.closesAt) : "a próxima sessão"}.`
            : `Intervalo entre ${format(interval.opensAt)} e ${interval.closesAt ? format(interval.closesAt) : "a próxima sessão"}.`
        }
      >
        <span className="surface-primary size-2.5 shrink-0 rounded-full" />
        <span
          className="h-px flex-1 bg-[repeating-linear-gradient(90deg,var(--border)_0_6px,transparent_6px_12px)]"
          aria-hidden="true"
        />
        <span className="size-2.5 shrink-0 rounded-full border-2 border-[var(--primary)]" />
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
        <span>{format(interval.opensAt)}</span>
        <span>
          {interval.closesAt
            ? format(interval.closesAt)
            : locale === "pt-PT"
              ? "próxima sessão"
              : "próxima sessão"}
        </span>
      </div>
    </section>
  );
}
