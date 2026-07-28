import { ClientsDirectory } from "@/components/clients-directory";
import { getProfessionalDashboardData } from "@/lib/data/professional";
import { resolveLocale } from "@/lib/locale";

export default async function ClientsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale, segment }, data] = await Promise.all([
    resolveLocale(params),
    getProfessionalDashboardData(),
  ]);

  return (
    <ClientsDirectory
      initialClients={data.clients}
      locale={locale}
      segment={segment}
    />
  );
}
