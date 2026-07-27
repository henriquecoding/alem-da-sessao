import type { CSSProperties } from "react";
import type { Messages } from "@alem-da-sessao/i18n";

/**
 * Tempo 3 — a pergunta óbvia, respondida antes de ser feita.
 *
 * Quem lê o tempo 2 e acredita chega imediatamente a «então porque é que
 * ninguém fez isto?». Uma página de SaaS responderia com logótipos de clientes
 * ou com um quadrado de imprensa. A resposta verdadeira é melhor do que
 * qualquer prova social: **ninguém fez porque o modelo de negócio de todos os
 * outros impede**, e isso pode ser demonstrado em três linhas.
 *
 * É por isso uma tabela e não cartões. Um argumento com esta forma — três
 * atores, três incentivos, uma conclusão — lê-se em quinze segundos e não
 * ganha nada com ilustração.
 */
export function WhyNobody({ copy }: { copy: Messages["home"]["why"] }) {
  return (
    <section
      aria-labelledby="why-title"
      className="border-y border-[var(--border)] bg-[var(--surface)]"
    >
      <div className="mx-auto grid w-full max-w-[1240px] gap-x-16 gap-y-12 px-4 py-24 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:px-8 lg:py-32">
        <div className="reveal lg:sticky lg:top-28 lg:self-start">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
            {copy.eyebrow}
          </p>
          <h2
            id="why-title"
            className="mt-4 text-balance text-[clamp(1.7rem,1.1rem+2.2vw,2.7rem)] font-bold leading-[1.05] tracking-[-0.045em]"
          >
            {copy.title}
            <span className="mt-2 block text-[var(--accent-foreground)]">
              {copy.subtitle}
            </span>
          </h2>
        </div>

        <div>
          <dl className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {copy.rows.map((row, index) => (
              <div
                key={row.who}
                className="reveal grid gap-2 py-6 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] sm:gap-8"
                style={{ "--d": index } as CSSProperties}
              >
                <dt className="text-sm font-semibold tracking-[-0.01em]">
                  {row.who}
                </dt>
                <dd className="text-pretty text-[0.95rem] leading-7 text-[var(--muted-foreground)]">
                  {row.what}
                </dd>
              </div>
            ))}
          </dl>

          <p
            className="reveal mt-8 max-w-[54ch] text-pretty leading-8"
            style={{ "--d": 3 } as CSSProperties}
          >
            {copy.conclusion}
          </p>
        </div>
      </div>
    </section>
  );
}
