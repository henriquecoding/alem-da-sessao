import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { resolveLocale } from "@/lib/locale";

export default async function ClientLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { segment } = await resolveLocale(params);
  return (
    <AppShell surface="client" segment={segment}>
      {children}
    </AppShell>
  );
}
