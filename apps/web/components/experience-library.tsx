import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  FileLock2,
  Layers3,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import type { Locale, LocaleSegment } from "@alem-da-sessao/i18n";
import { toolRegistry } from "@alem-da-sessao/tool-registry";
import { localPath } from "@/lib/locale";

type Surface = "public" | "client" | "professional";

function StructuralMark() {
  return (
    <svg
      viewBox="0 0 220 260"
      aria-hidden="true"
      className="h-56 w-44 drop-shadow-[0_26px_30px_rgba(0,0,0,.34)] transition-transform duration-500 group-hover:translate-y-1"
    >
      <defs>
        <linearGradient id="catalog-monolith" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#424650" />
          <stop offset=".5" stopColor="#25282e" />
          <stop offset="1" stopColor="#15171a" />
        </linearGradient>
        <pattern
          id="catalog-lines"
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-11)"
        >
          <path
            d="M0 2H16 M0 9H16"
            stroke="#d28751"
            strokeOpacity=".38"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <path
        d="M34 235 29 82 51 46 165 27 193 69 188 235Z"
        fill="url(#catalog-monolith)"
        stroke="#656b76"
        strokeWidth="2"
      />
      <path
        d="M34 235 29 82 51 46 165 27 193 69 188 235Z"
        fill="url(#catalog-lines)"
      />
      <path
        d="M48 229H176"
        stroke="#dd915c"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function InventoryMark() {
  return (
    <div
      aria-hidden="true"
      className="relative h-48 w-44 transition-transform duration-500 group-hover:-rotate-1"
    >
      <span className="absolute inset-x-2 top-4 h-40 rotate-3 rounded-[1.4rem] border border-[#bdcad5] bg-[#dceaf7] shadow-[0_18px_45px_rgba(49,93,133,.12)]" />
      <span className="absolute inset-x-3 top-1 h-40 -rotate-3 rounded-[1.4rem] border border-[#e0c5d0] bg-[#f4d6e2] shadow-[0_18px_45px_rgba(83,54,67,.1)]" />
      <span className="absolute inset-x-0 top-6 h-40 rounded-[1.4rem] border border-[#d9d1c6] bg-[#fffcfa] p-5 shadow-[0_22px_55px_rgba(40,36,49,.14)]">
        <span className="block h-1.5 w-14 rounded-full bg-[#6b4ac8]" />
        <span className="mt-5 block h-px bg-[#ded8df]" />
        <span className="mt-4 block h-1.5 w-24 rounded-full bg-[#c5bec9]" />
        <span className="mt-3 block h-1.5 w-20 rounded-full bg-[#d5ced8]" />
        <span className="mt-6 flex gap-2">
          <span className="size-7 rounded-full bg-[#d7ecee]" />
          <span className="size-7 rounded-full bg-[#f7e6a8]" />
          <span className="size-7 rounded-full bg-[#ded6fa]" />
        </span>
      </span>
    </div>
  );
}

export function ExperienceLibrary({
  locale,
  segment,
  surface,
}: {
  locale: Locale;
  segment: LocaleSegment;
  surface: Surface;
}) {
  const loadTool = toolRegistry[0];
  const inventoryTool = toolRegistry[1];
  const isPortugal = locale === "pt-PT";
  const actions = {
    public: isPortugal ? "Começar gratuitamente" : "Começar gratuitamente",
    client: isPortugal ? "Entrar na experiência" : "Entrar na experiência",
    professional: isPortugal
      ? "Pré-visualizar percurso"
      : "Pré-visualizar percurso",
  };

  return (
    <div className="space-y-5">
      <article className="group relative overflow-hidden rounded-[2rem] border border-[#2f3239] bg-[#15171b] text-[#f0ece4] shadow-[0_28px_80px_rgba(35,30,45,.14)]">
        <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_82%_10%,rgba(207,118,63,.16),transparent_23rem),linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] [background-size:auto,32px_32px,32px_32px]" />
        <div className="relative grid min-h-[430px] lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col p-6 sm:p-9 lg:p-11">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#50545e] bg-[#1d1f24] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.17em] text-[#a4a8b1]">
                ENG-01 · estrutura ativa
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#7d5238] bg-[#2b211c] px-3 py-1.5 text-[10px] font-semibold text-[#df9d6d]">
                <LockKeyhole className="size-3" />
                {surface === "public"
                  ? isPortugal
                    ? "Anónima · publicação opcional"
                    : "Anônima · publicação opcional"
                  : "Privada por defeito"}
              </span>
            </div>
            <h2 className="mt-9 max-w-2xl font-serif text-4xl font-medium leading-[0.98] tracking-[-0.045em] sm:text-6xl">
              {loadTool.title[locale]}
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#a8acb5] sm:text-base">
              {loadTool.summary[locale]}
            </p>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[9px] uppercase tracking-[0.13em] text-[#828793]">
              <span className="inline-flex items-center gap-2">
                <Clock3 className="size-3.5 text-[#cd7f4c]" />
                {loadTool.estimatedMinutes} min
              </span>
              <span className="inline-flex items-center gap-2">
                <Layers3 className="size-3.5 text-[#cd7f4c]" />5 etapas
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-[#cd7f4c]" />
                snapshot explícito
              </span>
            </div>
            <Link
              href={localPath(
                segment,
                surface === "client"
                  ? `/cuidado/experiencias/${loadTool.slug}`
                  : `/experiencias/${loadTool.slug}`,
              )}
              className="mt-9 inline-flex min-h-12 w-fit items-center gap-3 rounded-full bg-[#d58b57] px-6 text-sm font-semibold text-[#17181b] transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-[#e3a372]"
            >
              {actions[surface]}
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="relative flex min-h-72 items-end justify-center overflow-hidden border-t border-[#2f3239] bg-[#111316] pt-10 lg:min-h-full lg:border-l lg:border-t-0">
            <div className="absolute inset-x-10 bottom-7 h-10 rounded-[50%] bg-black/50 blur-xl" />
            <StructuralMark />
            <p className="absolute bottom-5 right-5 font-mono text-[8px] uppercase tracking-[0.18em] text-[#606672]">
              massa · proveniência · ancoragem
            </p>
          </div>
        </div>
      </article>

      <article className="group overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_70px_rgba(40,36,49,.08)]">
        <div className="grid min-h-[360px] lg:grid-cols-[310px_1fr]">
          <div className="relative flex items-center justify-center overflow-hidden border-b border-[var(--border)] bg-[linear-gradient(145deg,#eef4fa,#f8edf1)] p-8 lg:border-b-0 lg:border-r">
            <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(104,72,198,.05)_1px,transparent_1px)] [background-size:100%_28px]" />
            <InventoryMark />
          </div>
          <div className="flex flex-col p-6 sm:p-9 lg:p-11">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--pastel-blue)] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--info)]">
                ENG-02 · inventário guiado
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--success-soft)] px-3 py-1.5 text-[10px] font-semibold text-[var(--success)]">
                <FileLock2 className="size-3" />
                Rascunho privado
              </span>
            </div>
            <h2 className="mt-8 max-w-xl font-serif text-4xl font-medium leading-none tracking-[-0.04em] sm:text-5xl">
              {inventoryTool.title[locale]}
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">
              {inventoryTool.summary[locale]}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[9px] uppercase tracking-[0.13em] text-[var(--muted-foreground)]">
              <span className="inline-flex items-center gap-2">
                <Clock3 className="size-3.5 text-[var(--primary)]" />
                {inventoryTool.estimatedMinutes} min
              </span>
              <span className="inline-flex items-center gap-2">
                <MessageSquareText className="size-3.5 text-[var(--primary)]" />
                próxima conversa
              </span>
            </div>
            <Link
              href={localPath(
                segment,
                surface === "client"
                  ? `/cuidado/experiencias/${inventoryTool.slug}`
                  : `/experiencias/${inventoryTool.slug}`,
              )}
              className="mt-8 inline-flex min-h-12 w-fit items-center gap-3 rounded-full border border-[var(--border)] bg-white px-6 text-sm font-semibold text-[var(--foreground)] transition-[border-color,transform] hover:-translate-y-0.5 hover:border-[var(--primary)]"
            >
              {actions[surface]}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
