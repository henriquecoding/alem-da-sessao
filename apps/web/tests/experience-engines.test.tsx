import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { LoadStructuresExperience } from "@/components/load-structures-experience";
import { SessionInventoryExperience } from "@/components/session-inventory-experience";
import { Switch } from "@/components/ui/switch";

describe("experience engines", () => {
  it("turns a concrete responsibility into a reversible structural map", () => {
    render(<LoadStructuresExperience locale="pt-PT" />);

    // Tempo 1 — a Chegada acontece antes de qualquer campo (§7.2).
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

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

    // Tempo 1 — a Chegada acontece antes de qualquer campo (§7.2).
    fireEvent.click(screen.getByRole("button", { name: /Começar/ }));

    expect(
      screen.getByText("O que ficou com você depois da sessão?"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Ficou uma pergunta/ }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(
      screen.getByText("Como cada fragmento está agora?"),
    ).toBeInTheDocument();
  });

  it("opens with the arrival tempo before any field exists (§7.2)", () => {
    render(<SessionInventoryExperience locale="pt-PT" />);

    // O que é isto, quanto tempo leva, o que acontece com o que eu escrever.
    expect(screen.getByText(/Cerca de 6 minutos/)).toBeInTheDocument();
    expect(
      screen.getByText(/O rascunho não sai deste navegador/),
    ).toBeInTheDocument();

    // §4.9 — a declaração de não-monitorização, na Chegada e não no rodapé.
    expect(
      screen.getByText(/Ninguém está a ver o que escreve aqui/),
    ).toBeInTheDocument();

    // §4.9 — recursos de crise presentes, fechados, nunca em modal.
    expect(
      screen.getByText(/Se precisar de falar com alguém agora/),
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Nenhum campo antes de a pessoa escolher começar.
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("ends the work in formation and offers three equivalent destinations", () => {
    render(<SessionInventoryExperience locale="pt-PT" />);
    fireEvent.click(screen.getByRole("button", { name: /Começar/ }));

    fireEvent.click(
      screen.getByRole("button", { name: /Algo ficou mais claro/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(screen.getAllByRole("button", { name: /Assentou/ })[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(
      screen.getAllByRole("button", { name: /Revisitar na sessão/ })[0]!,
    );
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    // O trabalho acaba na Formação, nunca directamente na partilha.
    fireEvent.click(screen.getByRole("button", { name: /Ver o que ficou/ }));

    // Tempo 3 — o artefacto determinístico está no ecrã e é exportável (§4.1).
    const artifact = screen.getByRole("img", {
      name: /Constelação do inventário/,
    });
    expect(artifact).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Descarregar este objeto/ }),
    ).toHaveAttribute("download", expect.stringContaining(".svg"));

    // Tempo 5 — três caminhos, e a equivalência é estrutural: mesma classe.
    const paths = [
      screen.getByRole("button", { name: /Levar comigo/ }),
      screen.getByRole("button", { name: /Guardar numa conta/ }),
      screen.getByRole("button", { name: /Descartar/ }),
    ];
    const shapes = paths.map((path) =>
      path.className.replace(/--d:\s*\d+/, "").trim(),
    );
    expect(new Set(shapes).size).toBe(1);
  });

  it("discards without a trace, in the same gesture (§4.10)", () => {
    render(<SessionInventoryExperience locale="pt-PT" />);
    fireEvent.click(screen.getByRole("button", { name: /Começar/ }));
    fireEvent.click(
      screen.getByRole("button", { name: /Algo ficou mais claro/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(screen.getAllByRole("button", { name: /Assentou/ })[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(
      screen.getAllByRole("button", { name: /Deixar assentar/ })[0]!,
    );
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(screen.getByRole("button", { name: /Ver o que ficou/ }));

    const discard = screen.getByRole("button", { name: /Descartar/ });
    // A consequência é declarada em vez de "tem a certeza?" (§7.5).
    expect(
      screen.getByText(/desaparece sem deixar rasto. Não há como recuperar/),
    ).toBeInTheDocument();

    fireEvent.click(discard);
    fireEvent.click(
      screen.getByRole("button", { name: /Confirmar que desaparece/ }),
    );

    expect(screen.getByText("Não ficou nada.")).toBeInTheDocument();
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
