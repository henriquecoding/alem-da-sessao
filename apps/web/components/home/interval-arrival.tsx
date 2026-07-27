"use client";

import { useState, type CSSProperties } from "react";
import { ArrowDown } from "lucide-react";
import type { Locale, Messages } from "@alem-da-sessao/i18n";
import { CountUp } from "@/components/motion/count-up";
import { useChoreography } from "@/components/motion/use-choreography";

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
 * A régua constrói-se, e a ordem é o argumento: primeiro a semana inteira,
 * depois os dois traços das sessões a assentar nas pontas, depois o intervalo
 * a preencher-se entre eles, e só no fim o número. Uma conclusão que chega
 * antes do argumento não se lê.
 *
 * O traçado é CSS com `both` (`.draw-x` / `.draw-y`), não transições à espera
 * de um observador: isto está acima da dobra e não pode depender de hidratação
 * para ficar visível. Só a contagem precisa de JavaScript, e o `CountUp`
 * renderiza o valor final no servidor antes de recuar a zero — quem nunca
 * correr o bundle vê 99,5%, não 0.
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
  // A contagem entra depois de a régua ter crescido e de os dois traços terem
  // assentado — 1,5 s, que é onde o traçado acaba.
  const [counting, setCounting] = useState(false);
  useChoreography((timeline) => timeline.beat(1500, () => setCounting(true)));

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
          <div className="draw-x relative h-px w-full bg-[var(--border-strong)]">
            {/* O intervalo propriamente dito: tracejado, porque não é uma
                ausência de tempo — é tempo sem registo. Preenche-se por
                último, que é o que ele é: o que fica entre duas coisas que já
                lá estão. */}
            <span
              className="draw-x absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[repeating-linear-gradient(to_right,var(--accent)_0_3px,transparent_3px_11px)] opacity-70"
              style={{ "--d": 11, animationDuration: "600ms" } as CSSProperties}
            />

            <span
              className="draw-y surface-primary absolute left-0 top-1/2 h-9 w-[3px] -translate-y-1/2 rounded-full"
              style={{ "--d": 8 } as CSSProperties}
            />
            <span
              className="draw-y surface-primary absolute right-0 top-1/2 h-9 w-[3px] -translate-y-1/2 rounded-full opacity-45"
              style={{ "--d": 10 } as CSSProperties}
            />

            {/* «Está aqui», a 38% da travessia. Não ao meio: estar a meio de
                uma coisa é uma posição confortável, e esta não é. */}
            <span className="absolute left-[38%] top-1/2 -translate-x-1/2 -translate-y-1/2">
              {/* Um halo em gradiente e não um círculo com opacidade: a
                  circunferência de um disco translúcido lê-se como uma
                  segunda forma, e o que se quer aqui é luz, não outro objeto. */}
              <span className="motion-safe:animate-breathe absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--accent)_0%,transparent_68%)] opacity-25" />
              <span className="surface-accent relative block size-2.5 rounded-full ring-4 ring-[var(--background-deep)]" />
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

          {/* O número é a conclusão da figura e chega depois dela. Fica numa
              linha própria, abaixo das duas âncoras, porque ao centro da régua
              colidia com a data da sessão anterior num ecrã estreito. */}
          <p className="mt-10 text-center">
            <strong className="tabular block text-[clamp(2rem,1.4rem+2.2vw,3rem)] font-bold leading-none tracking-[-0.04em] text-[var(--accent-foreground)]">
              <CountUp
                value={99.5}
                decimals={1}
                suffix="%"
                locale={locale}
                active={counting}
              />
            </strong>
            <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
              {copy.measureLabel}
            </span>
          </p>
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
