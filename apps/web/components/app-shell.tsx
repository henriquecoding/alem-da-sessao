"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Activity,
  CalendarDays,
  ChevronLeft,
  CircleDollarSign,
  ClipboardCheck,
  ChartNoAxesCombined,
  ContactRound,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { localeFromSegment, type LocaleSegment } from "@alem-da-sessao/i18n";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Surface = "professional" | "client" | "admin";

const navigation = {
  professional: [
    { label: "Hoje", href: "/pro/hoje", icon: LayoutDashboard },
    { label: "Agenda", href: "/pro/agenda", icon: CalendarDays },
    { label: "Clientes", href: "/pro/clientes", icon: ContactRound },
    { label: "Experiências", href: "/pro/experiencias", icon: Sparkles },
    { label: "Relatórios", href: "/pro/relatorios", icon: ChartNoAxesCombined },
    { label: "Financeiro", href: "/pro/financeiro", icon: CircleDollarSign },
    { label: "Equipa", href: "/pro/equipa", icon: UsersRound },
    { label: "Definições", href: "/pro/definicoes", icon: Settings2 },
  ],
  client: [
    { label: "Hoje", href: "/cuidado/hoje", icon: HeartHandshake },
    { label: "Sessões", href: "/cuidado/sessoes", icon: CalendarDays },
    { label: "Experiências", href: "/cuidado/experiencias", icon: Sparkles },
    { label: "Partilhas", href: "/cuidado/partilhas", icon: ClipboardCheck },
    { label: "Conta", href: "/cuidado/conta", icon: Settings2 },
  ],
  admin: [
    { label: "Operação", href: "/admin/operacao", icon: Activity },
    { label: "Profissionais", href: "/admin/profissionais", icon: ShieldCheck },
    { label: "Organizações", href: "/admin/organizacoes", icon: UsersRound },
    { label: "Experiências", href: "/admin/experiencias", icon: Sparkles },
    { label: "Definições", href: "/admin/definicoes", icon: Settings2 },
  ],
} as const;

const surfaceIdentity: Record<
  Surface,
  { name: string; subtitle: string; initials: string }
> = {
  professional: {
    name: "Dra. Inês Almeida",
    subtitle: "Psicóloga · demo",
    initials: "IA",
  },
  client: {
    name: "Marta Oliveira",
    subtitle: "Espaço privado · demo",
    initials: "MO",
  },
  admin: {
    name: "Henrique",
    subtitle: "Administração · demo",
    initials: "HP",
  },
};

function NavigationItems({
  surface,
  segment,
  collapsed,
  onNavigate,
}: {
  surface: Surface;
  segment: LocaleSegment;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação principal" className="flex flex-col gap-1.5">
      {navigation[surface].map((item) => {
        const href = `/${segment}${item.href}`;
        const active =
          pathname === href ||
          (item.href !==
            `/${surface === "admin" ? "admin/operacao" : surface === "professional" ? "pro/hoje" : "cuidado/hoje"}` &&
            pathname.startsWith(href));

        return (
          <Link
            key={item.href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            title={collapsed ? item.label : undefined}
            className={cn(
              "group/nav relative flex min-h-11 items-center gap-3 overflow-hidden rounded-2xl px-3 text-sm font-semibold outline-none",
              "ease-(--ease-out-quint) transition-[background-color,color,transform] duration-200 focus-visible:ring-2 focus-visible:ring-[var(--sidebar-foreground)]",
              collapsed && "justify-center px-0",
              active
                ? "bg-[var(--highlight-yellow)] text-[var(--sidebar)] shadow-[0_8px_24px_rgba(242,207,99,.16)]"
                : "hover:bg-[var(--sidebar-raised)] text-[var(--sidebar-muted)] hover:translate-x-0.5 hover:text-[var(--sidebar-foreground)]",
            )}
          >
            <item.icon
              className={cn(
                "ease-(--ease-spring) size-[18px] shrink-0 transition-transform duration-500",
                !active && "group-hover/nav:scale-110",
              )}
              aria-hidden="true"
            />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  children,
  surface,
  segment,
}: {
  children: ReactNode;
  surface: Surface;
  segment: LocaleSegment;
}) {
  const [collapsed, setCollapsed] = useState(false);
  // "closing" keeps the drawer mounted for the length of its exit animation,
  // so dismissing it reads as a movement rather than a disappearance.
  const [drawer, setDrawer] = useState<"closed" | "open" | "closing">("closed");
  const identity = surfaceIdentity[surface];
  const mobileItems = navigation[surface].slice(0, 4);
  const pathname = usePathname();
  const drawerOpen = drawer !== "closed";

  function closeDrawer() {
    setDrawer((current) => (current === "open" ? "closing" : current));
  }

  useEffect(() => {
    if (drawer !== "closing") return;
    const timer = window.setTimeout(() => setDrawer("closed"), 260);
    return () => window.clearTimeout(timer);
  }, [drawer]);

  useEffect(() => {
    if (!drawerOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeDrawer();
    }

    // The page behind a modal drawer must not scroll with it.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen bg-[var(--background)] lg:flex">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col bg-[var(--sidebar)] p-4 text-[var(--sidebar-foreground)] lg:flex",
          "duration-400 ease-(--ease-out-quint) transition-[width]",
          collapsed ? "w-[84px]" : "w-[248px]",
        )}
      >
        <div
          className={cn(
            "mb-8 flex min-h-12 items-center gap-3",
            collapsed && "justify-center",
          )}
        >
          <BrandMark className="bg-[var(--sidebar-raised)]" />
          {!collapsed && (
            <div className="enter-fade min-w-0">
              <p className="truncate text-sm font-bold tracking-[-0.025em]">
                Além da Sessão
              </p>
              <p className="text-[var(--sidebar-muted)] mt-0.5 text-[10px]">
                demonstração local
              </p>
            </div>
          )}
        </div>

        <NavigationItems
          surface={surface}
          segment={segment}
          collapsed={collapsed}
        />

        <div className="mt-auto">
          <div
            className={cn(
              "bg-[var(--sidebar-raised)] mb-2 flex items-center gap-3 rounded-2xl p-2",
              collapsed && "justify-center",
            )}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--primary)] text-xs font-bold text-[var(--primary-foreground)]">
              {identity.initials}
            </span>
            {!collapsed && (
              <div className="enter-fade min-w-0">
                <p className="truncate text-xs font-bold">{identity.name}</p>
                <p className="text-[var(--sidebar-muted)] truncate text-[10px]">
                  {identity.subtitle}
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="hover:bg-[var(--sidebar-raised)] flex min-h-11 w-full items-center justify-center rounded-2xl text-[var(--sidebar-muted)] transition-colors duration-200 hover:text-[var(--sidebar-foreground)]"
            aria-label={collapsed ? "Expandir navegação" : "Recolher navegação"}
            aria-expanded={!collapsed}
          >
            {/* One chevron that rotates, rather than two that swap. */}
            <ChevronLeft
              className={cn(
                "duration-400 ease-(--ease-out-quint) size-4 transition-transform",
                collapsed && "rotate-180",
              )}
              aria-hidden="true"
            />
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="bg-[var(--background)]/92 sticky top-0 z-30 border-b border-[var(--border)] px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1420px] items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="icon"
                className="lg:hidden"
                onClick={() => setDrawer("open")}
                aria-label="Abrir navegação"
              >
                <Menu className="size-5" />
              </Button>
              <Badge tone="warning">Dados fictícios</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <LocaleSwitcher segment={segment} compact />
                <ThemeSwitcher locale={localeFromSegment(segment)} />
              </div>
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="hidden sm:flex"
              >
                <Link href={`/${segment}/demo`}>Mudar de área</Link>
              </Button>
            </div>
          </div>
        </div>

        <main className="mx-auto w-full max-w-[1420px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          {children}
        </main>
      </div>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navegação principal"
        >
          {/* Enter and exit are separate keyframes rather than a transition:
              a freshly mounted element has no previous state to move from. */}
          <button
            className={cn(
              "absolute inset-0 bg-[var(--scrim)] backdrop-blur-[3px]",
              drawer === "open"
                ? "animate-backdrop-in"
                : "animate-backdrop-out",
            )}
            onClick={closeDrawer}
            aria-label="Fechar navegação"
          />
          <aside
            className={cn(
              "relative flex h-full w-[min(88vw,340px)] flex-col bg-[var(--sidebar)] p-5 text-[var(--sidebar-foreground)] shadow-2xl",
              drawer === "open" ? "animate-drawer-in" : "animate-drawer-out",
            )}
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BrandMark className="bg-[var(--sidebar-raised)]" />
                <span className="text-sm font-bold">Além da Sessão</span>
              </div>
              <button
                className="hover:bg-[var(--sidebar-raised)] grid size-11 place-items-center rounded-2xl text-[var(--sidebar-muted)] transition-colors duration-200 hover:text-[var(--sidebar-foreground)]"
                onClick={closeDrawer}
                aria-label="Fechar navegação"
              >
                <X className="size-5" />
              </button>
            </div>
            <NavigationItems
              surface={surface}
              segment={segment}
              collapsed={false}
              onNavigate={closeDrawer}
            />
            <div className="mt-auto">
              <Link
                href={`/${segment}`}
                className="hover:bg-[var(--sidebar-raised)] text-[var(--sidebar-muted)] flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition-colors duration-200 hover:text-[var(--sidebar-foreground)]"
              >
                <LogOut className="size-[18px]" />
                Sair da demonstração
              </Link>
            </div>
          </aside>
        </div>
      )}

      <nav
        aria-label="Navegação principal mobile"
        className="border-white/8 fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-[1.35rem] border bg-[var(--sidebar)] p-1.5 text-[var(--sidebar-foreground)] shadow-[0_16px_50px_rgba(35,30,45,.35)] lg:hidden"
      >
        {mobileItems.map((item) => {
          const href = `/${segment}${item.href}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={item.href}
              href={href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group/tab flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl text-[9px] font-semibold",
                "ease-(--ease-out-quint) transition-[background-color,color] duration-200",
                // Two conflicting background classes used to fight here; the
                // yellow only won by source order.
                active
                  ? "bg-[var(--highlight-yellow)] text-[var(--sidebar)]"
                  : "text-[var(--sidebar-muted)] active:bg-[var(--sidebar-raised)]",
              )}
            >
              <item.icon className="ease-(--ease-spring) size-[17px] transition-transform duration-500 group-active/tab:scale-90" />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setDrawer("open")}
          aria-label="Mais opções"
          className="active:bg-[var(--sidebar-raised)] text-[var(--sidebar-muted)] flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl text-[9px] font-semibold transition-colors duration-200"
        >
          <Menu className="size-[17px]" />
          <span>Mais</span>
        </button>
      </nav>
    </div>
  );
}
