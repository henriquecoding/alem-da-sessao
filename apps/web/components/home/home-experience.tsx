"use client";

import { useState, type ReactNode } from "react";
import type { Locale, LocaleSegment, Messages } from "@alem-da-sessao/i18n";
import { Crossing } from "@/components/home/crossing";
import { Doors } from "@/components/home/doors";
import { ReaderQuestion, type Reader } from "@/components/home/reader-question";

/**
 * A parte da homepage que responde a quem está a ler.
 *
 * Os tempos 2 e 3 chegam aqui como `ReactNode` já renderizados no servidor, e
 * isso é deliberado: são eles que carregam o texto todo da página, e texto que
 * precisa de JavaScript para existir é texto que o primeiro frame não tem. Este
 * componente só decide a **ordem** — não renderiza o conteúdo.
 *
 * A reordenação não é cosmética. Quem acompanha pessoas chega a avaliar uma
 * ferramenta de trabalho e quer o argumento primeiro; quem está em processo
 * chega a perceber se aquilo lhe diz alguma coisa, e para essa pessoa o
 * argumento de modelo de negócio é ruído antes de ter reconhecido a semana.
 * Uma página que serve os dois com a mesma ordem está a servir mal um deles.
 *
 * O estado é uma variável. Não persiste, não viaja, e a página inteira
 * funciona sem lhe tocar — ver `reader-question.tsx` para a razão, que não é
 * técnica.
 */
export function HomeExperience({
  copy,
  locale,
  segment,
  moments,
  argument,
}: {
  copy: Messages["home"];
  locale: Locale;
  segment: LocaleSegment;
  moments: ReactNode;
  argument: ReactNode;
}) {
  const [reader, setReader] = useState<Reader>(null);
  const argumentFirst = reader === "professional";

  return (
    <>
      <div className="border-b border-[var(--border)] bg-[var(--surface)]">
        <ReaderQuestion
          copy={copy.question}
          value={reader}
          onChange={setReader}
        />
      </div>

      {argumentFirst ? argument : moments}
      {argumentFirst ? moments : argument}

      <Crossing copy={copy.crossing} locale={locale} />

      <Doors
        copy={copy.doors}
        segment={segment}
        emphasis={
          reader === "professional" || reader === "client" ? reader : "none"
        }
      />
    </>
  );
}
