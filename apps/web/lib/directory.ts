import type { Locale } from "@alem-da-sessao/i18n";

/**
 * O diretório verificado — relatório v2 §8.2 (regra F3) e §11 Fase 2.
 *
 * A regra que governa este ficheiro inteiro:
 *
 * > **F3 — o encontro com o profissional acontece por filtros declarados e
 * > verificáveis** — país, região, modalidade, língua, área de atuação —
 * > **nunca pelo que a pessoa escreveu.**
 *
 * É por isso que `DirectoryQuery` não tem — e não pode vir a ter — nenhum
 * campo derivado de `tool_runs`, de uma ponte ou de um artefacto. A busca
 * recebe factos declarados pelo profissional e escolhas explícitas de quem
 * procura. Nada mais entra. `check:privacy` falha o build se algo derivado de
 * conteúdo aparecer aqui.
 *
 * O contexto: a FTC multou o BetterHelp em US$ 7,8M por partilhar respostas de
 * um questionário de saúde com plataformas de publicidade. No momento em que
 * as experiências públicas viram funil de aquisição, tudo o que a pessoa
 * escreve nelas passa a ser dado de saúde recolhido com finalidade comercial.
 *
 * Consequência de produto: a transição da experiência para o diretório é **um
 * convite neutro**, não uma recomendação personalizada. *"Quer procurar um
 * profissional?"* e nunca *"Com base no que escreveu, recomendamos a Dra. X."*
 * A segunda formulação é simultaneamente ilegal, antiética e clinicamente
 * indefensável.
 */

export type Modality = "online" | "presential";
export type Country = "PT" | "BR";

/**
 * Os únicos eixos de busca permitidos. Deliberadamente fechados: acrescentar
 * um campo aqui é uma decisão de conformidade, não uma melhoria de UX.
 */
export type DirectoryQuery = {
  country?: Country;
  region?: string;
  modality?: Modality;
  language?: string;
  /** Área declarada pelo profissional, de uma lista fechada. */
  focus?: string;
};

export type DirectoryProfile = {
  id: string;
  name: string;
  /** Cédula profissional (OPP em Portugal, CRP no Brasil). */
  licence: string;
  country: Country;
  region: string;
  modalities: readonly Modality[];
  languages: readonly string[];
  focuses: readonly string[];
  /**
   * Verificação manual, à mão, como manda o arranque de marketplace do §11:
   * 10–20 profissionais semeados antes de existir funil.
   */
  verifiedAt: string;
  statement: string;
};

/** Áreas declaradas — lista fechada e editorial, nunca texto livre indexado. */
export const directoryFocuses: Record<Locale, Record<string, string>> = {
  "pt-PT": {
    anxiety: "Ansiedade",
    grief: "Luto e perda",
    relationships: "Relações",
    work: "Trabalho e exaustão",
    identity: "Identidade",
  },
  "pt-BR": {
    anxiety: "Ansiedade",
    grief: "Luto e perda",
    relationships: "Relações",
    work: "Trabalho e esgotamento",
    identity: "Identidade",
  },
};

const profiles: readonly DirectoryProfile[] = [
  {
    id: "prof_fixture_01",
    name: "Dra. Inês Almeida",
    licence: "OPP 12345 · demonstração",
    country: "PT",
    region: "Lisboa",
    modalities: ["online", "presential"],
    languages: ["Português", "Inglês"],
    focuses: ["anxiety", "work"],
    verifiedAt: "2026-07-20",
    statement:
      "Trabalho sobretudo com adultos, em processos longos. Não faço avaliação psicológica nem peritagem.",
  },
  {
    id: "prof_fixture_02",
    name: "Dr. Bruno Carvalho",
    licence: "CRP 06/98765 · demonstração",
    country: "BR",
    region: "São Paulo",
    modalities: ["online"],
    languages: ["Português"],
    focuses: ["grief", "relationships"],
    verifiedAt: "2026-07-18",
    statement:
      "Atendo por videochamada em plataforma própria. Primeira conversa sem custo para vermos se faz sentido.",
  },
  {
    id: "prof_fixture_03",
    name: "Dra. Helena Sá",
    licence: "OPP 54321 · demonstração",
    country: "PT",
    region: "Porto",
    modalities: ["presential"],
    languages: ["Português", "Espanhol"],
    focuses: ["identity", "relationships"],
    verifiedAt: "2026-07-22",
    statement:
      "Abordagem psicodinâmica. Sessões semanais, presenciais, no centro do Porto.",
  },
];

/**
 * A busca. Note-se o que a assinatura torna impossível: não há parâmetro por
 * onde conteúdo de experiência possa entrar, nem sequer opcional.
 */
export function searchDirectory(
  query: DirectoryQuery = {},
): readonly DirectoryProfile[] {
  return profiles.filter((profile) => {
    if (query.country && profile.country !== query.country) return false;
    if (query.region && profile.region !== query.region) return false;
    if (query.modality && !profile.modalities.includes(query.modality)) {
      return false;
    }
    if (query.language && !profile.languages.includes(query.language)) {
      return false;
    }
    if (query.focus && !profile.focuses.includes(query.focus)) return false;
    return true;
  });
}

export function listRegions(country?: Country): readonly string[] {
  return [
    ...new Set(
      profiles
        .filter((profile) => !country || profile.country === country)
        .map((profile) => profile.region),
    ),
  ];
}
