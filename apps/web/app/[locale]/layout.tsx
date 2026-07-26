import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/newsreader";
import "../globals.css";
import { locales } from "@alem-da-sessao/i18n";
import { resolveLocale } from "@/lib/locale";

export const metadata: Metadata = {
  metadataBase: new URL("https://alemdasessao.com"),
  title: {
    default: "Além da Sessão",
    template: "%s · Além da Sessão",
  },
  description:
    "Continuidade terapêutica conduzida por profissionais, com privacidade e presença humana.",
  applicationName: "Além da Sessão",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({
    locale: locale.toLowerCase(),
  }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await resolveLocale(params);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
