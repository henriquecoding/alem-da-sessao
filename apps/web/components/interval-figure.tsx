import type { Locale } from "@alem-da-sessao/i18n";
import { cn } from "@/lib/utils";

/**
 * A figura do intervalo — relatório v2 §4.2 e §6.8.
 *
 * Substitui a captura de ecrã com cromo de navegador que estava aqui. Uma
 * captura de dashboard falha o terceiro teste de qualidade do §6.8:
 *
 * > Esta tela poderia pertencer a outro produto se eu trocasse o logo?
 *
 * Podia. Toda a Camada A tem uma. Esta figura não pode pertencer a mais
 * ninguém, porque desenha a única coisa que nenhum concorrente modela: uma
 * sessão semanal de 50 minutos ocupa 0,5% de uma semana, e os outros 99,5%
 * não têm forma nem registo no modelo de dados de nenhum produto do mercado.
 *
 * Os EHRs modelam encontros porque encontros faturam. O intervalo não fatura,
 * logo não existe. É isso que está desenhado aqui.
 */
export function IntervalFigure({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const pt = locale === "pt-PT";

  const marks = [
    { at: 0, label: pt ? "sessão" : "sessão", align: "items-start" },
    { at: 100, label: pt ? "sessão" : "sessão", align: "items-end" },
  ];

  return (
    <figure
      className={cn(
        "material shadow-rested relative rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-7 sm:p-9",
        className,
      )}
    >
      <figcaption className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {pt ? "Uma semana de tratamento" : "Uma semana de tratamento"}
      </figcaption>

      {/* A régua. Os dois traços cheios são as sessões; tudo entre eles é o
          intervalo — deliberadamente a esmagadora maioria da largura. */}
      {/* As marcas ficam dentro da régua em vez de a transbordar: `left: 100%`
          empurrava a segunda sessão para fora da caixa. */}
      <div className="relative mt-10 h-10">
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[var(--border-strong)]"
        />
        {/* A faixa do intervalo, tracejada: existe, mas não é sólida em
            produto nenhum. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-[repeating-linear-gradient(90deg,var(--accent)_0_5px,transparent_5px_11px)]"
        />

        {marks.map((mark) => (
          <span
            key={mark.at}
            className={cn(
              "absolute inset-y-0 flex flex-col justify-center",
              mark.align,
            )}
            style={
              mark.at === 0 ? { left: 0 } : { right: 0, alignItems: "flex-end" }
            }
          >
            <span className="h-10 w-[3px] rounded-full bg-[var(--primary)]" />
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-start justify-between gap-4 text-xs">
        <span className="flex flex-col">
          <span className="font-medium">50 min</span>
          <span className="text-[var(--muted-foreground)]">
            {marks[0]!.label}
          </span>
        </span>
        <span className="text-center text-[var(--accent-foreground)]">
          <strong className="tabular block text-lg font-semibold leading-none">
            99,5%
          </strong>
          <span className="mt-1 block">
            {pt ? "o intervalo" : "o intervalo"}
          </span>
        </span>
        <span className="flex flex-col text-right">
          <span className="font-medium">50 min</span>
          <span className="text-[var(--muted-foreground)]">
            {marks[1]!.label}
          </span>
        </span>
      </div>

      <p className="mt-8 border-t border-[var(--border)] pt-6 text-[0.95rem] leading-7 text-[var(--muted-foreground)]">
        {pt
          ? "Os prontuários modelam encontros, porque encontros faturam. O que acontece entre eles não tem forma, objeto nem registo em produto nenhum — e é aí que o processo de facto acontece."
          : "Os prontuários modelam encontros, porque encontros faturam. O que acontece entre eles não tem forma, objeto nem registro em produto nenhum — e é aí que o processo de fato acontece."}
      </p>

      <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {[
          {
            term: pt ? "O que fica da sessão" : "O que fica da sessão",
            desc: pt
              ? "Três linhas, logo a seguir, nas palavras de quem esteve lá."
              : "Três linhas, logo depois, nas palavras de quem esteve lá.",
          },
          {
            term: pt ? "O que atravessa" : "O que atravessa",
            desc: pt
              ? "Só o que a pessoa decidir, num gesto explícito."
              : "Só o que a pessoa decidir, num gesto explícito.",
          },
        ].map((item) => (
          <div key={item.term}>
            <dt className="text-sm font-semibold">{item.term}</dt>
            <dd className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              {item.desc}
            </dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}
