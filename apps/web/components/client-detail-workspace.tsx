"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  ClipboardPenLine,
  FileText,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import type { ClientSummary } from "@alem-da-sessao/db";
import type { Locale } from "@alem-da-sessao/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const tabIds = [
  "overview",
  "timeline",
  "sessions",
  "notes",
  "experiences",
  "documents",
  "payments",
  "consents",
] as const;
type TabId = (typeof tabIds)[number];

const tabLabels = {
  "pt-PT": {
    overview: "Visão geral",
    timeline: "Linha do tempo",
    sessions: "Sessões",
    notes: "Notas",
    experiences: "Experiências",
    documents: "Documentos",
    payments: "Pagamentos",
    consents: "Consentimentos",
  },
  "pt-BR": {
    overview: "Visão geral",
    timeline: "Linha do tempo",
    sessions: "Sessões",
    notes: "Notas",
    experiences: "Experiências",
    documents: "Documentos",
    payments: "Pagamentos",
    consents: "Consentimentos",
  },
} satisfies Record<Locale, Record<TabId, string>>;

export function ClientDetailWorkspace({
  client,
  locale,
}: {
  client: ClientSummary;
  locale: Locale;
}) {
  const pt = locale === "pt-PT";
  const labels = tabLabels[locale];
  const [tab, setTab] = useState<TabId>("overview");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [note, setNote] = useState("");
  const [noteStatus, setNoteStatus] = useState<"draft" | "signed">("draft");
  const [assignment, setAssignment] = useState("");
  const [notice, setNotice] = useState("");

  return (
    <>
      <div
        className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1"
        role="tablist"
        aria-label={pt ? "Áreas do cliente" : "Áreas do cliente"}
      >
        {tabIds.map((tabId) => (
          <button
            key={tabId}
            id={`tab-${tabId}`}
            type="button"
            role="tab"
            aria-selected={tab === tabId}
            aria-controls={`panel-${tabId}`}
            onClick={() => setTab(tabId)}
            className={cn(
              "min-h-11 shrink-0 rounded-full px-4 text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
              tab === tabId
                ? "surface-sidebar"
                : "border border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]",
            )}
          >
            {labels[tabId]}
          </button>
        ))}
      </div>

      {notice && (
        <p
          role="status"
          className="mb-5 rounded-2xl bg-[var(--success-soft)] p-4 text-sm font-semibold text-[var(--success)]"
        >
          <Check className="mr-2 inline size-4" aria-hidden="true" />
          {notice}
        </p>
      )}

      <section
        id={`panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        tabIndex={0}
        className="outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        {(tab === "overview" || tab === "timeline") && (
          <TimelinePanel
            overview={tab === "overview"}
            reviewed={reviewed}
            onReview={() => setReviewOpen(true)}
            pt={pt}
          />
        )}

        {tab === "sessions" && (
          <SimpleList
            title={pt ? "Sessões recentes" : "Sessões recentes"}
            description={
              pt
                ? "Informação operacional; o conteúdo da conversa não aparece aqui."
                : "Informação operacional; o conteúdo da conversa não aparece aqui."
            }
            rows={[
              ["27 jul. · 09:30", "Online", "Confirmada"],
              ["20 jul. · 10:30", "Online", "Concluída"],
              ["13 jul. · 10:30", "Presencial", "Concluída"],
            ]}
          />
        )}

        {tab === "notes" && (
          <Card>
            <CardHeader>
              <CardTitle>{pt ? "Nota da sessão" : "Nota da sessão"}</CardTitle>
              <CardDescription>
                {pt
                  ? "No modo real, assinar congela a versão e exige AAL2."
                  : "No modo real, assinar congela a versão e exige AAL2."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                aria-label={pt ? "Conteúdo da nota" : "Conteúdo da nota"}
                value={note}
                readOnly={noteStatus === "signed"}
                onChange={(event) => {
                  setNote(event.target.value);
                  setNoteStatus("draft");
                }}
                className="min-h-40"
                placeholder={
                  pt
                    ? "Escreva uma nota clínica fictícia para validar o fluxo."
                    : "Escreva uma nota clínica fictícia para validar o fluxo."
                }
              />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Badge tone={noteStatus === "signed" ? "success" : "warning"}>
                  {noteStatus === "signed"
                    ? pt
                      ? "Assinada"
                      : "Assinada"
                    : pt
                      ? "Rascunho"
                      : "Rascunho"}
                </Badge>
                <Button
                  disabled={!note.trim() || noteStatus === "signed"}
                  onClick={() => {
                    setNoteStatus("signed");
                    setNotice(
                      pt
                        ? "Versão fictícia assinada; o texto ficou bloqueado nesta vista."
                        : "Versão fictícia assinada; o texto foi bloqueado nesta visualização.",
                    );
                  }}
                >
                  {pt ? "Assinar versão" : "Assinar versão"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === "experiences" && (
          <Card>
            <CardHeader>
              <CardTitle>
                {pt ? "Atribuir uma experiência" : "Atribuir uma experiência"}
              </CardTitle>
              <CardDescription>
                {pt
                  ? "A atribuição dá contexto; não permite ver um rascunho privado."
                  : "A atribuição dá contexto; não permite ver um rascunho privado."}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {["Estruturas de Carga", "Inventário da Sessão"].map((title) => (
                <button
                  key={title}
                  type="button"
                  aria-pressed={assignment === title}
                  onClick={() => {
                    setAssignment(title);
                    setNotice(
                      pt
                        ? `${title} foi atribuída nos dados locais.`
                        : `${title} foi atribuída aos dados locais.`,
                    );
                  }}
                  className={cn(
                    "min-h-28 rounded-2xl border p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                    assignment === title
                      ? "border-[var(--primary)] bg-[var(--pigment-plum)]"
                      : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--muted)]",
                  )}
                >
                  <Sparkles
                    className="size-5 text-[var(--primary)]"
                    aria-hidden="true"
                  />
                  <span className="mt-4 block text-sm font-bold">{title}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {tab === "documents" && (
          <SimpleList
            title={pt ? "Documentos" : "Documentos"}
            description={
              pt
                ? "Nomes neutros; nenhum conteúdo clínico é exposto na navegação."
                : "Nomes neutros; nenhum conteúdo clínico é exposto na navegação."
            }
            rows={[
              ["Consentimento v1.0", "PDF", "12 fev. 2026"],
              ["Informação do consultório", "PDF", "12 fev. 2026"],
            ]}
          />
        )}

        {tab === "payments" && (
          <SimpleList
            title={pt ? "Pagamentos" : "Pagamentos"}
            description={
              pt
                ? "Registos do consultório; não representa processamento real."
                : "Registros do consultório; não representa processamento real."
            }
            rows={[
              ["Sessão · 20 jul.", "55 €", "Pago"],
              ["Sessão · 27 jul.", "55 €", "Pendente"],
            ]}
          />
        )}

        {tab === "consents" && (
          <SimpleList
            title={pt ? "Consentimentos" : "Consentimentos"}
            description={
              pt
                ? "Cada finalidade tem versão e momento próprios."
                : "Cada finalidade tem versão e momento próprios."
            }
            rows={[
              ["Continuidade terapêutica", "v1.0", "Ativo"],
              ["Notificações de sessão", "v1.0", "Ativo"],
              ["Comunicação de produto", "—", "Não concedido"],
            ]}
          />
        )}
      </section>

      {reviewOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[var(--scrim)] p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="snapshot-review-title"
        >
          <Card className="w-full max-w-2xl">
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div>
                <CardTitle id="snapshot-review-title">
                  {pt ? "Snapshot partilhado" : "Snapshot compartilhado"}
                </CardTitle>
                <CardDescription>
                  {pt
                    ? `Versão 1 · imutável · confirmada por ${client.displayName}`
                    : `Versão 1 · imutável · confirmada por ${client.displayName}`}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setReviewOpen(false)}
                aria-label={pt ? "Fechar revisão" : "Fechar revisão"}
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl bg-[var(--pigment-plum)] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">
                  Estruturas de Carga
                </p>
                <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-[var(--muted-foreground)]">
                      {pt ? "Estruturas nomeadas" : "Estruturas nomeadas"}
                    </dt>
                    <dd className="mt-1 font-bold">4</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted-foreground)]">
                      {pt ? "Movimento escolhido" : "Movimento escolhido"}
                    </dt>
                    <dd className="mt-1 font-bold">
                      {pt ? "Pedir apoio" : "Pedir apoio"}
                    </dd>
                  </div>
                </dl>
                <p className="mt-5 text-sm leading-7">
                  {pt
                    ? "«Quero perceber o que posso deixar de sustentar sozinha.»"
                    : "“Quero entender o que posso deixar de sustentar sozinha.”"}
                </p>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setReviewOpen(false)}
                >
                  {pt ? "Voltar sem marcar" : "Voltar sem marcar"}
                </Button>
                <Button
                  onClick={() => {
                    setReviewed(true);
                    setReviewOpen(false);
                    setNotice(
                      pt
                        ? "Snapshot marcado como revisto nos dados locais."
                        : "Snapshot marcado como revisado nos dados locais.",
                    );
                  }}
                >
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  {pt ? "Marcar como revisto" : "Marcar como revisado"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

function TimelinePanel({
  overview,
  reviewed,
  onReview,
  pt,
}: {
  overview: boolean;
  reviewed: boolean;
  onReview: () => void;
  pt: boolean;
}) {
  const events = [
    {
      icon: Sparkles,
      title: pt ? "Partilha recebida" : "Compartilhamento recebido",
      body: "Estruturas de Carga · snapshot 1",
      time: "Hoje, 08:14",
      tone: "bg-[var(--pigment-plum)] text-[var(--primary)]",
    },
    {
      icon: CheckCircle2,
      title: pt ? "Sessão concluída" : "Sessão concluída",
      body: "50 minutos · online",
      time: "20 jul., 10:30",
      tone: "bg-[var(--success-soft)] text-[var(--success)]",
    },
    {
      icon: ClipboardPenLine,
      title: pt ? "Nota assinada" : "Nota assinada",
      body: "Versão 1 · imutável",
      time: "20 jul., 11:27",
      tone: "bg-[var(--muted)] text-[var(--foreground)]",
    },
  ];

  return (
    <div className={cn("grid gap-5", overview && "xl:grid-cols-[1.1fr_.9fr]")}>
      <Card>
        <CardHeader>
          <CardTitle>
            {pt ? "Linha do tempo permitida" : "Linha do tempo permitida"}
          </CardTitle>
          <CardDescription>
            {pt
              ? "Esta visão respeita a função e a relação de cuidado atual."
              : "Esta visualização respeita a função e a relação de cuidado atual."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {events.map((event) => (
            <div key={event.title} className="flex gap-4">
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-2xl",
                  event.tone,
                )}
              >
                <event.icon className="size-4" aria-hidden="true" />
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

      {overview && (
        <div className="space-y-5">
          <Card className="surface-primary">
            <CardHeader>
              <CardTitle>
                {reviewed
                  ? pt
                    ? "Partilha revista"
                    : "Compartilhamento revisado"
                  : pt
                    ? "Partilha pronta para rever"
                    : "Compartilhamento pronto para revisar"}
              </CardTitle>
              <CardDescription className="text-[var(--muted-foreground)]">
                {pt
                  ? "O cliente confirmou exatamente este snapshot."
                  : "A cliente confirmou exatamente este snapshot."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="surface-sidebar-raised rounded-2xl p-4">
                <p className="text-xs font-bold">Estruturas de Carga</p>
                <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                  {pt
                    ? "mapa estruturado · versão 0.4.0 · partilhado hoje"
                    : "mapa estruturado · versão 0.4.0 · compartilhado hoje"}
                </p>
              </div>
              <Button
                variant="secondary"
                className="mt-4 w-full border-0"
                onClick={onReview}
              >
                {reviewed
                  ? pt
                    ? "Reabrir snapshot"
                    : "Reabrir snapshot"
                  : pt
                    ? "Rever snapshot"
                    : "Revisar snapshot"}
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex gap-4 p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--muted)]">
                <LockKeyhole
                  className="size-5 text-[var(--primary)]"
                  aria-hidden="true"
                />
              </span>
              <div>
                <p className="text-sm font-bold">
                  {pt ? "Limite visível" : "Limite visível"}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                  {pt
                    ? "Rascunhos sem partilha não aparecem nesta página."
                    : "Rascunhos sem compartilhamento não aparecem nesta página."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function SimpleList({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: string[][];
}) {
  const icons = [FileText, ReceiptText, ShieldCheck];
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map((row, index) => {
          const Icon = icons[index % icons.length]!;
          return (
            <div
              key={row.join("-")}
              className="grid gap-3 rounded-2xl border border-[var(--border)] p-4 sm:grid-cols-[auto_1fr_140px_140px] sm:items-center"
            >
              <span className="grid size-10 place-items-center rounded-2xl bg-[var(--pigment-stone)] text-[var(--info)]">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              {row.map((value, cell) => (
                <span
                  key={value}
                  className={cn(
                    "text-sm",
                    cell === 0 ? "font-bold" : "text-[var(--muted-foreground)]",
                  )}
                >
                  {value}
                </span>
              ))}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
