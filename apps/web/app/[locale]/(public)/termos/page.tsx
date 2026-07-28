import type { Metadata } from "next";
import { PolicyPage, PolicySection } from "@/components/policy-page";
import { resolveLocale } from "@/lib/locale";

export const metadata: Metadata = { title: "Termos" };

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await resolveLocale(params);
  const pt = locale === "pt-PT";

  return (
    <PolicyPage
      eyebrow={pt ? "Rascunho informativo" : "Rascunho informativo"}
      title={pt ? "Limites do produto" : "Limites do produto"}
      description={
        pt
          ? "Não são termos contratuais finais. São limites já impostos ao protótipo para que a interface não prometa mais do que o produto pode cumprir."
          : "Estes ainda não são termos contratuais finais. São limites já impostos ao protótipo para que a interface não prometa mais do que o produto pode cumprir."
      }
    >
      <PolicySection
        title={
          pt
            ? "Não é um serviço de emergência"
            : "Não é um serviço de emergência"
        }
      >
        <p>
          {pt
            ? "A plataforma não é monitorizada continuamente e não substitui serviços de emergência nem o contacto direto com um profissional."
            : "A plataforma não é monitorada continuamente e não substitui serviços de emergência nem o contato direto com um profissional."}
        </p>
      </PolicySection>
      <PolicySection
        title={pt ? "Não é terapia por IA" : "Não é terapia por IA"}
      >
        <p>
          {pt
            ? "As experiências não diagnosticam, prescrevem ou simulam uma relação terapêutica. Servem para dar forma a material que a pessoa pode levar a uma conversa humana."
            : "As experiências não diagnosticam, prescrevem nem simulam uma relação terapêutica. Servem para dar forma a material que a pessoa pode levar a uma conversa humana."}
        </p>
      </PolicySection>
      <PolicySection title={pt ? "Disponibilidade" : "Disponibilidade"}>
        <p>
          {pt
            ? "O ambiente atual é uma demonstração local sem contas, faturação ou dados reais. O lançamento exige termos revistos por assessoria jurídica nas duas jurisdições."
            : "O ambiente atual é uma demonstração local sem contas, faturamento ou dados reais. O lançamento exige termos revisados por assessoria jurídica nas duas jurisdições."}
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
