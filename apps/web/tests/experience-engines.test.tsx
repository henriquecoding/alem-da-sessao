import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoadStructuresExperience } from "@/components/load-structures-experience";
import { SessionInventoryExperience } from "@/components/session-inventory-experience";

describe("experience engines", () => {
  it("turns a selected load into a multi-stage interactive map", () => {
    render(<LoadStructuresExperience locale="pt-PT" />);

    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(
      screen.getByText("Escolha pelo menos uma carga para continuar."),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Cuidar de alguém/ }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(
      screen.getByText("Quanto espaço cada carga ocupa hoje?"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "No tempo" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(
      screen.getByText("Como cada carga chegou às suas mãos?"),
    ).toBeInTheDocument();
  });

  it("localizes the session inventory interaction for pt-BR", () => {
    render(<SessionInventoryExperience locale="pt-BR" />);

    expect(
      screen.getByText("O que ficou com você depois da sessão?"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Ficou uma pergunta/ }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(
      screen.getByText("Como cada fragmento está agora?"),
    ).toBeInTheDocument();
  });
});
