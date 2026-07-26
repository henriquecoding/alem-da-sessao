import Link from "next/link";
import { ArrowRight, Clock3, LockKeyhole, Sparkles } from "lucide-react";
import { toolRegistry } from "@alem-da-sessao/tool-registry";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeading } from "@/components/page-heading";
import { localPath, resolveLocale } from "@/lib/locale";

export default async function ClientExperiencesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, segment } = await resolveLocale(params);

  return (
    <>
      <PageHeading
        title="Experiências"
        description="Pode começar ao seu ritmo. Abrir ou guardar uma experiência não a partilha."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {toolRegistry.map((tool, index) => (
          <Card
            key={tool.id}
            className={
              index === 0
                ? "overflow-hidden bg-[var(--pastel-lilac)]"
                : "overflow-hidden bg-[var(--pastel-blue)]"
            }
          >
            <CardContent className="flex min-h-[330px] flex-col p-6 sm:p-8">
              <div className="flex items-start justify-between">
                <span
                  className={`grid size-12 place-items-center rounded-2xl ${
                    index === 0
                      ? "bg-white/72 text-[var(--primary)]"
                      : "bg-white/72 text-[var(--info)]"
                  }`}
                >
                  <Sparkles className="size-5" />
                </span>
                <Badge tone="accent">
                  <LockKeyhole className="mr-1 size-3" />
                  Privado
                </Badge>
              </div>
              <h2 className="mt-8 text-2xl font-bold tracking-[-0.04em]">
                {tool.title[locale]}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
                {tool.summary[locale]}
              </p>
              <p className="mt-4 inline-flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                <Clock3 className="size-3.5" />
                Cerca de {tool.estimatedMinutes} minutos
              </p>
              <Button
                asChild
                variant={index === 0 ? "default" : "secondary"}
                className="mt-auto w-fit"
              >
                <Link
                  href={localPath(
                    segment,
                    `/cuidado/experiencias/${tool.slug}`,
                  )}
                >
                  Abrir experiência
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
