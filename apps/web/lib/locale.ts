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
