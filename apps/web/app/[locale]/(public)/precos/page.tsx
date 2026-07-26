import type { Metadata } from "next";
import { Check, FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PricingWaitlist } from "@/components/pricing-waitlist";

export const metadata: Metadata = {
  title: "Preços em validação",
};

export default function PricingPage() {
  return (
    <main className="mx-auto w-full max-w-[900px] px-4 pb-24 pt-12 sm:px-6 lg:px-8 lg:pt-20">
      <div className="text-center">
        <Badge tone="warning">
          <FlaskConical className="mr-1.5 size-3.5" />
          Proposta em validação
        </Badge>
        <h1 className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-bold tracking-[-0.055em] sm:text-6xl">
          O preço não será inventado antes de validar o valor.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--muted-foreground)]">
          O modelo previsto é uma assinatura mensal ou anual paga pelo
          profissional. Não existe cobrança ativa nesta versão local.
        </p>
      </div>

      <Card className="mx-auto mt-12 max-w-xl">
        <CardContent className="p-7 sm:p-9">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold">Plano profissional</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Valor a definir com entrevistas em Portugal e no Brasil
              </p>
            </div>
            <Badge>Sem cobrança</Badge>
          </div>
          <div className="mt-8 space-y-4">
            {[
              "Agenda e clientes",
              "Notas e consentimentos",
              "Atribuição de experiências",
              "Partilha por snapshot",
              "Localização pt-PT e pt-BR",
            ].map((item) => (
              <p key={item} className="flex items-center gap-3 text-sm">
                <span className="grid size-6 place-items-center rounded-full bg-[var(--success-soft)] text-[var(--success)]">
                  <Check className="size-3.5" />
                </span>
                {item}
              </p>
            ))}
          </div>
          <PricingWaitlist />
        </CardContent>
      </Card>
    </main>
  );
}
