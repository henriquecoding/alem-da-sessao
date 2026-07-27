import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { ExperienceLibrary } from "@/components/experience-library";
import { Badge } from "@/components/ui/badge";
import { resolveLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Experiências",
};

export default async function PublicExperiencesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, segment } = await resolveLocale(params);

  return (
    <main className="mx-auto w-full max-w-[1240px] px-4 pb-24 pt-12 sm:px-6 lg:px-8 lg:pt-20">
      <Badge tone="accent" className="enter">
        Experiências autorais
      </Badge>
      <h1
        className="enter mt-6 max-w-[18ch] text-balance font-serif text-[clamp(2.5rem,1.2rem+4.6vw,4.5rem)] font-medium leading-[0.98] tracking-[-0.05em]"
        style={{ "--d": 1 } as CSSProperties}
      >
        O intervalo também pode ter arquitetura.
      </h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-10">
        {/* The rule now belongs to the lead paragraph instead of stretching
            across a two-column grid it only touched on one side. */}
        <p
          className="enter max-w-[58ch] border-l-2 border-[var(--accent)] pl-5 text-base leading-7 text-[var(--muted-foreground)] sm:leading-8"
          style={{ "--d": 2 } as CSSProperties}
        >
          Cada experiência tem uma matéria própria, um ritual claro e uma forma
          concreta de regressar à conversa — sem pontos, diagnósticos ou
          interpretações automáticas. São gratuitas e não exigem conta.
        </p>
        <p
          className="enter max-w-[62ch] text-sm leading-7 text-[var(--muted-foreground)]"
          style={{ "--d": 3 } as CSSProperties}
        >
          O rascunho nasce privado. Em Estruturas de Carga, a pessoa pode
          depositar um recorte anónimo na parede comunitária e apoiar outras
          estruturas sem comentários, perfis ou contacto direto.
        </p>
      </div>

      <div className="mt-12">
        <ExperienceLibrary locale={locale} segment={segment} surface="public" />
      </div>
    </main>
  );
}
