import type { Metadata } from "next";
import { PolicyPage, PolicySection } from "@/components/policy-page";
import { resolveLocale } from "@/lib/locale";

export const metadata: Metadata = { title: "Privacidade" };

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await resolveLocale(params);
  const pt = locale === "pt-PT";

  return (
    <PolicyPage
      eyebrow={
        pt ? "Documento de pré-lançamento" : "Documento de pré-lançamento"
      }
      title="Privacidade por arquitetura"
      description={
        pt
          ? "Esta página descreve o comportamento da demonstração local. A política jurídica final será publicada apenas após a AIPD/DPIA e a revisão Portugal–Brasil."
          : "Esta página descreve o comportamento da demonstração local. A política jurídica final será publicada somente após a AIPD/DPIA e a revisão Brasil–Portugal."
      }
    >
      <PolicySection title={pt ? "Agora" : "Agora"}>
        <p>
          {pt
            ? "A demonstração usa dados inteiramente fictícios. Os rascunhos das experiências permanecem em memória e desaparecem quando a página fecha."
            : "A demonstração usa dados inteiramente fictícios. Os rascunhos das experiências permanecem na memória e desaparecem quando a página fecha."}
        </p>
      </PolicySection>
      <PolicySection
        title={
          pt ? "Quando existirem contas reais" : "Quando existirem contas reais"
        }
      >
        <p>
          {pt
            ? "Guardar e partilhar serão atos diferentes. O profissional receberá apenas snapshots confirmados; conteúdo clínico não entrará em analytics, URLs, logs ou notificações."
            : "Salvar e compartilhar serão atos diferentes. O profissional receberá somente snapshots confirmados; conteúdo clínico não entrará em analytics, URLs, logs ou notificações."}
        </p>
      </PolicySection>
      <PolicySection title={pt ? "Antes do lançamento" : "Antes do lançamento"}>
        <p>
          {pt
            ? "É obrigatório fechar responsáveis de tratamento, bases legais, retenção, direitos, transferências, contactos e subprocessadores por jurisdição."
            : "É obrigatório fechar controladores, bases legais, retenção, direitos, transferências, contatos e subprocessadores por jurisdição."}
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
