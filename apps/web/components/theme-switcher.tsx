"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Monitor, MoonStar, Sun } from "lucide-react";
import type { Locale } from "@alem-da-sessao/i18n";
import { OptionMenu, type OptionMenuItem } from "@/components/ui/option-menu";
import {
  readThemeChoice,
  writeThemeChoice,
  type ThemeChoice,
} from "@/lib/preferences";

/**
 * O alternador de tema.
 *
 * Três opções e não duas. Um interruptor de dois estados obriga quem tem o
 * sistema em escuro a repetir a escolha em cada site, e nunca deixa voltar
 * atrás — «seguir o sistema» deixa de existir assim que se toca no botão uma
 * vez. Aqui é uma das três, e é a que está por omissão.
 *
 * A leitura do estado passa por `useSyncExternalStore` porque o tema é
 * genuinamente externo ao React: quem o define primeiro é o script que corre
 * antes da hidratação. Ler o atributo no servidor é impossível, e ler no
 * `useEffect` daria um ícone errado no primeiro frame. O `getServerSnapshot`
 * devolve `system`, que é exatamente o que o HTML estático representa, e o
 * React reconcilia sozinho no cliente sem aviso de hidratação.
 */

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  // Se a escolha for «sistema», o tema efetivo ainda muda quando o sistema
  // muda — e o ícone tem de acompanhar.
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  query.addEventListener("change", onChange);

  return () => {
    observer.disconnect();
    query.removeEventListener("change", onChange);
  };
}

export function ThemeSwitcher({
  locale,
  align = "end",
}: {
  locale: Locale;
  align?: "start" | "end";
}) {
  const choice = useSyncExternalStore<ThemeChoice>(
    subscribe,
    readThemeChoice,
    () => "system",
  );

  const resolved = useSyncExternalStore<"light" | "dark">(
    subscribe,
    () =>
      document.documentElement.getAttribute("data-theme") === "dark" ||
      (!document.documentElement.hasAttribute("data-theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
        ? "dark"
        : "light",
    () => "light",
  );

  const pt = locale === "pt-PT";

  const items: OptionMenuItem<ThemeChoice>[] = [
    {
      value: "system",
      label: pt ? "Como o sistema" : "Como o sistema",
      hint: pt ? "Segue o aparelho" : "Segue o aparelho",
      icon: <Monitor className="size-4 shrink-0" aria-hidden="true" />,
    },
    {
      value: "light",
      label: pt ? "Claro" : "Claro",
      hint: pt ? "Base creme, de dia" : "Base creme, de dia",
      icon: <Sun className="size-4 shrink-0" aria-hidden="true" />,
    },
    {
      value: "dark",
      label: pt ? "Escuro" : "Escuro",
      hint: pt ? "Sem ofuscar, à noite" : "Sem ofuscar, à noite",
      icon: <MoonStar className="size-4 shrink-0" aria-hidden="true" />,
    },
  ];

  const onSelect = useCallback((item: OptionMenuItem<ThemeChoice>) => {
    writeThemeChoice(item.value);
  }, []);

  const Icon =
    choice === "system" ? Monitor : resolved === "dark" ? MoonStar : Sun;
  const current = items.find((item) => item.value === choice)!;

  return (
    <OptionMenu
      label={
        pt
          ? `Aspeto do site — atualmente ${current.label.toLowerCase()}`
          : `Aparência do site — atualmente ${current.label.toLowerCase()}`
      }
      value={choice}
      items={items}
      onSelect={onSelect}
      align={align}
      trigger={
        <>
          <Icon className="size-4" aria-hidden="true" />
          {/* O nome da escolha não cabe na barra, mas cabe no rótulo
              acessível acima — e o ícone sozinho seria ambíguo entre «escuro»
              e «como o sistema, que está escuro». */}
          <span className="sr-only">{current.label}</span>
        </>
      }
    />
  );
}
