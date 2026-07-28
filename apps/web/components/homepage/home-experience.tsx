"use client";

import { useEffect, useReducer, useRef, type RefObject } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, RotateCcw } from "lucide-react";
import type { HomeCopy, Locale, LocaleSegment } from "@alem-da-sessao/i18n";
import type { OrigamiFallback } from "@/components/origami/asset-loader";
import { OrigamiScene } from "@/components/origami/origami-scene";
import type { StageId } from "@/components/origami/tokens/paper";
import { Button } from "@/components/ui/button";
import { localPath } from "@/lib/locale";
import { cn } from "@/lib/utils";
import {
  canAdvance,
  clipOf,
  initialExperienceState,
  modelOf,
  paperOf,
  reduceExperience,
  resultOf,
  type DecideId,
  type FormId,
  type NoticeId,
} from "./experience-machine";

/**
 * O ritual. Um único Client Component, e o resto da página fica no servidor.
 *
 * A engine interativa são 40 linhas de estado em `experience-machine.ts` e mais
 * nada. Continua a não haver biblioteca de animação nem imagem de herói.
 *
 * Há WebGL, e sob condições que vale a pena dizer: a silhueta do objeto chega
 * no HTML, em SVG, gerada pelo mesmo frame da mesma simulação que a cena vai
 * desenhar. O canvas é uma melhoria que só é pedida quando a cena se aproxima
 * do ecrã, que desaparece sem consequências se o dispositivo não puder com ela,
 * e que não corre um único frame quando nada está a mudar. Nenhuma física
 * acontece aqui — o que o browser recebe são frames já verificados.
 *
 * O foco é a parte que se percebe pouco e se nota muito: a cada mudança de
 * etapa o foco vai para o novo título. Sem isso, quem navega por teclado ou
 * leitor de ecrã fica com o foco num botão que já desapareceu e a página
 * parece ter-se recusado a responder.
 */
export function HomeExperience({
  copy,
  locale,
  segment,
  stage = "atelier",
  fallbacks,
}: {
  copy: HomeCopy;
  locale: Locale;
  segment: LocaleSegment;
  stage?: StageId;
  /** Silhuetas dos modelos compilados, renderizadas no servidor. */
  fallbacks: Record<string, OrigamiFallback>;
}) {
  const [state, dispatch] = useReducer(
    reduceExperience,
    initialExperienceState,
  );
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousId = useRef(state.id);

  useEffect(() => {
    if (previousId.current === state.id) return;
    previousId.current = state.id;
    headingRef.current?.focus({ preventScroll: true });
  }, [state.id]);

  const model = modelOf(state);
  const paper = paperOf(state);
  const clip = clipOf(state);
  const step =
    state.id === "newcomer.notice"
      ? 1
      : state.id === "newcomer.form"
        ? 2
        : state.id === "newcomer.decide"
          ? 3
          : null;

  const stepCopy =
    state.id === "newcomer.notice"
      ? copy.steps.notice
      : state.id === "newcomer.form"
        ? copy.steps.form
        : state.id === "newcomer.decide"
          ? copy.steps.decide
          : null;

  const selected =
    state.id === "newcomer.notice"
      ? state.notice
      : state.id === "newcomer.form"
        ? state.form
        : state.decide;

  const onSelect = (id: string) => {
    if (state.id === "newcomer.notice") {
      dispatch({ type: "notice", id: id as NoticeId });
    } else if (state.id === "newcomer.form") {
      dispatch({ type: "form", id: id as FormId });
    } else {
      dispatch({ type: "decide", id: id as DecideId });
    }
  };

  return (
    <div className="home-experience-shell">
      <section
        className="home-experience origami-stage"
        data-stage={stage}
        data-state={state.id}
        aria-labelledby="home-experience-heading"
      >
        <figure className="home-experience-stage">
          <OrigamiScene
            model={model}
            paper={paper}
            clip={clip}
            fallbacks={fallbacks}
            className="home-experience-figure"
            enter
          />
          <figcaption className="home-experience-caption">
            {copy.scene.label}
          </figcaption>
        </figure>

        <div className="home-experience-panel">
          {step ? (
            <div className="home-experience-progress">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                {copy.nav.progress
                  .replace("{current}", String(step))
                  .replace("{total}", "3")}
              </p>
              <ol
                className="home-experience-ticks"
                aria-label={copy.nav.progress
                  .replace("{current}", String(step))
                  .replace("{total}", "3")}
              >
                {[1, 2, 3].map((index) => (
                  <li
                    key={index}
                    aria-current={step === index ? "step" : undefined}
                    data-state={
                      step === index
                        ? "current"
                        : index < step
                          ? "past"
                          : "next"
                    }
                  />
                ))}
              </ol>
            </div>
          ) : null}

          {state.id === "intro" ? (
            <div className="home-experience-body">
              <p className="home-experience-eyebrow">{copy.shell.eyebrow}</p>
              <h2
                id="home-experience-heading"
                ref={headingRef}
                tabIndex={-1}
                className="home-experience-title"
              >
                {copy.intro.question}
              </h2>
              <div className="home-experience-intro-actions">
                <Button
                  type="button"
                  onClick={() => dispatch({ type: "begin" })}
                >
                  {copy.intro.begin}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "explore" })}
                  className="home-experience-quiet min-h-11"
                >
                  {copy.intro.explore}
                </button>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "returning" })}
                  className="home-experience-quiet min-h-11"
                >
                  {copy.intro.returning}
                </button>
              </div>
            </div>
          ) : null}

          {stepCopy ? (
            <div className="home-experience-body">
              <p className="home-experience-eyebrow">
                {stepCopy.number} · {stepCopy.name}
              </p>
              <h2
                id="home-experience-heading"
                ref={headingRef}
                tabIndex={-1}
                className="home-experience-title"
              >
                {stepCopy.title}
              </h2>
              <p className="home-experience-lede">{stepCopy.body}</p>

              <fieldset className="home-experience-choices">
                <legend className="home-experience-legend">
                  {stepCopy.prompt}
                </legend>
                {stepCopy.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={option.id === selected}
                    onClick={() => onSelect(option.id)}
                    className="home-experience-choice min-h-11"
                  >
                    <span
                      className="home-experience-choice-dot"
                      aria-hidden="true"
                    >
                      {option.id === selected ? (
                        <Check className="size-3.5" />
                      ) : null}
                    </span>
                    <span>
                      <span className="home-experience-choice-label">
                        {option.label}
                      </span>
                      <span className="home-experience-choice-hint">
                        {option.hint}
                      </span>
                    </span>
                  </button>
                ))}
              </fieldset>
            </div>
          ) : null}

          {state.id === "newcomer.result" && state.decide ? (
            <ResultPanel
              copy={copy}
              decide={state.decide}
              headingRef={headingRef}
              segment={segment}
            />
          ) : null}

          {state.id === "explore" ? (
            <div className="home-experience-body">
              <p className="home-experience-eyebrow">{copy.explore.eyebrow}</p>
              <h2
                id="home-experience-heading"
                ref={headingRef}
                tabIndex={-1}
                className="home-experience-title"
              >
                {copy.explore.title}
              </h2>
              <p className="home-experience-lede">{copy.explore.body}</p>
              <div className="home-experience-actions">
                <Button asChild>
                  <Link href={localPath(segment, "/demo")}>
                    {copy.explore.primary}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href={localPath(segment, "/seguranca")}>
                    {copy.explore.secondary}
                  </Link>
                </Button>
              </div>
            </div>
          ) : null}

          {state.id === "returning" ? (
            <div className="home-experience-body">
              <p className="home-experience-eyebrow">
                {copy.returning.eyebrow}
              </p>
              <h2
                id="home-experience-heading"
                ref={headingRef}
                tabIndex={-1}
                className="home-experience-title"
              >
                {copy.returning.title}
              </h2>
              <p className="home-experience-lede">{copy.returning.body}</p>
              <div className="home-experience-doors">
                <ReturningDoor
                  copy={copy.returning.assigned}
                  href={localPath(segment, "/cuidado/hoje")}
                  model="box"
                  paper="jade"
                  fallbacks={fallbacks}
                />
                <ReturningDoor
                  copy={copy.returning.personal}
                  href={localPath(segment, "/cuidado/experiencias")}
                  model="suspended-sheet"
                  paper="lilac"
                  fallbacks={fallbacks}
                />
              </div>
            </div>
          ) : null}

          <div className="home-experience-footer">
            {state.id !== "intro" ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => dispatch({ type: "back" })}
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                {copy.nav.back}
              </Button>
            ) : null}

            {stepCopy ? (
              <Button
                type="button"
                onClick={() => dispatch({ type: "advance" })}
                disabled={!canAdvance(state)}
              >
                {copy.nav.advance}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            ) : null}

            {state.id !== "intro" ? (
              <button
                type="button"
                onClick={() => dispatch({ type: "restart" })}
                className="home-experience-quiet min-h-11"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                {copy.nav.restart}
              </button>
            ) : null}
          </div>

          <p className="home-experience-privacy">{copy.shell.privacy}</p>
        </div>

        <p className="sr-only" lang={locale}>
          {copy.scene.description}
        </p>
      </section>
    </div>
  );
}

function ResultPanel({
  copy,
  decide,
  headingRef,
  segment,
}: {
  copy: HomeCopy;
  decide: DecideId;
  headingRef: RefObject<HTMLHeadingElement | null>;
  segment: LocaleSegment;
}) {
  const object = copy.result.objects[resultOf(decide)];

  return (
    <div className="home-experience-body">
      <p className="home-experience-eyebrow">{copy.result.eyebrow}</p>
      <h2
        id="home-experience-heading"
        ref={headingRef}
        tabIndex={-1}
        className="home-experience-title"
      >
        {object.name}
      </h2>
      <p className="home-experience-lede">{object.body}</p>
      <p className="home-experience-note">{copy.result.note}</p>
      <div className="home-experience-actions">
        <Button asChild>
          <Link href={localPath(segment, "/experiencias")}>
            {copy.result.primary}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href={localPath(segment, "/demo")}>
            {copy.result.secondary}
          </Link>
        </Button>
      </div>
    </div>
  );
}

function ReturningDoor({
  copy,
  href,
  model,
  paper,
  fallbacks,
}: {
  copy: HomeCopy["returning"]["assigned"];
  href: string;
  model: "box" | "suspended-sheet";
  paper: "jade" | "lilac";
  fallbacks: Record<string, OrigamiFallback>;
}) {
  return (
    <Link href={href} className="home-experience-door">
      {/* Objetos funcionais e reconhecíveis: a caixa é onde as coisas ficam
          guardadas, a folha por dobrar é o que ainda não foi decidido. Não são
          miniaturas decorativas — são os mesmos dois objetos que o ritual
          produz, e é isso que torna as duas portas legíveis sem legenda. */}
      <OrigamiScene
        model={model}
        paper={paper}
        clip="forming-to-formed"
        fallbacks={fallbacks}
        className="home-experience-door-figure"
      />
      <span className={cn("home-experience-door-text")}>
        <span className="home-experience-door-label">{copy.label}</span>
        <span className="home-experience-door-title">{copy.title}</span>
        <span className="home-experience-door-body">{copy.body}</span>
        <span className="home-experience-door-cta">
          {copy.cta}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </span>
      </span>
    </Link>
  );
}
