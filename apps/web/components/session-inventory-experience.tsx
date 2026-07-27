"use client";

import { useState, type CSSProperties } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  Eye,
  Lightbulb,
  LockKeyhole,
  MessageSquareText,
  Pause,
  RotateCcw,
  Sparkles,
  Target,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Locale } from "@alem-da-sessao/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type StateKey = "clear" | "alive" | "confused" | "slow";
type DestinationKey = "revisit" | "observe" | "practice" | "leave";

type Fragment = {
  id: string;
  label: string;
  icon: LucideIcon;
  tone: string;
  state?: StateKey;
  destination?: DestinationKey;
  share: boolean;
};

const copy = {
  "pt-PT": {
    stages: ["Pousar", "Nomear", "Ordenar", "Levar"],
    title: "O que ficou consigo depois da sessão?",
    intro:
      "Não precisa de reconstruir toda a conversa. Escolha apenas os fragmentos que continuaram presentes.",
    options: [
      ["clear", "Algo ficou mais claro", Lightbulb, "bg-[var(--pastel-lemon)]"],
      ["question", "Ficou uma pergunta", CircleHelp, "bg-[var(--pastel-blue)]"],
      ["feeling", "Uma emoção continuou", Waves, "bg-[var(--pastel-pink)]"],
      [
        "phrase",
        "Uma frase regressou",
        MessageSquareText,
        "bg-[var(--pastel-lilac)]",
      ],
      ["silence", "Um silêncio teve peso", Pause, "bg-[var(--pastel-peach)]"],
      ["intention", "Nasceu uma intenção", Target, "bg-[var(--pastel-aqua)]"],
    ] as const,
    choose: "Escolha entre um e cinco fragmentos",
    statesTitle: "Como cada fragmento está agora?",
    states: {
      clear: ["Assentou", "Consigo reconhecê-lo sem urgência"],
      alive: ["Continua vivo", "Volta durante o dia"],
      confused: ["Ficou confuso", "Ainda não consigo organizá-lo"],
      slow: ["Precisa de tempo", "Não quero apressar uma conclusão"],
    },
    destinationsTitle: "Onde quer colocar cada fragmento?",
    destinations: {
      revisit: ["Revisitar na sessão", "Quero voltar a isto com apoio"],
      observe: ["Observar entretanto", "Quero notar quando reaparece"],
      practice: ["Experimentar algo", "Quero testar um pequeno movimento"],
      leave: ["Deixar assentar", "Não precisa de ação agora"],
    },
    boardTitle: "O seu inventário de continuidade",
    boardBody:
      "Toque nos cartões para decidir o que incluir numa eventual partilha. O inventário privado permanece seu.",
    note: "Uma frase de abertura para a próxima sessão — opcional",
    notePlaceholder:
      "Ex.: há uma pergunta da última sessão a que quero regressar.",
    private: "Privado por defeito",
    next: "Continuar",
    back: "Voltar",
    save: "Guardar só para mim",
    share: "Preparar partilha",
    saved: "Guardado apenas em memória nesta demonstração local.",
    preview: "Pré-visualização da partilha",
    previewBody:
      "Esta é a seleção exata que o profissional receberia, sem o restante inventário.",
    confirm: "Confirmar snapshot",
    done: "Inventário preparado",
    doneBody:
      "O snapshot de demonstração foi criado sem enviar dados. A experiência pode agora servir de ponto de partida para a conversa.",
    restart: "Fazer novo inventário",
    error: "Complete as escolhas desta etapa para continuar.",
  },
  "pt-BR": {
    stages: ["Pousar", "Nomear", "Ordenar", "Levar"],
    title: "O que ficou com você depois da sessão?",
    intro:
      "Você não precisa reconstruir toda a conversa. Escolha apenas os fragmentos que continuaram presentes.",
    options: [
      ["clear", "Algo ficou mais claro", Lightbulb, "bg-[var(--pastel-lemon)]"],
      ["question", "Ficou uma pergunta", CircleHelp, "bg-[var(--pastel-blue)]"],
      ["feeling", "Uma emoção continuou", Waves, "bg-[var(--pastel-pink)]"],
      [
        "phrase",
        "Uma frase voltou",
        MessageSquareText,
        "bg-[var(--pastel-lilac)]",
      ],
      ["silence", "Um silêncio teve peso", Pause, "bg-[var(--pastel-peach)]"],
      ["intention", "Nasceu uma intenção", Target, "bg-[var(--pastel-aqua)]"],
    ] as const,
    choose: "Escolha entre um e cinco fragmentos",
    statesTitle: "Como cada fragmento está agora?",
    states: {
      clear: ["Assentou", "Consigo reconhecê-lo sem urgência"],
      alive: ["Continua vivo", "Volta durante o dia"],
      confused: ["Ficou confuso", "Ainda não consigo organizá-lo"],
      slow: ["Precisa de tempo", "Não quero apressar uma conclusão"],
    },
    destinationsTitle: "Onde você quer colocar cada fragmento?",
    destinations: {
      revisit: ["Revisitar na sessão", "Quero voltar a isso com apoio"],
      observe: ["Observar enquanto isso", "Quero notar quando reaparece"],
      practice: ["Experimentar algo", "Quero testar um pequeno movimento"],
      leave: ["Deixar assentar", "Não precisa de ação agora"],
    },
    boardTitle: "Seu inventário de continuidade",
    boardBody:
      "Toque nos cartões para decidir o que incluir em um possível compartilhamento. O inventário privado continua sendo seu.",
    note: "Uma frase de abertura para a próxima sessão — opcional",
    notePlaceholder:
      "Ex.: há uma pergunta da última sessão a que quero voltar.",
    private: "Privado por padrão",
    next: "Continuar",
    back: "Voltar",
    save: "Salvar só para mim",
    share: "Preparar compartilhamento",
    saved: "Salvo apenas em memória nesta demonstração local.",
    preview: "Prévia do compartilhamento",
    previewBody:
      "Esta é a seleção exata que o profissional receberia, sem o restante do inventário.",
    confirm: "Confirmar snapshot",
    done: "Inventário preparado",
    doneBody:
      "O snapshot de demonstração foi criado sem enviar dados. A experiência pode agora servir de ponto de partida para a conversa.",
    restart: "Fazer novo inventário",
    error: "Complete as escolhas desta etapa para continuar.",
  },
} satisfies Record<Locale, Record<string, unknown>>;

const stateKeys: StateKey[] = ["clear", "alive", "confused", "slow"];
const destinationKeys: DestinationKey[] = [
  "revisit",
  "observe",
  "practice",
  "leave",
];

export function SessionInventoryExperience({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [stage, setStage] = useState(0);
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<"editing" | "saved" | "sharing" | "done">(
    "editing",
  );
  const [error, setError] = useState(false);

  function toggleOption(option: (typeof t.options)[number]) {
    const [id, label, icon, tone] = option;
    setFragments((current) => {
      if (current.some((item) => item.id === id)) {
        return current.filter((item) => item.id !== id);
      }
      if (current.length >= 5) return current;
      return [...current, { id, label, icon, tone, share: true }];
    });
    setError(false);
  }

  function updateFragment(id: string, patch: Partial<Fragment>) {
    setFragments((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
    setError(false);
  }

  function advance() {
    const valid =
      (stage === 0 && fragments.length > 0) ||
      (stage === 1 && fragments.every((item) => item.state)) ||
      (stage === 2 && fragments.every((item) => item.destination));
    if (!valid) {
      setError(true);
      return;
    }
    setStage((current) => Math.min(3, current + 1));
  }

  function reset() {
    setStage(0);
    setFragments([]);
    setNote("");
    setMode("editing");
    setError(false);
  }

  if (mode === "done") {
    return (
      <Card className="enter-scale mx-auto max-w-2xl">
        <CardContent className="flex min-h-[480px] flex-col items-center justify-center p-8 text-center">
          <span className="animate-pop relative grid size-16 place-items-center rounded-3xl bg-[var(--pastel-lilac)] text-[var(--primary)]">
            <span
              aria-hidden="true"
              className="animate-breathe absolute -inset-3 -z-10 rounded-[1.6rem] bg-[var(--pastel-lilac)] blur-xl"
            />
            <Check className="size-7" />
          </span>
          <h2
            className="enter mt-7 text-3xl font-bold tracking-[-0.045em]"
            style={{ "--d": 1 } as CSSProperties}
          >
            {t.done as string}
          </h2>
          <p
            className="enter mt-4 max-w-md text-sm leading-7 text-[var(--muted-foreground)]"
            style={{ "--d": 2 } as CSSProperties}
          >
            {t.doneBody as string}
          </p>
          <div className="enter mt-8" style={{ "--d": 3 } as CSSProperties}>
            <Button onClick={reset}>
              <RotateCcw className="size-4" />
              {t.restart as string}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mode === "sharing") {
    const shared = fragments.filter((item) => item.share);
    return (
      <div className="mx-auto max-w-3xl">
        <Button variant="ghost" onClick={() => setMode("editing")}>
          <ArrowLeft className="size-4" />
          {t.back as string}
        </Button>
        <Card className="animate-sheet-in mt-3">
          <CardContent className="p-6 sm:p-9">
            <h2 className="text-2xl font-bold">{t.preview as string}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {t.previewBody as string}
            </p>
            <div className="mt-7 space-y-3">
              {shared.map((fragment, index) => (
                <div
                  key={fragment.id}
                  className="enter flex gap-4 rounded-3xl bg-[var(--background)] p-4"
                  style={{ "--d": index + 1 } as CSSProperties}
                >
                  <span
                    className={cn(
                      "grid size-11 shrink-0 place-items-center rounded-2xl",
                      fragment.tone,
                    )}
                  >
                    <fragment.icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">{fragment.label}</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      {
                        (t.states as Record<StateKey, string[]>)[
                          fragment.state!
                        ][0]
                      }{" "}
                      ·{" "}
                      {
                        (t.destinations as Record<DestinationKey, string[]>)[
                          fragment.destination!
                        ][0]
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {note && (
              <div className="mt-5 rounded-3xl bg-[var(--pastel-blue)] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--info)]">
                  Para abrir a próxima conversa
                </p>
                <p className="mt-2 text-sm">{note}</p>
              </div>
            )}
            <div className="mt-7 flex justify-end">
              <Button
                disabled={shared.length === 0}
                onClick={() => setMode("done")}
              >
                <Eye className="size-4" />
                {t.confirm as string}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-7 flex items-center justify-between">
        <Badge tone="accent">
          <LockKeyhole className="mr-1.5 size-3.5" />
          {t.private as string}
        </Badge>
        <span className="tabular text-xs font-semibold text-[var(--muted-foreground)]">
          {stage + 1} / 4
        </span>
      </div>
      <div className="mb-7 grid grid-cols-4 gap-2">
        {(t.stages as string[]).map((label, index) => (
          <div key={label}>
            {/* The segment fills from its left edge rather than snapping
                between two background colours. */}
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--muted)]">
              <div
                className={cn(
                  "ease-(--ease-out-quint) h-full origin-left rounded-full bg-[var(--primary)] transition-transform duration-500",
                  index <= stage ? "scale-x-100" : "scale-x-0",
                )}
                style={{ transitionDelay: `${index * 60}ms` }}
              />
            </div>
            <p
              className={cn(
                "mt-2 hidden text-[10px] font-semibold transition-colors duration-500 sm:block",
                index <= stage
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)]",
              )}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      <Card>
        {/* Keyed on the stage so each step animates in as its own sheet. */}
        <CardContent key={stage} className="animate-sheet-in p-5 sm:p-8">
          {stage === 0 && (
            <>
              <div className="rounded-3xl bg-[var(--pastel-blue)] p-5">
                <Sparkles className="size-5 text-[var(--info)]" />
                <h2 className="mt-4 text-2xl font-bold tracking-[-0.04em]">
                  {t.title as string}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
                  {t.intro as string}
                </p>
              </div>
              <p className="mt-6 text-xs font-semibold text-[var(--muted-foreground)]">
                {t.choose as string}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {t.options.map((option) => {
                  const [id, label, Icon, tone] = option;
                  const active = fragments.some((item) => item.id === id);
                  return (
                    <button
                      type="button"
                      key={id}
                      aria-pressed={active}
                      onClick={() => toggleOption(option)}
                      className={cn(
                        "group/option relative min-h-32 rounded-3xl border p-4 text-left outline-none",
                        "ease-(--ease-out-quint) transition-[border-color,background-color,box-shadow,transform] duration-300",
                        "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
                        active
                          ? "-translate-y-0.5 border-[var(--primary)] bg-[var(--surface)] shadow-[0_12px_35px_rgba(104,72,198,.14)]"
                          : "border-transparent bg-[var(--background)] hover:-translate-y-1 hover:border-[var(--border)] hover:shadow-[var(--shadow-sm)]",
                      )}
                    >
                      {/* Absolutely positioned so selecting a fragment does
                          not reflow the card it sits in. */}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "ease-(--ease-spring) absolute right-3 top-3 grid size-6 place-items-center rounded-full bg-[var(--primary)] text-white transition-all duration-300",
                          active
                            ? "scale-100 opacity-100"
                            : "scale-50 opacity-0",
                        )}
                      >
                        <Check className="size-3.5" />
                      </span>
                      <span
                        className={cn(
                          "ease-(--ease-spring) grid size-10 place-items-center rounded-2xl transition-transform duration-500 group-hover/option:scale-110",
                          tone,
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="mt-4 block text-sm font-bold">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {stage === 1 && (
            <>
              <h2 className="text-2xl font-bold">{t.statesTitle as string}</h2>
              <div className="mt-7 space-y-6">
                {fragments.map((fragment) => (
                  <fieldset key={fragment.id}>
                    <legend className="mb-3 text-sm font-bold">
                      {fragment.label}
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {stateKeys.map((key) => {
                        const [title, description] = (
                          t.states as Record<StateKey, string[]>
                        )[key];
                        return (
                          <button
                            type="button"
                            key={key}
                            aria-pressed={fragment.state === key}
                            onClick={() =>
                              updateFragment(fragment.id, { state: key })
                            }
                            className={cn(
                              "rounded-2xl border p-3 text-left outline-none",
                              "duration-250 ease-(--ease-out-quint) transition-[border-color,background-color,transform,box-shadow]",
                              "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
                              fragment.state === key
                                ? "border-[var(--primary)] bg-[var(--pastel-lilac)] shadow-[var(--shadow-sm)]"
                                : "hover:bg-[var(--muted)]/50 border-[var(--border)] hover:-translate-y-0.5 hover:border-[var(--border-strong)]",
                            )}
                          >
                            <span className="block text-sm font-bold">
                              {title}
                            </span>
                            <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                              {description}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
            </>
          )}

          {stage === 2 && (
            <>
              <h2 className="text-2xl font-bold">
                {t.destinationsTitle as string}
              </h2>
              <div className="mt-7 space-y-6">
                {fragments.map((fragment) => (
                  <fieldset key={fragment.id}>
                    <legend className="mb-3 text-sm font-bold">
                      {fragment.label}
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {destinationKeys.map((key) => {
                        const [title, description] = (
                          t.destinations as Record<DestinationKey, string[]>
                        )[key];
                        return (
                          <button
                            type="button"
                            key={key}
                            aria-pressed={fragment.destination === key}
                            onClick={() =>
                              updateFragment(fragment.id, { destination: key })
                            }
                            className={cn(
                              "rounded-2xl border p-3 text-left outline-none",
                              "duration-250 ease-(--ease-out-quint) transition-[border-color,background-color,transform,box-shadow]",
                              "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
                              fragment.destination === key
                                ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-[var(--shadow-sm)]"
                                : "hover:bg-[var(--muted)]/50 border-[var(--border)] hover:-translate-y-0.5 hover:border-[var(--border-strong)]",
                            )}
                          >
                            <span className="block text-sm font-bold">
                              {title}
                            </span>
                            <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                              {description}
                            </span>
                          </button>
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
              <h2 className="text-3xl font-bold tracking-[-0.045em]">
                {t.boardTitle as string}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
                {t.boardBody as string}
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {fragments.map((fragment) => (
                  <button
                    type="button"
                    key={fragment.id}
                    aria-pressed={fragment.share}
                    onClick={() =>
                      updateFragment(fragment.id, { share: !fragment.share })
                    }
                    className={cn(
                      "flex gap-4 rounded-3xl border p-4 text-left outline-none",
                      "ease-(--ease-out-quint) transition-[border-color,background-color,opacity,box-shadow] duration-300",
                      "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
                      fragment.share
                        ? "border-[var(--primary)] bg-[var(--surface)] shadow-[var(--shadow-sm)]"
                        : "border-[var(--border)] bg-[var(--background)] opacity-60 hover:opacity-85",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-11 shrink-0 place-items-center rounded-2xl",
                        fragment.tone,
                      )}
                    >
                      <fragment.icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold">{fragment.label}</p>
                        <span
                          aria-hidden="true"
                          className={cn(
                            "grid size-6 shrink-0 place-items-center rounded-full border transition-colors duration-300",
                            fragment.share
                              ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                              : "border-[var(--border)]",
                          )}
                        >
                          <Check
                            className={cn(
                              "ease-(--ease-spring) size-3.5 transition-transform duration-300",
                              fragment.share ? "scale-100" : "scale-0",
                            )}
                          />
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                        {
                          (t.states as Record<StateKey, string[]>)[
                            fragment.state!
                          ][0]
                        }{" "}
                        ·{" "}
                        {
                          (t.destinations as Record<DestinationKey, string[]>)[
                            fragment.destination!
                          ][0]
                        }
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <label className="mt-7 block">
                <span className="text-sm font-bold">{t.note as string}</span>
                <Textarea
                  className="mt-3 min-h-24"
                  value={note}
                  maxLength={280}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder={t.notePlaceholder as string}
                />
              </label>
              {mode === "saved" && (
                <p className="enter mt-5 rounded-2xl bg-[var(--success-soft)] p-4 text-sm font-medium text-[var(--success)]">
                  {t.saved as string}
                </p>
              )}
            </>
          )}

          {error && (
            <p
              role="alert"
              className="enter mt-5 rounded-2xl bg-[var(--destructive-soft)] p-4 text-sm font-medium text-[var(--destructive)]"
            >
              {t.error as string}
            </p>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-between">
            <Button
              variant="secondary"
              disabled={stage === 0}
              onClick={() => {
                setStage((current) => Math.max(0, current - 1));
                setError(false);
              }}
            >
              <ArrowLeft className="size-4" />
              {t.back as string}
            </Button>
            {stage < 3 ? (
              <Button onClick={advance}>
                {t.next as string}
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="secondary" onClick={() => setMode("saved")}>
                  <LockKeyhole className="size-4" />
                  {t.save as string}
                </Button>
                <Button
                  disabled={!fragments.some((fragment) => fragment.share)}
                  onClick={() => setMode("sharing")}
                >
                  <Eye className="size-4" />
                  {t.share as string}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
