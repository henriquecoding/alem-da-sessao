import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { getMessages } from "@alem-da-sessao/i18n";
import { describe, expect, it } from "vitest";
import { IntervalStudio } from "@/components/home/interval-studio";

describe("homepage origami experience", () => {
  it("requires an intentional choice before folding the interval", () => {
    const { container } = render(
      <IntervalStudio
        copy={getMessages("pt-PT").home}
        locale="pt-PT"
        segment="pt-pt"
      />,
    );

    const continueButton = screen.getByRole("button", { name: "Continuar" });
    expect(continueButton).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /Algo ganhou forma/ }));

    expect(continueButton).toBeEnabled();
    expect(
      container.querySelector('[data-origami-model="fox"]'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Uma perceção pode conservar a sua forma sem ser transformada imediatamente numa conclusão.",
      ),
    ).toBeInTheDocument();
  });

  it.each([
    ["Algo ficou", "crane", 8],
    ["Algo ganhou forma", "fox", 10],
    ["Algo quer seguir", "boat", 8],
  ])(
    "turns %s into a recognizable faceted %s model",
    (option, model, minimumFaces) => {
      const { container } = render(
        <IntervalStudio
          copy={getMessages("pt-PT").home}
          locale="pt-PT"
          segment="pt-pt"
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: new RegExp(option) }));

      const figure = container.querySelector(`[data-origami-model="${model}"]`);
      expect(figure).toBeInTheDocument();
      expect(figure?.querySelectorAll("polygon").length).toBeGreaterThanOrEqual(
        minimumFaces,
      );
    },
  );

  it("makes privacy and deliberate sharing separate visible states", () => {
    render(
      <IntervalStudio
        copy={getMessages("pt-PT").home}
        locale="pt-PT"
        segment="pt-pt"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Algo ficou/ }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(
      screen.getByRole("heading", {
        name: "Uma folha pode guardar mais do que uma resposta.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Estruturas de Carga")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByText("Continua privado.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Fazer atravessar" }));
    expect(screen.getByText("Atravessou.")).toBeInTheDocument();
    expect(
      screen.getByText(/Nesta demonstração, nada foi enviado/),
    ).toBeInTheDocument();
  });

  it("gives returning clients and professionals direct localized doors", () => {
    render(
      <IntervalStudio
        copy={getMessages("pt-BR").home}
        locale="pt-BR"
        segment="pt-br"
      />,
    );

    fireEvent.click(screen.getByRole("tab", { name: "Já utilizo" }));

    expect(
      screen.getByRole("link", { name: /Entrar no meu espaço/ }),
    ).toHaveAttribute("href", "/pt-br/cuidado/hoje");
    expect(
      screen.getByRole("link", { name: /Entrar na área profissional/ }),
    ).toHaveAttribute("href", "/pt-br/pro/hoje");
  });

  it("implements the complete keyboard pattern for the visit mode tabs", () => {
    render(
      <IntervalStudio
        copy={getMessages("pt-PT").home}
        locale="pt-PT"
        segment="pt-pt"
      />,
    );

    const explore = screen.getByRole("tab", { name: "Conhecer o espaço" });
    const returning = screen.getByRole("tab", { name: "Já utilizo" });

    expect(explore).toHaveAttribute("tabindex", "0");
    expect(returning).toHaveAttribute("tabindex", "-1");

    explore.focus();
    fireEvent.keyDown(explore, { key: "ArrowRight" });

    expect(returning).toHaveFocus();
    expect(returning).toHaveAttribute("aria-selected", "true");
    expect(returning).toHaveAttribute("tabindex", "0");
    expect(explore).toHaveAttribute("tabindex", "-1");

    fireEvent.keyDown(returning, { key: "Home" });
    expect(explore).toHaveFocus();
    expect(explore).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(explore, { key: "End" });
    expect(returning).toHaveFocus();
    expect(returning).toHaveAttribute("aria-selected", "true");
  });

  it("moves focus to the new heading after every ritual transition", async () => {
    render(
      <IntervalStudio
        copy={getMessages("pt-PT").home}
        locale="pt-PT"
        segment="pt-pt"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Algo ficou/ }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    const formHeading = screen.getByRole("heading", {
      name: "Uma folha pode guardar mais do que uma resposta.",
    });
    await waitFor(() => expect(formHeading).toHaveFocus());

    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    const decisionHeading = screen.getByRole("heading", {
      name: "Existir não é o mesmo que partilhar.",
    });
    await waitFor(() => expect(decisionHeading).toHaveFocus());
  });

  it("does not request intimate text in the public ritual", () => {
    const { container } = render(
      <IntervalStudio
        copy={getMessages("pt-BR").home}
        locale="pt-BR"
        segment="pt-br"
      />,
    );

    expect(container.querySelector("input")).toBeNull();
    expect(container.querySelector("textarea")).toBeNull();
  });

  it("keeps the compact navigation through tablet widths", () => {
    const header = readFileSync(
      join(process.cwd(), "components/public-header.tsx"),
      "utf8",
    );

    expect(header).toContain("lg:flex");
    expect(header).toContain("lg:hidden");
    expect(header).not.toContain("md:flex");
    expect(header).not.toContain("md:hidden");
  });
});
