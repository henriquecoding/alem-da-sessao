import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  ClipboardSignature,
  Clock3,
  CreditCard,
  Inbox,
  LockKeyhole,
  Monitor,
  Sparkles,
  UserRound,
} from "lucide-react";
import { getProfessionalToday } from "@alem-da-sessao/db";
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
import { MetricCard } from "@/components/metric-card";
import { PageHeading } from "@/components/page-heading";
import { formatTime } from "@/lib/format";
import { localPath, resolveLocale } from "@/lib/locale";

export default async function ProfessionalTodayPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale, segment }, data] = await Promise.all([
    resolveLocale(params),
    getProfessionalToday(),
  ]);
  const messages = getMessages(locale);
  const nextAppointment = data.nextAppointment;

  return (
    <>
      <PageHeading
        eyebrow="Segunda-feira, 27 de julho"
        title={messages.professional.greeting}
        description={messages.professional.subtitle}
        action={
          <Button asChild>
            <Link href={localPath(segment, "/pro/agenda")}>
              <CalendarClock className="size-4" />
              Abrir agenda
            </Link>
          </Button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <Card className="overflow-hidden bg-[var(--primary)] text-white">
          <CardContent className="grid min-h-[290px] gap-8 p-6 sm:grid-cols-[1fr_auto] sm:p-8">
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-white/12 text-white">
                  {messages.professional.nextSession}
                </Badge>
                <Badge tone="accent">Confirmada</Badge>
              </div>
              <div className="mt-8">
                <p className="text-3xl font-bold tracking-[-0.045em]">
                  {nextAppointment?.clientName}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/65">
                  <span className="inline-flex items-center gap-2">
                    <Clock3 className="size-4" />
                    {nextAppointment
                      ? formatTime(nextAppointment.startsAt, locale)
                      : "—"}{" "}
                    · 50 min
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Monitor className="size-4" />
                    Online
                  </span>
                </div>
              </div>
              <div className="mt-auto pt-8">
                <Button
                  asChild
                  variant="secondary"
                  className="border-0 bg-white text-[var(--foreground)] hover:bg-white/90"
                >
                  <Link
                    href={localPath(
                      segment,
                      `/pro/clientes/${nextAppointment?.clientId}`,
                    )}
                  >
                    Abrir contexto do cliente
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="bg-white/8 flex min-w-40 flex-col justify-between rounded-3xl p-5">
              <LockKeyhole className="size-5 text-[var(--accent)]" />
              <div>
                <p className="text-xs font-bold">Antes da sessão</p>
                <p className="mt-2 text-xs leading-5 text-white/55">
                  1 partilha por rever e nenhum rascunho privado visível.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>{messages.professional.todaySchedule}</CardTitle>
              <CardDescription>4 sessões · 3 confirmadas</CardDescription>
            </div>
            <Badge tone="success">No horário</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.appointments.map((appointment, index) => (
              <div
                key={appointment.id}
                className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white/40 p-3"
              >
                <span
                  className={`h-10 w-1 rounded-full ${
                    index === 0
                      ? "bg-[var(--accent)]"
                      : index === 1
                        ? "bg-[var(--primary)]"
                        : "bg-[#84a3c0]"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">
                    {appointment.clientName}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                    {formatTime(appointment.startsAt, locale)} ·{" "}
                    {appointment.modality === "online"
                      ? "Online"
                      : "Presencial"}
                  </p>
                </div>
                <UserRound className="text-[var(--muted-foreground)]/55 size-4" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <section className="mt-6">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-[-0.03em]">
              {messages.professional.pending}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Só o que conduz a uma ação.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label={messages.professional.newRequests}
            value={data.actionCounts.newRequests}
            detail="Recebidos desde sexta-feira"
            icon={Inbox}
            tone="blue"
          />
          <MetricCard
            label={messages.professional.unsignedNotes}
            value={data.actionCounts.unsignedNotes}
            detail="Rascunho guardado com sucesso"
            icon={ClipboardSignature}
            tone="lilac"
          />
          <MetricCard
            label={messages.professional.sharedExperiences}
            value={data.actionCounts.sharedExperiences}
            detail="Partilhadas pelos clientes"
            icon={Sparkles}
            tone="accent"
          />
          <MetricCard
            label={messages.professional.pendingPayments}
            value={data.actionCounts.pendingPayments}
            detail="Registados como externos"
            icon={CreditCard}
            tone="lemon"
          />
        </div>
      </section>

      <p className="mt-6 text-xs text-[var(--muted-foreground)]">
        {messages.professional.synthetic}
      </p>
    </>
  );
}
