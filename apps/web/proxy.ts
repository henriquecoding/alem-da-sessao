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

/**
 * Um ficheiro não tem língua.
 *
 * O matcher já mantém os assets fora daqui, mas o matcher é uma lista de nomes
 * numa string de regex — foi uma edição a essa lista que pôs `/origami/...` a
 * ser redirecionado para `/pt-pt/origami/...` e deixou o runtime sem assets
 * durante toda a vida da funcionalidade. Uma segunda barreira que olha para a
 * forma do caminho, e não para uma lista, custa uma linha e não se esquece de
 * ser atualizada.
 */
function isAsset(pathname: string): boolean {
  const last = pathname.split("/").pop() ?? "";
  return last.includes(".");
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  if (isAsset(pathname)) return NextResponse.next();

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
       `/pt-pt/dev/origami-lab`, que não existe.

       `origami` está de fora porque são ficheiros e não páginas. Sem esta
       exclusão, o pedido de `/origami/sheet/model.ors.json` era redirecionado
       para `/pt-pt/origami/sheet/model.ors.json` — que não existe — e o `fetch`
       do runtime respondia 404. O canvas nunca ficava pronto, o fallback SVG
       ficava visível para sempre, e **nada disto falhava**: os assets estavam
       corretos em disco, o `check:origami-runtime` passava, os testes passavam.
       Só um browser a pedir o ficheiro é que mostra o defeito, e é por isso que
       existe agora `tests/origami-asset-route.test.ts`. */
    "/((?!api|dev|origami|_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)",
  ],
};
