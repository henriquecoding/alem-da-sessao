import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { getMessages } from "@alem-da-sessao/i18n";
import { HomeExperience } from "@/components/home/home-experience";
import { IntervalArrival } from "@/components/home/interval-arrival";
import { IntervalMoments } from "@/components/home/interval-moments";
import { WhyNobody } from "@/components/home/why-nobody";
import { resolveLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Continuidade terapêutica com presença humana",
};

/**
 * A homepage não fala do intervalo. **É um intervalo.**
 *
 * A versão anterior era competente e intercambiável: eyebrow, `h1`, dois
 * botões, três ícones com três benefícios, duas colunas comparativas, captura
 * de ecrã do produto. Trocando o logótipo e a paleta, servia qualquer SaaS —
 * o que é a definição exata do problema, porque a tese deste produto é que ele
 * *não* é intercambiável.
 *
 * Cinco tempos, que são de propósito os mesmos cinco do ritual das
 * experiências (§7.2) — a página ensaia aquilo que vende:
 *
 * 1. **A chegada.** Aterra-se dentro da semana entre duas sessões, com a
 *    régua à escala. O vazio é o argumento, e vê-se antes de se ler.
 * 2. **Os momentos.** Seis linhas de uma semana qualquer, com hora. É a parte
 *    que não vende nada; se duas forem reconhecidas, o resto está feito.
 * 3. **O argumento.** A pergunta óbvia — «então porque é que ninguém fez
 *    isto?» — respondida com incentivos em vez de logótipos.
 * 4. **O gesto.** O `ShareGesture` verdadeiro, não uma reconstituição: a tese
 *    é sobre a duração de um ato e só se percebe fazendo.
 * 5. **As portas.** Dois ritmos opostos, e uma nota final para quem já tem
 *    sessões com alguém e não escolhe nada aqui.
 *
 * Sobre a pergunta de chegada: reordena o tempo 5 e desaparece com a aba. Não
 * há cookie, não há armazenamento, não há evento enviado a lado nenhum — ver
 * `reader-question.tsx`.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, segment } = await resolveLocale(params);
  const messages = getMessages(locale);

  return (
    <main>
      <IntervalArrival copy={messages.home.arrival} locale={locale} />

      {/* Os tempos 2 e 3 entram como slots já renderizados no servidor. Quem
          decide a ordem deles é a resposta dada à chegada, mas quem os
          renderiza continua a ser o servidor — o texto vai inteiro no HTML
          estático. */}
      <HomeExperience
        copy={messages.home}
        locale={locale}
        segment={segment}
        moments={<IntervalMoments copy={messages.home.moments} />}
        argument={<WhyNobody copy={messages.home.why} />}
      />

      <div className="border-t border-[var(--border)] bg-[var(--surface)]">
        <p className="mx-auto flex w-full max-w-[1240px] items-start gap-3 px-4 py-8 text-sm leading-6 text-[var(--muted-foreground)] sm:px-6 lg:px-8">
          <CheckCircle2
            className="mt-0.5 size-4 shrink-0 text-[var(--success)]"
            aria-hidden="true"
          />
          {messages.public.trustLine}
        </p>
      </div>
    </main>
  );
}
