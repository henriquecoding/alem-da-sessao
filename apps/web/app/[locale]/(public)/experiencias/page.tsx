import type { Metadata } from "next";
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
      <Badge tone="accent">Experiências autorais</Badge>
      <h1 className="mt-6 max-w-5xl text-balance font-serif text-5xl font-medium leading-[0.95] tracking-[-0.055em] sm:text-7xl">
        O intervalo também pode ter arquitetura.
      </h1>
      <div className="mt-6 grid gap-5 border-l-2 border-[var(--accent)] pl-5 lg:grid-cols-[1fr_1fr] lg:items-start">
        <p className="max-w-2xl text-base leading-8 text-[var(--muted-foreground)]">
          Cada experiência tem uma matéria própria, um ritual claro e uma forma
          concreta de regressar à conversa — sem pontos, diagnósticos ou
          interpretações automáticas. São gratuitas e não exigem conta.
        </p>
        <p className="max-w-xl text-sm leading-7 text-[var(--muted-foreground)]">
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
