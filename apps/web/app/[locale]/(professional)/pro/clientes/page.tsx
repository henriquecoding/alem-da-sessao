import Link from "next/link";
import { ArrowRight, Search, UserPlus } from "lucide-react";
import { getProfessionalToday } from "@alem-da-sessao/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeading } from "@/components/page-heading";
import { localPath, resolveLocale } from "@/lib/locale";

export default async function ClientsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ segment }, data] = await Promise.all([
    resolveLocale(params),
    getProfessionalToday(),
  ]);

  return (
    <>
      <PageHeading
        title="Clientes"
        description="Acesso apenas às pessoas com relação de cuidado ou delegação explícita."
        action={
          <Button>
            <UserPlus className="size-4" />
            Adicionar cliente
          </Button>
        }
      />

      <div className="relative mb-5 max-w-lg">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <Input className="pl-11" placeholder="Pesquisar por nome…" />
      </div>

      <Card>
        <CardContent className="p-2 sm:p-3">
          <div className="hidden grid-cols-[1.25fr_.7fr_1fr_auto] gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.13em] text-[var(--muted-foreground)] md:grid">
            <span>Cliente</span>
            <span>Estado</span>
            <span>Próxima ação</span>
            <span className="sr-only">Abrir</span>
          </div>
          <div className="space-y-2">
            {data.clients.map((client) => (
              <Link
                key={client.id}
                href={localPath(segment, `/pro/clientes/${client.id}`)}
                className="hover:bg-[var(--muted)]/55 grid min-h-20 items-center gap-3 rounded-2xl border border-transparent px-3 py-3 transition-colors hover:border-[var(--border)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] sm:px-4 md:grid-cols-[1.25fr_.7fr_1fr_auto]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--muted)] text-xs font-bold">
                    {client.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">
                      {client.displayName}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                      Desde {client.relationshipSince}
                    </p>
                  </div>
                </div>
                <Badge
                  tone={client.status === "active" ? "success" : "neutral"}
                  className="w-fit"
                >
                  {client.status === "active" ? "Ativo" : "Pausado"}
                </Badge>
                <p className="text-xs text-[var(--muted-foreground)] md:text-sm">
                  {client.pendingItem ?? "Sem pendências"}
                </p>
                <ArrowRight className="hidden size-4 text-[var(--muted-foreground)] md:block" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
