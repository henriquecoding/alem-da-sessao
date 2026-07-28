import { NextRequest, NextResponse } from "next/server";
import { isLocaleSegment } from "@alem-da-sessao/i18n";
import { localeCookie } from "@/lib/preferences";

/**
 * Quem chega sem língua no URL tem de receber uma, e qual é a primeira coisa
 * que o produto lhe diz.
 *
 * A ordem é deliberada:
 *
 * 1. **A escolha explícita ganha.** Quem já trocou de variante alguma vez tem
 *    essa decisão guardada, e não volta a ser mandado para a outra por causa
 *    de uma definição do sistema operativo que nunca reviu. Antes disto, o
 *    seletor de língua não deixava rasto nenhum: escolher «Brasil» e voltar
 *    ao site pela raiz devolvia Portugal, sempre.
 * 2. **Só depois o palpite**, e um palpite modesto: `Accept-Language` separa
 *    de forma fiável o Brasil de tudo o resto, e mais do que isso seria fingir
 *    precisão que o cabeçalho não tem.
 *
 * Isto vive no proxy e não numa página em `/` porque uma página teria de ser
 * dinâmica para ler o cookie. Um redirecionamento não tem HTML para pré-gerar,
 * portanto as páginas do site continuam todas estáticas.
 */
function preferredSegment(request: NextRequest): "pt-pt" | "pt-br" {
  const stored = request.cookies.get(localeCookie)?.value;
  if (stored === "pt-pt" || stored === "pt-br") return stored;

  const accept = request.headers.get("accept-language") ?? "";
  return /\bpt-br\b/i.test(accept) ? "pt-br" : "pt-pt";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  if (!firstSegment) {
    return NextResponse.redirect(
      new URL(`/${preferredSegment(request)}`, request.url),
    );
  }

  if (!isLocaleSegment(firstSegment)) {
    const target = request.nextUrl.clone();
    target.pathname = `/${preferredSegment(request)}${pathname}`;
    return NextResponse.redirect(target);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /* `dev` está de fora porque o laboratório interno não tem duas variantes
       editoriais — tem uma, escrita para quem está a decidir. Sem esta
       exclusão, `/dev/origami-lab` era redirecionado para
       `/pt-pt/dev/origami-lab`, que não existe. */
    "/((?!api|dev|_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)",
  ],
};
