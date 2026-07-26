import Link from "next/link";
import { ArrowRight, Clock3, Plus, ShieldCheck, Sparkles } from "lucide-react";
import { toolRegistry } from "@alem-da-sessao/tool-registry";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
        title="Experiências"
        description="Atribua uma versão concreta e reveja apenas o que o cliente decidiu partilhar."
        action={
          <Button asChild>
            <Link href={localPath(segment, "/pro/clientes")}>
              <Plus className="size-4" />
              Escolher cliente
            </Link>
          </Button>
        }
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
            <CardContent className="flex min-h-[310px] flex-col p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <span
                  className={`grid size-12 place-items-center rounded-2xl ${
                    index === 0
                      ? "bg-white/72 text-[var(--primary)]"
                      : "bg-white/72 text-[var(--info)]"
                  }`}
                >
                  <Sparkles className="size-5" />
                </span>
                <Badge tone="success">Demonstração funcional</Badge>
              </div>
              <h2 className="mt-8 text-2xl font-bold tracking-[-0.04em]">
                {tool.title[locale]}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
                {tool.summary[locale]}
              </p>
              <div className="mt-5 flex flex-wrap gap-4 text-xs text-[var(--muted-foreground)]">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-3.5" />
                  {tool.estimatedMinutes} min
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5" />
                  Snapshot explícito
                </span>
              </div>
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
                  Pré-visualizar
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
