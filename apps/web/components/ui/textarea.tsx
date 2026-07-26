import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-base leading-7 outline-none transition-shadow placeholder:text-[var(--muted-foreground)]/70 focus:border-[var(--ring)] focus:ring-3 focus:ring-[color-mix(in_srgb,var(--ring)_16%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm",
        className,
      )}
      {...props}
    />
  );
}
