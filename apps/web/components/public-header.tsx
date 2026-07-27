import Link from "next/link";
import type { LocaleSegment } from "@alem-da-sessao/i18n";
import { BrandMark } from "@/components/brand-mark";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Button } from "@/components/ui/button";
import { localPath } from "@/lib/locale";

const links = [
  { href: "/experiencias", label: "Experiências" },
  { href: "/seguranca", label: "Segurança" },
  { href: "/precos", label: "Preços" },
];

export function PublicHeader({ segment }: { segment: LocaleSegment }) {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-[1240px] items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
      <Link
        href={localPath(segment)}
        className="inline-flex min-h-11 items-center gap-3 rounded-full pr-3 text-sm font-bold tracking-[-0.02em]"
      >
        <BrandMark />
        <span>Além da Sessão</span>
      </Link>

      <nav className="hidden items-center gap-7 text-sm font-semibold text-[var(--muted-foreground)] md:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={localPath(segment, link.href)}
            className="link-underline transition-colors duration-200 hover:text-[var(--foreground)]"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        {/* Below md the nav above is hidden, which left the demo button as the
            only route out of the homepage on a phone. */}
        <Link
          href={localPath(segment, "/experiencias")}
          className="inline-flex min-h-11 items-center rounded-full px-2 text-sm font-semibold text-[var(--muted-foreground)] transition-colors duration-200 hover:text-[var(--foreground)] md:hidden"
        >
          Experiências
        </Link>
        <LocaleSwitcher segment={segment} compact />
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link href={localPath(segment, "/demo")}>Ver demonstração</Link>
        </Button>
      </div>
    </header>
  );
}
