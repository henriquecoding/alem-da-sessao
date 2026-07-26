"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Activity,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
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
import type { LocaleSegment } from "@alem-da-sessao/i18n";
import { useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { LocaleSwitcher } from "@/components/locale-switcher";
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
          (item.href !== `/${surface === "admin" ? "admin/operacao" : surface === "professional" ? "pro/hoje" : "cuidado/hoje"}` &&
            pathname.startsWith(href));

        return (
          <Link
            key={item.href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/70",
              collapsed && "justify-center px-0",
              active
                ? "bg-[var(--highlight-lime)] text-[var(--sidebar)] shadow-[0_8px_24px_rgba(204,232,105,.12)]"
                : "text-white/58 hover:bg-white/8 hover:text-white",
            )}
          >
            <item.icon className="size-[18px] shrink-0" aria-hidden="true" />
            {!collapsed && <span>{item.label}</span>}
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const identity = surfaceIdentity[surface];
  const mobileItems = navigation[surface].slice(0, 4);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--background)] lg:flex">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col bg-[var(--sidebar)] p-4 text-white transition-[width] duration-300 lg:flex",
          collapsed ? "w-[84px]" : "w-[248px]",
        )}
      >
        <div
          className={cn(
            "mb-8 flex min-h-12 items-center gap-3",
            collapsed && "justify-center",
          )}
        >
          <BrandMark className="bg-white/12" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-[-0.025em]">
                Além da Sessão
              </p>
              <p className="mt-0.5 text-[10px] text-white/42">demonstração local</p>
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
              "mb-2 flex items-center gap-3 rounded-2xl bg-white/6 p-2",
              collapsed && "justify-center",
            )}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--accent)] text-xs font-bold text-white">
              {identity.initials}
            </span>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-xs font-bold">{identity.name}</p>
                <p className="truncate text-[10px] text-white/42">
                  {identity.subtitle}
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="flex min-h-11 w-full items-center justify-center rounded-2xl text-white/50 transition-colors hover:bg-white/8 hover:text-white"
            aria-label={collapsed ? "Expandir navegação" : "Recolher navegação"}
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/92 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1420px] items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Abrir navegação"
              >
                <Menu className="size-5" />
              </Button>
              <Badge tone="warning">Dados fictícios</Badge>
            </div>
            <div className="flex items-center gap-2">
              <LocaleSwitcher segment={segment} compact />
              <Button asChild variant="secondary" size="sm" className="hidden sm:flex">
                <Link href={`/${segment}/demo`}>Mudar de área</Link>
              </Button>
            </div>
          </div>
        </div>

        <main className="mx-auto w-full max-w-[1420px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          {children}
        </main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/42 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar navegação"
          />
          <aside className="relative flex h-full w-[min(88vw,340px)] flex-col bg-[var(--sidebar)] p-5 text-white shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BrandMark className="bg-white/12" />
                <span className="text-sm font-bold">Além da Sessão</span>
              </div>
              <button
                className="grid size-11 place-items-center rounded-2xl text-white/65 hover:bg-white/8"
                onClick={() => setMobileOpen(false)}
                aria-label="Fechar navegação"
              >
                <X className="size-5" />
              </button>
            </div>
            <NavigationItems
              surface={surface}
              segment={segment}
              collapsed={false}
              onNavigate={() => setMobileOpen(false)}
            />
            <div className="mt-auto">
              <Link
                href={`/${segment}`}
                className="flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold text-white/58 hover:bg-white/8 hover:text-white"
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
        className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-[1.35rem] border border-white/8 bg-[var(--sidebar)] p-1.5 text-white shadow-[0_16px_50px_rgba(18,32,27,.35)] lg:hidden"
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
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl text-[9px] font-semibold text-white/46",
                active && "bg-white text-[var(--sidebar)]",
                active && "bg-[var(--highlight-lime)]",
              )}
            >
              <item.icon className="size-[17px]" />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Mais opções"
          className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl text-[9px] font-semibold text-white/46"
        >
          <Menu className="size-[17px]" />
          <span>Mais</span>
        </button>
      </nav>
    </div>
  );
}
