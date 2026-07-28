"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { Check, HandHeart, ShieldCheck } from "lucide-react";
import type { Locale } from "@alem-da-sessao/i18n";
import type { PublicLoadStructurePost } from "@alem-da-sessao/validation";
import { cn } from "@/lib/utils";

function structuralSeed(value: string) {
  return value.split("").reduce((hash, character) => {
    return (hash * 33 + character.charCodeAt(0)) >>> 0;
  }, 5381);
}

function CommunityMonolith({
  load,
}: {
  load: PublicLoadStructurePost["loads"][number];
}) {
  const patternId = `wall-${useId().replaceAll(":", "")}`;
  const seed = structuralSeed(load.id);
  const height = 72 + Math.min(88, load.durationMonths * 2.2);
  const width = 46 + load.impactScale * 10;
  const x = 90 - width / 2;
  const y = 182 - height;
  const tilt = (seed % 9) - 4;

  return (
    <svg viewBox="0 0 180 190" aria-hidden="true" className="h-40 w-32">
      <defs>
        <linearGradient id={`${patternId}-stone`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#4c5059" />
          <stop offset=".55" stopColor="#272a30" />
          <stop offset="1" stopColor="#15171a" />
        </linearGradient>
        <pattern
          id={`${patternId}-lines`}
          width="12"
          height="12"
          patternUnits="userSpaceOnUse"
          patternTransform={`rotate(${tilt * 3})`}
        >
          <path d="M0 2H12 M0 8H12" stroke="#d58b57" strokeOpacity=".33" />
        </pattern>
      </defs>
      <ellipse cx="90" cy="180" rx="59" ry="8" fill="#000" opacity=".34" />
      <path
        d={`M${x} 177 L${x - tilt} ${y + 13} L${x + width * 0.3} ${y} L${x + width + tilt} ${y + 10} L${x + width} 177 Z`}
        fill={`url(#${patternId}-stone)`}
        stroke="#656a75"
        strokeWidth="1.5"
      />
      <path
        d={`M${x} 177 L${x - tilt} ${y + 13} L${x + width * 0.3} ${y} L${x + width + tilt} ${y + 10} L${x + width} 177 Z`}
        fill={`url(#${patternId}-lines)`}
      />
      <path
        d={`M${x - 4} 178H${x + width + 4}`}
        stroke="#d58b57"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SupportGesture({
  postId,
  count,
  locale,
  onCount,
}: {
  postId: string;
  count: number;
  locale: Locale;
  onCount: (count: number) => void;
}) {
  const [progress, setProgress] = useState(0);
  const [supported, setSupported] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ownStructure, setOwnStructure] = useState(false);
  const frame = useRef<number | null>(null);
  const startedAt = useRef(0);
  const duration = 900;
  const isPortugal = locale === "pt-PT";

  function stop(reset = true) {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    if (reset && !supported) setProgress(0);
  }

  async function support() {
    if (supported || busy || ownStructure) return;
    setBusy(true);
    try {
      const response = await fetch(
        `/api/public/load-structures/${postId}/support`,
        { method: "POST" },
      );
      if (response.status === 409) {
        setOwnStructure(true);
        setProgress(0);
        return;
      }
      if (!response.ok) throw new Error("support-failed");
      const result = (await response.json()) as {
        supportCount: number;
        alreadySupported: boolean;
      };
      setSupported(true);
      setProgress(1);
      onCount(result.supportCount);
    } catch {
      setProgress(0);
    } finally {
      setBusy(false);
    }
  }

  function tick(now: number) {
    const next = Math.min(1, (now - startedAt.current) / duration);
    setProgress(next);
    if (next >= 1) {
      frame.current = null;
      void support();
      return;
    }
    frame.current = requestAnimationFrame(tick);
  }

  function start(event: PointerEvent<HTMLButtonElement>) {
    if (supported || busy || ownStructure) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    stop(false);
    startedAt.current = performance.now();
    frame.current = requestAnimationFrame(tick);
  }

  function keyboard(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    void support();
  }

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  return (
    <button
      type="button"
      disabled={busy || ownStructure}
      aria-pressed={supported}
      aria-label={
        ownStructure
          ? isPortugal
            ? "Não pode apoiar a sua própria estrutura"
            : "Você não pode apoiar sua própria estrutura"
          : supported
            ? isPortugal
              ? "Apoio oferecido"
              : "Apoio oferecido"
            : isPortugal
              ? "Manter premido para apoiar esta estrutura"
              : "Manter pressionado para apoiar esta estrutura"
      }
      onPointerDown={start}
      onPointerUp={() => stop()}
      onPointerCancel={() => stop()}
      onKeyDown={keyboard}
      className={cn(
        "relative min-h-14 w-full touch-none overflow-hidden rounded-xl border text-left outline-none focus-visible:ring-2 focus-visible:ring-[#dc8a52]",
        ownStructure
          ? "border-[#393d45] bg-[#14161a] opacity-70"
          : supported
            ? "border-[#8b5d42] bg-[#2d241f]"
            : "border-[#393d45] bg-[#191b20] hover:border-[#6a5547]",
      )}
    >
      <span
        className="absolute inset-y-0 left-0 bg-[#a95e35]/25"
        style={{ width: `${(supported ? 1 : progress) * 100}%` }}
      />
      <span className="relative flex items-center justify-between gap-4 px-4">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#d9d5ce]">
          {supported ? (
            <Check className="size-4 text-[#dc9563]" />
          ) : (
            <HandHeart className="size-4 text-[#dc9563]" />
          )}
          {ownStructure
            ? isPortugal
              ? "Esta estrutura é sua"
              : "Esta estrutura é sua"
            : supported
              ? isPortugal
                ? "Sustentou por um instante"
                : "Você sustentou por um instante"
              : progress > 0
                ? isPortugal
                  ? "A sustentar…"
                  : "Sustentando…"
                : isPortugal
                  ? "Manter para apoiar"
                  : "Segure para apoiar"}
        </span>
        <span className="font-mono text-[10px] text-[#858b96]">
          {count} {count === 1 ? "gesto" : "gestos"}
        </span>
      </span>
    </button>
  );
}

export function LoadStructuresCommunity({
  locale,
  initialPosts,
}: {
  locale: Locale;
  initialPosts: PublicLoadStructurePost[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  const isPortugal = locale === "pt-PT";

  useEffect(() => {
    async function refresh() {
      try {
        const response = await fetch("/api/public/load-structures");
        if (!response.ok) return;
        const result = (await response.json()) as {
          posts: PublicLoadStructurePost[];
        };
        setPosts(result.posts);
      } catch {
        // The current wall remains usable if a refresh fails.
      }
    }

    window.addEventListener("load-structure-published", refresh);
    return () =>
      window.removeEventListener("load-structure-published", refresh);
  }, []);

  return (
    <section
      id="parede-comunitaria"
      className="border-t border-[#2f3239] bg-[#0d0f11] px-4 py-20 text-[#f0ece4] sm:px-6 lg:py-28"
    >
      <div className="mx-auto max-w-[1240px]">
        <header className="grid gap-7 lg:grid-cols-[1fr_440px] lg:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d58b57]">
              Parede comunitária · presença sem exposição
            </p>
            <h2 className="mt-4 max-w-3xl text-balance font-serif text-5xl leading-[0.92] tracking-[-0.05em] sm:text-7xl">
              Ninguém precisa de sustentar tudo sozinho.
            </h2>
          </div>
          <div className="border-l border-[#8b5c40] pl-5">
            <p className="text-sm leading-7 text-[#a6aab3]">
              {isPortugal
                ? "Leia sem perfil e apoie sem aconselhar. Mantenha o gesto durante um instante: não abre conversa, não cria seguidores e não revela quem esteve aqui."
                : "Leia sem perfil e apoie sem aconselhar. Segure o gesto por um instante: ele não abre conversa, não cria seguidores e não revela quem esteve aqui."}
            </p>
          </div>
        </header>

        <div className="mt-12 columns-1 gap-5 md:columns-2 xl:columns-3">
          {posts.map((post, postIndex) => (
            <article
              key={post.id}
              className="mb-5 break-inside-avoid overflow-hidden rounded-[1.6rem] border border-[#30333a] bg-[#15171b]"
            >
              <div className="flex items-center justify-between border-b border-[#2d3037] px-5 py-4">
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#777d88]">
                  {isPortugal ? "Estrutura anónima" : "Estrutura anônima"}{" "}
                  {String(postIndex + 1).padStart(2, "0")}
                </span>
                <span
                  className="size-2 rounded-full bg-[#c57b4b]"
                  aria-label="Publicação moderada"
                />
              </div>

              <div className="grid gap-px bg-[#2d3037]">
                {post.loads.map((load) => (
                  <div
                    key={`${post.id}-${load.id}`}
                    className="grid grid-cols-[1fr_128px] items-end bg-[#191b20] px-5 pt-5"
                  >
                    <div className="pb-6">
                      <p className="font-serif text-xl leading-6 text-[#e9e5dd]">
                        {load.label}
                      </p>
                      <p className="mt-3 font-mono text-[9px] uppercase leading-5 tracking-[0.12em] text-[#777d88]">
                        impacto {load.impactScale}/5 · {load.durationMonths}{" "}
                        meses
                      </p>
                    </div>
                    <CommunityMonolith load={load} />
                  </div>
                ))}
              </div>

              <div className="p-5">
                <SupportGesture
                  postId={post.id}
                  count={post.supportCount}
                  locale={locale}
                  onCount={(supportCount) =>
                    setPosts((current) =>
                      current.map((item) =>
                        item.id === post.id ? { ...item, supportCount } : item,
                      ),
                    )
                  }
                />
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex items-start gap-3 rounded-2xl border border-[#30333a] bg-[#14161a] p-5 text-xs leading-6 text-[#8e939e]">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#c67a49]" />
          <p>
            {isPortugal
              ? "A parede não aceita comentários, contactos ou perfis. Escrita livre é revista; conteúdo identificável é bloqueado; estruturas expiram e podem ser ocultadas pela moderação."
              : "A parede não aceita comentários, contatos ou perfis. Texto livre é revisado; conteúdo identificável é bloqueado; estruturas expiram e podem ser ocultadas pela moderação."}
          </p>
        </div>
      </div>
    </section>
  );
}
