import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { LoadStructuresExperience } from "@/components/load-structures-experience";
import { SessionInventoryExperience } from "@/components/session-inventory-experience";
import { Switch } from "@/components/ui/switch";

describe("experience engines", () => {
  it("turns a concrete responsibility into a reversible structural map", () => {
    render(<LoadStructuresExperience locale="pt-PT" />);

    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(
      screen.getByText("Assente pelo menos uma carga antes de continuar."),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /Cuidar de alguém que depende de mim/,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(
      screen.getByRole("heading", {
        name: "Meça a compressão, não o seu valor.",
      }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "No tempo" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(
      screen.getByRole("heading", {
        name: "Como cada carga chegou às suas mãos?",
      }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Assumida/ }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(
      screen.getByRole("heading", {
        name: "Onde pode entrar uma nova ancoragem?",
      }),
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

  it("keeps binary settings accessible and visually independent from labels", () => {
    function SwitchHarness() {
      const [checked, setChecked] = useState(false);
      return (
        <div className="flex">
          <Switch
            label="Sessões online"
            checked={checked}
            onChange={setChecked}
          />
          <span>Sessões online</span>
        </div>
      );
    }

    render(<SwitchHarness />);
    const control = screen.getByRole("switch", { name: "Sessões online" });
    expect(control).toHaveAttribute("aria-checked", "false");
    expect(control).toHaveClass("shrink-0");
    fireEvent.click(control);
    expect(control).toHaveAttribute("aria-checked", "true");
  });
});
