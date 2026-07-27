import { describe, expect, it } from "vitest";
import {
  FACES,
  displacement,
  originFace,
  restingCube,
  scrambleFrom,
  turn,
  type CubeState,
} from "@alem-da-sessao/tool-registry/cube";

function turns(state: CubeState, sequence: readonly (typeof FACES)[number][]) {
  return sequence.reduce((current, face) => turn(current, face).state, state);
}

/** A face inteira, lida como as origens das nove peças que a compõem. */
function faceOrigins(state: CubeState, face: (typeof FACES)[number]) {
  return state
    .map((piece) => originFace(piece, face))
    .filter((origin): origin is (typeof FACES)[number] => origin !== null);
}

describe("o cubo é geometricamente correto", () => {
  it("nasce com 26 peças e cada face inteira da sua própria cor", () => {
    const state = restingCube();
    expect(state).toHaveLength(26);

    for (const face of FACES) {
      const origins = faceOrigins(state, face);
      expect(origins).toHaveLength(9);
      expect(origins.every((origin) => origin === face)).toBe(true);
    }
  });

  it("volta ao repouso ao fim de quatro quartos de volta da mesma face", () => {
    for (const face of FACES) {
      const state = turns(restingCube(), [face, face, face, face]);
      for (const other of FACES) {
        expect(
          faceOrigins(state, other).every((origin) => origin === other),
        ).toBe(true);
      }
    }
  });

  it("mantém sempre nove peças por face — nada se perde nem se duplica", () => {
    const state = turns(restingCube(), [
      "cima",
      "direita",
      "frente",
      "esquerda",
      "baixo",
      "tras",
      "direita",
    ]);
    for (const face of FACES) {
      expect(faceOrigins(state, face)).toHaveLength(9);
    }
  });

  it("conserva a contagem de cada cor no cubo inteiro", () => {
    const state = turns(restingCube(), [
      "frente",
      "cima",
      "direita",
      "direita",
      "tras",
    ]);
    const totals = Object.fromEntries(FACES.map((face) => [face, 0])) as Record<
      string,
      number
    >;

    for (const face of FACES) {
      for (const origin of faceOrigins(state, face)) totals[origin] += 1;
    }

    // Cada cor existe exatamente nove vezes, sempre.
    for (const face of FACES) expect(totals[face]).toBe(9);
  });
});

describe("girar uma face mexe nas outras — a afirmação central", () => {
  it("nomeia as quatro faces vizinhas que vieram atrás, e nunca a oposta", () => {
    const { moved } = turn(restingCube(), "cima");

    expect(moved).toEqual(["esquerda", "frente", "direita", "tras"]);
    expect(moved).not.toContain("cima");
    expect(moved).not.toContain("baixo");
  });

  it("desloca de facto peças das faces que diz ter mexido", () => {
    const { state, moved } = turn(restingCube(), "frente");

    for (const face of moved) {
      const foreign = faceOrigins(state, face).filter(
        (origin) => origin !== face,
      );
      expect(
        foreign.length,
        `${face} devia ter peças de outra face`,
      ).toBeGreaterThan(0);
    }
  });
});

describe("a desordem inicial é da pessoa, não do acaso", () => {
  it("dá sempre o mesmo cubo para as mesmas palavras", () => {
    const first = scrambleFrom(["o trabalho", "a minha mãe", "dormir"]);
    const second = scrambleFrom(["o trabalho", "a minha mãe", "dormir"]);

    expect(first.sequence).toEqual(second.sequence);
    expect(first.state).toEqual(second.state);
  });

  it("ignora maiúsculas e espaços à volta, que não são escolhas da pessoa", () => {
    const plain = scrambleFrom(["O Trabalho ", "dormir"]);
    const same = scrambleFrom(["o trabalho", "DORMIR "]);

    expect(plain.sequence).toEqual(same.sequence);
  });

  it("dá cubos diferentes a pessoas que nomearam coisas diferentes", () => {
    const one = scrambleFrom(["o trabalho", "dormir"]);
    const other = scrambleFrom(["a casa", "o meu irmão"]);

    expect(one.sequence).not.toEqual(other.sequence);
  });

  it("parte de facto desarrumado", () => {
    const { state } = scrambleFrom(["o trabalho", "a minha mãe", "dormir"]);
    const total = Object.values(displacement(state)).reduce(
      (sum, count) => sum + count,
      0,
    );

    expect(total).toBeGreaterThan(0);
  });
});

describe("o cubo não pontua ninguém", () => {
  it("não expõe nada que se pareça com resolvido, alvo ou progresso", async () => {
    const source = await import("@alem-da-sessao/tool-registry/cube");
    const exported = Object.keys(source).join(" ").toLowerCase();

    for (const forbidden of [
      "solve",
      "solved",
      "score",
      "progress",
      "complete",
      "win",
    ]) {
      expect(
        exported,
        `\`${forbidden}\` não pertence a este módulo`,
      ).not.toContain(forbidden);
    }
  });
});
