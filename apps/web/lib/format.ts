import type { Locale } from "@alem-da-sessao/i18n";

export function timeZoneFor(locale: Locale) {
  return locale === "pt-BR" ? "America/Sao_Paulo" : "Europe/Lisbon";
}

export function formatDateTime(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timeZoneFor(locale),
  }).format(new Date(value));
}

export function formatTime(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timeZoneFor(locale),
  }).format(new Date(value));
}

export function formatCurrency(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: locale === "pt-BR" ? "BRL" : "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}
