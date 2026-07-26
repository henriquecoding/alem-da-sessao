import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardPenLine,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { getClientById } from "@alem-da-sessao/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { localPath, resolveLocale } from "@/lib/locale";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ locale: string; clientId: string }>;
}) {
  const resolvedParams = await params;
  const [{ segment }, client] = await Promise.all([
    resolveLocale(Promise.resolve({ locale: resolvedParams.locale })),
    getClientById(resolvedParams.clientId),
  ]);

  if (!client) {
    notFound();
  }

  return (
    <>
      <div className="mb-6 flex items-center">
        <Button asChild variant="ghost" size="sm">
          <Link href={localPath(segment, "/pro/clientes")}>
            <ArrowLeft className="size-4" />
            Clientes
          </Link>
        </Button>
      </div>

      <section className="mb-6 flex flex-col gap-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid size-16 place-items-center rounded-3xl bg-[var(--primary)] text-lg font-bold text-white">
            {client.initials}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-[-0.04em]">
                {client.displayName}
              </h1>
              <Badge tone="success">Relação ativa</Badge>
            </div>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Cliente adulto · Dados de demonstração
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={localPath(segment, "/pro/agenda")}>
            <CalendarDays className="size-4" />
            Agendar sessão
          </Link>
        </Button>
      </section>

      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
        {[
          "Visão geral",
          "Linha do tempo",
          "Sessões",
          "Notas",
          "Experiências",
          "Documentos",
          "Pagamentos",
          "Consentimentos",
        ].map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={`min-h-10 shrink-0 rounded-full px-4 text-xs font-bold ${
              index === 0
                ? "bg-[var(--foreground)] text-white"
                : "border border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Linha do tempo permitida</CardTitle>
            <CardDescription>
              Esta visão respeita a função e a relação de cuidado atual.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              {
                icon: Sparkles,
                title: "Partilha recebida",
                body: "Estruturas de Carga · snapshot 1",
                time: "Hoje, 08:14",
                tone: "bg-[var(--accent-soft)] text-[var(--accent-foreground)]",
              },
              {
                icon: CheckCircle2,
                title: "Sessão concluída",
                body: "50 minutos · online",
                time: "20 jul., 10:30",
                tone: "bg-[var(--success-soft)] text-[var(--success)]",
              },
              {
                icon: ClipboardPenLine,
                title: "Nota assinada",
                body: "Versão 1 · imutável",
                time: "20 jul., 11:27",
                tone: "bg-[var(--muted)] text-[var(--foreground)]",
              },
            ].map((event) => (
              <div key={event.title} className="flex gap-4">
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-2xl ${event.tone}`}
                >
                  <event.icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1 border-b border-[var(--border)] pb-5">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-bold">{event.title}</p>
                    <span className="shrink-0 text-[10px] text-[var(--muted-foreground)]">
                      {event.time}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {event.body}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="bg-[var(--primary)] text-white">
            <CardHeader>
              <CardTitle>Partilha pronta para rever</CardTitle>
              <CardDescription className="text-white/60">
                O cliente confirmou exatamente este snapshot.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white/8 rounded-2xl p-4">
                <p className="text-xs font-bold">Estruturas de Carga</p>
                <p className="mt-2 text-xs leading-5 text-white/60">
                  mapa estruturado · versão 0.2.0 · partilhado hoje
                </p>
              </div>
              <Button variant="secondary" className="mt-4 w-full border-0">
                Rever snapshot
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex gap-4 p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--muted)]">
                <LockKeyhole className="size-5 text-[var(--primary)]" />
              </span>
              <div>
                <p className="text-sm font-bold">Limite visível</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                  Rascunhos guardados sem partilha não aparecem nesta página nem
                  nas consultas do profissional.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
