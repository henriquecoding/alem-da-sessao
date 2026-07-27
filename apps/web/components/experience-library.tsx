import type { CSSProperties } from "react";
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
      className="ease-(--ease-out-quint) h-44 w-auto drop-shadow-[0_26px_30px_rgba(0,0,0,.34)] transition-transform duration-700 group-hover:-translate-y-1.5 group-hover:scale-[1.03] sm:h-56 lg:h-64"
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
      className="ease-(--ease-out-quint) relative h-60 w-56 transition-transform duration-700 group-hover:-translate-y-1 group-hover:-rotate-1"
    >
      {/* Os hexadecimais fixos que aqui estavam eram a paleta antiga — azul,
          rosa e roxo — e ficavam a gritar contra a base quente. Passa tudo por
          tokens, portanto a ilustração acompanha a paleta e o modo escuro. */}
      <span className="ease-(--ease-out-quint) absolute inset-x-2 top-5 h-48 rotate-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--pigment-stone)] shadow-[var(--shadow-md)] transition-transform duration-700 group-hover:rotate-6" />
      <span className="ease-(--ease-out-quint) absolute inset-x-3 top-1 h-48 -rotate-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--pigment-clay)] shadow-[var(--shadow-md)] transition-transform duration-700 group-hover:-rotate-6" />
      <span className="absolute inset-x-0 top-7 h-48 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)]">
        <span className="block h-1.5 w-16 rounded-full bg-[var(--primary)]" />
        <span className="mt-5 block h-px bg-[var(--border)]" />
        <span className="mt-5 block h-1.5 w-28 rounded-full bg-[var(--border-strong)]" />
        <span className="mt-3 block h-1.5 w-24 rounded-full bg-[var(--border)]" />
        <span className="mt-3 block h-1.5 w-16 rounded-full bg-[var(--muted)]" />
        <span className="mt-6 flex gap-2.5">
          <span className="size-8 rounded-full bg-[var(--pigment-sage)]" />
          <span className="size-8 rounded-full bg-[var(--pigment-ochre)]" />
          <span className="size-8 rounded-full bg-[var(--pigment-rose)]" />
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
      <div className="reveal">
        <article className="lift group relative overflow-hidden rounded-[2rem] border border-[#2f3239] bg-[#15171b] text-[#f0ece4] shadow-[var(--shadow-lg)] hover:border-[#454a55]">
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
                className="ease-(--ease-out-quint) mt-9 inline-flex min-h-12 w-fit items-center gap-3 whitespace-nowrap rounded-full bg-[var(--ember)] px-6 text-sm font-semibold text-[#17181b] shadow-[var(--shadow-ember)] transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[var(--ember-strong)] hover:shadow-[0_2px_4px_rgba(0,0,0,.32),0_10px_26px_rgba(188,101,50,.26)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ember-strong)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#15171b] active:translate-y-px"
              >
                {actions[surface]}
                <ArrowRight className="size-4" />
              </Link>
            </div>
            {/* The artwork now fills its panel and the caption sits in reserved
              space beneath it, instead of a small mark adrift in a black void
              with the caption printed across its base. */}
            <div className="relative flex min-h-72 flex-col overflow-hidden border-t border-[#2f3239] bg-[#111316] lg:min-h-full lg:border-l lg:border-t-0">
              <span
                aria-hidden="true"
                className="bg-[#cf763f]/12 pointer-events-none absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
              />
              <div className="relative flex flex-1 items-center justify-center px-8 py-8">
                <span
                  aria-hidden="true"
                  className="absolute bottom-8 left-1/2 h-8 w-40 -translate-x-1/2 rounded-[50%] bg-black/60 blur-xl"
                />
                <StructuralMark />
              </div>
              <p className="relative border-t border-[#24262b] px-5 py-3.5 text-center font-mono text-[8px] uppercase tracking-[0.18em] text-[#6d7381]">
                massa · proveniência · ancoragem
              </p>
            </div>
          </div>
        </article>
      </div>

      <div className="reveal" style={{ "--d": 1 } as CSSProperties}>
        <article className="lift group overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]">
          <div className="grid min-h-[360px] lg:grid-cols-[310px_1fr]">
            {/* Era um gradiente azul-rosa fixo, o anti-padrão #4. Agora é uma
                superfície quente chapada com o mesmo grão do resto. */}
            <div className="material relative flex items-center justify-center overflow-hidden border-b border-[var(--border)] bg-[var(--background-deep)] p-8 lg:border-b-0 lg:border-r">
              <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(104,72,198,.05)_1px,transparent_1px)] [background-size:100%_28px]" />
              <InventoryMark />
            </div>
            <div className="flex flex-col p-6 sm:p-9 lg:p-11">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[var(--pigment-stone)] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--info)]">
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
                className="ease-(--ease-out-quint) mt-8 inline-flex min-h-12 w-fit items-center gap-3 whitespace-nowrap rounded-full border border-[var(--border)] bg-white px-6 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-xs)] transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 active:translate-y-px"
              >
                {actions[surface]}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
