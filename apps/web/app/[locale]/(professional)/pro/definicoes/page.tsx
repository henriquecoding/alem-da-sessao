import { ProfessionalSettingsWorkspace } from "@/components/professional-workspaces";
import { resolveLocale } from "@/lib/locale";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await resolveLocale(params);
  return <ProfessionalSettingsWorkspace initialLocale={locale} />;
}
