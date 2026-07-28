import type { ReactNode } from "react";
import { resolveLocale } from "@/lib/locale";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";

export default async function PublicLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { segment } = await resolveLocale(params);

  return (
    <div className="min-h-screen">
      <PublicHeader segment={segment} />
      {children}
      <PublicFooter segment={segment} />
    </div>
  );
}
