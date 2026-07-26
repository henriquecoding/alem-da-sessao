import { Construction, LockKeyhole } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeading } from "@/components/page-heading";

export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <>
      <PageHeading title={title} description={description} />
      <Card className="border-dashed">
        <CardContent className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
          <span className="grid size-14 place-items-center rounded-3xl bg-[var(--muted)] text-[var(--primary)]">
            <Construction className="size-6" />
          </span>
          <h2 className="mt-6 text-xl font-bold tracking-[-0.03em]">
            Estrutura preparada
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
            Esta rota já pertence à arquitetura e às permissões corretas. A
            funcionalidade será implementada numa fase posterior, sem dados reais
            durante a validação local.
          </p>
          <Badge tone="success" className="mt-6">
            <LockKeyhole className="mr-1.5 size-3.5" />
            Sem integração externa
          </Badge>
        </CardContent>
      </Card>
    </>
  );
}
