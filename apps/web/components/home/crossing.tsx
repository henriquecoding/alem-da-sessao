"use client";

import { useCallback, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { Locale, Messages } from "@alem-da-sessao/i18n";
import { ShareGesture } from "@/components/experience-runtime/share-gesture";
import { ShareReceipt } from "@/components/experience-runtime/share-receipt";
import { SensitivityTag } from "@/components/sensitivity";

/**
 * Tempo 4 — o gesto, feito e não descrito.
 *
 * Este é o momento que a página existe para ter. Todo o resto pode ser lido; a
 * tese do produto — *escrever é privado, atravessar é uma decisão* — só se
 * percebe fazendo, porque o que ela afirma é sobre a **duração** de um ato.
 * Uma frase a explicar que a partilha é deliberada custa dois segundos a ler e
 * não convence ninguém. Arrastar durante um segundo e ver o recibo do outro
 * lado convence em silêncio.
 *
 * É o componente real, não uma reconstituição: o mesmo `ShareGesture` que a
 * experiência usa, com as mesmas três vias equivalentes (arrastar, Enter, as
 * setas) exigidas pelo WCAG 2.2 SC 2.5.7. Se o gesto se partir em produção,
 * parte-se aqui à vista de toda a gente — o que é a forma certa de uma
 * demonstração ser honesta.
 *
 * O recibo usa uma data fixa e não `new Date()`. A homepage é estática: uma
 * data de render seria a data do build, e ver «partilhado em março» num site
 * visitado em julho é pior do que não ver data nenhuma.
 */
const sharedAt = new Date("2026-07-15T21:04:00");
const seenAt = new Date("2026-07-16T09:12:00");

export function Crossing({
  copy,
  locale,
}: {
  copy: Messages["home"]["crossing"];
  locale: Locale;
}) {
  const [crossed, setCrossed] = useState(false);
  const onCrossed = useCallback(() => setCrossed(true), []);

  return (
    <section
      aria-labelledby="crossing-title"
      className="mx-auto w-full max-w-[1240px] px-4 py-24 sm:px-6 lg:px-8 lg:py-32"
    >
      <div className="grid gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
        <div className="reveal">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--accent-foreground)]">
            {copy.eyebrow}
          </p>
          <h2
            id="crossing-title"
            className="mt-4 text-balance text-[clamp(1.9rem,1.1rem+2.6vw,3rem)] font-bold leading-[1.03] tracking-[-0.05em]"
          >
            {copy.title}
          </h2>
          <p className="mt-5 max-w-[46ch] text-pretty leading-8 text-[var(--muted-foreground)]">
            {copy.lede}
          </p>
          <p className="mt-5 text-sm font-semibold">{copy.invite}</p>
        </div>

        <div className="reveal" style={{ "--d": 1 } as React.CSSProperties}>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-md)] sm:p-7">
            {crossed ? (
              <div className="animate-fade">
                <p className="text-lg font-semibold tracking-[-0.02em]">
                  {copy.doneTitle}
                </p>
                <p className="mt-2 max-w-[42ch] text-pretty text-sm leading-7 text-[var(--muted-foreground)]">
                  {copy.doneBody}
                </p>

                <ShareReceipt
                  locale={locale}
                  sharedAt={sharedAt}
                  seenAt={seenAt}
                  recipientName={`Dra. ${copy.recipient}`}
                  className="mt-6"
                />

                <button
                  type="button"
                  onClick={() => setCrossed(false)}
                  className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--border)] px-4 text-sm font-semibold text-[var(--muted-foreground)] outline-none transition-colors duration-200 hover:bg-[var(--muted)] hover:text-[var(--foreground)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  {copy.again}
                </button>
              </div>
            ) : (
              <>
                <SensitivityTag level="private" locale={locale} />
                <p className="mt-4 max-w-[38ch] text-pretty font-serif text-[1.05rem] italic leading-7">
                  {/* Um fragmento plausível e banal de propósito: um exemplo
                      dramático transformaria a demonstração em espetáculo. */}
                  {locale === "pt-PT"
                    ? "«Percebi na quinta que o que me irrita não é o atraso dele. É ter de fingir que não me irrita.»"
                    : "“Percebi na quinta que o que me irrita não é o atraso dele. É ter que fingir que não me irrita.”"}
                </p>

                <div className="mt-7">
                  <ShareGesture
                    locale={locale}
                    recipientName={copy.recipient}
                    onCrossed={onCrossed}
                  />
                </div>
              </>
            )}
          </div>

          <p className="mt-4 text-xs leading-6 text-[var(--muted-foreground)]">
            {copy.access}
          </p>
        </div>
      </div>
    </section>
  );
}
