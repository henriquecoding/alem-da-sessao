"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
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
import { getToolBySlug } from "@alem-da-sessao/tool-registry";
import { renderSessionInventoryConstellation } from "@alem-da-sessao/tool-registry/artifact";
import { Arrival } from "@/components/experience-runtime/arrival";
import { ArtifactView } from "@/components/experience-runtime/artifact-view";
import {
  Destination,
  type DestinationChoice,
} from "@/components/experience-runtime/destination";
import { ShareGesture } from "@/components/experience-runtime/share-gesture";
import { ShareReceipt } from "@/components/experience-runtime/share-receipt";
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

export function SessionInventoryExperience({
  locale,
  /** `guest` corre a porta A: sem conta, sem persistência (§4.10). */
  audience = "guest",
}: {
  locale: Locale;
  audience?: "guest" | "account";
}) {
  const t = copy[locale];
  const [stage, setStage] = useState(0);
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [note, setNote] = useState("");
  // O ritual de cinco tempos do §7.2. "arrival" e "forming" são os dois que o
  // mercado inteiro salta, e são os que fazem isto ser um lugar.
  const [mode, setMode] = useState<
    | "arrival"
    | "editing"
    | "saved"
    | "forming"
    | "sharing"
    | "done"
    | "discarded"
  >("arrival");
  const [error, setError] = useState(false);
  /** Momento da travessia, para o recibo do §4.5. */
  const [sharedAt, setSharedAt] = useState<Date | null>(null);

  const manifest = getToolBySlug("inventario-da-sessao")!;

  /**
   * O artefacto. Determinístico por construção: a mesma seleção produz sempre
   * a mesma constelação, o que permite compará-la entre sessões (§4.1).
   *
   * `createdAt` entra congelado no primeiro render da formação em vez de ser
   * lido a cada render — se viesse do relógio a cada passagem, o artefacto
   * deixaria de ser reproduzível.
   */
  const [formedAt] = useState(() => new Date().toISOString());

  const artifactSvg = useMemo(() => {
    const complete = fragments.filter((item) => item.state && item.destination);
    if (!complete.length) return null;

    return renderSessionInventoryConstellation(
      {
        fragments: complete.map((item) => ({
          id: item.id,
          label: item.label,
          state: item.state!,
          destination: item.destination!,
        })),
      },
      {
        toolId: manifest.id,
        toolVersion: manifest.version,
        locale,
        createdAt: formedAt,
      },
    );
  }, [fragments, formedAt, locale, manifest.id, manifest.version]);

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
    setMode("arrival");
    setError(false);
  }

  function chooseDestination(choice: DestinationChoice) {
    if (choice === "discard") {
      // "Descartar sem rasto" tem de ser literal: o estado desaparece da
      // memória no mesmo gesto, não fica à espera de um pedido ao servidor.
      setFragments([]);
      setNote("");
      setStage(0);
      setMode("discarded");
      return;
    }
    if (choice === "share") {
      setMode("sharing");
      return;
    }
    // "download" e "account" ficam na formação: o objeto já está no ecrã e o
    // descarregamento acontece sem sair da página.
    setMode("saved");
  }

  // ---------------------------------------------------------------------
  // Tempo 1 — Chegada (§7.2). Antes de qualquer campo.
  // ---------------------------------------------------------------------
  if (mode === "arrival") {
    return (
      <Arrival
        manifest={manifest}
        locale={locale}
        onBegin={
          <Button
            size="lg"
            className="w-fit"
            onClick={() => setMode("editing")}
          >
            {locale === "pt-PT" ? "Começar" : "Começar"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        }
      />
    );
  }

  // ---------------------------------------------------------------------
  // Tempo 3 — Formação, e tempo 5 — Destino (§7.2).
  // ---------------------------------------------------------------------
  if (mode === "forming" && artifactSvg) {
    return (
      <div className="mx-auto max-w-4xl">
        <p className="enter font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--accent-foreground)]">
          {locale === "pt-PT" ? "O que ficou" : "O que ficou"}
        </p>
        <h2
          className="enter mt-3 text-balance text-3xl font-bold tracking-[-0.045em]"
          style={{ "--d": 1 } as CSSProperties}
        >
          {locale === "pt-PT"
            ? "Isto é o seu inventário."
            : "Isso é o seu inventário."}
        </h2>
        <p
          className="enter mt-3 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]"
          style={{ "--d": 2 } as CSSProperties}
        >
          {locale === "pt-PT"
            ? "Cada ponto é um fragmento que escolheu. Os traços ligam os que vão para o mesmo lugar. Nada aqui é uma nota."
            : "Cada ponto é um fragmento que você escolheu. Os traços ligam os que vão para o mesmo lugar. Nada aqui é uma nota."}
        </p>

        <ArtifactView
          className="mt-9"
          svg={artifactSvg}
          locale={locale}
          fileName={`inventario-da-sessao-${formedAt.slice(0, 10)}`}
        />

        <Destination
          className="mt-12"
          locale={locale}
          mode={audience}
          onChoose={chooseDestination}
        />
      </div>
    );
  }

  if (mode === "discarded") {
    return (
      <Card className="enter-scale mx-auto max-w-2xl">
        <CardContent className="flex min-h-[380px] flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-bold tracking-[-0.04em]">
            {locale === "pt-PT" ? "Não ficou nada." : "Não ficou nada."}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-[var(--muted-foreground)]">
            {locale === "pt-PT"
              ? "O que escreveu desapareceu deste navegador e nunca chegou a sair dele."
              : "O que você escreveu desapareceu deste navegador e nunca chegou a sair dele."}
          </p>
          <Button className="mt-8" variant="secondary" onClick={reset}>
            <RotateCcw className="size-4" />
            {t.restart as string}
          </Button>
        </CardContent>
      </Card>
    );
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

          {/* §4.5, quinto momento: o recibo. Uma confirmação diz que o sistema
              funcionou; um recibo diz o que aconteceu com uma coisa da pessoa. */}
          {sharedAt && (
            <ShareReceipt
              className="animate-crossing mt-7 w-full max-w-md text-left"
              locale={locale}
              sharedAt={sharedAt}
              recipientName="Dra. Inês Almeida"
            />
          )}

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

            {/* §4.5, segundo momento: uma linha humana antes do gesto. Diz
                exatamente quem vê, o que vê, e o que continua a ser da pessoa. */}
            <p className="bg-[var(--muted)]/50 mt-5 rounded-2xl border border-[var(--border)] p-4 text-sm leading-6">
              {locale === "pt-PT"
                ? "A Dra. Inês Almeida vai ver isto, e só isto. Continua a poder editar a sua versão — o que ela recebe não muda."
                : "A Dra. Inês Almeida vai ver isso, e só isso. Você continua podendo editar a sua versão — o que ela recebe não muda."}
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
            {/* §4.5, terceiro e quarto momentos: um gesto deliberado, com
                alternativa por botão e teclado (WCAG 2.2 SC 2.5.7), e a
                travessia como retorno visual em vez de um toast verde. */}
            <div className="mt-8 border-t border-[var(--border)] pt-6">
              <p className="mb-4 text-sm font-semibold">
                {locale === "pt-PT"
                  ? "Leve isto até à Dra. Inês."
                  : "Leve isso até a Dra. Inês."}
              </p>
              <ShareGesture
                locale={locale}
                recipientName="Inês Almeida"
                disabled={shared.length === 0}
                onCrossed={() => {
                  setSharedAt(new Date());
                  setMode("done");
                }}
              />
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
              // O trabalho acaba na Formação, nunca directamente na partilha.
              // A pessoa vê o objeto que fez antes de decidir o destino dele —
              // é a diferença entre escolher e ser encaminhada (§7.2).
              <Button onClick={() => setMode("forming")}>
                {locale === "pt-PT" ? "Ver o que ficou" : "Ver o que ficou"}
                <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
