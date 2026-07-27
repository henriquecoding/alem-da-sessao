import type { CSSProperties } from "react";
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
import { getProfessionalIntervalView } from "@alem-da-sessao/db/intervals";
import { getMessages } from "@alem-da-sessao/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { localPath, resolveLocale } from "@/lib/locale";

/**
 * O Care OS — relatório v2 §6.2.
 *
 * | | Care OS | Experiência |
 * | Sensação-alvo | competência tranquila | um lugar |
 * | **Densidade** | **alta, compacta** | baixa, uma decisão por tela |
 * | Ritmo | rápido; latência é hostilidade | lento; pressa é hostilidade |
 *
 * Isto era uma grelha de cartões grandes com um painel roxo de 290px de
 * altura para uma linha de informação. Era o modo Experiência aplicado ao
 * Care OS: bonito, arejado e lento de ler.
 *
 * A reestruturação: uma barra de contexto compacta, uma tabela de agenda que
 * cabe inteira sem scroll, e as pendências como linhas accionáveis em vez de
 * quatro cartões de estatística. Um profissional abre isto entre duas sessões,
 * com cinco minutos — tudo o que importa cabe numa vista.
 */
export default async function ProfessionalTodayPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale, segment }, data, intervalView] = await Promise.all([
    resolveLocale(params),
    getProfessionalToday(),
    // A projeção profissional do intervalo: existência e snapshots, nunca
    // conteúdo nem sinais de atividade (§4.4, §10.6.5).
    getProfessionalIntervalView(),
  ]);
  const messages = getMessages(locale);
  const nextAppointment = data.nextAppointment;

  const pending = [
    {
      label: messages.professional.newRequests,
      value: data.actionCounts.newRequests,
      detail: "Recebidos desde sexta-feira",
      icon: Inbox,
      href: "/pro/clientes",
    },
    {
      label: messages.professional.unsignedNotes,
      value: data.actionCounts.unsignedNotes,
      detail: "Rascunho por assinar",
      icon: ClipboardSignature,
      href: "/pro/clientes",
    },
    {
      label: messages.professional.sharedExperiences,
      value: data.actionCounts.sharedExperiences,
      detail: "Partilhadas pelos clientes",
      icon: Sparkles,
      href: "/pro/experiencias",
    },
    {
      label: messages.professional.pendingPayments,
      value: data.actionCounts.pendingPayments,
      detail: "Registados como externos",
      icon: CreditCard,
      href: "/pro/financeiro",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[76rem]">
      {/* Cabeçalho compacto: uma linha de contexto, uma de identidade, uma
          ação. Nada ocupa mais altura do que aquilo que informa. */}
      <header className="enter mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
            Segunda-feira, 27 de julho · {data.organizationName}
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.025em]">
            {messages.professional.greeting}
          </h1>
        </div>
        <Button asChild size="sm">
          <Link href={localPath(segment, "/pro/agenda")}>
            <CalendarClock className="size-4" aria-hidden="true" />
            Abrir agenda
          </Link>
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          {/* A próxima sessão como faixa, não como painel. A informação é a
              mesma; a altura é um terço. */}
          <section
            className="enter rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]"
            style={{ "--d": 1 } as CSSProperties}
            aria-labelledby="next-session"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-3">
              <h2
                id="next-session"
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]"
              >
                {messages.professional.nextSession}
              </h2>
              <Badge tone="success">Confirmada</Badge>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="text-xl font-semibold tracking-[-0.02em]">
                  {nextAppointment?.clientName}
                </p>
                <dl className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[var(--muted-foreground)]">
                  <div className="inline-flex items-center gap-1.5">
                    <dt className="sr-only">Hora</dt>
                    <Clock3 className="size-3.5" aria-hidden="true" />
                    <dd className="tabular">
                      {nextAppointment
                        ? formatTime(nextAppointment.startsAt, locale)
                        : "—"}{" "}
                      · 50 min
                    </dd>
                  </div>
                  <div className="inline-flex items-center gap-1.5">
                    <dt className="sr-only">Modalidade</dt>
                    <Monitor className="size-3.5" aria-hidden="true" />
                    <dd>Online</dd>
                  </div>
                </dl>
              </div>
              <Button asChild variant="secondary" size="sm">
                <Link
                  href={localPath(
                    segment,
                    `/pro/clientes/${nextAppointment?.clientId}`,
                  )}
                >
                  Abrir contexto
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            {/* §4.4 — o que o profissional vê do intervalo: existência e
                snapshots. Nada de contagem de artefactos, "última atividade"
                ou "abriu e não completou". O invariante §10.6.5 exige que um
                intervalo vazio e um não partilhado sejam indistinguíveis. */}
            <div className="bg-[var(--muted)]/60 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[var(--border)] px-5 py-3 text-xs">
              <span className="inline-flex items-center gap-2 font-medium">
                <LockKeyhole
                  className="size-3.5 text-[var(--private)]"
                  aria-hidden="true"
                />
                Antes da sessão
              </span>
              <span className="text-[var(--muted-foreground)]">
                Partilhas por rever{" "}
                <strong className="tabular text-[var(--foreground)]">
                  {intervalView.sharedSnapshotCount}
                </strong>
              </span>
              <span className="text-[var(--muted-foreground)]">
                Intervalo{" "}
                <strong className="text-[var(--foreground)]">
                  {intervalView.state === "closing" ? "a fechar" : "aberto"}
                </strong>
              </span>
              <span className="text-[var(--muted-foreground)]">
                O que a cliente guardou e não partilhou não aparece aqui.
              </span>
            </div>
          </section>

          {/* Pendências como lista accionável. Quatro cartões de estatística
              ocupavam uma tela inteira para dizer quatro números que não
              levavam a lado nenhum. */}
          <section className="mt-6" aria-labelledby="pending">
            <div className="flex items-baseline justify-between">
              <h2 id="pending" className="text-sm font-semibold">
                {messages.professional.pending}
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                Só o que conduz a uma ação.
              </p>
            </div>

            <ul className="mt-3 divide-y divide-[var(--border)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
              {pending.map((item, index) => (
                <li
                  key={item.label}
                  className="reveal"
                  style={{ "--d": index } as CSSProperties}
                >
                  <Link
                    href={localPath(segment, item.href)}
                    className={cn(
                      "group/row flex items-center gap-4 px-5 py-3.5 outline-none",
                      "ease-(--ease-care) transition-colors duration-200",
                      "hover:bg-[var(--muted)]/70 focus-visible:bg-[var(--muted)]/70",
                    )}
                  >
                    <item.icon
                      className="size-4 shrink-0 text-[var(--muted-foreground)]"
                      aria-hidden="true"
                    />
                    <span className="tabular w-8 shrink-0 text-lg font-semibold tracking-[-0.03em]">
                      {item.value}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {item.label}
                      </span>
                      <span className="block truncate text-xs text-[var(--muted-foreground)]">
                        {item.detail}
                      </span>
                    </span>
                    <ArrowRight
                      className="size-4 shrink-0 text-[var(--muted-foreground)] opacity-0 transition-opacity duration-200 group-hover/row:opacity-100"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* A agenda do dia como tabela compacta na coluna lateral: densidade
            alta, tudo à vista, zero scroll. */}
        <section
          className="enter self-start rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]"
          style={{ "--d": 2 } as CSSProperties}
          aria-labelledby="today-schedule"
        >
          <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
            <h2 id="today-schedule" className="text-sm font-semibold">
              {messages.professional.todaySchedule}
            </h2>
            <span className="tabular text-xs text-[var(--muted-foreground)]">
              4 · 3 confirmadas
            </span>
          </div>

          <ul className="divide-y divide-[var(--border)]">
            {data.appointments.map((appointment, index) => (
              <li key={appointment.id}>
                <Link
                  href={localPath(
                    segment,
                    `/pro/clientes/${appointment.clientId}`,
                  )}
                  className="group/apt ease-(--ease-care) hover:bg-[var(--muted)]/70 focus-visible:bg-[var(--muted)]/70 flex items-center gap-3 px-4 py-3 outline-none transition-colors duration-200"
                >
                  <span
                    className={cn(
                      "h-8 w-0.5 shrink-0 rounded-full",
                      index === 0
                        ? "surface-accent"
                        : index === 1
                          ? "surface-primary"
                          : "bg-[var(--border-strong)]",
                    )}
                  />
                  <span className="tabular w-11 shrink-0 text-xs font-medium text-[var(--muted-foreground)]">
                    {formatTime(appointment.startsAt, locale)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {appointment.clientName}
                    </span>
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      {appointment.modality === "online"
                        ? "Online"
                        : "Presencial"}
                    </span>
                  </span>
                  <UserRound
                    className="size-3.5 shrink-0 text-[var(--muted-foreground)] opacity-0 transition-opacity duration-200 group-hover/apt:opacity-100"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="mt-8 text-xs text-[var(--muted-foreground)]">
        {messages.professional.synthetic}
      </p>
    </div>
  );
}
