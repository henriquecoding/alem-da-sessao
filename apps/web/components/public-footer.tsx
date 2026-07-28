import Link from "next/link";
import {
  getMessages,
  localeFromSegment,
  type LocaleSegment,
} from "@alem-da-sessao/i18n";
import { BrandMark } from "@/components/brand-mark";
import { localPath } from "@/lib/locale";

const productLinks = [
  { href: "/experiencias", key: "experiences" },
  { href: "/diretorio", key: "directory" },
  { href: "/precos", key: "pricing" },
] as const;

const trustLinks = [
  { href: "/seguranca", key: "security" },
  { href: "/privacidade", key: "privacy" },
  { href: "/termos", key: "terms" },
  { href: "/acessibilidade", key: "accessibility" },
  { href: "/subprocessadores", key: "subprocessors" },
] as const;

export function PublicFooter({ segment }: { segment: LocaleSegment }) {
  const messages = getMessages(localeFromSegment(segment));

  return (
    <footer className="mt-20 border-t border-[var(--border)] bg-[var(--background-deep)]">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1fr_auto_auto] lg:px-8">
        <div className="max-w-sm">
          <Link
            href={localPath(segment)}
            className="inline-flex min-h-11 items-center gap-3 text-sm font-bold"
          >
            <BrandMark />
            {messages.common.brand}
          </Link>
          <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
            {messages.public.trustLine}
          </p>
          <p className="mt-4 text-xs font-semibold text-[var(--accent-foreground)]">
            {messages.publicNav.prelaunch}
          </p>
        </div>
        <FooterGroup
          title={messages.publicNav.product}
          links={productLinks.map((link) => ({
            href: localPath(segment, link.href),
            label: messages.publicNav[link.key],
          }))}
        />
        <FooterGroup
          title={messages.publicNav.legal}
          links={trustLinks.map((link) => ({
            href: localPath(segment, link.href),
            label: messages.publicNav[link.key],
          }))}
        />
      </div>
    </footer>
  );
}

function FooterGroup({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <nav aria-label={title}>
      <p className="text-xs font-bold uppercase tracking-[0.12em]">{title}</p>
      <ul className="mt-3 min-w-40 space-y-1">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex min-h-11 items-center text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
