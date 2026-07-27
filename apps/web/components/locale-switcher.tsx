"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import type { LocaleSegment } from "@alem-da-sessao/i18n";
import { OptionMenu, type OptionMenuItem } from "@/components/ui/option-menu";
import {
  localePresentation,
  otherSegment,
  swapLocaleSegment,
} from "@/lib/locale";
import { writeLocalePreference } from "@/lib/preferences";
import { cn } from "@/lib/utils";

/**
 * O seletor de língua.
 *
 * Era um botão de dois estados que dizia «PT» e levava para «BR». Três coisas
 * estavam erradas nisso, e nenhuma era decorativa:
 *
 * 1. **Não dizia o que ia mudar.** As duas variantes partilham a língua; o
 *    que difere é a ortografia, o tratamento e parte do vocabulário. O menu
 *    mostra agora uma frase real em cada variante — `Pode parar a meio.`
 *    contra `Você pode parar no meio.` — que é a diferença que se sente.
 * 2. **Perdia o contexto.** A troca era um `replace` sobre `pathname`, sem
 *    query nem fragmento: mudar de língua num diretório filtrado devolvia o
 *    diretório sem filtros. A troca vive agora em `swapLocaleSegment`, com
 *    teste.
 * 3. **Não deixava rasto.** Quem escolhia uma variante voltava a cair na
 *    outra ao entrar por `/`. A escolha passa a ser lembrada num cookie de
 *    preferência (ver `lib/preferences.ts` para o que isso pode e não pode
 *    ser).
 *
 * As opções são âncoras verdadeiras, não `router.push`: são links que se
 * podem abrir noutro separador e que existem no HTML.
 */
export function LocaleSwitcher({
  segment,
  compact = false,
  align = "end",
}: {
  segment: LocaleSegment;
  compact?: boolean;
  align?: "start" | "end";
}) {
  const pathname = usePathname();

  // `useSearchParams` obrigaria cada página a ter uma fronteira de Suspense e
  // tiraria o site da geração estática — um preço alto para uma query string.
  // O painel só existe depois de alguém o abrir, ou seja, sempre no cliente:
  // ler a localização aqui é seguro e não produz divergência de hidratação,
  // porque nada disto chega ao HTML servido.
  const search = typeof window === "undefined" ? "" : window.location.search;

  const items: OptionMenuItem<LocaleSegment>[] = (
    ["pt-pt", "pt-br"] as const
  ).map((value) => ({
    value,
    label: `${localePresentation[value].name} (${localePresentation[value].region})`,
    hint: localePresentation[value].sample,
    href: swapLocaleSegment(pathname, value, search),
  }));

  const onSelect = useCallback((item: OptionMenuItem<LocaleSegment>) => {
    writeLocalePreference(item.value);
  }, []);

  const current = localePresentation[segment];

  return (
    <>
      <OptionMenu
        label={`Língua do site — atualmente ${current.name} de ${current.region}`}
        value={segment}
        items={items}
        onSelect={onSelect}
        align={align}
        width="min-w-[17rem]"
        footer="Muda a ortografia e o tratamento. O que escreveu não é alterado."
        trigger={
          <>
            <Globe className="size-4" aria-hidden="true" />
            <span className={cn(compact && "sr-only")}>
              {current.flagLabel}
            </span>
            <span className="sr-only">
              {current.name} de {current.region}
            </span>
          </>
        }
        renderItem={(item, active) => (
          <>
            {/* A abreviatura faz de marca visual sem ser bandeira: uma bandeira
                representa um país, e a variante não é o país de quem lê. */}
            <span
              aria-hidden="true"
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-[var(--radius-sm)] font-mono text-[11px] font-semibold tracking-[0.06em]",
                active
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)]",
              )}
            >
              {localePresentation[item.value].flagLabel}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">
                {localePresentation[item.value].name}{" "}
                <span className="font-normal text-[var(--muted-foreground)]">
                  · {localePresentation[item.value].region}
                </span>
              </span>
              <span
                lang={item.value === "pt-pt" ? "pt-PT" : "pt-BR"}
                className="mt-0.5 block font-serif text-sm italic leading-5 text-[var(--muted-foreground)]"
              >
                {item.hint}
              </span>
            </span>
          </>
        )}
      />

      {/* Sem JavaScript o menu não abre, e mudar de língua deixaria de ser
          possível. Um link simples resolve-o, e custa uma linha. */}
      <noscript>
        <a
          href={swapLocaleSegment(pathname, otherSegment(segment))}
          className="inline-flex min-h-11 items-center rounded-full border border-[var(--border)] px-3 text-xs font-semibold text-[var(--muted-foreground)]"
        >
          {localePresentation[otherSegment(segment)].flagLabel}
        </a>
      </noscript>
    </>
  );
}
