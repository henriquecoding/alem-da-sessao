import type { Metadata } from "next";
import { PolicyPage, PolicySection } from "@/components/policy-page";
import { resolveLocale } from "@/lib/locale";

export const metadata: Metadata = { title: "Subprocessadores" };

export default async function SubprocessorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await resolveLocale(params);
  const pt = locale === "pt-PT";

  return (
    <PolicyPage
      eyebrow={
        pt ? "Inventário de pré-lançamento" : "Inventário de pré-lançamento"
      }
      title="Subprocessadores"
      description={
        pt
          ? "Nenhum subprocessador clínico está ativo nesta demonstração local. A lista contratual será publicada antes de qualquer dado real."
          : "Nenhum subprocessador clínico está ativo nesta demonstração local. A lista contratual será publicada antes de qualquer dado real."
      }
    >
      <PolicySection title={pt ? "Stack prevista" : "Stack prevista"}>
        <p>
          {pt
            ? "Supabase para identidade e planos de dados isolados; Vercel para aplicação. Stripe só entra quando a fase comercial for ativada."
            : "Supabase para identidade e planos de dados isolados; Vercel para aplicação. Stripe só entra quando a fase comercial for ativada."}
        </p>
      </PolicySection>
      <PolicySection title={pt ? "Condição de entrada" : "Condição de entrada"}>
        <p>
          {pt
            ? "Região, finalidade, categorias de dados, retenção, transferências, DPA, medidas técnicas e processo de alteração têm de ser registados antes da ativação."
            : "Região, finalidade, categorias de dados, retenção, transferências, DPA, medidas técnicas e processo de alteração precisam ser registrados antes da ativação."}
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
