import * as React from "react";
import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-8 w-14 shrink-0 items-center overflow-hidden rounded-full border p-1 outline-none",
        "ease-(--ease-out-quint) transition-[background-color,border-color,box-shadow] duration-300",
        "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
        checked
          ? "border-[var(--primary)] bg-[var(--primary)] shadow-[inset_0_0_0_1px_rgba(255,255,255,.12)]"
          : "border-[var(--border)] bg-[var(--background-deep)] hover:border-[var(--border-strong)]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          // The knob overshoots very slightly on its way across, which is what
          // reads as a physical toggle rather than a repositioned circle.
          "ease-(--ease-spring) pointer-events-none absolute left-1 top-1 size-6 rounded-full border border-black/5 bg-white shadow-[0_2px_8px_rgba(40,36,49,.2)] transition-transform duration-300",
          checked ? "translate-x-6" : "translate-x-0",
        )}
      />
    </button>
  );
}
