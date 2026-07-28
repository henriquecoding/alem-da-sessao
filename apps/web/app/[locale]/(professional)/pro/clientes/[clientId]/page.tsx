import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClientDetailWorkspace } from "@/components/client-detail-workspace";
import { getProfessionalClient } from "@/lib/data/professional";
import { localPath, resolveLocale } from "@/lib/locale";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ locale: string; clientId: string }>;
}) {
  const resolvedParams = await params;
  const [{ locale, segment }, client] = await Promise.all([
    resolveLocale(Promise.resolve({ locale: resolvedParams.locale })),
    getProfessionalClient(resolvedParams.clientId),
  ]);

  if (!client) {
    notFound();
  }

  return (
    <>
      <div className="mb-6 flex items-center">
        <Button asChild variant="ghost" size="sm">
          <Link href={localPath(segment, "/pro/clientes")}>
            <ArrowLeft className="size-4" />
            Clientes
          </Link>
        </Button>
      </div>

      <section className="mb-6 flex flex-col gap-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="surface-primary grid size-16 place-items-center rounded-3xl text-lg font-bold text-[var(--primary-foreground)]">
            {client.initials}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-[-0.04em]">
                {client.displayName}
              </h1>
              <Badge tone="success">Relação ativa</Badge>
            </div>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Cliente adulto · Dados de demonstração
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={localPath(segment, "/pro/agenda")}>
            <CalendarDays className="size-4" />
            Agendar sessão
          </Link>
        </Button>
      </section>

      <ClientDetailWorkspace client={client} locale={locale} />
    </>
  );
}
