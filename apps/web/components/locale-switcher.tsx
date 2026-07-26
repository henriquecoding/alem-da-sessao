"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import type { LocaleSegment } from "@alem-da-sessao/i18n";
import { Languages } from "lucide-react";

export function LocaleSwitcher({
  segment,
  compact = false,
}: {
  segment: LocaleSegment;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const nextSegment = segment === "pt-pt" ? "pt-br" : "pt-pt";
  const nextPath = pathname.replace(/^\/pt-(pt|br)(?=\/|$)/, `/${nextSegment}`);

  return (
    <Link
      href={nextPath}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      aria-label={
        segment === "pt-pt"
          ? "Mudar para português do Brasil"
          : "Mudar para português de Portugal"
      }
    >
      <Languages className="size-4" aria-hidden="true" />
      {!compact && (segment === "pt-pt" ? "PT" : "BR")}
    </Link>
  );
}
