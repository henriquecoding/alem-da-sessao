import { FinanceWorkspace } from "@/components/professional-workspaces";
import { resolveLocale } from "@/lib/locale";

export default async function FinancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await resolveLocale(params);
  return <FinanceWorkspace locale={locale} />;
}
