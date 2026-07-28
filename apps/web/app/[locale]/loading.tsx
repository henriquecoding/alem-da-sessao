export default function LocaleLoading() {
  return (
    <main
      className="mx-auto w-full max-w-[1240px] px-4 py-12 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Carregamento em curso…</span>
      <div className="h-5 w-32 animate-pulse rounded-full bg-[var(--muted)]" />
      <div className="mt-5 h-12 max-w-xl animate-pulse rounded-2xl bg-[var(--muted)]" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-40 animate-pulse rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]"
          />
        ))}
      </div>
    </main>
  );
}
