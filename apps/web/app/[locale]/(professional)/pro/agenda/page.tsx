import { ScheduleWorkspace } from "@/components/schedule-workspace";
import { getProfessionalDashboardData } from "@/lib/data/professional";
import { resolveLocale } from "@/lib/locale";

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, data] = await Promise.all([
    resolveLocale(params),
    getProfessionalDashboardData(),
  ]);

  return (
    <ScheduleWorkspace
      initialAppointments={data.appointments}
      clients={data.clients}
      locale={locale}
    />
  );
}
