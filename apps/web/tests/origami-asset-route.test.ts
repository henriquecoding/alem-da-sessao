import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { origamiModelIds } from "@/components/origami/types";
import { config, proxy } from "@/proxy";

/**
 * O defeito que este ficheiro existe para impedir.
 *
 * O runtime pede `/origami/<id>/model.ors.json`. O proxy de língua reescrevia
 * qualquer caminho sem locale para `/pt-pt/<caminho>`, e o pedido do asset saía
 * como `/pt-pt/origami/sheet/model.ors.json` — que não existe. O `fetch`
 * respondia 404, o canvas nunca ficava pronto, e a homepage mostrou o fallback
 * SVG durante toda a vida da funcionalidade.
 *
 * O que torna isto digno de um teste próprio é o que **não** falhou: os assets
 * estavam corretos em disco, o `check:origami-runtime` comparava-os com a fonte
 * e passava, o build passava, e 219 testes passavam. Nenhuma verificação
 * atravessava a fronteira entre «o ficheiro existe» e «o browser consegue
 * pedi-lo». É essa fronteira que se mede aqui.
 */

/** O regex do matcher do Next, avaliado como o Next o avalia. */
function matches(pathname: string): boolean {
  return config.matcher.some((pattern) =>
    new RegExp(`^${pattern}$`).test(pathname),
  );
}

function requestFor(pathname: string): NextRequest {
  return new NextRequest(new URL(pathname, "https://alemdasessao.test"));
}

describe("rota dos assets de origami", () => {
  it("não passa pelo proxy de língua", () => {
    for (const id of origamiModelIds) {
      expect(matches(`/origami/${id}/model.ors.json`), id).toBe(false);
    }
  });

  /**
   * O teste acima passaria se alguém excluísse `origami` do matcher e ao mesmo
   * tempo partisse o proxy. Este confirma o outro lado: que o proxy, se por
   * alguma via chegasse a ver o pedido, não lhe muda o caminho.
   */
  it("mantém o caminho intacto se o proxy o vir na mesma", () => {
    const response = proxy(requestFor("/origami/sheet/model.ors.json"));
    const location = response.headers.get("location");

    if (location) {
      expect(new URL(location).pathname).not.toMatch(
        /^\/pt-(pt|br)\/origami\//,
      );
    }
  });

  /** O que o proxy deve continuar a fazer, para que a correção não o esvazie. */
  it("continua a dar língua a quem chega a uma página sem ela", () => {
    expect(matches("/precos")).toBe(true);
    expect(matches("/")).toBe(true);

    const response = proxy(requestFor("/precos"));
    expect(response.headers.get("location")).toContain("/pt-pt/precos");
  });

  it("continua a deixar o laboratório e as rotas de sistema em paz", () => {
    expect(matches("/dev/origami-lab")).toBe(false);
    expect(matches("/api/health")).toBe(false);
    expect(matches("/robots.txt")).toBe(false);
    expect(matches("/sitemap.xml")).toBe(false);
  });
});
