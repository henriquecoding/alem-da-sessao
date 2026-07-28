import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { resolveLocale } from "@/lib/locale";
import { requireSurfaceAccess } from "@/lib/auth/access";

export default async function ProfessionalLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { segment } = await resolveLocale(params);
  await requireSurfaceAccess("professional", segment);
  return (
    <AppShell surface="professional" segment={segment}>
      {children}
    </AppShell>
  );
}
