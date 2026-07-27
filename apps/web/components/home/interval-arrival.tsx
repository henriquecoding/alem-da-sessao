import type { CSSProperties } from "react";
import { ArrowDown } from "lucide-react";
import type { Locale, Messages } from "@alem-da-sessao/i18n";

/**
 * Tempo 1 da homepage — a chegada.
 *
 * A decisão que define esta página inteira: **não abre com um herói.** Um
 * eyebrow, um `h1`, um parágrafo e dois botões é a forma de todas as páginas
 * de SaaS que existem, e a semelhança não é superficial — é a admissão de que
 * o produto podia ser qualquer produto.
 *
 * Aqui, quem chega aterra *dentro* do intervalo. A régua horizontal é a semana
 * entre duas sessões: à esquerda uma que acabou, à direita uma que ainda não
 * é. Entre as duas, sete dias de nada — desenhados como espaço real, à escala,
 * porque o vazio é o argumento e um parágrafo a descrevê-lo não teria a mesma
 * força que atravessá-lo com os olhos.
 *
 * A marca «está aqui» respira. É a única animação infinita do produto e existe
 * por uma razão: um ponto parado é um gráfico, um ponto que respira é alguém.
 * Com `prefers-reduced-motion` fica parada, e a composição não perde nada —
 * o halo continua lá, só não pulsa.
 */
export function IntervalArrival({
  copy,
  locale,
}: {
  copy: Messages["home"]["arrival"];
  locale: Locale;
}) {
  return (
    <section
      aria-labelledby="arrival-title"
      className="material relative flex min-h-[min(92svh,46rem)] flex-col justify-center overflow-hidden border-b border-[var(--border)] bg-[var(--background-deep)] px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-[1240px]">
        <p
          className="enter font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted-foreground)]"
          lang={locale}
        >
          {copy.span}
        </p>

        <h1
          id="arrival-title"
          className="enter mt-5 text-balance text-[clamp(3.2rem,1.4rem+7.4vw,7.5rem)] font-bold leading-[0.9] tracking-[-0.06em]"
          style={{ "--d": 1 } as CSSProperties}
        >
          {copy.title}
        </h1>

        <p
          className="enter mt-7 max-w-[46ch] text-pretty text-base leading-8 text-[var(--muted-foreground)] sm:text-lg"
          style={{ "--d": 2 } as CSSProperties}
        >
          {copy.lede}
        </p>

        {/* A régua. Uma sessão de 50 minutos ocupa 0,5% de uma semana, e é
            essa a proporção desenhada: as duas âncoras são traços finos e o
            que fica entre elas é quase toda a largura do ecrã. */}
        <div
          className="enter mt-16 sm:mt-20"
          style={{ "--d": 3 } as CSSProperties}
          aria-hidden="true"
        >
          <div className="relative h-px w-full bg-[var(--border-strong)]">
            {/* O intervalo propriamente dito: tracejado, porque não é uma
                ausência de tempo — é tempo sem registo. */}
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[repeating-linear-gradient(to_right,var(--accent)_0_3px,transparent_3px_11px)] opacity-70" />

            <span className="absolute left-0 top-1/2 h-9 w-[3px] -translate-y-1/2 rounded-full bg-[var(--primary)]" />
            <span className="absolute right-0 top-1/2 h-9 w-[3px] -translate-y-1/2 rounded-full bg-[var(--primary)] opacity-45" />

            {/* «Está aqui», a 38% da travessia. Não ao meio: estar a meio de
                uma coisa é uma posição confortável, e esta não é. */}
            <span className="absolute left-[38%] top-1/2 -translate-x-1/2 -translate-y-1/2">
              {/* Um halo em gradiente e não um círculo com opacidade: a
                  circunferência de um disco translúcido lê-se como uma
                  segunda forma, e o que se quer aqui é luz, não outro objeto. */}
              <span className="motion-safe:animate-breathe absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--accent)_0%,transparent_68%)] opacity-25" />
              <span className="relative block size-2.5 rounded-full bg-[var(--accent)] ring-4 ring-[var(--background-deep)]" />
            </span>

            {/* A etiqueta pendurada no ponto, não centrada entre as âncoras:
                estava a dizer «está aqui» a 12% de distância do sítio onde
                efetivamente estava. Fica *acima* da régua porque abaixo dela,
                num ecrã estreito, colidia com a data da sessão anterior. */}
            <span className="absolute bottom-full left-[38%] mb-4 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--accent-foreground)]">
              {copy.hereLabel}
            </span>
          </div>

          <div className="mt-4 flex items-start justify-between gap-6">
            <Anchor
              day={copy.fromDay}
              detail={copy.fromDetail}
              state={copy.fromState}
            />
            <Anchor
              day={copy.toDay}
              detail={copy.toDetail}
              state={copy.toState}
              align="right"
              dim
            />
          </div>
        </div>

        <p
          className="enter mt-12 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]"
          style={{ "--d": 4 } as CSSProperties}
        >
          <ArrowDown
            className="motion-safe:animate-float size-3.5"
            aria-hidden="true"
          />
          {copy.cue}
        </p>
      </div>
    </section>
  );
}

function Anchor({
  day,
  detail,
  state,
  align = "left",
  dim = false,
}: {
  day: string;
  detail: string;
  state: string;
  align?: "left" | "right";
  dim?: boolean;
}) {
  return (
    <div className={align === "right" ? "text-right" : undefined}>
      <p
        className={
          dim
            ? "text-sm font-semibold text-[var(--muted-foreground)]"
            : "text-sm font-semibold"
        }
      >
        {day}
      </p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
        {detail} · {state}
      </p>
    </div>
  );
}
