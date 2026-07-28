import { ClientSessionsWorkspace } from "@/components/client-workspaces";
import { resolveLocale } from "@/lib/locale";

export default async function ClientSessionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await resolveLocale(params);
  return <ClientSessionsWorkspace locale={locale} />;
}
