import { ClientAccountWorkspace } from "@/components/client-workspaces";
import { resolveLocale } from "@/lib/locale";

export default async function ClientAccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await resolveLocale(params);
  return <ClientAccountWorkspace initialLocale={locale} />;
}
