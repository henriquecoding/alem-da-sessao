import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.ComponentProps<"span"> & {
  tone?: "neutral" | "success" | "warning" | "accent" | "info";
};

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "bg-[var(--muted)] text-[var(--muted-foreground)]",
  success: "bg-[var(--success-soft)] text-[var(--success)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  accent: "bg-[var(--accent-soft)] text-[var(--accent-foreground)]",
  info: "bg-[var(--info-soft)] text-[var(--info)]",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
