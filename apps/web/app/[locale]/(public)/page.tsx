import type { Metadata } from "next";
import { getMessages } from "@alem-da-sessao/i18n";
import { IntervalStudio } from "@/components/home/interval-studio";
import { resolveLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: "O espaço entre duas sessões",
  description:
    "Continuidade terapêutica conduzida por profissionais: experiências privadas para clientes e gestão da prática para psicólogos e psiquiatras.",
};

/**
 * A homepage é a primeira experiência da plataforma.
 *
 * Uma única folha de origami é o modelo mental do intervalo: primeiro plana,
 * depois marcada, dobrada numa forma e finalmente aberta como ponte apenas
 * quando há uma decisão de partilha. A alternativa para quem já utiliza a
 * plataforma transforma a mesma cena nas duas portas do produto.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, segment } = await resolveLocale(params);
  const messages = getMessages(locale);

  return (
    <IntervalStudio copy={messages.home} locale={locale} segment={segment} />
  );
}
