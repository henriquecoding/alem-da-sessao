import type { Metadata } from "next";
import { getMessages } from "@alem-da-sessao/i18n";
import { HomeExperience } from "@/components/homepage/home-experience";
import { HomeSections } from "@/components/homepage/home-sections";
import { loadFallbacks } from "@/components/origami/asset-loader";
import { OrigamiDefs } from "@/components/origami/origami-figure";
import { resolveLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: "O espaço entre duas sessões",
  description:
    "Continuidade terapêutica conduzida por profissionais: experiências privadas para clientes e gestão da prática para psicólogos e psiquiatras.",
};

/**
 * A homepage é a primeira experiência da plataforma.
 *
 * Começa com uma pergunta e três respostas possíveis, não com uma explicação.
 * Uma folha de papel ocupa o centro; cada escolha dá-lhe um vinco novo, e a
 * última dobra-a num objeto que nomeia a decisão — levar, guardar, atravessar,
 * suspender. Nada do que se escolhe sai do estado do componente.
 *
 * A página é um Server Component. Só a engine do ritual é cliente, e o texto
 * que interessa a um motor de busca vive em `HomeSections`, fora da animação.
 *
 * A direção de arte — «Ateliê de luz» — foi escolhida no laboratório interno
 * `/dev/origami-lab` e está documentada em `docs/ORIGAMI_LAB.md`. Trocá-la é
 * trocar o valor de `stage`; as outras duas continuam disponíveis lá.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, segment } = await resolveLocale(params);
  const messages = getMessages(locale);

  // As silhuetas dos modelos que já dobram a partir de uma folha. Vão no HTML
  // para que o primeiro byte traga a forma certa, e não um espaço vazio à
  // espera de rede. Um modelo que ainda não esteja compilado simplesmente não
  // aparece neste mapa, e a cena usa a figura SVG anterior.
  const fallbacks = await loadFallbacks([
    "sheet",
    "half-fold",
    "box",
    "suspended-sheet",
  ]);

  return (
    <main>
      <OrigamiDefs />
      <section className="px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:px-8 lg:pb-24">
        <div className="mx-auto w-full max-w-[76rem]">
          <HomeExperience
            copy={messages.home}
            locale={locale}
            segment={segment}
            stage="atelier"
            fallbacks={fallbacks}
          />
        </div>
      </section>
      <HomeSections copy={messages.home} segment={segment} />
    </main>
  );
}
