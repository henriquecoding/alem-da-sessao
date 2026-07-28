import { fireEvent, render, screen } from "@testing-library/react";
import { getMessages } from "@alem-da-sessao/i18n";
import { describe, expect, it } from "vitest";
import { IntervalStudio } from "@/components/home/interval-studio";

describe("homepage origami experience", () => {
  it("requires an intentional choice before folding the interval", () => {
    render(
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
      screen.getByText(
        "Uma perceção pode conservar a sua forma sem ser transformada imediatamente numa conclusão.",
      ),
    ).toBeInTheDocument();
  });

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
});
