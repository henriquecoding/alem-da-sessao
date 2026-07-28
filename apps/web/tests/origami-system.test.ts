import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { contrastReport } from "@/components/origami/report";
import {
  paperFamilyList,
  stageSurfaces,
} from "@/components/origami/tokens/paper";
import { origamiModelIds, origamiResultIds } from "@/components/origami/types";

/**
 * O que sobra desta camada depois de a geometria mudar de sítio.
 *
 * Este ficheiro testava topologia sobre polígonos desenhados: cada aresta em
 * duas faces, a soma das áreas a igualar a silhueta. Era o gate certo para o
 * que aquilo era — um desenho plano — e é o gate errado para papel dobrado, que
 * tem camadas e cuja soma de áreas é sempre maior do que a silhueta.
 *
 * A topologia passou a ser verificada sobre a folha, em `origami-pipeline` e
 * `origami-assets`, contra um `source.fold`. O que fica aqui é a cor: o papel
 * contra o palco, medido contra a cor adjacente real.
 */

describe("família de modelos", () => {
  it("tem quatro resultados e dois estados", () => {
    expect(origamiResultIds).toHaveLength(4);
    expect(origamiModelIds).toHaveLength(6);
    for (const id of origamiResultIds) {
      expect(origamiModelIds).toContain(id);
    }
  });

  /**
   * O barco e o grou saíram porque se fazem por sequência, com dobras que
   * reordenam camadas — e o motor não tem modelo de camadas. Este teste existe
   * para que ninguém os volte a pôr sem que a fronteira do solver mude
   * primeiro. Ver `docs/ORIGAMI_RUNTIME.md` §5.
   */
  it("não volta a prometer formas que o motor não dobra", () => {
    expect(origamiModelIds).not.toContain("boat");
    expect(origamiModelIds).not.toContain("crane");
    expect(origamiResultIds).toContain("envelope");
    expect(origamiResultIds).toContain("gate");
  });
});

describe("contraste do papel contra o palco", () => {
  it("passa em todas as combinações de família, palco e tema", () => {
    const failures = contrastReport().filter((row) => !row.passes);
    expect(failures).toEqual([]);
  });

  it("garante o «fosso tonal» — nenhuma face principal se funde com o fundo", () => {
    for (const row of contrastReport()) {
      expect(row.baseVsStage).toBeGreaterThanOrEqual(1.3);
    }
  });
});

/**
 * Os valores vivem em dois sítios por necessidade: o TypeScript é o que o
 * relatório lê, o CSS é o que o navegador pinta — e é também o que o shader lê,
 * porque o runtime obtém as cores do papel a partir dos tokens computados no
 * elemento. Um token que só existisse num deles seria um valor por verificar.
 */
describe("tokens em TypeScript e em CSS", () => {
  it("declara os mesmos valores de papel nos dois sítios", async () => {
    const css = await readFile("app/origami.css", "utf8");

    for (const family of paperFamilyList) {
      const block = css.match(
        new RegExp(`\\[data-paper="${family.id}"\\]\\s*\\{([^}]*)\\}`),
      );
      expect(block, `bloco CSS de ${family.id}`).not.toBeNull();

      for (const tone of ["lit", "base", "shade", "inner", "edge"] as const) {
        expect(block?.[1]).toContain(
          `--paper-${tone}: light-dark(${family.light[tone]}, ${family.dark[tone]});`,
        );
      }
    }
  });

  it("declara os mesmos palcos nos dois sítios", async () => {
    const css = await readFile("app/origami.css", "utf8");

    for (const [id, stage] of Object.entries(stageSurfaces)) {
      expect(css).toContain(
        `--origami-stage-surface: light-dark(${stage.light}, ${stage.dark});`,
      );
      expect(css).toContain(`.origami-stage[data-stage="${id}"]`);
    }
  });
});
