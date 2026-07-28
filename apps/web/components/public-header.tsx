import Link from "next/link";
import {
  getMessages,
  localeFromSegment,
  type LocaleSegment,
} from "@alem-da-sessao/i18n";
import { Menu } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { localPath } from "@/lib/locale";

const links = [
  { href: "/experiencias", key: "experiences" },
  { href: "/diretorio", key: "directory" },
  { href: "/seguranca", key: "security" },
  { href: "/precos", key: "pricing" },
] as const;

export function PublicHeader({ segment }: { segment: LocaleSegment }) {
  const messages = getMessages(localeFromSegment(segment));

  return (
    <header className="relative z-20 mx-auto flex w-full max-w-[1240px] items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
      <Link
        href={localPath(segment)}
        className="inline-flex min-h-11 shrink-0 items-center gap-3 rounded-full pr-3 text-sm font-bold tracking-[-0.02em]"
      >
        <BrandMark />
        {/* Sem isto o nome parte-se em «Além da / Sessão» a 390 px. */}
        <span className="whitespace-nowrap">Além da Sessão</span>
      </Link>

      <nav className="hidden items-center gap-7 text-sm font-semibold text-[var(--muted-foreground)] md:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={localPath(segment, link.href)}
            className="link-underline transition-colors duration-200 hover:text-[var(--foreground)]"
          >
            {messages.publicNav[link.key]}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <details className="group relative md:hidden">
          <summary
            aria-label={messages.common.openMenu}
            className="grid size-11 cursor-pointer list-none place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--shadow-xs)] marker:content-none"
          >
            <Menu className="size-4" aria-hidden="true" />
          </summary>
          <nav
            aria-label={messages.shell.primaryNavigation}
            className="absolute right-0 top-[calc(100%+.6rem)] z-40 w-64 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-strong)] p-2 shadow-[var(--shadow-lg)]"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={localPath(segment, link.href)}
                className="flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted)]"
              >
                {messages.publicNav[link.key]}
              </Link>
            ))}
            <Link
              href={localPath(segment, "/demo")}
              className="surface-primary mt-1 flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold"
            >
              {messages.publicNav.demo}
            </Link>
          </nav>
        </details>
        {/* Os dois controlos de apresentação andam sempre juntos e com a
            mesma forma — são a mesma categoria de decisão. */}
        <div className="flex items-center gap-1.5">
          <LocaleSwitcher segment={segment} compact />
          <ThemeSwitcher locale={localeFromSegment(segment)} />
        </div>
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link href={localPath(segment, "/demo")}>
            {messages.publicNav.demo}
          </Link>
        </Button>
      </div>
    </header>
  );
}
