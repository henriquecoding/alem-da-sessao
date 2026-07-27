"use client";

import { useState, type CSSProperties } from "react";
import { ArrowLeftToLine, ArrowRightToLine, Check } from "lucide-react";
import type {
  BridgeDirection,
  CareInterval,
} from "@alem-da-sessao/db/intervals";
import type { Locale } from "@alem-da-sessao/i18n";
import { voice } from "@alem-da-sessao/i18n/voice";
import { SensitivityTag } from "@/components/sensitivity";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * A Ponte de Sessão bidirecional — relatório v2 §4.3.
 *
 * **Construa isto primeiro.** Três linhas de evidência convergem exatamente
 * aqui:
 *
 * 1. **Memória** — a recordação do conteúdo da sessão prediz adesão e
 *    desfecho. A ponte de saída é consolidação de memória disfarçada de gesto
 *    simples.
 * 2. **Congruência** — a congruência entre o que o paciente leva da sessão e
 *    o conteúdo da tarefa prediz adesão. Saber o que o cliente entendeu é o
 *    que torna a atribuição eficaz.
 * 3. **Feedback** — d = 0,15 no desfecho; abandono de 24,5% para 20,9%.
 *
 * E resolve o risco de adoção: a Ponte **não depende de o profissional
 * atribuir nada**. Se a resposta à questão do Quenza (§2) for "psicólogos não
 * atribuem", a Ponte continua a funcionar. É a única peça do produto robusta
 * às duas respostas possíveis.
 *
 * **Regra inegociável:** o profissional não vê que existe uma ponte se ela não
 * for partilhada. Nunca "o cliente escreveu algo mas não partilhou" — isso é
 * vigilância. Por isso o estado partilhado vive no cliente e a projeção
 * profissional (`toProfessionalView`) nem sequer transporta a informação.
 */

const copy = {
  "pt-PT": {
    outgoing: {
      eyebrow: "Ponte de saída",
      title: "O que ficou de hoje?",
      hint: "Três a cinco linhas, nas suas palavras. Não é um resumo da sessão — é o que continuou consigo depois de sair.",
      placeholder:
        "Ex.: fiquei com a ideia de que peço autorização para descansar.",
    },
    incoming: {
      eyebrow: "Ponte de entrada",
      title: "O que quer levar?",
      hint: "Uma frase chega. É o que quer que esteja em cima da mesa quando a próxima conversa começar.",
      placeholder: "Ex.: quero voltar àquela pergunta que ficou por responder.",
    },
    save: "Guardar só para mim",
    share: "Levar à próxima sessão",
    saved: "Guardado às",
    sharedTag: "Vai com a próxima sessão",
    closed: "Esta ponte já fechou. O que escreveu continua seu.",
  },
  "pt-BR": {
    outgoing: {
      eyebrow: "Ponte de saída",
      title: "O que ficou de hoje?",
      hint: "Três a cinco linhas, nas suas palavras. Não é um resumo da sessão — é o que continuou com você depois de sair.",
      placeholder:
        "Ex.: fiquei com a ideia de que peço autorização para descansar.",
    },
    incoming: {
      eyebrow: "Ponte de entrada",
      title: "O que você quer levar?",
      hint: "Uma frase basta. É o que você quer que esteja em cima da mesa quando a próxima conversa começar.",
      placeholder: "Ex.: quero voltar àquela pergunta que ficou sem resposta.",
    },
    save: "Salvar só para mim",
    share: "Levar à próxima sessão",
    saved: "Salvo às",
    sharedTag: "Vai com a próxima sessão",
    closed: "Esta ponte já fechou. O que você escreveu continua seu.",
  },
} satisfies Record<Locale, Record<string, unknown>>;

export function SessionBridge({
  direction,
  interval,
  locale,
  open = true,
  className,
  style,
}: {
  direction: BridgeDirection;
  interval: CareInterval;
  locale: Locale;
  /** A janela do §4.3 está aberta. Fechada não é falha — é só fechada. */
  open?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const t = copy[locale];
  const strings = t[direction];
  const existing = interval.bridges.find(
    (bridge) => bridge.direction === direction,
  );

  const [body, setBody] = useState(existing?.body ?? "");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [shared, setShared] = useState(existing?.shared ?? false);

  const Icon = direction === "outgoing" ? ArrowRightToLine : ArrowLeftToLine;

  return (
    <section
      className={cn(
        "rounded-[var(--radius-lg)] border p-6",
        shared
          ? "border-dashed border-[var(--shared-border)] bg-[var(--shared-surface)]"
          : "border-[var(--border)] bg-[var(--surface)]",
        className,
      )}
      style={style}
      aria-labelledby={`bridge-${direction}-title`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          <Icon className="size-3.5" aria-hidden="true" />
          {strings.eyebrow}
        </p>
        <SensitivityTag level={shared ? "shared" : "private"} locale={locale} />
      </div>

      <h3
        id={`bridge-${direction}-title`}
        className="mt-3 text-xl font-bold tracking-[-0.035em]"
      >
        {strings.title}
      </h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
        {strings.hint}
      </p>

      {open ? (
        <>
          <Textarea
            className="mt-5 min-h-28"
            value={body}
            maxLength={480}
            placeholder={strings.placeholder}
            aria-label={strings.title}
            onChange={(event) => {
              setBody(event.target.value);
              setSavedAt(null);
            }}
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p
              role="status"
              className="text-xs text-[var(--muted-foreground)]"
              aria-live="polite"
            >
              {savedAt
                ? voice("saved", locale, {
                    time: new Intl.DateTimeFormat(locale, {
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(savedAt),
                  })
                : ""}
            </p>

            {/* Guardar e levar têm o mesmo peso visual: guardar continua
                privado, e isso não é o caminho menor (§4.5). */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="secondary"
                disabled={!body.trim()}
                onClick={() => setSavedAt(new Date())}
              >
                {t.save}
              </Button>
              <Button
                variant="secondary"
                disabled={!body.trim() || shared}
                onClick={() => {
                  setShared(true);
                  setSavedAt(new Date());
                }}
              >
                {shared ? (
                  <>
                    <Check className="size-4" aria-hidden="true" />
                    {t.sharedTag}
                  </>
                ) : (
                  t.share
                )}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <p className="mt-5 rounded-2xl bg-[var(--state-empty)] p-4 text-sm leading-6 text-[var(--state-empty-foreground)]">
          {t.closed}
        </p>
      )}
    </section>
  );
}
