import type { Locale } from "./index";

/**
 * Microcópia como sistema verificável — relatório v2 §7.5.
 *
 * A lacuna da alfabetização emocional (§3.6) é "Registo guardado com sucesso!"
 * para quem acabou de escrever sobre o pai que morreu. A defesa contra isso
 * não é boa vontade em revisão de PR: é um vocabulário fechado, com um teste
 * que falha o build quando uma frase proibida reaparece.
 *
 * Cada entrada documenta o que nunca se diz, para que o motivo sobreviva à
 * pessoa que escreveu a alternativa.
 *
 * **Regra número um: nunca perder o texto da pessoa.** Um erro que apaga o
 * que alguém escreveu sobre a coisa mais difícil da vida dela é uma falha de
 * gravidade máxima, e a microcópia de erro tem de o dizer explicitamente.
 */

/** Frases e padrões que não podem aparecer em texto voltado ao utilizador. */
export const forbiddenPhrases = [
  // Celebração de um ato que pode ter sido doloroso.
  "com sucesso",
  "sucesso!",
  "parabéns",
  "muito bem!",
  "boa!",
  "uhu",
  "yay",
  // Alarme e urgência fabricada.
  "não perca",
  "não perde",
  "última chance",
  "aja agora",
  "urgente!",
  "atenção!",
  // Voz de e-commerce e de erro genérico sobre relato de sofrimento.
  "ops!",
  "oops",
  "algo correu mal",
  "algo deu errado",
  "erro inesperado",
  // Vazios que soam a acusação ou a inventário.
  "não tem itens",
  "nenhum resultado",
  "nenhum registo",
  "nenhum registro",
  "sem acesso",
  "lista vazia",
  // Confirmação sem consequência declarada.
  "tem a certeza?",
  "tem certeza?",
  "deseja continuar?",
] as const;

export type VoiceKey =
  | "saved"
  | "emptyClient"
  | "emptyProfessional"
  | "withheld"
  | "error"
  | "discard"
  | "reminder"
  | "unattended"
  | "intervalOpen"
  | "intervalEmpty";

type VoiceEntry = {
  /** O que este texto nunca diz — mantido no código, não só no relatório. */
  never: string;
  "pt-PT": string;
  "pt-BR": string;
};

const entries: Record<VoiceKey, VoiceEntry> = {
  saved: {
    never: "Guardado com sucesso!",
    "pt-PT": "Guardado às {time}.",
    "pt-BR": "Salvo às {time}.",
  },
  emptyClient: {
    never: "Não tem itens",
    "pt-PT": "Nada por aqui, por enquanto.",
    "pt-BR": "Nada por aqui, por enquanto.",
  },
  emptyProfessional: {
    never: "Nenhum resultado",
    "pt-PT": "Nada pendente hoje.",
    "pt-BR": "Nada pendente hoje.",
  },
  withheld: {
    never: "Sem acesso",
    "pt-PT": "{name} guardou isto só para si.",
    "pt-BR": "{name} guardou isso só para si.",
  },
  error: {
    never: "Ops! Algo correu mal",
    "pt-PT":
      "Não conseguimos guardar. O seu texto continua aqui. Referência: {reference}.",
    "pt-BR":
      "Não conseguimos salvar. O seu texto continua aqui. Referência: {reference}.",
  },
  discard: {
    never: "Tem a certeza?",
    "pt-PT": "Isto desaparece sem deixar rasto. Não há como recuperar.",
    "pt-BR": "Isso desaparece sem deixar rastro. Não há como recuperar.",
  },
  reminder: {
    never: "Não perca!",
    "pt-PT": "Há algo à sua espera.",
    "pt-BR": "Há algo esperando por você.",
  },
  unattended: {
    never: "Estamos aqui para si 24/7",
    "pt-PT":
      "Ninguém está a ver o que escreve aqui. Esta plataforma não é monitorizada.",
    "pt-BR":
      "Ninguém está vendo o que você escreve aqui. Esta plataforma não é monitorada.",
  },
  intervalOpen: {
    never: "Você ainda não completou nada",
    "pt-PT": "Está no intervalo entre {from} e {to}.",
    "pt-BR": "Você está no intervalo entre {from} e {to}.",
  },
  intervalEmpty: {
    never: "Intervalo sem atividade",
    "pt-PT": "Este intervalo está vazio, e isso é normal.",
    "pt-BR": "Este intervalo está vazio, e isso é normal.",
  },
};

/**
 * Devolve a frase aprovada, com os marcadores `{...}` substituídos.
 *
 * Um marcador sem valor é um erro de programação, não algo para degradar
 * silenciosamente: preferimos falhar em teste a mostrar `{time}` a alguém.
 */
export function voice(
  key: VoiceKey,
  locale: Locale,
  values: Record<string, string | number> = {},
): string {
  const template = entries[key][locale];

  return template.replace(/\{(\w+)\}/g, (match, token: string) => {
    const value = values[token];
    if (value === undefined) {
      throw new Error(
        `voice(${key}) exige o marcador "${token}" e ele não foi fornecido.`,
      );
    }
    return String(value);
  });
}

/** Exposto para `check:claims` e para os testes de contrato da voz. */
export const voiceEntries = entries;
export const voiceKeys = Object.keys(entries) as VoiceKey[];
