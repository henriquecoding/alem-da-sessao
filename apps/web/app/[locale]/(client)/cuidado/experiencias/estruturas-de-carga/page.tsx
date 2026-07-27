import Link from "next/link";
import {
  ArrowLeft,
  CircleDotDashed,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { LoadStructuresExperience } from "@/components/load-structures-experience";
import { resolveLocale } from "@/lib/locale";

export default async function LoadStructuresPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, segment } = await resolveLocale(params);
  const isPortugal = locale === "pt-PT";

  return (
    <div className="-mx-4 -mt-6 min-h-[calc(100vh-60px)] overflow-hidden bg-[#101114] text-[#efebe3] sm:-mx-6 lg:-mx-8 lg:-mt-8">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_15%_0%,rgba(194,104,55,.13),transparent_36rem),linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] [background-size:auto,36px_36px,36px_36px]" />

        <div className="relative mx-auto max-w-[1320px] px-4 pb-20 pt-6 sm:px-6 lg:px-10 lg:pb-28 lg:pt-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
            <Link
              href={`/${segment}/cuidado/experiencias`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-semibold text-[#a3a7b0] transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4" />
              {isPortugal
                ? "Biblioteca de experiências"
                : "Biblioteca de experiências"}
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-[#454953] bg-[#191b20] px-3 font-mono text-[9px] uppercase tracking-[0.15em] text-[#9da2ad]">
                <LockKeyhole className="size-3 text-[#cb7d49]" />
                {isPortugal ? "Rascunho privado" : "Rascunho privado"}
              </span>
              <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-[#765039] bg-[#2a211d] px-3 font-mono text-[9px] uppercase tracking-[0.15em] text-[#e1a679]">
                <ShieldCheck className="size-3" />
                v0.3 · demonstração
              </span>
            </div>
          </div>

          <header className="grid gap-10 py-12 lg:grid-cols-[1fr_360px] lg:items-end lg:py-20">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d1844f]">
                Experiência 01 · engenharia de continuidade
              </p>
              <h1 className="mt-5 max-w-4xl text-balance font-serif text-[clamp(2.9rem,1.4rem+5.4vw,5.4rem)] font-medium leading-[0.92] tracking-[-0.055em]">
                Estruturas
                <br />
                de Carga
              </h1>
            </div>
            <div className="border-l border-[#b66b3c]/50 pl-6">
              <CircleDotDashed className="size-6 text-[#d1844f]" />
              <p className="mt-5 font-serif text-xl leading-8 text-[#d7d2c9]">
                {isPortugal
                  ? "Torne visível a arquitetura do que sustenta — sem reduzir a pessoa a um resultado."
                  : "Torne visível a arquitetura do que você sustenta — sem reduzir a pessoa a um resultado."}
              </p>
              <p className="mt-4 text-xs leading-6 text-[#858b96]">
                {isPortugal
                  ? "Cinco etapas · cerca de 12 minutos · respostas reversíveis"
                  : "Cinco etapas · cerca de 12 minutos · respostas reversíveis"}
              </p>
            </div>
          </header>

          <LoadStructuresExperience locale={locale} />
        </div>
      </div>
    </div>
  );
}
