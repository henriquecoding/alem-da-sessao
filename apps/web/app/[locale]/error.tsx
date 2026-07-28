"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Conteúdo e dados de saúde nunca entram no erro. O digest é a referência
    // opaca produzida pelo framework.
    console.error("route-error", error.digest ?? "without-digest");
  }, [error.digest]);

  return (
    <main className="mx-auto grid min-h-[60svh] max-w-2xl place-items-center px-4 py-16 text-center">
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[var(--destructive-soft)] text-[var(--destructive)]">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-3xl font-bold">
          Não foi possível abrir esta área.
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
          As alterações desta página não foram enviadas. Tente novamente sem
          recarregar toda a aplicação.
        </p>
        <Button className="mt-7" onClick={reset}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Tentar novamente
        </Button>
      </div>
    </main>
  );
}
