"use client";

import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import type { Locale } from "@alem-da-sessao/i18n";
import { cn } from "@/lib/utils";

/**
 * Tempo 3 do ritual — a Formação (relatório v2 §7.2 e §4.1).
 *
 * O único momento do produto que pode ser lento de propósito. O artefacto toma
 * forma à frente da pessoa em vez de aparecer pronto, porque é a formação que
 * comunica *"isto foi construído a partir do que você escreveu"*.
 *
 * Sob `prefers-reduced-motion` a formação **continua a acontecer** — por
 * opacidade em vez de deslocamento (§6.5: projete os dois, não degrade um). O
 * `globals.css` trata da troca; aqui o tempo é o mesmo nos dois casos.
 *
 * O SVG é gerado por uma função pura e determinística e todo o texto da pessoa
 * é escapado na origem (`escapeXml`), pelo que `dangerouslySetInnerHTML` aqui
 * recebe markup que este código produziu inteiro — não conteúdo remoto.
 */
export function ArtifactView({
  svg,
  locale,
  fileName,
  className,
  exportable = true,
}: {
  svg: string;
  locale: Locale;
  fileName: string;
  className?: string;
  exportable?: boolean;
}) {
  const [formed, setFormed] = useState(false);

  useEffect(() => {
    // Deixa a formação correr antes de anunciar o resultado a quem usa leitor
    // de ecrã, para não interromper a leitura da etapa anterior.
    const timer = window.setTimeout(() => setFormed(true), 700);
    return () => window.clearTimeout(timer);
  }, []);

  // Um data URI evita `URL.createObjectURL`, que exigiria limpeza manual e
  // deixaria o blob vivo em memória mais tempo do que o necessário.
  const href = useMemo(
    () => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    [svg],
  );

  return (
    <figure className={cn("flex flex-col items-center gap-5", className)}>
      <div
        className="animate-forming shadow-rested w-full max-w-[620px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)]"
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      <p aria-live="polite" className="sr-only">
        {formed
          ? locale === "pt-PT"
            ? "O artefacto está formado."
            : "O artefato está formado."
          : ""}
      </p>

      {exportable && (
        <figcaption className="flex flex-col items-center gap-2">
          <a
            href={href}
            download={`${fileName}.svg`}
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-semibold",
              "ease-(--ease-out-quint) transition-[border-color,box-shadow,transform] duration-200",
              "hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-sm)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
            )}
          >
            <Download className="size-4" aria-hidden="true" />
            {locale === "pt-PT"
              ? "Descarregar este objeto"
              : "Baixar este objeto"}
          </a>
          <span className="text-xs text-[var(--muted-foreground)]">
            {locale === "pt-PT"
              ? "SVG · fica no seu dispositivo"
              : "SVG · fica no seu dispositivo"}
          </span>
        </figcaption>
      )}
    </figure>
  );
}
