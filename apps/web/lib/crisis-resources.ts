import type { Locale } from "@alem-da-sessao/i18n";

/**
 * Recursos de crise por locale — relatório v2 §4.9 e §10.4.
 *
 * Com a porta A aberta existem pessoas a fazer experiências sozinhas, sem
 * profissional, possivelmente em sofrimento agudo, às 3 da manhã. A imunidade
 * estrutural do §1.3 — cliente grátis, profissional pagante — não cobre essa
 * pessoa: ela está exatamente na situação do Woebot.
 *
 * Três regras que governam este ficheiro:
 *
 * 1. **Acessíveis por escolha explícita, nunca num modal que interrompe.** A
 *    mensagem existe onde é procurada, não onde incomoda. Interromper alguém
 *    a meio de uma frase difícil com um aviso de crise é hostilidade
 *    disfarçada de cuidado.
 * 2. **Por locale, não traduzidos.** Um número português não serve a alguém
 *    no Brasil, e uma lista traduzida à letra é pior que nenhuma lista.
 * 3. **Mantidos editorialmente.** Números mudam. `lastReviewed` existe para
 *    que a desatualização seja visível em vez de silenciosa.
 *
 * Nada aqui infere risco a partir do que a pessoa escreveu (§5.5): a lista é
 * a mesma para toda a gente, sempre.
 */

export type CrisisResource = {
  name: string;
  contact: string;
  /** Quando atende, em linguagem simples. */
  availability: string;
  href?: string;
};

export type CrisisResources = {
  /** Revisão editorial mais recente desta lista (ISO). */
  lastReviewed: string;
  emergency: CrisisResource;
  lines: readonly CrisisResource[];
};

export const crisisResources: Record<Locale, CrisisResources> = {
  "pt-PT": {
    lastReviewed: "2026-07-27",
    emergency: {
      name: "Número Europeu de Emergência",
      contact: "112",
      availability: "sempre",
      href: "tel:112",
    },
    lines: [
      {
        name: "SNS 24",
        contact: "808 24 24 24",
        availability: "todos os dias, a qualquer hora",
        href: "tel:+351808242424",
      },
      {
        name: "SOS Voz Amiga",
        contact: "213 544 545",
        availability: "todos os dias, das 15h30 às 00h30",
        href: "tel:+351213544545",
      },
      {
        name: "Voz de Apoio",
        contact: "225 50 60 70",
        availability: "todos os dias, das 21h às 24h",
        href: "tel:+351225506070",
      },
      {
        name: "Telefone da Amizade",
        contact: "228 323 535",
        availability: "todos os dias, das 16h às 23h",
        href: "tel:+351228323535",
      },
    ],
  },
  "pt-BR": {
    lastReviewed: "2026-07-27",
    emergency: {
      name: "SAMU",
      contact: "192",
      availability: "sempre",
      href: "tel:192",
    },
    lines: [
      {
        name: "CVV — Centro de Valorização da Vida",
        contact: "188",
        availability: "todos os dias, a qualquer hora, ligação gratuita",
        href: "tel:188",
      },
      {
        name: "CVV por chat e e-mail",
        contact: "cvv.org.br",
        availability: "todos os dias, a qualquer hora",
        href: "https://www.cvv.org.br/",
      },
      {
        name: "CAPS — Centros de Atenção Psicossocial",
        contact: "unidade mais próxima pelo SUS",
        availability: "horário de funcionamento da unidade",
      },
      {
        name: "Bombeiros",
        contact: "193",
        availability: "sempre",
        href: "tel:193",
      },
    ],
  },
};

export function getCrisisResources(locale: Locale): CrisisResources {
  return crisisResources[locale];
}
