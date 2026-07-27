import type { Metadata } from "next";
import type { CSSProperties } from "react";
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
import { DashboardPreview } from "@/components/dashboard-preview";
import { IntervalFigure } from "@/components/interval-figure";
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
      <section className="mx-auto grid w-full max-w-[1240px] gap-12 px-4 pb-20 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.06fr)] lg:items-center lg:gap-14 lg:px-8 lg:pb-28 lg:pt-24">
        <div>
          <Badge tone="accent" className="enter mb-6">
            <HeartHandshake className="mr-1.5 size-3.5" aria-hidden="true" />
            {messages.public.eyebrow}
          </Badge>

          {/* Capped well below the column width: the previous 5.8rem ceiling
              broke this sentence into six ragged lines on desktop. */}
          <h1
            className="enter max-w-[13ch] text-balance text-[clamp(2.6rem,1.1rem+4.4vw,4.15rem)] font-bold leading-[0.96] tracking-[-0.055em] lg:max-w-none"
            style={{ "--d": 1 } as CSSProperties}
          >
            {messages.public.title}
          </h1>
          <p
            className="enter mt-6 max-w-[52ch] text-base leading-7 text-[var(--muted-foreground)] sm:text-lg sm:leading-8"
            style={{ "--d": 2 } as CSSProperties}
          >
            {messages.public.description}
          </p>

          <div
            className="enter mt-9 flex flex-col gap-3 sm:flex-row"
            style={{ "--d": 3 } as CSSProperties}
          >
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

          <div
            className="enter mt-8 flex items-start gap-3 text-sm leading-6 text-[var(--muted-foreground)]"
            style={{ "--d": 4 } as CSSProperties}
          >
            <CheckCircle2
              className="mt-0.5 size-4 shrink-0 text-[var(--success)]"
              aria-hidden="true"
            />
            <p>{messages.public.trustLine}</p>
          </div>
        </div>

        {/* A figura do intervalo em vez da captura de ecrã. Uma captura de
            dashboard podia pertencer a qualquer produto da Camada A; isto não
            (§6.8, terceiro teste de qualidade). */}
        <div className="enter-scale" style={{ "--d": 4 } as CSSProperties}>
          <IntervalFigure locale={locale} />
        </div>
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
          ].map((item, index) => (
            <div
              key={item.title}
              className="reveal group flex gap-4 py-2"
              style={{ "--d": index } as CSSProperties}
            >
              <span className="ease-(--ease-spring) grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--muted)] text-[var(--primary)] transition-[transform,background-color,color] duration-500 group-hover:scale-110 group-hover:bg-[var(--primary)] group-hover:text-white">
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
        <div className="reveal mb-10 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-foreground)]">
            Duas experiências, o mesmo cuidado
          </p>
          <h2 className="mt-3 text-balance text-[clamp(1.9rem,1.1rem+2.7vw,3.1rem)] font-bold leading-[1.03] tracking-[-0.05em]">
            Feito para quem acompanha e para quem está a viver o processo.
          </h2>
        </div>

        {/* Dois modos, lado a lado, cada um descrito pelas suas próprias
            regras (§6.2). Eram dois cartões coloridos genéricos; passam a ser
            duas colunas editoriais com a tabela de diferenças que o relatório
            usa para os separar — o que é substancialmente mais informativo do
            que um bloco de cor com um botão. */}
        <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
          {[
            {
              audience: "Para quem acompanha",
              title: messages.public.professionalTitle,
              body: "Densidade alta e compacta, porque a decisão é rápida e a latência é hostilidade. Tudo o que importa numa vista, entre duas sessões.",
              traits: [
                ["Sensação", "competência tranquila"],
                ["Ritmo", "rápido"],
                ["Vazio", "«Nada pendente hoje.»"],
              ],
              href: "/pro/hoje",
              cta: "Entrar na área profissional",
              tone: "primary" as const,
            },
            {
              audience: "Para quem está a viver o processo",
              title: messages.public.clientTitle,
              body: "Densidade baixa, uma decisão por ecrã, ritmo lento — porque aqui a pressa é que é hostilidade. Não é um prontuário reduzido.",
              traits: [
                ["Sensação", "um lugar"],
                ["Ritmo", "lento"],
                ["Vazio", "nunca aparece"],
              ],
              href: "/cuidado/hoje",
              cta: "Entrar na área do cliente",
              tone: "accent" as const,
            },
          ].map((mode, index) => (
            <div
              key={mode.href}
              className="reveal flex flex-col border-t-2 border-[var(--foreground)] pt-6"
              style={{ "--d": index } as CSSProperties}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                {mode.audience}
              </p>
              <h3 className="mt-4 max-w-md text-balance text-[1.6rem] font-semibold leading-[1.15] tracking-[-0.03em]">
                {mode.title}
              </h3>
              <p className="mt-4 max-w-md text-[0.95rem] leading-7 text-[var(--muted-foreground)]">
                {mode.body}
              </p>

              <dl className="mt-7 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                {mode.traits.map(([term, value]) => (
                  <div
                    key={term}
                    className="flex items-baseline justify-between gap-4 py-2.5 text-sm"
                  >
                    <dt className="text-[var(--muted-foreground)]">{term}</dt>
                    <dd className="text-right font-medium">{value}</dd>
                  </div>
                ))}
              </dl>

              <Button
                asChild
                variant={mode.tone === "primary" ? "default" : "quiet"}
                className="mt-7 w-fit"
              >
                <Link href={localPath(segment, mode.href)}>
                  {mode.cta}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* O produto existe, e prova-se aqui em vez de no herói — onde a
          captura de ecrã competia com a ideia em vez de a apoiar. */}
      <section className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto grid w-full max-w-[1240px] items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] lg:gap-16 lg:px-8 lg:py-24">
          <div className="reveal">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
              A superfície profissional
            </p>
            <h2 className="mt-4 text-balance text-[clamp(1.6rem,1.1rem+1.8vw,2.2rem)] font-semibold leading-[1.15] tracking-[-0.03em]">
              A gestão é o bilhete de entrada. O intervalo é o argumento.
            </h2>
            <p className="mt-4 max-w-md text-[0.95rem] leading-7 text-[var(--muted-foreground)]">
              Agenda, clientes, notas e consentimentos existem porque sem eles
              não há razão para abrir isto todos os dias. Mas nenhum concorrente
              pode dizer a frase seguinte: o seu cliente chega à próxima sessão
              com alguma coisa nas mãos.
            </p>
          </div>
          <div className="reveal" style={{ "--d": 1 } as CSSProperties}>
            <DashboardPreview />
          </div>
        </div>
      </section>
    </main>
  );
}
