import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  CircleDotDashed,
  HandHeart,
  ShieldCheck,
} from "lucide-react";
import { LoadStructuresCommunity } from "@/components/load-structures-community";
import { LoadStructuresExperience } from "@/components/load-structures-experience";
import { listPublicLoadStructures } from "@/lib/community/store";
import { localPath, resolveLocale } from "@/lib/locale";
import { requireRunnableTool } from "@/lib/tool-access";

export const metadata: Metadata = {
  title: "Estruturas de Carga — experiência gratuita",
  description:
    "Construa anonimamente uma planta das responsabilidades que sustenta e ofereça apoio a outras estruturas.",
};

export const dynamic = "force-dynamic";

export default async function PublicLoadStructuresPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, segment } = await resolveLocale(params);
  requireRunnableTool("estruturas-de-carga", "public");
  const isPortugal = locale === "pt-PT";
  const posts = await listPublicLoadStructures();

  return (
    <main className="overflow-hidden bg-[#101114] text-[#efebe3]">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_15%_0%,rgba(194,104,55,.13),transparent_36rem),linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] [background-size:auto,36px_36px,36px_36px]" />

        <div className="relative mx-auto max-w-[1320px] px-4 pb-20 pt-6 sm:px-6 lg:px-10 lg:pb-28 lg:pt-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
            <Link
              href={localPath(segment, "/experiencias")}
              className="inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-semibold text-[#a3a7b0] transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4" />
              {isPortugal ? "Experiências gratuitas" : "Experiências gratuitas"}
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-[#454953] bg-[#191b20] px-3 font-mono text-[9px] uppercase tracking-[0.15em] text-[#9da2ad]">
                <ShieldCheck className="size-3 text-[#cb7d49]" />
                {isPortugal ? "Sem conta · gratuito" : "Sem conta · gratuito"}
              </span>
              <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-[#765039] bg-[#2a211d] px-3 font-mono text-[9px] uppercase tracking-[0.15em] text-[#e1a679]">
                <HandHeart className="size-3" />
                {isPortugal ? "comunidade anónima" : "comunidade anônima"}
              </span>
            </div>
          </div>

          <header className="grid gap-10 py-12 lg:grid-cols-[1fr_380px] lg:items-end lg:py-20">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d1844f]">
                Experiência pública 01 · engenharia de continuidade
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
                  ? "Torne visível a arquitetura do que sustenta. No fim, pode mantê-la privada ou depositar apenas a estrutura na parede anónima."
                  : "Torne visível a arquitetura do que você sustenta. No fim, você pode mantê-la privada ou depositar apenas a estrutura na parede anônima."}
              </p>
              <p className="mt-4 text-xs leading-6 text-[#858b96]">
                {isPortugal
                  ? "Cinco etapas · cerca de 7 minutos · publicação opcional"
                  : "Cinco etapas · cerca de 7 minutos · publicação opcional"}
              </p>
            </div>
          </header>

          <LoadStructuresExperience locale={locale} community />
        </div>
      </div>

      <LoadStructuresCommunity locale={locale} initialPosts={posts} />
    </main>
  );
}
