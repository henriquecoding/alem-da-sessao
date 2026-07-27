import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-base outline-none",
        "ease-(--ease-out-quint) transition-[border-color,box-shadow,background-color] duration-200",
        "placeholder:text-[var(--muted-foreground)]/70 hover:border-[var(--border-strong)]",
        "focus:ring-3 focus:border-[var(--ring)] focus:ring-[color-mix(in_srgb,var(--ring)_16%,transparent)]",
        "disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm",
        className,
      )}
      {...props}
    />
  );
}
