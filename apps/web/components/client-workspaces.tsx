"use client";

import { useState } from "react";
import {
  CalendarCheck2,
  CalendarClock,
  Check,
  Clock3,
  Download,
  FileLock2,
  Laptop2,
  MapPin,
  MonitorSmartphone,
  Save,
  ShieldCheck,
  Trash2,
  Video,
  X,
} from "lucide-react";
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
import { PageHeading } from "@/components/page-heading";
import { cn } from "@/lib/utils";

const upcomingSessions = [
  {
    id: 1,
    date: "29 jul",
    weekday: "Quarta-feira",
    time: "09:30",
    modality: "Online",
    professional: "Dra. Inês Almeida",
  },
  {
    id: 2,
    date: "12 ago",
    weekday: "Quarta-feira",
    time: "09:30",
    modality: "Presencial",
    professional: "Dra. Inês Almeida",
  },
];

const sessionHistory = [
  {
    id: 3,
    date: "15 jul",
    time: "09:30",
    modality: "Online",
    status: "Realizada",
  },
  {
    id: 4,
    date: "01 jul",
    time: "09:30",
    modality: "Presencial",
    status: "Realizada",
  },
  {
    id: 5,
    date: "17 jun",
    time: "09:30",
    modality: "Online",
    status: "Realizada",
  },
];

export function ClientSessionsWorkspace() {
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");
  const [requestOpen, setRequestOpen] = useState(false);
  const [preferredDay, setPreferredDay] = useState("Quarta-feira");
  const [period, setPeriod] = useState("Manhã");
  const [notice, setNotice] = useState("");

  function submitRequest() {
    setNotice(
      `Pedido local registado: ${preferredDay}, período da ${period.toLowerCase()}.`,
    );
    setRequestOpen(false);
  }

  return (
    <>
      <PageHeading
        eyebrow="Agenda de cuidado"
        title="Sessões"
        description="Próximas sessões, pedidos de alteração e histórico operacional."
        action={
          <Button onClick={() => setRequestOpen(true)}>
            <CalendarClock className="size-4" />
            Pedir outro horário
          </Button>
        }
      />

      {notice && (
        <p
          role="status"
          className="mb-5 rounded-2xl bg-[var(--success-soft)] p-4 text-sm font-semibold text-[var(--success)]"
        >
          <Check className="mr-2 inline size-4" />
          {notice}
        </p>
      )}

      {requestOpen && (
        <Card className="border-[var(--primary)]/30 mb-5 bg-[var(--pigment-sage)]">
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Propor disponibilidade</CardTitle>
              <CardDescription>
                O profissional recebe uma janela, não acesso ao seu calendário.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRequestOpen(false)}
            >
              <X className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-xs font-bold">
                Dia preferido
              </span>
              <select
                value={preferredDay}
                onChange={(event) => setPreferredDay(event.target.value)}
                className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm"
              >
                <option>Segunda-feira</option>
                <option>Terça-feira</option>
                <option>Quarta-feira</option>
                <option>Quinta-feira</option>
                <option>Sexta-feira</option>
              </select>
            </label>
            <label>
              <span className="mb-2 block text-xs font-bold">Período</span>
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm"
              >
                <option>Manhã</option>
                <option>Tarde</option>
                <option>Noite</option>
              </select>
            </label>
            <Button className="sm:col-span-2 sm:w-fit" onClick={submitRequest}>
              Enviar proposta
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mb-5 flex gap-2">
        {[
          ["upcoming", "Próximas"],
          ["history", "Histórico"],
        ].map(([value, label]) => (
          <button
            type="button"
            key={value}
            aria-pressed={tab === value}
            onClick={() => setTab(value as "upcoming" | "history")}
            className={cn(
              "min-h-10 rounded-full px-4 text-xs font-bold",
              tab === value
                ? "surface-primary"
                : "border border-[var(--border)] bg-[var(--surface)]",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "upcoming" ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {upcomingSessions.map((session, index) => (
            <Card
              key={session.id}
              className={
                index === 0 ? "overflow-hidden bg-[var(--pigment-sage)]" : ""
              }
            >
              <CardContent className="p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="grid size-14 place-items-center rounded-3xl bg-[var(--surface)] text-[var(--primary)]">
                      <CalendarCheck2 className="size-5" />
                    </span>
                    <div>
                      <p className="text-xl font-bold">{session.date}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {session.weekday}
                      </p>
                    </div>
                  </div>
                  <Badge tone={index === 0 ? "success" : "neutral"}>
                    {index === 0 ? "Confirmada" : "Agendada"}
                  </Badge>
                </div>
                <div className="mt-7 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[var(--surface)] p-4">
                    <Clock3 className="size-4 text-[var(--primary)]" />
                    <p className="mt-2 text-sm font-bold">{session.time}</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      50 minutos
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[var(--surface)] p-4">
                    {session.modality === "Online" ? (
                      <Video className="size-4 text-[var(--primary)]" />
                    ) : (
                      <MapPin className="size-4 text-[var(--primary)]" />
                    )}
                    <p className="mt-2 text-sm font-bold">{session.modality}</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      {session.modality === "Online"
                        ? "Ligação protegida"
                        : "Lisboa"}
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-sm font-semibold">
                  {session.professional}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setRequestOpen(true);
                      setNotice("");
                    }}
                  >
                    Pedir alteração
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setNotice(
                        "Pedido de cancelamento preparado para confirmação profissional.",
                      )
                    }
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="space-y-2 p-5">
            {sessionHistory.map((session) => (
              <div
                key={session.id}
                className="grid gap-3 rounded-2xl border border-[var(--border)] p-4 sm:grid-cols-[1fr_120px_120px_auto] sm:items-center"
              >
                <div>
                  <p className="text-sm font-bold">{session.date}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Dra. Inês Almeida
                  </p>
                </div>
                <span className="text-sm">{session.time}</span>
                <span className="text-sm">{session.modality}</span>
                <Badge tone="success">{session.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
}

export function ClientAccountWorkspace() {
  const [preferences, setPreferences] = useState({
    sessionReminders: true,
    experienceReminders: false,
    shareReceipts: true,
    productEmails: false,
  });
  const [locale, setLocale] = useState("pt-PT");
  const [sessions, setSessions] = useState([
    { id: 1, device: "Edge · Windows", location: "Setúbal, PT", current: true },
    {
      id: 2,
      device: "Safari · iPhone",
      location: "Setúbal, PT",
      current: false,
    },
  ]);
  const [notice, setNotice] = useState("");

  const setPreference = (key: keyof typeof preferences, value: boolean) =>
    setPreferences((current) => ({ ...current, [key]: value }));

  return (
    <>
      <PageHeading
        eyebrow="Controlo pessoal"
        title="Conta e privacidade"
        description="Preferências, consentimentos, dispositivos e pedidos de direitos num único lugar."
        action={
          <Button
            onClick={() =>
              setNotice("Preferências guardadas nesta sessão local.")
            }
          >
            <Save className="size-4" />
            Guardar
          </Button>
        }
      />

      {notice && (
        <p className="mb-5 rounded-2xl bg-[var(--success-soft)] p-4 text-sm font-semibold text-[var(--success)]">
          <Check className="mr-2 inline size-4" />
          {notice}
        </p>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Perfil e localização</CardTitle>
            <CardDescription>
              A localização muda linguagem e formatos, não apenas palavras.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label>
              <span className="mb-2 block text-xs font-bold">
                Nome apresentado
              </span>
              <Input defaultValue="Marta Oliveira" />
            </label>
            <label>
              <span className="mb-2 block text-xs font-bold">E-mail</span>
              <Input type="email" defaultValue="marta@exemplo.local" />
            </label>
            <label>
              <span className="mb-2 block text-xs font-bold">Localização</span>
              <select
                value={locale}
                onChange={(event) => setLocale(event.target.value)}
                className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm"
              >
                <option value="pt-PT">Portugal · Português de Portugal</option>
                <option value="pt-BR">Brasil · Português do Brasil</option>
              </select>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>
              Escolha apenas os avisos que lhe são úteis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              [
                "sessionReminders",
                "Lembretes de sessão",
                "24 horas e 2 horas antes",
              ],
              [
                "experienceReminders",
                "Experiências atribuídas",
                "Um lembrete gentil, sem insistência",
              ],
              [
                "shareReceipts",
                "Recibos de partilha",
                "Confirmação e possibilidade de revogar",
              ],
              [
                "productEmails",
                "Novidades da plataforma",
                "Melhorias e novas funcionalidades",
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
                  checked={preferences[key as keyof typeof preferences]}
                  onChange={(value) =>
                    setPreference(key as keyof typeof preferences, value)
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sessões ativas</CardTitle>
            <CardDescription>
              Termine acessos que não reconheça.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-4 rounded-2xl bg-[var(--background)] p-4"
              >
                <span className="grid size-10 place-items-center rounded-2xl bg-[var(--pigment-stone)] text-[var(--info)]">
                  {session.current ? (
                    <Laptop2 className="size-4" />
                  ) : (
                    <MonitorSmartphone className="size-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{session.device}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {session.location}
                  </p>
                </div>
                {session.current ? (
                  <Badge tone="success">Atual</Badge>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSessions((current) =>
                        current.filter((item) => item.id !== session.id),
                      )
                    }
                  >
                    Terminar
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consentimentos e direitos</CardTitle>
            <CardDescription>
              Exportar ou eliminar exige confirmação adicional numa conta real.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3 rounded-2xl bg-[var(--pigment-sage)] p-4">
              <ShieldCheck className="size-5 shrink-0 text-[var(--success)]" />
              <div>
                <p className="text-sm font-bold">Continuidade terapêutica</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Consentimento ativo · versão 1.0 · 12 fev 2026
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={() =>
                setNotice(
                  "Exportação de demonstração preparada sem dados reais.",
                )
              }
            >
              <Download className="size-4" />
              Pedir cópia dos meus dados
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={() =>
                setNotice("Pedido de retificação aberto na demonstração.")
              }
            >
              <FileLock2 className="size-4" />
              Retificar dados pessoais
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-[var(--destructive)]"
              onClick={() =>
                setNotice(
                  "Pedido de eliminação preparado; nada foi apagado no modo local.",
                )
              }
            >
              <Trash2 className="size-4" />
              Pedir eliminação da conta
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
