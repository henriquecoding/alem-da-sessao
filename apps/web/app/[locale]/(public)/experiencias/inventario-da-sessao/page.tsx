import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { SessionInventoryExperience } from "@/components/session-inventory-experience";
import { localPath, resolveLocale } from "@/lib/locale";
import { requireRunnableTool } from "@/lib/tool-access";

export const metadata: Metadata = {
  title: "Inventário da Sessão — experiência gratuita",
};

export default async function PublicSessionInventoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, segment } = await resolveLocale(params);
  requireRunnableTool("inventario-da-sessao", "public");

  return (
    <main className="min-h-screen bg-[linear-gradient(145deg,var(--background)_0%,#eef3fa_48%,#f7edf4_100%)] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto mb-12 flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <Link
          href={localPath(segment, "/experiencias")}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="size-4" />
          Experiências gratuitas
        </Link>
        <span className="inline-flex min-h-8 items-center gap-2 rounded-full bg-[var(--success-soft)] px-3 text-xs font-semibold text-[var(--success)]">
          <LockKeyhole className="size-3.5" />
          Sem conta · rascunho privado
        </span>
      </div>

      <header className="mx-auto mb-10 max-w-3xl text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--info)]">
          Experiência pública 02
        </p>
        <h1 className="editorial mt-4 text-balance text-[clamp(2.5rem,1.2rem+4.6vw,4.5rem)] font-medium leading-[0.98] tracking-[-0.045em]">
          Inventário da Sessão
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[var(--muted-foreground)]">
          Um ritual breve e gratuito para dar lugar ao que continuou depois da
          conversa. Este inventário não entra na parede comunitária.
        </p>
      </header>

      <SessionInventoryExperience locale={locale} />
    </main>
  );
}
