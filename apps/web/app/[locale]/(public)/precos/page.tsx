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

      {/* §1.1 — quem paga o quê. A gratuidade do cliente não é generosidade:
          é a estrutura que torna a contenção economicamente sustentável, e é a
          defesa contra o modo de falha do Woebot (§1.3, ADR-021). */}
      <div className="reveal mx-auto mt-14 max-w-3xl overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)]">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Quem paga o quê</caption>
          <thead className="bg-[var(--muted)] text-xs uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">
                Quem
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Paga
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
            {[
              ["Pessoa em geral, sem terapia", "nada"],
              ["Cliente em acompanhamento", "nada"],
              ["Psicólogo ou psiquiatra", "assinatura mensal"],
              ["Anunciante", "não existe"],
            ].map(([who, pays]) => (
              <tr key={who}>
                <th scope="row" className="px-5 py-3 font-medium">
                  {who}
                </th>
                <td className="px-5 py-3 text-[var(--muted-foreground)]">
                  {pays}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* §9 — preço em moeda local, nunca conversão. Ancorado no valor de uma
          sessão, não no custo de hospedagem: em Portugal, €29/mês é menos de
          uma sessão por mês para quem cobra €50 e atende 20 por semana. */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {[
          {
            market: "Portugal e União Europeia",
            essential: "€29",
            complete: "€49",
          },
          { market: "Brasil", essential: "R$ 79", complete: "R$ 139" },
        ].map((plan, index) => (
          <div
            key={plan.market}
            className="reveal"
            style={{ "--d": index } as CSSProperties}
          >
            <Card className="lift h-full">
              <CardContent className="p-7">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-bold">{plan.market}</p>
                  <Badge tone="warning">Proposta</Badge>
                </div>
                <dl className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs text-[var(--muted-foreground)]">
                      Essencial
                    </dt>
                    <dd className="tabular mt-1 text-2xl font-bold tracking-[-0.04em]">
                      {plan.essential}
                      <span className="text-sm font-medium text-[var(--muted-foreground)]">
                        /mês
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--muted-foreground)]">
                      Completo
                    </dt>
                    <dd className="tabular mt-1 text-2xl font-bold tracking-[-0.04em]">
                      {plan.complete}
                      <span className="text-sm font-medium text-[var(--muted-foreground)]">
                        /mês
                      </span>
                    </dd>
                  </div>
                </dl>
                <p className="mt-5 text-xs leading-5 text-[var(--muted-foreground)]">
                  Anual com dois meses grátis. O plano completo inclui o
                  diretório verificado e o catálogo inteiro.
                </p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <Card className="reveal mx-auto mt-6 max-w-3xl">
        <CardContent className="p-7 sm:p-9">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold">Tudo incluído</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Sem add-ons, sem comissão por sessão, sem cobrança por contacto
              </p>
            </div>
            <Badge>Sem cobrança nesta versão</Badge>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              "Agenda e clientes",
              "Notas e consentimentos",
              "Atribuição de experiências",
              "Partilha por snapshot",
              "Intervalos e Ponte de Sessão",
              "Perfil no diretório verificado",
              "Localização pt-PT e pt-BR",
              "30 dias completos, sem cartão",
            ].map((item) => (
              <p key={item} className="flex items-center gap-3 text-sm">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--success-soft)] text-[var(--success)]">
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
