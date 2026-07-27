import type { CSSProperties, ReactNode } from "react";

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-col gap-5 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="enter text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent-foreground)]">
            {eyebrow}
          </p>
        )}
        <h1
          className="enter mt-1.5 text-[clamp(1.9rem,1.3rem+2vw,2.5rem)] font-bold leading-[1.04] tracking-[-0.05em]"
          style={{ "--d": 1 } as CSSProperties}
        >
          {title}
        </h1>
        {description && (
          <p
            className="enter mt-2.5 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-[0.95rem] sm:leading-7"
            style={{ "--d": 2 } as CSSProperties}
          >
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="enter shrink-0" style={{ "--d": 3 } as CSSProperties}>
          {action}
        </div>
      )}
    </header>
  );
}
