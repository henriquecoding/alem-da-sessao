import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ArrowRight, HeartHandshake, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { localPath, resolveLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Demonstração local",
};

export default async function DemoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { segment } = await resolveLocale(params);

  const areas = [
    {
      icon: Stethoscope,
      title: "Espaço profissional",
      description:
        "Agenda, clientes, pendências e atribuição de experiências numa superfície operacional.",
      href: "/pro/hoje",
      tone: "bg-[var(--primary)] text-white",
      iconTone: "bg-white/12 text-white",
    },
    {
      icon: HeartHandshake,
      title: "Espaço do cliente",
      description:
        "Sessões, experiências privadas e controlo explícito sobre qualquer partilha.",
      href: "/cuidado/hoje",
      tone: "bg-[var(--surface)]",
      iconTone: "bg-[var(--accent-soft)] text-[var(--accent-foreground)]",
    },
    {
      icon: Activity,
      title: "Administração",
      description:
        "Operação, assinaturas e verificações sem uma janela normal para conteúdo clínico.",
      href: "/admin/operacao",
      tone: "bg-[#dde9e4]",
      iconTone: "bg-[var(--primary)] text-white",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pt-20">
      <Badge tone="warning">Ambiente exclusivamente local</Badge>
      <h1 className="mt-5 max-w-3xl text-balance text-4xl font-bold tracking-[-0.055em] sm:text-6xl">
        Escolha a perspectiva que quer validar.
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted-foreground)]">
        As três áreas usam dados sintéticos e não estão ligadas a Supabase,
        pagamentos ou serviços externos. Servem para testar arquitetura,
        linguagem e experiência antes de qualquer lançamento.
      </p>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {areas.map((area) => (
          <Card key={area.href} className={area.tone}>
            <CardContent className="flex min-h-[330px] flex-col p-6 sm:p-7">
              <span
                className={`grid size-12 place-items-center rounded-2xl ${area.iconTone}`}
              >
                <area.icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mt-8 text-2xl font-bold tracking-[-0.04em]">
                {area.title}
              </h2>
              <p
                className={`mt-3 text-sm leading-7 ${
                  area.tone.includes("text-white")
                    ? "text-white/68"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                {area.description}
              </p>
              <Button
                asChild
                variant={area.tone.includes("text-white") ? "secondary" : "default"}
                className="mt-auto w-full"
              >
                <Link href={localPath(segment, area.href)}>
                  Entrar nesta área
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
