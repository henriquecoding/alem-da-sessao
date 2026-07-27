"use client";

import { useState } from "react";
import {
  Activity,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Eye,
  FileCheck2,
  FileWarning,
  Flag,
  Globe2,
  KeyRound,
  LockKeyhole,
  Save,
  Search,
  ShieldAlert,
  Sparkles,
  UserCheck,
  UsersRound,
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
import { MetricCard } from "@/components/metric-card";
import { PageHeading } from "@/components/page-heading";
import { cn } from "@/lib/utils";

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="status"
      className="rounded-2xl bg-[var(--success-soft)] p-4 text-sm font-semibold text-[var(--success)]"
    >
      <Check className="mr-2 inline size-4" />
      {children}
    </p>
  );
}

type ProfessionalStatus =
  "Verificado" | "Em revisão" | "Documentos pedidos" | "Renovação";

type Professional = {
  id: number;
  name: string;
  profession: string;
  country: string;
  credential: string;
  submitted: string;
  status: ProfessionalStatus;
};

const initialProfessionals: Professional[] = [
  {
    id: 1,
    name: "Inês Almeida",
    profession: "Psicóloga",
    country: "Portugal",
    credential: "OPP 00000 · fictício",
    submitted: "Hoje, 09:14",
    status: "Em revisão",
  },
  {
    id: 2,
    name: "Mariana Costa",
    profession: "Psicóloga",
    country: "Brasil",
    credential: "CRP 00/00000 · fictício",
    submitted: "Ontem, 16:42",
    status: "Documentos pedidos",
  },
  {
    id: 3,
    name: "Rafael Nunes",
    profession: "Psiquiatra",
    country: "Portugal",
    credential: "OM 00000 · fictício",
    submitted: "21 jul",
    status: "Renovação",
  },
  {
    id: 4,
    name: "Sofia Lopes",
    profession: "Psicóloga",
    country: "Portugal",
    credential: "OPP 00001 · fictício",
    submitted: "18 jul",
    status: "Verificado",
  },
];

export function AdminProfessionalsWorkspace() {
  const [professionals, setProfessionals] = useState(initialProfessionals);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"Todos" | ProfessionalStatus>("Todos");
  const [notice, setNotice] = useState("");

  const visible = professionals.filter(
    (professional) =>
      (filter === "Todos" || professional.status === filter) &&
      professional.name.toLowerCase().includes(query.toLowerCase()),
  );

  function updateStatus(id: number, status: ProfessionalStatus) {
    setProfessionals((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
    setNotice(`Estado atualizado para “${status}” no modo local.`);
  }

  return (
    <>
      <PageHeading
        eyebrow="Confiança da rede"
        title="Profissionais"
        description="Verificação humana de credenciais, renovações e decisões auditáveis."
      />

      {notice && (
        <div className="mb-5">
          <Notice>{notice}</Notice>
        </div>
      )}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Verificados"
          value={String(
            professionals.filter((item) => item.status === "Verificado").length,
          )}
          detail="Perfis publicáveis"
          icon={UserCheck}
          tone="lilac"
        />
        <MetricCard
          label="Em revisão"
          value={String(
            professionals.filter((item) => item.status === "Em revisão").length,
          )}
          detail="Fila manual"
          icon={Clock3}
          tone="lemon"
        />
        <MetricCard
          label="Documentos pedidos"
          value={String(
            professionals.filter((item) => item.status === "Documentos pedidos")
              .length,
          )}
          detail="Resposta necessária"
          icon={FileWarning}
          tone="accent"
        />
        <MetricCard
          label="Renovações"
          value={String(
            professionals.filter((item) => item.status === "Renovação").length,
          )}
          detail="Prazo acompanhado"
          icon={FileCheck2}
          tone="blue"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Fila de verificação</CardTitle>
              <CardDescription>
                Nunca aprovar apenas pela aparência do documento.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative">
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Pesquisar profissional"
                  className="pl-10"
                />
              </label>
              <select
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value as "Todos" | ProfessionalStatus)
                }
                className="h-12 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm"
              >
                <option>Todos</option>
                <option>Verificado</option>
                <option>Em revisão</option>
                <option>Documentos pedidos</option>
                <option>Renovação</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {visible.map((professional) => (
            <div
              key={professional.id}
              className="grid gap-4 rounded-3xl border border-[var(--border)] p-4 lg:grid-cols-[1fr_190px_150px_auto] lg:items-center"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--pigment-sage)] text-xs font-bold text-[var(--primary)]">
                  {professional.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <div>
                  <p className="text-sm font-bold">{professional.name}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {professional.profession} · {professional.country}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold">
                  {professional.credential}
                </p>
                <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">
                  Submetido {professional.submitted}
                </p>
              </div>
              <Badge
                tone={
                  professional.status === "Verificado"
                    ? "success"
                    : professional.status === "Em revisão"
                      ? "info"
                      : "warning"
                }
              >
                {professional.status}
              </Badge>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => updateStatus(professional.id, "Verificado")}
                >
                  Aprovar
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    updateStatus(professional.id, "Documentos pedidos")
                  }
                >
                  Pedir prova
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

type Organization = {
  id: number;
  name: string;
  country: string;
  plan: "Essencial" | "Consultório" | "Clínica";
  members: number;
  clients: number;
  status: "Ativa" | "Em avaliação" | "Suspensa";
};

const initialOrganizations: Organization[] = [
  {
    id: 1,
    name: "Consultório Horizonte",
    country: "Portugal",
    plan: "Consultório",
    members: 3,
    clients: 38,
    status: "Ativa",
  },
  {
    id: 2,
    name: "Clínica Aurora",
    country: "Brasil",
    plan: "Clínica",
    members: 12,
    clients: 164,
    status: "Ativa",
  },
  {
    id: 3,
    name: "Espaço Travessia",
    country: "Portugal",
    plan: "Essencial",
    members: 1,
    clients: 14,
    status: "Em avaliação",
  },
  {
    id: 4,
    name: "Núcleo Sereno",
    country: "Brasil",
    plan: "Consultório",
    members: 4,
    clients: 51,
    status: "Suspensa",
  },
];

export function AdminOrganizationsWorkspace() {
  const [organizations, setOrganizations] = useState(initialOrganizations);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const visible = organizations.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <PageHeading
        eyebrow="Estrutura comercial"
        title="Organizações"
        description="Consultórios e clínicas com utilização, plano e estado separados do conteúdo clínico."
        action={
          <label className="relative">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Pesquisar organização"
              className="pl-10"
            />
          </label>
        }
      />

      {notice && (
        <div className="mb-5">
          <Notice>{notice}</Notice>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {visible.map((organization, index) => (
          <Card
            key={organization.id}
            className={
              index === 0 ? "overflow-hidden bg-[var(--pigment-sage)]" : ""
            }
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-12 place-items-center rounded-2xl bg-[var(--surface)] text-[var(--primary)]">
                  <Building2 className="size-5" />
                </span>
                <Badge
                  tone={
                    organization.status === "Ativa"
                      ? "success"
                      : organization.status === "Suspensa"
                        ? "warning"
                        : "info"
                  }
                >
                  {organization.status}
                </Badge>
              </div>
              <h2 className="mt-7 text-xl font-bold">{organization.name}</h2>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {organization.country} · Plano {organization.plan}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[var(--surface)] p-4">
                  <UsersRound className="size-4 text-[var(--primary)]" />
                  <p className="mt-3 text-xl font-bold">
                    {organization.members}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Membros
                  </p>
                </div>
                <div className="rounded-2xl bg-[var(--surface)] p-4">
                  <Activity className="size-4 text-[var(--info)]" />
                  <p className="mt-3 text-xl font-bold">
                    {organization.clients}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Clientes ativos
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <select
                  aria-label={`Plano de ${organization.name}`}
                  value={organization.plan}
                  onChange={(event) => {
                    const plan = event.target.value as Organization["plan"];
                    setOrganizations((current) =>
                      current.map((item) =>
                        item.id === organization.id ? { ...item, plan } : item,
                      ),
                    );
                    setNotice(
                      `Plano de ${organization.name} atualizado localmente.`,
                    );
                  }}
                  className="h-10 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-xs font-semibold"
                >
                  <option>Essencial</option>
                  <option>Consultório</option>
                  <option>Clínica</option>
                </select>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const status =
                      organization.status === "Suspensa" ? "Ativa" : "Suspensa";
                    setOrganizations((current) =>
                      current.map((item) =>
                        item.id === organization.id
                          ? { ...item, status }
                          : item,
                      ),
                    );
                    setNotice(
                      `Organização marcada como ${status.toLowerCase()}.`,
                    );
                  }}
                >
                  {organization.status === "Suspensa"
                    ? "Reativar"
                    : "Suspender"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

type Gate = {
  id: "clinical" | "privacy" | "locales" | "accessibility";
  label: string;
  description: string;
  complete: boolean;
};

type CatalogTool = {
  id: number;
  name: string;
  version: string;
  status: "Demonstração" | "Em revisão" | "Publicada";
  gates: Gate[];
};

const initialCatalog: CatalogTool[] = [
  {
    id: 1,
    name: "Estruturas de Carga",
    version: "0.2.0",
    status: "Demonstração",
    gates: [
      {
        id: "clinical",
        label: "Revisão clínica",
        description: "Linguagem, limites e utilização acompanhada",
        complete: false,
      },
      {
        id: "privacy",
        label: "Privacidade",
        description: "Minimização, rascunho e snapshot",
        complete: true,
      },
      {
        id: "locales",
        label: "Localizações",
        description: "pt-PT e pt-BR com paridade funcional",
        complete: true,
      },
      {
        id: "accessibility",
        label: "Acessibilidade",
        description: "Teclado, contraste e redução de movimento",
        complete: true,
      },
    ],
  },
  {
    id: 2,
    name: "Inventário da Sessão",
    version: "0.2.0",
    status: "Demonstração",
    gates: [
      {
        id: "clinical",
        label: "Revisão clínica",
        description: "Objetivo, limites e riscos de interpretação",
        complete: false,
      },
      {
        id: "privacy",
        label: "Privacidade",
        description: "Seleção explícita do snapshot",
        complete: true,
      },
      {
        id: "locales",
        label: "Localizações",
        description: "pt-PT e pt-BR com paridade funcional",
        complete: true,
      },
      {
        id: "accessibility",
        label: "Acessibilidade",
        description: "Alvos táteis e estados não cromáticos",
        complete: true,
      },
    ],
  },
];

export function AdminExperiencesWorkspace() {
  const [catalog, setCatalog] = useState(initialCatalog);
  const [selectedId, setSelectedId] = useState(1);
  const [notice, setNotice] = useState("");
  const selected = catalog.find((item) => item.id === selectedId)!;
  const completed = selected.gates.filter((gate) => gate.complete).length;

  function toggleGate(gateId: Gate["id"]) {
    setCatalog((current) =>
      current.map((tool) =>
        tool.id === selectedId
          ? {
              ...tool,
              gates: tool.gates.map((gate) =>
                gate.id === gateId
                  ? { ...gate, complete: !gate.complete }
                  : gate,
              ),
            }
          : tool,
      ),
    );
    setNotice("");
  }

  return (
    <>
      <PageHeading
        eyebrow="Governança de conteúdo"
        title="Catálogo de experiências"
        description="Versões imutáveis, localizações e gates separados antes de qualquer publicação real."
      />

      {notice && (
        <div className="mb-5">
          <Notice>{notice}</Notice>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Experiências</CardTitle>
            <CardDescription>Selecione uma versão para rever.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {catalog.map((tool) => (
              <button
                type="button"
                key={tool.id}
                onClick={() => setSelectedId(tool.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border p-4 text-left",
                  selectedId === tool.id
                    ? "border-[var(--primary)] bg-[var(--pigment-sage)]"
                    : "border-[var(--border)]",
                )}
              >
                <span className="grid size-10 place-items-center rounded-2xl bg-[var(--surface)] text-[var(--primary)]">
                  <Sparkles className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{tool.name}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    v{tool.version} · {tool.status}
                  </p>
                </div>
                <ChevronRight className="size-4" />
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Badge tone="accent">v{selected.version}</Badge>
                <CardTitle className="mt-3 text-xl">{selected.name}</CardTitle>
                <CardDescription>
                  {completed}/4 gates completos nesta revisão local.
                </CardDescription>
              </div>
              <Button
                disabled={completed !== selected.gates.length}
                onClick={() => {
                  setCatalog((current) =>
                    current.map((tool) =>
                      tool.id === selectedId
                        ? { ...tool, status: "Publicada" }
                        : tool,
                    ),
                  );
                  setNotice(
                    "Versão marcada como publicada apenas no catálogo em memória.",
                  );
                }}
              >
                <CheckCircle2 className="size-4" />
                Aprovar versão
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {selected.gates.map((gate) => (
              <div
                key={gate.id}
                className="flex items-center gap-4 rounded-2xl border border-[var(--border)] p-4"
              >
                <span
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-2xl",
                    gate.complete
                      ? "bg-[var(--success-soft)] text-[var(--success)]"
                      : "bg-[var(--warning-soft)] text-[var(--warning)]",
                  )}
                >
                  {gate.complete ? (
                    <Check className="size-4" />
                  ) : (
                    <Clock3 className="size-4" />
                  )}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold">{gate.label}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {gate.description}
                  </p>
                </div>
                <Switch
                  label={gate.label}
                  checked={gate.complete}
                  onChange={() => toggleGate(gate.id)}
                />
              </div>
            ))}
            <div className="mt-5 rounded-3xl bg-[var(--pigment-stone)] p-5">
              <div className="flex gap-3">
                <ShieldAlert className="size-5 shrink-0 text-[var(--info)]" />
                <p className="text-xs leading-6 text-[var(--muted-foreground)]">
                  Marcar um gate nesta demonstração valida o fluxo
                  administrativo, não substitui avaliação por profissionais,
                  testes com utilizadores nem documentação de evidência.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export function AdminSettingsWorkspace() {
  const [flags, setFlags] = useState({
    professionalInvites: true,
    clientSelfStart: true,
    shareSnapshots: true,
    publicDirectory: false,
    billingAdapter: false,
    maintenanceBanner: false,
  });
  const [retention, setRetention] = useState("30");
  const [notice, setNotice] = useState("");

  const update = (key: keyof typeof flags, value: boolean) =>
    setFlags((current) => ({ ...current, [key]: value }));

  return (
    <>
      <PageHeading
        eyebrow="Controlo da plataforma"
        title="Definições administrativas"
        description="Funcionalidades, ambientes e políticas operacionais com alterações explícitas."
        action={
          <Button
            onClick={() =>
              setNotice("Configuração guardada apenas no modo local.")
            }
          >
            <Save className="size-4" />
            Guardar configuração
          </Button>
        }
      />

      {notice && (
        <div className="mb-5">
          <Notice>{notice}</Notice>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Funcionalidades</CardTitle>
            <CardDescription>
              Flags com estado visível; nenhuma ativa serviços externos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              [
                "professionalInvites",
                "Convites profissionais",
                "Criar equipas no modo local",
              ],
              [
                "clientSelfStart",
                "Início autónomo",
                "Cliente pode abrir experiências publicadas",
              ],
              [
                "shareSnapshots",
                "Snapshots seletivos",
                "Partilha explícita e revogável",
              ],
              [
                "publicDirectory",
                "Diretório público",
                "Perfis profissionais verificados",
              ],
              [
                "billingAdapter",
                "Adaptador de faturação",
                "Integração comercial externa",
              ],
              [
                "maintenanceBanner",
                "Aviso de manutenção",
                "Mensagem global sem conteúdo clínico",
              ],
            ].map(([key, title, description]) => (
              <div
                key={key}
                className="flex items-center gap-4 rounded-2xl border border-[var(--border)] p-4"
              >
                <span className="grid size-10 place-items-center rounded-2xl bg-[var(--pigment-sage)] text-[var(--primary)]">
                  <Flag className="size-4" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold">{title}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {description}
                  </p>
                </div>
                <Switch
                  label={title}
                  checked={flags[key as keyof typeof flags]}
                  onChange={(value) => update(key as keyof typeof flags, value)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ambiente</CardTitle>
            <CardDescription>
              O protótipo continua isolado de produção por configuração.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Aplicação", "Local", CheckCircle2, "success"],
              ["Dados", "Fixtures sintéticas", FileCheck2, "info"],
              ["Supabase clínico", "Sem ligação", LockKeyhole, "neutral"],
              ["Pagamentos", "Sem ligação", CircleDollarSign, "neutral"],
              ["Deploy", "Não configurado", Globe2, "neutral"],
            ].map(([label, value, Icon, tone]) => (
              <div
                key={label as string}
                className="flex items-center gap-4 rounded-2xl bg-[var(--background)] p-4"
              >
                <Icon className="size-4 text-[var(--primary)]" />
                <span className="flex-1 text-sm font-semibold">
                  {label as string}
                </span>
                <Badge tone={tone as "success" | "info" | "neutral"}>
                  {value as string}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Retenção operacional</CardTitle>
            <CardDescription>
              Prazos finais exigem revisão jurídica separada para PT e BR.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label>
              <span className="mb-2 block text-xs font-bold">
                Logs técnicos sem conteúdo (dias)
              </span>
              <Input
                type="number"
                min="7"
                max="90"
                value={retention}
                onChange={(event) => setRetention(event.target.value)}
              />
            </label>
            <div className="rounded-2xl bg-[var(--pigment-ochre)] p-4 text-xs leading-6 text-[var(--warning)]">
              Notas clínicas, snapshots e pedidos de direitos seguem políticas
              próprias e nunca herdam este prazo automaticamente.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operações sensíveis</CardTitle>
            <CardDescription>
              Fluxos administrativos preparados para reautenticação e auditoria.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              [
                "Acesso de emergência",
                "Motivo, duração e caso associado",
                KeyRound,
              ],
              [
                "Suspensão de organização",
                "Dupla confirmação e motivo",
                ShieldAlert,
              ],
              ["Exportação administrativa", "Apenas metadados permitidos", Eye],
            ].map(([title, description, Icon]) => (
              <button
                type="button"
                key={title as string}
                onClick={() =>
                  setNotice(
                    `${title as string}: fluxo de confirmação aberto e registado localmente.`,
                  )
                }
                className="hover:border-[var(--primary)]/40 flex w-full items-center gap-4 rounded-2xl border border-[var(--border)] p-4 text-left"
              >
                <span className="grid size-10 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-foreground)]">
                  <Icon className="size-4" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold">{title as string}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {description as string}
                  </p>
                </div>
                <ChevronRight className="size-4" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
