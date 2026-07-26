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
        <Card className="overflow-hidden bg-[var(--surface)]">
          <CardContent className="grid min-h-[300px] gap-6 p-6 sm:grid-cols-[1fr_auto] sm:p-8">
            <div className="flex flex-col">
              <Badge tone="success" className="w-fit">
                {messages.client.nextSession}
              </Badge>
              <h2 className="mt-8 text-3xl font-bold tracking-[-0.045em]">
                Segunda-feira, 27 de julho
              </h2>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--muted-foreground)]">
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="size-4 text-[var(--primary)]" />
                  09:30 · 50 minutos
                </span>
                <span className="inline-flex items-center gap-2">
                  <Video className="size-4 text-[var(--primary)]" />
                  Online
                </span>
              </div>
              <Button className="mt-auto w-fit" variant="secondary">
                <CalendarDays className="size-4" />
                Ver detalhes da sessão
              </Button>
            </div>
            <div className="flex min-w-44 flex-col justify-between rounded-3xl bg-[var(--muted)] p-5">
              <ShieldCheck className="size-5 text-[var(--primary)]" />
              <div>
                <p className="text-xs font-bold">Dra. Inês Almeida</p>
                <p className="mt-1 text-[10px] leading-4 text-[var(--muted-foreground)]">
                  Psicóloga · credencial verificada para demonstração
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden bg-[#202e29] text-white">
          <CardContent className="flex min-h-[300px] flex-col p-6 sm:p-8">
            <div className="flex items-start justify-between">
              <span className="grid size-11 place-items-center rounded-2xl bg-white/8 text-[var(--accent)]">
                <Sparkles className="size-5" />
              </span>
              <Badge className="bg-white/8 text-white/65">
                {messages.client.privateByDefault}
              </Badge>
            </div>
            <h2 className="mt-7 text-2xl font-bold tracking-[-0.04em]">
              Estruturas de Carga
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/58">
              Observe o que sustenta, como a estrutura responde e onde o apoio
              pode ser redistribuído.
            </p>
            <Button asChild variant="quiet" className="mt-auto w-fit">
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

      <Card className="mt-5">
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
