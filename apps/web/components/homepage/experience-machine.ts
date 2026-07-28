import type {
  OrigamiModelId,
  OrigamiResultId,
} from "@/components/origami/types";
import type { PaperFamilyId } from "@/components/origami/tokens/paper";

/**
 * A experiência é uma máquina de estados explícita, e não um conjunto de
 * booleanos que se contradizem.
 *
 * A versão anterior tinha `mode`, `step`, `moment` e `crossing` a viver lado a
 * lado no mesmo componente, o que permitia estados que não existem — por
 * exemplo `mode: "returning"` com `step: 2`. Aqui, um estado impossível não se
 * consegue escrever.
 *
 * Duas regras que o transformam num contrato de produto e não só de código:
 *
 * **Nada persiste.** O estado vive no React e desaparece ao recarregar. Não há
 * `localStorage`, não há pedido de rede, não há evento de analytics sobre uma
 * escolha. É por isso que a demonstração pode fazer perguntas sem se tornar um
 * questionário de saúde.
 *
 * **A forma nomeia a decisão, não a pessoa.** `resultOf` mapeia a intenção
 * escolhida — levar, guardar, atravessar, suspender — e nunca o que a pessoa
 * notou. Uma folha que virasse animal diferente conforme a emoção não seria
 * ilustração: seria uma leitura clínica sobre quem escolheu, e o produto não
 * produz nenhuma.
 */

export type StateId =
  | "intro"
  | "newcomer.notice"
  | "newcomer.form"
  | "newcomer.decide"
  | "newcomer.result"
  | "explore"
  | "returning";

export type NoticeId = "idea" | "feeling" | "question" | "decision" | "unnamed";

export type FormId = "clear" | "tangled" | "carry" | "rest";

export type DecideId = "carry" | "keep" | "cross" | "rest";

export type DoorId = "assigned" | "personal";

export type ExperienceState = {
  id: StateId;
  notice: NoticeId | null;
  form: FormId | null;
  decide: DecideId | null;
  door: DoorId | null;
};

export type ExperienceEvent =
  | { type: "begin" }
  | { type: "explore" }
  | { type: "returning" }
  | { type: "notice"; id: NoticeId }
  | { type: "form"; id: FormId }
  | { type: "decide"; id: DecideId }
  | { type: "door"; id: DoorId }
  | { type: "advance" }
  | { type: "back" }
  | { type: "restart" };

export const initialExperienceState: ExperienceState = {
  id: "intro",
  notice: null,
  form: null,
  decide: null,
  door: null,
};

export const noticeIds: readonly NoticeId[] = [
  "idea",
  "feeling",
  "question",
  "decision",
  "unnamed",
];

export const formIds: readonly FormId[] = ["clear", "tangled", "carry", "rest"];

export const decideIds: readonly DecideId[] = [
  "carry",
  "keep",
  "cross",
  "rest",
];

/**
 * A decisão escolhe o objeto. Quatro intenções, quatro formas, e nenhuma delas
 * é uma leitura sobre quem escolheu.
 */
export function resultOf(decide: DecideId): OrigamiResultId {
  switch (decide) {
    case "carry":
      return "boat";
    case "keep":
      return "box";
    case "cross":
      return "crane";
    case "rest":
      return "suspended-sheet";
  }
}

/**
 * O papel só ganha cor quando ganha forma.
 *
 * Durante o ritual a folha é sempre lilás — é matéria, não resultado. Isto
 * mantém a cor fora do papel de codificar o que a pessoa notou, que seria
 * simbolismo clínico barato.
 */
export function paperOf(state: ExperienceState): PaperFamilyId {
  if (state.id !== "newcomer.result" || !state.decide) return "lilac";
  switch (resultOf(state.decide)) {
    case "boat":
      return "apricot";
    case "box":
      return "jade";
    case "crane":
      return "mist";
    case "suspended-sheet":
      return "lilac";
  }
}

/** A mesma folha em cada estado. Nunca aparece um objeto sem passar por aqui. */
export function modelOf(state: ExperienceState): OrigamiModelId {
  switch (state.id) {
    case "newcomer.notice":
      return state.notice ? "suspended-sheet" : "sheet";
    case "newcomer.form":
      return state.form ? "half-fold" : "suspended-sheet";
    case "newcomer.decide":
      return "half-fold";
    case "newcomer.result":
      return state.decide ? resultOf(state.decide) : "half-fold";
    case "returning":
      return "box";
    case "explore":
      return "crane";
    case "intro":
      return "sheet";
  }
}

/** Só há uma ação principal disponível quando a escolha do passo foi feita. */
export function canAdvance(state: ExperienceState): boolean {
  switch (state.id) {
    case "newcomer.notice":
      return state.notice !== null;
    case "newcomer.form":
      return state.form !== null;
    case "newcomer.decide":
      return state.decide !== null;
    default:
      return false;
  }
}

const forward: Partial<Record<StateId, StateId>> = {
  "newcomer.notice": "newcomer.form",
  "newcomer.form": "newcomer.decide",
  "newcomer.decide": "newcomer.result",
};

const backward: Partial<Record<StateId, StateId>> = {
  "newcomer.notice": "intro",
  "newcomer.form": "newcomer.notice",
  "newcomer.decide": "newcomer.form",
  "newcomer.result": "newcomer.decide",
  explore: "intro",
  returning: "intro",
};

export function reduceExperience(
  state: ExperienceState,
  event: ExperienceEvent,
): ExperienceState {
  switch (event.type) {
    case "begin":
      return { ...state, id: "newcomer.notice" };
    case "explore":
      return { ...initialExperienceState, id: "explore" };
    case "returning":
      return { ...initialExperienceState, id: "returning" };
    case "notice":
      return { ...state, id: "newcomer.notice", notice: event.id };
    case "form":
      return { ...state, id: "newcomer.form", form: event.id };
    case "decide":
      return { ...state, id: "newcomer.decide", decide: event.id };
    case "door":
      return { ...state, id: "returning", door: event.id };
    case "advance": {
      if (!canAdvance(state)) return state;
      const next = forward[state.id];
      return next ? { ...state, id: next } : state;
    }
    case "back": {
      const previous = backward[state.id];
      if (!previous) return state;
      // Voltar atrás desfaz a escolha do passo que se abandona. Sem isto, o
      // botão principal do passo anterior ficava ativo com uma escolha que já
      // não está visível em lado nenhum.
      if (state.id === "newcomer.result") {
        return { ...state, id: previous, decide: null };
      }
      if (state.id === "newcomer.decide") {
        return { ...state, id: previous, decide: null, form: null };
      }
      if (state.id === "newcomer.form") {
        return { ...state, id: previous, form: null };
      }
      return { ...initialExperienceState, id: previous };
    }
    case "restart":
      return initialExperienceState;
  }
}
