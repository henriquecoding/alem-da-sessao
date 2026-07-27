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
      {/* Isto é um retrato do produto, não o produto: um leitor de ecrã recebe
          a descrição e não os controlos falsos que há lá dentro (WCAG 1.1.1).

          Os dois halos que aqui estavam e o cromo de navegador com as três
          bolinhas saíram: "captura de ecrã dentro de uma janela falsa" é o
          cliché visual de toda a Camada A, e um halo colorido a pulsar é o
          anti-padrão #4. Uma moldura fina e uma sombra que descreve material
          dizem a mesma coisa sem pedir emprestada a estética de mais ninguém. */}
      <div
        role="img"
        aria-label="Retrato da área profissional: agenda do dia, próxima sessão com uma cliente e um aviso de partilha por rever. Todos os dados são fictícios."
        className="shadow-rested overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]"
      >
        <div
          aria-hidden="true"
          className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5 sm:px-5"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Área profissional
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Dados fictícios
          </span>
        </div>

        <div
          aria-hidden="true"
          className="grid min-h-[390px] grid-cols-[76px_1fr] sm:grid-cols-[170px_1fr]"
        >
          <aside className="surface-sidebar p-3 text-[var(--sidebar-foreground)] sm:p-4">
            <div className="mb-8 flex items-center gap-2">
              <span className="surface-sidebar-raised grid size-8 place-items-center rounded-xl">
                <Sparkles className="size-4 text-[var(--accent)]" />
              </span>
              <span className="hidden text-xs font-bold sm:block">
                Além da Sessão
              </span>
            </div>
            <div className="space-y-2">
              {["Hoje", "Agenda", "Clientes", "Experiências"].map(
                (item, index) => (
                  <div
                    key={item}
                    className={`flex h-10 items-center gap-2 rounded-xl px-3 text-xs ${
                      index === 0
                        ? "bg-[var(--sidebar-foreground)] text-[var(--sidebar)]"
                        : "text-[var(--sidebar-muted)]"
                    }`}
                  >
                    <span className="size-1.5 shrink-0 rounded-full bg-current" />
                    <span className="hidden sm:inline">{item}</span>
                  </div>
                ),
              )}
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
              <div className="surface-primary rounded-2xl p-4 text-[var(--primary-foreground)]">
                <div className="flex items-center justify-between">
                  <Badge className="surface-sidebar-raised">
                    Próxima sessão
                  </Badge>
                  <Clock3 className="size-4 text-[var(--sidebar-muted)]" />
                </div>
                <p className="mt-6 text-lg font-bold">Marta Oliveira</p>
                <p className="mt-1 text-xs text-[var(--sidebar-muted)]">
                  09:30 · Online · 50 min
                </p>
                {/* Desenho de um botão, não um botão: era focável e anunciado
                    como acionável sem fazer nada. */}
                <span className="mt-5 flex w-full items-center justify-between rounded-xl bg-[var(--surface)] px-3 py-2.5 text-left text-xs font-bold text-[var(--foreground)]">
                  Abrir contexto
                  <ChevronRight className="size-4" />
                </span>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--pigment-ochre)] p-4">
                  <CalendarDays className="size-4 text-[var(--primary)]" />
                  <p className="mt-3 text-2xl font-bold tracking-[-0.04em]">
                    4
                  </p>
                  <p className="text-[10px] text-[var(--muted-foreground)]">
                    sessões hoje
                  </p>
                </div>
                <div className="rounded-2xl bg-[var(--pigment-sage)] p-4">
                  <LockKeyhole className="size-4 text-[var(--accent-foreground)]" />
                  <p className="mt-3 text-xs font-bold">Privado por desenho</p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--pigment-sage)] text-[var(--success)]">
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
