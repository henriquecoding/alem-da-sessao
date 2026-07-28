import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, Video } from "lucide-react";
import { getMessages } from "@alem-da-sessao/i18n";
import {
  bridgeWindowIsOpen,
  getCurrentInterval,
} from "@alem-da-sessao/db/intervals";
import { IntervalPlace } from "@/components/interval-place";
import { SessionBridge } from "@/components/session-bridge";
import { SensitivityNote } from "@/components/sensitivity";
import { Button } from "@/components/ui/button";
import { timeZoneFor } from "@/lib/format";
import { localPath, resolveLocale } from "@/lib/locale";

/**
 * A superfície do cliente — relatório v2 §6.2, §7.1 e anti-padrão #11.
 *
 * Isto era uma grelha de cartões, ou seja, um dashboard. O relatório é
 * explícito nos dois sítios:
 *
 * > Fluxos lineares, não dashboards. Uma tarefa por tela do lado do cliente.
 * > Sem menus escondidos nem ícones sem rótulo. (§7.1)
 *
 * > Densidade: alta e compacta no Care OS; **baixa, uma decisão por tela** na
 * > experiência. (§6.2)
 *
 * A reestruturação: uma coluna única e estreita, com uma ordem que é uma
 * frase — onde está, o que ficou, o que leva, quando é a próxima. Nada
 * compete lateralmente por atenção, e a leitura em telemóvel é a mesma que em
 * desktop, só mais estreita. É também confiabilidade navegacional: a ordem
 * não muda entre visitas.
 */
export default async function ClientTodayPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale, segment }, interval] = await Promise.all([
    resolveLocale(params),
    getCurrentInterval(),
  ]);
  const messages = getMessages(locale);
  const pt = locale === "pt-PT";

  const now = new Date();
  const outgoingOpen = bridgeWindowIsOpen("outgoing", interval, now);
  const incomingOpen = bridgeWindowIsOpen("incoming", interval, now);
  const nextSession = interval.closesAt
    ? new Date(interval.closesAt)
    : new Date(now.getTime() + 7 * 86_400_000);
  const nextSessionDate = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: timeZoneFor(locale),
  }).format(nextSession);
  const nextSessionTime = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timeZoneFor(locale),
  }).format(nextSession);

  return (
    <div className="mx-auto w-full max-w-[46rem]">
      <header className="enter mb-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          {pt ? "O seu espaço" : "O seu espaço"}
        </p>
        <h1
          className="enter mt-2 text-[clamp(1.9rem,1.4rem+1.8vw,2.4rem)] font-semibold leading-[1.1] tracking-[-0.03em]"
          style={{ "--d": 1 } as CSSProperties}
        >
          {messages.client.greeting}
        </h1>
        <p
          className="enter mt-2 text-[0.95rem] leading-7 text-[var(--muted-foreground)]"
          style={{ "--d": 2 } as CSSProperties}
        >
          {messages.client.subtitle}
        </p>
      </header>

      {/* 1. Onde está. O intervalo é a âncora temporal de tudo o resto. */}
      <IntervalPlace
        className="enter"
        style={{ "--d": 3 } as CSSProperties}
        interval={interval}
        locale={locale}
      />

      {/* 2 e 3. A ponte. Uma de cada vez, empilhada — nunca lado a lado, que
          obrigaria a escolher entre duas caixas de texto ao mesmo tempo. */}
      <div className="mt-4 space-y-4">
        <SessionBridge
          className="enter"
          style={{ "--d": 4 } as CSSProperties}
          direction="outgoing"
          interval={interval}
          locale={locale}
          open={outgoingOpen}
        />
        <SessionBridge
          className="enter"
          style={{ "--d": 5 } as CSSProperties}
          direction="incoming"
          interval={interval}
          locale={locale}
          open={incomingOpen}
        />
      </div>

      {/* 4. A experiência em curso — uma linha, não um cartão promocional. */}
      <section className="reveal mt-10 border-t border-[var(--border)] pt-8">
        <h2 className="text-sm font-semibold">
          {pt ? "A meio de uma experiência" : "No meio de uma experiência"}
        </h2>
        <div className="mt-4 flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-serif text-xl leading-tight">
              Estruturas de Carga
            </p>
            <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
              {pt
                ? "Etapa 2 de 5 · continua privada até decidir o contrário"
                : "Etapa 2 de 5 · continua privada até você decidir o contrário"}
            </p>
          </div>
          <Button asChild variant="secondary" className="shrink-0">
            <Link
              href={localPath(
                segment,
                "/cuidado/experiencias/estruturas-de-carga",
              )}
            >
              {messages.client.resume}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      {/* 5. A próxima sessão — informação, não apelo. */}
      <section className="reveal mt-10 border-t border-[var(--border)] pt-8">
        <h2 className="text-sm font-semibold">{messages.client.nextSession}</h2>
        <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xl font-semibold tracking-[-0.02em]">
            {nextSessionDate}
          </p>
          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--muted-foreground)]">
            <div className="inline-flex items-center gap-2">
              <dt className="sr-only">{pt ? "Hora" : "Hora"}</dt>
              <Clock3
                className="size-4 text-[var(--primary)]"
                aria-hidden="true"
              />
              <dd className="tabular">{nextSessionTime} · 50 minutos</dd>
            </div>
            <div className="inline-flex items-center gap-2">
              <dt className="sr-only">{pt ? "Modalidade" : "Modalidade"}</dt>
              <Video
                className="size-4 text-[var(--primary)]"
                aria-hidden="true"
              />
              <dd>Online</dd>
            </div>
            <div className="inline-flex items-center gap-2">
              <dt className="sr-only">{pt ? "Com" : "Com"}</dt>
              <dd>Dra. Inês Almeida</dd>
            </div>
          </dl>
          <Button asChild variant="ghost" className="-ml-4 mt-4">
            <Link href={localPath(segment, "/cuidado/sessoes")}>
              <CalendarDays className="size-4" aria-hidden="true" />
              {pt ? "Ver detalhes da sessão" : "Ver detalhes da sessão"}
            </Link>
          </Button>
        </div>
      </section>

      {/* O contrato de privacidade fecha a página em vez de a decorar. */}
      <SensitivityNote
        className="reveal mt-10"
        level="private"
        locale={locale}
      />
    </div>
  );
}
