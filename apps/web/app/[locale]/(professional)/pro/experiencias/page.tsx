import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExperienceLibrary } from "@/components/experience-library";
import { PageHeading } from "@/components/page-heading";
import { localPath, resolveLocale } from "@/lib/locale";

export default async function ProfessionalExperiencesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, segment } = await resolveLocale(params);

  return (
    <>
      <PageHeading
        eyebrow="Instrumentos de continuidade"
        title="Biblioteca de experiências"
        description="Atribua um percurso com intenção explícita. O profissional vê apenas o snapshot que o cliente decidiu confirmar."
        action={
          <Button asChild>
            <Link href={localPath(segment, "/pro/clientes")}>
              <Plus className="size-4" />
              Escolher cliente
            </Link>
          </Button>
        }
      />
      <ExperienceLibrary
        locale={locale}
        segment={segment}
        surface="professional"
      />
    </>
  );
}
