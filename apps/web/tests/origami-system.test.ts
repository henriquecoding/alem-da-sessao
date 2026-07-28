import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  origamiModelList,
  origamiResultIds,
} from "@/components/origami/models";
import { contrastReport, topologyReport } from "@/components/origami/report";
import {
  paperFamilyList,
  stageSurfaces,
} from "@/components/origami/tokens/paper";

/**
 * O que a folha de prova não consegue verificar sozinha.
 *
 * O teste de reconhecimento é humano e continua a sê-lo — nenhuma assertion
 * decide se um objeto parece um grou. O que se automatiza é o que torna um
 * objeto *impossível de construir mal*: a topologia da folha e o contraste
 * contra o palco em que vai viver.
 */

describe("topologia dos modelos", () => {
  it.each(origamiModelList.map((model) => [model.id] as const))(
    "%s é uma folha e não polígonos encostados",
    (id) => {
      const row = topologyReport().find((entry) => entry.model === id);
      expect(row?.problems).toEqual([]);
    },
  );

  it("fecha a silhueta exactamente com a área das faces", () => {
    for (const row of topologyReport()) {
      expect(Math.abs(row.faceArea - row.silhouetteArea)).toBeLessThan(0.5);
    }
  });

  it("declara todos os vértices que usa", () => {
    for (const model of origamiModelList) {
      const declared = new Set(Object.keys(model.vertices));
      const used = [
        ...model.silhouette,
        ...model.faces.flatMap((face) => face.vertices),
        ...model.creases.flatMap((crease) => crease.vertices),
      ];
      for (const key of used) expect(declared.has(key)).toBe(true);
    }
  });

  it("não deixa vértices por usar — um vértice órfão é geometria esquecida", () => {
    for (const model of origamiModelList) {
      const used = new Set([
        ...model.silhouette,
        ...model.faces.flatMap((face) => face.vertices),
      ]);
      for (const key of Object.keys(model.vertices)) {
        expect(used.has(key)).toBe(true);
      }
    }
  });

  it("dá a cada resultado um rótulo acessível nas duas variantes", () => {
    for (const id of origamiResultIds) {
      const model = origamiModelList.find((entry) => entry.id === id);
      expect(model?.accessibleLabel["pt-PT"]).toBeTruthy();
      expect(model?.accessibleLabel["pt-BR"]).toBeTruthy();
    }
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
 * relatório lê, o CSS é o que o navegador pinta. Um token que só existisse num
 * deles seria um valor por verificar — este teste é o que impede a divergência.
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
