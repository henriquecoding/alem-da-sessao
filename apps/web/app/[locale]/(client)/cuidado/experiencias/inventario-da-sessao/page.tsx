import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SessionInventoryExperience } from "@/components/session-inventory-experience";
import { resolveLocale } from "@/lib/locale";
import { requireRunnableTool } from "@/lib/tool-access";

export default async function SessionInventoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, segment } = await resolveLocale(params);
  requireRunnableTool("inventario-da-sessao", "client");

  return (
    <div className="experience-inventory-canvas surface-inventory -mx-4 -mt-6 min-h-[calc(100vh-60px)] px-4 py-7 sm:-mx-6 sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8 lg:py-10">
      <div className="mx-auto mb-12 flex max-w-6xl items-center justify-between">
        <Link
          href={`/${segment}/cuidado/experiencias`}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="size-4" />
          Experiências
        </Link>
        <Badge tone="info">
          <ShieldCheck className="mr-1.5 size-3.5" />
          Demonstração local
        </Badge>
      </div>

      <header className="mx-auto mb-10 max-w-3xl text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--info)]">
          Experiência 02
        </p>
        <h1 className="editorial mt-4 text-balance text-[clamp(2.5rem,1.2rem+4.6vw,4.5rem)] font-medium leading-[0.98] tracking-[-0.045em]">
          Inventário da Sessão
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[var(--muted-foreground)]">
          Um ritual breve para dar lugar ao que continuou consigo depois da
          conversa, sem transformar a experiência numa redação.
        </p>
      </header>

      <SessionInventoryExperience locale={locale} />
    </div>
  );
}
