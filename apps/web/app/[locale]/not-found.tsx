import Link from "next/link";

export default function LocaleNotFound() {
  return (
    <main className="mx-auto grid min-h-[70svh] max-w-2xl place-items-center px-4 py-16 text-center">
      <div>
        <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-foreground)]">
          404
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em]">
          Esta página não está disponível.
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
          O endereço pode estar desatualizado ou a experiência pode continuar em
          revisão.
        </p>
        <Link
          href="/"
          className="surface-primary mt-7 inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold"
        >
          Página inicial
        </Link>
      </div>
    </main>
  );
}
