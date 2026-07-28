"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Download,
  FileText,
  LockKeyhole,
  MailPlus,
  Plus,
  ReceiptText,
  Save,
  ShieldCheck,
  UserRoundCog,
  WalletCards,
  X,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { MetricCard } from "@/components/metric-card";
import { PageHeading } from "@/components/page-heading";
import { formatCurrency, timeZoneFor } from "@/lib/format";
import { cn } from "@/lib/utils";

function LocalNotice({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="status"
      className="rounded-2xl bg-[var(--success-soft)] px-4 py-3 text-sm font-semibold text-[var(--success)]"
    >
      <Check className="mr-2 inline size-4" />
      {children}
    </p>
  );
}

const reportPeriods = {
  "30": {
    sessions: "47",
    attendance: "94%",
    experiences: "18",
    revenue: 2480,
    bars: [45, 62, 51, 74, 68, 86],
  },
  "90": {
    sessions: "132",
    attendance: "92%",
    experiences: "49",
    revenue: 7120,
    bars: [58, 70, 64, 81, 76, 92],
  },
  "180": {
    sessions: "259",
    attendance: "93%",
    experiences: "91",
    revenue: 13940,
    bars: [61, 66, 73, 77, 83, 89],
  },
} as const;

export function ReportsWorkspace({ locale }: { locale: Locale }) {
  const [period, setPeriod] = useState<keyof typeof reportPeriods>("30");
  const [notice, setNotice] = useState("");
  const data = reportPeriods[period];

  return (
    <>
      <PageHeading
        eyebrow="Leitura operacional"
        title="Relatórios"
        description="Tendências do consultório sem pontuar emoções, comparar pessoas ou inferir diagnósticos."
        action={
          <Button
            variant="secondary"
            onClick={() =>
              setNotice("Relatório CSV de demonstração preparado em memória.")
            }
          >
            <Download className="size-4" />
            Exportar CSV
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {(["30", "90", "180"] as const).map((value) => (
          <button
            type="button"
            key={value}
            aria-pressed={period === value}
            onClick={() => setPeriod(value)}
            className={cn(
              "min-h-10 rounded-full px-4 text-xs font-bold outline-none",
              "ease-(--ease-out-quint) transition-[background-color,color,border-color,box-shadow,transform] duration-200",
              "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 active:translate-y-px",
              period === value
                ? "surface-primary shadow-[var(--shadow-primary)]"
                : "border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--muted)]",
            )}
          >
            {value} dias
          </button>
        ))}
      </div>

      {notice && (
        <div className="mb-5">
          <LocalNotice>{notice}</LocalNotice>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Sessões realizadas"
          value={data.sessions}
          detail="Dados fictícios"
          icon={CalendarClock}
          tone="lilac"
        />
        <MetricCard
          label="Comparência"
          value={data.attendance}
          detail="+2 p.p. no período"
          icon={CheckCircle2}
          tone="blue"
        />
        <MetricCard
          label="Experiências concluídas"
          value={data.experiences}
          detail="Só eventos, nunca conteúdo"
          icon={FileText}
          tone="accent"
        />
        <MetricCard
          label="Recebimentos"
          value={formatCurrency(data.revenue, locale)}
          detail="Registo profissional"
          icon={CircleDollarSign}
          tone="lemon"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Ritmo de sessões</CardTitle>
            <CardDescription>
              Volume agregado por intervalo, sem ranking entre clientes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Each column is stretched to the full plot height, so the bars'
                percentage heights have a definite box to resolve against —
                previously they collapsed to zero and the chart rendered
                empty. */}
            <div
              role="img"
              aria-label={`Volume relativo por intervalo, do mais antigo ao mais recente: ${data.bars.join("%, ")}%.`}
              className="flex h-64 items-stretch gap-3 rounded-3xl bg-[var(--background)] p-5"
            >
              {data.bars.map((height, index) => (
                <div key={index} className="flex flex-1 flex-col gap-2">
                  <div className="flex flex-1 items-end" aria-hidden="true">
                    <div
                      className={cn(
                        "ease-(--ease-out-quint) w-full rounded-t-xl transition-[height,background-color] duration-700",
                        index === data.bars.length - 1
                          ? "surface-primary"
                          : "bg-[var(--pigment-sage)]",
                      )}
                      style={{
                        height: `${height}%`,
                        transitionDelay: `${index * 55}ms`,
                      }}
                    />
                  </div>
                  <span className="text-center text-[10px] text-[var(--muted-foreground)]">
                    S{index + 1}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sinais de operação</CardTitle>
            <CardDescription>
              O que pede atenção no consultório.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              [
                "Notas assinadas em 24 h",
                "88%",
                ArrowUpRight,
                "text-[var(--success)]",
              ],
              [
                "Remarcações",
                "6",
                ArrowDownRight,
                "text-[var(--accent-foreground)]",
              ],
              ["Partilhas por rever", "3", ArrowUpRight, "text-[var(--info)]"],
              [
                "Pagamentos pendentes",
                "2",
                ArrowDownRight,
                "text-[var(--warning)]",
              ],
            ].map(([label, value, Icon, tone]) => (
              <div
                key={label as string}
                className="flex items-center gap-3 rounded-2xl border border-[var(--border)] p-4"
              >
                <Icon className={cn("size-4", tone as string)} />
                <span className="flex-1 text-sm">{label as string}</span>
                <strong className="text-sm">{value as string}</strong>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

type TeamMember = {
  id: number;
  name: string;
  email: string;
  role: "Proprietária" | "Psicóloga" | "Assistente";
  status: "Ativa" | "Convite enviado";
  initials: string;
};

const initialMembers: TeamMember[] = [
  {
    id: 1,
    name: "Inês Almeida",
    email: "ines@exemplo.local",
    role: "Proprietária",
    status: "Ativa",
    initials: "IA",
  },
  {
    id: 2,
    name: "Joana Pires",
    email: "joana@exemplo.local",
    role: "Psicóloga",
    status: "Ativa",
    initials: "JP",
  },
  {
    id: 3,
    name: "Carla Ramos",
    email: "carla@exemplo.local",
    role: "Assistente",
    status: "Ativa",
    initials: "CR",
  },
];

export function TeamWorkspace() {
  const [members, setMembers] = useState(initialMembers);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamMember["role"]>("Psicóloga");
  const [notice, setNotice] = useState("");

  function invite() {
    if (!email.includes("@")) return;
    setMembers((current) => [
      ...current,
      {
        id: Date.now(),
        name: email.split("@")[0] || "Novo membro",
        email,
        role,
        status: "Convite enviado",
        initials: (email.slice(0, 2) || "NM").toUpperCase(),
      },
    ]);
    setNotice(`Convite local preparado para ${email}.`);
    setEmail("");
    setInviteOpen(false);
  }

  return (
    <>
      <PageHeading
        eyebrow="Consultório Horizonte"
        title="Equipa e acessos"
        description="Funções explícitas, delegações limitadas e acesso mínimo necessário."
        action={
          <Button onClick={() => setInviteOpen(true)}>
            <MailPlus className="size-4" />
            Convidar membro
          </Button>
        }
      />

      {notice && (
        <div className="mb-5">
          <LocalNotice>{notice}</LocalNotice>
        </div>
      )}

      {inviteOpen && (
        <Card className="border-[var(--primary)]/30 mb-5 bg-[var(--pigment-sage)]">
          <CardContent className="grid gap-4 p-5 sm:grid-cols-[1fr_220px_auto] sm:items-end">
            <label>
              <span className="mb-2 block text-xs font-bold">
                E-mail profissional
              </span>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nome@consultorio.pt"
              />
            </label>
            <label>
              <span className="mb-2 block text-xs font-bold">
                Função inicial
              </span>
              <select
                className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm"
                value={role}
                onChange={(event) =>
                  setRole(event.target.value as TeamMember["role"])
                }
              >
                <option>Psicóloga</option>
                <option>Assistente</option>
              </select>
            </label>
            <div className="flex gap-2">
              <Button onClick={invite} disabled={!email.includes("@")}>
                Enviar convite
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setInviteOpen(false)}
                aria-label="Fechar convite"
              >
                <X className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>{members.length} membros</CardTitle>
            <CardDescription>
              Alterações ficam apenas nesta sessão local.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="grid gap-4 rounded-3xl border border-[var(--border)] p-4 sm:grid-cols-[auto_1fr_170px_auto] sm:items-center"
              >
                <span className="grid size-11 place-items-center rounded-2xl bg-[var(--pigment-sage)] text-xs font-bold text-[var(--primary)]">
                  {member.initials}
                </span>
                <div>
                  <p className="text-sm font-bold">{member.name}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {member.email}
                  </p>
                </div>
                <select
                  aria-label={`Função de ${member.name}`}
                  disabled={member.role === "Proprietária"}
                  value={member.role}
                  onChange={(event) =>
                    setMembers((current) =>
                      current.map((item) =>
                        item.id === member.id
                          ? {
                              ...item,
                              role: event.target.value as TeamMember["role"],
                            }
                          : item,
                      ),
                    )
                  }
                  className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs"
                >
                  <option>Proprietária</option>
                  <option>Psicóloga</option>
                  <option>Assistente</option>
                </select>
                <Badge tone={member.status === "Ativa" ? "success" : "warning"}>
                  {member.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fronteiras por função</CardTitle>
            <CardDescription>
              O conteúdo clínico nunca acompanha uma permissão administrativa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              [
                "Proprietária",
                "Equipa, faturação e clientes atribuídos",
                ShieldCheck,
              ],
              ["Psicóloga", "Apenas relações de cuidado ativas", LockKeyhole],
              [
                "Assistente",
                "Agenda e cobrança, sem notas clínicas",
                UserRoundCog,
              ],
            ].map(([title, description, Icon]) => (
              <div
                key={title as string}
                className="flex gap-3 rounded-2xl bg-[var(--background)] p-4"
              >
                <Icon className="mt-0.5 size-4 shrink-0 text-[var(--primary)]" />
                <div>
                  <p className="text-sm font-bold">{title as string}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                    {description as string}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

type Payment = {
  id: number;
  client: string;
  date: string;
  amount: number;
  status: "Pago" | "Pendente" | "Atrasado";
};

const initialPayments: Payment[] = [
  {
    id: 1,
    client: "Marta Oliveira",
    date: "26 jul",
    amount: 55,
    status: "Pago",
  },
  {
    id: 2,
    client: "Rui Martins",
    date: "24 jul",
    amount: 60,
    status: "Pendente",
  },
  {
    id: 3,
    client: "Beatriz Costa",
    date: "22 jul",
    amount: 55,
    status: "Pago",
  },
  {
    id: 4,
    client: "Leonor Silva",
    date: "18 jul",
    amount: 50,
    status: "Atrasado",
  },
];

export function FinanceWorkspace({ locale }: { locale: Locale }) {
  const [payments, setPayments] = useState(initialPayments);
  const [showForm, setShowForm] = useState(false);
  const [client, setClient] = useState("");
  const [amount, setAmount] = useState("55");
  const [notice, setNotice] = useState("");
  const currency = locale === "pt-BR" ? "R$" : "€";

  const totals = useMemo(
    () => ({
      received: payments
        .filter((payment) => payment.status === "Pago")
        .reduce((sum, payment) => sum + payment.amount, 0),
      pending: payments
        .filter((payment) => payment.status !== "Pago")
        .reduce((sum, payment) => sum + payment.amount, 0),
    }),
    [payments],
  );

  function addPayment() {
    const numericAmount = Number(amount);
    if (!client.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0)
      return;
    setPayments((current) => [
      {
        id: Date.now(),
        client: client.trim(),
        date: "Hoje",
        amount: numericAmount,
        status: "Pendente",
      },
      ...current,
    ]);
    setClient("");
    setShowForm(false);
    setNotice("Registo de pagamento adicionado à demonstração.");
  }

  return (
    <>
      <PageHeading
        eyebrow="Registos do consultório"
        title="Financeiro"
        description="Registos de pagamentos das sessões, separados da assinatura da plataforma."
        action={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="size-4" />
            Registar pagamento
          </Button>
        }
      />

      {notice && (
        <div className="mb-5">
          <LocalNotice>{notice}</LocalNotice>
        </div>
      )}

      {showForm && (
        <Card className="mb-5 bg-[var(--pigment-ochre)]">
          <CardContent className="grid gap-4 p-5 sm:grid-cols-[1fr_180px_auto] sm:items-end">
            <label>
              <span className="mb-2 block text-xs font-bold">Cliente</span>
              <Input
                value={client}
                onChange={(event) => setClient(event.target.value)}
                placeholder="Nome do cliente"
              />
            </label>
            <label>
              <span className="mb-2 block text-xs font-bold">
                Valor ({currency})
              </span>
              <Input
                type="number"
                min="1"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </label>
            <div className="flex gap-2">
              <Button onClick={addPayment}>Adicionar</Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowForm(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Recebido"
          value={formatCurrency(totals.received, locale)}
          detail="No conjunto fictício"
          icon={WalletCards}
          tone="lilac"
        />
        <MetricCard
          label="Por receber"
          value={formatCurrency(totals.pending, locale)}
          detail="2 registos"
          icon={Clock3}
          tone="lemon"
        />
        <MetricCard
          label="Sessões faturadas"
          value={String(payments.length)}
          detail="Julho de 2026"
          icon={ReceiptText}
          tone="blue"
        />
        <MetricCard
          label="Taxa registada"
          value={formatCurrency(55, locale)}
          detail="Valor mais frequente"
          icon={CircleDollarSign}
          tone="accent"
        />
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Movimentos</CardTitle>
          <CardDescription>
            Estes dados não representam processamento de pagamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="grid gap-3 rounded-2xl border border-[var(--border)] p-4 sm:grid-cols-[1fr_100px_100px_110px] sm:items-center"
            >
              <div>
                <p className="text-sm font-bold">{payment.client}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Sessão individual
                </p>
              </div>
              <span className="text-xs text-[var(--muted-foreground)]">
                {payment.date}
              </span>
              <strong className="text-sm">
                {formatCurrency(payment.amount, locale)}
              </strong>
              <button
                type="button"
                onClick={() =>
                  setPayments((current) =>
                    current.map((item) =>
                      item.id === payment.id
                        ? { ...item, status: "Pago" }
                        : item,
                    ),
                  )
                }
                disabled={payment.status === "Pago"}
                className="text-left disabled:cursor-default"
              >
                <Badge
                  tone={
                    payment.status === "Pago"
                      ? "success"
                      : payment.status === "Atrasado"
                        ? "warning"
                        : "info"
                  }
                >
                  {payment.status}
                </Badge>
              </button>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

export function ProfessionalSettingsWorkspace({
  initialLocale,
}: {
  initialLocale: Locale;
}) {
  const [settings, setSettings] = useState({
    online: true,
    presential: true,
    reminders: true,
    clientRequests: true,
    shareAlerts: true,
    twoFactor: true,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: false,
  });
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [saved, setSaved] = useState(false);

  const set = (key: keyof typeof settings, value: boolean) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  return (
    <>
      <PageHeading
        eyebrow="Preferências do consultório"
        title="Definições"
        description="Disponibilidade, localização, notificações e proteção da conta."
        action={
          <Button onClick={() => setSaved(true)}>
            <Save className="size-4" />
            Guardar alterações
          </Button>
        }
      />

      {saved && (
        <div className="mb-5">
          <LocalNotice>Preferências guardadas nesta sessão local.</LocalNotice>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Atendimento</CardTitle>
            <CardDescription>
              Modalidades apresentadas aos clientes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              [
                "online",
                "Sessões online",
                "Disponibilizar horários por videochamada",
              ],
              ["presential", "Sessões presenciais", "Consultório em Lisboa"],
              [
                "clientRequests",
                "Pedidos de horário",
                "Permitir propostas fora da agenda publicada",
              ],
            ].map(([key, title, description]) => (
              <div
                key={key}
                className="flex items-center gap-4 rounded-2xl border border-[var(--border)] p-4"
              >
                <div className="flex-1">
                  <p className="text-sm font-bold">{title}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {description}
                  </p>
                </div>
                <Switch
                  label={title}
                  checked={settings[key as keyof typeof settings]}
                  onChange={(value) => set(key as keyof typeof settings, value)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Semana habitual</CardTitle>
            <CardDescription>
              Base para a disponibilidade, ajustável na agenda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              ["monday", "Segunda-feira"],
              ["tuesday", "Terça-feira"],
              ["wednesday", "Quarta-feira"],
              ["thursday", "Quinta-feira"],
              ["friday", "Sexta-feira"],
            ].map(([key, label]) => (
              <div
                key={key}
                className="flex items-center gap-4 rounded-2xl bg-[var(--background)] p-3"
              >
                <Switch
                  label={label}
                  checked={settings[key as keyof typeof settings]}
                  onChange={(value) => set(key as keyof typeof settings, value)}
                />
                <span className="flex-1 text-sm font-semibold">{label}</span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {settings[key as keyof typeof settings]
                    ? "09:00–17:30"
                    : "Indisponível"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Localização</CardTitle>
            <CardDescription>
              A localização altera termos, datas e documentos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-bold">
                Português base
              </span>
              <select
                value={locale}
                onChange={(event) => {
                  setLocale(event.target.value as Locale);
                  setSaved(false);
                }}
                className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm"
              >
                <option value="pt-PT">Português de Portugal</option>
                <option value="pt-BR">Português do Brasil</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold">Fuso horário</span>
              <Input value={timeZoneFor(locale)} readOnly />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segurança e alertas</CardTitle>
            <CardDescription>
              Proteção reforçada para operações sensíveis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              [
                "twoFactor",
                "Autenticação em dois passos",
                "Obrigatória para notas e exportações",
              ],
              [
                "reminders",
                "Lembretes de agenda",
                "Avisos operacionais, sem conteúdo clínico",
              ],
              [
                "shareAlerts",
                "Novas partilhas",
                "Avisar quando um cliente partilha um snapshot",
              ],
            ].map(([key, title, description]) => (
              <div
                key={key}
                className="flex items-center gap-4 rounded-2xl border border-[var(--border)] p-4"
              >
                <div className="flex-1">
                  <p className="text-sm font-bold">{title}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {description}
                  </p>
                </div>
                <Switch
                  label={title}
                  checked={settings[key as keyof typeof settings]}
                  onChange={(value) => set(key as keyof typeof settings, value)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
