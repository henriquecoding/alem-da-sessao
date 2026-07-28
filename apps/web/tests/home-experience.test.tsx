import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { getMessages } from "@alem-da-sessao/i18n";
import { describe, expect, it } from "vitest";
import { HomeExperience } from "@/components/homepage/home-experience";
import {
  canAdvance,
  decideIds,
  initialExperienceState,
  modelOf,
  paperOf,
  reduceExperience,
  resultOf,
} from "@/components/homepage/experience-machine";

const copy = getMessages("pt-PT").home;

/**
 * Os mesmos fallbacks que o servidor serve.
 *
 * O `jsdom` não tem WebGL2, portanto o canvas nunca fica pronto e o que se vê é
 * exatamente o que vê quem não tem aceleração — que é o caso que interessa
 * testar. A silhueta tem de estar no DOM sem depender de nada.
 */
const fallbacks = Object.fromEntries(
  await Promise.all(
    ["sheet", "half-fold", "box", "suspended-sheet"].map(async (id) => {
      const asset = JSON.parse(
        await readFile(
          join(process.cwd(), "public", "origami", id, "model.ors.json"),
          "utf8",
        ),
      ) as { fallback: { svg: string; viewBox: string } };
      return [id, asset.fallback] as const;
    }),
  ),
);

function renderExperience() {
  return render(
    <HomeExperience
      copy={copy}
      locale="pt-PT"
      segment="pt-pt"
      fallbacks={fallbacks}
    />,
  );
}

/** Leva a experiência do início até ao resultado, escolhendo em cada passo. */
function walkToResult(decideLabel: string) {
  fireEvent.click(screen.getByRole("button", { name: /Sim, ficou/ }));
  fireEvent.click(screen.getByRole("button", { name: /Uma sensação/ }));
  fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
  fireEvent.click(screen.getByRole("button", { name: /Está claro/ }));
  fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
  fireEvent.click(
    screen.getByRole("button", { name: new RegExp(decideLabel) }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
}

describe("máquina de estados da experiência", () => {
  it("não avança sem uma escolha em cada passo", () => {
    let state = reduceExperience(initialExperienceState, { type: "begin" });
    expect(state.id).toBe("newcomer.notice");
    expect(canAdvance(state)).toBe(false);

    // Avançar sem escolher não é um erro silencioso: é um não-evento.
    expect(reduceExperience(state, { type: "advance" })).toBe(state);

    state = reduceExperience(state, { type: "notice", id: "feeling" });
    expect(canAdvance(state)).toBe(true);
    expect(reduceExperience(state, { type: "advance" }).id).toBe(
      "newcomer.form",
    );
  });

  it("desfaz a escolha do passo que se abandona ao voltar atrás", () => {
    let state = reduceExperience(initialExperienceState, { type: "begin" });
    state = reduceExperience(state, { type: "notice", id: "idea" });
    state = reduceExperience(state, { type: "advance" });
    state = reduceExperience(state, { type: "form", id: "clear" });
    state = reduceExperience(state, { type: "back" });

    expect(state.id).toBe("newcomer.notice");
    expect(state.form).toBeNull();
    // A escolha do passo em que se fica mantém-se; só a abandonada desaparece.
    expect(state.notice).toBe("idea");
  });

  it("faz a decisão escolher o objeto, e nunca o que a pessoa notou", () => {
    // O invariante que impede a forma de virar uma leitura sobre a pessoa.
    for (const notice of ["idea", "feeling", "question", "unnamed"] as const) {
      let state = reduceExperience(initialExperienceState, { type: "begin" });
      state = reduceExperience(state, { type: "notice", id: notice });
      state = reduceExperience(state, { type: "advance" });
      state = reduceExperience(state, { type: "form", id: "tangled" });
      state = reduceExperience(state, { type: "advance" });
      state = reduceExperience(state, { type: "decide", id: "carry" });
      state = reduceExperience(state, { type: "advance" });

      expect(state.id).toBe("newcomer.result");
      expect(modelOf(state)).toBe("boat");
    }
  });

  it("dá uma forma diferente a cada intenção", () => {
    const shapes = decideIds.map((id) => resultOf(id));
    expect(new Set(shapes).size).toBe(decideIds.length);
  });

  it("só dá cor ao papel quando a folha ganha forma", () => {
    let state = reduceExperience(initialExperienceState, { type: "begin" });
    state = reduceExperience(state, { type: "notice", id: "decision" });
    expect(paperOf(state)).toBe("lilac");

    state = reduceExperience(state, { type: "advance" });
    state = reduceExperience(state, { type: "form", id: "carry" });
    state = reduceExperience(state, { type: "advance" });
    state = reduceExperience(state, { type: "decide", id: "cross" });
    expect(paperOf(state)).toBe("lilac");

    state = reduceExperience(state, { type: "advance" });
    expect(paperOf(state)).toBe("mist");
  });

  it("a mesma folha passa por todos os estados sem saltos", () => {
    let state = reduceExperience(initialExperienceState, { type: "begin" });
    expect(modelOf(initialExperienceState)).toBe("sheet");
    expect(modelOf(state)).toBe("sheet");

    state = reduceExperience(state, { type: "notice", id: "question" });
    expect(modelOf(state)).toBe("suspended-sheet");

    state = reduceExperience(state, { type: "advance" });
    state = reduceExperience(state, { type: "form", id: "rest" });
    expect(modelOf(state)).toBe("half-fold");
  });
});

describe("homepage — o ritual", () => {
  it("começa com uma ação e não com uma explicação", () => {
    renderExperience();
    expect(
      screen.getByRole("heading", { name: copy.intro.question }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sim, ficou/ }),
    ).toBeInTheDocument();
  });

  it("nunca pede um texto à pessoa", () => {
    const { container } = renderExperience();
    fireEvent.click(screen.getByRole("button", { name: /Sim, ficou/ }));

    expect(container.querySelector("textarea")).toBeNull();
    expect(container.querySelector("input")).toBeNull();
  });

  it("dobra a mesma folha a cada escolha", () => {
    const { container } = renderExperience();
    expect(
      container.querySelector('[data-origami-model="sheet"]'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Sim, ficou/ }));
    fireEvent.click(screen.getByRole("button", { name: /Uma pergunta/ }));
    expect(
      container.querySelector('[data-origami-model="suspended-sheet"]'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(screen.getByRole("button", { name: /Continua confuso/ }));
    expect(
      container.querySelector('[data-origami-model="half-fold"]'),
    ).toBeInTheDocument();
  });

  it.each([
    ["Levar para a próxima sessão", "boat"],
    ["Guardar só para mim", "box"],
    ["Explorar uma experiência", "crane"],
    ["Deixar em suspenso", "suspended-sheet"],
  ])("transforma «%s» em %s", (label, model) => {
    const { container } = renderExperience();
    walkToResult(label);

    expect(
      container.querySelector(`[data-origami-model="${model}"]`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        copy.result.objects[model as keyof typeof copy.result.objects].body,
      ),
    ).toBeInTheDocument();
  });

  it("diz em voz alta que nada é interpretado nem guardado", () => {
    renderExperience();
    expect(screen.getByText(copy.shell.privacy)).toBeInTheDocument();

    walkToResult("Guardar só para mim");
    expect(screen.getByText(copy.result.note)).toBeInTheDocument();
  });

  it("dá a quem já utiliza um percurso direto, sem repetir o ritual", () => {
    renderExperience();
    fireEvent.click(
      screen.getByRole("button", { name: /Já utilizo o Além da Sessão/ }),
    );

    expect(
      screen.getByRole("heading", { name: copy.returning.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: new RegExp(copy.returning.assigned.title),
      }),
    ).toHaveAttribute("href", "/pt-pt/cuidado/hoje");
    // Nenhum passo do ritual aparece neste percurso.
    expect(screen.queryByText(copy.steps.notice.prompt)).toBeNull();
  });

  it("recomeça sem deixar rasto da escolha anterior", () => {
    const { container } = renderExperience();
    walkToResult("Explorar uma experiência");
    expect(
      container.querySelector('[data-origami-model="crane"]'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Recomeçar/ }));
    expect(
      container.querySelector('[data-origami-model="sheet"]'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: copy.intro.question }),
    ).toBeInTheDocument();
  });
});

describe("acessibilidade da cena", () => {
  it("mantém o origami fora da árvore de acessibilidade e descreve a cena em texto", () => {
    const { container } = renderExperience();
    const figure = container.querySelector("[data-origami-model]");

    expect(figure).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText(copy.scene.description)).toBeInTheDocument();
  });

  it("leva o foco ao novo título a cada mudança de etapa", () => {
    renderExperience();
    fireEvent.click(screen.getByRole("button", { name: /Sim, ficou/ }));

    const heading = screen.getByRole("heading", {
      name: copy.steps.notice.title,
    });
    expect(heading).toHaveFocus();
  });
});

/**
 * A homepage passou a usar geometria real onde ela existe.
 *
 * A substituição é gradual por decisão: um modelo entra no runtime quando tem
 * um `source.fold` que dobra e passa os gates. Estes testes fixam qual é a
 * fronteira hoje, para que ela não se mova por acidente — nem para a frente,
 * nem para trás.
 */
describe("origami real na homepage", () => {
  it.each(["sheet", "half-fold", "box", "suspended-sheet"])(
    "%s desenha a silhueta compilada e monta o canvas",
    async (model) => {
      const { container } = renderExperience();
      if (model === "box") {
        walkToResult("Guardar só para mim");
      } else if (model === "suspended-sheet") {
        walkToResult("Deixar em suspenso");
      } else if (model === "half-fold") {
        fireEvent.click(screen.getByRole("button", { name: /Sim, ficou/ }));
        fireEvent.click(screen.getByRole("button", { name: /Uma pergunta/ }));
        fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
        fireEvent.click(
          screen.getByRole("button", { name: /Continua confuso/ }),
        );
      }

      const scene = container.querySelector(
        `figure[data-origami-model="${model}"]`,
      );
      expect(scene, `cena de ${model}`).toBeInTheDocument();
      expect(scene?.querySelector("svg.origami-fallback")).toBeInTheDocument();
      expect(scene?.querySelector("canvas.origami-canvas")).toBeInTheDocument();
    },
  );

  /**
   * O fallback não é um segundo desenho: sai do frame final da mesma simulação.
   * Se alguém o substituísse por um SVG à mão, os polígonos deixariam de estar
   * sombreados pela normal de cada face e este teste apanhava-o.
   */
  it("serve uma silhueta derivada da simulação, e não um desenho paralelo", () => {
    const { container } = renderExperience();
    const svg = container.querySelector("svg.origami-fallback");

    expect(svg?.querySelectorAll("polygon").length).toBeGreaterThan(0);
    expect(svg?.innerHTML).toContain("color-mix(");
    // As cores continuam a ser tokens: o tema funciona sem canvas e sem JS.
    expect(svg?.innerHTML).toContain("var(--paper-");
  });

  it.each([
    ["Levar para a próxima sessão", "boat"],
    ["Explorar uma experiência", "crane"],
  ])(
    "«%s» continua na figura SVG enquanto %s não tiver padrão de vincos",
    (label, model) => {
      const { container } = renderExperience();
      walkToResult(label);

      const figure = container.querySelector(`[data-origami-model="${model}"]`);
      expect(figure).toBeInTheDocument();
      expect(figure?.tagName.toLowerCase()).toBe("svg");
      expect(container.querySelector("canvas")).toBeNull();
    },
  );

  /**
   * Um canvas focável seria uma paragem de tabulação sem nada para ler. O
   * conteúdo da cena é a descrição em texto, que já existe e já é testada.
   */
  it("mantém o canvas fora da tabulação e da árvore de acessibilidade", () => {
    const { container } = renderExperience();
    const canvas = container.querySelector("canvas.origami-canvas");

    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas).toHaveAttribute("tabindex", "-1");
    expect(canvas).toHaveAttribute("data-ready", "false");
  });
});
