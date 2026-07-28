import { ReportsWorkspace } from "@/components/professional-workspaces";
import { resolveLocale } from "@/lib/locale";

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await resolveLocale(params);
  return <ReportsWorkspace locale={locale} />;
}
