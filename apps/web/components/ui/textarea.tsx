import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full resize-y rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-base leading-7 outline-none",
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
