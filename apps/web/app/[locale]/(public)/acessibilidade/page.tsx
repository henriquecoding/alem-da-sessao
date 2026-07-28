import type { Metadata } from "next";
import { PolicyPage, PolicySection } from "@/components/policy-page";
import { resolveLocale } from "@/lib/locale";

export const metadata: Metadata = { title: "Acessibilidade" };

export default async function AccessibilityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await resolveLocale(params);
  const pt = locale === "pt-PT";

  return (
    <PolicyPage
      eyebrow={pt ? "Compromisso verificável" : "Compromisso verificável"}
      title="Acessibilidade"
      description={
        pt
          ? "O objetivo é WCAG 2.2 AA e compatibilidade com a EN 301 549. A conformidade final só será declarada depois de testes assistivos e auditoria externa."
          : "O objetivo é WCAG 2.2 AA e compatibilidade com a EN 301 549. A conformidade final só será declarada depois de testes assistivos e auditoria externa."
      }
    >
      <PolicySection title={pt ? "Já aplicado" : "Já aplicado"}>
        <p>
          {pt
            ? "Navegação por teclado, alvos mínimos de 44 px, foco visível, alternativas a arrastar, movimento reduzido, duas polaridades de cor e linguagem de estados não dependente apenas de cor."
            : "Navegação por teclado, alvos mínimos de 44 px, foco visível, alternativas ao arrastar, movimento reduzido, duas polaridades de cor e linguagem de estados não dependente apenas de cor."}
        </p>
      </PolicySection>
      <PolicySection
        title={pt ? "Validação obrigatória" : "Validação obrigatória"}
      >
        <p>
          {pt
            ? "Antes do beta serão testados leitor de ecrã, ampliação, zoom a 400%, reflow, contraste calculado, ordem de foco e uso apenas por teclado em dispositivos reais."
            : "Antes do beta serão testados leitor de tela, ampliação, zoom a 400%, reflow, contraste calculado, ordem de foco e uso apenas por teclado em dispositivos reais."}
        </p>
      </PolicySection>
      <PolicySection title={pt ? "Contacto" : "Contato"}>
        <p>
          {pt
            ? "O canal de acessibilidade será publicado antes do beta. Até lá, a demonstração não recolhe pedidos nem dados pessoais."
            : "O canal de acessibilidade será publicado antes do beta. Até lá, a demonstração não coleta solicitações nem dados pessoais."}
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
