import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  HeartHandshake,
  Layers3,
  LockKeyhole,
} from "lucide-react";
import { getMessages } from "@alem-da-sessao/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardPreview } from "@/components/dashboard-preview";
import { localPath, resolveLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Continuidade terapêutica com presença humana",
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, segment } = await resolveLocale(params);
  const messages = getMessages(locale);

  return (
    <main>
      <section className="mx-auto grid w-full max-w-[1240px] gap-12 px-4 pb-20 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-16 lg:px-8 lg:pb-28 lg:pt-24">
        <div>
          <Badge tone="accent" className="mb-6">
            <HeartHandshake className="mr-1.5 size-3.5" aria-hidden="true" />
            {messages.public.eyebrow}
          </Badge>

          <h1 className="text-balance max-w-[720px] text-[clamp(2.75rem,7vw,5.8rem)] leading-[.93] font-bold tracking-[-0.065em]">
            {messages.public.title}
          </h1>
          <p className="mt-7 max-w-[610px] text-base leading-8 text-[var(--muted-foreground)] sm:text-lg">
            {messages.public.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={localPath(segment, "/demo")}>
                {messages.public.primaryAction}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href={localPath(segment, "/experiencias")}>
                {messages.public.secondaryAction}
              </Link>
            </Button>
          </div>

          <div className="mt-8 flex items-start gap-3 text-sm leading-6 text-[var(--muted-foreground)]">
            <CheckCircle2
              className="mt-0.5 size-4 shrink-0 text-[var(--success)]"
              aria-hidden="true"
            />
            <p>{messages.public.trustLine}</p>
          </div>
        </div>

        <DashboardPreview />
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto grid w-full max-w-[1240px] gap-6 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            {
              icon: CalendarCheck2,
              title: "Uma prática organizada",
              description:
                "Agenda, clientes, notas, consentimentos e decisões do dia no mesmo contexto.",
            },
            {
              icon: Layers3,
              title: "Experiências com significado",
              description:
                "Ferramentas autorais com ritual próprio, não formulários genéricos disfarçados.",
            },
            {
              icon: LockKeyhole,
              title: "Partilha por escolha",
              description:
                "Guardar continua privado. Partilhar cria um retrato explícito e verificável.",
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-4 py-2">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--muted)] text-[var(--primary)]">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-bold tracking-[-0.025em]">{item.title}</h2>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-foreground)]">
            Duas experiências, o mesmo cuidado
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-[-0.045em] sm:text-5xl">
            Feito para quem acompanha e para quem está a viver o processo.
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="overflow-hidden bg-[var(--primary)] text-white">
            <CardContent className="flex min-h-[360px] flex-col p-7 sm:p-9">
              <Badge className="w-fit bg-white/12 text-white">Profissionais</Badge>
              <h3 className="mt-10 max-w-md text-3xl font-bold tracking-[-0.04em]">
                {messages.public.professionalTitle}
              </h3>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/68">
                Uma superfície operacional leve, com densidade apenas onde ajuda
                a decidir — nunca gráficos decorativos sobre pessoas.
              </p>
              <Button asChild variant="secondary" className="mt-auto w-fit border-0">
                <Link href={localPath(segment, "/pro/hoje")}>
                  Entrar na área profissional
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardContent className="flex min-h-[360px] flex-col p-7 sm:p-9">
              <Badge tone="accent" className="w-fit">
                Clientes
              </Badge>
              <h3 className="mt-10 max-w-md text-3xl font-bold tracking-[-0.04em]">
                {messages.public.clientTitle}
              </h3>
              <p className="mt-4 max-w-md text-sm leading-7 text-[var(--muted-foreground)]">
                O espaço privado não é uma versão reduzida de um prontuário. Tem
                uma tarefa principal, linguagem simples e controlo visível.
              </p>
              <Button asChild variant="quiet" className="mt-auto w-fit">
                <Link href={localPath(segment, "/cuidado/hoje")}>
                  Entrar na área do cliente
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
