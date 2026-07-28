import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { resolveLocale } from "@/lib/locale";
import { requireSurfaceAccess } from "@/lib/auth/access";

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { segment } = await resolveLocale(params);
  await requireSurfaceAccess("admin", segment);
  return (
    <AppShell surface="admin" segment={segment}>
      {children}
    </AppShell>
  );
}
