import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/newsreader";
import "../globals.css";
import { locales } from "@alem-da-sessao/i18n";
import { RevealObserver } from "@/components/reveal-observer";
import { resolveLocale } from "@/lib/locale";
import { themeBootstrapScript } from "@/lib/preferences";

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
        {/* Antes de qualquer pintura: se houver uma escolha de tema guardada,
            ela tem de estar no `<html>` já no primeiro frame. Sem isto há o
            flash claro que se vê em quase todos os sites com tema escuro.
            `suppressHydrationWarning` acima existe por causa deste atributo —
            o servidor não o pode conhecer, e é suposto assim. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>

      {/* O `<noscript>` que aqui repunha `.reveal` desapareceu, e ainda bem:
          só cobria scripting desligado, e o caso real era outro — a CSP a
          recusar o bundle. Agora `.reveal` só esconde dentro de `.js-reveal`,
          classe posta por quem sabe voltar a mostrar (`reveal-observer.tsx`),
          e a CSP deixou de recusar seja o que for (ADR-030). São duas defesas
          para a mesma falha, e é assim que deve ser: a da folha de estilos
          continua a valer no dia em que o bundle falhar por outra razão. */}
      <body>
        {children}
        <RevealObserver />
      </body>
    </html>
  );
}
