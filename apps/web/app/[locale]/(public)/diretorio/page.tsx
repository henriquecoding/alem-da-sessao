import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { BadgeCheck, Languages, MapPin, Monitor, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { directoryFocuses, searchDirectory } from "@/lib/directory";
import { resolveLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Diretório de profissionais verificados",
};

/**
 * O diretório — relatório v2 §8.2, §11 Fase 2 e §2 Camada D.
 *
 * O convite é neutro por construção. Esta página não recebe, não lê e não pode
 * ler nada do que a pessoa escreveu numa experiência: a busca só aceita
 * filtros declarados (`DirectoryQuery`), e `check:privacy` falha o build se
 * algo derivado de conteúdo aparecer aqui.
 *
 * Por que isto vale mais que um diretório clássico: o Psychology Today entrega
 * 1–3 contactos por mês, em queda de 77–90%, porque um lead de diretório é
 * alguém que pesquisou "psicólogo lisboa" — zero contexto, comportamento de
 * comparação, intenção baixa. Aqui o lead é alguém que acabou de passar
 * quinze minutos a articular o que carrega. Não é o mesmo produto.
 */
export default async function DirectoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await resolveLocale(params);
  const profiles = searchDirectory();
  const focuses = directoryFocuses[locale];
  const pt = locale === "pt-PT";

  return (
    <main className="mx-auto w-full max-w-[1240px] px-4 pb-24 pt-12 sm:px-6 lg:px-8 lg:pt-20">
      <Badge tone="success" className="enter">
        <BadgeCheck className="mr-1.5 size-3.5" aria-hidden="true" />
        {pt ? "Verificados à mão" : "Verificados à mão"}
      </Badge>

      <h1
        className="enter mt-6 max-w-[20ch] text-balance text-[clamp(2.15rem,1.3rem+3.2vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.05em]"
        style={{ "--d": 1 } as CSSProperties}
      >
        {pt
          ? "Procurar alguém, quando quiser."
          : "Procurar alguém, quando você quiser."}
      </h1>

      {/* O convite neutro do §8.2. Nunca "com base no que escreveu". */}
      <p
        className="enter mt-5 max-w-[60ch] text-base leading-7 text-[var(--muted-foreground)]"
        style={{ "--d": 2 } as CSSProperties}
      >
        {pt
          ? "Este diretório não sabe nada do que escreveu nas experiências, e nunca vai saber. A procura acontece por país, região, modalidade, língua e área declarada — factos que o profissional afirma e que verificamos, não inferências sobre si."
          : "Este diretório não sabe nada do que você escreveu nas experiências, e nunca vai saber. A busca acontece por país, região, modalidade, idioma e área declarada — fatos que o profissional afirma e que verificamos, não inferências sobre você."}
      </p>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {profiles.map((profile, index) => (
          <div
            key={profile.id}
            className="reveal"
            style={{ "--d": index } as CSSProperties}
          >
            <Card className="lift h-full">
              <CardContent className="flex h-full flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold tracking-[-0.03em]">
                      {profile.name}
                    </h2>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      {profile.licence}
                    </p>
                  </div>
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--success-soft)] text-[var(--success)]"
                    title={
                      pt
                        ? `Cédula verificada a ${profile.verifiedAt}`
                        : `Registro verificado em ${profile.verifiedAt}`
                    }
                  >
                    <BadgeCheck className="size-4" aria-hidden="true" />
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                  {profile.statement}
                </p>

                <dl className="mt-5 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">{pt ? "Região" : "Região"}</dt>
                    <MapPin
                      className="size-3.5 shrink-0 text-[var(--muted-foreground)]"
                      aria-hidden="true"
                    />
                    <dd>
                      {profile.region} · {profile.country}
                    </dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">
                      {pt ? "Modalidade" : "Modalidade"}
                    </dt>
                    <Monitor
                      className="size-3.5 shrink-0 text-[var(--muted-foreground)]"
                      aria-hidden="true"
                    />
                    <dd>
                      {profile.modalities
                        .map((modality) =>
                          modality === "online" ? "Online" : "Presencial",
                        )
                        .join(" · ")}
                    </dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">{pt ? "Línguas" : "Idiomas"}</dt>
                    <Languages
                      className="size-3.5 shrink-0 text-[var(--muted-foreground)]"
                      aria-hidden="true"
                    />
                    <dd>{profile.languages.join(" · ")}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">{pt ? "Áreas" : "Áreas"}</dt>
                    <Users
                      className="size-3.5 shrink-0 text-[var(--muted-foreground)]"
                      aria-hidden="true"
                    />
                    <dd>
                      {profile.focuses
                        .map((focus) => focuses[focus] ?? focus)
                        .join(" · ")}
                    </dd>
                  </div>
                </dl>

                <p className="mt-auto pt-6 text-xs leading-5 text-[var(--muted-foreground)]">
                  {pt
                    ? "Nesta demonstração local não é possível enviar um pedido de contacto."
                    : "Nesta demonstração local não é possível enviar um pedido de contato."}
                </p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <p className="reveal mt-12 max-w-[70ch] text-sm leading-7 text-[var(--muted-foreground)]">
        {pt
          ? "Os perfis são verificados um a um, à mão, contra a cédula profissional. Não há posições pagas, não há destaque comprado e não cobramos por contacto — cobrar por lead recria exatamente o ressentimento dos marketplaces."
          : "Os perfis são verificados um a um, à mão, contra o registro profissional. Não há posições pagas, não há destaque comprado e não cobramos por contato — cobrar por lead recria exatamente o ressentimento dos marketplaces."}
      </p>
    </main>
  );
}
