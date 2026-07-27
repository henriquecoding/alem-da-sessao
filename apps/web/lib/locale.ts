import {
  isLocaleSegment,
  localeFromSegment,
  type Locale,
  type LocaleSegment,
} from "@alem-da-sessao/i18n";
import { notFound } from "next/navigation";

export async function resolveLocale(
  params: Promise<{ locale: string }>,
): Promise<{ locale: Locale; segment: LocaleSegment }> {
  const { locale: rawLocale } = await params;

  if (!isLocaleSegment(rawLocale)) {
    notFound();
  }

  return {
    locale: localeFromSegment(rawLocale),
    segment: rawLocale,
  };
}

export function localPath(segment: LocaleSegment, path = "") {
  return `/${segment}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Troca o segmento de língua mantendo tudo o resto.
 *
 * Estava dentro do componente, em duas linhas que só sabiam de `pathname`.
 * Isso perdia a query e o fragmento — mudar de língua a meio de um diretório
 * filtrado devolvia o diretório sem filtros, e ninguém percebia porquê. Aqui
 * a troca é uma função com um teste, e é a única no produto.
 *
 * Um caminho sem segmento de língua nenhum recebe um: é o que acontece a quem
 * chega por um link antigo.
 */
export function swapLocaleSegment(
  pathname: string,
  to: LocaleSegment,
  search = "",
  hash = "",
): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const rest = path.replace(/^\/pt-(?:pt|br)(?=\/|$)/i, "");
  const query = search && !search.startsWith("?") ? `?${search}` : search;
  const fragment = hash && !hash.startsWith("#") ? `#${hash}` : hash;

  return `/${to}${rest}${query}${fragment}`;
}

/** A outra língua. Com duas, «a outra» é uma resposta e não uma lista. */
export function otherSegment(segment: LocaleSegment): LocaleSegment {
  return segment === "pt-pt" ? "pt-br" : "pt-pt";
}

/**
 * As diferenças reais entre as duas variantes, escritas para quem escolhe.
 *
 * Um seletor que diz só «PT» e «BR» obriga a adivinhar o que muda — e o que
 * muda aqui não é a língua, é a ortografia, o tratamento e o vocabulário
 * clínico. Dizer isso no menu evita a troca feita à experiência.
 */
export const localePresentation = {
  "pt-pt": {
    name: "Português",
    region: "Portugal",
    /** O tratamento é a diferença que se nota primeiro. */
    sample: "Pode parar a meio.",
    flagLabel: "PT",
  },
  "pt-br": {
    name: "Português",
    region: "Brasil",
    sample: "Você pode parar no meio.",
    flagLabel: "BR",
  },
} as const satisfies Record<
  LocaleSegment,
  { name: string; region: string; sample: string; flagLabel: string }
>;
