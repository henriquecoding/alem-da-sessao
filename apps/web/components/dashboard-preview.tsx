import {
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[650px]">
      <div className="absolute -inset-5 -z-10 rounded-[2.4rem] bg-[var(--accent)]/10 blur-2xl" />
      <div className="overflow-hidden rounded-[1.8rem] border border-white/70 bg-[var(--surface)] shadow-[0_30px_90px_rgba(31,49,42,.16)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-[var(--accent)]" />
            <span className="size-2.5 rounded-full bg-[#edc868]" />
            <span className="size-2.5 rounded-full bg-[#8bbba4]" />
          </div>
          <span className="rounded-full bg-[var(--muted)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--muted-foreground)]">
            Dados fictícios
          </span>
        </div>

        <div className="grid min-h-[390px] grid-cols-[76px_1fr] sm:grid-cols-[170px_1fr]">
          <aside className="bg-[var(--sidebar)] p-3 text-white sm:p-4">
            <div className="mb-8 flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-xl bg-white/10">
                <Sparkles className="size-4 text-[var(--accent)]" />
              </span>
              <span className="hidden text-xs font-bold sm:block">
                Além da Sessão
              </span>
            </div>
            <div className="space-y-2">
              {["Hoje", "Agenda", "Clientes", "Experiências"].map((item, index) => (
                <div
                  key={item}
                  className={`flex h-10 items-center gap-2 rounded-xl px-3 text-xs ${
                    index === 0 ? "bg-white text-[var(--sidebar)]" : "text-white/58"
                  }`}
                >
                  <span className="size-1.5 shrink-0 rounded-full bg-current" />
                  <span className="hidden sm:inline">{item}</span>
                </div>
              ))}
            </div>
          </aside>

          <div className="min-w-0 p-4 sm:p-6">
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                Segunda-feira, 27 de julho
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-[-0.035em]">
                Bom dia, Inês.
              </h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1.25fr_.75fr]">
              <div className="rounded-2xl bg-[var(--primary)] p-4 text-white">
                <div className="flex items-center justify-between">
                  <Badge className="bg-white/14 text-white">Próxima sessão</Badge>
                  <Clock3 className="size-4 text-white/65" />
                </div>
                <p className="mt-6 text-lg font-bold">Marta Oliveira</p>
                <p className="mt-1 text-xs text-white/65">09:30 · Online · 50 min</p>
                <button className="mt-5 flex w-full items-center justify-between rounded-xl bg-white px-3 py-2.5 text-left text-xs font-bold text-[var(--foreground)]">
                  Abrir contexto
                  <ChevronRight className="size-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--pastel-lemon)] p-4">
                  <CalendarDays className="size-4 text-[var(--primary)]" />
                  <p className="mt-3 text-2xl font-bold tracking-[-0.04em]">4</p>
                  <p className="text-[10px] text-[var(--muted-foreground)]">
                    sessões hoje
                  </p>
                </div>
                <div className="rounded-2xl bg-[var(--pastel-lilac)] p-4">
                  <LockKeyhole className="size-4 text-[var(--accent-foreground)]" />
                  <p className="mt-3 text-xs font-bold">Privado por desenho</p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--pastel-mint)] text-[var(--success)]">
                <Check className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold">
                  Experiência partilhada para revisão
                </p>
                <p className="mt-0.5 text-[10px] text-[var(--muted-foreground)]">
                  O conteúdo só ficou visível após confirmação.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
