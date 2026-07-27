import type { Metadata } from "next";
import type { CSSProperties } from "react";
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
        <Badge tone="warning" className="enter">
          <FlaskConical className="mr-1.5 size-3.5" />
          Proposta em validação
        </Badge>
        <h1
          className="enter mx-auto mt-5 max-w-3xl text-balance text-[clamp(2.15rem,1.3rem+3.2vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.055em]"
          style={{ "--d": 1 } as CSSProperties}
        >
          O preço não será inventado antes de validar o valor.
        </h1>
        <p
          className="enter mx-auto mt-5 max-w-2xl text-base leading-7 text-[var(--muted-foreground)] sm:leading-8"
          style={{ "--d": 2 } as CSSProperties}
        >
          O modelo previsto é uma assinatura mensal ou anual paga pelo
          profissional. Não existe cobrança ativa nesta versão local.
        </p>
      </div>

      <Card
        className="enter mx-auto mt-12 max-w-xl"
        style={{ "--d": 3 } as CSSProperties}
      >
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
