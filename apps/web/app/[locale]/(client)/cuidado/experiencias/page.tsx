import { ExperienceLibrary } from "@/components/experience-library";
import { PageHeading } from "@/components/page-heading";
import { resolveLocale } from "@/lib/locale";

export default async function ClientExperiencesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, segment } = await resolveLocale(params);

  return (
    <>
      <PageHeading
        eyebrow="Biblioteca privada"
        title="Experiências"
        description={
          locale === "pt-PT"
            ? "Não são fichas para preencher. Cada percurso transforma uma parte do intervalo num artefacto que pode guardar, rever ou escolher partilhar."
            : "Não são fichas para preencher. Cada percurso transforma uma parte do intervalo em um artefato que você pode guardar, rever ou escolher compartilhar."
        }
      />
      <ExperienceLibrary locale={locale} segment={segment} surface="client" />
    </>
  );
}
