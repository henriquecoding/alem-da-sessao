"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Layers3,
  LockKeyhole,
  RotateCcw,
  Sparkles,
  Stethoscope,
  UserRound,
} from "lucide-react";
import type { HomeCopy, Locale, LocaleSegment } from "@alem-da-sessao/i18n";
import { Button } from "@/components/ui/button";
import { localPath } from "@/lib/locale";
import { cn } from "@/lib/utils";

type VisitMode = "explore" | "returning";
type MomentId = "echo" | "clarity" | "intention";
type RitualStep = 0 | 1 | 2;
type CrossingState = "private" | "shared";

const momentRoutes: Record<MomentId, string> = {
  echo: "/experiencias/estruturas-de-carga",
  clarity: "/experiencias/inventario-da-sessao",
  intention: "/experiencias/inventario-da-sessao",
};

/**
 * A homepage inteira funciona como uma miniatura honesta do produto.
 *
 * O visitante não preenche um questionário de saúde nem oferece um lead
 * disfarçado de reflexão. Faz três escolhas abstratas — notar, dar forma e
 * decidir — que vivem apenas neste estado React e desaparecem ao recarregar.
 * A cena 2.5D traduz cada mudança de estado espacialmente; nenhum WebGL,
 * imagem pesada ou ciclo de renderização permanente é necessário.
 */
export function IntervalStudio({
  copy,
  locale,
  segment,
}: {
  copy: HomeCopy;
  locale: Locale;
  segment: LocaleSegment;
}) {
  const [mode, setMode] = useState<VisitMode>("explore");
  const [step, setStep] = useState<RitualStep>(0);
  const [moment, setMoment] = useState<MomentId | null>(null);
  const [crossing, setCrossing] = useState<CrossingState>("private");

  const selected = useMemo(
    () =>
      copy.ritual.steps.notice.options.find((option) => option.id === moment) ??
      null,
    [copy.ritual.steps.notice.options, moment],
  );

  const setVisitMode = (next: VisitMode) => {
    setMode(next);
    if (next === "explore") return;
    setStep(0);
    setCrossing("private");
  };

  const restart = () => {
    setStep(0);
    setMoment(null);
    setCrossing("private");
  };

  const nextStep = () => {
    if (step === 0 && !moment) return;
    setStep((current) => Math.min(current + 1, 2) as RitualStep);
  };

  const previousStep = () => {
    setStep((current) => Math.max(current - 1, 0) as RitualStep);
    setCrossing("private");
  };

  const progress = copy.ritual.progress
    .replace("{current}", String(step + 1))
    .replace("{total}", "3");

  return (
    <main className="home-world overflow-hidden">
      <section
        aria-labelledby="home-title"
        className="relative px-4 pb-20 pt-8 sm:px-6 sm:pt-12 lg:px-8 lg:pb-28"
      >
        <AmbientForms />

        <div className="relative mx-auto w-full max-w-[1240px]">
          <div className="enter mx-auto max-w-[58rem] text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--accent-foreground)]">
              {copy.shell.eyebrow}
            </p>
            <h1
              id="home-title"
              className="mt-5 text-balance text-[clamp(3rem,1.4rem+6vw,6.8rem)] font-semibold leading-[0.92] tracking-[-0.065em]"
            >
              {copy.shell.title}
            </h1>
            <p className="mx-auto mt-7 max-w-[59ch] text-pretty text-base leading-8 text-[var(--muted-foreground)] sm:text-lg">
              {copy.shell.lede}
            </p>
          </div>

          <div className="enter mt-10" style={{ "--d": 2 } as CSSProperties}>
            <div className="home-mode-switch mx-auto" role="tablist">
              <button
                id="home-explore-tab"
                type="button"
                role="tab"
                aria-selected={mode === "explore"}
                aria-controls="home-experience-panel"
                onClick={() => setVisitMode("explore")}
                className="min-h-11 rounded-full px-4 text-sm font-semibold outline-none transition-[background-color,color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                {copy.shell.exploreTab}
              </button>
              <button
                id="home-return-tab"
                type="button"
                role="tab"
                aria-selected={mode === "returning"}
                aria-controls="home-experience-panel"
                onClick={() => setVisitMode("returning")}
                className="min-h-11 rounded-full px-4 text-sm font-semibold outline-none transition-[background-color,color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                {copy.shell.returnTab}
              </button>
            </div>
          </div>

          <div
            id="home-experience-panel"
            role="tabpanel"
            aria-labelledby={
              mode === "explore" ? "home-explore-tab" : "home-return-tab"
            }
            className="home-theatre enter mt-5 grid min-h-[39rem] overflow-hidden rounded-[2rem] border border-[var(--home-line)] shadow-[var(--shadow-xl)] lg:grid-cols-[minmax(22rem,.78fr)_minmax(0,1.22fr)]"
            style={{ "--d": 3 } as CSSProperties}
          >
            <div className="home-theatre-copy relative z-10 flex min-w-0 flex-col border-b border-[var(--home-line)] p-6 sm:p-9 lg:border-b-0 lg:border-r lg:p-10">
              {mode === "explore" ? (
                <RitualCopy
                  copy={copy}
                  locale={locale}
                  segment={segment}
                  step={step}
                  moment={moment}
                  crossing={crossing}
                  selected={selected}
                  progress={progress}
                  onMoment={setMoment}
                  onCrossing={setCrossing}
                  onNext={nextStep}
                  onBack={previousStep}
                  onRestart={restart}
                />
              ) : (
                <ReturningCopy copy={copy} segment={segment} />
              )}
            </div>

            <Diorama
              copy={copy}
              mode={mode}
              step={step}
              moment={moment}
              crossing={crossing}
              markerLabel={selected?.object}
            />
          </div>

          <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs leading-5 text-[var(--muted-foreground)]">
            <LockKeyhole
              className="size-3.5 shrink-0 text-[var(--private)]"
              aria-hidden="true"
            />
            {copy.shell.privacy}
          </p>
        </div>
      </section>

      <RoleRhythms copy={copy} segment={segment} />
      <Closing copy={copy} segment={segment} />
    </main>
  );
}

function RitualCopy({
  copy,
  locale,
  segment,
  step,
  moment,
  crossing,
  selected,
  progress,
  onMoment,
  onCrossing,
  onNext,
  onBack,
  onRestart,
}: {
  copy: HomeCopy;
  locale: Locale;
  segment: LocaleSegment;
  step: RitualStep;
  moment: MomentId | null;
  crossing: CrossingState;
  selected: HomeCopy["ritual"]["steps"]["notice"]["options"][number] | null;
  progress: string;
  onMoment: (moment: MomentId) => void;
  onCrossing: (state: CrossingState) => void;
  onNext: () => void;
  onBack: () => void;
  onRestart: () => void;
}) {
  const stepCopy =
    step === 0
      ? copy.ritual.steps.notice
      : step === 1
        ? copy.ritual.steps.form
        : copy.ritual.steps.decide;

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          {progress}
        </p>
        <ol className="flex items-center gap-1.5" aria-label={progress}>
          {[0, 1, 2].map((index) => (
            <li
              key={index}
              aria-current={step === index ? "step" : undefined}
              className={cn(
                "home-step h-1.5 rounded-full transition-[width,background-color] duration-300",
                step === index
                  ? "home-step-current w-7"
                  : index < step
                    ? "home-step-past w-3"
                    : "home-step-future w-3",
              )}
            />
          ))}
        </ol>
      </div>

      <div key={step} className="animate-rise mt-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--accent-foreground)]">
          {stepCopy.number} · {stepCopy.name}
        </p>
        <h2 className="mt-4 text-balance text-[clamp(2rem,1.45rem+2vw,3rem)] font-semibold leading-[1.02] tracking-[-0.05em]">
          {stepCopy.title}
        </h2>
        <p className="mt-5 max-w-[45ch] text-pretty leading-7 text-[var(--muted-foreground)]">
          {stepCopy.body}
        </p>

        {step === 0 ? (
          <div className="mt-8">
            <p className="text-sm font-semibold">
              {copy.ritual.steps.notice.prompt}
            </p>
            <div className="mt-3 space-y-2.5">
              {copy.ritual.steps.notice.options.map((option) => {
                const active = option.id === moment;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onMoment(option.id as MomentId)}
                    className="home-choice group min-h-11 w-full rounded-2xl border p-4 text-left outline-none transition-[border-color,background-color,transform,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  >
                    <span className="flex items-start gap-3">
                      <span
                        className="home-choice-dot mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border transition-colors"
                        aria-hidden="true"
                      >
                        {active ? <Check className="size-3.5" /> : null}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                          {option.hint}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            {selected ? (
              <p
                className="animate-fade mt-4 border-l-2 border-[var(--accent)] pl-3 text-sm leading-6 text-[var(--muted-foreground)]"
                aria-live="polite"
              >
                {selected.response}
              </p>
            ) : null}
          </div>
        ) : null}

        {step === 1 && selected ? (
          <div className="home-artifact-card mt-8 rounded-2xl border border-[var(--home-line)] p-5">
            <div className="flex items-start gap-4">
              <span
                className="home-artifact-icon grid size-11 shrink-0 place-items-center rounded-2xl"
                data-moment={moment}
              >
                <Layers3 className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-[var(--muted-foreground)]">
                  {copy.ritual.steps.form.selectedLabel}
                </p>
                <p className="mt-1 text-xl font-semibold tracking-[-0.03em]">
                  {selected.object}
                </p>
              </div>
            </div>
            <div className="mt-5 border-t border-[var(--home-line)] pt-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-[var(--muted-foreground)]">
                {copy.ritual.steps.form.recommendationLabel}
              </p>
              <p className="mt-2 font-semibold">{selected.tool}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                {selected.toolBody}
              </p>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-8">
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                aria-pressed={crossing === "private"}
                onClick={() => onCrossing("private")}
                className="home-crossing-choice min-h-11 rounded-2xl border p-4 text-left text-sm font-semibold outline-none transition-[background-color,border-color,transform] duration-200 focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                <LockKeyhole className="mb-3 size-4" aria-hidden="true" />
                {copy.ritual.steps.decide.privateAction}
              </button>
              <button
                type="button"
                aria-pressed={crossing === "shared"}
                onClick={() => onCrossing("shared")}
                className="home-crossing-choice min-h-11 rounded-2xl border p-4 text-left text-sm font-semibold outline-none transition-[background-color,border-color,transform] duration-200 focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                <ArrowRight className="mb-3 size-4" aria-hidden="true" />
                {copy.ritual.steps.decide.shareAction}
              </button>
            </div>

            <div
              key={crossing}
              className="animate-fade mt-5"
              aria-live="polite"
            >
              <p className="font-semibold">
                {crossing === "private"
                  ? copy.ritual.steps.decide.privateTitle
                  : copy.ritual.steps.decide.sharedTitle}
              </p>
              <p className="mt-1.5 text-sm leading-6 text-[var(--muted-foreground)]">
                {crossing === "private"
                  ? copy.ritual.steps.decide.privateBody
                  : copy.ritual.steps.decide.sharedBody}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-9">
        {step > 0 ? (
          <Button type="button" variant="ghost" onClick={onBack}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            {copy.ritual.back}
          </Button>
        ) : null}

        {step < 2 ? (
          <Button
            type="button"
            onClick={onNext}
            disabled={step === 0 && !moment}
          >
            {copy.ritual.next}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        ) : (
          <>
            <Button asChild>
              <Link
                href={localPath(
                  segment,
                  moment ? momentRoutes[moment] : "/experiencias",
                )}
              >
                {copy.ritual.startTool}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={localPath(segment, "/demo")}>
                {copy.ritual.seeDemo}
              </Link>
            </Button>
            <button
              type="button"
              onClick={onRestart}
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-xs font-semibold text-[var(--muted-foreground)] outline-none hover:text-[var(--foreground)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              {copy.ritual.restart}
            </button>
          </>
        )}
      </div>

      <span className="sr-only" lang={locale}>
        {copy.scene.description}
      </span>
    </>
  );
}

function ReturningCopy({
  copy,
  segment,
}: {
  copy: HomeCopy;
  segment: LocaleSegment;
}) {
  return (
    <div className="animate-rise flex h-full flex-col">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--accent-foreground)]">
        {copy.returning.eyebrow}
      </p>
      <h2 className="mt-4 text-balance text-[clamp(2rem,1.45rem+2vw,3rem)] font-semibold leading-[1.02] tracking-[-0.05em]">
        {copy.returning.title}
      </h2>
      <p className="mt-5 max-w-[45ch] text-pretty leading-7 text-[var(--muted-foreground)]">
        {copy.returning.body}
      </p>

      <div className="mt-9 grid gap-3">
        <ReturnDoor
          icon={UserRound}
          label={copy.returning.client.label}
          title={copy.returning.client.title}
          body={copy.returning.client.body}
          cta={copy.returning.client.cta}
          href={localPath(segment, "/cuidado/hoje")}
          tone="client"
        />
        <ReturnDoor
          icon={Stethoscope}
          label={copy.returning.professional.label}
          title={copy.returning.professional.title}
          body={copy.returning.professional.body}
          cta={copy.returning.professional.cta}
          href={localPath(segment, "/pro/hoje")}
          tone="professional"
        />
      </div>
    </div>
  );
}

function ReturnDoor({
  icon: Icon,
  label,
  title,
  body,
  cta,
  href,
  tone,
}: {
  icon: typeof UserRound;
  label: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  tone: "client" | "professional";
}) {
  return (
    <Link
      href={href}
      className="home-return-door group rounded-2xl border border-[var(--home-line)] p-4 outline-none transition-[border-color,background-color,transform,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      data-tone={tone}
    >
      <span className="flex items-start gap-3">
        <span className="home-return-icon grid size-10 shrink-0 place-items-center rounded-2xl">
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
            {label}
          </span>
          <span className="mt-1 block font-semibold tracking-[-0.02em]">
            {title}
          </span>
          <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
            {body}
          </span>
          <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)]">
            {cta}
            <ArrowRight
              className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
        </span>
      </span>
    </Link>
  );
}

function Diorama({
  copy,
  mode,
  step,
  moment,
  crossing,
  markerLabel,
}: {
  copy: HomeCopy;
  mode: VisitMode;
  step: RitualStep;
  moment: MomentId | null;
  crossing: CrossingState;
  markerLabel?: string;
}) {
  const leftLabel =
    mode === "explore" ? copy.scene.previous : copy.returning.client.label;
  const rightLabel =
    mode === "explore" ? copy.scene.next : copy.returning.professional.label;

  return (
    <figure
      className="home-diorama relative min-h-[26rem] overflow-hidden p-5 sm:p-8 lg:min-h-full"
      data-mode={mode}
      data-step={step}
      data-moment={moment ?? "none"}
      data-crossing={crossing}
      aria-label={copy.scene.description}
    >
      <figcaption className="relative z-20 flex items-center justify-between gap-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
          {copy.scene.label}
        </span>
        {mode === "explore" && step === 2 ? (
          <span className="rounded-full border border-[var(--home-line)] bg-[var(--home-glass)] px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.13em] text-[var(--muted-foreground)]">
            {crossing === "private"
              ? copy.scene.privateSide
              : copy.scene.sharedSide}
          </span>
        ) : null}
      </figcaption>

      <div className="interval-perspective absolute inset-x-0 bottom-5 top-12">
        <div className="interval-sky" aria-hidden="true">
          <span className="interval-orbit interval-orbit-one" />
          <span className="interval-orbit interval-orbit-two" />
          <span className="interval-aurora interval-aurora-one" />
          <span className="interval-aurora interval-aurora-two" />
        </div>

        <div className="interval-world" aria-hidden="true">
          <div className="interval-plane">
            <div className="origami-sheet">
              {copy.scene.days.map((day, index) => (
                <span
                  key={`${day}-${index}`}
                  className="origami-fold"
                  style={{ "--i": index } as CSSProperties}
                >
                  <span className="origami-fold-face" />
                  <span className="origami-fold-shine" />
                  <span className="origami-day-label">{day}</span>
                </span>
              ))}
              <span className="origami-crease origami-crease-one" />
              <span className="origami-crease origami-crease-two" />
              <span className="origami-crease origami-crease-three" />
            </div>

            <span className="interval-gate interval-gate-left">
              <span>{leftLabel}</span>
            </span>
            <span className="interval-gate interval-gate-right">
              <span>{rightLabel}</span>
            </span>

            <span className="interval-marker">
              <span className="origami-token">
                <span className="origami-token-face origami-token-face-a" />
                <span className="origami-token-face origami-token-face-b" />
                <span className="origami-token-face origami-token-face-c" />
                <span className="origami-token-fold" />
              </span>
              {markerLabel ? (
                <span className="interval-marker-label">{markerLabel}</span>
              ) : null}
            </span>

            <span className="interval-form interval-form-one" />
            <span className="interval-form interval-form-two" />
            <span className="interval-form interval-form-three" />
          </div>
        </div>
      </div>
    </figure>
  );
}

function AmbientForms() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <span className="home-ambient home-ambient-one" />
      <span className="home-ambient home-ambient-two" />
      <span className="home-ambient home-ambient-three" />
    </div>
  );
}

function RoleRhythms({
  copy,
  segment,
}: {
  copy: HomeCopy;
  segment: LocaleSegment;
}) {
  return (
    <section
      aria-labelledby="roles-title"
      className="home-lazy-section relative border-y border-[var(--home-line)] px-4 py-24 sm:px-6 lg:px-8 lg:py-32"
    >
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="mx-auto max-w-[50rem] text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent-foreground)]">
            {copy.roles.eyebrow}
          </p>
          <h2
            id="roles-title"
            className="mt-5 text-balance text-[clamp(2.4rem,1.5rem+3.6vw,4.8rem)] font-semibold leading-[0.98] tracking-[-0.06em]"
          >
            {copy.roles.title}
          </h2>
          <p className="mx-auto mt-6 max-w-[61ch] text-pretty leading-8 text-[var(--muted-foreground)]">
            {copy.roles.lede}
          </p>
        </div>

        <div className="relative mt-16 grid gap-4 lg:grid-cols-2">
          <RoleCard
            copy={copy.roles.client}
            href={localPath(segment, "/experiencias")}
            icon={UserRound}
            tone="client"
          />
          <RoleCard
            copy={copy.roles.professional}
            href={localPath(segment, "/demo")}
            icon={Stethoscope}
            tone="professional"
          />
          <span
            className="home-relationship-node pointer-events-none absolute left-1/2 top-1/2 hidden size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[var(--home-line)] lg:grid"
            aria-hidden="true"
          >
            <Sparkles className="size-4 text-[var(--accent)]" />
          </span>
        </div>
      </div>
    </section>
  );
}

function RoleCard({
  copy,
  href,
  icon: Icon,
  tone,
}: {
  copy: HomeCopy["roles"]["client"];
  href: string;
  icon: typeof UserRound;
  tone: "client" | "professional";
}) {
  return (
    <article
      className="home-role-card group relative min-h-[25rem] overflow-hidden rounded-[2rem] border border-[var(--home-line)] p-7 sm:p-10"
      data-tone={tone}
    >
      <span className="home-role-orbit" aria-hidden="true" />
      <div className="relative z-10 flex h-full flex-col">
        <span className="home-role-icon grid size-12 place-items-center rounded-2xl border border-[var(--home-line)]">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <p className="mt-10 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          {copy.index}
        </p>
        <h3 className="mt-4 max-w-[13ch] text-balance text-[clamp(1.8rem,1.25rem+1.8vw,2.7rem)] font-semibold leading-[1.02] tracking-[-0.05em]">
          {copy.title}
        </h3>
        <p className="mt-5 max-w-[44ch] text-pretty leading-7 text-[var(--muted-foreground)]">
          {copy.body}
        </p>
        <Link
          href={href}
          className="mt-auto inline-flex min-h-11 w-fit items-center gap-2 pt-8 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          {copy.cta}
          <ArrowRight
            className="size-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}

function Closing({
  copy,
  segment,
}: {
  copy: HomeCopy;
  segment: LocaleSegment;
}) {
  return (
    <section className="home-lazy-section relative px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
      <div className="home-closing mx-auto max-w-[66rem] overflow-hidden rounded-[2rem] border border-[var(--home-line)] px-6 py-16 text-center shadow-[var(--shadow-lg)] sm:px-12 sm:py-20">
        <span className="home-closing-orbit" aria-hidden="true" />
        <div className="relative z-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent-foreground)]">
            {copy.close.eyebrow}
          </p>
          <h2 className="mx-auto mt-5 max-w-[18ch] text-balance text-[clamp(2.3rem,1.4rem+3.5vw,4.7rem)] font-semibold leading-[0.98] tracking-[-0.06em]">
            {copy.close.title}
          </h2>
          <p className="mx-auto mt-6 max-w-[59ch] text-pretty leading-8 text-[var(--muted-foreground)]">
            {copy.close.body}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href={localPath(segment, "/demo")}>
                {copy.close.primary}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href={localPath(segment, "/seguranca")}>
                {copy.close.secondary}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
