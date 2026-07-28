import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@fontsource-variable/inter";
import "../globals.css";
import "../origami-lab.css";

/**
 * O laboratório vive fora do site.
 *
 * Não está sob `[locale]`, portanto não herda o cabeçalho, o rodapé nem a
 * navegação pública; não está no `sitemap`; e o `robots` do produto já recusa
 * indexação. Mais importante do que isso: **não existe em produção.** Um
 * `notFound()` no layout é a única garantia que não depende de alguém se
 * lembrar de tirar uma rota antes de publicar.
 *
 * O `proxy.ts` exclui `/dev` do redirecionamento de língua, porque uma rota
 * interna de comparação visual não tem duas variantes editoriais — tem uma,
 * escrita para quem está a decidir.
 */
export const metadata: Metadata = {
  title: "Laboratório interno",
  robots: { index: false, follow: false, noarchive: true, nocache: true },
};

export default function DevLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <html lang="pt-PT">
      <body className="bg-[var(--background)] text-[var(--foreground)] antialiased">
        {children}
      </body>
    </html>
  );
}
