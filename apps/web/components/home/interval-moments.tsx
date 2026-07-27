import type { CSSProperties } from "react";
import type { Messages } from "@alem-da-sessao/i18n";

/**
 * Tempo 2 — o que acontece dentro do intervalo.
 *
 * Onde uma página de SaaS põe três ícones com três benefícios, esta põe seis
 * momentos de uma semana qualquer, com hora. É a parte da página que não tenta
 * vender nada: se alguém reconhecer duas destas linhas, o resto do argumento
 * já não precisa de ser feito.
 *
 * Os momentos descem por uma espinha vertical e afastam-se progressivamente
 * dela. O desvio é a forma: uma semana não anda a direito, e uma lista
 * alinhada leria como um roadmap. A hora fica na espinha, em monoespaçado,
 * porque é a única coisa aqui que é um dado.
 */
export function IntervalMoments({
  copy,
}: {
  copy: Messages["home"]["moments"];
}) {
  return (
    <section
      aria-labelledby="moments-title"
      className="mx-auto w-full max-w-[1240px] px-4 py-24 sm:px-6 lg:px-8 lg:py-32"
    >
      {/* O título fica pregado enquanto a semana passa ao lado. Não é um
          efeito: é o que mantém a pergunta à vista durante as seis respostas,
          e é o que impede a coluna de momentos de ficar abandonada na metade
          esquerda de um contentor largo. */}
      <div className="grid gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="reveal lg:sticky lg:top-28 lg:self-start">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--accent-foreground)]">
            {copy.eyebrow}
          </p>
          <h2
            id="moments-title"
            className="mt-4 text-balance text-[clamp(1.9rem,1.1rem+2.4vw,2.9rem)] font-bold leading-[1.02] tracking-[-0.05em]"
          >
            {copy.title}
          </h2>
          <p className="mt-5 max-w-[44ch] text-pretty leading-8 text-[var(--muted-foreground)]">
            {copy.lede}
          </p>

          <p className="mt-10 hidden max-w-[40ch] text-pretty border-t-2 border-[var(--foreground)] pt-6 text-lg leading-8 lg:block">
            {copy.closing}
          </p>
        </div>

        <ol className="relative border-l border-[var(--border)] pl-6 sm:pl-10">
          {copy.items.map((item, index) => (
            <li
              key={item.when}
              className="reveal relative pb-12 last:pb-0"
              style={
                {
                  "--d": index,
                  // O desvio cresce com a semana e volta a fechar no fim, que é
                  // quando a próxima sessão puxa tudo de volta ao eixo.
                  "--drift": `${[0, 0.7, 1.5, 1.9, 1.2, 0][index] ?? 0}rem`,
                } as CSSProperties
              }
            >
              <span
                aria-hidden="true"
                className="absolute -left-[calc(1.5rem+3.5px)] top-2 size-1.5 rounded-full bg-[var(--border-strong)] sm:-left-[calc(2.5rem+3.5px)]"
              />
              <div className="sm:ml-[var(--drift)]">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                  {item.when}
                </p>
                <p className="mt-2 max-w-[34ch] text-pretty font-serif text-[clamp(1.15rem,0.9rem+0.9vw,1.7rem)] leading-[1.35] tracking-[-0.02em]">
                  {item.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="reveal mt-16 max-w-[44ch] text-pretty border-t-2 border-[var(--foreground)] pt-6 text-lg leading-8 lg:hidden">
        {copy.closing}
      </p>
    </section>
  );
}
