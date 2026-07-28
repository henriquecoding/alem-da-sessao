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
import {
  getMessages,
  localeFromSegment,
  type LocaleSegment,
  type Messages,
} from "@alem-da-sessao/i18n";
import { useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Surface = "professional" | "client" | "admin";

const navigation = {
  professional: [
    { key: "today", href: "/pro/hoje", icon: LayoutDashboard },
    { key: "schedule", href: "/pro/agenda", icon: CalendarDays },
    { key: "clients", href: "/pro/clientes", icon: ContactRound },
    { key: "experiences", href: "/pro/experiencias", icon: Sparkles },
    { key: "reports", href: "/pro/relatorios", icon: ChartNoAxesCombined },
    { key: "finance", href: "/pro/financeiro", icon: CircleDollarSign },
    { key: "team", href: "/pro/equipa", icon: UsersRound },
    { key: "settings", href: "/pro/definicoes", icon: Settings2 },
  ],
  client: [
    { key: "today", href: "/cuidado/hoje", icon: HeartHandshake },
    { key: "sessions", href: "/cuidado/sessoes", icon: CalendarDays },
    { key: "experiences", href: "/cuidado/experiencias", icon: Sparkles },
    { key: "shares", href: "/cuidado/partilhas", icon: ClipboardCheck },
    { key: "account", href: "/cuidado/conta", icon: Settings2 },
  ],
  admin: [
    { key: "operation", href: "/admin/operacao", icon: Activity },
    {
      key: "professionals",
      href: "/admin/profissionais",
      icon: ShieldCheck,
    },
    { key: "organizations", href: "/admin/organizacoes", icon: UsersRound },
    { key: "experiences", href: "/admin/experiencias", icon: Sparkles },
    { key: "settings", href: "/admin/definicoes", icon: Settings2 },
  ],
} as const satisfies Record<
  Surface,
  readonly {
    key: keyof Messages["nav"];
    href: string;
    icon: typeof Activity;
  }[]
>;

function NavigationItems({
  surface,
  segment,
  collapsed,
  messages,
  onNavigate,
}: {
  surface: Surface;
  segment: LocaleSegment;
  collapsed: boolean;
  messages: Messages;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={messages.shell.primaryNavigation}
      className="flex flex-col gap-1.5"
    >
      {navigation[surface].map((item) => {
        const label = messages.nav[item.key];
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
            title={collapsed ? label : undefined}
            className={cn(
              "group/nav relative flex min-h-11 items-center gap-3 overflow-hidden rounded-2xl px-3 text-sm font-semibold outline-none",
              "ease-(--ease-out-quint) transition-[background-color,color,transform] duration-200 focus-visible:ring-2 focus-visible:ring-[var(--sidebar-foreground)]",
              collapsed && "justify-center px-0",
              active
                ? "bg-[var(--highlight-yellow)] text-[var(--sidebar)] shadow-[0_8px_24px_rgba(242,207,99,.16)]"
                : "text-[var(--sidebar-muted)] hover:translate-x-0.5 hover:bg-[var(--sidebar-raised)] hover:text-[var(--sidebar-foreground)]",
            )}
          >
            <item.icon
              className={cn(
                "ease-(--ease-spring) size-[18px] shrink-0 transition-transform duration-200",
                !active && "group-hover/nav:scale-110",
              )}
              aria-hidden="true"
            />
            {!collapsed && <span className="truncate">{label}</span>}
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
  const locale = localeFromSegment(segment);
  const messages = getMessages(locale);
  const identity = messages.shell.identities[surface];
  const mobileItems = navigation[surface].slice(0, 4);
  const pathname = usePathname();
  const drawerOpen = drawer !== "closed";
  const drawerRef = useRef<HTMLElement | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const bottomNavRef = useRef<HTMLElement | null>(null);

  function closeDrawer() {
    setDrawer((current) => (current === "open" ? "closing" : current));
  }

  useEffect(() => {
    if (drawer !== "closing") return;
    const timer = window.setTimeout(() => {
      setDrawer("closed");
      openerRef.current?.focus();
    }, 180);
    return () => window.clearTimeout(timer);
  }, [drawer]);

  useEffect(() => {
    if (!drawerOpen) return;

    const panel = drawerRef.current;
    const focusable = panel
      ? Array.from(
          panel.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        )
      : [];
    focusable[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeDrawer();
        return;
      }
      if (event.key !== "Tab" || focusable.length === 0) return;

      const first = focusable[0]!;
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    // The page behind a modal drawer must not scroll with it.
    const previousOverflow = document.body.style.overflow;
    const content = contentRef.current;
    const bottomNav = bottomNavRef.current;
    document.body.style.overflow = "hidden";
    if (content) content.inert = true;
    if (bottomNav) bottomNav.inert = true;
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      if (content) content.inert = false;
      if (bottomNav) bottomNav.inert = false;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen bg-[var(--background)] lg:flex">
      <div ref={contentRef} className="contents">
        <aside
          className={cn(
            "surface-sidebar sticky top-0 hidden h-screen shrink-0 flex-col p-4 text-[var(--sidebar-foreground)] lg:flex",
            "ease-(--ease-out-quint) transition-[width] duration-200",
            collapsed ? "w-[84px]" : "w-[248px]",
          )}
        >
          <div
            className={cn(
              "mb-8 flex min-h-12 items-center gap-3",
              collapsed && "justify-center",
            )}
          >
            <BrandMark className="surface-sidebar-raised" />
            {!collapsed && (
              <div className="enter-fade min-w-0">
                <p className="truncate text-sm font-bold tracking-[-0.025em]">
                  Além da Sessão
                </p>
                <p className="mt-0.5 text-[10px] text-[var(--sidebar-muted)]">
                  {messages.shell.localDemo}
                </p>
              </div>
            )}
          </div>

          <NavigationItems
            surface={surface}
            segment={segment}
            collapsed={collapsed}
            messages={messages}
          />

          <div className="mt-auto">
            <div
              className={cn(
                "surface-sidebar-raised mb-2 flex items-center gap-3 rounded-2xl p-2",
                collapsed && "justify-center",
              )}
            >
              <span className="surface-primary grid size-9 shrink-0 place-items-center rounded-xl text-xs font-bold text-[var(--primary-foreground)]">
                {identity.initials}
              </span>
              {!collapsed && (
                <div className="enter-fade min-w-0">
                  <p className="truncate text-xs font-bold">{identity.name}</p>
                  <p className="truncate text-[10px] text-[var(--sidebar-muted)]">
                    {identity.subtitle}
                  </p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="flex min-h-11 w-full items-center justify-center rounded-2xl text-[var(--sidebar-muted)] transition-colors duration-200 hover:bg-[var(--sidebar-raised)] hover:text-[var(--sidebar-foreground)]"
              aria-label={
                collapsed
                  ? messages.shell.expandNavigation
                  : messages.shell.collapseNavigation
              }
              aria-expanded={!collapsed}
            >
              {/* One chevron that rotates, rather than two that swap. */}
              <ChevronLeft
                className={cn(
                  "ease-(--ease-out-quint) size-4 transition-transform duration-200",
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
                  onClick={(event) => {
                    openerRef.current = event.currentTarget;
                    setDrawer("open");
                  }}
                  aria-label={messages.common.openMenu}
                >
                  <Menu className="size-5" />
                </Button>
                <Badge tone="warning">{messages.shell.fictionalData}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <LocaleSwitcher segment={segment} compact />
                  <ThemeSwitcher locale={locale} />
                </div>
                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  className="hidden sm:flex"
                >
                  <Link href={`/${segment}/demo`}>
                    {messages.common.switchArea}
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <main className="mx-auto w-full max-w-[1420px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
            {children}
          </main>
        </div>
      </div>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={messages.shell.primaryNavigation}
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
            aria-label={messages.common.closeMenu}
          />
          <aside
            ref={drawerRef}
            className={cn(
              "surface-sidebar relative flex h-full w-[min(88vw,340px)] flex-col p-5 text-[var(--sidebar-foreground)] shadow-2xl",
              drawer === "open" ? "animate-drawer-in" : "animate-drawer-out",
            )}
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BrandMark className="surface-sidebar-raised" />
                <span className="text-sm font-bold">Além da Sessão</span>
              </div>
              <button
                className="grid size-11 place-items-center rounded-2xl text-[var(--sidebar-muted)] transition-colors duration-200 hover:bg-[var(--sidebar-raised)] hover:text-[var(--sidebar-foreground)]"
                onClick={closeDrawer}
                aria-label={messages.common.closeMenu}
              >
                <X className="size-5" />
              </button>
            </div>
            <NavigationItems
              surface={surface}
              segment={segment}
              collapsed={false}
              messages={messages}
              onNavigate={closeDrawer}
            />
            <div className="mt-auto">
              <Link
                href={`/${segment}`}
                className="flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold text-[var(--sidebar-muted)] transition-colors duration-200 hover:bg-[var(--sidebar-raised)] hover:text-[var(--sidebar-foreground)]"
              >
                <LogOut className="size-[18px]" />
                {messages.shell.exitDemo}
              </Link>
            </div>
          </aside>
        </div>
      )}

      <nav
        ref={bottomNavRef}
        aria-label={messages.shell.mobileNavigation}
        className="surface-sidebar fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-[1.35rem] border border-[var(--border)] p-1.5 text-[var(--sidebar-foreground)] shadow-[0_16px_50px_rgba(35,30,45,.35)] lg:hidden"
      >
        {mobileItems.map((item) => {
          const label = messages.nav[item.key];
          const href = `/${segment}${item.href}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={item.href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group/tab flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-semibold",
                "ease-(--ease-out-quint) transition-[background-color,color] duration-200",
                // Two conflicting background classes used to fight here; the
                // yellow only won by source order.
                active
                  ? "bg-[var(--highlight-yellow)] text-[var(--sidebar)]"
                  : "text-[var(--sidebar-muted)] active:bg-[var(--sidebar-raised)]",
              )}
            >
              <item.icon className="ease-(--ease-spring) size-[17px] transition-transform duration-200 group-active/tab:scale-90" />
              <span className="max-w-full truncate">{label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={(event) => {
            openerRef.current = event.currentTarget;
            setDrawer("open");
          }}
          aria-label={messages.shell.moreOptions}
          className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-semibold text-[var(--sidebar-muted)] transition-colors duration-200 active:bg-[var(--sidebar-raised)]"
        >
          <Menu className="size-[17px]" />
          <span>{messages.shell.more}</span>
        </button>
      </nav>
    </div>
  );
}
