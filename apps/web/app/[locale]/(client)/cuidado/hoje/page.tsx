import type { CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";
import { getMessages } from "@alem-da-sessao/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeading } from "@/components/page-heading";
import { localPath, resolveLocale } from "@/lib/locale";

export default async function ClientTodayPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, segment } = await resolveLocale(params);
  const messages = getMessages(locale);

  return (
    <>
      <PageHeading
        eyebrow="O seu espaço"
        title={messages.client.greeting}
        description={messages.client.subtitle}
      />

      <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <Card className="enter overflow-hidden bg-[var(--surface)]">
          <CardContent className="grid min-h-[300px] gap-6 p-6 sm:grid-cols-[minmax(0,1fr)_13.5rem] sm:p-8">
            <div className="flex flex-col">
              <Badge tone="success" className="w-fit">
                {messages.client.nextSession}
              </Badge>
              <h2 className="mt-8 text-[1.75rem] font-bold leading-[1.1] tracking-[-0.045em] sm:text-3xl">
                Segunda-feira, 27 de julho
              </h2>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--muted-foreground)]">
                <span className="tabular inline-flex items-center gap-2">
                  <Clock3 className="size-4 text-[var(--primary)]" />
                  09:30 · 50 minutos
                </span>
                <span className="inline-flex items-center gap-2">
                  <Video className="size-4 text-[var(--primary)]" />
                  Online
                </span>
              </div>
              <Button asChild className="mt-auto w-fit" variant="secondary">
                <Link href={localPath(segment, "/cuidado/sessoes")}>
                  <CalendarDays className="size-4" />
                  Ver detalhes da sessão
                </Link>
              </Button>
            </div>
            {/* Grouped as one identity block rather than an icon and a caption
                pinned to opposite ends of an empty panel. */}
            <div className="flex flex-col gap-4 rounded-3xl bg-[var(--muted)] p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--surface)] text-[var(--primary)] shadow-[var(--shadow-xs)]">
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">
                    Dra. Inês Almeida
                  </p>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Psicóloga
                  </p>
                </div>
              </div>
              <p className="text-xs leading-5 text-[var(--muted-foreground)]">
                Credencial verificada para demonstração. Acompanha o seu
                processo desde março.
              </p>
              <p className="mt-auto inline-flex items-center gap-2 text-[11px] font-semibold text-[var(--success)]">
                <span className="size-1.5 rounded-full bg-[var(--success)]" />
                Sessão confirmada
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="enter relative overflow-hidden bg-[var(--pastel-lilac)]"
          style={{ "--d": 1 } as CSSProperties}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-white/40 blur-3xl"
          />
          <CardContent className="relative flex min-h-[300px] flex-col p-6 sm:p-8">
            <div className="flex items-start justify-between gap-3">
              <span className="bg-white/72 grid size-11 place-items-center rounded-2xl text-[var(--primary)]">
                <Sparkles className="size-5" />
              </span>
              <Badge tone="accent">{messages.client.privateByDefault}</Badge>
            </div>
            <h2 className="mt-7 text-2xl font-bold tracking-[-0.04em]">
              Estruturas de Carga
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
              Observe o que sustenta, como a estrutura responde e onde o apoio
              pode ser redistribuído.
            </p>
            <div className="mt-6">
              <div
                className="h-1.5 overflow-hidden rounded-full bg-white/55"
                role="presentation"
              >
                <div className="h-full w-[40%] rounded-full bg-[var(--primary)]" />
              </div>
              <p className="mt-2 text-[11px] font-semibold text-[var(--muted-foreground)]">
                Etapa 2 de 5 · retomar onde parou
              </p>
            </div>
            <Button asChild className="mt-auto w-fit">
              <Link
                href={localPath(
                  segment,
                  "/cuidado/experiencias/estruturas-de-carga",
                )}
              >
                {messages.client.resume}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="reveal mt-5">
        <CardHeader className="sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{messages.client.privacyTitle}</CardTitle>
            <CardDescription>{messages.client.privacyBody}</CardDescription>
          </div>
          <span className="mt-2 grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--success-soft)] text-[var(--success)] sm:mt-0">
            <LockKeyhole className="size-5" />
          </span>
        </CardHeader>
      </Card>
    </>
  );
}
