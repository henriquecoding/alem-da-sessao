"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleDollarSign,
  Eye,
  HandHeart,
  HeartPulse,
  House,
  LockKeyhole,
  RotateCcw,
  Scale,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Locale } from "@alem-da-sessao/i18n";
import {
  loadStructuresSchema,
  type LoadStructuresInput,
} from "@alem-da-sessao/validation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Ownership = LoadStructuresInput["loads"][number]["ownership"];
type Movement = LoadStructuresInput["loads"][number]["movement"];
type LoadState = {
  id: string;
  label: string;
  intensity: 1 | 2 | 3;
  ownership?: Ownership;
  movement?: Movement;
  includeInShare: boolean;
};

type LoadOption = {
  id: string;
  icon: LucideIcon;
  tone: string;
  labels: Record<Locale, string>;
};

const loadOptions: LoadOption[] = [
  {
    id: "work-decisions",
    icon: BriefcaseBusiness,
    tone: "bg-[var(--pastel-lilac)]",
    labels: {
      "pt-PT": "Decisões no trabalho",
      "pt-BR": "Decisões no trabalho",
    },
  },
  {
    id: "deadlines",
    icon: BriefcaseBusiness,
    tone: "bg-[var(--pastel-blue)]",
    labels: { "pt-PT": "Prazos e urgências", "pt-BR": "Prazos e urgências" },
  },
  {
    id: "care-family",
    icon: HandHeart,
    tone: "bg-[var(--pastel-pink)]",
    labels: { "pt-PT": "Cuidar de alguém", "pt-BR": "Cuidar de alguém" },
  },
  {
    id: "home",
    icon: House,
    tone: "bg-[var(--pastel-peach)]",
    labels: {
      "pt-PT": "Manter a casa a funcionar",
      "pt-BR": "Manter a casa funcionando",
    },
  },
  {
    id: "relationship",
    icon: UsersRound,
    tone: "bg-[var(--pastel-pink)]",
    labels: {
      "pt-PT": "Tensão numa relação",
      "pt-BR": "Tensão em uma relação",
    },
  },
  {
    id: "expectations",
    icon: UserRound,
    tone: "bg-[var(--pastel-lilac)]",
    labels: {
      "pt-PT": "Expectativas dos outros",
      "pt-BR": "Expectativas dos outros",
    },
  },
  {
    id: "money",
    icon: CircleDollarSign,
    tone: "bg-[var(--pastel-lemon)]",
    labels: { "pt-PT": "Pressão financeira", "pt-BR": "Pressão financeira" },
  },
  {
    id: "health",
    icon: HeartPulse,
    tone: "bg-[var(--pastel-aqua)]",
    labels: { "pt-PT": "Saúde ou tratamento", "pt-BR": "Saúde ou tratamento" },
  },
  {
    id: "decision",
    icon: Scale,
    tone: "bg-[var(--pastel-blue)]",
    labels: {
      "pt-PT": "Uma decisão por tomar",
      "pt-BR": "Uma decisão a tomar",
    },
  },
  {
    id: "self-demand",
    icon: UserRound,
    tone: "bg-[var(--pastel-peach)]",
    labels: { "pt-PT": "Exigência comigo", "pt-BR": "Exigência comigo" },
  },
];

const content = {
  "pt-PT": {
    stages: ["Recolher", "Pesar", "Separar", "Mover", "Mapa"],
    introTitle: "Comece por reconhecer, não por explicar.",
    intro:
      "Escolha até seis cargas que se aproximam do seu momento. Não precisa de escrever uma história para que algo conte.",
    selectHint: "Toque para colocar ou retirar da mesa",
    selected: "Na sua mesa",
    continue: "Continuar",
    back: "Voltar",
    discard: "Limpar mesa",
    intensityTitle: "Quanto espaço cada carga ocupa hoje?",
    intensityBody:
      "Isto não mede sofrimento. Serve apenas para tornar visível o espaço que cada responsabilidade ocupa neste momento.",
    intensityLabels: ["Ao fundo", "Presente", "Dominante"],
    effectsTitle: "Onde sente o efeito da estrutura?",
    effectsBody:
      "Escolha os sinais que reconhece. Pode selecionar mais do que um.",
    effects: ["No tempo", "No sono", "No corpo", "Na atenção", "Nas relações"],
    ownershipTitle: "Como cada carga chegou às suas mãos?",
    ownershipBody:
      "A origem não decide o que deve fazer. Ajuda apenas a distinguir responsabilidade de hábito, acordo ou dúvida.",
    ownership: {
      mine: ["É minha", "Escolhi ou reconheço esta responsabilidade"],
      shared: ["É partilhada", "Existe um acordo com outras pessoas"],
      inherited: ["Fui assumindo", "Chegou sem uma conversa clara"],
      unclear: ["Ainda não sei", "Quero observar antes de concluir"],
    },
    movementTitle: "Que movimento faria diferença?",
    movementBody:
      "Escolha um movimento possível para cada carga. Não é uma promessa nem uma tarefa automática.",
    movements: {
      protect: ["Manter com limite", "Continuar, mas proteger espaço"],
      ask: ["Pedir apoio", "Tornar a necessidade visível"],
      negotiate: ["Renegociar", "Rever um acordo ou expectativa"],
      return: ["Devolver", "Questionar se precisa de continuar comigo"],
      observe: ["Levar à sessão", "Explorar antes de agir"],
    },
    supportTitle: "O que pode servir de apoio agora?",
    supports: [
      "Uma conversa concreta",
      "Tempo protegido",
      "Dividir uma tarefa",
      "Clarificar um limite",
      "Levar isto à sessão",
    ],
    mapTitle: "O seu mapa de carga",
    mapBody:
      "Uma fotografia do momento, não uma definição sobre si. Selecione exatamente o que entraria numa partilha.",
    optionalNote: "Uma frase para abrir a próxima conversa — opcional",
    notePlaceholder:
      "Ex.: quero começar por perceber por que esta carga ficou só comigo.",
    privateSave: "Guardar só para mim",
    prepareShare: "Preparar partilha",
    saved:
      "Guardado apenas na memória desta demonstração. Recarregar a página elimina o conteúdo.",
    shareTitle: "Pré-visualização da partilha",
    shareBody:
      "Apenas as cargas assinaladas, os efeitos, o apoio e a frase opcional entram neste snapshot.",
    confirm: "Confirmar snapshot",
    shared: "Snapshot de demonstração criado",
    sharedBody:
      "Nenhum dado saiu deste navegador. Numa versão ligada ao profissional, este seria um objeto imutável e revogável.",
    restart: "Criar outro mapa",
    privateDefault: "Privado por defeito",
    chooseAtLeast: "Escolha pelo menos uma carga para continuar.",
    completeStage: "Complete as escolhas desta etapa para continuar.",
    noShare: "Selecione pelo menos uma carga para a partilha.",
    tableEmpty: "A mesa está vazia",
  },
  "pt-BR": {
    stages: ["Recolher", "Pesar", "Separar", "Mover", "Mapa"],
    introTitle: "Comece reconhecendo, não explicando.",
    intro:
      "Escolha até seis cargas que se aproximam do seu momento. Você não precisa escrever uma história para que algo conte.",
    selectHint: "Toque para colocar ou retirar da mesa",
    selected: "Na sua mesa",
    continue: "Continuar",
    back: "Voltar",
    discard: "Limpar mesa",
    intensityTitle: "Quanto espaço cada carga ocupa hoje?",
    intensityBody:
      "Isto não mede sofrimento. Serve apenas para tornar visível o espaço que cada responsabilidade ocupa neste momento.",
    intensityLabels: ["Ao fundo", "Presente", "Dominante"],
    effectsTitle: "Onde você sente o efeito da estrutura?",
    effectsBody:
      "Escolha os sinais que reconhece. Você pode selecionar mais de um.",
    effects: ["No tempo", "No sono", "No corpo", "Na atenção", "Nas relações"],
    ownershipTitle: "Como cada carga chegou às suas mãos?",
    ownershipBody:
      "A origem não decide o que fazer. Ela só ajuda a distinguir responsabilidade de hábito, acordo ou dúvida.",
    ownership: {
      mine: ["É minha", "Escolhi ou reconheço esta responsabilidade"],
      shared: ["É compartilhada", "Existe um acordo com outras pessoas"],
      inherited: ["Fui assumindo", "Chegou sem uma conversa clara"],
      unclear: ["Ainda não sei", "Quero observar antes de concluir"],
    },
    movementTitle: "Que movimento faria diferença?",
    movementBody:
      "Escolha um movimento possível para cada carga. Não é uma promessa nem uma tarefa automática.",
    movements: {
      protect: ["Manter com limite", "Continuar, mas proteger espaço"],
      ask: ["Pedir apoio", "Tornar a necessidade visível"],
      negotiate: ["Renegociar", "Rever um acordo ou expectativa"],
      return: ["Devolver", "Questionar se precisa continuar comigo"],
      observe: ["Levar à sessão", "Explorar antes de agir"],
    },
    supportTitle: "O que pode servir de apoio agora?",
    supports: [
      "Uma conversa concreta",
      "Tempo protegido",
      "Dividir uma tarefa",
      "Esclarecer um limite",
      "Levar isto à sessão",
    ],
    mapTitle: "Seu mapa de carga",
    mapBody:
      "Uma fotografia do momento, não uma definição sobre você. Selecione exatamente o que entraria em um compartilhamento.",
    optionalNote: "Uma frase para abrir a próxima conversa — opcional",
    notePlaceholder:
      "Ex.: quero começar entendendo por que essa carga ficou só comigo.",
    privateSave: "Salvar só para mim",
    prepareShare: "Preparar compartilhamento",
    saved:
      "Salvo apenas na memória desta demonstração. Recarregar a página elimina o conteúdo.",
    shareTitle: "Prévia do compartilhamento",
    shareBody:
      "Apenas as cargas marcadas, os efeitos, o apoio e a frase opcional entram neste snapshot.",
    confirm: "Confirmar snapshot",
    shared: "Snapshot de demonstração criado",
    sharedBody:
      "Nenhum dado saiu deste navegador. Em uma versão ligada ao profissional, este seria um objeto imutável e revogável.",
    restart: "Criar outro mapa",
    privateDefault: "Privado por padrão",
    chooseAtLeast: "Escolha pelo menos uma carga para continuar.",
    completeStage: "Complete as escolhas desta etapa para continuar.",
    noShare: "Selecione pelo menos uma carga para compartilhar.",
    tableEmpty: "A mesa está vazia",
  },
} satisfies Record<Locale, Record<string, unknown>>;

const ownershipKeys: Ownership[] = ["mine", "shared", "inherited", "unclear"];
const movementKeys: Movement[] = [
  "protect",
  "ask",
  "negotiate",
  "return",
  "observe",
];

function Choice({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "min-h-14 rounded-2xl border p-3 text-left transition-all",
        active
          ? "border-[var(--primary)] bg-[var(--pastel-lilac)] shadow-[0_8px_24px_rgba(104,72,198,.1)]"
          : "hover:border-[var(--primary)]/35 border-[var(--border)] bg-[var(--surface)] hover:-translate-y-0.5",
      )}
    >
      <span className="block text-sm font-bold">{title}</span>
      {description && (
        <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
          {description}
        </span>
      )}
    </button>
  );
}

export function LoadStructuresExperience({ locale }: { locale: Locale }) {
  const t = content[locale];
  const [stage, setStage] = useState(0);
  const [loads, setLoads] = useState<LoadState[]>([]);
  const [effects, setEffects] = useState<string[]>([]);
  const [support, setSupport] = useState("");
  const [nextSessionNote, setNextSessionNote] = useState("");
  const [mode, setMode] = useState<"editing" | "saved" | "sharing" | "shared">(
    "editing",
  );
  const [error, setError] = useState<string | null>(null);

  const loadById = useMemo(
    () => new Map(loadOptions.map((option) => [option.id, option])),
    [],
  );

  function toggleLoad(option: LoadOption) {
    setLoads((current) => {
      if (current.some((item) => item.id === option.id)) {
        return current.filter((item) => item.id !== option.id);
      }
      if (current.length >= 6) return current;
      return [
        ...current,
        {
          id: option.id,
          label: option.labels[locale],
          intensity: 2,
          includeInShare: true,
        },
      ];
    });
    setError(null);
  }

  function updateLoad(id: string, patch: Partial<LoadState>) {
    setLoads((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
    setError(null);
  }

  function canAdvance() {
    if (stage === 0) return loads.length > 0;
    if (stage === 1) return effects.length > 0;
    if (stage === 2) return loads.every((item) => item.ownership);
    if (stage === 3)
      return loads.every((item) => item.movement) && support.length > 0;
    return true;
  }

  function advance() {
    if (!canAdvance()) {
      setError(
        stage === 0 ? (t.chooseAtLeast as string) : (t.completeStage as string),
      );
      return;
    }
    setStage((current) => Math.min(current + 1, 4));
    setError(null);
  }

  function reset() {
    setStage(0);
    setLoads([]);
    setEffects([]);
    setSupport("");
    setNextSessionNote("");
    setMode("editing");
    setError(null);
  }

  const finalValue: LoadStructuresInput = {
    loads: loads
      .filter(
        (
          item,
        ): item is LoadState & {
          ownership: Ownership;
          movement: Movement;
        } => Boolean(item.ownership && item.movement),
      )
      .map((item) => ({
        id: item.id,
        label: item.label,
        intensity: item.intensity,
        ownership: item.ownership,
        movement: item.movement,
        includeInShare: item.includeInShare,
      })),
    effects,
    support,
    nextSessionNote,
  };

  function prepareShare() {
    if (!loads.some((item) => item.includeInShare)) {
      setError(t.noShare as string);
      return;
    }
    if (!loadStructuresSchema.safeParse(finalValue).success) {
      setError(t.completeStage as string);
      return;
    }
    setMode("sharing");
    setError(null);
  }

  if (mode === "shared") {
    return (
      <Card className="mx-auto max-w-2xl overflow-hidden">
        <CardContent className="relative flex min-h-[500px] flex-col items-center justify-center p-7 text-center sm:p-12">
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[var(--accent)] via-[var(--highlight-yellow)] to-[var(--primary)]" />
          <span className="grid size-16 place-items-center rounded-3xl bg-[var(--pastel-aqua)] text-[var(--success)]">
            <Check className="size-7" />
          </span>
          <h2 className="mt-7 text-3xl font-bold tracking-[-0.045em]">
            {t.shared as string}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-[var(--muted-foreground)]">
            {t.sharedBody as string}
          </p>
          <Button className="mt-8" onClick={reset}>
            <RotateCcw className="size-4" />
            {t.restart as string}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (mode === "sharing") {
    const sharedLoads = loads.filter((item) => item.includeInShare);
    return (
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => setMode("editing")}
          className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="size-4" />
          {t.back as string}
        </button>
        <Card className="overflow-hidden">
          <CardContent className="p-6 sm:p-9">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--pastel-lilac)] text-[var(--primary)]">
                <Eye className="size-5" />
              </span>
              <div>
                <h2 className="text-2xl font-bold tracking-[-0.04em]">
                  {t.shareTitle as string}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  {t.shareBody as string}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {sharedLoads.map((item) => {
                const option = loadById.get(item.id);
                const Icon = option?.icon ?? Scale;
                return (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-[var(--border)] bg-[var(--background)] p-5"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "grid size-10 place-items-center rounded-2xl",
                          option?.tone,
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <div>
                        <p className="text-sm font-bold">{item.label}</p>
                        <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                          {(t.intensityLabels as string[])[item.intensity - 1]}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge tone="info">
                        {
                          (t.ownership as Record<Ownership, string[]>)[
                            item.ownership!
                          ][0]
                        }
                      </Badge>
                      <Badge tone="accent">
                        {
                          (t.movements as Record<Movement, string[]>)[
                            item.movement!
                          ][0]
                        }
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-3xl bg-[var(--pastel-blue)] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-[var(--info)]">
                Efeitos reconhecidos
              </p>
              <p className="mt-2 text-sm">{effects.join(" · ")}</p>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.13em] text-[var(--info)]">
                Apoio escolhido
              </p>
              <p className="mt-2 text-sm">{support}</p>
              {nextSessionNote && (
                <>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.13em] text-[var(--info)]">
                    Para a próxima conversa
                  </p>
                  <p className="mt-2 text-sm">{nextSessionNote}</p>
                </>
              )}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setMode("editing")}>
                Rever seleção
              </Button>
              <Button onClick={() => setMode("shared")}>
                <ShieldCheck className="size-4" />
                {t.confirm as string}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-7 flex items-center justify-between gap-4">
        <Badge tone="accent">
          <LockKeyhole className="mr-1.5 size-3.5" />
          {t.privateDefault as string}
        </Badge>
        <span className="text-xs font-semibold text-[var(--muted-foreground)]">
          {stage + 1} / 5
        </span>
      </div>

      <div className="mb-8 grid grid-cols-5 gap-2" aria-label="Progresso">
        {(t.stages as string[]).map((label, index) => (
          <div key={label}>
            <div
              className={cn(
                "h-1.5 rounded-full transition-colors",
                index <= stage ? "bg-[var(--primary)]" : "bg-[var(--muted)]",
              )}
            />
            <p
              className={cn(
                "mt-2 hidden text-[10px] font-semibold sm:block",
                index === stage
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)]",
              )}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-5 sm:p-8 lg:p-10">
          {stage === 0 && (
            <>
              <div className="rounded-3xl bg-[var(--pastel-lilac)] p-5 sm:flex sm:items-start sm:gap-4">
                <Sparkles className="size-5 shrink-0 text-[var(--primary)]" />
                <div className="mt-3 sm:mt-0">
                  <h2 className="text-xl font-bold">
                    {t.introTitle as string}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
                    {t.intro as string}
                  </p>
                </div>
              </div>

              <p className="mt-7 text-xs font-semibold text-[var(--muted-foreground)]">
                {t.selectHint as string}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {loadOptions.map((option) => {
                  const Icon = option.icon;
                  const active = loads.some((item) => item.id === option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleLoad(option)}
                      className={cn(
                        "group min-h-32 rounded-3xl border p-4 text-left transition-all",
                        active
                          ? "border-[var(--primary)] bg-[var(--surface)] shadow-[0_12px_35px_rgba(104,72,198,.13)]"
                          : "border-transparent bg-[var(--background)] hover:-translate-y-1 hover:border-[var(--border)]",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-10 place-items-center rounded-2xl",
                          option.tone,
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="mt-4 block text-xs font-bold leading-5">
                        {option.labels[locale]}
                      </span>
                      {active && (
                        <Check className="mt-2 size-4 text-[var(--primary)]" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-7 rounded-3xl border border-dashed border-[var(--border)] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
                    {t.selected as string} · {loads.length}/6
                  </p>
                  {loads.length === 0 && (
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {t.tableEmpty as string}
                    </span>
                  )}
                </div>
                {loads.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {loads.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => {
                          const option = loadById.get(item.id);
                          if (option) toggleLoad(option);
                        }}
                        className="rounded-full bg-[var(--muted)] px-3 py-2 text-xs font-semibold hover:bg-[var(--accent-soft)]"
                      >
                        {item.label} <span aria-hidden="true">×</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {stage === 1 && (
            <>
              <h2 className="text-2xl font-bold tracking-[-0.04em]">
                {t.intensityTitle as string}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
                {t.intensityBody as string}
              </p>
              <div className="mt-7 space-y-3">
                {loads.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-4 rounded-3xl bg-[var(--background)] p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <p className="text-sm font-bold">{item.label}</p>
                    <div
                      className="grid grid-cols-3 gap-2"
                      aria-label={item.label}
                    >
                      {(t.intensityLabels as string[]).map((label, index) => (
                        <button
                          type="button"
                          key={label}
                          aria-pressed={item.intensity === index + 1}
                          onClick={() =>
                            updateLoad(item.id, {
                              intensity: (index + 1) as 1 | 2 | 3,
                            })
                          }
                          className={cn(
                            "min-h-10 rounded-full px-3 text-[11px] font-bold transition-colors",
                            item.intensity === index + 1
                              ? "bg-[var(--primary)] text-white"
                              : "bg-[var(--surface)] text-[var(--muted-foreground)]",
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 border-t border-[var(--border)] pt-7">
                <h3 className="text-lg font-bold">
                  {t.effectsTitle as string}
                </h3>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {t.effectsBody as string}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(t.effects as string[]).map((effect) => {
                    const active = effects.includes(effect);
                    return (
                      <button
                        type="button"
                        key={effect}
                        aria-pressed={active}
                        onClick={() =>
                          setEffects((current) =>
                            active
                              ? current.filter((item) => item !== effect)
                              : current.length < 5
                                ? [...current, effect]
                                : current,
                          )
                        }
                        className={cn(
                          "min-h-11 rounded-full border px-4 text-sm font-semibold",
                          active
                            ? "border-[var(--info)] bg-[var(--info-soft)] text-[var(--info)]"
                            : "border-[var(--border)] bg-[var(--surface)]",
                        )}
                      >
                        {active && <Check className="mr-1.5 inline size-3.5" />}
                        {effect}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {stage === 2 && (
            <>
              <h2 className="text-2xl font-bold tracking-[-0.04em]">
                {t.ownershipTitle as string}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
                {t.ownershipBody as string}
              </p>
              <div className="mt-7 space-y-5">
                {loads.map((item) => (
                  <fieldset key={item.id}>
                    <legend className="mb-3 text-sm font-bold">
                      {item.label}
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {ownershipKeys.map((key) => {
                        const [title, description] = (
                          t.ownership as Record<Ownership, string[]>
                        )[key];
                        return (
                          <Choice
                            key={key}
                            active={item.ownership === key}
                            title={title}
                            description={description}
                            onClick={() =>
                              updateLoad(item.id, { ownership: key })
                            }
                          />
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
            </>
          )}

          {stage === 3 && (
            <>
              <h2 className="text-2xl font-bold tracking-[-0.04em]">
                {t.movementTitle as string}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
                {t.movementBody as string}
              </p>
              <div className="mt-7 space-y-5">
                {loads.map((item) => (
                  <fieldset key={item.id}>
                    <legend className="mb-3 text-sm font-bold">
                      {item.label}
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                      {movementKeys.map((key) => {
                        const [title, description] = (
                          t.movements as Record<Movement, string[]>
                        )[key];
                        return (
                          <Choice
                            key={key}
                            active={item.movement === key}
                            title={title}
                            description={description}
                            onClick={() =>
                              updateLoad(item.id, { movement: key })
                            }
                          />
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
              <fieldset className="mt-8 border-t border-[var(--border)] pt-7">
                <legend className="text-lg font-bold">
                  {t.supportTitle as string}
                </legend>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(t.supports as string[]).map((item) => (
                    <button
                      type="button"
                      key={item}
                      aria-pressed={support === item}
                      onClick={() => setSupport(item)}
                      className={cn(
                        "min-h-11 rounded-full border px-4 text-sm font-semibold",
                        support === item
                          ? "border-[var(--primary)] bg-[var(--pastel-lilac)] text-[var(--primary-strong)]"
                          : "border-[var(--border)] bg-[var(--surface)]",
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </fieldset>
            </>
          )}

          {stage === 4 && (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-[-0.045em]">
                    {t.mapTitle as string}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
                    {t.mapBody as string}
                  </p>
                </div>
                <Badge tone="info">{loads.length} cargas observadas</Badge>
              </div>

              <div className="mt-7 grid gap-3 md:grid-cols-2">
                {loads.map((item) => {
                  const option = loadById.get(item.id);
                  const Icon = option?.icon ?? Scale;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      aria-pressed={item.includeInShare}
                      onClick={() =>
                        updateLoad(item.id, {
                          includeInShare: !item.includeInShare,
                        })
                      }
                      className={cn(
                        "relative overflow-hidden rounded-3xl border p-5 text-left transition-all",
                        item.includeInShare
                          ? "border-[var(--primary)] bg-[var(--surface)]"
                          : "border-[var(--border)] bg-[var(--background)] opacity-65",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute inset-y-0 left-0 w-1.5",
                          item.intensity === 3
                            ? "bg-[var(--accent)]"
                            : item.intensity === 2
                              ? "bg-[var(--primary)]"
                              : "bg-[var(--info)]",
                        )}
                      />
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            "grid size-11 shrink-0 place-items-center rounded-2xl",
                            option?.tone,
                          )}
                        >
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold">{item.label}</p>
                            <span
                              className={cn(
                                "grid size-6 shrink-0 place-items-center rounded-full border",
                                item.includeInShare
                                  ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                                  : "border-[var(--border)]",
                              )}
                            >
                              {item.includeInShare && (
                                <Check className="size-3.5" />
                              )}
                            </span>
                          </div>
                          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                            {
                              (t.ownership as Record<Ownership, string[]>)[
                                item.ownership!
                              ][0]
                            }{" "}
                            <ChevronRight className="mx-1 inline size-3" />{" "}
                            {
                              (t.movements as Record<Movement, string[]>)[
                                item.movement!
                              ][0]
                            }
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <label className="mt-7 block">
                <span className="text-sm font-bold">
                  {t.optionalNote as string}
                </span>
                <Textarea
                  value={nextSessionNote}
                  onChange={(event) => setNextSessionNote(event.target.value)}
                  maxLength={280}
                  placeholder={t.notePlaceholder as string}
                  className="mt-3 min-h-24"
                />
                <span className="mt-1 block text-right text-[10px] text-[var(--muted-foreground)]">
                  {nextSessionNote.length}/280
                </span>
              </label>

              {mode === "saved" && (
                <p
                  role="status"
                  className="mt-5 rounded-2xl bg-[var(--success-soft)] p-4 text-sm leading-6 text-[var(--success)]"
                >
                  {t.saved as string}
                </p>
              )}
            </>
          )}

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-2xl bg-[color-mix(in_srgb,var(--destructive)_12%,white)] p-4 text-sm text-[var(--destructive)]"
            >
              {error}
            </p>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-between">
            {stage > 0 ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setStage((current) => current - 1);
                  setError(null);
                }}
              >
                <ArrowLeft className="size-4" />
                {t.back as string}
              </Button>
            ) : (
              <Button variant="ghost" onClick={reset}>
                <Trash2 className="size-4" />
                {t.discard as string}
              </Button>
            )}

            {stage < 4 ? (
              <Button onClick={advance}>
                {t.continue as string}
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="secondary" onClick={() => setMode("saved")}>
                  <LockKeyhole className="size-4" />
                  {t.privateSave as string}
                </Button>
                <Button onClick={prepareShare}>
                  <Eye className="size-4" />
                  {t.prepareShare as string}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
