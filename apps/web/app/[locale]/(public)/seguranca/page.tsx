import type { Metadata } from "next";
import {
  EyeOff,
  KeyRound,
  LockKeyhole,
  ServerCog,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Segurança",
};

export default function SecurityPage() {
  const controls = [
    {
      icon: LockKeyhole,
      title: "Privado por defeito",
      body: "Guardar uma experiência não autoriza o profissional a lê-la. A partilha é uma ação separada.",
    },
    {
      icon: KeyRound,
      title: "Autorização em camadas",
      body: "A interface, o servidor e as políticas da base de dados verificam organização, função, relação e finalidade.",
    },
    {
      icon: EyeOff,
      title: "Administração sem conteúdo clínico",
      body: "A operação comum trabalha com estado técnico e comercial, não com notas ou respostas.",
    },
    {
      icon: ServerCog,
      title: "Ambientes separados",
      body: "O protótipo usa apenas fixtures. Produção não receberá cópias de dados para desenvolvimento ou staging.",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 pb-24 pt-12 sm:px-6 lg:px-8 lg:pt-20">
      <Badge tone="success">
        <ShieldCheck className="mr-1.5 size-3.5" />
        Segurança desde o primeiro commit
      </Badge>
      <h1 className="mt-5 max-w-4xl text-balance text-[clamp(2.15rem,1.3rem+3.2vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.055em]">
        Confiança precisa de ser demonstrável, não apenas prometida.
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted-foreground)]">
        Esta página descreve decisões de arquitetura do protótipo. Não afirma
        certificação, conformidade concluída ou prontidão para dados clínicos
        reais.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {controls.map((control) => (
          <Card key={control.title}>
            <CardContent className="p-6 sm:p-7">
              <span className="grid size-11 place-items-center rounded-2xl bg-[var(--muted)] text-[var(--primary)]">
                <control.icon className="size-5" />
              </span>
              <h2 className="mt-6 text-lg font-bold tracking-[-0.03em]">
                {control.title}
              </h2>
              <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                {control.body}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 rounded-[var(--radius-lg)] bg-[var(--warning-soft)] p-6 text-sm leading-7 text-[var(--warning)] sm:p-8">
        <strong>Antes de qualquer piloto real:</strong> serão necessários
        projetos Supabase isolados e pagos, MFA, testes RLS com tokens reais,
        DPIA/AIPD, revisão jurídica Portugal–Brasil, revisão clínica das
        experiências e ensaio de backup/restauro.
      </div>
    </main>
  );
}
