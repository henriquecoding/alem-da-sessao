"use client";

import { useEffect, useState } from "react";

/**
 * Troca de tema no laboratório, do mesmo modo que o produto o faz: um atributo
 * `data-theme` no `<html>`.
 *
 * Não é redundante com as pré-visualizações lado a lado. Aquelas trocam
 * `color-scheme` num subárvore, o que chega para o palco e para o papel — os
 * únicos tokens declarados lá dentro — mas não para `--background` e
 * `--foreground`, que são declarados em `:root` e resolvem lá. Sem este
 * seletor, os recortes desktop e mobile só se poderiam avaliar num tema, que é
 * exatamente o erro que o relatório aponta na direção anterior.
 *
 * O tema inicial chega por prop e não é lido do URL aqui dentro: `?theme=dark`
 * é resolvido no servidor, na página. Ler o URL num efeito obrigaria a um
 * `setState` depois da primeira pintura — um render em cascata e um risco de
 * divergência de hidratação, em troca de nada.
 */
export function LabThemeToggle({
  initialTheme,
}: {
  initialTheme: "light" | "dark";
}) {
  const [theme, setTheme] = useState<"light" | "dark">(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="flex items-center gap-2">
      {(["light", "dark"] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={theme === option}
          onClick={() => setTheme(option)}
          className="min-h-11 rounded-full border border-[var(--border-strong)] px-4 text-xs font-semibold aria-pressed:border-[var(--primary)] aria-pressed:bg-[var(--accent-soft)]"
        >
          {option === "light" ? "Tema claro" : "Tema escuro"}
        </button>
      ))}
    </div>
  );
}
