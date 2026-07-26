"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { Locale } from "@alem-da-sessao/i18n";
import {
  loadStructuresSchema,
  type LoadStructuresInput,
} from "@alem-da-sessao/validation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const initialValues: LoadStructuresInput = {
  responsibility: "",
  observableEffects: "",
  currentSupport: "",
  desiredRedistribution: "",
  nextSessionFocus: "",
};

const copy = {
  "pt-PT": {
    steps: ["O que sustenta", "Como responde", "Onde há apoio", "Revisão"],
    intro:
      "Não vamos medir o seu peso nem dizer o que ele significa. Este percurso ajuda a observar uma estrutura da sua vida e a escolher o que quer levar à próxima conversa.",
    responsibility: "Que responsabilidade tem sustentado?",
    responsibilityHint:
      "Descreva a situação concreta. Pode incluir factos, emoções e necessidades — nada precisa de ser escondido para caber aqui.",
    effects: "Como esta estrutura responde no quotidiano?",
    effectsHint:
      "O que observa no corpo, no tempo, nas relações ou nas decisões quando esta responsabilidade aumenta?",
    currentSupport: "O que já ajuda a sustentar isto?",
    desiredRedistribution: "O que gostaria que pudesse ser redistribuído?",
    focus: "O que quer levar à próxima sessão?",
    next: "Continuar",
    back: "Voltar",
    review: "Reveja sem pressa.",
    reviewHint:
      "Nada abaixo está visível ao profissional. Partilhar será uma decisão separada.",
    save: "Guardar só para mim",
    share: "Preparar partilha",
    discard: "Descartar sem rasto",
    saved:
      "Guardado apenas nesta demonstração em memória. Recarregar a página elimina o conteúdo.",
    shareTitle: "Isto é exatamente o que seria partilhado.",
    shareBody:
      "Uma partilha real criaria um snapshot imutável. Alterações posteriores não modificariam esta versão silenciosamente.",
    confirmShare: "Confirmar snapshot de demonstração",
    shared: "Snapshot de demonstração criado.",
    sharedBody:
      "Nenhum dado saiu deste navegador. O fluxo serve apenas para validar a decisão e a linguagem.",
  },
  "pt-BR": {
    steps: ["O que sustenta", "Como responde", "Onde há apoio", "Revisão"],
    intro:
      "Não vamos medir o seu peso nem dizer o que ele significa. Este percurso ajuda você a observar uma estrutura da sua vida e escolher o que quer levar à próxima conversa.",
    responsibility: "Que responsabilidade você tem sustentado?",
    responsibilityHint:
      "Descreva a situação concreta. Você pode incluir fatos, emoções e necessidades — nada precisa ser escondido para caber aqui.",
    effects: "Como essa estrutura responde no cotidiano?",
    effectsHint:
      "O que você observa no corpo, no tempo, nas relações ou nas decisões quando essa responsabilidade aumenta?",
    currentSupport: "O que já ajuda a sustentar isso?",
    desiredRedistribution: "O que você gostaria que pudesse ser redistribuído?",
    focus: "O que você quer levar à próxima sessão?",
    next: "Continuar",
    back: "Voltar",
    review: "Revise sem pressa.",
    reviewHint:
      "Nada abaixo está visível ao profissional. Compartilhar será uma decisão separada.",
    save: "Salvar só para mim",
    share: "Preparar compartilhamento",
    discard: "Descartar sem deixar rastro",
    saved:
      "Salvo apenas nesta demonstração em memória. Recarregar a página elimina o conteúdo.",
    shareTitle: "Isto é exatamente o que seria compartilhado.",
    shareBody:
      "Um compartilhamento real criaria um snapshot imutável. Alterações posteriores não modificariam esta versão silenciosamente.",
    confirmShare: "Confirmar snapshot de demonstração",
    shared: "Snapshot de demonstração criado.",
    sharedBody:
      "Nenhum dado saiu deste navegador. O fluxo serve apenas para validar a decisão e a linguagem.",
  },
} satisfies Record<Locale, Record<string, string | string[]>>;

function Field({
  label,
  hint,
  value,
  onChange,
  maxLength,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
}) {
  return (
    <label className="block">
      <span className="text-xl font-bold tracking-[-0.035em]">{label}</span>
      {hint && (
        <span className="mt-2 block max-w-2xl text-sm leading-6 text-white/58">
          {hint}
        </span>
      )}
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        className="mt-5 min-h-36 border-white/12 bg-white/7 text-white placeholder:text-white/28 focus:border-[var(--accent)]"
        placeholder="Escreva ao seu ritmo…"
      />
      <span className="mt-2 block text-right text-[10px] text-white/38">
        {value.length}/{maxLength}
      </span>
    </label>
  );
}

export function LoadStructuresExperience({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<LoadStructuresInput>(initialValues);
  const [mode, setMode] = useState<"editing" | "saved" | "sharing" | "shared">(
    "editing",
  );
  const [error, setError] = useState<string | null>(null);

  const canContinue = useMemo(() => {
    if (step === 0) return values.responsibility.trim().length >= 10;
    if (step === 1) return values.observableEffects.trim().length >= 10;
    if (step === 2)
      return (
        values.currentSupport.trim().length > 0 ||
        values.desiredRedistribution.trim().length > 0 ||
        values.nextSessionFocus.trim().length > 0
      );
    return true;
  }, [step, values]);

  function update<Key extends keyof LoadStructuresInput>(
    key: Key,
    value: LoadStructuresInput[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function prepareShare() {
    const parsed = loadStructuresSchema.safeParse(values);
    if (!parsed.success) {
      setError(
        locale === "pt-BR"
          ? "Complete os campos essenciais antes de preparar o compartilhamento."
          : "Complete os campos essenciais antes de preparar a partilha.",
      );
      return;
    }
    setMode("sharing");
  }

  function discard() {
    setValues(initialValues);
    setStep(0);
    setMode("editing");
    setError(null);
  }

  const reviewItems = [
    [t.responsibility, values.responsibility],
    [t.effects, values.observableEffects],
    [t.currentSupport, values.currentSupport || "—"],
    [t.desiredRedistribution, values.desiredRedistribution || "—"],
    [t.focus, values.nextSessionFocus || "—"],
  ];

  if (mode === "shared") {
    return (
      <Card className="mx-auto max-w-2xl border-white/10 bg-white/7 text-white">
        <CardContent className="flex min-h-[470px] flex-col items-center justify-center p-7 text-center sm:p-12">
          <span className="grid size-16 place-items-center rounded-3xl bg-[var(--success)] text-white">
            <Check className="size-7" />
          </span>
          <h2 className="mt-7 text-3xl font-bold tracking-[-0.045em]">
            {t.shared}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/58">
            {t.sharedBody}
          </p>
          <Button variant="secondary" className="mt-8" onClick={discard}>
            <RotateCcw className="size-4" />
            Recomeçar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (mode === "sharing") {
    return (
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => setMode("editing")}
          className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white/60 hover:text-white"
        >
          <ArrowLeft className="size-4" />
          {t.back}
        </button>
        <Card className="border-white/10 bg-white/7 text-white">
          <CardContent className="p-6 sm:p-9">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--accent)] text-white">
                <Eye className="size-5" />
              </span>
              <div>
                <h2 className="text-2xl font-bold tracking-[-0.04em]">
                  {t.shareTitle}
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  {t.shareBody}
                </p>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              {reviewItems.map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-black/12 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[var(--accent)]">
                    {label}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/76">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setMode("editing")}>
                Rever novamente
              </Button>
              <Button variant="quiet" onClick={() => setMode("shared")}>
                <ShieldCheck className="size-4" />
                {t.confirmShare}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-7 flex items-center justify-between gap-4">
        <Badge className="bg-white/8 text-white/70">
          <LockKeyhole className="mr-1.5 size-3.5" />
          Privado por defeito
        </Badge>
        <span className="text-xs font-semibold text-white/42">
          {Math.min(step + 1, 4)} / 4
        </span>
      </div>

      <div className="mb-8 grid grid-cols-4 gap-2" aria-label="Progresso">
        {(t.steps as string[]).map((label, index) => (
          <div key={label}>
            <div
              className={`h-1.5 rounded-full ${
                index <= step ? "bg-[var(--accent)]" : "bg-white/10"
              }`}
            />
            <p className="mt-2 hidden text-[10px] font-semibold text-white/42 sm:block">
              {label}
            </p>
          </div>
        ))}
      </div>

      <Card className="border-white/10 bg-white/7 text-white">
        <CardContent className="p-6 sm:p-9">
          {step === 0 && (
            <div>
              <div className="mb-9 flex gap-4 rounded-2xl bg-black/12 p-4">
                <Sparkles className="mt-0.5 size-5 shrink-0 text-[var(--accent)]" />
                <p className="text-sm leading-6 text-white/62">{t.intro}</p>
              </div>
              <Field
                label={t.responsibility as string}
                hint={t.responsibilityHint as string}
                value={values.responsibility}
                onChange={(value) => update("responsibility", value)}
                maxLength={500}
              />
            </div>
          )}

          {step === 1 && (
            <Field
              label={t.effects as string}
              hint={t.effectsHint as string}
              value={values.observableEffects}
              onChange={(value) => update("observableEffects", value)}
              maxLength={800}
            />
          )}

          {step === 2 && (
            <div className="space-y-8">
              <Field
                label={t.currentSupport as string}
                value={values.currentSupport}
                onChange={(value) => update("currentSupport", value)}
                maxLength={500}
              />
              <Field
                label={t.desiredRedistribution as string}
                value={values.desiredRedistribution}
                onChange={(value) => update("desiredRedistribution", value)}
                maxLength={500}
              />
              <Field
                label={t.focus as string}
                value={values.nextSessionFocus}
                onChange={(value) => update("nextSessionFocus", value)}
                maxLength={500}
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-3xl font-bold tracking-[-0.045em]">
                {t.review}
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/55">{t.reviewHint}</p>
              <div className="mt-8 space-y-3">
                {reviewItems.map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-black/12 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[var(--accent)]">
                      {label}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/76">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-2xl bg-[var(--destructive)]/18 p-4 text-sm text-[#ffd7d2]"
            >
              {error}
            </p>
          )}

          {mode === "saved" && (
            <p
              role="status"
              className="mt-5 rounded-2xl bg-[var(--success)]/20 p-4 text-sm leading-6 text-[#cce9dc]"
            >
              {t.saved}
            </p>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            {step > 0 ? (
              <Button variant="secondary" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="size-4" />
                {t.back}
              </Button>
            ) : (
              <Button variant="ghost" onClick={discard}>
                <Trash2 className="size-4" />
                {t.discard}
              </Button>
            )}

            {step < 3 ? (
              <Button
                variant="quiet"
                disabled={!canContinue}
                onClick={() => setStep(step + 1)}
              >
                {t.next}
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="secondary" onClick={() => setMode("saved")}>
                  <LockKeyhole className="size-4" />
                  {t.save}
                </Button>
                <Button variant="quiet" onClick={prepareShare}>
                  <Eye className="size-4" />
                  {t.share}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
