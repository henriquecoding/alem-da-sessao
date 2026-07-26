import {
  Activity,
  Building2,
  CheckCircle2,
  Clock3,
  CreditCard,
  ShieldCheck,
  Siren,
  UserCheck,
} from "lucide-react";
import { getMessages } from "@alem-da-sessao/i18n";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { PageHeading } from "@/components/page-heading";
import { resolveLocale } from "@/lib/locale";

export default async function AdminOperationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await resolveLocale(params);
  const messages = getMessages(locale);

  return (
    <>
      <PageHeading
        eyebrow="Administração"
        title={messages.admin.title}
        description={messages.admin.subtitle}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Profissionais"
          value="12"
          detail="8 verificados · dados fictícios"
          icon={UserCheck}
          tone="lilac"
        />
        <MetricCard
          label="Organizações"
          value="9"
          detail="Consultórios e clínicas"
          icon={Building2}
          tone="blue"
        />
        <MetricCard
          label="Assinaturas ativas"
          value="7"
          detail="Stripe permanece desligada"
          icon={CreditCard}
          tone="accent"
        />
        <MetricCard
          label="Incidentes"
          value="0"
          detail="Nenhum ambiente de produção"
          icon={Siren}
          tone="neutral"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Fila operacional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                icon: ShieldCheck,
                title: "Verificação profissional",
                detail: "2 submissões aguardam revisão manual",
                tone: "bg-[var(--info-soft)] text-[var(--info)]",
                badge: "2 pendentes",
              },
              {
                icon: CreditCard,
                title: "Reconciliação de assinatura",
                detail: "Adaptador desligado no ambiente local",
                tone: "bg-[var(--accent-soft)] text-[var(--accent-foreground)]",
                badge: "Sem ligação",
              },
              {
                icon: Activity,
                title: "Outbox",
                detail: "Nenhum job atrasado nos dados sintéticos",
                tone: "bg-[var(--success-soft)] text-[var(--success)]",
                badge: "Saudável",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-4 rounded-2xl border border-[var(--border)] p-4"
              >
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-2xl ${item.tone}`}
                >
                  <item.icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{item.title}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {item.detail}
                  </p>
                </div>
                <Badge>{item.badge}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-[var(--primary)] text-white">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <CardTitle>Fronteira administrativa</CardTitle>
              <CheckCircle2 className="size-5 text-[var(--accent)]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-white/62 text-sm leading-7">
              Esta dashboard administra planos, organizações, verificações e
              saúde do sistema. Conteúdo de notas, respostas ou rascunhos não é
              carregado por conveniência.
            </p>
            <div className="bg-white/8 mt-7 rounded-2xl p-4">
              <p className="flex items-center gap-2 text-xs font-bold">
                <Clock3 className="size-4 text-[var(--accent)]" />
                Acesso de emergência protegido
              </p>
              <p className="text-white/48 mt-2 text-xs leading-5">
                O fluxo administrativo exige motivo, escopo e duração; no modo
                local produz apenas um evento de auditoria sintético.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
