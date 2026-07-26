import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toolRegistry } from "@alem-da-sessao/tool-registry";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { localPath, resolveLocale } from "@/lib/locale";

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
    <main className="mx-auto w-full max-w-[1180px] px-4 pb-24 pt-12 sm:px-6 lg:px-8 lg:pt-20">
      <Badge tone="accent">Experiências autorais</Badge>
      <h1 className="mt-5 max-w-4xl text-balance text-4xl font-bold tracking-[-0.055em] sm:text-6xl">
        Não são fichas com uma ilustração por cima.
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted-foreground)]">
        Cada experiência precisa de uma verdade humana, um ritual claro, limites
        documentados e uma forma própria de devolver significado à próxima
        conversa.
      </p>

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        {toolRegistry.map((tool, index) => (
          <Card
            key={tool.id}
            className={
              index === 0
                ? "overflow-hidden bg-[var(--pastel-lilac)]"
                : "overflow-hidden bg-[var(--pastel-blue)]"
            }
          >
            <CardContent className="flex min-h-[390px] flex-col p-7 sm:p-9">
              <div className="flex items-start justify-between">
                <span
                  className={`size-13 grid place-items-center rounded-3xl ${
                    index === 0
                      ? "bg-white/72 text-[var(--primary)]"
                      : "bg-white/72 text-[var(--info)]"
                  }`}
                >
                  <Sparkles className="size-5" />
                </span>
                <Badge tone="success">Demonstração funcional</Badge>
              </div>
              <h2 className="mt-10 text-3xl font-bold tracking-[-0.045em]">
                {tool.title[locale]}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                {tool.summary[locale]}
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-xs text-[var(--muted-foreground)]">
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="size-4" />
                  {tool.estimatedMinutes} minutos
                </span>
                <span className="inline-flex items-center gap-2">
                  <LockKeyhole className="size-4" />
                  Privada por defeito
                </span>
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="size-4" />
                  Partilha por snapshot
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
                  Abrir demonstração
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
