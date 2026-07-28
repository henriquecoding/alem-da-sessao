import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { resolveLocale } from "@/lib/locale";
import { requireSurfaceAccess } from "@/lib/auth/access";

export default async function ClientLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { segment } = await resolveLocale(params);
  await requireSurfaceAccess("client", segment);
  return (
    <AppShell surface="client" segment={segment}>
      {children}
    </AppShell>
  );
}
