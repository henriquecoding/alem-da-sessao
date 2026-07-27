import { Eye, LockKeyhole, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeading } from "@/components/page-heading";

export default function SharesPage() {
  return (
    <>
      <PageHeading
        title="Partilhas"
        description="Veja o que partilhou, com quem e em que versão."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <span className="grid size-11 place-items-center rounded-2xl bg-[var(--success-soft)] text-[var(--success)]">
                <Eye className="size-5" />
              </span>
              <Badge tone="success">Ativa</Badge>
            </div>
            <h2 className="mt-7 text-xl font-bold">Estruturas de Carga</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Snapshot 1 · partilhado com Dra. Inês Almeida
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
              <ShieldCheck className="size-4 text-[var(--primary)]" />
              Alterações posteriores não afetam esta versão
            </div>
          </CardContent>
        </Card>
        <Card className="border-dashed">
          <CardContent className="flex min-h-[230px] flex-col items-center justify-center p-6 text-center">
            <LockKeyhole className="text-[var(--muted-foreground)]/50 size-6" />
            <p className="mt-4 text-sm font-bold">
              O restante continua privado.
            </p>
            <p className="mt-2 max-w-xs text-xs leading-5 text-[var(--muted-foreground)]">
              Experiências guardadas sem partilha nunca aparecem ao
              profissional.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
