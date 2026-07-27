import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/newsreader";
import "../globals.css";
import { locales } from "@alem-da-sessao/i18n";
import { RevealObserver } from "@/components/reveal-observer";
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
      <head>
        {/* Without scripting nothing reveals the deferred content, so it has
            to render in its final state. */}
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body>
        {children}
        <RevealObserver />
      </body>
    </html>
  );
}
