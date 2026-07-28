import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

export function PolicyPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pt-16">
      <Badge tone="warning">{eyebrow}</Badge>
      <h1 className="mt-5 text-4xl font-bold tracking-[-0.045em] sm:text-6xl">
        {title}
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted-foreground)]">
        {description}
      </p>
      <div className="policy-content mt-12 space-y-9">{children}</div>
    </main>
  );
}

export function PolicySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-xs)] sm:p-8">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-[var(--muted-foreground)]">
        {children}
      </div>
    </section>
  );
}
