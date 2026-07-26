import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LoadStructuresExperience } from "@/components/load-structures-experience";
import { resolveLocale } from "@/lib/locale";

export default async function LoadStructuresPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, segment } = await resolveLocale(params);

  return (
    <div className="-mx-4 -mt-6 min-h-[calc(100vh-60px)] bg-[#18231f] px-4 py-7 text-white sm:-mx-6 sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8 lg:py-10">
      <div className="mx-auto mb-12 flex max-w-6xl items-center justify-between">
        <Link
          href={`/${segment}/cuidado/experiencias`}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm font-semibold text-white/58 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Experiências
        </Link>
        <Badge className="bg-white/8 text-white/58">
          <ShieldCheck className="mr-1.5 size-3.5" />
          Demonstração local
        </Badge>
      </div>

      <header className="mx-auto mb-10 max-w-3xl text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
          Experiência 01
        </p>
        <h1 className="editorial mt-4 text-5xl leading-none font-medium tracking-[-0.045em] sm:text-7xl">
          Estruturas de Carga
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/52">
          Uma forma de observar responsabilidades sem transformar a pessoa num
          número, num diagnóstico ou num pilar que não pode cair.
        </p>
      </header>

      <LoadStructuresExperience locale={locale} />
    </div>
  );
}
